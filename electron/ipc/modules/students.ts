import type { IpcMainInvokeEvent } from 'electron'
import { db } from '../../db'
import { students } from '../../db/schema'
import { eq, like, or } from 'drizzle-orm'

/**
 * IPC Handler: Create a new student
 */
export async function createStudent(
  event: IpcMainInvokeEvent,
  data: { studentNumber: string; initials: string }
) {
  // Note: Add validation here if needed (Zod schema)
  const [student] = await db
    .insert(students)
    .values({
      studentNumber: data.studentNumber,
      initials: data.initials,
    })
    .returning()

  return student
}

/**
 * IPC Handler: Get all students with optional search
 */
export async function getStudents(
  event: IpcMainInvokeEvent,
  params: { search?: string }
) {
  if (params.search) {
    return await db.query.students.findMany({
      where: or(
        like(students.studentNumber, `%${params.search}%`),
        like(students.initials, `%${params.search}%`)
      ),
      orderBy: (students, { desc }) => [desc(students.createdAt)],
    })
  }

  return await db.query.students.findMany({
    orderBy: (students, { desc }) => [desc(students.createdAt)],
  })
}

/**
 * IPC Handler: Get student by ID with forms and templates
 */
export async function getStudentById(
  event: IpcMainInvokeEvent,
  params: { id: number }
) {
  return await db.query.students.findFirst({
    where: eq(students.id, params.id),
    with: {
      forms: {
        orderBy: (forms, { desc }) => [desc(forms.year), desc(forms.weekNumber)],
        limit: 20,
      },
      templates: true,
    },
  })
}

/**
 * IPC Handler: Delete student
 */
export async function deleteStudent(
  event: IpcMainInvokeEvent,
  params: { id: number }
) {
  await db.delete(students).where(eq(students.id, params.id))
  // Note: No redirect here - that's handled in renderer process
}
