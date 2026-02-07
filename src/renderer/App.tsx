import { useState, useCallback } from 'react'
import { TitleBar } from './components/TitleBar'
import { SettingsBar } from './components/SettingsBar'
import { VoiceButton } from './components/VoiceButton'
import { AudioVisualizer } from './components/AudioVisualizer'
import { TranscriptPanel } from './components/TranscriptPanel'
import { useVoice } from './hooks/useVoice'
import { useAudioVisualizer } from './hooks/useAudioVisualizer'
import type { VisualizerMode } from '../shared/types'

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
    padding: '24px',
    gap: '20px',
    overflowY: 'auto',
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
    error,
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

  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('bars')

  const handleStart = useCallback(async () => {
    startListening()
    await startVisualizer()
  }, [startListening, startVisualizer])

  const handleStop = useCallback(() => {
    stopListening()
    stopVisualizer()
  }, [stopListening, stopVisualizer])

  return (
    <div style={appStyles.app}>
      <TitleBar />
      <SettingsBar
        language={language}
        onLanguageChange={setLanguage}
        visualizerMode={visualizerMode}
        onVisualizerModeChange={setVisualizerMode}
      />
      <main style={appStyles.main}>
        <AudioVisualizer
          frequencyData={frequencyData}
          timeDomainData={timeDomainData}
          isActive={isActive}
          mode={visualizerMode}
        />
        {modelLoading && <p style={appStyles.loading}>Loading speech model...</p>}
        <VoiceButton
          isListening={isListening}
          onStart={handleStart}
          onStop={handleStop}
          disabled={!modelReady}
        />
        {error && <p style={appStyles.error}>{error}</p>}
        <TranscriptPanel
          entries={transcript}
          onClear={clearTranscript}
          onSpeak={speak}
        />
      </main>
    </div>
  )
}
