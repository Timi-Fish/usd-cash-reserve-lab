# USD Cash Reserve Lab: group repository

The working repository for a group course dashboard on U.S. Treasury bills and inflation, built for a family-office client.

## Disclaimer

**For NUS Business School educational purposes only.**

Educational project. Not investment advice.

- Nothing in this repository is financial, investment, tax or legal advice. Do not take any of it into account in a financial decision.
- Saved Treasury quotes and CPI figures are historical observations, not offers or forecasts, and may be out of date.
- The project is not affiliated with or endorsed by J.P. Morgan, Goldman Sachs or any other firm named in it. Their names appear only to credit an open-source design system or a design reference.
- Copyright © 2026 NUS Business School. All rights reserved, except for the third-party components below, which keep their own licences.

| Component | Licence |
|---|---|
| Salt design system (J.P. Morgan) | Apache-2.0 |
| React, Chart.js, KaTeX, Vite | MIT |
| Open Sans, Source Serif 4 fonts | SIL Open Font License 1.1 |
| U.S. Treasury bill rates | CC0 |
| BLS CPI data | Public domain |

## Layout

- `dev-g00-usd-cash/` is the course project folder, laid out exactly as the submission expects: the accepted dashboard (`index.html`, `data.js`), sources, calculations, evidence and slides. Start with `dev-g00-usd-cash/README.md`.
- `dev-g00-usd-cash/extensions/` holds candidate additions the group has not accepted yet: a redesigned dashboard on the Salt design system, an automatic refresh, a liquidity calendar and a project review. Start with `dev-g00-usd-cash/extensions/README.md`.
- `AGENTS.md` gives the rules for AI assistants working here, with an index of where the work is; `CLAUDE.md` points to it.

The repository files (this README, `AGENTS.md`, `CLAUDE.md`, `.gitignore`) sit outside the project folder, so they never end up in the submission package.

## See the two dashboards

- Accepted original: double-click `dev-g00-usd-cash/index.html`.
- Candidate redesign: double-click `dev-g00-usd-cash/extensions/salt-dashboard/dist/index.html`.

## Working together

1. Clone the repository and create a branch named after the change, such as `fix/stale-warning` or `feat/tabbed-layout`.
2. Make small Conventional Commits, then open a pull request into `main`. Say what changed, which checks ran and what still needs a person.
3. Another member reviews and merges. Nobody pushes straight to `main`.
4. Record accepted changes in the project's `AI_LOG.md`, `AGENT_TEST.md` or `EVALS.md`, as the course requires.

## Before every push

- No names, student IDs, emails, client details, keys or local paths in any file or commit message (course rule).
- If you touched `extensions/`, run `node dev-g00-usd-cash/extensions/tests/check_extensions.mjs`.

## Making the submission ZIP

`dev-g00-usd-cash/tools/set_identity.py` writes the renamed folder and its ZIP next to the project folder, that is, in this repository's root. ZIPs are ignored by git; the group decides whether to commit the renamed folder. Because `.git` lives outside the project folder, it is never copied into the package.
