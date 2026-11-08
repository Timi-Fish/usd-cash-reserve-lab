import {useState} from 'react';
import {Button, Card, H3, Text} from '@salt-ds/core';
import {evaluate, summaryLines} from '../summary.js';
import {NoBreak} from '../components/NoBreak.jsx';

export function Summary({dash, ladder, assumptions, payments, today}) {
  const [copied, setCopied] = useState('');
  const lines = summaryLines(dash, assumptions, payments, ladder.value, today);
  const {error} = evaluate(dash, assumptions);
  const blocked = error !== null;
  const copy = () => Promise.resolve().then(() => navigator.clipboard.writeText(lines.join('\n'))).then(
    () => setCopied('Summary copied.'),
    () => setCopied('This browser blocked copying. Select the summary text and copy it instead.'));
  return (
    <div className="view">
      <Card className="card summary-card">
        <H3>Discussion summary</H3>
        <Text color="secondary">Built from the current assumptions, payment dates and data status. It updates with every change.</Text>
        <div className="memo">{lines.map((line, i) => <p key={i}><NoBreak text={line} /></p>)}</div>
        <div className="row-actions summary-actions">
          <Button sentiment="accented" disabled={blocked} onClick={copy}>Copy summary</Button>
          <Button appearance="bordered" disabled={blocked} onClick={() => window.print()}>Print summary</Button>
          <Text color="secondary" aria-live="polite">{blocked ? 'Fix the assumptions before copying or printing.' : copied}</Text>
        </div>
      </Card>
    </div>
  );
}
