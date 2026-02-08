import { contextBridge, ipcRenderer } from 'electron'
import type { AppSettings, ElectronAPI, ChatRequest } from '../shared/types'

const electronAPI: ElectronAPI = {
  getSettings: () => ipcRenderer.invoke('app:get-settings'),
  setSettings: (settings: Partial<AppSettings>) =>
    ipcRenderer.invoke('app:set-settings', settings),
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  saveTranscript: (content: string) => ipcRenderer.invoke('dialog:save-transcript', content),
  sendChatMessage: (request: ChatRequest) => ipcRenderer.invoke('chat:send', request),
  loadChatHistory: () => ipcRenderer.invoke('chat:load-history'),
  saveChatHistory: (messages) => ipcRenderer.invoke('chat:save-history', messages),
  clearChatHistory: () => ipcRenderer.invoke('chat:clear-history')
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
