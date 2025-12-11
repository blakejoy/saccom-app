'use server'

import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'
import {db, sqlite} from '@/lib/db'
import {dailyTracking, formAccommodations, forms} from '@/lib/db/schema'
import {formSchema} from '@/lib/validations/form'
import {eq} from 'drizzle-orm'
import {formatISODate, getMondayOfWeek, getNextWeek} from '@/lib/utils/date'

// Helper function to create form without redirect
async function createFormInternal(data: {
  studentId: number
  weekNumber: number
  year: number
  startDate: string
  isSas: boolean
  accommodationIds?: number[]
  templateId?: number
}) {
  const validated = formSchema.parse(data)

  // Use better-sqlite3 native transaction (synchronous - no async/await)
  const transaction = sqlite.transaction(() => {
          // Insert form - use .all() to execute and get results
          const formResult = db.insert(forms).values({
              studentId: validated.studentId,
              weekNumber: validated.weekNumber,
              year: validated.year,
              startDate: validated.startDate,
              isSas: validated.isSas,
              templateId: validated.templateId,
          }).returning().all()

          const form = formResult[0]


          // Only add accommodations if not SAS
          if (!validated.isSas && validated.accommodationIds && validated.accommodationIds.length > 0) {
              // Insert form accommodations and get the IDs
              const accommodationValues = validated.accommodationIds.map((accId) => ({
                  formId: form.id,
                  accommodationId: accId,
              }))

              const formAccs = db.insert(formAccommodations).values(accommodationValues).returning().all()

              // Initialize daily tracking (5 days × N accommodations)
              const trackingRecords = formAccs.flatMap((fa: any) =>
                  [1, 2, 3, 4, 5].map((day) => ({
                      formAccommodationId: fa.id,
                      dayOfWeek: day,
                      status: 'n/a' as const,
                  }))
              )

              if (trackingRecords.length > 0) {
                  db.insert(dailyTracking).values(trackingRecords).run()
              }
          }
          return form
      })

  return transaction()
}

export async function createFormWithAccommodations(data: {
  studentId: number
  weekNumber: number
  year: number
  startDate: string
  isSas: boolean
  accommodationIds?: number[]
  templateId?: number
}) {
  const result = await createFormInternal(data);
  revalidatePath(`/students/${data.studentId}`)
  redirect(`/students/${data.studentId}/forms/${result.id}`)
}

export async function getFormById(id: number) {
  return await db.query.forms.findFirst({
    where: eq(forms.id, id),
    with: {
      student: true,
      template: true,
      formAccommodations: {
        with: {
          accommodation: true,
          dailyTracking: {
            orderBy: (dailyTracking, { asc }) => [asc(dailyTracking.dayOfWeek)],
          },
        },
      },
    },
  })
}

export async function deleteForm(id: number, studentId: number) {
  await db.delete(forms).where(eq(forms.id, id))
  revalidatePath(`/students/${studentId}`)
  redirect(`/students/${studentId}`)
}

export async function duplicateFormForNextWeek(formId: number) {
  // Fetch original form with all accommodations
  const originalForm = await db.query.forms.findFirst({
    where: eq(forms.id, formId),
    with: {
      formAccommodations: {
        with: {
          accommodation: true,
        },
      },
    },
  })

  if (!originalForm) {
    throw new Error('Form not found')
  }

  // Calculate next week
  const { weekNumber: nextWeekNumber, year: nextYear } = getNextWeek(
    originalForm.weekNumber,
    originalForm.year
  )

  // Get Monday of next week
  const nextMonday = getMondayOfWeek(nextWeekNumber, nextYear)
  const nextStartDate = formatISODate(nextMonday)

  // Get accommodation IDs
  const accommodationIds = originalForm.formAccommodations.map(
    (fa) => fa.accommodationId
  )

  // Create new form using internal helper
  const newForm = await createFormInternal({
    studentId: originalForm.studentId,
    weekNumber: nextWeekNumber,
    year: nextYear,
    startDate: nextStartDate,
    isSas: originalForm.isSas,
    accommodationIds: originalForm.isSas ? [] : accommodationIds,
    templateId: originalForm.templateId ?? undefined,
  })

  revalidatePath(`/students/${originalForm.studentId}`)
  redirect(`/students/${originalForm.studentId}/forms/${newForm.id}`)
}
