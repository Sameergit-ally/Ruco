# Ruco × Resolve: frontend design spec

**Status:** Proposed  ·  **Date:** 2026-10-13  ·  **Applies to:** `my-project/frontend` (Vite + React 18 + Tailwind v4)

**Goal.** Give Ruco's existing frontend the visual system of Ruvo ("Resolve"), re-designed around Ruco's own screens: ingest, job progress, clip review and settings. Ruvo is a reference for *look and feel only*. None of Ruvo's product features (plans, receipts, datasets, cost estimates) are ported.

**Palette.** Colour is the *CAESAR* palette: Black `#000000`, Burgundy `#6D001A`, White `#FFFFFF`. It replaces Ruvo's grey and orange. Burgundy takes the job orange had (the signal), with one flip: it carries **white** text, not black (black on burgundy is 1.7:1, see 5.1).

---

## 0. How to read this

Claims are labelled the way Ruco's `agent.md` asks:

| Label | Meaning |
|---|---|
| **Verified** | Read in the code of one of the two repos, or ran it and saw the result. |
| **Mapping** | My design decision translating a Ruvo element to a Ruco feature. Change it freely. |
| **Unverified** | Not tested. Needs your eyes or a real run. |

**What I actually ran** (details in section 13): a scratch copy of `frontend/` with the new `index.css` and ported components. `tsc -b` (strict, React 18 types) passes, `vite build` succeeds, the compiled CSS contains every custom class and token used below, and the font files bundle into `assets/`. The documented `App.tsx` also compiles. I could **not** render it in a browser here, so all visual judgements are Unverified until you look at it.

**Palette update (burgundy).** The runs above were done with the original orange palette. After the swap I recomputed every contrast ratio and re-compiled `index.css` on its own with the Tailwind v4 CLI (section 13). I did not re-run the full Vite build or the `tsc` check.

---

## 1. Summary

| | Today (Ruco) | After |
|---|---|---|
| Mood | Dark "darkroom": warm charcoal, sodium orange, serif display | Light "Resolve": soft white paper, true black ink, dot-matrix display, one burgundy signal |
| Display face | Instrument Serif | **Doto** (dot-matrix, weights 800/900) |
| Body face | Archivo | **Geist** |
| Control / data face | Archivo | **Geist Mono** (buttons, labels, nav, timecode, transcript) |
| Accent | Orange: text colour, buttons, borders, fills | **Burgundy, background only**, behind white text, and only for *found / chosen / progress* |
| Imagery | None | A WebGL **dot field** that settles into scanlines as a job progresses |
| Loading | The word "Loading…" | A small pixel **falling cat** |
| New npm dependencies | , | **None** |
| Font weight on disk | about 800 KB (Archivo + Instrument Serif) | about 58 KB (three variable fonts) |

Four screens are restyled (Ingest, JobProgress, Review, Settings). **No landing page is added**: Ruco is a local tool and `project.md` lists hosting as a non-goal, so Ingest is the home screen and takes the "hero" treatment.

---

## 2. The two codebases (Verified)

| | Ruvo (reference) | Ruco (target) |
|---|---|---|
| Framework | Next.js 16.3.6, App Router | Vite 6 SPA + React Router 6.28, served by FastAPI |
| React / types | 19.2.8 | 18.3.1 / `@types/react` ^18.3.12 |
| Tailwind | v4 via `@tailwindcss/postcss` | v4 via `@tailwindcss/vite` |
| UI primitives | `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `sonner` | None. Plain elements and CSS classes |
| Fonts | `next/font/google` | Bundled files only. Nothing fetched at runtime |
| Import alias | `@/` | None |
| Page frame | 1200px | 1600px |
| Theme | Light | Dark (`<html class="dark">`) |

Both use Tailwind v4's `@theme`, so Ruvo's token block ports almost verbatim. Three Next-specific things must be translated:

| Ruvo uses | In Ruco |
|---|---|
| `next/font/google` and CSS variables `--font-doto` etc. | `@font-face` from files in `src/fonts/`, tokens point at the family names |
| `next/link` (`href`), `usePathname` | `react-router-dom` `Link` (`to`) / `NavLink`, `useLocation` |
| `cn()` (clsx + tailwind-merge), `cva` | Plain template strings and named CSS classes |

---

## 3. The Resolve principles, applied to Ruco

| Ruvo principle | What it means in Ruco |
|---|---|
| **1. Noise resolves into rows.** | A long video is noise; clips are rows. The dot field runs at full strength on **Ingest** and inside the **job-progress panel**, where its `resolve` value follows the job's overall progress, so the cloud visibly settles into scanlines. Elsewhere it is a faint ambient layer in the side margins only. |
| **2. Signal means found.** | Burgundy marks: the chosen caption style / provider, the selected trim window, kept clips, progress fills, the hook quote, top-scoring clips. Never text, never decoration. |
| **3. Quiet around the loud part.** | Content is flat `sheet` with 1px hairlines. Only things that float are frosted: the URL composer and the play overlay. No shadows on static content, no cards inside cards. |
| **4. Plain words first.** | Ruco's copy is already plain. Keep the `ApiError` hint pattern ("what happened, what to do"). System detail stays in Settings → This machine. |
| **5. Money and time are visible.** | Ruco costs nothing in dollars, so the equivalent is saying **what leaves the machine** next to **Start** (see Ingest). |

---

## 4. Decisions you need to make

| # | Question | My default | Why |
|---|---|---|---|
| 1 | **Product name in the UI.** It says "AutoClip" in `index.html` and the header, but your project folder and docs say Ruco. | Wordmark `ruco`. | The ported `Logo` has the name in one place. The CLI, package name (`autoclip`) and MIT attribution to AutoClip (decision D-002) stay as they are. |
| 2 | **Review page width.** Ruvo's frame is 1200px; Review is a 3-column editor. | Keep 1600px for Review only. | At 1200px the third column shrinks to roughly 340px. Everything else uses 1200. |
| 3 | **Which button is primary on Review.** Ruvo allows one primary per view; Review has *Export kept* and *Export this clip*. | *Export kept* (header) is primary, *Export this clip* is secondary. | Batch export is the finish line. Swap them if you work clip by clip. |
| 4 | **Record it.** `rules.md` rule 22 and 27 want a `decision.md` entry for new assets. | Add D-009 (draft in Appendix B). | No npm dependency is added, but three font files are. |
| 5 | **Anton in the caption preview** (optional, not part of Resolve). | Bundle it. | See Appendix A: the preview asks for Anton but the frontend never loads it. |

---

## 5. Design tokens

### 5.1 Colour (CAESAR palette: black, burgundy, white)

| Token | Hex | Role | Where in Ruco |
|---|---|---|---|
| `canvas` | `#F3F1F1` | Page paper: white, faintly warmed toward burgundy | Page background, header |
| `sheet` | `#FFFFFF` | **White.** Flat surfaces; frosted panels use it at 72% | Clip list, inputs, tiles, quotes, tables |
| `ink` | `#000000` | **Black.** Text, primary buttons, focus outline, dots | All primary text |
| `graphite` | `#3F3A3B` | Secondary text | Paragraphs, secondary labels |
| `pencil` | `#6A6465` | Placeholders, hints, inactive labels | Hints, units, inactive text |
| `hairline` | `#DDD8D9` | Rules | Dividers, row separators |
| `hairline-strong` | `#BDB6B8` | Control outlines | Input and tile borders |
| `void` | `#000000` | Dark panel the dot field sits on | Job-progress panel, video stage |
| `highlighter` | `#6D001A` | **Burgundy. The signal**: found, proven, chosen | Always a background behind **white** text |
| `highlighter-wash` | `#F2DDE2` | Focus halo, new-row flash | Trim window, word hover, drag-over |
| `highlighter-bright` | `#E5476A` | Burgundy lifted for **black panels only** | Progress bars and dot-field accent on `void`. Never on paper, never behind text |
| `stamp` / `-wash` | `#1D7248` / `#DDEFE4` | Sure / done | *Done*, *Ready*, *Exported*, *Set* |
| `amber` / `-wash` | `#8F5400` / `#F8EBD4` | Check this / warning | Notices, *Muted*, GPU-encode unavailable |
| `brick` / `-wash` | `#AE2116` / `#F9E2DF` | Error / stopping | Failures, *Cancel*, *Missing* |

**About this palette (Mapping, my decisions):**

