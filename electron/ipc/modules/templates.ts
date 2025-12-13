import type { IpcMainInvokeEvent } from 'electron'
import { db, sqlite } from '../../db'
import { templates, templateAccommodations } from '../../db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * IPC Handler: Create template
 */
export async function createTemplate(
  event: IpcMainInvokeEvent,
  data: {
    studentId: number
    templateName: string
    isDefault: boolean
    accommodationIds: number[]
  }
) {
  const result = sqlite.transaction(() => {
    // If setting as default, unset other defaults for this student
    if (data.isDefault) {
      db.update(templates)
        .set({ isDefault: false })
        .where(eq(templates.studentId, data.studentId))
        .run()
    }

    // Insert template
    const templateResult = db
      .insert(templates)
      .values({
        studentId: data.studentId,
        templateName: data.templateName,
        isDefault: data.isDefault,
      })
      .returning()
      .get()

    // Insert template accommodations
    if (data.accommodationIds.length > 0) {
      db.insert(templateAccommodations)
        .values(
          data.accommodationIds.map((accId) => ({
            templateId: templateResult.id,
            accommodationId: accId,
          }))
        )
        .run()
    }

    return templateResult
  })

  return result
}

/**
 * IPC Handler: Get templates by student
 */
export async function getTemplatesByStudent(
  event: IpcMainInvokeEvent,
  params: { studentId: number }
) {
  return await db.query.templates.findMany({
    where: eq(templates.studentId, params.studentId),
    with: {
      templateAccommodations: {
        with: {
          accommodation: true,
        },
      },
    },
    orderBy: (templates, { desc, asc }) => [
      desc(templates.isDefault),
      asc(templates.templateName),
    ],
  })
}

/**
 * IPC Handler: Get template by ID
 */
export async function getTemplateById(event: IpcMainInvokeEvent, params: { id: number }) {
  return await db.query.templates.findFirst({
    where: eq(templates.id, params.id),
    with: {
      student: true,
      templateAccommodations: {
        with: {
          accommodation: true,
        },
      },
    },
  })
}

/**
 * IPC Handler: Delete template
 */
export async function deleteTemplate(
  event: IpcMainInvokeEvent,
  params: { id: number; studentId: number }
) {
  await db.delete(templates).where(eq(templates.id, params.id))
}

/**
 * IPC Handler: Set default template
 */
export async function setDefaultTemplate(
  event: IpcMainInvokeEvent,
  params: { studentId: number; templateId: number }
) {
  sqlite.transaction(() => {
    // Unset all defaults for this student
    db.update(templates)
      .set({ isDefault: false })
      .where(eq(templates.studentId, params.studentId))
      .run()

    // Set new default
    db.update(templates)
      .set({ isDefault: true })
      .where(and(eq(templates.id, params.templateId), eq(templates.studentId, params.studentId)))
      .run()
  })
}
