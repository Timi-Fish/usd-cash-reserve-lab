import katex from 'katex';
import {Card, H3, Link, Text} from '@salt-ds/core';

// The model's formulas in TeX, typeset by KaTeX as MathML so the browser's own math font draws them and no font files
// are bundled. Symbols: B cash placed, d bank discount quote, n days, a inflation; P, N, F, R are defined in order.
const FORMULAS = [
  {label: 'Price per $100 of face value', tex: 'P = 100\\left(1 - \\frac{d\\,n}{360}\\right)'},
  {label: 'Nominal proceeds at maturity', tex: 'N = B \\cdot \\frac{100}{P}'},
  {label: 'Inflation factor over the holding period', tex: 'F = (1 + a)^{n/365}'},
  {label: 'Purchasing power in quote-date dollars', tex: 'R = \\frac{N}{F}'},
  {label: 'Real holding-period return', tex: '\\frac{R}{B} - 1'},
  {label: 'Break-even annual inflation', tex: '\\left(\\frac{100}{P}\\right)^{365/n} - 1'},
  {label: 'CPI year on year', tex: '\\frac{\\mathrm{CPI}_{t}}{\\mathrm{CPI}_{t-12}} - 1'}
].map(f => ({...f, html: katex.renderToString(f.tex, {output: 'mathml', displayMode: true, throwOnError: true})}));
const SYMBOLS = [['B', 'cash placed'], ['d', 'bank discount quote, as a decimal'], ['n', 'calendar days from the saved quote date to maturity'],
  ['a', 'assumed effective annual inflation rate']].map(([tex, text]) => ({text, html: katex.renderToString(tex, {output: 'mathml', throwOnError: true})}));

export function Method({dash, ladder}) {
  const rule = dash.config.freshness;
  return (
    <div className="view method">
      <Card className="card">
        <H3>How the numbers are made</H3>
        <dl className="symbols">
          {SYMBOLS.map(s => <div key={s.text}><dt dangerouslySetInnerHTML={{__html: s.html}} /><dd>{s.text}</dd></div>)}
        </dl>
        <dl className="formulas">
          {FORMULAS.map(f => <div key={f.label}><dt>{f.label}</dt><dd dangerouslySetInnerHTML={{__html: f.html}} /></div>)}
        </dl>
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