- The reference gives three colours. The greys are tints of them, warmed slightly toward burgundy so they sit with it. `highlighter-wash` and `highlighter-bright` are lighter burgundy, not new hues.
- **Burgundy flips the text colour.** Black on burgundy is 1.7:1 (fails); white on burgundy is 12.6:1. Every burgundy fill therefore carries white text (`.mark`, `badge-chosen`, chosen `.tile`, pressed `.segments`, text selection).
- **Burgundy on black is also 1.7:1.** That is why `highlighter-bright` exists: the job-progress panel is black.
- **`brick` (error) is the nearest neighbour to burgundy.** They stay apart by lightness and because meaning colours always carry a word (*Failed*, *Missing*). If they look too alike in your browser, move `brick` toward an orange-red; nothing else depends on it.

Meaning colours **always travel with a word or icon**, never colour alone.

**Contrast (Verified: recomputed for this palette with the WCAG formula).** Minimum for body text is 4.5:1; bars and other graphics 3:1.

| Pair | Ratio | | Pair | Ratio |
|---|---|---|---|---|
| ink on canvas | 18.7 | | sheet on void (labels) | 21.0 |
| graphite on canvas | 9.9 | | sheet at 70% on void | 9.9 |
| pencil on canvas | 5.2 | | sheet at 50% on void (pending stage) | 5.3 |
| pencil on sheet | 5.8 | | brick-wash on void (stopped stage) | 17.0 |
| **sheet (white) on highlighter** | **12.6** | | amber on canvas | 5.4 |
| stamp on stamp-wash | 4.9 | | brick on sheet (inline error) | 6.9 |
| amber on amber-wash | 5.2 | | brick on canvas | 6.2 |
| brick on brick-wash | 5.6 | | ink on highlighter-wash | 16.2 |
| highlighter-bright on void (bars, graphic) | 5.4 | | highlighter on canvas / sheet (progress fill) | 11.2 / 12.6 |
| ~~ink on highlighter~~ | 1.7, fails | | ~~highlighter on void~~ | 1.7, fails |

The two struck-through pairs are the reason for the white-text rule and for `highlighter-bright`.

### 5.2 Migrating Ruco's old tokens (Verified by grep; counts are occurrences in `src/**/*.tsx`)

| Old class | Count | Becomes |
|---|---|---|
| `ink-900` (page bg) | 1 | `canvas` (page) · `void` (video stage) |
| `ink-900/70` (play overlay) | 1 | `frost` |
| `ink-850` and `/30 /35 /40 /60 /70` (panels, hover and selected rows, track) | 15 (8 plain, 7 with opacity) | `sheet` for surfaces · `canvas/70` for row hover |
| `ink-800` (rules) | 13 | `hairline` |
| `ink-700` (borders, rails, scrollbar) | 6 | `hairline-strong` |
| `ink-600` (faint text) | 10 | `pencil` |
| **`ink-500` (dim text)** | **25** | `pencil` (**this shade is not defined today**, see Appendix A) |
| `ink-400`, `ink-300` | 12, 4 | `graphite` |
| `ink-200`, `ink-100` | 14, 15 | `ink` |
| `text-sodium-500` | 14 | `text-ink`, plus `.mark` / `badge-chosen` where the meaning is *found / chosen* |
| `accent-sodium-500` (checkbox, range) | 5 | `.switch` for checkboxes · `accent-ink` for the volume range |
| `border-sodium-500` (selected) | 4 | `border-ink`, or the signal fill on a `.tile` |
| `bg-sodium-500` (button, handle, progress) | 3 | `btn-primary` (ink) · `bg-highlighter` for progress fills |
| `bg-sodium-400` | 1 | `bg-ink` (trim grip) |
| `border-sodium-600` (notices) | 2 | `border-amber bg-amber-wash` notice |
| `bg-sodium-700/25`, `/10` (trim window, word hover, drag-over) | 3 | `bg-highlighter-wash` |
| `text-signal-good` | 7 | `badge-sure` (stamp) with a word |
| `text-signal-bad`, `border-signal-bad` | 5 + 1 | `text-brick` · `border-brick bg-brick-wash` |

Old component classes: `.eyebrow` → `.label` (sentence case, no tracking, no uppercase). `.numeric` → `.tabular`. `.btn-ghost` → `.btn-secondary`. `.font-display` → `font-dot`. `.rise` is removed (see 5.4). `.sweep` is already unused; delete it.

### 5.3 Type

| Face | Role | Rule |
|---|---|---|
| **Doto**, weights **800 and 900 only** | Ingest question, page titles, big counts, wordmark | Never under 32px on desktop. Square dots (the `wght` file has the `ROND` axis at its default of 0) |
| **Geist** | Everything you read | |
| **Geist Mono** | Everything you press or scan, and text quoted from the source (transcript, hook) | |

Sentence case everywhere. No all-caps labels, no letter-spacing tricks.

| Token | Size / line | Face | Ruco use |
|---|---|---|---|
| `text-count` | 96 / 88 (phone 64 / 60) | Doto 800 | Job progress percent |
| `text-display` | 64 / 64 (phone 40 / 40) | Doto 800 | Ingest headline |
| `text-title` | 40 / 44 (phone 28 / 32) | Doto 900 | Video title (Progress, Review), Settings title |
| `text-heading` | 20 / 28 | Geist 600 | Section headings, empty-state titles |
| `text-body` | 16 / 24 | Geist | Default |
| `text-small` | 14 / 20 | Geist or Geist Mono | Controls, rows |
| `text-micro` | 12 / 16 | Geist Mono | Labels, hints, timecode |

### 5.4 Space, shape, surface, motion

| Group | Values |
|---|---|
| Rhythm (4px grid) | `tight` 8 · `item` 16 · `group` 24 · `stack` 32 · `section` 48 (as `gap-group`, `py-section`, etc.) |
| Frame | 1200px (1600px for Review). Left aligned throughout. Reading text stays under 72 characters (`max-w-prose`) |
| Radius | controls 6px (`rounded-control`) · frosted panels 16px (`rounded-panel`) · chips, switches, pills `rounded-full` |
| Flat surface | `sheet` + 1px `hairline`. No shadow |
| Frosted surface | `.frost`: `sheet` at 72%, 16px blur, white inner edge, one soft shadow. **Only things that float.** Never stack two |
| Secondary button | `bevel`: light top-left edge, dark bottom-right edge, pressed state inverts |
| Durations | 120 / 200 / 320 ms (`--duration-fast / base / slow`), one easing `--ease-standard` |

**Motion mapping (Mapping).** Ruvo allows exactly two choreographed moments: the dot field settling, and new rows arriving. So Ruco's `.rise` page-load stagger (620ms, expo, used on 4 pages) goes away. New rows use `animate-row-in` (fade up with a brief wash flash): apply it to clip rows and recent-job rows when they first load. The Options reveal changes from `duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]` to `duration-(--duration-slow) ease-(--ease-standard)`. `prefers-reduced-motion` freezes the dot field on one frame and stops the cat.

---

## 6. `src/index.css` (replace the whole file)

**Verified (original orange version):** that file compiled under Ruco's Tailwind ^4.0.0 + Vite 6, and the built CSS contained every class and token. **Re-checked after the burgundy swap:** the file below compiles on its own with the Tailwind v4 CLI (section 13). The full Vite build was not re-run.

Things in it worth knowing:

- **`@theme static`.** Tailwind v4 normally emits only the theme variables that are *used*. `DotField` reads `--color-ink`, `--color-canvas` and `--color-highlighter` by name at runtime, so `static` guarantees they exist. Verified they are present in the build output.
- **No `background` on `html`.** If both `html` and `body` have a background, `body`'s no longer propagates to the page canvas and paints *over* the `-z-10` dot field, hiding it. Only `body` sets it. Do the same for any wrapper you add: **never give `App`'s root `div` or `main` a background colour.**
- **`@apply` classes instead of `cva`.** Ruco has no `cn()`/`cva`, so the Ruvo variants become named classes (`btn`, `btn-primary`, `badge-sure`, `tile`, `switch`...). Page code stays plain `className="btn btn-primary"`.
- **Only what Ruco uses.** Ruvo's `sheet-in` and `fade-in` keyframes are left out because Ruco has no drawer or menu (`rules.md` rule 6: no dead code). Add them back with the first Sheet/Dialog.

