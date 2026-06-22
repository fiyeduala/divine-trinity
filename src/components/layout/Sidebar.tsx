import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, ClipboardList, FlaskConical, DollarSign,
  BarChart2, Settings, UserPlus, QrCode, Activity, Stethoscope,
  FileCheck, ChevronLeft, ChevronRight, Heart
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from './AppContext'
import { useAuth } from '@/contexts/AuthContext'
import { navByRole } from '@/lib/nav'

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Users, ClipboardList, FlaskConical, DollarSign,
  BarChart2, Settings, UserPlus, QrCode, Activity, Stethoscope, FileCheck,
}

interface SidebarProps {
  mobile?: boolean
  onClose?: () => void
}

export function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const { sidebarCollapsed, setSidebarCollapsed } = useApp()
  const { profile } = useAuth()
  const location = useLocation()
  const role     = profile?.role ?? 'receptionist'
  const navItems = navByRole[role]
  const collapsed = !mobile && sidebarCollapsed

  return (
    <aside
      className={cn(
        'flex flex-col bg-white border-r border-slate-100 h-full transition-all duration-200',
        collapsed ? 'w-16' : 'w-[260px]',
        mobile && 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-slate-100', collapsed && 'justify-center px-2')}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2563EB]">
          <Heart className="h-4 w-4 text-white" fill="white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-bold text-slate-900 leading-tight">Divine Trinity</div>
            <div className="text-[10px] text-slate-400 leading-tight">Fertility Clinic</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map(item => {
          const Icon   = iconMap[item.icon] ?? LayoutDashboard
          const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={mobile ? onClose : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-[#EFF6FF] text-[#2563EB]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-[#2563EB]' : 'text-slate-500')} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* Collapse toggle — desktop only */}
      {!mobile && (
        <button
          onClick={() => setSidebarCollapsed(!collapsed)}
          className="flex items-center justify-center h-10 border-t border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      )}
    </aside>
  )
}
