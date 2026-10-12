# Viral Clipper Project: Setup Guide

Goal: Turn long videos into viral, captioned, 9:16 clips. The whole setup is free (zero cost).

---

## 1. Repos to use

| Repo | Purpose | License | How to use it |
|---|---|---|---|
| **AutoClip** | Base project (Whisper + Ollama + captions + reframing) | MIT | Build your project on top of this |
| **ViralCutter** | Good clip-finding prompt (`prompt.txt`) | GPL-3.0 | Borrow ideas only, don't copy code |
| **OpenClip** | Backup option + UI ideas | MIT | Reference / fallback |
| **Skate** | Small, simple CLI | Check its LICENSE file | For understanding the concept |

Links:
- AutoClip: https://github.com/artbyjazi/autoclip
- ViralCutter: https://github.com/RafaelGodoyEbert/ViralCutter
- OpenClip: https://github.com/aionixOS/OpenclipV-
- Skate: https://github.com/r2hu1/skate

> Skip these (they need paid APIs or extra keys): SupoClip, ClippedAI, cutawan.

---

## 2. Install these first (one time)

- [ ] **Python 3.11 or 3.12**: python.org
- [ ] **Git**: git-scm.com
- [ ] **FFmpeg**: ffmpeg.org (must be added to PATH)
- [ ] **Ollama**: ollama.com
- [ ] **Node.js** (only needed for Skate): nodejs.org

Verify everything is installed:

```bash
python --version
git --version
ffmpeg -version
ollama --version
```

---

## 3. Create the folder structure

**Windows (PowerShell):**
```powershell
mkdir viral-clipper
cd viral-clipper
mkdir repos, test-videos, my-project
```

**Mac / Linux:**
```bash
mkdir -p viral-clipper/repos viral-clipper/test-videos viral-clipper/my-project
cd viral-clipper
```

Final structure:

```
viral-clipper/
├── repos/              <- the 4 repos, for reference only
│   ├── autoclip/
│   ├── ViralCutter/
│   ├── OpenclipV-/
│   └── skate/
├── test-videos/        <- 5-10 minute videos for testing
└── my-project/         <- your actual project
```

---

## 4. Clone the repos

```bash
cd repos

git clone https://github.com/artbyjazi/autoclip.git
git clone https://github.com/RafaelGodoyEbert/ViralCutter.git
git clone https://github.com/aionixOS/OpenclipV-.git
git clone https://github.com/r2hu1/skate.git
```

If you downloaded zip files instead: unzip them, remove the `-main` suffix from the folder names, and put them inside `repos/`.

---

## 5. Set up the local LLM (Ollama)

Strong laptop (16 GB RAM or an NVIDIA GPU):
```bash
ollama pull llama3.1:8b
```

Average laptop (8 GB RAM, no GPU):
```bash
ollama pull llama3.2:3b
```

Test that it works:
```bash
ollama run llama3.2:3b
```

---

## 6. Run AutoClip

```bash
cd repos/autoclip

python -m venv venv

# Windows
venv\Scripts\activate
# Mac / Linux
source venv/bin/activate
```

Then follow the exact commands in the **Install** and **Run** sections of AutoClip's README.md.

In the settings:
- LLM provider: **Ollama**
- API key: **leave empty**

---

## 7. Test it

1. Put a 5-10 minute video in `test-videos/`
2. Generate clips with AutoClip
3. Check the output:
   - [ ] Are clips cut at sensible points (not mid-sentence)?
   - [ ] Are captions accurate and well timed?
   - [ ] Is the face crop good (no jitter, no cut-off faces)?
   - [ ] Is the speed acceptable?

If quality is poor, try OpenClip or ViralCutter instead.

---

## 8. Build your own project (`my-project/`)

1. Copy AutoClip into `my-project/`
2. Read ViralCutter's `prompt.txt` and apply these rules to your own scoring prompt:
   - Start with a hook (no filler openings like "Um" or "So...")
   - Standalone test: the clip should make sense without context
   - Never cut mid-sentence
   - End on a satisfying conclusion
3. Change one thing at a time and test after each change
4. Give credit: if you reuse MIT-licensed code, keep the LICENSE and attribution

---

## 9. License reminders

- **MIT (AutoClip, OpenClip):** you can copy code, but you must give credit
- **GPL-3.0 (ViralCutter):** if you copy its code, your whole project must also be GPL. Take ideas only
- If you plan to sell the project, re-check every license first

---

## 10. Common errors

| Error | Fix |
|---|---|
| `int8_float16 compute type not supported` | Clear `whisper.compute_type` in `~/.autoclip/config.json` |
| `ffmpeg not found` | Add FFmpeg to PATH and restart the terminal |
| Can't connect to Ollama | Make sure the Ollama app is running (`http://localhost:11434`) |
| Package conflicts | Create a separate venv for each repo |
| Very slow | Use a smaller model (`llama3.2:3b`) or test with a shorter video |

---

## Quick checklist

- [ ] Python, Git, FFmpeg, Ollama installed
- [ ] Folder structure created
- [ ] 4 repos cloned
- [ ] Ollama model pulled
- [ ] AutoClip venv created and installed
- [ ] First clip generated from a test video
- [ ] Started work in `my-project/`
