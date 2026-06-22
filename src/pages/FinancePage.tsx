import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, RefreshCcw, Wallet, CheckCircle2, Clock } from 'lucide-react'
import { Button }      from '@/components/ui/button'
import { PageHeader }  from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatCard }    from '@/components/shared/StatCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState }  from '@/components/shared/EmptyState'
import { fetchPatients } from '@/lib/patientQueries'
import { fetchCharges, fetchPayments, computeBalance } from '@/lib/billingQueries'
import type { Patient } from '@/lib/database.types'

type PatientBill = Patient & { total: number; paid: number; balance: number }

function fullName(p: Patient) {
  return `${p.wife_surname ?? ''} ${p.wife_other_names ?? ''}`.trim() || '—'
}
function fmtN(n: number) { return '₦' + Number(n).toLocaleString() }

export function FinancePage() {
  const navigate = useNavigate()

  const [bills,      setBills]      = useState<PatientBill[]>([])
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (quiet = false) => {
    quiet ? setRefreshing(true) : setLoading(true)
    try {
      // Fetch all active (non-draft) patients
      const patients = await fetchPatients({
        status: [
          'registered', 'in_triage', 'ready_for_consultation',
          'in_consultation', 'awaiting_lab', 'lab_in_progress',
          'results_ready', 'completed',
        ],
      })

      // Compute balance for each patient in parallel (batched)
      const billData = await Promise.all(
        patients.map(async p => {
          const [charges, payments] = await Promise.all([
            fetchCharges(p.id),
            fetchPayments(p.id),
          ])
          const { total, paid, balance } = computeBalance(charges, payments)
          return { ...p, total, paid, balance } as PatientBill
        })
      )

      // Sort: balance > 0 first, then by created_at desc
      billData.sort((a, b) => {
        if (a.balance > 0 && b.balance === 0) return -1
        if (a.balance === 0 && b.balance > 0) return 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })

      setBills(billData)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const outstanding  = bills.filter(b => b.balance > 0)
  const settled      = bills.filter(b => b.balance === 0 && b.total > 0)
  const noCharges    = bills.filter(b => b.total === 0)
  const totalRevenue = bills.reduce((s, b) => s + b.paid, 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Finance & Billing"
        subtitle="Charges, payments and outstanding balances"
        action={
          <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing} className="gap-1.5">
            {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
            Refresh
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Wallet}       label="Outstanding Bills"  value={loading ? '—' : outstanding.length}      color="red"    />
        <StatCard icon={CheckCircle2} label="Settled Today"      value={loading ? '—' : settled.length}          color="green"  />
        <StatCard icon={Clock}        label="No Charges Yet"     value={loading ? '—' : noCharges.length}        color="amber"  />
        <StatCard icon={Wallet}       label="Revenue Collected"  value={loading ? '—' : fmtN(totalRevenue)}      color="teal"   />
      </div>

      {/* Outstanding balances */}
      <SectionCard
        title={`Outstanding Balances${outstanding.length > 0 ? ` (${outstanding.length})` : ''}`}
        description="Patients with unpaid charges"
      >
        {loading ? (
          <div className="flex items-center justify-center py-10 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
          </div>
        ) : outstanding.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="All clear!" description="No outstanding balances right now." />
        ) : (
          <div className="divide-y divide-slate-100">
            {outstanding.map(b => (
              <div key={b.id} className="flex items-center justify-between py-3 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{fullName(b)}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono text-[#2563EB]">{b.patient_code}</span>
                    <StatusBadge status={b.status} />
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">{fmtN(b.total)} total</p>
                    <p className="text-sm font-bold text-red-600">{fmtN(b.balance)} due</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/patients/${b.id}`)}
                    className="gap-1.5"
                  >
                    <Wallet className="h-3.5 w-3.5" />
                    Collect
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Settled today */}
      {settled.length > 0 && (
        <SectionCard
          title={`Settled Today (${settled.length})`}
          description="Fully paid accounts"
        >
          <div className="divide-y divide-slate-100">
            {settled.map(b => (
              <div key={b.id} className="flex items-center justify-between py-3 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{fullName(b)}</p>
                  <span className="text-xs font-mono text-[#2563EB]">{b.patient_code}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-green-600 font-medium">{fmtN(b.paid)} paid</p>
                    <span className="text-xs text-green-600 flex items-center gap-0.5 justify-end">
                      <CheckCircle2 className="h-3 w-3" /> Settled
                    </span>
                  </div>
                  <Button
                    size="sm" variant="outline"
                    onClick={() => navigate(`/patients/${b.id}`)}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  )
}
