// Screenshots for the speaker guide: replay each speaker's clicks in headless Chrome, capture the region they talk
// about (2x density) and record where every numbered click target sits inside that capture (percentages).
// Writes <outDir>/<state>.png and <outDir>/marks.json; build_guide.py turns them into SPEAKER_GUIDE.pdf.
// Usage, from the repository root (Google Chrome and Node 18+):
//   node group/speaker-guide/capture_guide.mjs file://$PWD/bms5312-g09-usd-cash/index.html group/speaker-guide/shots
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [url, outDir] = process.argv.slice(2);
fs.mkdirSync(outDir, {recursive: true});
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'speaker-guide-chrome-'));
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ['--headless=new', '--remote-debugging-port=9347', `--user-data-dir=${profile}`, '--no-first-run', '--hide-scrollbars',
    '--allow-file-access-from-files', 'about:blank'], {stdio: 'ignore'});
const sleep = ms => new Promise(r => setTimeout(r, ms));
let socketUrl;
for (let i = 0; i < 50 && !socketUrl; i++) {
  try { socketUrl = (await (await fetch('http://127.0.0.1:9347/json/list')).json()).find(t => t.type === 'page').webSocketDebuggerUrl; }
  catch { await sleep(200); }
}
const ws = new WebSocket(socketUrl);
await new Promise(r => ws.addEventListener('open', r, {once: true}));
let id = 0;
const pending = new Map();
const problems = [];
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') problems.push(m.params.exceptionDetails.exception.description);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const n = ++id;
  pending.set(n, m => m.error ? reject(new Error(method + ': ' + m.error.message)) : resolve(m.result));
  ws.send(JSON.stringify({id: n, method, params}));
});
const evaluate = async expression => {
  const r = await send('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
  if (r.exceptionDetails) throw new Error(expression.slice(0, 80) + ' -> ' + r.exceptionDetails.exception.description);
  return r.result.value;
};

// Page-side helpers: find visible elements by text, climb to a block of a minimum size, and measure in page coordinates.
const HELPERS = `window.G = {
  vis: e => !!e && e.offsetParent !== null,
  smallest(text, sel = '*') {
    let best = null, area = Infinity;
    for (const e of document.querySelectorAll(sel)) {
      if (!G.vis(e) || !e.textContent.includes(text)) continue;
      const r = e.getBoundingClientRect(), a = r.width * r.height;
      if (a > 0 && a < area) { best = e; area = a; }
    }
    if (!best) throw new Error('not found: ' + text);
    return best;
  },
  up(e, minW, minH = 0) {
    while (e.parentElement && (e.getBoundingClientRect().width < minW || e.getBoundingClientRect().height < minH)) e = e.parentElement;
    return e;
  },
  rect(e) { const r = e.getBoundingClientRect(); return {x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height}; },
  union(a, b) { const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y); return {x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y}; },
  tab(i) { return document.querySelectorAll('[role="tab"]')[i]; },
  button(text) { const b = [...document.querySelectorAll('button')].find(b => G.vis(b) && b.textContent.trim().startsWith(text)); if (!b) throw new Error('no button ' + text); return b; },
  heading(text) {
    const all = [...document.querySelectorAll('*')].filter(h => G.vis(h) && h.textContent.trim() === text);
    if (!all.length) throw new Error('no element with text ' + text);
    return all.reduce((a, b) => (a.getBoundingClientRect().width * a.getBoundingClientRect().height <= b.getBoundingClientRect().width * b.getBoundingClientRect().height ? a : b));
  },
  inflation() { const l = [...document.querySelectorAll('label')].find(l => G.vis(l) && l.textContent.includes('Assumed annual inflation'));
    return l.htmlFor ? document.getElementById(l.htmlFor) : l.parentElement.querySelector('input'); },
  setValue(input, value) { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value);
    input.dispatchEvent(new Event('input', {bubbles: true})); input.dispatchEvent(new Event('change', {bubbles: true})); input.blur(); },
  fillDates() { for (const i of document.querySelectorAll('input[type="date"]')) if (!i.value) G.setValue(i, '2027-06-15'); }
}; true`;
const rect = js => evaluate(`G.rect(${js})`);
const act = async (js, ms = 400) => { await evaluate(`(${js}, document.activeElement.blur(), scrollTo(0, 0), true)`); await sleep(ms); };
const states = {};
async function shoot(name, marks, minBottom = 0, pad = 16) {
  const top = await rect('G.tab(0).parentElement');
  const bottom = Math.max(minBottom, ...marks.map(m => m.r.y + m.r.h)) + pad;
  const y = name === 's1' || name === 's4' ? 0 : Math.max(0, top.y - pad);
  const clip = {x: 0, y, width: 1440, height: bottom - y};
  const shot = await send('Page.captureScreenshot', {format: 'png', captureBeyondViewport: true, clip: {...clip, scale: 1}});
  fs.writeFileSync(path.join(outDir, `${name}.png`), Buffer.from(shot.data, 'base64'));
  const pct = (v, o, s) => +(100 * (v - o) / s).toFixed(2);
  states[name] = {image: `${name}.png`, width: clip.width, height: Math.round(clip.height), marks: marks.map(({n, r}) => ({n,
    x: pct(r.x, clip.x, clip.width), y: pct(r.y, clip.y, clip.height), w: pct(r.x + r.w, clip.x, clip.width) - pct(r.x, clip.x, clip.width),
    h: pct(r.y + r.h, clip.y, clip.height) - pct(r.y, clip.y, clip.height)}))};
}

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', {width: 1440, height: 900, deviceScaleFactor: 2, mobile: false});
await send('Page.navigate', {url});
await sleep(1500);
await evaluate(HELPERS);

// Speaker 1: the page as it opens.
await shoot('s1', [
  {n: 1, r: await rect(`G.up(G.smallest('USD Cash Reserve Lab', 'h1'), 1400)`)},
  {n: 2, r: await rect(`G.up(G.smallest('Within project age limits'), 1200)`)},
  {n: 3, r: await rect(`G.up(G.heading('Payment timing'), 1200, 80)`)},
  {n: 4, r: await rect(`G.button('13-week').parentElement`)}
]);

// Speaker 2a: Calendar, example dates, tuition selected.
await act(`G.tab(1).click()`);
const tabCal = await rect('G.tab(1)');
await act(`G.button('Try example dates').click()`);
await act(`G.button('Example: tuition payment').click()`);
await evaluate('G.fillDates(); document.activeElement.blur(); true');
await sleep(300);
await shoot('s2a', [
  {n: 1, r: tabCal},
  {n: 2, r: await evaluate(`G.union(G.rect(G.smallest('Payment dates')), G.rect(G.smallest('of 12')))`)},
  {n: 3, r: await rect(`G.button('Example: tuition payment')`)},
  {n: 4, r: await rect(`G.up(G.smallest('Example: tuition payment, Monday'), 800)`)},
  // February and March 2027 side by side: from the February title across two month columns, five week rows deep.
  {n: 5, r: await evaluate(`(() => { const f = G.rect(G.smallest('February 2027')), m = G.rect(G.smallest('March 2027')), p = m.x - f.x;
    return {x: f.x - 6, y: f.y - 6, w: 2 * p - 14, h: 372}; })()`)}
]);

// Speaker 2b: Overview with the examples, inflation 6%.
await act(`G.tab(0).click()`);
await evaluate(`G.setValue(G.inflation(), '6'); true`);
await sleep(400);
await shoot('s2b', [
  {n: 6, r: await rect('G.tab(0)')},
  {n: 7, r: await rect(`G.smallest('reference bills valued below', 'p')`)},
  {n: 8, r: await rect('G.inflation()')},
  {n: 9, r: await rect(`G.up(G.smallest('Purchasing power decreases by'), 700, 200)`)}
]);

// Speaker 3a: Method.
await act(`G.tab(4).click()`);
await shoot('s3a', [
  {n: 1, r: await rect('G.tab(4)')},
  {n: 2, r: await rect(`G.up(G.heading('How the numbers are made'), 1000, 200)`)},
  {n: 3, r: await evaluate(`G.union(G.rect(G.heading('Data')), G.rect(G.smallest('All seven bill tenors for the payment calendar', 'a')))`)}
]);

// Speaker 3b: Scenarios after "Use 4.17%".
await act(`G.tab(2).click()`);
await act(`G.button('Use 4.17%').click()`);
await shoot('s3b', [
  {n: 4, r: await rect('G.tab(2)')},
  {n: 5, r: await rect(`G.button('Use 4.17%')`)},
  {n: 6, r: await rect(`G.up(G.smallest('= Purchasing power at maturity'), 300, 80)`)}
]);

// Speaker 4: History.
await act(`G.tab(3).click()`);
const chart = await rect(`G.up(G.heading('Treasury bill discount quotes'), 600, 300)`);
await shoot('s4', [
  {n: 1, r: await rect(`G.up(G.smallest('Within project age limits'), 1200)`)},
  {n: 2, r: await rect('G.tab(3)')},
  {n: 3, r: {x: chart.x + chart.w * 0.82, y: chart.y + chart.h * 0.14, w: chart.w * 0.16, h: chart.h * 0.5}}
], chart.y + chart.h);

// Speaker 5: Method, freshness rules.
await act(`G.tab(4).click()`);
await shoot('s5', [
  {n: 1, r: await rect('G.tab(4)')},
  {n: 2, r: await rect(`G.up(G.heading('Freshness and maintenance'), 500, 100)`)},
  {n: 3, r: await rect('G.tab(0)')}
]);

fs.writeFileSync(path.join(outDir, 'marks.json'), JSON.stringify(states, null, 1));
console.log('states:', Object.keys(states).join(' '), '| problems:', JSON.stringify(problems));
ws.close();
chrome.kill();
