// Salt dashboard model checks: the arithmetic must reproduce the results saved in data.js, and the data reading,
// freshness, history window, formats and discussion summary must follow the accepted dashboard's rules.
// Run: npm run check (Node 18+). Writes extensions/evidence/salt_model_checks.json and exits 1 on any failure.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {freshness, historyWindow, readDashboard, scenario} from '../src/model.js';
import {changeText, pct, signedUsd} from '../src/format.js';
import {evaluate, summaryLines} from '../src/summary.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(here, '../../..');
const L = globalThis.Ladder;
const rows = [];
function check(id, fn, expected = true) {
  try {
    const actual = fn();
    rows.push({id, expected, actual, pass: JSON.stringify(actual) === JSON.stringify(expected)});
  } catch (error) {
    rows.push({id, expected, error: error.message, pass: false});
  }
}
const throws = fn => { try { fn(); return false; } catch { return true; } };
const readData = file => { const text = fs.readFileSync(file, 'utf8').trim(); return JSON.parse(text.slice(text.indexOf('=') + 1, -1)); };
const payload = readData(path.join(project, 'data.js'));
const dash = readDashboard(payload.summary, payload.data);
const day = L.dayNumber;

const FIELDS = {pricePer100: 'price_per_100', nominalReturnPct: 'nominal_return_pct', periodInflationPct: 'period_inflation_pct',
  realReturnPct: 'real_return_pct', nominalEnd: 'nominal_end', realEnd: 'real_end', realChange: 'real_change',
  breakEvenPct: 'break_even_annual_pct', zeroInterestRealEnd: 'zero_interest_real_end', nominalInterest: 'nominal_interest',
  purchasingPowerAdjustment: 'purchasing_power_adjustment', cashAdvantage: 'cash_advantage'};
for (const q of dash.instruments) {
  const mine = scenario(payload.data.config.default_principal, q.discount, q.days, payload.data.config.default_inflation_pct);
  check(`${q.name} default scenario reproduces every saved result`, () =>
    Object.entries(FIELDS).filter(([k, saved]) => Math.abs(mine[k] - q.saved[saved]) > 1e-9).map(([k]) => k), []);
  check(`${q.name} higher inflation lowers purchasing power, not nominal proceeds`, () => {
    const at3 = scenario(100000, q.discount, q.days, 3), at6 = scenario(100000, q.discount, q.days, 6);
    return [at6.nominalEnd === at3.nominalEnd, at6.realEnd < at3.realEnd];
  }, [true, true]);
  check(`${q.name} decomposition adds up`, () => {
    const s = scenario(100000, q.discount, q.days, -2);
    return Math.abs(100000 + s.nominalInterest - s.purchasingPowerAdjustment - s.realEnd) < 1e-8;
  });
  check(`${q.name} break-even inflation leaves purchasing power unchanged`, () => {
    const s = scenario(100000, q.discount, q.days, scenario(100000, q.discount, q.days, 3).breakEvenPct);
    return Math.abs(s.realChange) < 0.01;
  });
}
check('rejects zero, oversized and non-numeric amounts', () => [0, 100000001, NaN].map(p => throws(() => scenario(p, 4, 94, 3))), [true, true, true]);
check('rejects inflation outside -5% to 15%', () => [-5.1, 15.1].map(a => throws(() => scenario(100000, 4, 94, a))), [true, true]);
const broken = change => { const copy = structuredClone(payload); change(copy.data, copy.summary); return throws(() => readDashboard(copy.summary, copy.data)); };
check('rejects a day count that disagrees with the dates', () => broken(d => { d.instruments[0].days += 1; }));
check('rejects a missing tenor', () => broken(d => { d.instruments[1].weeks = 13; }));
check('rejects a unit change', () => broken(d => { d.config.rate_unit = 'basis-points'; }));
check('rejects a changed disclaimer', () => broken((d, s) => { s.disclaimer = 'Not advice.'; }));
check('rejects CPI metadata that disagrees with the series', () => broken(d => { d.cpi.release.observation_month = '2026-08'; }));
const windowOf = choice => { const w = historyWindow(dash, choice); return [w.start, w.end, w.rows.length]; };
check('12-month window', () => windowOf('12'), ['2025-11', '2026-10', 12]);
check('24-month window', () => windowOf('24'), ['2024-11', '2026-10', 24]);
check('full window', () => windowOf('all').slice(0, 2), ['2023-01', '2026-10']);
check('October 2025 CPI stays missing', () => historyWindow(dash, '24').rows.find(r => r.month === '2025-10').cpi.level, null);
check('the newest month has no CPI yet', () => historyWindow(dash, '12').rows.at(-1).cpi, null);
const status = date => { const f = freshness(dash, day(date)); return [f.state, f.matured.map(q => q.name)]; };
check('fresh within seven days', () => status('2026-11-02'), ['fresh', []]);
check('stale after seven days', () => status('2026-11-03'), ['stale', []]);
check('device clock before the quote', () => status('2026-10-25'), ['clock', []]);
check('matured reference is historical', () => status('2027-02-01'), ['stale', ['13-week']]);
check('near-zero values show as zero', () => [pct(-0.00001), signedUsd(-0.001, 2), changeText(0.1)],
  ['0.00%', '$0.00', 'Purchasing power is approximately unchanged.']);
const ladder = L.checkBills(readData(path.join(project, 'extensions', 'liquidity-calendar', 'bills.js')));
const assumptions = {principal: 100000, weeks: 13, inflation: 3};
const payments = [{...L.checkEntry({label: 'Tuition', date: '2027-03-01', type: 'fixed'}, ladder, []), id: 1}];
const lines = summaryLines(dash, assumptions, payments, ladder, day('2026-10-27'));
check('summary states the selected outcome at maturity', () => lines.some(l => l.includes('nominal proceeds $101,069 on that date') && l.includes('purchasing power $100,302')));
check('summary uses the calendar fit text for payments', () => lines.some(l => l.endsWith(L.fitText(L.fit(ladder, day('2027-03-01'))))));
check('summary separates maturity amounts from payment dates and ends with the disclaimer', () =>
  [lines.some(l => l.includes('not on a payment date')), lines.at(-1)], [true, 'Educational project. Not investment advice.']);
const invalid = summaryLines(dash, {...assumptions, principal: 0}, [], ladder, day('2026-10-27'));
check('invalid inputs show no outcome', () => [invalid.some(l => l.startsWith('Assumptions incomplete')), invalid.some(l => l.includes('nominal proceeds'))], [true, false]);
check('no payments means calendar fit not assessed', () => invalid.includes('Payment dates: none entered, so calendar fit is not assessed.'));
check('evaluate names the selected reference', () => evaluate(dash, {...assumptions, weeks: 26}).bill.name, '26-week');

const report = {date: new Date().toISOString().slice(0, 10), environment: 'Node, ES modules from extensions/salt-dashboard/src', checks: rows, all_pass: rows.every(r => r.pass)};
fs.writeFileSync(path.join(project, 'extensions', 'evidence', 'salt_model_checks.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({checks: rows.length, all_pass: report.all_pass, failures: rows.filter(r => !r.pass)}, null, 1));
if (!report.all_pass) process.exit(1);
