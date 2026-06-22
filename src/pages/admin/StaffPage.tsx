import { useState, useEffect } from 'react'
import {
  UserPlus, Loader2, RefreshCcw, Shield, Activity,
  UserCheck, Stethoscope, FlaskConical, Eye, UserX, AlertCircle,
} from 'lucide-react'
import { Button }  from '@/components/ui/button'
import { Input }   from '@/components/ui/input'
import { Label }   from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { PageHeader }  from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { EmptyState }  from '@/components/shared/EmptyState'
import { fetchAllProfiles, updateProfile, createStaffMember } from '@/lib/adminQueries'
import { useAuth } from '@/contexts/AuthContext'
import { toast }   from 'sonner'
import type { Profile, UserRole } from '@/lib/database.types'

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_META: Record<UserRole, { label: string; icon: React.ElementType; color: string }> = {
  superadmin:   { label: 'Superadmin',   icon: Shield,       color: 'bg-red-100 text-red-700'     },
  receptionist: { label: 'Receptionist', icon: Eye,          color: 'bg-blue-100 text-blue-700'   },
  nurse:        { label: 'Nurse',        icon: Activity,     color: 'bg-teal-100 text-teal-700'   },
  doctor:       { label: 'Doctor',       icon: Stethoscope,  color: 'bg-indigo-100 text-indigo-700' },
  lab_tech:     { label: 'Lab Tech',     icon: FlaskConical, color: 'bg-purple-100 text-purple-700' },
}

function RoleBadge({ role }: { role: UserRole }) {
  const m = ROLE_META[role]
  const Icon = m.icon
  return (
    <span className={`inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 font-medium ${m.color}`}>
      <Icon className="h-3 w-3" />
      {m.label}
    </span>
  )
}

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

// ── Staff creation form state ─────────────────────────────────────────────────

type FormState = {
  fullName: string
  email:    string
  password: string
  role:     UserRole
  room:     string
}

const BLANK_FORM: FormState = {
  fullName: '', email: '', password: '', role: 'nurse', room: '',
}

// ── Main component ────────────────────────────────────────────────────────────

export function StaffPage() {
  const { profile: me } = useAuth()

  const [profiles,   setProfiles]   = useState<Profile[]>([])
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [sheetOpen,  setSheetOpen]  = useState(false)
  const [form,       setForm]       = useState<FormState>(BLANK_FORM)
  const [saving,     setSaving]     = useState(false)
  const [toggling,   setToggling]   = useState<string | null>(null)
  const [formError,  setFormError]  = useState<string | null>(null)

  async function load(quiet = false) {
    quiet ? setRefreshing(true) : setLoading(true)
    try {
      setProfiles(await fetchAllProfiles())
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  function set(key: keyof FormState, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
    setFormError(null)
  }

  async function handleCreate() {
    if (!form.fullName.trim()) { setFormError('Full name is required'); return }
    if (!form.email.trim())    { setFormError('Email is required'); return }
    if (form.password.length < 8) { setFormError('Password must be at least 8 characters'); return }
    if (form.role === 'doctor' && !form.room) { setFormError('Consultation room is required for doctors'); return }

    setSaving(true)
    setFormError(null)
    try {
      const room = form.role === 'doctor' ? parseInt(form.room) : null
      await createStaffMember(form.email, form.password, form.fullName.trim(), form.role, room)
      toast.success(`${form.fullName} added successfully`)
      setForm(BLANK_FORM)
      setSheetOpen(false)
      load(true)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create staff member')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(p: Profile) {
    if (p.id === me?.id) { toast.error('You cannot deactivate your own account'); return }
    setToggling(p.id)
    try {
      const updated = await updateProfile(p.id, { is_active: !p.is_active })
      setProfiles(prev => prev.map(x => x.id === updated.id ? updated : x))
      toast.success(`${p.full_name} ${updated.is_active ? 'activated' : 'deactivated'}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setToggling(null)
    }
  }

  // Group by role order
  const roleOrder: UserRole[] = ['superadmin', 'doctor', 'nurse', 'receptionist', 'lab_tech']
  const grouped = roleOrder.map(role => ({
    role,
    members: profiles.filter(p => p.role === role),
  })).filter(g => g.members.length > 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Staff Management"
        subtitle="Manage clinic staff accounts and roles"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing} className="gap-1.5">
              {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
              Refresh
            </Button>
            <Button onClick={() => setSheetOpen(true)} className="gap-1.5">
              <UserPlus className="h-4 w-4" /> Add Staff Member
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading staff…
        </div>
      ) : profiles.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No staff accounts"
          description="Add the first staff member to get started."
          action={<Button onClick={() => setSheetOpen(true)} className="gap-1.5"><UserPlus className="h-4 w-4" /> Add Staff</Button>}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {grouped.map(({ role, members }) => (
            <SectionCard
              key={role}
              title={ROLE_META[role].label + 's'}
              description={`${members.length} account${members.length !== 1 ? 's' : ''}`}
            >
              <div className="divide-y divide-slate-100">
                {members.map(p => (
                  <div key={p.id} className="flex items-center gap-4 py-3">
                    <div className="h-9 w-9 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                      {initials(p.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900">{p.full_name}</p>
                        {p.id === me?.id && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 font-medium">you</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <RoleBadge role={p.role} />
                        {p.role === 'doctor' && p.consultation_room && (
                          <span className="text-xs text-slate-400">Room {p.consultation_room}</span>
                        )}
                        <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    {p.id !== me?.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggle(p)}
                        disabled={toggling === p.id}
                        className={`gap-1.5 shrink-0 ${p.is_active ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-700 hover:bg-green-50'}`}
                      >
                        {toggling === p.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : p.is_active ? (
                          <><UserX className="h-3.5 w-3.5" /> Deactivate</>
                        ) : (
                          <><UserCheck className="h-3.5 w-3.5" /> Activate</>
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          ))}
        </div>
      )}

      {/* Add staff sheet */}
      <Sheet open={sheetOpen} onOpenChange={open => { if (!open) { setSheetOpen(false); setForm(BLANK_FORM); setFormError(null) } }}>
        <SheetContent className="w-full max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[#2563EB]" /> Add Staff Member
            </SheetTitle>
            <SheetDescription>
              Creates a new login account and staff profile. Email confirmation must be
              disabled in Supabase Auth settings for immediate activation.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input placeholder="e.g. Dr. Emeka Okonkwo" value={form.fullName} onChange={e => set('fullName', e.target.value)} />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label>Email Address</Label>
              <Input type="email" placeholder="e.g. emeka@divinetrinity.ng" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label>Initial Password</Label>
              <Input type="password" placeholder="Minimum 8 characters" value={form.password} onChange={e => set('password', e.target.value)} />
              <p className="text-xs text-slate-400">Staff member can change this after first login.</p>
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={v => set('role', v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                  <SelectItem value="nurse">Nurse</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="lab_tech">Lab Technician</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Consultation room — only for doctors */}
            {form.role === 'doctor' && (
              <div className="space-y-1.5">
                <Label>Consultation Room</Label>
                <Select value={form.room} onValueChange={v => set('room', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Room 1</SelectItem>
                    <SelectItem value="2">Room 2</SelectItem>
                    <SelectItem value="3">Room 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Error */}
            {formError && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{formError}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button onClick={handleCreate} disabled={saving} className="gap-2 flex-1">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Create Account
              </Button>
              <Button variant="ghost" onClick={() => setSheetOpen(false)}>Cancel</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
