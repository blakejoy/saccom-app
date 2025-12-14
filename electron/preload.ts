import { contextBridge, ipcRenderer } from 'electron'
import type { IpcChannels } from './types/ipc'

/**
 * Type-safe IPC invoke function
 * This ensures that the channel names and data types match the IpcChannels interface
 */
type IpcInvoke = <K extends keyof IpcChannels>(
  channel: K,
  data: IpcChannels[K]['request']
) => Promise<IpcChannels[K]['response']>

/**
 * Electron API exposed to the renderer process
 * All IPC communication goes through this API
 */
const api = {
  // Generic type-safe invoke
  invoke: ((channel: string, data: any) => {
    return ipcRenderer.invoke(channel, data)
  }) as IpcInvoke,

  // Convenience methods for students
  students: {
    create: (data: IpcChannels['students:create']['request']) =>
      ipcRenderer.invoke('students:create', data),
    getAll: (params: IpcChannels['students:getAll']['request']) =>
      ipcRenderer.invoke('students:getAll', params),
    getById: (params: IpcChannels['students:getById']['request']) =>
      ipcRenderer.invoke('students:getById', params),
    archive: (params: IpcChannels['students:archive']['request']) =>
      ipcRenderer.invoke('students:archive', params),
    unarchive: (params: IpcChannels['students:unarchive']['request']) =>
      ipcRenderer.invoke('students:unarchive', params),
    delete: (params: IpcChannels['students:delete']['request']) =>
      ipcRenderer.invoke('students:delete', params),
  },

  // Forms
  forms: {
    create: (data: IpcChannels['forms:create']['request']) =>
      ipcRenderer.invoke('forms:create', data),
    getById: (params: IpcChannels['forms:getById']['request']) =>
      ipcRenderer.invoke('forms:getById', params),
    delete: (params: IpcChannels['forms:delete']['request']) =>
      ipcRenderer.invoke('forms:delete', params),
    duplicate: (params: IpcChannels['forms:duplicate']['request']) =>
      ipcRenderer.invoke('forms:duplicate', params),
  },

  // Tracking
  tracking: {
    updateStatus: (data: IpcChannels['tracking:updateStatus']['request']) =>
      ipcRenderer.invoke('tracking:updateStatus', data),
  },

  // Templates
  templates: {
    create: (data: IpcChannels['templates:create']['request']) =>
      ipcRenderer.invoke('templates:create', data),
    getByStudent: (params: IpcChannels['templates:getByStudent']['request']) =>
      ipcRenderer.invoke('templates:getByStudent', params),
    getById: (params: IpcChannels['templates:getById']['request']) =>
      ipcRenderer.invoke('templates:getById', params),
    delete: (params: IpcChannels['templates:delete']['request']) =>
      ipcRenderer.invoke('templates:delete', params),
    setDefault: (params: IpcChannels['templates:setDefault']['request']) =>
      ipcRenderer.invoke('templates:setDefault', params),
  },

  // Accommodations
  accommodations: {
    getAll: (params?: IpcChannels['accommodations:getAll']['request']) =>
      ipcRenderer.invoke('accommodations:getAll', params || {}),
    create: (data: IpcChannels['accommodations:create']['request']) =>
      ipcRenderer.invoke('accommodations:create', data),
    update: (params: IpcChannels['accommodations:update']['request']) =>
      ipcRenderer.invoke('accommodations:update', params),
    deactivate: (params: IpcChannels['accommodations:deactivate']['request']) =>
      ipcRenderer.invoke('accommodations:deactivate', params),
    delete: (params: IpcChannels['accommodations:delete']['request']) =>
      ipcRenderer.invoke('accommodations:delete', params),
    addToForm: (params: IpcChannels['accommodations:addToForm']['request']) =>
      ipcRenderer.invoke('accommodations:addToForm', params),
    removeFromForm: (params: IpcChannels['accommodations:removeFromForm']['request']) =>
      ipcRenderer.invoke('accommodations:removeFromForm', params),
  },

  // Window management
  window: {
    open: (params: IpcChannels['window:open']['request']) =>
      ipcRenderer.invoke('window:open', params),
  },
}

// Expose the API to the renderer process via window.electronAPI
contextBridge.exposeInMainWorld('electronAPI', api)

// Export the type for use in renderer process type definitions
export type ElectronAPI = typeof api
