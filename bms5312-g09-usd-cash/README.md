# USD Cash Reserve Lab

Educational project. Not investment advice.

An offline dashboard for a family-office client who holds a short-term USD reserve for known payments. It answers three questions in order:
1. Do the saved U.S. Treasury bill maturities reach the payment dates?
2. What does an assumed inflation rate do to the cash's purchasing power until then?
3. Are the saved data still recent enough to use?

## Open it
1. Extract the ZIP and keep `index.html` and `data.js` side by side.
2. Double-click `index.html` and it opens in Chrome, Edge, Safari or Firefox. It needs no internet, account or installation.
3. The banner at the top gives the saved quote date and whether the data are within their age limits.
4. Use the tabs in order:
   - **Overview**: payment timing against each bill's maturity, the purchasing-power result and the two reference bills side by side.
   - **Calendar**: add payment dates and see which saved maturity falls on or before each one.
   - **Scenarios**: results across inflation assumptions, with break-even rates.
   - **History**: rates and CPI.
   - **Method**: formulas and sources.

The Overview also has Copy summary and Print summary for a discussion record. Payment dates stay in the open page only and are never saved or sent.

## Question and persona
- **Persona:** `family-office-client` (class vocabulary) and their advisor.
- **Question:** When is the cash needed, which saved Treasury bill maturity fits that date, and how could purchasing power change meanwhile?
- **Decisions informed:**
  1. Whether a reference maturity reaches each payment date, or the cash waits, or the bill would have to be sold early.
  2. How sensitive purchasing power is to the inflation assumption.
  3. When the data need a refresh.
- **Out of scope:** liquidity comes first, so the dashboard ranks nothing and does not ask cash to beat inflation. It excludes buy or sell advice, early-sale prices, taxes, fees, settlement, FX and reinvestment.

## Data sources
| Source | URL | Series / ID | Fields used | Dates and frequency | Units | Terms and permission basis |
|---|---|---|---|---|---|---|
| U.S. Treasury, Office of Debt Management: Daily Treasury Bill Rates | `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml?data=daily_treasury_bill_rates&field_tdr_date_value=<year>` | Data.gov dataset 015-DO-021 | `INDEX_DATE`, `ROUND_B1_CLOSE_<N>WK_2` (bank discount), `ROUND_B1_YIELD_<N>WK_2` (coupon equivalent), `MATURITY_DATE_<N>WK`, `CUSIP_<N>WK` for N = 4, 6, 8, 13, 17, 26, 52 | Business days from 2024-01-02; the saved end date is `summary.as_of` in `data.js` | percent | CC0 1.0 in the Data.gov dataset metadata; attribution kept |
| U.S. Bureau of Labor Statistics: CPI-U | `https://api.bls.gov/publicAPI/v2/timeseries/data/CUUR0000SA0` | `CUUR0000SA0` (U.S. city average, all items, not seasonally adjusted, 1982–84 = 100) | `year`, `period`, `value` | Monthly from 2023-01; the saved month is `data.cpi.release.observation_month` | index points | BLS published data are public domain; attribution kept |

`SOURCE_REGISTER.csv` holds the exact snapshot files, access date and coverage. They are updated with every release. `evidence/source_review.md` records the permission review and a hand cross-check against the BLS table. There is no paid data, aggregator, API key, logo or third-party image.

## Method
Symbols: B = cash placed (USD), d = bank discount rate as a decimal, n = calendar days from the saved quote date to maturity, a = assumed effective annual inflation.

```text
price per $100 face    P = 100 × (1 − d × n / 360)
nominal proceeds       N = B × 100 / P
inflation factor       F = (1 + a)^(n / 365)
purchasing power       R = N / F
real holding return    R / B − 1
break-even inflation   (100 / P)^(365 / n) − 1
CPI year on year       CPI(month) / CPI(same month a year earlier) − 1
```

Steps and reasons:
1. **Reference bills.** The 13-week and 26-week bills of the latest quote date are the two reference bills, with their own maturity dates and CUSIPs. The other five tenors of that day appear only in the payment calendar.
2. **Timing first.** For each payment date, the calendar finds the latest maturity on or before it (cash waits, with no return assumed) and the next maturity after it (the bill would have to be sold early, at an unknown price).
3. **Same-period inflation.** Inflation is a user assumption over the same n days. It is not last year's CPI subtracted from an annual rate, because that would mix periods. CPI history is shown only as context.
4. **Freshness.** Quotes are flagged after 7 days and CPI 60 days after its month end. These are project limits, not official schedules. Ages are counted from the observation date, never the download date.
5. **Defaults.** The defaults are $100,000 and 3% inflation. These are labelled assumptions, not client data or forecasts.

The full formulas, rounding and decomposition rules are in `calculations/method.md`. The code is `calculations/rebuild.py` (Python), and the page reproduces it in JavaScript.

References:
1. TreasuryDirect, Understanding Pricing and Interest Rates (bills): https://www.treasurydirect.gov/marketable-securities/understanding-pricing/
2. U.S. Treasury, Daily Treasury Bill Rates dataset and field definitions: https://catalog.data.gov/dataset/interest-rate-statistics-daily-treasury-bill-rates
3. BLS, Purchasing Power of the Consumer Dollar: https://www.bls.gov/cpi/factsheets/purchasing-power-constant-dollars.htm

