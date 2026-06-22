import type { UserRole } from './roles'

export interface NavItem {
  label: string
  icon: string
  path: string
}

export const navByRole: Record<UserRole, NavItem[]> = {
  superadmin: [
    { label: 'Dashboard',     icon: 'LayoutDashboard', path: '/dashboard' },
    { label: 'Patients',      icon: 'Users',           path: '/patients' },
    { label: 'Queue',         icon: 'ClipboardList',   path: '/queue' },
    { label: 'Lab Orders',    icon: 'FlaskConical',    path: '/lab' },
    { label: 'Finance',       icon: 'DollarSign',      path: '/finance' },
    { label: 'Reports',       icon: 'BarChart2',       path: '/reports' },
    { label: 'Settings',      icon: 'Settings',        path: '/settings' },
  ],
  receptionist: [
    { label: 'Dashboard',     icon: 'LayoutDashboard', path: '/dashboard' },
    { label: 'Registration',  icon: 'UserPlus',        path: '/register' },
    { label: 'Patients',      icon: 'Users',           path: '/patients' },
    { label: 'Queue',         icon: 'ClipboardList',   path: '/queue' },
    { label: 'QR Code',       icon: 'QrCode',          path: '/qr' },
  ],
  nurse: [
    { label: 'Dashboard',     icon: 'LayoutDashboard', path: '/dashboard' },
    { label: 'Triage Queue',  icon: 'Activity',        path: '/triage' },
    { label: 'Lab Orders',    icon: 'FlaskConical',    path: '/lab' },
    { label: 'Patients',      icon: 'Users',           path: '/patients' },
  ],
  doctor: [
    { label: 'Dashboard',     icon: 'LayoutDashboard', path: '/dashboard' },
    { label: 'My Queue',      icon: 'ClipboardList',   path: '/queue' },
    { label: 'Consultations', icon: 'Stethoscope',     path: '/consultations' },
    { label: 'Patients',      icon: 'Users',           path: '/patients' },
  ],
  lab_tech: [
    { label: 'Dashboard',     icon: 'LayoutDashboard', path: '/dashboard' },
    { label: 'Test Orders',   icon: 'FlaskConical',    path: '/lab' },
    { label: 'Results',       icon: 'FileCheck',       path: '/results' },
  ],
}
