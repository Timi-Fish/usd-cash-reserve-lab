# USD Cash Reserve Lab — review candidate v2

Educational project. Not investment advice.

## Candidate status
This is a separate proposed revision, prepared on 2026-10-27. It has NOT replaced the original version and has no human acceptance. Market observations, source snapshots, default principal/inflation, pricing convention and quote-date model start are unchanged. Updated `data.js` corrects the ontology mapping, question and adds explicitly derived decomposition fields. Original numerical defaults are unchanged. Previous evidence is archived in `evidence/v1/` and cannot prove this revision passes.

## Start in one minute
1. Extract the ZIP completely.
2. Open `index.html` in a recent Chrome, Edge, Safari or Firefox browser. Keep `data.js` beside it. No account, internet, installation or build step is needed to display the saved version.
3. Enter an optional cash date as YYYY-MM-DD. For an illustrative 2027-03-01 need, the saved 13-week reference matures 32 days earlier and the 26-week reference 59 days later. Calendar timing does not establish settlement or actual cash availability.
4. Change inflation from 3% to 6%, or apply an exact break-even button. Compare the sensitivity markers, decomposition and zero-interest benchmark. Switch the reference to see a different holding period.
5. Use the shared history window, series switches and month selector to inspect dated background observations.
6. Read `SUBMISSION_CHECKLIST.md` before submitting. This is a completed technical prototype with outstanding student-led requirements, not a declaration that the course work has all been completed.

## Question and user
For a family-office client holding USD cash reserves: when is the cash needed, which reference maturity fits the calendar, and how could purchasing power change under stated inflation assumptions? Liquidity and payment timing come first. The tool informs three related actions: check calendar timing, explore inflation sensitivity, and identify evidence needing review. It does not recommend an investment or imply that all cash must beat inflation.

## Interface guide
- **Overview:** inputs, saved observation date, prominent freshness warning, selected result and cash-date status. Identical-field cards show both reference maturities, actual days, annual bank discount quotes and holding-period outcomes. Selection is for detail, not a ranking.
- **Explore scenarios:** two inflation sensitivity curves use the same principal and annual assumption but their own maturities. A zero line, distinct line styles/markers, break-even buttons and a text table support reading without relying on color. The decomposition and zero-interest benchmark use the exact same `calc()` result as the headline.
- **Evidence & method:** the rate and CPI charts share calendar bounds anchored to the latest saved month. Select 12 months, 24 months or all history. Hover/click a point or use the month selector for exact dates and units. Rate switches affect plotted series and the selection readout; audit tables retain both series and are clearly labeled.

There are four graphical views: timing timeline, inflation sensitivity, rate history and CPI history. Decomposition and zero-interest amounts are explanatory numeric strips, not additional market series. Actual observed series remain three. No reinvestment strategy, external library, live source request or build tool is added.

### Cash-date behavior
No date means “Cash-date fit not assessed.” Maturity before the cash need reports the exact positive gap and assumes no return or inflation outcome after maturity. Same-day maturity is only a calendar match. Maturity after the need does not fit the hold-to-maturity schedule; early-sale price is unknown. Invalid dates or dates before the saved quote date pause all scenario outputs until corrected. Clear restores the unassessed state. Hypothetical dates may be in the past relative to the viewer, because the model remains anchored to the saved quote.

## Saved version and identity
The development ID is `dev-g00-usd-cash`; `g00` is not an assigned group. Latest Treasury observation: 2026-10-26. CPI observation: September 2026, released 2026-10-14. Retrieval and project review: 2026-10-27. The latest source date is not a claim that every series shares that date.

When the instructor provides the actual identifiers, run from this folder:

```text
python3 tools/set_identity.py --prefix YOUR_ACTUAL_PREFIX --group g07
```

Use the actual group, not the illustrative g07. The tool makes a separate renamed folder and ZIP, updates current identifiers and rebuilds the data; it preserves historical test evidence as evidence of the development version. Update the group label in presentation.pptx, re-export presentation.pdf, and update proposal.pdf from PROPOSAL.md; the utility does not rewrite binary documents. Do not submit the development ZIP unchanged.

## File map
- `index.html`, `data.js`: offline page and saved data, plus class metadata and required hosted-data loader.
- `project.json`: reviewed identity, units, input cutoff, release metadata and defaults.
- `data/raw/`: unmodified downloaded Treasury XML and BLS JSON snapshots.
- `data/*normalized.csv`: convenient derived extracts; raw sources remain authoritative.
- `calculations/rebuild.py`: dependency-free Python rebuild.
- `calculations/verify.py`: separate Decimal arithmetic and source-trace checks.
- `calculations/manual_checks.csv`: three Excel/calculator exercises for a student checker.
- `calculations/method.md`: formulas, financial interpretation and assumptions.
- `PROPOSAL.md`, `proposal.pdf`, `SOURCE_REGISTER.csv`, `ontology.yml`: scope, source permissions and vocabulary.
- `SKILL.md`, `AGENT_TEST.md`, `AI_LOG.md`, `EVALS.md`: maintenance instructions and honest work/test records.
- `maintenance/`: recorded rehearsal configurations and prompts; output evidence is under `evidence/`.
- `presentation.pdf`, `presentation.pptx`, `PRESENTATION_NOTES.md`: class demonstration materials and editable slides.
- `SUBMISSION_CHECKLIST.md`: remaining group obligations.

