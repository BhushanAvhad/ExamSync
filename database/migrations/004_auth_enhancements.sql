-- ============================================================================
-- ExamSync Database Foundation — Auth Enhancements & Profile Fallback Policy
-- Migration: 004_auth_enhancements.sql
-- Description: Adds fallback policy for profile self-initialization.
--              Strictly guards role = 'student' to prevent privilege escalation.
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'profiles_insert_own'
  ) THEN
    CREATE POLICY "profiles_insert_own"
      ON public.profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id AND role = 'student');
  END IF;
END $$;
