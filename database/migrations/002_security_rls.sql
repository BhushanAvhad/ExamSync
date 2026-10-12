-- ============================================================================
-- ExamSync Database Foundation — Security & Row Level Security (RLS)
-- Migration: 002_security_rls.sql
-- Description: Least-privilege RLS policies, privilege-escalation prevention,
--              auth triggers, and role-based access control.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Helper Function: is_admin()
-- ----------------------------------------------------------------------------
-- Security definer function to inspect role without RLS policy loops.
-- Explicit search_path prevents schema-injection attacks.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- 2. Prevent Privilege Escalation (Role Tampering Protection)
-- ----------------------------------------------------------------------------
-- Ensures that students cannot modify their own or any other user's role to 'admin'.
CREATE OR REPLACE FUNCTION public.prevent_profile_role_tampering()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Allow database administrators, postgres superuser, or existing admins
    IF current_user IN ('postgres', 'supabase_admin') OR public.is_admin() THEN
      RETURN NEW;
    END IF;

    RAISE EXCEPTION 'Unauthorized: Modifying account role is forbidden.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_prevent_role_tampering
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_tampering();

-- ----------------------------------------------------------------------------
-- 3. Automatic Profile Provisioning on User Signup
-- ----------------------------------------------------------------------------
-- Automatically creates a student profile when a user signs up via Supabase Auth.
-- Role defaults strictly to 'student'. Admin accounts must be promoted explicitly.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger attached to auth.users (Supabase Auth)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 4. Enable Row Level Security (RLS) on All Tables
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subject_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_subject_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conflict_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 5. RLS Policies: Profiles
-- ----------------------------------------------------------------------------
-- Students can view their own profile; Admins can view all profiles.
CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

-- Students can update permitted fields of their own profile.
-- (Role changes are blocked by trigger_prevent_role_tampering)
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins have full access to manage profiles.
CREATE POLICY "profiles_admin_all"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 6. RLS Policies: Academic Structure (Classes, Subjects, Assignments)
-- ----------------------------------------------------------------------------
-- Read-only for authenticated students and staff; Full control for Admins.

-- Classes
CREATE POLICY "classes_select_authenticated"
  ON public.classes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "classes_admin_manage"
  ON public.classes
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Subjects
CREATE POLICY "subjects_select_authenticated"
  ON public.subjects
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "subjects_admin_manage"
  ON public.subjects
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Class-Subject Assignments
CREATE POLICY "assignments_select_authenticated"
  ON public.class_subject_assignments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "assignments_admin_manage"
  ON public.class_subject_assignments
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 7. RLS Policies: Exam Rooms & Sessions
-- ----------------------------------------------------------------------------
-- Exam Rooms
CREATE POLICY "rooms_select_authenticated"
  ON public.exam_rooms
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "rooms_admin_manage"
  ON public.exam_rooms
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Exam Sessions
CREATE POLICY "sessions_select_authenticated"
  ON public.exam_sessions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "sessions_admin_manage"
  ON public.exam_sessions
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 8. RLS Policies: Exam Timetables
-- ----------------------------------------------------------------------------
-- Students can only view PUBLISHED timetables for subjects they are enrolled in.
CREATE POLICY "timetables_select_published_enrolled"
  ON public.exam_timetables
  FOR SELECT
  TO authenticated
  USING (
    is_published = true
    AND (
      EXISTS (
        SELECT 1
        FROM public.student_subject_enrollments
        WHERE student_subject_enrollments.student_id = auth.uid()
          AND student_subject_enrollments.subject_id = exam_timetables.subject_id
      )
      OR public.is_admin()
    )
  );

-- Admins can view all timetables (drafts, unpublished, scheduled) and modify them.
CREATE POLICY "timetables_admin_manage"
  ON public.exam_timetables
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 9. RLS Policies: Student Subject Enrollments
-- ----------------------------------------------------------------------------
-- Students can only view their own enrollments.
CREATE POLICY "enrollments_select_own"
  ON public.student_subject_enrollments
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid() OR public.is_admin());

CREATE POLICY "enrollments_admin_manage"
  ON public.student_subject_enrollments
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 10. RLS Policies: Student Notifications
-- ----------------------------------------------------------------------------
-- Students can read their own notifications.
CREATE POLICY "notifications_select_own"
  ON public.student_notifications
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid() OR public.is_admin());

-- Students can mark their own notifications as read.
CREATE POLICY "notifications_update_own"
  ON public.student_notifications
  FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "notifications_admin_manage"
  ON public.student_notifications
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 11. RLS Policies: Conflict Logs
-- ----------------------------------------------------------------------------
-- Strictly restricted to authorized Administrators.
CREATE POLICY "conflicts_admin_all"
  ON public.conflict_logs
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
