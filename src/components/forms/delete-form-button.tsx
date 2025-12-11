'use client'

import { useState, useTransition } from 'react'
import { deleteForm } from '@/lib/actions/forms'
import { Button } from '@/components/ui/button'

interface DeleteFormButtonProps {
  formId: number
  studentId: number
}

export function DeleteFormButton({ formId, studentId }: DeleteFormButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      await deleteForm(formId, studentId)
    })
  }

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-2 w-full sm:w-auto">
        <p className="text-sm text-destructive font-medium">Delete this form?</p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
            className="flex-1"
          >
            {isPending ? 'Deleting...' : 'Yes, Delete'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowConfirm(false)}
            disabled={isPending}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button
      type="button"
      variant="destructive"
      onClick={() => setShowConfirm(true)}
      className="w-full"
    >
      Delete Form
    </Button>
  )
}
