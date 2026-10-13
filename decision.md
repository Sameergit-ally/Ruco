# decision.md

Log of every decision made on the Viral Clipper project. New decisions are **appended** at the bottom. Old decisions are never deleted. If a decision changes, add a new entry that supersedes the old one.

---

## How to make a decision

Every decision must:

1. **Follow `rules.md`.** In particular: zero cost, local first, license compliance, no new dependency without an entry here.
2. **Be grounded in verified facts.** No guesses. Cite the source (README, LICENSE file, docs, test result).
3. **Compare at least two options,** with real trade-offs.
4. **State the cost** of the chosen option, not only the benefit.
5. **Be testable or reversible** where possible. Say how and when it will be re-checked.

### Decision checklist

- [ ] Does it respect the zero-cost constraint?
- [ ] Does it keep data local?
- [ ] Are licenses checked and compatible?
- [ ] Are the facts verified, with sources?
- [ ] Were alternatives considered?
- [ ] Are consequences and risks written down?
- [ ] Does it conflict with an earlier decision? If yes, supersede it explicitly.

### Template (copy for each new decision)

```
## D-XXX: <short title>

- Date: YYYY-MM-DD
- Status: Proposed | Accepted | Superseded by D-XXX | Rejected
- Context: <what problem or question triggered this>
- Options considered:
  1. <option A>: <pros / cons>
  2. <option B>: <pros / cons>
- Decision: <what was chosen>
- Rationale: <why, with sources>
- Consequences: <what this enables, what it costs, risks>
- Rules check: <which rules.md rules apply and how they are met>
- Review trigger: <when to revisit this decision>
```

---

## Decision log

## D-001: Use free, local-only tools

- Date: 2026-10-12
- Status: Accepted
- Context: The project must cost nothing to build or run.
- Options considered:
  1. Paid APIs (OpenAI, Groq, AssemblyAI): better quality or speed, but ongoing cost and API keys.
  2. Local tools (Whisper, Ollama, FFmpeg): free and private, but slower and hardware-dependent.
- Decision: Local, free tools only. Paid providers may be added later only as an opt-in, never the default.
- Rationale: Zero cost is a hard requirement of the project.
- Consequences: Processing may be slow on machines without a GPU. Clip-selection quality depends on the local model size.
- Rules check: Rule 18 (zero cost), Rule 19 (local first).
- Review trigger: If local model quality is too poor to meet requirement R3 or R4.

## D-002: Use AutoClip as the base project

- Date: 2026-10-12
- Status: Accepted
- Context: Needed one repo as the foundation instead of merging five.
- Options considered:
  1. AutoClip: fully local (Whisper + Ollama), MIT license, includes captions, speaker tracking and 9:16 reframing, written in Python.
  2. ViralCutter: local LLM option, good prompt, but GPL-3.0 (copyleft).
  3. OpenClip: MIT, Ollama supported, but smaller and newer.
  4. Skate: simple, but limited.
- Decision: Build on AutoClip.
- Rationale: It covers the whole pipeline locally under the MIT license, so code can be reused with attribution.
- Consequences: AutoClip is a young project, and its own README says the reframe quality bar is not fully validated. Reframe must be tested on real videos.
- Rules check: Rule 18, Rule 19, Rule 20 (MIT allows reuse with attribution).
- Review trigger: If reframe or clip quality fails testing on 2-3 real videos. Then evaluate OpenClip as the base.

## D-003: Use ViralCutter for ideas only, not code

- Date: 2026-10-12
- Status: Accepted
- Context: ViralCutter has a strong clip-finding prompt (`prompt.txt`) but its license is GPL-3.0 (verified from the LICENSE file in the zip).
- Options considered:
  1. Copy its code or prompt directly: risks forcing the whole project to become GPL.
  2. Learn the ideas and write our own original prompt.
- Decision: Take ideas only (hook-first start, standalone test, narrative arc, no mid-sentence cuts). Write original code and prompt text.
- Rationale: Avoids GPL obligations and keeps licensing options open.
- Consequences: Slightly more work to write our own prompt.
- Rules check: Rule 20.
- Review trigger: If the project is intentionally released under GPL.

## D-004: Reject SupoClip, ClippedAI and cutawan

- Date: 2026-10-12
- Status: Accepted
- Context: These do not meet the zero-cost, no-API-key requirement.
- Options considered: Use them anyway vs. exclude them.
- Decision: Exclude them from the working set.
- Rationale:
  - SupoClip: needs an AssemblyAI key plus Docker and Postgres, and is AGPL-3.0.
  - ClippedAI: needs a Groq key, and its CC BY-NC license forbids commercial use.
  - cutawan: AI clip finding needs Codex or an API connection (its "local captions only" mode has no clip finding).
- Consequences: Fewer reference options. They may still be read for general ideas.
- Rules check: Rule 18, Rule 20.
- Review trigger: If one of them adds a fully local, permissively licensed mode.

## D-005: Local LLM via Ollama, model chosen by hardware

- Date: 2026-10-12
- Status: Accepted
- Context: Clip selection and scoring need an LLM that runs locally and free.
- Options considered:
  1. `llama3.1:8b`: better quality, needs more RAM.
  2. `llama3.2:3b`: lighter, lower quality, runs on weaker machines.
