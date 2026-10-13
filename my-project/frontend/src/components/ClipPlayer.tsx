import { useCallback, useEffect, useRef, useState } from 'react'

import { formatTimecode, type CaptionStyle, type CropPath, type Word } from '../api'

const VOLUME_KEY = 'autoclip.volume'

/** Output shapes, matching autoclip.pipeline.export.RATIOS. */
const ASPECTS: Record<string, [number, number]> = {
  '9:16': [9, 16],
  '1:1': [1, 1],
  '16:9': [16, 9],
}

/** Tallest the preview may be, so the transport row stays on screen. */
const MAX_HEIGHT_VH = 62

function readStoredVolume(): number {
  const stored = Number(window.localStorage.getItem(VOLUME_KEY))
  return Number.isFinite(stored) && stored > 0 && stored <= 1 ? stored : 1
}

/**
 * 9:16 preview of one clip, with a CSS approximation of the burned captions.
 *
 * Sits on a rounded void (black) stage with a frosted floating play button,
 * hairline progress track, and signal (highlighter) progress bar.
 */
export function ClipPlayer({
  src,
  startS,
  endS,
  words,
  style,
  ratio,
  cropPath,
}: {
  src: string
  startS: number
  endS: number
  words: Word[]
  style: CaptionStyle | undefined
  ratio: string
  cropPath?: CropPath | null
}) {
  const video = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(startS)
  const [volume, setVolume] = useState(readStoredVolume)
  const [muted, setMuted] = useState(false)
  const [nativeControls, setNativeControls] = useState(false)
  const [audioCheck, setAudioCheck] = useState<AudioCheck | null>(null)
  const [checking, setChecking] = useState(false)

  const runAudioCheck = async () => {
    const element = video.current
    if (!element) return
    setChecking(true)
    setAudioCheck(null)
    try {
      setAudioCheck(await measureOutputLevel(element))
    } catch (error) {
      setAudioCheck({ ok: false, peakDb: null, detail: String(error) })
    } finally {
      setChecking(false)
      setPlaying(!element.paused)
    }
  }

  useEffect(() => {
    const element = video.current
    if (!element) return
    element.volume = volume
    element.muted = muted
    window.localStorage.setItem(VOLUME_KEY, String(volume))
  }, [volume, muted])

  useEffect(() => {
    const element = video.current
    if (!element) return
    element.currentTime = startS
    setTime(startS)
    setPlaying(false)
    element.pause()
  }, [src, startS])

  const onTimeUpdate = useCallback(() => {
    const element = video.current
    if (!element) return
    if (element.currentTime >= endS) {
      element.pause()
      element.currentTime = startS
      setPlaying(false)
      setTime(startS)
      return
    }
    setTime(element.currentTime)
  }, [endS, startS])

  const toggle = () => {
    const element = video.current
    if (!element) return
    if (element.paused) {
      if (element.currentTime < startS || element.currentTime >= endS) {
        element.currentTime = startS
      }
      void element.play()
      setPlaying(true)
    } else {
      element.pause()
      setPlaying(false)
    }
  }

  const elapsed = Math.max(0, time - startS)
  const duration = Math.max(0.01, endS - startS)

  const cropStyle = cropWindowStyle(cropPath, elapsed)
  const [aspectW, aspectH] = ASPECTS[ratio] ?? ASPECTS['9:16']
  const maxWidth = `${((MAX_HEIGHT_VH * aspectW) / aspectH).toFixed(3)}vh`

  return (
    <div className="mx-auto flex w-full flex-col items-stretch" style={{ maxWidth }}>
      <div
        className="relative w-full overflow-hidden rounded-control bg-void"
        style={{ aspectRatio: `${aspectW} / ${aspectH}` }}
        onClick={toggle}
        role="button"
        tabIndex={0}
        aria-label={playing ? 'Pause' : 'Play'}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            toggle()
          }
        }}
      >
        <video
          ref={video}
          src={src}
          className={cropStyle ? 'absolute max-w-none' : 'size-full object-cover'}
          style={cropStyle ?? undefined}
          onTimeUpdate={onTimeUpdate}
          preload="auto"
          playsInline
          controls={nativeControls}
        />

        <CaptionOverlay words={words} time={time} style={style} />

        {!playing && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="grid size-16 place-items-center rounded-full frost pl-1 text-2xl text-ink">
              ▶
            </span>
          </div>
        )}
      </div>

      {/* Controls row */}
      <div className="mt-3 flex w-full items-center gap-3">
        <button onClick={toggle} className="btn btn-quiet btn-sm -ml-1 w-14 justify-start">
          {playing ? 'Pause' : 'Play'}
        </button>

        <VolumeControl
          volume={volume}
          muted={muted}
          onVolume={(next) => {
            setVolume(next)
            if (next > 0) setMuted(false)
          }}
          onToggleMute={() => setMuted((current) => !current)}
        />

        {/* Progress bar */}
        <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-hairline-strong">
          <div
            className="h-full origin-left bg-highlighter transition-transform duration-base ease-(--ease-standard)"
            style={{ transform: `scaleX(${elapsed / duration})` }}
          />
        </div>

        <span className="font-mono text-micro tabular text-graphite">
          {formatTimecode(elapsed)} / {formatTimecode(duration)}
        </span>
      </div>

      {(muted || volume === 0) && (
        <div className="mt-2 flex items-center gap-2">
          <span className="badge badge-check">Muted</span>
          <span className="text-small text-graphite">
            Audio is muted — click the speaker to unmute.
          </span>
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <button onClick={runAudioCheck} disabled={checking} className="btn btn-quiet btn-sm -ml-1">
          {checking ? 'Listening…' : 'Test audio'}
        </button>
        <button
          onClick={() => setNativeControls((current) => !current)}
          className="btn btn-quiet btn-sm"
        >
          {nativeControls ? 'Hide browser controls' : 'Browser controls'}
        </button>
      </div>

      {audioCheck && (
        <div className="mt-2 flex items-start gap-2">
          {!audioCheck.ok && <span className="badge badge-check shrink-0">No signal</span>}
          <p className="max-w-prose text-small leading-relaxed text-graphite">
            {audioCheck.detail}
          </p>
        </div>
      )}
    </div>
  )
}

