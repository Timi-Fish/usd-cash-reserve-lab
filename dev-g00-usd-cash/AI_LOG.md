# Version note
Entries before revision v2 refer to the original project. Their old evidence paths now resolve under evidence/v1/ in this candidate. Only the final revision entry describes the candidate checks.

# AI work log

No names or student IDs are recorded. Role codes refer to functions, not invented group members.

## 2026-10-20 to 2026-10-27: Scope discussion
**User role:** project owner. **AI role:** planning assistant.
The user supplied the assignment, file guide, START_HERE and two exported ZIPs. The assistant explained the requirements and proposed three topics. The user selected the cash/inflation direction. The user questioned whether short-term cash should beat inflation; the direction was refined to same-horizon purchasing-power scenarios for roughly three or six months. A Google Doc proposal was created earlier. Its original one-year framing is superseded by PROPOSAL.md in this package. No claim is made that every earlier proposal detail was approved.

## 2026-10-27: Build request and decisions
The user requested the project and a complete ZIP in English, and stated that the class prefix/group number are unknown. The assistant used a conspicuous development identifier and provided a finalization tool. The group must still supply the real identifiers and approve financial implementation choices.

**Proposed implementation decisions:** direct official snapshots; bank-discount price formula with actual quote-to-maturity days; independent hypothetical annual inflation; no historical real-yield signal; three views; manual supervised updates. The user approved the topic/direction, not a fabricated detailed financial sign-off.

## 2026-10-27: Source collection and concerns
Actually downloaded BLS CUUR0000SA0 JSON (2023–2026) and Treasury daily bill XML for 2024, 2025 and 2026. An initial Treasury URL form was incorrect and timed out; the documented resource-center/data-chart-center endpoint succeeded. BLS HTML downloads returned 403, while its public JSON and web-readable official pages were available. The dataset-specific Treasury CC0 listing and BLS public-domain statement were reviewed. October 2025 CPI is genuinely unavailable and remains null.

## 2026-10-27: Implementation and verification
AI wrote an offline HTML/JS page, a standard-library Python rebuild, a separate Decimal verifier, a JavaScript logic harness and project documentation. The Decimal/source route ran 15 checks; the JavaScript harness ran 13 checks. Both passed at this stage. The assistant's separate arithmetic route is not an independent student check.

The in-app browser rejected the file URL. A loopback preview restricted to index.html and data.js was used for actual desktop/mobile rendering and interaction. The first local server attempt lacked binding permission; the reviewed loopback launch succeeded. No public hosting was created. Inflation 3% to 6%, tenor switching, empty principal and reset behavior were tested. A mobile select-label clipping issue was corrected by shortening the option labels. A student must still perform the final extracted-file double-click test.

## 2026-10-27: Maintenance rehearsal and handover
Actually ran a withheld-observation update (2026-10-23 to 2026-10-26) and two failure checks (wrong units and missing required rate) in isolated working copies. Accepted hashes were preserved. Results are in AGENT_TEST.md and evidence/. These are current-context development rehearsals, not new-chat tests or student acceptance. A fresh-chat prompt pack and student sign-off sheet are provided.

## Outstanding work owned by the group
Confirm course identifiers and method, independently recalculate three results, run a non-builder usability test, execute genuine fresh-chat normal/failure trials, record human release decisions, double-click the final extracted page and rehearse the presentation. Do not invent evidence for these steps.

## Final handover and packaging
A separate fresh-context AI subagent performed the bounded maintenance audit without the original chat; see evidence/fresh_context_report.md. A later browser fixture visibly confirmed the stale warning. The assistant created and visually inspected eight presentation slides, supplied an English presentation script, and tested a clean extracted-package rebuild. Technical evidence does not substitute for student independent work or human approval.

## 2026-10-27 — Revision v2 candidate
User requested actual implementation of cash-date matching, comparable maturity cards, sensitivity, purchasing-power decomposition, zero-interest benchmark and improved history. Worked in a separate directory; original version and source snapshots preserved. Fixed incorrect core:bond-yield mapping; kept pricing/inflation methods and defaults. Added strict date/day/tenor/security checks. New tests executed for this revision; prior evidence moved under evidence/v1/. Desktop/mobile charts were revised after inspecting actual renders; singular-day wording corrected. Direct file-mode browser test was blocked by tool policy and is explicitly not run. HTTP UI tests, model tests and maintenance rehearsal results are recorded separately. No student calculation, human trial or acceptance was fabricated.
