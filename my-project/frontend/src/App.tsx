import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

import { api, type SystemStatus } from './api'
import { AmbientField, isWideFrame } from './components/AmbientField'
import { Logo } from './components/Logo'

export function App() {
  const [system, setSystem] = useState<SystemStatus | null>(null)
  const wide = isWideFrame(useLocation().pathname)
  // Literal strings so Tailwind finds both.
  const frame = wide ? 'max-w-[1600px]' : 'max-w-[1200px]'

  useEffect(() => {
    api.system().then(setSystem).catch(() => setSystem(null))
  }, [])

  return (
    <>
      <AmbientField />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-control focus:bg-ink focus:px-3 focus:py-2 focus:text-sheet"
      >
        Skip to content
      </a>
      <header className="border-b border-hairline bg-canvas">
        <nav aria-label="Main" className={`mx-auto flex h-14 ${frame} items-center gap-group px-4 sm:px-6`}>
          <Logo />
          <div className="ml-auto flex items-center gap-group font-mono text-small">
            {system && <SystemBadge system={system} />}
            <NavLink
              to="/settings"
              className={({ isActive }) => (isActive ? 'text-ink font-semibold' : 'text-graphite hover:text-ink')}
            >
              Settings
            </NavLink>
            <NavLink to="/" end className="btn btn-secondary btn-sm">
              New clip
            </NavLink>
          </div>
        </nav>
      </header>
      {/* No background on main: the dot field sits behind it at z -10. */}
      <main id="main" className={`mx-auto ${frame} px-4 py-stack sm:px-6 sm:py-section`}>
        <Outlet />
      </main>
    </>
  )
}

/** Words, not colour alone. Hidden on small screens. */
function SystemBadge({ system }: { system: SystemStatus }) {
  const accel = system.accel.toUpperCase()
  return (
    <div className="hidden items-center gap-item md:flex">
      <span className="tabular text-micro text-pencil">
        {accel}
        {system.gpu_name && accel === 'CUDA' && ` · ${system.gpu_name.replace('NVIDIA GeForce ', '')}`}
      </span>
      <span
        className={system.ready ? 'badge badge-sure' : 'badge badge-error'}
        title={system.ready ? 'All required components present' : 'Run autoclip doctor'}
      >
        {system.ready ? 'Ready' : 'Not ready'}
      </span>
    </div>
  )
}
