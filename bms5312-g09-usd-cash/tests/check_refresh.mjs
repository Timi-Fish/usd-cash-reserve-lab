// Maintenance checks: refresh.py offline, the candidate review / release / restore steps of tools/candidate.py, and
// the payment-calendar logic in dashboard/src/ladder.js. Everything runs in a throwaway copy of the project ("lab")
// whose accepted version is the frozen 2026-10-26 release: tests/fixtures/data_2026-10-26.js and its raw inputs in
// tests/fixtures/inputs_2026-10-26/raw/, so the checks do not depend on the release in use. Deliberately broken inputs
// are marked FIXTURE. No network. The real project files are only read.
// Run: node tests/check_refresh.mjs (Node 18+, Python 3.10+). Writes evidence/refresh_checks.json; exits 1 on a failure.
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import vm from 'node:vm';
import crypto from 'node:crypto'; import {spawnSync} from 'node:child_process'; import {fileURLToPath} from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'usd-cash-refresh-'));
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
const writeData = (file, payload) => fs.writeFileSync(file, 'window.DASHBOARD_DATA = ' + JSON.stringify(payload, null, 2) + ';\n');
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const python = (script, args) => spawnSync('python3', ['-I', script, ...args], {encoding: 'utf8'});

// The lab: scripts from the project; raw snapshots, accepted data.js and project.json from the frozen release.
const frozenFile = path.join(project, 'tests', 'fixtures', 'data_2026-10-26.js');
const frozenInputs = path.join(project, 'tests', 'fixtures', 'inputs_2026-10-26', 'raw');
const frozen = readData(frozenFile);
const lab = path.join(tmp, 'lab');
for (const item of ['refresh.py', 'calculations', 'maintenance', 'tools', 'SOURCE_REGISTER.csv']) fs.cpSync(path.join(project, item), path.join(lab, item), {recursive: true});
fs.cpSync(frozenInputs, path.join(lab, 'data', 'raw'), {recursive: true});
fs.mkdirSync(path.join(lab, 'evidence'));
fs.rmSync(path.join(lab, 'maintenance', 'release_log.csv'), {force: true});
fs.copyFileSync(frozenFile, path.join(lab, 'data.js'));
fs.writeFileSync(path.join(lab, 'project.json'), JSON.stringify(frozen.data.config, null, 2) + '\n');
const sources = (name, edit) => {
  const dir = path.join(tmp, name);
  fs.cpSync(path.join(lab, 'data', 'raw'), dir, {recursive: true});
  if (edit) edit(dir);
  return dir;
};
const editCpi = (dir, change) => {
  const file = path.join(dir, 'cpi_2023_2026.json');
  const response = JSON.parse(fs.readFileSync(file, 'utf8'));
  change(response);
  fs.writeFileSync(file, JSON.stringify(response));
};
const refresh = (name, sourceDir, date) => {
  const out = path.join(tmp, name);
  return {out, ...python(path.join(lab, 'refresh.py'), ['--sources', sourceDir, '--date', date, '--out', out])};
};

// Part 1: refresh.py offline. The same inputs and dates must reproduce the frozen release and the rebuild route.
const rebuilt = path.join(tmp, 'rebuilt');
python(path.join(lab, 'calculations', 'rebuild.py'), ['--input', path.join(lab, 'data'), '--config', path.join(lab, 'project.json'), '--out', rebuilt]);
const same = refresh('same', sources('same-sources'), '2026-10-27');
check('offline refresh exits 0', () => same.status, 0);
const refreshed = readData(path.join(same.out, 'data.js'));
check('same inputs reproduce the frozen data.js exactly', () => JSON.stringify(refreshed) === JSON.stringify(frozen));
check('same inputs reproduce the frozen project settings', () =>
  JSON.stringify(JSON.parse(fs.readFileSync(path.join(same.out, 'project.json'), 'utf8'))) === JSON.stringify(frozen.data.config));
for (const name of ['quotes_normalized.csv', 'cpi_normalized.csv'])
  check(`refresh and rebuild write the same ${name} byte for byte`, () =>
    fs.readFileSync(path.join(same.out, 'data', name)).equals(fs.readFileSync(path.join(rebuilt, name))));
check('the bill ladder carries every tenor in the source row', () => refreshed.data.bill_ladder.bills.map(b => b.tenor_weeks), [4, 6, 8, 13, 17, 26, 52]);
check('the report records file names, never local paths', () =>
  JSON.parse(fs.readFileSync(path.join(same.out, 'refresh_report.json'), 'utf8')).inputs.every(i => i.origin === 'manual file ' + i.file));

