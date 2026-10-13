import { useEffect, useRef } from 'react'

export interface DotFieldProps {
  className?: string
  tone?: 'ink' | 'void'
  intensity?: number
  interactive?: boolean
  resolve?: number
}

/**
 * Interactive DotField: dots on a grid with a subtle scanline/wave motion
 * that resolves smoothly into aligned rows as `resolve` moves toward 1.
 */
export function DotField({
  className = '',
  tone = 'ink',
  intensity = 1.0,
  interactive = true,
  resolve = 0,
}: DotFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const targetResolve = useRef(resolve)
  const currentResolve = useRef(resolve)
  const pointer = useRef({ x: -1000, y: -1000 })

  useEffect(() => {
    targetResolve.current = resolve
  }, [resolve])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth)
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight)

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return
      width = canvas.width = canvas.parentElement.clientWidth
      height = canvas.height = canvas.parentElement.clientHeight
    }
    window.addEventListener('resize', handleResize)

    const handlePointerMove = (e: MouseEvent) => {
      if (!interactive) return
      const rect = canvas.getBoundingClientRect()
      pointer.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    if (interactive) {
      window.addEventListener('mousemove', handlePointerMove)
    }

    const dotSpacing = 20
    let time = 0

    const render = () => {
      time += 0.02
      // Smooth glide toward target resolve value
      currentResolve.current += (targetResolve.current - currentResolve.current) * 0.05
      const res = currentResolve.current

      ctx.clearRect(0, 0, width, height)

      const cols = Math.ceil(width / dotSpacing)
      const rows = Math.ceil(height / dotSpacing)

      const isVoid = tone === 'void'
      const baseAlpha = (isVoid ? 0.35 : 0.22) * intensity

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const originalX = c * dotSpacing + (dotSpacing / 2)
          const originalY = r * dotSpacing + (dotSpacing / 2)

          // Jitter/noise that dampens as res approaches 1
          const noiseFactor = 1.0 - res
          const wave = Math.sin(time + c * 0.2 + r * 0.1) * 3 * noiseFactor
          const x = originalX
          const y = originalY + wave

          // Distance from mouse pointer
          const dx = pointer.current.x - x
          const dy = pointer.current.y - y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const hoverRadius = 140
          const nearPointer = dist < hoverRadius

          let alpha = baseAlpha
          let dotSize = 2.4 // Halka sa bada dots as requested

          if (nearPointer) {
            const factor = 1 - dist / hoverRadius
            alpha = Math.min(1, baseAlpha + factor * 0.65)
            dotSize = 2.4 + factor * 2.2
          } else if (res > 0.01) {
            // Highlights scanline structure when resolving
            const rowHighlight = (r % 2 === 0 ? 0.08 : 0) * res
            alpha += rowHighlight
          }

          if (isVoid) {
            if (nearPointer && res > 0.3) {
              ctx.fillStyle = `rgba(158, 20, 50, ${alpha})` // burgundy highlighter-bright
            } else {
              ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
            }
          } else {
            if (nearPointer) {
              ctx.fillStyle = `rgba(109, 0, 26, ${alpha})` // CAESAR burgundy #6D001A
            } else {
              ctx.fillStyle = `rgba(255, 255, 255, ${alpha})` // crisp white dots on black canvas
            }
          }

          ctx.fillRect(x - dotSize / 2, y - dotSize / 2, dotSize, dotSize)
        }
      }

      animId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      if (interactive) {
        window.removeEventListener('mousemove', handlePointerMove)
      }
    }
  }, [tone, intensity, interactive])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="block size-full" />
    </div>
  )
}
