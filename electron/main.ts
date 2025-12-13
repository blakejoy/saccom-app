import { app, BrowserWindow, Menu, dialog, BrowserWindowConstructorOptions } from 'electron'
import { autoUpdater } from 'electron-updater'
import path from 'path'
import { initializeDatabase } from './db/init'
import { registerIpcHandlers } from './ipc/handlers'

const isDev = process.env.NODE_ENV === 'development'
let mainWindow: BrowserWindow | null = null

// Configure auto-updater
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true

// For private repositories, uncomment and add your GitHub token:
// autoUpdater.setFeedURL({
//   provider: 'github',
//   owner: 'blakejoy',
//   repo: 'saccom-app',
//   private: true,
//   token: 'YOUR_GITHUB_PERSONAL_ACCESS_TOKEN'
// })

// Auto-updater event handlers
function setupAutoUpdater() {
  if (isDev) {
    console.log('Auto-updates disabled in development')
    return
  }

  setTimeout(() => {
    autoUpdater.checkForUpdates()
  }, 3000)

  setInterval(() => {
    autoUpdater.checkForUpdates()
  }, 4 * 60 * 60 * 1000)

  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...')
  })

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version)
    dialog
      .showMessageBox(mainWindow!, {
        type: 'info',
        title: 'Update Available',
        message: `A new version (${info.version}) is available!`,
        detail:
          'Would you like to download it now? The update will be installed when you quit the app.',
        buttons: ['Download', 'Later'],
        defaultId: 0,
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate()
        }
      })
  })

  autoUpdater.on('update-not-available', () => {
    console.log('No updates available')
  })

  autoUpdater.on('download-progress', (progress) => {
    const percent = Math.round(progress.percent)
    console.log(`Download progress: ${percent}%`)
    if (mainWindow) {
      mainWindow.setProgressBar(progress.percent / 100)
    }
  })

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info.version)
    if (mainWindow) {
      mainWindow.setProgressBar(-1)
    }

    dialog
      .showMessageBox(mainWindow!, {
        type: 'info',
        title: 'Update Ready',
        message: `Version ${info.version} has been downloaded!`,
        detail: 'The update will be installed when you quit and restart the app.',
        buttons: ['Restart Now', 'Later'],
        defaultId: 0,
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall(false, true)
        }
      })
  })

  autoUpdater.on('error', (error) => {
    console.error('Update error:', error)
  })
}

function createMenu() {
  // Note: Using hash router, so URLs are like /#/students/new
  const baseURL = isDev ? 'http://localhost:5173' : `file://${path.join(__dirname, '../dist-renderer/index.html')}`

  const template: Electron.MenuItemConstructorOptions[] = [
    // App Menu (macOS only)
    ...(process.platform === 'darwin'
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const },
            ],
          },
        ]
      : []),

    // File Menu
    {
      label: 'File',
      submenu: [
        {
          label: 'New Student',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.loadURL(`${baseURL}#/students/new`)
            }
          },
        },
        { type: 'separator' as const },
        process.platform === 'darwin' ? { role: 'close' as const } : { role: 'quit' as const },
      ],
    },

    // Navigate Menu
    {
      label: 'Navigate',
      submenu: [
        {
          label: 'Home',
          accelerator: 'CmdOrCtrl+H',
          click: () => {
            if (mainWindow) {
              mainWindow.loadURL(`${baseURL}#/`)
            }
          },
        },
        {
          label: 'Back',
          accelerator: 'CmdOrCtrl+[',
          click: () => {
            if (mainWindow && mainWindow.webContents.navigationHistory.canGoBack()) {
              mainWindow.webContents.navigationHistory.goBack()
            }
          },
        },
        {
          label: 'Forward',
          accelerator: 'CmdOrCtrl+]',
          click: () => {
            if (mainWindow && mainWindow.webContents.navigationHistory.canGoForward()) {
              mainWindow.webContents.navigationHistory.goForward()
            }
          },
        },
      ],
    },

    // View Menu
    {
      label: 'View',
      submenu: [
        { role: 'reload' as const },
        { role: 'forceReload' as const },
        { type: 'separator' as const },
        { role: 'resetZoom' as const },
        { role: 'zoomIn' as const },
        { role: 'zoomOut' as const },
        { type: 'separator' as const },
        { role: 'togglefullscreen' as const },
        ...(isDev
          ? [
              { type: 'separator' as const },
              { role: 'toggleDevTools' as const },
            ]
          : []),
      ],
    },

    // Window Menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' as const },
        { role: 'zoom' as const },
        ...(process.platform === 'darwin'
          ? [
              { type: 'separator' as const },
              { role: 'front' as const },
              { type: 'separator' as const },
              { role: 'window' as const },
            ]
          : [{ role: 'close' as const }]),
      ],
    },

    // Help Menu
    {
      role: 'help' as const,
      submenu: [
        ...(!isDev
          ? [
              {
                label: 'Check for Updates...',
                click: () => {
                  autoUpdater.checkForUpdates()
                },
              },
              { type: 'separator' as const },
            ]
          : []),
        {
          label: 'About Student Accommodation Tracker',
          click: async () => {
            await dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'About',
              message: 'Student Accommodation Tracker',
              detail: `Version ${app.getVersion()}\n\nA desktop application for tracking student accommodations and daily progress.`,
              buttons: ['OK'],
            })
          },
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function createWindow() {
  const options: BrowserWindowConstructorOptions = {
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'default',
    show: false,
  }

  mainWindow = new BrowserWindow(options)

  const startURL = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist-renderer/index.html')}`

  mainWindow.loadURL(startURL)

  mainWindow.once('ready-to-show', () => {
    mainWindow!.show()
  })

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(async () => {
  try {
    // Initialize database BEFORE creating window
    await initializeDatabase()
    console.log('✓ Database initialized')
  } catch (error) {
    console.error('Database initialization failed:', error)
    await dialog.showErrorBox(
      'Database Error',
      'Failed to initialize the database. The app will now quit.\n\n' + (error as Error).message
    )
    app.quit()
    return
  }

  // Register IPC handlers
  registerIpcHandlers()

  // Create window and menu
  createMenu()
  createWindow()
  setupAutoUpdater()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
