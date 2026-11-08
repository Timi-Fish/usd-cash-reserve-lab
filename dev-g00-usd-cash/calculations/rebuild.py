#!/usr/bin/env python3
"""Offline deterministic rebuild. Python 3.10+ standard library only."""
import argparse, calendar, csv, hashlib, json, math, sys, xml.etree.ElementTree as ET
from pathlib import Path
from datetime import date
ROOT = Path(__file__).resolve().parents[1]
DISCLAIMER = 'Educational project. Not investment advice.'
NS = {'m':'http://schemas.microsoft.com/ado/2007/08/dataservices/metadata'}

def scenario(principal, discount_pct, days, inflation_pct):
    if not all(isinstance(x,(int,float)) and math.isfinite(x) for x in [principal,discount_pct,days,inflation_pct]):
        raise ValueError('Non-finite or missing scenario input')
    if principal <= 0 or principal > 100000000 or not 1 <= days <= 366 or not -5 <= discount_pct <= 30 or not -20 <= inflation_pct <= 50:
        raise ValueError('Scenario input outside documented bounds')
    fraction = 1-discount_pct/100*days/360
    if fraction <= 0: raise ValueError('Non-positive modeled price')
    growth = (1+inflation_pct/100)**(days/365)
    nominal = principal/fraction
    real = nominal/growth
    return {'price_per_100':100*fraction,'nominal_return_pct':(1/fraction-1)*100,
            'period_inflation_pct':(growth-1)*100,'real_return_pct':(real/principal-1)*100,
            'nominal_end':nominal,'real_end':real,'real_change':real-principal,
            'break_even_annual_pct':((1/fraction)**(365/days)-1)*100,
            'zero_interest_real_end':principal/growth,
            'nominal_interest':nominal-principal,'purchasing_power_adjustment':nominal-real,'cash_advantage':real-principal/growth}

def read_inputs(input_dir, cutoff):
    raw=input_dir/'raw'
    response=json.loads((raw/'cpi_2023_2026.json').read_text())
    if response.get('status')!='REQUEST_SUCCEEDED': raise ValueError('BLS request not successful')
    series=response['Results']['series']
    if len(series)!=1 or series[0]['seriesID']!='CUUR0000SA0': raise ValueError('Unexpected CPI series')
    cpi={}
    for r in series[0]['data']:
        if not r['period'].startswith('M') or r['period']=='M13':continue
        key=r['year']+'-'+r['period'][1:]
        try:value=float(r['value'])
        except (TypeError,ValueError):value=None
        if value is not None and (not math.isfinite(value) or value<=0):raise ValueError('Invalid CPI level')
        if key in cpi:raise ValueError('Duplicate CPI month')
        cpi[key]=value
    quotes=[]
    for f in sorted(raw.glob('treasury_*.xml')):
        for prop in ET.parse(f).findall('.//m:properties',NS):
            r={x.tag.split('}')[-1]:x.text for x in prop}
            day=r['INDEX_DATE'][:10]
            date.fromisoformat(day)
            if r.get('QUOTE_DATE') and r['QUOTE_DATE'][:10]!=day:raise ValueError('Quote date and index date disagree')
            if day>cutoff:continue
            row={'date':day}
            for w in [13,26]:
                k=str(w)
                for label,field in [('discount','CLOSE'),('coupon_equivalent','YIELD')]:
                    v=r.get('ROUND_B1_'+field+'_'+k+'WK_2')
                    if v is None:raise ValueError('Missing required Treasury rate '+day+' '+k)
                    val=float(v)
                    if not math.isfinite(val) or not -5<=val<=30:raise ValueError('Invalid Treasury rate '+day)
                    row[k+'_'+label]=val
                maturity=r.get('MATURITY_DATE_'+k+'WK')
                row[k+'_maturity']=maturity[:10] if maturity else None
                row[k+'_cusip']=r.get('CUSIP_'+k+'WK')
            quotes.append(row)
    quotes.sort(key=lambda r:r['date'])
    if not quotes or len({q['date'] for q in quotes})!=len(quotes):raise ValueError('Missing or duplicate quote dates')
    return cpi,quotes

