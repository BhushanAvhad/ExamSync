# ExamSync Database Migrations & Supabase Foundation

This directory contains version-controlled, production-grade PostgreSQL migration scripts and schema definitions for the **ExamSync** platform.

---

## Migration Index

| Order | File | Description |
|---|---|---|
| 1 | [`001_initial_schema.sql`](./migrations/001_initial_schema.sql) | Core entities: `profiles`, `classes`, `subjects`, `class_subject_assignments`, `exam_rooms`, `exam_sessions`, `exam_timetables`, `student_subject_enrollments`, `student_notifications`, and `conflict_logs`, along with check constraints, foreign keys, and indexes. |
| 2 | [`002_security_rls.sql`](./migrations/002_security_rls.sql) | Row Level Security (RLS) activation on all tables, `public.is_admin()` security definer function, role-tampering triggers, automatic profile sync trigger on `auth.users`, and granular student/admin access policies. |
| 3 | [`003_seed_data.sql`](./migrations/003_seed_data.sql) | *(Optional / Development only)* Fictional institutional catalog for Vidyalankar Institute of Technology (VIT) (`FEC101`, `CSC501`, Blocks A, B, C, F, M) for local and staging environments with RFC-compliant UUIDs. |
| 4 | [`004_auth_enhancements.sql`](./migrations/004_auth_enhancements.sql) | *(Optional / Hardening)* Fallback profile insertion policy ensuring authenticated users can self-initialize student records if signup triggers are deferred. |
| 5 | [`005_vit_academic_seed.sql`](./migrations/005_vit_academic_seed.sql) | Comprehensive idempotent seed data for VIT academic structure: FE, SE, TE, and BE cohorts across CMPN, INFT, EXTC, ECS, and BIOM departments, curriculum subjects, room allocations, and exam session definitions (`ON CONFLICT DO NOTHING`). |

---

## Deployment Instructions

### Prerequisites
1. Access to your Supabase Project Dashboard (`https://app.supabase.com/project/<your-project-id>`)
2. Navigate to **SQL Editor** in the left navigation sidebar.

### Step 1: Run Initial Schema Migration
1. Open the SQL Editor and click **+ New query**.
2. Copy the entire content of [`migrations/001_initial_schema.sql`](./migrations/001_initial_schema.sql).
3. Paste into the editor and click **Run** (Ctrl + Enter).
4. Verify all tables and indexes are successfully created in the **Table Editor**.

### Step 2: Run Security & Row Level Security Migration
1. Open a new query window in the SQL Editor.
2. Copy the entire content of [`migrations/002_security_rls.sql`](./migrations/002_security_rls.sql).
3. Paste into the editor and click **Run**.
4. Verify RLS is enabled on all tables in **Authentication > Policies**.

### Step 3: Provision the Initial Institutional Administrator
By design, there is **no public admin registration** to prevent privilege escalation. When the first administrator account signs up or is created in Supabase Auth, promote it securely using the SQL Editor:

```sql
-- 1. Create the user via Supabase Dashboard (Authentication > Users > Add user)
-- 2. Run this query in the SQL Editor to grant admin role:
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@vit.edu.in'; -- Replace with the administrator's email
```

### Step 4: (Optional) Apply Development Seed Data
For non-production development environments only:
1. Open a new query window in the SQL Editor.
2. Copy and execute [`migrations/003_seed_data.sql`](./migrations/003_seed_data.sql).
