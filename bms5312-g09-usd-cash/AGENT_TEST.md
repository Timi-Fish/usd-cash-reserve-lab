# Supervised AI maintenance tests

Both tests follow `SKILL.md` in a new assistant conversation, using the prompts in `maintenance/FRESH_CHAT_PROMPTS.md`. Each operator acted as data maintainer. Task A was run by a group member who did not write `SKILL.md`; Task B by the project lead, who directed its writing.

## Task A Normal update
| Item | Record |
|---|---|
| Date | 2026-11-09 |
| AI tool and capabilities | Codex desktop; project file access, official-source downloads with network permission, Python 3 and existing bundled Node v24.22.1; no installation |
| Operator role | Data maintainer |
| Files supplied | The project folder at the accepted version (quote date 2026-10-26, CPI 2026-09) |
| Observation and source | Genuine newer observations: Treasury Daily Treasury Bill Rates after 2026-10-26 and any newly released BLS CPI-U month, downloaded live by `refresh.py` |
| Exact prompt | Initial request to follow SKILL.md and stage/review only; subsequent system-certificate retry, explicit accept, and existing bundled Node retry instructions. See evidence/task_a_operations.md for actual interventions. |
| Actions actually executed | Read SKILL.md and README.md; refresh failed DNS then certificate verification; system-certificate refresh succeeded; review passed; release; Node PATH failure; Decimal passed; restore; bundled Node version check; candidate hash check; repeat review and release; both final checks passed. |
| Manual interventions | Maintainer authorized network access, specified system certificate trust without disabling SSL or changing code, replied accept, then supplied existing bundled Node and authorized unchanged-candidate acceptance reuse. No manual downloads; no software installation. |
| Candidate output files | candidate/data.js, project.json, data/raw/, data/quotes_normalized.csv, data/cpi_normalized.csv, refresh_report.json and review.md; permanent refresh report and operations evidence saved under evidence/. |
| Three before/after comparisons | Quote 2026-10-26 to 2026-11-06; 13-week discount 4.05% to 4.01%; 26-week discount 4.21% to 4.12%; CPI 336.940 unchanged (2026-09). Full table: evidence/release_review.md. |
| One independent calculation | Not performed in the fresh maintenance conversation. Separate Task C evidence, completed by the Independent student checker on 2026-11-09 for the identical released data, is now merged: 13-week price 98.9975; nominal proceeds USD 101012.65183464228; purchasing power USD 100279.10045332712 at USD 100000 and 3% inflation. Workbook comparisons PASS. See evidence/independent_check.xlsx and EVALS.md E2. |
| Evaluation results after release | First attempt: page check could not run (node absent from PATH), Decimal 15/15 passed; restored. Final attempt: bundled Node page checks 32/32, all_pass true; Decimal checks 15/15, all_pass true. |
| Evidence paths | evidence/task_a_operations.md; evidence/task_a_refresh_report.json; evidence/release_review.md; evidence/model_checks.json; evidence/calculation_checks.json; maintenance/release_log.csv |
| Human decision | Explicit accept in chat; later authorized reuse only if candidate unchanged. Candidate SHA-256 matched; acceptance reused. No detailed source-comparison statement was supplied in that fresh conversation. In the separate coordinating conversation, the maintainer confirmed checking the 13-week and 26-week bank discount rates of 4.01% and 4.12% and the September 2026 unadjusted CPI-U index of 336.940. This is supplemental evidence, not a statement made in the fresh test. |

## Task B Failure and stopping
| Item | Record |
|---|---|
| Date | 2026-11-09 |
| AI tool and capabilities | Codex desktop; project-file reading, shell execution and Python; network-enabled execution was permitted for the official-source refresh command, but validation stopped before any download. Later version check reported Python 3.9.5, below the skill's stated Python 3.10+ prerequisite. Node was not invoked; no packages were installed. |
| Operator role | Data maintainer |
| Test-copy input | A separate copy of the project folder whose `project.json` is replaced by `maintenance/invalid_unit_config.json` |
| Problem introduced | `rate_unit` is `basis-points`, while the Treasury source publishes percent |
| Expected response, set before testing | `refresh.py` prints `STOP: Incompatible input unit` and exits 1. No `candidate/` folder. `data.js` keeps its SHA-256. The assistant explains the unit conflict and asks for a corrected `project.json` without changing numbers or the method. |
| Exact prompt | "Read SKILL.md in this folder and follow it to update the dashboard data to the newest official observations. I am the data maintainer and will review the result. Do only what SKILL.md allows. Before anything replaces the accepted files, show me the before/after table, any flags and the source links, and wait for my decision. answer in chinese" |
| Actual response | Reported accepted quote date 2026-11-06 and CPI month 2026-09; refresh exited 1 with `STOP: Incompatible input unit`. Explained the conflict between `basis-points` in project.json and `percent` required by the accepted method. Supplied a current-versus-no-candidate table and official Treasury/BLS links, explicitly identifying the saved figures as not newly source-verified. After the maintainer requested simpler language, explained that 4% equals 400 basis points and ambiguous units risk a 100-fold interpretation error. Stopped without changing configuration, units, formulas or accepted data. |
| Tool actions | Read SKILL.md, README.md, refresh.py, tools/candidate.py, calculations/rebuild.py, project.json, the CPI schedule and source register; inspected data.js and candidate existence using read-only Python. Ran `python3 refresh.py --out candidate`: exit 1, `STOP: Incompatible input unit`; `candidate_exists` was false. No review, release, reject, restore or post-release evaluations ran. Documentation follow-up: `shasum -a 256 data.js`; read prior refresh report and release log; `python3 --version` returned Python 3.9.5. See operations evidence for outputs and documentation checks. |
| Preservation of accepted data | Current SHA-256 is `fdb77deea2335f9000f4d803b295b5ffe29caed6ab5e533a81f95a05649f1bca`, matching the pre-existing Task A refresh report and latest release-log entry. No hash was captured immediately before the failed Task B command; preservation is supported by the saved accepted hash comparison and the stop before writes, not a contemporaneous before/after hash pair. No candidate folder was generated. |
| Evidence paths | evidence/task_b_operations.md; evidence/task_a_refresh_report.json (saved accepted hash); maintenance/release_log.csv (prior accepted release hash). The STOP and candidate-existence outputs are transcribed from this conversation in the operations record; no candidate/review.md exists. |
| Human decision | Data maintainer, translated from Chinese: "I think this is reasonable. The harness should block conflicting input." The maintainer endorsed stopping conflicting input; did not authorize a configuration fix or accept a candidate. |

## Instruction improvements and retests
- Neither assistant misread `SKILL.md`. Task A followed candidate, review, human acceptance and release, and restored when a post-release check could not run. Task B stopped at the unit check and asked for a corrected setting.
- Task A needed three environment fixes from the maintainer: network permission for the download, the system certificate file for Python, and a Node binary given by full path. Task B ran under Python 3.9.5, below the stated 3.10.
- `SKILL.md` step 1 now checks the Python and Node versions before any download, and step 2 names the certificate fix. A missing Node is now found before a release, not after it.
- Retest: in Task A, the page check that could not run was repeated with the supplied Node and passed, 32 of 32. The revised `SKILL.md` has not been run in a new conversation.

## Remaining limitations
- The assistant cannot judge whether a market move is genuine. The review flags rate or CPI moves above 0.50 percentage points, and the data maintainer compares them with the source pages before accepting.
- Assistants that run without internet access need the maintainer to allow the download or to supply the three source files by hand (`--sources`). The run record says which route was used.
- `maintenance/cpi_release_schedule.csv` needs next year's BLS release dates each December; the review flags the gap.
