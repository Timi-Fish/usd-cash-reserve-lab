#!/usr/bin/env python3
"""Review a refreshed candidate against the accepted version, and release it only after a person approves.

  python3 tools/candidate.py review                    read-only checks and a before/after table (also saved as candidate/review.md)
  python3 tools/candidate.py release --decision TEXT   after a person approves: keep the accepted set in previous/, copy the candidate in
  python3 tools/candidate.py reject --decision TEXT    record that the person rejected the candidate; nothing is copied
  python3 tools/candidate.py restore --decision TEXT   put the set kept in previous/ back

The candidate comes from `python3 refresh.py --out candidate`, or from calculations/rebuild.py with manually downloaded
files. Python 3.10+ standard library only. A failed check prints a line starting "STOP:", exits 1 and copies nothing."""
import argparse, csv, hashlib, json, shutil, sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CANDIDATE, PREVIOUS = ROOT / 'candidate', ROOT / 'previous'
SET = ('data', 'project.json', 'data.js')  # one saved version: inputs, settings, then data.js, always copied last
LOG = ROOT / 'maintenance' / 'release_log.csv'
LOG_FIELDS = ['date', 'action', 'quote_date_before', 'quote_date_after', 'cpi_month_before', 'cpi_month_after', 'sha256_data_js', 'decision']
MAX_BYTES = 2 * 1024 * 1024  # course limit for data.js
FLAG_PP = 0.50  # a rate or CPI move above this many percentage points is flagged for the person, not refused


def rebuild_module():
    sys.dont_write_bytecode = True  # importing rebuild.py must not add __pycache__ to the project folder
    sys.path.insert(0, str(ROOT / 'calculations'))
    import rebuild
    return rebuild


def read_set(folder):
    """data.js is the project's own wrapper around JSON: window.DASHBOARD_DATA = {...};"""
    text = (folder / 'data.js').read_text(encoding='utf-8')
    head, tail = 'window.DASHBOARD_DATA = ', ';\n'
    if not (text.startswith(head) and text.endswith(tail)):
        raise ValueError(f'{folder.name}/data.js is not one window.DASHBOARD_DATA statement')
    if len(text.encode()) > MAX_BYTES:
        raise ValueError(f'{folder.name}/data.js is larger than 2 MB')
    return json.loads(text[len(head):-len(tail)]), json.loads((folder / 'project.json').read_text())


def fields(value, path='data.js'):
    """Every field path in a data.js object; list items count as records of one shape."""
    if isinstance(value, dict):
        return {path}.union(*(fields(v, f'{path}.{k}') for k, v in value.items()))
    if isinstance(value, list):
        return {path}.union(*(fields(v, path + '[]') for v in value))
    return {path}


def numbers(payload):
    bill = {i['weeks']: i for i in payload['data']['instruments']}
    inflation = next(k for k in payload['summary']['key_numbers'] if k['concept'] == 'core:inflation')
    return bill, inflation


def facts(payload):
    """What a person compares with the sources, read from one data.js object."""
    data, (bill, inflation) = payload['data'], numbers(payload)
    release = data['cpi']['release']
    return {
        'Latest Treasury quote date': payload['summary']['as_of'],
        '13-week bank discount rate (%)': bill[13]['discount_pct'],
        '26-week bank discount rate (%)': bill[26]['discount_pct'],
        '13-week coupon-equivalent yield (%)': bill[13]['coupon_equivalent_pct'],
        '26-week coupon-equivalent yield (%)': bill[26]['coupon_equivalent_pct'],
        '13-week reference maturity': f"{bill[13]['maturity_date']} ({bill[13]['days']} days)",
        '26-week reference maturity': f"{bill[26]['maturity_date']} ({bill[26]['days']} days)",
        'Bill tenors in the payment calendar (weeks)': ', '.join(str(b['tenor_weeks']) for b in data['bill_ladder']['bills']),
        'Latest CPI month (BLS release date)': f"{release['observation_month']} ({release['release_date']})",
        'CPI-U index level, latest month': data['cpi']['levels'][-1],
        'CPI-U year-on-year (%)': f"{inflation['value']:.2f} (as of {inflation['as_of'][:7]})",
        '13-week real return, default scenario (%)': f"{bill[13]['default_result']['real_return_pct']:.3f}",
        '26-week real return, default scenario (%)': f"{bill[26]['default_result']['real_return_pct']:.3f}",
        'Headline': payload['summary']['headline'],
    }


