'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { dailyTracking, formAccommodations, forms } from '@/lib/db/schema'
import { dailyTrackingSchema } from '@/lib/validations/daily-tracking'
import { eq } from 'drizzle-orm'

export async function updateDailyStatus(
  trackingId: number,
  status: 'accepted' | 'rejected' | 'n/a',
  notes?: string
) {
  const validated = dailyTrackingSchema.parse({
    trackingId,
    status,
    notes,
  })

  // Get the tracking record with form info for revalidation
  const tracking = await db.query.dailyTracking.findFirst({
    where: eq(dailyTracking.id, validated.trackingId),
    with: {
      formAccommodation: {
        with: {
          form: true,
        },
      },
    },
  })

  if (!tracking) {
    throw new Error('Tracking record not found')
  }

  // Update the status
  await db
    .update(dailyTracking)
    .set({
      status: validated.status,
      notes: validated.notes,
      updatedAt: new Date(),
    })
    .where(eq(dailyTracking.id, validated.trackingId))

  // Revalidate the form page
  const formId = tracking.formAccommodation.formId
  const form = await db.query.forms.findFirst({
    where: eq(forms.id, formId),
  })

  if (form) {
    revalidatePath(`/students/${form.studentId}/forms/${formId}`)
  }
}
