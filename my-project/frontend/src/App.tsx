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
      <header className="sticky top-0 z-40 border-b border-white/8 bg-black/70 backdrop-blur-xl transition-all">
        <nav aria-label="Main" className={`mx-auto flex h-15 ${frame} items-center gap-group px-4 sm:px-6`}>
          <Logo />
          <div className="ml-auto flex items-center gap-group font-mono text-small">
            {system && <SystemBadge system={system} />}
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                isActive
                  ? 'text-white font-medium bg-white/8 px-2.5 py-1 rounded-control'
                  : 'text-graphite hover:text-white px-2.5 py-1 transition-colors'
              }
            >
              Settings
            </NavLink>
            <NavLink to="/" end className="btn btn-primary btn-sm">
              + New Clip
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
