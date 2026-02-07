import styles from './VoiceButton.module.css'

interface VoiceButtonProps {
  isListening: boolean
  onStart: () => void
  onStop: () => void
  disabled?: boolean
}

function MicIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z" />
      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  )
}

function StopIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6h12v12H6z" />
    </svg>
  )
}

export function VoiceButton({ isListening, onStart, onStop, disabled }: VoiceButtonProps): JSX.Element {
  return (
    <button
      className={`${styles.button} ${isListening ? styles.active : ''}`}
      onClick={isListening ? onStop : onStart}
      aria-label={isListening ? 'Stop listening' : 'Start listening'}
      disabled={disabled}
    >
      <span className={styles.icon}>
        {isListening ? <StopIcon /> : <MicIcon />}
      </span>
      <span className={styles.label}>
        {isListening ? 'Stop' : 'Start'} Listening
      </span>
    </button>
  )
}
