-- ============================================================
-- Divine Trinity Fertility Clinic — Demo Data Cleanup (005)
-- Run this in Supabase → SQL Editor when you are ready to go live.
--
-- What this does NOT touch:
--   ✓ Staff profiles (all your accounts stay)
--   ✓ Drugs catalog
--   ✓ Lab tests catalog
--   ✓ Audit log
--
-- The patient code counter (DTF-2026-####) resets to 0001 automatically
-- because generate_patient_code() uses MAX() — no sequence to reset.
-- ============================================================

-- ── OPTION A: Remove only the demo seed patients ─────────────────
-- Use this if you created real/test patients you want to keep.
-- Cascades automatically to: vitals, consultations, prescriptions,
-- lab_orders, charges, payments.

DELETE FROM patients
WHERE patient_code LIKE 'DTF-DEMO-%';


-- ── OPTION B: Full wipe — remove ALL patients ────────────────────
-- Use this to start completely fresh (staff and catalog are kept).
-- Comment out Option A above and uncomment this instead.

-- DELETE FROM patients;


-- Verify nothing remains (run as a check after the delete above):
-- SELECT COUNT(*) FROM patients;        -- should be 0 (full wipe) or N (option A kept real patients)
-- SELECT COUNT(*) FROM vitals;          -- should be 0
-- SELECT COUNT(*) FROM consultations;   -- should be 0
-- SELECT COUNT(*) FROM charges;         -- should be 0
-- SELECT COUNT(*) FROM payments;        -- should be 0
