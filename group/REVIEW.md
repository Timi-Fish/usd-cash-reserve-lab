# Product and sustainability review

Scope: the accepted v2 dashboard in the project root, plus the additions in this folder. Prepared on 2026-11-08 by the development assistant. Each fact cites its evidence; suggestions are labelled as suggestions. Nothing here is a group decision unless the last-but-one section says so.

## 1. What does it serve?

**Current answer.** A family-office client who, with an advisor, decides where to hold a USD reserve needed in about three to six months: whether a reference Treasury bill matures in time for the payment, and how purchasing power could change under a stated inflation assumption.

**Evidence.** `../PROPOSAL.md`; `../README.md` (Question and user); persona `family-office-client` in `../reference/CLASS_ONTOLOGY.yml`.

**Gaps.** The recurring trigger is a planned payment discussed with the advisor, not market movement. In 2024 to 2026 the 13-week discount quote moved a median 0.01 to 0.02 percentage points per week (`../data/raw/treasury_*.xml`), about $5 on $100,000 over 94 days. Value therefore comes from the client's own dates more than from fresher rates.

## 2. What is the dashboard?

**Current answer.** A short-term cash maturity and purchasing-power scenario dashboard built on saved official data (U.S. Treasury Daily Treasury Bill Rates; BLS CPI-U, not seasonally adjusted). It checks calendar fit for one cash date, shows inflation sensitivity, a purchasing-power decomposition and history. The liquidity calendar in this folder extends calendar fit to several dates and to all seven bill tenors.

**Evidence.** `../index.html`, `../data.js`, `../calculations/method.md`; `liquidity-calendar/`.

**Gaps.** Each Treasury row carries seven tenors (4 to 52 weeks) and the dashboard uses two. With the saved snapshot (quote date 2026-10-26), a payment on 2027-03-01 gets a 13-week bill maturing 32 days early or a 26-week bill 59 days late, while the 17-week bill in the same row matures 2027-02-23, 6 days early (`evidence/extension_checks.json`). The calendar is a separate page, so it is not part of the graded dashboard unless the group merges it.

## 3. Will it still be used after one year?

**Accepted v2 as delivered.** It stays usable only with monthly manual maintenance. Quotes count as stale after 7 days; on 2026-11-08 they were 13 days old. The 13-week reference matures on 2027-01-28 and the 26-week reference on 2027-04-29, after which the page labels both "Historical scenarios only". A year rollover needs manual edits, because `../calculations/rebuild.py` fixes the CPI file name (`cpi_2023_2026.json`), the 2023 CPI start and a 2026 source link.

**With `auto-refresh/refresh.py`.** The script downloads the two latest Treasury years and the BLS series, then validates them with the accepted rebuild rules. It writes a candidate here, or the release itself if the group copies it to the root. Run offline with the accepted inputs, it reproduces the accepted `data.js` exactly apart from the refresh flag. Run live on 2026-11-08, it produced a candidate with quote date 2026-11-06:

| Value | Accepted | Candidate |
|---|---|---|
| 13-week discount quote | 4.05% | 4.01% |
| 13-week days to maturity | 94 | 90 |
| 26-week discount quote | 4.21% | 4.12% |
| 26-week days to maturity | 185 | 181 |
| Default purchasing power at maturity | $100,302 | $100,279 |

The release schedule in `auto-refresh/cpi_release_schedule.csv` covers CPI observations through November 2027.

**Still needed from people.** Decide whether to adopt and schedule the refresh. Update the CPI schedule once a year. Read STOP and WARNING output. Hand over to a named maintainer. Nothing is scheduled today. A group member's improvement plan asks that no automatic download or background scheduling be added without authorization; the script also runs on manually downloaded files (`--sources`), so the group can keep that rule and still reuse the checks.

## 4. Is it impactful for the stakeholder?

**Current answer.** Not yet evidenced. No non-builder user test, student independent calculation or human acceptance has been recorded (`../evidence/student_signoff.md`: NOT RUN).

**Suggestion.** Make impact observable with a short test: a payment that falls between two maturities; a fixed payment against a price-sensitive budget; a stale-data case. Record completion, errors and what the client would still ask the advisor.

## 5. What task is to be accomplished?

**Current answer.** Three tasks:

1. Check the calendar fit between bill maturities and payment dates.
2. Understand purchasing power under a stated inflation assumption. This matters for price-sensitive budgets; a fixed USD payment is a nominal amount.
3. Identify stale data and what still needs human confirmation: purchase, settlement, receipt of funds, taxes, and where cash waits after maturity.

The calendar page ends with a discussion summary that can be copied or printed.

**Gaps.** The dashboard does not yet separate fixed USD payments from price-sensitive budgets and has no take-away summary; the calendar does both, for dates only.

## Decisions taken in this working session

These were made by the requesting group member. Group endorsement is pending.

- The calendar's primary user is the family-office client.
- The calendar holds dates and payment types only: no amounts, coverage, roll strategy or advice.
- The calendar stores nothing; the summary is copied or printed.
- The refresh script stays in this folder; adoption and scheduling are left to the group.

## Open questions for the group

1. Adopt `refresh.py` at the root in automatic mode, or keep manual downloads with `--sources`?
2. Merge seven-tenor, multi-date matching into the dashboard, or keep the calendar as a separate page?
3. Who updates the CPI schedule each year, and who reads refresh warnings?
