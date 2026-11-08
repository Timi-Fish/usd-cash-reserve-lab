// Liquidity calendar page: the single owner of page state and all DOM rendering. Calendar logic lives in ladder.js.
// Nothing is stored or sent: closing the page clears every entry.
(() => {
  const $ = id => document.getElementById(id);
  const form = $('addForm');
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / Ladder.DAY_MS;
  const WEEKDAYS = [['Mon', 'Monday'], ['Tue', 'Tuesday'], ['Wed', 'Wednesday'], ['Thu', 'Thursday'], ['Fri', 'Friday'], ['Sat', 'Saturday'], ['Sun', 'Sunday']];
  const COLUMNS = ['Date', 'Payment', 'Payment type', 'Matures on or before', 'Cash waits', 'Next maturity after'];
  // Illustrative inputs, named "Example" wherever they appear; day offsets from the saved quote keep them valid after each refresh.
  const EXAMPLES = [
    {label: 'Example: property tax installment', offset: 70, type: 'fixed'},
    {label: 'Example: tuition payment', offset: 115, type: 'fixed'},
    {label: 'Example: spring household budget', offset: 160, type: 'budget'}
  ];
  const FIELD_FOR_ERROR = {label: 'payLabel', date: 'payDate'};
  // Dates and terms such as "8-week" stay on one line; copied text comes from the plain summary lines instead.
  const UNBREAKABLE = /(\d{4}-\d{2}-\d{2}|\d+-(?:week|day))/;
  const state = {entries: [], selected: null, nextId: 1, undo: null};

  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'text') node.textContent = value;
      else if (key === 'class') node.className = value;
      else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value);
    }
    node.append(...children);
    return node;
  }
  const nb = text => text.split(UNBREAKABLE).map((part, i) => i % 2 ? el('span', {class: 'nb', text: part}) : part);
  const keyed = key => `[data-key="${key}"]`;

  let ladder;
  try {
    ladder = Ladder.checkBills(window.BILL_LADDER_DATA);
  } catch (error) {
    // Failure landing point: a visible message and a disabled form, never an empty calendar that looks valid.
    $('fatal').hidden = false;
    $('fatal').textContent = `Bill data is missing or invalid: ${error.message} Ask the data maintainer to run extensions/auto-refresh/refresh.py, then reload this page.`;
    for (const control of document.querySelectorAll('.controls input, .controls button, #copy, #print')) control.disabled = true;
    return;
  }

  const isSelected = entry => entry.id === state.selected;
  const selectedEntry = () => state.entries.find(isSelected);

  function add(input) {
    const entry = {...Ladder.checkEntry(input, ladder, state.entries), id: state.nextId++};
    state.entries.push(entry);
    state.selected = entry.id;
    state.undo = null;
    return entry;
  }
  function select(id, focus) { state.selected = id; render(focus); }
  function remove(id) {
    const ordered = Ladder.byDate(state.entries);
    const index = ordered.findIndex(e => e.id === id);
    const neighbour = index + 1 < ordered.length ? ordered[index + 1] : ordered[index - 1];
    state.undo = {entries: state.entries, text: 'Undo remove'};
    state.entries = state.entries.filter(e => e.id !== id);
    if (state.selected === id) state.selected = neighbour === undefined ? null : neighbour.id;  // selection follows focus
    render(neighbour === undefined ? '#payLabel' : keyed(`pick-${neighbour.id}`));
  }

  function renderStatus() {
    const f = Ladder.freshness(ladder, today);
    $('quotePill').textContent = `Saved quote ${ladder.quoteDate} · ${f.short}`;
    $('quotePill').classList.toggle('warn', f.warn);
    $('status').replaceChildren(...nb(`${Ladder.freshnessText(ladder, today)} Calendar fit only; saved quotes are not executable offers.`));
    $('status').classList.toggle('warn', f.warn);
  }

  function renderEntries(hasEntries) {
    $('entries').replaceChildren(...Ladder.byDate(state.entries).map(e => el('li', {class: 'entry'},
      el('button', {class: 'pick', type: 'button', 'data-key': `pick-${e.id}`, 'aria-pressed': String(isSelected(e)),
        onclick: () => select(e.id, keyed(`pick-${e.id}`))},
      el('strong', {text: e.label}), el('span', {}, ...nb(`${e.date} · ${Ladder.PAYMENT_TYPES[e.type].short}`))),
      el('button', {class: 'remove', type: 'button', 'aria-label': `Remove ${e.label}`, text: 'Remove', onclick: () => remove(e.id)}))));
    $('count').textContent = `${state.entries.length} of ${Ladder.LIMITS.entries}`;
    $('example').hidden = hasEntries;
    $('clear').hidden = !hasEntries;
    $('undo').hidden = state.undo === null;
    $('undo').textContent = state.undo === null ? '' : state.undo.text;
  }

  // Everything a day cell can show, keyed by day number; days without markers are absent.
  function dayMarkers() {
    const markers = new Map();
    const slot = day => { if (!markers.has(day)) markers.set(day, {bills: [], payments: []}); return markers.get(day); };
    for (const bill of ladder.bills) slot(bill.maturityDay).bills.push(bill);
    for (const entry of Ladder.byDate(state.entries)) slot(entry.day).payments.push(entry);
    return markers;
  }

  function dayCell(day, column, view) {
    if (day === null) return el('td', {class: 'blank'});
    const marks = view.markers.get(day);
    const fit = view.fit;
    const classes = [
      column >= 5 && 'weekend', day === ladder.quoteDay && 'quote', day === today && 'today',
      fit && fit.before && day > fit.before.maturityDay && day <= view.entry.day && 'wait',
      fit && fit.before && day === fit.before.maturityDay && 'nearest',
      fit && fit.after && day === fit.after.maturityDay && 'after'
    ].filter(Boolean);
    const cell = el('td', {class: classes.join(' ')});
    const number = el('span', {class: 'daynum', text: String(new Date(day * Ladder.DAY_MS).getUTCDate())});
    if (marks && marks.payments.length) {
      const first = marks.payments[0];
      const names = marks.payments.map(p => p.label).join('; ');
      cell.append(el('button', {class: `pay ${first.type}`, type: 'button', 'data-key': `pay-${day}`,
        'aria-pressed': String(marks.payments.some(isSelected)), 'aria-label': `${names}, ${Ladder.longDate(day)}`, title: names,
        onclick: () => select(first.id, keyed(`pay-${day}`))}, number));
      if (marks.payments.length > 1) cell.append(el('span', {class: 'count', text: `×${marks.payments.length}`}));
    } else {
      cell.append(number);
    }
    if (day === ladder.quoteDay) cell.append(tag('Q', 'Saved quote date', 'tag quote'));
    if (marks) for (const bill of marks.bills) cell.append(tag(`${bill.tenor}w`, `${bill.name} reference matures`, 'tag'));
    return cell;
  }
  const tag = (short, full, cls) => el('span', {class: cls, title: full}, el('span', {'aria-hidden': 'true', text: short}),
    el('span', {class: 'visually-hidden', text: full}));

  function renderCalendar(view) {
    $('readout').replaceChildren(...(view.entry ? [el('strong', {text: `${view.entry.label}, ${Ladder.longDate(view.entry.day)}. `}),
      ...nb(Ladder.fitText(view.fit))] : ['Add a payment date to see which saved reference bill matures before it.']));
    const months = Ladder.calendarMonths(ladder, state.entries);
    $('months').replaceChildren(...months.map(month => el('table', {class: 'month'},
      el('caption', {text: month.title}),
      el('thead', {}, el('tr', {}, ...WEEKDAYS.map(([short, full]) => el('th', {scope: 'col', abbr: full, text: short})))),
      el('tbody', {}, ...month.weeks.map(week => el('tr', {}, ...week.map((day, column) => dayCell(day, column, view))))))));
    const lastShown = Math.max(...months[months.length - 1].weeks.flat().filter(day => day !== null));
    const beyond = ladder.bills.filter(b => b.maturityDay > lastShown);
    $('beyond').replaceChildren(...(beyond.length ?
      nb(`Matures after these pages: ${beyond.map(b => `${b.name} on ${b.maturity}`).join('; ')}.`) : []));
  }

  function renderTable() {
    const rows = Ladder.byDate(state.entries).map(e => {
      const d = Ladder.describe(Ladder.fit(ladder, e.day));
      const cells = [e.label, Ladder.PAYMENT_TYPES[e.type].label, d.nearest, d.wait, d.next];
      return el('tr', {class: isSelected(e) ? 'selected' : ''},
        el('th', {scope: 'row'}, el('button', {class: 'linkish', type: 'button', 'aria-pressed': String(isSelected(e)),
          'aria-label': `${e.date}: show ${e.label} on the calendar`, text: e.date, onclick: () => select(e.id, keyed(`pay-${e.day}`))})),
        ...cells.map((text, i) => el('td', {class: i === 3 ? 'num' : '', 'data-label': COLUMNS[i + 1]}, ...nb(text))));
    });
    $('fitRows').replaceChildren(...(rows.length ? rows : [el('tr', {}, el('td', {class: 'empty-row', colspan: String(COLUMNS.length),
      text: 'No payment dates yet. Add one with the form, or try the example dates.'}))]));
  }

  function renderSummary(hasEntries) {
    $('summary').replaceChildren(...Ladder.summaryLines(ladder, state.entries, today).map(line => el('p', {}, ...nb(line))));
    $('copy').disabled = !hasEntries;
    $('print').disabled = !hasEntries;
    $('copyStatus').textContent = '';
  }

  // Re-rendering replaces the controls, so the caller names where keyboard focus should land afterwards.
  function render(focus) {
    if (!selectedEntry()) state.selected = state.entries.length ? Ladder.byDate(state.entries)[0].id : null;
    const entry = selectedEntry();
    const view = {entry, fit: entry ? Ladder.fit(ladder, entry.day) : null, markers: dayMarkers()};
    const hasEntries = state.entries.length > 0;
    renderStatus();
    renderEntries(hasEntries);
    renderCalendar(view);
    renderTable();
    renderSummary(hasEntries);
    if (focus) document.querySelector(focus).focus();
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const fields = form.elements;
    for (const name of Object.values(FIELD_FOR_ERROR)) fields[name].removeAttribute('aria-invalid');
    try {
      add({label: fields.payLabel.value, date: fields.payDate.value, type: fields.payType.value});
    } catch (error) {
      $('formError').textContent = error.message;
      if (Object.hasOwn(FIELD_FOR_ERROR, error.field)) fields[FIELD_FOR_ERROR[error.field]].setAttribute('aria-invalid', 'true');
      return;
    }
    $('formError').textContent = '';
    fields.payLabel.value = '';
    render('#payLabel');
  });
  $('example').addEventListener('click', () => {
    for (const example of EXAMPLES) add({label: example.label, date: Ladder.isoDate(ladder.quoteDay + example.offset), type: example.type});
    state.selected = Ladder.byDate(state.entries)[0].id;  // start the walk-through at the earliest example
    render(keyed(`pick-${state.selected}`));
  });
  $('clear').addEventListener('click', () => {
    state.undo = {entries: state.entries, text: 'Undo clear'};
    state.entries = [];
    render('#payLabel');
  });
  $('undo').addEventListener('click', () => {
    state.entries = state.undo.entries;
    state.undo = null;
    state.selected = null;
    render(keyed(`pick-${Ladder.byDate(state.entries)[0].id}`));
  });
  $('copy').addEventListener('click', () => {
    const text = Ladder.summaryLines(ladder, state.entries, today).join('\n');
    Promise.resolve().then(() => navigator.clipboard.writeText(text)).then(
      () => { $('copyStatus').textContent = 'Summary copied.'; },
      () => { $('copyStatus').textContent = 'This browser blocked copying. Select the summary text and copy it instead.'; });
  });
  $('print').addEventListener('click', () => window.print());

  const first = ladder.quoteDay + 1, last = ladder.quoteDay + Ladder.LIMITS.daysAhead;
  form.elements.payDate.min = Ladder.isoDate(first);
  form.elements.payDate.max = Ladder.isoDate(last);
  $('dateHelp').replaceChildren(...nb(`Between ${Ladder.isoDate(first)} and ${Ladder.isoDate(last)}. Calendar timing only.`));
  const source = ladder.source;
  const link = el('a', {href: source.url, target: '_blank', rel: 'noopener', text: source.dataset});
  $('sourceNote').replaceChildren(`${source.provider}: `, link, `. Saved quote ${ladder.quoteDate}, retrieved ${ladder.accessDate}; ` +
    `${ladder.bills.length} reference bills from ${ladder.bills[0].name} to ${ladder.bills[ladder.bills.length - 1].name}. ` +
    `${source.permission_basis}. Refreshed by `, el('code', {text: 'extensions/auto-refresh/refresh.py'}),
    `; quotes count as stale after ${ladder.freshnessDays} days.`);
  render();
})();
