-- ============================================================
-- Divine Trinity Fertility Clinic — Demo Seed Data (004)
-- Run AFTER migrations 001–003 and AFTER creating the superadmin
-- profile. Safe to run multiple times (deletes and re-inserts by ID).
-- ============================================================

DO $$
DECLARE
  admin_id    uuid;
  drug1_id    uuid;   -- Clomiphene Citrate
  drug2_id    uuid;   -- Progesterone
  drug3_id    uuid;   -- Folic Acid
  test1_id    uuid;   -- Couples Test
  test2_id    uuid;   -- TVS
  test3_id    uuid;   -- SFA

  -- Fixed patient UUIDs for idempotency
  p1 uuid := 'a1000001-0000-0000-0000-000000000001';
  p2 uuid := 'a1000002-0000-0000-0000-000000000002';
  p3 uuid := 'a1000003-0000-0000-0000-000000000003';
  p4 uuid := 'a1000004-0000-0000-0000-000000000004';
  p5 uuid := 'a1000005-0000-0000-0000-000000000005';
  p6 uuid := 'a1000006-0000-0000-0000-000000000006';
  p7 uuid := 'a1000007-0000-0000-0000-000000000007';
  p8 uuid := 'a1000008-0000-0000-0000-000000000008';

  c6 uuid := 'c6000006-0000-0000-0000-000000000006';
  c7 uuid := 'c7000007-0000-0000-0000-000000000007';
  c8 uuid := 'c8000008-0000-0000-0000-000000000008';
