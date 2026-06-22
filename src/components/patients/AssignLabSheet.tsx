import { useState, useEffect } from 'react'
import { Loader2, FlaskConical, UserCheck } from 'lucide-react'
import { Button }   from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { fetchUnassignedOrders, assignLabOrder, fetchLabTechs, fetchLabTestsCatalog } from '@/lib/labQueries'
import { useAuth } from '@/contexts/AuthContext'
import { toast }   from 'sonner'
import type { Patient, LabOrder, LabTest, Profile } from '@/lib/database.types'

interface Props {
  patient:    Patient | null
  open:       boolean
  onClose:    () => void
  onComplete: () => void
}

function patientName(p: Patient) {
  return `${p.wife_surname ?? ''} ${p.wife_other_names ?? ''}`.trim() || '—'
}

export function AssignLabSheet({ patient, open, onClose, onComplete }: Props) {
  const { profile } = useAuth()

  const [orders,     setOrders]     = useState<LabOrder[]>([])
  const [tests,      setTests]      = useState<LabTest[]>([])
  const [techs,      setTechs]      = useState<Profile[]>([])
  const [selections, setSelections] = useState<Record<string, string>>({}) // orderId → techId
  const [assigning,  setAssigning]  = useState<Record<string, boolean>>({})
  const [loading,    setLoading]    = useState(false)

  useEffect(() => {
    if (!patient || !open) { setOrders([]); return }
    setLoading(true)
    Promise.all([
      fetchUnassignedOrders(patient.id),
      fetchLabTestsCatalog(),
      fetchLabTechs(),
    ])
      .then(([o, t, techs]) => {
        setOrders(o)
        setTests(t)
        setTechs(techs)
      })
      .catch(err => toast.error(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [patient, open])

  async function handleAssign(orderId: string) {
    const techId = selections[orderId]
    if (!techId || !profile) return
    setAssigning(prev => ({ ...prev, [orderId]: true }))
    try {
      const updated = await assignLabOrder(orderId, techId, profile.id)
      setOrders(prev => prev.filter(o => o.id !== updated.id))
      const test = tests.find(t => t.id === updated.lab_test_id)
      const tech = techs.find(t => t.id === techId)
      toast.success(`${test?.name ?? 'Test'} assigned to ${tech?.full_name ?? 'lab tech'}`)
      if (orders.length <= 1) {
        onComplete()
        onClose()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to assign')
    } finally {
      setAssigning(prev => ({ ...prev, [orderId]: false }))
    }
  }

  return (
    <Sheet open={open} onOpenChange={open => { if (!open) onClose() }}>
      <SheetContent className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-[#2563EB]" />
            Assign Lab Technician
          </SheetTitle>
          <SheetDescription>
            {patient ? `${patientName(patient)} · ${patient.patient_code ?? ''}` : ''}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-xl bg-green-50 border border-green-100 p-4 text-sm text-green-700 text-center">
              All orders for this patient have been assigned.
            </div>
          ) : techs.length === 0 ? (
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-700 text-center">
              No active lab technicians found. Ask your admin to add lab tech accounts.
            </div>
          ) : (
            orders.map(order => {
              const test = tests.find(t => t.id === order.lab_test_id)
              return (
                <div key={order.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{test?.name ?? 'Unknown test'}</p>
                    <p className="text-xs text-slate-400">₦{(test?.price ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={selections[order.id] ?? ''}
                      onValueChange={val => setSelections(prev => ({ ...prev, [order.id]: val }))}
                    >
                      <SelectTrigger className="flex-1 bg-white">
                        <SelectValue placeholder="Select lab tech…" />
                      </SelectTrigger>
                      <SelectContent>
                        {techs.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      onClick={() => handleAssign(order.id)}
                      disabled={!selections[order.id] || assigning[order.id]}
                      className="gap-1.5 shrink-0"
                    >
                      {assigning[order.id]
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <UserCheck className="h-3.5 w-3.5" />
                      }
                      Assign
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
