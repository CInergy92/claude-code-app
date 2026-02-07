import { contextBridge, ipcRenderer } from 'electron'
import type { AppSettings, ElectronAPI } from '../shared/types'

const electronAPI: ElectronAPI = {
  getSettings: () => ipcRenderer.invoke('app:get-settings'),
  setSettings: (settings: Partial<AppSettings>) =>
    ipcRenderer.invoke('app:set-settings', settings),
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close')
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
