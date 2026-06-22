import { Users, UserCheck, FlaskConical, DollarSign, Clock, TrendingUp } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { ChartCard } from '@/components/shared/ChartCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  MOCK_PATIENTS, MOCK_PATIENTS_PER_DAY, MOCK_STAGE_DATA, MOCK_TEST_VOLUME,
} from '@/lib/mockData'

export function SuperadminDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview Dashboard"
        subtitle="Monday, June 22, 2026"
        action={<Button>+ New Report</Button>}
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard icon={Users}     label="Today's Patients"  value="28"         trend={{ value: 12, direction: 'up', label: 'vs yesterday' }} />
        <StatCard icon={UserCheck} label="Consultations Done" value="19"        trend={{ value: 8, direction: 'up' }} iconColor="text-[#0D9488]" iconBg="bg-[#F0FDFA]" />
        <StatCard icon={FlaskConical} label="Lab Orders"     value="14"         trend={{ value: 3, direction: 'down', label: 'vs yesterday' }} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatCard icon={DollarSign} label="Today's Revenue"  value="₦340,000"  trend={{ value: 18, direction: 'up' }} iconColor="text-[#16A34A]" iconBg="bg-green-50" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Patients Per Day" description="This week" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={MOCK_PATIENTS_PER_DAY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Line type="monotone" dataKey="patients" stroke="#2563EB" strokeWidth={2.5} dot={{ fill: '#2563EB', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Test Volume" description="By category">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={MOCK_TEST_VOLUME} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {MOCK_TEST_VOLUME.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Revenue Trend" description="This week (₦)" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MOCK_PATIENTS_PER_DAY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `₦${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} formatter={(v: number) => [`₦${v.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#0D9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Stage Distribution" description="Current live queue">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MOCK_STAGE_DATA} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="stage" type="category" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {MOCK_STAGE_DATA.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Live queue board */}
      <div className="rounded-xl bg-white border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Live Queue Board</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time patient status · {MOCK_PATIENTS.length} today</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#16A34A] bg-green-50 px-2 py-1 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] animate-pulse" />
            Live
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 hidden sm:table-cell">Partner</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PATIENTS.map(p => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{p.wife}</td>
                  <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{p.husband}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
