import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getStudentById } from '@/lib/actions/students'
import { db } from '@/lib/db'
import { accommodations } from '@/lib/db/schema'
import { FormCreationForm } from '@/components/forms/form-creation-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function NewFormPage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const { studentId } = await params
  const student = await getStudentById(parseInt(studentId))

  if (!student) {
    notFound()
  }

  // Fetch all active accommodations
  const allAccommodations =  await db.query.accommodations.findMany({
    where: (accommodations, { eq }) => eq(accommodations.isActive, true),
    orderBy: (accommodations, { asc }) => [asc(accommodations.sortOrder)],
  })

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="mb-6">
        <Link
          href={`/students/${studentId}`}
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
            accommodations={allAccommodations}
            templates={student.templates || []}
          />
        </CardContent>
      </Card>
    </div>
  )
}
