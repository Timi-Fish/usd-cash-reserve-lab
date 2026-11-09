// Calendar-fit logic for the payment calendar: pure functions, no DOM, storage or network. It reads data.bill_ladder
// from data.js. Published on globalThis so the dashboard (module import) and the Node checks share this one copy.
globalThis.Ladder = (() => {
  const DAY_MS = 86400000;
  const SCHEMA = 'usd-cash-reserve-lab/bill-ladder/v1';
  const LIMITS = Object.freeze({entries: 12, label: 60, daysAhead: 400, minSpanDays: 182});
  const PAYMENT_TYPES = Object.freeze({
    fixed: {label: 'Fixed USD payment', short: 'Fixed USD', note: 'The dollar amount is set, so only the timing matters here.'},
    budget: {label: 'Price-sensitive budget', short: 'Price-sensitive',
      note: 'The cost may rise with prices, so purchasing power matters too; explore it with the inflation assumption in the dashboard.'}
  });
  const CONFIRM = 'To confirm with the advisor: purchase price and date; settlement and receipt of funds; taxes and fees; ' +
    'where cash is held between each maturity and payment (no return is assumed for that wait); whether each reference bill can still be bought.';
  const LONG_DATE = new Intl.DateTimeFormat('en-US', {timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'});
  const MONTH_TITLE = new Intl.DateTimeFormat('en-US', {timeZone: 'UTC', month: 'long', year: 'numeric'});

  // Platform ISO parser; the round trip rejects rolled-over dates such as 2027-02-30.
  function dayNumber(iso) {
    const ms = Date.parse(iso + 'T00:00:00Z');
    if (!Number.isFinite(ms) || new Date(ms).toISOString().slice(0, 10) !== iso) throw new Error(`${iso} is not a calendar date in YYYY-MM-DD form.`);
    return ms / DAY_MS;
  }
  const isoDate = day => new Date(day * DAY_MS).toISOString().slice(0, 10);
  const longDate = day => LONG_DATE.format(new Date(day * DAY_MS));
  const dayCount = n => `${n} day${n === 1 ? '' : 's'}`;

  function checkBills(data) {
    if (!data || data.schema !== SCHEMA) throw new Error('Bill data is missing or has an unknown schema.');
    const quoteDay = dayNumber(data.quote_date);
    dayNumber(data.access_date);
    if (!Number.isInteger(data.freshness_days) || data.freshness_days < 1) throw new Error('Bill data has no valid freshness rule.');
    if (!Array.isArray(data.bills) || data.bills.length < 2) throw new Error('Bill data lists fewer than two reference bills.');
    const bills = data.bills.map(b => {
      const maturityDay = dayNumber(b.maturity_date);
      if (!Number.isInteger(b.tenor_weeks) || !b.cusip || !Number.isFinite(b.discount_pct) || b.days < 1 || maturityDay - quoteDay !== b.days)
        throw new Error(`Reference bill ${b.cusip} has inconsistent fields.`);
      return Object.freeze({name: `${b.tenor_weeks}-week`, tenor: b.tenor_weeks, cusip: b.cusip, maturity: b.maturity_date,
        maturityDay, days: b.days, discount: b.discount_pct});
    }).sort((a, b) => a.maturityDay - b.maturityDay);
    if (new Set(bills.map(b => b.cusip)).size !== bills.length) throw new Error('Bill data repeats a security.');
    const source = data.source;
    if (!source || !source.provider || !source.dataset || !source.permission_basis || new URL(source.url).protocol !== 'https:')
      throw new Error('Bill data lacks a complete https source record.');
    return Object.freeze({quoteDate: data.quote_date, quoteDay, accessDate: data.access_date, freshnessDays: data.freshness_days,
      bills: Object.freeze(bills), source});
  }

  // Input errors name the form field they belong to, so the page can mark it.
  const invalid = (field, message) => Object.assign(new Error(message), {field});

  function checkEntry(input, ladder, entries) {
    if (entries.length >= LIMITS.entries) throw invalid('count', `The calendar holds up to ${LIMITS.entries} dates. Remove one to add another.`);
    if (typeof input.label !== 'string' || !input.label.trim()) throw invalid('label', 'Name the payment, for example "Property tax installment".');
    if (input.label.trim().length > LIMITS.label) throw invalid('label', `Keep the name to ${LIMITS.label} characters.`);
    if (!Object.hasOwn(PAYMENT_TYPES, input.type)) throw invalid('type', 'Choose the payment type: a fixed USD payment or a price-sensitive budget.');
    if (!input.date) throw invalid('date', 'Choose the payment date.');
    let day;
    try {
      day = dayNumber(input.date);
    } catch (error) {
      throw invalid('date', error.message);
    }
    if (day <= ladder.quoteDay) throw invalid('date', `Choose a date after the saved quote date, ${ladder.quoteDate}.`);
    const last = ladder.quoteDay + LIMITS.daysAhead;
    if (day > last) throw invalid('date', `Choose a date on or before ${isoDate(last)}, ${LIMITS.daysAhead} days after the saved quote.`);
    return {label: input.label.trim(), date: input.date, day, type: input.type};
  }

  // Nearest saved maturity on or before the payment, and the first one after it.
  function fit(ladder, day) {
    const earlier = ladder.bills.filter(b => b.maturityDay <= day);
    const later = ladder.bills.filter(b => b.maturityDay > day);
    const before = earlier.length ? earlier[earlier.length - 1] : null;
    const after = later.length ? later[0] : null;
    const kind = before === null ? 'none' : before.maturityDay === day ? 'same' : 'early';
    return {kind, before, after, wait: before === null ? null : day - before.maturityDay, late: after === null ? null : after.maturityDay - day};
  }

  // One table per fit kind feeds both the sentence and the table cells.
  const FIT_KINDS = {
    none: f => ({sentence: `No saved reference bill matures by this date; the shortest, ${f.after.name}, matures ${f.after.maturity}, ${dayCount(f.late)} later.`,
      nearest: 'None by this date', wait: 'Not applicable'}),
    same: f => ({sentence: `The ${f.before.name} reference matures on the payment date. Calendar match only; receipt of funds is not assessed.`,
      nearest: `${f.before.name} · ${f.before.maturity}`, wait: '0 days'}),
    early: f => ({sentence: `The ${f.before.name} reference matures ${f.before.maturity}, ${dayCount(f.wait)} before; no return is assumed for that wait.`,
      nearest: `${f.before.name} · ${f.before.maturity}`, wait: dayCount(f.wait)})
  };
  function describe(f) {
    const later = f.after !== null && f.kind !== 'none';
    return {...FIT_KINDS[f.kind](f),
      next: f.after === null ? 'None saved' : `${f.after.name} · ${f.after.maturity}, ${dayCount(f.late)} after`,
      nextSentence: later ? ` Next: ${f.after.name}, ${f.after.maturity}, ${dayCount(f.late)} after, so it would have to be sold before maturity at an unknown price.` : ''};
  }
  const fitText = f => { const d = describe(f); return d.sentence + d.nextSentence; };

  const FRESHNESS = {
    clock: {short: () => 'check device clock', long: () => 'the device date is before the saved quote; check the clock'},
    stale: {short: (age) => `${dayCount(age)} old`,
      long: (age, limit) => `${dayCount(age)} old, beyond the ${limit}-day project limit; refresh before relying on these dates`},
    fresh: {short: (age) => `${dayCount(age)} old`, long: (age, limit) => `${dayCount(age)} old, within the ${limit}-day project limit`}
  };
  function freshness(ladder, today) {
    const age = today - ladder.quoteDay;
    const state = age < 0 ? 'clock' : age > ladder.freshnessDays ? 'stale' : 'fresh';
    const matured = ladder.bills.filter(b => b.maturityDay < today);
    return {age, state, matured, warn: state !== 'fresh' || matured.length > 0,
      short: FRESHNESS[state].short(age), long: FRESHNESS[state].long(age, ladder.freshnessDays)};
  }

  function freshnessText(ladder, today) {
    const f = freshness(ladder, today);
    const matured = f.matured.length ? ` Already matured, historical only: ${f.matured.map(b => b.name).join(', ')}.` : '';
    return `Data status on ${isoDate(today)}: ${f.long}.${matured}`;
  }

  // Month pages from the quote month to the later of the last payment and about six months out; weeks start on Monday.
  function calendarMonths(ladder, entries) {
    const last = Math.max(ladder.quoteDay + LIMITS.minSpanDays, ...entries.map(e => e.day));
    const monthIndex = day => { const d = new Date(day * DAY_MS); return d.getUTCFullYear() * 12 + d.getUTCMonth(); };
    const months = [];
    for (let i = monthIndex(ladder.quoteDay); i <= monthIndex(last); i++) {
      const first = Date.UTC(Math.floor(i / 12), i % 12, 1) / DAY_MS;
      const length = new Date(Date.UTC(Math.floor(i / 12), i % 12 + 1, 0)).getUTCDate();
      const lead = (new Date(first * DAY_MS).getUTCDay() + 6) % 7;
      const cells = [...Array(lead).fill(null), ...Array.from({length}, (_, k) => first + k)];
      const weeks = [];
      for (let w = 0; w < cells.length; w += 7) weeks.push([...cells.slice(w, w + 7), ...Array(7).fill(null)].slice(0, 7));
      months.push({key: isoDate(first).slice(0, 7), title: MONTH_TITLE.format(new Date(first * DAY_MS)), weeks});
    }
    return months;
  }

  const byDate = entries => [...entries].sort((a, b) => a.day - b.day || a.id - b.id);

  function summaryLines(ladder, entries, today) {
    const sorted = byDate(entries);
    const types = [...new Set(sorted.map(e => e.type))];
    return [
      'Discussion summary: payment dates against saved reference Treasury bills',
      `Saved quote: ${ladder.quoteDate}, U.S. Treasury Daily Treasury Bill Rates, retrieved ${ladder.accessDate}.`,
      freshnessText(ladder, today),
      ...(sorted.length ? sorted.map((e, i) => `${i + 1}. ${e.date} · ${e.label} · ${PAYMENT_TYPES[e.type].label}. ${fitText(fit(ladder, e.day))}`)
        : ['No payment dates entered.']),
      ...types.map(t => `${PAYMENT_TYPES[t].label}: ${PAYMENT_TYPES[t].note}`),
      CONFIRM,
      'Calendar fit only, not a recommendation. Quotes are saved observations, not executable offers.',
      'Educational project. Not investment advice.'
    ];
  }

  return Object.freeze({DAY_MS, LIMITS, PAYMENT_TYPES, CONFIRM, dayNumber, isoDate, longDate, dayCount, checkBills, checkEntry,
    fit, describe, fitText, freshness, freshnessText, calendarMonths, byDate, summaryLines});
})();
