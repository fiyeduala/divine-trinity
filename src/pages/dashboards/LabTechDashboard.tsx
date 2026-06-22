import { FlaskConical, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { SectionCard } from '@/components/shared/SectionCard'
import { Button } from '@/components/ui/button'
import { MOCK_LAB_ORDERS } from '@/lib/mockData'

const statusColor: Record<string, string> = {
  pending:     'bg-amber-100 text-amber-700',
  in_progress: 'bg-cyan-100 text-cyan-700',
  completed:   'bg-green-100 text-green-700',
}

export function LabTechDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="Lab Technician" subtitle="June 22, 2026" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard icon={FlaskConical}  label="My Assigned Tests"  value="5"  iconColor="text-[#2563EB]" iconBg="bg-blue-50" />
        <StatCard icon={AlertCircle}   label="Pending"            value="2"  iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatCard icon={Clock}         label="In Progress"        value="1"  iconColor="text-[#0D9488]" iconBg="bg-teal-50" />
        <StatCard icon={CheckCircle2}  label="Completed Today"    value="2"  iconColor="text-[#16A34A]" iconBg="bg-green-50" />
      </div>

      <SectionCard title="Assigned Test Orders" description="Your queue for today">
        <div className="space-y-3">
          {MOCK_LAB_ORDERS.map(order => (
            <div key={order.id} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-slate-100 p-4 hover:bg-slate-50">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF]">
                  <FlaskConical className="h-4 w-4 text-[#2563EB]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{order.patient}</p>
                  <p className="text-xs text-slate-500">{order.id} · {order.test}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 justify-between sm:justify-end">
                <span className={`text-xs rounded-full px-2.5 py-0.5 font-medium ${statusColor[order.status]}`}>
                  {order.status.replace('_', ' ')}
                </span>
                {order.status === 'pending' && <Button size="sm">Start Test</Button>}
                {order.status === 'in_progress' && <Button size="sm" variant="success">Record Result</Button>}
                {order.status === 'completed' && <Button size="sm" variant="outline">View Result</Button>}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Quick Reference" description="Normal ranges">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100">
              <tr>
                <th className="pb-2 text-left text-xs font-semibold text-slate-500">Test</th>
                <th className="pb-2 text-left text-xs font-semibold text-slate-500">Unit</th>
                <th className="pb-2 text-left text-xs font-semibold text-slate-500">Normal Range</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { test: 'FSH (female)', unit: 'mIU/mL', range: '3.5 – 12.5' },
                { test: 'LH (female)',  unit: 'mIU/mL', range: '2.4 – 12.6' },
                { test: 'Estradiol',    unit: 'pg/mL',  range: '12.5 – 166' },
                { test: 'Progesterone',unit: 'ng/mL',   range: '0.2 – 1.5 (follicular)' },
                { test: 'AMH',         unit: 'ng/mL',   range: '1.0 – 3.5' },
                { test: 'Sperm Count', unit: 'M/mL',    range: '≥ 15' },
              ].map(row => (
                <tr key={row.test}>
                  <td className="py-2 text-slate-700 font-medium">{row.test}</td>
                  <td className="py-2 text-slate-500">{row.unit}</td>
                  <td className="py-2 text-slate-700">{row.range}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}
