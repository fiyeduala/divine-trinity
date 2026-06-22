import { useState } from 'react'
import { ArrowLeft, CheckCircle2, FlaskConical, Pill, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SectionCard, FormSection } from '@/components/shared/SectionCard'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

const VITALS = [
  { label: 'Blood Pressure',  value: '118 / 76 mmHg' },
  { label: 'Pulse Rate',      value: '72 bpm' },
  { label: 'Temperature',     value: '36.8 °C' },
  { label: 'Weight',          value: '62 kg' },
  { label: 'Height',          value: '165 cm' },
  { label: 'BMI',             value: '22.8' },
  { label: 'LMP',             value: 'Jun 01, 2026' },
  { label: 'Cycle Length',    value: '28 days' },
]

const LAB_RESULTS = [
  { test: 'FSH',         value: '7.2 mIU/mL',  flag: 'normal' },
  { test: 'LH',         value: '4.8 mIU/mL',  flag: 'normal' },
  { test: 'Estradiol',  value: '95 pg/mL',    flag: 'normal' },
  { test: 'AMH',        value: '0.8 ng/mL',   flag: 'low' },
  { test: 'Progesterone', value: '0.4 ng/mL', flag: 'normal' },
]

const AVAILABLE_TESTS = ['Hormone Panel', 'Semen Analysis', 'Ultrasound (TVS)', 'HSG', 'Blood Count', 'Prolactin', 'TSH', 'Fasting Blood Sugar']
const AVAILABLE_DRUGS = ['Clomiphene 50mg', 'Progesterone 200mg', 'Folic Acid 5mg', 'Metformin 500mg', 'Inositol 2g', 'Vitamin D 1000IU']

export function ConsultationPage() {
  const navigate = useNavigate()
  const [soap, setSoap] = useState({ S: '', O: '', A: '', P: '' })
  const [selectedTests, setSelectedTests] = useState<string[]>([])
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([])

  function toggleTest(t: string) {
    setSelectedTests(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }
  function toggleDrug(d: string) {
    setSelectedDrugs(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Consultation"
        subtitle="Amaka Okonkwo · DT-2024-001"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button size="sm" className="gap-2">
              <CheckCircle2 className="h-4 w-4" /> Complete
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: patient summary + vitals */}
        <div className="space-y-4 lg:col-span-1">
          {/* Patient summary */}
          <SectionCard title="Patient Summary">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Status</span>
                <StatusBadge status="in_consultation" />
              </div>
              <Separator />
              {[
                { label: 'Wife',     value: 'Amaka Okonkwo' },
                { label: 'Husband', value: 'Chukwuemeka Okonkwo' },
                { label: 'Age',     value: '32 yrs' },
                { label: 'ID',      value: 'DT-2024-001' },
                { label: 'Visit',   value: '1st visit' },
              ].map(i => (
                <div key={i.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{i.label}</span>
                  <span className="font-medium text-slate-900">{i.value}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Vitals */}
          <SectionCard title="Vitals">
            <div className="space-y-2">
              {VITALS.map(v => (
                <div key={v.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{v.label}</span>
                  <span className="font-medium text-slate-900">{v.value}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Lab results */}
          <SectionCard title="Lab Results">
            {LAB_RESULTS.length > 0 ? (
              <div className="space-y-2">
                {LAB_RESULTS.map(r => (
                  <div key={r.test} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{r.test}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{r.value}</span>
                      <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${r.flag === 'low' ? 'bg-red-100 text-red-600' : r.flag === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {r.flag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">No results yet</p>
            )}
          </SectionCard>
        </div>

        {/* Right: SOAP note + orders */}
        <div className="space-y-4 lg:col-span-2">
          <Tabs defaultValue="soap">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="soap" className="gap-2"><FileText className="h-3.5 w-3.5" />SOAP Note</TabsTrigger>
              <TabsTrigger value="tests" className="gap-2"><FlaskConical className="h-3.5 w-3.5" />Order Tests</TabsTrigger>
              <TabsTrigger value="drugs" className="gap-2"><Pill className="h-3.5 w-3.5" />Prescribe</TabsTrigger>
            </TabsList>

            <TabsContent value="soap">
              <FormSection title="SOAP Note">
                <div className="space-y-4">
                  {(['S', 'O', 'A', 'P'] as const).map(key => {
                    const labels = { S: 'Subjective — Chief complaint & history', O: 'Objective — Examination findings', A: 'Assessment — Diagnosis', P: 'Plan — Treatment plan' }
                    return (
                      <div key={key} className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#2563EB] text-white text-[10px] font-bold mr-1.5">{key}</span>
                          {labels[key]}
                        </Label>
                        <Textarea
                          rows={3}
                          placeholder={`Enter ${key === 'S' ? 'patient complaints…' : key === 'O' ? 'examination findings…' : key === 'A' ? 'diagnosis…' : 'treatment plan…'}`}
                          value={soap[key]}
                          onChange={e => setSoap(prev => ({ ...prev, [key]: e.target.value }))}
                        />
                      </div>
                    )
                  })}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">Save Draft</Button>
                    <Button size="sm">Save Note</Button>
                  </div>
                </div>
              </FormSection>
            </TabsContent>

            <TabsContent value="tests">
              <FormSection title="Order Lab Tests">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {AVAILABLE_TESTS.map(t => (
                    <button
                      key={t}
                      onClick={() => toggleTest(t)}
                      className={`flex items-center gap-2 rounded-lg border p-3 text-sm text-left transition-colors ${selectedTests.includes(t) ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                    >
                      <FlaskConical className="h-3.5 w-3.5 shrink-0" />
                      <span className="leading-tight">{t}</span>
                    </button>
                  ))}
                </div>
                {selectedTests.length > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-slate-600">{selectedTests.length} test(s) selected</span>
                    <Button size="sm">Send Orders</Button>
                  </div>
                )}
              </FormSection>
            </TabsContent>

            <TabsContent value="drugs">
              <FormSection title="Prescribe Medications">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {AVAILABLE_DRUGS.map(d => (
                    <button
                      key={d}
                      onClick={() => toggleDrug(d)}
                      className={`flex items-center gap-2 rounded-lg border p-3 text-sm text-left transition-colors ${selectedDrugs.includes(d) ? 'border-[#0D9488] bg-teal-50 text-[#0D9488]' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                    >
                      <Pill className="h-3.5 w-3.5 shrink-0" />
                      {d}
                    </button>
                  ))}
                </div>
                {selectedDrugs.length > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-slate-600">{selectedDrugs.length} drug(s) selected</span>
                    <Button size="sm" className="bg-[#0D9488] hover:bg-[#0F766E]">Generate Prescription</Button>
                  </div>
                )}
              </FormSection>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
