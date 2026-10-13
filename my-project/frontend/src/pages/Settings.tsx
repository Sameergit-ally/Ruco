import { useEffect, useState } from 'react'

import { api, type ProviderStatus, type Settings as SettingsData, type SystemStatus } from '../api'
import { ErrorNote } from '../components/ErrorNote'
import { FallingCat } from '../components/FallingCat'

const SECRET_LABELS: Record<string, string> = {
  anthropic: 'Anthropic API key',
  openai: 'OpenAI-compatible API key',
  gemini: 'Google Gemini API key',
  huggingface_token: 'HuggingFace token',
}

export function Settings() {
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [providers, setProviders] = useState<ProviderStatus[]>([])
  const [system, setSystem] = useState<SystemStatus | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [saved, setSaved] = useState(false)

  const reload = () => {
    void api.getSettings().then(setSettings).catch((e) => setError(e as Error))
    void api.providerStatus().then(setProviders).catch(() => undefined)
    void api.system().then(setSystem).catch(() => undefined)
  }

  useEffect(reload, [])

  const patch = async (update: Partial<SettingsData>) => {
    setError(null)
    try {
      setSettings(await api.putSettings(update))
      setSaved(true)
      setTimeout(() => setSaved(false), 1600)
    } catch (err) {
      setError(err as Error)
    }
  }

  if (!settings) return <FallingCat className="min-h-[50vh]" />

  return (
    <div className="max-w-4xl pt-2 sm:pt-4">
      {/* Masthead */}
      <div className="flex items-baseline justify-between border-b border-hairline pb-4">
        <h1 className="font-dot text-title font-black text-ink">
          Settings
        </h1>
        {saved && (
          <span className="badge badge-sure">
            Saved
          </span>
        )}
      </div>

      {error && (
        <div className="mt-4">
          <ErrorNote error={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {settings.insecure_secret_storage && (
        <p className="mt-4 border-l-2 border-amber bg-amber-wash px-item py-tight text-small leading-relaxed text-amber">
          No OS keyring is available on this machine, so API keys are stored in plain text
          in <code className="rounded-control bg-ink/6 px-1.5 font-mono text-micro text-ink">config.json</code>. On headless Linux, installing
          a Secret Service provider or <code className="rounded-control bg-ink/6 px-1.5 font-mono text-micro text-ink">keyrings.alt</code>{' '}
          fixes this.
        </p>
      )}

      {/* AI Provider Section */}
      <Section title="AI provider" note="Which model picks the clips.">
        <div className="grid gap-tight sm:grid-cols-2">
          {providers.map((provider) => {
            const checked = provider.name === settings.active_provider
            return (
              <label key={provider.name} className="tile">
                <input
                  type="radio"
                  name="active_provider"
                  checked={checked}
                  onChange={() => patch({ active_provider: provider.name })}
                  className="sr-only"
                />
                <div className="flex w-full items-baseline justify-between gap-2">
                  <span className="font-mono text-small font-semibold">
                    {provider.name}
                  </span>
                  <span className="font-mono text-micro">
                    {provider.available ? 'Reachable' : provider.detail || 'Unavailable'}
                  </span>
                </div>
                {provider.models.length > 0 && (
                  <span className="font-mono text-micro tabular text-graphite">
                    {provider.models.slice(0, 4).join(' · ')}
                  </span>
                )}
              </label>
            )
          })}
        </div>

        <div className="mt-6 grid gap-item sm:grid-cols-2">
          <Field
            label="Model"
            value={settings.providers[settings.active_provider]?.model ?? ''}
            placeholder="model name"
            onCommit={(value) =>
              patch({
                providers: {
                  [settings.active_provider]: {
                    ...settings.providers[settings.active_provider],
                    model: value,
                  },
                },
              })
            }
          />
          <Field
            label="Base URL"
            hint="Point at OpenRouter, Groq, DeepSeek, or a local server."
            value={settings.providers[settings.active_provider]?.base_url ?? ''}
            placeholder="https://…"
            onCommit={(value) =>
              patch({
                providers: {
                  [settings.active_provider]: {
                    ...settings.providers[settings.active_provider],
                    base_url: value || null,
                  },
                },
              })
            }
          />
        </div>
      </Section>

      {/* Keys Section */}
      <Section title="Keys" note="Stored in your OS keyring. Never sent anywhere but the provider.">
        <div className="space-y-3">
          {Object.entries(SECRET_LABELS).map(([key, label]) => (
            <SecretField
              key={key}
              secretKey={key}
              label={label}
              present={settings.keys_present[key] ?? false}
              onChanged={reload}
              onError={setError}
            />
          ))}
        </div>
      </Section>

      {/* Transcription Section */}
      <Section title="Transcription">
        <div className="grid gap-item sm:grid-cols-2">
          <Select
            label="Whisper model"
            value={settings.whisper.model}
            onChange={(value) => patch({ whisper: { ...settings.whisper, model: value } })}
            options={['tiny', 'base', 'small', 'medium', 'large-v3']}
          />
          <Field
            label="Language"
            hint="Leave empty to detect automatically."
            value={settings.whisper.language}
            placeholder="auto"
            onCommit={(value) => patch({ whisper: { ...settings.whisper, language: value } })}
          />
        </div>

        <div className="mt-4">
          <label className="flex items-start gap-3 font-mono text-small text-graphite">
            <button
              type="button"
              role="switch"
              aria-checked={settings.whisper.diarization}
              disabled={!system?.diarization_available}
              onClick={() =>
                patch({ whisper: { ...settings.whisper, diarization: !settings.whisper.diarization } })
              }
              className="switch"
            >
              <span />
            </button>
            <span>
              Identify speakers
              {!system?.diarization_available && (
                <span className="mt-1 block text-micro text-pencil">
                  Needs the diarization extra:{' '}
                  <code className="rounded-control bg-ink/6 px-1.5 font-mono text-micro text-ink">
                    uv pip install 'autoclip[diarization]'
                  </code>
                </span>
              )}
            </span>
          </label>
        </div>
      </Section>

      {/* Clips Section */}
      <Section title="Clips">
        <div className="grid gap-item sm:grid-cols-3">
          <NumberField
            label="Min length (s)"
            value={settings.clips.min_duration_s}
            onCommit={(value) => patch({ clips: { ...settings.clips, min_duration_s: value } })}
          />
          <NumberField
            label="Max length (s)"
            value={settings.clips.max_duration_s}
            onCommit={(value) => patch({ clips: { ...settings.clips, max_duration_s: value } })}
          />
          <NumberField
            label="Max clips"
            value={settings.clips.max_clips}
            onCommit={(value) => patch({ clips: { ...settings.clips, max_clips: value } })}
          />
        </div>
      </Section>

      {/* Ingest Section */}
      <Section title="Ingest">
        <div className="grid gap-item sm:grid-cols-2">
          <Select
            label="YouTube cookies from"
            hint="YouTube blocks most anonymous downloads. Sign in in that browser and close it before downloading."
            value={settings.ingest.cookies_from_browser}
            onChange={(value) =>
              patch({ ingest: { ...settings.ingest, cookies_from_browser: value } })
            }
            options={['', 'chrome', 'firefox', 'edge', 'brave', 'chromium', 'safari']}
            labels={{ '': 'None' }}
          />
        </div>
      </Section>

      {/* Export Section */}
      <Section title="Export">
        <div className="grid gap-item sm:grid-cols-2">
          <Select
            label="Default ratio"
            value={settings.export.ratio}
            onChange={(value) => patch({ export: { ...settings.export, ratio: value } })}
            options={['9:16', '1:1', '16:9']}
          />
          <NumberField
            label="Loudness target (LUFS)"
            value={settings.export.loudness_lufs}
            onCommit={(value) => patch({ export: { ...settings.export, loudness_lufs: value } })}
          />
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex items-start gap-3 font-mono text-small text-graphite">
            <button
              type="button"
              role="switch"
              aria-checked={settings.export.prefer_hardware_encoder}
              onClick={() =>
                patch({
                  export: { ...settings.export, prefer_hardware_encoder: !settings.export.prefer_hardware_encoder },
                })
              }
              className="switch"
            >
              <span />
            </button>
            <span>
              Use GPU encoding when available
              {system && !system.nvenc_works && (
                <span className="mt-1 block text-micro text-pencil">
                  Not usable on this machine — exports will use the CPU encoder.
                </span>
              )}
            </span>
          </label>

          <label className="flex items-center gap-3 font-mono text-small text-graphite">
            <button
              type="button"
              role="switch"
              aria-checked={settings.export.write_srt}
              onClick={() =>
                patch({ export: { ...settings.export, write_srt: !settings.export.write_srt } })
              }
              className="switch"
            >
              <span />
            </button>
            Also write an .srt sidecar
          </label>
        </div>
      </Section>

      {/* This Machine Section */}
      {system && (
        <Section title="This machine">
          <dl className="grid gap-x-group gap-y-2.5 text-small sm:grid-cols-2">
            <Row label="Platform" value={system.platform} />
            <Row label="Python" value={system.python_version} />
            <Row
              label="ffmpeg"
              value={system.ffmpeg_version ?? 'not found'}
              badge={system.ffmpeg_version ? 'sure' : 'error'}
              badgeText={system.ffmpeg_version ? 'Found' : 'Not found'}
            />
            <Row label="Acceleration" value={system.accel.toUpperCase()} />
            <Row label="Device" value={system.gpu_name ?? '—'} />
            <Row label="Whisper compute" value={system.compute_type} />
            <Row
              label="GPU encode"
              value=""
              badge={system.nvenc_works ? 'sure' : 'check'}
              badgeText={system.nvenc_works ? 'Available' : 'Unavailable'}
            />
            <Row
              label="Captions"
              value=""
              badge={system.has_libass ? 'sure' : 'error'}
              badgeText={system.has_libass ? 'libass present' : 'libass missing'}
            />
          </dl>
        </Section>
      )}
    </div>
  )
}

function Section({
  title,
  note,
  children,
}: {
  title: string
  note?: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-10 border-t border-hairline-strong pt-6">
      <div className="pb-3">
        <h2 className="text-heading font-semibold text-ink">{title}</h2>
        {note && <p className="mt-1 text-small text-graphite">{note}</p>}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function Row({
  label,
  value,
  badge,
  badgeText,
}: {
  label: string
  value: string
  badge?: 'sure' | 'check' | 'error'
  badgeText?: string
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-hairline pb-2">
      <dt className="text-graphite">{label}</dt>
      <dd className="font-mono text-small tabular text-ink flex items-center gap-2">
        {value && <span>{value}</span>}
        {badge && (
          <span
            className={
              badge === 'sure'
                ? 'badge badge-sure'
                : badge === 'check'
                  ? 'badge badge-check'
                  : 'badge badge-error'
            }
          >
            {badgeText}
          </span>
        )}
      </dd>
    </div>
  )
}

function Field({
  label,
  hint,
  value,
  placeholder,
  onCommit,
}: {
  label: string
  hint?: string
  value: string
  placeholder?: string
  onCommit: (value: string) => void
}) {
  const [draft, setDraft] = useState(value)
  useEffect(() => setDraft(value), [value])

  return (
    <label className="block">
      <span className="label">{label}</span>
      <input
        className="field mt-1"
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => draft !== value && onCommit(draft)}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        spellCheck={false}
      />
      {hint && <span className="mt-1 block text-micro text-pencil">{hint}</span>}
    </label>
  )
}

function NumberField({
  label,
  value,
  onCommit,
}: {
  label: string
  value: number
  onCommit: (value: number) => void
}) {
  const [draft, setDraft] = useState(String(value))
  useEffect(() => setDraft(String(value)), [value])

  return (
    <label className="block">
      <span className="label">{label}</span>
      <input
        type="number"
        className="field tabular mt-1"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          const parsed = Number(draft)
          if (!Number.isNaN(parsed) && parsed !== value) onCommit(parsed)
        }}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      />
    </label>
  )
}

function Select({
  label,
  hint,
  value,
  onChange,
  options,
  labels = {},
}: {
  label: string
  hint?: string
  value: string
  onChange: (value: string) => void
  options: string[]
  labels?: Record<string, string>
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <select
        className="field mt-1 cursor-pointer"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option] ?? option}
          </option>
        ))}
      </select>
      {hint && <span className="mt-1 block text-micro text-pencil">{hint}</span>}
    </label>
  )
}

function SecretField({
  secretKey,
  label,
  present,
  onChanged,
  onError,
}: {
  secretKey: string
  label: string
  present: boolean
  onChanged: () => void
  onError: (error: Error) => void
}) {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)

  const save = async () => {
    if (!value.trim()) return
    setBusy(true)
    try {
      await api.putSecret(secretKey, value.trim())
      setValue('')
      onChanged()
    } catch (err) {
      onError(err as Error)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await api.deleteSecret(secretKey)
      onChanged()
    } catch (err) {
      onError(err as Error)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-item">
      <label className="min-w-56 flex-1">
        <span className="label flex items-center justify-between">
          <span>{label}</span>
          {present && <span className="badge badge-sure">Set</span>}
        </span>
        <input
          type="password"
          className="field mt-1 font-mono"
          value={value}
          placeholder={present ? '••••••••••••' : 'paste to add'}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          autoComplete="off"
        />
      </label>
      <button
        onClick={save}
        disabled={!value.trim() || busy}
        className="btn btn-secondary"
      >
        Save
      </button>
      {present && (
        <button onClick={remove} disabled={busy} className="btn btn-quiet">
          Remove
        </button>
      )}
    </div>
  )
}
