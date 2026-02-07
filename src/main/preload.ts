import { contextBridge, ipcRenderer } from 'electron'
import type { AppSettings, ElectronAPI } from '../shared/types'

const electronAPI: ElectronAPI = {
  getSettings: () => ipcRenderer.invoke('app:get-settings'),
  setSettings: (settings: Partial<AppSettings>) =>
    ipcRenderer.invoke('app:set-settings', settings)
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
