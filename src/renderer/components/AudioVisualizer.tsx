import { useRef, useEffect, useCallback } from 'react'
import type { VisualizerMode } from '../../shared/types'
import styles from './AudioVisualizer.module.css'

interface AudioVisualizerProps {
  frequencyData: Uint8Array | null
  timeDomainData: Uint8Array | null
  isActive: boolean
  mode: VisualizerMode
}

export function AudioVisualizer({ frequencyData, timeDomainData, isActive, mode }: AudioVisualizerProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const { width, height } = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.scale(dpr, dpr)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    syncCanvasSize()
    const observer = new ResizeObserver(syncCanvasSize)
    observer.observe(container)
    return () => observer.disconnect()
  }, [syncCanvasSize])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const width = canvas.width / dpr
    const height = canvas.height / dpr

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, width, height)

    if (!isActive) return

    if (mode === 'bars' && frequencyData) {
      drawBars(ctx, frequencyData, width, height)
    } else if (mode === 'waveform' && timeDomainData) {
      drawWaveform(ctx, timeDomainData, width, height)
    } else if (mode === 'circular' && frequencyData) {
      drawCircular(ctx, frequencyData, width, height)
    }
  }, [frequencyData, timeDomainData, isActive, mode])

  return (
    <div ref={containerRef} className={styles.visualizer}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}

function drawBars(ctx: CanvasRenderingContext2D, data: Uint8Array, width: number, height: number): void {
  const barWidth = (width / data.length) * 2.5
  let x = 0

  for (let i = 0; i < data.length; i++) {
    const barHeight = (data[i] / 255) * height
    const hue = (i / data.length) * 360
    ctx.fillStyle = `hsl(${hue}, 80%, 55%)`
    ctx.fillRect(x, height - barHeight, barWidth, barHeight)
    x += barWidth + 1
  }
}

function drawWaveform(ctx: CanvasRenderingContext2D, data: Uint8Array, width: number, height: number): void {
  ctx.lineWidth = 2
  ctx.strokeStyle = '#6c63ff'
  ctx.beginPath()

  const sliceWidth = width / data.length
  let x = 0

  for (let i = 0; i < data.length; i++) {
    const v = data[i] / 128.0
    const y = (v * height) / 2

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
    x += sliceWidth
  }

  ctx.lineTo(width, height / 2)
  ctx.stroke()

  // Draw a subtle glow
  ctx.lineWidth = 4
  ctx.strokeStyle = 'rgba(108, 99, 255, 0.2)'
  ctx.beginPath()
  x = 0
  for (let i = 0; i < data.length; i++) {
    const v = data[i] / 128.0
    const y = (v * height) / 2
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
    x += sliceWidth
  }
  ctx.lineTo(width, height / 2)
  ctx.stroke()
}

function drawCircular(ctx: CanvasRenderingContext2D, data: Uint8Array, width: number, height: number): void {
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) * 0.3

  for (let i = 0; i < data.length; i++) {
    const angle = (i / data.length) * Math.PI * 2 - Math.PI / 2
    const amplitude = (data[i] / 255) * radius * 0.8
    const hue = (i / data.length) * 360

    const innerX = centerX + Math.cos(angle) * radius
    const innerY = centerY + Math.sin(angle) * radius
    const outerX = centerX + Math.cos(angle) * (radius + amplitude)
    const outerY = centerY + Math.sin(angle) * (radius + amplitude)

    ctx.beginPath()
    ctx.moveTo(innerX, innerY)
    ctx.lineTo(outerX, outerY)
    ctx.strokeStyle = `hsl(${hue}, 80%, 55%)`
    ctx.lineWidth = 2
    ctx.stroke()
  }

  // Draw center circle
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(108, 99, 255, 0.15)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(108, 99, 255, 0.4)'
  ctx.lineWidth = 1
  ctx.stroke()
}
