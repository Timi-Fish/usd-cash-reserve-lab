# Five-minute presentation (group material, not in the submission ZIP)

Live demo on a computer from the extracted final ZIP: double-click `index.html`. One speaker per part. Start with nothing entered; the Calendar's "Try example dates" button fills three payments.

| Time | Part and speaker | Click path | What to say (English) |
|---|---|---|---|
| 0:00–0:45 | User and question | Page as it opens: title band, status banner, About at the bottom | "Our user is a family-office client and their advisor. They hold a US-dollar reserve for payments due in the next few months. The question is: when is each payment due, which Treasury bill maturity reaches it, and what does inflation do to the cash meanwhile? Liquidity comes first, so the page ranks nothing." |
| 0:45–2:00 | Live dashboard (user-value lead) | Calendar → Try example dates → Overview timing chart → set inflation 3% then 6% → bridge | "Each bar is a bill from the same Treasury quote. The first payment is reached by the 8-week bill, and the purple segment is the days the cash waits. If we raise inflation from 3 to 6 percent, the dollars at maturity do not change, but the purchasing power falls, and the bridge shows by how much." |
| 2:00–2:45 | Data and method | Method tab: formulas and sources; Scenarios: break-even button | "Rates come from the Treasury's daily bill rates, CPI from BLS, both official and free. One of us recalculated the 13-week result in Excel from the Treasury page and matched the page to the cent. One limitation: quotes are observations, not prices you can trade at, and the calendar matches dates, not amounts." |
| 2:45–4:15 | AI maintenance | Banner date; then show `evidence/release_review.md` and `maintenance/release_log.csv` | "Our SKILL.md tells an assistant how to update the data. In a fresh chat, the assistant downloaded the newest quotes into a candidate folder, rebuilt it to check it, and showed us a before-and-after table with links to the sources. We compared the rates on the Treasury page, then accepted, and only then were the files replaced. In a second test we gave it a wrong unit setting; it stopped and changed nothing. What we learned: the assistant does the checks, but the decision and the source comparison stay with a person." |
| 4:15–5:00 | Handover and next step | README: Maintenance after the course | "Anyone can maintain it: one command downloads and checks, one shows the changes, and nothing is published without approval. The old version is always one command away. Next, we would add amounts to the calendar, so it shows whether the cash covers each payment, not only the date." |

Fill in the real numbers from your own run before rehearsing: the bill that reaches the first payment, the waiting days and the Excel check. Practise once with a timer; the class limit is five minutes.

Questions the class may ask, and where to point:

| Question | Where |
|---|---|
| Whom does it serve? | About section; Overview title band |
| What task does it help with? | Calendar and the Overview timing chart |
| Is it useful to the client? | Scenarios and the bridge: the effect of an inflation change |
| Will it be used after a year? | Method tab and README: weekly refresh, age limits, restore |
| Why not recommend a bill? | `PROPOSAL.md`, rejected alternative |
