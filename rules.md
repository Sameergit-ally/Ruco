# rules.md

Rules for building the Viral Clipper project. Every contributor, human or AI, follows these. If a rule conflicts with a request, flag the conflict instead of silently breaking the rule.

---

## 1. Execution rules

1. **Finish what you start.** Do not stop until the task is complete. Do not leave half-done work, placeholder functions, or "TODO later" stubs behind.
2. **Verify, then move forward.** After every step, check that it actually works (run it, test it, inspect the output). Do not start the next step on top of an unverified one.
3. **One change at a time.** Make a single focused change, test it, then continue. Never stack several untested changes.
4. **Stop only when truly blocked.** The valid reasons to stop and ask are: required information is missing, the action is destructive or irreversible, or the action would break a rule in this file. Otherwise keep going.
5. **Report honestly.** If something failed, say it failed. Never claim a step works without having verified it.

## 2. Code quality rules

6. **Only meaningful code.** No dead code, no unused imports, no commented-out blocks, no filler functions, no "just in case" abstractions.
7. **Every line has a purpose.** If a piece of code cannot be justified by a requirement in `project.md`, do not write it.
8. **Small, single-purpose functions.** One function does one job and has a clear name.
9. **No duplicate logic.** Reuse existing code before writing new code.
10. **Handle errors explicitly.** Failures (missing file, bad video, LLM timeout, empty transcript) must produce a clear message, not a silent crash or a silent skip.
11. **No hardcoded secrets, paths, or magic numbers.** Use a config file or environment variables, with named constants.
12. **Readable over clever.** Prefer simple, obvious code. Comments explain *why*, not *what*.

## 3. Anti-hallucination rules

13. **Never invent facts.** Do not invent function names, library APIs, CLI flags, config keys, file paths, or repo features. If unsure, say "I don't know" and check the source (README, code, official docs).
14. **Read before you write.** Before using a library or touching a file, read the actual code or documentation.
15. **Separate fact from assumption.** Label anything unverified as an assumption and verify it before building on it.
16. **Cite the source.** When a decision depends on external information (a license, a model's capability, a library behavior), note where it came from.
17. **`project.md` is the source of truth** for what the project is. If it is silent on something, ask or record an open question. Do not guess.

## 4. Project constraints

18. **Zero cost.** The project must run with no paid services and no required API keys. Free local tools only (Whisper, Ollama, FFmpeg, MediaPipe/OpenCV). Optional paid providers may exist only as an opt-in and never as a default.
19. **Local first.** Video, audio, and transcripts stay on the user's machine by default.
20. **License compliance.** Before copying any code from another repo, check its LICENSE.
    - MIT: allowed with attribution.
    - GPL / AGPL / non-commercial: do not copy code. Ideas only.
    - Unknown license: do not copy anything.
21. **Reference repos are read-only.** Never modify anything inside `repos/`. All original work goes in `my-project/`.
22. **No new dependency without a decision.** Adding a library, model, or tool requires an entry in `decision.md` first.

## 5. Testing and verification rules

23. **Test with real data.** Use real videos in `test-videos/`, not only synthetic inputs.
24. **Define "done" before starting.** Each task has a clear, checkable completion condition.
25. **Check output quality, not just "no errors".** For clips: cut points are not mid-sentence, captions are accurate and well-timed, face crop has no jitter or cut-off faces.
26. **Regression check.** After a change, re-run the earlier working test to confirm nothing broke.

## 6. Documentation and process rules

27. **Record every significant decision** in `decision.md` before or at the time it is made.
28. **Keep `project.md` current.** When the project changes, update it in the same change.
29. **Commit small and often,** with a clear message describing what changed and why.
30. **Reproducible setup.** Someone starting fresh must be able to set up and run the project from the written steps alone.

---

## Pre-completion checklist

Before calling any task done:

- [ ] It does what the requirement says
- [ ] I ran it and verified the result myself
- [ ] No unused or dead code was added
- [ ] Errors are handled with clear messages
- [ ] No rule in this file was broken
- [ ] No paid service or API key became required
- [ ] Licenses were respected
- [ ] `decision.md` and `project.md` are updated if needed
