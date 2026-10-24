# Ruco Frontend: Master Guide (A to Z)

- Version 1 · 2026-10-25 · Status: **Proposed. Nothing has been built yet.**
- This file is a plan, not code. It tells you (or your AI agent) exactly what to build, in what order, how to verify each step, and how to fix what breaks.
- It is governed by `rules.md`, `decision.md`, `project.md` and `agent.md`. If this guide ever conflicts with `rules.md`, `rules.md` wins.
- Evidence tags used everywhere: **[V]** verified from a file or a fetched source, **[A]** assumption that must be verified, **[U]** unknown.

---

## 0. TL;DR

1. Your current UI is **Vite + React 18 + React Router 6 + Tailwind v4**, built into `backend/autoclip/static` and served by FastAPI **[V]**. We keep that. No Next.js.
2. We **replace the look** (CSS, layouts, page markup) and **keep the working logic** (`api.ts`, `useJobStream.ts`, `ClipPlayer`, `TrimBar`, `CaptionEditor`). Throwing the logic away would break tested behaviour for no gain (rule 9).
3. Your 9 Velora elements go in like this:

| Element | Where it lives in Ruco |
|---|---|
| Navbar Menu | Global header on every page |
| Flickering Grid | Home hero background, empty states |
| Text Hover Effect | Giant "RUCO" wordmark on Home |
| Blur Fade | Entrance animation for sections and list rows, all pages |
| Hero Parallax | "Your clips" showcase on Home (only when exported clips exist) |
| Globe | "Stays on your machine" section on Home (decorative only) |
| Animated Beam | Pipeline diagram: idle on Home, live on the job screen |
| Terminal | Live stage log on the job screen, system check on Settings |
| Loaders | Every busy state (buttons, active stage, export) |

4. Theme: **"Ruco Aurora"**, a violet-black base with a violet → magenta → amber gradient accent. The old orange "sodium" accent survives as the warm end of the gradient.
5. Build order: safety → dependencies → alias → tokens → install the 9 components → test lab → pages → cleanup → verify → docs.

### Questions only you can answer (my default is used if you don't answer)

| # | Question | My default |
|---|---|---|
| Q1 | Product name shown in the UI: **Ruco** or **AutoClip**? Your folder is `RUCO`, the UI says AutoClip **[V]** | Ruco |
| Q2 | Keep the logic layer and re-skin it (my advice) or delete everything including logic? | Keep logic |
| Q3 | Keep the Globe? It has no real data to show | Keep, decorative only |
| Q4 | Approve the Ruco Aurora palette (section 4)? | Yes |
| Q5 | Move the project out of OneDrive? Your path is `C:\Users\Preet\OneDrive\Desktop\RUCO` **[V: todo.md]** | Yes, to `C:\dev\RUCO` |
| Q6 | Will the repo be public? | Public (todo.md says public MIT **[V]**), so add third-party notices (step 14) |

### What I could not verify (do not treat these as facts)

