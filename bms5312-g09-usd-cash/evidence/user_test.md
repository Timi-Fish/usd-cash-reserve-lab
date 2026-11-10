# User test

A group member opened the final page on their own computer on 2026-11-10. This file records what they did, the checks their assistant reran, and the feedback that changed the page.

## Setup
| Item | Record |
|---|---|
| Date | 2026-11-10 |
| Tester role | Group member |
| Computer, operating system and browser | Mac with the current macOS, Google Chrome |

## Controls tried (E4 Interaction)
| Control | Result |
|---|---|
| The five tabs: Overview, Calendar, Scenarios, History, Method | All opened; no error reported |

## Checks rerun by the teammate's assistant
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
