-- ============================================================================
-- ExamSync Database Foundation — Optional Development Seed Data
-- Migration: 003_seed_data.sql
-- Description: Fictional development seed data mirroring adminDemoData.js.
-- NOTE: Uses standard RFC 4122 compliant hexadecimal UUID values (a-f, 0-9).
--       DO NOT RUN IN PRODUCTION WITH REAL STUDENT DATA.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Seed Classes
-- ----------------------------------------------------------------------------
INSERT INTO public.classes (id, name, division, academic_year) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'CS-Year 1', 'A', '2025–2026'),
  ('a1000000-0000-0000-0000-000000000002', 'CS-Year 1', 'B', '2025–2026'),
  ('a1000000-0000-0000-0000-000000000003', 'CS-Year 2', 'A', '2025–2026'),
  ('a1000000-0000-0000-0000-000000000004', 'CS-Year 2', 'B', '2025–2026'),
  ('a1000000-0000-0000-0000-000000000005', 'CS-Year 3', 'A', '2025–2026'),
  ('a1000000-0000-0000-0000-000000000006', 'SE-Year 2', 'A', '2025–2026'),
  ('a1000000-0000-0000-0000-000000000007', 'DS-Year 3', 'A', '2025–2026'),
  ('a1000000-0000-0000-0000-000000000008', 'EE-Year 2', 'A', '2025–2026')
ON CONFLICT (name, division, academic_year) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. Seed Subjects
-- ----------------------------------------------------------------------------
INSERT INTO public.subjects (id, code, name, type, credits, duration_minutes, instructor) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'CS-101', 'Introduction to Computer Systems', 'Core', 4, 180, 'Dr. Alan Vance'),
  ('b1000000-0000-0000-0000-000000000002', 'CS-201', 'Data Structures & Algorithms', 'Core', 4, 180, 'Prof. Katherine Bell'),
  ('b1000000-0000-0000-0000-000000000003', 'CS-301', 'Operating Systems & Kernel Design', 'Core', 4, 180, 'Prof. David K. Miller'),
  ('b1000000-0000-0000-0000-000000000004', 'CS-401', 'Algorithmic Graph Theory', 'Core', 4, 180, 'Dr. Aris Thorne'),
  ('b1000000-0000-0000-0000-000000000005', 'SE-205', 'Software Architecture & Design', 'Core', 3, 150, 'Dr. Elena Rostova'),
  ('b1000000-0000-0000-0000-000000000006', 'DS-310', 'Applied Machine Learning', 'Technical Elective', 3, 180, 'Dr. Kenneth Zhao'),
  ('b1000000-0000-0000-0000-000000000007', 'EE-205', 'Signals & Frequency Systems', 'Core', 3, 180, 'Dr. Sanjay Verma'),
  ('b1000000-0000-0000-0000-000000000008', 'MATH-202', 'Linear Algebra & Matrix Calculus', 'Core', 3, 150, 'Prof. Rachel Green'),
  ('b1000000-0000-0000-0000-000000000009', 'MATH-302', 'Matrix Algebra & Optimization', 'Core', 3, 180, 'Dr. Thomas Lin')
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. Seed Class–Subject Assignments
-- ----------------------------------------------------------------------------
INSERT INTO public.class_subject_assignments (class_id, subject_id) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001'), -- CS-101 to CS-Year 1 (A)
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000008'), -- MATH-202 to CS-Year 1 (A)
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001'), -- CS-101 to CS-Year 1 (B)
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000008'), -- MATH-202 to CS-Year 1 (B)
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002'), -- CS-201 to CS-Year 2 (A)
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000009'), -- MATH-302 to CS-Year 2 (A)
  ('a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002'), -- CS-201 to CS-Year 2 (B)
  ('a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000003'), -- CS-301 to CS-Year 3 (A)
  ('a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000004'), -- CS-401 to CS-Year 3 (A)
  ('a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000005'), -- SE-205 to SE-Year 2 (A)
  ('a1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000006'), -- DS-310 to DS-Year 3 (A)
  ('a1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000007')  -- EE-205 to EE-Year 2 (A)
