import { useState, useRef, useEffect } from 'react'
import type { ChatMessage } from '../../shared/types'
import styles from './ChatPanel.module.css'

interface ChatPanelProps {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  onSendMessage: (text: string) => void
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

function EmotionBadge({ emotion }: { emotion: string }): JSX.Element {
  const emoji: Record<string, string> = {
    happy: '\u263A',
    sad: '\u2639',
    confused: '?',
    excited: '!',
    neutral: '\u2014'
  }
  return <span className={styles.emotionBadge}>{emoji[emotion] || '\u2014'}</span>
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function ChatPanel({
  messages,
  isLoading,
  error,
  onSendMessage,
  onClear,
  onSpeak
}: ChatPanelProps): JSX.Element {
  const [input, setInput] = useState('')
  const messagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = messagesRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages, isLoading])

  const handleSend = (): void => {
    const text = input.trim()
    if (!text || isLoading) return
    onSendMessage(text)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Chat</h2>
        {messages.length > 0 && (
          <button className={styles.clearBtn} onClick={onClear}>
            Clear
          </button>
        )}
      </div>

      <div ref={messagesRef} className={styles.messages}>
        {messages.length === 0 && !isLoading ? (
          <p className={styles.empty}>
            Send a message or use voice input to start chatting...
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.message} ${msg.role === 'user' ? styles.user : styles.assistant}`}
            >
              <div className={styles.messageContent}>
                <span className={styles.messageText}>{msg.text}</span>
                <div className={styles.messageMeta}>
                  <span className={styles.timestamp}>{formatTime(msg.timestamp)}</span>
                  {msg.role === 'assistant' && msg.emotion && (
                    <EmotionBadge emotion={msg.emotion} />
                  )}
                </div>
              </div>
              {msg.role === 'assistant' && (
                <button
                  className={styles.speakBtn}
                  onClick={() => onSpeak(msg.text)}
                  aria-label="Read aloud"
                  title="Read aloud"
                >
                  <SpeakerIcon />
                </button>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className={`${styles.message} ${styles.assistant}`}>
            <div className={styles.typing}>
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.inputRow}>
        <input
          type="text"
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={isLoading}
        />
        <button
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  )
}
