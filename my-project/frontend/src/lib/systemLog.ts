import type { SystemStatus } from '@/api'

/** Terminal lines from GET /api/system. Only reported fields. */
export function buildSystemLog(system: SystemStatus): string[] {
  return [
    `ffmpeg ${system.ffmpeg_version ?? 'not found'}`,
    `libass ${system.has_libass ? 'present' : 'missing'}`,
    `NVENC ${system.nvenc_works ? 'available' : 'unavailable'}`,
    `accel ${system.accel}${system.gpu_name ? ` · ${system.gpu_name}` : ''}`,
    `compute ${system.compute_type}`,
    `diarization ${system.diarization_available ? 'available' : 'unavailable'}`,
  ]
}
