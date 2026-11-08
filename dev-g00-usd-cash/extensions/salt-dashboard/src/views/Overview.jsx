import {Button, Card, Display4, H2, H3, Label, Table, TBody, TD, TH, THead, TR, Text} from '@salt-ds/core';
import {Assumptions} from '../components/Assumptions.jsx';
import {NoBreak} from '../components/NoBreak.jsx';
import {scenario} from '../model.js';
import {evaluate} from '../summary.js';
import {changeText, pct, signedPct, usd} from '../format.js';

const L = globalThis.Ladder;

const Metric = ({label, value}) => <div className="metric"><Label color="secondary">{label}</Label><Display4>{value}</Display4></div>;
// Rows of the comparison table; outcome rows show no numbers while the inputs are invalid.
const ROWS = [
  {label: 'Matures', cell: q => q.maturity},
  {label: 'Days to maturity', cell: q => String(q.days)},
  {label: 'Bank discount quote', cell: q => pct(q.discount)},
  {label: 'Coupon equivalent', cell: q => pct(q.couponEquivalent)},
  {label: 'Nominal proceeds at maturity', outcome: s => usd(s.nominalEnd)},
  {label: 'Purchasing power at maturity', outcome: s => usd(s.realEnd)},
  {label: 'Real holding-period return', outcome: s => signedPct(s.realReturnPct)}
];

// Where the selected reference matures against the next payment, by the calendar's own fit rule; the scenario numbers below are at that maturity.
const SELECTED_TIMING = {
  early: (bill, f) => `The selected ${bill.name} matures ${bill.maturity}, ${L.dayCount(f.wait)} before this payment.`,
  same: bill => `The selected ${bill.name} matures on this payment date; receipt of funds is not assessed.`,
  none: (bill, f) => `The selected ${bill.name} matures ${bill.maturity}, ${L.dayCount(f.late)} after this payment, so it would have to be sold before maturity at an unknown price.`
};
const selectedTiming = (bill, day) => {
  const f = L.fit({bills: [bill]}, day);
  return SELECTED_TIMING[f.kind](bill, f);
};

// Payment timing comes first: the next entered payment, the saved maturity that reaches it, and where the selected bill falls.
function Timing({ladder, payments, bill, goTo}) {
  if (ladder.error !== null || payments.length === 0) return (
    <div className="timing">
      <Text>No payment dates yet. Timing comes first: add the planned payments to see which saved bill matures before each.</Text>
      <Button appearance="transparent" sentiment="accented" onClick={() => goTo('calendar')}>Add payment dates</Button>
    </div>
  );
  const next = L.byDate(payments)[0];
  return (
    <div className="timing">
      <Text>
        <strong>Next payment {next.date}, {next.label}.</strong> <NoBreak text={L.describe(L.fit(ladder.value, next.day)).sentence} />{' '}
        <NoBreak text={selectedTiming(bill, next.day)} />
      </Text>
      <Button appearance="transparent" sentiment="accented" onClick={() => goTo('calendar')}>All payment dates</Button>
    </div>
  );
}

export function Overview({dash, ladder, payments, inputs, setInputs, assumptions, goTo}) {
  const {bill, outcome, error} = evaluate(dash, assumptions);
  const outcomes = dash.instruments.map(q => error === null ? scenario(assumptions.principal, q.discount, q.days, assumptions.inflation) : null);
  return (
    <div className="view">
      <div className="split split-wide">
        <Card className="card">
          <H3>Your assumptions</H3>
          <Assumptions dash={dash} inputs={inputs} setInputs={setInputs} error={error} />
        </Card>
        <Card className="card result">
          <Timing ladder={ladder} payments={payments} bill={bill} goTo={goTo} />
          {outcome === null ? <Text color="error">{error} Outcomes stay hidden until the inputs are valid.</Text> : (
            <>
              <Text color="secondary"><NoBreak text={`${bill.name} reference held to maturity · ${dash.quoteDate} to ${bill.maturity} (${L.dayCount(bill.days)}) · ${pct(assumptions.inflation)} assumed annual inflation`} /></Text>
              <H2 aria-live="polite">{changeText(outcome.realChange)}</H2>
              <div className="metrics">
                <Metric label="Nominal proceeds at maturity" value={usd(outcome.nominalEnd)} />
                <Metric label="Purchasing power at maturity" value={usd(outcome.realEnd)} />
                <Metric label="Real holding-period return" value={signedPct(outcome.realReturnPct)} />
              </div>
              <Text color="secondary" styleAs="label">Purchasing power is in quote-date dollars, before taxes, fees and purchase-lot limits.</Text>
            </>
          )}
        </Card>
      </div>
      <Card className="card">
        <H3>Both reference bills on the saved quote date</H3>
        <Text color="secondary">Two different holding periods. A larger dollar result over a longer period is not evidence of a better choice; check the payment dates first.</Text>
        <div className="table-scroll compare-table">
          <Table>
            <THead><TR><TH>Measure</TH>{dash.instruments.map(q => <TH key={q.weeks} textAlign="right">{q.name}{q.weeks === assumptions.weeks ? ' (selected)' : ''}</TH>)}</TR></THead>
            <TBody>
              {ROWS.map(row => (
                <TR key={row.label}>
                  <TH scope="row">{row.label}</TH>
                  {dash.instruments.map((q, i) => (
                    <TD key={q.weeks} textAlign="right" className="nb">
                      {row.cell !== undefined ? row.cell(q) : outcomes[i] === null ? 'Not shown' : row.outcome(outcomes[i])}
                    </TD>
                  ))}
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
        <Text color="secondary" styleAs="label">The bank discount quote is an annual convention on face value and a 360-day year, not the return on the cash invested.</Text>
      </Card>
      <div className="next-steps" role="group" aria-label="Next steps">
        <Button appearance="bordered" onClick={() => goTo('calendar')}>Check payment dates</Button>
        <Button appearance="bordered" onClick={() => goTo('scenarios')}>Test other inflation rates</Button>
        <Button appearance="bordered" onClick={() => goTo('summary')}>Open the discussion summary</Button>
      </div>
    </div>
  );
}
