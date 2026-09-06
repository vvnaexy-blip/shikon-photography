'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Camera } from 'lucide-react'
import { adminSignIn, isAdminAuthenticated } from '@/lib/auth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [show,     setShow]     = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [checking, setChecking] = useState(true)

  // Redirect if already logged in
  useEffect(() => {
    isAdminAuthenticated().then((yes) => {
      if (yes) router.replace('/admin/dashboard')
      else setChecking(false)
    })
  }, [router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await adminSignIn(email.trim(), password)

    if (result.ok) {
      router.replace('/admin/dashboard')
    } else {
      setError(result.error ?? 'Sign in failed.')
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="w-6 h-6 border border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-warm-50">
      <div className="w-full max-w-sm">
        {/* Brand mark */}
        <div className="flex justify-center mb-10">
          <div className="flex flex-col items-center gap-2">
            <Camera size={24} strokeWidth={1} className="text-muted" />
            <span className="font-[family-name:var(--font-cormorant)] text-2xl tracking-[0.2em] uppercase">
              SHIKO PHOTOGRAPHY
            </span>
          </div>
        </div>

        <div className="border border-border p-8">
          <div className="text-center mb-8">
            <p className="text-[10px] tracking-[0.25em] uppercase text-muted mb-2">
              Admin Access
            </p>
            <h1 className="font-[family-name:var(--font-cormorant)] text-2xl font-light">
              Sign In
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="admin-email"
              type="email"
              label="Email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              autoFocus
              autoComplete="email"
            />

            <div className="relative">
              <Input
                id="admin-password"
                type={show ? 'text' : 'password'}
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                error={error}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-4 top-[34px] text-muted hover:text-foreground transition-colors"
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button
              type="submit"
              disabled={!email || !password || loading}
              className="w-full justify-center mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
