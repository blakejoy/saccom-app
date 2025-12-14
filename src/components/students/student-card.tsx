import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArchiveRestore } from 'lucide-react'
import type { Student } from '@/lib/db/schema'

interface StudentCardProps {
  student: Student
  onUnarchive?: (student: Student) => void
}

export function StudentCard({ student, onUnarchive }: StudentCardProps) {
  if (student.isArchived) {
    return (
      <Card className="opacity-60 bg-muted/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {student.initials}
                <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">
                  Archived
                </span>
              </CardTitle>
              <CardDescription>Student #{student.studentNumber}</CardDescription>
            </div>
            {onUnarchive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  onUnarchive(student)
                }}
                title="Restore from archive"
              >
                <ArchiveRestore className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Link to={`/students/${student.id}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardHeader>
          <CardTitle>{student.initials}</CardTitle>
          <CardDescription>Student #{student.studentNumber}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}
