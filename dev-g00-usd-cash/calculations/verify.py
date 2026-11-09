#!/usr/bin/env python3
"""Second calculation route: Decimal arithmetic traced to the saved raw source files. Writes evidence/calculation_checks.*"""
import csv,json,sys,hashlib,xml.etree.ElementTree as ET
from decimal import Decimal,getcontext
from pathlib import Path
from datetime import date
getcontext().prec=40
ROOT=Path(__file__).resolve().parents[1]
payload=json.loads((ROOT/'data.js').read_text().split('=',1)[1].strip().rstrip(';'))
D=Decimal
out=[]
def record(name,expected,actual,tolerance,method):
 e,a=D(str(expected)),D(str(actual));ok=abs(e-a)<=D(str(tolerance));out.append({'check':name,'expected':str(e),'actual':str(a),'tolerance':str(tolerance),'status':'pass' if ok else 'fail','method':method})
for item in payload['data']['instruments']:
 d=D(str(item['discount_pct']))/100;n=D(str(item['days']));p=D('100000');pi=D('0.03')
 price=100*(1-d*n/360);nom=p*100/price;growth=((1+pi).ln()*n/365).exp();real=nom/growth
 record(str(item['weeks'])+' week price',price,item['default_result']['price_per_100'],'0.00000001','Decimal: 100*(1-d*n/360)')
 record(str(item['weeks'])+' week real proceeds',real,item['default_result']['real_end'],'0.01','Decimal logarithm/exponential for inflation factor; separate arithmetic path')
 record(str(item['weeks'])+' week nominal return',(100/price-1)*100,item['default_result']['nominal_return_pct'],'0.00000001','Decimal: face/price-1')
 raw=ET.parse(ROOT/'data/raw'/('treasury_'+item['quote_date'][:4]+'.xml'))
 rows=[{x.tag.split('}')[-1]:x.text for x in prop} for prop in raw.findall('.//{http://schemas.microsoft.com/ado/2007/08/dataservices/metadata}properties')]
 q=next(r for r in rows if r['INDEX_DATE'][:10]==item['quote_date'])
 record(str(item['weeks'])+' week original quote',q['ROUND_B1_CLOSE_'+str(item['weeks'])+'WK_2'],item['discount_pct'],'0','Exact XML field and observation date')
 assert q['MATURITY_DATE_'+str(item['weeks'])+'WK'][:10]==item['maturity_date']
 rawdays=(date.fromisoformat(item['maturity_date'])-date.fromisoformat(item['quote_date'])).days
 record(str(item['weeks'])+' week calendar days',rawdays,item['days'],'0','Python date subtraction')
raw=json.loads((ROOT/'data/raw/cpi_2023_2026.json').read_text())['Results']['series'][0]['data']
lookup={r['year']+'-'+r['period'][1:]:r['value'] for r in raw if r['period']!='M13'}
inflation=next(k for k in payload['summary']['key_numbers'] if k['concept']=='core:inflation')
m=inflation['as_of'][:7];prior=str(int(m[:4])-1)+m[4:]
yoy=(D(lookup[m])/D(lookup[prior])-1)*100
record('Latest CPI annual change ('+m+')',yoy,inflation['value'],'0.00000001','BLS raw JSON CPI divided by the same month a year earlier')
# Use fixed documented hand-check fixtures, not numbers derived from implementation.
sys.path.insert(0,str(ROOT/'calculations'));from rebuild import scenario
z=scenario(100000,0,91,0)
record('Zero rate, zero inflation boundary',100000,z['real_end'],'0.01','Identity: no discount, no price growth')
z=scenario(100000,4,90,0)
record('90-day 4% discount price',99,z['price_per_100'],'0.00000001','100*(1-.04*90/360)=99')
record('90-day 4% nominal proceeds',D(100000)/D('.99'),z['nominal_end'],'0.01','100000/.99')
break_even=z['break_even_annual_pct'];z2=scenario(100000,4,90,break_even)
record('Break-even annual inflation threshold',100000,z2['real_end'],'0.01','Real return should be zero at modeled break-even')
checks={'route':'calculations/verify.py: Decimal arithmetic traced to the saved raw files','quote_date':payload['summary']['as_of'],'checks':out,'all_pass':all(r['status']=='pass' for r in out)}
(ROOT/'evidence/calculation_checks.json').write_text(json.dumps(checks,indent=2))
with (ROOT/'evidence/calculation_checks.csv').open('w',newline='') as f:
 w=csv.DictWriter(f,fieldnames=list(out[0]));w.writeheader();w.writerows(out)
print(json.dumps({'checks':len(out),'all_pass':checks['all_pass']}))
if not checks['all_pass']:sys.exit(1)