- **[U]** How any of this looks on screen. I read source code, not screenshots. Every page needs a human visual check (the project's own `todo.md` says the AI model cannot see images **[V]**).
- **[A]** The exact behaviour of `shadcn` CLI 4.22.1 with a hand-written `components.json`. A fallback is in the troubleshooting table.
- **[A]** Whether the export download endpoint supports HTTP Range requests (needed for fast `<video>` previews in the showcase).
- **[U]** Velora's exact copyright line for its MIT notice. Copy it from their site or repo yourself.
- **[A]** The `--yes` flag of `npx shadcn@latest add` (check `npx shadcn@latest add --help`).

---

## 1. Goal and scope

Build a frontend that is modern, glowing and animated, uses all 9 Velora elements, and still does what the current UI does: ingest a video, show live job progress, review and edit clips, export, and configure providers.

| ID | UI requirement |
|---|---|
| UI-1 | Same four routes keep working: `/`, `/jobs/:jobId`, `/jobs/:jobId/clips`, `/settings` **[V]** |
| UI-2 | No change to the HTTP API contract. Frontend-only work (one optional backend step is marked) |
| UI-3 | Works fully offline: no remote fonts, images or scripts (rule 19, local first) |
| UI-4 | Respects `prefers-reduced-motion` |
| UI-5 | Keyboard accessible, visible focus everywhere |
| UI-6 | Usable while the GPU is busy transcribing (see the effects budget, section 3 D-015) |
| UI-7 | `npm run build` passes `tsc -b` strict mode and CI **[V: ci.yml runs `npm ci` and `npm run build`]** |
| UI-8 | Free and MIT-compatible only (rule 18, rule 20) |

Out of scope: new product features, new pages, backend changes (except optional step 10b), mobile app.

---

## 2. Verified facts about the current project

| Fact | Source |
|---|---|
| Frontend is Vite 6.4.3, React 18.3.1, React Router 6.30.4, TypeScript 5.9.3, Tailwind and `@tailwindcss/vite` 4.3.3 (locked) | `frontend/package.json`, `package-lock.json` |
| Build output goes to `../backend/autoclip/static`, with `emptyOutDir: true` | `frontend/vite.config.ts` |
| Dev server runs on 5173 and proxies `/api` to `127.0.0.1:8000` | `frontend/vite.config.ts` |
| FastAPI mounts `/assets` and returns `index.html` for any non-API, non-file path, so deep links work on refresh | `backend/autoclip/app.py` |
| No Content-Security-Policy header is set | grep of `app.py` found none |
| Routes: `/`, `/jobs/:jobId`, `/jobs/:jobId/clips`, `/settings` | `src/main.tsx` |
| Job progress arrives by Server-Sent Events at `/api/jobs/{id}/events` with `snapshot`, `progress`, `done`, `failed`, `cancelled` events | `src/useJobStream.ts`, `jobs/events.py` |
| Pipeline stages: prepare, transcribe, highlights, reframe, captions, export | `JobProgress.tsx`, `runner.py` |
| Fonts are bundled locally: Instrument Serif (regular and italic) and Archivo (variable) | `src/fonts/`, `index.css` |
| tsconfig is strict with `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`. It is a single file (not solution-style) | `frontend/tsconfig.json` |
| There is no shadcn setup: no `components.json`, no `@/` alias, no `lib/utils` | file tree |
| The API has **no thumbnail endpoint**. Thumbnails exist on disk (every 5 s, 160 px wide) but are not served | grep of `backend/autoclip/api/` |
| Exported clips are downloadable at `ExportRecord.download_url` | `src/api.ts` |
| **Pre-existing bug:** `text-ink-500` is used 25 times but `--color-ink-500` is not defined, so those texts get no colour | grep of `index.css` and `*.tsx` |
| The OS is Windows, GPU is an RTX 2050 with 4 GB VRAM, Whisper runs as `int8_float16` | `todo.md`, `decision.md` D-008 |
| Local fork license is MIT, copyright Jad Ghazi | `my-project/LICENSE` |
| The README says only transcript text is ever sent to a cloud provider, and with Ollama nothing is sent | `my-project/README.md` |
| CI: Node 22, `npm ci`, then `npm run build` in `frontend/` | `.github/workflows/ci.yml` |

Verified facts about the Velora components (fetched from their registry JSON, section Appendix A): they are plain React + Tailwind v4 files that import `cn` from `@/lib/utils`, six of them need the `motion` package, and none of them needs Next.js. `motion` 14.6.0 is MIT and supports React `^18 || ^19` **[V: npm view]**, so **no React upgrade is needed**.

---

## 3. Decisions to append to `decision.md`

Paste these into `decision.md` before starting (rule 27). Status is **Proposed**. Change it to **Accepted** when you approve.

```
## D-009: Replace the visual layer, keep the logic layer

- Date: 2026-10-25
- Status: Proposed
- Context: The user wants the frontend removed and rebuilt with Velora elements. The current frontend contains working, tested logic (API client, SSE hook, video player with crop overlay, trim bar, caption editor).
- Options considered:
  1. Delete everything and rewrite: maximum freedom, but re-creates solved bugs and violates rule 9.
  2. Keep logic files, replace page markup and CSS: same new look, far less risk.
- Decision: Option 2. Keep `api.ts`, `useJobStream.ts`, `ClipPlayer.tsx`, `TrimBar.tsx`, `CaptionEditor.tsx`, `ErrorNote.tsx`. Rewrite page markup, shell and CSS.
- Rationale: Verified file sizes and behaviour in the repo (ClipPlayer 532 lines, TrimBar 172, CaptionEditor 107).
- Consequences: The kept components must be re-skinned (class swaps, see Appendix B).
- Rules check: Rule 9 (no duplicate logic), rule 6 (no dead code).
- Review trigger: If a kept component blocks the new design.

## D-010: Stay on Vite + React 18 + React Router; no Next.js, no React 19 upgrade

- Date: 2026-10-25
- Status: Proposed
- Context: Velora is marketed on Next.js 16 and React 19. Ruco's backend serves a static Vite build.
- Options considered:
  1. Move to Next.js: breaks the "one Python process serves the built UI" design (docs/ARCHITECTURE.md).
  2. Stay on Vite and React 18: the Velora files are framework-neutral and `motion` supports React 18.
  3. Upgrade to React 19: unnecessary now.
- Decision: Option 2.
- Rationale: Fetched Velora sources use no Next.js APIs. `motion` peer range is `^18 || ^19` (npm view).
- Consequences: Velora demo snippets that pass `ref` as a prop to a custom component (the Animated Beam demo) will not work on React 18. Our own code attaches refs to plain DOM elements instead.
- Rules check: Rule 22 (no needless dependency change).
- Review trigger: If `npm run build` or the browser console shows a React 18 incompatibility.

## D-011: Use the shadcn CLI with a hand-written components.json, not `shadcn init`

- Date: 2026-10-25
- Status: Proposed
- Context: `shadcn init` rewrites `src/index.css` with its own colour variables, which would overwrite the Ruco theme.
- Options considered:
  1. `shadcn init`: automatic, but modifies the stylesheet and may add packages we did not choose.
  2. Write `components.json`, `lib/utils.ts` and the alias by hand, then use `shadcn add <url>` only to copy component files.
- Decision: Option 2.
- Rationale: Full control over every changed line (rule 3).
- Consequences: If the CLI rejects the manual file, fall back to the manual-copy path in the troubleshooting table.
- Rules check: Rules 3, 6.
- Review trigger: CLI errors on the manual `components.json`.

## D-012: New dependencies

- Date: 2026-10-25
- Status: Proposed
- Context: Rule 22 requires an entry for each new dependency.
- Decision: Add `motion` (MIT), `clsx` (MIT), `tailwind-merge` (MIT), and `@types/node` (dev, for the Vite alias). No icon library: pipeline nodes use numerals.
- Rationale: Licenses and peer ranges checked with `npm view` on 2026-10-25. `motion` is required by 6 of the 9 Velora files. `clsx` and `tailwind-merge` are what `cn()` uses.
- Consequences: Slightly larger bundle. Measure it (step 13).
- Rules check: Rules 18, 20, 22.
- Review trigger: If the bundle grows beyond an agreed budget.

## D-013: Theme "Ruco Aurora" supersedes the "sodium darkroom" brief

- Date: 2026-10-25
- Status: Proposed
- Context: The old brief in `index.css` says one orange accent and never a gradient. Velora's Text Hover Effect and Globe are built around a three-stop brand gradient.
- Decision: Violet-black neutrals, brand gradient violet → magenta → amber. The sodium orange family becomes the warm end of the gradient.
- Consequences: The old brief comment in `index.css` must be removed so the file does not contradict itself.
- Rules check: Rule 6 (no stale comments).
- Review trigger: User dislikes the palette (swap values only, see alternates in section 4).

## D-014: Patching copied Velora files is allowed, and limited to 3 patches

- Date: 2026-10-25
- Status: Proposed
- Context: shadcn-style components are copied into the repo and become our code.
- Decision: Exactly three patches, each listed in this guide: (1) Navbar Menu uses React Router `NavLink` for route links, (2) Animated Beam reads brand colours from CSS variables, (3) Hero Parallax can show a `<video>` frame instead of an `<img>`.
- Consequences: Re-running `shadcn add` for these three files overwrites the patches. Keep the patches in `docs/vendor-patches.md`.
- Rules check: Rules 6, 27.
- Review trigger: Velora releases a version that supports these natively.

## D-015: Effects budget per route (GPU is shared with Whisper and Ollama)

- Date: 2026-10-25
- Status: Proposed
- Context: The 4 GB RTX 2050 transcribes and runs the LLM while the user watches the job screen **[V: D-008]**.
- Decision:

| Route | Allowed | Forbidden |
|---|---|---|
| `/` Home | everything | n/a |
| `/jobs/:id` | Navbar, Beam, Terminal, Loaders, Blur Fade | Globe, Flickering Grid, Hero Parallax |
| `/jobs/:id/clips` | Navbar, Blur Fade (rows), Loaders | Globe, Grid (except a small empty state), Parallax, Beam |
| `/settings` | Navbar, Blur Fade, Terminal, Loaders | Globe, Grid, Parallax, Beam |

- Rules check: UI-6.
- Review trigger: Frame drops measured on the job screen (step 13).

## D-016: No remote images or fonts; showcase previews come from exported clips

- Date: 2026-10-25
- Status: Proposed
- Context: The Hero Parallax demo loads Unsplash photos. That breaks offline use.
- Options considered:
  1. Hot-linked photos: not allowed (rule 19).
  2. Patch the card to show a `<video>` frame from `ExportRecord.download_url` (no backend change).
  3. Add a backend thumbnail endpoint (new API surface).
- Decision: Option 2 now. Option 3 only if video previews prove too slow.
- Consequences: Depends on the download endpoint supporting Range requests **[A]**.
- Rules check: Rules 19, 22.
- Review trigger: Showcase loads slowly with 15 videos.

## D-017: Globe is decorative and uses no invented data

- Date: 2026-10-25
- Status: Proposed
- Context: Ruco has no geographic data. Fake city markers would be an invented fact (rule 13).
- Decision: One symbolic marker "This machine", no arcs, `label="Decorative globe"`. Never pin your real location.
- Review trigger: User decides to drop the Globe (delete the section, nothing else depends on it).
```

Add these to the **Pending decisions** list in `decision.md`: product display name (Q1), thumbnail endpoint (D-016 option 3), final license for `my-project/` (already pending).

---

## 4. Design system

### 4.1 The look in one sentence

A violet-black room with soft glow, hairline borders, large serif-italic headlines, and one gradient that appears only on the things that matter (headline word, wordmark, beams, globe, primary button).

### 4.2 Tokens (paste into `src/index.css`)

Replace the old `@theme { ... }` block (the one with ink and sodium values) with the blocks below. Keep the `@font-face` blocks and the font variables.

```css
/* Always emit the whole palette, because :root below references it. */
@theme static {
  --font-display: 'Instrument Serif', Georgia, serif;
  --font-sans: 'Archivo', ui-sans-serif, system-ui, sans-serif;

  /* Violet-black neutrals (hue 285). ink-500 was missing before; it is now defined. */
  --color-ink-900: oklch(0.135 0.018 285);
  --color-ink-850: oklch(0.165 0.020 285);
  --color-ink-800: oklch(0.200 0.022 285);
  --color-ink-700: oklch(0.260 0.024 285);
  --color-ink-600: oklch(0.340 0.024 285);
  --color-ink-500: oklch(0.600 0.020 285);
  --color-ink-400: oklch(0.660 0.018 285);
  --color-ink-300: oklch(0.720 0.016 285);
  --color-ink-200: oklch(0.840 0.012 285);
  --color-ink-100: oklch(0.945 0.008 285);

  --color-signal-good: oklch(0.760 0.150 160);
  --color-signal-bad:  oklch(0.660 0.200 25);

  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
}

:root {
  /* Brand gradient: violet -> magenta -> amber (amber is the old sodium orange family). */
  --brand-from: oklch(0.62 0.25 292);
  --brand-via:  oklch(0.70 0.24 345);
  --brand-to:   oklch(0.80 0.16 65);
  --brand:      var(--brand-via);

  /* shadcn semantic tokens, which the Velora files read. */
  --background: var(--color-ink-900);
  --foreground: var(--color-ink-100);
  --card: var(--color-ink-850);
  --card-foreground: var(--color-ink-100);
  --popover: var(--color-ink-850);
  --popover-foreground: var(--color-ink-100);
  --primary: var(--brand);
  --primary-foreground: var(--color-ink-900);
  --secondary: var(--color-ink-800);
  --secondary-foreground: var(--color-ink-100);
  --muted: var(--color-ink-800);
  --muted-foreground: var(--color-ink-300);
  --accent: var(--color-ink-800);
  --accent-foreground: var(--color-ink-100);
  --destructive: var(--color-signal-bad);
  --border: var(--color-ink-700);
  --input: var(--color-ink-700);
  --ring: var(--brand);
}

/* `inline` because these values point at other variables. This is what makes
   bg-brand, from-brand-from, text-muted-foreground, ring-ring, etc. exist. */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-brand: var(--brand);
  --color-brand-from: var(--brand-from);
  --color-brand-via: var(--brand-via);
  --color-brand-to: var(--brand-to);
}

/* TEMPORARY legacy aliases so un-migrated files keep working (removed in step 12). */
@theme static {
  --color-sodium-400: oklch(0.78 0.20 345);
  --color-sodium-500: var(--brand);
  --color-sodium-600: oklch(0.60 0.22 345);
  --color-sodium-700: oklch(0.45 0.16 345);
}
```

Add one rule to the existing `@layer base`. Tailwind v4 changed the default border colour to `currentColor`, so without it every Velora `border` looks bright white:

```css
@layer base {
  *, ::before, ::after { border-color: var(--border); }
}
```

In the same file: change `html`/`body` backgrounds to `var(--background)`, `::selection` to `var(--brand)`, `:focus-visible` outline to `var(--ring)`, and the two `.btn-primary` rules to use `var(--brand)` (hover: `color-mix(in oklab, var(--brand) 88%, white)`). Delete the header comment about the "darkroom" brief (D-013). Keep `.btn`, `.field`, `.eyebrow`, `.numeric`, `.rule`.

Contrast: body text should be at least 4.5:1 against the background. **[A]** My OKLCH choices are estimates. Check with the DevTools contrast picker and nudge `--color-ink-300` and `--color-ink-500` if needed.

### 4.3 Typography

| Use | Font | Class |
|---|---|---|
| Big headlines | Instrument Serif (italic for the gradient word) | `font-display` |
| UI text | Archivo | `font-sans` |
| Giant RUCO wordmark | Archivo, weight 900 | `font-sans font-black` (Instrument Serif has no bold, so it would be fake-bolded) |
| Numbers, timecodes | Archivo with tabular figures | `numeric` |

### 4.4 Motion rules

- One entrance language: **Blur Fade**, `direction="up"`, `offset` 16, stagger by `0.08 s` per item, capped at `0.5 s` total delay.
- Loops (Flickering Grid, Beams, Globe rotation) only on Home and the job screen, per D-015.
- Reduced motion: every Velora component handles it itself **[V: sources]**. Do not add custom animations that ignore it. The existing global `prefers-reduced-motion` rule in `index.css` stays.

### 4.5 Alternate palettes (change only these three lines, plus the hue `285` in the ink scale)

| Name | brand-from | brand-via | brand-to |
|---|---|---|---|
| Ruco Aurora (default) | `oklch(0.62 0.25 292)` | `oklch(0.70 0.24 345)` | `oklch(0.80 0.16 65)` |
| Cyber Mint | `oklch(0.70 0.14 215)` | `oklch(0.78 0.15 165)` | `oklch(0.88 0.17 115)` |
| Ember (the old orange) | `oklch(0.65 0.20 30)` | `oklch(0.76 0.168 55)` | `oklch(0.86 0.14 90)` |

---

## 5. Page blueprints

Keep every existing handler and API call. Only structure and styling change.

### 5.1 Shell (`App.tsx`) on every page

```
        ┌──────────────────────────────────────────┐
 Ruco   │  New  ·  Pipeline ▾  ·  Settings          │   CUDA · RTX 2050 · ready
        └──────────────────────────────────────────┘
```

- A floating pill `NavbarMenu`, fixed at the top centre, `z-50`.
- Items: `New` (route `/`), `Pipeline` (a hover panel listing the 6 real stages with their real notes from `STAGES`), `Settings` (route `/settings`).
- Keep `SystemBadge` on the right, with the same `api.system()` call.
- Route links need patch 1 (step 8). Without it they do a full page reload and drop the SSE connection.
- Leave top padding on `<main>` (about `pt-24`) because the pill floats over it.

### 5.2 Home (`pages/Ingest.tsx`, can be renamed `Home.tsx`)

```
┌ hero (relative, overflow-hidden) ──────────────────────────────┐
│ ░ FlickeringGrid behind, masked to fade out at the edges ░      │
│ LOCAL · NO ACCOUNTS · NO WATERMARKS                              │
│ Long video in.                                                    │
│ Shorts out.        <- "Shorts" in the brand gradient             │
│ [ paste a link _____________________ ]  [ Start ]                │
│ [ drop a file ]    Advanced options ▸                            │
└──────────────────────────────────────────────────────────────────┘
        R   U   C   O     <- TextHoverEffect, glows under the pointer
  1 ─── 2 ─── 3 ─── 4 ─── 5 ─── 6     <- PipelineDiagram, all beams on
┌ Your clips (only if exported clips exist) ─────────────────────┐
│ three rows of cards that slide apart as you scroll  (HeroParallax)│
└──────────────────────────────────────────────────────────────────┘
  Everything stays on your machine.            (Globe, decorative)
  Recent runs (existing list)
```

Details:

- **Flickering Grid** needs sizing maths. Its width is fixed by `columns x (squareSize + gap)`, it does not stretch **[V: source]**. For a 1400 px hero use `squareSize 8`, `gap 24` (pitch 32 px), `columns 44`, `rows 20`, about 880 cells. Keep it at 900 cells or fewer. Colour it with `text-brand/40` (it paints with `currentColor`). Fade the edges: `[mask-image:radial-gradient(60%_70%_at_30%_40%,black,transparent)]`. The parent must be `relative overflow-hidden`; content on top must be `relative`.
- **Text Hover Effect**: `<TextHoverEffect text="RUCO" className="mx-auto w-full max-w-5xl font-sans font-black" />`. It measures the font after `document.fonts.ready`, so it must use a font that is bundled and loaded **[V: source]**.
- **Showcase (Hero Parallax)**: needs at least 6 items to look right. Hide the section below that. Break it out of the `max-w-[1600px]` main container with negative margins (`-mx-6 lg:-mx-10`) so the rows can slide edge to edge. Data and the video patch are in step 10.
- **Globe section**: two columns. Left: the privacy copy. Right: the Globe. Use only true statements from the README **[V]**: transcript text only is sent to a cloud provider if you pick one; with Ollama nothing leaves the machine; no accounts, no watermarks.
- **Loaders**: `SpinnerLoader size="sm"` inside the Start button while `busy`, colour with `text-current`.
- **Blur Fade**: wrap eyebrow, headline, form, drop zone, each section. Stagger.

### 5.3 Job screen (`pages/JobProgress.tsx`)

```
 EYEBROW: running                                       62%  [Cancel]
 Job title (serif)
 ①━━━②━━━③ ─ ─ ④ ─ ─ ⑤ ─ ─ ⑥       <- PipelineDiagram, live
 ┌ Terminal ─────────────────────────────────────────────┐
 │ ✔ Prepare                                              │
 │ ✔ Transcribe                                           │
 │ … Highlights: Choosing the moments worth cutting ▍     │
 └────────────────────────────────────────────────────────┘
 stage list with hairline progress (existing logic)   [DotsLoader on the active one]
```

- Beams only on steps that are done or active. Pending steps get no beam.
- The Terminal shows **real events only** (rule 13): completed stages and the active stage's static note. Do not put the frequently changing `progress.message` in the Terminal. Retyping a changing line looks broken. It stays in the stage list as it does today.
- Failure: a red `✕` line with `job.error`, and the existing Retry flow.
- Nothing here may animate heavily (D-015).

### 5.4 Review (`pages/Review.tsx`)

Keep the layout and all logic (`ClipPlayer`, `TrimBar`, `CaptionEditor`, `ClipRow`). Restyle only:

- Blur Fade on `ClipRow`s (stagger capped at 0.5 s).
- `SpinnerLoader` on the Export button while exporting.
- `EmptyState`: a small Flickering Grid (about 20 x 8 cells) behind the text.
- Replace `sodium-*` classes using Appendix B.

### 5.5 Settings (`pages/Settings.tsx`)

- Keep the forms. Blur Fade between sections.
- **System check** panel: a Terminal whose lines come from `api.system()` (real values): ffmpeg version, libass, NVENC, accel and GPU, compute type, diarization **[V: `SystemStatus` fields]**. Example lines are built with a small pure function, no invented output.

---

## 6. Build steps (A to Z)

Rules for the person or agent doing this: one step at a time, run the **Verify** before the next step, and if a **Verify** fails go to section 8 before improvising (rules 2 and 3). `<ROOT>` means the folder that contains `my-project/`.

### Step 0. Safety and baseline

1. Move the project out of OneDrive (Q5), for example to `C:\dev\RUCO`. Reason: OneDrive tries to sync thousands of `node_modules` files and can lock them (`EPERM`, `EBUSY`). **[A]** Common cause, not reproduced here.
2. Make a branch so you can roll back:
   ```powershell
   cd <ROOT>\my-project
   git init            # skip if it is already a repository
   git add -A; git commit -m "baseline before frontend redesign"
   git checkout -b frontend-redesign
   ```
3. Prove the baseline works **before** changing anything:
   ```powershell
   cd frontend
   npm ci
   npm run build
   cd ..
   autoclip doctor
   ```
- **Verify:** `npm run build` finishes with no errors and `autoclip doctor` says Ready.
- **If it fails:** fix the baseline first. Never start a redesign on a broken build.

### Step 1. Dependencies (D-012)

```powershell
cd <ROOT>\my-project\frontend
npm install motion clsx tailwind-merge
npm install -D @types/node
```
- **Verify:** `npm ls motion clsx tailwind-merge react` shows no `ERESOLVE` or unmet-peer warnings, and `react` is still 18.3.1.
- **If it fails:** troubleshooting T-1.

### Step 2. The `@/` alias (the shadcn CLI and every Velora file need it)

`tsconfig.json`, add to `compilerOptions`:

```json
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] }
```

`vite.config.ts`, add the import and the alias (keep everything else):

```ts
import path from 'node:path'
// ...
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  // build and server blocks unchanged
})
```

- **Verify:** `npm run typecheck` passes. (Nothing imports `@/` yet, so this only proves the config is valid.)

### Step 3. `cn()` helper and `components.json`

`src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

`frontend/components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```
**[A]** This is the long-standing format. If the CLI 4.x complains about missing fields, see T-3.

Creating `lib/utils.ts` yourself matters: Animated Beam and Blur Fade import `cn` but do **not** declare the `utils` dependency in their registry entries **[V: source]**, so the CLI would not create it for them.

- **Verify:** `npm run typecheck` passes.

### Step 4. Theme tokens

Apply section 4.2 to `src/index.css`. Also update `index.html`: `<title>` to the product name (Q1) and the favicon fill colour to match `--brand`.

- **Verify:**
  1. `npm run build` passes.
  2. Run `npm run dev` together with `autoclip serve`, open `http://localhost:5173`. The app still works, now in violet-black with pink accents (legacy `sodium-*` classes point at the brand).
  3. DevTools, Elements, select `<html>`, Computed: `--brand`, `--brand-from`, `--background` all have values.
  4. Text that used `text-ink-500` now has a visible muted colour (the old bug is gone).
- **If it fails:** T-5, T-6.

### Step 5. Install the 9 Velora components, one at a time

Run from `frontend/`. The loop stops at the first failure:

```powershell
$items = "flickering-grid","text-hover-effect","navbar-menu","loaders","hero-parallax","animated-beam","blur-fade","globe","terminal"
foreach ($i in $items) {
  npx shadcn@latest add "https://velora.colorlib.com/r/$i.json" --yes
  if ($LASTEXITCODE -ne 0) { Write-Host "ADD FAILED: $i"; break }
  npm run typecheck
  if ($LASTEXITCODE -ne 0) { Write-Host "TYPECHECK FAILED after: $i"; break }
}
```

- **Verify:**
  - `src/components/velora/` contains 9 `.tsx` files.
  - `git diff src/index.css` shows the CLI added the Flickering Grid keyframes (`@keyframes flicker`) and `--animate-flicker` **[V: registry JSON]**.
  - `git diff package.json` shows nothing unexpected.
- **If it fails:** T-2 (network), T-3 (CLI), T-4 (missing alias).
- **Offline fallback:** each registry file is plain TSX. Download `https://velora.colorlib.com/r/<name>.json` in a browser, copy the `content` of the file entry into `src/components/velora/<name>.tsx`, then add the keyframes by hand (T-7).

### Step 6. Temporary component lab (deleted in step 12)

Create a temporary route `/lab` that renders each element once, using the demo snippets you already have from Velora. Purpose: prove tokens, fonts and motion work **before** touching real pages.

- **Verify (human eyes):**
  - Flickering Grid squares flicker in the brand colour.
  - Text Hover Effect draws in, then glows under the pointer (Archivo Black, not a fallback font).
  - Navbar pill morphs between items; Escape closes the panel.
  - Loaders are visible and coloured (`text-brand`).
  - Globe shows dots and a pink glow ring.
  - Beam lines connect the nodes. If not: T-9.
  - Terminal types its lines when scrolled into view.
  - Blur Fade items appear.
  - Turn OFF "Show animations in Windows" (Settings, Accessibility, Visual effects). Reload. Everything still shows, and nothing animates.

### Step 7. Shared pieces (before the pages use them)

1. Move `STAGES` out of `JobProgress.tsx` into `src/stages.ts` and export it, because Home and the job screen both need it (rule 9).
2. `src/components/PipelineDiagram.tsx` (refs go on plain `div`s, so it is safe on React 18):

```tsx
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
```

3. `src/lib/stageLog.ts` (pure function, easy to test):

```ts
import type { Job } from '@/api'

interface Stage { key: string; label: string; note: string }

/** Terminal lines for a job. Only facts the API reported, nothing invented. */
export function buildStageLog(stages: readonly Stage[], job: Job): string[] {
  const active = stages.findIndex((s) => s.key === job.current_stage)
  const lines: string[] = []
  stages.forEach((stage, i) => {
    const finished = job.status === 'done' || (active >= 0 && i < active)
    if (finished) lines.push(`✔ ${stage.label}`)
    else if (i === active && job.status === 'running') lines.push(`… ${stage.label}: ${stage.note}`)
    else if (i === active) lines.push(`✕ ${stage.label}: ${job.error ?? job.status}`)
  })
  return lines
}
```
Memoize its result with `useMemo` wherever it is passed to `Terminal`, because the Terminal restarts its typing timer when the `lines` array identity changes **[V: source]**.

- **Verify:** `npm run typecheck` passes. Add a unit test only if the project already has a frontend test setup (it does not **[V]**, so skip it, rule 22).

### Step 8. Shell and Navbar, plus patch 1

**Patch 1 (D-014): route links in the Navbar.** In `src/components/velora/navbar-menu.tsx`, add `import { NavLink } from 'react-router-dom'` and replace the link branch:

```tsx
// BEFORE
<a ref={triggerRef} href={href} className={cn("block", triggerClass)}>
  {pill}
  {label}
</a>

// AFTER
<NavLink ref={triggerRef} to={href} end={href === "/"} className={cn("block", triggerClass)}>
  {pill}
  {label}
</NavLink>
```

Then build the shell from section 5.1. The "Pipeline" panel content is a `<ul>` built from `STAGES` (real labels and notes).

- **Verify:** clicking `New` and `Settings` changes pages **without a full reload** (watch the Network tab: no new document request). Open a job, switch pages, come back: the SSE stream reconnects by itself **[V: useJobStream comment]**.
- **If it fails:** T-10.

### Step 9. Home

Implement section 5.2. Do these in order, verifying after each:

1. Hero with Blur Fade and the gradient word. Verify the form still starts a job end to end.
2. Add the Flickering Grid. Verify it covers the hero and the cell count is 900 or fewer.
3. Add the wordmark. Verify the glow follows the pointer and the font is Archivo Black.
4. Add the idle `PipelineDiagram` (all states `'done'`).
5. Add the Globe section.
6. Loaders on the Start button.

- **Verify (all):** URL ingest and file drop still create a job and navigate to `/jobs/:id` **[V: existing behaviour]**. Keyboard: Tab reaches every control with a visible ring.

### Step 10. Showcase (Hero Parallax) and patch 3

**Data (no backend change).** `ExportRecord.download_url` and `Clip.exports` exist **[V]**:

```ts
// src/lib/showcase.ts
import { api, type Job } from '@/api'

export interface ShowcaseClip { title: string; video: string; href: string }

export async function loadShowcase(jobs: Job[]): Promise<ShowcaseClip[]> {
  const done = jobs.filter((j) => j.status === 'done')
  const lists = await Promise.all(done.map((j) => api.listClips(j.id)))
  return lists.flat().flatMap((clip) =>
    clip.exports.length
      ? [{ title: clip.title, video: clip.exports[0].download_url, href: `/jobs/${clip.job_id}/clips` }]
      : [],
  ).slice(0, 15)
}
```

**Patch 3 (D-014/D-016).** In `hero-parallax.tsx`: add `video?: string` to `HeroParallaxProduct`, and replace the `<img ... />` element with:

```tsx
{item.video ? (
  <video
    src={`${item.video}#t=0.5`}
    muted
    playsInline
    preload="metadata"
    aria-hidden
    className="size-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover/hero-card:scale-105"
  />
) : (
  <img src={item.image} alt="" loading="lazy" className="size-full object-cover" />
)}
```
(`image` is required in the component's type. Pass `image=""` for video items, or make `image` optional.) Exported clips are vertical, so size the cards with `cardClassName="aspect-[9/16] w-40 sm:w-44"`. It overrides the default 4:3 card because `cn()` uses `tailwind-merge` **[V: source]**.

Links in the cards are plain `<a href>`, which reloads the page. Fix the same way as patch 1 or accept the reload for the showcase.

- **Verify:** with 6 or more exported clips the section shows and scrolls; with fewer it is hidden. DevTools Network: no request leaves `localhost` (offline rule). No `unsplash` string anywhere:
  ```powershell
  Get-ChildItem -Recurse src | Select-String -Pattern "unsplash"
  ```
  must print nothing.
- **Optional 10b (backend, needs a decision entry):** add `GET /api/clips/{id}/thumbnail` if video previews are slow. Do not do it unless D-016 review trigger fires.

### Step 11. Job screen, Review, Settings

- **Job screen:** `PipelineDiagram` with real states (the same `state` logic that exists in `JobProgress.tsx`), `Terminal` with `useMemo(() => buildStageLog(STAGES, job), [job])`, `DotsLoader` beside the active stage. No Globe, grid or parallax (D-015).
- **Review:** class swaps from Appendix B, Blur Fade on rows, `SpinnerLoader` on export, small grid in the empty state. Do not touch the logic of `ClipPlayer`, `TrimBar`, `CaptionEditor`.
- **Settings:** Blur Fade, plus the system-check Terminal built from `api.system()` fields.

- **Verify, run a real job end to end** with `test-videos/youtube-test.mp4` **[V: todo.md]**: progress moves, Terminal fills, job completes, Review opens, trimming, caption edit and export still work, the downloaded MP4 plays.

### Step 12. Cleanup (rule 6: no dead code)

1. Delete the `/lab` route and file.
2. Replace the remaining `sodium-*` classes using Appendix B, then delete the temporary legacy alias block from `index.css`.
3. Delete unused CSS (`.rise`, `.sweep` once nothing uses them).
4. Check for leftovers; each command must print nothing:
   ```powershell
   Get-ChildItem -Recurse src -Include *.tsx,*.ts,*.css | Select-String -Pattern "sodium-|lab|unsplash|TODO"
   Get-ChildItem -Recurse src -Include *.tsx | Select-String -Pattern "class=\"rise\"|\brise\b"
   ```
5. `npm run typecheck` (strict, with `noUnusedLocals`) must pass.

### Step 13. Verification pass (section 9 has the full checklist)

```powershell
cd <ROOT>\my-project\frontend
npm run build
cd ..
autoclip serve
```
Open `http://localhost:8000`, then open `http://localhost:8000/jobs/<an existing id>` directly and press F5 (deep-link refresh must work **[V: app.py SPA fallback]**).

