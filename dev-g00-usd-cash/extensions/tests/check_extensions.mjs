// Extension checks: refresh.py run offline against the accepted snapshots, then the calendar logic in ladder.js.
// Inputs are copies of data/raw plus deliberately broken copies (marked FIXTURE) in a temp folder. No network;
// accepted project files are only read. Run: node extensions/tests/check_extensions.mjs (Node 18+, Python 3.10+).
// Writes extensions/evidence/extension_checks.json and exits 1 if any check fails.
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import vm from 'node:vm';
import {spawnSync} from 'node:child_process'; import {fileURLToPath} from 'node:url';

const ext = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(ext, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'usd-cash-extensions-'));
const rows = [];
function check(id, fn, expected = true) {
  try {
    const actual = fn();
    rows.push({id, expected, actual, pass: JSON.stringify(actual) === JSON.stringify(expected)});
  } catch (error) {
    rows.push({id, expected, error: error.message, pass: false});
  }
}
const failure = fn => { try { fn(); return 'no error'; } catch (error) { return error.field === undefined ? 'error' : error.field; } };
const readData = file => { const text = fs.readFileSync(file, 'utf8').trim(); return JSON.parse(text.slice(text.indexOf('=') + 1, -1)); };
const sources = (name, edit) => {
  const dir = path.join(tmp, name);
  fs.cpSync(path.join(root, 'data', 'raw'), dir, {recursive: true});
  if (edit) edit(dir);
  return dir;
};
const editCpi = (dir, change) => {
  const file = path.join(dir, 'cpi_2023_2026.json');
  const response = JSON.parse(fs.readFileSync(file, 'utf8'));
  change(response);
  fs.writeFileSync(file, JSON.stringify(response));
};
function refresh(name, sourceDir, date) {
  const out = path.join(tmp, name);
  fs.mkdirSync(out);
  fs.writeFileSync(path.join(out, 'bills.js'), 'previous bill file\n');
  const run = spawnSync('python3', ['-I', path.join(ext, 'auto-refresh', 'refresh.py'), '--sources', sourceDir, '--date', date,
    '--out', out, '--ladder-out', path.join(out, 'bills.js')], {encoding: 'utf8'});
  return {out, status: run.status, stdout: run.stdout, stderr: run.stderr};
}

// Part 1: refresh.py offline. Same inputs and dates as the accepted release must reproduce it.
const accepted = readData(path.join(root, 'data.js'));
const same = refresh('same-inputs', sources('same-sources'), '2026-10-27');
check('offline refresh exits 0', () => same.status, 0);
const refreshed = readData(path.join(same.out, 'data.js'));
check('refresh marks the data set automatic', () => refreshed.summary.refresh, {mode: 'automatic', cadence: 'daily'});
check('same inputs reproduce accepted data.js apart from the refresh flag', () => {
  const copy = structuredClone(refreshed);
  copy.summary.refresh = accepted.summary.refresh;
  return JSON.stringify(copy) === JSON.stringify(accepted);
});
check('same inputs reproduce the accepted project.json', () =>
  JSON.stringify(JSON.parse(fs.readFileSync(path.join(same.out, 'project.json'), 'utf8'))) ===
  JSON.stringify(JSON.parse(fs.readFileSync(path.join(root, 'project.json'), 'utf8'))));
for (const name of ['quotes_normalized.csv', 'cpi_normalized.csv'])
  check(`same inputs reproduce accepted ${name} byte for byte`, () =>
    fs.readFileSync(path.join(same.out, 'data', name)).equals(fs.readFileSync(path.join(root, 'data', name))));
const ladderData = readData(path.join(same.out, 'bills.js'));
check('bill ladder carries every tenor in the source row', () => ladderData.bills.map(b => b.tenor_weeks), [4, 6, 8, 13, 17, 26, 52]);
check('bill ladder 13- and 26-week entries match the dashboard instruments', () => accepted.data.instruments.every(item => {
  const bill = ladderData.bills.find(b => b.tenor_weeks === item.weeks);
  return bill.cusip === item.cusip && bill.maturity_date === item.maturity_date && bill.discount_pct === item.discount_pct;
}));

const brokenBls = refresh('broken-bls', sources('broken-bls-sources', dir => editCpi(dir, r => { r.status = 'REQUEST_NOT_PROCESSED'; })), '2026-10-27');
check('FIXTURE failed BLS request stops with exit 1', () => [brokenBls.status, brokenBls.stderr.startsWith('STOP:')], [1, true]);
check('a stopped refresh writes no data set and keeps the old bill file', () =>
  [fs.existsSync(path.join(brokenBls.out, 'data.js')), fs.readFileSync(path.join(brokenBls.out, 'bills.js'), 'utf8')], [false, 'previous bill file\n']);
const older = refresh('older', sources('older-sources'), '2026-10-23');
check('quotes older than the accepted release stop the refresh', () => [older.status, older.stderr.includes('before the accepted')], [1, true]);
// FIXTURE: an October 2026 CPI row the BLS had not released by 2026-10-27; the schedule must hold CPI at September.
const early = refresh('early-cpi', sources('early-cpi-sources', dir => editCpi(dir, r => r.Results.series[0].data.unshift(
  {year: '2026', period: 'M10', periodName: 'October', value: '337.500', footnotes: [{}]}))), '2026-10-27');
check('CPI without a past release date is held back with a warning', () =>
  [early.status, readData(path.join(early.out, 'data.js')).data.cpi.release.observation_month, early.stderr.includes('WARNING: CPI 2026-10')],
  [0, '2026-09', true]);

