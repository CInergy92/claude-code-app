import { useState, useCallback, useRef, useEffect } from 'react'
import type { TranscriptEntry } from '../../shared/types'

interface UseVoiceReturn {
  isListening: boolean
  transcript: TranscriptEntry[]
  error: string | null
  startListening: () => void
  stopListening: () => void
  speak: (text: string) => void
}

export function useVoice(): UseVoiceReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.')
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const entry: TranscriptEntry = {
            id: `${Date.now()}-${i}`,
            text: result[0].transcript,
            timestamp: Date.now(),
            isFinal: result.isFinal
          }

          setTranscript((prev) => {
            const updated = prev.filter((t) => !t.id.endsWith(`-${i}`) || t.isFinal)
            return [...updated, entry]
          })
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setError(`Speech recognition error: ${event.error}`)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
      recognitionRef.current = recognition
      setIsListening(true)
      setError(null)
    } catch (err) {
      setError('Failed to start speech recognition. Please check microphone permissions.')
    }
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setIsListening(false)
  }, [])

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      setError('Speech synthesis is not supported in this browser.')
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    window.speechSynthesis.speak(utterance)
  }, [])

  return { isListening, transcript, error, startListening, stopListening, speak }
}
