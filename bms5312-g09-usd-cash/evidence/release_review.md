# Candidate review

AI pre-review: PASS, 0 flag(s). Run on 2026-11-09.

| Item | Accepted | Candidate | Changed |
|---|---|---|---|
| Latest Treasury quote date | 2026-10-26 | 2026-11-06 | yes |
| 13-week bank discount rate (%) | 4.05 | 4.01 | yes |
| 26-week bank discount rate (%) | 4.21 | 4.12 | yes |
| 13-week coupon-equivalent yield (%) | 4.15 | 4.11 | yes |
| 26-week coupon-equivalent yield (%) | 4.36 | 4.26 | yes |
| 13-week reference maturity | 2027-01-28 (94 days) | 2027-02-04 (90 days) | yes |
| 26-week reference maturity | 2027-04-29 (185 days) | 2027-05-06 (181 days) | yes |
| Bill tenors in the payment calendar (weeks) | 4, 6, 8, 13, 17, 26, 52 | 4, 6, 8, 13, 17, 26, 52 |  |
| Latest CPI month (BLS release date) | 2026-09 (2026-10-14) | 2026-09 (2026-10-14) |  |
| CPI-U index level, latest month | 336.94 | 336.94 |  |
| CPI-U year-on-year (%) | 3.74 (as of 2026-09) | 3.74 (as of 2026-09) |  |
| 13-week real return, default scenario (%) | 0.302 | 0.279 | yes |
| 26-week real return, default scenario (%) | 0.691 | 0.629 | yes |
| Headline | 13-week reference: +0.30% modeled real return at 3.0% annual inflation. | 13-week reference: +0.28% modeled real return at 3.0% annual inflation. | yes |

## Check these against the sources yourself
1. Treasury: open https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_bill_rates&field_tdr_date_value=2026 and find the row dated 2026-11-06. The 13-week and 26-week "Bank Discount" columns should match the table above.
2. BLS: open https://www.bls.gov/news.release/archives/cpi_10142026.htm. The not seasonally adjusted CPI-U index for 2026-09 should match the index level above.
3. The same values in the downloaded files: candidate/data/quotes_normalized.csv (opens in Excel; last row) and candidate/data/cpi_normalized.csv; the raw downloads are in candidate/data/raw/.

## Automatic checks
- candidate/data.js is one statement of valid JSON under 2 MB, rebuilt here from its own saved inputs
- no field removed or renamed; same dashboard id; observations newer than the accepted version

## Stops
- none

## Flags for the person
- none

Release only after the person who reviews says yes: python3 tools/candidate.py release --decision "<role> accepted after checking <what>"
