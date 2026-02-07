import { ipcMain } from 'electron'
import type { AppSettings } from '../shared/types'

let settings: AppSettings = {
  language: 'en-US',
  voiceEnabled: true,
  visualizerEnabled: true
}

export function registerIpcHandlers(): void {
  ipcMain.handle('app:get-settings', () => {
    return settings
  })

  ipcMain.handle('app:set-settings', (_event, partial: Partial<AppSettings>) => {
    settings = { ...settings, ...partial }
  })
}
