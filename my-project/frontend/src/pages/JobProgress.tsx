import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { api, formatDuration } from '../api'
import { DotField } from '../components/DotField'
import { ErrorNote } from '../components/ErrorNote'
import { FallingCat } from '../components/FallingCat'
import { ProgressTrack, type TrackStage } from '../components/ProgressTrack'
import { JOB_STATUS_LABEL, StatusDot } from '../components/StatusDot'
import { useJobStream } from '../useJobStream'
import { STAGES } from '../stages'

export function JobProgress() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { job, progress } = useJobStream(jobId)
  const [cancelling, setCancelling] = useState(false)
  const [actionError, setActionError] = useState<Error | null>(null)

  useEffect(() => {
    if (job?.status === 'done') {
      // A short hold so the completed state is legible rather than a flash.
      const timer = setTimeout(() => navigate(`/jobs/${job.id}/clips`), 900)
      return () => clearTimeout(timer)
    }
  }, [job?.status, job?.id, navigate])

  if (!job) {
    return <FallingCat className="min-h-[50vh]" />
  }

  const activeIndex = STAGES.findIndex((s) => s.key === job.current_stage)
  const percent = Math.round((progress?.overall ?? job.progress) * 100)

  const cancel = async () => {
    setCancelling(true)
    setActionError(null)
    try {
      await api.cancelJob(job.id)
    } catch (err) {
      setActionError(err as Error)
    } finally {
      setCancelling(false)
    }
  }

  const retry = async () => {
    setActionError(null)
    try {
      await api.retryJob(job.id)
      window.location.reload()
    } catch (err) {
      setActionError(err as Error)
    }
  }

  // Build TrackStage array for ProgressTrack
  const stages: TrackStage[] = STAGES.map((stage, index) => {
    const failedHere =
      (job.status === 'failed' || job.status === 'cancelled') && index === activeIndex

    const state =
      job.status === 'done' || (activeIndex >= 0 && index < activeIndex)
        ? 'done'
        : failedHere
          ? 'stopped'
          : index === activeIndex && job.status === 'running'
            ? 'active'
            : 'pending'

    const fraction =
      state === 'done' ? 1 : state === 'active' ? (progress?.stageProgress ?? 0) : 0

    return {
      key: stage.key,
      label: stage.label,
      state,
      fraction,
    }
  })

  const currentStageInfo = STAGES[activeIndex]
  const stageMessage = progress?.message ?? currentStageInfo?.note ?? 'Processing…'

  return (
    <div className="pt-2 sm:pt-4">
      {/* Header and metadata */}
      <div className="mb-6 space-y-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1 font-mono text-small text-graphite hover:text-ink"
        >
          ← All jobs
        </Link>
        <h1 className="font-dot text-title font-black text-ink text-balance line-clamp-2">
          {job.source?.title || 'Untitled'}
        </h1>
        <div className="flex flex-wrap items-center gap-x-group gap-y-1 font-mono text-small text-graphite tabular">
          <span className="flex items-center gap-1.5 font-medium text-ink">
            <StatusDot status={job.status} />
            {JOB_STATUS_LABEL[job.status]}
          </span>
          {job.source && (
            <>
              <span>{formatDuration(job.source.duration_s)}</span>
              {job.source.width && <span>{job.source.width}×{job.source.height}</span>}
              <span>{job.provider}</span>
            </>
          )}
        </div>
      </div>

      {/* Collecting Panel (high-contrast luxury panel with resolving dot field) */}
      <section className="isolate overflow-hidden rounded-panel border border-white/10 bg-black/60 shadow-[0_18px_48px_-10px_rgba(0,0,0,0.9),0_0_35px_rgba(109,0,26,0.25)] backdrop-blur-xl text-white">
        <div className="relative">
          <DotField
            tone="void"
            interactive
            resolve={percent / 100}
            className="absolute inset-0 -z-10 opacity-70 [mask-image:linear-gradient(black_20%,transparent_50%)] sm:[mask-image:linear-gradient(to_right,transparent_20%,black_75%)]"
          />

          <div className="flex min-h-64 flex-col justify-end gap-group p-group pt-28 sm:flex-row sm:items-end sm:justify-between sm:p-stack">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-dot text-count font-extrabold tabular text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                  {percent}
                </span>
                <span className="font-sans text-heading font-medium text-graphite">% done</span>
              </div>
              <p className="mt-2 font-mono text-small font-medium text-white/90" aria-live="polite">
                {stageMessage}
              </p>
            </div>

            <div className="flex items-center gap-item">
              {(job.status === 'running' || job.status === 'queued') && (
                <button
                  onClick={cancel}
                  disabled={cancelling}
                  className="btn btn-danger"
                >
                  {cancelling ? 'Cancelling…' : 'Cancel'}
                </button>
              )}
              {(job.status === 'failed' || job.status === 'cancelled') && (
                <button onClick={retry} className="btn btn-secondary">
                  Retry
                </button>
              )}
              {job.status === 'done' && (
                <button
                  onClick={() => navigate(`/jobs/${job.id}/clips`)}
                  className="btn btn-primary"
                >
                  Review clips →
                </button>
              )}
            </div>
          </div>

          {/* ProgressTrack footer */}
          <div className="border-t border-white/10 bg-white/[0.02] px-group py-item sm:px-stack">
            <ProgressTrack stages={stages} />
          </div>
        </div>
      </section>

      {/* Errors flat on paper beneath the panel */}
      {job.error && (
        <div className="mt-6 max-w-2xl space-y-2">
          <ErrorNote error={new Error(job.error)} />
          <p className="font-sans text-small text-graphite">
            Retrying resumes from the stage that failed — finished stages are not redone.
          </p>
        </div>
      )}

      {actionError && (
        <div className="mt-6 max-w-2xl">
          <ErrorNote error={actionError} onDismiss={() => setActionError(null)} />
        </div>
      )}
    </div>
  )
}
