import { supabase }            from './supabase'
import { updatePatientStatus } from './patientQueries'
import type { LabOrder, LabTest, Profile } from './database.types'

// ── Nurse: fetch unassigned orders for a patient ──────────────────────────────

export async function fetchUnassignedOrders(patientId: string) {
  const { data, error } = await supabase
    .from('lab_orders')
    .select('*')
    .eq('patient_id', patientId)
    .eq('status', 'ordered')

  if (error) throw error
  return (data ?? []) as LabOrder[]
}

// ── Nurse: assign a lab tech to an order ─────────────────────────────────────

export async function assignLabOrder(
  orderId:    string,
  techId:     string,
  assignedBy: string,
) {
  const { data, error } = await supabase
    .from('lab_orders')
    .update({
      lab_tech_id: techId,
      assigned_by: assignedBy,
      assigned_at: new Date().toISOString(),
      status:      'assigned',
    })
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw error
  return data as LabOrder
}

// ── Lab tech: fetch their queue ───────────────────────────────────────────────

export async function fetchMyLabQueue(labTechId: string) {
  const { data, error } = await supabase
    .from('lab_orders')
    .select('*')
    .eq('lab_tech_id', labTechId)
    .in('status', ['assigned', 'in_progress'])
    .order('ordered_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as LabOrder[]
}

// ── Lab tech: fetch today's completed orders ──────────────────────────────────

export async function fetchMyCompletedOrders(labTechId: string) {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('lab_orders')
    .select('*')
    .eq('lab_tech_id', labTechId)
    .eq('status', 'completed')
    .gte('completed_at', todayStart.toISOString())
    .order('completed_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as LabOrder[]
}

// ── Lab tech: mark order in_progress ─────────────────────────────────────────

export async function startLabOrder(orderId: string) {
  const { data, error } = await supabase
    .from('lab_orders')
    .update({ status: 'in_progress' })
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw error
  return data as LabOrder
}

// ── Lab tech: submit result ───────────────────────────────────────────────────

export async function submitLabResult(orderId: string, resultNotes: string) {
  const { data, error } = await supabase
    .from('lab_orders')
    .update({
      result_notes: resultNotes,
      status:       'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw error
  return data as LabOrder
}

// ── Auto-advance patient when all their orders are done ───────────────────────

export async function checkAndAdvancePatient(patientId: string) {
  const { data: orders, error } = await supabase
    .from('lab_orders')
    .select('status')
    .eq('patient_id', patientId)

  if (error) throw error
  if (!orders || orders.length === 0) return

  const allDone = orders.every((o: { status: string }) => o.status === 'completed')
  if (allDone) {
    await updatePatientStatus(patientId, 'results_ready')
  }
}

// ── Fetch lab tests catalog ───────────────────────────────────────────────────

export async function fetchLabTestsCatalog() {
  const { data, error } = await supabase
    .from('lab_tests')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return (data ?? []) as LabTest[]
}

// ── Fetch lab tech profiles (for nurse assignment) ────────────────────────────

export async function fetchLabTechs() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'lab_tech')
    .eq('is_active', true)
    .order('full_name')

  if (error) throw error
  return (data ?? []) as Profile[]
}
