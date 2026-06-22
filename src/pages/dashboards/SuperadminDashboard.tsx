import { useState, useEffect, useCallback } from 'react'
import { Users, UserCheck, FlaskConical, DollarSign, Loader2, RefreshCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Button }    from '@/components/ui/button'
import { PageHeader }  from '@/components/shared/PageHeader'
import { StatCard }    from '@/components/shared/StatCard'
import { ChartCard }   from '@/components/shared/ChartCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState }  from '@/components/shared/EmptyState'
import {
  fetchTodayStats, fetchWeeklyTrend, fetchStageDistribution, fetchTestVolume,
  type TodayStats, type DayTrend, type StageDist, type TestVol,
} from '@/lib/adminQueries'
import { fetchPatients } from '@/lib/patientQueries'
import type { Patient } from '@/lib/database.types'

function fmtN(n: number) { return 'N' + Number(n).toLocaleString() }
function patientName(p: Patient) {
  return `${p.wife_surname ?? ''} ${p.wife_other_names ?? ''}`.trim() || '—'
}
function husbandName(p: Patient) {
  if (!p.husband_surname) return '—'
  return `${p.husband_surname} ${p.husband_other_names ?? ''}`.trim()
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
}

const EMPTY_STATS: TodayStats = { todayPatients: 0, completedConsults: 0, labOrders: 0, revenue: 0 }

export function SuperadminDashboard() {
  const navigate = useNavigate()
  const [stats,     setStats]     = useState<TodayStats>(EMPTY_STATS)
  const [trend,     setTrend]     = useState<DayTrend[]>([])
  const [stages,    setStages]    = useState<StageDist[]>([])
  const [testVol,   setTestVol]   = useState<TestVol[]>([])
  const [queue,     setQueue]     = useState<Patient[]>([])
  const [loading,   setLoading]   = useState(true)
  const [refreshing,setRefreshing]= useState(false)

  const load = useCallback(async (quiet = false) => {
    quiet ? setRefreshing(true) : setLoading(true)
    try {
      const [s, t, st, tv, q] = await Promise.all([
        fetchTodayStats(),
        fetchWeeklyTrend(),
        fetchStageDistribution(),
        fetchTestVolume(),
        fetchPatients({
          status: [
            'registered', 'in_triage', 'ready_for_consultation',
            'in_consultation', 'awaiting_lab', 'lab_in_progress',
            'results_ready', 'completed',
          ],
        }),
      ])
      setStats(s)
      setTrend(t)
      setStages(st)
      setTestVol(tv)
      setQueue(q)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview Dashboard"
        subtitle={new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        action={
          <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing} className="gap-1.5">
            {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
            Refresh
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard icon={Users}        label="Today's Patients"   value={loading ? '—' : stats.todayPatients}             color="blue"   />
        <StatCard icon={UserCheck}    label="Consultations Done" value={loading ? '—' : stats.completedConsults}         color="teal"   />
        <StatCard icon={FlaskConical} label="Lab Orders"         value={loading ? '—' : stats.labOrders}                 color="purple" />
        <StatCard icon={DollarSign}   label="Today's Revenue"    value={loading ? '—' : fmtN(stats.revenue)} color="green"  />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Patients Per Day" description="Last 7 days" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Line type="monotone" dataKey="patients" stroke="#2563EB" strokeWidth={2.5} dot={{ fill: '#2563EB', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Test Volume" description="By test type">
          {testVol.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">No lab orders yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={testVol} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {testVol.map((_, i) => <Cell key={i} fill={testVol[i].fill} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Revenue Trend" description="Last 7 days (N)" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `N${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} formatter={(v) => [`N${Number(v).toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#0D9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Stage Distribution" description="Active patients right now">
          {stages.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">No active patients</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stages} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={72} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {stages.map((s, i) => <Cell key={i} fill={s.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Live queue board */}
      <div className="rounded-xl bg-white border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Live Queue Board</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {loading ? 'Loading…' : `${queue.length} patient${queue.length !== 1 ? 's' : ''} today`}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading queue…
          </div>
        ) : queue.length === 0 ? (
          <div className="py-10">
            <EmptyState icon={Users} title="Queue is empty" description="No active patients today." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Patient (Wife)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 hidden sm:table-cell">Husband</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 hidden md:table-cell">Time</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {queue.map(p => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer"
                    onClick={() => navigate(`/patients/${p.id}`)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[#2563EB]">{p.patient_code ?? '—'}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{patientName(p)}</td>
                    <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{husbandName(p)}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">{fmtTime(p.created_at)}</td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); navigate(`/patients/${p.id}`) }}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
