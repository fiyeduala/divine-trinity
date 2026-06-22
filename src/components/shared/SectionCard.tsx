import { cn } from '@/lib/utils'

interface SectionCardProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}

export function SectionCard({ title, description, children, className, action }: SectionCardProps) {
  return (
    <div className={cn('rounded-xl bg-white border border-slate-100 shadow-sm', className)}>
      {(title || description || action) && (
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100">
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-900">{title}</h3>}
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}

export function FormSection({ title, description, children, className }: SectionCardProps) {
  return (
    <div className={cn('rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden', className)}>
      {(title || description) && (
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
          {title && <h3 className="text-sm font-semibold text-slate-800">{title}</h3>}
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}
