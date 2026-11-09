#!/usr/bin/env python3
"""Create a separate renamed submission candidate. Leaves the development pack intact."""
import argparse,json,re,shutil,subprocess,sys,zipfile,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--prefix',required=True);p.add_argument('--group',required=True);a=p.parse_args()
if not re.fullmatch('[a-z0-9]+(?:-[a-z0-9]+)*',a.prefix) or not re.fullmatch('g[0-9]{2,3}',a.group):p.error('Use a lowercase hyphenated class prefix and group such as g07')
ident=a.prefix+'-'+a.group+'-usd-cash'
if len(ident)>48:p.error('Dashboard ID must be at most 48 characters')
target=ROOT.parent/ident
if target.exists():p.error('Target already exists; choose a clean destination to avoid overwrite')
# Working folders, installed packages and build output stay out of the package (course rule).
shutil.copytree(ROOT,target,ignore=shutil.ignore_patterns('__pycache__','*.pyc','*.tmp','candidate','previous','node_modules','dist','.DS_Store'))
old=json.loads((ROOT/'project.json').read_text());oldid=old['dashboard_id'];oldgroup=old['group_id']
for f in target.rglob('*'):
 if not f.is_file() or 'evidence' in f.relative_to(target).parts or 'data/raw' in f.as_posix():continue
 if f.suffix in ['.md','.json','.html','.js','.yml','.csv']:
  s=f.read_text();s=s.replace(oldid,ident).replace(oldgroup+':',a.group+':')
  if f.name=='ontology.yml':s=s.replace('group: '+oldgroup,'group: '+a.group)
  f.write_text(s)
for f in [target/'project.json',target/'maintenance/baseline_config.json',target/'maintenance/invalid_unit_config.json']:
 c=json.loads(f.read_text());c.update(dashboard_id=ident,group_id=a.group,identity_status='Group '+a.group+' · '+a.prefix);f.write_text(json.dumps(c,indent=2)+'\n')
# The frozen test data set takes the new identity as well, rebuilt by the same route so it stays self-consistent.
fixture=target/'tests/fixtures/data_2026-10-26.js'
fc=json.loads(fixture.read_text().split('=',1)[1].strip().removesuffix(';'))['data']['config']
fc.update(dashboard_id=ident,group_id=a.group,identity_status='Group '+a.group+' · '+a.prefix)
with tempfile.TemporaryDirectory() as tmp:
 subprocess.run([sys.executable,str(target/'calculations/rebuild.py'),'--out',tmp],check=True)
 for n in ['data.js']:shutil.copyfile(Path(tmp)/n,target/n)
 for n in ['quotes_normalized.csv','cpi_normalized.csv']:shutil.copyfile(Path(tmp)/n,target/'data'/n)
 (Path(tmp)/'fixture.json').write_text(json.dumps(fc,indent=2))
 subprocess.run([sys.executable,str(target/'calculations/rebuild.py'),'--config',str(Path(tmp)/'fixture.json'),'--out',str(Path(tmp)/'fixture')],check=True)
 shutil.copyfile(Path(tmp)/'fixture'/'data.js',fixture)
subprocess.run([sys.executable,str(target/'calculations/verify.py')],check=True)
archive=target.with_suffix('.zip')
if archive.exists():p.error('ZIP target already exists; the renamed folder was created but archive was not overwritten')
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
 for f in sorted(target.rglob('*')):
  if f.is_file() and '__pycache__' not in f.parts and f.suffix!='.pyc':z.write(f,Path(ident)/f.relative_to(target))
print('Created '+archive.name+' with folder '+ident+' (was '+oldid+').')
print('presentation.pdf is not rewritten: export it again if it shows the old ID. Open the page from the unzipped folder before submitting.')
