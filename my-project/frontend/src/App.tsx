import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { api, type SystemStatus } from './api'
import { MenuItem, NavbarMenu } from './components/velora/navbar-menu'
import { STAGES } from './stages'

const isWideFrame = (pathname: string) => pathname.endsWith('/clips')

export function App() {
  const [system, setSystem] = useState<SystemStatus | null>(null)
  const wide = isWideFrame(useLocation().pathname)
  const frame = wide ? 'max-w-[1600px]' : 'max-w-[1200px]'

  useEffect(() => {
    api.system().then(setSystem).catch(() => setSystem(null))
  }, [])

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-control focus:bg-ink focus:px-3 focus:py-2 focus:text-sheet"
      >
        Skip to content
      </a>
      <header className="fixed left-0 right-0 top-4 z-50 flex items-center justify-center px-4">
        <NavbarMenu className="gap-0">
          <MenuItem label="New" href="/" />
          <MenuItem label="Pipeline">
            <ul className="min-w-[220px] space-y-1 text-sm">
              {STAGES.map((s) => (
                <li key={s.key} className="rounded-lg px-2 py-1">
                  <div className="font-medium">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.note}</div>
                </li>
              ))}
            </ul>
          </MenuItem>
          <MenuItem label="Settings" href="/settings" />
        </NavbarMenu>
        {system && (
          <div className="absolute right-4 hidden md:block">
            <SystemBadge system={system} />
          </div>
        )}
      </header>
      <main id="main" className={`mx-auto ${frame} px-4 pb-stack pt-24 sm:px-6 sm:pb-section sm:pt-28`}>
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
      <span className="tabular text-micro text-muted-foreground">
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
