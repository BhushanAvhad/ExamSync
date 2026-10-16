/**
 * ExamSync — Production Genetic Algorithm Examination Scheduling Engine
 *
 * Implements a complete, deterministic, constraint-satisfaction Genetic Algorithm (GA)
 * to schedule university examinations across available venues and session date-time slots.
 */

/**
 * Deterministic Pseudo-Random Number Generator (Mulberry32)
 * Ensures reproducible optimization runs when a seed is provided.
 */
function createPRNG(seed = 1337) {
  let s = Math.floor(Math.abs(seed)) || 1337;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Checks whether two time intervals on the same day overlap.
 * Format: "HH:MM"
 */
function intervalsOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

/**
 * Generate discrete examination time slots within an exam session window.
 */
function generateSessionSlots(session) {
  const slots = [];
  const start = new Date(session.startDate);
  const end = new Date(session.endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    throw new Error(`Invalid session date window: ${session.startDate} to ${session.endDate}`);
  }

  // Configured session time slots or default morning/afternoon split
  const rawSlots = Array.isArray(session.timeSlots) && session.timeSlots.length > 0
    ? session.timeSlots
    : ['Morning (09:00 — 12:00)', 'Afternoon (14:00 — 17:00)'];

  const parsedTimeSlots = rawSlots.map((s, idx) => {
    const timeMatch = s.match(/(\d{1,2}:\d{2})\s*[-—–]\s*(\d{1,2}:\d{2})/);
    if (timeMatch) {
      const [_, st, et] = timeMatch;
      const [sh, sm] = st.split(':').map(Number);
      const [eh, em] = et.split(':').map(Number);
      const duration = (eh * 60 + em) - (sh * 60 + sm);
      return {
        label: s,
        startTime: st.padStart(5, '0'),
        endTime: et.padStart(5, '0'),
        durationMinutes: duration > 0 ? duration : 180,
        period: sh < 13 ? 'morning' : 'afternoon',
      };
    }
    // Fallback based on index
    if (idx === 0) {
      return { label: s, startTime: '09:00', endTime: '12:00', durationMinutes: 180, period: 'morning' };
    }
    return { label: s, startTime: '14:00', endTime: '17:00', durationMinutes: 180, period: 'afternoon' };
  });

  const curr = new Date(start);
  while (curr <= end) {
    // Exclude Sundays by default (day 0)
    if (curr.getDay() !== 0) {
      const dateStr = curr.toISOString().split('T')[0];
      for (const slotDef of parsedTimeSlots) {
        slots.push({
          slotId: `${dateStr}_${slotDef.startTime}_${slotDef.endTime}`,
          date: dateStr,
          dayOfWeek: curr.getDay(),
          startTime: slotDef.startTime,
          endTime: slotDef.endTime,
          durationMinutes: slotDef.durationMinutes,
          period: slotDef.period,
        });
      }
    }
    curr.setDate(curr.getDate() + 1);
  }

  return slots;
}

/**
 * Independent Schedule Validator.
 * Evaluates all hard constraints and produces a transparent validation report.
 */
function validateSchedule(timetable, context) {
  const { events, slots, rooms } = context;
  const violations = [];
  const eventMap = new Map(events.map((e) => [e.id, e]));
  const roomMap = new Map(rooms.map((r) => [r.id, r]));

  // Check 1: All events must be scheduled exactly once
  const scheduledEventIds = new Set();
  for (const entry of timetable) {
    if (scheduledEventIds.has(entry.eventId)) {
      violations.push({
        type: 'DUPLICATE_EVENT',
        severity: 'High',
        description: `Examination event ${entry.eventId} (${entry.subjectCode}) was scheduled more than once.`,
        reference: entry.eventId,
      });
    }
    scheduledEventIds.add(entry.eventId);
  }

  for (const ev of events) {
    if (!scheduledEventIds.has(ev.id)) {
      violations.push({
        type: 'UNSCHEDULED_EVENT',
        severity: 'High',
        description: `Examination for ${ev.subjectCode} (${ev.className} - ${ev.division}) was not assigned to any time slot.`,
        reference: ev.id,
      });
    }
  }

  // Check 2: Room Double-Booking and Room Validity
  const roomOccupancy = new Map();
  for (const entry of timetable) {
    const room = roomMap.get(entry.roomId);
    if (!room) {
      violations.push({
        type: 'INVALID_ROOM',
        severity: 'High',
        description: `Assigned venue ID ${entry.roomId} does not exist in active institutional catalog.`,
        reference: entry.eventId,
      });
      continue;
    }

    if (room.status !== 'Available') {
      violations.push({
        type: 'UNAVAILABLE_ROOM',
        severity: 'High',
        description: `Room ${room.roomNumber} is currently under '${room.status}' status and cannot host examinations.`,
        reference: room.id,
      });
    }

    const key = `${entry.date}__${room.id}`;
    if (!roomOccupancy.has(key)) {
      roomOccupancy.set(key, []);
    }

    const existingSlots = roomOccupancy.get(key);
    for (const ex of existingSlots) {
      if (intervalsOverlap(entry.startTime, entry.endTime, ex.startTime, ex.endTime)) {
        violations.push({
          type: 'ROOM_DOUBLE_BOOKING',
          severity: 'High',
          description: `Venue collision: Room ${room.roomNumber} is double-booked on ${entry.date} for ${entry.subjectCode} and ${ex.subjectCode} (${entry.startTime}-${entry.endTime}).`,
          reference: room.id,
        });
      }
    }
    existingSlots.push(entry);

    // Check 3: Room Capacity
    const ev = eventMap.get(entry.eventId);
    if (ev && room.capacity < ev.studentCount) {
      violations.push({
        type: 'INSUFFICIENT_ROOM_CAPACITY',
        severity: 'High',
        description: `Venue ${room.roomNumber} capacity (${room.capacity} seats) is insufficient for ${ev.studentCount} students enrolled in ${ev.subjectCode} (${ev.className}).`,
        reference: room.id,
      });
    }

    // Check 4: Duration Fits Inside Slot
    if (ev && ev.durationMinutes > entry.durationMinutes) {
      violations.push({
        type: 'DURATION_EXCEEDS_SLOT',
        severity: 'High',
        description: `Exam ${ev.subjectCode} requires ${ev.durationMinutes} minutes, but slot provides only ${entry.durationMinutes} minutes.`,
        reference: entry.eventId,
      });
    }
  }

  // Check 5: Student Exam Collisions (Partial and exact overlaps)
  // Maps: Date -> Array of entries with enrolled student sets
  const dateSlots = new Map();
  for (const entry of timetable) {
    const ev = eventMap.get(entry.eventId);
    if (!ev || !ev.studentIds || ev.studentIds.size === 0) continue;

    if (!dateSlots.has(entry.date)) {
      dateSlots.set(entry.date, []);
    }

    const entriesOnDate = dateSlots.get(entry.date);
    for (const other of entriesOnDate) {
      if (intervalsOverlap(entry.startTime, entry.endTime, other.startTime, other.endTime)) {
        // Find intersection of enrolled students
        const clashStudents = [];
        for (const sId of ev.studentIds) {
          if (other.studentIds.has(sId)) {
            clashStudents.push(sId);
          }
        }

        if (clashStudents.length > 0) {
          violations.push({
            type: 'STUDENT_EXAM_CLASH',
            severity: 'High',
            description: `Student conflict: ${clashStudents.length} student(s) enrolled in both ${entry.subjectCode} and ${other.subjectCode} on ${entry.date} (${entry.startTime}–${entry.endTime}).`,
            reference: `${entry.eventId}__${other.eventId}`,
          });
        }
      }
    }

    entriesOnDate.push({
      ...entry,
      studentIds: ev.studentIds,
    });
  }

  // Compute operational metrics
  const uniqueDates = new Set(timetable.map((t) => t.date));
  const uniqueRooms = new Set(timetable.map((t) => t.roomId));
  let totalSeatCap = 0;
  let totalStudents = 0;

  timetable.forEach((t) => {
    const r = roomMap.get(t.roomId);
    const ev = eventMap.get(t.eventId);
    if (r) totalSeatCap += r.capacity;
    if (ev) totalStudents += ev.studentCount;
  });

  const avgUtilization = totalSeatCap > 0 ? (totalStudents / totalSeatCap) * 100 : 0;

  return {
    isValid: violations.length === 0,
    hardViolationsCount: violations.length,
    violations,
    metrics: {
      totalExamsScheduled: timetable.length,
      examinationDaysUsed: uniqueDates.size,
      venuesAssigned: uniqueRooms.size,
      averageRoomUtilizationPercent: Math.round(avgUtilization * 10) / 10,
    },
  };
}

/**
 * The Genetic Algorithm Scheduling Engine.
 */
class GeneticTimetableScheduler {
  constructor(options = {}) {
    this.populationSize = options.populationSize || 60;
    this.maxGenerations = options.maxGenerations || 150;
    this.mutationRate = options.mutationRate || 0.18;
    this.crossoverRate = options.crossoverRate || 0.85;
    this.elitismCount = Math.max(2, Math.floor(this.populationSize * 0.08));
    this.seed = options.seed !== undefined ? options.seed : 42;
    this.rng = createPRNG(this.seed);

    // Weights
    this.hardPenaltyWeight = 10000;
    this.sameDayStudentPenalty = 250;
    this.consecutiveDayPenalty = 80;
    this.morningCoreBonus = 25;
  }

  /**
   * Pre-flight input feasibility check.
   */
  validateInputs(events, slots, rooms) {
    if (!Array.isArray(events) || events.length === 0) {
      return { feasible: false, error: 'No examination events provided for scheduling.' };
    }
    if (!Array.isArray(slots) || slots.length === 0) {
      return { feasible: false, error: 'No valid examination slots available in this session window.' };
    }
    const availableRooms = rooms.filter((r) => r.status === 'Available');
    if (availableRooms.length === 0) {
      return { feasible: false, error: 'No available exam venues found with status "Available".' };
    }

    // Check maximum single room capacity against minimum required
    const maxCapacity = Math.max(...availableRooms.map((r) => r.capacity));
    for (const ev of events) {
      if (ev.studentCount > maxCapacity) {
        return {
          feasible: false,
          error: `Event ${ev.subjectCode} (${ev.className}) requires ${ev.studentCount} seats, but largest room capacity is ${maxCapacity}.`,
        };
      }
    }

    // Theoretical maximum examinations capacity: slots * rooms
    const totalPossibleSlots = slots.length * availableRooms.length;
    if (events.length > totalPossibleSlots) {
      return {
        feasible: false,
        error: `Insufficient capacity: ${events.length} examinations required, but total venue-slot combinations available is only ${totalPossibleSlots}.`,
      };
    }

    return { feasible: true };
  }

  /**
   * Initialize a random chromosome.
   */
  createChromosome(events, slots, rooms) {
    const genes = new Array(events.length);
    const availableRooms = rooms.filter((r) => r.status === 'Available');

    for (let i = 0; i < events.length; i++) {
      const ev = events[i];
      const slotIndex = Math.floor(this.rng() * slots.length);

      // Prioritize picking a room that fits this event's capacity and venue type (Lab vs Theory)
      const isLab = ev.isLab || /Lab|Practical|Viva/i.test(ev.type || '') || /-L\d+/i.test(ev.subjectCode || '');
      const fittingRooms = availableRooms.filter((r) => r.capacity >= ev.studentCount);
      let roomPool = fittingRooms.length > 0 ? fittingRooms : availableRooms;
      if (isLab) {
        const labRooms = roomPool.filter((r) => /Lab/i.test(r.type || '') || /^L/i.test(r.roomNumber || ''));
        if (labRooms.length > 0) roomPool = labRooms;
      } else {
        const lectureRooms = roomPool.filter((r) => !/Lab/i.test(r.type || '') && !/^L/i.test(r.roomNumber || ''));
        if (lectureRooms.length > 0) roomPool = lectureRooms;
      }
      const chosenRoom = roomPool[Math.floor(this.rng() * roomPool.length)];

      const roomIndex = rooms.findIndex((r) => r.id === chosenRoom.id);

      genes[i] = {
        eventIndex: i,
        slotIndex,
        roomIndex: roomIndex >= 0 ? roomIndex : 0,
      };
    }

    return genes;
  }

  /**
   * Fitness evaluation for a chromosome candidate.
   * Hard constraints have massive negative penalties so feasible schedules always dominate.
   */
  evaluateFitness(genes, events, slots, rooms) {
    let hardViolations = 0;
    let softScore = 0;

    // 1. Room Double-Booking
    // Map: slotIndex -> Map(roomIndex -> count)
    const slotRoomOccupancy = new Map();
    for (let i = 0; i < genes.length; i++) {
      const g = genes[i];
      if (!slotRoomOccupancy.has(g.slotIndex)) {
        slotRoomOccupancy.set(g.slotIndex, new Set());
      }
      const roomsAtSlot = slotRoomOccupancy.get(g.slotIndex);
      if (roomsAtSlot.has(g.roomIndex)) {
        hardViolations++;
      } else {
        roomsAtSlot.add(g.roomIndex);
      }
    }

    // 2. Room Capacity & Room Status
    for (let i = 0; i < genes.length; i++) {
      const g = genes[i];
      const ev = events[g.eventIndex];
      const rm = rooms[g.roomIndex];
      const sl = slots[g.slotIndex];

      if (!rm || rm.status !== 'Available') {
        hardViolations++;
      } else if (rm.capacity < ev.studentCount) {
        hardViolations++;
      }

      // Duration check
      if (sl && ev.durationMinutes > sl.durationMinutes) {
        hardViolations++;
      }

      // Soft: Reward good fit (compact utilization without being undersized)
      if (rm && rm.capacity >= ev.studentCount) {
        const wasteRatio = (rm.capacity - ev.studentCount) / rm.capacity;
        softScore += Math.round((1 - wasteRatio) * 10);
      }

      // Soft: Core subjects in morning
      if (ev.type === 'Core' && sl && sl.period === 'morning') {
        softScore += this.morningCoreBonus;
      }
    }

    // 3. Student Overlaps and Spread
    // Map: studentId -> Array of { date, startTime, endTime, dayIndex }
    const studentSchedules = new Map();
    for (let i = 0; i < genes.length; i++) {
      const g = genes[i];
      const ev = events[g.eventIndex];
      const sl = slots[g.slotIndex];
      if (!ev || !sl || !ev.studentIds) continue;

      for (const studentId of ev.studentIds) {
        if (!studentSchedules.has(studentId)) {
          studentSchedules.set(studentId, []);
        }
        studentSchedules.get(studentId).push({
          date: sl.date,
          startTime: sl.startTime,
          endTime: sl.endTime,
        });
      }
    }

    for (const [_, exams] of studentSchedules.entries()) {
      if (exams.length <= 1) continue;

      for (let j = 0; j < exams.length; j++) {
        for (let k = j + 1; k < exams.length; k++) {
          const ex1 = exams[j];
          const ex2 = exams[k];

          if (ex1.date === ex2.date) {
            // Check hard time overlap
            if (intervalsOverlap(ex1.startTime, ex1.endTime, ex2.startTime, ex2.endTime)) {
              hardViolations++;
            } else {
              // Soft penalty for 2 exams on same day
              softScore -= this.sameDayStudentPenalty;
            }
          }
        }
      }
    }

    // Base score so feasible candidates have large positive scores
    // Hard violations deduct heavily so infeasible candidate has negative score
    const totalFitness = 50000 - (hardViolations * this.hardPenaltyWeight) + softScore;

    return {
      fitness: totalFitness,
      hardViolations,
      softScore,
    };
  }

  /**
   * Tournament Selection: Picks best of K random candidates.
   */
  tournamentSelect(populationWithFitness, k = 3) {
    let best = null;
    for (let i = 0; i < k; i++) {
      const randIdx = Math.floor(this.rng() * populationWithFitness.length);
      const cand = populationWithFitness[randIdx];
      if (!best || cand.fitness > best.fitness) {
        best = cand;
      }
    }
    return best.genes;
  }

  /**
   * Uniform Crossover between two parents.
   */
  crossover(parentA, parentB) {
    if (this.rng() > this.crossoverRate) {
      return [parentA.map((g) => ({ ...g })), parentB.map((g) => ({ ...g }))];
    }

    const childA = new Array(parentA.length);
    const childB = new Array(parentA.length);

    for (let i = 0; i < parentA.length; i++) {
      if (this.rng() < 0.5) {
        childA[i] = { ...parentA[i] };
        childB[i] = { ...parentB[i] };
      } else {
        childA[i] = { ...parentB[i] };
        childB[i] = { ...parentA[i] };
      }
    }

    return [childA, childB];
  }

  /**
   * Mutation: Re-samples slot or room for individual genes.
   */
  mutate(genes, events, slots, rooms) {
    const availableRooms = rooms.filter((r) => r.status === 'Available');

    for (let i = 0; i < genes.length; i++) {
      if (this.rng() < this.mutationRate) {
        const ev = events[genes[i].eventIndex];

        // 50% chance mutate slot, 50% chance mutate room
        if (this.rng() < 0.5) {
          genes[i].slotIndex = Math.floor(this.rng() * slots.length);
        } else {
          const isLab = ev.isLab || /Lab|Practical|Viva/i.test(ev.type || '') || /-L\d+/i.test(ev.subjectCode || '');
          const fitting = availableRooms.filter((r) => r.capacity >= ev.studentCount);
          let pool = fitting.length > 0 ? fitting : availableRooms;
          if (isLab) {
            const labRooms = pool.filter((r) => /Lab/i.test(r.type || '') || /^L/i.test(r.roomNumber || ''));
            if (labRooms.length > 0) pool = labRooms;
          } else {
            const lectureRooms = pool.filter((r) => !/Lab/i.test(r.type || '') && !/^L/i.test(r.roomNumber || ''));
            if (lectureRooms.length > 0) pool = lectureRooms;
          }
          const chosen = pool[Math.floor(this.rng() * pool.length)];
          const rIdx = rooms.findIndex((r) => r.id === chosen.id);
          genes[i].roomIndex = rIdx >= 0 ? rIdx : 0;
        }
      }
    }
  }

  /**
   * Convert best chromosome into final timetable format.
   */
  buildTimetable(bestGenes, events, slots, rooms) {
    return bestGenes.map((g) => {
      const ev = events[g.eventIndex];
      const sl = slots[g.slotIndex];
      const rm = rooms[g.roomIndex];

      const yearMatch = (ev.className || '').match(/^(FE|SE|TE|BE)\b/i);
      const year = yearMatch ? yearMatch[1].toUpperCase() : 'General';
      const deptPart = (ev.className || '').replace(/^(FE|SE|TE|BE)\b/i, '').trim();
      const department = deptPart || (year === 'FE' ? 'Applied Sciences' : 'General');

      return {
        eventId: ev.id,
        subjectId: ev.subjectId,
        subjectCode: ev.subjectCode,
        subjectName: ev.subjectName,
        classId: ev.classId,
        className: ev.className,
        year,
        department,
        roomId: rm ? rm.id : 'unknown',
        roomNumber: rm ? rm.roomNumber : 'TBD',
        roomCapacity: rm ? rm.capacity : 0,
        date: sl.date,
        startTime: sl.startTime,
        endTime: sl.endTime,
        durationMinutes: ev.durationMinutes,
        status: 'Scheduled',
      };
    });
  }

  /**
   * Main Genetic Algorithm execution loop.
   */
  run(context) {
    const startTime = Date.now();
    const { events, session, rooms } = context;

    // 1. Generate available time slots from session dates
    let slots = [];
    try {
      slots = generateSessionSlots(session);
    } catch (err) {
      return {
        success: false,
        error: `Session date error: ${err.message}`,
        diagnostics: ['Unable to compute examination calendar window.'],
      };
    }

    // 2. Feasibility verification
    const feasibility = this.validateInputs(events, slots, rooms);
    if (!feasibility.feasible) {
      return {
        success: false,
        error: feasibility.error,
        diagnostics: [
          `Events to schedule: ${events.length}`,
          `Available rooms: ${rooms.filter((r) => r.status === 'Available').length}`,
          `Available slots: ${slots.length}`,
        ],
      };
    }

    // 3. Initialize population
    let population = [];
    for (let i = 0; i < this.populationSize; i++) {
      population.push(this.createChromosome(events, slots, rooms));
    }

    let bestIndividual = null;
    let bestFitnessRecord = -Infinity;
    let bestHardViolations = Infinity;
    let stagnationCounter = 0;

    // 4. Evolution Generations Loop
    let generation = 0;
    while (generation < this.maxGenerations) {
      generation++;

      // Evaluate population
      const popWithFitness = population.map((genes) => {
        const evalResult = this.evaluateFitness(genes, events, slots, rooms);
        return {
          genes,
          fitness: evalResult.fitness,
          hardViolations: evalResult.hardViolations,
          softScore: evalResult.softScore,
        };
      });

      // Sort descending by fitness
      popWithFitness.sort((a, b) => b.fitness - a.fitness);

      const currentGenBest = popWithFitness[0];
      if (currentGenBest.fitness > bestFitnessRecord) {
        bestFitnessRecord = currentGenBest.fitness;
        bestIndividual = currentGenBest.genes.map((g) => ({ ...g }));
        bestHardViolations = currentGenBest.hardViolations;
        stagnationCounter = 0;
      } else {
        stagnationCounter++;
      }

      // Early break if solution has 0 hard violations and convergence reached
      if (bestHardViolations === 0 && (generation >= 50 || stagnationCounter > 30)) {
        break;
      }

      // Create new generation with Elitism
      const nextGen = [];
      for (let e = 0; e < this.elitismCount; e++) {
        nextGen.push(popWithFitness[e].genes.map((g) => ({ ...g })));
      }

      // Reproduction loop
      while (nextGen.length < this.populationSize) {
        const parentA = this.tournamentSelect(popWithFitness, 3);
        const parentB = this.tournamentSelect(popWithFitness, 3);

        const [childA, childB] = this.crossover(parentA, parentB);

        this.mutate(childA, events, slots, rooms);
        this.mutate(childB, events, slots, rooms);

        nextGen.push(childA);
        if (nextGen.length < this.populationSize) {
          nextGen.push(childB);
        }
      }

      population = nextGen;
    }

    const elapsedMs = Date.now() - startTime;

    // 5. Build timetable from best individual
    const finalTimetable = this.buildTimetable(bestIndividual, events, slots, rooms);

    // 6. Run Independent Verification
    const validationReport = validateSchedule(finalTimetable, { events, slots, rooms });

    return {
      success: validationReport.isValid,
      generationCount: generation,
      elapsedMs,
      bestFitness: bestFitnessRecord,
      hardViolationsCount: validationReport.hardViolationsCount,
      timetable: finalTimetable,
      validationReport,
      diagnostics: [
        `Executed ${generation} generations across population size ${this.populationSize}`,
        `Best Fitness: ${bestFitnessRecord.toLocaleString()}`,
        `Hard Violations Remaining: ${validationReport.hardViolationsCount}`,
        `Runtime: ${elapsedMs}ms`,
      ],
    };
  }
}

module.exports = {
  GeneticTimetableScheduler,
  generateSessionSlots,
  validateSchedule,
  intervalsOverlap,
  createPRNG,
};
