export interface AppSettings {
  language: string
  voiceEnabled: boolean
  visualizerEnabled: boolean
}

export interface TranscriptEntry {
  id: string
  text: string
  timestamp: number
  isFinal: boolean
}

export type VisualizerMode = 'bars' | 'waveform' | 'circular'

export type IpcChannels = {
  'voice:start': () => void
  'voice:stop': () => void
  'voice:result': (text: string) => void
  'app:get-settings': () => AppSettings
  'app:set-settings': (settings: Partial<AppSettings>) => void
  'window:minimize': () => void
  'window:maximize': () => void
  'window:close': () => void
}

export interface ElectronAPI {
  getSettings: () => Promise<AppSettings>
  setSettings: (settings: Partial<AppSettings>) => Promise<void>
  minimize: () => void
  maximize: () => void
  close: () => void
}
