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
  - In a revision, the bank discount quote had been mapped to `core:bond-yield` (yield to maturity). It was remapped to the group term `bank-discount-rate`.
- **Contributions:** project lead: topic, direction and approval of the approach. Assistant: code, data snapshots and drafts.

## Original dashboard review (user-value lead)
- **Tool:** AI chat assistant for the review; Astra for carrying out the improvements.
- **Goal:** a stricter review of the original dashboard's purpose, features and presentation.
- **Prompt summary, decisions and effects:**

| # | Type | What the user-value lead asked | Effect on the work |
|---|---|---|---|
| 1 | Financial logic | Whether short-term cash must beat inflation, and whether comparing a short holding with annual inflation is sound | Liquidity, safety and payment timing come first; inflation is shown as purchasing power over the same period |
| 2 | Product direction | A stricter feature review, with more visual polish and better interaction | The AI proposed date matching, a sensitivity chart, a purchasing-power breakdown and layout changes; these were AI proposals, decided later |
| 3 | Deliverable form | The review turned into complete prompts another AI could carry out, with an English interface | Output became implementation instructions; a local path was removed from the prompts |
| 4 | Review scope | Re-evaluation against the instructor's questions on purpose, user tasks, continued use and stakeholder value | The review widened from features and looks to business value, maintenance, user testing and course evidence |
| 5 | Collaboration | A teammate would carry out the changes with Astra, step by step, with each step's purpose | Work split into eight stages; AI tasks separated from the checks, tests and reviews members must do themselves |
| 6 | Presentation scope | A one-minute English script for the user-value part, with the matching clicks | The demo focuses on how an inflation change affects purchasing power, using the current page names |

- **Open at the end of that session:**
  - replacing the original with the redesign;
  - automatic refresh;
  - the default inflation and age limits;
  - seven-tenor and reinvestment models;
  - student checks and user tests.

  The 2026-11-09 entry records how each was settled.

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
  - It found that only 2 of the 7 saved tenors were used. A 2027-03-01 payment fell 32 days after the 13-week maturity, while a saved 17-week bill matured 6 days before it.
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
- **Goal and supplied files:** make the redesign the final submission, follow the instructor's assignment folder, and prepare the maintenance skill for a fresh-assistant test.
- **Prompt summary:**
  - Adopt the redesign.
  - Fold the seven-tenor data into `data.js`.
  - Keep `refresh.py` and combine it with `SKILL.md` so that the person sees a before/after table with source links before approving.
  - Map the evaluations to the course's eight checks.
  - Separate the submission from group materials.
- **Decisions and reasons:**
  - The project lead adopted the redesign as the final page; the original stays in the git history.
  - The bill ladder moved into `data.js` (`data.bill_ladder`), because only `index.html` and `data.js` are served.
  - Updates go through `refresh.py --out candidate`, then `tools/candidate.py review`. The data maintainer compares the values with the sources, then accepts or rejects. There is no scheduler.
  - The student checks and the fresh-assistant tests are done by members who did not build the page.
- **Executed:**
  - The assistant rewrote `rebuild.py`, `refresh.py`, `verify.py`, the checks and the documents, and wrote `tools/candidate.py`.
  - A clean copy rebuilt `data.js` and `index.html` byte-identically.
  - The assistant ran the skill end to end on a scratch copy with live data before handing it to members.
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
- **Files and contributions:**
  - The assistant wrote the code and documents.
  - The project lead made the final decisions: the redesign as the final page, `refresh.py` in the package, human approval, group 9, and the class prefix.
  - The teammate reviewer's review prompted the restructure.

## Next steps
Members complete the student routes in `EVALS.md`, Tasks A and B in `AGENT_TEST.md` and `evidence/user_test.md`, then rebuild the final ZIP with the official identifier.
