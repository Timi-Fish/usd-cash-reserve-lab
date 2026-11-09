# Dashboard page source

Source of `../index.html`. It is built with React and J.P. Morgan's open-source [Salt design system](https://saltdesignsystem.com) (Apache-2.0). Vite and vite-plugin-singlefile bundle it into one self-contained HTML file that reads only `data.js`.

Educational project. Not investment advice.

## Structure
The page has four layers, from the top:
1. A letterhead: a black strip carrying the disclaimer, over a blue band with the title and the saved quote date.
2. The data-status banner.
3. Five tabs.
4. The course's About section and footer.

| Tab | What it does |
|---|---|
| Overview | Payment timing against all seven saved maturities; the assumptions; the purchasing-power result and its bridge; both reference bills side by side; Copy summary and Print summary |
| Calendar | Up to twelve payment dates, fixed USD or price-sensitive, checked against every saved maturity on month grids |
| Scenarios | Purchasing power across inflation assumptions, break-even buttons, the decomposition and a zero-interest comparison |
| History | Rate and CPI charts on a shared 12-month, 24-month or full window, with exact values |
| Method | Formulas (KaTeX), sources, age limits and maintenance |

Assumptions and payment dates live in memory only; closing the page clears them.

## Data
- Everything comes from `window.DASHBOARD_DATA` in `../data.js`. The summary and the two reference bills come from `summary` and `data.instruments`. The seven tenors of the calendar come from `data.bill_ladder`.
- `src/model.js` checks the data before anything is drawn. A broken file shows an error banner instead of numbers.
- The page keeps the course skeleton verbatim: the `lab:dashboard` meta tag, the `lab-about` section, the footer disclaimer, the `data.js` script tag and the required loader. `index.html` in this folder is that skeleton. The loader hands its result to the app.

## Build and check
Needs Node 18+.

```text
npm ci           install the exact packages in package-lock.json
npm run build    build dist/index.html, then publish it as ../index.html
npm run check    32 model checks against ../data.js and the frozen data
```

`npm ci` needs internet access once.

`scripts/publish.mjs` copies the page only if it still contains every required course line with the dashboard ID from `../project.json`. `scripts/check-model.mjs` needs no installed packages, so it runs straight from the submission folder. It writes `../evidence/model_checks.json`.

| Path | Role |
|---|---|
| `src/model.js` | Reads `data.js`; scenario arithmetic, freshness, history windows, sensitivity |
| `src/ladder.js` | Payment-calendar rules: date checks, which maturity reaches a payment, month grids |
| `src/summary.js` | Discussion summary text |
| `src/format.js` | Currency, percent and line-break formats |
| `src/App.jsx` | Letterhead, status banner, tabs, shared state |
| `src/views/` | One file per tab |
| `src/components/` | Assumptions form, payment timeline, purchasing-power bridge, bill colour key, month grid, Chart.js wrapper |
| `src/brand.css` | Letterhead, theme remaps and the bill colours |
| `src/styles.css`, `src/calendar.css`, `src/overview.css` | Layout, the Calendar tab, the Overview figures |

## Colour meanings
Each colour means one thing on every chart, calendar and table. The page does not explain the mapping; it is the design rule for anyone changing the page.

| Colour | Means | Where |
|---|---|---|
| Navy | The 13-week reference bill | Payment timeline, calendar tags, charts, table keys, the bridge when the 13-week is selected |
| Brand blue (#7297C5) | The 26-week reference bill | The same places |
| Pale blue | The other saved bills (4, 6, 8, 17 and 52 weeks) | Payment timeline, calendar tags |
| Plum | Days the cash waits between a maturity and a payment | Calendar, payment timeline |
| Dark marks | Payments: filled for a fixed USD payment, dashed for a price-sensitive budget | Calendar, payment timeline |
| Grey | Data that is not a bill (CPI) and guide lines | History, Scenarios |
| Salt blue | Controls: buttons, toggles, links, the active tab, the selected payment | Everywhere |
| Pale blue tint | A selected or hovered row or column | Tables |
| Orange | Data past their age limit | The status banner only |

## Limits
- `index.html` is about 1.4 MB because React, Salt, Chart.js, KaTeX and the Open Sans and Source Serif 4 fonts are inlined. Formulas render as MathML in the browser's own math font.
- Changing the page needs the Node build; viewing it needs only a browser.
- The date fields use the browser's own date control, so their placeholder follows the computer's language.
