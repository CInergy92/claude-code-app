import { useCallback } from 'react'
import { TitleBar } from './components/TitleBar'
import { VoiceButton } from './components/VoiceButton'
import { AudioVisualizer } from './components/AudioVisualizer'
import { TranscriptPanel } from './components/TranscriptPanel'
import { useVoice } from './hooks/useVoice'
import { useAudioVisualizer } from './hooks/useAudioVisualizer'

export default function App(): JSX.Element {
  const { isListening, transcript, error, startListening, stopListening } = useVoice()
  const { analyserData, isActive, start: startVisualizer, stop: stopVisualizer } = useAudioVisualizer()

  const handleStart = useCallback(async () => {
    startListening()
    await startVisualizer()
  }, [startListening, startVisualizer])

  const handleStop = useCallback(() => {
    stopListening()
    stopVisualizer()
  }, [stopListening, stopVisualizer])

  return (
    <div className="app">
      <TitleBar />
      <main className="app__main">
        <AudioVisualizer data={analyserData} isActive={isActive} />
        <VoiceButton
          isListening={isListening}
          onStart={handleStart}
          onStop={handleStop}
        />
        {error && <p className="app__error">{error}</p>}
        <TranscriptPanel entries={transcript} />
      </main>
    </div>
  )
}
