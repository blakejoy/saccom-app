import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function NewStudentPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [studentNumber, setStudentNumber] = useState('')
  const [initials, setInitials] = useState('')

  const mutation = useMutation({
    mutationFn: (data: { studentNumber: string; initials: string }) =>
      window.electronAPI.students.create(data),
    onSuccess: (student) => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      navigate(`/students/${student.id}`)
    },
    onError: (error) => {
      alert(`Failed to create student: ${error.message}`)
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    mutation.mutate({
      studentNumber: studentNumber,
      initials: initials,
    })
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-2xl">
      <div className="mb-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Students
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Student</CardTitle>
          <CardDescription>
            Create a new student profile to start tracking accommodations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentNumber">Student Number</Label>
              <Input
                id="studentNumber"
                name="studentNumber"
                type="text"
                placeholder="e.g., 12345"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                onClear={() => setStudentNumber('')}
                showClear
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="initials">Student Initials</Label>
              <Input
                id="initials"
                name="initials"
                type="text"
                placeholder="e.g., JD"
                value={initials}
                onChange={(e) => setInitials(e.target.value)}
                onClear={() => setInitials('')}
                showClear
                maxLength={10}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={mutation.isPending}>
                {mutation.isPending ? 'Creating...' : 'Create Student'}
              </Button>
              <Link to="/" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
