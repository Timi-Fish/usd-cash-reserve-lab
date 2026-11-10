# Evaluation results

Eight checks, following section 7 of the assignment. Each has two routes:
- **Assistant route:** scripts run by the development assistant.
- **Student route:** a group member working from the official sources with visible formulas.

Expected results and tolerances were set before any comparison. The version checked is the quote date in `data.js` (`summary.as_of`); scripts rerun after every release.

| ID | Check | Assistant route | Student route |
|---|---|---|---|
| E1 | Source match | Pass | Pass |
| E2 | Calculation check | Pass | Pass |
| E3 | Second calculation and boundary | Pass | Pass |
| E4 | Financial interpretation | Pass | Not run |
| E5 | Interaction | Pass | Partial |
| E6 | Missing or invalid input | Pass | Pass |
| E7 | Freshness and update | Pass | Pass |
| E8 | Clean reproduction | Pass | Not run |

## E1 Source match
- **Purpose:** every saved observation equals the official source.
- **Input:**
  - `data.js`;
  - `data/raw/treasury_<quote year>.xml` and `data/raw/cpi_2023_2026.json`;
  - the Treasury Daily Treasury Bill Rates page for the quote year;
  - the BLS CPI release linked on the Method tab.
- **Expected:**
  - Exact match for the 13-week and 26-week bank discount rates (2 decimals as published), their maturity dates and CUSIPs on the quote date.
  - Exact match for the CPI-U index (3 decimals) of the saved month and of the same month a year earlier.
- **Assistant route:** `calculations/verify.py` traced each rate, maturity date and day count to the raw XML field, and the CPI ratio to the raw JSON. Run on 2026-11-10 for quote date 2026-11-06: exact matches, pass.
- **Student route:** Independent student checker, 2026-11-09, checked quote date 2026-11-06. The checker confirmed personally obtaining the inputs from the official websites. Sheet 1 Source match records seven PASS results: quote date 2026-11-06; 13-week and 26-week bank discount rates 4.01% and 4.12%; maturity dates 2027-02-04 and 2027-05-06; September 2026 and September 2025 CPI-U indices 336.940 and 324.800. Official-source and dashboard columns agree exactly. Pass for the workbook source comparisons; CUSIPs are not separately recorded in this workbook.
- **Evidence:** `evidence/calculation_checks.json`, `evidence/source_review.md` (a hand cross-check of three BLS index values), `evidence/independent_check.xlsx`.

## E2 Calculation check
- **Purpose:** the default 13-week result is correct.
- **Input:**
  - cash placed $100,000, 3% assumed inflation;
  - the 13-week rate and dates from E1;
  - the Overview figures.
- **Expected:**
  - Price per $100 within 1e-8.
  - Nominal proceeds and purchasing power within $0.01, or ±$0.50 against the whole dollars shown on the page.
  - Real return within 0.005 percentage points of the page.
- **Assistant route:**
  - `node dashboard/scripts/check-model.mjs`: the page's JavaScript reproduces all 12 saved results of both bills within 1e-9 (32 of 32 checks).
  - `calculations/verify.py`: the price and real proceeds again in Decimal arithmetic (15 of 15).
  - Both run on 2026-11-10, pass.
- **Student route:** Independent student checker, 2026-11-09, checked quote date 2026-11-06. Sheet 2 Calculation uses USD 100,000, 3% annual inflation, 4.01% bank discount and 90 days. Formula results: price 98.9975 per USD 100; nominal proceeds USD 101012.65183464228; inflation factor 1.0073150973433052; purchasing power USD 100279.10045332712; real return 0.279100453327108%. Entered dashboard comparisons: USD 101013, USD 100279 and 0.28%. All three comparisons PASS within the preset tolerances. Pass.
- **Evidence:** `evidence/model_checks.json`, `evidence/calculation_checks.csv`, `evidence/independent_check.xlsx`.

## E3 Second calculation and boundary
- **Purpose:** a second route, and the edges of the model, behave as documented.
- **Input:** the 26-week reference; break-even inflation; zero rate with zero inflation; out-of-range inputs.
- **Expected:**
  - At the break-even rate, purchasing power equals the cash placed within $0.01.
  - A 0% rate with 0% inflation returns the cash placed exactly.
  - A 4% rate for 90 days gives a price of exactly 99.
  - Cash of $0, cash above $100,000,000, and inflation below −5% or above 15% show a message and no result.
  - Nominal proceeds do not change with inflation; purchasing power falls as inflation rises.
- **Assistant route:** `check-model.mjs` (break-even, decomposition, inflation direction, the four rejections) and `verify.py` (boundary fixtures). Run 2026-11-10, pass.
- **Student route:** Independent student checker, 2026-11-09, checked quote date 2026-11-06. Sheet 3 Boundary calculates 13-week and 26-week break-even inflation at 4.170845416920055% and 4.311448537283158%, compared with entered dashboard values 4.17% and 4.31%: both PASS. Purchasing power at break-even equals USD 100000 within USD 0.01 for both bills: both PASS. Zero-rate/zero-inflation result is USD 100000: PASS. CPI year-on-year is 3.737684729064039%, compared with 3.74%: PASS. Six workbook checks PASS; additional interactive boundary tests are not evidenced by this workbook.
- **Evidence:** `evidence/model_checks.json`, `evidence/calculation_checks.json`, `evidence/independent_check.xlsx`.

