import { app, BrowserWindow, session } from 'electron'
import path from 'node:path'
import { registerIpcHandlers } from './ipc'

function createWindow(): void {
  const ses = session.defaultSession

  // Strip "Electron/x.x.x" from the user agent so Google's Web Speech API
  // servers treat this as a regular Chrome browser and accept requests.
  const defaultUA = ses.getUserAgent()
  ses.setUserAgent(defaultUA.replace(/Electron\/\S+\s/, ''))

  // Auto-grant permissions required for voice features
  ses.setPermissionRequestHandler((_webContents, permission, callback) => {
    const allowed = ['media', 'microphone', 'speech-recognition']
    callback(allowed.includes(permission))
  })

  ses.setPermissionCheckHandler((_webContents, permission) => {
    const allowed = ['media', 'microphone', 'speech-recognition']
    return allowed.includes(permission)
  })

  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  registerIpcHandlers(mainWindow)

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

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
