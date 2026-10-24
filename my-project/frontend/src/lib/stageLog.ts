import type { Job } from '@/api'

interface Stage { key: string; label: string; note: string }

/** Terminal lines for a job. Only facts the API reported, nothing invented. */
export function buildStageLog(stages: readonly Stage[], job: Job): string[] {
  const active = stages.findIndex((s) => s.key === job.current_stage)
  const lines: string[] = []
  stages.forEach((stage, i) => {
    const finished = job.status === 'done' || (active >= 0 && i < active)
    if (finished) lines.push(`✔ ${stage.label}`)
    else if (i === active && job.status === 'running') lines.push(`… ${stage.label}: ${stage.note}`)
    else if (i === active) lines.push(`✕ ${stage.label}: ${job.error ?? job.status}`)
  })
  return lines
}
