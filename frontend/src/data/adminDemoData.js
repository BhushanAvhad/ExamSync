/**
 * ExamSync Admin Panel — Centralized Fictional Demo Data Module
 *
 * NOTE: All data in this file is realistic in structure but purely fictional.
 * No real student personal information or live database records are used.
 * All demo records are identified as UI demonstrations.
 */

export const INITIAL_SUMMARY_STATS = {
  totalStudents: 1420,
  activeSubjects: 48,
  examRooms: 32,
  availableRooms: 26,
  scheduledExams: 64,
  currentSession: 'Spring 2026 Final Examinations',
  timetableStatus: 'Draft v1.4 — Unpublished',
};

export const INITIAL_STUDENTS = [
  { id: 'STU-2026-001', name: 'Eleanor Vance', email: 'eleanor.vance@university.edu', className: 'CS-Year 3', division: 'A', status: 'Active' },
  { id: 'STU-2026-002', name: 'Marcus Sterling', email: 'm.sterling@university.edu', className: 'CS-Year 3', division: 'A', status: 'Active' },
  { id: 'STU-2026-003', name: 'Aaliyah Patel', email: 'aaliyah.p@university.edu', className: 'CS-Year 2', division: 'B', status: 'Active' },
  { id: 'STU-2026-004', name: 'Julian Hayes', email: 'j.hayes@university.edu', className: 'CS-Year 1', division: 'A', status: 'Active' },
  { id: 'STU-2026-005', name: 'Clara Oswald', email: 'clara.o@university.edu', className: 'SE-Year 2', division: 'A', status: 'Active' },
  { id: 'STU-2026-006', name: 'Tariq Al-Mansoor', email: 'tariq.m@university.edu', className: 'DS-Year 3', division: 'A', status: 'Active' },
  { id: 'STU-2026-007', name: 'Siddharth Sharma', email: 's.sharma@university.edu', className: 'EE-Year 2', division: 'A', status: 'Active' },
  { id: 'STU-2026-008', name: 'Beatriz Morales', email: 'b.morales@university.edu', className: 'CS-Year 2', division: 'A', status: 'Active' },
  { id: 'STU-2026-009', name: 'Felix Lindqvist', email: 'f.lindqvist@university.edu', className: 'CS-Year 1', division: 'B', status: 'Inactive' },
  { id: 'STU-2026-010', name: 'Hana Tanaka', email: 'h.tanaka@university.edu', className: 'DS-Year 3', division: 'A', status: 'Active' },
  { id: 'STU-2026-011', name: 'Kofi Mensah', email: 'k.mensah@university.edu', className: 'SE-Year 2', division: 'A', status: 'Active' },
  { id: 'STU-2026-012', name: 'Zoe Deschanel', email: 'zoe.d@university.edu', className: 'EE-Year 2', division: 'A', status: 'Active' },
  { id: 'STU-2026-013', name: 'Lucas Novak', email: 'l.novak@university.edu', className: 'CS-Year 3', division: 'A', status: 'Active' },
  { id: 'STU-2026-014', name: 'Ananya Roy', email: 'a.roy@university.edu', className: 'CS-Year 2', division: 'B', status: 'Active' },
];

export const INITIAL_CLASSES = [
  { id: 'CLS-01', name: 'CS-Year 1', division: 'A', academicYear: '2025–2026', studentCount: 68 },
  { id: 'CLS-02', name: 'CS-Year 1', division: 'B', academicYear: '2025–2026', studentCount: 65 },
  { id: 'CLS-03', name: 'CS-Year 2', division: 'A', academicYear: '2025–2026', studentCount: 72 },
  { id: 'CLS-04', name: 'CS-Year 2', division: 'B', academicYear: '2025–2026', studentCount: 70 },
  { id: 'CLS-05', name: 'CS-Year 3', division: 'A', academicYear: '2025–2026', studentCount: 84 },
  { id: 'CLS-06', name: 'SE-Year 2', division: 'A', academicYear: '2025–2026', studentCount: 58 },
  { id: 'CLS-07', name: 'DS-Year 3', division: 'A', academicYear: '2025–2026', studentCount: 46 },
  { id: 'CLS-08', name: 'EE-Year 2', division: 'A', academicYear: '2025–2026', studentCount: 62 },
];

