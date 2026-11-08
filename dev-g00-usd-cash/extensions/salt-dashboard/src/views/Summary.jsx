import {useState} from 'react';
import {Button, Card, H3, H4, Text} from '@salt-ds/core';
import {DISCLAIMER} from '../model.js';
import {evaluate, summaryLines, summarySections, SUMMARY_TITLE} from '../summary.js';
import {NoBreak} from '../components/NoBreak.jsx';

export function Summary({dash, ladder, assumptions, payments, today}) {
  const [copied, setCopied] = useState('');
  const sections = summarySections(dash, assumptions, payments, ladder.value, today);
  const {error} = evaluate(dash, assumptions);
  const blocked = error !== null;
  const copy = () => Promise.resolve().then(() => navigator.clipboard.writeText(summaryLines(dash, assumptions, payments, ladder.value, today).join('\n'))).then(
    () => setCopied('Summary copied.'),
    () => setCopied('This browser blocked copying. Select the summary text and copy it instead.'));
  return (
    <div className="view">
      <Card className="card summary-card">
        <div className="card-head">
          <div>
            <H3>Discussion summary</H3>
            <Text color="secondary">Built from the current assumptions, payment dates and data status; it updates with every change.</Text>
          </div>
          <div className="row-actions summary-actions">
            <Button sentiment="accented" disabled={blocked} onClick={copy}>Copy summary</Button>
            <Button appearance="bordered" disabled={blocked} onClick={() => window.print()}>Print summary</Button>
          </div>
        </div>
        <Text color="secondary" aria-live="polite">{blocked ? 'Fix the assumptions before copying or printing.' : copied}</Text>
        <article className="memo" aria-label={SUMMARY_TITLE}>
          <Text styleAs="h4" as="p" className="memo-title">{SUMMARY_TITLE}</Text>
          {sections.map(section => (
            <section key={section.title}>
              <H4>{section.title}</H4>
              {section.lines.map((line, i) => <p key={i}><NoBreak text={line} /></p>)}
            </section>
          ))}
          <p className="memo-disclaimer">{DISCLAIMER}</p>
        </article>
      </Card>
    </div>
  );
}
