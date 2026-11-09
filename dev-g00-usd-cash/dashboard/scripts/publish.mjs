// Copies the built page to the project folder as index.html, beside the data.js it reads. It refuses a page that has
// lost a line the course requires, so the accepted index.html is never replaced by an incomplete build.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(here, '../..');
const page = fs.readFileSync(path.resolve(here, '../dist/index.html'), 'utf8');
const {dashboard_id: id} = JSON.parse(fs.readFileSync(path.join(project, 'project.json'), 'utf8'));
const REQUIRED = [`<meta name="lab:dashboard" content="${id}">`, '<section id="lab-about"',
  '<footer class="lab-footer">Educational project. Not investment advice.</footer>', '<script src="data.js"></script>',
  'REQUIRED loader: hosted data first, then data.js. Do not change.'];
const missing = REQUIRED.filter(line => !page.includes(line));
if (missing.length) throw new Error(`dist/index.html lacks required lines: ${missing.join(' | ')}`);
const target = path.join(project, 'index.html');
fs.writeFileSync(target + '.tmp', page);
fs.renameSync(target + '.tmp', target);
console.log(`Published index.html (${(page.length / 1e6).toFixed(2)} MB) for ${id}`);
