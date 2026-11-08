import {Button, Card, Display4, H3, Label, Table, TBody, TD, TH, THead, TR, Text} from '@salt-ds/core';
import {Assumptions} from '../components/Assumptions.jsx';
import {LineChart} from '../components/LineChart.jsx';
import {scenario, sensitivity} from '../model.js';
import {evaluate} from '../summary.js';
import {pct, signedUsd, usd} from '../format.js';

const {dayCount} = globalThis.Ladder;
const GRID = Array.from({length: 41}, (_, i) => -5 + i / 2);
const READ_POINTS = [-2, 0, 3, 6, 10];
const TONES = ['first', 'second'];

const Part = ({sign, label, value}) => <div className="part"><Label color="secondary">{sign} {label}</Label><Display4>{value}</Display4></div>;

export function Scenarios({dash, inputs, setInputs, assumptions}) {
  const {bill, outcome, error} = evaluate(dash, assumptions);
  const breakEvens = dash.instruments.map(q => ({q, value: scenario(100000, q.discount, q.days, 0).breakEvenPct}));
  return (
    <div className="view">
      <div className="split split-wide">
        <Card className="card">
          <H3>Inflation assumption</H3>
          <Assumptions dash={dash} inputs={inputs} setInputs={setInputs} error={error} />
          <div className="break-evens">
            <Label color="secondary">Exact break-even inflation</Label>
            {breakEvens.map(({q, value}) => (
              <div key={q.weeks} className="break-even">
                <Text><strong>{q.name}</strong> {pct(value)}</Text>
                <Button appearance="transparent" sentiment="accented" aria-label={`Use ${pct(value)} as the inflation assumption`}
                  onClick={() => setInputs(current => ({...current, inflation: value.toFixed(4)}))}>Use {pct(value)}</Button>
              </div>
            ))}
          </div>
          <Text color="secondary" styleAs="label">A break-even rate is the inflation that leaves purchasing power unchanged over that holding period. It is a threshold, not a forecast.</Text>
        </Card>
        <Card className="card">
          <H3>Purchasing power at maturity across inflation assumptions</H3>
          {outcome === null ? <Text color="error">{error}</Text> : <Sensitivity dash={dash} assumptions={assumptions} />}
        </Card>
      </div>
      {outcome !== null && (
        <Card className="card">
          <H3>Where the {bill.name} result comes from</H3>
          <div className="parts">
            <Part sign="" label="Cash placed" value={usd(assumptions.principal)} />
            <Part sign="+" label="Nominal interest" value={usd(outcome.nominalInterest)} />
            <Part sign="−" label="Purchasing-power adjustment" value={usd(outcome.purchasingPowerAdjustment)} />
            <Part sign="=" label="Purchasing power at maturity" value={usd(outcome.realEnd)} />
          </div>
          <Text color="secondary">The adjustment converts maturity dollars into quote-date dollars. It is not an account debit, and it turns negative under deflation.</Text>
          <Text>Holding the same cash at zero interest for the same {dayCount(bill.days)} leaves purchasing power of {usd(outcome.zeroInterestRealEnd)}; the bill's difference over that is {signedUsd(outcome.cashAdvantage)}.</Text>
        </Card>
      )}
    </div>
  );
}

function Sensitivity({dash, assumptions}) {
  const curves = sensitivity(dash, assumptions.principal, [...new Set([...GRID, assumptions.inflation])].sort((a, b) => a - b));
  const reads = [...new Set([...READ_POINTS, assumptions.inflation])].sort((a, b) => a - b);
  const points = c => c.points.map(p => ({x: p.inflation, y: p.realEnd}));
  const radii = c => c.points.map(p => p.inflation === assumptions.inflation ? 5 : 0);
  return (
    <>
      <LineChart xAxis={{type: 'linear', min: -5, max: 15, step: 5, format: v => `${v}%`}} xTitle="Assumed annual inflation"
        yTitle="Purchasing power, quote-date USD" format={v => usd(v)}
        description="Purchasing power at maturity for each reference bill across annual inflation assumptions from minus 5 to 15 percent; the table below lists exact values."
        series={[...curves.map((c, i) => ({label: c.name, values: points(c), tone: TONES[i], dashed: i === 1, radii: radii(c)})),
          {label: 'Cash placed', values: [{x: -5, y: assumptions.principal}, {x: 15, y: assumptions.principal}], tone: 'reference', dashed: true, radii: 0}]} />
      <Text color="secondary" styleAs="label">Each curve covers its own holding period, so a higher curve is not a ranking. The markers show the current assumption.</Text>
      <div className="table-scroll">
        <Table>
          <THead><TR><TH>Annual inflation</TH>{dash.instruments.map(q => <TH key={q.weeks} textAlign="right">{q.name} purchasing power</TH>)}</TR></THead>
          <TBody>
            {reads.map(a => (
              <TR key={a} className={a === assumptions.inflation ? 'is-selected' : ''}>
                <TH scope="row">{pct(a)}{a === assumptions.inflation && ' (current)'}</TH>
                {dash.instruments.map(q => <TD key={q.weeks} textAlign="right">{usd(scenario(assumptions.principal, q.discount, q.days, a).realEnd)}</TD>)}
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </>
  );
}
