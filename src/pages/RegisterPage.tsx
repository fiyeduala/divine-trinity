import { useState } from 'react'
import { Heart, CheckCircle2, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormSection } from '@/components/shared/SectionCard'
import { createDraftPatient } from '@/lib/patientQueries'
import type { PatientInsert } from '@/lib/patientQueries'

const STEPS = ['Wife Details', 'Husband Details', 'Other Info', 'Contact Person']

// ── Tiny sub-components ───────────────────────────────────────────────────────

function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 flex-1">
          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
            i < current  ? 'bg-[#2563EB] text-white'
            : i === current ? 'bg-[#2563EB] text-white ring-4 ring-[#DBEAFE]'
            : 'bg-slate-100 text-slate-400'
          }`}>
            {i < current ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
          </div>
          {i < total - 1 && <div className={`h-0.5 flex-1 ${i < current ? 'bg-[#2563EB]' : 'bg-slate-200'}`} />}
        </div>
      ))}
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}{required && <span className="text-red-500 ml-0.5">*</span>}</Label>
      {children}
    </div>
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────

type FormState = {
  wife_surname: string; wife_other_names: string; wife_phone: string
  wife_dob: string; wife_age: string; address: string; email: string; occupation: string
  husband_surname: string; husband_other_names: string; husband_phone: string
  husband_email: string; husband_age: string
  religion: string; marital_status: string; married_duration: string
  previous_surgery: string; gravida: string
  contact_name: string; contact_phone: string; contact_address: string; contact_email: string
}

const EMPTY: FormState = {
  wife_surname: '', wife_other_names: '', wife_phone: '', wife_dob: '', wife_age: '',
  address: '', email: '', occupation: '',
  husband_surname: '', husband_other_names: '', husband_phone: '',
  husband_email: '', husband_age: '',
  religion: '', marital_status: '', married_duration: '', previous_surgery: '', gravida: '0',
  contact_name: '', contact_phone: '', contact_address: '', contact_email: '',
}

export function RegisterPage() {
  const [step,      setStep]      = useState(0)
  const [form,      setForm]      = useState<FormState>(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg,  setErrorMsg]  = useState<string | null>(null)

  function set(key: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
    // Auto-compute age from DOB
    if (key === 'wife_dob' && value) {
      const age = Math.floor((Date.now() - new Date(value).getTime()) / (365.25 * 24 * 3600 * 1000))
      setForm(prev => ({ ...prev, wife_dob: value, wife_age: age.toString() }))
    }
    if (key === 'husband_age') {
      setForm(prev => ({ ...prev, husband_age: value }))
    }
  }

  function next() { if (step < STEPS.length - 1) setStep(s => s + 1) }
  function back() { if (step > 0) setStep(s => s - 1) }

  async function submit() {
    setSubmitting(true)
    setErrorMsg(null)
    try {
      const payload: PatientInsert = {
        wife_surname:        form.wife_surname.trim(),
        wife_other_names:    form.wife_other_names.trim(),
        wife_phone:          form.wife_phone.trim(),
        wife_dob:            form.wife_dob || null,
        wife_age:            form.wife_age ? parseInt(form.wife_age) : null,
        address:             form.address.trim() || null,
        email:               form.email.trim() || null,
        occupation:          form.occupation.trim() || null,
        husband_surname:     form.husband_surname.trim() || null,
        husband_other_names: form.husband_other_names.trim() || null,
        husband_phone:       form.husband_phone.trim() || null,
        husband_email:       form.husband_email.trim() || null,
        husband_age:         form.husband_age ? parseInt(form.husband_age) : null,
        religion:            form.religion || null,
        marital_status:      form.marital_status || null,
        married_duration:    form.married_duration.trim() || null,
        previous_surgery:    form.previous_surgery || null,
        gravida:             parseInt(form.gravida) || 0,
        contact_name:        form.contact_name.trim() || null,
        contact_phone:       form.contact_phone.trim() || null,
        contact_address:     form.contact_address.trim() || null,
        contact_email:       form.contact_email.trim() || null,
        source:              'self_qr',
        created_by:          null,
        assigned_doctor_id:  null,
        assigned_room:       null,
      }
      await createDraftPatient(payload)
      setSubmitted(true)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EFF6FF] via-white to-[#F0FDFA] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-10 max-w-md w-full text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Registration Submitted!</h2>
          <p className="text-sm text-slate-500 mb-6">
            Your information has been received. Please proceed to the reception desk — a staff member will confirm your registration and issue your patient ID.
          </p>
          <Button onClick={() => { setSubmitted(false); setForm(EMPTY); setStep(0) }} variant="outline" className="w-full">
            Register another patient
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFF6FF] via-white to-[#F0FDFA] flex flex-col">
      <header className="flex items-center gap-3 px-4 py-4 bg-white border-b border-slate-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]">
          <Heart className="h-4 w-4 text-white" fill="white" />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-900 leading-tight">Divine Trinity Fertility Clinic</div>
          <div className="text-[10px] text-slate-400">New Patient Registration</div>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center p-4 pt-6">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-4">
            <h2 className="text-base font-semibold text-slate-900 mb-1">
              Step {step + 1} of {STEPS.length}: {STEPS[step]}
            </h2>
            <p className="text-xs text-slate-500 mb-4">Fields marked <span className="text-red-500">*</span> are required.</p>
            <StepBar current={step} total={STEPS.length} />
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 p-3 mb-4 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {errorMsg}
            </div>
          )}

          {/* Step 0 — Wife */}
          {step === 0 && (
            <FormSection title="Wife / Female Partner Details">
              <div className="space-y-4">
                <Row>
                  <Field label="Surname" required><Input value={form.wife_surname} onChange={e => set('wife_surname', e.target.value)} placeholder="e.g. Okonkwo" /></Field>
                  <Field label="Other Names" required><Input value={form.wife_other_names} onChange={e => set('wife_other_names', e.target.value)} placeholder="e.g. Amaka" /></Field>
                </Row>
                <Row>
                  <Field label="Phone Number" required><Input type="tel" value={form.wife_phone} onChange={e => set('wife_phone', e.target.value)} placeholder="+234 801 234 5678" /></Field>
                  <Field label="Email"><Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="amaka@email.com" /></Field>
                </Row>
                <Row>
                  <Field label="Date of Birth"><Input type="date" value={form.wife_dob} onChange={e => set('wife_dob', e.target.value)} /></Field>
                  <Field label="Age (auto-filled)"><Input type="number" value={form.wife_age} onChange={e => set('wife_age', e.target.value)} placeholder="Years" /></Field>
                </Row>
                <Row>
                  <Field label="Marital Status">
                    <Select value={form.marital_status} onValueChange={v => set('marital_status', v)}>
                      <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Duration of Marriage"><Input value={form.married_duration} onChange={e => set('married_duration', e.target.value)} placeholder="e.g. 3 years" /></Field>
                </Row>
                <Row>
                  <Field label="Previous Surgery">
                    <Select value={form.previous_surgery ?? ''} onValueChange={v => set('previous_surgery', v)}>
                      <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="abdominal">Abdominal surgery</SelectItem>
                        <SelectItem value="cesarean">Cesarean section</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="No. of Children (Gravida)"><Input type="number" min="0" value={form.gravida} onChange={e => set('gravida', e.target.value)} placeholder="0" /></Field>
                </Row>
                <Row>
                  <Field label="Occupation"><Input value={form.occupation} onChange={e => set('occupation', e.target.value)} placeholder="e.g. Nurse" /></Field>
                </Row>
                <Field label="Home Address"><Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full home address" /></Field>
              </div>
            </FormSection>
          )}

          {/* Step 1 — Husband */}
          {step === 1 && (
            <FormSection title="Husband / Male Partner Details">
              <div className="space-y-4">
                <Row>
                  <Field label="Surname"><Input value={form.husband_surname} onChange={e => set('husband_surname', e.target.value)} placeholder="e.g. Okonkwo" /></Field>
                  <Field label="Other Names"><Input value={form.husband_other_names} onChange={e => set('husband_other_names', e.target.value)} placeholder="e.g. Chukwuemeka" /></Field>
                </Row>
                <Row>
                  <Field label="Phone Number"><Input type="tel" value={form.husband_phone} onChange={e => set('husband_phone', e.target.value)} placeholder="+234 801 234 5678" /></Field>
                  <Field label="Email"><Input type="email" value={form.husband_email} onChange={e => set('husband_email', e.target.value)} placeholder="emeka@email.com" /></Field>
                </Row>
                <Row>
                  <Field label="Age"><Input type="number" value={form.husband_age} onChange={e => set('husband_age', e.target.value)} placeholder="Years" /></Field>
                </Row>
              </div>
            </FormSection>
          )}

          {/* Step 2 — Other info */}
          {step === 2 && (
            <FormSection title="Additional Information">
              <div className="space-y-4">
                <Row>
                  <Field label="Religion">
                    <Select value={form.religion} onValueChange={v => set('religion', v)}>
                      <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Christianity">Christianity</SelectItem>
                        <SelectItem value="Islam">Islam</SelectItem>
                        <SelectItem value="Traditional">Traditional</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </Row>
              </div>
            </FormSection>
          )}

          {/* Step 3 — Contact */}
          {step === 3 && (
            <FormSection title="Emergency / Contact Person">
              <div className="space-y-4">
                <Row>
                  <Field label="Contact Name" required><Input value={form.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder="Full name" /></Field>
                  <Field label="Phone Number" required><Input type="tel" value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} placeholder="+234 801 234 5678" /></Field>
                </Row>
                <Row>
                  <Field label="Email"><Input type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} placeholder="contact@email.com" /></Field>
                </Row>
                <Field label="Address"><Input value={form.contact_address} onChange={e => set('contact_address', e.target.value)} placeholder="Contact person address" /></Field>
              </div>
            </FormSection>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4 gap-3">
            <Button variant="outline" onClick={back} disabled={step === 0} className="gap-2">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={next} disabled={step === 0 && (!form.wife_surname || !form.wife_other_names || !form.wife_phone)} className="gap-2">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={submit} disabled={submitting} className="gap-2">
                {submitting ? 'Submitting…' : <><CheckCircle2 className="h-4 w-4" /> Submit Registration</>}
              </Button>
            )}
          </div>

          <p className="text-center text-xs text-slate-400 mt-6 pb-6">
            Your information is kept confidential · Divine Trinity Fertility Clinic
          </p>
        </div>
      </div>
    </div>
  )
}
