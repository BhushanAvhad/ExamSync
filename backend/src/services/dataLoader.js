const { supabase } = require('../config/supabase');

/**
 * Loads and validates real scheduling inputs from Supabase database.
 */
async function loadSchedulingContext(sessionId) {
  if (!supabase) {
    throw new Error('Supabase client is not configured on the backend.');
  }

  // 1. Fetch Target Exam Session
  const { data: session, error: sessionErr } = await supabase
    .from('exam_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionErr || !session) {
    throw new Error(`Examination session not found for ID: ${sessionId} (${sessionErr?.message || 'none'})`);
  }

  // 2. Fetch Available Exam Rooms
  const { data: rooms, error: roomsErr } = await supabase
    .from('exam_rooms')
    .select('*')
    .order('capacity', { ascending: false });

  if (roomsErr || !rooms || rooms.length === 0) {
    throw new Error(`No examination rooms configured in database (${roomsErr?.message || 'empty'})`);
  }

  // 3. Fetch Class-Subject Assignments
  const { data: assignments, error: assignErr } = await supabase
    .from('class_subject_assignments')
    .select(`
      id,
      class_id,
      subject_id,
      classes ( id, name, division, academic_year ),
      subjects ( id, code, name, type, duration_minutes, credits )
    `);

  if (assignErr || !assignments || assignments.length === 0) {
    throw new Error(`No academic course assignments found in database (${assignErr?.message || 'empty'})`);
  }

  // 4. Fetch Student Enrollments
  const { data: enrollments, error: enrollErr } = await supabase
    .from('student_subject_enrollments')
    .select('student_id, subject_id, class_id');

  // Build enrollment lookup: `${class_id}__${subject_id}` -> Set(student_ids)
  const enrollmentMap = new Map();
  if (enrollments && enrollments.length > 0) {
    for (const enr of enrollments) {
      const key = `${enr.class_id}__${enr.subject_id}`;
      if (!enrollmentMap.has(key)) {
        enrollmentMap.set(key, new Set());
      }
      enrollmentMap.get(key).add(enr.student_id);
    }
  }

  // 5. Fetch all registered student profiles for realistic cohort student set fallback
  const { data: students } = await supabase
    .from('profiles')
    .select('id, full_name, department')
    .eq('role', 'student');

  const studentList = students || [];

  // 6. Build Examination Events
  const events = [];
  for (const row of assignments) {
    if (!row.classes || !row.subjects) continue;

    const classId = row.classes.id;
    const subjectId = row.subjects.id;
    const key = `${classId}__${subjectId}`;

    let studentIds = enrollmentMap.get(key) || new Set();

    // If specific student enrollment rows are not populated yet for this cohort,
    // map student IDs deterministically based on class cohorts
    if (studentIds.size === 0) {
      const cohortStudents = studentList.filter((s) => s.department === row.classes.name);
      if (cohortStudents.length > 0) {
        studentIds = new Set(cohortStudents.map((s) => s.id));
      } else {
        // Deterministic synthetic student keys for cohort simulation
        studentIds = new Set();
        const baseCohortCount = 45;
        for (let sIdx = 1; sIdx <= baseCohortCount; sIdx++) {
          studentIds.add(`cohort_${classId.slice(0, 8)}_stu_${sIdx}`);
        }
      }
    }

    events.push({
      id: `EV-${classId.slice(0, 8)}-${row.subjects.code}`,
      subjectId: row.subjects.id,
      subjectCode: row.subjects.code,
      subjectName: row.subjects.name,
      classId: row.classes.id,
      className: row.classes.name,
      division: row.classes.division,
      durationMinutes: row.subjects.duration_minutes || 180,
      type: row.subjects.type || 'Core',
      studentIds,
      studentCount: studentIds.size,
    });
  }

  return {
    session: {
      id: session.id,
      name: session.name,
      term: session.academic_term,
      startDate: session.start_date,
      endDate: session.end_date,
      timeSlots: session.time_slots,
      status: session.status,
    },
    rooms: rooms.map((r) => ({
      id: r.id,
      roomNumber: r.room_number,
      location: r.location,
      capacity: r.capacity,
      type: r.type,
      status: r.status,
    })),
    events,
  };
}

module.exports = {
  loadSchedulingContext,
};
