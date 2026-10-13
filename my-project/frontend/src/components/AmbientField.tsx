import { useLocation } from 'react-router-dom'
import { DotField } from './DotField'

/**
 * Literal class names, so Tailwind finds them. Each clears the middle of the
 * page: 1200px for the standard frame, 1600px for the wide Review frame.
 */
const MASK = {
  frame: '[mask-image:linear-gradient(90deg,black,transparent_calc(50%-600px),transparent_calc(50%+600px),black)]',
  wide: '[mask-image:linear-gradient(90deg,black,transparent_calc(50%-800px),transparent_calc(50%+800px),black)]',
} as const

/** Review (`/jobs/:id/clips`) is the one screen that uses the 1600px frame. */
export const isWideFrame = (pathname: string) => pathname.endsWith('/clips')

/**
 * The faint dot field behind every screen except Ingest (which draws its own
 * full-strength field), kept to the side margins so text sits on clear paper.
 */
export function AmbientField() {
  const { pathname } = useLocation()
  if (pathname === '/') return null
  return (
    <DotField
      tone="ink"
      intensity={0.25}
      interactive
      className={`pointer-events-none fixed inset-0 -z-10 ${MASK[isWideFrame(pathname) ? 'wide' : 'frame']}`}
    />
  )
}
