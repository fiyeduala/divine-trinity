import { useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { StatusBadge, type PatientStatus } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { MOCK_PATIENTS } from '@/lib/mockData'

type PatientRow = typeof MOCK_PATIENTS[number]

const columns: Column<PatientRow>[] = [
  { key: 'id',      header: 'Patient ID',  sortable: true, cell: r => <span className="font-mono text-xs text-slate-500">{r.id}</span> },
  { key: 'wife',    header: 'Wife / Partner', sortable: true, cell: r => <span className="font-medium">{r.wife}</span> },
  { key: 'husband', header: 'Husband',     sortable: true },
  { key: 'status',  header: 'Status',      cell: r => <StatusBadge status={r.status as PatientStatus} /> },
  { key: 'date',    header: 'Date',        sortable: true, cell: r => <span className="text-slate-400 text-xs">{r.date}</span> },
  {
    key: '_actions',
    header: '',
    cell: _r => (
      <div className="flex gap-1 justify-end">
        <Button size="sm" variant="outline" className="text-xs h-7 px-2">View</Button>
      </div>
    ),
  },
]

export function PatientsPage() {
  const navigate = useNavigate()
  return (
    <div className="space-y-6">
      <PageHeader
        title="All Patients"
        subtitle={`${MOCK_PATIENTS.length} records`}
        action={
          <Button className="gap-2" onClick={() => navigate('/patient-register')}>
            <UserPlus className="h-4 w-4" /> Register Patient
          </Button>
        }
      />
      <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-4 md:p-6">
        <DataTable
          data={MOCK_PATIENTS as PatientRow[]}
          columns={columns}
          searchPlaceholder="Search patients…"
          searchKey="wife"
        />
      </div>
    </div>
  )
}