export const INITIAL_SUBJECTS = [
  { id: 'SUB-01', code: 'CS-101', name: 'Introduction to Computer Systems', applicableClasses: ['CS-Year 1 (A)', 'CS-Year 1 (B)'], duration: '3.0 Hours' },
  { id: 'SUB-02', code: 'CS-201', name: 'Data Structures & Algorithms', applicableClasses: ['CS-Year 2 (A)', 'CS-Year 2 (B)'], duration: '3.0 Hours' },
  { id: 'SUB-03', code: 'CS-301', name: 'Operating Systems & Kernel Design', applicableClasses: ['CS-Year 3 (A)'], duration: '3.0 Hours' },
  { id: 'SUB-04', code: 'CS-401', name: 'Algorithmic Graph Theory', applicableClasses: ['CS-Year 3 (A)', 'DS-Year 3 (A)'], duration: '3.0 Hours' },
  { id: 'SUB-05', code: 'SE-205', name: 'Software Architecture & Design', applicableClasses: ['SE-Year 2 (A)'], duration: '2.5 Hours' },
  { id: 'SUB-06', code: 'DS-310', name: 'Applied Machine Learning', applicableClasses: ['DS-Year 3 (A)'], duration: '3.0 Hours' },
  { id: 'SUB-07', code: 'EE-205', name: 'Signals & Frequency Systems', applicableClasses: ['EE-Year 2 (A)'], duration: '3.0 Hours' },
  { id: 'SUB-08', code: 'MATH-202', name: 'Linear Algebra & Matrix Calculus', applicableClasses: ['CS-Year 1 (A)', 'CS-Year 1 (B)', 'EE-Year 2 (A)'], duration: '2.5 Hours' },
  { id: 'SUB-09', code: 'MATH-302', name: 'Matrix Algebra & Optimization', applicableClasses: ['CS-Year 2 (A)', 'DS-Year 3 (A)'], duration: '3.0 Hours' },
];

export const INITIAL_ASSIGNMENTS = [
  { classId: 'CLS-01', className: 'CS-Year 1 (A)', subjectCodes: ['CS-101', 'MATH-202'], totalExaminees: 68 },
  { classId: 'CLS-02', className: 'CS-Year 1 (B)', subjectCodes: ['CS-101', 'MATH-202'], totalExaminees: 65 },
  { classId: 'CLS-03', className: 'CS-Year 2 (A)', subjectCodes: ['CS-201', 'MATH-302'], totalExaminees: 72 },
  { classId: 'CLS-04', className: 'CS-Year 2 (B)', subjectCodes: ['CS-201'], totalExaminees: 70 },
  { classId: 'CLS-05', className: 'CS-Year 3 (A)', subjectCodes: ['CS-301', 'CS-401'], totalExaminees: 84 },
  { classId: 'CLS-06', className: 'SE-Year 2 (A)', subjectCodes: ['SE-205'], totalExaminees: 58 },
  { classId: 'CLS-07', className: 'DS-Year 3 (A)', subjectCodes: ['DS-310', 'CS-401', 'MATH-302'], totalExaminees: 46 },
  { classId: 'CLS-08', className: 'EE-Year 2 (A)', subjectCodes: ['EE-205', 'MATH-202'], totalExaminees: 62 },
];

export const INITIAL_ROOMS = [
  { id: 'RM-01', roomNumber: 'Hall 101', location: 'Science Complex, Ground Floor', capacity: 120, type: 'Lecture Hall', status: 'Available' },
  { id: 'RM-02', roomNumber: 'Lab 204', location: 'Tech Tower, 2nd Floor', capacity: 45, type: 'Computer Lab', status: 'Available' },
  { id: 'RM-03', roomNumber: 'Turing Auditorium', location: 'Innovation Wing, Level 1', capacity: 200, type: 'Auditorium', status: 'Available' },
  { id: 'RM-04', roomNumber: 'Seminar 105', location: 'West Academic Quad, Block B', capacity: 60, type: 'Standard Classroom', status: 'Maintenance' },
  { id: 'RM-05', roomNumber: 'Lab 108', location: 'Tech Tower, 1st Floor', capacity: 40, type: 'Computer Lab', status: 'Available' },
  { id: 'RM-06', roomNumber: 'Annex 210', location: 'Mathematics Building, 2nd Floor', capacity: 75, type: 'Standard Classroom', status: 'Available' },
  { id: 'RM-07', roomNumber: 'Hall 201', location: 'Engineering Block C', capacity: 90, type: 'Lecture Hall', status: 'Available' },
  { id: 'RM-08', roomNumber: 'Seminar 305', location: 'Innovation Wing, Level 3', capacity: 35, type: 'Seminar Room', status: 'Reserved' },
];

