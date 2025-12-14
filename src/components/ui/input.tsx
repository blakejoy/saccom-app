import * as React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showClear?: boolean
  onClear?: () => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, showClear, onClear, value, ...props }, ref) => {
    const hasClearButton = showClear && value && String(value).length > 0

    // Ensure Cmd+A / Ctrl+A works for select all
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        // Let the default behavior happen (select all)
        return
      }
      props.onKeyDown?.(e)
    }

    if (hasClearButton) {
      return (
        <div className="relative">
          <input
            type={type}
            className={cn(
              'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-9 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
              className
            )}
            ref={ref}
            value={value}
            onKeyDown={handleKeyDown}
            {...props}
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        ref={ref}
        value={value}
        onKeyDown={handleKeyDown}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
