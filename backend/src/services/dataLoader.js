const { supabase } = require('../config/supabase');

/**
 * Verified Vidyalankar Institute of Technology (VIT) Fallback Dataset.
 * Used when database tables are currently unseeded or offline.
 */
const VIT_FALLBACK_SESSION = {
  id: 'd1000000-0000-0000-0000-000000000002',
  name: 'May 2026 End-Semester Examinations',
  academic_term: 'Even Semester 2025–2026',
  start_date: '2026-05-18',
  end_date: '2026-05-30',
  status: 'Draft',
  time_slots: [
    'Morning (09:00 — 12:00)',
    'Afternoon (13:30 — 16:30)',
  ],
};

const VIT_FALLBACK_ROOMS = [
  { id: 'c1000000-0000-0000-0000-000000000001', room_number: 'A101', location: 'Block A, 1st Floor', capacity: 60, type: 'Standard Classroom', status: 'Available' },
  { id: 'c1000000-0000-0000-0000-000000000002', room_number: 'A201', location: 'Block A, 2nd Floor', capacity: 80, type: 'Lecture Hall', status: 'Available' },
  { id: 'c1000000-0000-0000-0000-000000000003', room_number: 'A204', location: 'Block A, 2nd Floor', capacity: 90, type: 'Lecture Hall', status: 'Available' },
  { id: 'c1000000-0000-0000-0000-000000000004', room_number: 'A301', location: 'Block A, 3rd Floor', capacity: 100, type: 'Lecture Hall', status: 'Available' },
  { id: 'c1000000-0000-0000-0000-000000000005', room_number: 'B201', location: 'Block B, 2nd Floor', capacity: 65, type: 'Standard Classroom', status: 'Available' },
  { id: 'c1000000-0000-0000-0000-000000000006', room_number: 'C101', location: 'Block C, 1st Floor', capacity: 85, type: 'Lecture Hall', status: 'Available' },
  { id: 'c1000000-0000-0000-0000-000000000007', room_number: 'F101', location: 'Block F, Ground Floor (Auditorium)', capacity: 220, type: 'Auditorium', status: 'Available' },
  { id: 'c1000000-0000-0000-0000-000000000008', room_number: 'M101', location: 'Block M, 1st Floor', capacity: 120, type: 'Lecture Hall', status: 'Available' },
  { id: 'c1000000-0000-0000-0000-000000000009', room_number: 'L01', location: 'Computing Center, Block A, Ground Floor', capacity: 50, type: 'Computer Lab', status: 'Available' },
  { id: 'c1000000-0000-0000-0000-000000000010', room_number: 'L02', location: 'Advanced Programming Lab, Block B, 1st Floor', capacity: 50, type: 'Computer Lab', status: 'Available' },
  { id: 'c1000000-0000-0000-0000-000000000011', room_number: 'L03', location: 'Digital Electronics Lab, Block C, 2nd Floor', capacity: 45, type: 'Electronics Lab', status: 'Available' },
  { id: 'c1000000-0000-0000-0000-000000000012', room_number: 'L04', location: 'Microprocessor & Embedded Lab, Block C, 3rd Floor', capacity: 45, type: 'Hardware Lab', status: 'Available' },
];

