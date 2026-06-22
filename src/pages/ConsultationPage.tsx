import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Save, FlaskConical, Pill, CheckCircle2,
  Loader2, Trash2, Plus, AlertCircle, SendToBack,
} from 'lucide-react'
import { Button }    from '@/components/ui/button'
import { Textarea }  from '@/components/ui/textarea'
import { Label }     from '@/components/ui/label'
import { Input }     from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Separator }   from '@/components/ui/separator'
import { fetchPatient, updatePatientStatus }  from '@/lib/patientQueries'
import { fetchVitalsForPatient } from '@/lib/vitalsQueries'
import {
  fetchOrCreateConsultation, updateConsultation,
  fetchPrescriptions,  addPrescription,  deletePrescription,
  fetchLabOrders,      addLabOrder,      deleteLabOrder,
  fetchDrugs,          fetchLabTests,
} from '@/lib/consultationQueries'
import { useAuth } from '@/contexts/AuthContext'
import { toast }   from 'sonner'
import type { Patient, Vitals, Consultation, Prescription, LabOrder, Drug, LabTest } from '@/lib/database.types'

// ── Small UI helpers ──────────────────────────────────────────────────────────

function VitalChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-center">
      <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{label}</div>
      <div className="text-sm font-semibold text-slate-800 mt-0.5">{value}</div>
    </div>
  )
}

