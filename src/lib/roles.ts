export type UserRole = 'superadmin' | 'receptionist' | 'nurse' | 'doctor' | 'lab_tech'

export const roleLabels: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  receptionist: 'Receptionist',
  nurse: 'Nurse',
  doctor: 'Doctor',
  lab_tech: 'Lab Tech',
}

export const roleColors: Record<UserRole, string> = {
  superadmin: 'bg-purple-100 text-purple-700',
  receptionist: 'bg-blue-100 text-blue-700',
  nurse: 'bg-pink-100 text-pink-700',
  doctor: 'bg-emerald-100 text-emerald-700',
  lab_tech: 'bg-cyan-100 text-cyan-700',
}
