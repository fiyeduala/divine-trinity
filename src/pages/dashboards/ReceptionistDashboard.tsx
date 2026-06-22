import { useNavigate } from 'react-router-dom'
import { UserPlus, ClipboardList, Clock, QrCode, CheckCircle2, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { PatientCard } from '@/components/shared/PatientCard'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { MOCK_PATIENTS } from '@/lib/mockData'

const drafts = MOCK_PATIENTS.filter(p => p.status === 'draft')
const todays = MOCK_PATIENTS.filter(p => p.status !== 'draft')

export function ReceptionistDashboard() {
  const navigate = useNavigate()
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reception Desk"
        subtitle="June 22, 2026"
        action={<Button onClick={() => navigate('/patient-register')} className="gap-2"><UserPlus className="h-4 w-4" />Register Patient</Button>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard icon={UserPlus}    label="Today's Registrations" value="28" trend={{ value: 12, direction: 'up' }} />
        <StatCard icon={ClipboardList} label="Drafts Pending"      value={drafts.length.toString()} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatCard icon={Clock}       label="In Queue"               value="9"  iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatCard icon={CheckCircle2} label="Completed Today"       value="7"  iconColor="text-[#16A34A]" iconBg="bg-green-50" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Drafts inbox */}
        <SectionCard
          title="Drafts to Confirm"
          description={`${drafts.length} incomplete registration${drafts.length !== 1 ? 's' : ''}`}
          className="lg:col-span-1"
          action={<span className="text-xs font-medium text-[#2563EB] cursor-pointer hover:underline">View all</span>}
        >
          <div className="space-y-2">
            {drafts.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">All clear!</p>
            ) : (
              drafts.map(p => (
                <div key={p.id} className="flex items-center gap-3 rounded-lg border border-amber-100 bg-amber-50 p-3">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{p.wife}</p>
                    <p className="text-xs text-slate-500">{p.id}</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs shrink-0">Confirm</Button>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        {/* Today's queue snapshot */}
        <SectionCard
          title="Today's Queue"
          description={`${todays.length} patients`}
          className="lg:col-span-2"
        >
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {todays.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <span className="text-xs font-bold text-slate-300 w-5 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{p.wife}</p>
                  <p className="text-xs text-slate-400">{p.id}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* QR code panel */}
      <SectionCard title="Patient Self-Registration QR" description="Patients scan to register before arrival">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
            <QrCode className="h-16 w-16 text-slate-300" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm font-medium text-slate-700 mb-1">Registration Link</p>
            <p className="text-xs text-slate-400 font-mono mb-3">https://divinetrinity.ng/register</p>
            <p className="text-xs text-slate-500 mb-4">Print this QR code and place it at the clinic entrance for patients to scan and pre-fill their registration form.</p>
            <div className="flex gap-2 justify-center sm:justify-start flex-wrap">
              <Button size="sm" variant="outline">Download PNG</Button>
              <Button size="sm" variant="outline">Print</Button>
              <Button size="sm">Copy Link</Button>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Recent registrations */}
      <SectionCard title="Recent Registrations" action={<Button variant="outline" size="sm">View all</Button>}>
        <div className="space-y-2">
          {todays.slice(0, 5).map(p => (
            <PatientCard
              key={p.id}
              patientId={p.id}
              wifeName={p.wife}
              husbandName={p.husband}
              status={p.status}
              phone={p.phone}
              visitDate={p.date}
              onView={() => navigate(`/patients/${p.id}`)}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