const VIT_FALLBACK_ASSIGNMENTS = [
  // --- First Year (FE - Common Applied Sciences Sem 2) ---
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000001', name: 'FE', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000101', code: 'DEMO-FE-2-01', name: 'Engineering Mathematics-II', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000001', name: 'FE', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000102', code: 'DEMO-FE-2-02', name: 'Engineering Graphics', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000001', name: 'FE', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000103', code: 'DEMO-FE-2-L02', name: 'Engineering Graphics Lab', type: 'Lab', duration_minutes: 120 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000001', name: 'FE', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000104', code: 'DEMO-FE-2-03', name: 'Computer Organization and Architecture', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000001', name: 'FE', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000105', code: 'DEMO-FE-2-L03', name: 'Computer Organization and Architecture Lab', type: 'Lab', duration_minutes: 120 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000001', name: 'FE', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000106', code: 'DEMO-FE-2-04', name: 'Object-Oriented Programming', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000001', name: 'FE', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000107', code: 'DEMO-FE-2-L04', name: 'Object-Oriented Programming Lab', type: 'Lab', duration_minutes: 120 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000001', name: 'FE', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000108', code: 'DEMO-FE-2-05', name: 'Professional Skills', type: 'Theory', duration_minutes: 120 },
  },

  // --- Second Year Computer Engineering (SE CMPN - Sem 4) ---
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000003', name: 'SE CMPN', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000201', code: 'DEMO-CMPN-4-01', name: 'Engineering Mathematics-IV', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000003', name: 'SE CMPN', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000202', code: 'DEMO-CMPN-4-02', name: 'Operating Systems', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000003', name: 'SE CMPN', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000203', code: 'DEMO-CMPN-4-L02', name: 'Operating Systems Lab', type: 'Lab', duration_minutes: 120 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000003', name: 'SE CMPN', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000204', code: 'DEMO-CMPN-4-03', name: 'Computer Networks', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000003', name: 'SE CMPN', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000205', code: 'DEMO-CMPN-4-L03', name: 'Computer Networks Lab', type: 'Lab', duration_minutes: 120 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000003', name: 'SE CMPN', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000206', code: 'DEMO-CMPN-4-04', name: 'Database Management Systems', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000003', name: 'SE CMPN', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000207', code: 'DEMO-CMPN-4-L04', name: 'Database Management Systems Lab', type: 'Lab', duration_minutes: 120 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000003', name: 'SE CMPN', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000208', code: 'DEMO-CMPN-4-05', name: 'Automata Theory', type: 'Core', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000003', name: 'SE CMPN', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000209', code: 'DEMO-CMPN-4-06', name: 'Object-Oriented Programming', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000003', name: 'SE CMPN', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000210', code: 'DEMO-CMPN-4-L06', name: 'Object-Oriented Programming Lab', type: 'Lab', duration_minutes: 120 },
  },

  // --- Second Year Information Technology (SE INFT - Sem 4) ---
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000005', name: 'SE INFT', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000301', code: 'DEMO-IT-4-01', name: 'Engineering Mathematics-IV', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000005', name: 'SE INFT', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000302', code: 'DEMO-IT-4-02', name: 'Operating Systems', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000005', name: 'SE INFT', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000303', code: 'DEMO-IT-4-L02', name: 'Operating Systems Lab', type: 'Lab', duration_minutes: 120 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000005', name: 'SE INFT', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000304', code: 'DEMO-IT-4-03', name: 'Computer Networks', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000005', name: 'SE INFT', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000305', code: 'DEMO-IT-4-L03', name: 'Computer Networks Lab', type: 'Lab', duration_minutes: 120 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000005', name: 'SE INFT', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000306', code: 'DEMO-IT-4-04', name: 'Database Management Systems', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000005', name: 'SE INFT', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000307', code: 'DEMO-IT-4-L04', name: 'Database Management Systems Lab', type: 'Lab', duration_minutes: 120 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000005', name: 'SE INFT', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000308', code: 'DEMO-IT-4-05', name: 'Automata Theory', type: 'Core', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000005', name: 'SE INFT', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000309', code: 'DEMO-IT-4-06', name: 'Python Programming', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000005', name: 'SE INFT', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000310', code: 'DEMO-IT-4-L06', name: 'Python Programming Lab', type: 'Lab', duration_minutes: 120 },
  },

  // --- Third Year Computer Engineering (TE CMPN - Sem 6) ---
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000006', name: 'TE CMPN', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000401', code: 'DEMO-CMPN-6-01', name: 'Artificial Intelligence', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000006', name: 'TE CMPN', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000402', code: 'DEMO-CMPN-6-02', name: 'Web Technologies', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000006', name: 'TE CMPN', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000403', code: 'DEMO-CMPN-6-L02', name: 'Web Technologies Lab', type: 'Lab', duration_minutes: 120 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000006', name: 'TE CMPN', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000404', code: 'DEMO-CMPN-6-03', name: 'Computer Graphics', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000006', name: 'TE CMPN', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000405', code: 'DEMO-CMPN-6-L03', name: 'Computer Graphics Lab', type: 'Lab', duration_minutes: 120 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000006', name: 'TE CMPN', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000406', code: 'DEMO-CMPN-6-04', name: 'Software Testing', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000006', name: 'TE CMPN', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000407', code: 'DEMO-CMPN-6-L04', name: 'Software Testing Lab', type: 'Lab', duration_minutes: 120 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000006', name: 'TE CMPN', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000408', code: 'DEMO-CMPN-6-05', name: 'Professional Elective-II', type: 'Core', duration_minutes: 180 },
  },

  // --- Third Year Information Technology (TE INFT - Sem 6) ---
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000007', name: 'TE INFT', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000501', code: 'DEMO-IT-6-01', name: 'Cloud Computing', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000007', name: 'TE INFT', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000502', code: 'DEMO-IT-6-L01', name: 'Cloud Computing Lab', type: 'Lab', duration_minutes: 120 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000007', name: 'TE INFT', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000503', code: 'DEMO-IT-6-02', name: 'Software Testing and Quality Assurance', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000007', name: 'TE INFT', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000504', code: 'DEMO-IT-6-L02', name: 'Software Testing and QA Lab', type: 'Lab', duration_minutes: 120 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000007', name: 'TE INFT', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000505', code: 'DEMO-IT-6-03', name: 'DevOps', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000007', name: 'TE INFT', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000506', code: 'DEMO-IT-6-L03', name: 'DevOps Lab', type: 'Lab', duration_minutes: 120 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000007', name: 'TE INFT', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000507', code: 'DEMO-IT-6-04', name: 'Information Security', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000007', name: 'TE INFT', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000508', code: 'DEMO-IT-6-05', name: 'Professional Elective-II', type: 'Core', duration_minutes: 180 },
  },

  // --- Third Year Electronics & Telecom (TE EXTC - Sem 6) ---
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000008', name: 'TE EXTC', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000601', code: 'DEMO-EXTC-6-01', name: 'Digital Signal Processing', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000008', name: 'TE EXTC', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000602', code: 'DEMO-EXTC-6-L01', name: 'Digital Signal Processing Lab', type: 'Lab', duration_minutes: 120 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000008', name: 'TE EXTC', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000603', code: 'DEMO-EXTC-6-02', name: 'Wireless Communication', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000008', name: 'TE EXTC', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000604', code: 'DEMO-EXTC-6-L02', name: 'Wireless Communication Lab', type: 'Lab', duration_minutes: 120 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000008', name: 'TE EXTC', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000605', code: 'DEMO-EXTC-6-03', name: 'Embedded Systems', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000008', name: 'TE EXTC', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000606', code: 'DEMO-EXTC-6-L03', name: 'Embedded Systems Lab', type: 'Lab', duration_minutes: 120 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000008', name: 'TE EXTC', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000607', code: 'DEMO-EXTC-6-04', name: 'Antenna and Wave Propagation', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000008', name: 'TE EXTC', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000608', code: 'DEMO-EXTC-6-05', name: 'Professional Elective-II', type: 'Core', duration_minutes: 180 },
  },

  // --- Final Year (BE CMPN & EXTC - Sem 8) ---
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000009', name: 'BE CMPN', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000701', code: 'DEMO-CMPN-8-01', name: 'Professional Elective-V', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000009', name: 'BE CMPN', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000702', code: 'DEMO-CMPN-8-02', name: 'Professional Elective-VI', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000009', name: 'BE CMPN', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000703', code: 'DEMO-CMPN-8-04', name: 'Major Project-II Viva & Practical', type: 'Lab', duration_minutes: 120 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000010', name: 'BE EXTC', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000704', code: 'DEMO-EXTC-8-01', name: 'Professional Elective-V', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000010', name: 'BE EXTC', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000705', code: 'DEMO-EXTC-8-02', name: 'Professional Elective-VI', type: 'Theory', duration_minutes: 180 },
  },
  {
    classes: { id: 'a1000000-0000-0000-0000-000000000010', name: 'BE EXTC', division: 'A', academic_year: '2025–2026' },
    subjects: { id: 'b1000000-0000-0000-0000-000000000706', code: 'DEMO-EXTC-8-04', name: 'Major Project-II Viva & Practical', type: 'Lab', duration_minutes: 120 },
  },
];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Loads scheduling context from Supabase or verified institutional VIT data.
 */
