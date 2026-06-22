import { Bell, Menu, ChevronDown, LogOut, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from './AppContext'
import { useAuth } from '@/contexts/AuthContext'
import { roleLabels, roleColors } from '@/lib/roles'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sidebar } from './Sidebar'

export function Topbar() {
  const { sidebarOpen, setSidebarOpen } = useApp()
  const { profile, signOut }            = useAuth()
  const navigate                        = useNavigate()

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

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

        {/* Right: role badge + notifications + profile */}
        <div className="flex items-center gap-2">
          {/* Role badge (read-only — real role from profile) */}
          {profile && (
            <span className={`hidden sm:inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${roleColors[profile.role]}`}>
              {roleLabels[profile.role]}
            </span>
          )}

          {/* Mobile role badge */}
          {profile && (
            <span className={`sm:hidden inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${roleColors[profile.role]}`}>
              {roleLabels[profile.role]}
            </span>
          )}

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
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                {profile && (
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-semibold text-slate-800 leading-tight">{profile.full_name}</div>
                    <div className="text-[10px] text-slate-400">{roleLabels[profile.role]}</div>
                  </div>
                )}
                <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {profile && (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-semibold text-slate-900">{profile.full_name}</p>
                    <p className="text-xs text-slate-400">{roleLabels[profile.role]}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem><User className="h-4 w-4 mr-2" />Profile</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />Sign out
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
