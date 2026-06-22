import { cn } from '@/lib/utils'

export type PatientStatus =
  | 'draft'
  | 'registered'
  | 'in_triage'
  | 'ready_for_consultation'
  | 'in_consultation'
  | 'awaiting_lab'
  | 'lab_in_progress'
  | 'results_ready'
  | 'completed'

const statusConfig: Record<PatientStatus, { label: string; className: string }> = {
  draft:                    { label: 'Draft',               className: 'bg-slate-100 text-slate-600' },
  registered:               { label: 'Registered',          className: 'bg-blue-100 text-blue-700' },
  in_triage:                { label: 'In Triage',           className: 'bg-amber-100 text-amber-700' },
  ready_for_consultation:   { label: 'Ready for Consult',   className: 'bg-indigo-100 text-indigo-700' },
  in_consultation:          { label: 'In Consultation',     className: 'bg-blue-700 text-white' },
  awaiting_lab:             { label: 'Awaiting Lab',        className: 'bg-purple-100 text-purple-700' },
  lab_in_progress:          { label: 'Lab In Progress',     className: 'bg-cyan-100 text-cyan-700' },
  results_ready:            { label: 'Results Ready',       className: 'bg-teal-100 text-teal-700' },
  completed:                { label: 'Completed',           className: 'bg-green-100 text-green-700' },
}

interface StatusBadgeProps {
  status: PatientStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
