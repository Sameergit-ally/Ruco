# Vendor patches for Velora components

## D-014 patches (applied)

1. **navbar-menu.tsx** - Use React Router `NavLink` for route links (end-aware). Replaced `<a>` with `<NavLink ref={triggerRef} to={href} end={href === "/"} ...>`.
2. **animated-beam.tsx** - Use CSS variables for brand colors; replace `stopColor` with `style={{ stopColor: ... }}` for SVG compatibility. Defaults: `gradientStartColor = "var(--brand-from)"`, `gradientStopColor = "var(--brand-to)"`.
3. **hero-parallax.tsx** - Support `video?: string` alongside `image?: string`. Render `<video>` when provided with `muted playsInline preload="metadata"` and `#t=0.5` for poster-like frame.
