import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [errorMsg, setErrorMsg]         = useState<string | null>(null)
  const emailRef    = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const { signIn, user, configured }    = useAuth()
  const navigate                        = useNavigate()

  // If already authenticated, skip to dashboard
  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)
    const email    = emailRef.current?.value    ?? ''
    const password = passwordRef.current?.value ?? ''
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setErrorMsg(
        error.message === 'Invalid login credentials'
          ? 'Invalid email or password. Please try again.'
          : error.message
      )
    } else {
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFF6FF] via-white to-[#F0FDFA] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2563EB] shadow-md mb-3">
              <Heart className="h-7 w-7 text-white" fill="white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Divine Trinity</h1>
            <p className="text-sm text-slate-500">Fertility Clinic — Staff Portal</p>
          </div>

          {!configured && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-100 p-3 mb-5 text-sm text-amber-800">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Supabase is not configured. See <code className="font-mono text-xs">.env.local.example</code>.</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 p-3 mb-5 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                ref={emailRef}
                type="email"
                placeholder="staff@divinetrinity.ng"
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs text-[#2563EB] hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading || !configured}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Having trouble? Contact{' '}
            <a href="mailto:it@divinetrinity.ng" className="text-[#2563EB] hover:underline">
              IT support
            </a>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          © {new Date().getFullYear()} Divine Trinity Fertility Clinic
        </p>
      </div>
    </div>
  )
}
