import { createStudent } from '@/lib/actions/students'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function NewStudentPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-2xl">
      <div className="mb-6">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
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
          <form action={createStudent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentNumber">Student Number</Label>
              <Input
                id="studentNumber"
                name="studentNumber"
                type="text"
                placeholder="e.g., 12345"
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
                maxLength={10}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Create Student
              </Button>
              <Link href="/" className="flex-1">
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