- Decision: Default to `llama3.1:8b`. Fall back to `llama3.2:3b` on machines with about 8 GB RAM or less.
- Rationale: Balances quality against hardware limits. The 8b model is the one AutoClip's README suggests for a fully local setup.
- Consequences: The 3b model may give weaker scoring. Prompt design becomes more important.
- Rules check: Rule 18, Rule 19.
- Review trigger: After testing both on real videos, or once the user's hardware specs are known (Open question 6 in `project.md`).

## D-006: Folder structure and reference repos are read-only

- Date: 2026-10-12
- Status: Accepted
- Context: Four repos are being studied while original work is built separately.
- Options considered:
  1. Work inside the cloned repos: simple, but mixes licenses and breaks updates.
  2. Keep references in `repos/` and build in `my-project/`.
- Decision: Use `repos/` (read-only), `test-videos/`, and `my-project/`.
- Rationale: Keeps third-party code separate from original work, which makes license compliance clear.
- Consequences: Reused code must be deliberately copied into `my-project/` with attribution.
- Rules check: Rule 20, Rule 21.
- Review trigger: None expected.

## D-007: Never claim virality prediction

- Date: 2026-10-12
- Status: Accepted
- Context: Many tools market a "virality score".
- Options considered:
  1. Present the score as a prediction.
  2. Present it as a heuristic ranking based on hook, emotion, completeness and clarity.
- Decision: Describe it only as a heuristic ranking.
- Rationale: No model can reliably predict virality. Claiming it would be dishonest.
- Consequences: Documentation and the UI must use wording like "engagement score", not "viral guarantee".
- Rules check: Rules 13 to 17 (no invented facts).
- Review trigger: None.

## D-008: Set Whisper compute type to int8_float16 on Windows / RTX 2050

- Date: 2026-10-12
- Status: Accepted
- Context: On Windows with NVIDIA GeForce RTX 2050 (4GB VRAM, compute capability 8.6, driver 566.07), running faster-whisper with automatic compute_type (`float16`) resulted in a native crash (exit code `0xC0000409` STATUS_STACK_BUFFER_OVERRUN) inside CTranslate2 / cuDNN during audio transcription.
- Options considered:
  1. Default `float16`: Crashes natively on this environment during Whisper transcription.
  2. `int8_float16`: Quantized weights with float16 activations. Fast, stable, avoids the native crash, fits easily in 4GB VRAM.
  3. `float32` / CPU fallback: Works, but 4-5x slower and high CPU/RAM usage.
- Decision: Explicitly set `whisper.compute_type = "int8_float16"` in `config.json`.
- Rationale: Verified by empirical testing on `test-videos/youtube-test.mp4`. `float16` crashed repeatedly with `0xC0000409`, whereas `int8_float16` transcribed the 18:48 video stably in ~45 seconds without accuracy degradation.
- Consequences: Negligible quality difference vs float16 for speech recognition. Fits well within 4GB VRAM. If transferred to another GPU without `int8_float16` support, AutoClip's `resolve_compute` safely falls back to supported types.
- Rules check: Rule 2 (verify then move forward), Rule 18 (zero cost), Rule 22 (record configuration/dependency decisions in decision.md).
- Review trigger: If faster-whisper or CTranslate2 releases a Windows cuDNN bugfix resolving `0xC0000409` on RTX 2050, or if users report issues on different architectures.

## D-009: Adopt the Resolve visual system for the frontend

- Date: 2026-10-13
- Status: Accepted
- Context: The UI is currently a dark theme with a serif display face. The project wants the light, dot-matrix "Resolve" look in the CAESAR palette (black #000000, burgundy #6D001A, white #FFFFFF) instead of dark charcoal and orange.
- Options considered:
  1. Keep the dark theme: no work, but no change in identity.
  2. Port Resolve with Ruvo's dependencies (Radix, cva, lucide, sonner): closest to reference, but adds five npm dependencies.
  3. Port Resolve with CSS classes and native controls: same look, zero new npm dependencies.
- Decision: Option 3. Add three OFL variable fonts (Doto, Geist, Geist Mono; about 58 KB) as bundled assets in `frontend/src/fonts/`; remove Archivo and Instrument Serif (about 800 KB).
- Rationale: Rule 22 (no new dependency without a decision), Rule 18 (zero cost), Rule 19 (local first: fonts bundled, nothing fetched at runtime). Fonts verified as OFL-1.1.
- Consequences: Burgundy carries white text (black on burgundy is 1.7:1) and black panels use the lighter `highlighter-bright`. Native selects and CSS components are used without Radix.
- Rules check: Rule 6 (no dead code), 18 (zero cost), 19 (local first), 20 (OFL licence shipped with fonts), 22, 23.
- Review trigger: If a future feature strictly requires complex modal/popover primitives, or if canvas/WebGL performance needs tuning on lower-end devices.

---

## Pending decisions

These are not decided yet. Do not assume an answer. Each needs a decision entry when resolved. They map to the open questions in `project.md`.

- YouTube URL input vs. local files only
- Target clip length
- Supported languages (English only, or Hindi and Hinglish too)
- Interface type (CLI, local web UI, desktop app)
- Final license for `my-project/`
- Skate: verify its license before reusing anything
- Verify AutoClip's exact install commands from its README


