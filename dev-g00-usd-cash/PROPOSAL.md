# USD cash reserves: purchasing power over roughly three or six months

**Status:** Revision v2 candidate, not human-accepted. Working proposal implemented as an educational prototype. Topic chosen by the user. Detailed method and thresholds proposed by the assistant require group endorsement. The class prefix and group number are not yet known; `dev-g00-usd-cash` is a development ID.

## User and question
A family-office client holds a USD reserve for spending in approximately three to six months. When is the cash needed, which reference maturity fits that calendar date, and how could purchasing power change under different inflation assumptions? Liquidity and meeting obligations take priority. The dashboard makes the purchasing-power cost visible without demanding that every cash reserve beat inflation.

## Decisions informed and scope excluded
Compare maturity dates with the client's spending horizon, stress the purchasing power of a chosen reserve amount, and identify when a data review is needed. Exclude personal data, buy/sell advice, early-sale pricing, FX, fees, taxes, roll-over forecasts and actual trading/backtesting. The user must independently assess deadline suitability and execution terms.

## Workflow and topics
`family-office-client`; `wealth-planning`; `wealth-and-goals`. Three observed series: 13-week and 26-week bank discount quotes and CPI-U all-items NSA. Rate history covers 2024–2026; CPI inputs start in 2023 to calculate 2024 year-on-year changes. The narrower period keeps the initial project reproducible and does not support long-run regime claims.

## Sources and permissions
Direct Treasury XML and BLS JSON snapshots, retrieved 27 October 2026, are included. Treasury dataset 015-DO-021 is listed as CC0 in Data.gov; BLS states its published data are public domain. Attribution and the exact source/permission basis appear in SOURCE_REGISTER.csv. No FRED, Yahoo, paid data, logos or third-party images are used.

## Method and assumptions
Use actual quote-to-maturity calendar days. Modeled price per $100 = 100 × (1 − decimal bank discount rate × days/360). Nominal return = 100/price − 1. Convert a user-entered effective annual inflation assumption with (1+inflation)^(days/365); divide nominal maturity proceeds by that factor. Purchase on quote date, fractional holdings and no costs are simplifying assumptions. Historical CPI is separate context, not a forecast or a point-in-time signal.

## Views and interaction
Four graphical views: date timeline, inflation sensitivity, discount-rate history and CPI history. Matching cards, a numerical purchasing-power decomposition and a same-period zero-interest benchmark support these views. Controls: principal, reference bill, optional cash-need date, annual inflation, a common calendar window and rate-series visibility. No rollover or post-maturity return is modeled. Sources, dates, formulas, limitations and the required disclaimer remain visible.

## Success criteria and risks
Correct local display, deterministic rebuild, eight documented evaluations, separate arithmetic checks and normal/failure maintenance evidence. Main risks: confusing annual quotes with holding returns, treating CPI as personal or future inflation, stale data and settlement assumptions. Human independent checks and a fresh-chat handover must be completed before submission.

## Three substantive decisions and rejected alternative
1. Direct official data: traceable observations and documented reuse basis.
2. Same-period real-return calculation: prevents subtracting past annual inflation from a future short holding return.
3. Manual reviewed maintenance: preserves an accepted version and avoids unsupported automatic-refresh claims.
Rejected: a retirement-depletion simulator. Its long-run return, withdrawal and longevity assumptions would dilute this small project's data and maintenance focus.
