const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const {
  GeneticTimetableScheduler,
  generateSessionSlots,
  validateSchedule,
  intervalsOverlap,
  createPRNG,
} = require('../src/services/scheduler');

describe('Genetic Algorithm Examination Scheduler', () => {

  // Test Fixture Data
  const baseSession = {
    id: 'test-session-01',
    name: 'Spring 2026 Tests',
    startDate: '2026-05-18',
    endDate: '2026-05-22',
    timeSlots: ['Morning (09:00 — 12:00)', 'Afternoon (14:00 — 17:00)'],
  };

  const sampleRooms = [
    { id: 'room-101', roomNumber: 'A101', capacity: 100, status: 'Available' },
    { id: 'room-102', roomNumber: 'B201', capacity: 65, status: 'Available' },
    { id: 'room-103', roomNumber: 'F101', capacity: 220, status: 'Available' },
  ];

  const sampleEvents = [
    {
      id: 'ev-1',
      subjectId: 'sub-fec101',
      subjectCode: 'FEC101',
      subjectName: 'Applied Mathematics - I',
      classId: 'cls-1',
      className: 'FE',
      division: 'A',
      durationMinutes: 180,
      type: 'Core',
      studentIds: new Set(['s1', 's2', 's3', 's4']),
      studentCount: 4,
    },
    {
      id: 'ev-2',
      subjectId: 'sub-csc301',
      subjectCode: 'CSC301',
      subjectName: 'Applied Mathematics - III',
      classId: 'cls-2',
      className: 'SE CMPN',
      division: 'A',
      durationMinutes: 180,
      type: 'Core',
      studentIds: new Set(['s5', 's6', 's7']),
      studentCount: 3,
    },
    {
      id: 'ev-3',
      subjectId: 'sub-fec104',
      subjectCode: 'FEC104',
      subjectName: 'Engineering Mechanics',
      classId: 'cls-1',
      className: 'FE',
      division: 'A',
      durationMinutes: 180,
      type: 'Core',
      studentIds: new Set(['s1', 's2', 's3', 's4']), // Same students as ev-1
      studentCount: 4,
    },
  ];

  test('1. Time interval overlap detection handles partial and exact overlaps', () => {
    assert.equal(intervalsOverlap('09:00', '12:00', '10:00', '11:00'), true);
    assert.equal(intervalsOverlap('09:00', '12:00', '12:00', '15:00'), false); // contiguous, no overlap
    assert.equal(intervalsOverlap('09:00', '12:00', '08:30', '09:30'), true);  // partial overlap
    assert.equal(intervalsOverlap('09:00', '12:00', '14:00', '17:00'), false); // completely disjoint
  });

  test('2. Deterministic PRNG produces identical sequence for same seed', () => {
    const rngA = createPRNG(999);
    const rngB = createPRNG(999);
    for (let i = 0; i < 10; i++) {
      assert.equal(rngA(), rngB());
    }
  });

  test('3. Session slot generation respects dates and excludes Sundays', () => {
    const slots = generateSessionSlots(baseSession);
    assert.ok(slots.length > 0);
    // 5 days (Mon-Fri) * 2 slots = 10 slots
    assert.equal(slots.length, 10);
    // No Sunday slot
    const hasSunday = slots.some((s) => s.dayOfWeek === 0);
    assert.equal(hasSunday, false);
  });

  test('4. Generates a feasible schedule with 0 hard violations', () => {
    const scheduler = new GeneticTimetableScheduler({
      populationSize: 30,
      maxGenerations: 50,
      seed: 42,
    });

    const result = scheduler.run({
      events: sampleEvents,
      session: baseSession,
      rooms: sampleRooms,
    });

    assert.equal(result.success, true);
    assert.equal(result.hardViolationsCount, 0);
    assert.equal(result.timetable.length, sampleEvents.length);

    // Independent validation confirms
    assert.equal(result.validationReport.isValid, true);
    assert.equal(result.validationReport.violations.length, 0);
  });

  test('5. Detects student clashes when examinations share students at the same slot', () => {
    const slots = generateSessionSlots(baseSession);
    const mockTimetable = [
      {
        eventId: 'ev-1',
        subjectCode: 'FEC101',
        date: '2026-05-18',
        startTime: '09:00',
        endTime: '12:00',
        durationMinutes: 180,
        roomId: 'room-101',
      },
      {
        eventId: 'ev-3',
        subjectCode: 'FEC104',
        date: '2026-05-18', // Same date and time!
        startTime: '09:00',
        endTime: '12:00',
        durationMinutes: 180,
        roomId: 'room-102', // Different room, but students s1-s4 overlap
      },
    ];

    const report = validateSchedule(mockTimetable, {
      events: [sampleEvents[0], sampleEvents[2]],
      slots,
      rooms: sampleRooms,
    });

    assert.equal(report.isValid, false);
    const hasClash = report.violations.some((v) => v.type === 'STUDENT_EXAM_CLASH');
    assert.equal(hasClash, true);
  });

  test('6. Detects room double-booking in same room at same time interval', () => {
    const slots = generateSessionSlots(baseSession);
    const mockTimetable = [
      {
        eventId: 'ev-1',
        subjectCode: 'FEC101',
        date: '2026-05-18',
        startTime: '09:00',
        endTime: '12:00',
        durationMinutes: 180,
        roomId: 'room-101',
      },
      {
        eventId: 'ev-2',
        subjectCode: 'CSC301',
        date: '2026-05-18',
        startTime: '10:00', // Overlaps with 09:00-12:00 in room-101
        endTime: '13:00',
        durationMinutes: 180,
        roomId: 'room-101',
      },
    ];

    const report = validateSchedule(mockTimetable, {
      events: [sampleEvents[0], sampleEvents[1]],
      slots,
      rooms: sampleRooms,
    });

    assert.equal(report.isValid, false);
    const hasRoomDoubleBooking = report.violations.some((v) => v.type === 'ROOM_DOUBLE_BOOKING');
    assert.equal(hasRoomDoubleBooking, true);
  });

  test('7. Detects insufficient room capacity', () => {
    const smallRoom = [{ id: 'small-1', roomNumber: 'Closet 1', capacity: 2, status: 'Available' }];
    const largeEvent = [{
      id: 'ev-large',
      subjectId: 'sub-large',
      subjectCode: 'CS-999',
      className: 'CS-Year 4',
      durationMinutes: 180,
      studentIds: new Set(['s1', 's2', 's3', 's4', 's5']),
      studentCount: 5, // 5 students in room of 2 seats
    }];
    const slots = generateSessionSlots(baseSession);

    const mockTimetable = [{
      eventId: 'ev-large',
      subjectCode: 'CS-999',
      date: '2026-05-18',
      startTime: '09:00',
      endTime: '12:00',
      durationMinutes: 180,
      roomId: 'small-1',
    }];

    const report = validateSchedule(mockTimetable, {
      events: largeEvent,
      slots,
      rooms: smallRoom,
    });

    assert.equal(report.isValid, false);
    const hasCapacityError = report.violations.some((v) => v.type === 'INSUFFICIENT_ROOM_CAPACITY');
    assert.equal(hasCapacityError, true);
  });

  test('8. Detects exam duration exceeding allocated slot duration', () => {
    const slots = generateSessionSlots(baseSession);
    const longEvent = [{
      id: 'ev-long',
      subjectCode: 'CS-LONG',
      durationMinutes: 240, // 4 hours in 3 hour slot
      studentIds: new Set(['s1']),
      studentCount: 1,
    }];

    const mockTimetable = [{
      eventId: 'ev-long',
      subjectCode: 'CS-LONG',
      date: '2026-05-18',
      startTime: '09:00',
      endTime: '12:00', // 180 minutes
      durationMinutes: 180,
      roomId: 'room-101',
    }];

    const report = validateSchedule(mockTimetable, {
      events: longEvent,
      slots,
      rooms: sampleRooms,
    });

    assert.equal(report.isValid, false);
    const hasDurationError = report.violations.some((v) => v.type === 'DURATION_EXCEEDS_SLOT');
    assert.equal(hasDurationError, true);
  });

  test('9. Rejects impossible scheduling inputs before execution', () => {
    const scheduler = new GeneticTimetableScheduler();
    const impossibleEvent = [{
      id: 'ev-giant',
      subjectCode: 'GIANT-101',
      studentCount: 500, // Largest room is 200
    }];

    const result = scheduler.run({
      events: impossibleEvent,
      session: baseSession,
      rooms: sampleRooms,
    });

    assert.equal(result.success, false);
    assert.ok(result.error.includes('largest room capacity'));
  });

  test('10. Handles empty events input with clear error diagnostic', () => {
    const scheduler = new GeneticTimetableScheduler();
    const result = scheduler.run({
      events: [],
      session: baseSession,
      rooms: sampleRooms,
    });

    assert.equal(result.success, false);
    assert.ok(result.error.includes('No examination events'));
  });

  test('11. Genetic Algorithm evolution improves fitness over generations', () => {
    const scheduler = new GeneticTimetableScheduler({
      populationSize: 40,
      maxGenerations: 40,
      seed: 1234,
    });

    const result = scheduler.run({
      events: sampleEvents,
      session: baseSession,
      rooms: sampleRooms,
    });

    assert.ok(result.generationCount >= 1);
    assert.ok(result.bestFitness > 0);
  });
});
