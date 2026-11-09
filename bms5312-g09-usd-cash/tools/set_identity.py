#!/usr/bin/env python3
"""Write the submission ZIP named with the dashboard ID CLASS_PREFIX-gNN-usd-cash, for example:

  python3 tools/set_identity.py --prefix bms5312 --group g09

A new ID makes a renamed copy next to this folder (IDs replaced, data rebuilt, calculation check rerun), then zips it.
The ID already in project.json zips this folder as it is, after checking that data.js still matches a rebuild of
its inputs. Working folders, installed packages and build output never enter the ZIP."""
import argparse,fnmatch,json,re,shutil,subprocess,sys,tempfile,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SKIP=('__pycache__','*.pyc','*.tmp','candidate','previous','node_modules','dist','.DS_Store')  # course rule: no packages, backups or caches
p=argparse.ArgumentParser(description=__doc__,formatter_class=argparse.RawDescriptionHelpFormatter);p.add_argument('--prefix',required=True);p.add_argument('--group',required=True);a=p.parse_args()
if not re.fullmatch('[a-z0-9]+(?:-[a-z0-9]+)*',a.prefix) or not re.fullmatch('g[0-9]{2,3}',a.group):p.error('Use a lowercase hyphenated class prefix and group such as g07')
ident=a.prefix+'-'+a.group+'-usd-cash'
if len(ident)>48:p.error('Dashboard ID must be at most 48 characters')
old=json.loads((ROOT/'project.json').read_text());oldid=old['dashboard_id'];oldgroup=old['group_id']
def rebuild(folder,out,*extra):subprocess.run([sys.executable,str(folder/'calculations/rebuild.py'),*extra,'--out',str(out)],check=True,stdout=subprocess.DEVNULL)
if ident==oldid:
 target=ROOT
 with tempfile.TemporaryDirectory() as tmp:
  rebuild(ROOT,tmp)
  if (Path(tmp)/'data.js').read_bytes()!=(ROOT/'data.js').read_bytes():p.error('data.js does not match a rebuild of data/ and project.json; release data only through SKILL.md')
else:
 target=ROOT.parent/ident
 if target.exists():p.error('Target already exists; choose a clean destination to avoid overwrite')
 shutil.copytree(ROOT,target,ignore=shutil.ignore_patterns(*SKIP))
 for f in target.rglob('*'):
  if not f.is_file() or {'evidence','raw'}&set(f.relative_to(target).parts):continue  # evidence and raw snapshots stay byte-identical
  if f.suffix in ['.md','.json','.html','.js','.yml','.csv']:
   s=f.read_text();s=s.replace(oldid,ident).replace(oldgroup+':',a.group+':')
   if f.name=='ontology.yml':s=s.replace('group: '+oldgroup,'group: '+a.group)
   f.write_text(s)
 for f in [target/'project.json',target/'maintenance/baseline_config.json',target/'maintenance/invalid_unit_config.json']:
  c=json.loads(f.read_text());c.update(dashboard_id=ident,group_id=a.group,identity_status='Group '+a.group+' · '+a.prefix);f.write_text(json.dumps(c,indent=2)+'\n')
 # The frozen test release takes the new identity as well, rebuilt from its own frozen inputs so later releases cannot change it.
 fixture=target/'tests/fixtures/data_2026-10-26.js'
 fc=json.loads(fixture.read_text().split('=',1)[1].strip().removesuffix(';'))['data']['config']
 fc.update(dashboard_id=ident,group_id=a.group,identity_status='Group '+a.group+' · '+a.prefix)
 with tempfile.TemporaryDirectory() as tmp:
  rebuild(target,tmp)
  shutil.copyfile(Path(tmp)/'data.js',target/'data.js')
  for n in ['quotes_normalized.csv','cpi_normalized.csv']:shutil.copyfile(Path(tmp)/n,target/'data'/n)
  (Path(tmp)/'fixture.json').write_text(json.dumps(fc,indent=2))
  rebuild(target,Path(tmp)/'fixture','--input',str(target/'tests/fixtures/inputs_2026-10-26'),'--config',str(Path(tmp)/'fixture.json'))
  shutil.copyfile(Path(tmp)/'fixture'/'data.js',fixture)
 subprocess.run([sys.executable,str(target/'calculations/verify.py')],check=True)
archive=target.parent/(ident+'.zip')
if archive.exists():p.error(archive.name+' already exists; move or delete it first')
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
 for f in sorted(target.rglob('*')):
  rel=f.relative_to(target)
  if f.is_file() and not any(fnmatch.fnmatch(part,pat) for part in rel.parts for pat in SKIP):z.write(f,Path(ident)/rel)
print('Created '+archive.name+' with folder '+ident+('' if ident==oldid else ' (was '+oldid+')')+'.')
print('presentation.pdf is not rewritten: export it again if it shows another ID. Open the page from the unzipped folder before submitting.')
