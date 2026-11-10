# User test and clean reproduction

A group member who did not build the page opens the final ZIP on their own computer. They answer the questions using only the page, and record what they actually saw. Entries marked "—" are completed from the actual test.

## Setup
| Item | Record |
|---|---|
| Date | — |
| Tester role | — |
| Computer, operating system and browser | — |
| Opened how | Double-click on `index.html` in the extracted ZIP |
| Quote date shown in the banner | — |

## Questions (E4 Financial interpretation)
| Question | Tester's answer | Matches the page? |
|---|---|---|
| 1. Add a payment on a date of your choice. Which saved bill matures on or before it, and how many days does the cash wait? What would happen with the next bill? | — | — |
| 2. Set inflation to 6%. What happens to the nominal proceeds and to the purchasing power, and why? | — | — |
| 3. Are the saved data within their age limits? How does the page tell you? | — | — |
| 4. Would you call either reference bill "better"? Why or why not? | — | — |

## Controls tried (E5 Interaction)
| Control | Result |
|---|---|
| Amount, inflation, reference bill | — |
| Add, select, remove and clear payment dates | — |
| Break-even buttons on Scenarios | — |
| History window and series switches | — |
| Copy summary, then paste into a document | — |
| Print summary (print preview) | — |

## Clean reproduction (E8)
| Command, run in the extracted folder | Result |
|---|---|
| `python3 calculations/rebuild.py --out candidate`, then compare `candidate/data.js` with `data.js` | — |
| `node dashboard/scripts/check-model.mjs` | — |
| `node tests/check_refresh.mjs` | — |
| Python and Node versions | — |

## Feedback and resulting change
- **AI-assisted review by the user-value lead, 2026-11-10** (not the non-builder test above). The Calendar and the timing chart match payments across seven maturities, but the purchasing-power figures use only the 13- or 26-week reference bill, so a new user may think the value follows the matched bill.
- **Change:** the timing chart's caption now names the navy 13-week and mid-blue 26-week bars as the reference bills valued below, and says the pale bars show timing only. Letting the value follow the matched bill is the next step in `AI_LOG.md`.