```css
@import 'tailwindcss';

/* --------------------------------------------------------------------------
   Ruco: "Resolve" design system, ported from Ruvo.

   Noise resolves into rows: white paper, true black ink, dot-matrix
   imagery, and one burgundy signal. The signal (`highlighter`) means "found,
   proven or chosen". It is always a background behind WHITE text (black on
   burgundy is only 1.7:1), never a text colour or a decoration.
   Palette: CAESAR (black #000000, burgundy #6D001A, white #FFFFFF).

   Fonts are bundled (OFL) and loaded from ./fonts: Ruco is local-first and
   fetches nothing at runtime.
   -------------------------------------------------------------------------- */

@font-face {
  font-family: 'Doto';
  src: url('./fonts/Doto-Variable.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Geist';
  src: url('./fonts/Geist-Variable.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Geist Mono';
  src: url('./fonts/GeistMono-Variable.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

/* `static` emits every token as a CSS variable. DotField reads three of them
   (ink, canvas, highlighter) by name at runtime, so they must always exist. */
@theme static {
  /* Paper and ink */
  --color-canvas: #f3f1f1; /* white, faintly warmed toward burgundy */
  --color-sheet: #ffffff; /* the palette white: flat surfaces; frosted panels use it at 72% */
  --color-ink: #000000;
  --color-graphite: #3f3a3b;
  --color-pencil: #6a6465; /* placeholders, hints and inactive labels */
  --color-hairline: #ddd8d9;
  --color-hairline-strong: #bdb6b8; /* control outlines */
  --color-void: #000000; /* the dark panel the dot field sits on */

  /* The signal: burgundy. A background behind white text, never text itself. */
  --color-highlighter: #6d001a;
  --color-highlighter-wash: #f2dde2;
  /* Burgundy lifted for black panels only (plain burgundy on black is 1.7:1). */
  --color-highlighter-bright: #e5476a;

  /* Meaning: sure / check this / error. Always with a word or icon, never colour alone. */
  --color-stamp: #1d7248;
  --color-stamp-wash: #ddefe4;
  --color-amber: #8f5400;
  --color-amber-wash: #f8ebd4;
  --color-brick: #ae2116;
  --color-brick-wash: #f9e2df;

  /* Doto (dot-matrix, 800-900) for the few big moments, never under 32px on
     desktop; Geist to read; Geist Mono for everything you press or scan. */
  --font-dot: 'Doto', ui-monospace, monospace;
  --font-sans: 'Geist', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, monospace;

  /* Desktop sizes; phones step the display sizes down below. */
  --text-count: 6rem;
  --text-count--line-height: 5.5rem;
  --text-display: 4rem;
  --text-display--line-height: 4rem;
  --text-title: 2.5rem;
  --text-title--line-height: 2.75rem;
  --text-heading: 1.25rem;
  --text-heading--line-height: 1.75rem;
  --text-body: 1rem;
  --text-body--line-height: 1.5rem;
  --text-small: 0.875rem;
  --text-small--line-height: 1.25rem;
  --text-micro: 0.75rem;
  --text-micro--line-height: 1rem;

  /* Rhythm on a 4px grid: sections, stacked parts, groups, items, tight pairs. */
  --spacing-section: 3rem;
  --spacing-stack: 2rem;
  --spacing-group: 1.5rem;
  --spacing-item: 1rem;
  --spacing-tight: 0.5rem;

  /* Radius by role: controls, frosted panels. Chips and toggles use rounded-full. */
  --radius-control: 6px;
  --radius-panel: 16px;
  --radius-sheet: 20px;

  /* One soft elevation, only for what floats (see `frost`). Static content has none. */
  --shadow-raised: 0 0 0 1px rgb(0 0 0 / 0.05), 0 18px 40px -18px rgb(0 0 0 / 0.3);

  --ease-standard: cubic-bezier(0.2, 0, 0, 1);

  --animate-row-in: row-in 320ms var(--ease-standard) both;
  --animate-cat-fall: cat-fall 1.6s ease-in-out infinite;
  --animate-streak: streak 1.4s linear infinite;
}

/* Motion: three durations, one easing (--ease-standard). */
:root {
  --duration-fast: 120ms;
  --duration-base: 200ms;
  --duration-slow: 320ms;
}

@layer base {
  /* No background on html: body's then propagates to the canvas, so the fixed
     -z-10 dot field paints above the paper instead of under the body. */
  html {
    color-scheme: light;
  }

  body {
    margin: 0;
    background: var(--color-canvas);
    color: var(--color-ink);
    font-family: var(--font-sans);
    font-size: var(--text-body);
    line-height: var(--text-body--line-height);
    -webkit-font-smoothing: antialiased;
  }

  /* Phones: the dot-matrix sizes step down. */
  @media (width < 40rem) {
    :root {
      --text-count: 4rem;
      --text-count--line-height: 3.75rem;
      --text-display: 2.5rem;
      --text-display--line-height: 2.5rem;
      --text-title: 1.75rem;
      --text-title--line-height: 2rem;
    }
  }

  /* Figures line up in tables and counters: scores, durations, timecode. */
  table,
  .tabular {
    font-variant-numeric: tabular-nums;
  }

  :focus-visible {
    outline: 2px solid var(--color-ink);
    outline-offset: 2px;
  }

  ::selection {
    background: var(--color-highlighter);
    color: var(--color-sheet);
  }

  ::placeholder {
    color: var(--color-pencil);
  }

  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  ::-webkit-scrollbar-track {
    background: var(--color-canvas);
  }
  ::-webkit-scrollbar-thumb {
    background: var(--color-hairline-strong);
    border: 3px solid var(--color-canvas);
    border-radius: 99px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--color-pencil);
  }
}

/* A floating panel: sheet at 72% over a 16px blur, a white inner edge and the one soft shadow. */
@utility frost {
  background-color: color-mix(in srgb, var(--color-sheet) 72%, transparent);
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.7),
    var(--shadow-raised);
}

/* A retro bevel: light top-left edge, dark bottom-right edge; pressing inverts it. */
@utility bevel {
  background-color: var(--color-sheet);
  box-shadow:
    inset 1px 1px 0 #fff,
    inset -1px -1px 0 rgb(0 0 0 / 0.28),
    0 0 0 1px var(--color-hairline-strong);
  &:active:not(:disabled),
  &[aria-pressed='true'],
  &[data-state='open'] {
    background-color: var(--color-hairline);
    box-shadow:
      inset 1px 1px 0 rgb(0 0 0 / 0.28),
      inset -1px -1px 0 #fff,
      0 0 0 1px var(--color-hairline-strong);
  }
}

/* Loading, as dither: square dots on a 4px grid over a faint fill, and a band
   where the offset grid joins in, stepping across. Density changes, never a gradient. */
@utility dither {
  --dots: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='2' height='2' fill-opacity='.16'/%3E%3C/svg%3E");
  position: relative;
  overflow: hidden;
  background: var(--dots) color-mix(in srgb, var(--color-ink) 5%, var(--color-canvas));
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--dots) 2px 2px;
    mask-image: linear-gradient(90deg, transparent 42%, #000 42% 58%, transparent 58%);
    mask-size: 300% 100%;
    animation: dither 1.6s steps(20) infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
      mask-image: none;
    }
  }
}

@layer components {
  /* Found words behind the signal: white text on a burgundy stamp. */
  .mark {
    background: var(--color-highlighter);
    border-radius: 2px;
    padding-inline: 0.15em;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
    color: var(--color-sheet);
  }
  @media (forced-colors: active) {
    .mark {
      text-decoration: underline 3px;
    }
  }

  /* Small mono label above a field or section. Sentence case, no tracking. */
  .label {
    @apply font-mono text-micro text-graphite;
  }

  /* Buttons are ink, not signal. Labels are mono. */
  .btn {
    @apply inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-control px-4 font-mono text-small font-medium whitespace-nowrap transition-colors duration-(--duration-fast) select-none disabled:cursor-not-allowed;
  }
  .btn-sm {
    @apply h-8 px-3 text-micro;
  }
  .btn-lg {
    @apply h-12 px-5;
  }
  .btn-primary {
    @apply bg-ink text-sheet shadow-[inset_0_1px_0_rgb(255_255_255/0.22)] hover:bg-graphite active:bg-ink active:shadow-none disabled:bg-hairline-strong disabled:shadow-none;
  }
  .btn-secondary {
    @apply bevel text-ink hover:bg-canvas disabled:bg-sheet disabled:text-pencil;
  }
  .btn-quiet {
    @apply text-graphite hover:bg-ink/6 hover:text-ink active:bg-ink/10 disabled:bg-transparent disabled:text-pencil;
  }
  .btn-danger {
    @apply bevel text-brick hover:bg-brick-wash disabled:bg-sheet disabled:text-pencil;
  }

  /* A hairline field, slightly sunk; focus draws it in ink with a signal-wash halo. */
  .field {
    @apply h-10 w-full rounded-control border border-hairline-strong bg-sheet px-3 text-small text-ink shadow-[inset_0_1px_2px_rgb(0_0_0/0.06)] transition-[border-color,box-shadow] duration-(--duration-fast) hover:border-graphite focus-visible:border-ink focus-visible:ring-4 focus-visible:ring-highlighter-wash focus-visible:outline-none aria-invalid:border-brick disabled:border-hairline disabled:bg-canvas disabled:text-pencil;
  }

  /* Mono pills led by a 6px square dot (one cell of the dot matrix). */
  .badge {
    @apply inline-flex items-center gap-1.5 rounded-full bg-ink/6 px-2.5 py-0.5 font-mono text-micro whitespace-nowrap text-graphite before:size-1.5 before:shrink-0 before:bg-current;
  }
  .badge-sure {
    @apply bg-stamp-wash text-stamp;
  }
  .badge-check {
    @apply bg-amber-wash text-amber;
  }
  .badge-error {
    @apply bg-brick-wash text-brick;
  }
  .badge-chosen {
    @apply bg-highlighter text-sheet;
  }

  /* A choice as a flat tile; the chosen tile fills with signal and a square fills too. */
  .tile {
    @apply relative flex h-full cursor-pointer flex-col items-start gap-1 rounded-control border border-hairline-strong bg-sheet py-3 pr-8 pl-item text-left transition-colors duration-(--duration-fast) after:absolute after:top-4 after:right-3.5 after:size-2 after:border after:border-graphite hover:border-graphite has-checked:border-ink has-checked:bg-highlighter has-checked:after:border-sheet has-checked:after:bg-sheet has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink has-disabled:cursor-not-allowed has-disabled:opacity-50;
  }
  /* Text inside the chosen tile turns white; the burgundy signal sits behind it. */
  .tile:has(:checked) * {
    color: var(--color-sheet);
  }

  /* A pill toggle: a sunk track that fills with the signal, a raised white thumb. */
  .switch {
    @apply inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full bg-hairline p-[3px] shadow-[inset_0_1px_2px_rgb(0_0_0/0.18)] transition-colors duration-(--duration-base) aria-checked:bg-highlighter disabled:cursor-not-allowed disabled:opacity-50;
  }
  .switch > span {
    @apply block size-4.5 rounded-full bg-sheet shadow-[0_1px_2px_rgb(0_0_0/0.3),inset_0_1px_0_#fff] transition-[translate,background-color] duration-(--duration-base) ease-(--ease-standard);
  }
  .switch[aria-checked='true'] > span {
    @apply translate-x-4;
  }

  /* A segmented pill group (ratio, filters): the pressed segment fills with signal. */
  .segments {
    @apply flex max-w-full gap-0.5 overflow-x-auto rounded-full border border-hairline-strong bg-sheet p-0.5;
  }
  .segments > button {
    @apply h-8 shrink-0 rounded-full px-3 font-mono text-small whitespace-nowrap text-graphite hover:text-ink aria-pressed:bg-highlighter aria-pressed:text-sheet aria-pressed:hover:text-sheet;
  }

  /* A slip of quoted source text: mono on sheet, found words behind `.mark`. */
  .quote {
    @apply rounded-control border border-hairline bg-sheet px-3 py-2.5 font-mono text-small leading-relaxed break-words;
  }

  /* A data table: mono headers on a 2px ink rule, hairline rows, no zebra. */
  .data-head {
    @apply border-b-2 border-ink font-mono text-micro text-ink;
  }
}

@keyframes row-in {
  from {
    opacity: 0;
    transform: translateY(6px);
    background-color: var(--color-highlighter-wash);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* The falling cat: it sways and bobs in place while the air streaks rise past it. */
@keyframes cat-fall {
  0%,
  100% {
    transform: translateY(0) rotate(-7deg);
  }
  50% {
    transform: translateY(3px) rotate(7deg);
  }
}

@keyframes streak {
  from {
    transform: translateY(44px);
    opacity: 0;
  }
  25%,
  75% {
    opacity: 1;
  }
  to {
    transform: translateY(-56px);
    opacity: 0;
  }
}

@keyframes dither {
  from {
    mask-position: 100% 0;
  }
  to {
    mask-position: 0 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Fonts

All three are OFL-1.1 (Verified on npm). Files are small: **Doto 5,364 B · Geist 29,400 B · Geist Mono 23,128 B** (about 58 KB total, versus about 800 KB for the two fonts being removed).

Run inside `my-project/frontend`. `--no-save` leaves `package.json` and `package-lock.json` untouched (**Verified**: checksums identical before and after), so this adds no dependency.

```bash
npm install --no-save @fontsource-variable/doto @fontsource-variable/geist @fontsource-variable/geist-mono
```

Then copy three files (you are on Windows per `todo.md`, so PowerShell first):

```powershell
Copy-Item node_modules\@fontsource-variable\doto\files\doto-latin-wght-normal.woff2             src\fonts\Doto-Variable.woff2
Copy-Item node_modules\@fontsource-variable\geist\files\geist-latin-wght-normal.woff2           src\fonts\Geist-Variable.woff2
Copy-Item node_modules\@fontsource-variable\geist-mono\files\geist-mono-latin-wght-normal.woff2 src\fonts\GeistMono-Variable.woff2
```

(bash: same paths with `cp` and forward slashes.) Then:

1. Copy each package's `LICENSE` file next to the fonts (the OFL requires its text to travel with the font), and add Doto, Geist and Geist Mono to the README line that already credits Anton and Inter.
2. Delete `Archivo-Variable.ttf`, `InstrumentSerif-Regular.ttf` and `InstrumentSerif-Italic.ttf` once nothing references them.
3. `npm run build` places the fonts in `backend/autoclip/static/assets/`, which FastAPI already mounts at `/assets`. Nothing is fetched at runtime (Verified in the build output).

---

## 8. Components

### 8.1 Shell

**`index.html`** (Mapping): remove `class="dark"`, switch the colour scheme, recolour the favicon (same play mark, new colours).

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <title>Ruco</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%236d001a'/><path d='M11 8v16l12-8z' fill='%23ffffff'/></svg>" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**`App.tsx` header and frame** (Mapping, modelled on Ruvo's `layout.tsx` and `nav-links.tsx`). A flat header on `canvas`, the logo, mono links, a secondary *New clip* button, and the machine status as words. Header and `main` share the same width so their left edges align.

```tsx
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
              className={({ isActive }) => (isActive ? 'text-ink' : 'text-graphite hover:text-ink')}
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
```

**Verified:** this exact `App.tsx`, together with the components in 8.2 and 8.3, passes `tsc -b` and builds. The pages it routes to are not rewritten in the scratch project (see section 13).

### 8.2 Ported from Ruvo: copy the file, apply these exact edits (Verified: these are the full diffs)

Copy from Ruvo's `apps/web/components/` into Ruco's `frontend/src/components/` (Ruco uses PascalCase filenames).

**`dot-field.tsx` → `DotField.tsx`**: 4 edits. The shader, lens, resolve logic and observers are untouched.

| # | Find | Replace with |
|---|---|---|
| 1 | `"use client";` and the blank line after it | *(delete)* |
| 2 | `import { cn } from "@/lib/utils";` | *(delete)* |
| 3 | `const redraw = useRef<() => void>(null);` | `const redraw = useRef<(() => void) \| null>(null);` |
| 4 | `className={cn("relative overflow-hidden", className)}` | ``className={`relative overflow-hidden ${className ?? ""}`}`` |

Edit 3 is **required**, not cosmetic. Verified: without it `tsc` fails with `TS2540: Cannot assign to 'current' because it is a read-only property` (two errors), because Ruco's React 18 types make `useRef<T>(null)` read-only, while Ruvo's React 19 types do not.

**Colour on the black panel (Unverified).** `DotField` reads `--color-highlighter` by name for its accent. Plain burgundy on black is 1.7:1, so on `tone="void"` the accent would nearly vanish. The `DotField` source is not in this spec, so I cannot point to the exact line: where it reads `--color-highlighter`, read `--color-highlighter-bright` instead for the void tone. The token is already in `@theme static`.

**`falling-cat.tsx` → `FallingCat.tsx`**: 2 edits.

| # | Find | Replace with |
|---|---|---|
| 1 | `import { cn } from "@/lib/utils";` and the blank line after it | *(delete)* |
| 2 | `className={cn("grid place-items-center", className)}` | ``className={`grid place-items-center ${className ?? ""}`}`` |

**`logo.tsx` → `Logo.tsx`**: 4 edits.

| # | Find | Replace with |
|---|---|---|
| 1 | `import Link from "next/link";` | `import { Link } from "react-router-dom";` |
| 2 | `<Link href="/"` | `<Link to="/"` |
| 3 | `aria-label="RUVO home"` | `aria-label="Ruco home"` |
| 4 | `>ruvo</span>` | `>ruco</span>` |

The mark is Ruvo's 6×5 dither grid that resolves into three dotted rows on hover or focus. The metaphor ("noise resolves into rows") fits Ruco unchanged. Redrawing it as a wide 16:9 grid resolving into a tall 9:16 column would be a nice later touch (Mapping, not required).

### 8.3 New for Ruco (Verified: compiled)

**`AmbientField.tsx`** : the faint backdrop. Ruvo's version hard-codes a 1200px clear zone; Ruco needs 1600px on Review, so both masks are literal class strings (an inline `style` would skip Tailwind's vendor prefixing, which Verified the build adds as `-webkit-mask-image`).

```tsx
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
```

**`StatusDot.tsx`** : a square (one cell of the dot matrix) plus a word, for job status. Mirrors Ruvo's `StatusDot` in `dataset-list.tsx`.

```tsx
import type { JobStatus } from '../api'

