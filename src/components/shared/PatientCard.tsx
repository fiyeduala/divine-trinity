import { MoreVertical, FileText, Phone } from 'lucide-react'
import { StatusBadge, type PatientStatus } from './StatusBadge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface PatientCardProps {
  patientId: string
  wifeName: string
  husbandName?: string
  status: PatientStatus
  phone?: string
  visitDate?: string
  onView?: () => void
  onContact?: () => void
  className?: string
}

export function PatientCard({
  patientId, wifeName, husbandName, status, phone, visitDate, onView, onContact, className,
}: PatientCardProps) {
  const initials = wifeName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className={cn('rounded-xl bg-white border border-slate-100 shadow-sm p-4 flex items-start gap-3 hover:shadow-md transition-shadow', className)}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-[#2563EB] font-semibold text-sm">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-slate-900 truncate">{wifeName}</span>
          {husbandName && <span className="text-xs text-slate-400">& {husbandName}</span>}
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs text-slate-500 font-mono">{patientId}</span>
          <StatusBadge status={status} />
        </div>
        {visitDate && <p className="text-xs text-slate-400 mt-1">{visitDate}</p>}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {phone && onContact && (
          <Button size="icon" variant="ghost" onClick={onContact} className="h-8 w-8">
            <Phone className="h-3.5 w-3.5" />
          </Button>
        )}
        {onView && (
          <Button size="icon" variant="ghost" onClick={onView} className="h-8 w-8">
            <FileText className="h-3.5 w-3.5" />
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}>View Folder</DropdownMenuItem>
            <DropdownMenuItem>Edit Details</DropdownMenuItem>
            <DropdownMenuItem>Print Summary</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
