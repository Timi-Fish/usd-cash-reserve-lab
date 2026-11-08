import '@fontsource/open-sans/latin-400.css';
import '@fontsource/open-sans/latin-600.css';
import '@fontsource/open-sans/latin-700.css';
import '@salt-ds/theme/index.css';
import '@salt-ds/theme/css/theme-next.css';
import './styles.css';
import '../../liquidity-calendar/ladder.js'; // defines globalThis.Ladder, shared with the calendar page
import {createRoot} from 'react-dom/client';
import {SaltProviderNext} from '@salt-ds/core';
import {App} from './App.jsx';

// The required loader in index.html hands over the data through window.labDashboardInput, before or after this module runs.
const root = createRoot(document.getElementById('root'));
function show() {
  const {summary, data} = window.labDashboardInput;
  root.render(
    <SaltProviderNext applyClassesTo="root" mode="light" accent="teal" corner="rounded" headingFont="Open Sans" actionFont="Open Sans">
      <App summary={summary} data={data} bills={window.BILL_LADDER_DATA} />
    </SaltProviderNext>
  );
}
if (window.labDashboardInput) show();
document.addEventListener('lab-dashboard-data', show);