/** Words always travel with the dot: colour is never the only signal. */
export const JOB_STATUS_LABEL: Record<JobStatus, string> = {
  queued: 'Queued',
  running: 'Running',
  done: 'Done',
  failed: 'Failed',
  cancelled: 'Cancelled',
}

const DOT: Record<JobStatus, string> = {
  queued: 'bg-pencil',
  running: 'bg-ink animate-pulse',
  done: 'bg-stamp',
  failed: 'bg-brick',
  cancelled: 'bg-pencil',
}

/** A square, like one cell of the dot matrix. */
export function StatusDot({ status }: { status: JobStatus }) {
  return <span aria-hidden className={`inline-block size-2 shrink-0 ${DOT[status]}`} />
}
```

**`ProgressTrack.tsx`** : Ruvo's five-step track, widened to Ruco's six pipeline stages. **One deliberate difference:** Ruvo's active bar runs a fake 12-second `fill` animation to 90% because it has no real progress. Ruco reports real per-stage progress (`useJobStream` → `stageProgress`), so the active bar fills to that value instead. A failed or cancelled stage gets its own state.

```tsx
export type StageState = 'done' | 'active' | 'stopped' | 'pending'

export interface TrackStage {
  key: string
  label: string
  state: StageState
  /** 0-1. Only read while `active`: Ruco reports real per-stage progress. */
  fraction: number
}

