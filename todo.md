# Viral Clipper — Todo

Project root: `C:\Users\Preet\OneDrive\Desktop\RUCO`
Fork ("my-project"): AutoClip fork. Decision: public open-source (MIT), no GPL code from ViralCutter.
Default LLM: Ollama `llama3.1:8b`.

## Done
- [x] Phase 0: create `repos/`, `test-videos/`, `my-project/`; move 4 repos into `repos/`; rename `rules.md`, `project.md`
- [x] Install FFmpeg full build + uv; start Ollama; pull `llama3.1:8b`
- [x] Fork `repos/autoclip` → `my-project/`
- [x] `uv venv` + install `-e ".[dev,gpu]"`; `autoclip doctor` = Ready
- [x] Set active provider = ollama, model = `llama3.1:8b`
- [x] Download test video → `test-videos/youtube-test.mp4` (18:48, 1280x720)
- [x] Pin `av==18.1.0` (19.x broke faster-whisper)
- [x] Diagnose transcription crash: GPU `float16` → native crash `0xC0000409`; `int8_float16` stable
- [x] Set `whisper.compute_type = "int8_float16"` in config
- [x] Run baseline pipeline end-to-end → 10 clips exported (job `378c1f1df83949b3`)
- [x] Visually QA the 10 clips: verified framing, captions/karaoke timing, cut points (logged in `qa_report.md`)
- [x] Log the `compute_type` change in `decision.md` (Decision D-008)
- [x] Phase 2.2: add original `highlight_v2.txt` prompt (hook discipline, 3-part arc, standalone rule)
- [x] Phase 2.3: add caption presets (`viral_glow`, `comic_punch` in `captions.py`, verified with test suite)

## Next
- [ ] Phase 2.4: run detection with `highlight_v2` prompt and compare clip selection quality against v1
- [ ] Phase 3: update project docs


## Blocked / Open
- [ ] Visual QA blocked: current model can't view images — need user eyes or a vision-capable model
- [ ] YouTube direct-link ingest still 403 (DASH); cookies blocked by DPAPI (yt-dlp #10927). Local-file ingest works.
- [ ] Decide whether to add `decision.md` entry for non-default `compute_type` (per rules)
