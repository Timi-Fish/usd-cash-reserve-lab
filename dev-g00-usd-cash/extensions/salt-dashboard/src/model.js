// Dashboard data, scenario arithmetic, freshness and history windows for the Salt dashboard. Pure functions: no React,
// DOM or storage. The arithmetic follows calculations/method.md and calculations/rebuild.py; scripts/check-model.mjs
// checks it against the results saved in data.js.
import '../../liquidity-calendar/ladder.js';

const {dayNumber, isoDate, dayCount, DAY_MS} = globalThis.Ladder;
export const DISCLAIMER = 'Educational project. Not investment advice.';
export const LIMITS = Object.freeze({principalMax: 100000000, inflationMin: -5, inflationMax: 15});
const TENORS = [13, 26];

export function scenario(principal, discountPct, days, inflationPct) {
  if (![principal, discountPct, days, inflationPct].every(Number.isFinite) || principal <= 0 || principal > LIMITS.principalMax ||
      inflationPct < LIMITS.inflationMin || inflationPct > LIMITS.inflationMax)
    throw new Error('Enter an amount above zero, up to $100 million, and inflation from −5% to 15%.');
  if (!Number.isInteger(days) || days < 1 || days > 366 || discountPct < -5 || discountPct > 30)
    throw new Error('The saved quote is outside the documented bounds.');
  const fraction = 1 - discountPct / 100 * days / 360;
  if (fraction <= 0) throw new Error('The saved quote gives a non-positive price.');
  const growth = (1 + inflationPct / 100) ** (days / 365);
  const nominalEnd = principal / fraction;
  const realEnd = nominalEnd / growth;
  return {pricePer100: 100 * fraction, nominalEnd, realEnd, nominalReturnPct: (1 / fraction - 1) * 100,
    periodInflationPct: (growth - 1) * 100, realReturnPct: (realEnd / principal - 1) * 100, realChange: realEnd - principal,
    breakEvenPct: ((1 / fraction) ** (365 / days) - 1) * 100, zeroInterestRealEnd: principal / growth,
    nominalInterest: nominalEnd - principal, purchasingPowerAdjustment: nominalEnd - realEnd, cashAdvantage: realEnd - principal / growth};
}

// Validates the parts of data.js this app reads and returns them in one shape. Throws on anything inconsistent.
export function readDashboard(summary, data) {
  if (summary.disclaimer !== DISCLAIMER) throw new Error('The required disclaimer is missing from data.js.');
  if (data.config.rate_unit !== 'percent' || data.config.cpi_unit !== 'index-points') throw new Error('data.js uses unexpected units.');
  const instruments = TENORS.map(weeks => {
    const matches = data.instruments.filter(q => q.weeks === weeks);
    if (matches.length !== 1) throw new Error(`data.js needs exactly one ${weeks}-week reference.`);
    const q = matches[0];
    const quoteDay = dayNumber(q.quote_date), maturityDay = dayNumber(q.maturity_date);
    if (maturityDay - quoteDay !== q.days || !q.cusip || !Number.isFinite(q.discount_pct))
      throw new Error(`The ${weeks}-week reference in data.js is inconsistent.`);
    return {weeks, name: `${weeks}-week`, quoteDate: q.quote_date, quoteDay, maturity: q.maturity_date, maturityDay,
      days: q.days, cusip: q.cusip, discount: q.discount_pct, couponEquivalent: q.coupon_equivalent_pct, saved: q.default_result};
  });
  if (instruments[0].cusip === instruments[1].cusip) throw new Error('Both references in data.js name the same security.');
  const cpi = data.cpi;
  if (cpi.release.observation_month !== cpi.dates[cpi.dates.length - 1] || cpi.levels[cpi.levels.length - 1] === null)
    throw new Error('CPI metadata in data.js disagrees with the latest observation.');
  dayNumber(cpi.release.release_date);
  return {summary, config: data.config, quoteDate: summary.as_of, instruments, cpi,
    rates: {dates: data.dates, bill13: data.series.bill13_discount, bill26: data.series.bill26_discount}, sources: data.sources};
}

const monthIndex = key => { const d = new Date(dayNumber(`${key}-01`) * DAY_MS); return d.getUTCFullYear() * 12 + d.getUTCMonth(); };
const monthKey = index => isoDate(Date.UTC(Math.floor(index / 12), index % 12, 1) / DAY_MS).slice(0, 7);
const monthEnd = key => { const i = monthIndex(key) + 1; return Date.UTC(Math.floor(i / 12), i % 12, 0) / DAY_MS; };

const FRESH_TEXT = {
  clock: () => 'The device date is before the saved quote date; check the clock.',
  stale: (f, rule) => `Review required: quotes are ${dayCount(f.quoteAge)} old and CPI ${dayCount(f.cpiAge)} past its month end ` +
    `(project limits: ${rule.quote_days} and ${rule.cpi_days} days). Ask the data maintainer to refresh.`,
  fresh: (f, rule) => `Within project age limits: quotes ${dayCount(f.quoteAge)} old (limit ${rule.quote_days} days).`
};

// Ages are counted against the viewer's calendar date; they never move the model start away from the saved quote.
export function freshness(dash, today) {
  const rule = dash.config.freshness;
  const quoteAge = today - dayNumber(dash.quoteDate);
  const cpiAge = today - monthEnd(dash.cpi.release.observation_month);
  const state = quoteAge < 0 ? 'clock' : quoteAge > rule.quote_days || cpiAge > rule.cpi_days ? 'stale' : 'fresh';
  const matured = dash.instruments.filter(q => q.maturityDay < today);
  const maturedText = matured.length ? ` Already matured: ${matured.map(q => q.name).join(', ')}; historical scenarios only.` : '';
  return {quoteAge, cpiAge, state, matured, warn: state !== 'fresh' || matured.length > 0,
    text: FRESH_TEXT[state]({quoteAge, cpiAge}, rule) + maturedText};
}

// Shared calendar window for the rate and CPI charts, anchored to the latest saved month. A month without an
// observation keeps a null entry so the charts show a gap instead of an invented value.
export function historyWindow(dash, choice) {
  const rateMonths = dash.rates.dates.map(date => isoDate(dayNumber(date)).slice(0, 7));
  const end = Math.max(...rateMonths.map(monthIndex), ...dash.cpi.dates.map(monthIndex));
  const first = Math.min(monthIndex(rateMonths[0]), monthIndex(dash.cpi.dates[0]));
  const start = choice === 'all' ? first : end - Number(choice) + 1;
  const rates = new Map(rateMonths.map((m, i) => [m, {date: dash.rates.dates[i], bill13: dash.rates.bill13[i], bill26: dash.rates.bill26[i]}]));
  const cpi = new Map(dash.cpi.dates.map((m, i) => [m, {level: dash.cpi.levels[i], yoy: dash.cpi.yoy_pct[i]}]));
  const rows = [];
  for (let i = start; i <= end; i++) {
    const month = monthKey(i);
    rows.push({month, rate: rates.has(month) ? rates.get(month) : null, cpi: cpi.has(month) ? cpi.get(month) : null});
  }
  return {start: monthKey(start), end: monthKey(end), rows};
}

// Purchasing power at maturity for each reference across a grid of annual inflation assumptions.
export function sensitivity(dash, principal, inflations) {
  return dash.instruments.map(q => ({name: q.name, points: inflations.map(a => ({inflation: a, realEnd: scenario(principal, q.discount, q.days, a).realEnd}))}));
}
