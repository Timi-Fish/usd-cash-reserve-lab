#!/usr/bin/env python3
"""Refresh the USD Cash Reserve Lab data: download the official inputs, then validate and recalculate them with the
accepted rebuild rules in calculations/rebuild.py, producing one complete, coordinated data set.

  python3 refresh.py --out candidate   maintenance skill: a candidate folder for review; accepted files untouched
  python3 refresh.py                   course default: replace data.js and its inputs in this folder

Nothing is written unless every check passes, and data.js is written last. Python 3.10+ standard library only;
no API key. A failed check prints a line starting "STOP:" and exits with code 1."""
import argparse, csv, hashlib, importlib.util, io, json, shutil, sys, tempfile, urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SCHEDULE = ROOT / 'maintenance' / 'cpi_release_schedule.csv'
TREASURY_XML = ('https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml'
                '?data=daily_treasury_bill_rates&field_tdr_date_value={year}')
BLS_JSON = 'https://api.bls.gov/publicAPI/v2/timeseries/data/CUUR0000SA0?startyear=2023&endyear={year}'
CPI_FILE = 'cpi_2023_2026.json'  # name fixed by calculations/rebuild.py; the content runs from 2023 to the current year
USER_AGENT = 'usd-cash-reserve-lab-refresh/1.0 (educational dashboard)'
TIMEOUT_SECONDS = 60


