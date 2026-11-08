# Salt dashboard

A tabbed version of the USD Cash Reserve Lab dashboard, built on J.P. Morgan's open-source [Salt design system](https://saltdesignsystem.com) (Apache-2.0, React). It is a candidate for the group to compare with the original page (`../../index.html`), which stays unchanged.

Educational project. Not investment advice.

## Open it

Double-click `dist/index.html`. Keep `dist/data.js` and `dist/bills.js` beside it. No internet, installation or build is needed to view the page: every script, style and font is inlined in that one file.

## Structure

The layout is a header, then the data-status banner, then one tab bar:

| Tab | What it does |
|---|---|
| Overview | Assumptions, the headline result for the selected reference bill, and both bills side by side |
| Payment calendar | Several payment dates against all seven saved bill tenors, a month-by-month calendar and a fit table |
| Inflation scenarios | A sensitivity chart and table, exact break-even buttons, the purchasing-power decomposition and a zero-interest comparison |
| History | Rate and CPI charts on a shared 12-month, 24-month or full window, with an exact-value table |
| Discussion summary | One text summary of the assumptions, outcomes, payment fit and items to confirm, with Copy and Print |
| Method and data | Formulas, sources, freshness rules and limits |

Assumptions and payment dates are kept in memory only, so closing the page clears them.

## Data

- `dist/data.js` is a copy of the accepted `data.js` from the project root.
- `dist/bills.js` holds the seven reference bills for the same quote date. The build rebuilds it offline from `data/raw` with `extensions/auto-refresh/refresh.py`.
- The page keeps the course skeleton: the `lab:dashboard` meta tag, the `lab-about` section, the footer disclaimer, the `data.js` script and the required loader. The loader hands its result to the app. Its empty `catch` is course code and is kept verbatim.

## Change and rebuild

Rebuilding needs Node 18+ and Python 3.10+.

```text
cd dev-g00-usd-cash/extensions/salt-dashboard
npm ci
npm run build
npm run check
```

`npm run build` writes `dist/` and then stages the two data files. `npm run check` runs 31 model checks:
- the arithmetic reproduces every result saved in `data.js` to within 1e-9;
- the data reading, freshness, history window, formats and discussion summary follow the original rules.

The results go to `../evidence/salt_model_checks.json`.

Source files:

| Path | Role |
|---|---|
| `src/model.js` | Reads `data.js`; scenario arithmetic, freshness, history window, sensitivity |
| `src/summary.js` | Discussion summary text and input evaluation |
| `src/format.js` | Currency, percent and line-break formats |
| `src/App.jsx` | Header, status banner, tabs, shared state |
| `src/views/` | One file per tab |
| `src/components/` | Assumptions form, month grid, Chart.js wrapper, line-break helper |
| `../liquidity-calendar/ladder.js` | Calendar-fit logic shared with the standalone calendar page |

## Differences from the original page

- Six tabs replace one long page; the data status stays visible above them.
- Salt components and tokens replace hand-made controls, using the next theme with a teal accent and rounded corners. Charts use Chart.js, and each chart has a table of exact values.
- The single cash date becomes a list of payment dates checked against all seven bill tenors in the source. Each date is marked as a fixed USD payment or a price-sensitive budget.
- A discussion summary collects the result in one place.

## Limits

- `dist/index.html` is about 1.1 MB because React, Salt, Chart.js and the Open Sans font are inlined.
- Changing the page needs the Node build; the original page needs none.
- The course allows only `index.html` and `data.js` to be served. This version also reads `bills.js`; serving it with the hosted dashboard would need the group to fold that data into `data.js`.
- The required loader and the hosted-data path are unchanged but have not been tested on the course server.
