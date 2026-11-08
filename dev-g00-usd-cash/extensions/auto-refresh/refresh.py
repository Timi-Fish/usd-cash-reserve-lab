#!/usr/bin/env python3
"""Automatic refresh for the USD Cash Reserve Lab: download the official inputs, validate them with the
accepted rebuild rules, then write a dashboard data set and the bill ladder used by the liquidity calendar.
Python 3.10+ standard library only. Output contract: extensions/INTERFACES.md."""
import argparse, csv, hashlib, importlib.util, io, json, math, re, shutil, sys, tempfile, urllib.parse, urllib.request
import xml.etree.ElementTree as ET
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
# The project root is the nearest folder holding the accepted rebuild route, so this file also works when copied there.
ROOT = next(p for p in Path(__file__).resolve().parents if (p / 'calculations' / 'rebuild.py').is_file())
# At the root, follow the course rule and write beside the script; anywhere else, never touch accepted files.
DEFAULT_OUT = ROOT if HERE == ROOT else HERE / 'candidate'
DEFAULT_LADDER = ROOT / 'extensions' / 'liquidity-calendar' / 'bills.js'
SCHEDULE = ROOT / 'extensions' / 'auto-refresh' / 'cpi_release_schedule.csv'
TREASURY_XML = ('https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml'
                '?data=daily_treasury_bill_rates&field_tdr_date_value={year}')
TREASURY_PAGE = ('https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView'
                 '?type=daily_treasury_bill_rates&field_tdr_date_value={year}')
TREASURY_TERMS = 'https://catalog.data.gov/dataset/interest-rate-statistics-daily-treasury-bill-rates'
BLS_JSON = 'https://api.bls.gov/publicAPI/v2/timeseries/data/CUUR0000SA0?startyear=2023&endyear={year}'
CPI_FILE = 'cpi_2023_2026.json'  # name fixed by calculations/rebuild.py; the content runs from 2023 to the current year
USER_AGENT = 'usd-cash-reserve-lab-refresh/1.0 (educational dashboard)'
TIMEOUT_SECONDS = 60
REFRESH = {'mode': 'automatic', 'cadence': 'daily'}
LADDER_SCHEMA = 'usd-cash-reserve-lab/bill-ladder/v1'


def load_rebuild():
    sys.dont_write_bytecode = True  # importing rebuild.py must not add __pycache__ to the accepted folder
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
    return lambda name, url: ((sources / name).read_bytes(), str(sources / name))


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


def point_treasury_links(sources, year):
    """rebuild.py writes a fixed-year Treasury page link; point it at the year of the latest quote."""
    return [{**s, 'url': TREASURY_PAGE.format(year=year)} if urllib.parse.urlsplit(s['url']).path.endswith('/TextView') else s
            for s in sources]


def bill_ladder(raw, quote_date):
    """Every bill tenor quoted on the latest date; the dashboard itself shows only 13 and 26 weeks."""
    rows = [{x.tag.split('}')[-1]: x.text for x in prop} for path in sorted(raw.glob('treasury_*.xml'))
            for prop in ET.parse(path).findall('.//m:properties', rebuild.NS)]
    matches = [row for row in rows if row['INDEX_DATE'][:10] == quote_date]
    if len(matches) != 1:
        raise ValueError('Expected one Treasury row for ' + quote_date)
    row, start = matches[0], date.fromisoformat(quote_date)
    tenors = sorted(int(m.group(1)) for key in row if (m := re.fullmatch(r'ROUND_B1_CLOSE_(\d+)WK_2', key)))
    bills = [ladder_bill(row, weeks, start) for weeks in tenors]
    if len(bills) < 2 or len({bill['cusip'] for bill in bills}) != len(bills):
        raise ValueError('Missing or duplicate bill securities on ' + quote_date)
    return bills


def ladder_bill(row, weeks, start):
    try:
        maturity = date.fromisoformat(row[f'MATURITY_DATE_{weeks}WK'][:10])
        discount, coupon = float(row[f'ROUND_B1_CLOSE_{weeks}WK_2']), float(row[f'ROUND_B1_YIELD_{weeks}WK_2'])
        cusip = row[f'CUSIP_{weeks}WK']
    except (KeyError, TypeError, ValueError) as exc:
        raise ValueError(f'Missing or malformed {weeks}-week bill fields') from exc
    days = (maturity - start).days
    if not (cusip and math.isfinite(discount) and math.isfinite(coupon) and -5 <= discount <= 30 and 1 <= days <= 7 * weeks + 14):
        raise ValueError(f'Invalid {weeks}-week bill quote')
    return {'tenor_weeks': weeks, 'cusip': cusip, 'maturity_date': maturity.isoformat(), 'days': days,
            'discount_pct': discount, 'coupon_equivalent_pct': coupon}


def check_ladder(bills, instruments):
    """The ladder and the dashboard must describe the same 13- and 26-week securities."""
    by_tenor = {bill['tenor_weeks']: bill for bill in bills}
    for item in instruments:
        bill = by_tenor.get(item['weeks'])
        if bill is None or (bill['cusip'], bill['maturity_date'], bill['discount_pct']) != (
                item['cusip'], item['maturity_date'], item['discount_pct']):
            raise ValueError(f"Bill ladder disagrees with the dashboard {item['weeks']}-week reference")


