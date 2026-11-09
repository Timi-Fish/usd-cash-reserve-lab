# Task A — Actual operations and human intervention

1. Read the supplied project SKILL.md and README.md. Accepted Treasury quote date: 2026-10-26; accepted CPI month: 2026-09.
2. Ran `python3 refresh.py --out candidate`. Failed: `STOP: <urlopen error [Errno 8] nodename nor servname provided, or not known>`.
3. Retried the same command with network permission. Failed: `STOP: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: unable to get local issuer certificate (_ssl.c:1082)>`.
4. Human intervention: the data maintainer explicitly instructed use of the system certificate file, without modifying project code or disabling SSL verification, and authorized requesting network permission for that command.
5. Ran `SSL_CERT_FILE=/etc/ssl/cert.pem python3 refresh.py --out candidate` with network permission. Succeeded: status refreshed; quote date 2026-11-06; CPI month 2026-09; seven bill tenors; zero warnings. Route: direct official-source download using the system certificate trust file; no manual downloads.
6. Ran `python3 tools/candidate.py review`. Succeeded: AI pre-review PASS; zero flags; no stops; candidate rebuilt identically and no fields removed or renamed.

Accepted files were not replaced. No release, acceptance, commit, push or publication was performed. Post-release arithmetic and Decimal validations were not run because approval is pending. The maintainer must compare the official source observations before explicitly accepting or rejecting.

## Release, rollback and bundled Node retry

- The data maintainer replied `accept` after receiving the complete comparison, flags and official source links. The conversation contains this acceptance; it does not contain a separate detailed account of the maintainer's source comparison.
- First release succeeded for quote 2026-11-06 and CPI 2026-09.
- `node dashboard/scripts/check-model.mjs` failed with `/bin/bash: node: command not found` (exit 127). `python3 calculations/verify.py` passed all 15 checks.
- Ran `python3 tools/candidate.py restore` with the failed-check reason. Successfully restored quote 2026-10-26.
- Human intervention: the maintainer supplied the existing bundled Node location, required version 18+, and authorized reuse of acceptance only for an unchanged candidate. No software was installed.
- Executed the supplied bundled Node binary with `--version`: v24.22.1. The full machine-specific path is intentionally omitted from project evidence.
- Candidate data.js SHA-256 remained `fdb77deea2335f9000f4d803b295b5ffe29caed6ab5e533a81f95a05649f1bca`, identical to the candidate accepted in chat. Official raw-input hashes also matched the saved refresh report.
- Repeated `python3 tools/candidate.py review`: PASS, zero flags and no stops. Reused the explicit acceptance and ran `python3 tools/candidate.py release` again successfully.
- Ran the existing bundled Node by its full path against `dashboard/scripts/check-model.mjs`: 32 checks, all_pass true, failures empty.
- Ran `python3 calculations/verify.py` again: 15 checks, all_pass true.
- Final saved quote date: 2026-11-06; CPI: 2026-09. index.html was not edited and reads the released data.js. No browser inspection was performed.
- One independent manual calculation: Not run. The Decimal verifier is an automated second calculation route, not a manual independent calculation.
- No Task B execution or edits. No commit, push or publication. Packaging excludes candidate, previous and caches.


## Packaging-stage evidence merge
The separate completed Task C workbook and EVALS.md E1-E3 records were merged after this fresh maintenance run. The released data.js is byte-identical to the version checked in Task C. In the separate coordinating conversation the maintainer confirmed checking 13-week and 26-week Bank Discount rates of 4.01% and 4.12% and the September 2026 unadjusted CPI-U index of 336.940. These confirmations and the independent workbook calculation are supplementary; they were not performed or stated in this fresh maintenance conversation.
