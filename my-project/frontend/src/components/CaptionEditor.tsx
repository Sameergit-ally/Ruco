import { useEffect, useState } from 'react'

import { formatTimecode, type Word } from '../api'

/**
 * Word-level caption editing.
 *
 * Sits inside a quote box on sheet, with hairline rules and highlighter-wash word hovers.
 */
export function CaptionEditor({
  words,
  onChange,
  onSave,
  saving,
  dirty,
}: {
  words: Word[]
  onChange: (words: Word[]) => void
  onSave: () => void
  saving: boolean
  dirty: boolean
}) {
  const [editing, setEditing] = useState<number | null>(null)
  const [draft, setDraft] = useState('')

  useEffect(() => setEditing(null), [words.length])

  const commit = (index: number) => {
    const text = draft.trim()
    if (text && text !== words[index].text) {
      const next = words.map((word, i) => (i === index ? { ...word, text } : word))
      onChange(next)
    }
    setEditing(null)
  }

  if (words.length === 0) {
    return (
      <p className="font-mono text-small text-pencil">
        No transcript for this clip yet.
      </p>
    )
  }

  return (
    <div>
      <div className="flex items-baseline justify-between pb-2">
        <span className="label">Transcript</span>
        <span className="font-mono text-micro tabular text-pencil">{words.length} words</span>
      </div>

      {/* Words flow inside a quote container */}
      <div className="quote max-h-[38vh] overflow-y-auto pr-1">
        {words.map((word, index) =>
          editing === index ? (
            <input
              key={index}
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => commit(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit(index)
                if (e.key === 'Escape') setEditing(null)
                if (e.key === 'Tab') {
                  e.preventDefault()
                  commit(index)
                  const next = index + (e.shiftKey ? -1 : 1)
                  if (next >= 0 && next < words.length) {
                    setDraft(words[next].text)
                    setEditing(next)
                  }
                }
              }}
              className="mr-1 w-[8ch] border-b-2 border-ink bg-transparent font-mono text-small text-ink outline-none"
              style={{ width: `${Math.max(4, draft.length + 1)}ch` }}
            />
          ) : (
            <button
              key={index}
              onClick={() => {
                setDraft(word.text)
                setEditing(index)
              }}
              title={formatTimecode(word.start)}
              className="mr-1 rounded-[2px] px-0.5 text-graphite transition-colors duration-fast hover:bg-highlighter-wash hover:text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
            >
              {word.text}
            </button>
          ),
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={onSave}
          disabled={!dirty || saving}
          className="btn btn-secondary btn-sm"
        >
          {saving ? 'Saving…' : 'Save edits'}
        </button>
        {dirty ? (
          <span className="badge badge-check">Unsaved changes</span>
        ) : (
          <span className="font-mono text-micro text-pencil">
            Click any word to correct it
          </span>
        )}
      </div>
    </div>
  )
}
