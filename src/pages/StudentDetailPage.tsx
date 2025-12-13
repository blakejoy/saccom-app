import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatWeekRange, getMondayOfWeek } from '@/lib/utils/date'
import type { Form } from '@/lib/db/schema'

export default function StudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const id = parseInt(studentId!)

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => window.electronAPI.students.getById({ id }),
  })

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading student...</div>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Students
        </Link>
      </div>

      {/* Student Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">{student.initials}</h1>
          <p className="mt-1 text-muted-foreground">Student #{student.studentNumber}</p>
        </div>
        <Link to={`/students/${student.id}/forms/new`}>
          <Button size="lg" className="w-full sm:w-auto">
            Create New Form
          </Button>
        </Link>
      </div>

      {/* Forms List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Accommodation Forms</h2>
        {student.forms.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                No forms yet. Create your first form to start tracking accommodations.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {student.forms.map((form: Form) => {
              const monday = getMondayOfWeek(form.weekNumber, form.year)
              const weekRange = formatWeekRange(monday)

              return (
                <Link key={form.id} to={`/students/${student.id}/forms/${form.id}`}>
                  <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Week {form.weekNumber}, {form.year}
                      </CardTitle>
                      <CardDescription>{weekRange}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {form.isSas ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            SAS
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Accommodations
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
