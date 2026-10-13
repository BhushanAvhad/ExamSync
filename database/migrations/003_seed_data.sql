-- ============================================================================
-- ExamSync Database Foundation — Optional Development Seed Data
-- Migration: 003_seed_data.sql
-- Description: Fictional development seed data for Vidyalankar Institute of Technology (VIT).
-- NOTE: Uses standard RFC 4122 compliant hexadecimal UUID values (a-f, 0-9).
--       DO NOT RUN IN PRODUCTION WITH REAL STUDENT DATA.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Seed Classes (FE, SE, TE, BE across VIT Departments)
-- ----------------------------------------------------------------------------
INSERT INTO public.classes (id, name, division, academic_year) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'FE', 'A', '2025–2026'),
  ('a1000000-0000-0000-0000-000000000002', 'FE', 'B', '2025–2026'),
  ('a1000000-0000-0000-0000-000000000003', 'SE CMPN', 'A', '2025–2026'),
  ('a1000000-0000-0000-0000-000000000004', 'SE CMPN', 'B', '2025–2026'),
  ('a1000000-0000-0000-0000-000000000005', 'SE INFT', 'A', '2025–2026'),
  ('a1000000-0000-0000-0000-000000000006', 'TE CMPN', 'A', '2025–2026'),
  ('a1000000-0000-0000-0000-000000000007', 'TE INFT', 'A', '2025–2026'),
  ('a1000000-0000-0000-0000-000000000008', 'TE EXTC', 'A', '2025–2026'),
  ('a1000000-0000-0000-0000-000000000009', 'BE CMPN', 'A', '2025–2026'),
  ('a1000000-0000-0000-0000-000000000010', 'BE EXTC', 'A', '2025–2026')
ON CONFLICT (name, division, academic_year) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. Seed Subjects
-- ----------------------------------------------------------------------------
INSERT INTO public.subjects (id, code, name, type, credits, duration_minutes, instructor) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'FEC101', 'Applied Mathematics - I', 'Core', 4, 180, 'Prof. A. S. Joshi'),
  ('b1000000-0000-0000-0000-000000000002', 'FEC102', 'Applied Physics - I', 'Core', 3, 120, 'Dr. R. K. Sharma'),
  ('b1000000-0000-0000-0000-000000000003', 'FEC104', 'Engineering Mechanics', 'Core', 4, 180, 'Prof. S. N. Kulkarni'),
  ('b1000000-0000-0000-0000-000000000004', 'CSC301', 'Applied Mathematics - III', 'Core', 4, 180, 'Prof. A. S. Joshi'),
  ('b1000000-0000-0000-0000-000000000005', 'CSC303', 'Data Structures & Algorithms', 'Core', 4, 180, 'Dr. P. R. Joshi'),
  ('b1000000-0000-0000-0000-000000000006', 'ITC301', 'Data Structures & Analysis', 'Core', 4, 180, 'Prof. N. K. Sawant'),
  ('b1000000-0000-0000-0000-000000000007', 'CSC501', 'Theoretical Computer Science', 'Core', 4, 180, 'Prof. S. R. Kulkarni'),
  ('b1000000-0000-0000-0000-000000000008', 'CSC502', 'Software Engineering', 'Core', 4, 180, 'Dr. V. N. Patil'),
  ('b1000000-0000-0000-0000-000000000009', 'CSC503', 'Computer Networks', 'Core', 4, 180, 'Prof. A. M. Deshpande'),
  ('b1000000-0000-0000-0000-000000000010', 'ITC501', 'Internet Programming', 'Core', 4, 180, 'Prof. N. K. Sawant'),
  ('b1000000-0000-0000-0000-000000000011', 'ECC501', 'Digital Communication', 'Core', 4, 180, 'Dr. S. K. Verma'),
  ('b1000000-0000-0000-0000-000000000012', 'CSC701', 'Machine Learning', 'Core', 4, 180, 'Dr. A. B. Roy'),
  ('b1000000-0000-0000-0000-000000000013', 'ECC701', 'Microwave Engineering', 'Core', 4, 180, 'Dr. S. K. Verma')
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. Seed Class–Subject Assignments
-- ----------------------------------------------------------------------------
INSERT INTO public.class_subject_assignments (class_id, subject_id) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001'), -- FEC101 to FE (A)
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002'), -- FEC102 to FE (A)
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001'), -- FEC101 to FE (B)
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000004'), -- CSC301 to SE CMPN (A)
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000005'), -- CSC303 to SE CMPN (A)
  ('a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000006'), -- ITC301 to SE INFT (A)
  ('a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000007'), -- CSC501 to TE CMPN (A)
  ('a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000008'), -- CSC502 to TE CMPN (A)
  ('a1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000010'), -- ITC501 to TE INFT (A)
  ('a1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000011'), -- ECC501 to TE EXTC (A)
  ('a1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000012'), -- CSC701 to BE CMPN (A)
  ('a1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000013')  -- ECC701 to BE EXTC (A)
