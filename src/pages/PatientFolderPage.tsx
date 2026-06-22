import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Loader2, AlertCircle, Wallet, CheckCircle2,
  Pill, FlaskConical, FileText, Plus,
} from 'lucide-react'
import { Button }    from '@/components/ui/button'
import { Input }     from '@/components/ui/input'
import { Label }     from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader }  from '@/components/shared/PageHeader'
import { fetchPatient } from '@/lib/patientQueries'
import { fetchVitalsForPatient } from '@/lib/vitalsQueries'
import { fetchPrescriptions, fetchLabOrders, fetchDrugs, fetchLabTests } from '@/lib/consultationQueries'
import { fetchCharges, fetchPayments, recordPayment, computeBalance, CHARGE_TYPE_LABEL, CHARGE_TYPE_COLOR } from '@/lib/billingQueries'
import { useAuth } from '@/contexts/AuthContext'
import { toast }   from 'sonner'
import type { Patient, Charge, Payment, Drug, LabTest, Prescription, LabOrder, Vitals } from '@/lib/database.types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-sm text-slate-900 mt-0.5">{value || '—'}</p>
    </div>
  )
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
function fmtN(n: number) {
  return '₦' + Number(n).toLocaleString()
}
function initials(p: Patient) {
  return `${p.wife_surname?.[0] ?? ''}${p.wife_other_names?.[0] ?? ''}`.toUpperCase()
}
function fullName(p: Patient) {
  return `${p.wife_surname ?? ''} ${p.wife_other_names ?? ''}`.trim() || '—'
}

// ── Main component ────────────────────────────────────────────────────────────

