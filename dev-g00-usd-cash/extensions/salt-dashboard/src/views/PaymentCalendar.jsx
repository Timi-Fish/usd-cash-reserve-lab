import {useEffect, useState} from 'react';
import {Banner, BannerContent, Button, Card, FormField, FormFieldHelperText, FormFieldLabel, H3, Input, RadioButton, RadioButtonGroup, Table, TBody, TD, TH, THead, TR, Text} from '@salt-ds/core';
import {CloseIcon} from '@salt-ds/icons';
import {MonthGrid} from '../components/MonthGrid.jsx';
import {NoBreak} from '../components/NoBreak.jsx';

const L = globalThis.Ladder;
// Illustrative inputs, labelled "Example" wherever they appear; offsets from the saved quote keep them valid after each refresh.
const EXAMPLES = [
  {label: 'Example: property tax installment', offset: 70, type: 'fixed'},
  {label: 'Example: tuition payment', offset: 115, type: 'fixed'},
  {label: 'Example: spring household budget', offset: 160, type: 'budget'}
];
const COLUMNS = ['Payment', 'Payment type', 'Matures on or before', 'Cash waits', 'Next maturity after'];
const EMPTY_FIT = 'No payment dates yet. Add one with the form, or try the example dates.';

export function PaymentCalendar({ladder, payments, setPayments, today}) {
  if (ladder.error !== null) return (
    <Banner status="error"><BannerContent>Bill data is missing or invalid: {ladder.error} Ask the data maintainer to run extensions/auto-refresh/refresh.py.</BannerContent></Banner>
  );
  return <Workspace ladder={ladder.value} payments={payments} setPayments={setPayments} today={today} />;
}

function pickSelected(ordered, id) {
  const match = ordered.find(p => p.id === id);
  if (match !== undefined) return match;
  return ordered.length ? ordered[0] : null;
}

const Legend = () => (
  <ul className="legend" aria-label="Calendar key">
    <li><span className="tag quote" aria-hidden="true">Q</span>Saved quote date</li>
    <li><span className="tag" aria-hidden="true">wk</span>Reference bill matures (the tag shows its weeks)</li>
    <li><span className="swatch nearest" />Nearest maturity on or before the selected payment</li>
    <li><span className="tag outline" aria-hidden="true">wk</span>Next maturity after it</li>
    <li><span className="swatch fixed" />Fixed USD payment</li>
    <li><span className="swatch budget" />Price-sensitive budget</li>
    <li><span className="swatch wait" />Days cash waits</li>
    <li><span className="swatch today" />Today</li>
  </ul>
);

