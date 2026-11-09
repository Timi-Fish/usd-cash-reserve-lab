import {BillKey} from './BillKey.jsx';
import {pct} from '../format.js';

// Payment timing as a bill ladder: each saved bill is a bar from the saved quote date to its maturity, in that bill's
// colour, and each entered payment is a marker on the top lane with a line down through the bars. A bar that ends
// before a line has matured by that payment; the plum segment is the days its cash waits for the next payment.
const L = globalThis.Ladder;
const MONTH = new Intl.DateTimeFormat('en-US', {timeZone: 'UTC', month: 'short'});
const MONTH_YEAR = new Intl.DateTimeFormat('en-US', {timeZone: 'UTC', month: 'short', year: 'numeric'});
// A payment this many days or fewer after the one before keeps its marker and shows its date on hover only.
const CROWDED_DAYS = 15;

// Where the selected reference matures against the next payment, by the calendar's own fit rule.
const SELECTED_NOTE = {
  early: f => `${L.dayCount(f.wait)} before this payment`,
  same: () => 'On this payment date; receipt of funds is not assessed',
  none: f => `${L.dayCount(f.late)} after this payment, so it would have to be sold before maturity at an unknown price`
};

// First day of each month in the span, leaving out any so near either end that its label would be cut off.
function monthStarts(start, end) {
  const first = new Date(start * L.DAY_MS);
  const days = [];
  for (let month = first.getUTCMonth() + 1; ; month++) {
    const day = Date.UTC(first.getUTCFullYear(), month, 1) / L.DAY_MS;
    if (day > end) return days.filter(d => Math.min(d - start, end - d) / (end - start) >= 0.03);
    days.push(day);
  }
}
const monthLabel = day => { const date = new Date(day * L.DAY_MS); return (date.getUTCMonth() === 0 ? MONTH_YEAR : MONTH).format(date); };

// payments: at least one, sorted by date.
export function PaymentTimeline({ladder, payments, bill}) {
  const next = payments[0];
  const start = ladder.quoteDay;
  const last = Math.max(payments[payments.length - 1].day, bill.maturityDay);
  const end = last + Math.max(14, Math.round((last - start) * 0.08));
  // Bills maturing past the shown span run to the edge and fade out.
  const share = day => Math.min((day - start) / (end - start), 1);
  const at = day => `${share(day) * 100}%`;
  const fit = L.fit(ladder, next.day);
  const cells = L.describe(fit);
  const selected = L.fit({bills: [bill]}, next.day);
  const rows = ladder.bills.length;
  const summary = `Bars from the saved quote date ${ladder.quoteDate} to each saved maturity: ${ladder.bills.map(b => `${b.name}, ${b.maturity}`).join('; ')}. ` +
    `Payment dates: ${payments.map(p => `${p.date}, ${p.label}`).join('; ')}.`;
  return (
    <>
      <div className="ladder" role="img" aria-label={summary}>
        <span className="ladder-name" style={{gridRow: 1}}>Payments</span>
        {/* Markers use the calendar's shapes: filled for a fixed USD payment, dashed for a price-sensitive budget. The name
            shows on hover, and markers near the right edge put their date on the left so it stays inside the card. */}
        <div className="ladder-lane" style={{gridRow: 1}}>
          {payments.map((p, i) => (
            <span key={i} style={{left: at(p.day)}}
              className={`lane-pay ${p.type}${p === next ? ' is-next' : ''}${share(p.day) > 0.85 ? ' tl-end' : ''}${i > 0 && p.day - payments[i - 1].day <= CROWDED_DAYS ? ' is-crowded' : ''}`}>
              <span className="lane-dot" />
              <span className="lane-text"><strong>{p.date}</strong><span className="lane-name">{p.label}</span></span>
            </span>
          ))}
        </div>
        <div className="ladder-grid" style={{gridRow: `2 / ${rows + 2}`}}>
          {monthStarts(start, end).map(day => <span key={day} style={{left: at(day)}} />)}
        </div>
        {/* One row per bill; the row under the pointer stands out and shows its term and quote at the bar's end. */}
        {ladder.bills.map((b, i) => (
          <div key={b.cusip} className="ladder-row">
            <span className={`ladder-name${b.tenor === bill.weeks ? ' is-selected' : ''}`} style={{gridRow: i + 2}}>{b.name}<span>{b.maturity}</span></span>
            <span className="ladder-track" style={{gridRow: i + 2}}>
              <span className={`ladder-bar${b.maturityDay > end ? ' is-clipped' : ''}`} data-tenor={b.tenor} style={{width: at(b.maturityDay)}}
                data-tip={`${L.dayCount(b.days)} · ${pct(b.discount)} bank discount`} />
              {b === fit.before && fit.wait > 0 && (
                <span className="ladder-wait" style={{left: at(b.maturityDay), width: `${fit.wait / (end - start) * 100}%`}}><span>{L.dayCount(fit.wait)}</span></span>
              )}
            </span>
          </div>
        ))}
        <div className="ladder-lines" style={{gridRow: `1 / ${rows + 2}`}}>
          {payments.map((p, i) => <span key={i} className={`ladder-line${p === next ? ' is-next' : ''}`} style={{left: at(p.day)}} />)}
        </div>
        <div className="ladder-months" style={{gridRow: rows + 2}}>
          {monthStarts(start, end).map(day => <span key={day} style={{left: at(day)}}>{monthLabel(day)}</span>)}
        </div>
      </div>
      <p className="ladder-note">Bars run from the saved quote date, {ladder.quoteDate}, to each bill’s maturity; lines mark the payment dates, solid for the next one.</p>
      <dl className="timing-facts">
        <div><dt><span className={`swatch ${next.type}`} />Next payment</dt><dd>{next.date}<span>{next.label}</span></dd></div>
        <div><dt>Nearest maturity before it</dt><dd>{cells.nearest}</dd></div>
        <div><dt><span className="swatch wait" />Cash waits, no return assumed</dt><dd>{cells.wait}</dd></div>
        <div><dt><BillKey tenor={bill.weeks}>Selected {bill.name} matures</BillKey></dt><dd>{bill.maturity}<span>{SELECTED_NOTE[selected.kind](selected)}</span></dd></div>
      </dl>
    </>
  );
}
