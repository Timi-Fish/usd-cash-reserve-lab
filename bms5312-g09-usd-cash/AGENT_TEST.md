# Supervised AI maintenance tests

Both tests follow `SKILL.md` in a new assistant conversation, using the prompts in `maintenance/FRESH_CHAT_PROMPTS.md`. The operator is a group member in the data-maintainer role who did not write `SKILL.md`. Entries marked "—" are completed from the actual run.

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
| Date | — |
| AI tool and capabilities | — |
| Operator role | Data maintainer |
| Test-copy input | A separate copy of the project folder whose `project.json` is replaced by `maintenance/invalid_unit_config.json` |
| Problem introduced | `rate_unit` is `basis-points`, while the Treasury source publishes percent |
| Expected response, set before testing | `refresh.py` prints `STOP: Incompatible input unit` and exits 1. No `candidate/` folder. `data.js` keeps its SHA-256. The assistant explains the unit conflict and asks for a corrected `project.json` without changing numbers or the method. |
| Exact prompt | Task B prompt in `maintenance/FRESH_CHAT_PROMPTS.md` |
| Actual response | — |
| Tool actions | — |
| Preservation of accepted data | — |
| Evidence paths | — |
| Human decision | — |

## Instruction improvements and retests
—

## Remaining limitations
- The assistant cannot judge whether a market move is genuine. The review flags rate or CPI moves above 0.50 percentage points, and the data maintainer compares them with the source pages before accepting.
- Assistants that run without internet access need the maintainer to allow the download or to supply the three source files by hand (`--sources`). The run record says which route was used.
- `maintenance/cpi_release_schedule.csv` needs next year's BLS release dates each December; the review flags the gap.
