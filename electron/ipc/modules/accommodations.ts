import type { IpcMainInvokeEvent } from 'electron'
import { db } from '../../db'
import { accommodations, formAccommodations, dailyTracking } from '../../db/schema'
import { eq } from 'drizzle-orm'

/**
 * IPC Handler: Get all accommodations (active only by default)
 */
export async function getAllAccommodations(
  event: IpcMainInvokeEvent,
  params: { includeInactive?: boolean } = {}
) {
  if (params.includeInactive) {
    return await db.query.accommodations.findMany({
      orderBy: (accommodations, { asc }) => [asc(accommodations.sortOrder)],
    })
  }

  return await db.query.accommodations.findMany({
    where: (accommodations, { eq }) => eq(accommodations.isActive, true),
    orderBy: (accommodations, { asc }) => [asc(accommodations.sortOrder)],
  })
}

/**
 * IPC Handler: Create a new accommodation
 */
export async function createAccommodation(
  event: IpcMainInvokeEvent,
  data: { name: string; category?: string; sortOrder?: number }
) {
  // Get the max sort order and add 1
  const maxSortOrder = await db.query.accommodations.findMany({
    orderBy: (accommodations, { desc }) => [desc(accommodations.sortOrder)],
    limit: 1,
  })

  const sortOrder = data.sortOrder ?? (maxSortOrder[0]?.sortOrder ?? 0) + 1

  const [accommodation] = await db
    .insert(accommodations)
    .values({
      name: data.name,
      category: data.category,
      sortOrder,
      isActive: true,
    })
    .returning()

  return accommodation
}

/**
 * IPC Handler: Update an accommodation
 */
export async function updateAccommodation(
  event: IpcMainInvokeEvent,
  params: { id: number; name?: string; category?: string; sortOrder?: number }
) {
  const updates: any = {}
  if (params.name !== undefined) updates.name = params.name
  if (params.category !== undefined) updates.category = params.category
  if (params.sortOrder !== undefined) updates.sortOrder = params.sortOrder

  const [accommodation] = await db
    .update(accommodations)
    .set(updates)
    .where(eq(accommodations.id, params.id))
    .returning()

  return accommodation
}

/**
 * IPC Handler: Deactivate an accommodation (soft delete)
 */
export async function deactivateAccommodation(
  event: IpcMainInvokeEvent,
  params: { id: number }
) {
  await db
    .update(accommodations)
    .set({ isActive: false })
    .where(eq(accommodations.id, params.id))
}

/**
 * IPC Handler: Delete an accommodation (hard delete)
 */
export async function deleteAccommodation(
  event: IpcMainInvokeEvent,
  params: { id: number }
) {
  await db.delete(accommodations).where(eq(accommodations.id, params.id))
}

/**
 * IPC Handler: Add accommodation to an existing form
 */
export async function addAccommodationToForm(
  event: IpcMainInvokeEvent,
  params: { formId: number; accommodationId: number }
) {
  // Check if the accommodation is already on the form
  const existing = await db.query.formAccommodations.findFirst({
    where: (fa, { and, eq }) =>
      and(eq(fa.formId, params.formId), eq(fa.accommodationId, params.accommodationId)),
  })

  if (existing) {
    throw new Error('Accommodation already exists on this form')
  }

  // Create the form accommodation
  const [formAccommodation] = await db
    .insert(formAccommodations)
    .values({
      formId: params.formId,
      accommodationId: params.accommodationId,
    })
    .returning()

  // Create daily tracking records for each day (Mon-Fri)
  const trackingRecords = []
  for (let day = 1; day <= 5; day++) {
    trackingRecords.push({
      formAccommodationId: formAccommodation.id,
      dayOfWeek: day,
      status: 'n/a' as const,
    })
  }

  await db.insert(dailyTracking).values(trackingRecords)

  return formAccommodation
}

/**
 * IPC Handler: Remove accommodation from a form
 */
export async function removeAccommodationFromForm(
  event: IpcMainInvokeEvent,
  params: { formAccommodationId: number }
) {
  // Delete will cascade to daily tracking records
  await db.delete(formAccommodations).where(eq(formAccommodations.id, params.formAccommodationId))
}
