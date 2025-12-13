import { cn } from '@/lib/utils'
import type { DailyStatusType } from '@/lib/db/schema'

interface StatusToggleProps {
  value: DailyStatusType
  onChange: (value: DailyStatusType) => void
}

export function StatusToggle({ value, onChange }: StatusToggleProps) {
  const options: { value: DailyStatusType; label: string; color: string }[] = [
    { value: 'accepted', label: '✓', color: 'bg-green-500 hover:bg-green-600 text-white' },
    { value: 'rejected', label: '✗', color: 'bg-red-500 hover:bg-red-600 text-white' },
    { value: 'n/a', label: 'N/A', color: 'bg-gray-400 hover:bg-gray-500 text-white' },
  ]

  return (
    <div className="flex gap-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'flex-1 min-h-[44px] px-2 py-2 rounded text-sm font-medium transition-all',
            value === option.value
              ? option.color
              : 'bg-muted text-muted-foreground hover:bg-muted/70'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
