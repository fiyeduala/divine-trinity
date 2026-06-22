import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge, type PatientStatus } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { MOCK_PATIENTS } from '@/lib/mockData'

const ORDER: PatientStatus[] = [
  'registered', 'in_triage', 'ready_for_consultation',
  'in_consultation', 'awaiting_lab', 'lab_in_progress', 'results_ready',
]

export function QueuePage() {
  const stages = ORDER.map(s => ({
    status: s,
    patients: MOCK_PATIENTS.filter(p => p.status === s),
  })).filter(s => s.patients.length > 0)

  return (
    <div className="space-y-6">
      <PageHeader title="Live Queue Board" subtitle={`${MOCK_PATIENTS.filter(p => p.status !== 'completed' && p.status !== 'draft').length} patients active`} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stages.map(stage => (
          <div key={stage.status} className="rounded-xl bg-white border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <StatusBadge status={stage.status} />
              <span className="text-xs font-bold text-slate-500">{stage.patients.length}</span>
            </div>
            <div className="p-3 space-y-2">
              {stage.patients.map(p => (
                <div key={p.id} className="flex items-center gap-2 rounded-lg hover:bg-slate-50 px-2 py-2 cursor-pointer">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                    {p.wife.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{p.wife}</p>
                    <p className="text-[10px] text-slate-400">{p.id}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]">→</Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
