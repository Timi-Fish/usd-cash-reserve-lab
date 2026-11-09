import {useState} from 'react';
import {Card, Checkbox, FormField, FormFieldLabel, H3, Table, TBody, TD, TH, THead, TR, Text, ToggleButton, ToggleButtonGroup} from '@salt-ds/core';
import {BillKey} from '../components/BillKey.jsx';
import {LineChart} from '../components/LineChart.jsx';
import {historyWindow} from '../model.js';
import {pct} from '../format.js';

const WINDOWS = [['12', '12 months'], ['24', '24 months'], ['all', 'All saved']];
const SERIES = [{key: 'bill13', weeks: 13, label: '13-week', tone: 'bill13', dashed: false}, {key: 'bill26', weeks: 26, label: '26-week', tone: 'bill26', dashed: true}];
// Table cells for one month; a month without a source observation says so instead of showing a number.
const rateCells = r => r.rate === null ? ['No quote', 'No quote', 'No quote'] : [r.rate.date, pct(r.rate.bill13), pct(r.rate.bill26)];
const cpiCells = r => r.cpi === null ? ['Missing', 'Missing'] : [r.cpi.level === null ? 'Missing' : r.cpi.level.toFixed(3), pct(r.cpi.yoy)];

export function History({dash}) {
  const [choice, setChoice] = useState('24');
  const [shown, setShown] = useState({bill13: true, bill26: true});
  const w = historyWindow(dash, choice);
  const labels = w.rows.map(r => r.month);
  const visible = SERIES.filter(s => shown[s.key]);
  return (
    <div className="view">
      <Card className="card">
        <div className="toolbar">
          <FormField>
            <FormFieldLabel>Window</FormFieldLabel>
            <ToggleButtonGroup value={choice} onChange={event => setChoice(event.currentTarget.value)}>
              {WINDOWS.map(([value, label]) => <ToggleButton key={value} value={value}>{label}</ToggleButton>)}
            </ToggleButtonGroup>
          </FormField>
          <FormField>
            <FormFieldLabel>Rate series</FormFieldLabel>
            <div className="checks">
              {SERIES.map(s => <Checkbox key={s.key} label={<BillKey tenor={s.weeks}>{s.label}</BillKey>} checked={shown[s.key]} onChange={event => setShown({...shown, [s.key]: event.target.checked})} />)}
            </div>
          </FormField>
        </div>
        <Text color="secondary" styleAs="label">Both charts share the window {w.start} to {w.end}, anchored to the latest saved month. Missing observations stay as gaps.</Text>
      </Card>
      <div className="split-even">
        <Card className="card">
          <H3>Treasury bill discount quotes</H3>
          {visible.length === 0 ? <Text color="secondary">Both rate series are hidden. Tick one to draw the chart.</Text> : (
            <LineChart xAxis={{type: 'category', labels}} xTitle="Month (last saved quote)" yTitle="Bank discount, percent" format={v => pct(v)}
              description="Monthly last saved bank discount quotes for the selected Treasury bills; the table below lists exact values."
              series={visible.map(s => ({label: s.label, values: w.rows.map(r => r.rate === null ? null : r.rate[s.key]), tone: s.tone, dashed: s.dashed, radii: 0}))} />
          )}
          <Text color="secondary" styleAs="label">The newest month may be incomplete. Quotes are an annual convention, not holding returns.</Text>
        </Card>
        <Card className="card">
          <H3>CPI-U, year on year</H3>
          <LineChart xAxis={{type: 'category', labels}} xTitle="Observation month" yTitle="Year-on-year change, percent" format={v => pct(v)}
            description="Year-on-year change in CPI-U, U.S. city average, not seasonally adjusted, by observation month; the table below lists exact values."
            series={[{label: 'CPI-U year on year', values: w.rows.map(r => r.cpi === null ? null : r.cpi.yoy), tone: 'neutral', dashed: false, radii: 0}]} />
          <Text color="secondary" styleAs="label">Plotted by observation month, not release date. October 2025 was not published by BLS and stays missing.</Text>
        </Card>
      </div>
      <Card className="card">
        <H3>Exact values</H3>
        <div className="table-scroll">
          <Table zebra className="values-table">
            <THead><TR><TH>Month</TH><TH>Quote date</TH><TH textAlign="right"><BillKey tenor={13}>13-week</BillKey></TH><TH textAlign="right"><BillKey tenor={26}>26-week</BillKey></TH><TH textAlign="right">CPI-U level</TH><TH textAlign="right">CPI year on year</TH></TR></THead>
            <TBody>
              {[...w.rows].reverse().map(r => (
                <TR key={r.month}>
                  <TH scope="row">{r.month}</TH>
                  {[...rateCells(r), ...cpiCells(r)].map((text, i) => <TD key={i} textAlign={i === 0 ? 'left' : 'right'}>{text}</TD>)}
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
