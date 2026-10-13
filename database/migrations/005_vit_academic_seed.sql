-- ============================================================================
-- ExamSync — Vidyalankar Institute of Technology (VIT), Wadala, Mumbai
-- Migration: 005_vit_academic_seed.sql
-- Description: Idempotent seed data for VIT academic structure:
--   - FE, SE, TE, and BE classes across engineering departments (CMPN, INFT, EXTC, ECS, BIOM)
--   - Curricular subjects mapped to First Year, Second Year, Third Year, and Final Year
--   - Blocks A, B, C, D, E, F, M classrooms and computing laboratories
--   - Course-cohort assignments using relational subqueries
-- NOTE: Idempotent (ON CONFLICT DO NOTHING). Safe for repeated runs.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Academic Classes (FE, SE, TE, BE across VIT Departments)
-- ----------------------------------------------------------------------------
INSERT INTO public.classes (name, division, academic_year) VALUES
  ('FE', 'A', '2025–2026'),
  ('FE', 'B', '2025–2026'),
  ('FE', 'C', '2025–2026'),
  ('SE CMPN', 'A', '2025–2026'),
  ('SE CMPN', 'B', '2025–2026'),
  ('SE INFT', 'A', '2025–2026'),
  ('SE INFT', 'B', '2025–2026'),
  ('SE EXTC', 'A', '2025–2026'),
  ('SE ECS', 'A', '2025–2026'),
  ('SE BIOM', 'A', '2025–2026'),
  ('TE CMPN', 'A', '2025–2026'),
  ('TE CMPN', 'B', '2025–2026'),
  ('TE INFT', 'A', '2025–2026'),
  ('TE EXTC', 'A', '2025–2026'),
  ('TE ECS', 'A', '2025–2026'),
  ('TE BIOM', 'A', '2025–2026'),
  ('BE CMPN', 'A', '2025–2026'),
  ('BE CMPN', 'B', '2025–2026'),
  ('BE INFT', 'A', '2025–2026'),
  ('BE EXTC', 'A', '2025–2026'),
  ('BE ECS', 'A', '2025–2026'),
  ('BE BIOM', 'A', '2025–2026')
