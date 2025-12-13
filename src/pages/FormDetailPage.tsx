import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatWeekRange, getMondayOfWeek } from '@/lib/utils/date'
import { DailyTrackingGrid } from '@/components/forms/daily-tracking-grid'
import { DeleteFormButton } from '@/components/forms/delete-form-button'

export default function FormDetailPage() {
  const { studentId, formId } = useParams<{ studentId: string; formId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: form, isLoading } = useQuery({
    queryKey: ['form', parseInt(formId!)],
    queryFn: () => window.electronAPI.forms.getById({ id: parseInt(formId!) }),
  })

  const duplicateMutation = useMutation({
    mutationFn: (formId: number) =>
      window.electronAPI.forms.duplicate({ formId }),
    onSuccess: (newForm) => {
      queryClient.invalidateQueries({ queryKey: ['student', parseInt(studentId!)] })
      navigate(`/students/${studentId}/forms/${newForm.id}`)
    },
    onError: (error) => {
      alert(`Failed to duplicate form: ${error.message}`)
    },
  })

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  if (!form || form.studentId !== parseInt(studentId!)) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Form not found</p>
          <Link to={`/students/${studentId}`} className="mt-4 inline-block">
            <Button>Back to Student</Button>
          </Link>
        </div>
      </div>
    )
  }

  const monday = getMondayOfWeek(form.weekNumber, form.year)
  const weekRange = formatWeekRange(monday)

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <Link
          to={`/students/${studentId}`}
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
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => duplicateMutation.mutate(form.id)}
              disabled={duplicateMutation.isPending}
            >
              {duplicateMutation.isPending ? 'Duplicating...' : 'Duplicate for Next Week'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                window.electronAPI.window.open({
                  url: `/students/${studentId}/forms/${formId}/print`,
                  width: 1200,
                  height: 900,
                })
              }}
            >
              Print
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                window.electronAPI.window.open({
                  url: `/students/${studentId}/forms/${formId}/pdf`,
                  width: 1200,
                  height: 900,
                })
              }}
            >
              Download PDF
            </Button>
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
        <DailyTrackingGrid formAccommodations={form.formAccommodations} formId={form.id} />
      )}
    </div>
  )
}
