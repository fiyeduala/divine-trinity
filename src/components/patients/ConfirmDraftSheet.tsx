import { useState } from 'react'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { confirmDraft } from '@/lib/patientQueries'
import { useAuth } from '@/contexts/AuthContext'
import type { Patient } from '@/lib/database.types'

interface Props {
  patient: Patient | null
  open: boolean
  onClose: () => void
  onConfirmed: (updated: Patient) => void
}

function DL({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <dt className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">{label}</dt>
      <dd className="text-sm text-slate-800 mt-0.5">{value ?? <span className="text-slate-300 italic">—</span>}</dd>
    </div>
  )
}

export function ConfirmDraftSheet({ patient, open, onClose, onConfirmed }: Props) {
  const { profile } = useAuth()
  const [editing,   setEditing]   = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [errorMsg,  setErrorMsg]  = useState<string | null>(null)

  // Editable overrides — only the fields the receptionist is most likely to fix
  const [phone,    setPhone]    = useState('')
  const [surname,  setSurname]  = useState('')
  const [otherNames, setOtherNames] = useState('')
  const [address,  setAddress]  = useState('')

  function startEdit() {
    if (!patient) return
    setPhone(patient.wife_phone ?? '')
    setSurname(patient.wife_surname ?? '')
    setOtherNames(patient.wife_other_names ?? '')
    setAddress(patient.address ?? '')
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setErrorMsg(null)
  }

  async function handleConfirm() {
    if (!patient || !profile) return
    setSaving(true)
    setErrorMsg(null)
    try {
      const updates = editing ? {
        wife_surname:     surname.trim()     || patient.wife_surname,
        wife_other_names: otherNames.trim()  || patient.wife_other_names,
        wife_phone:       phone.trim()       || patient.wife_phone,
        address:          address.trim()     || patient.address,
      } : undefined

      const updated = await confirmDraft(patient.id, profile.id, updates)
      onConfirmed(updated)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to confirm patient.')
    } finally {
      setSaving(false)
    }
  }

  if (!patient) return null

  const displayName = `${patient.wife_surname ?? ''} ${patient.wife_other_names ?? ''}`.trim()
  const regDate = new Date(patient.created_at).toLocaleString('en-NG', {
    dateStyle: 'medium', timeStyle: 'short',
  })

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) { setEditing(false); setErrorMsg(null); onClose() } }}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Confirm Draft Patient</SheetTitle>
          <SheetDescription>Review the details submitted via QR form and confirm to generate a patient ID.</SheetDescription>
        </SheetHeader>

        {errorMsg && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 p-3 mb-4 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            {errorMsg}
          </div>
        )}

        {/* Patient details */}
        {!editing ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Wife / Female Partner</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                <DL label="Surname"     value={patient.wife_surname} />
                <DL label="Other Names" value={patient.wife_other_names} />
                <DL label="Phone"       value={patient.wife_phone} />
                <DL label="Email"       value={patient.email} />
                <DL label="Date of Birth" value={patient.wife_dob} />
                <DL label="Age"         value={patient.wife_age} />
                <DL label="Occupation"  value={patient.occupation} />
                <DL label="Religion"    value={patient.religion} />
              </dl>
            </div>
            <Separator />
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Husband / Male Partner</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                <DL label="Surname"     value={patient.husband_surname} />
                <DL label="Other Names" value={patient.husband_other_names} />
                <DL label="Phone"       value={patient.husband_phone} />
                <DL label="Age"         value={patient.husband_age} />
              </dl>
            </div>
            <Separator />
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Other</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                <DL label="Address"          value={patient.address} />
                <DL label="Marital Status"   value={patient.marital_status} />
                <DL label="Married Duration" value={patient.married_duration} />
                <DL label="Prev. Surgery"    value={patient.previous_surgery} />
                <DL label="Gravida"          value={patient.gravida} />
              </dl>
            </div>
            <Separator />
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Contact Person</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                <DL label="Name"    value={patient.contact_name} />
                <DL label="Phone"   value={patient.contact_phone} />
                <DL label="Email"   value={patient.contact_email} />
                <DL label="Address" value={patient.contact_address} />
              </dl>
            </div>
            <Separator />
            <p className="text-xs text-slate-400">Self-registered via QR form · {regDate}</p>
          </div>
        ) : (
          /* Quick-edit mode */
          <div className="space-y-4">
            <p className="text-xs text-slate-500 bg-amber-50 border border-amber-100 rounded-lg p-3">
              Editing key fields only. Full edit is available from the patient folder after confirmation.
            </p>
            <div className="space-y-1.5">
              <Label>Surname</Label>
              <Input value={surname} onChange={e => setSurname(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Other Names</Label>
              <Input value={otherNames} onChange={e => setOtherNames(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input value={address} onChange={e => setAddress(e.target.value)} />
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-slate-100">
          {!editing ? (
            <>
              <Button onClick={handleConfirm} disabled={saving} className="w-full gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {saving ? 'Registering…' : `Confirm & Register ${displayName}`}
              </Button>
              <Button variant="outline" onClick={startEdit} disabled={saving} className="w-full">
                Edit Details
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleConfirm} disabled={saving} className="w-full gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {saving ? 'Registering…' : 'Save & Confirm'}
              </Button>
              <Button variant="outline" onClick={cancelEdit} disabled={saving} className="w-full">
                Cancel Edit
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
