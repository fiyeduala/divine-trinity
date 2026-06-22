// Hand-written DB types matching 001_schema.sql.
// Run `supabase gen types typescript` to regenerate if schema changes.

export type UserRole = 'superadmin' | 'receptionist' | 'nurse' | 'doctor' | 'lab_tech'
export type PatientStatus =
  | 'draft'
  | 'registered'
  | 'in_triage'
  | 'ready_for_consultation'
  | 'in_consultation'
  | 'awaiting_lab'
  | 'lab_in_progress'
  | 'results_ready'
  | 'completed'
export type PatientSource = 'self_qr' | 'receptionist'
export type LabOrderStatus = 'ordered' | 'assigned' | 'in_progress' | 'completed'
export type ChargeType = 'drug' | 'lab_test' | 'other'
export type PaymentMethod = 'in_app'

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  consultation_room: number | null
  is_active: boolean
  created_at: string
}

export interface Patient {
  id: string
  patient_code: string | null
  wife_surname: string
  wife_other_names: string
  wife_phone: string
  wife_dob: string | null
  wife_age: number | null
  address: string | null
  email: string | null
  occupation: string | null
  husband_surname: string | null
  husband_other_names: string | null
  husband_phone: string | null
  husband_email: string | null
  husband_age: number | null
  religion: string | null
  contact_name: string | null
  contact_address: string | null
  contact_phone: string | null
  contact_email: string | null
  marital_status: string | null
  married_duration: string | null
  previous_surgery: string | null
  gravida: number
  status: PatientStatus
  source: PatientSource
  assigned_room: number | null
  assigned_doctor_id: string | null
  created_by: string | null
  confirmed_by: string | null
  confirmed_at: string | null
  created_at: string
}

export interface Vitals {
  id: string
  patient_id: string
  bp_systolic: number | null
  bp_diastolic: number | null
  pulse: number | null
  weight: number | null
  temperature: number | null
  perspiration: string | null
  taken_by: string
  taken_at: string
}

export interface Consultation {
  id: string
  patient_id: string
  doctor_id: string
  room: number
  soap_subjective: string | null
  soap_objective: string | null
  soap_assessment: string | null
  soap_plan: string | null
  created_at: string
  updated_at: string
}

export interface LabTest {
  id: string
  name: string
  code: string
  price: number
  is_active: boolean
}

export interface LabOrder {
  id: string
  patient_id: string
  consultation_id: string | null
  lab_test_id: string
  ordered_by: string
  status: LabOrderStatus
  assigned_by: string | null
  lab_tech_id: string | null
  result_notes: string | null
  result_file_url: string | null
  ordered_at: string
  assigned_at: string | null
  completed_at: string | null
}

export interface Drug {
  id: string
  name: string
  unit_price: number
  is_active: boolean
}

export interface Prescription {
  id: string
  patient_id: string
  consultation_id: string | null
  drug_id: string
  quantity: number
  unit_price_at_time: number
  prescribed_by: string
  created_at: string
}

export interface Charge {
  id: string
  patient_id: string
  type: ChargeType
  description: string
  amount: number
  related_id: string | null
  created_by: string | null
  created_at: string
}

export interface Payment {
  id: string
  patient_id: string
  amount: number
  method: PaymentMethod
  recorded_by: string
  note: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  actor_id: string | null
  action: string
  entity: string
  entity_id: string | null
  created_at: string
}

// Supabase Database generic type (used by createClient<Database>)
export interface Database {
  public: {
    Tables: {
      profiles:      { Row: Profile;      Insert: Omit<Profile, 'created_at'>; Update: Partial<Omit<Profile, 'id'>> }
      patients:      { Row: Patient;      Insert: Partial<Patient> & Pick<Patient, 'wife_surname' | 'wife_other_names' | 'wife_phone'>; Update: Partial<Patient> }
      vitals:        { Row: Vitals;       Insert: Omit<Vitals, 'id' | 'taken_at'> & { taken_at?: string }; Update: Partial<Vitals> }
      consultations: { Row: Consultation; Insert: Omit<Consultation, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Consultation> }
      lab_tests:     { Row: LabTest;      Insert: Omit<LabTest, 'id'>; Update: Partial<LabTest> }
      lab_orders:    { Row: LabOrder;     Insert: Omit<LabOrder, 'id' | 'ordered_at'>; Update: Partial<LabOrder> }
      drugs:         { Row: Drug;         Insert: Omit<Drug, 'id'>; Update: Partial<Drug> }
      prescriptions: { Row: Prescription; Insert: Omit<Prescription, 'id' | 'created_at'>; Update: Partial<Prescription> }
      charges:       { Row: Charge;       Insert: Omit<Charge, 'id' | 'created_at'>; Update: Partial<Charge> }
      payments:      { Row: Payment;      Insert: Omit<Payment, 'id' | 'created_at'>; Update: Partial<Payment> }
      audit_log:     { Row: AuditLog;     Insert: Omit<AuditLog, 'id' | 'created_at'>; Update: never }
    }
    Functions: {
      get_my_role:           { Args: Record<never, never>; Returns: UserRole }
      get_my_room:           { Args: Record<never, never>; Returns: number | null }
      generate_patient_code: { Args: Record<never, never>; Returns: string }
    }
    Enums: {
      user_role:        UserRole
      patient_status:   PatientStatus
      patient_source:   PatientSource
      lab_order_status: LabOrderStatus
      charge_type:      ChargeType
      payment_method:   PaymentMethod
    }
  }
}
