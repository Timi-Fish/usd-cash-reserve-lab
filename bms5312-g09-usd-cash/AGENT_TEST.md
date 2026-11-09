# Supervised AI maintenance tests

Both tests follow `SKILL.md` in a new assistant conversation, using the prompts in `maintenance/FRESH_CHAT_PROMPTS.md`. The operator is a group member in the data-maintainer role who did not write `SKILL.md`. Entries marked "—" are completed from the actual run.

## Task A Normal update
| Item | Record |
|---|---|
| Date | — |
| AI tool and capabilities | — |
| Operator role | Data maintainer |
| Files supplied | The project folder at the accepted version (quote date 2026-10-26, CPI 2026-09) |
| Observation and source | Genuine newer observations: Treasury Daily Treasury Bill Rates after 2026-10-26 and any newly released BLS CPI-U month, downloaded live by `refresh.py` |
| Exact prompt | Task A prompt in `maintenance/FRESH_CHAT_PROMPTS.md` |
| Actions actually executed | — |
| Manual interventions | — |
| Candidate output files | — |
| Three before/after comparisons | — |
| One independent calculation | — |
| Evaluation results after release | — |
| Evidence paths | — |
| Human decision | — |

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