### Step 14. Docs and licenses

1. `decision.md`: set D-009 to D-017 to Accepted (or note changes).
2. `project.md`: update Status (it still says "No project code has been written yet", which is stale **[V]**) and close open question 5 (interface = local web UI on Vite and React).
3. `todo.md`, `CHANGELOG.md`: log the redesign.
4. `docs/ARCHITECTURE.md`: no change needed unless it names the frontend stack; it only says "compiled React bundle" **[V]**.
5. `docs/vendor-patches.md`: write down the 3 patches (D-014).
6. `THIRD_PARTY_NOTICES.md`: list Velora UI components (MIT), `motion`, `clsx`, `tailwind-merge` (all MIT), with their copyright lines. **[U]** Copy Velora's exact copyright and license text from their site or repository.
7. Commit: `git add -A; git commit -m "frontend: Ruco Aurora redesign with Velora elements"`.

---

## 7. Where the data comes from (nothing invented)

| UI element | Real data source |
|---|---|
| System badge, Settings Terminal | `GET /api/system` (`SystemStatus`) |
| Recent runs | `GET /api/jobs?limit=8` |
| Showcase | `GET /api/jobs/{id}/clips`, then `Clip.exports[0].download_url` |
| Job progress, Terminal, Beam | SSE `/api/jobs/{id}/events` and `Job.current_stage` |
| Pipeline panel in Navbar | `STAGES` (labels and notes) |
| Privacy copy | README statements |
| Globe | none, decorative |