interface AudioCheck {
  ok: boolean
  peakDb: number | null
  detail: string
}

async function measureOutputLevel(element: HTMLVideoElement): Promise<AudioCheck> {
  const capture =
    (element as HTMLVideoElement & { captureStream?: () => MediaStream }).captureStream ??
    (element as HTMLVideoElement & { mozCaptureStream?: () => MediaStream }).mozCaptureStream

  if (!capture) {
    return {
      ok: false,
      peakDb: null,
      detail: "This browser can't measure audio output. Try the browser controls instead.",
    }
  }

  const wasPaused = element.paused
  if (wasPaused) await element.play()

  const stream = capture.call(element)
  const tracks = stream.getAudioTracks()
  if (tracks.length === 0) {
    if (wasPaused) element.pause()
    return {
      ok: false,
      peakDb: null,
      detail: 'This video exposes no audio track at all — that is a problem in AutoClip.',
    }
  }

  const context = new AudioContext()
  const analyser = context.createAnalyser()
  analyser.fftSize = 2048
  context.createMediaStreamSource(stream).connect(analyser)

  const samples = new Float32Array(analyser.fftSize)
  let peak = 0
  for (let i = 0; i < 24; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 50))
    analyser.getFloatTimeDomainData(samples)
    for (const sample of samples) peak = Math.max(peak, Math.abs(sample))
  }

  await context.close()
  if (wasPaused) element.pause()

  if (peak <= 0.005) {
    return {
      ok: false,
      peakDb: null,
      detail:
        'No signal is leaving the player. Either the clip really is silent, or the ' +
        'player is muted — check the speaker icon above.',
    }
  }

  const peakDb = 20 * Math.log10(peak)
  return {
    ok: true,
    peakDb,
    detail:
      `Audio is leaving the player at ${peakDb.toFixed(1)} dBFS — the app is producing sound. ` +
      'If you still hear nothing, it is between the browser and your speakers: right-click ' +
      'this tab and check for "Unmute site", then check Windows Volume Mixer and your ' +
      'output device.',
  }
}

function cropWindowStyle(
  cropPath: CropPath | null | undefined,
  elapsed: number,
): React.CSSProperties | null {
  if (!cropPath || cropPath.segments.length === 0) return null

  const segment =
    cropPath.segments.find((s) => elapsed >= s.start_s && elapsed < s.end_s) ??
    cropPath.segments[cropPath.segments.length - 1]

  if (segment.fit) return null

  const { x, y } = interpolate(segment.keyframes, elapsed)
  const { source_width: sourceW, source_height: sourceH } = cropPath

  return {
    width: `${(sourceW / segment.width) * 100}%`,
    height: `${(sourceH / segment.height) * 100}%`,
    left: `${(-x / segment.width) * 100}%`,
    top: `${(-y / segment.height) * 100}%`,
  }
}