## Sources and permission
See SOURCE_REGISTER.csv and evidence/source_review.md. Treasury series fields are `ROUND_B1_CLOSE_13WK_2` and `ROUND_B1_CLOSE_26WK_2` (percent on bank discount basis). Coupon equivalents are retained for context but are not the calculation input. Maturity dates and CUSIPs come from the same official XML. BLS series CUUR0000SA0 is all-items CPI-U, U.S. city average, not seasonally adjusted, 1982–84=100. We use direct provider inputs, not an aggregator. No paid data.

The Treasury dataset's CC0 metadata and BLS public-domain statement support using the numerical snapshots in AI-assisted educational processing, instructor handover and later hosting with attribution. This basis covers these data, not every item on every government website. No agency endorsement is implied. Recheck if the dataset or intended content changes.

## Method
Let B be invested USD, d the decimal bank discount rate, n actual calendar days from quote date to maturity, and a the assumed effective annual inflation rate.

```text
price_per_100 = 100*(1-d*n/360)
nominal_proceeds = B*100/price_per_100
nominal_holding_return = 100/price_per_100-1
inflation_factor = (1+a)^(n/365)
real_proceeds = nominal_proceeds/inflation_factor
real_holding_return = real_proceeds/B-1
break_even_annual_inflation = (100/price_per_100)^(365/n)-1
CPI_year_on_year = CPI_month/CPI_same_month_prior_year-1
```

Input percentages are divided by 100 before calculation. Amounts are displayed rounded to dollars and returns to two decimals, but internal values are unrounded. “Real” means expressed in scenario-start purchasing power. The break-even rate is a mathematical threshold, not a forecast.

All scenario observation values and changing conclusions derive from data.js or these formulas. The default $100,000 and 3% inflation are clearly labeled hypothetical group-design assumptions. They are not client data or a prediction.

### Price and settlement limitations
The reference bill's source maturity tranche is a label; it is not necessarily its original issuance tenor. Remaining days can differ: the saved 13-week reference has 94 days and the 26-week reference 185 days. The model uses the quote date as the purchase date. Actual settlement date, execution price, bid/ask spread, quantity denomination and accrued operational constraints may differ. It is an indicative discount-price calculation, not an executable quote, an auction allocation or a promised holding return. Taxes, fees and fractional-lot constraints are excluded. Early liquidation is not modeled. A longer maturity is not automatically preferable.

### Historical context and missing data
Treasury history uses the last observed business-day quote in each month; the most recent month may be incomplete. CPI is plotted by observation month, using the downloaded vintage, with no claim that the figures were already available on that month-end. The calendar window spans the same start/end months for both charts, with missing edge months retained. The current CPI release date is verified separately. No rate-minus-CPI “real yield” is calculated. October 2025 CPI is unavailable in the saved provider data and remains null. A missing denominator makes the year-on-year change null. The first CPI year is calculation support and has no year-on-year values in this snapshot.

## Rebuild the saved version
Requires Python 3.10+ only; standard library, no packages or API keys. Python is needed to rebuild, not to view the dashboard. On Windows, `py -3` may replace `python3`.

```text
python3 calculations/rebuild.py --out candidate
```

This reads project.json and data/raw/, validates units and fields, calculates results and writes candidate/data.js plus CSV extracts and a report. It never replaces the accepted root data.js by default. Compare candidate/data.js byte-for-byte to the root data.js for this saved input/configuration. After inspection, approved releases copy the candidate data and normalized CSVs to their documented destinations. Preserve the previous accepted version outside the submission folder.

```text
python3 calculations/verify.py
```

This uses separate Decimal arithmetic and raw-source checks, saves evidence/calculation_checks.json and CSV, and exits nonzero on failure. The same assistant operated both routes; this does not replace an independent student calculation.

## Update with newer inputs
Owner: a designated data-checker role; final release: a separate human reviewer role. Review monthly and refresh rates again before use if they are stale.
1. Save a dated backup outside the final pack.
2. Download new permitted Treasury XML and BLS JSON using the source register URLs. Manual browser download is acceptable. Inspect series ID, fields, dates and units before loading them. Never replace missing values with zero.
3. Prepare a separate candidate input folder. Keep the BLS filename stable; its current name describes the original snapshot. On a year rollover, include a new Treasury XML and extend the BLS request range without exceeding provider limits. Preserve at least 12 prior CPI months. The parser reads treasury_*.xml automatically.
4. Update a candidate project.json: access/review dates, quote cutoff and verified current CPI release metadata. Do not invent a publication date. Keep the source URL and release date aligned. The source-link year in rebuild.py must be reviewed at a year rollover; this is a manual supervised step, not silent automation.
5. Use SKILL.md. Run rebuild.py with --input, --config and --out targeting the candidate set. Compare at least three values/statuses and independently recalculate one update.
6. Rerun affected evaluations. Request human accept/reject before replacing accepted inputs, config, data.js and CSVs together.
7. Record the decision, actual actions and evidence in AGENT_TEST.md and AI_LOG.md.

