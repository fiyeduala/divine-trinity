import { useNavigate } from 'react-router-dom'
import { Stethoscope, Clock, CheckCircle2, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SectionCard } from '@/components/shared/SectionCard'
import { Button } from '@/components/ui/button'
import { MOCK_PATIENTS } from '@/lib/mockData'

const myQueue = MOCK_PATIENTS.filter(p => ['ready_for_consultation', 'in_consultation'].includes(p.status))
const done = MOCK_PATIENTS.filter(p => p.status === 'completed')

export function DoctorDashboard() {
  const navigate = useNavigate()
  return (
    <div className="space-y-6">
      <PageHeader title="Doctor's Workspace" subtitle="Consulting Room A · Jun 22, 2026" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard icon={Stethoscope} label="My Queue"           value={myQueue.length.toString()} iconColor="text-[#2563EB]" iconBg="bg-blue-50" />
        <StatCard icon={Clock}       label="Next Patient"       value="Amaka O."  iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatCard icon={CheckCircle2} label="Completed Today"   value={done.length.toString()} iconColor="text-[#16A34A]" iconBg="bg-green-50" />
        <StatCard icon={Users}       label="Total Seen (Week)"  value="47" iconColor="text-[#0D9488]" iconBg="bg-teal-50" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* My queue */}
        <SectionCard title="My Consultation Queue" description="Room A · live" className="lg:col-span-2">
          <div className="space-y-2">
            {MOCK_PATIENTS.filter(p => !['completed', 'draft'].includes(p.status)).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50 cursor-pointer" onClick={() => navigate('/consultations/1')}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{p.wife}</p>
                  <p className="text-xs text-slate-400">{p.id}</p>
                </div>
                <StatusBadge status={p.status} />
                <Button size="sm" variant="outline" className="shrink-0" onClick={e => { e.stopPropagation(); navigate('/consultations/1') }}>
                  Start
                </Button>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Quick stats */}
        <div className="space-y-4">
          <SectionCard title="Today's Stats">
            <div className="space-y-3">
              {[
                { label: 'Hormone panels ordered', value: '8' },
                { label: 'Ultrasounds ordered',    value: '5' },
                { label: 'Drug prescriptions',     value: '12' },
                { label: 'Follow-ups scheduled',   value: '6' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="font-semibold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Completed Today">
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {done.map(p => (
                <div key={p.id} className="flex items-center gap-2 text-sm py-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A] shrink-0" />
                  <span className="text-slate-700 truncate">{p.wife}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
