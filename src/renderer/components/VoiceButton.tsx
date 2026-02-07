interface VoiceButtonProps {
  isListening: boolean
  onStart: () => void
  onStop: () => void
}

export function VoiceButton({ isListening, onStart, onStop }: VoiceButtonProps): JSX.Element {
  return (
    <button
      className={`voice-button ${isListening ? 'voice-button--active' : ''}`}
      onClick={isListening ? onStop : onStart}
      aria-label={isListening ? 'Stop listening' : 'Start listening'}
    >
      <span className="voice-button__icon">{isListening ? '⏹' : '🎤'}</span>
      <span className="voice-button__label">
        {isListening ? 'Stop' : 'Start'} Listening
      </span>
    </button>
  )
}
