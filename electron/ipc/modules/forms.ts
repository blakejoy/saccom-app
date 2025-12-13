import type { IpcMainInvokeEvent } from 'electron'
import { db, sqlite } from '../../db'
import { dailyTracking, formAccommodations, forms } from '../../db/schema'
import { eq } from 'drizzle-orm'

/**
 * Helper: Get Monday of week (from date utils)
 */
function getMondayOfWeek(weekNumber: number, year: number): Date {
  const jan4 = new Date(year, 0, 4)
  const jan4Day = jan4.getDay() || 7
  const weekStart = new Date(jan4)
  weekStart.setDate(jan4.getDate() - jan4Day + 1)
  weekStart.setDate(weekStart.getDate() + (weekNumber - 1) * 7)
  return weekStart
}

/**
 * Helper: Get next week
 */
function getNextWeek(weekNumber: number, year: number): { weekNumber: number; year: number } {
  if (weekNumber >= 52) {
    return { weekNumber: 1, year: year + 1 }
  }
  return { weekNumber: weekNumber + 1, year }
}

/**
 * Helper: Format date as ISO string
 */
function formatISODate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * IPC Handler: Create form with accommodations
 * Uses native SQLite transaction for atomic operation
 */
export async function createForm(
  event: IpcMainInvokeEvent,
  data: {
    studentId: number
    weekNumber: number
    year: number
    startDate: string
    isSas: boolean
    accommodationIds?: number[]
    templateId?: number
  }
) {
  // Use better-sqlite3 native transaction (synchronous)
  const transaction = sqlite.transaction(() => {
    // Insert form
    const formResult = db
      .insert(forms)
      .values({
        studentId: data.studentId,
        weekNumber: data.weekNumber,
        year: data.year,
        startDate: data.startDate,
        isSas: data.isSas,
        templateId: data.templateId,
      })
      .returning()
      .all()

    const form = formResult[0]

    // Only add accommodations if not SAS
    if (!data.isSas && data.accommodationIds && data.accommodationIds.length > 0) {
      // Insert form accommodations
      const accommodationValues = data.accommodationIds.map((accId) => ({
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

/**
 * IPC Handler: Get form by ID with all relations
 */
export async function getFormById(event: IpcMainInvokeEvent, params: { id: number }) {
  return await db.query.forms.findFirst({
    where: eq(forms.id, params.id),
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

/**
 * IPC Handler: Delete form
 */
export async function deleteForm(
  event: IpcMainInvokeEvent,
  params: { id: number; studentId: number }
) {
  await db.delete(forms).where(eq(forms.id, params.id))
  // Note: Navigation handled in renderer
}

/**
 * IPC Handler: Duplicate form for next week
 */
export async function duplicateForm(event: IpcMainInvokeEvent, params: { formId: number }) {
  // Fetch original form with accommodations
  const originalForm = await db.query.forms.findFirst({
    where: eq(forms.id, params.formId),
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
  const accommodationIds = originalForm.formAccommodations.map((fa) => fa.accommodationId)

  // Create new form using transaction
  const transaction = sqlite.transaction(() => {
    const formResult = db
      .insert(forms)
      .values({
        studentId: originalForm.studentId,
        weekNumber: nextWeekNumber,
        year: nextYear,
        startDate: nextStartDate,
        isSas: originalForm.isSas,
        templateId: originalForm.templateId,
      })
      .returning()
      .all()

    const form = formResult[0]

    if (!originalForm.isSas && accommodationIds.length > 0) {
      const accommodationValues = accommodationIds.map((accId) => ({
        formId: form.id,
        accommodationId: accId,
      }))

      const formAccs = db.insert(formAccommodations).values(accommodationValues).returning().all()

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