function SoapField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</Label>
      <Textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="resize-none text-sm"
      />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ConsultationPage() {
  const { id: patientId }  = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const { profile } = useAuth()

  // Data states
  const [patient,       setPatient]       = useState<Patient | null>(null)
  const [vitals,        setVitals]        = useState<Vitals | null>(null)
  const [consultation,  setConsultation]  = useState<Consultation | null>(null)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [labOrders,     setLabOrders]     = useState<LabOrder[]>([])
  const [drugs,         setDrugs]         = useState<Drug[]>([])
  const [labTests,      setLabTests]      = useState<LabTest[]>([])

  // SOAP form
  const [soap, setSoap] = useState({
    subjective: '', objective: '', assessment: '', plan: '',
  })

  // Add-drug form
  const [selectedDrug, setSelectedDrug]   = useState('')
  const [drugQty,      setDrugQty]        = useState('1')

  // Add-test form
  const [selectedTest, setSelectedTest]   = useState('')

  // UI
  const [loading,   setLoading]   = useState(true)
  const [savingSOAP, setSavingSOAP] = useState(false)
  const [addingDrug, setAddingDrug] = useState(false)
  const [addingTest, setAddingTest] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  // ── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!patientId || !profile) return
    const room = profile.consultation_room ?? 1

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [pt, vitalsArr, consult, rxList, orderList, drugList, testList] = await Promise.all([
          fetchPatient(patientId!),
          fetchVitalsForPatient(patientId!),
          fetchOrCreateConsultation(patientId!, profile!.id, room),
          fetchPrescriptions(patientId!),
          fetchLabOrders(patientId!),
          fetchDrugs(),
          fetchLabTests(),
        ])
        setPatient(pt)
        setVitals(vitalsArr[0] ?? null)
        setConsultation(consult)
        setSoap({
          subjective: consult.soap_subjective ?? '',
          objective:  consult.soap_objective  ?? '',
          assessment: consult.soap_assessment ?? '',
          plan:       consult.soap_plan       ?? '',
        })
        setPrescriptions(rxList)
        setLabOrders(orderList)
        setDrugs(drugList)
        setLabTests(testList)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load consultation')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [patientId, profile])

  // ── Actions ───────────────────────────────────────────────────────────────

  async function saveSOAP() {
    if (!consultation) return
    setSavingSOAP(true)
    try {
      const updated = await updateConsultation(consultation.id, {
        soap_subjective: soap.subjective || null,
        soap_objective:  soap.objective  || null,
        soap_assessment: soap.assessment || null,
        soap_plan:       soap.plan       || null,
      })
      setConsultation(updated)
      toast.success('SOAP note saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save SOAP')
    } finally {
      setSavingSOAP(false)
    }
  }

  async function handleAddDrug() {
    if (!selectedDrug || !consultation || !profile) return
    const drug = drugs.find(d => d.id === selectedDrug)
    if (!drug) return
    setAddingDrug(true)
    try {
      const rx = await addPrescription({
        patient_id:         patientId!,
        consultation_id:    consultation.id,
        drug_id:            selectedDrug,
        quantity:           parseInt(drugQty) || 1,
        unit_price_at_time: drug.unit_price,
        prescribed_by:      profile.id,
      })
      setPrescriptions(prev => [...prev, rx])
      setSelectedDrug('')
      setDrugQty('1')
      toast.success(`${drug.name} prescribed`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add prescription')
    } finally {
      setAddingDrug(false)
    }
  }

  async function handleRemoveDrug(id: string) {
    try {
      await deletePrescription(id)
      setPrescriptions(prev => prev.filter(rx => rx.id !== id))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove')
    }
  }

  async function handleAddTest() {
    if (!selectedTest || !consultation || !profile) return
    setAddingTest(true)
    try {
      const order = await addLabOrder({
        patient_id:      patientId!,
        consultation_id: consultation.id,
        lab_test_id:     selectedTest,
        ordered_by:      profile.id,
      })
      setLabOrders(prev => [...prev, order])
      setSelectedTest('')
      const test = labTests.find(t => t.id === selectedTest)
      toast.success(`${test?.name ?? 'Test'} ordered`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add lab order')
    } finally {
      setAddingTest(false)
    }
  }

  async function handleRemoveTest(id: string) {
    try {
      await deleteLabOrder(id)
      setLabOrders(prev => prev.filter(o => o.id !== id))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove')
    }
  }

  async function sendToLab() {
    if (!patientId) return
    setFinalizing(true)
    try {
      await saveSOAP()
      const updated = await updatePatientStatus(patientId, 'awaiting_lab')
      setPatient(updated)
      toast.success('Patient sent to lab')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    } finally {
      setFinalizing(false)
    }
  }

  async function finalizeConsultation() {
    if (!patientId) return
    setFinalizing(true)
    try {
      await saveSOAP()
      const updated = await updatePatientStatus(patientId, 'completed')
      setPatient(updated)
      toast.success('Consultation finalized')
      navigate(-1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    } finally {
      setFinalizing(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading consultation…
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

  const patientName    = `${patient.wife_surname ?? ''} ${patient.wife_other_names ?? ''}`.trim() || '—'
  const pendingOrders  = labOrders.filter(o => o.status !== 'completed')
  const isResultsReady = patient.status === 'results_ready'
  const isCompleted    = patient.status === 'completed'
  const isInLab        = ['awaiting_lab', 'lab_in_progress'].includes(patient.status)
  const isReadOnly     = isInLab || isCompleted

  const canSendToLab = patient.status === 'in_consultation' && pendingOrders.length > 0
  const canFinalize  = patient.status === 'in_consultation' || isResultsReady
  const showAddForms = patient.status === 'in_consultation'

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{patientName}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xs text-[#2563EB] font-semibold">{patient.patient_code}</span>
              <StatusBadge status={patient.status} />
            </div>
          </div>
        </div>
        {isReadOnly && (
          <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-3 py-1 font-medium">Read-only</span>
        )}
      </div>

      {/* Results-ready banner */}
      {isResultsReady && (
        <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-100 p-4">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-800">Lab results are ready</p>
            <p className="text-xs text-green-600">Review the results in the Lab Orders tab, then finalize.</p>
          </div>
          <Button
            size="sm"
            onClick={finalizeConsultation}
            disabled={finalizing}
            className="gap-2 bg-green-600 hover:bg-green-700 shrink-0"
          >
            {finalizing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            Finalize
          </Button>
        </div>
      )}

      {/* Vitals summary */}
      {vitals && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          <VitalChip label="BP"    value={vitals.bp_systolic && vitals.bp_diastolic ? `${vitals.bp_systolic}/${vitals.bp_diastolic}` : '—'} />
          <VitalChip label="Pulse" value={vitals.pulse ? `${vitals.pulse} bpm` : '—'} />
          <VitalChip label="Temp"  value={vitals.temperature ? `${vitals.temperature}°C` : '—'} />
          <VitalChip label="Wt"    value={vitals.weight ? `${vitals.weight} kg` : '—'} />
          <VitalChip label="Persp" value={vitals.perspiration ?? '—'} />
        </div>
      )}

      {/* Main content tabs */}
      <Tabs defaultValue="soap">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="soap" className="gap-1.5">
            SOAP Note
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="gap-1.5">
            <Pill className="h-3.5 w-3.5" />
            Prescriptions {prescriptions.length > 0 && `(${prescriptions.length})`}
          </TabsTrigger>
          <TabsTrigger value="lab" className="gap-1.5">
            <FlaskConical className="h-3.5 w-3.5" />
            Lab Orders {labOrders.length > 0 && `(${labOrders.length})`}
          </TabsTrigger>
        </TabsList>

        {/* ── SOAP Note ── */}
        <TabsContent value="soap" className="mt-4">
          <SectionCard title="SOAP Note" description="Subjective · Objective · Assessment · Plan">
            <div className="space-y-4">
              <SoapField
                label="S — Subjective"
                value={soap.subjective}
                onChange={v => setSoap(prev => ({ ...prev, subjective: v }))}
                placeholder="Chief complaint, history of presenting illness, patient-reported symptoms…"
              />
              <SoapField
                label="O — Objective"
                value={soap.objective}
                onChange={v => setSoap(prev => ({ ...prev, objective: v }))}
                placeholder="Examination findings, test results, observations…"
              />
              <SoapField
                label="A — Assessment"
                value={soap.assessment}
                onChange={v => setSoap(prev => ({ ...prev, assessment: v }))}
                placeholder="Diagnosis, differential diagnoses…"
              />
              <SoapField
                label="P — Plan"
                value={soap.plan}
                onChange={v => setSoap(prev => ({ ...prev, plan: v }))}
                placeholder="Treatment plan, follow-up instructions, referrals…"
              />
              {(!isReadOnly || isResultsReady) && (
                <Button onClick={saveSOAP} disabled={savingSOAP} variant="outline" className="gap-2">
                  {savingSOAP ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save SOAP
                </Button>
              )}
            </div>
          </SectionCard>
        </TabsContent>

        {/* ── Prescriptions ── */}
        <TabsContent value="prescriptions" className="mt-4">
          <SectionCard title="Prescriptions" description="Drugs prescribed in this consultation">
            <div className="space-y-4">
              {/* List */}
              {prescriptions.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No prescriptions yet</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {prescriptions.map(rx => {
                    const drug = drugs.find(d => d.id === rx.drug_id)
                    return (
                      <div key={rx.id} className="flex items-center justify-between py-3 gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{drug?.name ?? '—'}</p>
                          <p className="text-xs text-slate-400">
                            Qty: {rx.quantity} · ₦{rx.unit_price_at_time.toLocaleString()} each
                          </p>
                        </div>
                        {showAddForms && (
                          <Button
                            variant="ghost" size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveDrug(rx.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Add form */}
              {showAddForms && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold text-slate-500">Add Prescription</p>
                    <div className="flex gap-2">
                      <Select value={selectedDrug} onValueChange={setSelectedDrug}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select drug…" />
                        </SelectTrigger>
                        <SelectContent>
                          {drugs.map(d => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name} — ₦{d.unit_price.toLocaleString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number" min="1" max="999"
                        value={drugQty}
                        onChange={e => setDrugQty(e.target.value)}
                        className="w-20"
                        placeholder="Qty"
                      />
                      <Button
                        onClick={handleAddDrug}
                        disabled={!selectedDrug || addingDrug}
                        className="gap-1.5 shrink-0"
                      >
                        {addingDrug ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        Add
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </SectionCard>
        </TabsContent>

        {/* ── Lab Orders ── */}
        <TabsContent value="lab" className="mt-4">
          <SectionCard title="Lab Orders" description="Tests ordered for this patient">
            <div className="space-y-4">
              {/* List */}
              {labOrders.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No lab orders yet</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {labOrders.map(order => {
                    const test = labTests.find(t => t.id === order.lab_test_id)
                    return (
                      <div key={order.id} className="flex items-center justify-between py-3 gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{test?.name ?? '—'}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${
                              order.status === 'completed'   ? 'bg-green-100 text-green-700'
                              : order.status === 'in_progress' ? 'bg-cyan-100 text-cyan-700'
                              : order.status === 'assigned'    ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                            }`}>{order.status.replace(/_/g, ' ')}</span>
                            <span className="text-xs text-slate-400">₦{(test?.price ?? 0).toLocaleString()}</span>
                          </div>
                          {order.result_notes && (
                            <p className="text-xs text-slate-600 mt-1 bg-green-50 rounded px-2 py-1">
                              Result: {order.result_notes}
                            </p>
                          )}
                        </div>
                        {showAddForms && order.status === 'ordered' && (
                          <Button
                            variant="ghost" size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveTest(order.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Add form */}
              {showAddForms && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold text-slate-500">Order a Test</p>
                    <div className="flex gap-2">
                      <Select value={selectedTest} onValueChange={setSelectedTest}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select test…" />
                        </SelectTrigger>
                        <SelectContent>
                          {labTests.map(t => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name} — ₦{t.price.toLocaleString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleAddTest}
                        disabled={!selectedTest || addingTest}
                        className="gap-1.5 shrink-0"
                      >
                        {addingTest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        Order
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* Action bar — shown when in_consultation (isReadOnly excludes results_ready now) */}
      {!isReadOnly && !isResultsReady && (
        <div className="flex items-center justify-between gap-3 pb-6 pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            {prescriptions.length} drug{prescriptions.length !== 1 ? 's' : ''} · {labOrders.length} test{labOrders.length !== 1 ? 's' : ''} ordered
          </p>
          <div className="flex gap-2">
            {canSendToLab && (
              <Button
                variant="outline"
                onClick={sendToLab}
                disabled={finalizing}
                className="gap-2 border-amber-200 text-amber-700 hover:bg-amber-50"
              >
                {finalizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendToBack className="h-4 w-4" />}
                Send to Lab
              </Button>
            )}
            {canFinalize && (
              <Button
                onClick={finalizeConsultation}
                disabled={finalizing}
                className="gap-2"
              >
                {finalizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Finalize Consultation
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
