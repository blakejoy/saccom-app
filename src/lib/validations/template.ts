import { z } from 'zod'

export const templateSchema = z.object({
  studentId: z.number().positive('Student ID must be positive'),
  templateName: z.string().min(1, 'Template name is required'),
  isDefault: z.boolean().default(false),
  accommodationIds: z
    .array(z.number())
    .min(1, 'At least one accommodation is required'),
})

export type TemplateFormData = z.infer<typeof templateSchema>
