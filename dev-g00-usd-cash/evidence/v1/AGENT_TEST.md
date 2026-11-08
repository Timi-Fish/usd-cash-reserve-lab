# Supervised AI maintenance tests

## Status and capability boundary
Two development rehearsals were actually executed on 2026-10-27 using the original Codex assistant and local Python. They are not fresh-chat trials and were not operated or accepted by a student. A complete course handover still requires the new-chat exercise in maintenance/FRESH_CHAT_PROMPTS.md and an actual human accept/reject decision. No autonomous refresh, installed agent or scheduler is claimed.

## Task A: Normal maintenance rehearsal
**Inputs:** accepted baseline generated from data/raw/ with maintenance/baseline_config.json (cutoff 2026-10-23), the same genuine source snapshot containing 2026-10-26, and project.json as the candidate config. This is a withheld-observation rehearsal, not new live data arriving during the session.

**Instruction used in the development workflow:** Validate the supplied source and configuration, reveal the genuine 2026-10-26 quote, rebuild separately, compare at least three outputs and preserve accepted files. No student approval is to be fabricated.

**Expected before execution:** quote date advances; both displayed quote rates and the reference instrument/day count update from source; candidate reproduces the final saved values; root data.js remains unchanged.

**Actually executed:** rebuild.py was run for the baseline and the candidate. A separate Decimal arithmetic verifier traced the updated source quote and recomputed the final modeled price and real proceeds. The assistant operated these tools; no human ran or approved the code.

| Metric | Before | After |
|---|---:|---:|
| Quote date | 2026-10-23 | 2026-10-26 |
| 13-week bank discount (%) | 4.04 | 4.05 |
| 26-week bank discount (%) | 4.17 | 4.21 |
| 13-week remaining days | 90 | 94 |
| Default 13-week real proceeds (USD) | 100,286.70 | 100,302.35 |

The reference bill changed across the source dates, so the remaining days rose rather than simply falling by three. Compare CUSIP and maturity in evidence/maintenance_baseline_summary.json and evidence/maintenance_normal_summary.json. This is why day counts are recalculated, not assumed to be 91 or 182.

**Outputs and evidence:** evidence/maintenance_rehearsal.json contains commands, exit codes, comparisons and before/after accepted hashes. The separate summaries identify source dates and instruments. evidence/calculation_checks.json records 15 arithmetic/source checks. The successful candidate matched the delivered data.js byte-for-byte.

**Human decision:** PENDING. The development candidate is retained for demonstration, not recorded as student-approved.

## Task B: Failure and safe stopping rehearsal
**Input:** the same raw sources with maintenance/invalid_unit_config.json, setting rate_unit to basis-points while leaving percent values unchanged. Separate output directory; accepted data preserved.

**Instruction:** Validate units before recalculation, stop on incompatible units, do not reinterpret values to force success.

**Expected before execution:** nonzero exit, explicit incompatible-unit error, no candidate data.js and no accepted-file changes.

**Actual:** exit 1 with `STOP: Incompatible input unit`; no candidate written. Accepted SHA-256 unchanged. An additional separate-copy test removed the latest 13-week required rate and also stopped with exit 1 and no output.

**Evidence:** evidence/maintenance_rehearsal.json. Human decision PENDING. This confirms the code's stop behavior. The later fresh-context audit below also reproduced and explained the stop.

## Lessons and instruction improvements
Source identity, unit and maturity checks must precede output creation. A correct update may change both the quote and the instrument. Candidate isolation and pre/post hashes make preservation observable. SKILL.md explicitly separates actual execution, checks not run and human release decisions.

## Student-operated fresh-chat record
Status: NOT RUN by a student. A separate fresh-context AI audit was subsequently completed as described below. Use maintenance/FRESH_CHAT_PROMPTS.md. Append actual prompt, tool capabilities, role code, exact inputs/outputs, observed actions, three comparisons, independent check, evidence and human decision. Do not overwrite this development history or turn it into a claimed fresh-chat transcript.

## Completed fresh-context AI handover audit
A separate AI subagent received the handover folder and bounded maintenance request with no original development conversation. It independently generated the baseline and normal candidate, compared both reference bills and the headline, recomputed the 13-week price/proceeds using Decimal arithmetic, executed 15 supplied verification checks and 13 JavaScript checks, and stopped the incompatible-unit candidate. Accepted data.js remained unchanged.

The actual report and command/output record are evidence/fresh_context_report.md and .json. This is an executed fresh-context AI audit, not a student-operated conversation, human independent calculation or human acceptance. The report records its limitations; its stale-banner evidence gap was subsequently addressed in evidence/browser_checks.md. Human accept/reject decisions remain PENDING. The prompts for a student-operated follow-up are supplied in maintenance/FRESH_CHAT_PROMPTS.md.
