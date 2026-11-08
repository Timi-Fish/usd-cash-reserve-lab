import {useMemo, useState} from 'react';
import {Banner, BannerContent, Tab, TabBar, TabList, TabPanel, Tabs, TabTrigger, Text} from '@salt-ds/core';
import {freshness, readDashboard} from './model.js';
import {Overview} from './views/Overview.jsx';
import {PaymentCalendar} from './views/PaymentCalendar.jsx';
import {Scenarios} from './views/Scenarios.jsx';
import {History} from './views/History.jsx';
import {Summary} from './views/Summary.jsx';
import {Method} from './views/Method.jsx';

const {checkBills, DAY_MS} = globalThis.Ladder;
const now = new Date();
const TODAY = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / DAY_MS;
// Short labels keep all six tabs visible on a phone.
const TABS = [
  {id: 'overview', label: 'Overview', View: Overview},
  {id: 'calendar', label: 'Calendar', View: PaymentCalendar},
  {id: 'scenarios', label: 'Scenarios', View: Scenarios},
  {id: 'history', label: 'History', View: History},
  {id: 'summary', label: 'Summary', View: Summary},
  {id: 'method', label: 'Method', View: Method}
];

// Data files are the trust boundary: a broken file becomes a visible message, never a page that looks valid.
function load(read) {
  try {
    return {value: read(), error: null};
  } catch (error) {
    return {value: null, error: error.message};
  }
}
// An empty field is "no number", which the scenario rejects with its own message.
const toNumber = text => String(text).trim() === '' ? NaN : Number(text);

export function App({summary, data, bills}) {
  const dash = useMemo(() => load(() => readDashboard(summary, data)), [summary, data]);
  const ladder = useMemo(() => load(() => checkBills(bills)), [bills]);
  const [tab, setTab] = useState('overview');
  const [inputs, setInputs] = useState({principal: String(data.config.default_principal), inflation: String(data.config.default_inflation_pct), weeks: 13});
  const [payments, setPayments] = useState([]);
  if (dash.error !== null) return (
    <main className="shell"><Banner status="error"><BannerContent>Dashboard data are invalid: {dash.error} Ask the data maintainer to rebuild data.js.</BannerContent></Banner></main>
  );
  const assumptions = {principal: toNumber(inputs.principal), inflation: toNumber(inputs.inflation), weeks: inputs.weeks};
  const fresh = freshness(dash.value, TODAY);
  const shared = {dash: dash.value, ladder, today: TODAY, inputs, setInputs, assumptions, payments, setPayments, goTo: setTab};
  return (
    <>
      <header className="app-header">
        <Text styleAs="h3" as="h1" className="brand">USD Cash Reserve Lab</Text>
        <Text color="secondary">Short-term USD reserve: Treasury bill maturities and purchasing power · saved quote {dash.value.quoteDate}</Text>
      </header>
      <main className="shell">
        <Banner status={fresh.warn ? 'warning' : 'info'} variant="secondary" className="status-banner">
          <BannerContent>{fresh.text} Saved quotes are observations, not executable offers.</BannerContent>
        </Banner>
        <Tabs value={tab} onChange={(event, value) => setTab(value)}>
          <TabBar divider>
            <TabList appearance="transparent" aria-label="Dashboard views">
              {TABS.map(t => <Tab key={t.id} value={t.id}><TabTrigger>{t.label}</TabTrigger></Tab>)}
            </TabList>
          </TabBar>
          {TABS.map(({id, View}) => <TabPanel key={id} value={id} className="tab-panel"><View {...shared} /></TabPanel>)}
        </Tabs>
      </main>
    </>
  );
}
