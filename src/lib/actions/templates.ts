'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { templates, templateAccommodations } from '@/lib/db/schema'
import { templateSchema } from '@/lib/validations/template'
import { eq, and } from 'drizzle-orm'

export async function createTemplate(data: {
  studentId: number
  templateName: string
  isDefault: boolean
  accommodationIds: number[]
}) {
  const validated = templateSchema.parse(data)

  const result = db.transaction((tx) => {
    // If setting as default, unset other defaults for this student
    if (validated.isDefault) {
      tx
        .update(templates)
        .set({ isDefault: false })
        .where(eq(templates.studentId, validated.studentId))
        .run()
    }

    // Insert template
    const templateResult = tx
      .insert(templates)
      .values({
        studentId: validated.studentId,
        templateName: validated.templateName,
        isDefault: validated.isDefault,
      })
      .returning()
      .get()

    // Insert template accommodations
    if (validated.accommodationIds.length > 0) {
      tx.insert(templateAccommodations).values(
        validated.accommodationIds.map((accId) => ({
          templateId: templateResult.id,
          accommodationId: accId,
        }))
      ).run()
    }

    return templateResult
  })

  revalidatePath(`/students/${validated.studentId}`)
  return result
}

export async function getTemplatesByStudent(studentId: number) {
  return await db.query.templates.findMany({
    where: eq(templates.studentId, studentId),
    with: {
      templateAccommodations: {
        with: {
          accommodation: true,
        },
      },
    },
    orderBy: (templates, { desc, asc }) => [desc(templates.isDefault), asc(templates.templateName)],
  })
}

export async function getTemplateById(id: number) {
  return await db.query.templates.findFirst({
    where: eq(templates.id, id),
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

export async function deleteTemplate(id: number, studentId: number) {
  await db.delete(templates).where(eq(templates.id, id))
  revalidatePath(`/students/${studentId}`)
}

export async function setDefaultTemplate(studentId: number, templateId: number) {
  db.transaction((tx) => {
    // Unset all defaults for this student
    tx
      .update(templates)
      .set({ isDefault: false })
      .where(eq(templates.studentId, studentId))
      .run()

    // Set new default
    tx
      .update(templates)
      .set({ isDefault: true })
      .where(and(eq(templates.id, templateId), eq(templates.studentId, studentId)))
      .run()
  })

  revalidatePath(`/students/${studentId}`)
}
