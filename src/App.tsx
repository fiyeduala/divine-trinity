import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }      from './contexts/AuthContext'
import { AppProvider }       from './components/layout/AppContext'
import { ProtectedRoute }    from './components/auth/ProtectedRoute'
import { AppShell }          from './components/layout/AppShell'
import { LoginPage }         from './pages/LoginPage'
import { RegisterPage }      from './pages/RegisterPage'
import { DashboardRouter }   from './pages/DashboardRouter'
import { PatientsPage }      from './pages/PatientsPage'
import { QueuePage }         from './pages/QueuePage'
import { ConsultationPage }  from './pages/ConsultationPage'
import { PatientFolderPage } from './pages/PatientFolderPage'
import { NewPatientPage }    from './pages/receptionist/NewPatientPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            {/* Public routes — no auth required */}
            <Route path="/"                  element={<LoginPage />} />
            <Route path="/login"             element={<LoginPage />} />
            <Route path="/patient-register"  element={<RegisterPage />} />

            {/* Protected shell — ProtectedRoute checks session; AppShell wraps all inner pages */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/dashboard"          element={<DashboardRouter />} />
                <Route path="/patients"           element={<PatientsPage />} />
                <Route path="/patients/new"       element={<NewPatientPage />} />
                <Route path="/patients/:id"       element={<PatientFolderPage />} />
                <Route path="/queue"              element={<QueuePage />} />
                <Route path="/triage"             element={<QueuePage />} />
                <Route path="/consultations"      element={<ConsultationPage />} />
                <Route path="/consultations/:id"  element={<ConsultationPage />} />
                <Route path="/lab"                element={<PatientsPage />} />
                <Route path="/results"            element={<PatientsPage />} />
                <Route path="/finance"            element={<PatientFolderPage />} />
                <Route path="/reports"            element={<DashboardRouter />} />
                <Route path="/settings"           element={<DashboardRouter />} />
                <Route path="/qr"                 element={<DashboardRouter />} />
                <Route path="/register"           element={<PatientsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
