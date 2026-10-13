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
    <div className="relative pt-6 sm:pt-10">
      {/* Hero DotField bleeding off the right */}
      <DotField
        tone="ink"
        interactive
        className="-mx-4 -mt-stack -mb-group h-48 [mask-image:linear-gradient(to_bottom,black_30%,transparent)] sm:mx-0 sm:-mt-section lg:fixed lg:inset-y-0 lg:right-0 lg:-z-10 lg:m-0 lg:h-auto lg:w-1/2 lg:[mask-image:linear-gradient(to_right,transparent,black_30%)]"
      />

      <div className="max-w-xl">
        <p className="label">Local · No accounts · No watermarks</p>
        <h1 className="mt-3 font-dot text-display font-extrabold text-ink">
          Long video in.
          <br />
          Shorts out.
        </h1>
      </div>

      <div className="mt-12 grid gap-x-12 gap-y-10 lg:max-w-[600px]">
        {/* URL Form inside frosted panel */}
        <section>
          <form
            onSubmit={submitUrl}
            className="frost rounded-panel p-4 transition-all duration-200 focus-within:[box-shadow:inset_0_0_0_1px_var(--color-ink),0_0_0_4px_var(--color-highlighter-wash),var(--shadow-raised)]"
          >
            <label htmlFor="url" className="label block">
              Paste a link
            </label>
            <input
              id="url"
              className="mt-2 w-full bg-transparent font-sans text-heading text-ink placeholder:text-pencil focus:outline-none"
              placeholder="https://youtube.com/watch?v=…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              disabled={busy !== null}
            />

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-3">
              <span className="font-mono text-micro text-pencil">
                {isOllama
                  ? 'Free · runs on this machine'
                  : `Sends transcript text to ${activeProviderName}. Never video or audio.`}
              </span>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={busy !== null || !url.trim()}
              >
                {busy === 'url' ? 'Fetching…' : 'Start'}
              </button>
            </div>
          </form>

          <p className="mt-2 text-micro text-pencil">
            Only download video you own or have the rights to process.
          </p>

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
          <p className="label mb-2">Or drop a file</p>
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
              'flex min-h-44 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-control border border-dashed bg-sheet px-group py-stack text-center transition-colors duration-base',
              dragging ? 'border-ink bg-highlighter-wash' : 'border-hairline-strong hover:border-graphite',
            ].join(' ')}
            onClick={() => fileInput.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') fileInput.current?.click()
            }}
          >
            <span className="text-heading font-semibold text-ink">
              {busy === 'file' ? 'Uploading…' : 'Drop video or audio'}
            </span>
            <span className="font-mono text-micro text-pencil">
              mp4 · mov · mkv · webm · mp3 · wav · m4a
            </span>
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
        <h2 className="label">Recent</h2>
        <span className="font-mono text-micro tabular text-pencil">{jobs.length}</span>
      </div>

      <div className="overflow-hidden rounded-control border border-hairline bg-sheet">
        <div
          aria-hidden
          className="data-head hidden gap-x-group px-group py-2.5 sm:grid sm:grid-cols-[minmax(0,1fr)_11rem_5rem_6rem]"
        >
          <span>Name</span>
          <span>Status</span>
          <span className="text-right">Length</span>
          <span className="text-right">Provider</span>
        </div>

        <ul className="divide-y divide-hairline">
          {jobs.map((job) => (
            <li key={job.id} className="animate-row-in">
              <Link
                to={job.status === 'done' ? `/jobs/${job.id}/clips` : `/jobs/${job.id}`}
                className="grid grid-cols-[1fr_auto] items-center gap-x-group px-group py-3.5 transition-colors duration-fast hover:bg-canvas/70 sm:grid-cols-[minmax(0,1fr)_11rem_5rem_6rem]"
              >
                <span className="truncate font-medium text-ink">
                  {job.source?.title || 'Untitled'}
                </span>
                <span className="flex items-center gap-2 font-mono text-small">
                  <StatusDot status={job.status} />
                  <span>
                    {job.status === 'running'
                      ? `Running · ${Math.round(job.progress * 100)}%`
                      : JOB_STATUS_LABEL[job.status]}
                  </span>
                </span>
                <span className="hidden text-right font-mono text-small tabular text-graphite sm:block">
                  {job.source ? formatDuration(job.source.duration_s) : '—'}
                </span>
                <span className="hidden text-right font-mono text-small tabular text-graphite sm:block">
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
