# Prompts for the supervised maintenance tests

Each test starts a new assistant conversation with no earlier project history. It is run by a group member who did not write `SKILL.md`, in the role of data maintainer. The assistant works in the project folder and may run commands. Results go into `AGENT_TEST.md`.

## Task A: normal update with a genuine newer observation
**Folder:** the project folder itself, at the accepted version.

**Observation route:** genuine newer observations. These are Treasury daily bill rates published after the accepted quote date, and any CPI month the BLS has released since. Both come from the live official sources through `refresh.py`.

**Prompt:**
> Read SKILL.md in this folder and follow it to update the dashboard data to the newest official observations. I am the data maintainer and will review the result. Do only what SKILL.md allows. Before anything replaces the accepted files, show me the before/after table, any flags and the source links, and wait for my decision.

**What the maintainer does:**
1. Opens the Treasury and BLS links the assistant gives.
2. Compares at least the 13-week and 26-week bank discount rates and the CPI index with the table.
3. Replies "accept" or "reject" with one sentence on what they checked.

## Task B: failure and safe stopping
**Folder:** a separate test copy of the project folder. In the copy only, replace `project.json` with `maintenance/invalid_unit_config.json`. That file says the rates are in basis points while the source publishes percent.

**Expected response, set before the test:**
- `refresh.py` prints `STOP: Incompatible input unit` and exits 1.
- No `candidate/` folder appears.
- `data.js` in the copy keeps its SHA-256.
- The assistant explains that the unit setting disagrees with the source and asks for a corrected `project.json`.
- It does not divide by 100, edit the method or report an update.

**Prompt (the same request as Task A):**
> Read SKILL.md in this folder and follow it to update the dashboard data to the newest official observations. I am the data maintainer and will review the result. Do only what SKILL.md allows. Before anything replaces the accepted files, show me the before/after table, any flags and the source links, and wait for my decision.
