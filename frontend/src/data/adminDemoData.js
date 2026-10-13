/**
 * ExamSync Admin Panel — Centralized Fictional Demo Data Module
 * Vidyalankar Institute of Technology (VIT), Wadala, Mumbai
 *
 * NOTE: All data in this file is realistic in structure but purely fictional.
 * Configured specifically for VIT academic hierarchy:
 * FE (First Year), SE (Second Year), TE (Third Year), BE (Final Year).
 * Venues mapped to VIT Blocks A, B, C, D, E, F, M and Laboratories.
 */

export const INITIAL_SUMMARY_STATS = {
  totalStudents: 1420,
  activeSubjects: 48,
  examRooms: 32,
  availableRooms: 28,
  scheduledExams: 64,
  currentSession: 'May 2026 End-Semester Examinations',
  timetableStatus: 'Draft v1.4 — Unpublished',
};

export const INITIAL_STUDENTS = [
  { id: 'STU-2026-001', name: 'Aarav Sharma', email: 'aarav.sharma@vit.edu.in', className: 'TE CMPN', division: 'A', status: 'Active' },
  { id: 'STU-2026-002', name: 'Rhea Kulkarni', email: 'rhea.kulkarni@vit.edu.in', className: 'TE CMPN', division: 'A', status: 'Active' },
  { id: 'STU-2026-003', name: 'Siddharth Deshmukh', email: 'siddharth.d@vit.edu.in', className: 'SE CMPN', division: 'B', status: 'Active' },
  { id: 'STU-2026-004', name: 'Ananya Iyer', email: 'ananya.iyer@vit.edu.in', className: 'FE', division: 'A', status: 'Active' },
  { id: 'STU-2026-005', name: 'Rohan Mehra', email: 'rohan.m@vit.edu.in', className: 'SE INFT', division: 'A', status: 'Active' },
  { id: 'STU-2026-006', name: 'Neha Patil', email: 'neha.patil@vit.edu.in', className: 'TE INFT', division: 'A', status: 'Active' },
  { id: 'STU-2026-007', name: 'Aditya Joshi', email: 'aditya.j@vit.edu.in', className: 'SE CMPN', division: 'A', status: 'Active' },
  { id: 'STU-2026-008', name: 'Pooja Nair', email: 'pooja.nair@vit.edu.in', className: 'TE EXTC', division: 'A', status: 'Active' },
  { id: 'STU-2026-009', name: 'Karan Shah', email: 'karan.shah@vit.edu.in', className: 'FE', division: 'B', status: 'Inactive' },
  { id: 'STU-2026-010', name: 'Ishita Banerjee', email: 'ishita.b@vit.edu.in', className: 'BE CMPN', division: 'A', status: 'Active' },
  { id: 'STU-2026-011', name: 'Tanmay Gaikwad', email: 'tanmay.g@vit.edu.in', className: 'SE INFT', division: 'A', status: 'Active' },
  { id: 'STU-2026-012', name: 'Shruti Sawant', email: 'shruti.s@vit.edu.in', className: 'BE EXTC', division: 'A', status: 'Active' },
  { id: 'STU-2026-013', name: 'Varun Chavan', email: 'varun.c@vit.edu.in', className: 'TE CMPN', division: 'A', status: 'Active' },
  { id: 'STU-2026-014', name: 'Priyanka Jadhav', email: 'priyanka.j@vit.edu.in', className: 'SE CMPN', division: 'B', status: 'Active' },
];

export const INITIAL_CLASSES = [
  { id: 'CLS-01', name: 'FE', division: 'A', academicYear: '2025–2026', studentCount: 68 },
  { id: 'CLS-02', name: 'FE', division: 'B', academicYear: '2025–2026', studentCount: 65 },
  { id: 'CLS-03', name: 'SE CMPN', division: 'A', academicYear: '2025–2026', studentCount: 72 },
  { id: 'CLS-04', name: 'SE CMPN', division: 'B', academicYear: '2025–2026', studentCount: 70 },
  { id: 'CLS-05', name: 'SE INFT', division: 'A', academicYear: '2025–2026', studentCount: 64 },
  { id: 'CLS-06', name: 'TE CMPN', division: 'A', academicYear: '2025–2026', studentCount: 76 },
  { id: 'CLS-07', name: 'TE INFT', division: 'A', academicYear: '2025–2026', studentCount: 68 },
  { id: 'CLS-08', name: 'TE EXTC', division: 'A', academicYear: '2025–2026', studentCount: 58 },
  { id: 'CLS-09', name: 'BE CMPN', division: 'A', academicYear: '2025–2026', studentCount: 74 },
  { id: 'CLS-10', name: 'BE INFT', division: 'A', academicYear: '2025–2026', studentCount: 62 },
  { id: 'CLS-11', name: 'BE EXTC', division: 'A', academicYear: '2025–2026', studentCount: 55 },
];

