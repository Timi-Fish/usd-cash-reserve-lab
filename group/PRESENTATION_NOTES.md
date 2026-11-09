# Five-minute live presentation

Group material, not in the submission ZIP. The talk is the live dashboard; no slides are shown. `group/presentation.pptx` (exported as `presentation.pdf` in the ZIP) is a backup with the same five questions, in case the instructor asks for slides.

All numbers below were read from the final page (Treasury quote 2026-11-06, CPI 2026-09).

## Before the class
1. Extract the final ZIP into an empty folder on the presenting laptop and double-click `index.html`.
2. One browser tab, zoom 100 %, window at least 1280 px wide so the desktop layout shows.
3. Reload the page (Cmd+R or Ctrl+R) just before you start. It then shows the Overview tab, no payment dates, cash $100,000, the 13-week reference and inflation 3 %. Nothing is kept between reloads.
4. Check the blue banner. On 10 November it reads "Within project age limits. Bill quotes are 4 days old (limit 7 days)." If it says "Review required", check the laptop's date.
5. One driver clicks for all five speakers, following the steps below; the speakers only talk. This saves the hand-overs.
6. Rehearse once with a timer. The times are hard ends: if you are late, skip the optional steps.

## Running order
| Time | Speaker | Question | Tabs |
|---|---|---|---|
| 0:00–0:40 | 1 | Who is the user, and what decision does the page support? | Overview |
| 0:40–2:10 | 2 | When is the cash there for each payment, and what does inflation do to it? | Calendar, Overview |
| 2:10–3:10 | 3 | How do we know the numbers are right, and what is the main limitation? | Method, Scenarios |
| 3:10–4:15 | 4 | How does an AI assistant update the data, and who decides? | Banner, History |
| 4:15–5:00 | 5 | Can someone else run it after the course, and what comes next? | Method |

Give each part to the member who did the work behind it: the Excel check for Speaker 3, the data update or the failure test for Speaker 4.

## Speaker 1 · 0:00–0:40 · Who is the user, and what decision does the page support?
**Driver**
1. Overview tab, as the page opens. Point to the title band: "USD Cash Reserve Lab … saved quote 2026-11-06".
2. Point to the blue banner.
3. Scroll to "About this dashboard" at the bottom, then back to the top.

**Say**
> Our user is a family-office client and their advisor. The family keeps a US-dollar cash reserve for payments in the next few months: a property tax instalment, tuition, a household budget. Today they piece this together from spreadsheets and separate data websites. Our dashboard answers one question: when is each payment due, which saved Treasury bill matures in time for it, and what does an assumed inflation rate do to the cash meanwhile? Liquidity comes first, so the page ranks no bill. All data are official, and their dates are shown at the top.

## Speaker 2 · 0:40–2:10 · When is the cash there for each payment, and what does inflation do to it?
**Driver**
1. Click the **Calendar** tab.
2. Click **Try example dates**. Three payments appear under "Payment dates".
3. Click **Example: tuition payment** (2027-03-01) in that list.
4. Point to the sentence above the calendar: "The 13-week reference matures 2027-02-04, 25 days before … Next: 17-week, 2027-03-09, 8 days after".
5. Scroll down to February and March 2027. Point to 4 February (solid box, "13w"), the purple days up to 1 March, and 9 March (dashed box, "17w").
6. Click the **Overview** tab. Point to the "Payment timing" chart: one bar per bill from the quote date, one line per payment.
7. In "Your assumptions", click into **Assumed annual inflation**, select the 3, type `6`, press Tab.
8. Point to: nominal proceeds still $101,013; purchasing power now $99,572 (it was $100,279); the line "Purchasing power decreases by $428"; the bridge row "Inflation over 90 days −$1,441".
9. Set inflation back to `3` and press Tab.

**Say** (steps 1–5)
> Let me load three example payments. Take tuition on the first of March 2027. The latest saved bill that matures before it is the 13-week bill, on the fourth of February. So the cash waits 25 days, shown in purple, and we assume no return for that wait. The next bill, the 17-week, matures on the ninth of March. That is 8 days too late, so it would have to be sold early, at a price we cannot know today. So the page answers the timing question first.

**Say** (steps 6–9)
> On the Overview, each bar is a bill from the same Treasury quote, and each line is a payment. Now the inflation assumption. At 3 percent, 100,000 dollars in the 13-week bill pays 101,013 dollars and keeps a purchasing power of 100,279. At 6 percent, the dollars are exactly the same, but the purchasing power falls to 99,572, a loss of 428 dollars. Inflation changes what the money buys, not the dollars that arrive.