BEGIN
  -- Guard: skip if no superadmin profile exists yet
  SELECT id INTO admin_id FROM profiles WHERE role = 'superadmin' LIMIT 1;
  IF admin_id IS NULL THEN
    RAISE NOTICE 'Demo seed: no superadmin profile found — create one first, then re-run this script.';
    RETURN;
  END IF;

  -- Look up catalog items (handles missing data gracefully)
  SELECT id INTO drug1_id FROM drugs WHERE name ILIKE '%Clomiphene%'   LIMIT 1;
  SELECT id INTO drug2_id FROM drugs WHERE name ILIKE '%Progesterone%' LIMIT 1;
  SELECT id INTO drug3_id FROM drugs WHERE name ILIKE '%Folic%'        LIMIT 1;
  SELECT id INTO test1_id FROM lab_tests WHERE name ILIKE '%Couples%'  LIMIT 1;
  SELECT id INTO test2_id FROM lab_tests WHERE name ILIKE '%TVS%' OR name ILIKE '%Transvaginal%' LIMIT 1;
  SELECT id INTO test3_id FROM lab_tests WHERE name ILIKE '%SFA%' OR name ILIKE '%Semen%'        LIMIT 1;

  -- Clean up previous demo run (cascades to vitals, consultations, etc.)
  DELETE FROM patients WHERE id IN (p1,p2,p3,p4,p5,p6,p7,p8);

  -- ── Active patients (today — for live queue & stage distribution) ─────────

  -- p1: registered — just arrived
  INSERT INTO patients
    (id, patient_code, wife_surname, wife_other_names, wife_phone, status, source, created_at)
  VALUES
    (p1, 'DTF-DEMO-001', 'Adeyemi', 'Folasade Adunola', '08032110001',
     'registered', 'receptionist', NOW() - INTERVAL '1 hour 20 minutes');

  -- p2: in_triage — nurse is recording vitals
  INSERT INTO patients
    (id, patient_code, wife_surname, wife_other_names, wife_phone, husband_surname, husband_other_names, status, source, created_at)
  VALUES
    (p2, 'DTF-DEMO-002', 'Okafor', 'Ngozi Chioma', '08063210002', 'Okafor', 'Chukwuemeka',
     'in_triage', 'receptionist', NOW() - INTERVAL '2 hours 15 minutes');

  -- p3: ready_for_consultation — vitals done, waiting for doctor
  INSERT INTO patients
    (id, patient_code, wife_surname, wife_other_names, wife_phone, husband_surname, husband_other_names,
     status, source, assigned_room, created_at)
  VALUES
    (p3, 'DTF-DEMO-003', 'Ibrahim', 'Fatima Hauwa', '08071230003', 'Ibrahim', 'Musa',
     'ready_for_consultation', 'receptionist', 1, NOW() - INTERVAL '3 hours');

  INSERT INTO vitals (patient_id, bp_systolic, bp_diastolic, pulse, weight, temperature, perspiration, taken_by)
  VALUES (p3, 118, 76, 72, 58.0, 36.7, 'none', admin_id);

  -- p4: in_consultation — currently with doctor
  INSERT INTO patients
    (id, patient_code, wife_surname, wife_other_names, wife_phone, husband_surname, husband_other_names,
     status, source, assigned_room, created_at)
  VALUES
    (p4, 'DTF-DEMO-004', 'Makinde', 'Temitope Blessing', '08024560004', 'Makinde', 'Oluwaseun',
     'in_consultation', 'receptionist', 2, NOW() - INTERVAL '4 hours 10 minutes');

  INSERT INTO vitals (patient_id, bp_systolic, bp_diastolic, pulse, weight, temperature, perspiration, taken_by)
  VALUES (p4, 125, 80, 78, 62.5, 37.0, 'minimal', admin_id);

  -- p5: awaiting_lab — consultation done, waiting for lab tech assignment
  INSERT INTO patients
    (id, patient_code, wife_surname, wife_other_names, wife_phone, husband_surname, husband_other_names,
     status, source, assigned_room, created_at)
  VALUES
    (p5, 'DTF-DEMO-005', 'Aliyu', 'Hadiza Fatima', '08055670005', 'Aliyu', 'Abubakar',
     'awaiting_lab', 'self_qr', 1, NOW() - INTERVAL '5 hours');

  INSERT INTO vitals (patient_id, bp_systolic, bp_diastolic, pulse, weight, temperature, perspiration, taken_by)
  VALUES (p5, 130, 85, 82, 70.0, 37.2, 'mild', admin_id);

  -- ── Historical completed patients (for weekly charts) ────────────────────

  -- p6: completed yesterday — full data trail
  INSERT INTO patients
    (id, patient_code, wife_surname, wife_other_names, wife_phone, husband_surname, husband_other_names,
     status, source, assigned_room, created_at)
  VALUES
    (p6, 'DTF-DEMO-006', 'Nwachukwu', 'Obiageli Ada', '08011230006', 'Nwachukwu', 'Chinedu',
     'completed', 'receptionist', 1, NOW() - INTERVAL '1 day 5 hours');

  INSERT INTO vitals (patient_id, bp_systolic, bp_diastolic, pulse, weight, temperature, perspiration, taken_by)
  VALUES (p6, 120, 78, 74, 65.0, 36.8, 'none', admin_id);

  INSERT INTO consultations (id, patient_id, doctor_id, room, soap_subjective, soap_objective, soap_assessment, soap_plan, created_at, updated_at)
  VALUES (c6, p6, admin_id, 1,
    'Patient presents with 3 years of primary infertility. Cycles regular at 28 days, no prior pregnancies. Husband previously evaluated elsewhere with normal SFA.',
    'Vitals stable. BMI 23.1. No obvious hormonal signs on exam. Pelvic exam normal.',
    'Unexplained primary infertility. No ovulatory dysfunction detected. Hormonal workup indicated.',
    'Start Clomiphene Citrate 50mg D3–D7. Repeat TVS on Day 12 to confirm ovulation. Couples test ordered. Lifestyle: folic acid supplementation.',
    NOW() - INTERVAL '1 day 4 hours', NOW() - INTERVAL '1 day 3 hours 30 minutes');

  IF drug1_id IS NOT NULL THEN
    INSERT INTO prescriptions (patient_id, consultation_id, drug_id, quantity, unit_price_at_time, prescribed_by)
    VALUES (p6, c6, drug1_id, 10, 2500, admin_id);
  END IF;

  IF drug3_id IS NOT NULL THEN
    INSERT INTO prescriptions (patient_id, consultation_id, drug_id, quantity, unit_price_at_time, prescribed_by)
    VALUES (p6, c6, drug3_id, 30, 500, admin_id);
  END IF;

  IF test1_id IS NOT NULL THEN
    INSERT INTO lab_orders (patient_id, consultation_id, lab_test_id, ordered_by, status,
      assigned_by, lab_tech_id, result_notes, ordered_at, assigned_at, completed_at)
    VALUES (p6, c6, test1_id, admin_id, 'completed', admin_id, admin_id,
      'Couples test complete. AMH: 1.2 ng/mL (borderline low). FSH: 7.4 mIU/mL (normal). AFC: 6 follicles bilateral. Husband SFA: normal morphology, mild oligospermia (12M/mL).',
      NOW() - INTERVAL '1 day 3 hours', NOW() - INTERVAL '1 day 2 hours 30 minutes', NOW() - INTERVAL '1 day 1 hour 30 minutes');
  END IF;

  INSERT INTO payments (patient_id, amount, method, recorded_by, note, created_at)
  VALUES (p6, 52500, 'in_app', admin_id, 'Full settlement — consultation, Couples Test, Clomiphene x10, Folic Acid x30', NOW() - INTERVAL '1 day 2 hours');

  -- p7: completed 2 days ago
  INSERT INTO patients
    (id, patient_code, wife_surname, wife_other_names, wife_phone, husband_surname, husband_other_names,
     status, source, assigned_room, created_at)
  VALUES
    (p7, 'DTF-DEMO-007', 'Eze', 'Chidinma Precious', '08076540007', 'Eze', 'Kenechukwu',
     'completed', 'receptionist', 2, NOW() - INTERVAL '2 days 4 hours');

  INSERT INTO vitals (patient_id, bp_systolic, bp_diastolic, pulse, weight, temperature, perspiration, taken_by)
  VALUES (p7, 110, 70, 68, 55.5, 36.5, 'none', admin_id);

  INSERT INTO consultations (id, patient_id, doctor_id, room, soap_subjective, soap_objective, soap_assessment, soap_plan, created_at, updated_at)
  VALUES (c7, p7, admin_id, 2,
    'Follow-up visit. Previous Letrozole cycle — no confirmed ovulation on tracking. Husband SFA done 3 months ago: mild oligoasthenospermia.',
    'Vitals stable. Weight unchanged. No cycle irregularity.',
    'Anovulatory infertility, likely PCOS phenotype. Escalating ovulation induction protocol.',
    'Switch to Gonal-F 75IU with nurse-supervised injection schedule. Baseline TVS on D2. Monitor D8, D11.',
    NOW() - INTERVAL '2 days 3 hours', NOW() - INTERVAL '2 days 3 hours');

  IF drug2_id IS NOT NULL THEN
    INSERT INTO prescriptions (patient_id, consultation_id, drug_id, quantity, unit_price_at_time, prescribed_by)
    VALUES (p7, c7, drug2_id, 30, 3500, admin_id);
  END IF;

  IF test2_id IS NOT NULL THEN
    INSERT INTO lab_orders (patient_id, consultation_id, lab_test_id, ordered_by, status,
      assigned_by, lab_tech_id, result_notes, ordered_at, assigned_at, completed_at)
    VALUES (p7, c7, test2_id, admin_id, 'completed', admin_id, admin_id,
      'TVS Day 2: AFC 8 follicles bilateral. Endometrial thickness 5mm (early proliferative). No cysts.',
      NOW() - INTERVAL '2 days 2 hours', NOW() - INTERVAL '2 days 1 hour 30 minutes', NOW() - INTERVAL '2 days 45 minutes');
  END IF;

  INSERT INTO payments (patient_id, amount, method, recorded_by, note, created_at)
  VALUES (p7, 120000, 'in_app', admin_id, 'Full payment: consultation, Progesterone x30, TVS', NOW() - INTERVAL '2 days 1 hour 30 minutes');

  -- p8: completed 4 days ago — self-registered via QR
  INSERT INTO patients
    (id, patient_code, wife_surname, wife_other_names, wife_phone, husband_surname, husband_other_names,
     status, source, assigned_room, created_at)
  VALUES
    (p8, 'DTF-DEMO-008', 'Okonkwo', 'Amaka Grace', '08099880008', 'Okonkwo', 'Ifeanyi',
     'completed', 'self_qr', 1, NOW() - INTERVAL '4 days 3 hours');

  INSERT INTO vitals (patient_id, bp_systolic, bp_diastolic, pulse, weight, temperature, perspiration, taken_by)
  VALUES (p8, 122, 79, 76, 68.0, 36.9, 'mild', admin_id);

  INSERT INTO consultations (id, patient_id, doctor_id, room, soap_subjective, soap_objective, soap_assessment, soap_plan, created_at, updated_at)
  VALUES (c8, p8, admin_id, 1,
    'New patient, 34 years. 18 months primary infertility. Husband works offshore, limited conception windows. Self-referred via clinic website.',
    'BMI 26.2. Regular 30-day cycles. No dysmenorrhoea. Husband not present today.',
    'Male factor infertility suspected — absent husband precluded SFA today. Female workup unremarkable.',
    'Couples test (SFA + hormonal panel) booked for next visit when husband available. Lifestyle counseling and folic acid.',
    NOW() - INTERVAL '4 days 2 hours', NOW() - INTERVAL '4 days 2 hours');

  IF test3_id IS NOT NULL THEN
    INSERT INTO lab_orders (patient_id, consultation_id, lab_test_id, ordered_by, status,
      assigned_by, lab_tech_id, result_notes, ordered_at, assigned_at, completed_at)
    VALUES (p8, c8, test3_id, admin_id, 'completed', admin_id, admin_id,
      'SFA deferred — husband not present. Sample to be collected at next visit.',
      NOW() - INTERVAL '4 days 1 hour 30 minutes', NOW() - INTERVAL '4 days 1 hour', NOW() - INTERVAL '4 days 30 minutes');
  END IF;

  IF drug3_id IS NOT NULL THEN
    INSERT INTO prescriptions (patient_id, consultation_id, drug_id, quantity, unit_price_at_time, prescribed_by)
    VALUES (p8, c8, drug3_id, 30, 500, admin_id);
  END IF;

  INSERT INTO payments (patient_id, amount, method, recorded_by, note, created_at)
  VALUES (p8, 15000, 'in_app', admin_id, 'Partial payment — folic acid + consultation. Balance deferred.', NOW() - INTERVAL '4 days 1 hour');

  RAISE NOTICE 'Demo seed complete: 8 patients created (5 active, 3 historical).';
END $$;
