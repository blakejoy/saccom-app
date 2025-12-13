import { z } from 'zod'

export const studentSchema = z.object({
  studentNumber: z.string().min(1, 'Student number is required'),
  initials: z
    .string()
    .min(1, 'Initials are required')
    .max(10, 'Initials must be 10 characters or less'),
})

export type StudentFormData = z.infer<typeof studentSchema>
