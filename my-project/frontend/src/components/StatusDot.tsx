import type { JobStatus } from '../api'

/** Words always travel with the dot: colour is never the only signal. */
export const JOB_STATUS_LABEL: Record<JobStatus, string> = {
  queued: 'Queued',
  running: 'Running',
  done: 'Done',
  failed: 'Failed',
  cancelled: 'Cancelled',
}

const DOT: Record<JobStatus, string> = {
  queued: 'bg-pencil',
  running: 'bg-ink animate-pulse',
  done: 'bg-stamp',
  failed: 'bg-brick',
  cancelled: 'bg-pencil',
}

/** A square, like one cell of the dot matrix. */
export function StatusDot({ status }: { status: JobStatus }) {
  return <span aria-hidden className={`inline-block size-2 shrink-0 ${DOT[status]}`} />
}
