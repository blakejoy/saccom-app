import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { Student } from '@/lib/db/schema'

export function StudentCard({ student }: { student: Student }) {
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
