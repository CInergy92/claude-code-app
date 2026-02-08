export type AvatarEmotion = 'neutral' | 'happy' | 'sad' | 'confused' | 'excited'

export type AvatarAnimationState = 'idle' | 'listening' | 'speaking' | 'thinking'

export type EyeStyle = 'round' | 'oval' | 'narrow'

export interface AvatarSettings {
  enabled: boolean
  accentColor: string
  eyeStyle: EyeStyle
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  emotion?: AvatarEmotion
  timestamp: number
}

export interface ChatRequest {
  messages: ChatMessage[]
  apiKey: string
}

export interface ChatResponse {
  response: string
  emotion: AvatarEmotion
}

export interface AppSettings {
  language: string
  voiceEnabled: boolean
  visualizerEnabled: boolean
  visualizerMode: VisualizerMode
  avatar: AvatarSettings
  anthropicApiKey: string
  chatHistoryLimit: number
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
  'dialog:save-transcript': (content: string) => Promise<boolean>
  'chat:send': (request: ChatRequest) => Promise<ChatResponse>
  'chat:load-history': () => Promise<ChatMessage[]>
  'chat:save-history': (messages: ChatMessage[]) => Promise<void>
  'chat:clear-history': () => Promise<void>
}

export interface ElectronAPI {
  getSettings: () => Promise<AppSettings>
  setSettings: (settings: Partial<AppSettings>) => Promise<void>
  minimize: () => void
  maximize: () => void
  close: () => void
  saveTranscript: (content: string) => Promise<boolean>
  sendChatMessage: (request: ChatRequest) => Promise<ChatResponse>
  loadChatHistory: () => Promise<ChatMessage[]>
  saveChatHistory: (messages: ChatMessage[]) => Promise<void>
  clearChatHistory: () => Promise<void>
}
