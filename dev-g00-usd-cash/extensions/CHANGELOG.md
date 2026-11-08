# Changelog

All notable changes to `extensions/`. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and dates are ISO 8601. Nothing in this folder has been accepted by the group.

## [Unreleased] - 2026-11-08

### Added

- `auto-refresh/refresh.py`: an automatic refresh that also runs on manually downloaded files (`--sources`).
  - It downloads Daily Treasury Bill Rates XML for the two latest years and the BLS CPI-U series (CUUR0000SA0), then validates them with the accepted `calculations/rebuild.py`.
  - It writes a coordinated set: dashboard `data.js`, `project.json`, raw inputs, normalized CSVs and `refresh_report.json`, plus the calendar's `bills.js`.
  - It stops without writing anything on a failed check, and it holds back any CPI month whose BLS release date has not yet passed.
- `auto-refresh/cpi_release_schedule.csv`: CPI release dates for observation months 2026-09 to 2027-11. The 2026-09 row comes from the accepted `project.json`; the rest come from https://www.bls.gov/schedule/news_release/cpi.htm, read on 2026-11-08.
- `auto-refresh/candidate/`: output of the live refresh. Quote date 2026-11-06; CPI 2026-09, released 2026-10-14; retrieved 2026-11-08; 713 quote rows.
- `liquidity-calendar/`: a month-calendar page.
  - It places a client's payment dates beside the maturities of all seven saved reference bills and shows how many days cash would wait.
  - It separates fixed USD payments from price-sensitive budgets.
  - It produces a discussion summary that can be copied or printed.
  - It takes dates only; nothing is stored or sent.
- `liquidity-calendar/PRODUCT.md` and `liquidity-calendar/DESIGN.md`: the calendar's product record and visual system.
- `tests/check_extensions.mjs` and `evidence/extension_checks.json`: 36 checks.
- `README.md`, `INTERFACES.md` and `REVIEW.md`.

### Changed

- Nothing outside `extensions/`. On 2026-11-08 every file outside this folder was compared byte for byte with the delivered v2 package and found identical.

### Verified on 2026-11-08

| Check | Result | Evidence |
|---|---|---|
| Offline reproduction | Refresh with the accepted inputs and dates gives a `data.js` identical apart from `summary.refresh`, an equal `project.json`, and byte-identical normalized CSVs | `evidence/extension_checks.json` |
| Live refresh | Treasury and BLS reached; candidate quote date 2026-11-06; 13-week 4.05% → 4.01% and 94 → 90 days; 26-week 4.21% → 4.12% and 185 → 181 days; default purchasing power $100,302 → $100,279; no warnings | `auto-refresh/candidate/refresh_report.json` |
| Stop rules | A failed BLS request stops the run and writes nothing; quotes older than the accepted release stop it; an unreleased CPI month is held back with a warning | `evidence/extension_checks.json` |
| Calendar logic | Fit kinds, date and name validation, bill-data validation, freshness states, month layout, summary text | `evidence/extension_checks.json` |
| Calendar in a browser | HTTP preview at 1440×900 and 390×844: adding dates, validation messages, same-day and no-fit dates, removing with undo, clearing with undo, example dates; keyboard focus after every action; copy and print disabled with no dates; no horizontal overflow on a phone; print preview keeps the table layout | Run by the assistant; screenshots not stored in the package |
| Dashboard compatibility | The accepted `index.html` renders the live candidate without errors (quote 2026-11-06, "within project age limits") | HTTP preview run by the assistant |
| Design review | Independent review by a fresh-context reviewer, two rounds. Round 1: ship-with-fixes, 7 material findings (grid borders, line breaks inside dates, hidden list, phone table overflow, lost keyboard focus, focus-ring contrast, source link). Round 2: all 7 resolved; one new issue (entry line wrapping) and two minor ones, fixed afterwards and checked by the assistant with screenshots and a print preview, not re-reviewed | Reviewer reports summarized here |

### Not run

- Literal double-click (file://) test. The assistant's preview pane shows local files as static snapshots without scripts, so the page was checked over HTTP only. A group member should double-click `liquidity-calendar/index.html` and record the result.
- Fresh-chat maintenance handover, student independent calculation, non-builder user test and human acceptance.
- Scheduled runs: nothing is scheduled.

### Work log entry (copy into `../AI_LOG.md` if accepted)

**2026-11-08. User role:** group member making the request. **AI role:** development assistant.

- **Goal:** answer whom the dashboard serves and whether it stays useful after a year, then add an automatic refresh, a liquidity calendar and a review, kept in `extensions/` with a changelog other assistants can read.
- **Decisions by the requester** (group endorsement pending):
  - The calendar is maintained software, and the documents are in English.
  - The primary user is the family-office client.
  - Dates only: no amounts, coverage or roll strategy, following the group's scope limits.
  - Nothing is stored.
  - The refresh stays in this folder, with adoption left to the group.
  - The page uses the month-calendar structure.
- **Sources actually used:** Treasury XML for 2025 and 2026, the BLS API v2 (CUUR0000SA0, 2023 to 2026), and the BLS CPI release schedule page.
- **Concerns tested:** the refresh reproduces the accepted outputs, stops on bad inputs and holds back unreleased CPI; the dashboard accepts refreshed data. One test expectation was wrong (it expected `true` for an exit code of 0); the expectation was corrected, not the code.
- **Next steps:** the group decisions listed in `REVIEW.md`, the double-click test and a user test.