---

## 8. Troubleshooting matrix

| ID | Symptom | Cause | Fix |
|---|---|---|---|
| T-1 | `npm install` fails with `EPERM`, `EBUSY` or is extremely slow | Project is inside OneDrive **[A]** | Move the project to `C:\dev\RUCO`, or pause OneDrive sync, delete `node_modules`, retry |
| T-1b | PowerShell says "running scripts is disabled" for `npm` or `npx` | Execution policy | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, or run `npm.cmd` and `npx.cmd` |
| T-1c | `ERESOLVE` / peer-dependency error | Version mismatch | Read the message. `motion` supports React `^18 \|\| ^19` **[V]**, so a React error means another package conflicts. Do not use `--force` without a decision entry |
| T-2 | `shadcn add` hangs or says it cannot fetch | `velora.colorlib.com` unreachable (firewall, DNS, offline) | Open `https://velora.colorlib.com/r/<name>.json` in a browser. If it loads, retry in a normal terminal. If not, use the manual copy path (step 5) |
| T-3 | CLI rejects `components.json` or asks questions | CLI 4.x expects extra fields **[A]** | In an empty scratch folder run `npm create vite@latest scratch -- --template react-ts`, then `npx shadcn@latest init` there, and copy its `components.json` over ours. Set `tailwind.css` to `src/index.css` |
| T-4 | `Cannot find module '@/lib/utils'` | Alias missing in `tsconfig.json` or `vite.config.ts` | Redo step 2. Both files need it. Restart the dev server |
| T-4b | Animated Beam or Blur Fade fails to compile after install | Their registry entries do not declare `utils` **[V]** | Make sure `src/lib/utils.ts` exists (step 3) |
| T-5 | `bg-brand`, `from-brand-from`, `text-muted-foreground`, `ring-ring` do nothing | Missing `--color-*` in `@theme inline` | Re-check section 4.2. Names must be `--color-brand`, `--color-brand-from`, etc. |
| T-6 | Globe has no glow, Text Hover Effect is invisible | Raw variables `--brand`, `--brand-from/via/to` missing in `:root` | Both the raw vars (`:root`) and the `--color-*` mappings (`@theme inline`) are required. Velora reads `var(--brand)` directly **[V]** |
| T-6b | Every border looks bright white | Tailwind v4 default border colour is `currentColor` | Add the base-layer border rule (section 4.2) |
| T-7 | Flickering Grid does not flicker | Keyframes were not merged | Add to `index.css`: `@theme { --animate-flicker: flicker 3s steps(1, end) infinite; }` and `@keyframes flicker { 0%, 100% { opacity: var(--flicker-max, 0.45); } 50% { opacity: var(--flicker-min, 0.08); } }` **[V: registry JSON]** |
| T-7b | Grid covers only a small centred patch | Width is `columns x (squareSize + gap)`, it does not stretch | Use the sizing maths in 5.2 (pitch 32 px for a wide hero) |
| T-7c | Page stutters with the grid | Too many animated nodes **[A]** | Keep 900 cells or fewer. Fewer columns, bigger pitch. Check DevTools Performance |
| T-8 | Wordmark is blank, wrong size, or the wrong font | Measured before the font loaded, or font class missing | Use `font-sans font-black`. Confirm Archivo loads in DevTools Network (font request). Hard refresh |
| T-9 | Animated Beam draws nothing | A ref is `null` (the Velora demo passes `ref` as a prop to a custom component, which needs React 19) **[V]**, or the container is not `relative`, or the nodes are not mounted | Attach refs to plain DOM elements as in `PipelineDiagram`. Make sure the container has `relative` and the nodes are inside it |
| T-9b | Beam colours stay violet and cyan | The defaults are `#8b5cf6` and `#22d3ee`, not our tokens **[V]** | Patch 2: in `animated-beam.tsx` set the defaults to `"var(--brand-from)"` and `"var(--brand-to)"`, and replace each `stopColor={...}` attribute with `style={{ stopColor: ... }}`. Velora's own Text Hover Effect uses the `style` form **[V]**. **[A]** `var()` inside an SVG attribute is not reliable, so use `style` |
| T-10 | Navbar links reload the page | Plain `<a href>` for route links **[V]** | Apply patch 1 (step 8) |
| T-10b | Navbar pill and panel never show | `NavbarMenu` is covered or clipped | Give the nav `z-50` and make sure no ancestor has `overflow-hidden` |
| T-11 | Showcase cards are empty | No `image`, and the `<video>` patch is not applied | Apply patch 3. Check the clip really has `exports` |
| T-11b | Showcase videos load slowly or do not seek | Download endpoint may not support Range **[A]** | Open one `download_url` in DevTools and check for a `206` response. If slow, plan the thumbnail endpoint (D-016 option 3) |
| T-11c | Showcase rows do not slide to the edges | Parent container clips them | Break out of `max-w` with negative margins (5.2) |
| T-11d | Demo images from Unsplash show in dev but fail offline | Remote URLs | Never ship the demo data (D-016) |
| T-12 | Blur Fade content stays invisible | `whileInView` uses a `-10%` bottom margin, so items in the bottom 10% of the viewport wait for a scroll **[V]**. Also the `inView` prop is declared but unused **[V]** | Scroll a little, or pass `once={false}` while testing. Do not rely on `inView` |
| T-13 | Terminal types nothing | It starts only when scrolled into view, and restarts its timer if `lines` changes identity | Memoize `lines`. Make sure it is visible on screen |
| T-14 | Terminal colours do not match the theme | It uses fixed neutral and emerald colours **[V]** | Accepted. It is intentionally dark in a dark app. Change the classes in the file if you want |
| T-15 | TS error `TS6133 declared but never used` or `TS1484` | Strict flags (`noUnusedLocals`, `verbatimModuleSyntax`) **[V]** | Remove the unused import, or use `import type`. Do not loosen `tsconfig` |
| T-16 | After build, the app shows a 503 JSON about "frontend has not been built" | Build output missing in `backend/autoclip/static` | Run `npm run build` in `frontend/`, restart `autoclip serve` **[V: app.py]** |
| T-17 | Dev server loads but API calls fail | Backend not running | Start `autoclip serve` in another terminal (port 8000). The Vite proxy points there **[V]** |
| T-18 | Old UI still appears | Browser cache or old static folder | Hard refresh (Ctrl+Shift+R). `emptyOutDir` already clears the folder on build **[V]** |
| T-19 | UI feels janky while a job runs | The GPU is shared with Whisper and the LLM **[V: D-008]** | Respect D-015. Close other GPU-heavy tabs. Remove effects from the job screen first |
| T-20 | CI `npm ci` fails | `package-lock.json` is out of sync **[V: CI uses `npm ci`]** | Run `npm install` locally and commit the updated lock file |
| T-21 | Globe or loops keep running in a hidden tab | n/a | Globe pauses when hidden or off-screen **[V: source]**. Beams and the grid are CSS or motion loops. This is acceptable |
| T-22 | Hover pill flickers on touch devices | Hover-driven menu | Items are also buttons that open on click **[V: source]**. Test on a touch device if you plan mobile |

