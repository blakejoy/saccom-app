import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { StatusToggle } from './status-toggle'
import type { DailyStatusType } from '@/lib/db/schema'

interface DailyTrackingCellProps {
  trackingId: number
  initialStatus: DailyStatusType
  formId: number
}

export function DailyTrackingCell({ trackingId, initialStatus, formId }: DailyTrackingCellProps) {
  const [optimisticStatus, setOptimisticStatus] = useState(initialStatus)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (status: DailyStatusType) =>
      window.electronAPI.tracking.updateStatus({ trackingId, status }),
    onMutate: async (newStatus) => {
      // Optimistically update the UI
      setOptimisticStatus(newStatus)
    },
    onSuccess: () => {
      // Refresh the form data from the server
      queryClient.invalidateQueries({ queryKey: ['form', formId] })
    },
    onError: () => {
      // Revert to original status on error
      setOptimisticStatus(initialStatus)
    },
  })

  const handleStatusChange = (newStatus: DailyStatusType) => {
    mutation.mutate(newStatus)
  }

  return (
    <div className={mutation.isPending ? 'opacity-70 pointer-events-none' : ''}>
      <StatusToggle value={optimisticStatus} onChange={handleStatusChange} />
    </div>
  )
}