def problems(old, new, new_config):
    """Stops refuse the release; flags go to the person, who decides. A broken structure stops before anything else."""
    if removed := sorted(fields(old) - fields(new)):
        raise ValueError('fields removed or renamed: ' + ', '.join(removed[:5]) + (' and more' if len(removed) > 5 else ''))
    stops, flags = [], []
    rebuilt, _ = rebuild_module().build(CANDIDATE / 'data', new_config)
    if json.loads(json.dumps(rebuilt, allow_nan=False)) != new:
        stops.append('candidate/data.js does not match a rebuild from candidate/data and candidate/project.json')
    if new['summary']['dashboard'] != old['summary']['dashboard']:
        stops.append('the dashboard id differs from the accepted version')
    before, after = [(p['summary']['as_of'], p['data']['cpi']['release']['observation_month']) for p in (old, new)]
    if after[0] < before[0] or after[1] < before[1]:
        stops.append('the candidate is older than the accepted version')
    elif after == before:
        stops.append('no newer observation: the quote date and CPI month equal the accepted version, which stays as it is')
    (old_bill, old_cpi), (new_bill, new_cpi) = numbers(old), numbers(new)
    for weeks in (13, 26):
        move = new_bill[weeks]['discount_pct'] - old_bill[weeks]['discount_pct']
        if abs(move) > FLAG_PP:
            flags.append(f'{weeks}-week rate moved {move:+.2f} percentage points; compare that row with the Treasury page')
    if abs(new_cpi['value'] - old_cpi['value']) > FLAG_PP:
        flags.append(f"CPI year-on-year moved {new_cpi['value'] - old_cpi['value']:+.2f} points; compare it with the BLS release")
    if added := fields(new) - fields(old):
        flags.append('new fields: ' + ', '.join(sorted(added)))
    if new['data']['freshness']['stale_at_build']:
        flags.append('the newest observations are already past the project age limits on the review date')
    if new['data']['config']['cpi_release']['next_release_date'] is None:
        flags.append('maintenance/cpi_release_schedule.csv lacks the next BLS release date; add the coming year')
    return stops, flags


def report(old, new, stops, flags):
    rows = [(k, v, facts(new)[k]) for k, v in facts(old).items()]
    quote, release = new['summary']['as_of'], new['data']['cpi']['release']
    lines = ['# Candidate review', '', f"AI pre-review: {'STOP' if stops else 'PASS'}, {len(flags)} flag(s). Run on {date.today()}.", '',
             '| Item | Accepted | Candidate | Changed |', '|---|---|---|---|']
    lines += [f'| {k} | {a} | {b} | {"yes" if a != b else ""} |' for k, a, b in rows]
    lines += ['', '## Check these against the sources yourself',
              f"1. Treasury: open {new['data']['sources'][0]['url']} and find the row dated {quote}. The 13-week and "
              '26-week "Bank Discount" columns should match the table above.',
              f"2. BLS: open {release['url']}. The not seasonally adjusted CPI-U index for {release['observation_month']} "
              'should match the index level above.',
              '3. The same values in the downloaded files: candidate/data/quotes_normalized.csv (opens in Excel; last row) '
              'and candidate/data/cpi_normalized.csv; the raw downloads are in candidate/data/raw/.',
              '', '## Automatic checks',
              '- candidate/data.js is one statement of valid JSON under 2 MB, rebuilt here from its own saved inputs',
              '- no field removed or renamed; same dashboard id; observations newer than the accepted version']
    lines += ['', '## Stops'] + [f'- {s}' for s in stops or ['none']] + ['', '## Flags for the person'] + [f'- {f}' for f in flags or ['none']]
    lines += ['', 'Release only after the person who reviews says yes: '
              'python3 tools/candidate.py release --decision "<role> accepted after checking <what>"']
    return '\n'.join(lines) + '\n'


def assess():
    if not (CANDIDATE / 'data.js').is_file():
        raise ValueError('no candidate/data.js; run python3 refresh.py --out candidate first')
    (old, _), (new, new_config) = read_set(ROOT), read_set(CANDIDATE)
    stops, flags = problems(old, new, new_config)
    text = report(old, new, stops, flags)
    (CANDIDATE / 'review.md').write_text(text)
    return old, new, stops, text