ON CONFLICT (name, division, academic_year) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. Examination Subjects (First Year through Final Year)
-- ----------------------------------------------------------------------------
INSERT INTO public.subjects (code, name, type, credits, duration_minutes, instructor) VALUES
  -- First Year Engineering (Common)
  ('FEC101', 'Applied Mathematics - I', 'Core', 4, 180, 'Prof. A. S. Joshi'),
  ('FEC102', 'Applied Physics - I', 'Core', 3, 120, 'Dr. R. K. Sharma'),
  ('FEC103', 'Applied Chemistry - I', 'Core', 3, 120, 'Dr. M. P. Deshmukh'),
  ('FEC104', 'Engineering Mechanics', 'Core', 4, 180, 'Prof. S. N. Kulkarni'),
  ('FEC105', 'Basic Electrical Engineering', 'Core', 4, 180, 'Dr. V. B. Patil'),

  -- Second Year Engineering
  ('CSC301', 'Applied Mathematics - III', 'Core', 4, 180, 'Prof. A. S. Joshi'),
  ('CSC302', 'Discrete Structures & Graph Theory', 'Core', 4, 180, 'Prof. S. R. Kulkarni'),
  ('CSC303', 'Data Structures & Algorithms', 'Core', 4, 180, 'Dr. P. R. Joshi'),
  ('CSC304', 'Digital Logic & Computer Architecture', 'Core', 4, 180, 'Prof. A. M. Deshpande'),
  ('ITC301', 'Data Structures & Analysis', 'Core', 4, 180, 'Prof. N. K. Sawant'),
  ('ITC302', 'Database Management Systems', 'Core', 4, 180, 'Dr. V. N. Patil'),
  ('ECC301', 'Electronic Devices & Circuits', 'Core', 4, 180, 'Dr. S. K. Verma'),

  -- Third Year Engineering
  ('CSC501', 'Theoretical Computer Science', 'Core', 4, 180, 'Prof. S. R. Kulkarni'),
  ('CSC502', 'Software Engineering', 'Core', 4, 180, 'Dr. V. N. Patil'),
  ('CSC503', 'Computer Networks', 'Core', 4, 180, 'Prof. A. M. Deshpande'),
  ('CSC504', 'Data Warehousing & Mining', 'Core', 3, 180, 'Dr. P. R. Joshi'),
  ('ITC501', 'Internet Programming', 'Core', 4, 180, 'Prof. N. K. Sawant'),
  ('ECC501', 'Digital Communication', 'Core', 4, 180, 'Dr. S. K. Verma'),

  -- Final Year Engineering
  ('CSC701', 'Machine Learning', 'Core', 4, 180, 'Dr. A. B. Roy'),
  ('CSC702', 'Big Data Analytics', 'Core', 4, 180, 'Dr. P. R. Joshi'),
  ('ITC701', 'Cloud Computing Services', 'Core', 4, 180, 'Prof. N. K. Sawant'),
  ('ECC701', 'Microwave Engineering', 'Core', 4, 180, 'Dr. S. K. Verma')
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. Exam Rooms (VIT Blocks A, B, C, D, E, F, M and Laboratories)
-- ----------------------------------------------------------------------------
INSERT INTO public.exam_rooms (room_number, location, capacity, type, status) VALUES
  ('A101', 'Block A, 1st Floor', 60, 'Standard Classroom', 'Available'),
  ('A102', 'Block A, 1st Floor', 60, 'Standard Classroom', 'Available'),
  ('A201', 'Block A, 2nd Floor', 80, 'Lecture Hall', 'Available'),
  ('A202', 'Block A, 2nd Floor', 80, 'Lecture Hall', 'Available'),
  ('A203', 'Block A, 2nd Floor', 60, 'Standard Classroom', 'Available'),
  ('A204', 'Block A, 2nd Floor', 90, 'Lecture Hall', 'Available'),
  ('A205', 'Block A, 2nd Floor', 60, 'Standard Classroom', 'Available'),
  ('A301', 'Block A, 3rd Floor', 100, 'Lecture Hall', 'Available'),
  ('B201', 'Block B, 2nd Floor', 65, 'Standard Classroom', 'Available'),
  ('C101', 'Block C, 1st Floor', 85, 'Lecture Hall', 'Available'),
  ('D101', 'Block D, 1st Floor', 45, 'Seminar Room', 'Available'),
  ('E201', 'Block E, 2nd Floor', 70, 'Standard Classroom', 'Available'),
  ('F101', 'Block F, Ground Floor (Auditorium)', 220, 'Auditorium', 'Available'),
  ('M101', 'Block M, 1st Floor', 120, 'Lecture Hall', 'Available'),
  ('L01', 'Computing Center, Block A, Ground Floor', 40, 'Computer Lab', 'Available'),
  ('L02', 'Advanced Programming Lab, Block B, 1st Floor', 45, 'Computer Lab', 'Available'),
  ('L101', 'Network Engineering Lab, Block C, 2nd Floor', 35, 'Computer Lab', 'Available')
ON CONFLICT (room_number) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. Exam Sessions
-- ----------------------------------------------------------------------------
INSERT INTO public.exam_sessions (name, academic_term, start_date, end_date, status, description, time_slots) VALUES
  (
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
-- 5. Class–Subject Assignments (Relational Mapping)
-- ----------------------------------------------------------------------------
INSERT INTO public.class_subject_assignments (class_id, subject_id)
SELECT c.id, s.id
FROM public.classes c, public.subjects s
WHERE (c.name = 'FE' AND s.code IN ('FEC101', 'FEC102', 'FEC103', 'FEC104', 'FEC105'))
   OR (c.name = 'SE CMPN' AND s.code IN ('CSC301', 'CSC302', 'CSC303', 'CSC304'))
   OR (c.name = 'SE INFT' AND s.code IN ('CSC301', 'ITC301', 'ITC302'))
   OR (c.name = 'SE EXTC' AND s.code IN ('CSC301', 'ECC301'))
   OR (c.name = 'TE CMPN' AND s.code IN ('CSC501', 'CSC502', 'CSC503', 'CSC504'))
   OR (c.name = 'TE INFT' AND s.code IN ('ITC501'))
   OR (c.name = 'TE EXTC' AND s.code IN ('ECC501'))
   OR (c.name = 'BE CMPN' AND s.code IN ('CSC701', 'CSC702'))
   OR (c.name = 'BE INFT' AND s.code IN ('ITC701'))
   OR (c.name = 'BE EXTC' AND s.code IN ('ECC701'))
ON CONFLICT (class_id, subject_id) DO NOTHING;
