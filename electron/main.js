const { app, BrowserWindow, Menu, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let nextServer;

// Configure app data paths for SQLite database
const userDataPath = app.getPath('userData');
process.env.DB_PATH = path.join(userDataPath, 'sqlite.db');

// Configure auto-updater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// For private repositories, uncomment and add your GitHub token:
// autoUpdater.setFeedURL({
//   provider: 'github',
//   owner: 'blakejoy',
//   repo: 'student-accomodation-tracker',
//   private: true,
//   token: 'YOUR_GITHUB_PERSONAL_ACCESS_TOKEN' // Create at: https://github.com/settings/tokens
// });

// Auto-updater event handlers
function setupAutoUpdater() {
  // Skip updates in development
  if (isDev) {
    console.log('Auto-updates disabled in development');
    return;
  }

  // Check for updates on app start (after 3 seconds)
  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, 3000);

  // Check for updates every 4 hours
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 4 * 60 * 60 * 1000);

  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: `A new version (${info.version}) is available!`,
      detail: 'Would you like to download it now? The update will be installed when you quit the app.',
      buttons: ['Download', 'Later'],
      defaultId: 0
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate();
      }
    });
  });

  autoUpdater.on('update-not-available', () => {
    console.log('No updates available');
  });

  autoUpdater.on('download-progress', (progress) => {
    const percent = Math.round(progress.percent);
    console.log(`Download progress: ${percent}%`);
    if (mainWindow) {
      mainWindow.setProgressBar(progress.percent / 100);
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info.version);
    if (mainWindow) {
      mainWindow.setProgressBar(-1); // Remove progress bar
    }

    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: `Version ${info.version} has been downloaded!`,
      detail: 'The update will be installed when you quit and restart the app.',
      buttons: ['Restart Now', 'Later'],
      defaultId: 0
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall(false, true);
      }
    });
  });

  autoUpdater.on('error', (error) => {
    console.error('Update error:', error);
  });
}

async function startNextServer() {
  if (isDev) {
    // In development, Next.js dev server runs separately
    return;
  }

  // In production, start Next.js server
  const next = require('next');
  const nextApp = next({
    dev: false,
    dir: path.join(__dirname, '..'),
  });

  await nextApp.prepare();
  const handle = nextApp.getRequestHandler();

  const { createServer } = require('http');
  nextServer = createServer((req, res) => {
    handle(req, res);
  });

  await new Promise((resolve) => {
    nextServer.listen(3000, () => {
      console.log('Next.js server started on port 3000');
      resolve();
    });
  });
}

function createMenu() {
  const baseURL = isDev ? 'http://localhost:3000' : 'http://localhost:3000';

  const template = [
    // App Menu (macOS only)
    ...(process.platform === 'darwin' ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),

    // File Menu
    {
      label: 'File',
      submenu: [
        {
          label: 'New Student',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.loadURL(`${baseURL}/students/new`);
            }
          }
        },
        { type: 'separator' },
        process.platform === 'darwin' ? { role: 'close' } : { role: 'quit' }
      ]
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
              mainWindow.loadURL(baseURL);
            }
          }
        },
        {
          label: 'Back',
          accelerator: 'CmdOrCtrl+[',
          click: () => {
            if (mainWindow && mainWindow.webContents.navigationHistory.canGoBack()) {
              mainWindow.webContents.navigationHistory.goBack();
            }
          }
        },
        {
          label: 'Forward',
          accelerator: 'CmdOrCtrl+]',
          click: () => {
            if (mainWindow && mainWindow.webContents.navigationHistory.canGoForward()) {
              mainWindow.webContents.navigationHistory.goForward();
            }
          }
        }
      ]
    },

    // View Menu
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        ...(isDev ? [
          { type: 'separator' },
          { role: 'toggleDevTools' }
        ] : [])
      ]
    },

    // Window Menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(process.platform === 'darwin' ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    },

    // Help Menu
    {
      role: 'help',
      submenu: [
        ...(!isDev ? [{
          label: 'Check for Updates...',
          click: () => {
            autoUpdater.checkForUpdates();
          }
        }, { type: 'separator' }] : []),
        {
          label: 'About Student Accommodation Tracker',
          click: async () => {
            const { dialog } = require('electron');
            await dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About',
              message: 'Student Accommodation Tracker',
              detail: `Version ${app.getVersion()}\n\nA desktop application for tracking student accommodations and daily progress.`,
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'default',
    show: false, // Don't show until ready
  });

  const startURL = isDev
    ? 'http://localhost:3000'
    : 'http://localhost:3000';

  mainWindow.loadURL(startURL);

  // Show window when ready to avoid flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  // Start Next.js server (database initialization happens via instrumentation.ts)
  await startNextServer();
  createMenu();
  createWindow();
  setupAutoUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  if (nextServer) {
    nextServer.close();
  }
});

// Handle app quit
app.on('before-quit', () => {
  if (nextServer) {
    nextServer.close();
  }
});
