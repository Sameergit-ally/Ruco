export function FallingCat({ className = '' }: { className?: string }) {
  return (
    <div className={`grid place-items-center ${className}`}>
      <div className="relative flex flex-col items-center gap-3">
        {/* Animated wind streaks rising */}
        <div className="pointer-events-none absolute -inset-6 flex justify-around opacity-40">
          <span className="h-8 w-0.5 animate-streak rounded-full bg-ink" style={{ animationDelay: '0s' }} />
          <span className="h-12 w-0.5 animate-streak rounded-full bg-ink" style={{ animationDelay: '0.4s' }} />
          <span className="h-6 w-0.5 animate-streak rounded-full bg-ink" style={{ animationDelay: '0.8s' }} />
        </div>

        {/* Pixel Cat SVG swaying in place */}
        <div className="animate-cat-fall">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-ink"
          >
            {/* Retro pixel art cat */}
            <path
              d="M7 4h2v2H7V4zm8 0h2v2h-2V4zM6 6h2v2H6V6zm10 0h2v2h-2V6zM5 8h14v6H5V8zm2 2h2v2H7v-2zm8 0h2v2h-2v-2zm-9 6h12v4H6v-4zm-2 2h2v2H4v-2zm14 0h2v2h-2v-2z"
              fill="currentColor"
            />
            {/* Burgundy collar / accent */}
            <rect x="7" y="14" width="10" height="2" fill="var(--color-highlighter)" />
          </svg>
        </div>

        <p className="font-mono text-micro text-pencil">Loading…</p>
      </div>
    </div>
  )
}