// Page state for the calendar tab. Payments live in App so the discussion summary can read them; nothing is stored.
function Workspace({ladder, payments, setPayments, today}) {
  const [form, setForm] = useState({label: '', date: '', type: 'fixed'});
  const [problem, setProblem] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [undo, setUndo] = useState(null);
  const [focusKey, setFocusKey] = useState(null);
  // Re-rendering replaces controls, so every action names where keyboard focus lands afterwards.
  useEffect(() => {
    if (focusKey === null) return;
    document.querySelector(`[data-key="${focusKey}"]`).focus();
    setFocusKey(null);
  }, [focusKey]);

  const ordered = L.byDate(payments);
  const selected = pickSelected(ordered, selectedId);
  const isChosen = p => selected !== null && selected.id === p.id;
  const fitRows = ordered.map(p => {
    const d = L.describe(L.fit(ladder, p.day));
    return {p, chosen: isChosen(p), cells: [p.label, L.PAYMENT_TYPES[p.type].label, d.nearest, d.wait, d.next]};
  });
  const nextId = () => Math.max(0, ...payments.map(p => p.id)) + 1;
  const first = L.isoDate(ladder.quoteDay + 1), last = L.isoDate(ladder.quoteDay + L.LIMITS.daysAhead);
  const fieldStatus = field => problem !== null && problem.field === field ? 'error' : undefined;
  const select = (id, key) => { setSelectedId(id); setFocusKey(key); };

  function add(event) {
    event.preventDefault();
    let entry;
    try {
      entry = {...L.checkEntry(form, ladder, payments), id: nextId()};
    } catch (error) {
      setProblem({field: error.field, message: error.message});
      return;
    }
    setPayments([...payments, entry]);
    setSelectedId(entry.id);
    setUndo(null);
    setProblem(null);
    setForm(current => ({...current, label: ''}));
    setFocusKey('payment-name');
  }
  function remove(id) {
    const index = ordered.findIndex(p => p.id === id);
    const neighbour = index + 1 < ordered.length ? ordered[index + 1] : ordered[index - 1];
    setUndo({payments, text: 'Undo remove'});
    setPayments(payments.filter(p => p.id !== id));
    if (selected !== null && selected.id === id) setSelectedId(neighbour === undefined ? null : neighbour.id);
    setFocusKey(neighbour === undefined ? 'payment-name' : `pick-${neighbour.id}`);
  }
  function clear() {
    setUndo({payments, text: 'Undo clear'});
    setPayments([]);
    setFocusKey('payment-name');
  }
  function restore() {
    setPayments(undo.payments);
    setUndo(null);
    setSelectedId(null);
    setFocusKey(`pick-${L.byDate(undo.payments)[0].id}`);
  }
  function examples() {
    const added = [];
    for (const example of EXAMPLES)
      added.push({...L.checkEntry({label: example.label, date: L.isoDate(ladder.quoteDay + example.offset), type: example.type}, ladder, added), id: added.length + 1});
    setPayments(added);
    setSelectedId(added[0].id);
    setFocusKey('pick-1');
  }

  return (
    <div className="split">
      <Card className="card">
        <H3>Add a payment date</H3>
        <form className="form" onSubmit={add} noValidate>
          <FormField validationStatus={fieldStatus('label')}>
            <FormFieldLabel>Payment</FormFieldLabel>
            <Input variant="secondary" value={form.label} onChange={event => setForm({...form, label: event.target.value})}
              inputProps={{maxLength: L.LIMITS.label, placeholder: 'e.g. Property tax installment', 'data-key': 'payment-name', autoComplete: 'off'}} />
          </FormField>
          <FormField validationStatus={fieldStatus('date')}>
            <FormFieldLabel>Date</FormFieldLabel>
            <Input variant="secondary" value={form.date} onChange={event => setForm({...form, date: event.target.value})} inputProps={{type: 'date', min: first, max: last}} />
            <FormFieldHelperText>Between {first} and {last}. Calendar timing only.</FormFieldHelperText>
          </FormField>
          <FormField>
            <FormFieldLabel>Payment type</FormFieldLabel>
            <RadioButtonGroup value={form.type} onChange={event => setForm({...form, type: event.target.value})}>
              <RadioButton value="fixed" label="Fixed USD payment" />
              <RadioButton value="budget" label="Price-sensitive budget" />
            </RadioButtonGroup>
            <FormFieldHelperText>Fixed: the dollar amount is set. Price-sensitive: the cost may rise with prices.</FormFieldHelperText>
          </FormField>
          <Button type="submit" sentiment="accented">Add to calendar</Button>
          <Text color="error" role="alert" className="form-error">{problem === null ? '' : problem.message}</Text>
        </form>
        <H3 className="list-title">Payment dates <span>{payments.length} of {L.LIMITS.entries}</span></H3>
        <ul className="entries">
          {ordered.map(p => (
            <li key={p.id} className="entry">
              <Button appearance="transparent" className="pick" data-key={`pick-${p.id}`} aria-pressed={isChosen(p)}
                onClick={() => select(p.id, `pick-${p.id}`)}>
                <span className="pick-text"><strong>{p.label}</strong><span>{p.date} · {L.PAYMENT_TYPES[p.type].short}</span></span>
              </Button>
              <Button appearance="transparent" aria-label={`Remove ${p.label}`} title="Remove" onClick={() => remove(p.id)}><CloseIcon aria-hidden /></Button>
            </li>
          ))}
        </ul>
        <div className="row-actions">
          {payments.length === 0 && <Button appearance="bordered" onClick={examples}>Try example dates</Button>}
          {undo !== null && <Button appearance="transparent" onClick={restore}>{undo.text}</Button>}
          {payments.length > 0 && <Button appearance="transparent" onClick={clear}>Clear all</Button>}
        </div>
        <Text color="secondary" styleAs="label" className="privacy">Nothing is saved or sent. Closing the page clears the dates; copy or print the discussion summary to keep a record.</Text>
      </Card>
      <Card className="card">
        <H3>Saved maturities against your payment dates</H3>
        <Legend />
        <p className="readout" aria-live="polite">
          {selected === null ? 'Add a payment date to see which saved reference bill matures before it.' : (
            <><strong>{selected.label}, {L.longDate(selected.day)}. </strong><NoBreak text={L.fitText(L.fit(ladder, selected.day))} /></>
          )}
        </p>
        <div className="calendar-body">
        <div className="calendar-pages"><MonthGrid ladder={ladder} payments={payments} selected={selected} today={today} onSelect={select} /></div>
        <section className="fit-section" aria-labelledby="fit-title">
        <H3 className="list-title" id="fit-title">Calendar fit by payment</H3>
        {/* Phones get the stacked list, wider screens the table; both read the same rows. */}
        <ul className="fit-list">
          {fitRows.length === 0 && <li>{EMPTY_FIT}</li>}
          {fitRows.map(({p, cells, chosen}) => (
            <li key={p.id} className={chosen ? 'is-selected' : ''}>
              <Button appearance="transparent" sentiment="accented" onClick={() => select(p.id, `pay-${p.day}`)}
                aria-label={`${p.date}: show ${p.label} on the calendar`}>{p.date}</Button>
              <dl>{cells.map((text, i) => <div key={COLUMNS[i]}><dt>{COLUMNS[i]}</dt><dd><NoBreak text={text} /></dd></div>)}</dl>
            </li>
          ))}
        </ul>
        <div className="table-scroll fit-table-wrap">
          <Table className="fit-table">
            <THead><TR><TH>Date</TH>{COLUMNS.map(c => <TH key={c}>{c}</TH>)}</TR></THead>
            <TBody>
              {fitRows.length === 0 && <TR><TD colSpan={COLUMNS.length + 1}>{EMPTY_FIT}</TD></TR>}
              {fitRows.map(({p, cells, chosen}) => (
                <TR key={p.id} className={chosen ? 'is-selected' : ''}>
                  <TH scope="row"><Button appearance="transparent" aria-label={`${p.date}: show ${p.label} on the calendar`} onClick={() => select(p.id, `pay-${p.day}`)}>{p.date}</Button></TH>
                  {cells.map((text, i) => <TD key={COLUMNS[i]}><NoBreak text={text} /></TD>)}
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
        </section>
        </div>
      </Card>
    </div>
  );
}
