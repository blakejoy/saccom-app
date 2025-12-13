import type { IpcMainInvokeEvent } from 'electron'
import { db } from '../../db'
import { dailyTracking } from '../../db/schema'
import { eq } from 'drizzle-orm'

/**
 * IPC Handler: Update daily tracking status
 */
export async function updateStatus(
  event: IpcMainInvokeEvent,
  data: {
    trackingId: number
    status: 'accepted' | 'rejected' | 'n/a'
    notes?: string
  }
) {
  await db
    .update(dailyTracking)
    .set({
      status: data.status,
      notes: data.notes,
      updatedAt: new Date(),
    })
    .where(eq(dailyTracking.id, data.trackingId))

  // Note: Cache invalidation handled in renderer with React Query
}
