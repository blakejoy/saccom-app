import { ipcMain } from 'electron'
import * as studentHandlers from './modules/students'
import * as formHandlers from './modules/forms'
import * as trackingHandlers from './modules/tracking'
import * as templateHandlers from './modules/templates'
import * as accommodationHandlers from './modules/accommodations'
import * as windowHandlers from './modules/window'

/**
 * Register all IPC handlers
 * This function is called once when the app starts
 */
export function registerIpcHandlers() {
  console.log('Registering IPC handlers...')

  // ===== STUDENTS =====
  ipcMain.handle('students:create', studentHandlers.createStudent)
  ipcMain.handle('students:getAll', studentHandlers.getStudents)
  ipcMain.handle('students:getById', studentHandlers.getStudentById)
  ipcMain.handle('students:delete', studentHandlers.deleteStudent)

  // ===== FORMS =====
  ipcMain.handle('forms:create', formHandlers.createForm)
  ipcMain.handle('forms:getById', formHandlers.getFormById)
  ipcMain.handle('forms:delete', formHandlers.deleteForm)
  ipcMain.handle('forms:duplicate', formHandlers.duplicateForm)

  // ===== TRACKING =====
  ipcMain.handle('tracking:updateStatus', trackingHandlers.updateStatus)

  // ===== TEMPLATES =====
  ipcMain.handle('templates:create', templateHandlers.createTemplate)
  ipcMain.handle('templates:getByStudent', templateHandlers.getTemplatesByStudent)
  ipcMain.handle('templates:getById', templateHandlers.getTemplateById)
  ipcMain.handle('templates:delete', templateHandlers.deleteTemplate)
  ipcMain.handle('templates:setDefault', templateHandlers.setDefaultTemplate)

  // ===== ACCOMMODATIONS =====
  ipcMain.handle('accommodations:getAll', accommodationHandlers.getAllAccommodations)

  // ===== WINDOW =====
  ipcMain.handle('window:open', windowHandlers.openWindow)

  console.log('✓ IPC handlers registered')
}