ON CONFLICT (class_id, subject_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. Seed Exam Rooms (VIT Blocks A, B, C, D, E, F, M and Laboratories)
-- ----------------------------------------------------------------------------
INSERT INTO public.exam_rooms (id, room_number, location, capacity, type, status) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'A101', 'Block A, 1st Floor', 60, 'Standard Classroom', 'Available'),
  ('c1000000-0000-0000-0000-000000000002', 'A201', 'Block A, 2nd Floor', 80, 'Lecture Hall', 'Available'),
  ('c1000000-0000-0000-0000-000000000003', 'A204', 'Block A, 2nd Floor', 90, 'Lecture Hall', 'Available'),
  ('c1000000-0000-0000-0000-000000000004', 'A301', 'Block A, 3rd Floor', 100, 'Lecture Hall', 'Available'),
  ('c1000000-0000-0000-0000-000000000005', 'B201', 'Block B, 2nd Floor', 65, 'Standard Classroom', 'Available'),
  ('c1000000-0000-0000-0000-000000000006', 'C101', 'Block C, 1st Floor', 85, 'Lecture Hall', 'Available'),
  ('c1000000-0000-0000-0000-000000000007', 'F101', 'Block F, Ground Floor (Auditorium)', 220, 'Auditorium', 'Available'),
  ('c1000000-0000-0000-0000-000000000008', 'M101', 'Block M, 1st Floor', 120, 'Lecture Hall', 'Available'),
  ('c1000000-0000-0000-0000-000000000009', 'L01', 'Computing Center, Block A, Ground Floor', 40, 'Computer Lab', 'Available'),
  ('c1000000-0000-0000-0000-000000000010', 'L02', 'Advanced Programming Lab, Block B, 1st Floor', 45, 'Computer Lab', 'Available')
ON CONFLICT (room_number) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. Seed Exam Sessions
-- ----------------------------------------------------------------------------
INSERT INTO public.exam_sessions (id, name, academic_term, start_date, end_date, status, description, time_slots) VALUES
  (
    'd1000000-0000-0000-0000-000000000001',
    'March 2026 Mid-Semester Assessment',
    'Even Semester 2025–2026',
    '2026-03-23',
    '2026-03-31',
    'Scheduled',
    'Mid-term internal continuous assessment period for B.Tech engineering programmes.',
    '["Morning (09:00 — 12:00)", "Afternoon (14:00 — 17:00)"]'::jsonb
  ),
  (
    'd1000000-0000-0000-0000-000000000002',
    'May 2026 End-Semester Examinations',
    'Even Semester 2025–2026',
    '2026-05-18',
    '2026-05-30',
    'Draft',
    'VIT Mumbai autonomous end-semester comprehensive theory examinations.',
    '["Morning (09:00 — 12:00)", "Afternoon (13:30 — 16:30)"]'::jsonb
  )
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
    'b1000000-0000-0000-0000-000000000001', -- FEC101
    'a1000000-0000-0000-0000-000000000001', -- FE (A)
    'c1000000-0000-0000-0000-000000000007', -- F101
    '2026-05-18', '09:00:00', '12:00:00', 180, 'Scheduled', true
  ),
  (
    'e1000000-0000-0000-0000-000000000002',
    'd1000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000007', -- CSC501
    'a1000000-0000-0000-0000-000000000006', -- TE CMPN (A)
    'c1000000-0000-0000-0000-000000000003', -- A204
    '2026-05-18', '13:30:00', '16:30:00', 180, 'Scheduled', true
  ),
  (
    'e1000000-0000-0000-0000-000000000003',
    'd1000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000004', -- CSC301
    'a1000000-0000-0000-0000-000000000003', -- SE CMPN (A)
    'c1000000-0000-0000-0000-000000000008', -- M101
    '2026-05-19', '09:00:00', '12:00:00', 180, 'Scheduled', true
  ),
  (
    'e1000000-0000-0000-0000-000000000004',
    'd1000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000008', -- CSC502
    'a1000000-0000-0000-0000-000000000006', -- TE CMPN (A)
    'c1000000-0000-0000-0000-000000000002', -- A201
    '2026-05-20', '09:00:00', '12:00:00', 180, 'Scheduled', true
  )
ON CONFLICT DO NOTHING;
