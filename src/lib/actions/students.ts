'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { students } from '@/lib/db/schema'
import { studentSchema } from '@/lib/validations/student'
import { eq, like, or } from 'drizzle-orm'

export async function createStudent(formData: FormData) {
  const data = {
    studentNumber: formData.get('studentNumber') as string,
    initials: formData.get('initials') as string,
  }

  const validated = studentSchema.parse(data)

  const [student] = await db
    .insert(students)
    .values({
      studentNumber: validated.studentNumber,
      initials: validated.initials,
    })
    .returning()

  revalidatePath('/')
  redirect(`/students/${student.id}`)
}

export async function getStudents(search?: string) {
  if (search) {
    return await db.query.students.findMany({
      where: or(
        like(students.studentNumber, `%${search}%`),
        like(students.initials, `%${search}%`)
      ),
      orderBy: (students, { desc }) => [desc(students.createdAt)],
    })
  }

  return await db.query.students.findMany({
    orderBy: (students, { desc }) => [desc(students.createdAt)],
  })
}

export async function getStudentById(id: number) {
  return await db.query.students.findFirst({
    where: eq(students.id, id),
    with: {
      forms: {
        orderBy: (forms, { desc }) => [desc(forms.year), desc(forms.weekNumber)],
        limit: 20,
      },
      templates: true,
    },
  })
}

export async function deleteStudent(id: number) {
  await db.delete(students).where(eq(students.id, id))
  revalidatePath('/')
  redirect('/')
}
