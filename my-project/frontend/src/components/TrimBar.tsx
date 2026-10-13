import { useCallback, useEffect, useRef, useState } from 'react'

import { formatTimecode, type Word } from '../api'

/**
 * Trim handles that snap to word boundaries.
 *
 * Sits in a rounded sheet container with hairline-strong density bars,
 * a highlighter-wash active trim window, and ink grab handles.
 */
export function TrimBar({
  words,
  startS,
  endS,
  originalStart,
  originalEnd,
  onCommit,
}: {
  words: Word[]
  startS: number
  endS: number
  originalStart: number
  originalEnd: number
  onCommit: (start: number, end: number) => void
}) {
  const track = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState<'start' | 'end' | null>(null)
  const [local, setLocal] = useState<{ start: number; end: number }>({ start: startS, end: endS })

  useEffect(() => setLocal({ start: startS, end: endS }), [startS, endS])

  // Padding either side so a trim can be widened as well as tightened.
  const windowStart = originalStart - 5
  const windowEnd = originalEnd + 5
  const span = Math.max(0.1, windowEnd - windowStart)

  const toFraction = (t: number) => (t - windowStart) / span
  const toTime = (fraction: number) => windowStart + fraction * span

  const snap = useCallback(
    (t: number, edge: 'start' | 'end') => {
      if (words.length === 0) return t
      const candidates = words.map((w) => (edge === 'start' ? w.start : w.end))
      let best = candidates[0]
      for (const candidate of candidates) {
        if (Math.abs(candidate - t) < Math.abs(best - t)) best = candidate
      }
      return Math.abs(best - t) < 0.5 ? best : t
    },
    [words],
  )

  useEffect(() => {
    if (!dragging) return

    const move = (event: PointerEvent) => {
      const rect = track.current?.getBoundingClientRect()
      if (!rect) return
      const fraction = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
      const time = toTime(fraction)
      setLocal((current) =>
        dragging === 'start'
          ? { ...current, start: Math.min(time, current.end - 1) }
          : { ...current, end: Math.max(time, current.start + 1) },
      )
    }

    const release = () => {
      setLocal((current) => {
        const snapped = {
          start: snap(current.start, 'start'),
          end: snap(current.end, 'end'),
        }
        if (
          Math.abs(snapped.start - startS) > 0.01 ||
          Math.abs(snapped.end - endS) > 0.01
        ) {
          onCommit(snapped.start, snapped.end)
        }
        return snapped
      })
      setDragging(null)
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', release, { once: true })
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', release)
    }
  }, [dragging, snap, onCommit, startS, endS])

  const left = toFraction(local.start)
  const right = toFraction(local.end)
  const duration = local.end - local.start

  return (
    <div className="select-none">
      <div className="flex items-baseline justify-between">
        <span className="label">Trim</span>
        <span className="font-mono text-micro tabular text-graphite">
          {formatTimecode(local.start)} → {formatTimecode(local.end)}
          <span className="ml-3 font-medium text-ink">{duration.toFixed(1)}s</span>
        </span>
      </div>

      <div
        ref={track}
        className="relative mt-2 h-14 cursor-ew-resize overflow-hidden rounded-control border border-hairline bg-sheet"
      >
        {/* Word density as a crude waveform stand-in */}
        <div className="absolute inset-0 flex items-end gap-px overflow-hidden px-px opacity-60">
          {buildDensity(words, windowStart, windowEnd, 90).map((value, index) => (
            <div
              key={index}
              className="flex-1 bg-hairline-strong"
              style={{ height: `${12 + value * 78}%` }}
            />
          ))}
        </div>

        {/* Selected window (highlighter-wash) */}
        <div
          className="absolute inset-y-0 bg-highlighter-wash"
          style={{ left: `${left * 100}%`, right: `${(1 - right) * 100}%` }}
        />

        <Handle position={left} edge="start" onGrab={() => setDragging('start')} />
        <Handle position={right} edge="end" onGrab={() => setDragging('end')} />
      </div>
    </div>
  )
}

function Handle({
  position,
  edge,
  onGrab,
}: {
  position: number
  edge: 'start' | 'end'
  onGrab: () => void
}) {
  return (
    <button
      onPointerDown={(e) => {
        e.preventDefault()
        onGrab()
      }}
      aria-label={`Drag ${edge} of clip`}
      className="absolute inset-y-0 w-3 -translate-x-1/2 cursor-ew-resize focus-visible:outline-none"
      style={{ left: `${position * 100}%` }}
    >
      <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-ink" />
      <span className="absolute left-1/2 top-1/2 h-6 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" />
    </button>
  )
}

/** Words per bucket, normalised — a proxy for speech density. */
function buildDensity(words: Word[], start: number, end: number, buckets: number): number[] {
  const values = new Array(buckets).fill(0)
  const span = Math.max(0.1, end - start)

  for (const word of words) {
    const index = Math.floor(((word.start - start) / span) * buckets)
    if (index >= 0 && index < buckets) values[index] += 1
  }

  const peak = Math.max(1, ...values)
  return values.map((value) => value / peak)
}
