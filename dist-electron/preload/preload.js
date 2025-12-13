"use strict";
const electron = require("electron");
const api = {
  // Generic type-safe invoke
  invoke: ((channel, data) => {
    return electron.ipcRenderer.invoke(channel, data);
  }),
  // Convenience methods for students
  students: {
    create: (data) => electron.ipcRenderer.invoke("students:create", data),
    getAll: (params) => electron.ipcRenderer.invoke("students:getAll", params),
    getById: (params) => electron.ipcRenderer.invoke("students:getById", params),
    delete: (params) => electron.ipcRenderer.invoke("students:delete", params)
  },
  // Forms
  forms: {
    create: (data) => electron.ipcRenderer.invoke("forms:create", data),
    getById: (params) => electron.ipcRenderer.invoke("forms:getById", params),
    delete: (params) => electron.ipcRenderer.invoke("forms:delete", params),
    duplicate: (params) => electron.ipcRenderer.invoke("forms:duplicate", params)
  },
  // Tracking
  tracking: {
    updateStatus: (data) => electron.ipcRenderer.invoke("tracking:updateStatus", data)
  },
  // Templates
  templates: {
    create: (data) => electron.ipcRenderer.invoke("templates:create", data),
    getByStudent: (params) => electron.ipcRenderer.invoke("templates:getByStudent", params),
    getById: (params) => electron.ipcRenderer.invoke("templates:getById", params),
    delete: (params) => electron.ipcRenderer.invoke("templates:delete", params),
    setDefault: (params) => electron.ipcRenderer.invoke("templates:setDefault", params)
  },
  // Accommodations
  accommodations: {
    getAll: () => electron.ipcRenderer.invoke("accommodations:getAll", void 0)
  },
  // Window management
  window: {
    open: (params) => electron.ipcRenderer.invoke("window:open", params)
  }
};
electron.contextBridge.exposeInMainWorld("electronAPI", api);