## Speaker 3 · 2:10–3:10 · How do we know the numbers are right, and what is the main limitation?
**Driver**
1. Click the **Method** tab. Point to the formulas, then to "Data" (the Treasury and BLS links).
2. Click the **Scenarios** tab. Under "Exact break-even inflation", click **Use 4.17%**.
3. Point to "= Purchasing power at maturity $100,000". Inflation now stays at 4.17 %; reload before questions.
4. Optional: open `evidence/independent_check.xlsx`, sheet "2 Calculation", and point to the PASS cells.

**Say**
> Every number comes from two official sources: the U.S. Treasury's daily bill rates and the BLS consumer price index. The Method tab shows the formulas. To check them, a member who did not build the page copied the 6 November quote from the Treasury website into Excel and recalculated everything. Excel gives proceeds of 101,012.65 dollars and purchasing power of 100,279.10; the page shows 101,013 and 100,279. All six checks passed. The boundary holds too: at the break-even rate of 4.17 percent, purchasing power is exactly 100,000 dollars. Our main limitation: these are saved quotes, not prices you can trade at. Taxes, fees and settlement are not modelled, and inflation is an assumption, not a forecast.

## Speaker 4 · 3:10–4:15 · How does an AI assistant update the data, and who decides?
**Driver**
1. Point to the title band and the banner: "saved quote 2026-11-06", "4 days old (limit 7 days)".
2. Click the **History** tab. Point to the right end of the rate lines: November 2026, the update the assistant brought in.
3. Optional, if asked for evidence: open `evidence/release_review.md` (the before/after table) and `maintenance/release_log.csv`.

**Say**
> An AI assistant keeps the data fresh, under a written skill file. We tested it in a fresh Codex conversation with none of our development chats. It downloaded the newest Treasury and BLS files into a separate candidate folder, rebuilt every number and showed us a before-and-after table with links to the sources. The quote date moved from 26 October to 6 November; the 13-week rate from 4.05 to 4.01 percent; the 26-week rate from 4.21 to 4.12. Our data maintainer checked the Treasury page and replied accept. Only then were the files replaced. In a second test we set a wrong unit, basis points instead of percent. The assistant stopped with "Incompatible input unit" and changed nothing. Our lesson: the AI does the checks, but the source comparison and the decision stay with a person.

## Speaker 5 · 4:15–5:00 · Can someone else run it after the course, and what comes next?
**Driver**
1. Click the **Method** tab and scroll to "Freshness and maintenance": quotes count as stale after 7 days, CPI after 60 days.
2. End on the **Overview** tab.

**Say**
> Can someone else run it? Yes. The ZIP alone is enough. One command rebuilds the saved data byte for byte. One command downloads and checks an update, and nothing is released until a person accepts it. The previous version is always one command away. The main risk is that there is no scheduler: if nobody refreshes for a week, the banner says "Review required". [USER TEST SENTENCE] Our next improvement: add payment amounts to the calendar, so it shows whether the cash covers each payment, not only the date. Thank you.

**Pending: user test (Task D).** Replace `[USER TEST SENTENCE]` once a member who did not build the page has tried it, and replace the yellow box on slide 7 of the backup deck:
- If the test comes back: "A member who had not seen the page tried it alone. They found <their main finding>, so we changed <the one change>."
- If it does not: delete the sentence. The part still fits in 45 seconds.

## If the instructor asks
The course says the instructor may ask you to change an input, explain a calculation or describe what happens when a source fails. Reload the page first.

| Question | Do | Answer |
|---|---|---|
| Change an input | Overview: switch Reference bill to 26-week | It matures 2027-05-06, after 181 days: $102,115 at maturity, purchasing power $100,629 at 3 %. It covers a longer period, so a larger number is not a better choice; check the payment dates first. |
| Explain a calculation | Method tab | P = 100 × (1 − 0.0401 × 90/360) = 98.9975. N = 100,000 × 100 / 98.9975 = $101,012.65. F = 1.03^(90/365) = 1.00732. R = N / F = $100,279.10. |
| What happens when a source fails? | — | `refresh.py` prints "STOP:" with the reason and writes nothing; the accepted data stay. The maintainer can download the three files by hand and run it with `--sources`. If nobody refreshes, the banner says "Review required" after 7 days. |
| Why not recommend a bill? | Overview: "Both reference bills" table | The bills cover different periods, so a larger result is not a better choice. Timing comes first (`PROPOSAL.md`, rejected alternative). |
| Is CPI up to date? | Banner | BLS publishes October CPI on 10 November; the next weekly refresh picks it up. October 2025 was never published, so the October 2026 year-on-year rate cannot be computed; the key figure stays at September, 3.74 %. |
| Fixed vs price-sensitive payment | Calendar: Payment type | A fixed payment needs the dollars on time. For a price-sensitive budget, purchasing power matters too. |
| What did the AI do, and what did you do? | — | The AI wrote the code and drafts and ran the checks. We chose the design, checked the numbers in Excel, accepted the data update and ran the failure test. `AI_LOG.md` records each session. |
