import { ipcMain, BrowserWindow } from 'electron'
import type { AppSettings } from '../shared/types'

let settings: AppSettings = {
  language: 'en-US',
  voiceEnabled: true,
  visualizerEnabled: true
}

export function registerIpcHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle('app:get-settings', () => {
    return settings
  })

  ipcMain.handle('app:set-settings', (_event, partial: Partial<AppSettings>) => {
    settings = { ...settings, ...partial }
  })

  ipcMain.on('window:minimize', () => {
    mainWindow.minimize()
  })

  ipcMain.on('window:maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })

  ipcMain.on('window:close', () => {
    mainWindow.close()
  })
}
