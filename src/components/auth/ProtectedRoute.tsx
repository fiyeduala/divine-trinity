import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/lib/database.types'
import { Heart } from 'lucide-react'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading, configured } = useAuth()

  if (!configured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 mx-auto mb-4">
            <Heart className="h-6 w-6 text-amber-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Supabase not configured</h2>
          <p className="text-sm text-slate-500 mb-4">
            Copy <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">.env.local.example</code> to{' '}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">.env.local</code> and fill in your Supabase URL and anon key, then restart the dev server.
          </p>
          <p className="text-xs text-slate-400">
            See <code className="bg-slate-100 px-1 py-0.5 rounded">supabase/README.md</code> for full setup instructions.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB]">
            <Heart className="h-5 w-5 text-white" fill="white" />
          </div>
          <p className="text-sm text-slate-400 animate-pulse">Loading…</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />
  }

  if (!profile.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Account inactive</h2>
          <p className="text-sm text-slate-500">Your account has been deactivated. Contact your administrator.</p>
        </div>
      </div>
    )
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
