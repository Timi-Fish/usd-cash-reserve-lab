# AI work log

One entry per substantive session. People appear by role only:
- **Project lead:** the member who ran the build sessions.
- **User-value lead:** the member responsible for the user-value part of the presentation.
- **Teammate reviewer:** a member whose AI assistant reviewed the redesign.
- **Data maintainer:** the role in `SKILL.md`.

## 2026-10-20 to 2026-10-27: Scope and first build
- **Tool:** AI coding assistant with file, shell and browser tools.
- **Goal and supplied files:** choose a topic and build the first dashboard. The assignment, file guide, START_HERE and two example ZIPs were supplied.
- **Prompt summary:**
  - Explain the requirements and propose topics.
  - Build the chosen cash-reserve and inflation dashboard in English, as a complete ZIP.
- **Decisions and reasons:**
  - The project lead chose the cash and inflation direction.
  - The project lead questioned whether short-term cash must beat inflation. The question became same-period purchasing power over the bill's holding period.
  - The project lead accepted official Treasury and BLS snapshots, the bank-discount price formula with actual days, inflation as a user assumption, and manual supervised updates.
- **Executed:**
  - The assistant downloaded BLS `CUUR0000SA0` JSON and Treasury bill XML for 2024–2026.
  - It wrote the page, `calculations/rebuild.py`, `calculations/verify.py` and the documentation.
  - It ran a withheld-observation rehearsal (2026-10-23 to 2026-10-26) and two failure rehearsals in working copies.
- **Errors and concerns tested:**
  - A first Treasury URL form timed out; the documented resource-center endpoint worked.
  - BLS HTML pages returned 403 to scripts while the JSON API worked. Values were cross-checked against the BLS web table.
  - October 2025 CPI was never published and is kept as missing.
  - A mobile select label was clipped and was shortened.
- **Contributions:** project lead: topic, direction and approval of the approach. Assistant: code, data snapshots and drafts.

## 2026-10-27 to 2026-11-09: Original dashboard review (user-value lead)
- **Tool:** OpenAI Codex desktop for the review and implementation; local Python and Node.js for source, calculation and rebuild checks; the Codex in-app browser for interaction and layout checks.
- **Goal and supplied files:** help a family-office client check when cash is needed and what it could buy at maturity. The conversation included the assignment PDF, student pack file guide, START_HERE.md, two assignment ZIPs and the project proposal. For the revision, the lead directed Codex to the existing index.html, data.js, README.md, PROPOSAL.md, ontology.yml, calculation files and test records, together with AGENT_GUIDE.md and the class ONTOLOGY.yml. The final Group 09 ZIP was supplied separately for the November 9 demo review.
- **Prompt summary, decisions and effects:**

| # | Type | What the user-value lead asked | Effect on the work |
|---|---|---|---|
| 1 | Financial logic | Why should short-term cash be judged against inflation? | The review distinguished a fixed dollar bill from spending whose cost can change. The model compares purchasing power over the actual holding period; beating inflation is not a condition for meeting a payment. |
| 2 | Product direction | Make the tool show whether each maturity fits the spending date, and explain the purchasing-power result. | The v2 candidate added date matching, an inflation sensitivity chart, a decomposition and a zero-interest benchmark over the selected bill's exact holding period. |
| 3 | Deliverable form | Make the changes in a working English dashboard, not just a proposal or mock-up. | Codex produced a separate runnable candidate and ZIP. The original project stayed intact. |
| 4 | Review scope | For the presentation, explain whom the tool serves, its task, stakeholder value and usefulness after one year. | The demo distinguished an intended benefit from measured client impact, and the continuing use of the tool from the limited life of its saved quotations. |
| 5 | Collaboration | Divide a five-minute presentation among five people, using only the dashboard. | Each speaker had one question and a dashboard cue. The group kept technical checks separate from student calculations, user testing and release decisions. |
| 6 | Presentation scope | Prepare the one-minute actual-task segment: enter a tuition date and explain the calendar row. | The November 9 script used the final G09 form and the seven-maturity calendar. The inflation demonstration belonged to the next speaker. |
| 7 | Comparison basis | Does a longer bill's larger dollar gain make it better? What happens before or after the payment date? | Both maturities use the same comparison fields but retain their own periods. The tool does not rank them, assume reinvestment during a gap or price an early sale. |
| 8 | Evidence | Verify that the displayed inputs, dates and results agree, and distinguish file-mode testing from an HTTP preview. | Codex checked the saved quote-to-maturity day counts, invalid inputs, missing CPI, common history windows and mobile layout. It recorded the blocked v2 file-mode browser test separately. |