def copy_set(source, target):
    for name in SET:
        src, dst = source / name, target / name
        if src.is_dir():
            if dst.exists():
                shutil.rmtree(dst)
            shutil.copytree(src, dst, ignore=shutil.ignore_patterns('.DS_Store'))
        else:
            target.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(src, dst.with_name(dst.name + '.tmp'))
            dst.with_name(dst.name + '.tmp').replace(dst)


def sync_register(payload):
    """Keep the coverage end and access date in SOURCE_REGISTER.csv in step with the data set in use."""
    path = ROOT / 'SOURCE_REGISTER.csv'
    with path.open(newline='') as f:
        reader = csv.DictReader(f)
        header, rows = reader.fieldnames, list(reader)
    ends = {'monthly': payload['data']['cpi']['release']['observation_month'], 'business-day': payload['summary']['as_of']}
    for row in rows:  # coverage is written by this project as "<first> to <last>"
        row['coverage'] = row['coverage'].split(' to ')[0] + ' to ' + ends[row['frequency']]
        row['access_date'] = payload['data']['config']['access_date']
    with path.open('w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=header, lineterminator='\n')
        writer.writeheader()
        writer.writerows(rows)


def log(action, before, after, decision):
    if not decision.strip():
        raise ValueError('record who decided (role, no names) and what they checked with --decision')
    first = not LOG.exists()
    with LOG.open('a', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=LOG_FIELDS)
        if first:
            writer.writeheader()
        writer.writerow({'date': date.today().isoformat(), 'action': action, 'quote_date_before': before['summary']['as_of'],
                         'quote_date_after': after['summary']['as_of'],
                         'cpi_month_before': before['data']['cpi']['release']['observation_month'],
                         'cpi_month_after': after['data']['cpi']['release']['observation_month'],
                         'sha256_data_js': hashlib.sha256((ROOT / 'data.js').read_bytes()).hexdigest(), 'decision': decision.strip()})


def cmd_review(args):
    _, _, stops, text = assess()
    print(text)
    if stops:
        raise ValueError('; '.join(stops))


def cmd_release(args):
    old, new, stops, _ = assess()
    if stops:
        raise ValueError('; '.join(stops))
    if not args.decision.strip():
        raise ValueError('record who decided (role, no names) and what they checked with --decision')
    if PREVIOUS.exists():
        shutil.rmtree(PREVIOUS)
    copy_set(ROOT, PREVIOUS)
    copy_set(CANDIDATE, ROOT)
    sync_register(new)
    shutil.copyfile(CANDIDATE / 'review.md', ROOT / 'evidence' / 'release_review.md')
    log('release', old, new, args.decision)
    print(f"Released quote {new['summary']['as_of']}; the previous version is in previous/. Open index.html to look.")


def cmd_reject(args):
    old, new = read_set(ROOT)[0], read_set(CANDIDATE)[0]
    log('reject', old, new, args.decision)
    print('Rejected: the accepted version stays as it is; candidate/ is kept for discussion.')


def cmd_restore(args):
    if not (PREVIOUS / 'data.js').is_file():
        raise ValueError('nothing to restore: previous/ holds no saved version')
    current, kept = read_set(ROOT)[0], read_set(PREVIOUS)[0]
    if not args.decision.strip():
        raise ValueError('record who decided (role, no names) and what they checked with --decision')
    copy_set(PREVIOUS, ROOT)
    sync_register(kept)
    log('restore', current, kept, args.decision)
    print(f"Restored quote {kept['summary']['as_of']}.")


ACTIONS = {'review': cmd_review, 'release': cmd_release, 'reject': cmd_reject, 'restore': cmd_restore}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='action', required=True)
    sub.add_parser('review', help='read-only checks and a before/after table')
    for name in ('release', 'reject', 'restore'):
        sub.add_parser(name).add_argument('--decision', required=True, help='who decided (role, no names) and what they checked')
    args = ap.parse_args()
    ACTIONS[args.action](args)


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print('STOP: ' + str(exc), file=sys.stderr)
        sys.exit(1)
