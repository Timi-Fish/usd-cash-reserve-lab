// Display formats shared by the views and the discussion summary. Values that would round to zero show as zero,
// never as "-$0" or "-0.00%", matching the accepted dashboard.
const nearZero = (value, digits) => Math.abs(value) < 0.5 * 10 ** -digits;
const currency = digits => new Intl.NumberFormat('en-US',
  {style: 'currency', currency: 'USD', minimumFractionDigits: digits, maximumFractionDigits: digits});

export const usd = (value, digits = 0) => currency(digits).format(nearZero(value, digits) ? 0 : value);
// null marks an observation the source does not have (for example October 2025 CPI).
export const pct = (value, digits = 2) => value === null ? 'Missing' : `${(nearZero(value, digits) ? 0 : value).toFixed(digits)}%`;
export const signedUsd = (value, digits = 0) =>
  nearZero(value, digits) ? usd(0, digits) : `${value > 0 ? '+' : '−'}${usd(Math.abs(value), digits)}`;
export const signedPct = (value, digits = 2) =>
  nearZero(value, digits) ? pct(0, digits) : `${value > 0 ? '+' : '−'}${pct(Math.abs(value), digits)}`;
export const changeText = value => nearZero(value, 0) ? 'Purchasing power is approximately unchanged.'
  : `Purchasing power ${value > 0 ? 'increases' : 'decreases'} by ${usd(Math.abs(value))}.`;