---

## 9. Final verification checklist (definition of done)

**Build and code**
- [ ] `npm run build` passes (strict TypeScript)
- [ ] `npm ci` works from a clean checkout (lock file committed)
- [ ] Python tests unaffected: `uv run pytest -q`
- [ ] No leftover `sodium-`, `lab`, `unsplash`, `TODO` strings (step 12)
- [ ] Only the 3 listed patches were made to Velora files
- [ ] No new dependency beyond D-012

**Behaviour (a real job, not a mock)**
- [ ] Paste-link ingest, file-drop ingest, advanced options
- [ ] Live progress, cancel, retry
- [ ] Review: play, trim, caption edit, change style and ratio, keep or discard, export, download plays
- [ ] Settings: provider switch, key save, system check lines match `autoclip doctor`
- [ ] Hard refresh on `/jobs/<id>`, `/jobs/<id>/clips`, `/settings`

**Offline and privacy**
- [ ] DevTools Network with the "localhost" filter off shows no external requests
- [ ] Fonts load from `/assets`

**Accessibility and motion**
- [ ] Keyboard only: reach every control, see the focus ring, Escape closes the Navbar panel
- [ ] With Windows animations OFF: nothing moves, nothing is hidden
- [ ] Text contrast 4.5:1 or better (DevTools picker)

