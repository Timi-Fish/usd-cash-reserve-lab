// Month pages for the payment calendar: saved maturities on their real days, payment marks, and the days cash waits
// for the selected payment. The calendar logic comes from extensions/liquidity-calendar/ladder.js.
const L = globalThis.Ladder;
const WEEKDAYS = [['Mon', 'Monday'], ['Tue', 'Tuesday'], ['Wed', 'Wednesday'], ['Thu', 'Thursday'], ['Fri', 'Friday'], ['Sat', 'Saturday'], ['Sun', 'Sunday']];

// Everything a day can show, keyed by day number; days without markers are absent.
function dayMarkers(ladder, payments) {
  const markers = new Map();
  const slot = day => { if (!markers.has(day)) markers.set(day, {bills: [], payments: []}); return markers.get(day); };
  for (const bill of ladder.bills) slot(bill.maturityDay).bills.push(bill);
  for (const payment of L.byDate(payments)) slot(payment.day).payments.push(payment);
  return markers;
}

function DayCell({day, column, view}) {
  if (day === null) return <td className="blank" />;
  const marks = view.markers.get(day);
  const {fit, selected, ladder, today} = view;
  const before = fit !== null && fit.before !== null ? fit.before.maturityDay : null;
  const after = fit !== null && fit.after !== null ? fit.after.maturityDay : null;
  const classes = [column >= 5 && 'weekend', day === ladder.quoteDay && 'quote', day === today && 'today',
    before !== null && day > before && day <= selected.day && 'wait', day === before && 'nearest', day === after && 'after'].filter(Boolean);
  const number = <span className="daynum">{new Date(day * L.DAY_MS).getUTCDate()}</span>;
  const payments = marks === undefined ? [] : marks.payments;
  return (
    <td className={classes.join(' ')}>
      {payments.length ? (
        <button type="button" className={`pay ${payments[0].type}`} data-key={`pay-${day}`} title={payments.map(p => p.label).join('; ')}
          aria-pressed={payments.some(p => selected !== null && p.id === selected.id)}
          aria-label={`${payments.map(p => p.label).join('; ')}, ${L.longDate(day)}`} onClick={() => view.onSelect(payments[0].id, `pay-${day}`)}>
          {number}
        </button>
      ) : number}
      {payments.length > 1 && <span className="count">×{payments.length}</span>}
      {day === ladder.quoteDay && <Tag short="Q" full="Saved quote date" quote />}
      {marks !== undefined && marks.bills.map(bill => <Tag key={bill.cusip} short={`${bill.tenor}w`} full={`${bill.name} reference matures`} />)}
    </td>
  );
}

const Tag = ({short, full, quote}) => (
  <span className={quote ? 'tag quote' : 'tag'} title={full}><span aria-hidden="true">{short}</span><span className="visually-hidden">{full}</span></span>
);

export function MonthGrid({ladder, payments, selected, onSelect, today}) {
  const months = L.calendarMonths(ladder, payments);
  const view = {ladder, today, selected, onSelect, markers: dayMarkers(ladder, payments), fit: selected === null ? null : L.fit(ladder, selected.day)};
  const lastShown = Math.max(...months[months.length - 1].weeks.flat().filter(day => day !== null));
  const beyond = ladder.bills.filter(b => b.maturityDay > lastShown);
  return (
    <>
      <div className="months">
        {months.map(month => (
          <table className="month" key={month.key}>
            <caption>{month.title}</caption>
            <thead><tr>{WEEKDAYS.map(([short, full]) => <th key={short} scope="col" abbr={full}>{short}</th>)}</tr></thead>
            <tbody>{month.weeks.map((week, w) => <tr key={w}>{week.map((day, c) => <DayCell key={c} day={day} column={c} view={view} />)}</tr>)}</tbody>
          </table>
        ))}
      </div>
      {beyond.length > 0 && <p className="note">Matures after these pages: {beyond.map(b => `${b.name} on ${b.maturity}`).join('; ')}.</p>}
    </>
  );
}
