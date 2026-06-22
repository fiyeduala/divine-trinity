# Supabase Setup — Divine Trinity Fertility Clinic

## 1. Create a Supabase project

Go to https://supabase.com → New project. Choose a strong database password and a region close to your users.

## 2. Get your credentials

Dashboard → Settings → API:
- **Project URL** → `VITE_SUPABASE_URL`
- **anon / public key** → `VITE_SUPABASE_ANON_KEY`

Copy `.env.local.example` to `.env.local` and fill in both values.

## 3. Run the migrations (in order)

Open **SQL Editor** in your Supabase dashboard and run each file in order:

```
supabase/migrations/001_schema.sql   ← enums, tables, functions, triggers
supabase/migrations/002_rls.sql      ← Row-Level Security policies
supabase/migrations/003_seed.sql     ← lab_tests + drugs catalog
```

Paste each file's contents and click **Run**.

## 4. Create the first superadmin

1. Go to **Authentication → Users → Add user** (invite).
2. Enter an email + password for the admin account.
3. Copy the UUID from the user list.
4. In **SQL Editor**, run:

```sql
INSERT INTO profiles (id, full_name, role)
VALUES ('<uuid-from-step-2>', 'Admin User', 'superadmin');
```

## 5. Create additional staff users

For each staff member:

1. **Authentication → Users → Add user** (invite).
2. In SQL Editor:

```sql
-- Receptionist / Nurse / Lab Tech
INSERT INTO profiles (id, full_name, role)
VALUES ('<uuid>', 'Staff Name', 'receptionist');  -- or nurse / lab_tech

-- Doctor (must have a room 1–3)
INSERT INTO profiles (id, full_name, role, consultation_room)
VALUES ('<uuid>', 'Dr. Eze', 'doctor', 1);
```

## 6. Start the app

```bash
npm run dev
```

Navigate to http://localhost:5173 → login with the admin email/password you set up.

---

## State machine (patient.status)

```
draft → registered → [PENDING: cashier gate] → in_triage
  → ready_for_consultation → in_consultation
  → awaiting_lab → lab_in_progress → results_ready
  → back to in_consultation → completed
```

## Storage bucket (Phase 5 — lab result files)

Create a bucket named `lab-results` in Storage. Set it to private. The app uses signed URLs.