const brokenBls = refresh('broken-bls', sources('broken-bls-sources', dir => editCpi(dir, r => { r.status = 'REQUEST_NOT_PROCESSED'; })), '2026-10-27');
check('FIXTURE failed BLS request stops with exit 1 and writes no data set', () =>
  [brokenBls.status, brokenBls.stderr.startsWith('STOP:'), fs.existsSync(path.join(brokenBls.out, 'data.js'))], [1, true, false]);
const older = refresh('older', sources('older-sources'), '2026-10-23');
check('quotes older than the accepted release stop the refresh', () => [older.status, older.stderr.includes('before the accepted')], [1, true]);
// FIXTURE: an October 2026 CPI row the BLS had not released by 2026-10-27; the schedule must hold CPI at September.
const early = refresh('early-cpi', sources('early-cpi-sources', dir => editCpi(dir, r => {
  const series = r.Results.series[0];
  series.data = [{year: '2026', period: 'M10', periodName: 'October', value: '337.500', footnotes: [{}]},
    ...series.data.filter(x => !(x.year === '2026' && x.period === 'M10'))];
})), '2026-10-27');
check('CPI without a past release date is held back with a warning', () =>
  [early.status, readData(path.join(early.out, 'data.js')).data.cpi.release.observation_month, early.stderr.includes('WARNING: CPI 2026-10')],
  [0, '2026-09', true]);

// FIXTURE: a basis-points setting (Task B input). It must stop before any source is read; the source folder does not exist.
fs.copyFileSync(path.join(lab, 'maintenance', 'invalid_unit_config.json'), path.join(lab, 'project.json'));
const unit = refresh('bad-unit', path.join(tmp, 'no-such-folder'), '2026-10-27');
check('an incompatible unit setting stops before any download', () =>
  [unit.status, unit.stderr.trim(), fs.existsSync(unit.out)], [1, 'STOP: Incompatible input unit', false]);
fs.writeFileSync(path.join(lab, 'project.json'), JSON.stringify(frozen.data.config, null, 2) + '\n');

// Part 2: review, release and restore. The lab's accepted version becomes the 2026-10-23 baseline (the 2026-10-26
// observation withheld); the candidate is the offline refresh that adds it back.
const tool = args => python(path.join(lab, 'tools', 'candidate.py'), args);
const base = path.join(tmp, 'base');
python(path.join(lab, 'calculations', 'rebuild.py'), ['--input', path.join(lab, 'data'), '--config', path.join(lab, 'maintenance', 'baseline_config.json'), '--out', base]);
fs.copyFileSync(path.join(base, 'data.js'), path.join(lab, 'data.js'));
fs.copyFileSync(path.join(lab, 'maintenance', 'baseline_config.json'), path.join(lab, 'project.json'));
for (const name of ['quotes_normalized.csv', 'cpi_normalized.csv']) fs.copyFileSync(path.join(base, name), path.join(lab, 'data', name));
const candidate = path.join(lab, 'candidate');
python(path.join(lab, 'refresh.py'), ['--sources', sources('withheld-sources'), '--date', '2026-10-27', '--out', candidate]);
const review = tool(['review']);
check('review passes a newer, reproducible candidate', () => [review.status, review.stdout.includes('AI pre-review: PASS')], [0, true]);
check('review shows the quote date before and after', () => review.stdout.includes('| Latest Treasury quote date | 2026-10-23 | 2026-10-26 | yes |'));
check('review gives the Treasury page for the quote year and saves its report', () =>
  [review.stdout.includes('field_tdr_date_value=2026 and find the row dated 2026-10-26'), fs.existsSync(path.join(candidate, 'review.md'))], [true, true]);
check('review leaves the accepted data.js untouched', () => sha(path.join(lab, 'data.js')), sha(path.join(base, 'data.js')));
const released = tool(['release', '--decision', 'Test reviewer accepted after checking the 2026-10-26 Treasury row']);
check('release installs the candidate and keeps the old version', () =>
  [released.status, sha(path.join(lab, 'data.js')) === sha(path.join(candidate, 'data.js')), sha(path.join(lab, 'previous', 'data.js')) === sha(path.join(base, 'data.js'))],
  [0, true, true]);
const logLines = () => fs.readFileSync(path.join(lab, 'maintenance', 'release_log.csv'), 'utf8').trim().split('\n');
check('release records the decision and the evidence', () =>
  [logLines().length, logLines()[1].includes(',release,2026-10-23,2026-10-26,'), fs.existsSync(path.join(lab, 'evidence', 'release_review.md'))], [2, true, true]);
const register = () => fs.readFileSync(path.join(lab, 'SOURCE_REGISTER.csv'), 'utf8');
check('release moves the source register to the new quote date and access date', () =>
  [register().includes('2024-01-02 to 2026-10-26,2026-10-27'), register().includes('2023-01 to 2026-09,2026-10-27')], [true, true]);
