import type { TranscriptEntry } from '../../shared/types'

interface TranscriptPanelProps {
  entries: TranscriptEntry[]
}

export function TranscriptPanel({ entries }: TranscriptPanelProps): JSX.Element {
  return (
    <div className="transcript-panel">
      <h2 className="transcript-panel__title">Transcript</h2>
      <div className="transcript-panel__entries">
        {entries.length === 0 ? (
          <p className="transcript-panel__empty">
            Press the microphone button to start listening...
          </p>
        ) : (
          entries.map((entry) => (
            <p
              key={entry.id}
              className={`transcript-panel__entry ${
                entry.isFinal ? 'transcript-panel__entry--final' : ''
              }`}
            >
              {entry.text}
            </p>
          ))
        )}
      </div>
    </div>
  )
}
