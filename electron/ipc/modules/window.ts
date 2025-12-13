import type { IpcMainInvokeEvent } from 'electron'
import { BrowserWindow } from 'electron'
import path from 'path'

const isDev = process.env.NODE_ENV === 'development'

/**
 * IPC Handler: Open a new window with preload script
 */
export async function openWindow(
  event: IpcMainInvokeEvent,
  params: { url: string; width?: number; height?: number }
) {
  const childWindow = new BrowserWindow({
    width: params.width || 1000,
    height: params.height || 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'default',
    show: false,
  })

  // Construct the full URL
  const baseURL = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../../dist-renderer/index.html')}`

  // Append the hash route
  const fullURL = isDev ? `${baseURL}#${params.url}` : `${baseURL}#${params.url}`

  childWindow.loadURL(fullURL)

  childWindow.once('ready-to-show', () => {
    childWindow.show()
  })

  if (isDev) {
    childWindow.webContents.openDevTools()
  }

  // Return a window ID (optional, for tracking)
  return { windowId: childWindow.id }
}