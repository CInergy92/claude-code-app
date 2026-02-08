import { useState, useCallback, useEffect, useRef } from 'react'
import { TitleBar } from './components/TitleBar'
import { SettingsBar } from './components/SettingsBar'
import { VoiceButton } from './components/VoiceButton'
import { AudioVisualizer } from './components/AudioVisualizer'
import { TranscriptPanel } from './components/TranscriptPanel'
import { Avatar } from './components/Avatar'
import { ChatPanel } from './components/ChatPanel'
import { AvatarCustomizer } from './components/AvatarCustomizer'
import { useVoice } from './hooks/useVoice'
import { useAudioVisualizer } from './hooks/useAudioVisualizer'
import { useChat } from './hooks/useChat'
import type { VisualizerMode, AvatarSettings, AvatarAnimationState } from '../shared/types'

const DEFAULT_AVATAR: AvatarSettings = {
  enabled: true,
  accentColor: '#6c63ff',
  eyeStyle: 'round'
}

const appStyles: Record<string, React.CSSProperties> = {
  app: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 24px',
    gap: '16px',
    overflowY: 'auto',
    minHeight: 0,
  },
  topSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    width: '100%',
    maxWidth: '800px',
    justifyContent: 'center',
  },
  bottomSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '800px',
    minHeight: 0,
    gap: '12px',
  },
  error: {
    color: 'var(--danger)',
    fontSize: '14px',
    padding: '8px 16px',
    background: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 'var(--radius)',
  },
  loading: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
  },
}

