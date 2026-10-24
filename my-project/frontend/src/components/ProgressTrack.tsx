export type StageState = 'done' | 'active' | 'stopped' | 'pending'

export interface TrackStage {
  key: string
  label: string
  state: StageState
  /** 0-1. Only read while `active`: Ruco reports real per-stage progress. */
  fraction: number
}

const Check = () => (
  <svg viewBox="0 0 16 16" aria-hidden className="hidden size-3.5 shrink-0 sm:block" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="m3 8.5 3.2 3L13 4.5" />
  </svg>
)

const Cross = () => (
  <svg viewBox="0 0 16 16" aria-hidden className="hidden size-3.5 shrink-0 sm:block" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="m4 4 8 8m0-8-8 8" />
  </svg>
)

/**
 * The pipeline as dot-matrix bars on the black collecting panel. Each bar is cut
 * into 4px cells so it reads as a row of dots; done is full signal (the lifted
 * burgundy, because plain burgundy vanishes on black), the active
 * stage fills to its real progress, a stopped stage says where it died.
 */
export function ProgressTrack({ stages }: { stages: TrackStage[] }) {
  return (
    <ol
      aria-label="Progress"
      className="grid gap-tight"
      style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}
    >
      {stages.map(({ key, label, state, fraction }) => (
        <li key={key} className="space-y-tight" aria-current={state === 'active' ? 'step' : undefined}>
          <div className="relative h-2.5 overflow-hidden rounded-[2px] bg-white/10 [mask-image:linear-gradient(90deg,black_4px,transparent_4px)] [mask-size:6px_100%]">
            {state === 'done' && <div className="absolute inset-0 bg-[#e5476a] shadow-[0_0_8px_#e5476a]" />}
            {state === 'stopped' && <div className="absolute inset-0 bg-brick" />}
            {state === 'active' && (
              <div
                className="absolute inset-0 origin-left bg-gradient-to-r from-[#9e1432] to-[#e5476a] shadow-[0_0_10px_#e5476a] transition-transform duration-(--duration-slow) ease-(--ease-standard)"
                style={{ transform: `scaleX(${Math.min(1, Math.max(0.04, fraction))})` }}
              />
            )}
          </div>
          <p
            className={[
              'flex items-center gap-1 font-mono text-micro',
              state === 'pending'
                ? 'text-white/40'
                : state === 'stopped'
                  ? 'text-brick'
                  : state === 'active'
                    ? 'text-white font-semibold'
                    : 'text-white/80',
            ].join(' ')}
          >
            {state === 'done' && <Check />}
            {state === 'stopped' && <Cross />}
            <span className="truncate">{label}</span>
            {state === 'done' && <span className="sr-only">(done)</span>}
            {state === 'stopped' && <span className="sr-only">(stopped here)</span>}
          </p>
        </li>
      ))}
    </ol>
  )
}
