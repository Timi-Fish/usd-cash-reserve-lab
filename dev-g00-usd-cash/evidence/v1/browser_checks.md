# Actual browser checks

Date: 2026-10-27. Operator: development assistant. Browser: Codex in-app browser through a loopback HTTP preview restricted to index.html/data.js. No external hosting or file-browser access.

## Default rendering
Observed all three views, four headline measures, sources, method, disclaimer and age status. Default $100000 / 13-week / 3%: nominal $101069, purchasing power $100302, real return +0.30%, break-even 4.21%. Desktop full-page screenshot: dashboard-desktop.png.

## Inflation interaction
Expected: at fixed source quote/principal, nominal amount unchanged and real amount falls when annual inflation increases.
Actual: filled 6%; nominal $101069, real $99563, real return -0.44%, loss $437. Screenshot: inflation-6pct.png.

## Tenor interaction
Expected: selecting 26-week updates maturity/day count and corresponding quote, not just the label.
Actual: 185 days to 2027-04-29 and loss $763 at 6% inflation. Read and confirmed heading after selection.

## Invalid input and reset
Expected: an empty principal must stop and hide calculated outputs, not reuse old results.
Actual: “Enter both the invested amount and an inflation assumption.” appeared; results hidden. Screenshot invalid-input.png. Reset restored default +$302 headline.

## Mobile
Viewport 390 × 844. Reviewed full page. Main layout stacks, metrics remain legible, wide tables scroll within their container. A long selected option was initially truncated; option text shortened to 13-week/26-week and retested. Screenshot dashboard-mobile.png is the corrected version. Temporary viewport override reset after checking.

## Limitations
A literal file:// navigation was blocked by browser policy. Local-only loader logic was separately tested with zero network calls in a Node harness; that is not a real file-protocol browser test. A group member must double-click index.html after extracting the final ZIP and record that check. A local server preview does not prove every browser/version is supported.

## Visible stale-data fixture
An isolated snapshot with quote cutoff 2026-09-30 was served through a separate scoped loopback preview. On 2026-10-27 the browser visibly displayed the stale-data warning. Screenshot: stale-warning.png. This test did not replace the accepted data.js. The fresh-context report's earlier evidence-gap observation predates this additional browser check.

## Final wording correction
After screenshot capture, the comparison eyebrow was clarified to “Maturity scenarios” and the history note now says the final month “may be incomplete.” Calculations and layout were unchanged.