// Part 2: calendar logic, on the ladder just rebuilt from the accepted snapshot (quote date 2026-10-26).
const ctx = vm.createContext({URL});
vm.runInContext(fs.readFileSync(path.join(ext, 'liquidity-calendar', 'ladder.js'), 'utf8'), ctx);
const L = vm.runInContext('Ladder', ctx);
const ladder = L.checkBills(ladderData);
const day = L.dayNumber;
const fitOf = date => { const f = L.fit(ladder, day(date)); return [f.kind, f.before && f.before.name, f.wait, f.after && f.after.name, f.late]; };
check('README cash date 2027-03-01 fits the 17-week bill, 6 days early', () => fitOf('2027-03-01'), ['early', '17-week', 6, '26-week', 59]);
check('maturity on the payment date is a same-day match', () => fitOf('2027-01-28'), ['same', '13-week', 0, '17-week', 26]);
check('a date before the shortest maturity has no fit', () => fitOf('2026-11-10'), ['none', null, null, '4-week', 14]);
check('a date after the longest maturity has no later bill', () => fitOf('2027-10-30'), ['early', '52-week', 30, null, null]);
const entry = (label, date, type = 'fixed') => ({label, date, type});
check('rejects a date on the saved quote date', () => failure(() => L.checkEntry(entry('Tax', '2026-10-26'), ladder, [])), 'date');
check('rejects a rolled-over date', () => failure(() => L.checkEntry(entry('Tax', '2027-02-30'), ladder, [])), 'date');
check('rejects a date beyond the calendar range', () => failure(() => L.checkEntry(entry('Tax', '2027-12-01'), ladder, [])), 'date');
check('rejects an empty name', () => failure(() => L.checkEntry(entry('  ', '2027-01-15'), ladder, [])), 'label');
check('rejects an inherited property as an amount type', () => failure(() => L.checkEntry(entry('Tax', '2027-01-15', 'constructor'), ladder, [])), 'type');
check('rejects a thirteenth date', () => failure(() => L.checkEntry(entry('Tax', '2027-01-15'), ladder, Array(12).fill({}))), 'count');
const mutated = change => { const copy = structuredClone(ladderData); change(copy); return failure(() => L.checkBills(copy)); };
check('bill data with a day-count mismatch is rejected', () => mutated(d => { d.bills[0].days += 1; }), 'error');
check('bill data with a repeated security is rejected', () => mutated(d => { d.bills[1].cusip = d.bills[0].cusip; }), 'error');
check('bill data without an https source is rejected', () => mutated(d => { d.source.url = 'http://example.org'; }), 'error');
const status = date => { const f = L.freshness(ladder, day(date)); return [f.state, f.matured.map(b => b.name), f.warn]; };
check('quotes 7 days old are within the limit', () => status('2026-11-02'), ['fresh', [], false]);
check('quotes 8 days old are stale', () => status('2026-11-03'), ['stale', [], true]);
check('a device date before the quote is flagged', () => status('2026-10-25'), ['clock', [], true]);
check('matured references are listed as historical', () => status('2026-12-01'), ['stale', ['4-week'], true]);
check('calendar spans the quote month to about six months out', () => L.calendarMonths(ladder, []).map(m => m.key),
  ['2026-10', '2026-11', '2026-12', '2027-01', '2027-02', '2027-03', '2027-04']);
check('calendar weeks start on Monday', () => L.calendarMonths(ladder, [])[0].weeks[0], [null, null, null, day('2026-10-01'), day('2026-10-02'), day('2026-10-03'), day('2026-10-04')]);
check('calendar extends to the latest payment', () => L.calendarMonths(ladder, [{day: day('2027-09-01')}]).at(-1).key, '2027-09');
const entries = [{...L.checkEntry(entry('Tuition', '2027-03-01'), ladder, []), id: 1}, {...L.checkEntry(entry('Budget', '2027-01-28', 'budget'), ladder, []), id: 2}];
const summary = L.summaryLines(ladder, entries, day('2026-10-27'));
check('summary lists payments by date with the same fit text as the page', () =>
  [summary[3].endsWith(L.fitText(L.fit(ladder, day('2027-01-28')))), summary[4].endsWith(L.fitText(L.fit(ladder, day('2027-03-01'))))], [true, true]);
check('summary carries data status, confirmations and the disclaimer', () =>
  [summary[2], summary.includes(L.CONFIRM), summary.at(-1)],
  ['Data status on 2026-10-27: 1 day old, within the 7-day project limit.', true, 'Educational project. Not investment advice.']);
check('summary explains only the amount types in use', () => L.summaryLines(ladder, entries.slice(0, 1), day('2026-10-27')).filter(line => line.startsWith('Price-sensitive budget:')).length, 0);
check('summary without payments says so', () => L.summaryLines(ladder, [], day('2026-10-27')).includes('No payment dates entered.'));

fs.rmSync(tmp, {recursive: true, force: true});
const report = {date: new Date().toISOString().slice(0, 10), environment: 'Node VM for ladder.js; python3 -I subprocesses for refresh.py; no network',
  checks: rows, all_pass: rows.every(r => r.pass)};
fs.mkdirSync(path.join(ext, 'evidence'), {recursive: true});
fs.writeFileSync(path.join(ext, 'evidence', 'extension_checks.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({checks: rows.length, all_pass: report.all_pass, failures: rows.filter(r => !r.pass)}, null, 1));
if (!report.all_pass) process.exit(1);