const Check = () => (
  <svg viewBox="0 0 16 16" aria-hidden className="hidden size-3.5 shrink-0 sm:block" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="m3 8.5 3.2 3L13 4.5" />
  </svg>
)

const Cross = () => (
  <svg viewBox="0 0 16 16" aria-hidden className="hidden size-3.5 shrink-0 sm:block" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="m4 4 8 8m0-8-8 8" />
  </svg>
)

/**
 * The pipeline as dot-matrix bars on the black collecting panel. Each bar is cut
 * into 4px cells so it reads as a row of dots; done is full signal (the lifted
 * burgundy, because plain burgundy vanishes on black), the active
 * stage fills to its real progress, a stopped stage says where it died.
 */
export function ProgressTrack({ stages }: { stages: TrackStage[] }) {
  return (
    <ol
      aria-label="Progress"
      className="grid gap-tight"
      style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}
    >
      {stages.map(({ key, label, state, fraction }) => (
        <li key={key} className="space-y-tight" aria-current={state === 'active' ? 'step' : undefined}>
          <div className="relative h-2 overflow-hidden bg-sheet/20 [mask-image:linear-gradient(90deg,black_4px,transparent_4px)] [mask-size:6px_100%]">
            {state === 'done' && <div className="absolute inset-0 bg-highlighter-bright" />}
            {state === 'stopped' && <div className="absolute inset-0 bg-brick-wash" />}
            {state === 'active' && (
              <div
                className="absolute inset-0 origin-left bg-highlighter-bright transition-transform duration-(--duration-slow) ease-(--ease-standard)"
                style={{ transform: `scaleX(${Math.min(1, Math.max(0.04, fraction))})` }}
              />
            )}
          </div>
          <p
            className={[
              'flex items-center gap-1 font-mono text-micro',
              state === 'pending' ? 'text-sheet/50' : state === 'stopped' ? 'text-brick-wash' : 'text-sheet',
              state === 'active' ? 'font-medium' : '',
            ].join(' ')}
          >
            {state === 'done' && <Check />}
            {state === 'stopped' && <Cross />}
            <span className="truncate">{label}</span>
            {state === 'done' && <span className="sr-only">(done)</span>}
            {state === 'stopped' && <span className="sr-only">(stopped here)</span>}
          </p>
        </li>
      ))}
    </ol>
  )
}
```

### 8.4 Class kit: how each element is written

| Element | Markup |
|---|---|
| Primary / secondary / quiet / danger button | `className="btn btn-primary"` · `btn btn-secondary` · `btn btn-quiet` · `btn btn-danger`. Sizes: add `btn-sm` or `btn-lg` |
| Text, number, select (native) | `className="field"`. Native `<select>` is kept, so no new dependency |
| Switch | `<label className="flex items-center gap-tight font-mono text-small"><button type="button" role="switch" aria-checked={on} onClick={() => set(!on)} className="switch"><span /></button> Label</label>` |
| Choice tile (radio) | `<label className="tile"><input type="radio" className="sr-only" name="g" checked={…} onChange={…} /><span className="font-mono text-small font-semibold">Title</span><span className="text-small text-graphite">Hint</span></label>`. Chosen = signal fill plus a filled square; arrow keys work natively |
| Segmented control (ratio) | `<div role="group" aria-label="Aspect ratio" className="segments"><button aria-pressed={on}>9:16</button>…</div>` |
| Badge | `className="badge"` (neutral) · `badge badge-sure` · `badge-check` · `badge-error` · `badge-chosen`. A 6px square precedes the word |
| Quoted text (transcript, hook) | `<blockquote className="quote">…<span className="mark">found words</span>…</blockquote>` |
| Amber notice | `<p className="border-l-2 border-amber bg-amber-wash px-item py-tight text-small">…</p>` |
| Error note | `<div className="border-l-2 border-brick bg-brick-wash px-item py-tight">` message `text-small font-medium` + hint `mt-2 max-w-prose text-small text-graphite whitespace-pre-line` |
| Mono label | `className="label"` |
| List header | `data-head` on a flex/grid row: mono, on a 2px ink rule |
| Skeleton (inside a panel) | `<div aria-hidden className="dither h-16 rounded-control" />` |
| Page-level loading | `<FallingCat className="min-h-[50vh]" />` |

---

## 9. Screens

### 9.1 Ingest (`/`)

Ruvo equivalent: the **Ask** screen (question in Doto, frosted composer, dot field bleeding off the right).

```
┌ ruco ▪▪ ──────────── CUDA · RTX 2050  Ready   Settings   [New clip] ┐
│                                                                  │
│  Local · No accounts · No watermarks     ░░▒▒▓▓▓▓▒▒░  full-      │
│  Long video in.            (Doto 64)    ░▒▓▓██▓▓▒░░  strength    │
│  Shorts out.                             ░░▒▒▓▓▒▒░░  ink field   │
│                                                                  │
│  ╭ frosted composer ─────────────────────╮                       │
│  │ Paste a link                          │                       │
│  │ https://youtube.com/watch?v=…         │                       │
│  │───────────────────────────────────────│                       │
│  │ Free · runs on this machine  [ Start ]│                       │
│  ╰───────────────────────────────────────╯                       │
│  Or drop a file  ┌ - - - - - - - - - - - ┐  dashed, sheet        │
│                  │  Drop video or audio  │                       │
│  › Options                                                       │
│                                                                  │
│  Recent ─ Name ───────── Status ─── Length ── Provider           │
└──────────────────────────────────────────────────────────────────┘
```

| Element (today) | Becomes |
|---|---|
| `p.eyebrow` "Local · No accounts · No watermarks" | `label` (mono micro, graphite) |
| `h1` serif, "Shorts" in italic orange | `font-dot text-display font-extrabold`. Keep the copy "Long video in. Shorts out." No italic, no orange text |
| URL `.field` (serif, underline) + Start button | Inside a **`frost rounded-panel`** composer. Input is transparent `text-heading`; the panel gets Ruvo's focus ring `focus-within:[box-shadow:inset_0_0_0_1px_var(--color-ink),0_0_0_4px_var(--color-highlighter-wash),var(--shadow-raised)]` |
| Cost line | Next to **Start**, mono micro (Mapping, from the README: only transcript text ever leaves, and with Ollama nothing does): Ollama active → `Free · runs on this machine`; any other provider → `Sends transcript text to {provider}. Never video or audio.` |
| Start button | `btn btn-primary btn-lg` (the one primary on the page) |
| "Only download video you own…" | `text-micro text-pencil` |
| Drop zone (dashed, centred) | `rounded-control border border-dashed border-hairline-strong bg-sheet px-group py-stack text-center`. Drag-over: `border-ink bg-highlighter-wash`. Title `text-heading font-semibold`; formats line `font-mono text-micro text-pencil` |
| Options toggle `›` | Same disclosure; reveal uses `duration-(--duration-slow) ease-(--ease-standard)` |
| Provider / Whisper model / cookies selects | Native `<select className="field">` with a `label` above. Drop the old `className="bg-ink-850"` on each `<option>` |
| Max clips, Min/Max length | `className="field tabular"` |
| "Multiple speakers" checkbox | `.switch` |
| "No AI provider is reachable" notice | Amber notice |
| `ErrorNote` | Error note (8.4) |
| Recent list | Flat list on `sheet` (below) |

**Dot field on this screen.** Use Ruvo's hero treatment. Ruvo's own class string has a typo (`h-48[mask-image:…]` with no space), so use this corrected one (**Verified** to compile):

```tsx
<DotField
  tone="ink"
  interactive
  className="-mx-4 -mt-stack -mb-group h-48 [mask-image:linear-gradient(to_bottom,black_30%,transparent)] sm:mx-0 sm:-mt-section lg:fixed lg:inset-y-0 lg:right-0 lg:-z-10 lg:m-0 lg:h-auto lg:w-1/2 lg:[mask-image:linear-gradient(to_right,transparent,black_30%)]"
