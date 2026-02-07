import '@testing-library/jest-dom/vitest'

// Mock HTMLCanvasElement.getContext (jsdom doesn't support canvas)
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  fillStyle: '',
}) as unknown as typeof HTMLCanvasElement.prototype.getContext

// Mock SpeechRecognition
class MockSpeechRecognition {
  continuous = false
  interimResults = false
  lang = ''
  onresult: ((event: unknown) => void) | null = null
  onerror: ((event: unknown) => void) | null = null
  onend: (() => void) | null = null

  start(): void {
    // no-op in tests
  }

  stop(): void {
    this.onend?.()
  }

  abort(): void {
    this.onend?.()
  }
}

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

Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: MockSpeechRecognition
})

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: MockSpeechRecognition
})

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
      visualizerEnabled: true
    }),
    setSettings: vi.fn().mockResolvedValue(undefined)
  }
})