export function PatientFolderPage() {
  const { id: patientId } = useParams<{ id: string }>()
  const navigate  = useNavigate()
  const { profile } = useAuth()

  // Data
  const [patient,       setPatient]       = useState<Patient | null>(null)
  const [vitals,        setVitals]        = useState<Vitals | null>(null)
  const [charges,       setCharges]       = useState<Charge[]>([])
  const [payments,      setPayments]      = useState<Payment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [labOrders,     setLabOrders]     = useState<LabOrder[]>([])
  const [drugs,         setDrugs]         = useState<Drug[]>([])
  const [labTests,      setLabTests]      = useState<LabTest[]>([])

  // UI
  const [loading, setLoading]   = useState(true)
  const [error,   setError]     = useState<string | null>(null)

  // Record payment form
  const [showPayForm, setShowPayForm] = useState(false)
  const [payAmount,   setPayAmount]   = useState('')
  const [payNote,     setPayNote]     = useState('')
  const [paying,      setPaying]      = useState(false)

  useEffect(() => {
    if (!patientId) return
    setLoading(true)
    setError(null)

    Promise.all([
      fetchPatient(patientId),
      fetchVitalsForPatient(patientId),
      fetchCharges(patientId),
      fetchPayments(patientId),
      fetchPrescriptions(patientId),
      fetchLabOrders(patientId),
      fetchDrugs(),
      fetchLabTests(),
    ])
      .then(([pt, vArr, ch, pay, rx, lo, dr, lt]) => {
        setPatient(pt)
        setVitals(vArr[0] ?? null)
        setCharges(ch)
        setPayments(pay)
        setPrescriptions(rx)
        setLabOrders(lo)
        setDrugs(dr)
        setLabTests(lt)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load patient folder'))
      .finally(() => setLoading(false))
  }, [patientId])

  async function handleRecordPayment() {
    if (!patientId || !profile) return
    const amount = parseFloat(payAmount)
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return }
    if (amount > billing.balance) { toast.error(`Amount exceeds balance (${fmtN(billing.balance)})`); return }

    setPaying(true)
    try {
      const pmt = await recordPayment(patientId, amount, payNote.trim() || null, profile.id)
      setPayments(prev => [...prev, pmt])
      setPayAmount('')
      setPayNote('')
      setShowPayForm(false)
      toast.success(`Payment of ${fmtN(amount)} recorded`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to record payment')
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading patient folder…
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="w-fit gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error ?? 'Patient not found'}
        </div>
      </div>
    )
  }

  const billing = computeBalance(charges, payments)

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto">
      <PageHeader
        title={fullName(patient)}
        subtitle={`${patient.patient_code ?? '—'} · Registered ${fmtDate(patient.created_at)}`}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge status={patient.status} />
            <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </div>
        }
      />

      {/* Demographics strip */}
      <SectionCard>
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#2563EB] text-xl font-bold">
            {initials(patient)}
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 flex-1 sm:grid-cols-4">
            <InfoRow label="Wife"        value={`${patient.wife_surname} ${patient.wife_other_names}`} />
            <InfoRow label="Husband"     value={patient.husband_surname ? `${patient.husband_surname} ${patient.husband_other_names ?? ''}` : null} />
            <InfoRow label="Phone"       value={patient.wife_phone} />
            <InfoRow label="Age"         value={patient.wife_age ? `${patient.wife_age} yrs` : null} />
            <InfoRow label="Religion"    value={patient.religion} />
            <InfoRow label="Occupation"  value={patient.occupation} />
            <InfoRow label="Address"     value={patient.address} />
            <InfoRow label="Gravida"     value={String(patient.gravida)} />
          </div>
        </div>
        {vitals && (
          <>
            <Separator className="my-4" />
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 text-center">
              {[
                ['BP',    vitals.bp_systolic && vitals.bp_diastolic ? `${vitals.bp_systolic}/${vitals.bp_diastolic}` : null],
                ['Pulse', vitals.pulse ? `${vitals.pulse} bpm` : null],
                ['Temp',  vitals.temperature ? `${vitals.temperature}°C` : null],
                ['Wt',    vitals.weight ? `${vitals.weight} kg` : null],
                ['Persp', vitals.perspiration],
              ].map(([l, v]) => (
                <div key={l as string} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{l}</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{v ?? '—'}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </SectionCard>

      <Tabs defaultValue="billing">
        <TabsList className="w-full sm:w-auto flex-wrap h-auto gap-0.5">
          <TabsTrigger value="billing"  className="gap-1.5"><Wallet className="h-3.5 w-3.5" />Billing</TabsTrigger>
          <TabsTrigger value="clinical" className="gap-1.5"><FileText className="h-3.5 w-3.5" />Clinical</TabsTrigger>
        </TabsList>

        {/* ── Billing tab ── */}
        <TabsContent value="billing" className="mt-4 space-y-4">

          {/* Balance summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-100 bg-white p-4 text-center">
              <p className="text-xs text-slate-400 font-medium">Total Charges</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{fmtN(billing.total)}</p>
            </div>
            <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-center">
              <p className="text-xs text-green-600 font-medium">Total Paid</p>
              <p className="text-lg font-bold text-green-700 mt-1">{fmtN(billing.paid)}</p>
            </div>
            <div className={`rounded-xl border p-4 text-center ${billing.balance === 0 ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
              <p className={`text-xs font-medium ${billing.balance === 0 ? 'text-green-600' : 'text-red-600'}`}>Balance Due</p>
              <p className={`text-lg font-bold mt-1 ${billing.balance === 0 ? 'text-green-700' : 'text-red-700'}`}>{fmtN(billing.balance)}</p>
            </div>
          </div>

          {/* Charges ledger */}
          <SectionCard title="Charges Ledger">
            {charges.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No charges yet — they appear automatically when prescriptions or lab tests are ordered.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-2 text-left text-xs font-semibold text-slate-500">Description</th>
                      <th className="pb-2 text-left text-xs font-semibold text-slate-500 hidden sm:table-cell">Type</th>
                      <th className="pb-2 text-left text-xs font-semibold text-slate-500 hidden sm:table-cell">Date</th>
                      <th className="pb-2 text-right text-xs font-semibold text-slate-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {charges.map(c => (
                      <tr key={c.id}>
                        <td className="py-3 text-slate-700 pr-4">{c.description}</td>
                        <td className="py-3 hidden sm:table-cell">
                          <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${CHARGE_TYPE_COLOR[c.type] ?? 'bg-slate-100 text-slate-600'}`}>
                            {CHARGE_TYPE_LABEL[c.type] ?? c.type}
                          </span>
                        </td>
                        <td className="py-3 text-slate-400 text-xs hidden sm:table-cell">{fmtDate(c.created_at)}</td>
                        <td className="py-3 text-right font-semibold text-slate-900">{fmtN(Number(c.amount))}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200">
                      <td colSpan={3} className="pt-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Total</td>
                      <td className="pt-3 text-right font-bold text-slate-900">{fmtN(billing.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </SectionCard>

          {/* Payments */}
          <SectionCard
            title="Payment Records"
            action={
              billing.balance > 0 && !showPayForm ? (
                <Button size="sm" onClick={() => setShowPayForm(true)} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Record Payment
                </Button>
              ) : undefined
            }
          >
            {payments.length === 0 && !showPayForm ? (
              <p className="text-sm text-slate-400 text-center py-6">No payments recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {payments.map(p => (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4">
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{p.method.replace('_', ' ')}</p>
                      <p className="text-xs text-slate-500">{fmtDateTime(p.created_at)}{p.note ? ` · ${p.note}` : ''}</p>
                    </div>
                    <span className="font-bold text-green-700">{fmtN(Number(p.amount))}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Record payment form */}
            {showPayForm && (
              <>
                {payments.length > 0 && <Separator className="my-4" />}
                <div className="space-y-3 rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <p className="text-sm font-semibold text-slate-700">Record Payment</p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="space-y-1 flex-1">
                      <Label className="text-xs">Amount (₦)</Label>
                      <Input
                        type="number" min="1" max={billing.balance}
                        placeholder={`Max ${fmtN(billing.balance)}`}
                        value={payAmount}
                        onChange={e => setPayAmount(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-1 flex-1">
                      <Label className="text-xs">Note (optional)</Label>
                      <Input
                        placeholder="e.g. Registration fee, cash payment…"
                        value={payNote}
                        onChange={e => setPayNote(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRecordPayment}
                      disabled={paying || !payAmount}
                      className="gap-2"
                    >
                      {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Save Payment
                    </Button>
                    <Button variant="ghost" onClick={() => { setShowPayForm(false); setPayAmount(''); setPayNote('') }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </>
            )}

            {billing.balance === 0 && payments.length > 0 && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 border border-green-100 p-3 text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> Account fully settled
              </div>
            )}
          </SectionCard>
        </TabsContent>

        {/* ── Clinical tab ── */}
        <TabsContent value="clinical" className="mt-4 space-y-4">

          {/* Prescriptions */}
          <SectionCard title="Prescriptions" description="Drugs prescribed during consultation">
            {prescriptions.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No prescriptions.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {prescriptions.map(rx => {
                  const drug = drugs.find(d => d.id === rx.drug_id)
                  return (
                    <div key={rx.id} className="flex items-center justify-between py-3 gap-3">
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4 text-blue-500 shrink-0" />
                        <p className="text-sm font-medium text-slate-900">{drug?.name ?? '—'}</p>
                      </div>
                      <span className="text-xs text-slate-400">Qty {rx.quantity}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </SectionCard>

          {/* Lab Results */}
          <SectionCard title="Lab Results">
            {labOrders.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No lab orders.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {labOrders.map(order => {
                  const test = labTests.find(t => t.id === order.lab_test_id)
                  return (
                    <div key={order.id} className="py-3 space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <FlaskConical className="h-4 w-4 text-purple-500 shrink-0" />
                          <p className="text-sm font-medium text-slate-900">{test?.name ?? '—'}</p>
                        </div>
                        <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'in_progress' ? 'bg-cyan-100 text-cyan-700' :
                          order.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>{order.status.replace('_', ' ')}</span>
                      </div>
                      {order.result_notes && (
                        <p className="text-xs text-slate-600 bg-green-50 rounded px-3 py-2 ml-6">
                          {order.result_notes}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