def collect(today, sources=None):
    """Fetch, validate and assemble one coordinated release. Raises on any failed check and writes nothing."""
    warnings, schedule = [], load_schedule()
    with tempfile.TemporaryDirectory() as tmp:
        work = Path(tmp)
        provenance = gather(work / 'raw', today, fetcher(sources))
        cpi, quotes = rebuild.read_inputs(work, today.isoformat())
        month = choose_cpi_month(cpi, schedule, today, warnings)
        config = candidate_config(today, quotes[-1]['date'], month, schedule)
        payload, quotes = rebuild.build(work, config)
        payload['summary']['refresh'] = dict(REFRESH)
        quote_year = date.fromisoformat(payload['summary']['as_of']).year
        payload['data']['sources'] = point_treasury_links(payload['data']['sources'], quote_year)
        accepted = accepted_summary()
        check_progress(payload, accepted)
        bills = bill_ladder(work / 'raw', payload['summary']['as_of'])
        check_ladder(bills, payload['data']['instruments'])
        raw = {path.name: path.read_bytes() for path in sorted((work / 'raw').iterdir())}
    if payload['data']['freshness']['stale_at_build']:
        warnings.append('The newest official observations are already stale under the project age rules')
    ladder = {'schema': LADDER_SCHEMA, 'quote_date': payload['summary']['as_of'], 'access_date': today.isoformat(),
              'freshness_days': config['freshness']['quote_days'], 'bills': bills,
              'source': {'provider': 'U.S. Treasury Office of Debt Management',
                         'dataset': 'Daily Treasury Bill Rates (015-DO-021)', 'url': TREASURY_PAGE.format(year=quote_year),
                         'fields': 'ROUND_B1_CLOSE_<N>WK_2 bank discount (percent); ROUND_B1_YIELD_<N>WK_2; MATURITY_DATE_<N>WK; CUSIP_<N>WK',
                         'terms_url': TREASURY_TERMS, 'permission_basis': 'CC0 in Data.gov dataset metadata; attribution retained'},
              'disclaimer': rebuild.DISCLAIMER}
    return {'payload': payload, 'quotes': quotes, 'config': config, 'ladder': ladder, 'raw': raw,
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
            'rows': len(result['quotes']), 'bill_tenors': [bill['tenor_weeks'] for bill in result['ladder']['bills']],
            'inputs': result['provenance'], 'warnings': result['warnings'],
            'sha256_data_js': hashlib.sha256(encoded).hexdigest()}


def write_outputs(result, out, ladder_out):
    """Write the coordinated set. data.js goes last, so the dashboard never pairs new data with old inputs."""
    payload, quotes, cpi = result['payload'], result['quotes'], result['payload']['data']['cpi']
    encoded = ('window.DASHBOARD_DATA = ' + json.dumps(payload, indent=2, allow_nan=False) + ';\n').encode()
    fields = list(quotes[0])  # same columns as calculations/rebuild.py
    files = {out / 'data' / 'raw' / name: body for name, body in result['raw'].items()}
    files[out / 'data' / 'quotes_normalized.csv'] = csv_bytes(fields, [[q[k] for k in fields] for q in quotes])
    files[out / 'data' / 'cpi_normalized.csv'] = csv_bytes(['observation_month', 'cpi_u_nsa_index', 'yoy_percent'],
                                                           zip(cpi['dates'], cpi['levels'], cpi['yoy_pct']))
    files[out / 'project.json'] = (json.dumps(result['config'], indent=2) + '\n').encode()
    files[ladder_out] = ('window.BILL_LADDER_DATA = ' + json.dumps(result['ladder'], indent=2, allow_nan=False) + ';\n').encode()
    files[out / 'refresh_report.json'] = (json.dumps(report(result, encoded), indent=2) + '\n').encode()
    files[out / 'data.js'] = encoded
    for path, body in files.items():
        write_atomic(path, body)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--date', type=date.fromisoformat, default=date.today(), help='as-of date, YYYY-MM-DD (default: today)')
    ap.add_argument('--sources', type=Path,
                    help=f'folder of manually downloaded treasury_<year>.xml files and {CPI_FILE} (default: download)')
    ap.add_argument('--out', type=Path, default=DEFAULT_OUT, help='dashboard output folder (default: %(default)s)')
    ap.add_argument('--ladder-out', type=Path, default=DEFAULT_LADDER, help='calendar bill file (default: %(default)s)')
    a = ap.parse_args()
    result = collect(a.date, a.sources)
    write_outputs(result, a.out, a.ladder_out)
    for warning in result['warnings']:
        print('WARNING: ' + warning, file=sys.stderr)
    print(json.dumps({'status': 'refreshed', 'out': str(a.out), 'quote_date': result['payload']['summary']['as_of'],
                      'cpi_month': result['config']['cpi_release']['observation_month'],
                      'bills': len(result['ladder']['bills']), 'warnings': len(result['warnings'])}))


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print('STOP: ' + str(exc), file=sys.stderr)
        sys.exit(1)
