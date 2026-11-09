import '@fontsource/open-sans/latin-400.css';
import '@fontsource/open-sans/latin-600.css';
import '@fontsource/open-sans/latin-700.css';
import '@fontsource/source-serif-4/latin-600.css';
import '@salt-ds/theme/index.css';
import '@salt-ds/theme/css/theme-next.css';
import './brand.css';
import './styles.css';
import './calendar.css';
import './overview.css';
import './ladder.js'; // defines globalThis.Ladder, shared with the Node checks
import {createRoot} from 'react-dom/client';
import {SaltProviderNext} from '@salt-ds/core';
import {App} from './App.jsx';

// The required loader in index.html hands over the data through window.labDashboardInput, before or after this module runs.
const root = createRoot(document.getElementById('root'));
// Salt offers only Open Sans or Amplitude as the heading font; brand.css swaps headings and figures to Source Serif 4.
function show() {
  const {summary, data} = window.labDashboardInput;
  root.render(
    <SaltProviderNext applyClassesTo="root" mode="light" accent="blue" corner="rounded" headingFont="Open Sans" actionFont="Open Sans">
      <App summary={summary} data={data} />
    </SaltProviderNext>
  );
}
if (window.labDashboardInput) show();
document.addEventListener('lab-dashboard-data', show);
