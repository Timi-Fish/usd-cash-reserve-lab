// Puts the runtime data beside dist/index.html: the accepted data.js, plus a seven-tenor bills.js rebuilt
// offline from the same saved snapshot, so the dashboard and the calendar describe the same quote date.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(here, '../../..');
const dist = path.resolve(here, '../dist');
fs.copyFileSync(path.join(project, 'data.js'), path.join(dist, 'data.js'));
const config = JSON.parse(fs.readFileSync(path.join(project, 'project.json'), 'utf8'));
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'salt-dashboard-stage-'));
execFileSync('python3', ['-I', path.join(project, 'extensions', 'auto-refresh', 'refresh.py'),
  '--sources', path.join(project, 'data', 'raw'), '--date', config.review_date,
  '--out', scratch, '--ladder-out', path.join(dist, 'bills.js')], {stdio: 'inherit'});
fs.rmSync(scratch, {recursive: true, force: true});
