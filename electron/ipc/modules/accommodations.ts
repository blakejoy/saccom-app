import type { IpcMainInvokeEvent } from 'electron'
import { db } from '../../db'

/**
 * IPC Handler: Get all accommodations
 */
export async function getAllAccommodations(event: IpcMainInvokeEvent, params: void) {
  return await db.query.accommodations.findMany({
    where: (accommodations, { eq }) => eq(accommodations.isActive, true),
    orderBy: (accommodations, { asc }) => [asc(accommodations.sortOrder)],
  })
}