const again = tool(['review']);
check('a second review finds nothing newer and stops', () => [again.status, again.stderr.includes('no newer observation')], [1, true]);
const restored = tool(['restore', '--decision', 'Test reviewer restored the previous version']);
check('restore puts the previous version back, with its register dates, and logs it', () =>
  [restored.status, sha(path.join(lab, 'data.js')) === sha(path.join(base, 'data.js')), register().includes('2024-01-02 to 2026-10-23,2026-10-27'), logLines().length],
  [0, true, true, 3]);
const candidateFile = path.join(candidate, 'data.js');
const good = readData(candidateFile);
writeData(candidateFile, {...good, data: {...good.data, bill_ladder: undefined}});  // FIXTURE: a field dropped
const dropped = tool(['review']);
check('FIXTURE a dropped field stops the review', () => [dropped.status, dropped.stderr.includes('removed or renamed: data.js.data.bill_ladder')], [1, true]);
check('release refuses a candidate whose review stops', () =>
  [tool(['release', '--decision', 'Test reviewer']).status, sha(path.join(lab, 'data.js')) === sha(path.join(base, 'data.js'))], [1, true]);
writeData(candidateFile, {...good, summary: {...good.summary, headline: good.summary.headline + ' Edited.'}});  // FIXTURE: an edited value
check('FIXTURE a hand-edited value stops the review', () => tool(['review']).stderr.includes('does not match a rebuild'));
check('reject records the decision and changes nothing', () =>
  [tool(['reject', '--decision', 'Test reviewer rejected: headline edited by hand']).status, logLines().length, logLines()[3].includes(',reject,'),
    sha(path.join(lab, 'data.js')) === sha(path.join(base, 'data.js'))], [0, 4, true, true]);

// Part 3: calendar logic on the frozen bill ladder (quote date 2026-10-26).
const ctx = vm.createContext({URL});
vm.runInContext(fs.readFileSync(path.join(project, 'dashboard', 'src', 'ladder.js'), 'utf8'), ctx);
const L = vm.runInContext('Ladder', ctx);
const ladder = L.checkBills(frozen.data.bill_ladder);
const day = L.dayNumber;
const fitOf = date => { const f = L.fit(ladder, day(date)); return [f.kind, f.before && f.before.name, f.wait, f.after && f.after.name, f.late]; };
check('cash date 2027-03-01 fits the 17-week bill, 6 days early', () => fitOf('2027-03-01'), ['early', '17-week', 6, '26-week', 59]);
check('maturity on the payment date is a same-day match', () => fitOf('2027-01-28'), ['same', '13-week', 0, '17-week', 26]);
check('a date before the shortest maturity has no fit', () => fitOf('2026-11-10'), ['none', null, null, '4-week', 14]);
check('a date after the longest maturity has no later bill', () => fitOf('2027-10-30'), ['early', '52-week', 30, null, null]);
const entry = (label, date, type = 'fixed') => ({label, date, type});
check('rejects a date on the saved quote date', () => failure(() => L.checkEntry(entry('Tax', '2026-10-26'), ladder, [])), 'date');
check('rejects a rolled-over date', () => failure(() => L.checkEntry(entry('Tax', '2027-02-30'), ladder, [])), 'date');
check('rejects a date beyond the calendar range', () => failure(() => L.checkEntry(entry('Tax', '2027-12-01'), ladder, [])), 'date');
check('rejects an empty name', () => failure(() => L.checkEntry(entry('  ', '2027-01-15'), ladder, [])), 'label');
check('rejects an inherited property as a payment type', () => failure(() => L.checkEntry(entry('Tax', '2027-01-15', 'constructor'), ladder, [])), 'type');
check('rejects a thirteenth date', () => failure(() => L.checkEntry(entry('Tax', '2027-01-15'), ladder, Array(12).fill({}))), 'count');
const mutated = change => { const copy = structuredClone(frozen.data.bill_ladder); change(copy); return failure(() => L.checkBills(copy)); };
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

fs.rmSync(tmp, {recursive: true, force: true});
const report = {date: new Date().toISOString().slice(0, 10), environment: 'python3 -I subprocesses in a throwaway project copy; Node VM for ladder.js; no network',
  frozen_fixture: 'tests/fixtures/data_2026-10-26.js', frozen_inputs: 'tests/fixtures/inputs_2026-10-26/raw/', checks: rows, all_pass: rows.every(r => r.pass)};
fs.writeFileSync(path.join(project, 'evidence', 'refresh_checks.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({checks: rows.length, all_pass: report.all_pass, failures: rows.filter(r => !r.pass)}, null, 1));
if (!report.all_pass) process.exit(1);
