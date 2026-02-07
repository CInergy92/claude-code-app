import type { TranscriptEntry } from '../../shared/types'
import styles from './TranscriptPanel.module.css'

interface TranscriptPanelProps {
  entries: TranscriptEntry[]
  onClear: () => void
  onSpeak: (text: string) => void
}

function SpeakerIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  )
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function TranscriptPanel({ entries, onClear, onSpeak }: TranscriptPanelProps): JSX.Element {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Transcript</h2>
        {entries.length > 0 && (
          <button className={styles.clearBtn} onClick={onClear}>
            Clear
          </button>
        )}
      </div>
      <div className={styles.entries}>
        {entries.length === 0 ? (
          <p className={styles.empty}>
            Press the microphone button to start listening...
          </p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className={`${styles.entry} ${entry.isFinal ? styles.entryFinal : ''}`}
            >
              <div className={styles.entryContent}>
                <span className={styles.entryText}>{entry.text}</span>
                <div className={styles.timestamp}>{formatTime(entry.timestamp)}</div>
              </div>
              {entry.isFinal && (
                <button
                  className={styles.speakBtn}
                  onClick={() => onSpeak(entry.text)}
                  aria-label="Read aloud"
                  title="Read aloud"
                >
                  <SpeakerIcon />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