def load_rebuild():
    sys.dont_write_bytecode = True  # importing rebuild.py must not add __pycache__ to the project folder
    spec = importlib.util.spec_from_file_location('rebuild', ROOT / 'calculations' / 'rebuild.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


rebuild = load_rebuild()


def download(url):
    request = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
        return response.read()


def fetcher(sources):
    """The one place that decides where inputs come from: the official endpoints or a folder of manual downloads."""
    if sources is None:
        return lambda name, url: (download(url), url)
    # Only the file name is recorded, so the report never contains a local path.
    return lambda name, url: ((sources / name).read_bytes(), 'manual file ' + name)


def gather(raw, today, fetch):
    """Start from the accepted snapshots, then replace the two latest Treasury years and the CPI series."""
    shutil.copytree(ROOT / 'data' / 'raw', raw, ignore=shutil.ignore_patterns('.DS_Store'))
    wanted = {f'treasury_{year}.xml': TREASURY_XML.format(year=year) for year in (today.year - 1, today.year)}
    wanted[CPI_FILE] = BLS_JSON.format(year=today.year)
    provenance = []
    for name, url in wanted.items():
        body, origin = fetch(name, url)
        (raw / name).write_bytes(body)
        provenance.append({'file': name, 'origin': origin, 'bytes': len(body), 'sha256': hashlib.sha256(body).hexdigest()})
    return provenance


def load_schedule():
    with SCHEDULE.open(newline='') as f:
        rows = list(csv.DictReader(f))
    schedule = {row['observation_month']: date.fromisoformat(row['release_date']) for row in rows}
    if len(schedule) != len(rows):
        raise ValueError('Duplicate month in ' + SCHEDULE.name)
    return schedule


def following_month(month):
    first = date.fromisoformat(month + '-01')
    return date(first.year + first.month // 12, first.month % 12 + 1, 1).strftime('%Y-%m')


def choose_cpi_month(cpi, schedule, today, warnings):
    """Latest CPI month with a level and a past BLS release date; newer months wait for their schedule row."""
    available = sorted(month for month, level in cpi.items() if level is not None)
    released = [month for month in available if month in schedule and schedule[month] <= today]
    if not released:
        raise ValueError('No CPI month in the BLS response has a past release date in ' + SCHEDULE.name)
    if released[-1] != available[-1]:
        warnings.append(f'CPI {available[-1]} is available but {SCHEDULE.name} has no past release date for it; '
                        f'CPI stays at {released[-1]}. Add the BLS schedule rows (yearly task).')
    return released[-1]


def candidate_config(today, quote_date, month, schedule):
    config = json.loads((ROOT / 'project.json').read_text())
    release, following = schedule[month], following_month(month)
    config.update(review_date=today.isoformat(), access_date=today.isoformat(), quote_cutoff=quote_date, cpi_release={
        'observation_month': month, 'release_date': release.isoformat(),
        # null until BLS publishes the following month in its schedule; the dashboard does not display this field
        'next_release_date': schedule[following].isoformat() if following in schedule else None,
        # BLS archive naming, e.g. 2026-10-14 -> cpi_10142026.htm (same form as the accepted project.json)
        'url': f'https://www.bls.gov/news.release/archives/cpi_{release:%m%d%Y}.htm'})
    return config


def accepted_summary():
    text = (ROOT / 'data.js').read_text()
    payload = json.loads(text.split('=', 1)[1].strip().removesuffix(';'))  # data.js: window.DASHBOARD_DATA = {JSON};
    return {'quote_date': payload['summary']['as_of'], 'cpi_month': payload['data']['cpi']['release']['observation_month']}


def check_progress(payload, accepted):
    if payload['summary']['as_of'] < accepted['quote_date']:
        raise ValueError(f"Downloaded quotes end {payload['summary']['as_of']}, before the accepted {accepted['quote_date']}")
    if payload['data']['cpi']['release']['observation_month'] < accepted['cpi_month']:
        raise ValueError('Downloaded CPI is older than the accepted CPI month ' + accepted['cpi_month'])


def collect(today, sources=None):
    """Fetch, validate and assemble one coordinated release. Raises on any failed check and writes nothing."""
    rebuild.check_config(json.loads((ROOT / 'project.json').read_text()))  # a wrong setting stops before any download
    warnings, schedule = [], load_schedule()
    with tempfile.TemporaryDirectory() as tmp:
        work = Path(tmp)
        provenance = gather(work / 'raw', today, fetcher(sources))
        cpi, quotes = rebuild.read_inputs(work, today.isoformat())
        month = choose_cpi_month(cpi, schedule, today, warnings)
        config = candidate_config(today, quotes[-1]['date'], month, schedule)
        payload, quotes = rebuild.build(work, config)
        accepted = accepted_summary()
        check_progress(payload, accepted)
        raw = {path.name: path.read_bytes() for path in sorted((work / 'raw').iterdir())}
    if payload['data']['freshness']['stale_at_build']:
        warnings.append('The newest official observations are already stale under the project age rules')
    return {'payload': payload, 'quotes': quotes, 'config': config, 'raw': raw,
            'provenance': provenance, 'accepted': accepted, 'warnings': warnings}


def refresh():
    """Course interface: download the sources, recalculate everything and return the complete data.js object."""
    return collect(date.today())['payload']


def csv_bytes(header, rows):
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(header)
    writer.writerows(rows)
    return buffer.getvalue().encode()


def write_atomic(path, body):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(path.name + '.tmp')
    temp.write_bytes(body)
    temp.replace(path)


def report(result, encoded):
    payload = result['payload']
    return {'status': 'refreshed', 'quote_date': payload['summary']['as_of'],
            'cpi_month': payload['data']['cpi']['release']['observation_month'],
            'access_date': result['config']['access_date'], 'accepted_before': result['accepted'],
            'rows': len(result['quotes']), 'bill_tenors': [bill['tenor_weeks'] for bill in payload['data']['bill_ladder']['bills']],
            'inputs': result['provenance'], 'warnings': result['warnings'],
            'sha256_data_js': hashlib.sha256(encoded).hexdigest()}


def write_outputs(result, out):
    """Write the coordinated set. data.js goes last, so the dashboard never pairs new data with old inputs."""
    payload, quotes, cpi = result['payload'], result['quotes'], result['payload']['data']['cpi']
    encoded = ('window.DASHBOARD_DATA = ' + json.dumps(payload, indent=2, allow_nan=False) + ';\n').encode()
    fields = list(quotes[0])  # same columns as calculations/rebuild.py
    files = {out / 'data' / 'raw' / name: body for name, body in result['raw'].items()}
    files[out / 'data' / 'quotes_normalized.csv'] = csv_bytes(fields, [[q[k] for k in fields] for q in quotes])
    files[out / 'data' / 'cpi_normalized.csv'] = csv_bytes(['observation_month', 'cpi_u_nsa_index', 'yoy_percent'],
                                                           zip(cpi['dates'], cpi['levels'], cpi['yoy_pct']))
    files[out / 'project.json'] = (json.dumps(result['config'], indent=2) + '\n').encode()
    files[out / 'refresh_report.json'] = (json.dumps(report(result, encoded), indent=2) + '\n').encode()
    files[out / 'data.js'] = encoded
    for path, body in files.items():
        write_atomic(path, body)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--date', type=date.fromisoformat, default=date.today(), help='as-of date, YYYY-MM-DD (default: today)')
    ap.add_argument('--sources', type=Path,
                    help=f'folder of manually downloaded treasury_<year>.xml files and {CPI_FILE} (default: download)')
    ap.add_argument('--out', type=Path, default=ROOT, help='output folder (default: this folder)')
    a = ap.parse_args()
    result = collect(a.date, a.sources)
    write_outputs(result, a.out)
    for warning in result['warnings']:
        print('WARNING: ' + warning, file=sys.stderr)
    print(json.dumps({'status': 'refreshed', 'out': a.out.name, 'quote_date': result['payload']['summary']['as_of'],
                      'cpi_month': result['config']['cpi_release']['observation_month'],
                      'bills': len(result['payload']['data']['bill_ladder']['bills']), 'warnings': len(result['warnings'])}))


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print('STOP: ' + str(exc), file=sys.stderr)
        sys.exit(1)