## Validation
Eight evaluations with expected results, tolerances and evidence are in `EVALS.md`. The automatic checks:
- **`node dashboard/scripts/check-model.mjs`:** the page's arithmetic reproduces every result saved in `data.js` within 1e-9, plus freshness, history windows, formats and the summary. Output: `evidence/model_checks.json`.
- **`python3 calculations/verify.py`:** a second calculation route in Decimal arithmetic, traced field by field to the raw files. Output: `evidence/calculation_checks.json`.
- **`node tests/check_refresh.mjs`:** refresh, review, release, reject and restore in a throwaway copy, including broken inputs, plus the payment-calendar rules. Output: `evidence/refresh_checks.json`.

Student checks against the official sources, with visible formulas, are in `evidence/independent_check.xlsx`. The maintenance tests run by a fresh assistant are in `AGENT_TEST.md`.

## Limitations
- **Quotes are not prices.** Quotes are rounded secondary-market observations, not executable prices. The model buys on the quote date and holds to maturity, with no settlement lag, spread, tax or fee.
- **Remaining days, not label.** A "13-week" bill's remaining days depend on the quote date (90 to 94 days in the saved data), not on its label.
- **Inflation.** CPI-U is an average basket, not the client's own inflation, and it is published with a lag. October 2025 CPI was never published, so it stays empty. October 2026 therefore has no year-on-year rate; the latest available rate is shown with its own month.
- **Timing only.** The calendar matches dates only; it does not show whether the amounts suffice. Purchasing power after maturity, and any reinvestment, are not modelled.
- **Can mislead when** the quotes are old, which the banner warns about, or when a payment falls after every saved maturity.

## Refresh
`python3 refresh.py --out candidate` downloads both sources, validates them and recalculates everything into `candidate/`. `python3 tools/candidate.py review` then compares the candidate with the accepted version. Release happens only after a person accepts. The full procedure, with stop conditions, is `SKILL.md`.

- Python 3.10 or newer, standard library only. No `requirements.txt` is needed, and no environment variables or API keys exist.
- Node 18 or newer runs the checks. The page itself needs neither.
- Without internet access, download the two Treasury XML files (current and previous year) and the BLS JSON by hand into one folder. Then run `python3 refresh.py --out candidate --sources <folder>`.
- `python3 refresh.py` without `--out` follows the course default and replaces `data.js` and its inputs in this folder, but only after every check passes. `summary.refresh` is `automatic`, `weekly`.
- **No scheduler is set up.** A person starts every refresh.

To rebuild the saved version from its own inputs: `python3 calculations/rebuild.py --out candidate`. The resulting `candidate/data.js` is byte-identical to `data.js`.

To rebuild the page from source: in `dashboard/`, run `npm ci`, then `npm run build`. This needs Node 18+ and internet access once for the packages. It writes `index.html` here.

## Maintenance after the course
| Item | Plan |
|---|---|
| Frequency | Weekly (Monday, after the Treasury's Friday publication) and the day after each BLS CPI release in `maintenance/cpi_release_schedule.csv` |
| Responsible role | Data maintainer: runs `SKILL.md` with an assistant and accepts or rejects each release |
| Source access | Public Treasury XML and BLS API v2 URLs in `refresh.py`; no key or account |
| Calculation route | `refresh.py` → `calculations/rebuild.py` (accepted method) → `candidate/` |
| Checks | `tools/candidate.py review` (exact rebuild, unchanged fields, newer data, large moves flagged); the maintainer compares the rates and the CPI index with the source pages; after release, `check-model.mjs` and `verify.py` |
| Stale-data threshold | Quotes older than 7 days; CPI more than 60 days past its month end; the page banner says which |
| Failure response | Nothing is written on a failed check, and the page keeps the accepted data and its banner. Retry the next business day, or use manual downloads with `--sources`. A changed source format goes to the group before any code change. |
| Restore | `python3 tools/candidate.py restore --decision "<reason>"` puts back the version kept in `previous/`; older versions are in the git history and the submitted ZIP |
| Yearly task | Each December, add next year's BLS release dates to `maintenance/cpi_release_schedule.csv` (the review flags a missing date) |

Every release, rejection and restore is a line in `maintenance/release_log.csv`, recording the role that decided and what they checked.

## File map
| Path | What it is |
|---|---|
| `index.html`, `data.js` | The page (one self-contained file) and all saved data, including the class `summary` |
| `project.json` | Identity, units, cutoff dates, defaults, age limits and refresh setting of the saved version |
| `data/raw/` | Unmodified Treasury XML and BLS JSON downloads |
| `data/*_normalized.csv` | The same observations as tables (open in Excel) |
| `calculations/` | `rebuild.py` (method), `verify.py` (second route), `method.md`, `manual_checks.csv` (hand-check formulas) |
| `refresh.py`, `tools/candidate.py`, `SKILL.md` | Download, review and release, and the assistant's instructions |
| `maintenance/` | CPI release schedule, release log, test inputs for the agent tests |
| `tests/` | Maintenance checks and the frozen 2026-10-26 data set they use |
| `dashboard/` | Source of `index.html` (React with the Salt design system, built by Vite into one file) |
| `tools/set_identity.py` | Writes the renamed submission folder and ZIP |
| `PROPOSAL.md`, `SOURCE_REGISTER.csv`, `ontology.yml` | Brief and decisions, sources, vocabulary |
| `AI_LOG.md`, `EVALS.md`, `AGENT_TEST.md`, `evidence/` | Work log, evaluations, agent tests and their evidence |
| `presentation.pdf` | Slides for the final class |

Third-party components keep their licences:
- Salt design system (Apache-2.0);
- React, Chart.js, KaTeX (MIT);
- Open Sans and Source Serif 4 fonts (SIL Open Font License 1.1).
