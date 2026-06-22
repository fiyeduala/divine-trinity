import { useState, useEffect, useCallback } from 'react'
import { Loader2, RefreshCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader }  from '@/components/shared/PageHeader'
import { StatusBadge, type PatientStatus } from '@/components/shared/StatusBadge'
import { EmptyState }  from '@/components/shared/EmptyState'
import { Button }      from '@/components/ui/button'
import { fetchPatients } from '@/lib/patientQueries'
import type { Patient }  from '@/lib/database.types'
import { Users }         from 'lucide-react'

const STAGE_ORDER: PatientStatus[] = [
  'registered', 'in_triage', 'ready_for_consultation',
  'in_consultation', 'awaiting_lab', 'lab_in_progress', 'results_ready',
]


function patientName(p: Patient) {
  return `${p.wife_surname ?? ''} ${p.wife_other_names ?? ''}`.trim() || '—'
}

export function QueuePage() {
  const navigate     = useNavigate()
  const [patients,   setPatients]  = useState<Patient[]>([])
  const [loading,    setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (quiet = false) => {
    quiet ? setRefreshing(true) : setLoading(true)
    try {
      const data = await fetchPatients({ status: STAGE_ORDER })
      setPatients(data)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const stages = STAGE_ORDER
    .map(s => ({ status: s, patients: patients.filter(p => p.status === s) }))
    .filter(s => s.patients.length > 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Live Queue"
        subtitle="All active patients across every stage"
        action={
          <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing} className="gap-1.5">
            {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
            Refresh
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading queue…
        </div>
      ) : stages.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Queue is empty"
          description="No active patients right now."
        />
      ) : (
        /* Horizontal scroll on mobile, column grid on desktop */
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max lg:min-w-0 lg:grid lg:grid-cols-3 xl:grid-cols-4">
            {stages.map(({ status, patients: group }) => (
              <div
                key={status}
                className="w-72 lg:w-auto flex flex-col bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden"
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <StatusBadge status={status} />
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">
                    {group.length}
                  </span>
                </div>

                {/* Patient cards */}
                <div className="flex flex-col divide-y divide-slate-50 flex-1">
                  {group.map(p => (
                    <button
                      key={p.id}
                      onClick={() => navigate(`/patients/${p.id}`)}
                      className="text-left px-4 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <p className="text-sm font-semibold text-slate-900 leading-tight">{patientName(p)}</p>
                      <p className="text-xs font-mono text-[#2563EB] mt-0.5">{p.patient_code ?? '—'}</p>
                      {status === 'ready_for_consultation' && p.assigned_room && (
                        <p className="text-xs text-slate-400 mt-0.5">Room {p.assigned_room}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Legend for empty stages */}
            {patients.length > 0 && (
              <div className="hidden lg:flex flex-col gap-2 px-4 py-3 justify-start">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">All stages</p>
                {STAGE_ORDER.map(s => (
                  <div key={s} className="flex items-center gap-2">
                    <StatusBadge status={s} />
                    <span className="text-xs text-slate-400">
                      {patients.filter(p => p.status === s).length}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