export const INITIAL_SUBJECTS = [
  { id: 'SUB-01', code: 'FEC101', name: 'Applied Mathematics - I', applicableClasses: ['FE (A)', 'FE (B)'], duration: '3.0 Hours' },
  { id: 'SUB-02', code: 'FEC102', name: 'Applied Physics - I', applicableClasses: ['FE (A)', 'FE (B)'], duration: '2.0 Hours' },
  { id: 'SUB-03', code: 'FEC104', name: 'Engineering Mechanics', applicableClasses: ['FE (A)', 'FE (B)'], duration: '3.0 Hours' },
  { id: 'SUB-04', code: 'CSC301', name: 'Applied Mathematics - III', applicableClasses: ['SE CMPN (A)', 'SE CMPN (B)'], duration: '3.0 Hours' },
  { id: 'SUB-05', code: 'CSC303', name: 'Data Structures & Algorithms', applicableClasses: ['SE CMPN (A)', 'SE CMPN (B)'], duration: '3.0 Hours' },
  { id: 'SUB-06', code: 'ITC301', name: 'Data Structures & Analysis', applicableClasses: ['SE INFT (A)'], duration: '3.0 Hours' },
  { id: 'SUB-07', code: 'CSC501', name: 'Theoretical Computer Science', applicableClasses: ['TE CMPN (A)'], duration: '3.0 Hours' },
  { id: 'SUB-08', code: 'CSC502', name: 'Software Engineering', applicableClasses: ['TE CMPN (A)'], duration: '3.0 Hours' },
  { id: 'SUB-09', code: 'CSC503', name: 'Computer Networks', applicableClasses: ['TE CMPN (A)'], duration: '3.0 Hours' },
  { id: 'SUB-10', code: 'ITC501', name: 'Internet Programming', applicableClasses: ['TE INFT (A)'], duration: '3.0 Hours' },
  { id: 'SUB-11', code: 'ECC501', name: 'Digital Communication', applicableClasses: ['TE EXTC (A)'], duration: '3.0 Hours' },
  { id: 'SUB-12', code: 'CSC701', name: 'Machine Learning', applicableClasses: ['BE CMPN (A)'], duration: '3.0 Hours' },
  { id: 'SUB-13', code: 'ECC701', name: 'Microwave Engineering', applicableClasses: ['BE EXTC (A)'], duration: '3.0 Hours' },
];

export const INITIAL_ASSIGNMENTS = [
  { classId: 'CLS-01', className: 'FE (A)', subjectCodes: ['FEC101', 'FEC102', 'FEC104'], totalExaminees: 68 },
  { classId: 'CLS-02', className: 'FE (B)', subjectCodes: ['FEC101', 'FEC102', 'FEC104'], totalExaminees: 65 },
  { classId: 'CLS-03', className: 'SE CMPN (A)', subjectCodes: ['CSC301', 'CSC303'], totalExaminees: 72 },
  { classId: 'CLS-04', className: 'SE CMPN (B)', subjectCodes: ['CSC301', 'CSC303'], totalExaminees: 70 },
  { classId: 'CLS-05', className: 'SE INFT (A)', subjectCodes: ['CSC301', 'ITC301'], totalExaminees: 64 },
  { classId: 'CLS-06', className: 'TE CMPN (A)', subjectCodes: ['CSC501', 'CSC502', 'CSC503'], totalExaminees: 76 },
  { classId: 'CLS-07', className: 'TE INFT (A)', subjectCodes: ['ITC501'], totalExaminees: 68 },
  { classId: 'CLS-08', className: 'TE EXTC (A)', subjectCodes: ['ECC501'], totalExaminees: 58 },
  { id: 'CLS-09', classId: 'CLS-09', className: 'BE CMPN (A)', subjectCodes: ['CSC701'], totalExaminees: 74 },
  { id: 'CLS-11', classId: 'CLS-11', className: 'BE EXTC (A)', subjectCodes: ['ECC701'], totalExaminees: 55 },
];

