import { ArrowLeft, Printer, PlusCircle, CheckCircle2, Clock, FlaskConical, Stethoscope, UserCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SectionCard } from '@/components/shared/SectionCard'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

const TIMELINE = [
  { icon: UserCheck, label: 'Patient Registered',     time: 'Jun 22, 2026 · 08:15 AM', color: 'text-[#2563EB] bg-[#EFF6FF]' },
  { icon: Clock,     label: 'Arrived for Triage',     time: 'Jun 22, 2026 · 09:02 AM', color: 'text-amber-600 bg-amber-50' },
  { icon: Stethoscope, label: 'Consultation Started',  time: 'Jun 22, 2026 · 10:30 AM', color: 'text-indigo-600 bg-indigo-50' },
  { icon: FlaskConical, label: 'Lab Orders Sent',      time: 'Jun 22, 2026 · 11:00 AM', color: 'text-purple-600 bg-purple-50' },
  { icon: CheckCircle2, label: 'Results Received',     time: 'Jun 22, 2026 · 01:45 PM', color: 'text-[#0D9488] bg-teal-50' },
]

const CHARGES = [
  { description: 'Registration Fee',        amount: 5000,   date: 'Jun 22, 2026', status: 'paid' },
  { description: 'Consultation (Dr. Emeka)',amount: 15000,  date: 'Jun 22, 2026', status: 'paid' },
  { description: 'Hormone Panel',           amount: 22000,  date: 'Jun 22, 2026', status: 'unpaid' },
  { description: 'Ultrasound (TVS)',        amount: 18000,  date: 'Jun 22, 2026', status: 'unpaid' },
  { description: 'Prescription Drugs',      amount: 8500,   date: 'Jun 22, 2026', status: 'unpaid' },
]

const PAYMENTS = [
  { ref: 'PAY-001', amount: 20000, method: 'Bank Transfer', date: 'Jun 22, 2026', note: 'Registration + Consult' },
]

export function PatientFolderPage() {
  const navigate = useNavigate()
  const totalCharges = CHARGES.reduce((s, c) => s + c.amount, 0)
  const totalPaid    = PAYMENTS.reduce((s, p) => s + p.amount, 0)
  const balance      = totalCharges - totalPaid

  return (
    <div className="space-y-5">
      <PageHeader
        title="Patient Folder"
        subtitle="Amaka Okonkwo · DT-2024-001"
        action={
          <div className="flex gap-2 flex-wrap justify-end">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Printer className="h-4 w-4" /> Print Summary
            </Button>
          </div>
        }
      />

      {/* Demographics strip */}
      <SectionCard>
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-[#2563EB] text-xl font-bold">
            AO
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 flex-1 sm:grid-cols-4">
            {[
              { label: 'Wife',        value: 'Amaka Okonkwo' },
              { label: 'Husband',     value: 'Chukwuemeka Okonkwo' },
              { label: 'Patient ID',  value: 'DT-2024-001' },
              { label: 'Phone',       value: '0801 234 567' },
              { label: 'Age',         value: '32 years' },
              { label: 'Religion',    value: 'Christianity' },
              { label: 'Visit Date',  value: 'Jun 22, 2026' },
              { label: 'Status',      value: '' },
            ].map(f => (
              <div key={f.label}>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{f.label}</p>
                {f.label === 'Status'
                  ? <StatusBadge status="in_consultation" className="mt-0.5" />
                  : <p className="text-sm font-medium text-slate-900">{f.value}</p>
                }
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <Tabs defaultValue="timeline">
        <TabsList className="w-full sm:w-auto flex-wrap h-auto">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="charges">Charges</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        {/* Timeline */}
        <TabsContent value="timeline">
          <SectionCard title="Visit Timeline">
            <ol className="relative border-l border-slate-200 space-y-6 ml-3">
              {TIMELINE.map((item, i) => {
                const Icon = item.icon
                return (
                  <li key={i} className="ml-5">
                    <span className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ${item.color}`}>
                      <Icon className="h-3 w-3" />
                    </span>
                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.time}</p>
                  </li>
                )
              })}
            </ol>
          </SectionCard>
        </TabsContent>

        {/* Charges */}
        <TabsContent value="charges">
          <SectionCard title="Charges Ledger" action={<Button size="sm" variant="outline" className="gap-1.5"><PlusCircle className="h-3.5 w-3.5" />Add Charge</Button>}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100">
                  <tr>
                    <th className="pb-2 text-left text-xs font-semibold text-slate-500">Description</th>
                    <th className="pb-2 text-left text-xs font-semibold text-slate-500 hidden sm:table-cell">Date</th>
                    <th className="pb-2 text-right text-xs font-semibold text-slate-500">Amount (₦)</th>
                    <th className="pb-2 text-center text-xs font-semibold text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {CHARGES.map((c, i) => (
                    <tr key={i}>
                      <td className="py-3 text-slate-700">{c.description}</td>
                      <td className="py-3 text-slate-400 text-xs hidden sm:table-cell">{c.date}</td>
                      <td className="py-3 text-right font-medium text-slate-900">{c.amount.toLocaleString()}</td>
                      <td className="py-3 text-center">
                        <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${c.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200">
                    <td colSpan={2} className="pt-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Total</td>
                    <td className="pt-3 text-right font-bold text-slate-900">₦{totalCharges.toLocaleString()}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between">
              <div className="space-y-1 text-sm">
                <div className="flex gap-8">
                  <span className="text-slate-500">Total Charged</span>
                  <span className="font-semibold">₦{totalCharges.toLocaleString()}</span>
                </div>
                <div className="flex gap-8">
                  <span className="text-slate-500">Total Paid</span>
                  <span className="font-semibold text-[#16A34A]">₦{totalPaid.toLocaleString()}</span>
                </div>
                <div className="flex gap-8">
                  <span className="text-slate-500">Balance Due</span>
                  <span className="font-bold text-[#DC2626]">₦{balance.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments">
          <SectionCard
            title="Payment Records"
            action={
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-1.5"><Printer className="h-3.5 w-3.5" />Print Invoice</Button>
                <Button size="sm" className="gap-1.5"><PlusCircle className="h-3.5 w-3.5" />Record Payment</Button>
              </div>
            }
          >
            {PAYMENTS.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No payments recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {PAYMENTS.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">
                    <CheckCircle2 className="h-5 w-5 text-[#16A34A] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{p.ref} · {p.method}</p>
                      <p className="text-xs text-slate-500">{p.date} · {p.note}</p>
                    </div>
                    <span className="font-bold text-slate-900">₦{p.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 rounded-lg bg-amber-50 border border-amber-100 p-4">
              <p className="text-sm font-semibold text-amber-800">Balance Due: ₦{balance.toLocaleString()}</p>
              <p className="text-xs text-amber-600 mt-0.5">Remaining from outstanding charges.</p>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
