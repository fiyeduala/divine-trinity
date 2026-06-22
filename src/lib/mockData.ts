import type { PatientStatus } from '@/components/shared/StatusBadge'

export const MOCK_PATIENTS = [
  { id: 'DT-2024-001', wife: 'Amaka Okonkwo',   husband: 'Chukwuemeka Okonkwo', status: 'in_consultation'  as PatientStatus, phone: '0801234567', date: 'Jun 22, 2026' },
  { id: 'DT-2024-002', wife: 'Fatima Bello',     husband: 'Ibrahim Bello',       status: 'awaiting_lab'     as PatientStatus, phone: '0802345678', date: 'Jun 22, 2026' },
  { id: 'DT-2024-003', wife: 'Ngozi Adeyemi',    husband: 'Segun Adeyemi',       status: 'in_triage'        as PatientStatus, phone: '0803456789', date: 'Jun 22, 2026' },
  { id: 'DT-2024-004', wife: 'Chidinma Eze',     husband: 'Obiora Eze',          status: 'registered'       as PatientStatus, phone: '0804567890', date: 'Jun 22, 2026' },
  { id: 'DT-2024-005', wife: 'Blessing Nwosu',   husband: 'Emmanuel Nwosu',      status: 'results_ready'    as PatientStatus, phone: '0805678901', date: 'Jun 22, 2026' },
  { id: 'DT-2024-006', wife: 'Aisha Musa',       husband: 'Usman Musa',          status: 'lab_in_progress'  as PatientStatus, phone: '0806789012', date: 'Jun 21, 2026' },
  { id: 'DT-2024-007', wife: 'Oluwakemi Fashola', husband: 'Tunde Fashola',      status: 'completed'        as PatientStatus, phone: '0807890123', date: 'Jun 21, 2026' },
  { id: 'DT-2024-008', wife: 'Ifeoma Nwachukwu', husband: 'Chidi Nwachukwu',    status: 'draft'            as PatientStatus, phone: '0808901234', date: 'Jun 21, 2026' },
]

export const MOCK_PATIENTS_PER_DAY = [
  { day: 'Mon', patients: 12, revenue: 145000 },
  { day: 'Tue', patients: 18, revenue: 220000 },
  { day: 'Wed', patients: 15, revenue: 180000 },
  { day: 'Thu', patients: 22, revenue: 265000 },
  { day: 'Fri', patients: 28, revenue: 340000 },
  { day: 'Sat', patients: 10, revenue: 120000 },
  { day: 'Sun', patients: 5,  revenue: 60000 },
]

export const MOCK_STAGE_DATA = [
  { stage: 'Registered',     count: 8,  fill: '#3B82F6' },
  { stage: 'Triage',         count: 5,  fill: '#F59E0B' },
  { stage: 'Consultation',   count: 12, fill: '#6366F1' },
  { stage: 'Awaiting Lab',   count: 7,  fill: '#A855F7' },
  { stage: 'Lab Progress',   count: 4,  fill: '#06B6D4' },
  { stage: 'Results Ready',  count: 3,  fill: '#14B8A6' },
  { stage: 'Completed',      count: 20, fill: '#22C55E' },
]

export const MOCK_TEST_VOLUME = [
  { name: 'Hormone Panel', value: 35, fill: '#2563EB' },
  { name: 'Semen Analysis', value: 20, fill: '#0D9488' },
  { name: 'Ultrasound',     value: 25, fill: '#6366F1' },
  { name: 'Blood Work',     value: 15, fill: '#F59E0B' },
  { name: 'Other',          value: 5,  fill: '#94A3B8' },
]

export const MOCK_LAB_ORDERS = [
  { id: 'LAB-001', patient: 'Amaka Okonkwo',    test: 'Hormone Panel',  status: 'pending',     assigned: 'Not assigned' },
  { id: 'LAB-002', patient: 'Fatima Bello',     test: 'Semen Analysis', status: 'in_progress', assigned: 'Mrs. Adaeze' },
  { id: 'LAB-003', patient: 'Ngozi Adeyemi',    test: 'Ultrasound',     status: 'completed',   assigned: 'Mrs. Adaeze' },
  { id: 'LAB-004', patient: 'Chidinma Eze',     test: 'Blood Work',     status: 'pending',     assigned: 'Not assigned' },
  { id: 'LAB-005', patient: 'Blessing Nwosu',   test: 'Hormone Panel',  status: 'completed',   assigned: 'Mr. Emeka' },
]
