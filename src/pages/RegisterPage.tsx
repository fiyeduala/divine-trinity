import { useState } from 'react'
import { Heart, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormSection } from '@/components/shared/SectionCard'

const steps = ['Wife Details', 'Husband Details', 'Other Info', 'Contact Person']

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 flex-1">
          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${i < current ? 'bg-[#2563EB] text-white' : i === current ? 'bg-[#2563EB] text-white ring-4 ring-[#DBEAFE]' : 'bg-slate-100 text-slate-400'}`}>
            {i < current ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
          </div>
          {i < total - 1 && <div className={`h-0.5 flex-1 ${i < current ? 'bg-[#2563EB]' : 'bg-slate-200'}`} />}
        </div>
      ))}
    </div>
  )
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

export function RegisterPage() {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  function next() { if (step < steps.length - 1) setStep(s => s + 1) }
  function back() { if (step > 0) setStep(s => s - 1) }
  function submit() { setSubmitted(true) }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EFF6FF] via-white to-[#F0FDFA] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-10 max-w-md w-full text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Registration Submitted!</h2>
          <p className="text-sm text-slate-500 mb-6">Your information has been received. Please proceed to the reception desk for confirmation.</p>
          <Button onClick={() => setSubmitted(false)} variant="outline" className="w-full">Register another patient</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFF6FF] via-white to-[#F0FDFA] flex flex-col">
      {/* Header */}
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
          {/* Step progress */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-4">
            <h2 className="text-base font-semibold text-slate-900 mb-1">
              Step {step + 1} of {steps.length}: {steps[step]}
            </h2>
            <p className="text-xs text-slate-500 mb-4">Please fill in all required fields accurately.</p>
            <StepIndicator current={step} total={steps.length} />
          </div>

          {/* Step content */}
          {step === 0 && (
            <FormSection title="Wife / Female Partner Details">
              <div className="space-y-4">
                <FieldRow>
                  <Field label="First Name *"><Input placeholder="e.g. Amaka" /></Field>
                  <Field label="Last Name *"><Input placeholder="e.g. Okonkwo" /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Date of Birth *"><Input type="date" /></Field>
                  <Field label="Age"><Input type="number" placeholder="Auto-calculated" readOnly /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Phone Number *"><Input type="tel" placeholder="+234 801 234 5678" /></Field>
                  <Field label="Email Address"><Input type="email" placeholder="amaka@email.com" /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Marital Status *">
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Occupation"><Input placeholder="e.g. Nurse" /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Previous Surgery?">
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="abdominal">Abdominal surgery</SelectItem>
                        <SelectItem value="cesarean">Cesarean section</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Number of Children">
                    <Input type="number" min="0" placeholder="0" />
                  </Field>
                </FieldRow>
                <Field label="Home Address *"><Input placeholder="Full address" /></Field>
              </div>
            </FormSection>
          )}

          {step === 1 && (
            <FormSection title="Husband / Male Partner Details">
              <div className="space-y-4">
                <FieldRow>
                  <Field label="First Name *"><Input placeholder="e.g. Chukwuemeka" /></Field>
                  <Field label="Last Name *"><Input placeholder="e.g. Okonkwo" /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Date of Birth"><Input type="date" /></Field>
                  <Field label="Age"><Input type="number" placeholder="Auto-calculated" readOnly /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Phone Number *"><Input type="tel" placeholder="+234 801 234 5678" /></Field>
                  <Field label="Email Address"><Input type="email" placeholder="emeka@email.com" /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Occupation"><Input placeholder="e.g. Engineer" /></Field>
                  <Field label="Previous Surgery?">
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="hernia">Hernia repair</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldRow>
                <Field label="Home Address"><Input placeholder="Same as wife if identical" /></Field>
              </div>
            </FormSection>
          )}

          {step === 2 && (
            <FormSection title="Additional Information">
              <div className="space-y-4">
                <FieldRow>
                  <Field label="Religion">
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="christianity">Christianity</SelectItem>
                        <SelectItem value="islam">Islam</SelectItem>
                        <SelectItem value="traditional">Traditional</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Tribe / Ethnicity"><Input placeholder="e.g. Igbo" /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Referral Source">
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="walk_in">Walk-in</SelectItem>
                        <SelectItem value="doctor_referral">Doctor referral</SelectItem>
                        <SelectItem value="social_media">Social media</SelectItem>
                        <SelectItem value="friend">Friend / Family</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Blood Group (Wife)">
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                      <SelectContent>
                        {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                          <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldRow>
              </div>
            </FormSection>
          )}

          {step === 3 && (
            <FormSection title="Emergency / Contact Person">
              <div className="space-y-4">
                <FieldRow>
                  <Field label="Contact Name *"><Input placeholder="Full name" /></Field>
                  <Field label="Relationship *">
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Phone Number *"><Input type="tel" placeholder="+234 801 234 5678" /></Field>
                  <Field label="Alternative Phone"><Input type="tel" placeholder="+234 701 234 5678" /></Field>
                </FieldRow>
                <Field label="Address"><Input placeholder="Contact person address" /></Field>
              </div>
            </FormSection>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4 gap-3">
            <Button variant="outline" onClick={back} disabled={step === 0} className="gap-2">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={next} className="gap-2">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={submit} variant="success" className="gap-2">
                <CheckCircle2 className="h-4 w-4" /> Submit Registration
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