**Performance (RTX 2050 laptop)**
- [ ] Home: smooth scroll with all effects on
- [ ] Job screen while Whisper runs: no dropped frames you can notice
- [ ] Bundle size noted before and after (record both numbers in `decision.md`)

**Human visual check (the AI cannot do this)**
- [ ] Every page, at 1440 px and 390 px wide
- [ ] Gradient looks intentional, not garish; glow does not hurt readability

---

## 10. Rollback

- Everything is on branch `frontend-redesign`. To abandon: `git checkout main` (or your previous branch).
- To keep the branch but drop one step: `git revert <commit>`.
- The built bundle lives in `backend/autoclip/static`. After a rollback run `npm run build` once so it matches the checked-out source.
- No backend or database change is made in steps 0 to 14, so no data migration is needed.

---

## 11. Prompt for your AI coding agent (copy and paste)

```
You are working on the Ruco project. Before anything else, read these files in order and follow them exactly:
1. agent.md  2. rules.md  3. project.md  4. decision.md  5. frontend-master-guide.md

Task: execute frontend-master-guide.md from step 0 to step 14, in order.

Protocol:
- One step at a time. After each step run its "Verify" commands and paste the real output.
- Do not start the next step until Verify passes.
- If something fails, look it up in section 8 first. If it is not covered, stop and report. Do not improvise.
- Do not touch the backend. Do not change the API contract. Do not edit files in repos/.
- Do not add dependencies beyond D-012 without a new decision entry.
- Only make the 3 Velora patches listed in D-014.
- Label every claim Verified, Assumption or Unknown. Never invent API names, props or CLI flags.
- You cannot see the screen. At the end of steps 6, 9, 10 and 11 stop and ask me to check the page visually and tell you what is wrong.
- Append the decisions from section 3 to decision.md (status Proposed) before step 1.
- When finished, give the completion report from agent.md.
```

