import { useState } from 'react'
import { Activity, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button }    from '@/components/ui/button'
import { Input }     from '@/components/ui/input'
import { Label }     from '@/components/ui/label'
import { Textarea }  from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { insertVitals } from '@/lib/vitalsQueries'
import { updatePatientStatus } from '@/lib/patientQueries'
import { useAuth } from '@/contexts/AuthContext'
import type { Patient } from '@/lib/database.types'

interface Props {
  patient: Patient | null
  open: boolean
  onClose: () => void
  onComplete: (updated: Patient) => void
}

type VitalsForm = {
  bp_systolic:  string
  bp_diastolic: string
  pulse:        string
  weight:       string
  temperature:  string
  perspiration: string
  notes:        string
  room:         string
}

const EMPTY: VitalsForm = {
  bp_systolic: '', bp_diastolic: '', pulse: '', weight: '',
  temperature: '', perspiration: '', notes: '', room: '',
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>
}
function Field({ label, unit, children }: { label: string; unit?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}{unit && <span className="text-slate-400 ml-1 font-normal">({unit})</span>}</Label>
      {children}
    </div>
  )
}

export function TriageSheet({ patient, open, onClose, onComplete }: Props) {
  const { profile }   = useAuth()
  const [form, setForm]     = useState<VitalsForm>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  function set(key: keyof VitalsForm, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function reset() { setForm(EMPTY); setError(null) }

  async function handleSubmit() {
    if (!patient || !profile) return
    if (!form.room) { setError('Please assign a doctor room before submitting.'); return }
    setSaving(true)
    setError(null)
    try {
      // Insert vitals record
      await insertVitals({
        patient_id:   patient.id,
        bp_systolic:  form.bp_systolic  ? parseInt(form.bp_systolic)     : null,
        bp_diastolic: form.bp_diastolic ? parseInt(form.bp_diastolic)    : null,
        pulse:        form.pulse        ? parseInt(form.pulse)           : null,
        weight:       form.weight       ? parseFloat(form.weight)        : null,
        temperature:  form.temperature  ? parseFloat(form.temperature)   : null,
        perspiration: form.perspiration || null,
        notes:        form.notes.trim() || null,
        taken_by:     profile.id,
      })

      // Advance patient status → ready_for_consultation + set assigned room
      const updated = await updatePatientStatus(patient.id, 'ready_for_consultation', {
        assigned_room: parseInt(form.room),
      })

      reset()
      onComplete(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vitals.')
    } finally {
      setSaving(false)
    }
  }

  if (!patient) return null

  const patientName = `${patient.wife_surname ?? ''} ${patient.wife_other_names ?? ''}`.trim() || '—'

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) { reset(); onClose() } }}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#0D9488]" /> Triage — {patientName}
          </SheetTitle>
          <SheetDescription>
            {patient.patient_code} · Record vital signs and assign a consultation room.
          </SheetDescription>
        </SheetHeader>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 p-3 mb-4 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{error}
          </div>
        )}

        <div className="space-y-5">
          {/* Blood pressure */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Blood Pressure</p>
            <Row>
              <Field label="Systolic" unit="mmHg">
                <Input
                  type="number" min="60" max="250"
                  value={form.bp_systolic}
                  onChange={e => set('bp_systolic', e.target.value)}
                  placeholder="120"
                />
              </Field>
              <Field label="Diastolic" unit="mmHg">
                <Input
                  type="number" min="40" max="150"
                  value={form.bp_diastolic}
                  onChange={e => set('bp_diastolic', e.target.value)}
                  placeholder="80"
                />
              </Field>
            </Row>
          </div>

          <Separator />

          {/* Other vitals */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Vitals</p>
            <div className="space-y-3">
              <Row>
                <Field label="Pulse" unit="bpm">
                  <Input
                    type="number" min="30" max="250"
                    value={form.pulse}
                    onChange={e => set('pulse', e.target.value)}
                    placeholder="72"
                  />
                </Field>
                <Field label="Temperature" unit="°C">
                  <Input
                    type="number" min="35" max="42" step="0.1"
                    value={form.temperature}
                    onChange={e => set('temperature', e.target.value)}
                    placeholder="36.6"
                  />
                </Field>
              </Row>
              <Row>
                <Field label="Weight" unit="kg">
                  <Input
                    type="number" min="10" max="300" step="0.1"
                    value={form.weight}
                    onChange={e => set('weight', e.target.value)}
                    placeholder="65"
                  />
                </Field>
                <Field label="Perspiration">
                  <Select value={form.perspiration} onValueChange={v => set('perspiration', v)}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="heavy">Heavy</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </Row>
            </div>
          </div>

          <Separator />

          {/* Doctor assignment */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Assign Consultation Room <span className="text-red-500">*</span></p>
            <Select value={form.room} onValueChange={v => set('room', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a doctor room…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Room 1</SelectItem>
                <SelectItem value="2">Room 2</SelectItem>
                <SelectItem value="3">Room 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs">Triage Notes <span className="text-slate-400 font-normal">(optional)</span></Label>
            <Textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Any observations or concerns…"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <Button onClick={handleSubmit} disabled={saving} className="w-full gap-2">
            {saving
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving vitals…</>
              : <><CheckCircle2 className="h-4 w-4" /> Submit &amp; Mark Ready for Consultation</>
            }
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
