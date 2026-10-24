/** Stage order and labels, mirroring autoclip.pipeline.Stage. */
export const STAGES = [
  { key: 'prepare', label: 'Prepare', note: 'Extracting audio and thumbnails' },
  { key: 'transcribe', label: 'Transcribe', note: 'Word-level timing' },
  { key: 'highlights', label: 'Highlights', note: 'Choosing the moments worth cutting' },
  { key: 'reframe', label: 'Reframe', note: 'Tracking the speaker into vertical' },
  { key: 'captions', label: 'Captions', note: 'Building subtitle timing' },
  { key: 'export', label: 'Export', note: 'Rendering clips' },
] as const

export type StageKey = (typeof STAGES)[number]['key']