- **Executed:** Codex revised the v2 candidate's index.html, calculations/rebuild.py, data.js and ontology.yml; added calculations/check_revision.mjs; and updated README.md, PROPOSAL.md, calculations/method.md, SKILL.md, EVALS.md and AGENT_TEST.md. It captured desktop and mobile screenshots and verified that a clean rebuild reproduced data.js byte for byte. In the November 9 follow-up, working in its own copy of the G09 package, it replaced presentation.pdf with a five-speaker dashboard guide, corrected the speaker 3 script, checked the calendar row for the demo payment, and reran the source, model and refresh checks and isolated withheld-update and wrong-unit checks. Dashboard and market data were left unchanged.
- **Errors and concerns tested, and how they were checked:**
  1. **Annual quote vs. holding return.** The lead challenged the use of annual inflation to judge short-term cash. Codex checked the formulas: the bank discount quote determines a modeled price; the assumed inflation factor covers the same quote-to-maturity days. Past CPI was kept as historical context.
  2. **Wrong vocabulary mapping.** The lead requested a check against the class ontology. Codex found that the two bank discount quotes were labeled core:bond-yield, which the class defines as yield to maturity. It corrected the exporter to use the group bank-discount-rate term, rebuilt data.js and checked that the two original modeled results did not change.
  3. **Wrong demo row.** Codex initially told the speaker to read "32 days early" from the G09 Tuition row. The lead requested a comparison with the earlier version. Codex traced the error to using the old two-bill comparison for the new seven-maturity calendar. Running the G09 calendar code for March 1, 2027 with the 2026-10-26 quotes returned the 17-week bill on February 23 (six days early) and the 26-week bill on April 29 (59 days late). The 13-week bill was 32 days early but was not the nearest earlier maturity.
  4. **Presentation format.** The lead rejected the suggestion to use slides during the five-minute talk. The revised plan used the live dashboard throughout. The later package check also found that the G09 presentation PDF was byte-identical to the earlier v2 PDF; Codex replaced it with the G09 live-demo guide.
  5. **A change outside the review.** In the same copy, Codex changed the refresh command to stage candidate/ by default and refuse the project folder as output. The group kept the refresh.py that Task A had tested: SKILL.md already stages every update in candidate/, and nothing is released until a person accepts.
- **Files and contributions:** The user-value lead questioned the financial premise, specified the comparison and evidence requirements, chose a dashboard-only presentation and requested the version check. Codex implemented and tested the separate v2 candidate and corrected the G09 demo materials. The later seven-tenor redesign is recorded in the November 8 entry. Independent calculations, non-builder feedback and acceptance decisions remained with the group. That copy's presentation.pdf and refresh.py were not merged; the submitted script and backup slides come from the project lead's 2026-11-09 session.

## 2026-11-08: Redesign, refresh script and payment calendar
- **Tool:** Claude Code desktop app (agent with file, shell and headless-browser tools).
- **Goal and supplied files:** review the accepted v2 package, then add improvements without touching it. Supplied: the repository and the course pack.
- **Prompt summary:**
  - Review the package.
  - Add an automatic refresh and a liquidity calendar.
  - Rebuild the page with J.P. Morgan's open-source Salt design system.
  - Make it look like a private-bank client page.
  - Answer the project lead's design questions.
- **Decisions and reasons:**
  - The assistant's review found that monthly manual upkeep against a 7-day quote limit would show the stale warning most of the time.
  - It found that only 2 of the 7 saved tenors were used. With the 2026-10-26 quotes, a 2027-03-01 payment fell 32 days after the 13-week maturity, while a saved 17-week bill matured 6 days before it.
  - So it added `refresh.py` (download, then the accepted rebuild, then a candidate folder) and a seven-tenor calendar.
  - The project lead chose a Goldman Sachs-style blue under a black strip. Overview gained a payment-timing chart and a purchasing-power bridge.
  - The bill comparison stays a table so that no bill looks "better".