No automatic download script or scheduler is provided. `refresh.mode` is manual.

## Freshness rules
Rates are stale after 7 calendar days from the quote date. CPI is stale after 60 calendar days from observation month-end. These conservative project thresholds are not official release schedules and do not account for every holiday or exceptional shutdown. Status is recalculated against the viewer's device calendar date. The package also records build-time status. Monthly review alone will allow rate data to become stale between reviews; the warning is intentional and the user should request a refresh before use. A downloaded or reviewed date never resets observation age.

## Failure and recovery
Invalid required inputs stop the rebuild before candidate output is written. Browser-invalid inputs hide calculated outputs rather than displaying old numbers. Missing historical CPI appears as a gap. Stop for unavailable sources, unit/series changes, missing latest CPI, an invalid latest maturity/rate, duplicate/missing reference tenors, duplicate securities, or disagreement between quote date, maturity and actual days. Browser validation pauses the whole dashboard for invalid required saved data. Preserve accepted files, report the exact issue and request corrected input. Restore all accepted files together from the external backup if a reviewed release proves incorrect.

## Validation and limitations
See EVALS.md and `evidence/revision_checks.json` for checks actually rerun for this candidate. Run the full revision logic suite with Node.js 18+ (optional; not required to view):

```text
node calculations/check_revision.mjs
```

Python Decimal/source checks, JavaScript model/loader checks, actual HTTP browser interactions and clean ZIP reproduction are distinct evidence types. A literal file:// browser opening was attempted and blocked by the browser tool's URL policy; file-mode rendering is **NOT RUN**. The required loader's file branch passed a zero-fetch logic check, which is not an actual browser file-opening result. Another group member must double-click the extracted index.html and test it.

Normal and failure maintenance were rerun in this conversation on the revised files. The archived fresh-context AI audit applies only to v1. Fresh-context handover for the changed instructions, student independent calculations, non-builder usability and human acceptance remain pending. No AI signs for a student.

## Financial references
1. TreasuryDirect, Understanding Pricing and Interest Rates, Bills: https://www.treasurydirect.gov/marketable-securities/understanding-pricing/
2. U.S. Treasury daily bill-rate definitions and Data.gov metadata: https://catalog.data.gov/dataset/interest-rate-statistics-daily-treasury-bill-rates
3. BLS, Purchasing Power of the Consumer Dollar: https://www.bls.gov/cpi/factsheets/purchasing-power-constant-dollars.htm

## Human decisions still needed
Approve the method, defaults and stale-data thresholds; supply class/group identifiers; independently check at least three representative outputs; run a new-chat maintenance handover without the development history; record actual acceptance decisions; conduct a non-builder user test and final presentation rehearsal. Do not invent names, decisions or evidence to fill these gaps.

## Revision rounding and decomposition
`nominal_interest = nominal_end - principal`; `purchasing_power_adjustment = nominal_end - real_end`; `cash_advantage = real_end - zero_interest_real_end`. The adjustment is a purchasing-power conversion, not a cash debit. It becomes negative under deflation. Initial principal + interest - adjustment equals purchasing power in full precision. Separately rounded cents can differ by one cent. Headline changes under $0.50 are “approximately unchanged”; percent magnitudes below 0.005 percentage points display 0.00%, not negative zero.

## Vocabulary correction
The previous summary mapped discount quotes to `core:bond-yield`, defined by the class as yield to maturity. Both quote key numbers now use `g00:bank-discount-rate`. The group term explicitly states the face-value/360-day quotation convention. The nearest broad organizational parent is `core:price` with an explicit mapping note, not an assertion that these are equivalent quantities. Core vocabulary is unmodified. See reference/CLASS_ONTOLOGY.yml.

## Quick manual acceptance exercise
1. Reset; confirm $100,302 purchasing power for the saved 13-week default.
2. Enter 2027-03-01; explain 32 days early versus 59 days late without calling either reference best.
3. Raise annual inflation to 6%; confirm unchanged nominal proceeds and lower purchasing power. Apply the 13-week break-even button, then try -2% to explain the negative conversion adjustment.
4. Switch to 26-week; confirm that the zero-interest period changes to 185 days too.
5. Select 24 calendar months and inspect October 2025 CPI as missing. Hide one rate and restore it.
6. Clear an amount; verify outputs disappear until corrected. Clear the date; confirm matching is unassessed.
7. Record the operator, actual results and any feedback in evidence/student_signoff.md. No pass is prefilled.