---

## Appendix A. The 9 Velora components (verified from their registry JSON, 2026-10-25)

| Component | Needs `motion` | Declares `utils` | Theme tokens it reads | Notes |
|---|---|---|---|---|
| Flickering Grid | no | yes | text colour (`bg-current`), optional `--flicker-min`, `--flicker-max` | Plain DOM grid. Adds `@keyframes flicker` and `--animate-flicker` to your CSS |
| Text Hover Effect | yes | yes | `--brand-from`, `--brand-via`, `--brand-to` (raw vars), `foreground` | Measures the font after load; `font-bold` is the default, override with `font-black` |
| Navbar Menu | yes | yes | `background`, `muted`, `muted-foreground`, `foreground`, `popover`, `popover-foreground`, `ring` | `href` renders a plain `<a>` |
| Loaders | no | yes | text colour (`currentColor`) | 5 loaders, colour with `text-brand` |
| Hero Parallax | yes | yes | `muted`, `ring`, `background`, `border` | Uses `<img>`; `cqh` units; `container` prop for scroll boxes |
| Animated Beam | yes | **no** | `border` | Needs refs to DOM elements; defaults violet to cyan |
| Blur Fade | yes | **no** | none | `inView` prop declared but unused; `-10%` bottom margin |
| Globe | no | yes | `--brand` (raw), `brand` colour utilities, `muted-foreground`, `background`, `ring` | Canvas; pauses when hidden or off-screen |
| Terminal | yes | yes | none (fixed neutral palette) | Types only when in view; `lines` identity matters |

