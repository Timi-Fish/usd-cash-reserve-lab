import {H1, Text} from '@salt-ds/core';

export function App({summary}) {
  return (
    <main className="shell">
      <H1>{summary.title}</H1>
      <Text>Saved Treasury quote {summary.as_of}</Text>
    </main>
  );
}
