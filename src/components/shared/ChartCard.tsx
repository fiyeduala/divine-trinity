import { SectionCard } from './SectionCard'

interface ChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function ChartCard({ title, description, children, action, className }: ChartCardProps) {
  return (
    <SectionCard title={title} description={description} action={action} className={className}>
      <div className="w-full">{children}</div>
    </SectionCard>
  )
}
