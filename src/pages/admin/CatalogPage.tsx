import { useState, useEffect } from 'react'
import { Plus, Loader2, RefreshCcw, Pill, FlaskConical, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react'
import { Button }  from '@/components/ui/button'
import { Input }   from '@/components/ui/input'
import { Label }   from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageHeader }  from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { EmptyState }  from '@/components/shared/EmptyState'
import {
  fetchAllDrugsAdmin,    addDrug,    toggleDrug,
  fetchAllLabTestsAdmin, addLabTest, toggleLabTest,
} from '@/lib/adminQueries'
import { toast } from 'sonner'
import type { Drug, LabTest } from '@/lib/database.types'

function fmtN(n: number) { return '₦' + Number(n).toLocaleString() }

// ── Reusable row components ───────────────────────────────────────────────────

function DrugRow({
  drug, onToggle, toggling,
}: { drug: Drug; onToggle: () => void; toggling: boolean }) {
  return (
    <div className={`flex items-center justify-between py-3 gap-3 ${!drug.is_active ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-2 min-w-0">
        <Pill className="h-4 w-4 text-blue-500 shrink-0" />
        <div>
          <p className="text-sm font-medium text-slate-900">{drug.name}</p>
          <p className="text-xs text-slate-400">{fmtN(Number(drug.unit_price))} per unit</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${drug.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
          {drug.is_active ? 'Active' : 'Inactive'}
        </span>
        <Button
          variant="ghost" size="sm"
          onClick={onToggle}
          disabled={toggling}
          className="gap-1 text-slate-500 hover:text-slate-900"
        >
          {toggling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : drug.is_active ? (
            <ToggleRight className="h-4 w-4 text-green-600" />
          ) : (
            <ToggleLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}

function TestRow({
  test, onToggle, toggling,
}: { test: LabTest; onToggle: () => void; toggling: boolean }) {
  return (
    <div className={`flex items-center justify-between py-3 gap-3 ${!test.is_active ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-2 min-w-0">
        <FlaskConical className="h-4 w-4 text-purple-500 shrink-0" />
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-900">{test.name}</p>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 rounded px-1">{test.code}</span>
          </div>
          <p className="text-xs text-slate-400">{fmtN(Number(test.price))}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${test.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
          {test.is_active ? 'Active' : 'Inactive'}
        </span>
        <Button
          variant="ghost" size="sm"
          onClick={onToggle}
          disabled={toggling}
          className="gap-1 text-slate-500 hover:text-slate-900"
        >
          {toggling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : test.is_active ? (
            <ToggleRight className="h-4 w-4 text-green-600" />
          ) : (
            <ToggleLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function CatalogPage() {
  const [drugs,     setDrugs]     = useState<Drug[]>([])
  const [labTests,  setLabTests]  = useState<LabTest[]>([])
  const [loading,   setLoading]   = useState(true)
  const [refreshing,setRefreshing]= useState(false)

  // Drug add form
  const [drugName,     setDrugName]     = useState('')
  const [drugPrice,    setDrugPrice]    = useState('')
  const [addingDrug,   setAddingDrug]   = useState(false)
  const [drugError,    setDrugError]    = useState<string | null>(null)
  const [togglingDrug, setTogglingDrug] = useState<string | null>(null)

  // Lab test add form
  const [testName,     setTestName]     = useState('')
  const [testCode,     setTestCode]     = useState('')
  const [testPrice,    setTestPrice]    = useState('')
  const [addingTest,   setAddingTest]   = useState(false)
  const [testError,    setTestError]    = useState<string | null>(null)
  const [togglingTest, setTogglingTest] = useState<string | null>(null)

  async function load(quiet = false) {
    quiet ? setRefreshing(true) : setLoading(true)
    try {
      const [d, t] = await Promise.all([fetchAllDrugsAdmin(), fetchAllLabTestsAdmin()])
      setDrugs(d)
      setLabTests(t)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleAddDrug() {
    if (!drugName.trim()) { setDrugError('Drug name is required'); return }
    const price = parseFloat(drugPrice)
    if (!price || price <= 0) { setDrugError('Enter a valid price'); return }
    setAddingDrug(true)
    setDrugError(null)
    try {
      const drug = await addDrug(drugName, price)
      setDrugs(prev => [...prev, drug].sort((a, b) => a.name.localeCompare(b.name)))
      setDrugName('')
      setDrugPrice('')
      toast.success(`${drug.name} added to catalog`)
    } catch (err) {
      setDrugError(err instanceof Error ? err.message : 'Failed to add drug')
    } finally {
      setAddingDrug(false)
    }
  }

  async function handleToggleDrug(drug: Drug) {
    setTogglingDrug(drug.id)
    try {
      const updated = await toggleDrug(drug.id, !drug.is_active)
      setDrugs(prev => prev.map(d => d.id === updated.id ? updated : d))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to toggle')
    } finally {
      setTogglingDrug(null)
    }
  }

  async function handleAddTest() {
    if (!testName.trim()) { setTestError('Test name is required'); return }
    if (!testCode.trim()) { setTestError('Test code is required'); return }
    const price = parseFloat(testPrice)
    if (!price || price <= 0) { setTestError('Enter a valid price'); return }
    setAddingTest(true)
    setTestError(null)
    try {
      const test = await addLabTest(testName, testCode, price)
      setLabTests(prev => [...prev, test].sort((a, b) => a.name.localeCompare(b.name)))
      setTestName('')
      setTestCode('')
      setTestPrice('')
      toast.success(`${test.name} added to catalog`)
    } catch (err) {
      setTestError(err instanceof Error ? err.message : 'Failed to add test')
    } finally {
      setAddingTest(false)
    }
  }

  async function handleToggleTest(test: LabTest) {
    setTogglingTest(test.id)
    try {
      const updated = await toggleLabTest(test.id, !test.is_active)
      setLabTests(prev => prev.map(t => t.id === updated.id ? updated : t))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to toggle')
    } finally {
      setTogglingTest(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Catalog Management"
        subtitle="Manage the drugs and lab tests available in the system"
        action={
          <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing} className="gap-1.5">
            {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
            Refresh
          </Button>
        }
      />

      <Tabs defaultValue="drugs">
        <TabsList>
          <TabsTrigger value="drugs"    className="gap-1.5"><Pill className="h-3.5 w-3.5" />Drugs ({loading ? '…' : drugs.length})</TabsTrigger>
          <TabsTrigger value="labtests" className="gap-1.5"><FlaskConical className="h-3.5 w-3.5" />Lab Tests ({loading ? '…' : labTests.length})</TabsTrigger>
        </TabsList>

        {/* ── Drugs tab ── */}
        <TabsContent value="drugs" className="mt-4">
          <SectionCard title="Drug Catalog" description="Drugs available for prescription. Toggle to enable or disable.">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
              </div>
            ) : drugs.length === 0 ? (
              <EmptyState icon={Pill} title="No drugs yet" description="Add the first drug to the catalog." />
            ) : (
              <div className="divide-y divide-slate-100">
                {drugs.map(d => (
                  <DrugRow
                    key={d.id}
                    drug={d}
                    onToggle={() => handleToggleDrug(d)}
                    toggling={togglingDrug === d.id}
                  />
                ))}
              </div>
            )}

            <Separator className="my-4" />

            {/* Add drug form */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Add Drug</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="space-y-1 flex-1">
                  <Label className="text-xs">Drug Name</Label>
                  <Input placeholder="e.g. Clomiphene Citrate 50mg" value={drugName} onChange={e => { setDrugName(e.target.value); setDrugError(null) }} />
                </div>
                <div className="space-y-1 w-36">
                  <Label className="text-xs">Unit Price (N)</Label>
                  <Input type="number" min="1" placeholder="e.g. 1500" value={drugPrice} onChange={e => { setDrugPrice(e.target.value); setDrugError(null) }} />
                </div>
                <Button onClick={handleAddDrug} disabled={addingDrug} className="gap-1.5 shrink-0">
                  {addingDrug ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add
                </Button>
              </div>
              {drugError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {drugError}
                </div>
              )}
            </div>
          </SectionCard>
        </TabsContent>

        {/* ── Lab Tests tab ── */}
        <TabsContent value="labtests" className="mt-4">
          <SectionCard title="Lab Tests Catalog" description="Tests available for ordering. Toggle to enable or disable.">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
              </div>
            ) : labTests.length === 0 ? (
              <EmptyState icon={FlaskConical} title="No lab tests yet" description="Add the first test to the catalog." />
            ) : (
              <div className="divide-y divide-slate-100">
                {labTests.map(t => (
                  <TestRow
                    key={t.id}
                    test={t}
                    onToggle={() => handleToggleTest(t)}
                    toggling={togglingTest === t.id}
                  />
                ))}
              </div>
            )}

            <Separator className="my-4" />

            {/* Add test form */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Add Lab Test</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="space-y-1 flex-1">
                  <Label className="text-xs">Test Name</Label>
                  <Input placeholder="e.g. Follicle Stimulating Hormone" value={testName} onChange={e => { setTestName(e.target.value); setTestError(null) }} />
                </div>
                <div className="space-y-1 w-28">
                  <Label className="text-xs">Code</Label>
                  <Input placeholder="e.g. FSH" value={testCode} onChange={e => { setTestCode(e.target.value); setTestError(null) }} />
                </div>
                <div className="space-y-1 w-36">
                  <Label className="text-xs">Price (N)</Label>
                  <Input type="number" min="1" placeholder="e.g. 8000" value={testPrice} onChange={e => { setTestPrice(e.target.value); setTestError(null) }} />
                </div>
                <Button onClick={handleAddTest} disabled={addingTest} className="gap-1.5 shrink-0">
                  {addingTest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add
                </Button>
              </div>
              {testError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {testError}
                </div>
              )}
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