## Appendix B. Class migration for kept files

`ink-*` names stay valid (re-tinted, and `ink-500` now exists). Only `sodium-*` changes. Counts are from the current source **[V]**.

| Old | New |
|---|---|
| `text-sodium-500` (14) | `text-brand` |
| `border-sodium-500` (4) | `border-brand` |
| `bg-sodium-500` (3) | `bg-brand` |
| `bg-sodium-400` (1) | `bg-brand/90` |
| `border-sodium-600` (2) | `border-brand/70` |
| `bg-sodium-700/25` (2), `bg-sodium-700/10` (1) | `bg-brand/15`, `bg-brand/10` |
| `.btn-primary` background | `var(--brand)`; hover `color-mix(in oklab, var(--brand) 88%, white)` |

## Appendix C. Sources

- Velora registry files, fetched 2026-10-25: `https://velora.colorlib.com/r/<name>.json` for all 9 components.
- Project files read from your upload `Ruco-main__1_.zip`: `todo.md`, `decision.md`, `rules.md`, `project.md`, `my-project/frontend/*`, `my-project/backend/autoclip/app.py`, `api/*.py`, `README.md`, `LICENSE`, `.github/workflows/ci.yml`.
- `npm view` on 2026-10-25: `motion` 14.6.0 (MIT, React `^18 || ^19`), `clsx` 2.1.1 (MIT), `tailwind-merge` 3.7.0 (MIT), `shadcn` 4.22.1 (MIT).
- shadcn on Vite (alias in `tsconfig` and `vite.config`, `@types/node`): third-party guides at shadcn.io and shadcnstudio.com. These are not the official docs, so check `https://ui.shadcn.com/docs/installation/vite` before relying on small details.
