import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    // Open DevTools on startup for debugging
    mainWindow.webContents.openDevTools()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

// -----------------------------
// AUTO UPDATE CONFIGURATION
// -----------------------------

autoUpdater.logger = log
log.transports.file.level = 'info'

// show log file location
log.info('Log file location:', log.transports.file.getFile().path)

log.info('[AutoUpdater] App version:', app.getVersion())
log.info('[AutoUpdater] Is dev mode:', is.dev)

// show which update server is used
log.info('[AutoUpdater] Feed URL:', autoUpdater.getFeedURL())

autoUpdater.on('checking-for-update', () => {
  log.info('[AutoUpdater] Checking for update...')
})

autoUpdater.on('update-available', (info) => {
  log.info('[AutoUpdater] Update available:', info.version)

  dialog.showMessageBox({
    type: 'info',
    title: 'Update Available',
    message: `Version ${info.version} is available. The update will now download.`
  })
})

autoUpdater.on('update-not-available', (info) => {
  log.info('[AutoUpdater] No update available. Latest version:', info.version)
})

autoUpdater.on('error', (err) => {
  log.error('[AutoUpdater] Error occurred:', err)
})

autoUpdater.on('download-progress', (progress) => {
  log.info(
    `[AutoUpdater] Download speed: ${progress.bytesPerSecond} - ${progress.percent.toFixed(
      2
    )}% downloaded`
  )
})

autoUpdater.on('update-downloaded', (info) => {
  log.info('[AutoUpdater] Update downloaded:', info.version)

  dialog
    .showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message:
        'Update downloaded successfully. The application will restart to install the update.'
    })
    .then(() => {
      autoUpdater.quitAndInstall()
    })
})

// force update check after startup (good for assignment demo)
setTimeout(() => {
  log.info('[AutoUpdater] Starting update check...')
  autoUpdater.checkForUpdatesAndNotify()
}, 3000)

// -----------------------------

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
