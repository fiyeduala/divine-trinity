import { supabase } from './supabase'
import type { Consultation, Prescription, LabOrder, Drug, LabTest } from './database.types'

// ── Consultation ──────────────────────────────────────────────────────────────

export async function fetchOrCreateConsultation(
  patientId: string,
  doctorId: string,
  room: number,
) {
  const { data: existing } = await supabase
    .from('consultations')
    .select('*')
    .eq('patient_id', patientId)
    .maybeSingle()

  if (existing) return existing as Consultation

  const { data, error } = await supabase
    .from('consultations')
    .insert({ patient_id: patientId, doctor_id: doctorId, room })
    .select()
    .single()

  if (error) throw error
  return data as Consultation
}

export async function updateConsultation(
  consultationId: string,
  soap: {
    soap_subjective?: string | null
    soap_objective?:  string | null
    soap_assessment?: string | null
    soap_plan?:       string | null
  },
) {
  const { data, error } = await supabase
    .from('consultations')
    .update(soap)
    .eq('id', consultationId)
    .select()
    .single()

  if (error) throw error
  return data as Consultation
}

// ── Prescriptions ─────────────────────────────────────────────────────────────

export async function fetchPrescriptions(patientId: string) {
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as Prescription[]
}

export async function addPrescription(fields: {
  patient_id:         string
  consultation_id:    string | null
  drug_id:            string
  quantity:           number
  unit_price_at_time: number
  prescribed_by:      string
}) {
  const { data, error } = await supabase
    .from('prescriptions')
    .insert(fields)
    .select()
    .single()

  if (error) throw error
  return data as Prescription
}

export async function deletePrescription(id: string) {
  const { error } = await supabase.from('prescriptions').delete().eq('id', id)
  if (error) throw error
}

// ── Lab Orders ────────────────────────────────────────────────────────────────

export async function fetchLabOrders(patientId: string) {
  const { data, error } = await supabase
    .from('lab_orders')
    .select('*')
    .eq('patient_id', patientId)
    .order('ordered_at', { ascending: true })

  if (error) throw error
  return data as LabOrder[]
}

export async function addLabOrder(fields: {
  patient_id:      string
  consultation_id: string | null
  lab_test_id:     string
  ordered_by:      string
}) {
  const { data, error } = await supabase
    .from('lab_orders')
    .insert({ ...fields, status: 'ordered' })
    .select()
    .single()

  if (error) throw error
  return data as LabOrder
}

export async function deleteLabOrder(id: string) {
  const { error } = await supabase.from('lab_orders').delete().eq('id', id)
  if (error) throw error
}

// ── Catalogs ──────────────────────────────────────────────────────────────────

export async function fetchDrugs() {
  const { data, error } = await supabase
    .from('drugs')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data as Drug[]
}

export async function fetchLabTests() {
  const { data, error } = await supabase
    .from('lab_tests')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data as LabTest[]
}
