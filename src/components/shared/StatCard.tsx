import type React from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

type Color = 'blue' | 'teal' | 'green' | 'amber' | 'red' | 'purple'

const colorMap: Record<Color, { icon: string; bg: string }> = {
  blue:   { icon: 'text-[#2563EB]', bg: 'bg-[#EFF6FF]' },
  teal:   { icon: 'text-[#0D9488]', bg: 'bg-[#F0FDFA]' },
  green:  { icon: 'text-[#16A34A]', bg: 'bg-[#F0FDF4]' },
  amber:  { icon: 'text-[#D97706]', bg: 'bg-[#FFFBEB]' },
  red:    { icon: 'text-[#DC2626]', bg: 'bg-[#FEF2F2]' },
  purple: { icon: 'text-[#7C3AED]', bg: 'bg-[#F5F3FF]' },
}

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  trend?: { value: number; direction: 'up' | 'down'; label?: string }
  color?: Color
  iconColor?: string
  iconBg?: string
  className?: string
}

export function StatCard({
  icon: Icon, label, value, trend,
  color,
  iconColor, iconBg,
  className,
}: StatCardProps) {
  const resolved = color ? colorMap[color] : null
  const finalIconColor = iconColor ?? resolved?.icon ?? 'text-[#2563EB]'
  const finalIconBg    = iconBg    ?? resolved?.bg   ?? 'bg-[#EFF6FF]'

  return (
    <div className={cn('rounded-xl bg-white border border-slate-100 shadow-sm p-5 flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', finalIconBg)}>
          <Icon className={cn('h-4 w-4', finalIconColor)} />
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
