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
import { ErrorNote } from '../components/ErrorNote'
import { PipelineDiagram } from '../components/PipelineDiagram'
import { JOB_STATUS_LABEL, StatusDot } from '../components/StatusDot'
import { BlurFade } from '../components/velora/blur-fade'
import { FlickeringGrid } from '../components/velora/flickering-grid'
import { Globe } from '../components/velora/globe'
import { HeroParallax } from '../components/velora/hero-parallax'
import { SpinnerLoader } from '../components/velora/loaders'
import { TextHoverEffect } from '../components/velora/text-hover-effect'
import { loadShowcase, type ShowcaseClip } from '../lib/showcase'
import { STAGES } from '../stages'

const IDLE_STATES = STAGES.map(() => 'done' as const)
const SHOWCASE_MIN = 6

export function Ingest() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState<'url' | 'file' | null>(null)
  const [error, setError] = useState<ApiError | Error | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [showcase, setShowcase] = useState<ShowcaseClip[]>([])
  const [providers, setProviders] = useState<ProviderStatus[]>([])
  const [overrides, setOverrides] = useState<JobSettingsOverrides>({})
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api
      .listJobs(50)
      .then(async (all) => {
        setJobs(all.slice(0, 8))
        setShowcase(await loadShowcase(all))
      })
      .catch(() => undefined)
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
    <div>
      <section className="relative overflow-hidden rounded-panel px-4 py-10 sm:px-8 sm:py-14">
        <FlickeringGrid
          squareSize={8}
          gap={24}
          columns={44}
          rows={20}
          className="text-brand/15 [mask-image:radial-gradient(60%_70%_at_30%_40%,black,transparent)]"
        />
        <div className="relative max-w-xl">
          <BlurFade>
            <p className="text-micro font-medium tracking-[0.2em] text-muted-foreground uppercase">
              Local · no accounts · no watermarks
            </p>
          </BlurFade>
          <h1 className="mt-4 font-display text-display font-bold text-foreground text-balance tracking-tight">
            Long video in.{' '}
            <span className="italic">
              Shorts
            </span>{' '}
            out.
          </h1>

          <BlurFade delay={0.08}>
            <form onSubmit={submitUrl} className="mt-8 space-y-3">
              <label htmlFor="url" className="label">
                Paste a link
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="url"
                  className="field flex-1"
                  placeholder="https://youtube.com/watch?v=…"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={busy !== null}
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={busy !== null || !url.trim()}
                >
                  {busy === 'url' ? (
                    <span className="flex items-center gap-2">
                      <SpinnerLoader size="sm" className="text-current" label="Starting" />
                      Starting…
                    </span>
                  ) : (
                    'Start'
                  )}
                </button>
              </div>
              <p className="text-micro text-muted-foreground">
                {isOllama
                  ? 'Runs on this machine. Nothing is sent.'
                  : `Sends transcript text to ${activeProviderName}.`}
              </p>
            </form>
          </BlurFade>

          <BlurFade delay={0.16}>
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
                'mt-5 flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-panel border border-dashed p-6 text-center',
                dragging ? 'border-brand bg-brand/10' : 'border-border hover:border-brand/50',
              ].join(' ')}
              onClick={() => fileInput.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') fileInput.current?.click()
              }}
            >
              <span className="text-body font-medium">
                {busy === 'file' ? 'Uploading…' : 'Drop a file'}
              </span>
              <p className="numeric text-micro text-muted-foreground">
                MP4 · MOV · MKV · WEBM · MP3 · WAV · M4A
              </p>
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
          </BlurFade>

          <AdvancedOptions
            open={advancedOpen}
            onToggle={() => setAdvancedOpen((v) => !v)}
            overrides={overrides}
            onChange={setOverrides}
            providers={providers}
          />
        </div>
      </section>

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

      <BlurFade delay={0.24} className="mt-12">
        <TextHoverEffect text="RUCO" className="mx-auto w-full max-w-5xl font-sans font-black" />
      </BlurFade>

      <BlurFade delay={0.32} className="mt-4">
        <PipelineDiagram steps={STAGES} states={IDLE_STATES} />
      </BlurFade>

      {showcase.length >= SHOWCASE_MIN && (
        <section className="-mx-6 mt-16 lg:-mx-10">
          <HeroParallax
            products={showcase.map((clip) => ({
              title: clip.title,
              video: clip.video,
              href: clip.href,
              image: '',
            }))}
            cardClassName="aspect-[9/16] w-40 sm:w-44"
          >
            <h2 className="font-display text-title font-bold tracking-tight text-foreground">Your clips</h2>
          </HeroParallax>
        </section>
      )}

      <BlurFade className="mt-16 grid items-center gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-title font-bold tracking-tight text-foreground">Everything stays on your machine.</h2>
          <p className="mt-3 max-w-prose text-body text-muted-foreground leading-relaxed">
            No accounts. No watermarks. Only transcript text is ever sent to a cloud
            provider if you pick one. With Ollama, nothing leaves the machine.
          </p>
        </div>
        <Globe
          className="mx-auto w-full max-w-sm"
          markers={[{ lat: 0, lng: 0, label: 'This machine' }]}
          arcs={[]}
          label="Decorative globe"
        />
      </BlurFade>

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
      <button type="button" onClick={onToggle} className="btn btn-quiet btn-sm -ml-2">
        <span
          className="inline-block transition-transform duration-base ease-(--ease-standard)"
          style={{ transform: open ? 'rotate(90deg)' : 'none' }}
          aria-hidden
        >
          ›
        </span>
        {open ? 'Hide options' : 'Advanced options'}
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
            <label className="flex items-center gap-3 text-small text-muted-foreground sm:col-span-2">
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
      <BlurFade>
        <div className="flex items-baseline justify-between pb-3">
          <h2 className="text-micro uppercase tracking-wider text-muted-foreground">Recent runs</h2>
          <span className="numeric text-micro text-muted-foreground">{jobs.length} jobs</span>
        </div>
      </BlurFade>

      <ul className="divide-y divide-border overflow-hidden rounded-panel border border-border bg-card">
        {jobs.map((job, i) => (
          <li key={job.id}>
            <BlurFade delay={Math.min(i * 0.08, 0.5)}>
              <Link
                to={job.status === 'done' ? `/jobs/${job.id}/clips` : `/jobs/${job.id}`}
                className="grid grid-cols-[1fr_auto] items-center gap-x-group px-group py-3.5 transition-colors hover:bg-muted sm:grid-cols-[minmax(0,1fr)_11rem_5rem_6rem]"
              >
                <span className="truncate font-medium text-foreground">
                  {job.source?.title || 'Untitled Video'}
                </span>
                <span className="flex items-center gap-2 text-small">
                  <StatusDot status={job.status} />
                  <span className="text-muted-foreground">
                    {job.status === 'running'
                      ? `Running · ${Math.round(job.progress * 100)}%`
                      : JOB_STATUS_LABEL[job.status]}
                  </span>
                </span>
                <span className="numeric hidden text-right text-small text-muted-foreground sm:block">
                  {job.source ? formatDuration(job.source.duration_s) : '—'}
                </span>
                <span className="numeric hidden text-right text-small text-muted-foreground sm:block">
                  {job.provider}
                </span>
              </Link>
            </BlurFade>
          </li>
        ))}
      </ul>
    </section>
  )
}