export default function App(): JSX.Element {
  const {
    isListening,
    transcript,
    error: voiceError,
    startListening,
    stopListening,
    speak,
    clearTranscript,
    language,
    setLanguage,
    modelReady,
    modelLoading,
  } = useVoice()

  const {
    frequencyData,
    timeDomainData,
    isActive,
    start: startVisualizer,
    stop: stopVisualizer,
  } = useAudioVisualizer()

  const {
    messages,
    isLoading: chatLoading,
    error: chatError,
    currentEmotion,
    sendMessage,
    clearHistory,
  } = useChat()

  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('bars')
  const [avatarSettings, setAvatarSettings] = useState<AvatarSettings>(DEFAULT_AVATAR)
  const [apiKey, setApiKey] = useState('')
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [mouthOpenness, setMouthOpenness] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Track last processed final transcript entry to avoid re-sending
  const lastSentTranscriptIdRef = useRef<string | null>(null)

  // Load persisted settings on mount
  useEffect(() => {
    window.electronAPI.getSettings().then((saved) => {
      setLanguage(saved.language)
      setVisualizerMode(saved.visualizerMode ?? 'bars')
      if (saved.avatar) {
        setAvatarSettings(saved.avatar)
      }
      if (saved.anthropicApiKey) {
        setApiKey(saved.anthropicApiKey)
      }
    })
  }, [setLanguage])

  const handleLanguageChange = useCallback((lang: string) => {
    setLanguage(lang)
    window.electronAPI.setSettings({ language: lang })
  }, [setLanguage])

  const handleVisualizerModeChange = useCallback((mode: VisualizerMode) => {
    setVisualizerMode(mode)
    window.electronAPI.setSettings({ visualizerMode: mode })
  }, [])

  const handleAvatarSettingsChange = useCallback((settings: AvatarSettings) => {
    setAvatarSettings(settings)
    window.electronAPI.setSettings({ avatar: settings })
    document.documentElement.style.setProperty('--avatar-accent', settings.accentColor)
  }, [])

  const handleApiKeyChange = useCallback((key: string) => {
    setApiKey(key)
    window.electronAPI.setSettings({ anthropicApiKey: key })
  }, [])

  const handleStart = useCallback(async () => {
    startListening()
    await startVisualizer()
  }, [startListening, startVisualizer])

  const handleStop = useCallback(() => {
    stopListening()
    stopVisualizer()
  }, [stopListening, stopVisualizer])

  // Keep refs so the keydown handler always sees the latest values
  const isListeningRef = useRef(isListening)
  isListeningRef.current = isListening
  const modelReadyRef = useRef(modelReady)
  modelReadyRef.current = modelReady

  const handleExport = useCallback(() => {
    const finalEntries = transcript.filter((e) => e.isFinal)
    if (finalEntries.length === 0) return
    const content = finalEntries
      .map((e) => {
        const time = new Date(e.timestamp).toLocaleTimeString()
        return `[${time}] ${e.text}`
      })
      .join('\n')
    window.electronAPI.saveTranscript(content)
  }, [transcript])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.code !== 'Space') return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'SELECT' || tag === 'INPUT' || tag === 'TEXTAREA') return
      if (!modelReadyRef.current) return
      e.preventDefault()
      if (isListeningRef.current) {
        handleStop()
      } else {
        handleStart()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleStart, handleStop])

  // Voice-to-chat bridge: auto-send final transcript to chat
  useEffect(() => {
    const finalEntries = transcript.filter((e) => e.isFinal)
    if (finalEntries.length === 0) return
    const lastFinal = finalEntries[finalEntries.length - 1]
    if (lastFinal.id === lastSentTranscriptIdRef.current) return
    if (!apiKey) return

    lastSentTranscriptIdRef.current = lastFinal.id
    sendMessage(lastFinal.text, apiKey)
  }, [transcript, apiKey, sendMessage])

  // Chat-to-TTS bridge: auto-speak assistant responses
  const lastSpokenIdRef = useRef<string | null>(null)

  const speakWithTracking = useCallback((text: string) => {
    if (!window.speechSynthesis) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => {
      setIsSpeaking(false)
      setMouthOpenness(0)
    }
    utterance.onboundary = (e) => {
      if (e.name === 'word') {
        setMouthOpenness(Math.random() * 0.6 + 0.4)
        setTimeout(() => setMouthOpenness(0.1), 100)
      }
    }

    window.speechSynthesis.speak(utterance)
  }, [language])

  useEffect(() => {
    if (messages.length === 0) return
    const lastMsg = messages[messages.length - 1]
    if (lastMsg.role !== 'assistant') return
    if (lastMsg.id === lastSpokenIdRef.current) return

    lastSpokenIdRef.current = lastMsg.id
    speakWithTracking(lastMsg.text)
  }, [messages, speakWithTracking])

  // Derive animation state
  const animationState: AvatarAnimationState = chatLoading
    ? 'thinking'
    : isSpeaking
      ? 'speaking'
      : isListening
        ? 'listening'
        : 'idle'

  const handleChatSend = useCallback((text: string) => {
    if (!apiKey) return
    sendMessage(text, apiKey)
  }, [apiKey, sendMessage])

  // Set accent CSS var on mount from settings
  useEffect(() => {
    document.documentElement.style.setProperty('--avatar-accent', avatarSettings.accentColor)
  }, [avatarSettings.accentColor])

  return (
    <div style={appStyles.app}>
      <TitleBar />
      <SettingsBar
        language={language}
        onLanguageChange={handleLanguageChange}
        visualizerMode={visualizerMode}
        onVisualizerModeChange={handleVisualizerModeChange}
        showCustomizer={showCustomizer}
        onToggleCustomizer={() => setShowCustomizer((v) => !v)}
      />
      {showCustomizer && (
        <AvatarCustomizer
          settings={avatarSettings}
          onSettingsChange={handleAvatarSettingsChange}
          apiKey={apiKey}
          onApiKeyChange={handleApiKeyChange}
        />
      )}
      <main style={appStyles.main}>
        <div style={appStyles.topSection}>
          {avatarSettings.enabled && (
            <Avatar
              emotion={currentEmotion}
              animationState={animationState}
              accentColor={avatarSettings.accentColor}
              eyeStyle={avatarSettings.eyeStyle}
              mouthOpenness={mouthOpenness}
            />
          )}
          <AudioVisualizer
            frequencyData={frequencyData}
            timeDomainData={timeDomainData}
            isActive={isActive}
            mode={visualizerMode}
          />
        </div>

        {modelLoading && <p style={appStyles.loading}>Loading speech model...</p>}

        <VoiceButton
          isListening={isListening}
          onStart={handleStart}
          onStop={handleStop}
          disabled={!modelReady}
        />

        {voiceError && <p style={appStyles.error}>{voiceError}</p>}

        <div style={appStyles.bottomSection}>
          <ChatPanel
            messages={messages}
            isLoading={chatLoading}
            error={chatError}
            onSendMessage={handleChatSend}
            onClear={clearHistory}
            onSpeak={speakWithTracking}
          />
          <TranscriptPanel
            entries={transcript}
            onClear={clearTranscript}
            onSpeak={speak}
            onExport={handleExport}
          />
        </div>
      </main>
    </div>
  )
}
