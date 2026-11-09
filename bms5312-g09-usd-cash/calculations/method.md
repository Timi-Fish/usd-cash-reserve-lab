# Calculation specification

## Observed versus assumed
Observed: bank discount rates, maturity dates, CUSIPs, quote dates, CPI levels and verified CPI release metadata. Assumed: principal, future effective annual inflation, purchase on quote date, holding to maturity, no costs and divisible holdings. The default inflation assumption is 3%, independent of the current CPI rate.

## Period alignment
Use days = maturity date minus quote date. Discount pricing uses 360 days; assumed inflation grows at an effective annual rate using a fixed 365-day exponent. This is a stated scenario convention, not an official realized inflation measure. Both the nominal holding return and the compounded inflation factor cover the same number of days. Never subtract a retrospective 12-month CPI rate from a future 13-week nominal return.

## Price and returns
For decimal discount d and n days: P=100*(1-d*n/360), H=100/P-1. For invested B and annual assumed inflation a: F=(1+a)^(n/365), N=B*(1+H), R=N/F. Real return is R/B-1. The annual break-even a is (1+H)^(365/n)-1. It is not an inflation forecast. At a=0, real and nominal proceeds are identical. Increasing a lowers purchasing power but leaves nominal proceeds unchanged. Doubling B doubles nominal/real amounts and leaves return percentages unchanged.

## Source handling
The rebuild validates rate units as percent and CPI units as index-points. It checks rate ranges and maturity validity. Null CPI observations are preserved; missing same-month-prior-year values propagate as null annual changes. Values are not forward-filled. Historical charts are explanatory and use the downloaded vintage; there is no vintage-aware trading simulation.

## Independent-check instructions
Use manual_checks.csv with a calculator or Excel. Enter the supplied original inputs yourself, use the visible formula, and compare to the expected value within $0.01 or 0.01 percentage points as appropriate. Record your role code, date, actual result and decision in evidence/student_signoff.md. Do not sign an AI-generated result without performing the calculation. At least three checks should include the bill price, real maturity amount and CPI growth.

## Revision v2 — date validation and calendar matching
Dates are strict YYYY-MM-DD UTC calendar dates. JavaScript rejects normalization of invalid dates (for example February 30). Every instrument must have days = maturity - quote date exactly, positive integer days within the model limit, a nonempty distinct security identifier, and exactly one reference of each required tranche. Python obtains dates/CUSIPs from the same XML record and rejects differing INDEX_DATE/QUOTE_DATE. Source-field matching is separate from confirming tradability: quote-date purchase remains a simplification.

For a valid cash date C and maturity M, gap = C - M in calendar days. Positive means maturity is earlier, zero means a calendar match only, and negative means it is later and cannot meet this hold-to-maturity schedule. No date yields unassessed status. Invalid/before-quote dates halt scenario display. No post-maturity interest or inflation calculation is made, and no early liquidation is inferred.

## Revision v2 — shared calculation route
Browser calc() supplies nominal proceeds N, real proceeds R, interest I=N-B, conversion adjustment A=N-R, zero-interest real proceeds Z=B/F, and cash difference R-Z. Cards, markers, decomposition and selected benchmark all consume this function. Curves sample the same function at annual inflation assumptions from -5% to 15%; break-even values are computed analytically, not read from a rounded curve. The benchmark uses exactly the selected bill's days and inflation factor. The decomposition is an equation, not an account statement; A can be negative under deflation.

The exporter adds nominal_interest, purchasing_power_adjustment and cash_advantage to default_result. Existing fields are preserved. No observed value changes. Student checks must remain independently performed; a second AI route is not a student signature.

## Revision v2 — history and chart conventions
Calendar bounds are anchored to the maximum saved observation month across series, inclusive of the end month. A 12-month window starts 11 months earlier, a 24-month window 23 months earlier. All history starts at the earliest saved month. Every month in the common grid appears; absent series observations are null. Rate points use monthly positions and their exact saved quote date in readouts. CPI uses observation months; release dates are shown separately. Paths break on null. Hiding a rate affects its plotted line and readout, not the audit table. Rate and CPI line scales are labeled and may start above zero; sensitivity has a symmetric USD scale and a visible zero line.

## Revision v2 — age and maturity
Device calendar date affects warnings only. Stale rate/CPI thresholds remain 7/60 days. A maturity before device date is explicitly historical; on maturity date, receipt of funds is still not assessed. The quote-date start and model day counts never roll forward when the file is opened.