async function loadSchedulingContext(sessionId, userClient = null, institutionalData = null) {
  const db = userClient || supabase;

  let session = null;
  let rooms = [];
  let assignments = [];

  // Check if caller supplied created institutional data directly from client
  if (institutionalData && typeof institutionalData === 'object') {
    // 1. Created Rooms
    if (Array.isArray(institutionalData.rooms) && institutionalData.rooms.length > 0) {
      rooms = institutionalData.rooms.map((r, idx) => ({
        id: r.id || `RM-${idx + 1}`,
        room_number: r.roomNumber || r.room_number || `Hall-${idx + 1}`,
        location: r.location || 'Campus Block',
        capacity: Number(r.capacity) || 60,
        type: r.type || 'Standard Classroom',
        status: r.status || 'Available',
      }));
    }

    // 2. Created Assignments & Subjects
    if (Array.isArray(institutionalData.assignments) && institutionalData.assignments.length > 0) {
      const subjectMap = new Map();
      if (Array.isArray(institutionalData.subjects)) {
        institutionalData.subjects.forEach((s) => subjectMap.set(s.code, s));
      }

      const parsedAssignments = [];
      for (const a of institutionalData.assignments) {
        const rawName = a.className || a.name || 'FE';
        const className = rawName.replace(/\s*\([A-Z]\)/, '').trim();
        const divMatch = rawName.match(/\(([A-Z])\)/);
        const division = divMatch ? divMatch[1] : (a.division || 'A');
        const classId = a.classId || a.id || `CLS-${className.replace(/\s+/g, '')}-${division}`;

        const codes = Array.isArray(a.subjectCodes) ? a.subjectCodes : (a.subjectCode ? [a.subjectCode] : []);
        for (const sc of codes) {
          const subObj = subjectMap.get(sc) || { code: sc, name: sc, type: 'Core', duration: '3.0 Hours' };
          const durationMin = subObj.duration ? (parseFloat(subObj.duration) * 60) : (subObj.duration_minutes || 180);

          parsedAssignments.push({
            classes: {
              id: classId,
              name: className,
              division,
              academic_year: a.academicYear || '2025–2026',
            },
            subjects: {
              id: subObj.id || `SUB-${sc}`,
              code: subObj.code || sc,
              name: subObj.name || sc,
              type: subObj.type || 'Core',
              duration_minutes: durationMin,
            },
          });
        }
      }

      if (parsedAssignments.length > 0) {
        assignments = parsedAssignments;
      }
    }

    // 3. Created Sessions
    if (Array.isArray(institutionalData.sessions)) {
      const match = institutionalData.sessions.find((s) => s.id === sessionId);
      if (match) session = match;
    }
  }

  // 1. Fetch Target Exam Session from Database if available
  if (db && !session) {
    try {
      if (sessionId && UUID_REGEX.test(sessionId)) {
        const { data, error } = await db
          .from('exam_sessions')
          .select('*')
          .eq('id', sessionId)
          .maybeSingle();
        if (!error && data) session = data;
      }

      // If not found by UUID, try querying any active session
      if (!session) {
        const { data, error } = await db
          .from('exam_sessions')
          .select('*')
          .order('start_date', { ascending: false })
          .limit(1);
        if (!error && data && data.length > 0) {
          session = data[0];
        }
      }
    } catch (err) {
      console.warn('[DataLoader] Session query warning:', err.message);
    }
  }

  // 2. Fetch Available Exam Rooms if not populated
  if (db && rooms.length === 0) {
    try {
      const { data, error } = await db
        .from('exam_rooms')
        .select('*')
        .order('capacity', { ascending: false });
      if (!error && data && data.length > 0) {
        rooms = data;
      }
    } catch (err) {
      console.warn('[DataLoader] Rooms query warning:', err.message);
    }
  }

  // 3. Fetch Class-Subject Assignments if not populated
  if (db && assignments.length === 0) {
    try {
      const { data, error } = await db
        .from('class_subject_assignments')
        .select(`
          id,
          class_id,
          subject_id,
          classes ( id, name, division, academic_year ),
          subjects ( id, code, name, type, duration_minutes, credits )
        `);
      if (!error && data && data.length > 0) {
        assignments = data;
      }
    } catch (err) {
      console.warn('[DataLoader] Assignments query warning:', err.message);
    }
  }

  // Fallbacks to verified VIT institutional dataset if database tables are unpopulated
  if (!session) {
    session = VIT_FALLBACK_SESSION;
  }
  if (!rooms || rooms.length === 0) {
    rooms = VIT_FALLBACK_ROOMS;
  }
  if (!assignments || assignments.length === 0) {
    assignments = VIT_FALLBACK_ASSIGNMENTS;
  }

  // 4. Fetch Student Enrollments
  const enrollmentMap = new Map();
  if (db) {
    try {
      const { data: enrollments } = await db
        .from('student_subject_enrollments')
        .select('student_id, subject_id, class_id');

      if (enrollments && enrollments.length > 0) {
        for (const enr of enrollments) {
          const key = `${enr.class_id}__${enr.subject_id}`;
          if (!enrollmentMap.has(key)) {
            enrollmentMap.set(key, new Set());
          }
          enrollmentMap.get(key).add(enr.student_id);
        }
      }
    } catch (_) {}
  }

  // 5. Build Examination Events (Year-wise and Department-wise, not division-wise)
  const eventGroupMap = new Map();
  for (const row of assignments) {
    if (!row.classes || !row.subjects) continue;

    // Normalize class name to Year & Department (strip division e.g. (A), (B))
    const cleanClassName = (row.classes.name || '').replace(/\s*\([A-Z0-9&\s,–-]+\)/i, '').trim();
    const subjectCode = row.subjects.code;
    const groupKey = `${cleanClassName}___${subjectCode}`;

    const classId = row.classes.id;
    const subjectId = row.subjects.id;
    const key = `${classId}__${subjectId}`;

    const isLab = /Lab|Practical|Viva/i.test(row.subjects.name) || /Lab/i.test(row.subjects.type) || /-L\d+/i.test(row.subjects.code);
    let studentIds = enrollmentMap.get(key) || new Set();

    if (studentIds.size === 0) {
      studentIds = new Set();
      // Labs are conducted in laboratory batches (38 students) to fit computing & hardware labs
      const baseCohortCount = isLab ? 38 : 55;
      for (let sIdx = 1; sIdx <= baseCohortCount; sIdx++) {
        studentIds.add(`cohort_${classId.slice(-6)}_stu_${sIdx}`);
      }
    }

    if (!eventGroupMap.has(groupKey)) {
      eventGroupMap.set(groupKey, {
        id: `EV-${cleanClassName.replace(/\s+/g, '_')}-${subjectCode}`,
        subjectId: row.subjects.id,
        subjectCode: row.subjects.code,
        subjectName: row.subjects.name,
        classId: row.classes.id,
        className: cleanClassName,
        durationMinutes: row.subjects.duration_minutes || (isLab ? 120 : 180),
        type: row.subjects.type || (isLab ? 'Lab' : 'Theory'),
        isLab,
        studentIds: new Set(studentIds),
      });
    } else {
      const existing = eventGroupMap.get(groupKey);
      for (const s of studentIds) {
        existing.studentIds.add(s);
      }
    }
  }

  const events = Array.from(eventGroupMap.values()).map((ev) => ({
    ...ev,
    studentCount: ev.studentIds.size,
  }));

  return {
    session: {
      id: session.id,
      name: session.name,
      term: session.academic_term || session.term || 'Even Semester 2025–2026',
      startDate: session.start_date || session.startDate || '2026-05-18',
      endDate: session.end_date || session.endDate || '2026-05-30',
      timeSlots: session.time_slots || session.timeSlots || ['Morning (09:00 — 12:00)', 'Afternoon (13:30 — 16:30)'],
      status: session.status || 'Draft',
    },
    rooms: rooms.map((r) => ({
      id: r.id,
      roomNumber: r.room_number || r.roomNumber,
      location: r.location,
      capacity: r.capacity,
      type: r.type,
      status: r.status || 'Available',
    })),
    events,
  };
}

module.exports = {
  loadSchedulingContext,
};