def build(input_dir, config):
    if config['rate_unit']!='percent' or config['cpi_unit']!='index-points':raise ValueError('Incompatible input unit')
    cpi,quotes=read_inputs(input_dir,config['quote_cutoff'])
    latest=quotes[-1]
    release=config['cpi_release']
    if release['release_date']>config['review_date']:raise ValueError('CPI release is in the future')
    last_month=release['observation_month']
    if cpi.get(last_month) is None:raise ValueError('Required latest CPI observation missing')
    cutoff=date.fromisoformat(config['quote_cutoff'])
    cpi_months=[]; values=[]; yoy=[]
    start=2023*12; end=int(last_month[:4])*12+int(last_month[5:])-1
    for i in range(start,end+1):
        y,m=divmod(i,12);key=f'{y:04d}-{m+1:02d}'
        prev=f'{y-1:04d}-{m+1:02d}'
        v=cpi.get(key); p=cpi.get(prev)
        cpi_months.append(key);values.append(v);yoy.append((v/p-1)*100 if v is not None and p is not None else None)
    instruments=[]
    for weeks in [13,26]:
        k=str(weeks); mat=latest[k+'_maturity']
        if mat is None:raise ValueError('Latest quote lacks a required maturity date')
        if not latest[k+'_cusip']:raise ValueError('Missing reference CUSIP')
        days=(date.fromisoformat(mat)-date.fromisoformat(latest['date'])).days
        if not 1<=days<=210:raise ValueError('Invalid maturity interval')
        calc=scenario(config['default_principal'],latest[k+'_discount'],days,config['default_inflation_pct'])
        instruments.append({'weeks':weeks,'quote_date':latest['date'],'maturity_date':mat,'days':days,'cusip':latest[k+'_cusip'],'discount_pct':latest[k+'_discount'],'coupon_equivalent_pct':latest[k+'_coupon_equivalent'],'default_result':calc})
    review=date.fromisoformat(config['review_date'])
    quote_age=(review-date.fromisoformat(latest['date'])).days
    cpi_end=date.fromisoformat(last_month+'-'+str(calendar.monthrange(int(last_month[:4]),int(last_month[5:]))[1]))
    stale=quote_age>config['freshness']['quote_days'] or (review-cpi_end).days>config['freshness']['cpi_days']
    months={}
    for q in quotes:months[q['date'][:7]]=q
    history=list(months.values())
    result=instruments[0]['default_result']
    payload={'summary':{'dashboard':config['dashboard_id'],'title':'USD Cash Reserve Lab','personas':['family-office-client'],'workflow':'wealth-planning','topics':['wealth-and-goals'],'question':'When is the cash needed, which reference maturity fits that date, and how could purchasing power change?', 'as_of':latest['date'],'refresh':{'mode':'manual','cadence':'monthly'},'headline':f"13-week reference: {result['real_return_pct']:+.2f}% modeled real return at {config['default_inflation_pct']:.1f}% annual inflation.",'state':None,'key_numbers':[{'label':'13-week bank discount rate','concept':config['group_id']+':bank-discount-rate','value':instruments[0]['discount_pct'],'unit':'percent','as_of':latest['date'],'trend':None},{'label':'26-week bank discount rate','concept':config['group_id']+':bank-discount-rate','value':instruments[1]['discount_pct'],'unit':'percent','as_of':latest['date'],'trend':None},{'label':'Latest CPI year-on-year','concept':'core:inflation','value':yoy[-1],'unit':'percent','as_of':str(cpi_end),'trend':None},{'label':'Default scenario real return','concept':config['group_id']+':real-holding-return','value':result['real_return_pct'],'unit':'percent','as_of':latest['date'],'trend':None}],'disclaimer':DISCLAIMER},'data':{'config':config,'instruments':instruments,'dates':[r['date'] for r in history],'series':{'bill13_discount':[r['13_discount'] for r in history],'bill26_discount':[r['26_discount'] for r in history]},'cpi':{'dates':cpi_months,'levels':values,'yoy_pct':yoy,'release':release},'freshness':{'checked_on':config['review_date'],'stale_at_build':stale},'sources':[{'label':'U.S. Treasury daily bill rates','url':'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_bill_rates&field_tdr_date_value=2026'},{'label':'BLS CPI-U historical levels','url':'https://www.bls.gov/regions/mid-atlantic/data/consumerpriceindexhistorical_us_table.htm'},{'label':'BLS CPI release','url':release['url']}]}}
    if len(payload['summary']['headline'])>140:raise ValueError('Headline too long')
    return payload,quotes

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--input',type=Path,default=ROOT/'data')
    ap.add_argument('--config',type=Path,default=ROOT/'project.json')
    ap.add_argument('--out',type=Path,default=ROOT/'candidate')
    a=ap.parse_args(); config=json.loads(a.config.read_text()); payload,quotes=build(a.input,config)
    encoded='window.DASHBOARD_DATA = '+json.dumps(payload,indent=2,allow_nan=False)+';\n'
    a.out.mkdir(parents=True,exist_ok=True)
    temp=a.out/'data.js.tmp';temp.write_text(encoded);temp.replace(a.out/'data.js')
    with (a.out/'quotes_normalized.csv').open('w',newline='') as f:
        w=csv.DictWriter(f,fieldnames=list(quotes[0]));w.writeheader();w.writerows(quotes)
    with (a.out/'cpi_normalized.csv').open('w',newline='') as f:
        w=csv.writer(f);w.writerow(['observation_month','cpi_u_nsa_index','yoy_percent'])
        w.writerows(zip(payload['data']['cpi']['dates'],payload['data']['cpi']['levels'],payload['data']['cpi']['yoy_pct']))
    (a.out/'rebuild_report.json').write_text(json.dumps({'status':'candidate_generated','dashboard':config['dashboard_id'],'quote_date':payload['summary']['as_of'],'cpi_month':payload['data']['cpi']['release']['observation_month'],'rows':len(quotes),'human_release':'pending','sha256_data_js':hashlib.sha256(encoded.encode()).hexdigest()},indent=2))
    print(json.dumps({'status':'candidate_generated','out':str(a.out),'quote_date':payload['summary']['as_of'],'rows':len(quotes)}))
if __name__=='__main__':
    try:main()
    except Exception as exc:print('STOP: '+str(exc),file=sys.stderr);sys.exit(1)
