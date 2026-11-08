import {Button, Card, Display4, H2, H3, Label, Table, TBody, TD, TH, THead, TR, Text} from '@salt-ds/core';
import {Assumptions} from '../components/Assumptions.jsx';
import {BillKey} from '../components/BillKey.jsx';
import {NoBreak} from '../components/NoBreak.jsx';
import {PaymentTimeline} from '../components/PaymentTimeline.jsx';
import {PowerBridge} from '../components/PowerBridge.jsx';
import {SummaryActions} from '../components/SummaryActions.jsx';
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
// Comparison columns, keyed by whether the column is the selected reference.
const COLUMN = {
  true: {head: 'is-selected-col', cell: 'nb is-selected-col', suffix: ' (selected)'},
  false: {head: undefined, cell: 'nb', suffix: ''}
};

// Payment timing comes first: the timeline of saved maturities and entered payments, or a pointer to the calendar,
// where payments are entered.
function Timing({ladder, payments, bill, goTo}) {
  const head = action => (
    <div className="card-head">
      <H3>Payment timing</H3>
      <Button appearance="transparent" sentiment="accented" onClick={() => goTo('calendar')}>{action}</Button>
    </div>
  );
  if (ladder.error !== null || payments.length === 0) return (
    <Card className="card">
      {head('Add payment dates')}
      <Text>No payment dates yet. Add the planned payments to see which saved bill matures before each.</Text>
    </Card>
  );
  return <Card className="card">{head('All payment dates')}<PaymentTimeline ladder={ladder.value} payments={L.byDate(payments)} bill={bill} /></Card>;
}

export function Overview({dash, ladder, payments, inputs, setInputs, assumptions, goTo, today}) {
  const {bill, outcome, error} = evaluate(dash, assumptions);
  const outcomes = dash.instruments.map(q => error === null ? scenario(assumptions.principal, q.discount, q.days, assumptions.inflation) : null);
  const column = q => COLUMN[q.weeks === assumptions.weeks];
  return (
    <div className="view overview">
      <Timing ladder={ladder} payments={payments} bill={bill} goTo={goTo} />
      <div className="split split-wide">
        <Card className="card">
          <H3>Your assumptions</H3>
          <Assumptions dash={dash} inputs={inputs} setInputs={setInputs} error={error} />
        </Card>
        <Card className="card result">
          {outcome === null ? <Text color="error">{error} Outcomes stay hidden until the inputs are valid.</Text> : (
            <>
              <H2 aria-live="polite">{changeText(outcome.realChange)}</H2>
              <Text color="secondary"><NoBreak text={`${bill.name} reference held to maturity · ${dash.quoteDate} to ${bill.maturity} (${L.dayCount(bill.days)}) · ${pct(assumptions.inflation)} assumed annual inflation`} /></Text>
              <div className="metrics">
                <Metric label="Nominal proceeds at maturity" value={usd(outcome.nominalEnd)} />
                <Metric label="Purchasing power at maturity" value={usd(outcome.realEnd)} />
                <Metric label="Real holding-period return" value={signedPct(outcome.realReturnPct)} />
              </div>
              <PowerBridge principal={assumptions.principal} outcome={outcome} bill={bill} />
              <Text color="secondary" styleAs="label">Purchasing power is in quote-date dollars, before taxes, fees and purchase-lot limits.</Text>
            </>
          )}
        </Card>
      </div>
      <Card className="card">
        <H3>Both reference bills on the saved quote date</H3>
        <Text color="secondary">Different holding periods, so a larger result is not by itself a better choice; check the payment dates first.</Text>
        <div className="table-scroll compare-table">
          <Table>
            <THead><TR><TH>Measure</TH>{dash.instruments.map(q => <TH key={q.weeks} textAlign="right" className={column(q).head}><BillKey tenor={q.weeks}>{q.name}{column(q).suffix}</BillKey></TH>)}</TR></THead>
            <TBody>
              {ROWS.map(row => (
                <TR key={row.label}>
                  <TH scope="row">{row.label}</TH>
                  {dash.instruments.map((q, i) => (
                    <TD key={q.weeks} textAlign="right" className={column(q).cell}>
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
        <SummaryActions dash={dash} ladder={ladder} assumptions={assumptions} payments={payments} today={today} />
      </div>
    </div>
  );
}
