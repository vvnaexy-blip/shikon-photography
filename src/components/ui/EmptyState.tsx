import { Camera } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-24 px-8 text-center',
        className,
      )}
    >
      <div className="text-warm-300 mb-6">
        {icon ?? <Camera size={40} strokeWidth={1} />}
      </div>
      <p className="font-[family-name:var(--font-cormorant)] text-2xl font-light text-warm-600 mb-2">
        {title}
      </p>
      {description && (
        <p className="text-sm text-muted max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
