import { z } from 'zod'

export const dailyTrackingSchema = z.object({
  trackingId: z.number().positive('Tracking ID must be positive'),
  status: z.enum(['accepted', 'rejected', 'n/a'], {
    required_error: 'Status is required',
  }),
  notes: z.string().optional(),
})

export type DailyTrackingFormData = z.infer<typeof dailyTrackingSchema>
