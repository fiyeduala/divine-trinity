import { supabase } from './supabase'
import type { Charge, Payment } from './database.types'

export async function fetchCharges(patientId: string) {
  const { data, error } = await supabase
    .from('charges')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as Charge[]
}

export async function fetchPayments(patientId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as Payment[]
}

export async function recordPayment(
  patientId:  string,
  amount:     number,
  note:       string | null,
  recordedBy: string,
) {
  const { data, error } = await supabase
    .from('payments')
    .insert({ patient_id: patientId, amount, note, recorded_by: recordedBy })
    .select()
    .single()

  if (error) throw error
  return data as Payment
}

export function computeBalance(charges: Charge[], payments: Payment[]) {
  const total   = charges.reduce((s, c) => s + Number(c.amount), 0)
  const paid    = payments.reduce((s, p) => s + Number(p.amount), 0)
  const balance = Math.max(0, total - paid)
  return { total, paid, balance }
}

export const CHARGE_TYPE_LABEL: Record<string, string> = {
  drug:     'Drug',
  lab_test: 'Lab Test',
  other:    'Other',
}

export const CHARGE_TYPE_COLOR: Record<string, string> = {
  drug:     'bg-blue-100 text-blue-700',
  lab_test: 'bg-purple-100 text-purple-700',
  other:    'bg-slate-100 text-slate-600',
}
