-- ============================================================
-- Divine Trinity Fertility Clinic — RLS Policies Migration 002
-- Run AFTER 001_schema.sql.
-- ============================================================

-- Enable RLS on every table
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients    ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals      ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_tests   ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_orders  ENABLE ROW LEVEL SECURITY;
ALTER TABLE drugs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE charges     ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log   ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES
-- ============================================================

-- All authenticated users can read any profile (needed for lookups: doctor name, lab tech, etc.)
CREATE POLICY "profiles_read_authenticated"
  ON profiles FOR SELECT TO authenticated
  USING (true);

-- Users can update their own non-sensitive profile fields
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Superadmin: full control (insert new staff, deactivate, change roles)
CREATE POLICY "profiles_superadmin_all"
  ON profiles FOR ALL TO authenticated
  USING (get_my_role() = 'superadmin')
  WITH CHECK (get_my_role() = 'superadmin');

-- ============================================================
-- PATIENTS
-- ============================================================

-- ANON: insert draft records only (QR self-registration)
-- PRODUCTION NOTE: add rate-limiting / captcha at the API/edge layer before this insert.
CREATE POLICY "patients_anon_insert_draft"
  ON patients FOR INSERT TO anon
  WITH CHECK (status = 'draft' AND source = 'self_qr');

-- SUPERADMIN: full access
CREATE POLICY "patients_superadmin_all"
  ON patients FOR ALL TO authenticated
  USING (get_my_role() = 'superadmin')
  WITH CHECK (get_my_role() = 'superadmin');

-- RECEPTIONIST: full read, insert (own registrations), update (confirm/edit)
CREATE POLICY "patients_receptionist_select"
  ON patients FOR SELECT TO authenticated
  USING (get_my_role() = 'receptionist');

CREATE POLICY "patients_receptionist_insert"
  ON patients FOR INSERT TO authenticated
  WITH CHECK (get_my_role() = 'receptionist');

CREATE POLICY "patients_receptionist_update"
  ON patients FOR UPDATE TO authenticated
  USING (get_my_role() = 'receptionist')
  WITH CHECK (get_my_role() = 'receptionist');

-- NURSE: read patients in triage stages; update to advance status
CREATE POLICY "patients_nurse_select"
  ON patients FOR SELECT TO authenticated
  USING (
    get_my_role() = 'nurse'
    AND status IN ('registered', 'in_triage', 'ready_for_consultation', 'awaiting_lab')
  );

CREATE POLICY "patients_nurse_update"
  ON patients FOR UPDATE TO authenticated
  USING (get_my_role() = 'nurse')
  WITH CHECK (get_my_role() = 'nurse');

-- DOCTOR: read patients assigned to their room or by them
CREATE POLICY "patients_doctor_select"
  ON patients FOR SELECT TO authenticated
  USING (
    get_my_role() = 'doctor'
    AND (
      assigned_room = get_my_room()
      OR assigned_doctor_id = auth.uid()
    )
  );

CREATE POLICY "patients_doctor_update"
  ON patients FOR UPDATE TO authenticated
  USING (
    get_my_role() = 'doctor'
    AND (assigned_room = get_my_room() OR assigned_doctor_id = auth.uid())
  )
  WITH CHECK (get_my_role() = 'doctor');

-- LAB TECH: read patients they have assigned orders for
CREATE POLICY "patients_lab_tech_select"
  ON patients FOR SELECT TO authenticated
  USING (
    get_my_role() = 'lab_tech'
    AND EXISTS (
      SELECT 1 FROM lab_orders
      WHERE lab_orders.patient_id = patients.id
        AND lab_orders.lab_tech_id = auth.uid()
    )
  );

-- ============================================================
-- VITALS
-- ============================================================

CREATE POLICY "vitals_superadmin"
  ON vitals FOR ALL TO authenticated
  USING (get_my_role() = 'superadmin')
  WITH CHECK (get_my_role() = 'superadmin');

CREATE POLICY "vitals_nurse_all"
  ON vitals FOR ALL TO authenticated
  USING (get_my_role() = 'nurse')
  WITH CHECK (get_my_role() = 'nurse');

-- Receptionist can record vitals as fallback
CREATE POLICY "vitals_receptionist_all"
  ON vitals FOR ALL TO authenticated
  USING (get_my_role() = 'receptionist')
  WITH CHECK (get_my_role() = 'receptionist');

-- Doctor can read vitals for their patients
CREATE POLICY "vitals_doctor_read"
  ON vitals FOR SELECT TO authenticated
  USING (
    get_my_role() = 'doctor'
    AND EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = vitals.patient_id
        AND (patients.assigned_room = get_my_room() OR patients.assigned_doctor_id = auth.uid())
    )
  );

-- ============================================================
-- CONSULTATIONS
-- ============================================================

CREATE POLICY "consultations_superadmin"
  ON consultations FOR ALL TO authenticated
  USING (get_my_role() = 'superadmin')
  WITH CHECK (get_my_role() = 'superadmin');

-- Doctor: CRUD their own consultations
CREATE POLICY "consultations_doctor_own"
  ON consultations FOR ALL TO authenticated
  USING (
    get_my_role() = 'doctor'
    AND doctor_id = auth.uid()
  )
  WITH CHECK (
    get_my_role() = 'doctor'
    AND doctor_id = auth.uid()
  );

