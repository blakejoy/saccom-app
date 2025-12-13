import { useQuery } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { StudentCard } from '@/components/students/student-card'
import { StudentSearch } from '@/components/students/student-search'
import { Button } from '@/components/ui/button'
import type { Student } from '@/lib/db/schema'

export default function HomePage() {
  const [searchParams] = useSearchParams()
  const search = searchParams.get('search') || undefined

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students', search],
    queryFn: () => window.electronAPI.students.getAll({ search }),
  })

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading students...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Student Accommodation Tracker</h1>
            <p className="mt-2 text-muted-foreground">
              Manage student accommodations and track daily progress
            </p>
          </div>
          <Link to="/students/new">
            <Button size="lg" className="w-full sm:w-auto">
              Add Student
            </Button>
          </Link>
        </div>

        {/* Search */}
        <StudentSearch />

        {/* Student Grid */}
        {students.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {search
                ? 'No students found matching your search.'
                : 'No students yet. Add your first student to get started.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {students.map((student: Student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
