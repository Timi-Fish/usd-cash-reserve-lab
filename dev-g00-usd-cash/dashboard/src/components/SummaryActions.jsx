import {useState} from 'react';
import {Button, H4, Text} from '@salt-ds/core';
import {DISCLAIMER} from '../model.js';
import {evaluate, summaryLines, summarySections, SUMMARY_TITLE} from '../summary.js';
import {NoBreak} from './NoBreak.jsx';

// Copy and Print for the discussion summary, a record the advisor keeps after the meeting. Copy writes the plain text;
// Print prints the summary alone (the memo below is shown only in print). Both wait for valid inputs.
export function SummaryActions({dash, ladder, assumptions, payments, today}) {
  const [copied, setCopied] = useState('');
  const blocked = evaluate(dash, assumptions).error !== null;
  const copy = () => Promise.resolve().then(() => navigator.clipboard.writeText(summaryLines(dash, assumptions, payments, ladder.value, today).join('\n'))).then(
    () => setCopied('Summary copied.'),
    () => setCopied('This browser blocked copying. Print the summary instead.'));
  return (
    <>
      <Button appearance="bordered" disabled={blocked} onClick={copy}>Copy summary</Button>
      <Button appearance="bordered" disabled={blocked} onClick={() => window.print()}>Print summary</Button>
      <Text color="secondary" styleAs="label" aria-live="polite">{blocked ? 'Fix the assumptions before copying or printing.' : copied}</Text>
      <article className="memo print-memo" aria-label={SUMMARY_TITLE}>
        <Text styleAs="h4" as="p" className="memo-title">{SUMMARY_TITLE}</Text>
        {summarySections(dash, assumptions, payments, ladder.value, today).map(section => (
          <section key={section.title}>
            <H4>{section.title}</H4>
            {section.lines.map((line, i) => <p key={i}><NoBreak text={line} /></p>)}
          </section>
        ))}
        <p className="memo-disclaimer">{DISCLAIMER}</p>
      </article>
    </>
  );
}