- **Executed:** the assistant wrote and ran all code, the checks and headless-Chrome screenshots. Two review rounds by an independent AI reviewer in a separate context covered the calendar and the redesign.
- **Errors and concerns tested, and how they were checked:**
  1. **A wrong test expectation.** "Refresh exits 0" expected `true`. The automated check caught it; the expectation became 0 and the rerun passed.
  2. **Calendar first build: seven defects found by the independent reviewer.**
     - Missing grid borders; dates breaking at hyphens.
     - A hidden "Clear all"; a clipped phone table.
     - Lost keyboard focus; a 2.8:1 focus ring.
     - A source link that wiped all entries.

     Round 2 found a regression from a fix: a no-break span wrapped each entry's date line. All were fixed and confirmed with browser checks and cropped screenshots.
  3. **Redesign first build: seven findings by the independent reviewer.**
     - Overlapping phone table rows.
     - The Overview opened with purchasing power although its text said to check dates first.
     - Orange reused for three meanings.
     - White-on-white inputs; amounts without separators.
     - Odd axis ticks; Copy and Print below the fold.
     - Break-even buttons silently switching the bill.

     Round 2 found:
     - the timing line did not say the 13-week bill matures 24 days after the payment;
     - the new wait colour matched the warning orange;
     - a dropped axis-padding setting;
     - a wrong code comment.

     All were fixed. The page now says the bill "would have to be sold before maturity at an unknown price".
  4. **The status banner joined stale quotes and CPI in one sentence.** CPI was within its limit, and nobody can make the Treasury publish. The project lead caught it. Each series now states its own age and who can refresh it.
  5. **The purchasing-power bridge showed +$1,069 − $766 = +$302.** The parts did not add up. The assistant's screenshot check caught it. The amounts now come from the rounded levels shown (−$767).
  6. **The project lead found the first timing chart ugly.** Its near-black bar was the assistant's own choice, not from any reference. The assistant also researched desktop wealth platforms, not only mobile apps. The chart became a single payment lane with brand-blue bars.
  7. **Colour meanings were inconsistent across charts and tables (six conflicts).** The project lead caught it. One rule now holds everywhere: navy for 13-week, brand blue for 26-week, purple for cash waiting, grey for non-bill data, orange only for stale data. It is documented in `dashboard/README.md`.
  8. **The bridge result bar was thicker than the others.** The project lead asked why. All bars now have equal thickness, since only length carries the value.
  9. **The project lead's hands-on test found:**
     - swatches out of line with their labels;
     - header, About and footer text 16 px off the card edges;
     - poorly set formulas;
     - a Summary tab with no clear reader.

     The fixes: edges measured by script and aligned, formulas set with KaTeX, the Summary tab removed and Copy and Print moved to the Overview. Each was checked on 3× zoomed crops.
- **Files and contributions:**
  - The assistant wrote the code and documents.
  - The project lead made the design decisions and the hands-on test.
  - The independent reviewer produced the two review rounds.

## 2026-11-09: Final version, data in one file and the maintenance skill
- **Tool:** Claude Code desktop app.
- **Goal and supplied files:** make the redesign the final submission, follow the instructor's assignment folder, and prepare the maintenance skill for a fresh-assistant test; then merge the members' results and prepare the presentation. Supplied later: the members' returned files and the user-value lead's log entry.
- **Prompt summary:**
  - Adopt the redesign.
  - Fold the seven-tenor data into `data.js`.
  - Keep `refresh.py` and combine it with `SKILL.md` so that the person sees a before/after table with source links before approving.
  - Map the evaluations to the course's eight checks.
  - Separate the submission from group materials.
  - Merge the members' returned files and the user-value lead's log entry.
  - Replace every remaining Chinese text with English.
  - Write a five-minute live-demo script, one question per speaker with the dashboard steps, and backup slides.
- **Decisions and reasons:**
  - The project lead adopted the redesign as the final page; the original stays in the git history.
  - The bill ladder moved into `data.js` (`data.bill_ladder`), because only `index.html` and `data.js` are served.
  - Updates go through `refresh.py --out candidate`, then `tools/candidate.py review`. The data maintainer compares the values with the sources, then accepts or rejects. There is no scheduler.
  - The student checks and the update test were done by members who did not build the page; the project lead ran the failure test.
  - The talk is a five-minute live demo, as the instructor allowed. Five speakers each answer one of the course's five presentation questions. The slides are a backup and the course's `presentation.pdf`.
  - The `refresh.py` change from the user-value lead's copy was not adopted; that entry gives the reason.
