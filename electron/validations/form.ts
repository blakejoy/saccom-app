import { z } from 'zod'

export const formSchema = z.object({
  studentId: z.number().positive('Student ID must be positive'),
  weekNumber: z
    .number()
    .min(1, 'Week number must be at least 1')
    .max(53, 'Week number must be at most 53'),
  year: z
    .number()
    .min(2024, 'Year must be 2024 or later')
    .max(2050, 'Year must be 2050 or earlier'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  isSas: z.boolean().default(false),
  accommodationIds: z.array(z.number()).optional(),
  templateId: z.number().optional(),
})

export type FormFormData = z.infer<typeof formSchema>