ON CONFLICT (class_id, subject_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. Seed Exam Rooms
-- ----------------------------------------------------------------------------
INSERT INTO public.exam_rooms (id, room_number, location, capacity, type, status) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Hall 101', 'Science Complex, Ground Floor', 120, 'Lecture Hall', 'Available'),
  ('c1000000-0000-0000-0000-000000000002', 'Lab 204', 'Tech Tower, 2nd Floor', 45, 'Computer Lab', 'Available'),
  ('c1000000-0000-0000-0000-000000000003', 'Turing Auditorium', 'Innovation Wing, Level 1', 200, 'Auditorium', 'Available'),
  ('c1000000-0000-0000-0000-000000000004', 'Seminar 105', 'West Academic Quad, Block B', 60, 'Standard Classroom', 'Maintenance'),
  ('c1000000-0000-0000-0000-000000000005', 'Lab 108', 'Tech Tower, 1st Floor', 40, 'Computer Lab', 'Available'),
  ('c1000000-0000-0000-0000-000000000006', 'Annex 210', 'Mathematics Building, 2nd Floor', 75, 'Standard Classroom', 'Available'),
  ('c1000000-0000-0000-0000-000000000007', 'Hall 201', 'Engineering Block C', 90, 'Lecture Hall', 'Available'),
  ('c1000000-0000-0000-0000-000000000008', 'Seminar 305', 'Innovation Wing, Level 3', 35, 'Seminar Room', 'Reserved')
ON CONFLICT (room_number) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. Seed Exam Sessions
-- ----------------------------------------------------------------------------
INSERT INTO public.exam_sessions (id, name, academic_term, start_date, end_date, status, description) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Spring 2026 Mid-Semester', 'Spring 2026', '2026-04-10', '2026-04-20', 'Scheduled', 'Mid-term assessment period across foundational curricula.'),
  ('d1000000-0000-0000-0000-000000000002', 'Spring 2026 Final Examinations', 'Spring 2026', '2026-05-15', '2026-05-30', 'Draft', 'Institutional end-of-term comprehensive examination series.')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 6. Seed Exam Timetables
-- ----------------------------------------------------------------------------
INSERT INTO public.exam_timetables (
  id, exam_session_id, subject_id, class_id, room_id,
  exam_date, start_time, end_time, duration_minutes, status, is_published
) VALUES
  (
    'e1000000-0000-0000-0000-000000000001',
    'd1000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000003', -- CS-301
    'a1000000-0000-0000-0000-000000000005', -- CS-Year 3 (A)
    'c1000000-0000-0000-0000-000000000001', -- Hall 101
    '2026-05-18', '09:00:00', '12:00:00', 180, 'Scheduled', true
  ),
  (
    'e1000000-0000-0000-0000-000000000002',
    'd1000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000004', -- CS-401
    'a1000000-0000-0000-0000-000000000005', -- CS-Year 3 (A)
    'c1000000-0000-0000-0000-000000000003', -- Turing Auditorium
    '2026-05-21', '09:00:00', '12:00:00', 180, 'Optimized', true
  ),
  (
    'e1000000-0000-0000-0000-000000000003',
    'd1000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000005', -- SE-205
    'a1000000-0000-0000-0000-000000000006', -- SE-Year 2 (A)
    'c1000000-0000-0000-0000-000000000001', -- Hall 101
    '2026-05-25', '13:30:00', '16:00:00', 150, 'Scheduled', true
  ),
  (
    'e1000000-0000-0000-0000-000000000004',
    'd1000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000006', -- DS-310
    'a1000000-0000-0000-0000-000000000007', -- DS-Year 3 (A)
    'c1000000-0000-0000-0000-000000000002', -- Lab 204
    '2026-05-28', '09:00:00', '12:00:00', 180, 'Scheduled', true
  )
ON CONFLICT DO NOTHING;
