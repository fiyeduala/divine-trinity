import { Activity, FlaskConical, Clock, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { PatientCard } from '@/components/shared/PatientCard'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { MOCK_PATIENTS, MOCK_LAB_ORDERS } from '@/lib/mockData'

const triageQueue = MOCK_PATIENTS.filter(p => ['registered', 'in_triage'].includes(p.status))
const labToAssign = MOCK_LAB_ORDERS.filter(o => o.status === 'pending')

export function NurseDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="Nurse Station" subtitle="June 22, 2026" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard icon={Activity}    label="Awaiting Triage"   value={triageQueue.length.toString()} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatCard icon={FlaskConical} label="Lab Orders Pending" value={labToAssign.length.toString()} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatCard icon={Clock}       label="Avg Triage Time"   value="12 min" iconColor="text-[#0D9488]" iconBg="bg-teal-50" />
        <StatCard icon={CheckCircle2} label="Triaged Today"    value="11" iconColor="text-[#16A34A]" iconBg="bg-green-50" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Triage queue */}
        <SectionCard title="Patients Awaiting Triage" description={`${triageQueue.length} waiting`} action={<span className="text-xs font-medium text-[#2563EB] cursor-pointer">View all</span>}>
          <div className="space-y-2">
            {triageQueue.map(p => (
              <PatientCard
                key={p.id}
                patientId={p.id}
                wifeName={p.wife}
                husbandName={p.husband}
                status={p.status}
                visitDate={p.date}
              />
            ))}
          </div>
        </SectionCard>

        {/* Lab orders to assign */}
        <SectionCard title="Lab Orders to Assign" description={`${labToAssign.length} unassigned`}>
          <div className="space-y-2">
            {MOCK_LAB_ORDERS.map(order => (
              <div key={order.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-900">{order.patient}</span>
                    <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700'
                      : order.status === 'in_progress' ? 'bg-cyan-100 text-cyan-700'
                      : 'bg-amber-100 text-amber-700'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{order.test} · {order.assigned}</p>
                </div>
                {order.status === 'pending' && (
                  <Button size="sm" variant="outline" className="shrink-0 text-xs">Assign</Button>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
