import { supabase } from './supabase'
import type { Patient, PatientStatus } from './database.types'

// ── Fetch helpers ─────────────────────────────────────────────────────────────

export async function fetchPatients(filter?: { status?: PatientStatus | PatientStatus[]; limit?: number }) {
  let q = supabase.from('patients').select('*').order('created_at', { ascending: false })

  if (filter?.status) {
    if (Array.isArray(filter.status)) {
      q = q.in('status', filter.status)
    } else {
      q = q.eq('status', filter.status)
    }
  }
  if (filter?.limit) q = q.limit(filter.limit)

  const { data, error } = await q
  if (error) throw error
  return data as Patient[]
}

export async function fetchPatient(id: string) {
  const { data, error } = await supabase.from('patients').select('*').eq('id', id).single()
  if (error) throw error
  return data as Patient
}

export async function fetchTodaysPatients() {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .gte('created_at', todayStart.toISOString())
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Patient[]
}

// ── Patient code generation + status transitions ──────────────────────────────

export async function confirmDraft(
  patientId: string,
  confirmedBy: string,
  updates?: Partial<Pick<Patient,
    | 'wife_surname' | 'wife_other_names' | 'wife_phone' | 'wife_dob' | 'wife_age'
    | 'husband_surname' | 'husband_other_names' | 'husband_phone'
    | 'religion' | 'address' | 'email' | 'occupation'
    | 'marital_status' | 'married_duration' | 'previous_surgery' | 'gravida'
    | 'contact_name' | 'contact_phone' | 'contact_address' | 'contact_email'
  >>
) {
  // Generate the DTF-YYYY-#### code via the database function
  const { data: codeData, error: codeErr } = await supabase.rpc('generate_patient_code')
  if (codeErr) throw codeErr

  // PENDING: Cashier confirmation gate
  // Before setting status to 'registered', check that the registration fee has been paid.
  // Hook: const feePaid = await checkRegistrationFeeCleared(patientId)
  // if (!feePaid) throw new Error('Registration fee must be paid before confirming.')
  // This block is intentionally empty — drop payment logic here when ready.

  const { data, error } = await supabase
    .from('patients')
    .update({
      patient_code: codeData as string,
      status: 'registered',
      confirmed_by: confirmedBy,
      confirmed_at: new Date().toISOString(),
      ...updates,
    })
    .eq('id', patientId)
    .select()
    .single()

  if (error) throw error
  return data as Patient
}

export async function updatePatientStatus(
  patientId: string,
  newStatus: PatientStatus,
  extraFields?: Partial<Patient>
) {
  const { data, error } = await supabase
    .from('patients')
    .update({ status: newStatus, ...extraFields })
    .eq('id', patientId)
    .select()
    .single()

  if (error) throw error
  return data as Patient
}

// ── Insert helpers ─────────────────────────────────────────────────────────────

export type PatientInsert = Omit<Patient,
  'id' | 'patient_code' | 'created_at' | 'confirmed_by' | 'confirmed_at'
>

export async function createDraftPatient(fields: PatientInsert) {
  const { data, error } = await supabase
    .from('patients')
    .insert({ ...fields, status: 'draft' })
    .select()
    .single()

  if (error) throw error
  return data as Patient
}

/** Receptionist-direct registration: insert + immediately confirm in one go */
export async function createRegisteredPatient(
  fields: Omit<PatientInsert, 'status' | 'source'>,
  createdBy: string
) {
  const { data: inserted, error: insertErr } = await supabase
    .from('patients')
    .insert({
      ...fields,
      status: 'draft',
      source: 'receptionist',
      created_by: createdBy,
    })
    .select()
    .single()

  if (insertErr) throw insertErr

  return confirmDraft(inserted.id, createdBy)
}
