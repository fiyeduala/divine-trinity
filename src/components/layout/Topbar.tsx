import { Bell, Menu, ChevronDown, LogOut, User, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from './AppContext'
import { roleLabels, roleColors, type UserRole } from '@/lib/roles'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sidebar } from './Sidebar'
import { cn } from '@/lib/utils'

const ROLES: UserRole[] = ['superadmin', 'receptionist', 'nurse', 'doctor', 'lab_tech']

export function Topbar() {
  const { role, setRole, sidebarOpen, setSidebarOpen } = useApp()
  const navigate = useNavigate()

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 gap-3 shrink-0">
        {/* Left: hamburger + brand */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden sm:block text-sm font-bold text-slate-900">Divine Trinity</div>
        </div>

        {/* Right: role switcher + notifications + profile */}
        <div className="flex items-center gap-2">
          {/* Role switcher (demo tool) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn('hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium cursor-pointer border', roleColors[role])}>
                {roleLabels[role]}
                <ChevronDown className="h-3 w-3 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs">Switch Role (Demo)</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ROLES.map(r => (
                <DropdownMenuItem
                  key={r}
                  onClick={() => { setRole(r); navigate('/dashboard') }}
                  className={cn(role === r && 'bg-slate-50 font-semibold')}
                >
                  {roleLabels[r]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile role badge (tap to switch) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn('sm:hidden flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', roleColors[role])}>
                {roleLabels[role]}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {ROLES.map(r => (
                <DropdownMenuItem key={r} onClick={() => { setRole(r); navigate('/dashboard') }}>
                  {roleLabels[r]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#DC2626]" />
          </Button>

          {/* Profile menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full hover:bg-slate-50 px-1.5 py-1 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">Admin User</div>
                  <div className="text-[10px] text-slate-400">admin@dtfc.ng</div>
                </div>
                <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem><User className="h-4 w-4 mr-2" />Profile</DropdownMenuItem>
              <DropdownMenuItem><Settings className="h-4 w-4 mr-2" />Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile sidebar drawer */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-[260px]">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <Sidebar mobile onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
