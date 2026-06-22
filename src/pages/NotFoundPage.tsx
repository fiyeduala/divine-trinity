import { useNavigate } from 'react-router-dom'
import { Heart, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2563EB] mx-auto">
          <Heart className="h-8 w-8 text-white" fill="white" />
        </div>
        <div>
          <p className="text-6xl font-black text-slate-200 select-none">404</p>
          <h1 className="text-xl font-bold text-slate-900 mt-2">Page not found</h1>
          <p className="text-sm text-slate-500 mt-1">
            This page doesn't exist or you don't have access to it.
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Button>
      </div>
    </div>
  )
}
