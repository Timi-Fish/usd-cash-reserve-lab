# Presentation script and live-demo guide

Target: about 9 minutes including the live demonstration and transitions. Rehearse and adjust pace; the duration has not been timed by a student. All monetary figures below are hypothetical modeled outcomes. Replace the development group code before presenting. Do not read pending human work as completed.

## Slide 1 — USD cash reserves (0:00–0:45)

A cash reserve can grow in dollars and still buy less. That is the problem our dashboard makes visible. Our user is a family-office client holding a US dollar reserve for a spending need roughly three or six months away. We ask: how does the purchasing power of this reserve change under different maturities and inflation assumptions? We are not treating inflation protection as a requirement for every cash balance. We are showing the cost and benefit of a particular choice while keeping the payment date central.

## Slide 2 — The client's decision (0:45–1:40)

Imagine two spending needs. One is a fixed invoice for one hundred thousand dollars. The main question is whether those dollars will be available on time. The second is a future spending budget whose cost may rise. Purchasing power matters more directly in that case. The dashboard supports the second conversation, but it also reminds the client that liquidity comes first. A longer maturity may earn more dollars and still be unsuitable if the money is needed earlier. We deliberately keep the scope small: one user, one reserve decision, two reference bill maturities, and three observed data series. We do not recommend a trade or rank investments as universally better.

## Slide 3 — The working dashboard (1:40–3:20, live demo included)

[Open the candidate index.html and Reset scenario. Enter 2027-03-01 as an illustrative cash date.]

The 13-week reference matures 32 days before this cash need. The 26-week reference matures 59 days after it, so it does not fit this hold-to-maturity schedule. Earlier maturity leaves a gap; we do not assume that gap earns the same rate. Same-day matching would still require checking settlement and receipt of funds. These are saved quotes, not executable prices today.

[Change inflation from 3 to 6 and open Explore scenarios.]

Nominal proceeds stay fixed, but purchasing power falls. Both markers move on the sensitivity chart. Each curve covers a different holding period, so a larger dollar change is not a ranking. Apply the selected bill's exact break-even assumption to see approximately unchanged purchasing power. The decomposition explains principal plus nominal interest minus a purchasing-power adjustment. That adjustment is not an account debit; under deflation it can be negative. The zero-interest benchmark uses exactly the same days and inflation factor as the selected reference.

[Reset. Show the shared history window and source dates.]

History is retrospective context. It is separate from the inflation assumption and retains missing observations.

## Slide 4 — One holding period, two price changes (3:20–4:35)

The Treasury source reports a bank discount quote. This is a quotation convention based on face value and a 360-day year; it is not the percentage earned on the cash invested. First we convert that quote into a modeled price per one hundred dollars of face value. Then we calculate how much face value the cash buys and therefore the nominal maturity proceeds.

For inflation, we convert the assumed effective annual rate into a factor over the same number of days. We divide nominal proceeds by that factor to express the result in starting-date purchasing power. We use actual days from the quote date to the source maturity. In the default snapshot that is 94 days, even though the instrument is labeled 13-week. A source maturity tranche and the remaining calendar days are different concepts. This is an indicative quote-date model: settlement timing, transaction costs, tax and minimum purchase increments are not modeled. We disclose those assumptions instead of implying an executable price.

## Slide 5 — A change in inflation changes purchasing power (4:35–5:30)

Here the source quote is 4.05 percent on a bank discount basis. With one hundred thousand dollars invested and 94 days remaining, modeled nominal proceeds are about 101,069 dollars. With a 3 percent annual inflation assumption, those proceeds have purchasing power of about 100,302 dollars in starting-date dollars. That means a gain of about 302 dollars in what the reserve can buy. At 6 percent assumed annual inflation, purchasing power falls to about 99,563 dollars, a loss of roughly 437 dollars. The same nominal cash flow can therefore support different real outcomes. Neither scenario predicts future inflation. It shows the sensitivity of the result to an explicit assumption.

## Slide 6 — Data and checks (5:30–6:35)

We use Treasury 13-week and 26-week bank discount quotes and the BLS all-items CPI-U series, not seasonally adjusted. The original snapshots are included so another person can reproduce the saved result. The source register records the URLs, series meaning, units and reuse basis. Missing October 2025 CPI remains missing; it is not filled with an invented value. Historical year-on-year CPI is computed only when both required observations exist.

The revision evidence includes 15 source and arithmetic checks and 62 targeted JavaScript logic checks. Browser checks cover interactions, invalid input, mobile layout and a stale-data warning. A separate AI calculation used Decimal arithmetic, but that is still AI-assisted verification. The assignment's student independent checks remain clearly marked pending. We provide three worked-check exercises and an empty student sign-off record so the group can complete and document them honestly.

## Slide 7 — Supervised maintenance (6:35–7:50)

The normal rehearsal starts with a genuine snapshot restricted to 23 October and reveals the saved 26 October quote. This is a controlled historical update, not a claim that live data arrived during testing. Both the rates and reference maturities change, so we compare the dates, prices and modeled proceeds together. The candidate is written separately, and the accepted data file is preserved.

The failure rehearsal deliberately declares incompatible rate units. The process stops before producing a candidate. It does not silently reinterpret the numbers. A separate fresh-context AI assistant tested the original version. That archived report does not prove the revised instructions work in a new chat. The current revision reran normal and failure tests in the development conversation; a new fresh-context handover remains pending. This demonstrates technical transferability, but human approval is still required. The group must review the evidence and record an actual accept or reject decision; the package does not fabricate one.

## Slide 8 — Handover and remaining decisions (7:50–8:45)

The package contains the dashboard, saved data, source register, formulas, evaluation checklist, maintenance instructions and evidence. The next user starts with the README. Before submission, our group must insert the instructor's identifiers, independently check three results, complete human review records and open the extracted dashboard on another person's computer. The current deck uses a clearly marked development identifier because the assigned one is not yet known.

A useful next improvement would be explicit settlement-date and receipt-of-funds modeling, which would connect the reference instrument more closely to an actual obligation. For this project, we keep the model transparent and bounded. The decision is not whether every cash reserve beats inflation. It is whether its maturity fits the spending need, and whether the client understands the purchasing power that may remain.

## Sources for slides 4–6

- US Treasury, Daily Treasury Bill Rates: https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_bill_rates&field_tdr_date_value=2026
- TreasuryDirect, pricing and interest rates: https://www.treasurydirect.gov/marketable-securities/understanding-pricing/
- BLS CPI history: https://www.bls.gov/regions/mid-atlantic/data/consumerpriceindexhistorical_us_table.htm
- BLS purchasing power: https://www.bls.gov/cpi/factsheets/purchasing-power-constant-dollars.htm
- Source permissions and exact saved-series identifiers: SOURCE_REGISTER.csv.
- Reproduced numbers and formulas: calculations/method.md and evidence/calculation_checks.csv.
- Slide 7 evidence: AGENT_TEST.md and evidence/fresh_context_report.md.
