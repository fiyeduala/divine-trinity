import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Loader2 } from 'lucide-react'
import { PageHeader }    from '@/components/shared/PageHeader'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { StatusBadge }   from '@/components/shared/StatusBadge'
import { EmptyState }    from '@/components/shared/EmptyState'
import { Button }        from '@/components/ui/button'
import { fetchPatients } from '@/lib/patientQueries'
import { useAuth }       from '@/contexts/AuthContext'
import type { Patient }  from '@/lib/database.types'

function patientName(p: Patient) {
  return `${p.wife_surname ?? ''} ${p.wife_other_names ?? ''}`.trim() || '—'
}

const columns: Column<Patient>[] = [
  {
    key: 'patient_code',
    label: 'Patient ID',
    sortable: true,
    render: (p) => (
      <span className="font-mono text-xs font-semibold text-[#2563EB]">
        {p.patient_code ?? <span className="text-slate-300 italic">draft</span>}
      </span>
    ),
  },
  {
    key: 'wife_surname',
    label: 'Patient Name',
    sortable: true,
    render: (p) => <span className="font-medium text-slate-900">{patientName(p)}</span>,
  },
  {
    key: 'wife_phone',
    label: 'Phone',
    render: (p) => <span className="text-slate-500">{p.wife_phone ?? '—'}</span>,
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (p) => <StatusBadge status={p.status} />,
  },
  {
    key: 'created_at',
    label: 'Registered',
    sortable: true,
    render: (p) => (
      <span className="text-xs text-slate-400">
        {new Date(p.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
      </span>
    ),
  },
]

export function PatientsPage() {
  const navigate    = useNavigate()
  const { profile } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  const isReceptionist = profile?.role === 'receptionist' || profile?.role === 'superadmin'

  useEffect(() => {
    fetchPatients()
      .then(setPatients)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load patients'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading patients…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Patients" subtitle="Manage patient records" />
        <div className="rounded-xl bg-red-50 border border-red-100 p-6 text-sm text-red-700">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Patients"
        subtitle={`${patients.length} total record${patients.length !== 1 ? 's' : ''}`}
        action={
          isReceptionist && (
            <Button size="sm" onClick={() => navigate('/patients/new')} className="gap-1.5">
              <UserPlus className="h-3.5 w-3.5" /> New Patient
            </Button>
          )
        }
      />

      {patients.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No patients yet"
          description="Register the first patient to get started."
          action={
            isReceptionist
              ? <Button onClick={() => navigate('/patients/new')} className="gap-2"><UserPlus className="h-4 w-4" /> Register Patient</Button>
              : undefined
          }
        />
      ) : (
        <DataTable
          data={patients}
          columns={columns}
          searchable
          searchPlaceholder="Search by name, phone, or ID…"
          searchKeys={['wife_surname', 'wife_other_names', 'wife_phone', 'patient_code']}
          onRowClick={p => navigate(`/patients/${p.id}`)}
          rowKey="id"
        />
      )}
    </div>
  )
}
