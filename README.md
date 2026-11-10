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

- `bms5312-g09-usd-cash/` is the submission folder: the page (`index.html`, `data.js`), sources, method, maintenance skill, evaluations and evidence. Start with `bms5312-g09-usd-cash/README.md`.
- `group/` holds group material that is never submitted: tasks and prompts for members (`group/handoff/`), the speaker guide (`group/SPEAKER_GUIDE.pdf`, built from `group/speaker-guide/`), the backup slides, the submission checklist, the changelog, design decisions and an earlier review.
- `reference/` holds the course's agent guide and class vocabulary.
- `AGENTS.md` gives the rules for AI assistants working here, with an index of where the work is; `CLAUDE.md` points to it. `INTERFACES.md` lists the contracts between the parts.

The first dashboard version is kept as the git tag `original-v2`.

## See the dashboard

Double-click `bms5312-g09-usd-cash/index.html`.

## Working together

1. Pull `main`, make the change, and run the checks below.
2. Commit straight to `main` with a Conventional Commit message. A bad change is undone by reverting its commit.
3. Record work in the project's `AI_LOG.md`, `AGENT_TEST.md` or `EVALS.md`, as the course requires.

## Before every push

- No names, student IDs, emails, client details, keys or local paths in any file or commit message (course rule).
- From `bms5312-g09-usd-cash/`, run `node tests/check_refresh.mjs` and `node dashboard/scripts/check-model.mjs`.

## Making the submission ZIP

`python3 bms5312-g09-usd-cash/tools/set_identity.py --prefix bms5312 --group g09` first checks that `data.js` still matches a rebuild of its inputs. It then writes `bms5312-g09-usd-cash.zip` in this repository's root, which git ignores. Working folders, `node_modules` and `dist` are left out. Because `.git` lives outside the submission folder, it is never packaged.
