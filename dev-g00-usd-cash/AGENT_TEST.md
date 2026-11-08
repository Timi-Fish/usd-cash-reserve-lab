# Revision v2 maintenance tests

Date: 2026-10-27. Operator: development assistant in the current conversation. These tests were actually rerun against the revised exporter and saved candidate. They are not a new fresh-context trial and are not human-accepted.

## Normal withheld-observation update
Expected before execution: reveal genuine 2026-10-26 source records from a baseline cutoff of 2026-10-23; update rates, reference maturities, days and modeled proceeds together. Preserve the root candidate and original accepted project.

Actual: quote date advanced; 13-week discount 4.04% → 4.05%; 26-week 4.17% → 4.21%; 13-week days 90 → 94; default real proceeds $100286.70 → $100302.35. The updated candidate is byte-identical to this revision's root data.js. Changes in days reflect reference maturity changes, not a rolling model start. See evidence/maintenance_rehearsal.json and the two summary files.

## Failure trial
Expected: incompatible rate_unit stops with no candidate data output and no change to the root file. Actual: exit 1, explicit incompatible-unit stop and no output. A separate missing-latest-quote-field input also exited 1 without output. Source and accepted files were preserved. Actual command/output records and hashes are in evidence/maintenance_rehearsal.json.

## Independent routes and decisions
The Decimal/source script and revision JavaScript suite were executed for this revision. These are AI-operated checks, not student independent calculations. Human accept/reject: PENDING. A fresh-context maintenance trial of the changed SKILL.md is NOT RUN. The prior fresh-context report is retained under evidence/v1/ and applies only to the earlier version. Use maintenance/FRESH_CHAT_PROMPTS.md to complete the student-supervised handover; append actual evidence, not a simulated transcript.
