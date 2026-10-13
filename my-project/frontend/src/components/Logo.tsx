import { Link } from 'react-router-dom'

export function Logo() {
  return (
    <Link
      to="/"
      aria-label="Ruco home"
      className="group inline-flex items-center gap-2.5 font-mono text-small font-semibold tracking-tight text-ink transition-colors"
    >
      <span
        aria-hidden
        className="grid size-5 grid-cols-3 gap-0.5 p-0.5 rounded-[3px] border border-ink bg-sheet transition-transform duration-200 group-hover:scale-105"
      >
        <span className="size-1 rounded-[0.5px] bg-highlighter" />
        <span className="size-1 rounded-[0.5px] bg-ink" />
        <span className="size-1 rounded-[0.5px] bg-ink" />
        <span className="size-1 rounded-[0.5px] bg-ink" />
        <span className="size-1 rounded-[0.5px] bg-highlighter" />
        <span className="size-1 rounded-[0.5px] bg-ink" />
        <span className="size-1 rounded-[0.5px] bg-ink" />
        <span className="size-1 rounded-[0.5px] bg-ink" />
        <span className="size-1 rounded-[0.5px] bg-highlighter" />
      </span>
      <span className="font-dot text-heading font-black tracking-normal text-ink">ruco</span>
    </Link>
  )
}
