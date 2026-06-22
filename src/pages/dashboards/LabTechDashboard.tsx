import { useState, useEffect, useCallback } from 'react'
import { FlaskConical, Clock, CheckCircle2, Loader2, RefreshCcw, SendHorizonal } from 'lucide-react'
import { Button }      from '@/components/ui/button'
import { Textarea }    from '@/components/ui/textarea'
import { StatCard }    from '@/components/shared/StatCard'
import { PageHeader }  from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { EmptyState }  from '@/components/shared/EmptyState'
import {
  fetchMyLabQueue, fetchMyCompletedOrders, startLabOrder,
  submitLabResult, checkAndAdvancePatient, fetchLabTestsCatalog,
} from '@/lib/labQueries'
import { fetchPatients } from '@/lib/patientQueries'
import { useAuth }        from '@/contexts/AuthContext'
import { toast }          from 'sonner'
import type { LabOrder, LabTest, Patient } from '@/lib/database.types'

type PatientMap = Record<string, Patient>
type TestMap    = Record<string, LabTest>
type ResultDraft = Record<string, string> // orderId → draft text

export function LabTechDashboard() {
  const { profile } = useAuth()

  const [queue,      setQueue]      = useState<LabOrder[]>([])
  const [completed,  setCompleted]  = useState<LabOrder[]>([])
  const [patients,   setPatients]   = useState<PatientMap>({})
  const [tests,      setTests]      = useState<TestMap>({})
  const [drafts,     setDrafts]     = useState<ResultDraft>({})
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [starting,   setStarting]   = useState<string | null>(null)

  const load = useCallback(async (quiet = false) => {
    if (!profile) return
    quiet ? setRefreshing(true) : setLoading(true)
    try {
      const [q, done, testList] = await Promise.all([
        fetchMyLabQueue(profile.id),
        fetchMyCompletedOrders(profile.id),
        fetchLabTestsCatalog(),
      ])
      setQueue(q)
      setCompleted(done)

      // Build test lookup
      const testMap: TestMap = {}
      testList.forEach(t => { testMap[t.id] = t })
      setTests(testMap)

      // Fetch patients for all orders
      const ptIds = [...new Set([...q, ...done].map(o => o.patient_id))]
      if (ptIds.length > 0) {
        const pts = await fetchPatients({ limit: 200 })
        const ptMap: PatientMap = {}
        pts.filter(p => ptIds.includes(p.id)).forEach(p => { ptMap[p.id] = p })
        setPatients(ptMap)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [profile])

  useEffect(() => { load() }, [load])

  // Group queue by patient
  const grouped = queue.reduce<Record<string, LabOrder[]>>((acc, o) => {
    if (!acc[o.patient_id]) acc[o.patient_id] = []
    acc[o.patient_id].push(o)
    return acc
  }, {})

  function patientName(patientId: string) {
    const p = patients[patientId]
    if (!p) return '—'
    return `${p.wife_surname ?? ''} ${p.wife_other_names ?? ''}`.trim() || '—'
  }

  async function handleStart(order: LabOrder) {
    setStarting(order.id)
    try {
      const updated = await startLabOrder(order.id)
      setQueue(prev => prev.map(o => o.id === updated.id ? updated : o))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start')
    } finally {
      setStarting(null)
    }
  }

  async function handleSubmit(order: LabOrder) {
    const result = drafts[order.id]?.trim()
    if (!result) { toast.error('Please enter the result before submitting'); return }
    setSubmitting(order.id)
    try {
      await submitLabResult(order.id, result)
      await checkAndAdvancePatient(order.patient_id)
      setQueue(prev => prev.filter(o => o.id !== order.id))
      setDrafts(prev => { const n = { ...prev }; delete n[order.id]; return n })
      const test = tests[order.lab_test_id]
      toast.success(`${test?.name ?? 'Result'} submitted`)
      load(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Lab Technician"
        subtitle={new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}
        action={
          <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing} className="gap-1.5">
            {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
            Refresh
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={FlaskConical}  label="My Queue"          value={loading ? '—' : queue.length}     color="blue"   />
        <StatCard icon={Clock}         label="In Progress"       value={loading ? '—' : queue.filter(o => o.status === 'in_progress').length} color="amber" />
        <StatCard icon={CheckCircle2}  label="Completed Today"   value={loading ? '—' : completed.length} color="green"  />
      </div>

      {/* My queue */}
      <SectionCard
        title={`My Queue${queue.length > 0 ? ` (${queue.length})` : ''}`}
        description="Assigned tests — start processing then enter results"
      >
        {loading ? (
          <div className="flex items-center justify-center py-10 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <EmptyState
            icon={FlaskConical}
            title="No assigned tests"
            description="Tests assigned to you will appear here."
          />
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([patientId, orders]) => {
              const p = patients[patientId]
              return (
                <div key={patientId} className="rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">
                  {/* Patient header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{patientName(patientId)}</p>
                      <p className="text-xs font-mono text-[#2563EB]">{p?.patient_code ?? '—'}</p>
                    </div>
                    <span className="text-xs text-slate-400">{orders.length} test{orders.length !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Orders */}
                  <div className="divide-y divide-slate-100">
                    {orders.map(order => {
                      const test = tests[order.lab_test_id]
                      const isInProgress = order.status === 'in_progress'
                      return (
                        <div key={order.id} className="p-4 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{test?.name ?? '—'}</p>
                              <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${
                                isInProgress ? 'bg-cyan-100 text-cyan-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {order.status.replace('_', ' ')}
                              </span>
                            </div>
                            {!isInProgress && (
                              <Button
                                size="sm" variant="outline"
                                onClick={() => handleStart(order)}
                                disabled={starting === order.id}
                                className="gap-1.5 shrink-0"
                              >
                                {starting === order.id
                                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  : <FlaskConical className="h-3.5 w-3.5" />
                                }
                                Start
                              </Button>
                            )}
                          </div>

                          {isInProgress && (
                            <div className="space-y-2">
                              <Textarea
                                placeholder="Enter result…"
                                value={drafts[order.id] ?? ''}
                                onChange={e => setDrafts(prev => ({ ...prev, [order.id]: e.target.value }))}
                                rows={3}
                                className="text-sm bg-white resize-none"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSubmit(order)}
                                disabled={submitting === order.id || !drafts[order.id]?.trim()}
                                className="gap-2"
                              >
                                {submitting === order.id
                                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  : <SendHorizonal className="h-3.5 w-3.5" />
                                }
                                Submit Result
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </SectionCard>

      {/* Completed today */}
      {completed.length > 0 && (
        <SectionCard
          title={`Completed Today (${completed.length})`}
          description="Results submitted this session"
        >
          <div className="divide-y divide-slate-100">
            {completed.slice(0, 10).map(order => {
              const test = tests[order.lab_test_id]
              return (
                <div key={order.id} className="flex items-center justify-between py-3 gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{test?.name ?? '—'}</p>
                    <p className="text-xs text-slate-400">{patientName(order.patient_id)}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-medium">
                    done
                  </span>
                </div>
              )
            })}
          </div>
        </SectionCard>
      )}
    </div>
  )
}
