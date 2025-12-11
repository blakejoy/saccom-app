import Link from 'next/link'
import { Suspense } from 'react'
import { getStudents } from '@/lib/actions/students'
import { StudentCard } from '@/components/students/student-card'
import { StudentSearch } from '@/components/students/student-search'
import { Button } from '@/components/ui/button'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const students = await getStudents(params.search)

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
          <Link href="/students/new">
            <Button size="lg" className="w-full sm:w-auto">
              Add Student
            </Button>
          </Link>
        </div>

        {/* Search */}
        <Suspense fallback={<div className="h-9 w-full max-w-md animate-pulse bg-muted rounded-md" />}>
          <StudentSearch />
        </Suspense>

        {/* Student Grid */}
        {students.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {params.search
                ? 'No students found matching your search.'
                : 'No students yet. Add your first student to get started.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {students.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
