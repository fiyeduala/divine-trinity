import { useState } from 'react'
import QRCode from 'react-qr-code'
import { Copy, CheckCheck, Printer, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'

const REGISTER_URL = `${window.location.origin}/patient-register`

export function QrPage() {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(REGISTER_URL).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function print() {
    window.print()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] gap-8 py-12">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-10 w-10 rounded-xl bg-[#2563EB] flex items-center justify-center">
            <QrCode className="h-5 w-5 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Patient Self-Registration</h1>
        <p className="text-slate-500 text-sm max-w-sm">
          Display this QR code at the reception desk. Patients scan it with their phone to
          pre-fill their registration form before seeing the receptionist.
        </p>
      </div>

      {/* QR Code card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center gap-6 print:shadow-none print:border-2">
        <div className="p-4 bg-white rounded-xl border border-slate-100">
          <QRCode
            value={REGISTER_URL}
            size={220}
            bgColor="#FFFFFF"
            fgColor="#1E293B"
            level="M"
          />
        </div>

        {/* Clinic name for print */}
        <div className="text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Divine Trinity Fertility Clinic</p>
          <p className="text-xs text-slate-400 mt-1 font-mono break-all max-w-xs">{REGISTER_URL}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 print:hidden">
        <Button variant="outline" onClick={copy} className="gap-2">
          {copied ? <CheckCheck className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy link'}
        </Button>
        <Button onClick={print} className="gap-2">
          <Printer className="h-4 w-4" />
          Print QR code
        </Button>
      </div>

      {/* Instructions */}
      <div className="max-w-sm text-center print:hidden">
        <p className="text-xs text-slate-400">
          Patients scan the code with their phone camera, fill in their details, and their
          record appears in your registration queue automatically.
        </p>
      </div>
    </div>
  )
}