## E4 Financial interpretation
- **Purpose:** the page leads a reader to correct conclusions.
- **Input:** the Overview, Calendar and Scenarios tabs, with a payment date the tester chooses.
- **Expected:**
  - The tester names the maturity that reaches the payment and the days the cash waits.
  - The tester says that a later bill would have to be sold early at an unknown price.
  - The tester says that higher inflation lowers purchasing power, not the dollar proceeds.
  - The tester calls no bill "best".
- **Assistant route:**
  - `check-model.mjs` checks the summary wording: the outcome at maturity, the payment-fit text, the line about sale before maturity, and the disclaimer last.
  - Every view was read in headless Chrome at desktop and phone width.
  - Run 2026-11-10, pass.
- **Student route:** not run. On 2026-11-10 a group member opened the page in Chrome on macOS but recorded no answers to the four questions in `evidence/user_test.md`; whether they took part in building the page was not confirmed.
- **Evidence:** `evidence/model_checks.json`, `evidence/user_test.md`.

## E5 Interaction
- **Purpose:** every control works in a normal browser opened by double-click.
- **Input:** `index.html` beside `data.js`.
- **Controls:**
  - amount, inflation and reference bill;
  - add, select, remove and clear payments;
  - break-even buttons;
  - history window and series switches;
  - Copy summary and Print summary.
- **Expected:**
  - Each control updates every view that depends on it.
  - No console error.
  - Copy places the summary on the clipboard.
  - Print shows only the summary.
- **Assistant route:** headless Chrome loaded the page from `file://` and opened all five tabs at 1440 px and 390 px, with the example payment dates. It found no console errors or exceptions. Run 2026-11-10, pass.
- **Student route:** partial. The same member opened all five tabs with no error reported; the other controls, including Copy and Print, were not recorded (`evidence/user_test.md`).
- **Evidence:** `evidence/screenshots/`, `evidence/user_test.md`.

## E6 Missing or invalid input
- **Purpose:** bad input stops with a clear message and never replaces accepted data.
- **Input (in a throwaway copy):**
  - a failed BLS request;
  - quotes older than the accepted version;
  - a CPI month not yet released;
  - a candidate with a field removed;
  - a candidate with a hand-edited value.
- **Input (on the page):** an empty payment name, a rolled-over date such as 2027-02-30, a thirteenth payment, and a broken bill record.
- **Expected:**
  - The download and review steps print `STOP`, exit 1 and write or copy nothing.
  - The unreleased CPI month is held back with a warning.
  - Each page entry error names its form field.
- **Assistant route:** `node tests/check_refresh.mjs` (44 of 44, including the basis-points setting stopping before any download) and `check-model.mjs` (32 of 32). Run 2026-11-10, pass.
- **Student route:** Task B in `AGENT_TEST.md`. The project lead, as data maintainer, gave a fresh assistant a test copy whose `rate_unit` was `basis-points`, on 2026-11-09. `refresh.py --out candidate` printed `STOP: Incompatible input unit` and exited 1. No `candidate/` folder appeared, `data.js` kept its SHA-256, and the assistant explained the unit conflict and asked for a corrected setting. This matches the response set before the test. Pass.
- **Evidence:** `evidence/refresh_checks.json`, `evidence/model_checks.json`, `AGENT_TEST.md`.

## E7 Freshness and update
- **Purpose:** the page states the age of its data, and an update follows the supervised process.
- **Input:** the frozen 2026-10-26 data set at chosen dates; the live sources for Task A.
- **Expected:**
  - Quotes 7 days old are within the limit; 8 days old are flagged.
  - A device date before the quote date is flagged.
  - A matured reference is listed as historical.
  - A refresh adds the newest observation without changing any field. A release happens only after a human accepts, and the old version stays restorable.
- **Assistant route:** `check-model.mjs` and `tests/check_refresh.mjs` cover all four age states and the review, release, reject and restore steps. Run 2026-11-10, pass.
- **Student route:** Task A in `AGENT_TEST.md`, 2026-11-09. A fresh assistant downloaded the live sources; the review showed the quote date moving from 2026-10-26 to 2026-11-06 with no removed fields and no flags. The data maintainer accepted, and the release kept the previous version. When the page check could not run, `restore` brought the previous version back; the release was repeated after a matching SHA-256, and both checks passed. Pass.
- **Evidence:** `evidence/model_checks.json`, `evidence/refresh_checks.json`, `AGENT_TEST.md`, `maintenance/release_log.csv`, `evidence/release_review.md`.

## E8 Clean reproduction
- **Purpose:** the package works from the ZIP alone.
- **Input:** the submission ZIP, extracted into an empty folder on another computer.
- **Expected:**
  - `index.html` opens by double-click and shows data.
  - `python3 calculations/rebuild.py --out candidate` gives a `candidate/data.js` byte-identical to `data.js`.
  - `node tests/check_refresh.mjs` and `node dashboard/scripts/check-model.mjs` pass.
  - In `dashboard/`, `npm ci && npm run build` writes an `index.html` byte-identical to the shipped one.
- **Assistant route:** the final ZIP, with no `node_modules`, `dist` or working folders, was extracted into an empty folder on 2026-11-10. Results:
  - 3.8 MB ZIP, 84 files;
  - `data.js` byte-identical after the rebuild;
  - 32, 44 and 15 checks passed;
  - after `npm ci && npm run build`, `index.html` was byte-identical to the shipped one (Node 24, Python 3.14);
  - the page opened from `file://` with no console errors.

  Pass.
- **Student route:** not run; the member recorded no commands or outputs. The teammate's assistant reran the rebuild and the three check suites in a copy on 2026-11-10: `data.js` byte-identical, 15, 32 and 44 checks passed (`evidence/user_test.md`).
- **Evidence:** this section and `evidence/user_test.md`.
