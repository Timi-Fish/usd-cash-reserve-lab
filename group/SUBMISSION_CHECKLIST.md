# Submission checklist (group material, not in the submission ZIP)

Members work in their own copy of the ZIP and send back only the files their task names (`group/handoff/TASKS.md`). In this order:

- [ ] **Task A, live data update.** A member who did not write `SKILL.md` runs it in a fresh Codex chat. They review against the sources and accept or reject; the assistant fills Task A in `AGENT_TEST.md`. The member sends back the whole folder without `candidate/` and `previous/`.
- [ ] **Repackage** after Task A: merge the folder, run the three checks, run `set_identity.py`, and send the new ZIP to the group.
- [ ] **Task B, failure test,** in a test copy with `maintenance/invalid_unit_config.json`. The member sends back `AGENT_TEST.md` with Task B filled.
- [ ] **Student calculation checks:** the member sends back `evidence/independent_check.xlsx` and `EVALS.md` (E1–E3 student route).
- [ ] **User test and clean reproduction** by a member who did not build the page: the member sends back `evidence/user_test.md` and `EVALS.md` (E4, E5, E8 student route).
- [ ] **AI_LOG check:** the user-value lead's assistant completes its entry; the member sends back `AI_LOG.md`.
- [ ] **Merge and final ZIP.** Put the returned files back, merging `EVALS.md` and `AGENT_TEST.md` by section. Run the three checks. Then run `python3 bms5312-g09-usd-cash/tools/set_identity.py --prefix bms5312 --group g09`, which writes `bms5312-g09-usd-cash.zip` next to the folder. Open the page from the extracted ZIP once.
- [ ] **Slides.** `presentation.pdf` in the package shows group 9 only. Rehearse the five-minute script in `PRESENTATION_NOTES.md`.
- [ ] **Clean files.** No names, student IDs, emails or keys in any file. `set_identity.py` leaves out `node_modules`, `dist`, `candidate/` and `previous/`.
