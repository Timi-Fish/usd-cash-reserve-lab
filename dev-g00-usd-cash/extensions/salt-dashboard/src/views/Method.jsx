import {Card, H3, Link, Text} from '@salt-ds/core';

const FORMULAS = [
  'price per 100 = 100 × (1 − d × n / 360)',
  'nominal proceeds = B × 100 / price per 100',
  'inflation factor = (1 + a)^(n / 365)',
  'purchasing power = nominal proceeds / inflation factor',
  'real holding return = purchasing power / B − 1',
  'break-even annual inflation = (100 / price per 100)^(365 / n) − 1',
  'CPI year on year = CPI month / CPI same month a year earlier − 1'
];

export function Method({dash, ladder}) {
  const rule = dash.config.freshness;
  return (
    <div className="view method">
      <Card className="card">
        <H3>How the numbers are made</H3>
        <Text>B is the cash placed, d the bank discount quote as a decimal, n the actual calendar days from the saved quote date to maturity, and a the assumed effective annual inflation rate.</Text>
        <pre className="formulas">{FORMULAS.join('\n')}</pre>
        <Text color="secondary">Amounts display rounded to dollars and returns to two decimals; calculations keep full precision. "Real" means in quote-date dollars. The model starts at the saved quote date and does not price settlement, taxes, fees or early sale.</Text>
      </Card>
      <div className="split-even">
        <Card className="card">
          <H3>Data</H3>
          <ul className="plain-list">
            {dash.sources.map(s => <li key={s.url}><Link href={s.url} target="_blank" rel="noopener">{s.label}</Link></li>)}
            {ladder.error === null && <li><Link href={ladder.value.source.url} target="_blank" rel="noopener">All seven bill tenors for the payment calendar</Link> (same Treasury dataset)</li>}
          </ul>
          <Text color="secondary">Treasury fields: bank discount closing quotes for 13- and 26-week bills, with their maturity dates and CUSIPs. CPI: BLS series CUUR0000SA0, all items, U.S. city average, not seasonally adjusted, 1982–84 = 100. Treasury data carry a CC0 dedication; BLS data are public domain. No paid or aggregator data.</Text>
        </Card>
        <Card className="card">
          <H3>Freshness and maintenance</H3>
          <Text>Quotes count as stale after {rule.quote_days} calendar days; CPI after {rule.cpi_days} days from its observation month end. Ages use your device date and never move the model start.</Text>
          <Text color="secondary">The project's maintainers rebuild the saved data from the official files and check each release before it is shown here. When quotes are stale, ask your advisor for a refreshed view before relying on the dates.</Text>
        </Card>
      </div>
      <Card className="card">
        <H3>Limits</H3>
        <ul className="plain-list">
          <li>Saved quotes are observations, not executable offers; reference bills can mature or stop being available.</li>
          <li>The inflation rate is an assumption. U.S. CPI-U is a national average and may not match a family's own costs.</li>
          <li>Fixed USD payments need dollars on time; purchasing power matters for price-sensitive budgets.</li>
          <li>Calendar fit compares dates only. It does not judge whether a payment can be met, and no bill is ranked or recommended.</li>
        </ul>
      </Card>
    </div>
  );
}