export const INITIAL_EXAM_SESSIONS = [
  {
    id: 'SESS-2026-01',
    name: 'Spring 2026 Mid-Semester',
    term: 'Spring 2026',
    startDate: '2026-04-10',
    endDate: '2026-04-20',
    applicableClasses: ['CS-Year 1', 'CS-Year 2', 'CS-Year 3', 'SE-Year 2'],
    status: 'Scheduled',
    timeSlots: ['Morning (09:00 — 12:00)', 'Afternoon (14:00 — 17:00)'],
    description: 'Mid-term assessment period across all foundational engineering and computing curricula.'
  },
  {
    id: 'SESS-2026-02',
    name: 'Spring 2026 Final Examinations',
    term: 'Spring 2026',
    startDate: '2026-05-15',
    endDate: '2026-05-30',
    applicableClasses: ['All Departments'],
    status: 'Draft',
    timeSlots: ['Slot 1 (09:00 — 12:00)', 'Slot 2 (13:30 — 16:30)', 'Slot 3 (17:30 — 20:30)'],
    description: 'Institutional end-of-term comprehensive examination series.'
  },
  {
    id: 'SESS-2025-03',
    name: 'Winter 2025 Retake Examinations',
    term: 'Winter 2025',
    startDate: '2026-01-12',
    endDate: '2026-01-18',
    applicableClasses: ['CS-Year 1', 'EE-Year 2'],
    status: 'Completed',
    timeSlots: ['Morning (10:00 — 13:00)'],
    description: 'Supplementary academic examinations for winter session modules.'
  },
];

export const INITIAL_TIMETABLE = [
  {
    id: 'TT-01',
    date: '2026-05-18',
    timeSlot: '09:00 — 12:00',
    subjectCode: 'CS-101',
    subjectName: 'Introduction to Computer Systems',
    className: 'CS-Year 1',
    division: 'A & B',
    room: 'Turing Auditorium',
    duration: '3.0 Hours',
    status: 'Scheduled',
  },
  {
    id: 'TT-02',
    date: '2026-05-18',
    timeSlot: '13:30 — 16:30',
    subjectCode: 'SE-205',
    subjectName: 'Software Architecture & Design',
    className: 'SE-Year 2',
    division: 'A',
    room: 'Hall 101',
    duration: '2.5 Hours',
    status: 'Scheduled',
  },
  {
    id: 'TT-03',
    date: '2026-05-19',
    timeSlot: '09:00 — 12:00',
    subjectCode: 'CS-201',
    subjectName: 'Data Structures & Algorithms',
    className: 'CS-Year 2',
    division: 'A & B',
    room: 'Hall 101 & Annex 210',
    duration: '3.0 Hours',
    status: 'Optimized',
  },
  {
    id: 'TT-04',
    date: '2026-05-19',
    timeSlot: '13:30 — 16:30',
    subjectCode: 'EE-205',
    subjectName: 'Signals & Frequency Systems',
    className: 'EE-Year 2',
    division: 'A',
    room: 'Hall 201',
    duration: '3.0 Hours',
    status: 'Scheduled',
  },
  {
    id: 'TT-05',
    date: '2026-05-20',
    timeSlot: '09:00 — 12:00',
    subjectCode: 'CS-301',
    subjectName: 'Operating Systems & Kernel Design',
    className: 'CS-Year 3',
    division: 'A',
    room: 'Hall 101',
    duration: '3.0 Hours',
    status: 'Scheduled',
  },
  {
    id: 'TT-06',
    date: '2026-05-21',
    timeSlot: '09:00 — 12:00',
    subjectCode: 'CS-401',
    subjectName: 'Algorithmic Graph Theory',
    className: 'CS-Year 3',
    division: 'A',
    room: 'Turing Auditorium',
    duration: '3.0 Hours',
    status: 'Optimized',
  },
  {
    id: 'TT-07',
    date: '2026-05-21',
    timeSlot: '13:30 — 16:30',
    subjectCode: 'DS-310',
    subjectName: 'Applied Machine Learning',
    className: 'DS-Year 3',
    division: 'A',
    room: 'Lab 204 & Lab 108',
    duration: '3.0 Hours',
    status: 'Scheduled',
  },
  {
    id: 'TT-08',
    date: '2026-05-22',
    timeSlot: '09:00 — 11:30',
    subjectCode: 'MATH-202',
    subjectName: 'Linear Algebra & Matrix Calculus',
    className: 'CS-Year 1',
    division: 'A & B',
    room: 'Turing Auditorium',
    duration: '2.5 Hours',
    status: 'Scheduled',
  },
  {
    id: 'TT-09',
    date: '2026-05-22',
    timeSlot: '13:30 — 16:30',
    subjectCode: 'MATH-302',
    subjectName: 'Matrix Algebra & Optimization',
    className: 'CS-Year 2',
    division: 'A',
    room: 'Annex 210',
    duration: '3.0 Hours',
    status: 'Optimized',
  },
];

