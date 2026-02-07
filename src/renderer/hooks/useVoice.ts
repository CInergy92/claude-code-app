import { useState, useCallback, useRef, useEffect } from 'react'
import { createModel } from 'vosk-browser'
import type { Model, KaldiRecognizer } from 'vosk-browser'
import type { TranscriptEntry } from '../../shared/types'

const MODEL_URL = '/models/vosk-model-small-en-us-0.15.tar.gz'

interface UseVoiceReturn {
  isListening: boolean
  transcript: TranscriptEntry[]
  error: string | null
  startListening: () => void
  stopListening: () => void
  speak: (text: string) => void
  clearTranscript: () => void
  language: string
  setLanguage: (lang: string) => void
  modelReady: boolean
  modelLoading: boolean
}

export function useVoice(): UseVoiceReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [language, setLanguage] = useState('en-US')
  const [modelReady, setModelReady] = useState(false)
  const [modelLoading, setModelLoading] = useState(false)

  const modelRef = useRef<Model | null>(null)
  const recognizerRef = useRef<KaldiRecognizer | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Load the Vosk model on mount
  useEffect(() => {
    let cancelled = false

    async function loadModel(): Promise<void> {
      setModelLoading(true)
      setError(null)
      try {
        const model = await createModel(MODEL_URL)
        if (cancelled) {
          model.terminate()
          return
        }
        model.setLogLevel(-1)
        modelRef.current = model
        setModelReady(true)
      } catch {
        if (!cancelled) {
          setError('Failed to load speech recognition model.')
        }
      } finally {
        if (!cancelled) {
          setModelLoading(false)
        }
      }
    }

    loadModel()

    return () => {
      cancelled = true
      modelRef.current?.terminate()
      modelRef.current = null
    }
  }, [])

  const startListening = useCallback(() => {
    if (!modelRef.current) {
      setError('Speech model not loaded yet.')
      return
    }

    async function begin(): Promise<void> {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 }
        })
        streamRef.current = stream

        const audioContext = new AudioContext()
        audioContextRef.current = audioContext

        const recognizer = new modelRef.current!.KaldiRecognizer(audioContext.sampleRate)
        recognizer.setWords(true)
        recognizerRef.current = recognizer

        recognizer.on('result', (message) => {
          const text = (message as { result: { text: string } }).result.text
          if (text) {
            setTranscript((prev) => [
              ...prev,
              {
                id: `${Date.now()}-final`,
                text,
                timestamp: Date.now(),
                isFinal: true
              }
            ])
          }
        })

        recognizer.on('partialresult', (message) => {
          const partial = (message as { result: { partial: string } }).result.partial
          if (partial) {
            setTranscript((prev) => {
              const withoutInterim = prev.filter((t) => t.isFinal)
              return [
                ...withoutInterim,
                {
                  id: `${Date.now()}-partial`,
                  text: partial,
                  timestamp: Date.now(),
                  isFinal: false
                }
              ]
            })
          }
        })

        const source = audioContext.createMediaStreamSource(stream)
        sourceRef.current = source

        const processor = audioContext.createScriptProcessor(4096, 1, 1)
        processorRef.current = processor

        processor.onaudioprocess = (event: AudioProcessingEvent) => {
          try {
            recognizerRef.current?.acceptWaveform(event.inputBuffer)
          } catch {
            // Ignore intermittent waveform errors
          }
        }

        source.connect(processor)
        processor.connect(audioContext.destination)

        setIsListening(true)
        setError(null)
      } catch {
        setError('Failed to start speech recognition. Please check microphone permissions.')
      }
    }

    begin()
  }, [])

  const stopListening = useCallback(() => {
    processorRef.current?.disconnect()
    sourceRef.current?.disconnect()
    streamRef.current?.getTracks().forEach((track) => track.stop())
    recognizerRef.current?.remove()
    audioContextRef.current?.close()

    processorRef.current = null
    sourceRef.current = null
    streamRef.current = null
    recognizerRef.current = null
    audioContextRef.current = null

    setIsListening(false)
  }, [])

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      setError('Speech synthesis is not supported in this browser.')
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language
    window.speechSynthesis.speak(utterance)
  }, [language])

  const clearTranscript = useCallback(() => {
    setTranscript([])
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      processorRef.current?.disconnect()
      sourceRef.current?.disconnect()
      streamRef.current?.getTracks().forEach((track) => track.stop())
      recognizerRef.current?.remove()
      audioContextRef.current?.close()
    }
  }, [])

  return {
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
    modelLoading
  }
}
