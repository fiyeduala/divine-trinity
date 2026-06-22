import { supabase } from './supabase'
import type { Vitals } from './database.types'

export type VitalsInsert = {
  patient_id:   string
  bp_systolic:  number | null
  bp_diastolic: number | null
  pulse:        number | null
  weight:       number | null
  temperature:  number | null
  perspiration: string | null
  taken_by:     string
}

export async function insertVitals(fields: VitalsInsert) {
  const { data, error } = await supabase
    .from('vitals')
    .insert(fields)
    .select()
    .single()
  if (error) throw error
  return data as Vitals
}

export async function fetchVitalsForPatient(patientId: string) {
  const { data, error } = await supabase
    .from('vitals')
    .select('*')
    .eq('patient_id', patientId)
    .order('taken_at', { ascending: false })
  if (error) throw error
  return data as Vitals[]
}