export const INITIAL_ROOMS = [
  { id: 'RM-01', roomNumber: 'A101', location: 'Block A, 1st Floor', capacity: 60, type: 'Standard Classroom', status: 'Available' },
  { id: 'RM-02', roomNumber: 'A102', location: 'Block A, 1st Floor', capacity: 60, type: 'Standard Classroom', status: 'Available' },
  { id: 'RM-03', roomNumber: 'A201', location: 'Block A, 2nd Floor', capacity: 80, type: 'Lecture Hall', status: 'Available' },
  { id: 'RM-04', roomNumber: 'A202', location: 'Block A, 2nd Floor', capacity: 80, type: 'Lecture Hall', status: 'Available' },
  { id: 'RM-05', roomNumber: 'A204', location: 'Block A, 2nd Floor', capacity: 90, type: 'Lecture Hall', status: 'Available' },
  { id: 'RM-06', roomNumber: 'A301', location: 'Block A, 3rd Floor', capacity: 100, type: 'Lecture Hall', status: 'Available' },
  { id: 'RM-07', roomNumber: 'B201', location: 'Block B, 2nd Floor', capacity: 65, type: 'Standard Classroom', status: 'Available' },
  { id: 'RM-08', roomNumber: 'C101', location: 'Block C, 1st Floor', capacity: 85, type: 'Lecture Hall', status: 'Available' },
  { id: 'RM-09', roomNumber: 'D101', location: 'Block D, 1st Floor', capacity: 45, type: 'Seminar Room', status: 'Available' },
  { id: 'RM-10', roomNumber: 'E201', location: 'Block E, 2nd Floor', capacity: 70, type: 'Standard Classroom', status: 'Available' },
  { id: 'RM-11', roomNumber: 'F101', location: 'Block F, Ground Floor (Auditorium)', capacity: 220, type: 'Auditorium', status: 'Available' },
  { id: 'RM-12', roomNumber: 'M101', location: 'Block M, 1st Floor', capacity: 120, type: 'Lecture Hall', status: 'Available' },
  { id: 'RM-13', roomNumber: 'L01', location: 'Computing Center, Block A, Ground Floor', capacity: 40, type: 'Computer Lab', status: 'Available' },
  { id: 'RM-14', roomNumber: 'L02', location: 'Advanced Programming Lab, Block B, 1st Floor', capacity: 45, type: 'Computer Lab', status: 'Available' },
  { id: 'RM-15', roomNumber: 'L101', location: 'Network Engineering Lab, Block C, 2nd Floor', capacity: 35, type: 'Computer Lab', status: 'Maintenance' },
];

export const INITIAL_EXAM_SESSIONS = [
  {
    id: 'SESS-2026-01',
    name: 'March 2026 Mid-Semester Assessment',
    term: 'Even Semester 2025–2026',
    startDate: '2026-03-23',
    endDate: '2026-03-31',
    applicableClasses: ['FE', 'SE CMPN', 'TE CMPN', 'TE INFT'],
    status: 'Scheduled',
    timeSlots: ['Morning (09:00 — 12:00)', 'Afternoon (14:00 — 17:00)'],
    description: 'Mid-term internal continuous assessment period for B.Tech engineering programmes.'
  },
  {
    id: 'SESS-2026-02',
    name: 'May 2026 End-Semester Examinations',
    term: 'Even Semester 2025–2026',
    startDate: '2026-05-18',
    endDate: '2026-05-30',
    applicableClasses: ['All Departments'],
    status: 'Draft',
    timeSlots: ['Slot 1 (09:00 — 12:00)', 'Slot 2 (13:30 — 16:30)', 'Slot 3 (17:30 — 20:30)'],
    description: 'VIT Mumbai autonomous end-semester comprehensive theory examinations.'
  },
  {
    id: 'SESS-2025-03',
    name: 'January 2026 Supplementary Examinations',
    term: 'Odd Semester 2025–2026',
    startDate: '2026-01-12',
    endDate: '2026-01-20',
    applicableClasses: ['FE', 'SE CMPN', 'TE EXTC'],
    status: 'Completed',
    timeSlots: ['Morning (10:00 — 13:00)'],
    description: 'Supplementary academic examinations for odd session modules.'
  },
];