export const INITIAL_CONFLICTS = [
  {
    id: 'CONF-01',
    type: 'Student Exam Clash',
    severity: 'Critical',
    entity: 'CS-401 & DS-310',
    detectedIssue: 'Concurrent scheduling on 2026-05-21 09:00 causes conflict for 18 dual-enrolled DS students.',
    rootCause: 'Both CS-Year 3 and DS-Year 3 cohorts share elective module enrollment in Algorithmic Graph Theory.',
    suggestedResolution: 'Shift DS-310 to Afternoon Slot (13:30) or reschedule to 2026-05-23.',
    status: 'Unresolved',
  },
  {
    id: 'CONF-02',
    type: 'Room Capacity Violation',
    severity: 'High',
    entity: 'CS-201 in Lab 204',
    detectedIssue: 'Examinee count (72 students) exceeds maximum lab seating capacity (45 seats).',
    rootCause: 'Automated seed assigned practical lab instead of general lecture hall.',
    suggestedResolution: 'Reallocate CS-201 to Hall 101 (120 capacity) or split into Labs 204 & 108.',
    status: 'Unresolved',
  },
  {
    id: 'CONF-03',
    type: 'Room/Time-Slot Clash',
    severity: 'Critical',
    entity: 'Hall 101 on 2026-05-20',
    detectedIssue: 'Hall 101 double-booked at 09:00 for CS-301 and concurrent departmental colloquium.',
    rootCause: 'Venue reservation flag not cross-checked against institutional calendar.',
    suggestedResolution: 'Move CS-301 to Turing Auditorium (currently idle on 09:00 slot).',
    status: 'In Review',
  },
  {
    id: 'CONF-04',
    type: 'Insufficient Rest Gap',
    severity: 'Medium',
    entity: 'MATH-302 & CS-401',
    detectedIssue: 'Cohort CS-Year 3 has consecutive 3-hour theoretical exams under 18 hours apart.',
    rootCause: 'Slot spacing rule marked optional in draft preferences.',
    suggestedResolution: 'Insert 24-hour buffer day between May 21 and May 22.',
    status: 'Resolved',
  },
];

export const RECENT_ACTIVITIES = [
  { id: 'ACT-01', action: 'Draft Saved', detail: 'Spring 2026 Final Examinations schedule v1.4 updated', time: '14 mins ago' },
  { id: 'ACT-02', action: 'Room Allocated', detail: 'Turing Auditorium assigned for CS-101 (133 examinees)', time: '1 hour ago' },
  { id: 'ACT-03', action: 'Constraint Checked', detail: 'Checked clash avoidance against 8 academic cohorts', time: '3 hours ago' },
  { id: 'ACT-04', action: 'Capacity Adjusted', detail: 'Hall 101 seating capacity verified at 120 seats', time: 'Yesterday' },
];

export const DEMO_NOTIFICATIONS = [
  { id: 'NOTIF-01', title: 'Schedule Draft Prepared', time: '10m ago', read: false },
  { id: 'NOTIF-02', title: 'Room Maintenance Notice', time: '2h ago', read: false },
  { id: 'NOTIF-03', title: 'Academic Year 2025–26 Sync', time: '1d ago', read: true },
];
