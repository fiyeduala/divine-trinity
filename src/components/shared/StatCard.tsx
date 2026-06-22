import type React from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  trend?: { value: number; direction: 'up' | 'down'; label?: string }
  iconColor?: string
  iconBg?: string
  className?: string
}

export function StatCard({ icon: Icon, label, value, trend, iconColor = 'text-[#2563EB]', iconBg = 'bg-[#EFF6FF]', className }: StatCardProps) {
  return (
    <div className={cn('rounded-xl bg-white border border-slate-100 shadow-sm p-5 flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', iconBg)}>
          <Icon className={cn('h-4 w-4', iconColor)} />
        </span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-slate-900 leading-none">{value}</span>
        {trend && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', trend.direction === 'up' ? 'text-[#16A34A]' : 'text-[#DC2626]')}>
            {trend.direction === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{trend.value}%</span>
            {trend.label && <span className="text-slate-400 font-normal">{trend.label}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
