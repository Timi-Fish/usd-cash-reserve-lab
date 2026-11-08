# Fresh-context maintenance audit
Fresh-context subagent using supplied handover files only; not a human-operated new chat. No original development history supplied.
Bounded historical maintenance rehearsal; no source downloads, financial-method changes or accepted-file writes.

Accepted dashboard ID dev-g00-usd-cash. Saved quote 2026-10-26; exercise baseline 2026-10-23. CPI September 2026, release 2026-10-14. Review 2026-10-27.
Calculation route: bank-discount pricing (360-day convention), actual days to maturity, compounded scenario inflation (days/365).

## Actual commands
```text
python3 <project>/calculations/rebuild.py --input <project>/data --config <project>/maintenance/baseline_config.json --out <audit>/baseline
exit=0; {"status": "candidate_generated", "out": "<audit>/baseline", "quote_date": "2026-10-23", "rows": 703} 
```
```text
python3 <project>/calculations/rebuild.py --input <project>/data --config <project>/project.json --out <audit>/candidate
exit=0; {"status": "candidate_generated", "out": "<audit>/candidate", "quote_date": "2026-10-26", "rows": 704} 
```
```text
python3 <audit>/verification-copy/calculations/verify.py
exit=0; {"checks": 15, "all_pass": true} 
```
```text
python3 <project>/calculations/rebuild.py --input <audit>/failure-copy/data --config <audit>/failure-copy/project.json --out <audit>/failure-copy/candidate
exit=1;  STOP: Incompatible input unit
```

## Results
| Metric | Baseline | Candidate |
|---|---|---|
| quote_date | 2026-10-23 | 2026-10-26 |
| 13w discount_pct | 4.04 | 4.05 |
| 13w coupon_equivalent_pct | 4.14 | 4.15 |
| 13w maturity_date | 2027-01-21 | 2027-01-28 |
| 13w days | 90 | 94 |
| 13w price_per_100 | 98.99 | 98.9425 |
| 13w nominal_end | 101020.30508132135 | 101068.80258736135 |
| 13w real_end | 100286.69812231793 | 100302.3470297988 |
| 13w real_return_pct | 0.286698122317941 | 0.30234702979878847 |
| 26w discount_pct | 4.17 | 4.21 |
| 26w coupon_equivalent_pct | 4.32 | 4.36 |
| 26w maturity_date | 2027-04-22 | 2027-04-29 |
| 26w days | 181 | 185 |
| 26w price_per_100 | 97.90341666666666 | 97.83652777777777 |
| 26w nominal_end | 102141.481272785 | 102211.31337278879 |
| 26w real_end | 100655.21831585046 | 100691.411825568 |
| 26w real_return_pct | 0.6552183158504699 | 0.6914118255680002 |
| headline | 13-week reference: +0.29% modeled real return at 3.0% annual inflation. | 13-week reference: +0.30% modeled real return at 3.0% annual inflation. |
| CPI latest level | 336.94 | 336.94 |

Both reference maturities move seven days later while quote date moves three days later, so remaining days increase by four (90→94 and 181→185). If maturity were unchanged, the three elapsed quote-date days would reduce remaining days by three.

Independent Decimal 13-week price: 98.942500; nominal proceeds: 101068.8025873613462364504636531318695202; real proceeds: 100302.3470297987839836907048604435007979; absolute error: 1.60163092951395564992021E-11 USD (below $0.01).
15 supplied verification checks pass on isolated candidate copy. Raw CLOSE/YIELD and maturity fields match; summary and chart latest rates/dates match candidate data. Schema, identity and disclaimer preserved.
Original data.js SHA-256 before and after: `368620ecdd933116d279452671973d6f03785f36ec431d7d5d84ba7367f0f514`. Baseline hash unchanged; candidate data.js byte-identical to saved project data.js.
Stopped incompatible-unit candidate before output; request corrected rate_unit metadata matching confirmed percent source units. No conversion attempted.

## Limits
- EVALS.md referenced by instructions is absent at time of inspection; cannot rerun its full checklist.
- Browser and file-protocol rendering not run in this bounded audit. About and loader not browser-validated; index.html was not changed.
- Provenance, reuse and CPI release metadata assessed only from supplied source register/configuration; no external verification or downloads.
- AI Decimal arithmetic is not human independent calculation or sign-off.

## Decision pending
Pending: human reviewer independently checks source/financial values and accepts or rejects candidate; no approval or release performed.

## Addendum: later supplied evaluation records

Read `<project>/EVALS.md` and `<project>/evidence/browser_checks.md`. The earlier missing-file observation describes the initial inspection only.

E1-E3 arithmetic/source checks are supported by this audit’s separate candidate execution. E4 scenario invariants, E6 data rejection/null handling and E7 age logic are supported by the newly executed 13-check Node harness. E5 interaction and mobile statuses have documented development-assistant browser observations; this subagent did not rerun or visually verify those browser tests. E8 correctly distinguishes Node loader logic from pending human file-protocol reproduction. E7 visible stale-banner fixture is not documented in the provided browser_checks.md; the stale logic pass is supported, but visible stale-fixture confirmation remains unsupported by that document. Clean ZIP reproduction is only referenced and was not independently assessed in this addendum.

Executed `<bundled-node> <audit>/verification-copy/calculations/check_javascript.mjs`: exit 0, 13 checks, all passed. This tests JavaScript logic in a Node VM, including saved-data file loader with zero fetches; it is not a rendered browser test. The accepted data.js hash remains unchanged.

Human review and acceptance remain pending; no browser test or human action is attributed to this subagent.

Path keys: `<project>` is the accepted project folder; `<audit>` is this separate fresh-handover folder; `<bundled-node>` is the provided bundled Node executable.
