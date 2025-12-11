import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getFormById, duplicateFormForNextWeek, deleteForm } from '@/lib/actions/forms'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatWeekRange, getMondayOfWeek } from '@/lib/utils/date'
import { DailyTrackingGrid } from '@/components/forms/daily-tracking-grid'
import { DeleteFormButton } from '@/components/forms/delete-form-button'

export default async function FormDetailPage({
  params,
}: {
  params: Promise<{ studentId: string; formId: string }>
}) {
  const { studentId, formId } = await params
  const form = await getFormById(parseInt(formId))

  if (!form || form.studentId !== parseInt(studentId)) {
    notFound()
  }

  const monday = getMondayOfWeek(form.weekNumber, form.year)
  const weekRange = formatWeekRange(monday)

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <Link
          href={`/students/${studentId}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to {form.student.initials}
        </Link>
      </div>

      {/* Form Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">
              {form.student.initials} - Week {form.weekNumber}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {weekRange} ({form.year})
            </p>
            {form.isSas && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mt-2">
                Student Accessibility Services (SAS)
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <form action={duplicateFormForNextWeek.bind(null, form.id)}>
              <Button type="submit" variant="outline" className="w-full">
                Duplicate for Next Week
              </Button>
            </form>
            <Link
              href={`/students/${studentId}/forms/${formId}/print`}
              target="_blank"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
            >
              Print
            </Link>
            <Link
              href={`/students/${studentId}/forms/${formId}/pdf`}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
            >
              Download PDF
            </Link>
            <DeleteFormButton formId={form.id} studentId={form.studentId} />
          </div>
        </div>
      </div>

      {/* Daily Tracking */}
      {form.isSas ? (
        <Card>
          <CardHeader>
            <CardTitle>SAS Accommodations</CardTitle>
            <CardDescription>
              This student is using standard Student Accessibility Services accommodations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No daily tracking needed for SAS forms.
            </p>
          </CardContent>
        </Card>
      ) : form.formAccommodations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No accommodations selected for this form.
            </p>
          </CardContent>
        </Card>
      ) : (
        <DailyTrackingGrid formAccommodations={form.formAccommodations} />
      )}
    </div>
  )
}
