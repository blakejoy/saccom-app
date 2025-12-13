import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface DeleteFormButtonProps {
  formId: number
  studentId: number
}

export function DeleteFormButton({ formId, studentId }: DeleteFormButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () =>
      window.electronAPI.forms.delete({ id: formId, studentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', studentId] })
      navigate(`/students/${studentId}`)
    },
    onError: (error) => {
      alert(`Failed to delete form: ${error.message}`)
    },
  })

  const handleDelete = () => {
    mutation.mutate()
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
            disabled={mutation.isPending}
            className="flex-1"
          >
            {mutation.isPending ? 'Deleting...' : 'Yes, Delete'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowConfirm(false)}
            disabled={mutation.isPending}
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
