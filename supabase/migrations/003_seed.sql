-- ============================================================
-- Divine Trinity Fertility Clinic — Seed Data Migration 003
-- Run AFTER 002_rls.sql.
-- ============================================================

-- Lab test catalog (required 5 per spec)
INSERT INTO lab_tests (name, code, price) VALUES
  ('Couples Test',                  'CT-001',  25000.00),
  ('AMH (Anti-Müllerian Hormone)',  'AMH-001', 18000.00),
  ('SFA (Semen Fluid Analysis)',    'SFA-001',  8000.00),
  ('Hysteroscopy',                  'HSC-001', 45000.00),
  ('TVS (Transvaginal Scan)',       'TVS-001', 15000.00);

-- Drug catalog (~8 fertility-relevant drugs with prices in Naira)
INSERT INTO drugs (name, unit_price) VALUES
  ('Clomiphene Citrate 50mg',       2500.00),
  ('Progesterone 200mg (Cyclogest)',3500.00),
  ('Folic Acid 5mg',                 500.00),
  ('Metformin 500mg',               1200.00),
  ('Myo-Inositol 2g',               4500.00),
  ('Vitamin D3 1000IU',              800.00),
  ('Letrozole 2.5mg',               3000.00),
  ('Gonal-F 75IU (FSH injection)',  35000.00);

-- ============================================================
-- FIRST SUPERADMIN SETUP
-- ============================================================
-- 1. Go to Supabase → Authentication → Users → "Add user"
-- 2. Create the user with an email + password.
-- 3. Copy the UUID from the users table.
-- 4. Run this INSERT (replace the UUID):
--
--   INSERT INTO profiles (id, full_name, role)
--   VALUES ('<paste-auth-user-uuid-here>', 'Admin User', 'superadmin');
--
-- To create more staff, either:
--   a) Use the Superadmin UI (Phase 7 adds a staff management screen), OR
--   b) Repeat: create auth user → insert profile row with desired role.
--      For doctors, also set consultation_room (1, 2, or 3).
-- ============================================================
