# Interfaces

Contracts between the parts of `bms5312-g09-usd-cash/`. Only cross-module boundaries are listed; internals are in the code.

## Ownership
| Module | Owns, and writes only | Never touches |
|---|---|---|
| `calculations/rebuild.py` | The accepted method: parsing the raw files, `check_config`, `build` (the whole `data.js` payload, including `data.bill_ladder`); writes only `--out` | Network |
| `refresh.py` | Downloads; one complete data set at `--out` (default: the project folder) | Writes nothing unless every check passes; `data.js` last |
| `tools/candidate.py` | `candidate/review.md`. On release or restore: `data.js`, `project.json`, `data/`, `previous/`, the coverage and access dates in `SOURCE_REGISTER.csv`, `evidence/release_review.md`, `maintenance/release_log.csv` | Network; values inside the data set |
| `calculations/verify.py` | `evidence/calculation_checks.*` | Everything else is read only |
| `dashboard/` | `src/`, `dist/`; `npm run build` publishes `../index.html` | `data.js`, storage, network |
| `dashboard/scripts/check-model.mjs` | `evidence/model_checks.json` | Everything else is read only |
| `tests/check_refresh.mjs` | `evidence/refresh_checks.json` and an OS temp folder | Everything else is read only |

## data.js (read by every module)
Exactly `window.DASHBOARD_DATA = {JSON};` and a newline, under 2 MB. `summary` follows the course contract (`reference/AGENT_GUIDE.md`); `summary.refresh` comes from `project.json`. `data` holds:

| Field | Shape |
|---|---|
| `config` | `project.json` as used for the build |
| `instruments` | Two items (13 and 26 weeks): `weeks`, `quote_date`, `maturity_date`, `days`, `cusip`, `discount_pct`, `coupon_equivalent_pct`, `default_result` (12 numbers) |
| `dates`, `series.bill13_discount`, `series.bill26_discount` | The last quote of each month |
| `cpi` | `dates`, `levels`, `yoy_pct` (null where a level is missing) and `release` {`observation_month`, `release_date`, `next_release_date` or null, `url`} |
| `freshness` | `checked_on`, `stale_at_build` |
| `sources` | `{label, url}` items; the Treasury link uses the quote year |
| `bill_ladder` | `schema` `usd-cash-reserve-lab/bill-ladder/v1`, `quote_date`, `access_date`, `freshness_days`, `bills` [{`tenor_weeks`, `cusip`, `maturity_date`, `days`, `discount_pct`, `coupon_equivalent_pct`}], `source` {`provider`, `dataset`, `url`, `fields`, `terms_url`, `permission_basis`} |

Missing observations are null. A refresh changes values and adds dates; fields are never renamed or removed, and `tools/candidate.py review` stops on a removed field. The 13- and 26-week entries of `bill_ladder` equal `instruments` (`rebuild.py` raises otherwise).

## rebuild.py functions used by other modules
- `check_config(config)`: raises `ValueError` on an unknown unit, refresh mode or cadence.
- `read_inputs(input_dir, cutoff)`: returns `(cpi, quotes)`. `input_dir/raw/` holds `treasury_*.xml` and `cpi_2023_2026.json`.
- `build(input_dir, config)`: returns `(payload, quotes)`.
- `scenario(principal, discount_pct, days, inflation_pct)`: used by `verify.py`.
- `DISCLAIMER`.

## Command lines
```text
python3 refresh.py [--date YYYY-MM-DD] [--sources DIR] [--out DIR]
python3 tools/candidate.py review
python3 tools/candidate.py release|reject|restore --decision TEXT
python3 calculations/rebuild.py [--input DIR] [--config FILE] [--out DIR]
```

- `refresh.py --out` receives `data.js`, `project.json`, `data/raw/*`, `data/quotes_normalized.csv`, `data/cpi_normalized.csv` and `refresh_report.json`.
- The report holds input file names, origins (URL, or "manual file" plus the name), sizes, SHA-256 and warnings.
- `--sources DIR` reads `treasury_<year-1>.xml`, `treasury_<year>.xml` and `cpi_2023_2026.json`.
- `candidate.py` always compares `candidate/` with the project folder. `release_log.csv` columns: `date, action, quote_date_before, quote_date_after, cpi_month_before, cpi_month_after, sha256_data_js, decision`.

## Failure convention
- Every Python entry point ends a failed check with one stderr line `STOP: <reason>` and exit code 1. Accepted files stay untouched.
- On the page, an invalid `data.js` shows an error banner and no numbers. An invalid `data.bill_ladder` shows a message in place of the calendar and the timing chart.

## Page and data
The course loader in `index.html` sets `window.labDashboardInput` and fires `lab-dashboard-data`. `src/main.jsx` passes `{summary, data}` to `App`, which calls `readDashboard(summary, data)` (`src/model.js`) and `checkBills(data.bill_ladder)` (`src/ladder.js`).
