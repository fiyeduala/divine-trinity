import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'react-qr-code'
import {
  Users, UserPlus, ClipboardList, QrCode,
  CheckCircle2, Clock, Printer, RefreshCcw, Loader2
} from 'lucide-react'
import { Button }            from '@/components/ui/button'
import { StatCard }          from '@/components/shared/StatCard'
import { PageHeader }        from '@/components/shared/PageHeader'
import { SectionCard }       from '@/components/shared/SectionCard'
import { StatusBadge }       from '@/components/shared/StatusBadge'
import { EmptyState }        from '@/components/shared/EmptyState'
import { ConfirmDraftSheet } from '@/components/patients/ConfirmDraftSheet'
import { fetchTodaysPatients } from '@/lib/patientQueries'
import type { Patient } from '@/lib/database.types'

const REGISTER_URL = `${window.location.origin}/patient-register`

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
}
function patientName(p: Patient) {
  return `${p.wife_surname ?? ''} ${p.wife_other_names ?? ''}`.trim() || '—'
}

export function ReceptionistDashboard() {
  const navigate = useNavigate()
  const [allPatients,  setAllPatients]  = useState<Patient[]>([])
  const [loading,      setLoading]      = useState(true)
  const [refreshing,   setRefreshing]   = useState(false)
  const [confirmingPt, setConfirmingPt] = useState<Patient | null>(null)

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    else setRefreshing(true)
    try {
      const data = await fetchTodaysPatients()
      setAllPatients(data)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const drafts     = allPatients.filter(p => p.status === 'draft')
  const registered = allPatients.filter(p => p.status !== 'draft')
  const todayCount = allPatients.length
  const draftCount = drafts.length

  function handleConfirmed(updated: Patient) {
    setAllPatients(prev => prev.map(p => p.id === updated.id ? updated : p))
    setConfirmingPt(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Receptionist Dashboard"
        subtitle={`Today — ${new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing} className="gap-1.5">
              {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
              Refresh
            </Button>
            <Button size="sm" onClick={() => navigate('/patients/new')} className="gap-1.5">
              <UserPlus className="h-3.5 w-3.5" /> New Patient
            </Button>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Users}         label="Today's Patients" value={loading ? '—' : todayCount}                                              color="blue"  />
        <StatCard icon={Clock}         label="Pending Drafts"   value={loading ? '—' : draftCount}  color={draftCount > 0 ? 'amber' : 'green'} />
        <StatCard icon={CheckCircle2}  label="Confirmed Today"  value={loading ? '—' : registered.length}                                      color="green" />
        <StatCard icon={ClipboardList} label="Still In Queue"   value={loading ? '—' : registered.filter(p => p.status !== 'completed').length} color="teal"  />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Draft inbox */}
        <div className="lg:col-span-2">
          <SectionCard
            title={`Pending Drafts${draftCount > 0 ? ` (${draftCount})` : ''}`}
            description="Patients who registered via QR form and need confirmation"
          >
            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading…
              </div>
            ) : drafts.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="No pending drafts"
                description="All QR registrations have been confirmed."
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {drafts.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-3 gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{patientName(p)}</p>
                      <p className="text-xs text-slate-400">{p.wife_phone ?? 'No phone'} · {fmtTime(p.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status="draft" />
                      <Button size="sm" onClick={() => setConfirmingPt(p)}>Confirm</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* QR Code panel */}
        <div>
          <SectionCard title="Patient QR Registration" description="Display or print for self-registration">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <QRCode value={REGISTER_URL} size={160} />
              </div>
              <p className="text-[11px] text-slate-400 text-center break-all">{REGISTER_URL}</p>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4" /> Print QR Code
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-2 text-[#2563EB]"
                onClick={() => window.open(REGISTER_URL, '_blank')}
              >
                <QrCode className="h-4 w-4" /> Open Form
              </Button>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Today's confirmed patients */}
      <SectionCard title="Today's Registered Patients" description="All patients confirmed today">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading…
          </div>
        ) : registered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No registered patients today"
            description="Confirm a draft above or register a new patient manually."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-500">Code</th>
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-500">Name</th>
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-500 hidden sm:table-cell">Phone</th>
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-500">Status</th>
                  <th className="text-left py-2 text-xs font-semibold text-slate-500 hidden sm:table-cell">Registered</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {registered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 pr-4 font-mono text-xs text-[#2563EB] font-semibold">{p.patient_code ?? '—'}</td>
                    <td className="py-2.5 pr-4 font-medium text-slate-900">{patientName(p)}</td>
                    <td className="py-2.5 pr-4 text-slate-500 hidden sm:table-cell">{p.wife_phone ?? '—'}</td>
                    <td className="py-2.5 pr-4"><StatusBadge status={p.status} /></td>
                    <td className="py-2.5 text-slate-400 text-xs hidden sm:table-cell">{fmtTime(p.created_at)}</td>
                    <td className="py-2.5 text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/patients/${p.id}`)}>View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Confirm draft sheet */}
      <ConfirmDraftSheet
        patient={confirmingPt}
        open={confirmingPt !== null}
        onClose={() => setConfirmingPt(null)}
        onConfirmed={handleConfirmed}
      />
    </div>
  )
}
