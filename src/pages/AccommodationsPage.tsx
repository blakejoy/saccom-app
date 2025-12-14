import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Archive, Trash2, X } from 'lucide-react'
import type { Accommodation } from '@/lib/db/schema'

export default function AccommodationsPage() {
  const [showInactive, setShowInactive] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({ name: '', category: '' })
  const queryClient = useQueryClient()

  const { data: accommodations = [], isLoading } = useQuery({
    queryKey: ['accommodations', showInactive],
    queryFn: () => window.electronAPI.accommodations.getAll({ includeInactive: showInactive }),
  })

  const createMutation = useMutation({
    mutationFn: (data: { name: string; category?: string }) =>
      window.electronAPI.accommodations.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accommodations'] })
      setIsCreating(false)
      setFormData({ name: '', category: '' })
    },
    onError: (error) => {
      alert(`Failed to create accommodation: ${error.message}`)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (params: { id: number; name?: string; category?: string }) =>
      window.electronAPI.accommodations.update(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accommodations'] })
      setEditingId(null)
      setFormData({ name: '', category: '' })
    },
    onError: (error) => {
      alert(`Failed to update accommodation: ${error.message}`)
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => window.electronAPI.accommodations.deactivate({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accommodations'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => window.electronAPI.accommodations.delete({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accommodations'] })
    },
    onError: (error) => {
      alert(`Failed to delete accommodation: ${error.message}`)
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    createMutation.mutate({
      name: formData.name.trim(),
      category: formData.category.trim() || undefined,
    })
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId || !formData.name.trim()) return
    updateMutation.mutate({
      id: editingId,
      name: formData.name.trim(),
      category: formData.category.trim() || undefined,
    })
  }

  const startEditing = (accommodation: Accommodation) => {
    setEditingId(accommodation.id)
    setFormData({
      name: accommodation.name,
      category: accommodation.category || '',
    })
    setIsCreating(false)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setIsCreating(false)
    setFormData({ name: '', category: '' })
  }

  const handleDeactivate = (accommodation: Accommodation) => {
    if (window.confirm(`Deactivate "${accommodation.name}"? It will be hidden from form creation but remain on existing forms.`)) {
      deactivateMutation.mutate(accommodation.id)
    }
  }

  const handleDelete = (accommodation: Accommodation) => {
    if (window.confirm(`Permanently delete "${accommodation.name}"? This cannot be undone and may affect existing forms.`)) {
      deleteMutation.mutate(accommodation.id)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading accommodations...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Students
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold">Manage Accommodations</h1>
        <p className="mt-1 text-muted-foreground">
          Create, edit, and organize accommodations for student forms.
        </p>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingId !== null) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{isCreating ? 'Create New Accommodation' : 'Edit Accommodation'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={isCreating ? handleCreate : handleUpdate} className="space-y-4">
              <div>
                <Label htmlFor="name">Accommodation Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Extended Time"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category (Optional)</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Testing, Classroom"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {isCreating ? 'Create' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline" onClick={cancelEditing}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        {!isCreating && !editingId && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Accommodation
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => setShowInactive(!showInactive)}
        >
          {showInactive ? 'Hide Inactive' : 'Show Inactive'}
        </Button>
      </div>

      {/* Accommodations List */}
      <div className="grid grid-cols-1 gap-3">
        {accommodations.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                No accommodations found. Create your first accommodation to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          accommodations.map((accommodation) => (
            <Card
              key={accommodation.id}
              className={!accommodation.isActive ? 'opacity-60 bg-muted/50' : ''}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{accommodation.name}</h3>
                      {!accommodation.isActive && (
                        <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    {accommodation.category && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Category: {accommodation.category}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Sort Order: {accommodation.sortOrder}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {accommodation.isActive && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(accommodation)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivate(accommodation)}
                          disabled={deactivateMutation.isPending}
                          title="Deactivate"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(accommodation)}
                      disabled={deleteMutation.isPending}
                      title="Delete Permanently"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
