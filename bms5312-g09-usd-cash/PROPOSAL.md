# Project proposal: USD Cash Reserve Lab

Educational project. Not investment advice.

## User and question
The user is a family-office client and their advisor. The client holds a USD reserve for payments due in the next few months: tax instalments, tuition, a household budget.

The question: when is each payment due, which saved U.S. Treasury bill maturity reaches it, and how could the reserve's purchasing power change meanwhile? Liquidity and meeting the payment dates come first. The dashboard shows the purchasing-power cost without asking every reserve to beat inflation.

## Decisions informed and scope excluded
The dashboard informs three decisions:
1. Whether a saved maturity reaches each payment date, or whether the cash would wait or the bill would have to be sold early.
2. How sensitive purchasing power is to the inflation assumption.
3. When the data need refreshing.

It excludes:
- personal data and client records;
- buy, sell or ranking advice;
- early-sale prices, settlement, taxes, fees and FX;
- reinvestment and rolling between bills;
- funding-adequacy checks: dates are matched, amounts are not.

## Workflow and topics from the class vocabulary
- Persona: `family-office-client`.
- Workflow: `wealth-planning`.
- Topic: `wealth-and-goals`.
- Core concepts: `core:inflation`, `core:price` and `core:total-return`.
- Group terms in `ontology.yml`: bank discount rate, real holding return, break-even inflation, purchasing power and the decomposition amounts.

## Proposed sources and permission checks
- U.S. Treasury Daily Treasury Bill Rates (dataset 015-DO-021, XML). It is CC0 1.0 in its Data.gov metadata. It supplies the bank discount rates, coupon equivalents, maturity dates and CUSIPs of seven bill tenors.
- BLS CPI-U series `CUUR0000SA0` (public API v2, JSON). BLS published data are public domain.

Both are official, free and need no key. Snapshots are saved in `data/raw/`. `SOURCE_REGISTER.csv` and `evidence/source_review.md` record the terms and the reuse basis.

## Method and key assumptions
The holding period runs from the saved quote date to the bill's maturity date, in calendar days. Prices use the Treasury bank-discount formula. Purchasing power divides the maturity proceeds by an assumed inflation factor over the same days. The break-even rate is the assumption at which purchasing power is unchanged.

Key assumptions:
- purchase on the quote date, held to maturity, with no costs;
- inflation is a stated assumption, not a forecast;
- defaults of $100,000 and 3%.

Formulas are in `README.md` and `calculations/method.md`.

## Views and interaction
- **Overview:** a payment-timing chart of all seven saved maturities against the payment dates. Next to it, the purchasing-power bridge (cash placed, interest, inflation effect, result) and the two reference bills side by side.
- **Calendar:** month grids where the client adds up to twelve payments and sees the matching maturity for each.
- **Scenarios:** purchasing power across inflation assumptions, with break-even rates.
- **History:** rates and CPI over 12 months, 24 months or all saved data.
- **Method:** formulas and sources.

Controls: amount, inflation, reference bill, payment dates and type, history window. Copy and Print produce a discussion summary that ends with the disclaimer.

## Success criteria and risks
**Success criteria:**
- the page opens offline by double-click;
- `data.js` rebuilds byte-identically from the saved inputs;
- eight evaluations pass, with student checks against the sources;
- a fresh assistant completes a normal and a failure maintenance task under human review.

**Risks and controls:**
- **Reading an annual quote as a holding return:** the page shows days and holding-period figures.
- **Treating CPI as personal or future inflation:** CPI is history only; the scenario inflation is an assumption.
- **Stale data:** dated banner and age limits.
- **Reading a date match as enough cash:** the page states that only timing is matched.

## Three substantive decisions and their reasons
1. **Payment timing comes before purchasing power.** The Overview opens with the maturities against the payment dates, and the calendar uses all seven tenors of the latest quote date.
   - *Reason:* for a reserve, missing a payment date costs more than a few basis points.
   - *Reason:* the two reference bills alone left wide gaps. With the 2026-10-26 quotes, a payment on 2027-03-01 was 32 days after the 13-week maturity, while a saved 17-week bill matured 6 days before it.
2. **Inflation over the same period as the holding.** The assumed annual rate is converted to the holding period, (1 + a)^(n/365), before dividing the proceeds.
   - *Reason:* subtracting last year's CPI from an annualised bill rate mixes two periods and two conventions.
   - *Reason:* a user-set assumption makes the uncertainty explicit.
3. **Data update by `refresh.py`, released only after a person approves.**
   - The script downloads and recalculates by the accepted method into a candidate folder. A review step checks that the candidate rebuilds exactly and keeps every field, then shows the changes with source links. Nothing replaces the accepted data until the data maintainer accepts.
   - No scheduler runs it.
   - *Reason:* quotes go stale within a week, so manual downloads were too slow and error-prone. Unattended publishing would let a malformed download reach the client page.

## One rejected alternative and its reason
**Ranking the bills or recommending a tenor** (for example "the 26-week bill pays more"). It was rejected for three reasons:
- The right bill depends on each payment date and on how much cash must be ready, which only the client and advisor know.
- A ranking would be investment advice.
- A ranking would hide the timing risk the dashboard exists to show. A longer bill that matures after the payment has to be sold early at an unknown price.

The dashboard therefore shows both reference bills side by side, with the same fields and no "best" label.
