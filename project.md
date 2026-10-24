# project.md

Source of truth for what this project is. If something is not written here, it is **not decided**. Do not assume it. Ask, or add it to "Open questions".

Status: **Working local app.** Backend pipeline and Vite/React UI exist under `my-project/`. Frontend redesign to Ruco Aurora (Velora elements) is in progress on `frontend-redesign`.

---

## 1. What the project is

A tool that takes a **long video** (podcast, interview, vlog, stream) and automatically produces several **short vertical clips** (9:16) that are most likely to perform well on TikTok, Instagram Reels, and YouTube Shorts. Each clip has accurate, word-highlighted **captions**.

It is a free, open-source style alternative to paid tools such as OpusClip.

## 2. Problem it solves

Manually finding the best moments in a long video, cutting them, reframing to vertical, and adding captions takes hours. This project automates that pipeline at zero cost.

## 3. Core requirements

| # | Requirement |
|---|---|
| R1 | Accept a local video file (YouTube link input is optional, see Open questions) |
| R2 | Transcribe speech with word-level timestamps |
| R3 | Find the most engaging, self-contained segments using a local LLM |
| R4 | Score each candidate clip for viral potential |
| R5 | Cut clips at clean start and end points (never mid-sentence) |
| R6 | Reframe to 9:16 and keep the speaker's face in frame |
| R7 | Add word-by-word highlighted captions |
| R8 | Export ready-to-post MP4 files |
| R9 | Run entirely free and local, with no required API keys |

## 4. Pipeline

```
Input video
   -> Transcription (word-level timestamps)
   -> LLM finds candidate segments
   -> LLM scores each segment
   -> Cut at clean boundaries
   -> 9:16 reframe with face tracking
   -> Burn in captions
   -> Export MP4
```

## 5. Important honesty note about "virality"

No model can truly predict whether a video will go viral. The "virality score" is a **heuristic** based on signals such as:

- A strong opening hook
- Emotion or surprise
- Curiosity or a clear takeaway
- Story completeness (beginning, middle, end)
- Standalone clarity (makes sense without extra context)

The project must never claim to guarantee or accurately predict virality. It ranks clips by these signals only.

## 6. Technology plan (current decisions)

| Area | Choice | Note |
|---|---|---|
| Base project | AutoClip (MIT) | Build `my-project/` on top of it |
| Transcription | Whisper / faster-whisper (local) | Provided via AutoClip |
| LLM | Ollama (local) | `llama3.1:8b`, or `llama3.2:3b` on weaker machines |
| Video processing | FFmpeg | Must be on PATH |
| Face tracking | As provided by AutoClip | To be verified in testing |
| Language | Python | Primary language for the project |

See `decision.md` for the reasoning behind each choice.

## 7. Reference repositories

These live in `repos/` and are **read-only references**.

| Repo | License | Use |
|---|---|---|
| AutoClip | MIT | Base for the project |
| ViralCutter | GPL-3.0 | Ideas only, especially `prompt.txt`. Do not copy code |
| OpenClip | MIT | Backup option and UI ideas |
| Skate | Not verified | Concept reference. Check LICENSE before reusing anything |

Rejected for now: SupoClip (needs an AssemblyAI key, Docker, Postgres), ClippedAI (needs a Groq key and is non-commercial), cutawan (AI clip finding needs Codex or an API).

## 8. Folder structure

```
viral-clipper/
├── repos/          # read-only reference repos
├── test-videos/    # real videos for testing
└── my-project/     # all original work lives here
```

## 9. Constraints

- Zero cost: no paid services, no required API keys
- Local first: media and transcripts stay on the user's machine
- License compliant (see `rules.md`)
- Must run on a normal laptop, possibly without an NVIDIA GPU, so processing may be slower

## 10. Non-goals (for now)

- Guaranteeing or predicting virality
- Auto-posting to social platforms
- Hosting as an online service
- Paid or cloud-only features
- Dubbing, B-roll generation, or other extras beyond the core pipeline

## 11. Known facts vs. unverified

**Verified (from reviewing the repos):**
- ViralCutter is GPL-3.0, SupoClip is AGPL-3.0, ClippedAI is CC BY-NC 4.0, OpenClip and cutawan are MIT.
- OpenClip's README lists Ollama as a free local LLM option.
- ViralCutter's `prompt.txt` defines hook, standalone, narrative-arc and no-mid-sentence-cut rules.

**Not yet verified (do not assume):**
- AutoClip's exact install and run commands (read its README)
- AutoClip's reframe quality. Its own README says the reframe quality bar has not been fully validated
- Skate's license
- Performance on a machine without a GPU
- Minimum RAM needed for each Ollama model

## 12. Open questions

1. Should YouTube URL input be supported, or local files only?
2. What target clip length (for example 30-60 seconds)?
3. Which languages must be supported (English only, or Hindi and Hinglish too)?
4. Will this stay a personal tool, or will it be published or sold? (This affects licensing.)
5. Interface: local web UI on Vite + React 18, served by FastAPI. CLI remains. (Closed 2026-10-25.)
6. What are the user's machine specs (OS, RAM, GPU)?

## 13. Glossary

- **Hook:** the opening line or moment that grabs attention in the first seconds.
- **Standalone:** a clip that makes sense without watching the rest of the video.
- **Reframe:** converting horizontal video to vertical 9:16 while keeping the subject centered.
- **Word-level timestamps:** the exact start and end time of each spoken word, needed for caption highlighting.
- **Ollama:** a free tool for running LLMs locally.
