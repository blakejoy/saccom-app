import type { IpcMainInvokeEvent } from 'electron'
import { db } from '../../db'
import { students } from '../../db/schema'
import { eq, like, or, and } from 'drizzle-orm'

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
  params: { search?: string; includeArchived?: boolean }
) {
  const conditions = []

  // By default, exclude archived students
  if (!params.includeArchived) {
    conditions.push(eq(students.isArchived, false))
  }

  // Add search conditions
  if (params.search) {
    conditions.push(
      or(
        like(students.studentNumber, `%${params.search}%`),
        like(students.initials, `%${params.search}%`)
      )
    )
  }

  return await db.query.students.findMany({
    where: conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : and(...conditions)) : undefined,
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
 * IPC Handler: Archive student (soft delete)
 */
export async function archiveStudent(
  event: IpcMainInvokeEvent,
  params: { id: number }
) {
  await db.update(students)
    .set({ isArchived: true })
    .where(eq(students.id, params.id))
}

/**
 * IPC Handler: Unarchive student (restore)
 */
export async function unarchiveStudent(
  event: IpcMainInvokeEvent,
  params: { id: number }
) {
  await db.update(students)
    .set({ isArchived: false })
    .where(eq(students.id, params.id))
}

/**
 * IPC Handler: Delete student (hard delete - use with caution)
 */
export async function deleteStudent(
  event: IpcMainInvokeEvent,
  params: { id: number }
) {
  await db.delete(students).where(eq(students.id, params.id))
  // Note: No redirect here - that's handled in renderer process
}