function interpolate(
  keyframes: { t: number; x: number; y: number }[],
  t: number,
): { x: number; y: number } {
  if (keyframes.length === 0) return { x: 0, y: 0 }
  if (keyframes.length === 1) return { x: keyframes[0].x, y: keyframes[0].y }

  if (t <= keyframes[0].t) return { x: keyframes[0].x, y: keyframes[0].y }
  const last = keyframes[keyframes.length - 1]
  if (t >= last.t) return { x: last.x, y: last.y }

  for (let i = 0; i < keyframes.length - 1; i += 1) {
    const a = keyframes[i]
    const b = keyframes[i + 1]
    if (t >= a.t && t <= b.t) {
      const span = b.t - a.t
      const ratio = span > 0 ? (t - a.t) / span : 0
      return { x: a.x + (b.x - a.x) * ratio, y: a.y + (b.y - a.y) * ratio }
    }
  }

  return { x: last.x, y: last.y }
}

function VolumeControl({
  volume,
  muted,
  onVolume,
  onToggleMute,
}: {
  volume: number
  muted: boolean
  onVolume: (value: number) => void
  onToggleMute: () => void
}) {
  const silent = muted || volume === 0

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={onToggleMute}
        className={`btn btn-quiet btn-sm px-1 ${silent ? 'text-amber' : 'text-graphite'}`}
        aria-label={silent ? 'Unmute' : 'Mute'}
        title={silent ? 'Unmute' : 'Mute'}
      >
        <SpeakerIcon silent={silent} level={volume} />
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={silent ? 0 : volume}
        onChange={(e) => onVolume(Number(e.target.value))}
        aria-label="Volume"
        className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-hairline-strong accent-ink"
      />
    </div>
  )
}

function SpeakerIcon({ silent, level }: { silent: boolean; level: number }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M11 5 6 9H3v6h3l5 4V5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {silent ? (
        <path
          d="m16 9 5 6m0-6-5 6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      ) : (
        <>
          <path
            d="M15.5 9.5a3.5 3.5 0 0 1 0 5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {level > 0.5 && (
            <path
              d="M18.5 7a7 7 0 0 1 0 10"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          )}
        </>
      )}
    </svg>
  )
}

function CaptionOverlay({
  words,
  time,
  style,
}: {
  words: Word[]
  time: number
  style: CaptionStyle | undefined
}) {
  if (!style || words.length === 0) return null

  const groups = groupWords(words, style.preview.maxWords)
  const active = groups.find((group) => time >= group[0].start && time <= group[group.length - 1].end)
  if (!active) return null

  const { primary, accent, allCaps, outlineWidth, boxed, marginRatio, sizeRatio } = style.preview

  return (
    <div
      className="pointer-events-none absolute inset-x-0 flex justify-center px-[6%]"
      style={{ bottom: `${marginRatio * 100}%` }}
    >
      <p
        className="text-center leading-[1.15]"
        style={{
          fontFamily: style.preview.font === 'Anton' ? 'Anton, Impact, sans-serif' : undefined,
          fontSize: `clamp(0.75rem, ${sizeRatio * 100}cqh, 4rem)`,
          fontWeight: boxed || style.preview.font === 'Anton' ? 400 : 600,
          textTransform: allCaps ? 'uppercase' : 'none',
          color: primary,
          textShadow: boxed
            ? undefined
            : `0 0 ${outlineWidth}px #000, 0 0 ${outlineWidth * 2}px #000`,
          background: boxed ? 'rgba(0,0,0,0.78)' : undefined,
          padding: boxed ? '0.15em 0.4em' : undefined,
        }}
      >
        {active.map((word, index) => {
          const isActive = time >= word.start && time <= word.end
          return (
            <span
              key={`${word.start}-${index}`}
              style={{
                color: isActive && accent ? accent : undefined,
                display: 'inline-block',
                transform: isActive && accent ? 'scale(1.08)' : undefined,
                transition: 'transform 120ms cubic-bezier(0.16,1,0.3,1)',
                marginInline: '0.14em',
              }}
            >
              {allCaps ? word.text.toUpperCase() : word.text}
            </span>
          )
        })}
      </p>
    </div>
  )
}

function groupWords(words: Word[], maxWords: number): Word[][] {
  const groups: Word[][] = []
  let current: Word[] = []

  for (const [index, word] of words.entries()) {
    if (current.length > 0) {
      const gap = word.start - current[current.length - 1].end
      if (gap > 0.4 || current.length >= maxWords) {
        groups.push(current)
        current = []
      }
    }
    current.push(word)
    if (/[.!?…]$/.test(word.text.trim()) && index !== words.length - 1) {
      groups.push(current)
      current = []
    }
  }
  if (current.length > 0) groups.push(current)
  return groups
}
