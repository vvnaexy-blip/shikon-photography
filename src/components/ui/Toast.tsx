'use client'

import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastMessage {
  id: string
  message: string
  type?: 'success' | 'error'
}

interface ToastProps {
  toast: ToastMessage
  onDismiss: (id: string) => void
}

function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 3000)
    return () => clearTimeout(t)
  }, [toast.id, onDismiss])

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 shadow-lg text-sm animate-in slide-in-from-bottom-2 duration-200',
        toast.type === 'error'
          ? 'bg-red-600 text-white'
          : 'bg-foreground text-warm-50',
      )}
    >
      {toast.type === 'error' ? (
        <X size={14} />
      ) : (
        <Check size={14} />
      )}
      <span className="tracking-wide">{toast.message}</span>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const show = (message: string, type: ToastMessage['type'] = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return { toasts, show, dismiss }
}
