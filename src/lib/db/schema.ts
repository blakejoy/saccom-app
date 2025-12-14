import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

// Students table
export const students = sqliteTable('students', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  studentNumber: text('student_number').notNull().unique(),
  initials: text('initials').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date())
    .notNull(),
})

// Students relations
export const studentsRelations = relations(students, ({ many }) => ({
  forms: many(forms),
  templates: many(templates),
}))

// Accommodations table (predefined list)
export const accommodations = sqliteTable('accommodations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  category: text('category'),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
})

// Accommodations relations
export const accommodationsRelations = relations(accommodations, ({ many }) => ({
  formAccommodations: many(formAccommodations),
  templateAccommodations: many(templateAccommodations),
}))

// Templates table
export const templates = sqliteTable('templates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  studentId: integer('student_id')
    .notNull()
    .references(() => students.id, { onDelete: 'cascade' }),
  templateName: text('template_name').notNull(),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date())
    .notNull(),
})

// Templates relations
export const templatesRelations = relations(templates, ({ one, many }) => ({
  student: one(students, {
    fields: [templates.studentId],
    references: [students.id],
  }),
  templateAccommodations: many(templateAccommodations),
  forms: many(forms),
}))

// Template accommodations junction table
export const templateAccommodations = sqliteTable('template_accommodations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  templateId: integer('template_id')
    .notNull()
    .references(() => templates.id, { onDelete: 'cascade' }),
  accommodationId: integer('accommodation_id')
    .notNull()
    .references(() => accommodations.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
})

// Template accommodations relations
export const templateAccommodationsRelations = relations(templateAccommodations, ({ one }) => ({
  template: one(templates, {
    fields: [templateAccommodations.templateId],
    references: [templates.id],
  }),
  accommodation: one(accommodations, {
    fields: [templateAccommodations.accommodationId],
    references: [accommodations.id],
  }),
}))

// Forms table
export const forms = sqliteTable('forms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  studentId: integer('student_id')
    .notNull()
    .references(() => students.id, { onDelete: 'cascade' }),
  weekNumber: integer('week_number').notNull(),
  year: integer('year').notNull(),
  startDate: text('start_date').notNull(), // ISO date string (Monday)
  isSas: integer('is_sas', { mode: 'boolean' }).notNull().default(false),
  templateId: integer('template_id').references(() => templates.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date())
    .notNull(),
})

// Forms relations
export const formsRelations = relations(forms, ({ one, many }) => ({
  student: one(students, {
    fields: [forms.studentId],
    references: [students.id],
  }),
  template: one(templates, {
    fields: [forms.templateId],
    references: [templates.id],
  }),
  formAccommodations: many(formAccommodations),
}))

// Form accommodations junction table
export const formAccommodations = sqliteTable('form_accommodations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  formId: integer('form_id')
    .notNull()
    .references(() => forms.id, { onDelete: 'cascade' }),
  accommodationId: integer('accommodation_id')
    .notNull()
    .references(() => accommodations.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
})

// Form accommodations relations
export const formAccommodationsRelations = relations(formAccommodations, ({ one, many }) => ({
  form: one(forms, {
    fields: [formAccommodations.formId],
    references: [forms.id],
  }),
  accommodation: one(accommodations, {
    fields: [formAccommodations.accommodationId],
    references: [accommodations.id],
  }),
  dailyTracking: many(dailyTracking),
}))

// Daily tracking table
export const dailyTracking = sqliteTable('daily_tracking', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  formAccommodationId: integer('form_accommodation_id')
    .notNull()
    .references(() => formAccommodations.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(), // 1-5 (Mon-Fri)
  status: text('status', { enum: ['accepted', 'rejected', 'n/a'] })
    .notNull()
    .default('n/a'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date())
    .notNull(),
})

// Daily tracking relations
export const dailyTrackingRelations = relations(dailyTracking, ({ one }) => ({
  formAccommodation: one(formAccommodations, {
    fields: [dailyTracking.formAccommodationId],
    references: [formAccommodations.id],
  }),
}))

// Type exports
export type Student = typeof students.$inferSelect
export type NewStudent = typeof students.$inferInsert

export type Accommodation = typeof accommodations.$inferSelect
export type NewAccommodation = typeof accommodations.$inferInsert

export type Template = typeof templates.$inferSelect
export type NewTemplate = typeof templates.$inferInsert

export type TemplateAccommodation = typeof templateAccommodations.$inferSelect
export type NewTemplateAccommodation = typeof templateAccommodations.$inferInsert

export type Form = typeof forms.$inferSelect
export type NewForm = typeof forms.$inferInsert

export type FormAccommodation = typeof formAccommodations.$inferSelect
export type NewFormAccommodation = typeof formAccommodations.$inferInsert

export type DailyTracking = typeof dailyTracking.$inferSelect
export type NewDailyTracking = typeof dailyTracking.$inferInsert

// Status enum
export const DailyStatus = {
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  NA: 'n/a',
} as const

export type DailyStatusType = (typeof DailyStatus)[keyof typeof DailyStatus]
