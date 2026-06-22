import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useApp } from './AppContext'

export function AppShell() {
  const { sidebarCollapsed } = useApp()

  return (
    <div className="flex h-full bg-slate-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  )
}
