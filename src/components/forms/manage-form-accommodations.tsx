import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, X } from 'lucide-react'
import type { Accommodation } from '@/lib/db/schema'

interface ManageFormAccommodationsProps {
  formId: number
  currentAccommodations: Array<{
    id: number
    accommodationId: number
    accommodation: Accommodation
  }>
}

export function ManageFormAccommodations({
  formId,
  currentAccommodations,
}: ManageFormAccommodationsProps) {
  const [isAdding, setIsAdding] = useState(false)
  const queryClient = useQueryClient()

  // Get all available accommodations
  const { data: allAccommodations = [] } = useQuery({
    queryKey: ['accommodations'],
    queryFn: () => window.electronAPI.accommodations.getAll(),
  })

  // Mutation to add accommodation
  const addMutation = useMutation({
    mutationFn: (accommodationId: number) =>
      window.electronAPI.accommodations.addToForm({ formId, accommodationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form', formId] })
      setIsAdding(false)
    },
    onError: (error) => {
      alert(`Failed to add accommodation: ${error.message}`)
    },
  })

  // Mutation to remove accommodation
  const removeMutation = useMutation({
    mutationFn: (formAccommodationId: number) =>
      window.electronAPI.accommodations.removeFromForm({ formAccommodationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form', formId] })
    },
    onError: (error) => {
      alert(`Failed to remove accommodation: ${error.message}`)
    },
  })

  function getAvailableAccommodations(): Accommodation[] {
    // Create a Set of accommodation IDs that are already on this form
    const currentAccommodationIds = new Set(
      currentAccommodations.map(ca => ca.accommodationId)
    );
    // Filter to only include accommodations NOT already on the form
    return allAccommodations.filter((acc: Accommodation) => !currentAccommodationIds.has(acc.id));
  }

  const availableAccommodations = getAvailableAccommodations()

  const handleRemove = (formAccommodationId: number, accommodationName: string) => {
    if (window.confirm(`Remove "${accommodationName}" from this form? This will delete all tracking data for this accommodation.`)) {
      removeMutation.mutate(formAccommodationId)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Manage Accommodations</CardTitle>
          {!isAdding && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(true)}
              disabled={availableAccommodations.length === 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Accommodation
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-4 p-4 border rounded-lg">
            <h4 className="font-semibold mb-3">Select an accommodation to add:</h4>
            {availableAccommodations.length === 0 ? (
              <p className="text-sm text-muted-foreground">All accommodations have been added to this form.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {availableAccommodations.map((accommodation) => (
                  <Button
                    key={accommodation.id}
                    variant="outline"
                    className="justify-start"
                    onClick={() => addMutation.mutate(accommodation.id)}
                    disabled={addMutation.isPending}
                  >
                    {accommodation.name}
                    {accommodation.category && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({accommodation.category})
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </Button>
          </div>
        )}

        {currentAccommodations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No accommodations on this form. Click "Add Accommodation" to get started.
          </p>
        ) : (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold mb-2">Current Accommodations:</h4>
            {currentAccommodations.map((fa) => (
              <div
                key={fa.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div>
                  <p className="font-medium">{fa.accommodation.name}</p>
                  {fa.accommodation.category && (
                    <p className="text-xs text-muted-foreground">{fa.accommodation.category}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(fa.id, fa.accommodation.name)}
                  disabled={removeMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
