import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { FormCreationForm } from '@/components/forms/form-creation-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function NewFormPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const id = parseInt(studentId!)

  const { data: student, isLoading: studentLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => window.electronAPI.students.getById({ id }),
  })

  const { data: accommodations = [], isLoading: accommodationsLoading } = useQuery({
    queryKey: ['accommodations'],
    queryFn: () => window.electronAPI.accommodations.getAll(),
  })

  const isLoading = studentLoading || accommodationsLoading

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Student not found</p>
          <Link to="/" className="mt-4 inline-block">
            <Button>Back to Students</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="mb-6">
        <Link
          to={`/students/${studentId}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to {student.initials}
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Form</CardTitle>
          <CardDescription>
            Create a new accommodation form for {student.initials} (#{student.studentNumber})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormCreationForm
            studentId={student.id}
            accommodations={accommodations}
            templates={student.templates || []}
          />
        </CardContent>
      </Card>
    </div>
  )
}