/>
```

A band above the text on phones; the right half of the screen on desktop. Keep the form column at `lg:max-w-[600px]` so text always sits on clear paper. `AmbientField` already returns nothing on `/`, so nothing needs covering.

**Recent list** (Mapping, from Ruvo's `dataset-list.tsx`; same four columns Ruco has today):

```tsx
<div className="overflow-hidden rounded-control border border-hairline bg-sheet">
  <div aria-hidden className="data-head hidden gap-x-group px-group py-2.5 sm:grid sm:grid-cols-[minmax(0,1fr)_11rem_5rem_6rem]">
    <span>Name</span><span>Status</span><span className="text-right">Length</span><span className="text-right">Provider</span>
  </div>
  <ul className="divide-y divide-hairline">{/* one <li> per job */}</ul>
</div>
```

Each row: a `Link` (not `<a href>`, see Appendix A), `animate-row-in`, `hover:bg-canvas/70`. Name `font-medium` truncated; Status = `<StatusDot />` + `JOB_STATUS_LABEL[status]` (running shows `Running · 42%`) in mono; Length and Provider in mono `tabular`, graphite, right-aligned. Empty state: Ruvo's dashed box, *"No clips yet. Add a video above and Ruco will clip it."*

### 9.2 Job progress (`/jobs/:id`)

Ruvo equivalent: the **Collecting** view (black `void` panel, live count in Doto, step track beneath).

```
┌ header ──────────────────────────────────────────────────────────┐
│  ← All jobs                                                       │
│  Video title here             (Doto 40/900, up to 2 lines)        │
│  ■ Running   3:42 · 1920×1080 · ollama                (mono)      │
│  ┌ void panel ──────────────────────────────────────────────────┐ │
│  │ ░░▒▒ dot field resolves with overall progress ▒▒░░           │ │
│  │ 42 % done              (Doto 96)             [ Cancel ]      │ │
│  │ Word-level timing…  (mono, aria-live)                        │ │
│  │──────────────────────────────────────────────────────────────│ │
│  │ ▪▪▪▪▪▪ ▪▪▪▪▪▪ ▪▪▪▪░░ ░░░░░░ ░░░░░░ ░░░░░░  ProgressTrack     │ │
│  │ ✓Prepare ✓Transcribe Highlights Reframe Captions Export      │ │
│  └──────────────────────────────────────────────────────────────┘ │
│  (error note, if any, flat on paper beneath the panel)            │
└───────────────────────────────────────────────────────────────────┘
```

| Element (today) | Becomes |
|---|---|
| `p.eyebrow` job status | `StatusDot` + status word, mono small, in the meta line |
| `h1` serif, truncated | `font-dot text-title font-black text-balance line-clamp-2` (titles can be long; do not truncate a Doto title to one line) |
| Meta line (`duration · WxH · provider`) | `font-mono text-small text-graphite tabular` |
| Big orange percent | Inside the void panel: `<span className="font-dot text-count font-extrabold tabular">{percent}</span>` then `% done` in `text-heading text-sheet/70` |
| Stage message (`progress?.message ?? stage.note`) | `font-mono text-small text-sheet/70` with `aria-live="polite"` |
| Six-row stage checklist with hairline fills | **`ProgressTrack`** in the panel footer (`border-t border-sheet/15 px-group py-item sm:px-stack`). Build its `stages` from the existing `STAGES` array and the existing `done / stopped / active / pending` logic, with `fraction = progress?.stageProgress ?? 0` for the active stage |
| Cancel | `btn btn-danger` inside the panel |
| Retry, Review clips | **`btn btn-secondary`** inside the panel. Primary (black) would be invisible on `void`; Ruvo's own *Stop* button on the black panel is a bevel for the same reason |
| `ErrorNote` + "Retrying resumes from the stage that failed…" hint | Error note beneath the panel; the hint stays as `text-small text-graphite` |
| `Loading…` | `<FallingCat className="min-h-[50vh]" />` |
| 900 ms auto-navigate to clips on `done` | Keep unchanged |

Panel classes (Mapping, from Ruvo's `collecting-view.tsx`): section `isolate overflow-hidden rounded-panel bg-void text-sheet`; field `absolute inset-0 -z-10 [mask-image:linear-gradient(black_20%,transparent_45%)] sm:[mask-image:linear-gradient(to_right,transparent_20%,black_65%)]` with `tone="void" interactive resolve={percent / 100}`; content `flex min-h-72 flex-col justify-end gap-group p-group pt-36 sm:flex-row sm:items-end sm:justify-between sm:p-stack`. The field's own `resolve` glides toward the value, so jumpy progress events look smooth.

The field runs at full strength here and on Ingest only. Do not add it to other panels.

### 9.3 Review (`/jobs/:id/clips`)

Uses the **1600px frame** (decision 2). Three columns kept: `lg:grid-cols-[minmax(0,20rem)_minmax(0,26rem)_minmax(0,1fr)]`.

| Piece | Becomes |
|---|---|
| Back link `← All jobs` | `font-mono text-small text-graphite hover:text-ink`, with an arrow |
| Title | `font-dot text-title font-black text-balance line-clamp-2` |
| `N clips · M kept` | `font-mono text-small tabular text-graphite` |
| **Export kept** | `btn btn-primary` (the one primary; decision 3) |
| `EmptyState` | Ruvo's notice pattern: `max-w-xl space-y-item py-section`, title `text-title font-semibold` (Geist, not Doto), copy `text-graphite`. Keep the existing wording |

**Ranked list (column 1).** A flat panel: `overflow-hidden rounded-control border border-hairline bg-sheet`, `data-head` header row `Ranked` ... `Score`, rows separated by `divide-y divide-hairline`.

| Clip row detail | Becomes |
|---|---|
| Score | `font-mono text-heading tabular`. If score ≥ 85 (Ruco's existing threshold) wrap it in `.mark`: the burgundy signal behind white text, replacing today's orange text. Doto is **not** used for list scores: ten big dot-matrix numbers would break "quiet around the loud part" |
| Row selected | `bg-canvas shadow-[inset_2px_0_0_var(--color-ink)]` (a 2px ink bar with no layout shift) |
| Row hover | `hover:bg-canvas/70` |
| `kept` | `badge badge-chosen` "Kept" (the user *chose* it, so it takes the signal) |
| `exported` | `badge badge-sure` "Exported" |
| `trimmed` | mono micro, `text-pencil` |
| Discarded | keep `opacity-40`; undo button reads `Undo` |
| Keep / Drop actions | Mono quiet buttons, shown on hover or when selected. **Add `focus-within:opacity-100`** so keyboard users can reach them |
| Row entrance | `animate-row-in` |

**Score wording (Verified, `decision.md` D-007 and `project.md` §5).** The score is a *heuristic engagement ranking*, never a virality prediction. Label the column header **Score** and add the hint *"Engagement score: a ranking by hook, emotion and completeness, not a prediction."* Do not use "viral" in UI copy.

**Player (column 2).**

| Piece | Becomes |
|---|---|
| Video stage `bg-ink-850` | `bg-void` (the stage is black, like the progress panel), `rounded-control` |
| Play overlay (dark disc with ▶) | `frost` circle: `grid size-16 place-items-center rounded-full frost` with ▶ in ink. It floats over the video, so it is the legitimate use of frost here |
| Play / Pause | `btn btn-quiet` |
| Volume | Mute button `btn btn-quiet`; range `accent-ink` |
| Progress hairline | Track `h-0.5 flex-1 bg-hairline-strong`, fill `bg-highlighter` (signal means progress) |
| Timecode | `font-mono text-micro tabular text-graphite` |
| "Audio is muted" (orange text) | `badge badge-check` "Muted" + `text-small text-graphite` hint |
| Test audio result | OK: `text-small text-graphite`. Problem: `badge badge-check` "No signal" + the same text |
| Test audio / Browser controls | `btn btn-quiet` (unchanged) |

**Trim bar.** `h-14 rounded-control border border-hairline bg-sheet`. Density bars `bg-hairline-strong`. Selected window `bg-highlighter-wash` (chosen range). Handles: `w-0.5 bg-ink` line with an ink `h-6 w-1.5 rounded-full` grip. Readout `font-mono text-micro tabular`; the duration is `font-medium text-ink`, no longer orange text. Snap-to-word behaviour is unchanged.

**Why this clip / transcript / style / ratio / export (column 3).**

| Piece | Becomes |
|---|---|
| "Why this clip" body | `.label` heading; reason in `text-body text-graphite max-w-prose` |
| Hook (italic serif with left rule) | `<blockquote className="quote"><span className="mark">“{hook}”</span></blockquote>`. It is quoted source text (mono on sheet) with the found words behind the signal, exactly Ruvo's `Quote` idea |
| Transcript | Container `quote` style with `max-h-[38vh] overflow-y-auto`. Words stay buttons: `rounded-[2px] px-0.5 hover:bg-highlighter-wash`. The editing input: `border-b-2 border-ink bg-transparent font-mono`. Header: `.label` "Transcript" and `N words` in `font-mono text-micro text-pencil tabular` |
| Save edits | `btn btn-secondary`. Dirty state: `badge badge-check` "Unsaved changes"; otherwise `text-micro text-pencil` "Click any word to correct it" |
| **Caption style list** | A radio group of **`.tile`**s, `grid gap-tight sm:grid-cols-2`. This is the closest match to Ruvo's mode tiles: chosen = signal fill. Each tile: label (mono, semibold), description, and two 8px squares showing `preview.primary` and `preview.accent` (add `border border-sheet ring-1 ring-ink` so both a white and a black swatch stay visible on paper and on the burgundy fill). Ruco's API currently returns **six** presets (Appendix A), so expect three rows |
| Aspect ratio buttons | `.segments` control with `9:16 · 1:1 · 16:9`, pressed = signal |
| Export this clip | `btn btn-secondary w-full` (decision 3) |
| Exports list | Rows `font-mono text-small`: link `text-ink underline underline-offset-4 hover:decoration-2` (Ruvo's link style), size `text-pencil tabular` |

**Caption preview colours are content, not chrome.** The overlay on the video renders the *burned-in caption style* (white, yellow, cyan...). Those colours come from the API and must **not** be remapped to the Resolve palette.

### 9.4 Settings (`/settings`)

Keep the single `max-w-4xl` column.

| Piece | Becomes |
|---|---|
| Title + `saved` text | Title `font-dot text-title font-black`; `saved` becomes `badge badge-sure` "Saved", fading as it does now |
| `Section` | Ruvo's section: `space-y-group border-t border-hairline-strong pt-stack`, heading `text-heading font-semibold`, note `text-small text-graphite` |
| Insecure secret storage notice | Amber notice |
| AI provider list | **`.tile` radio group**, `grid gap-tight sm:grid-cols-2`. Chosen = signal fill. Inside each: name (mono semibold), a `StatusDot`-style square plus the word *Reachable* or the `detail`, and the model list in `font-mono text-micro tabular` |
| Model, Base URL, Language, numeric fields | `label` + `field` (numbers add `tabular`). Commit-on-blur behaviour unchanged |
| Keys (`SecretField`) | `label`; **Set** as `badge badge-sure`; password `field`; `btn btn-secondary` Save; `btn btn-quiet` Remove |
| Whisper model, cookies, default ratio | Native `<select className="field">` |
| Checkboxes (identify speakers, GPU encoding, write .srt) | `.switch`. Disabled state keeps the hint text beneath |
| `<code>` snippets | `font-mono text-micro` on `bg-ink/6 px-1.5 rounded-control` |
| **This machine** | `dl` rows: `border-b border-hairline pb-2`, label `text-graphite`, value `font-mono tabular`. Status values become badges with words: libass `Present` (sure) / `Missing` (error); ffmpeg `Found` / `Not found`; GPU encode `Available` (sure) / `Unavailable` (check) |
| `Loading…` | `FallingCat` |

---

## 10. Deliberately not ported

| Ruvo piece | Why not |
|---|---|
| Landing page, `CollectingBand` (scroll-pinned band) | Ruco is a local tool; Ingest is home; hosting is a stated non-goal. The hero treatment is applied to Ingest instead |
| Plan sheet, `ColumnChips`, `RuleChips`, `SiteList`, `PlanFacts` | Ruco's pipeline has no plan-approval step |
| Data table, filters, `ReceiptDrawer`, evidence `Quote`, `CertaintyMark`, `TrustSummary`/`DotBar`, `MethodBadge`, quality and diff views | Ruco has no per-value provenance or confidence. Its score is one heuristic number (`project.md` §5) |
| `ModePicker` cost tiles, `ModelPicker`, `VoiceButton`, `PageList`, `Examples` | No cost estimate; provider and model live in Options and Settings; no voice input |
| "Run again" | Ruco's equivalent is **Retry** on failed jobs, which already exists |
| Radix `Sheet`, `Dialog`, `DropdownMenu`, `Tooltip`, `Tabs`, `Select`; `sonner`; `lucide-react` | No Ruco feature needs them today. Native `<select>`, `.switch`, `.tile` and inline SVG cover it with **zero new dependencies** (`rules.md` rule 22). Add them with the first feature that needs them |
| `app/error.tsx`, `not-found.tsx` | Ruco's router has no `errorElement` or catch-all route today (Verified in `main.tsx`). Optional: add one using Ruvo's notice pattern (`max-w-xl space-y-item py-section`, title `text-title font-semibold`, a `btn btn-primary`) |
| `/design` showcase page | Optional dev-only route (`import.meta.env.DEV`) rendering every token and class; handy for visual QA |

---

## 11. Do and don't

**Do**
- One primary button per view, and say what the action costs or sends beside it.
- Use the signal (burgundy) only as a background behind **white** text.
- Put a word next to every meaning colour.
- Keep content flat; frost only what floats.
- Left-align everything; let the dot field bleed off the right edge.
- Use Geist Mono for anything pressed or scanned, and for quoted source text.

**Don't**
- Don't use burgundy (the signal) as text, an underline or a decoration.
- Don't put black text on burgundy (1.7:1), or plain burgundy on a black panel. Use `highlighter-bright` there.
- Don't run the full-strength dot field anywhere but Ingest and the job-progress panel.
- Don't stack frosted panels.
- Don't put Doto under 32px on desktop, or use any weight but 800/900.
- Don't use all-caps labels or letter-spacing.
- Don't put a background colour on `App`'s root, `main`, or any full-page wrapper (it hides the dot field).
- Don't recolour the caption-preview overlay.
- Don't call the score "viral" or imply it predicts anything.

---

## 12. Migration checklist

Per `rules.md`: one change at a time, verify, then continue. The CI gate is `npm run build` (type check, then Vite build) in `frontend/` (**Verified** in `ci.yml`).

1. **Branch** and add the `decision.md` entry (Appendix B).
2. **Fonts** (section 7). Check: three `.woff2` files in `src/fonts/`; `package.json` unchanged.
3. **`index.css`**: replace with section 6. The pages still use old class names, so expect them to look wrong until step 7; typechecking still passes.
4. **`index.html`** (8.1).
5. **Components**: add `DotField`, `FallingCat`, `Logo` (8.2 edits), then `AmbientField`, `StatusDot`, `ProgressTrack` (8.3). Check: `npm run typecheck` is clean.
6. **`App.tsx`** (8.1). Check: header, skip link and dot-field margins show on every route; the field is absent on `/`.
7. **Screens, one at a time**: Ingest → JobProgress → Review → Settings, applying section 9 and the token table in 5.2. After each: `npm run typecheck`.
8. **Legacy gate.** This must print nothing:
   ```bash
   grep -rnE "ink-[0-9]|sodium|signal-(good|bad)|font-display|eyebrow|numeric|btn-ghost|\brise\b|sweep" src --include=*.tsx --include=*.css
   ```
9. **`npm run build`**, then `autoclip serve` and open `http://localhost:8000`.
10. **Visual QA with a real job** (`rules.md` rules 23 and 25; `todo.md` notes visual QA needs human eyes). Look for:
    - Ingest: dot field visible on the right (desktop) or above (phone); no dots under the text; the field reads into rows near the pointer.
    - Other pages: dots only in the side margins, never behind content; Review at 1600px has no overlap.
    - Job progress: the field settles as progress rises; bars fill to real stage progress; a cancelled or failed job marks the right stage and says where.
    - Review: selected row, Kept and Exported badges, play overlay, trim drag and snap, caption-tile chosen state, transcript word edit.
    - Keyboard: visible 2px ink focus ring everywhere; Keep/Drop reachable by Tab; skip link works.
    - Reduced motion (OS setting): the field is a still frame, the cat stops.
    - WebGL disabled: the field renders nothing and the page still works.
    - Phone width: Doto sizes step down; the track stays readable.
    - Palette: every burgundy fill has white text (chosen tile, Kept badge, pressed segment, score mark, selection). Progress bars on the black panel are the lighter `highlighter-bright`. Error red and burgundy are not confused.

