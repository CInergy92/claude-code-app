import { ipcMain, BrowserWindow, dialog, app } from 'electron'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'node:fs'
import path from 'node:path'
import type { AppSettings, ChatRequest, ChatResponse, ChatMessage } from '../shared/types'

const DEFAULTS: AppSettings = {
  language: 'en-US',
  voiceEnabled: true,
  visualizerEnabled: true,
  visualizerMode: 'bars',
  avatar: {
    enabled: true,
    accentColor: '#6c63ff',
    eyeStyle: 'round'
  },
  anthropicApiKey: '',
  chatHistoryLimit: 50
}

function getSettingsPath(): string {
  return path.join(app.getPath('userData'), 'settings.json')
}

function getChatHistoryPath(): string {
  return path.join(app.getPath('userData'), 'chat-history.json')
}

function loadSettings(): AppSettings {
  try {
    const raw = fs.readFileSync(getSettingsPath(), 'utf-8')
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

function saveSettings(settings: AppSettings): void {
  fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2), 'utf-8')
}

function loadChatHistory(limit: number): ChatMessage[] {
  try {
    const raw = fs.readFileSync(getChatHistoryPath(), 'utf-8')
    const messages: ChatMessage[] = JSON.parse(raw)
    return messages.slice(-limit)
  } catch {
    return []
  }
}

function saveChatHistory(messages: ChatMessage[], limit: number): void {
  const trimmed = messages.slice(-limit)
  fs.writeFileSync(getChatHistoryPath(), JSON.stringify(trimmed, null, 2), 'utf-8')
}

function clearChatHistory(): void {
  try {
    fs.unlinkSync(getChatHistoryPath())
  } catch {
    // File may not exist
  }
}

const SYSTEM_PROMPT = `You are Claude, a helpful AI assistant embedded in a desktop voice application. You have a visual avatar that displays emotions.

IMPORTANT: You must respond with valid JSON in this exact format:
{"response": "your message here", "emotion": "neutral"}

The "emotion" field must be one of: "neutral", "happy", "sad", "confused", "excited"

Choose the emotion that best matches the tone of your response:
- "happy" for positive, encouraging, or cheerful responses
- "sad" for empathetic or somber responses
- "confused" for when the question is unclear or you need clarification
- "excited" for enthusiastic responses about interesting topics
- "neutral" for factual or standard responses

Keep responses concise and conversational since this is a voice-first interface. Do NOT wrap the JSON in markdown code blocks.`

let settings = loadSettings()

export function registerIpcHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle('app:get-settings', () => {
    return settings
  })

  ipcMain.handle('app:set-settings', (_event, partial: Partial<AppSettings>) => {
    settings = { ...settings, ...partial }
    saveSettings(settings)
  })

  ipcMain.handle('dialog:save-transcript', async (_event, content: string) => {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Transcript',
      defaultPath: 'transcript.txt',
      filters: [{ name: 'Text Files', extensions: ['txt'] }]
    })

    if (canceled || !filePath) return false
    fs.writeFileSync(filePath, content, 'utf-8')
    return true
  })

  ipcMain.handle('chat:send', async (_event, request: ChatRequest): Promise<ChatResponse> => {
    const { messages, apiKey } = request

    if (!apiKey) {
      throw new Error('Anthropic API key is not configured. Please add your API key in settings.')
    }

    const client = new Anthropic({ apiKey })

    const apiMessages = messages.slice(-20).map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.text
    }))

    const result = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: apiMessages
    })

    const textBlock = result.content.find((block) => block.type === 'text')
    const rawText = textBlock ? textBlock.text : ''

    try {
      const parsed = JSON.parse(rawText)
      return {
        response: parsed.response || rawText,
        emotion: parsed.emotion || 'neutral'
      }
    } catch {
      return {
        response: rawText,
        emotion: 'neutral'
      }
    }
  })

  ipcMain.handle('chat:load-history', () => {
    return loadChatHistory(settings.chatHistoryLimit)
  })

  ipcMain.handle('chat:save-history', (_event, messages: ChatMessage[]) => {
    saveChatHistory(messages, settings.chatHistoryLimit)
  })

  ipcMain.handle('chat:clear-history', () => {
    clearChatHistory()
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
