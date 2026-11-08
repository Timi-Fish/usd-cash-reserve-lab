import {Button, Card, Display3, H2, H3, Label, Table, TBody, TD, TH, THead, TR, Text} from '@salt-ds/core';
import {Assumptions} from '../components/Assumptions.jsx';
import {scenario} from '../model.js';
import {evaluate} from '../summary.js';
import {changeText, pct, signedPct, usd} from '../format.js';

const {dayCount} = globalThis.Ladder;

const Metric = ({label, value}) => <div className="metric"><Label color="secondary">{label}</Label><Display3>{value}</Display3></div>;
// Outcome columns for one reference; invalid inputs show no numbers rather than stale ones.
const outcomeCells = s => s === null ? ['Not shown', 'Not shown', 'Not shown'] : [usd(s.nominalEnd), usd(s.realEnd), signedPct(s.realReturnPct)];

export function Overview({dash, inputs, setInputs, assumptions, goTo}) {
  const {bill, outcome, error} = evaluate(dash, assumptions);
  const rows = dash.instruments.map(q => ({q, s: error === null ? scenario(assumptions.principal, q.discount, q.days, assumptions.inflation) : null}));
  return (
    <div className="view">
      <div className="split split-wide">
        <Card className="card">
          <H3>Your assumptions</H3>
          <Assumptions dash={dash} inputs={inputs} setInputs={setInputs} error={error} />
        </Card>
        <Card className="card result" aria-live="polite">
          {outcome === null ? <Text color="error">{error} Outcomes stay hidden until the inputs are valid.</Text> : (
            <>
              <Text color="secondary">{bill.name} reference held to maturity · {dash.quoteDate} to {bill.maturity} ({dayCount(bill.days)}) · {pct(assumptions.inflation)} assumed annual inflation</Text>
              <H2>{changeText(outcome.realChange)}</H2>
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
        <div className="table-scroll">
          <Table>
            <THead><TR><TH>Reference</TH><TH>Matures</TH><TH textAlign="right">Days</TH><TH textAlign="right">Bank discount quote</TH><TH textAlign="right">Coupon equivalent</TH><TH textAlign="right">Nominal proceeds</TH><TH textAlign="right">Purchasing power</TH><TH textAlign="right">Real return</TH></TR></THead>
            <TBody>
              {rows.map(({q, s}) => (
                <TR key={q.weeks}>
                  <TH scope="row">{q.name}{q.weeks === assumptions.weeks && <span className="selected-note"> · selected</span>}</TH>
                  <TD>{q.maturity}</TD><TD textAlign="right">{q.days}</TD><TD textAlign="right">{pct(q.discount)}</TD><TD textAlign="right">{pct(q.couponEquivalent)}</TD>
                  {outcomeCells(s).map((text, i) => <TD key={i} textAlign="right">{text}</TD>)}
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
