import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  ApiError,
  api,
  formatDuration,
  type Job,
  type JobSettingsOverrides,
  type ProviderStatus,
} from '../api'
import { DotField } from '../components/DotField'
import { ErrorNote } from '../components/ErrorNote'
import { JOB_STATUS_LABEL, StatusDot } from '../components/StatusDot'

export function Ingest() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState<'url' | 'file' | null>(null)
  const [error, setError] = useState<ApiError | Error | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [providers, setProviders] = useState<ProviderStatus[]>([])
  const [overrides, setOverrides] = useState<JobSettingsOverrides>({})
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.listJobs(8).then(setJobs).catch(() => undefined)
    api.providerStatus().then(setProviders).catch(() => undefined)
  }, [])

  const start = useCallback(
    async (kind: 'url' | 'file', run: () => Promise<{ id: string }>) => {
      setBusy(kind)
      setError(null)
      try {
        const source = await run()
        const job = await api.createJob(source.id, overrides)
        navigate(`/jobs/${job.id}`)
      } catch (err) {
        setError(err as Error)
      } finally {
        setBusy(null)
      }
    },
    [navigate, overrides],
  )

  const submitUrl = (event: React.FormEvent) => {
    event.preventDefault()
    if (!url.trim()) return
    void start('url', () => api.ingestYouTube(url.trim()))
  }

  const submitFile = (file: File) => void start('file', () => api.uploadSource(file))

  const usableProvider = providers.find((p) => p.available)
  const activeProviderName = overrides.provider || usableProvider?.name || 'ollama'
  const isOllama = activeProviderName.toLowerCase() === 'ollama'

  return (
    <div className="relative pt-4 sm:pt-8">
      {/* Luxury Ambient Radial Glow (Burgundy to Black) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[600px] w-full max-w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(109,0,26,0.25)_0%,rgba(109,0,26,0.08)_45%,transparent_75%)] blur-3xl"
      />

      {/* Hero DotField across background */}
      <DotField
        tone="ink"
        interactive
        className="pointer-events-none fixed inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_80%)]"
      />

      {/* Main 2-Column Balanced Grid */}
      <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
        {/* Left Column (Hero Content + Showcase Feature Badges) - 7 cols */}
        <div className="space-y-8 lg:col-span-7">
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-[0.72rem] tracking-widest uppercase text-pencil shadow-sm backdrop-blur-md">
              <span className="size-2 rounded-full bg-[#6d001a] shadow-[0_0_10px_#e5476a]" />
              <span className="text-graphite font-semibold">AI AUTOCLIP ENGINE</span>
              <span className="text-white/20">—</span>
              <span>LOCAL · 4K 60FPS · NO WATERMARKS</span>
            </div>

            <h1 className="mt-6 font-['Playfair_Display'] text-[3.5rem] font-medium tracking-tight text-white sm:text-[4.75rem] xl:text-[5.25rem] leading-[0.96]">
              <span className="block tracking-wide uppercase font-light text-white/95">
                LONG VIDEO
              </span>
              <span className="flex items-baseline gap-3.5 mt-1.5">
                <span className="font-['Italianno'] text-[4.2rem] sm:text-[5.8rem] xl:text-[6.4rem] font-normal lowercase tracking-normal text-[#e5476a] -translate-y-2 select-none italic">
                  into
                </span>
                <span className="tracking-wide uppercase font-bold bg-gradient-to-r from-white via-white/95 to-[#ffb3c1] bg-clip-text text-transparent">
                  VIRAL SHORTS
                </span>
              </span>
            </h1>

            <p className="mt-5 font-['Cormorant_Garamond'] text-xl sm:text-2xl italic text-graphite max-w-xl leading-relaxed">
              Transform raw long-form podcasts, webinars, and streams into cinematic, high-retention vertical clips built to captivate and convert.
            </p>
          </div>

          {/* Feature Highlights Grid filling the left dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            <div className="rounded-panel border border-white/8 bg-black/40 p-4 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.03]">
              <div className="flex size-8 items-center justify-center rounded-control bg-[#6d001a]/30 border border-[#e5476a]/20 text-[#e5476a] font-mono text-xs">
                01
              </div>
              <h3 className="mt-3 font-sans text-sm font-semibold text-white">Smart Speaker Tracking</h3>
              <p className="mt-1 font-mono text-micro text-pencil leading-relaxed">
                Automated 9:16 re-framing keeping active speakers centered.
              </p>
            </div>

            <div className="rounded-panel border border-white/8 bg-black/40 p-4 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.03]">
              <div className="flex size-8 items-center justify-center rounded-control bg-[#6d001a]/30 border border-[#e5476a]/20 text-[#e5476a] font-mono text-xs">
                02
              </div>
              <h3 className="mt-3 font-sans text-sm font-semibold text-white">Viral Glow Captions</h3>
              <p className="mt-1 font-mono text-micro text-pencil leading-relaxed">
                Word-level Whisper timing with animated karaoke captions.
              </p>
            </div>

            <div className="rounded-panel border border-white/8 bg-black/40 p-4 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.03]">
              <div className="flex size-8 items-center justify-center rounded-control bg-[#6d001a]/30 border border-[#e5476a]/20 text-[#e5476a] font-mono text-xs">
                03
              </div>
              <h3 className="mt-3 font-sans text-sm font-semibold text-white">100% On-Device AI</h3>
              <p className="mt-1 font-mono text-micro text-pencil leading-relaxed">
                Zero telemetry, zero subscriptions, complete privacy.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (High-End Input Deck + File Drop Zone) - 5 cols */}
        <div className="space-y-5 lg:col-span-5">
          {/* URL Form inside high-end glow-card */}
          <section>
            <form
              onSubmit={submitUrl}
              className="glow-card rounded-panel p-6 transition-all duration-200 focus-within:border-[#9e1432]/60 focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_18px_48px_-10px_rgba(0,0,0,0.9),0_0_35px_rgba(109,0,26,0.4)]"
            >
              <div className="flex items-center justify-between">
                <label htmlFor="url" className="flex items-center gap-2 font-mono text-micro font-medium text-graphite uppercase tracking-wider">
                  <svg className="size-3.5 text-[#e5476a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Paste Video Link
                </label>
                <span className="font-mono text-micro text-pencil">YouTube · Vimeo · MP4</span>
              </div>

              <div className="relative mt-3.5">
                <input
                  id="url"
                  className="w-full rounded-control border border-white/10 bg-black/50 px-4 py-3 font-sans text-base text-white placeholder:text-pencil focus:border-white/30 focus:bg-black/70 focus:outline-none transition-colors"
                  placeholder="https://youtube.com/watch?v=…"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={busy !== null}
                />
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                <span className="font-mono text-micro text-pencil">
                  {isOllama
                    ? '⚡ Free · runs 100% on this machine'
                    : `Sends transcript text to ${activeProviderName}.`}
                </span>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={busy !== null || !url.trim()}
                >
                  {busy === 'url' ? (
                    <span className="flex items-center gap-2">
                      <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Fetching…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>Generate Clips</span>
                      <span className="text-white/60">→</span>
                    </span>
                  )}
                </button>
              </div>
            </form>

            <AdvancedOptions
              open={advancedOpen}
              onToggle={() => setAdvancedOpen((v) => !v)}
              overrides={overrides}
              onChange={setOverrides}
              providers={providers}
            />
          </section>

          {/* Upload Drop Zone */}
          <section>
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                const file = e.dataTransfer.files[0]
                if (file) submitFile(file)
              }}
              className={[
                'glow-card flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2.5 rounded-panel border border-dashed p-6 text-center transition-all duration-base group',
                dragging
                  ? 'border-[#e5476a] bg-[rgba(109,0,26,0.2)] shadow-[0_0_30px_rgba(109,0,26,0.3)]'
                  : 'border-white/15 hover:border-white/30',
              ].join(' ')}
              onClick={() => fileInput.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') fileInput.current?.click()
              }}
            >
              <div className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-transform duration-200 group-hover:scale-110 group-hover:border-[#e5476a]/40 group-hover:bg-[#6d001a]/20">
                <svg className="size-5 text-graphite group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <span className="text-base font-medium text-white transition-colors group-hover:text-white">
                  {busy === 'file' ? 'Uploading media…' : 'Drop video or audio file'}
                </span>
                <p className="mt-0.5 font-mono text-micro text-pencil">
                  MP4 · MOV · MKV · WEBM · MP3 · WAV · M4A
                </p>
              </div>
            </div>
            <input
              ref={fileInput}
              type="file"
              className="hidden"
              accept="video/*,audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) submitFile(file)
                e.target.value = ''
              }}
            />
          </section>
        </div>
      </div>

      {error && (
        <div className="mt-8 max-w-xl">
          <ErrorNote error={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {providers.length > 0 && !usableProvider && (
        <p className="mt-8 max-w-xl border-l-2 border-amber bg-amber-wash px-item py-tight text-small text-amber">
          No AI provider is reachable yet, so clip selection will fail. Add an API key or
          start Ollama in{' '}
          <Link to="/settings" className="font-medium underline underline-offset-4">
            Settings
          </Link>
          .
        </p>
      )}

      <RecentJobs jobs={jobs} />
    </div>
  )
}

function AdvancedOptions({
  open,
  onToggle,
  overrides,
  onChange,
  providers,
}: {
  open: boolean
  onToggle: () => void
  overrides: JobSettingsOverrides
  onChange: (next: JobSettingsOverrides) => void
  providers: ProviderStatus[]
}) {
  const set = <K extends keyof JobSettingsOverrides>(key: K, value: JobSettingsOverrides[K]) =>
    onChange({ ...overrides, [key]: value })

  return (
    <div className="mt-6">
      <button type="button" onClick={onToggle} className="btn btn-quiet btn-sm -ml-2 text-graphite">
        <span
          className="inline-block transition-transform duration-base ease-(--ease-standard)"
          style={{ transform: open ? 'rotate(90deg)' : 'none' }}
          aria-hidden
        >
          ›
        </span>
        {open ? 'Hide options' : 'Options'}
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-(--duration-slow) ease-(--ease-standard)"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="grid gap-x-6 gap-y-4 pt-4 sm:grid-cols-2">
            <Selector
              label="Provider"
              value={overrides.provider ?? ''}
              onChange={(v) => set('provider', v || undefined)}
              options={[
                { value: '', label: 'Use default' },
                ...providers.map((p) => ({
                  value: p.name,
                  label: p.available ? p.name : `${p.name} — unavailable`,
                  disabled: !p.available,
                })),
              ]}
            />
            <Selector
              label="Whisper model"
              value={overrides.whisper_model ?? ''}
              onChange={(v) => set('whisper_model', v || undefined)}
              options={[
                { value: '', label: 'Use default' },
                { value: 'tiny', label: 'tiny — fastest, roughest' },
                { value: 'base', label: 'base' },
                { value: 'small', label: 'small — balanced' },
                { value: 'medium', label: 'medium' },
                { value: 'large-v3', label: 'large-v3 — slowest, best' },
              ]}
            />
            <NumberField
              label="Max clips"
              value={overrides.max_clips}
              placeholder="10"
              min={1}
              max={50}
              onChange={(v) => set('max_clips', v)}
            />
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="Min length (s)"
                value={overrides.min_duration_s}
                placeholder="20"
                min={5}
                max={300}
                onChange={(v) => set('min_duration_s', v)}
              />
              <NumberField
                label="Max length (s)"
                value={overrides.max_duration_s}
                placeholder="90"
                min={5}
                max={300}
                onChange={(v) => set('max_duration_s', v)}
              />
            </div>
            <label className="flex items-center gap-3 font-mono text-small text-graphite sm:col-span-2">
              <button
                type="button"
                role="switch"
                aria-checked={overrides.diarization ?? false}
                onClick={() => set('diarization', !overrides.diarization || undefined)}
                className="switch"
              >
                <span />
              </button>
              Multiple speakers — label who is talking, and cut to them
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

function Selector({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string; disabled?: boolean }[]
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field mt-1 cursor-pointer"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function NumberField({
  label,
  value,
  placeholder,
  min,
  max,
  onChange,
}: {
  label: string
  value: number | undefined
  placeholder: string
  min: number
  max: number
  onChange: (value: number | undefined) => void
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input
        type="number"
        className="field tabular mt-1"
        placeholder={placeholder}
        value={value ?? ''}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
      />
    </label>
  )
}

function RecentJobs({ jobs }: { jobs: Job[] }) {
  if (jobs.length === 0) return null

  return (
    <section className="mt-16">
      <div className="flex items-baseline justify-between pb-3">
        <h2 className="font-mono text-micro uppercase tracking-wider text-graphite">Recent Video Exports</h2>
        <span className="font-mono text-micro tabular text-pencil">{jobs.length} jobs</span>
      </div>

      <div className="overflow-hidden rounded-panel border border-white/10 bg-black/40 backdrop-blur-md shadow-xl">
        <div
          aria-hidden
          className="hidden border-b border-white/10 bg-white/5 px-group py-3 font-mono text-micro text-pencil sm:grid sm:grid-cols-[minmax(0,1fr)_11rem_5rem_6rem] gap-x-group"
        >
          <span>Title</span>
          <span>Status</span>
          <span className="text-right">Length</span>
          <span className="text-right">Engine</span>
        </div>

        <ul className="divide-y divide-white/5">
          {jobs.map((job) => (
            <li key={job.id} className="animate-row-in">
              <Link
                to={job.status === 'done' ? `/jobs/${job.id}/clips` : `/jobs/${job.id}`}
                className="grid grid-cols-[1fr_auto] items-center gap-x-group px-group py-3.5 transition-colors duration-fast hover:bg-white/5 sm:grid-cols-[minmax(0,1fr)_11rem_5rem_6rem]"
              >
                <span className="truncate font-medium text-white hover:text-[#e5476a] transition-colors">
                  {job.source?.title || 'Untitled Video'}
                </span>
                <span className="flex items-center gap-2 font-mono text-small">
                  <StatusDot status={job.status} />
                  <span className="text-graphite">
                    {job.status === 'running'
                      ? `Running · ${Math.round(job.progress * 100)}%`
                      : JOB_STATUS_LABEL[job.status]}
                  </span>
                </span>
                <span className="hidden text-right font-mono text-small tabular text-pencil sm:block">
                  {job.source ? formatDuration(job.source.duration_s) : '—'}
                </span>
                <span className="hidden text-right font-mono text-small tabular text-pencil sm:block">
                  {job.provider}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
