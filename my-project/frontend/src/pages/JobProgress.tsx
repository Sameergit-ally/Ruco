import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { api, formatDuration } from '../api'
import { ErrorNote } from '../components/ErrorNote'
import { PipelineDiagram, type StepState } from '../components/PipelineDiagram'
import { JOB_STATUS_LABEL, StatusDot } from '../components/StatusDot'
import { DotsLoader, SpinnerLoader } from '../components/velora/loaders'
import { Terminal } from '../components/velora/terminal'
import { buildStageLog } from '../lib/stageLog'
import { STAGES } from '../stages'
import { useJobStream } from '../useJobStream'

export function JobProgress() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { job, progress } = useJobStream(jobId)
  const [cancelling, setCancelling] = useState(false)
  const [actionError, setActionError] = useState<Error | null>(null)

  useEffect(() => {
    if (job?.status === 'done') {
      const timer = setTimeout(() => navigate(`/jobs/${job.id}/clips`), 900)
      return () => clearTimeout(timer)
    }
  }, [job?.status, job?.id, navigate])

  const activeIndex = job ? STAGES.findIndex((s) => s.key === job.current_stage) : -1
  const logLines = useMemo(
    () => (job ? buildStageLog(STAGES, job) : []),
    [job?.status, job?.current_stage, job?.error],
  )

  if (!job) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <SpinnerLoader size="lg" className="text-brand" label="Loading job" />
      </div>
    )
  }

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

  const states: StepState[] = STAGES.map((_, index) => {
    const failedHere =
      (job.status === 'failed' || job.status === 'cancelled') && index === activeIndex
    if (job.status === 'done' || (activeIndex >= 0 && index < activeIndex)) return 'done'
    if (failedHere) return 'stopped'
    if (index === activeIndex && job.status === 'running') return 'active'
    return 'pending'
  })

  const currentStageInfo = STAGES[activeIndex]
  const stageMessage = progress?.message ?? currentStageInfo?.note ?? 'Processing…'

  return (
    <div className="pt-2 sm:pt-4">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <p className="text-micro uppercase tracking-wider text-muted-foreground">
            {JOB_STATUS_LABEL[job.status]}
          </p>
          <h1 className="font-display text-title font-bold tracking-tight text-foreground text-balance line-clamp-2">
            {job.source?.title || 'Untitled'}
          </h1>
          <div className="flex flex-wrap items-center gap-x-group gap-y-1 text-small text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <StatusDot status={job.status} />
              {JOB_STATUS_LABEL[job.status]}
            </span>
            {job.source && (
              <>
                <span className="numeric">{formatDuration(job.source.duration_s)}</span>
                {job.source.width && (
                  <span className="numeric">
                    {job.source.width}×{job.source.height}
                  </span>
                )}
                <span>{job.provider}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-item">
          <span className="numeric text-title font-medium text-foreground">{percent}%</span>
          {(job.status === 'running' || job.status === 'queued') && (
            <button onClick={cancel} disabled={cancelling} className="btn btn-danger">
              {cancelling ? 'Cancelling…' : 'Cancel'}
            </button>
          )}
          {(job.status === 'failed' || job.status === 'cancelled') && (
            <button onClick={retry} className="btn btn-secondary">
              Retry
            </button>
          )}
          {job.status === 'done' && (
            <button onClick={() => navigate(`/jobs/${job.id}/clips`)} className="btn btn-primary">
              Review clips →
            </button>
          )}
        </div>
      </div>

      <Link to="/" className="mb-6 inline-flex text-small text-muted-foreground hover:text-foreground">
        ← All jobs
      </Link>

      <PipelineDiagram steps={STAGES} states={states} />

      <Terminal
        className="mt-6"
        title="pipeline"
        lines={logLines.length ? logLines : ['Queued']}
      />

      <ul className="mt-8 space-y-3">
        {STAGES.map((stage, index) => {
          const state = states[index]
          const fraction =
            state === 'done' ? 1 : state === 'active' ? (progress?.stageProgress ?? 0) : 0
          return (
            <li key={stage.key} className="flex items-center gap-3">
              <span className="numeric w-8 text-micro text-muted-foreground">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-small font-medium text-foreground">{stage.label}</span>
                  {state === 'active' && (
                    <DotsLoader size="sm" className="text-brand" label={stage.label} />
                  )}
                </div>
                <div className="mt-1 h-px bg-border">
                  <div
                    className="h-px bg-brand"
                    style={{ width: `${Math.round(fraction * 100)}%` }}
                  />
                </div>
                {state === 'active' && (
                  <p className="mt-1 text-micro text-muted-foreground" aria-live="polite">
                    {stageMessage}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {job.error && (
        <div className="mt-6 max-w-2xl space-y-2">
          <ErrorNote error={new Error(job.error)} />
          <p className="text-small text-muted-foreground">
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