-- Receptionist + nurse: read only
CREATE POLICY "consultations_staff_read"
  ON consultations FOR SELECT TO authenticated
  USING (get_my_role() IN ('receptionist', 'nurse'));

-- ============================================================
-- LAB_TESTS (catalog — read for all authenticated, manage for superadmin)
-- ============================================================

CREATE POLICY "lab_tests_read_all"
  ON lab_tests FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "lab_tests_superadmin_write"
  ON lab_tests FOR ALL TO authenticated
  USING (get_my_role() = 'superadmin')
  WITH CHECK (get_my_role() = 'superadmin');

-- ============================================================
-- LAB_ORDERS
-- ============================================================

CREATE POLICY "lab_orders_superadmin"
  ON lab_orders FOR ALL TO authenticated
  USING (get_my_role() = 'superadmin')
  WITH CHECK (get_my_role() = 'superadmin');

-- Doctor: insert and read their own orders
CREATE POLICY "lab_orders_doctor_own"
  ON lab_orders FOR ALL TO authenticated
  USING (
    get_my_role() = 'doctor'
    AND ordered_by = auth.uid()
  )
  WITH CHECK (
    get_my_role() = 'doctor'
    AND ordered_by = auth.uid()
  );

-- Nurse: read ordered (unassigned) + update to assign
CREATE POLICY "lab_orders_nurse_select"
  ON lab_orders FOR SELECT TO authenticated
  USING (get_my_role() = 'nurse');

CREATE POLICY "lab_orders_nurse_update"
  ON lab_orders FOR UPDATE TO authenticated
  USING (get_my_role() = 'nurse')
  WITH CHECK (get_my_role() = 'nurse');

-- Lab tech: read + update their assigned orders
CREATE POLICY "lab_orders_lab_tech_select"
  ON lab_orders FOR SELECT TO authenticated
  USING (
    get_my_role() = 'lab_tech'
    AND lab_tech_id = auth.uid()
  );

CREATE POLICY "lab_orders_lab_tech_update"
  ON lab_orders FOR UPDATE TO authenticated
  USING (
    get_my_role() = 'lab_tech'
    AND lab_tech_id = auth.uid()
  )
  WITH CHECK (
    get_my_role() = 'lab_tech'
    AND lab_tech_id = auth.uid()
  );

-- ============================================================
-- DRUGS (catalog)
-- ============================================================

CREATE POLICY "drugs_read_all"
  ON drugs FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "drugs_superadmin_write"
  ON drugs FOR ALL TO authenticated
  USING (get_my_role() = 'superadmin')
  WITH CHECK (get_my_role() = 'superadmin');

-- ============================================================
-- PRESCRIPTIONS
-- ============================================================

CREATE POLICY "prescriptions_superadmin"
  ON prescriptions FOR ALL TO authenticated
  USING (get_my_role() = 'superadmin')
  WITH CHECK (get_my_role() = 'superadmin');

CREATE POLICY "prescriptions_doctor_own"
  ON prescriptions FOR ALL TO authenticated
  USING (
    get_my_role() = 'doctor'
    AND prescribed_by = auth.uid()
  )
  WITH CHECK (
    get_my_role() = 'doctor'
    AND prescribed_by = auth.uid()
  );

CREATE POLICY "prescriptions_receptionist_read"
  ON prescriptions FOR SELECT TO authenticated
  USING (get_my_role() = 'receptionist');

-- ============================================================
-- CHARGES
-- ============================================================

CREATE POLICY "charges_superadmin"
  ON charges FOR ALL TO authenticated
  USING (get_my_role() = 'superadmin')
  WITH CHECK (get_my_role() = 'superadmin');

-- Receptionist (cashier): full read; insert manual 'other' charges
CREATE POLICY "charges_receptionist_all"
  ON charges FOR ALL TO authenticated
  USING (get_my_role() = 'receptionist')
  WITH CHECK (get_my_role() = 'receptionist');

-- Doctor: read charges for their patients
CREATE POLICY "charges_doctor_read"
  ON charges FOR SELECT TO authenticated
  USING (
    get_my_role() = 'doctor'
    AND EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = charges.patient_id
        AND (patients.assigned_room = get_my_room() OR patients.assigned_doctor_id = auth.uid())
    )
  );

-- ============================================================
-- PAYMENTS
-- ============================================================

CREATE POLICY "payments_superadmin"
  ON payments FOR ALL TO authenticated
  USING (get_my_role() = 'superadmin')
  WITH CHECK (get_my_role() = 'superadmin');

CREATE POLICY "payments_receptionist_all"
  ON payments FOR ALL TO authenticated
  USING (get_my_role() = 'receptionist')
  WITH CHECK (get_my_role() = 'receptionist');

-- ============================================================
-- AUDIT_LOG
-- ============================================================

CREATE POLICY "audit_superadmin_read"
  ON audit_log FOR SELECT TO authenticated
  USING (get_my_role() = 'superadmin');

-- Any authenticated user can insert into audit log (app writes on actions)
CREATE POLICY "audit_insert_authenticated"
  ON audit_log FOR INSERT TO authenticated
  WITH CHECK (true);
