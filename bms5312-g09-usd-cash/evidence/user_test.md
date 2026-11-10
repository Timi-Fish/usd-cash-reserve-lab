# User test and clean reproduction

A group member opened the final page on their own computer on 2026-11-10. This file records what they reported, a separate check run by an assistant, and the feedback that changed the page.

## Setup
| Item | Record |
|---|---|
| Date | 2026-11-10 |
| Tester role | Group member. Whether they took part in building the page was not confirmed. |
| Computer, operating system and browser | Mac with the current macOS and Google Chrome, as reported; exact versions not recorded |
| Opened how | Not recorded whether the page was opened by double-click from a newly extracted ZIP |
| Quote date shown in the banner | Not recorded |

## Questions (E4 Financial interpretation)
The tester did not record answers to the four questions, so E4's student route has not run. The expected answers are in `EVALS.md` under E4.

| Question | Tester's answer |
|---|---|
| 1. Add a payment on a date of your choice. Which saved bill matures on or before it, and how many days does the cash wait? What would happen with the next bill? | Not recorded |
| 2. Set inflation to 6%. What happens to the nominal proceeds and to the purchasing power, and why? | Not recorded |
| 3. Are the saved data within their age limits? How does the page tell you? | Not recorded |
| 4. Would you call either reference bill "better"? Why or why not? | Not recorded |

## Controls tried (E5 Interaction)
| Control | Result |
|---|---|
| The five tabs: Overview, Calendar, Scenarios, History, Method | Opened, as reported. No error was reported. |
| Amount, inflation, reference bill | Not recorded |
| Add, select, remove and clear payment dates | Not recorded |
| Break-even buttons on Scenarios | Not recorded |
| History window and series switches | Not recorded |
| Copy summary, then paste into a document | Not recorded |
| Print summary (print preview) | Not recorded |

## Clean reproduction (E8)
The tester reported running "the dashboard or checks" but recorded no commands or outputs, so the student route of E8 has not run.

On 2026-11-10 the teammate's assistant copied the project into a temporary folder and ran:

| Check | Result |
|---|---|
| `python3 calculations/rebuild.py --out <temporary folder>` | Exit 0; the rebuilt `data.js` is byte-identical to the supplied one |
| `python3 calculations/verify.py` | Exit 0; 15 checks passed |
| `node dashboard/scripts/check-model.mjs` | Exit 0; 32 checks passed |
| `node tests/check_refresh.mjs` | Exit 0; 44 checks passed |

## Feedback and resulting change
- **AI-assisted review by the user-value lead, 2026-11-10.** The Calendar and the timing chart match payments across seven maturities, but the purchasing-power figures use only the 13- or 26-week reference bill, so a new user may think the value follows the matched bill.
- **Change:** the timing chart's caption now names the navy 13-week and mid-blue 26-week bars as the reference bills valued below, and says the pale bars show timing only. Letting the value follow the matched bill is the next step in `AI_LOG.md`.
- The tester above gave no further feedback, and the revised caption has not been retested with a reader.
