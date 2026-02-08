import '@testing-library/jest-dom/vitest'

// Mock vosk-browser (uses Web Workers, not available in jsdom)
vi.mock('vosk-browser', () => ({
  createModel: vi.fn().mockResolvedValue({
    setLogLevel: vi.fn(),
    terminate: vi.fn(),
    KaldiRecognizer: vi.fn().mockImplementation(() => ({
      setWords: vi.fn(),
      on: vi.fn(),
      remove: vi.fn(),
      acceptWaveform: vi.fn(),
    })),
  }),
}))

// Mock HTMLCanvasElement.getContext (jsdom doesn't support canvas)
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  fillStyle: '',
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  scale: vi.fn(),
  lineWidth: 0,
  strokeStyle: '',
}) as unknown as typeof HTMLCanvasElement.prototype.getContext

// Mock ResizeObserver
class MockResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver
})

// Mock SpeechSynthesis
const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => []),
  speaking: false,
  paused: false,
  pending: false,
  onvoiceschanged: null
}

Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: mockSpeechSynthesis
})

// Mock Electron API
Object.defineProperty(window, 'electronAPI', {
  writable: true,
  value: {
    getSettings: vi.fn().mockResolvedValue({
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
    }),
    setSettings: vi.fn().mockResolvedValue(undefined),
    minimize: vi.fn(),
    maximize: vi.fn(),
    close: vi.fn(),
    saveTranscript: vi.fn().mockResolvedValue(true),
    sendChatMessage: vi.fn().mockResolvedValue({
      response: 'Hello! How can I help you?',
      emotion: 'happy'
    }),
    loadChatHistory: vi.fn().mockResolvedValue([]),
    saveChatHistory: vi.fn().mockResolvedValue(undefined),
    clearChatHistory: vi.fn().mockResolvedValue(undefined)
  }
})