- **Executed:**
  - The assistant rewrote `rebuild.py`, `refresh.py`, `verify.py`, the checks and the documents, and wrote `tools/candidate.py`.
  - A clean copy rebuilt `data.js` and `index.html` byte-identically.
  - The assistant ran the skill end to end on a scratch copy with live data before handing it to members.
  - After the members' tests, the assistant merged the returned files, recaptured the screenshots with the released data and replayed the demo clicks in headless Chrome to read every number in the script.
- **Errors and concerns tested, and how they were checked:**
  1. **A teammate reviewer's AI found that the redesign was not submittable.**
     - It needed a third file (`bills.js`).
     - It used the 2026-10-26 snapshot while a newer candidate existed.
     - The root page was still the original.
     - Student checks and fresh-assistant tests had not run.
     - The evaluations described the old version.

     The assistant confirmed every point against the repository and the course guide. Each was addressed by the decisions above.
  2. **The assistant's first plan conflicted with the assignment.**
     - It had the AI do the independent calculation and release data without a human decision.
     - It would have packaged `node_modules`.

     The assistant's own check of the assignment PDF caught this. Pages 8–10 require student calculations, human approval and no installed packages. The plan was changed.
  3. **Both check suites hard-coded the 2026-10-26 values,** so any real update would fail them. The assistant caught this before the update. Date-dependent checks now use a frozen copy of that data set (`tests/fixtures/`).
  4. **October 2025 CPI is missing.** So the October 2026 year-on-year rate (BLS release 2026-11-10) cannot be computed, and the summary would have held a null key number. The assistant found this while checking the data. The key number now uses the latest month that has a rate, labelled with that month, and `verify.py` checks that month.
  5. **Old year and order assumptions.**
     - `verify.py` read a fixed `treasury_2026.xml`, and the Treasury source link had a fixed year. Both now follow the quote date.
     - `refresh.py` downloaded before checking the unit setting, so an offline assistant would have stopped for the wrong reason. Settings are now checked first.
  6. **The review tool crashed with a bare `KeyError`** instead of naming a removed field. The automated check caught it. Removed fields now stop the review with their names.
  7. **The source-register check passed even without the update it tested.** The assistant's own review of the test caught it. It now checks the dates moving back on restore.
  8. **The refresh checks failed after the first real release.** They took the raw files from the project folder but compared the results with the frozen 2026-10-26 data set, so 7 of 44 failed once Task A released the 2026-11-06 quotes. The assistant's live trial had not rerun this suite after releasing; merging the returned Task A files caught it. The frozen release now carries its raw inputs (`tests/fixtures/inputs_2026-10-26/`), and all 44 pass on the new data.
  9. **The demo numbers changed with the release.** The user-value lead's demo row came from the 2026-10-26 quotes. With the released 2026-11-06 quotes, a 1 March 2027 payment is reached by the 13-week bill 25 days early, and the 17-week bill matures 8 days after it. The assistant found this while merging that entry. Every number in the script was then read from the final page by replaying the clicks in headless Chrome.
  10. **Chinese text in the evidence.** The project lead asked for English throughout. A scan found the Task B decision and the browser's date placeholder in two screenshots. The decision was translated, and the date field is now filled before each capture.
- **Files and contributions:**
  - The assistant wrote the code, documents, presentation script and backup slides.
  - The project lead made the final decisions: the redesign as the final page, `refresh.py` in the package, human approval, group 9, the class prefix and the presentation format. The project lead also ran the failure test.
  - The teammate reviewer's review prompted the restructure.

## 2026-11-09: Fresh-assistant tests and student checks (members)
- **Tool:** Codex desktop with file access, shell and Python; network only when the maintainer allowed it. Excel for the student workbook.
- **Goal and supplied files:** test `SKILL.md` in new conversations and check the calculations independently. Supplied: the submission ZIP with the 2026-10-26 data; for Task B, a copy whose `project.json` was replaced by `maintenance/invalid_unit_config.json`.
- **Prompt summary:**
  - Task A: follow `SKILL.md` to update the data to the newest official observations; show the before/after table, flags and source links, and wait for the maintainer's decision.
  - Task B: the same request in the test copy.
  - Task C: read the filled workbook and update the student routes of E1–E3 in `EVALS.md`.
  - At the end of each chat: fill in the test record from what actually happened.
