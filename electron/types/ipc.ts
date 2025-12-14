// Type-safe IPC channel definitions
// This file defines the contract between renderer and main process

import type {
  Student,
  Form,
  Template,
  Accommodation,
  DailyTracking,
} from '../db/schema'

// IPC Channel interface - defines request/response types for each channel
export interface IpcChannels {
  // ===== STUDENTS =====
  'students:create': {
    request: { studentNumber: string; initials: string }
    response: Student
  }
  'students:getAll': {
    request: { search?: string }
    response: Student[]
  }
  'students:getById': {
    request: { id: number }
    response: StudentWithRelations | null
  }
  'students:delete': {
    request: { id: number }
    response: void
  }

  // ===== FORMS =====
  'forms:create': {
    request: {
      studentId: number
      weekNumber: number
      year: number
      startDate: string
      isSas: boolean
      accommodationIds?: number[]
      templateId?: number
    }
    response: Form
  }
  'forms:getById': {
    request: { id: number }
    response: FormWithRelations | null
  }
  'forms:delete': {
    request: { id: number; studentId: number }
    response: void
  }
  'forms:duplicate': {
    request: { formId: number }
    response: Form
  }

  // ===== DAILY TRACKING =====
  'tracking:updateStatus': {
    request: {
      trackingId: number
      status: 'accepted' | 'rejected' | 'n/a'
      notes?: string
    }
    response: void
  }

  // ===== TEMPLATES =====
  'templates:create': {
    request: {
      studentId: number
      templateName: string
      isDefault: boolean
      accommodationIds: number[]
    }
    response: Template
  }
  'templates:getByStudent': {
    request: { studentId: number }
    response: TemplateWithAccommodations[]
  }
  'templates:getById': {
    request: { id: number }
    response: TemplateWithAccommodations | null
  }
  'templates:delete': {
    request: { id: number; studentId: number }
    response: void
  }
  'templates:setDefault': {
    request: { studentId: number; templateId: number }
    response: void
  }

  // ===== ACCOMMODATIONS =====
  'accommodations:getAll': {
    request: void
    response: Accommodation[]
  }

  // ===== WINDOW =====
  'window:open': {
    request: { url: string; width?: number; height?: number }
    response: { windowId: number }
  }
}

// ===== RELATION TYPES =====
// These define the shape of data when entities are fetched with their relations

export type StudentWithRelations = Student & {
  forms: Form[]
  templates: Template[]
}

export type FormWithRelations = Form & {
  student: Student
  template: Template | null
  formAccommodations: FormAccommodationWithDetails[]
}

export type FormAccommodationWithDetails = {
  id: number
  formId: number
  accommodationId: number
  accommodation: Accommodation
  dailyTracking: DailyTracking[]
}

export type TemplateWithAccommodations = Template & {
  templateAccommodations: Array<{
    id: number
    templateId: number
    accommodationId: number
    accommodation: Accommodation
  }>
}
