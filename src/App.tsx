import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './components/layout/AppContext'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardRouter } from './pages/DashboardRouter'
import { PatientsPage } from './pages/PatientsPage'
import { QueuePage } from './pages/QueuePage'
import { ConsultationPage } from './pages/ConsultationPage'
import { PatientFolderPage } from './pages/PatientFolderPage'

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/patient-register" element={<RegisterPage />} />

          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/patients/:id" element={<PatientFolderPage />} />
            <Route path="/queue" element={<QueuePage />} />
            <Route path="/triage" element={<QueuePage />} />
            <Route path="/consultations/:id" element={<ConsultationPage />} />
            <Route path="/consultations" element={<ConsultationPage />} />
            <Route path="/lab" element={<PatientsPage />} />
            <Route path="/results" element={<PatientsPage />} />
            <Route path="/finance" element={<PatientFolderPage />} />
            <Route path="/reports" element={<DashboardRouter />} />
            <Route path="/settings" element={<DashboardRouter />} />
            <Route path="/qr" element={<DashboardRouter />} />
            <Route path="/register" element={<PatientsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}
