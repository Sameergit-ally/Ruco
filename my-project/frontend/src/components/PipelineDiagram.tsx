import { createRef, useRef } from 'react'

import { AnimatedBeam } from '@/components/velora/animated-beam'
import { cn } from '@/lib/utils'

export type StepState = 'done' | 'active' | 'pending' | 'stopped'

interface PipelineDiagramProps {
  steps: readonly { key: string; label: string }[]
  states: readonly StepState[]
}

export function PipelineDiagram({ steps, states }: PipelineDiagramProps) {
  const container = useRef<HTMLDivElement>(null)
  const nodes = useRef(steps.map(() => createRef<HTMLDivElement>())).current

  return (
    <div ref={container} className="relative flex items-center justify-between gap-2 py-6">
      {steps.map((step, i) => (
        <div key={step.key} className="z-10 flex flex-col items-center gap-2">
          <div
            ref={nodes[i]}
            className={cn(
              'numeric flex size-12 items-center justify-center rounded-full border bg-card text-xs',
              states[i] === 'done' && 'border-brand/60 text-brand',
              states[i] === 'active' && 'border-brand text-foreground shadow-[0_0_24px_-4px_var(--brand)]',
              states[i] === 'stopped' && 'border-signal-bad text-signal-bad',
            )}
          >
            {String(i + 1).padStart(2, '0')}
          </div>
          <span className="text-xs text-muted-foreground">{step.label}</span>
        </div>
      ))}
      {nodes.slice(0, -1).map((from, i) =>
        states[i] === 'done' || states[i] === 'active' ? (
          <AnimatedBeam
            key={steps[i].key}
            containerRef={container}
            fromRef={from}
            toRef={nodes[i + 1]}
            delay={i * 0.4}
          />
        ) : null,
      )}
    </div>
  )
}
