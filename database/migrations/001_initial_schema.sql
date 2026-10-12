-- ============================================================================
-- ExamSync Database Foundation — Initial Schema Migration
-- Migration: 001_initial_schema.sql
-- Description: Core tables, constraints, foreign keys, timestamps, and indexes
-- ============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Automated Timestamp Trigger Function
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. Profiles Table
-- ----------------------------------------------------------------------------
-- Linked 1-to-1 with Supabase auth.users.
-- Stores user identity and system role ('admin' | 'student').
-- Role modification is strictly guarded in Migration 002.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  phone TEXT,
  department TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 3. Classes Table
-- ----------------------------------------------------------------------------
-- Cohorts defined by academic degree/year and section/division.
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  division TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT uq_classes_name_division_year UNIQUE (name, division, academic_year)
);

CREATE TRIGGER trigger_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 4. Subjects Table
-- ----------------------------------------------------------------------------
-- Academic modules/units included in examination sessions.
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Core' CHECK (type IN ('Core', 'Elective', 'Technical Elective', 'Institutional Seminar', 'Seminar')),
  credits INTEGER NOT NULL DEFAULT 3 CHECK (credits > 0),
  duration_minutes INTEGER NOT NULL DEFAULT 180 CHECK (duration_minutes > 0),
  description TEXT,
  instructor TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER trigger_subjects_updated_at
  BEFORE UPDATE ON public.subjects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 5. Class–Subject Assignments Table
-- ----------------------------------------------------------------------------
-- Associative entity mapping curriculums to specific cohorts.
CREATE TABLE IF NOT EXISTS public.class_subject_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT uq_class_subject_assignment UNIQUE (class_id, subject_id)
);

-- ----------------------------------------------------------------------------
-- 6. Exam Rooms Table
-- ----------------------------------------------------------------------------
-- Physical testing venues with seating capacity and availability status.
CREATE TABLE IF NOT EXISTS public.exam_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  type TEXT NOT NULL DEFAULT 'Standard Classroom' CHECK (type IN ('Lecture Hall', 'Computer Lab', 'Auditorium', 'Standard Classroom', 'Seminar Room')),
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Maintenance', 'Reserved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER trigger_exam_rooms_updated_at
  BEFORE UPDATE ON public.exam_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 7. Exam Sessions Table
-- ----------------------------------------------------------------------------
-- Examination periods (e.g., Spring 2026 Final Examinations).
CREATE TABLE IF NOT EXISTS public.exam_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  academic_term TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Scheduled', 'In Progress', 'Completed', 'Archived')),
  description TEXT,
  time_slots JSONB DEFAULT '["Morning (09:00 — 12:00)", "Afternoon (14:00 — 17:00)"]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT chk_exam_sessions_date_range CHECK (end_date >= start_date)
);

CREATE TRIGGER trigger_exam_sessions_updated_at
  BEFORE UPDATE ON public.exam_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 8. Exam Timetables Table
-- ----------------------------------------------------------------------------
-- Master timetable allocating examination slots, classes, and rooms.
CREATE TABLE IF NOT EXISTS public.exam_timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_session_id UUID NOT NULL REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
  room_id UUID NOT NULL REFERENCES public.exam_rooms(id) ON DELETE RESTRICT,
  exam_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Optimized', 'Rescheduled', 'Completed', 'Cancelled')),
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT chk_exam_timetables_time_range CHECK (end_time > start_time)
);

CREATE TRIGGER trigger_exam_timetables_updated_at
  BEFORE UPDATE ON public.exam_timetables
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 9. Student Subject Enrollments Table
-- ----------------------------------------------------------------------------
-- Maps students to enrolled subjects and assigned desks.
CREATE TABLE IF NOT EXISTS public.student_subject_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  seat_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT uq_student_subject UNIQUE (student_id, subject_id)
);

-- ----------------------------------------------------------------------------
-- 10. Student Notifications Table
-- ----------------------------------------------------------------------------
-- Institutional timetable alerts and notices dispatched to students.
CREATE TABLE IF NOT EXISTS public.student_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  urgent BOOLEAN NOT NULL DEFAULT false,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ----------------------------------------------------------------------------
-- 11. Conflict Logs Table
-- ----------------------------------------------------------------------------
-- Scheduling conflict tracking for AI optimization and Admin review.
CREATE TABLE IF NOT EXISTS public.conflict_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_session_id UUID NOT NULL REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
  conflict_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('High', 'Medium', 'Low')),
  entity_reference TEXT NOT NULL,
  description TEXT NOT NULL,
  suggested_resolution TEXT,
  status TEXT NOT NULL DEFAULT 'Unresolved' CHECK (status IN ('Unresolved', 'Resolved', 'Ignored')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ----------------------------------------------------------------------------
-- 12. Query Optimization Indexes
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_classes_name_year ON public.classes(name, academic_year);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON public.subjects(code);
CREATE INDEX IF NOT EXISTS idx_class_subject_assignments_class ON public.class_subject_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_class_subject_assignments_subject ON public.class_subject_assignments(subject_id);
CREATE INDEX IF NOT EXISTS idx_exam_rooms_status ON public.exam_rooms(status);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_status ON public.exam_sessions(status);
CREATE INDEX IF NOT EXISTS idx_exam_timetables_session ON public.exam_timetables(exam_session_id);
CREATE INDEX IF NOT EXISTS idx_exam_timetables_subject ON public.exam_timetables(subject_id);
CREATE INDEX IF NOT EXISTS idx_exam_timetables_class ON public.exam_timetables(class_id);
CREATE INDEX IF NOT EXISTS idx_exam_timetables_room ON public.exam_timetables(room_id);
CREATE INDEX IF NOT EXISTS idx_exam_timetables_date_times ON public.exam_timetables(exam_date, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_exam_timetables_published ON public.exam_timetables(is_published);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.student_subject_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_subject ON public.student_subject_enrollments(subject_id);
CREATE INDEX IF NOT EXISTS idx_notifications_student ON public.student_notifications(student_id, is_read);
CREATE INDEX IF NOT EXISTS idx_conflicts_session ON public.conflict_logs(exam_session_id, status);
