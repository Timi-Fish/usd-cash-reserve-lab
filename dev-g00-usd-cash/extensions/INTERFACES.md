# Interfaces

Contracts between the pieces in `extensions/` and the accepted project. Only cross-module boundaries are listed; read the code for internals.

## Ownership

| Module | Owns | Never touches |
|---|---|---|
| `auto-refresh/refresh.py` | Downloads, input validation, the dashboard data set in `--out`, the calendar bill file at `--ladder-out` | Accepted root files, unless it is copied to the root and run with the default `--out` |
| `../calculations/rebuild.py` (accepted) | Source parsing rules and the dashboard payload | Not modified by the extensions |
| `liquidity-calendar/ladder.js` | Calendar-fit logic as pure functions (global `Ladder`) | DOM, storage, network |
| `liquidity-calendar/app.js` | All page state and DOM rendering | Storage and network (by product decision) |
| `tests/check_extensions.mjs` | `evidence/extension_checks.json` and OS temp folders | Every other file is read only |

## refresh.py ↔ rebuild.py

`refresh.py` loads `../calculations/rebuild.py` by path and calls:

- `read_inputs(input_dir: Path, cutoff: str) -> (cpi: dict[str, float | None], quotes: list[dict])`
- `build(input_dir: Path, config: dict) -> (payload: dict, quotes: list[dict])`
- constants `NS` and `DISCLAIMER`

`input_dir/raw/` holds `treasury_*.xml` and `cpi_2023_2026.json` (that file name is fixed by `rebuild.py`). Both functions raise `ValueError` on invalid input.

## refresh.py command line and Python interface

```text
python3 extensions/auto-refresh/refresh.py \
  [--date YYYY-MM-DD] [--sources DIR] \
  [--out DIR] [--ladder-out FILE]
```

| Option | Default |
|---|---|
| `--date` | today; sets the review, access and cutoff dates |
| `--sources` | none: download from Treasury and BLS. With a folder: read `treasury_<year-1>.xml`, `treasury_<year>.xml` and `cpi_2023_2026.json` from it |
| `--out` | the project root when the script sits at the root (course rule), otherwise `extensions/auto-refresh/candidate/` |
| `--ladder-out` | `<root>/extensions/liquidity-calendar/bills.js` |

The project root is the nearest parent folder that contains `calculations/rebuild.py`. Older Treasury years come from `<root>/data/raw/`. The schedule is always read from `<root>/extensions/auto-refresh/cpi_release_schedule.csv`.

- `refresh() -> dict`: the course interface. It downloads, rebuilds and returns the complete `data.js` object.
- `collect(today: date, sources: Path | None = None) -> dict` with keys `payload`, `quotes`, `config`, `ladder`, `raw`, `provenance`, `accepted`, `warnings`. It writes nothing.

Outputs in `--out`: `data.js` (written last), `project.json`, `data/raw/*`, `data/quotes_normalized.csv`, `data/cpi_normalized.csv`, `refresh_report.json`. The calendar file goes to `--ladder-out`. Every file is written through a temporary file and then renamed.

Success: exit 0 and one JSON line on stdout. Warnings go to stderr as `WARNING: ...` lines and to `refresh_report.json` `warnings[]`.

Failure: exit 1, `STOP: <reason>` on stderr, nothing written. The stop conditions are:

- a download, HTTP or XML error;
- any `rebuild.py` check fails;
- quotes or CPI are older than the accepted root `data.js`;
- no CPI month has a past release date in the schedule;
- the bill row is missing, malformed or repeats a security;
- the bill ladder disagrees with the dashboard's 13- or 26-week reference.

CPI hold-back: a CPI month without a past release date in the schedule is not used. The previous month stays, with a warning.

## cpi_release_schedule.csv

Columns: `observation_month` (`YYYY-MM`) and `release_date` (`YYYY-MM-DD`). Rows come from the BLS CPI release schedule. The file is maintained by hand once a year, and duplicate months stop the refresh.

## bills.js

The file holds one statement: `window.BILL_LADDER_DATA = {JSON};`. Only `refresh.py` writes it; only `Ladder.checkBills` reads it.

| Field | Type |
|---|---|
| `schema` | `"usd-cash-reserve-lab/bill-ladder/v1"` |
| `quote_date`, `access_date` | `YYYY-MM-DD` |
| `freshness_days` | integer, copied from `project.json` `freshness.quote_days` |
| `bills[]` | `{tenor_weeks: int, cusip: str, maturity_date: YYYY-MM-DD, days: int, discount_pct: number, coupon_equivalent_pct: number}`. `days` = maturity minus quote date; `discount_pct` is the bank discount quote in percent |
| `source` | `{provider, dataset, url (https), fields, terms_url, permission_basis}` |
| `disclaimer` | string |

## ladder.js (global `Ladder`, frozen)

Day numbers count days since 1970-01-01 UTC.

| Function | Returns | Failure |
|---|---|---|
| `checkBills(data)` | `{quoteDate, quoteDay, accessDate, freshnessDays, bills, source}`; `bills` sorted by maturity, each `{name, tenor, cusip, maturity, maturityDay, days, discount}` | throws `Error` |
| `checkEntry({label, date, type}, ladder, entries)` | `{label, date, day, type}` | throws `Error` with `.field` in `count`, `label`, `type`, `date` |
| `fit(ladder, day)` | `{kind: 'none' \| 'same' \| 'early', before, after, wait, late}` | none |
| `describe(fit)`, `fitText(fit)` | table cells `{sentence, nearest, wait, next, nextSentence}`; one sentence | none |
| `freshness(ladder, today)`, `freshnessText(ladder, today)` | `{age, state: 'clock' \| 'stale' \| 'fresh', matured, warn, short, long}`; one sentence | none |
| `calendarMonths(ladder, entries)` | `[{key: 'YYYY-MM', title, weeks: [[day \| null] × 7]}]`, Monday first, from the quote month to the later of quote + 182 days and the last entry | none |
| `summaryLines(ladder, entries, today)` | the discussion summary as `string[]`; the page and the copy button both use it | none |

The module also exports the helpers `dayNumber` (throws on a non-date), `isoDate`, `longDate`, `dayCount` and `byDate`, and the constants `DAY_MS`, `LIMITS` (`entries` 12, `label` 60, `daysAhead` 400, `minSpanDays` 182), `PAYMENT_TYPES` (`fixed` and `budget`, each with `label`, `short` and `note`) and `CONFIRM`.

## Calendar page state

`app.js` holds `{entries: [{id, label, date, day, type}], selected, nextId, undo}` in memory only. `undo` keeps the entry list from just before the last Remove or Clear all. There is no localStorage, sessionStorage, IndexedDB, cookie or network request.

## Where failures show up

| Failure | What the user sees |
|---|---|
| `bills.js` missing or invalid | Red banner under the page title naming the problem and the refresh command; the form, copy and print are disabled |
| Invalid entry | Message under the form (`role="alert"`), and the field is marked `aria-invalid` |
| Clipboard blocked | Message beside the copy button asking the user to select and copy the text |
| Refresh stopped | `STOP:` line and exit 1; the accepted files and the previous `bills.js` stay as they were |
