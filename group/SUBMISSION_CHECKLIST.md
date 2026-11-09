# Submission checklist (group material, not in the submission ZIP)

In this order, because each step uses the result of the one before:

- [ ] **Task A, live data update.** A member who did not write `SKILL.md` runs it in a fresh Codex chat. Prompt: `maintenance/FRESH_CHAT_PROMPTS.md`. The member reviews against the sources, accepts or rejects, and the assistant fills Task A in `AGENT_TEST.md`. Commit and push.
- [ ] **Task B, failure test,** in a test copy with `maintenance/invalid_unit_config.json`. Fill Task B in `AGENT_TEST.md`. The test copy itself is not committed.
- [ ] **Student calculation checks** on the released data: `evidence/independent_check.xlsx`, then the student-route rows E1–E3 in `EVALS.md`.
- [ ] **User test and clean reproduction** by a member who did not build the page, from the extracted ZIP: `evidence/user_test.md`, then the student-route rows E4, E5 and E8 in `EVALS.md`.
- [ ] **AI_LOG check.** The user-value lead's assistant checks its entry against the original chat and completes the date and tool.
- [ ] **Final ZIP.** `python3 dev-g00-usd-cash/tools/set_identity.py --prefix bms5312 --group g09` writes `bms5312-g09-usd-cash/` and its ZIP next to the project folder. Open the page from the extracted ZIP once.
- [ ] **Slides.** `presentation.pdf` in the package shows group 9 only. Rehearse the five-minute script in `PRESENTATION_NOTES.md`.
- [ ] **Clean files.** No names, student IDs, emails, keys, `node_modules`, `dist`, `candidate/` or `previous/` in the ZIP. `set_identity.py` already excludes the folders.