---

## 13. Verification log

**Verified (ran it, scratch copy of `frontend/`):**

| Check | Result |
|---|---|
| Baseline `tsc -b --noEmit` on untouched Ruco frontend | Passes |
| Same, with the new CSS, six components and the documented `App.tsx` | Passes |
| Ruvo's original `useRef` line under Ruco's types | Fails with `TS2540` ×2; the fix passes |
| `vite build` | Succeeds. CSS 43 KB (8.6 KB gzip) |
| Compiled CSS contains | All tokens, `.btn-*`, `.badge-*`, `.tile`, `.switch`, `.segments`, `.quote`, `.data-head`, `.frost`, `.dither`, `.mark`, keyframes, the type scale, spacing and radius utilities; `::before`/`::after` get `content: ""`; `.btn-secondary` carries the bevel and its pressed inversion; `mask-image` classes get `-webkit-` prefixes |
| Fonts | Three woff2 files emitted into `assets/` |
| Contrast ratios | Computed; match Ruvo's published numbers |
| `npm install --no-save` for fonts | `package.json` and lockfile checksums unchanged |

**Re-checked after the burgundy palette swap (this session):**

| Check | Result |
|---|---|
| All contrast ratios in 5.1 | Recomputed for the new hex values. Black on burgundy 1.7 (fails, so text is white: 12.6); burgundy on black 1.7 (fails, so `highlighter-bright`: 5.4) |
| `index.css` from section 6 | Compiles with the Tailwind v4.3.3 CLI with no errors. Output contains the new tokens (`canvas`, `sheet`, `highlighter`, `highlighter-wash`, `highlighter-bright`) and the classes `.btn-secondary`, `.badge-chosen`, `.tile`, `.switch`, `.segments` |
| Leftover old hex values (`#ff7a2e`, `#e9e9e6`, ...) in this document | None |
| Full Vite build, `tsc -b`, component compile | **Not re-run.** Only class names changed in `ProgressTrack` (`bg-highlighter-bright`), so no type impact is expected, but this is unchecked |

