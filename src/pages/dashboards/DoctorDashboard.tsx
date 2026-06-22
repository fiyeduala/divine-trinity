import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stethoscope, Clock, CheckCircle2, Users, Loader2, RefreshCcw, PlayCircle } from 'lucide-react'
import { Button }      from '@/components/ui/button'
import { StatCard }    from '@/components/shared/StatCard'
import { PageHeader }  from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState }  from '@/components/shared/EmptyState'
import { fetchPatients, updatePatientStatus } from '@/lib/patientQueries'
import { useAuth }     from '@/contexts/AuthContext'
import { toast }       from 'sonner'
import type { Patient } from '@/lib/database.types'

function patientName(p: Patient) {
  return `${p.wife_surname ?? ''} ${p.wife_other_names ?? ''}`.trim() || '—'
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
}

export function DoctorDashboard() {
  const navigate    = useNavigate()
  const { profile } = useAuth()
  const room        = profile?.consultation_room

  const [patients,   setPatients]   = useState<Patient[]>([])
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [starting,   setStarting]   = useState<string | null>(null)

  const load = useCallback(async (quiet = false) => {
    quiet ? setRefreshing(true) : setLoading(true)
    try {
      const data = await fetchPatients({
        status: ['ready_for_consultation', 'in_consultation', 'awaiting_lab', 'results_ready', 'completed'],
      })
      // Filter to this doctor's room — RLS also enforces this server-side
      const mine = room
        ? data.filter(p => p.assigned_room === room || p.status === 'completed')
        : data
      setPatients(mine)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [room])

  useEffect(() => { load() }, [load])

  const ready     = patients.filter(p => p.status === 'ready_for_consultation')
  const active    = patients.filter(p => ['in_consultation', 'awaiting_lab', 'results_ready'].includes(p.status))
  const completed = patients.filter(p => p.status === 'completed')

  async function startConsultation(patient: Patient) {
    setStarting(patient.id)
    try {
      await updatePatientStatus(patient.id, 'in_consultation')
      navigate(`/consultations/${patient.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start consultation')
      setStarting(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Doctor — Room ${room ?? '?'}`}
        subtitle={new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}
        action={
          <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing} className="gap-1.5">
            {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
            Refresh
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Users}        label="Ready for Me"    value={loading ? '—' : ready.length}     color="amber"  />
        <StatCard icon={Stethoscope}  label="In Consultation" value={loading ? '—' : active.length}    color="blue"   />
        <StatCard icon={Clock}        label="Awaiting Lab"    value={loading ? '—' : patients.filter(p => p.status === 'awaiting_lab').length} color="purple" />
        <StatCard icon={CheckCircle2} label="Completed Today" value={loading ? '—' : completed.length} color="green"  />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Ready queue */}
        <SectionCard
          title={`Ready for Consultation${ready.length > 0 ? ` (${ready.length})` : ''}`}
          description="Triaged patients waiting for this room"
        >
          {loading ? (
            <div className="flex items-center justify-center py-10 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
            </div>
          ) : ready.length === 0 ? (
            <EmptyState icon={Stethoscope} title="Queue is clear" description="No patients waiting for this room." />
          ) : (
            <div className="divide-y divide-slate-100">
              {ready.map(p => (
                <div key={p.id} className="flex items-center justify-between py-3 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{patientName(p)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      <span className="font-mono text-[#2563EB]">{p.patient_code}</span>
                      {' · '}{fmtTime(p.created_at)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => startConsultation(p)}
                    disabled={starting === p.id}
                    className="gap-1.5 shrink-0"
                  >
                    {starting === p.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <PlayCircle className="h-3.5 w-3.5" />
                    }
                    Start
                  </Button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Active + completed */}
        <div className="flex flex-col gap-4">
          {/* In consultation / awaiting lab / results ready */}
          <SectionCard
            title={`Active${active.length > 0 ? ` (${active.length})` : ''}`}
            description="In progress or awaiting lab results"
          >
            {loading ? (
              <div className="flex items-center justify-center py-6 text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading…
              </div>
            ) : active.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">None active</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {active.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-3 gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{patientName(p)}</p>
                      <p className="text-xs font-mono text-[#2563EB]">{p.patient_code}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={p.status} />
                      <Button
                        size="sm" variant="outline"
                        onClick={() => navigate(`/consultations/${p.id}`)}
                      >
                        Open
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Completed today */}
          <SectionCard
            title={`Completed Today${completed.length > 0 ? ` (${completed.length})` : ''}`}
            description="Finalized consultations"
          >
            {loading ? (
              <div className="flex items-center justify-center py-6 text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading…
              </div>
            ) : completed.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">None completed yet</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {completed.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between py-3 gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{patientName(p)}</p>
                      <p className="text-xs font-mono text-[#2563EB]">{p.patient_code}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/patients/${p.id}`)}>
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
