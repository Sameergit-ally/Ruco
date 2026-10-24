import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import {
  api,
  formatBytes,
  formatDuration,
  type CaptionStyle,
  type Clip,
  type CropPath,
  type Job,
  type Word,
} from '../api'
import { CaptionEditor } from '../components/CaptionEditor'
import { ClipPlayer } from '../components/ClipPlayer'
import { ErrorNote } from '../components/ErrorNote'
import { TrimBar } from '../components/TrimBar'
import { BlurFade } from '../components/velora/blur-fade'
import { FlickeringGrid } from '../components/velora/flickering-grid'
import { SpinnerLoader } from '../components/velora/loaders'

const RATIOS = ['9:16', '1:1', '16:9'] as const

export function Review() {
  const { jobId } = useParams()
  const [job, setJob] = useState<Job | null>(null)
  const [clips, setClips] = useState<Clip[]>([])
  const [styles, setStyles] = useState<CaptionStyle[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [words, setWords] = useState<Word[]>([])
  const [cropPath, setCropPath] = useState<CropPath | null>(null)
  const [wordsDirty, setWordsDirty] = useState(false)
  const [savingWords, setSavingWords] = useState(false)
  const [exporting, setExporting] = useState<Set<string>>(new Set())
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!jobId) return
    void Promise.all([api.getJob(jobId), api.listClips(jobId), api.captionStyles()])
      .then(([loadedJob, loadedClips, loadedStyles]) => {
        setJob(loadedJob)
        setClips(loadedClips)
        setStyles(loadedStyles)
        setSelectedId((current) => current ?? loadedClips[0]?.id ?? null)
      })
      .catch((err) => setError(err as Error))
  }, [jobId])

  const selected = useMemo(
    () => clips.find((clip) => clip.id === selectedId) ?? null,
    [clips, selectedId],
  )

  useEffect(() => {
    if (!selected) return
    setWordsDirty(false)
    api
      .getClipWords(selected.id)
      .then(setWords)
      .catch(() => setWords([]))
    api
      .getCropPath(selected.id)
      .then(setCropPath)
      .catch(() => setCropPath(null))
  }, [selected?.id])

  const patchClip = useCallback((updated: Clip) => {
    setClips((current) => current.map((clip) => (clip.id === updated.id ? updated : clip)))
  }, [])

  const setStatus = async (clip: Clip, status: Clip['status']) => {
    try {
      patchClip(await api.patchClip(clip.id, { status }))
    } catch (err) {
      setError(err as Error)
    }
  }

  const commitTrim = async (start: number, end: number) => {
    if (!selected) return
    try {
      patchClip(await api.patchClip(selected.id, { start_s: start, end_s: end }))
      setWords(await api.getClipWords(selected.id))
    } catch (err) {
      setError(err as Error)
    }
  }

  const saveWords = async () => {
    if (!selected) return
    setSavingWords(true)
    try {
      patchClip(await api.patchCaptions(selected.id, { words }))
      setWordsDirty(false)
    } catch (err) {
      setError(err as Error)
    } finally {
      setSavingWords(false)
    }
  }

  const setStyle = async (clip: Clip, styleKey: string) => {
    try {
      patchClip(await api.patchCaptions(clip.id, { caption_style: styleKey }))
    } catch (err) {
      setError(err as Error)
    }
  }

  const setRatio = async (clip: Clip, ratio: string) => {
    try {
      patchClip(await api.patchCaptions(clip.id, { ratio }))
    } catch (err) {
      setError(err as Error)
    }
  }

  const exportClip = async (clip: Clip) => {
    setExporting((current) => new Set(current).add(clip.id))
    setError(null)
    try {
      await api.exportClip(clip.id, clip.ratio, clip.caption_style)
      patchClip(await api.getClip(clip.id))
    } catch (err) {
      setError(err as Error)
    } finally {
      setExporting((current) => {
        const next = new Set(current)
        next.delete(clip.id)
        return next
      })
    }
  }

  const exportKept = async () => {
    const targets = clips.filter((clip) => clip.status === 'kept')
    for (const clip of targets) await exportClip(clip)
  }

  const keptCount = clips.filter((clip) => clip.status === 'kept').length
  const activeStyle = styles.find((style) => style.key === selected?.caption_style)

  if (error && clips.length === 0) {
    return (
      <div className="max-w-2xl pt-16">
        <ErrorNote error={error} />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <SpinnerLoader size="lg" className="text-brand" label="Loading clips" />
      </div>
    )
  }

  return (
    <div className="pt-2 sm:pt-4">
      {/* Masthead */}
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-hairline pb-4">
        <div className="min-w-0">
          <Link
            to="/"
            className="inline-flex items-center gap-1 font-mono text-small text-graphite hover:text-ink"
          >
            ← All jobs
          </Link>
          <h1 className="mt-1 font-display text-title font-bold tracking-tight text-foreground text-balance line-clamp-2">
            {job.source?.title || 'Untitled'}
          </h1>
        </div>

        <div className="flex items-center gap-group font-mono text-small">
          <span className="tabular text-graphite">
            {clips.length} clips · {keptCount} kept
          </span>
          <button
            onClick={exportKept}
            disabled={keptCount === 0}
            className="btn btn-primary"
          >
            {clips.some((c) => exporting.has(c.id) && c.status === 'kept') ? (
              <span className="flex items-center gap-2">
                <SpinnerLoader size="sm" className="text-current" label="Exporting" />
                Exporting…
              </span>
            ) : (
              'Export kept'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 max-w-2xl">
          <ErrorNote error={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {clips.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-6 grid gap-x-8 gap-y-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,26rem)_minmax(0,1fr)]">
          {/* Column 1: Ranked List */}
          <section className="overflow-hidden rounded-control border border-hairline bg-sheet lg:max-h-[80vh] lg:overflow-y-auto">
            <div
              aria-hidden
              className="data-head flex items-center justify-between px-group py-2.5"
            >
              <span>Ranked</span>
              <span title="Engagement score: a ranking by hook, emotion and completeness, not a prediction.">
                Score
              </span>
            </div>

            <ul className="divide-y divide-hairline">
              {clips.map((clip, index) => (
                <li key={clip.id}>
                  <BlurFade delay={Math.min(index * 0.08, 0.5)}>
                  <ClipRow
                    clip={clip}
                    index={index}
                    selected={clip.id === selectedId}
                    onSelect={() => setSelectedId(clip.id)}
                    onKeep={() =>
                      setStatus(clip, clip.status === 'kept' ? 'candidate' : 'kept')
                    }
                    onDiscard={() =>
                      setStatus(clip, clip.status === 'discarded' ? 'candidate' : 'discarded')
                    }
                  />
                  </BlurFade>
                </li>
              ))}
            </ul>
          </section>

          {/* Column 2: Player & Trim */}
          <section className="space-y-6">
            {selected && jobId && (
              <>
                <ClipPlayer
                  src={api.mediaUrl(jobId)}
                  startS={selected.start_s}
                  endS={selected.end_s}
                  words={words}
                  style={activeStyle}
                  ratio={selected.ratio}
                  cropPath={cropPath}
                />
                <TrimBar
                  words={words}
                  startS={selected.start_s}
                  endS={selected.end_s}
                  originalStart={selected.start_s}
                  originalEnd={selected.end_s}
                  onCommit={commitTrim}
                />
              </>
            )}
          </section>

          {/* Column 3: Edit & Export */}
          <section className="space-y-8">
            {selected && (
              <>
                {/* Rationale & Hook Quote */}
                <div>
                  <span className="label">Why this clip</span>
                  <p className="mt-1.5 max-w-prose font-sans text-body text-graphite">
                    {selected.reason || 'No rationale returned for this clip.'}
                  </p>
                  {selected.hook && (
                    <blockquote className="quote mt-2.5">
                      <span className="mark">“{selected.hook}”</span>
                    </blockquote>
                  )}
                </div>

                {/* Transcript Caption Editor */}
                <CaptionEditor
                  words={words}
                  onChange={(next) => {
                    setWords(next)
                    setWordsDirty(true)
                  }}
                  onSave={saveWords}
                  saving={savingWords}
                  dirty={wordsDirty}
                />

                {/* Caption Style Tiles */}
                <div>
                  <span className="label block pb-1.5">Caption style</span>
                  <div className="grid gap-tight sm:grid-cols-2">
                    {styles.map((s) => {
                      const checked = s.key === selected.caption_style
                      return (
                        <label key={s.key} className="tile">
                          <input
                            type="radio"
                            name="caption_style"
                            checked={checked}
                            onChange={() => setStyle(selected, s.key)}
                            className="sr-only"
                          />
                          <div className="flex w-full items-center justify-between gap-1">
                            <span className="font-mono text-small font-semibold">
                              {s.label}
                            </span>
                            {/* Color swatches */}
                            <span className="flex items-center gap-1">
                              <span
                                className="size-2.5 rounded-[1px] border border-sheet ring-1 ring-ink"
                                style={{ backgroundColor: s.preview.primary }}
                              />
                              {s.preview.accent && (
                                <span
                                  className="size-2.5 rounded-[1px] border border-sheet ring-1 ring-ink"
                                  style={{ backgroundColor: s.preview.accent }}
                                />
                              )}
                            </span>
                          </div>
                          <span className="text-micro text-graphite leading-snug">
                            {s.description}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Aspect Ratio Segments */}
                <div>
                  <span className="label block pb-1.5">Aspect ratio</span>
                  <div
                    role="group"
                    aria-label="Aspect ratio"
                    className="segments inline-flex"
                  >
                    {RATIOS.map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        aria-pressed={ratio === selected.ratio}
                        onClick={() => setRatio(selected, ratio)}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Export this clip */}
                <div className="border-t border-hairline pt-4">
                  <button
                    onClick={() => exportClip(selected)}
                    disabled={exporting.has(selected.id)}
                    className="btn btn-secondary w-full"
                  >
                    {exporting.has(selected.id) ? (
                      <span className="flex items-center gap-2">
                        <SpinnerLoader size="sm" className="text-current" label="Rendering" />
                        Rendering…
                      </span>
                    ) : (
                      'Export this clip'
                    )}
                  </button>

                  {selected.exports.length > 0 && (
                    <ul className="mt-3 divide-y divide-hairline rounded-control border border-hairline bg-sheet">
                      {selected.exports.map((record) => (
                        <li
                          key={record.id}
                          className="flex items-baseline justify-between gap-3 px-item py-2 font-mono text-small"
                        >
                          <a
                            href={record.download_url}
                            download
                            className="truncate text-ink underline underline-offset-4 hover:decoration-2"
                          >
                            {record.ratio} · {record.style}
                          </a>
                          <span className="tabular text-pencil text-micro shrink-0">
                            {formatBytes(record.size_bytes)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

function ClipRow({
  clip,
  index: _index,
  selected,
  onSelect,
  onKeep,
  onDiscard,
}: {
  clip: Clip
  index: number
  selected: boolean
  onSelect: () => void
  onKeep: () => void
  onDiscard: () => void
}) {
  return (
    <div
      className={[
        'group grid cursor-pointer grid-cols-[2.5rem_1fr] items-center gap-x-3 px-group py-3 transition-colors duration-fast',
        selected
          ? 'bg-canvas shadow-[inset_2px_0_0_var(--color-ink)]'
          : 'hover:bg-canvas/70',
        clip.status === 'discarded' ? 'opacity-40' : '',
      ].join(' ')}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSelect()
      }}
    >
      {/* Score */}
      <span className="self-start font-mono text-heading font-medium tabular">
        {clip.score >= 85 ? (
          <span className="mark">{clip.score}</span>
        ) : (
          <span className="text-graphite">{clip.score}</span>
        )}
      </span>

      <div className="min-w-0">
        <p className="truncate text-small font-medium text-ink">
          {clip.title || 'Untitled clip'}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-micro text-pencil tabular">
          <span>{formatDuration(clip.duration_s)}</span>
          {clip.user_trimmed && <span>trimmed</span>}
          {clip.status === 'kept' && <span className="badge badge-chosen">Kept</span>}
          {clip.status === 'exported' && <span className="badge badge-sure">Exported</span>}

          {/* Actions */}
          <span
            className={[
              'ml-auto flex items-center gap-2 transition-opacity duration-fast',
              selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100',
            ].join(' ')}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                onKeep()
              }}
              className="text-graphite hover:text-ink"
            >
              {clip.status === 'kept' ? 'Drop' : 'Keep'}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDiscard()
              }}
              className="text-pencil hover:text-brick"
            >
              {clip.status === 'discarded' ? 'Undo' : 'Discard'}
            </button>
          </span>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="relative max-w-xl space-y-item overflow-hidden py-section">
      <FlickeringGrid
        squareSize={8}
        gap={16}
        columns={20}
        rows={8}
        className="text-brand/10 [mask-image:radial-gradient(black,transparent)]"
      />
      <h2 className="relative text-title font-semibold text-ink">No clips came back.</h2>
      <p className="relative text-body text-graphite leading-relaxed">
        The model found nothing self-contained enough to stand alone — which is a real
        answer for some source material, not necessarily a failure.
      </p>
      <p className="relative text-body text-graphite leading-relaxed">
        If you expected clips, try a larger provider model, or widen the length range so
        shorter moments qualify.
      </p>
    </div>
  )
}