**Unverified (needs a real browser):**

- Palette: how burgundy, `highlighter-bright` and `brick` look next to each other; whether the white-on-white bevel (light edge invisible on `sheet`) still reads as a button.
- `DotField` accent colour on the black panel (see the note in 8.2).

- Any visual result: layout, spacing, the dot field and cat rendering, the frosted blur, tile and switch appearance.
- `DotField` WebGL behaviour. I changed only the 4 lines listed; the shader is Ruvo's and works in Ruvo.
- The page rewrites in section 9. I verified the CSS and components they use, not the finished pages.
- Real-data behaviour on Review (trim, captions, six presets).

---

## Appendix A: Issues found while reading (Verified)

| Where | Finding |
|---|---|
| Ruco `index.css` | `ink-500` is used **25 times** but never defined in `@theme` (only 900, 850, 800, 700, 600, 400, 300, 200, 100 are). **Verified** by building Ruco's current frontend: `.text-ink-100`, `-400` and `-600` are emitted, `.text-ink-500` is not, so those 25 elements inherit the surrounding colour today. The migration removes the problem |
| Ruco README vs code | README lists **four** caption styles; `captions.py` `PRESETS` has **six** (`bold_pop`, `karaoke_fill`, `clean_lower`, `boxed`, `viral_glow`, `comic_punch`) |
| Ruco `ClipPlayer.tsx` | The caption overlay asks for `font-family: Anton, Impact, sans-serif`, but the frontend only loads Instrument Serif and Archivo, so it falls back to Impact. Optional fix: copy `Anton-Regular.ttf` (and `Inter-Variable.ttf`) from `backend/autoclip/assets/fonts/` into `src/fonts/` and add `@font-face` rules. Same OFL fonts, no new dependency |
| Ruco `Ingest.tsx` | Recent rows use `<a href>`, which does a full page reload; a router `Link` avoids it |
| Ruco `index.css` | `.sweep` is defined but never used |
| Ruvo `ask-composer.tsx` | Typo `h-48[mask-image:…]` (missing space) so that class never applies. Do not copy it; the Ingest snippet above is corrected |

## Appendix B: Draft `decision.md` entry

```
## D-009: Adopt the Resolve visual system for the frontend

- Date: 2026-10-13
- Status: Proposed
- Context: The UI is a dark theme with a serif display face. The project wants the light, dot-matrix "Resolve" look of the Ruvo reference frontend, in the CAESAR palette (black, burgundy #6D001A, white) instead of Ruvo's grey and orange.
- Options considered:
  1. Keep the dark theme: no work, but no change in identity.
  2. Port Resolve with Ruvo's dependencies (Radix, cva, lucide, sonner): closest to the reference, but adds five npm dependencies.
  3. Port Resolve with CSS classes and native controls: same look, no new dependencies.
- Decision: Option 3. Add three OFL variable fonts (Doto, Geist, Geist Mono; about 58 KB) as bundled assets; remove Archivo and Instrument Serif (about 800 KB).
- Rationale: Rule 22 (no new dependency without a decision), rule 18 (zero cost), rule 19 (local first: fonts bundled, nothing fetched at runtime). Fonts verified as OFL-1.1 on npm.
- Consequences: Burgundy carries white text (black on it is 1.7:1) and black panels use the lighter `highlighter-bright`. Native selects cannot be frosted. Radix components are added later only if a feature needs them. Visual QA by a human is required.
- Rules check: 6 (no dead code: unused keyframes omitted), 18, 19, 20 (OFL licence files shipped with the fonts), 22, 23.
- Review trigger: If a feature needs a menu, drawer or dialog (revisit Radix), or if the dot field performs badly on the target laptop (it runs about 30fps on `low-power` GPU hint).
```

## Appendix C: Final `frontend/src` layout

```
src/
├── fonts/            Doto-Variable.woff2  Geist-Variable.woff2  GeistMono-Variable.woff2  (+ LICENSE files)
├── components/
│   ├── AmbientField.tsx   (new)
│   ├── CaptionEditor.tsx  (restyle)
│   ├── ClipPlayer.tsx     (restyle)
│   ├── DotField.tsx       (ported)
│   ├── ErrorNote.tsx      (restyle)
│   ├── FallingCat.tsx     (ported)
│   ├── Logo.tsx           (ported)
│   ├── ProgressTrack.tsx  (new)
│   ├── StatusDot.tsx      (new)
│   └── TrimBar.tsx        (restyle)
├── pages/            Ingest.tsx  JobProgress.tsx  Review.tsx  Settings.tsx  (restyle)
├── App.tsx           (shell rewritten)
├── index.css         (replaced)
└── api.ts  main.tsx  useJobStream.ts   (unchanged)
```
