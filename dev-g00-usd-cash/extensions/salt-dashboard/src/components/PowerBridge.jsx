import {signedUsd, usd} from '../format.js';

const L = globalThis.Ladder;

// From cash placed to purchasing power at maturity, for the selected bill and in its colour: interest adds, inflation over
// the holding period takes away (hatched). Bars measure change from the cash placed (the zero line), so a 1% move stays
// visible on a large base without a cut axis.
export function PowerBridge({principal, outcome, bill}) {
  // Amounts are differences of the whole-dollar levels shown above them, so the three add up as displayed; bars use exact values.
  const [placed, nominal, real] = [principal, outcome.nominalEnd, outcome.realEnd].map(Math.round);
  const steps = [
    {key: 'interest', label: 'Interest to maturity', from: 0, to: outcome.nominalInterest, amount: nominal - placed},
    {key: 'inflation', label: `Inflation over ${L.dayCount(bill.days)}`, from: outcome.nominalInterest, to: outcome.realChange, amount: real - nominal},
    {key: 'net', label: 'Change in purchasing power', from: 0, to: outcome.realChange, amount: real - placed}
  ];
  const lo = Math.min(0, outcome.nominalInterest, outcome.realChange);
  // All three bars are zero only when interest and inflation both are; the tiny span then keeps them at zero width instead of NaN.
  const span = Math.max(Math.max(0, outcome.nominalInterest, outcome.realChange) - lo, Number.EPSILON);
  const at = value => `${(value - lo) / span * 100}%`;
  return (
    <figure className="bridge" data-tenor={bill.weeks}>
      <figcaption>Change from the {usd(principal)} placed in the {bill.name} reference</figcaption>
      {steps.map(s => (
        <div key={s.key} className={`bridge-row ${s.key}`}>
          <span className="bridge-label">{s.label}</span>
          <span className="bridge-track">
            <span className="bridge-bar" style={{left: at(Math.min(s.from, s.to)), width: `${Math.abs(s.to - s.from) / span * 100}%`}} />
            <span className="bridge-zero" style={{left: at(0)}} />
          </span>
          <span className="bridge-value">{signedUsd(s.amount)}</span>
        </div>
      ))}
    </figure>
  );
}
