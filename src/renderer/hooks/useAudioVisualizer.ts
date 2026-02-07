import { useState, useRef, useCallback, useEffect } from 'react'

interface UseAudioVisualizerReturn {
  analyserData: Uint8Array | null
  isActive: boolean
  start: () => Promise<void>
  stop: () => void
}

export function useAudioVisualizer(): UseAudioVisualizerReturn {
  const [isActive, setIsActive] = useState(false)
  const [analyserData, setAnalyserData] = useState<Uint8Array | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const updateData = useCallback(() => {
    if (!analyserRef.current) return
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    setAnalyserData(new Uint8Array(dataArray))
    animationRef.current = requestAnimationFrame(updateData)
  }, [])

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser
      sourceRef.current = source

      setIsActive(true)
      updateData()
    } catch {
      console.error('Failed to access microphone for visualization.')
    }
  }, [updateData])

  const stop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    sourceRef.current?.disconnect()
    audioContextRef.current?.close()
    streamRef.current?.getTracks().forEach((track) => track.stop())

    audioContextRef.current = null
    analyserRef.current = null
    sourceRef.current = null
    streamRef.current = null

    setIsActive(false)
    setAnalyserData(null)
  }, [])

  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  return { analyserData, isActive, start, stop }
}
