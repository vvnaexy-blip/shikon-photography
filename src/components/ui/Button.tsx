import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-[family-name:var(--font-inter)] tracking-[0.1em] uppercase transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none cursor-pointer',
          // sizes
          size === 'sm' && 'text-[10px] px-4 py-2',
          size === 'md' && 'text-[11px] px-6 py-3',
          size === 'lg' && 'text-xs px-8 py-4',
          // variants
          variant === 'primary' &&
            'bg-foreground text-warm-50 hover:bg-warm-800',
          variant === 'outline' &&
            'border border-foreground text-foreground hover:bg-foreground hover:text-warm-50',
          variant === 'ghost' &&
            'text-muted hover:text-foreground hover:bg-warm-100',
          variant === 'danger' &&
            'border border-red-300 text-red-600 hover:bg-red-50',
          className,
        )}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
export default Button
