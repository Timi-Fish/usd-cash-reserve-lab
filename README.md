# USD Cash Reserve Lab: group repository

This is the private working repository for the group's course dashboard. Educational project. Not investment advice.

## Layout

- `dev-g00-usd-cash/` is the course project folder, laid out exactly as the submission expects: the dashboard (`index.html`, `data.js`), sources, calculations, evidence and slides. Start with `dev-g00-usd-cash/README.md`.
- `dev-g00-usd-cash/extensions/` holds candidate additions the group has not accepted yet: an automatic refresh, a liquidity calendar and a project review. Start with `dev-g00-usd-cash/extensions/README.md`.
- `AGENTS.md` gives the rules for AI assistants working in this repository; `CLAUDE.md` points to it.

The repository files (this README, `AGENTS.md`, `CLAUDE.md`, `.gitignore`) sit outside the project folder, so they never end up in the submission package.

## Working together

1. Clone the repository and create a branch named after the change, such as `fix/stale-warning` or `feat/tabbed-layout`.
2. Make small commits, then open a pull request into `main`. Say what changed, which checks ran and what still needs a person.
3. Another member reviews and merges. Nobody pushes straight to `main`.
4. Record accepted changes in the project's `AI_LOG.md`, `AGENT_TEST.md` or `EVALS.md`, as the course requires.

## Before every push

- No names, student IDs, emails, client details, keys or local paths in any file or commit message (course rule).
- If you touched `extensions/`, run `node dev-g00-usd-cash/extensions/tests/check_extensions.mjs`.

## Making the submission ZIP

`dev-g00-usd-cash/tools/set_identity.py` writes the renamed folder and its ZIP next to the project folder, that is, in this repository's root. ZIPs are ignored by git; the group decides whether to commit the renamed folder. Because `.git` lives outside the project folder, it is never copied into the package.
