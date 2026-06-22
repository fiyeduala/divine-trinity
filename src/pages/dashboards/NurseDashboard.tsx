import { useState, useEffect, useCallback } from 'react'
import { Activity, Clock, CheckCircle2, Users, Loader2, RefreshCcw, PlayCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button }       from '@/components/ui/button'
import { StatCard }     from '@/components/shared/StatCard'
import { PageHeader }   from '@/components/shared/PageHeader'
import { SectionCard }  from '@/components/shared/SectionCard'
import { StatusBadge }  from '@/components/shared/StatusBadge'
import { EmptyState }   from '@/components/shared/EmptyState'
import { TriageSheet }  from '@/components/patients/TriageSheet'
import { fetchPatients, updatePatientStatus } from '@/lib/patientQueries'
import { toast }        from 'sonner'
import type { Patient } from '@/lib/database.types'

function patientName(p: Patient) {
  return `${p.wife_surname ?? ''} ${p.wife_other_names ?? ''}`.trim() || '—'
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
}

export function NurseDashboard() {
  const navigate = useNavigate()
  const [patients,    setPatients]    = useState<Patient[]>([])
  const [loading,     setLoading]     = useState(true)
  const [refreshing,  setRefreshing]  = useState(false)
  const [triagingPt,  setTriagingPt]  = useState<Patient | null>(null)
  const [starting,    setStarting]    = useState<string | null>(null) // patientId being picked up

  const load = useCallback(async (quiet = false) => {
    quiet ? setRefreshing(true) : setLoading(true)
    try {
      const data = await fetchPatients({
        status: ['registered', 'in_triage', 'ready_for_consultation'],
      })
      setPatients(data)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const waiting  = patients.filter(p => p.status === 'registered')
  const inTriage = patients.filter(p => p.status === 'in_triage')
  const ready    = patients.filter(p => p.status === 'ready_for_consultation')

  async function startTriage(patient: Patient) {
    setStarting(patient.id)
    try {
      // PENDING: Cashier confirmation gate
      // Verify registration fee has been cleared before starting triage.
      // Hook: const feePaid = await checkRegistrationFeeCleared(patient.id)
      // if (!feePaid) { toast.error('Registration fee not cleared'); return }

      const updated = await updatePatientStatus(patient.id, 'in_triage')
      setPatients(prev => prev.map(p => p.id === updated.id ? updated : p))
      setTriagingPt(updated)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start triage')
    } finally {
      setStarting(null)
    }
  }

  function handleTriageComplete(updated: Patient) {
    setPatients(prev => prev.map(p => p.id === updated.id ? updated : p))
    setTriagingPt(null)
    toast.success(`${patientName(updated)} is ready for consultation (Room ${updated.assigned_room})`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Nurse Station"
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
        <StatCard icon={Users}        label="Awaiting Triage"  value={loading ? '—' : waiting.length}  color="amber" />
        <StatCard icon={Activity}     label="In Triage"        value={loading ? '—' : inTriage.length} color="blue"  />
        <StatCard icon={CheckCircle2} label="Ready"            value={loading ? '—' : ready.length}    color="teal"  />
        <StatCard icon={Clock}        label="Total Active"     value={loading ? '—' : patients.length} color="green" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Waiting queue */}
        <SectionCard
          title={`Waiting for Triage${waiting.length > 0 ? ` (${waiting.length})` : ''}`}
          description="Registered patients — click Start Triage to begin"
        >
          {loading ? (
            <div className="flex items-center justify-center py-10 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
            </div>
          ) : waiting.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="Queue is clear" description="No patients waiting for triage." />
          ) : (
            <div className="divide-y divide-slate-100">
              {waiting.map(p => (
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
                    onClick={() => startTriage(p)}
                    disabled={starting === p.id}
                    className="gap-1.5 shrink-0"
                  >
                    {starting === p.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <PlayCircle className="h-3.5 w-3.5" />
                    }
                    Start Triage
                  </Button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* In triage + ready */}
        <div className="flex flex-col gap-4">
          {/* In progress */}
          <SectionCard
            title={`In Triage${inTriage.length > 0 ? ` (${inTriage.length})` : ''}`}
            description="Open triage sheet to record vitals"
          >
            {loading ? (
              <div className="flex items-center justify-center py-6 text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading…
              </div>
            ) : inTriage.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">None in progress</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {inTriage.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-3 gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{patientName(p)}</p>
                      <p className="text-xs font-mono text-[#2563EB]">{p.patient_code}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status="in_triage" />
                      <Button size="sm" variant="outline" onClick={() => setTriagingPt(p)}>
                        Record Vitals
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Ready for consultation */}
          <SectionCard
            title={`Ready for Consultation${ready.length > 0 ? ` (${ready.length})` : ''}`}
            description="Triaged — waiting for doctor"
          >
            {loading ? (
              <div className="flex items-center justify-center py-6 text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading…
              </div>
            ) : ready.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">None ready yet</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {ready.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-3 gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{patientName(p)}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        <span className="font-mono text-[#2563EB]">{p.patient_code}</span>
                        {p.assigned_room && <> · Room {p.assigned_room}</>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status="ready_for_consultation" />
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/patients/${p.id}`)}>
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      <TriageSheet
        patient={triagingPt}
        open={triagingPt !== null}
        onClose={() => setTriagingPt(null)}
        onComplete={handleTriageComplete}
      />
    </div>
  )
}
