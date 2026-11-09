# Submission checklist (group material, not in the submission ZIP)

- [x] **Task A, live data update** (2026-11-09): a member who did not write `SKILL.md` released the 2026-11-06 quotes in a fresh Codex chat. Merged.
- [x] **Task B, failure test** (2026-11-09): the project lead ran it in a test copy; the assistant stopped with `STOP: Incompatible input unit`. Merged.
- [x] **Student calculation checks** (Task C): the workbook and the E1–E3 student routes, all PASS. Merged.
- [x] **AI_LOG check** (Task E): the user-value lead's entry has the same fields as the others. Merged.
- [x] **Backup slides:** `group/presentation.pptx`, exported as `presentation.pdf` in the package, Group 9 only.
- [x] **Final ZIP** (2026-11-10): `bms5312-g09-usd-cash.zip`, extracted into an empty folder and checked: rebuild identical, 44, 32 and 15 checks passed, page rebuilt identically, no console errors.
- [ ] **User test** (Task D) by a member who did not build the page: the four questions and the controls in `evidence/user_test.md`. When the answers arrive, give them to the assistant to fill `evidence/user_test.md` and the E4 and E5 student routes, replace `[USER TEST SENTENCE]` in `PRESENTATION_NOTES.md` and the yellow box on slide 7, export the PDF again and rebuild the ZIP. If nobody answers, delete the sentence and the yellow box; the E4, E5 and E8 student routes stay "Not run".
- [ ] **Clean reproduction, student route (E8):** a member extracts the final ZIP on their own computer, double-clicks `index.html` and runs the three commands listed in `evidence/user_test.md`.
- [ ] **Rehearse** the five-minute live demo in `PRESENTATION_NOTES.md` with a timer.
- [x] **Clean files.** No names, student IDs, emails or keys; the package is in English. `set_identity.py` leaves out `node_modules`, `dist`, `candidate/` and `previous/`.
