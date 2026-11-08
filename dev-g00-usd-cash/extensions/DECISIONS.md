# Decisions

Why the redesigned dashboard (`salt-dashboard/`) looks and behaves as it does. Each entry gives the decision and its reason. All of them are the requester's; group endorsement is pending.

## Scope

| Decision | Reason |
|---|---|
| The redesign sits beside the accepted page and changes no accepted file | The group compares the two and decides; the course package stays valid either way |
| It reads the accepted `data.js` and reproduces every saved result | One source of numbers; any difference would be a bug, and `npm run check` catches it |
| It never ranks or recommends a bill | The project's scope: calendar fit and purchasing power under an assumption, not advice |
| Desktop first; the phone layout works but is secondary | The dashboard is shown on a computer in client meetings and in the presentation |
| One offline HTML file, with fonts and scripts inlined | It opens by double-click, like the original page |

## Structure

| Decision | Reason |
|---|---|
| Salt design system (J.P. Morgan, open source) | Accessible, finance-grade components instead of hand-made controls |
| Five tabs under one bar, with the data status above them | The original page is one long scroll; tabs give each question its own place |
| The discussion summary has no tab: Copy and Print sit on Overview, and the summary text appears only when copied or printed | It is a record the advisor keeps after the meeting; on screen it repeated Overview as dense text |
| Overview opens with payment timing, then the assumptions and the result | Whether the cash is there on the payment date matters before how much it is worth |
| Several payment dates against all seven saved tenors, each fixed USD or price-sensitive | A family office plans several outflows, and the two types need different readings |
| The two reference bills stay a table, not a bar chart | Bars would make the longer 26-week bill look better, which is the ranking the project avoids |

## Visual language

| Decision | Reason |
|---|---|
| A black strip carrying the disclaimer over a blue band with the title (the header blue of goldmansachs.com, with dark text) | Private-bank sites pair a restrained palette with a strong letterhead; the disclaimer stays visible on every tab |
| Serif headings and figures (Source Serif 4); text, labels, tables and controls in Open Sans | A statement-like voice for results, with plain text everywhere else |
| Cool white surfaces and flat cards with hairlines | Matches the reference sites; shadows and grey canvas read as an internal tool |
| Each colour has one meaning on every chart, calendar and table (`salt-dashboard/README.md`, Colour meanings); the page does not show the mapping | A reader learns a colour once; the mapping is a design rule, not page content |
| Controls keep Salt's blue accent; data uses shades of the band blue | What can be clicked never looks like data |

## Figures

| Decision | Reason |
|---|---|
| Payment timing is a bill ladder: one bar per saved bill from the quote date to maturity, payments as lines from a top lane | A bar that ends before a line has matured in time, which answers the timing question at a glance |
| Payment names appear on hover; dates closer than about two weeks show on hover only | Labels stay on one line and never overlap |
| Purchasing power is a bridge measured from the cash placed: interest, inflation (hatched), result | A 1% change stays visible without a cut axis; bars share one thickness because only length carries value |
| Bridge amounts are differences of the rounded levels shown above them | The three amounts add up as displayed |

## Data status

| Decision | Reason |
|---|---|
| The banner names only the series past its limit and says who can act | Treasury publishes bill rates every business day, so stale quotes can be refreshed; BLS publishes CPI monthly, so the banner gives its next release date instead |
| The refresh runs by hand and writes a candidate; adoption is a group decision | Course rule: no automatic downloads or schedulers without a group decision, and accepted files change only by agreement |