export const INITIAL_TIMETABLE = [
  {
    id: 'TT-01',
    date: '2026-05-18',
    timeSlot: '09:00 — 12:00',
    subjectCode: 'FEC101',
    subjectName: 'Applied Mathematics - I',
    className: 'FE',
    division: 'A & B',
    room: 'F101',
    duration: '3.0 Hours',
    status: 'Scheduled',
  },
  {
    id: 'TT-02',
    date: '2026-05-18',
    timeSlot: '13:30 — 16:30',
    subjectCode: 'CSC501',
    subjectName: 'Theoretical Computer Science',
    className: 'TE CMPN',
    division: 'A',
    room: 'A204',
    duration: '3.0 Hours',
    status: 'Scheduled',
  },
  {
    id: 'TT-03',
    date: '2026-05-19',
    timeSlot: '09:00 — 12:00',
    subjectCode: 'CSC301',
    subjectName: 'Applied Mathematics - III',
    className: 'SE CMPN',
    division: 'A & B',
    room: 'M101',
    duration: '3.0 Hours',
    status: 'Optimized',
  },
  {
    id: 'TT-04',
    date: '2026-05-19',
    timeSlot: '13:30 — 16:30',
    subjectCode: 'ITC501',
    subjectName: 'Internet Programming',
    className: 'TE INFT',
    division: 'A',
    room: 'C101',
    duration: '3.0 Hours',
    status: 'Scheduled',
  },
  {
    id: 'TT-05',
    date: '2026-05-20',
    timeSlot: '09:00 — 12:00',
    subjectCode: 'CSC502',
    subjectName: 'Software Engineering',
    className: 'TE CMPN',
    division: 'A',
    room: 'A201',
    duration: '3.0 Hours',
    status: 'Scheduled',
  },
  {
    id: 'TT-06',
    date: '2026-05-21',
    timeSlot: '09:00 — 12:00',
    subjectCode: 'FEC102',
    subjectName: 'Applied Physics - I',
    className: 'FE',
    division: 'A & B',
    room: 'F101',
    duration: '2.0 Hours',
    status: 'Optimized',
  },
  {
    id: 'TT-07',
    date: '2026-05-21',
    timeSlot: '13:30 — 16:30',
    subjectCode: 'CSC701',
    subjectName: 'Machine Learning',
    className: 'BE CMPN',
    division: 'A',
    room: 'A301',
    duration: '3.0 Hours',
    status: 'Scheduled',
  },
  {
    id: 'TT-08',
    date: '2026-05-22',
    timeSlot: '09:00 — 12:00',
    subjectCode: 'CSC303',
    subjectName: 'Data Structures & Algorithms',
    className: 'SE CMPN',
    division: 'A',
    room: 'A202',
    duration: '3.0 Hours',
    status: 'Scheduled',
  },
  {
    id: 'TT-09',
    date: '2026-05-22',
    timeSlot: '13:30 — 16:30',
    subjectCode: 'ECC501',
    subjectName: 'Digital Communication',
    className: 'TE EXTC',
    division: 'A',
    room: 'B201',
    duration: '3.0 Hours',
    status: 'Optimized',
  },
];

export const INITIAL_CONFLICTS = [
  {
    id: 'CONF-01',
    type: 'Room Capacity Exceeded',
    severity: 'High',
    entity: 'CSC301 in L01',
    detectedIssue: 'Examinee count (72 students) exceeds computing lab seating limit (40 desks).',
    rootCause: 'Draft seed allocated lab workstation venue instead of Block M lecture hall.',
    suggestedResolution: 'Reallocate CSC301 to M101 (120 capacity) or split across A201 and A202.',
    status: 'Unresolved',
  },
  {
    id: 'CONF-02',
    type: 'Venue Double-Booking Clash',
    severity: 'Critical',
    entity: 'A204 on 2026-05-20',
    detectedIssue: 'A204 scheduled simultaneously at 09:00 for departmental review and CSC502 paper.',
    rootCause: 'Block A reservation flag unverified against institutional examination roster.',
    suggestedResolution: 'Relocate CSC502 to Room A201 (verified available during 09:00–12:00 slot).',
    status: 'In Review',
  },
  {
    id: 'CONF-03',
    type: 'Insufficient Rest Gap',
    severity: 'Medium',
    entity: 'CSC501 & CSC502',
    detectedIssue: 'Cohort TE CMPN Div A has consecutive 3-hour core papers spaced under 18 hours apart.',
    rootCause: 'Inter-day slot spacing rule set to soft constraint during draft configuration.',
    suggestedResolution: 'Insert a preparation buffer day between May 18 and May 20.',
    status: 'Resolved',
  },
];

export const RECENT_ACTIVITIES = [
  { id: 'ACT-01', action: 'Draft Saved', detail: 'May 2026 End-Semester Examinations schedule v1.4 updated', time: '14 mins ago' },
  { id: 'ACT-02', action: 'Venue Allocated', detail: 'Block F Auditorium assigned for FEC101 (133 examinees)', time: '1 hour ago' },
  { id: 'ACT-03', action: 'Constraint Checked', detail: 'Checked clash avoidance against FE, SE, TE, and BE cohorts', time: '3 hours ago' },
  { id: 'ACT-04', action: 'Capacity Adjusted', detail: 'Block A Room 204 seating verified at 90 seats', time: 'Yesterday' },
];

export const DEMO_NOTIFICATIONS = [
  { id: 'NOTIF-01', title: 'Schedule Draft Prepared', time: '10m ago', read: false },
  { id: 'NOTIF-02', title: 'Venue Maintenance Notice: Lab L101', time: '2h ago', read: false },
  { id: 'NOTIF-03', title: 'Academic Year 2025–26 Sync Complete', time: '1d ago', read: true },
];
