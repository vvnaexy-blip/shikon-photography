'use client'

import { useState, FormEvent } from 'react'
import { Eye, EyeOff, Camera } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface PasswordGateProps {
  galleryTitle: string
  correctPassword: string
  onSuccess: () => void
}

export default function PasswordGate({ galleryTitle, correctPassword, onSuccess }: PasswordGateProps) {
  const [value,   setValue]   = useState('')
  const [show,    setShow]    = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      if (value === correctPassword) {
        onSuccess()
      } else {
        setError('Incorrect password. Please try again.')
      }
      setLoading(false)
    }, 400)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-warm-50">
      {/* Brand */}
      <div className="flex flex-col items-center gap-2 mb-12">
        <Camera size={22} strokeWidth={1} className="text-warm-400" />
        <span className="font-[family-name:var(--font-cormorant)] text-lg tracking-[0.25em] uppercase text-muted">
          SHIKO PHOTOGRAPHY
        </span>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted mb-3">
            Private Gallery
          </p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-light mb-4">
            {galleryTitle}
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            Enter your password to view your photographs.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Input
              id="gallery-password"
              type={show ? 'text' : 'password'}
              label="Password"
              placeholder="Enter your gallery password"
              value={value}
              onChange={(e) => { setValue(e.target.value); setError('') }}
              error={error}
              autoFocus
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
            disabled={!value || loading}
            className="w-full justify-center"
            size="lg"
          >
            {loading ? 'Opening…' : 'Open Gallery'}
          </Button>
        </form>
      </div>
    </div>
  )
}
