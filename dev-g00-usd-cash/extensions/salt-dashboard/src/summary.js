// The discussion summary as plain lines: the one source for the on-screen text, Copy and Print.
import {DISCLAIMER, freshness, scenario} from './model.js';
import {pct, signedPct, usd} from './format.js';

const {dayCount, fit, fitText, PAYMENT_TYPES, CONFIRM, byDate} = globalThis.Ladder;

// User input is the trust boundary: an invalid amount or inflation rate becomes a message, never a stale result.
export function evaluate(dash, assumptions) {
  const bill = dash.instruments.find(q => q.weeks === assumptions.weeks);
  try {
    return {bill, outcome: scenario(assumptions.principal, bill.discount, bill.days, assumptions.inflation), error: null};
  } catch (error) {
    return {bill, outcome: null, error: error.message};
  }
}

export const SUMMARY_TITLE = 'Discussion summary: USD reserve review';

// The summary in reading order: data, result, payment dates, then what to confirm.
export function summarySections(dash, assumptions, payments, ladder, today) {
  const {bill, outcome, error} = evaluate(dash, assumptions);
  const [q13, q26] = dash.instruments;
  const sorted = byDate(payments);
  const result = outcome === null ? [`Assumptions incomplete: ${error} Outcomes are not shown until the inputs are valid.`] : [
    `Assumptions: ${usd(assumptions.principal)} placed in the ${bill.name} reference; ${pct(assumptions.inflation)} assumed annual inflation, a scenario input rather than a forecast.`,
    `Selected ${bill.name} reference held to maturity on ${bill.maturity}: nominal proceeds ${usd(outcome.nominalEnd)} on that date; ` +
      `purchasing power ${usd(outcome.realEnd)} in quote-date dollars; real holding-period return ${signedPct(outcome.realReturnPct)}.`,
    `Break-even annual inflation for this reference: ${pct(outcome.breakEvenPct)}. It is a mathematical threshold, not a forecast.`
  ];
  return [
    {title: 'Data', lines: [
      `Saved Treasury quote ${dash.quoteDate}; CPI observation ${dash.cpi.release.observation_month}, published ${dash.cpi.release.release_date}.`,
      freshness(dash, today).text,
      `Saved references: ${q13.name} matures ${q13.maturity} (${dayCount(q13.days)}, ${pct(q13.discount)} bank discount); ` +
        `${q26.name} matures ${q26.maturity} (${dayCount(q26.days)}, ${pct(q26.discount)} bank discount).`]},
    {title: 'Result', lines: result},
    {title: 'Payment dates', lines: [
      ...(sorted.length ? sorted.map((p, i) => `${i + 1}. ${p.date} · ${p.label} · ${PAYMENT_TYPES[p.type].label}. ${fitText(fit(ladder, p.day))}`)
        : ['Payment dates: none entered, so calendar fit is not assessed.']),
      ...[...new Set(sorted.map(p => p.type))].map(type => `${PAYMENT_TYPES[type].label}: ${PAYMENT_TYPES[type].note}`)]},
    {title: 'To confirm', lines: [CONFIRM,
      'Amounts are at each bill’s maturity, not on a payment date. Calendar fit only; no bill is ranked or recommended.']}
  ];
}

// Plain text for Copy: the same sections, each heading on its own line, ending with the disclaimer.
export function summaryLines(dash, assumptions, payments, ladder, today) {
  const sections = summarySections(dash, assumptions, payments, ladder, today);
  return [SUMMARY_TITLE, ...sections.flatMap(s => [s.title, ...s.lines]), DISCLAIMER];
}
