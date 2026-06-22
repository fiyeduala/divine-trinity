-- ============================================================
-- Divine Trinity Fertility Clinic — Schema Migration 001
-- Run this first in your Supabase SQL editor.
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM (
  'superadmin',
  'receptionist',
  'nurse',
  'doctor',
  'lab_tech'
);

CREATE TYPE patient_status AS ENUM (
  'draft',
  'registered',
  'in_triage',
  'ready_for_consultation',
  'in_consultation',
  'awaiting_lab',
  'lab_in_progress',
  'results_ready',
  'completed'
);

CREATE TYPE patient_source AS ENUM ('self_qr', 'receptionist');

CREATE TYPE lab_order_status AS ENUM ('ordered', 'assigned', 'in_progress', 'completed');

CREATE TYPE charge_type AS ENUM ('drug', 'lab_test', 'other');

CREATE TYPE payment_method AS ENUM ('in_app');

-- ============================================================
-- TABLES (order: no FK → FK dependents)
-- ============================================================

-- Staff profiles (1-to-1 with auth.users)
CREATE TABLE profiles (
  id                uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name         text        NOT NULL,
  role              user_role   NOT NULL,
  consultation_room int         CHECK (consultation_room BETWEEN 1 AND 3),
  is_active         bool        NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE profiles IS 'Staff accounts. 1:1 with auth.users. Superadmins create these via the admin panel.';

-- Patients
CREATE TABLE patients (
  id                  uuid            PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_code        text            UNIQUE,           -- DTF-YYYY-####, assigned on registration

  -- Wife / female partner
  wife_surname        text            NOT NULL,
  wife_other_names    text            NOT NULL,
  wife_phone          text            NOT NULL,
  wife_dob            date,
  wife_age            int,
  address             text,
  email               text,
  occupation          text,

  -- Husband / male partner
  husband_surname     text,
  husband_other_names text,
  husband_phone       text,
  husband_email       text,
  husband_age         int,

  religion            text,

  -- Contact / next of kin
  contact_name        text,
  contact_address     text,
  contact_phone       text,
  contact_email       text,

  -- Clinical history
  marital_status      text,
  married_duration    text,
  previous_surgery    text,
  gravida             int             NOT NULL DEFAULT 0,

  -- Workflow
  status              patient_status  NOT NULL DEFAULT 'draft',
  source              patient_source  NOT NULL DEFAULT 'self_qr',

  -- Room routing (set by nurse when advancing to ready_for_consultation)
  assigned_room       int             CHECK (assigned_room BETWEEN 1 AND 3),
  assigned_doctor_id  uuid            REFERENCES profiles(id),

  -- Audit
  created_by          uuid            REFERENCES profiles(id),
  confirmed_by        uuid            REFERENCES profiles(id),
  confirmed_at        timestamptz,
  created_at          timestamptz     NOT NULL DEFAULT now()
);
COMMENT ON COLUMN patients.status IS 'Single source of truth for patient routing. See state machine in README.';
COMMENT ON COLUMN patients.assigned_room IS 'Set by nurse at triage completion; drives doctor queue filter.';

-- Vitals (may be recorded multiple times per visit)
CREATE TABLE vitals (
  id           uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id   uuid        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  bp_systolic  int,
  bp_diastolic int,
  pulse        int,
  weight       numeric(5,2),
  temperature  numeric(4,1),
  perspiration text,
  taken_by     uuid        NOT NULL REFERENCES profiles(id),
  taken_at     timestamptz NOT NULL DEFAULT now()
);

-- Doctor consultations
CREATE TABLE consultations (
  id               uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id       uuid        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id        uuid        NOT NULL REFERENCES profiles(id),
  room             int         NOT NULL CHECK (room BETWEEN 1 AND 3),
  soap_subjective  text,
  soap_objective   text,
  soap_assessment  text,
  soap_plan        text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Lab test catalog
CREATE TABLE lab_tests (
  id        uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name      text        NOT NULL,
  code      text        NOT NULL UNIQUE,
  price     numeric(10,2) NOT NULL,
  is_active bool        NOT NULL DEFAULT true
);
COMMENT ON TABLE lab_tests IS 'Catalog of available lab tests. Seeded in 003_seed.sql.';

-- Lab orders (created by doctor, assigned by nurse, worked by lab_tech)
CREATE TABLE lab_orders (
  id              uuid              PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      uuid              NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consultation_id uuid              REFERENCES consultations(id),
  lab_test_id     uuid              NOT NULL REFERENCES lab_tests(id),

  ordered_by      uuid              NOT NULL REFERENCES profiles(id),
  status          lab_order_status  NOT NULL DEFAULT 'ordered',

  assigned_by     uuid              REFERENCES profiles(id),
  lab_tech_id     uuid              REFERENCES profiles(id),

  result_notes    text,
  result_file_url text,             -- Supabase Storage path

  ordered_at      timestamptz       NOT NULL DEFAULT now(),
  assigned_at     timestamptz,
  completed_at    timestamptz
);
COMMENT ON TABLE lab_orders IS 'A charge row is auto-created via trigger when a lab_order is inserted.';

-- Drug catalog
CREATE TABLE drugs (
  id         uuid          PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       text          NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  is_active  bool          NOT NULL DEFAULT true
);
COMMENT ON TABLE drugs IS 'In-house pharmacy catalog. Seeded in 003_seed.sql.';

-- Prescriptions
CREATE TABLE prescriptions (
  id                  uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id          uuid        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consultation_id     uuid        REFERENCES consultations(id),
  drug_id             uuid        NOT NULL REFERENCES drugs(id),
  quantity            int         NOT NULL DEFAULT 1,
  unit_price_at_time  numeric(10,2) NOT NULL,
  prescribed_by       uuid        NOT NULL REFERENCES profiles(id),
  created_at          timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE prescriptions IS 'A charge row is auto-created via trigger when a prescription is inserted.';

-- Charges ledger (folder balance = SUM(amount) - SUM(payments))
CREATE TABLE charges (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id  uuid        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  type        charge_type NOT NULL,
  description text        NOT NULL,
  amount      numeric(10,2) NOT NULL,
  related_id  uuid,                -- FK to lab_orders.id or prescriptions.id
  created_by  uuid        REFERENCES profiles(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Payments (recorded by receptionist / cashier)
CREATE TABLE payments (
  id          uuid           PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id  uuid           NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  amount      numeric(10,2)  NOT NULL,
  method      payment_method NOT NULL DEFAULT 'in_app',
  recorded_by uuid           NOT NULL REFERENCES profiles(id),
  note        text,
  created_at  timestamptz    NOT NULL DEFAULT now()
);

-- Audit log
CREATE TABLE audit_log (
  id         uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id   uuid        REFERENCES profiles(id),
  action     text        NOT NULL,
  entity     text        NOT NULL,
  entity_id  uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- HELPER FUNCTIONS (SECURITY DEFINER bypasses RLS — no recursion)
-- ============================================================

-- Returns the role of the currently authenticated user
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- Returns the consultation_room of the current doctor (null for other roles)
CREATE OR REPLACE FUNCTION get_my_room()
RETURNS int
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT consultation_room FROM profiles WHERE id = auth.uid();
$$;

-- Generates the next DTF-YYYY-#### patient code (safe for demo concurrency levels)
CREATE OR REPLACE FUNCTION generate_patient_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  year_str text := to_char(CURRENT_DATE, 'YYYY');
  next_num int;
BEGIN
  SELECT COALESCE(
    MAX(CAST(SPLIT_PART(patient_code, '-', 3) AS int)), 0
  ) + 1
  INTO next_num
  FROM patients
  WHERE patient_code LIKE 'DTF-' || year_str || '-%';

  RETURN 'DTF-' || year_str || '-' || LPAD(next_num::text, 4, '0');
END;
$$;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create a charge when a lab_order is inserted
CREATE OR REPLACE FUNCTION _trg_charge_for_lab_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_name  text;
  v_price numeric;
BEGIN
  SELECT name, price INTO v_name, v_price FROM lab_tests WHERE id = NEW.lab_test_id;
  INSERT INTO charges (patient_id, type, description, amount, related_id, created_by)
  VALUES (NEW.patient_id, 'lab_test', 'Lab: ' || v_name, v_price, NEW.id, NEW.ordered_by);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_charge_for_lab_order
  AFTER INSERT ON lab_orders
  FOR EACH ROW EXECUTE FUNCTION _trg_charge_for_lab_order();

-- Auto-create a charge when a prescription is inserted
CREATE OR REPLACE FUNCTION _trg_charge_for_prescription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_name text;
BEGIN
  SELECT name INTO v_name FROM drugs WHERE id = NEW.drug_id;
  INSERT INTO charges (patient_id, type, description, amount, related_id, created_by)
  VALUES (
    NEW.patient_id,
    'drug',
    'Drug: ' || v_name || ' ×' || NEW.quantity,
    NEW.unit_price_at_time * NEW.quantity,
    NEW.id,
    NEW.prescribed_by
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_charge_for_prescription
  AFTER INSERT ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION _trg_charge_for_prescription();

-- Keep consultations.updated_at current
CREATE OR REPLACE FUNCTION _trg_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_consultations_updated_at
  BEFORE UPDATE ON consultations
  FOR EACH ROW EXECUTE FUNCTION _trg_set_updated_at();

-- Auto-create profile when Supabase auth user is created
-- (Expects raw_user_meta_data to contain: full_name, role, consultation_room)
CREATE OR REPLACE FUNCTION _trg_handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (NEW.raw_user_meta_data->>'role') IS NOT NULL THEN
    INSERT INTO public.profiles (id, full_name, role, consultation_room)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      (NEW.raw_user_meta_data->>'role')::user_role,
      CASE WHEN (NEW.raw_user_meta_data->>'role') = 'doctor'
           THEN (NEW.raw_user_meta_data->>'consultation_room')::int
           ELSE NULL
      END
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION _trg_handle_new_user();
