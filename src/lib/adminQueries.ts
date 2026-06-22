import { createClient } from '@supabase/supabase-js'
import { supabase }     from './supabase'
import type { Profile, Drug, LabTest, UserRole } from './database.types'

// ── Analytics types ───────────────────────────────────────────────────────────

export type DayTrend  = { day: string; patients: number; revenue: number }
export type StageDist = { stage: string; label: string; count: number; fill: string }
export type TestVol   = { name: string; value: number; fill: string }
export type TodayStats = {
  todayPatients:    number
  completedConsults: number
  labOrders:        number
  revenue:          number
}

const STAGE_COLORS: Record<string, string> = {
  registered:             '#3B82F6',
  in_triage:              '#F59E0B',
  ready_for_consultation: '#8B5CF6',
  in_consultation:        '#6366F1',
  awaiting_lab:           '#A855F7',
  lab_in_progress:        '#EC4899',
  results_ready:          '#0EA5E9',
  completed:              '#22C55E',
}

const STAGE_LABELS: Record<string, string> = {
  registered:             'Registered',
  in_triage:              'In Triage',
  ready_for_consultation: 'Ready',
  in_consultation:        'Consulting',
  awaiting_lab:           'Awaiting Lab',
  lab_in_progress:        'Lab In Progress',
  results_ready:          'Results Ready',
  completed:              'Completed',
}

const PIE_COLORS = ['#2563EB', '#0D9488', '#6366F1', '#F59E0B', '#EC4899', '#22C55E', '#A855F7']

// ── Analytics queries ─────────────────────────────────────────────────────────

export async function fetchTodayStats(): Promise<TodayStats> {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const since = todayStart.toISOString()

  const [pResult, loResult, payResult] = await Promise.all([
    supabase.from('patients').select('id, status').neq('status', 'draft').gte('created_at', since),
    supabase.from('lab_orders').select('id').gte('ordered_at', since),
    supabase.from('payments').select('amount').gte('created_at', since),
  ])

  const patients         = pResult.data  ?? []
  const completedConsults = patients.filter((p: { status: string }) => p.status === 'completed').length
  const labOrders        = loResult.data?.length ?? 0
  const revenue          = payResult.data?.reduce((s, p: { amount: string | number }) => s + Number(p.amount), 0) ?? 0

  return {
    todayPatients:    patients.length,
    completedConsults,
    labOrders,
    revenue,
  }
}

export async function fetchWeeklyTrend(): Promise<DayTrend[]> {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d
  })
  const since = new Date(days[0])
  since.setHours(0, 0, 0, 0)

  const [pResult, payResult] = await Promise.all([
    supabase.from('patients').select('created_at').neq('status', 'draft').gte('created_at', since.toISOString()),
    supabase.from('payments').select('amount, created_at').gte('created_at', since.toISOString()),
  ])

  const pts  = pResult.data  ?? []
  const pays = payResult.data ?? []

  return days.map(day => {
    const dayStr = day.toDateString()
    const patients = pts.filter((p: { created_at: string }) => new Date(p.created_at).toDateString() === dayStr).length
    const revenue  = pays
      .filter((p: { created_at: string }) => new Date(p.created_at).toDateString() === dayStr)
      .reduce((s, p: { amount: string | number }) => s + Number(p.amount), 0)
    return {
      day:      day.toLocaleDateString('en-NG', { weekday: 'short' }),
      patients,
      revenue,
    }
  })
}

export async function fetchStageDistribution(): Promise<StageDist[]> {
  const { data } = await supabase
    .from('patients')
    .select('status')
    .neq('status', 'draft')
    .neq('status', 'completed')

  const counts: Record<string, number> = {}
  ;(data ?? []).forEach((p: { status: string }) => {
    counts[p.status] = (counts[p.status] ?? 0) + 1
  })

  return Object.entries(STAGE_LABELS).map(([key, label]) => ({
    stage: label,
    label,
    count: counts[key] ?? 0,
    fill:  STAGE_COLORS[key] ?? '#94A3B8',
  })).filter(s => s.count > 0)
}

export async function fetchTestVolume(): Promise<TestVol[]> {
  const [ordersResult, testsResult] = await Promise.all([
    supabase.from('lab_orders').select('lab_test_id'),
    supabase.from('lab_tests').select('id, name'),
  ])

  const orders = ordersResult.data ?? []
  const tests  = testsResult.data  ?? []

  const testMap: Record<string, string> = {}
  tests.forEach((t: { id: string; name: string }) => { testMap[t.id] = t.name })

  const counts: Record<string, number> = {}
  orders.forEach((o: { lab_test_id: string }) => {
    counts[o.lab_test_id] = (counts[o.lab_test_id] ?? 0) + 1
  })

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([id, value], i) => ({
      name:  testMap[id] ?? 'Unknown',
      value,
      fill:  PIE_COLORS[i % PIE_COLORS.length],
    }))
}

// ── Staff management ──────────────────────────────────────────────────────────

export async function fetchAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name')

  if (error) throw error
  return (data ?? []) as Profile[]
}

export async function updateProfile(
  id:      string,
  updates: Partial<Pick<Profile, 'full_name' | 'role' | 'consultation_room' | 'is_active'>>,
) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Profile
}

export async function createStaffMember(
  email:    string,
  password: string,
  name:     string,
  role:     UserRole,
  room:     number | null,
) {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  if (!url || !key) throw new Error('Supabase not configured')

  // Temporary client with no persistent session — won't overwrite the admin's session
  const tempClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      storage: {
        getItem:    () => null,
        setItem:    () => {},
        removeItem: () => {},
      },
    },
  })

  const { data, error: signUpError } = await tempClient.auth.signUp({ email, password })
  if (signUpError) throw signUpError
  if (!data.user)  throw new Error('User creation failed — check email confirmation settings in Supabase dashboard')

  // Upsert profile with correct role (overrides auto-trigger defaults)
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id:                data.user.id,
      full_name:         name,
      role,
      consultation_room: role === 'doctor' ? room : null,
      is_active:         true,
    })

  if (profileError) throw profileError
}

// ── Catalog — Drugs ───────────────────────────────────────────────────────────

export async function fetchAllDrugsAdmin() {
  const { data, error } = await supabase
    .from('drugs')
    .select('*')
    .order('name')

  if (error) throw error
  return (data ?? []) as Drug[]
}

export async function addDrug(name: string, unitPrice: number) {
  const { data, error } = await supabase
    .from('drugs')
    .insert({ name: name.trim(), unit_price: unitPrice, is_active: true })
    .select()
    .single()

  if (error) throw error
  return data as Drug
}

export async function toggleDrug(id: string, isActive: boolean) {
  const { data, error } = await supabase
    .from('drugs')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Drug
}

// ── Catalog — Lab Tests ───────────────────────────────────────────────────────

export async function fetchAllLabTestsAdmin() {
  const { data, error } = await supabase
    .from('lab_tests')
    .select('*')
    .order('name')

  if (error) throw error
  return (data ?? []) as LabTest[]
}

export async function addLabTest(name: string, code: string, price: number) {
  const { data, error } = await supabase
    .from('lab_tests')
    .insert({ name: name.trim(), code: code.trim().toUpperCase(), price, is_active: true })
    .select()
    .single()

  if (error) throw error
  return data as LabTest
}

export async function toggleLabTest(id: string, isActive: boolean) {
  const { data, error } = await supabase
    .from('lab_tests')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as LabTest
}