- **Decisions and reasons:**
  - Task A: the data maintainer accepted the 2026-11-06 candidate after the review. The 13-week and 26-week rates (4.01% and 4.12%) and the September CPI index (336.940) were confirmed against the official pages.
  - When the page check could not run, the assistant restored the previous version, as `SKILL.md` requires. The release was repeated only after the candidate's SHA-256 matched the one accepted.
  - Task B: the maintainer endorsed the stop and authorized no configuration change.
- **Executed:**
  - Task A: refresh, review, release, restore, then review and release again; page checks 32 of 32 and Decimal checks 15 of 15 after the final release.
  - Task B: one refresh attempt, which stopped at the unit check before any download.
  - Task C: the checker typed the official values into the workbook's input cells; its formulas returned 16 PASS results.
- **Errors and concerns tested, and how they were checked:**
  1. **No network in the sandbox.** The first download failed on DNS. The maintainer allowed network access for that one command.
  2. **Certificate check failed.** Python could not verify the Treasury server. The maintainer had the assistant use the system certificate file instead of turning verification off, and the download succeeded.
  3. **Node not on the PATH.** The page check could not run after the first release, so the assistant restored the old version. The maintainer supplied an existing Node; the assistant checked its version and the candidate's SHA-256, released again, and both checks passed.
  4. **Python 3.9.5 in Task B,** below the stated 3.10. The refresh still reached the unit check and stopped there, as expected.

  These led to the `SKILL.md` changes recorded in `AGENT_TEST.md`.
- **Files and contributions:** `AGENT_TEST.md`, `evidence/task_a_operations.md`, `evidence/task_b_operations.md`, `evidence/release_review.md`, `maintenance/release_log.csv`, `evidence/independent_check.xlsx` and the E1–E3 student routes in `EVALS.md`. Members who did not write `SKILL.md` ran Task A and the Excel check; the project lead ran Task B. The assistants ran the commands and drafted the records; the people made every decision.

## 2026-11-10: Feedback on the two layers, and the speaker guide
- **Tool:** Claude Code desktop app; an independent AI reviewer in a separate context.
- **Goal and supplied files:** act on the user-value lead's AI-assisted review and prepare the speaker material. Supplied: the review note, and a speaker guide from another course as a format example.
- **Prompt summary:**
  - Say which screen the note refers to and how to fix it without crowding the layout.
  - Check whether the 13- and 26-week bills are the ones most used.
  - Rewrite the script as one page per speaker, on the screen they present, with the clicks numbered.
- **Decisions and reasons:**
  - Value keeps using two reference bills and timing seven maturities; the chart caption now names the reference bills. Letting the value follow the matched bill would change the model, the checks and the evidence the night before the talk, so it is the next step.
  - The talk presents the page as a benchmark for a payment reserve. Which bill to buy, and anything beyond the reserve, stays with the advisor.
- **Executed:** the caption in `PaymentTimeline.jsx` changed, `index.html` was rebuilt and the checks rerun; the screenshots were recaptured; `group/SPEAKER_GUIDE.pdf` was built from replayed clicks; the backup slides were updated.
- **Errors and concerns tested, and how they were checked:**
  1. **An unsupported claim.** The assistant first said the 13- and 26-week bills were the most used. Treasury auction results for August to October 2026 showed six tenors with similar volumes; the 13-week bill was 17.1% and the 26-week 14.7% of the bills sold. The claim was withdrawn. The Federal Reserve's H.15 release and FRED (DTB3, DTB6) confirm them as the published 3-month and 6-month reference maturities, which is the reason now given.
  2. **A wrong caption draft.** The independent reviewer found that the first draft said "two dark bars", while only the 13-week bar is dark and bar colours do not follow the selected bill. The final caption names navy and mid-blue.
  3. **A framing that conflicted with the reserve's purpose.** "If the bills do not beat inflation, move to other assets" was rejected. The money is for payments due in months, so liquidity comes first; below the break-even rate (4.17% for the 13-week bill) it keeps its purchasing power.
- **Files and contributions:** the user-value lead's review prompted the change. The project lead chose the small fix and the speaker-guide format. The assistant made the change, the guide and the slide update.

## Next steps
- Run a fuller user test with a member who did not build the page, on the questions in the user-test record.
- Refresh the data weekly with `SKILL.md`. The October 2026 CPI is due on 2026-11-10.
- Let the value follow whichever bill fits each payment, not only the two reference bills; then add payment amounts to the calendar.
