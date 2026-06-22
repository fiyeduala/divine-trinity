import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button }       from '@/components/ui/button'
import { Input }        from '@/components/ui/input'
import { Label }        from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormSection }  from '@/components/shared/SectionCard'
import { PageHeader }   from '@/components/shared/PageHeader'
import { createRegisteredPatient } from '@/lib/patientQueries'
import { useAuth }      from '@/contexts/AuthContext'
import { toast }        from 'sonner'

const STEPS = ['Wife Details', 'Husband Details', 'Other Info', 'Contact Person']

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

export function NewPatientPage() {
  const navigate    = useNavigate()
  const { profile } = useAuth()
  const [step,      setStep]      = useState(0)
  const [form,      setForm]      = useState<FormState>(EMPTY)
  const [saving,    setSaving]    = useState(false)
  const [errorMsg,  setErrorMsg]  = useState<string | null>(null)

  function set(key: keyof FormState, value: string) {
    if (key === 'wife_dob' && value) {
      const age = Math.floor((Date.now() - new Date(value).getTime()) / (365.25 * 24 * 3600 * 1000))
      setForm(prev => ({ ...prev, wife_dob: value, wife_age: age.toString() }))
    } else {
      setForm(prev => ({ ...prev, [key]: value }))
    }
  }

  async function handleSubmit() {
    if (!profile) return
    setSaving(true)
    setErrorMsg(null)
    try {
      const patient = await createRegisteredPatient({
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
        assigned_doctor_id:  null,
        assigned_room:       null,
      }, profile.id)

      toast.success(`Patient registered: ${patient.patient_code}`)
      navigate(`/patients/${patient.id}`)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <PageHeader
        title="Register New Patient"
        subtitle="Manual registration by receptionist — patient code issued immediately"
        action={<Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>}
      />

      {/* Step indicator */}
      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => i < step && setStep(i)}
            className={`flex-1 text-[10px] font-medium py-1.5 rounded-full transition-colors ${
              i === step
                ? 'bg-[#2563EB] text-white'
                : i < step
                ? 'bg-[#DBEAFE] text-[#2563EB] cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {errorMsg}
        </div>
      )}

      {/* Step 0 */}
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
              <Field label="Age"><Input type="number" value={form.wife_age} onChange={e => set('wife_age', e.target.value)} placeholder="Years" /></Field>
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
                <Select value={form.previous_surgery} onValueChange={v => set('previous_surgery', v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="abdominal">Abdominal surgery</SelectItem>
                    <SelectItem value="cesarean">Cesarean section</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="No. of Children (Gravida)"><Input type="number" min="0" value={form.gravida} onChange={e => set('gravida', e.target.value)} /></Field>
            </Row>
            <Row>
              <Field label="Occupation"><Input value={form.occupation} onChange={e => set('occupation', e.target.value)} placeholder="e.g. Nurse" /></Field>
            </Row>
            <Field label="Home Address"><Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full home address" /></Field>
          </div>
        </FormSection>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <FormSection title="Husband / Male Partner Details">
          <div className="space-y-4">
            <Row>
              <Field label="Surname"><Input value={form.husband_surname} onChange={e => set('husband_surname', e.target.value)} placeholder="e.g. Okonkwo" /></Field>
              <Field label="Other Names"><Input value={form.husband_other_names} onChange={e => set('husband_other_names', e.target.value)} placeholder="e.g. Emeka" /></Field>
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

      {/* Step 2 */}
      {step === 2 && (
        <FormSection title="Additional Information">
          <div className="space-y-4">
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
          </div>
        </FormSection>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <FormSection title="Emergency / Contact Person">
          <div className="space-y-4">
            <Row>
              <Field label="Contact Name"><Input value={form.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder="Full name" /></Field>
              <Field label="Phone Number"><Input type="tel" value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} placeholder="+234 801 234 5678" /></Field>
            </Row>
            <Row>
              <Field label="Email"><Input type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} placeholder="contact@email.com" /></Field>
            </Row>
            <Field label="Address"><Input value={form.contact_address} onChange={e => set('contact_address', e.target.value)} placeholder="Contact person address" /></Field>
          </div>
        </FormSection>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 pb-6">
        <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0} className="gap-2">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={step === 0 && (!form.wife_surname || !form.wife_phone)} className="gap-2">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={saving} className="gap-2">
            {saving ? 'Registering…' : <><CheckCircle2 className="h-4 w-4" /> Register Patient</>}
          </Button>
        )}
      </div>
    </div>
  )
}
