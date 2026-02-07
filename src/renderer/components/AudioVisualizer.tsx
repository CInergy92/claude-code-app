import { useRef, useEffect } from 'react'

interface AudioVisualizerProps {
  data: Uint8Array | null
  isActive: boolean
}

export function AudioVisualizer({ data, isActive }: AudioVisualizerProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas

    ctx.clearRect(0, 0, width, height)

    if (!data || !isActive) {
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, width, height)
      return
    }

    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, width, height)

    const barWidth = (width / data.length) * 2.5
    let x = 0

    for (let i = 0; i < data.length; i++) {
      const barHeight = (data[i] / 255) * height
      const hue = (i / data.length) * 360
      ctx.fillStyle = `hsl(${hue}, 80%, 55%)`
      ctx.fillRect(x, height - barHeight, barWidth, barHeight)
      x += barWidth + 1
    }
  }, [data, isActive])

  return (
    <div className="visualizer">
      <canvas
        ref={canvasRef}
        className="visualizer__canvas"
        width={800}
        height={200}
      />
    </div>
  )
}
