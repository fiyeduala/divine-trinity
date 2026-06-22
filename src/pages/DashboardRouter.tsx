import { useApp } from '@/components/layout/AppContext'
import { SuperadminDashboard } from './dashboards/SuperadminDashboard'
import { ReceptionistDashboard } from './dashboards/ReceptionistDashboard'
import { NurseDashboard } from './dashboards/NurseDashboard'
import { DoctorDashboard } from './dashboards/DoctorDashboard'
import { LabTechDashboard } from './dashboards/LabTechDashboard'

export function DashboardRouter() {
  const { role } = useApp()
  switch (role) {
    case 'superadmin':   return <SuperadminDashboard />
    case 'receptionist': return <ReceptionistDashboard />
    case 'nurse':        return <NurseDashboard />
    case 'doctor':       return <DoctorDashboard />
    case 'lab_tech':     return <LabTechDashboard />
  }
}
