'use client'

import { useOptimistic, useTransition } from 'react'
import { updateDailyStatus } from '@/lib/actions/daily-tracking'
import { StatusToggle } from './status-toggle'
import type { DailyStatusType } from '@/lib/db/schema'

interface DailyTrackingCellProps {
  trackingId: number
  initialStatus: DailyStatusType
}

export function DailyTrackingCell({ trackingId, initialStatus }: DailyTrackingCellProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(initialStatus)

  const handleStatusChange = (newStatus: DailyStatusType) => {
    startTransition(async () => {
      setOptimisticStatus(newStatus)
      await updateDailyStatus(trackingId, newStatus)
    })
  }

  return (
    <div className={isPending ? 'opacity-70 pointer-events-none' : ''}>
      <StatusToggle value={optimisticStatus} onChange={handleStatusChange} />
    </div>
  )
}
