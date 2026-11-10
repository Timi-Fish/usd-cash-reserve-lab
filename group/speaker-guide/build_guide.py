"""Build group/SPEAKER_GUIDE.pdf: a cover, one page per speaker and a questions page, A4 landscape.

Each speaker page shows the dashboard captures in shots/ with the click order drawn on them (positions from
shots/marks.json, written by capture_guide.mjs) and the words to say beside each numbered step.
Usage, from the repository root (needs Google Chrome): python3 group/speaker-guide/build_guide.py
"""
import html
import json
import pathlib
import subprocess

HERE = pathlib.Path(__file__).resolve().parent
OUT_HTML = HERE / 'guide.html'
OUT_PDF = HERE.parent / 'SPEAKER_GUIDE.pdf'
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
MARKS = json.loads((HERE / 'shots' / 'marks.json').read_text())

ORDER = [(1, 'User and page', '0:00–0:50'), (2, 'Live dashboard', '0:50–2:15'),
         (3, 'Data and method', '2:15–3:10'), (4, 'AI maintenance', '3:10–4:10'), (5, 'Handover', '4:10–5:00')]

THREAD = ('A benchmark for a family\'s US-dollar payment reserve. First timing: will the cash be there on time? The '
          'calendar checks all seven saved bill maturities. Then value: what does inflation do to it in the safest '
          'short-term bills? Two reference bills, the 3-month and the 6-month. Which bill to buy, and anything beyond '
          'the reserve, stays with the advisor.')

# Each step: (clock, markers, what the driver does, what the speaker says, highlight)
SPEAKERS = [
    dict(n=1, title='Who is the user, and what is the page for?', time='0:00 to 0:50', secs=50,
         start='Overview, just reloaded', end='Overview, nothing clicked', shots=[('s1', range(1, 5))],
         asked=['why13', 'otherassets'], steps=[
             ('0:00', [1], 'Page as it opens. Point to the title band.',
              'Our user is a family-office client and their advisor. The family keeps a US-dollar reserve for payments '
              'in the next few months: a tax instalment, tuition, a household budget.', False),
             ('0:12', [2], 'Point to the blue banner.',
              'Every number comes from official sources, and this banner shows how old each one is.', False),
             ('0:18', [3], 'Point to the Payment timing card.',
              'The page is a benchmark for that reserve. First, will the cash be there on time? The calendar checks '
              'all seven saved Treasury bill maturities.', False),
             ('0:30', [4], 'Point to the Reference bill buttons.',
              'Second, what happens to its purchasing power in the safest short-term bills? Here we use two reference '
              'bills, the 3-month and the 6-month, so we all work from the same numbers. Which bill to buy, and '
              'anything beyond the reserve, stays with the advisor.', False)]),
    dict(n=2, title='When is the cash there, and what does inflation do to it?', time='0:50 to 2:15', secs=85,
         start='Overview', end='Overview, inflation 6%', shots=[('s2a', range(1, 6)), ('s2b', range(6, 10))],
         asked=[], steps=[
             ('0:50', [1, 2, 3], 'Click Calendar, then Try example dates under Payment dates, then Example: tuition '
              'payment.', 'Let me load three example payments and pick tuition, on the first of March 2027.', False),
             ('1:00', [4], 'Point to the sentence above the calendar.',
              'The latest bill that matures before it is the 13-week, on the fourth of February.', False),
             ('1:08', [5], 'Scroll to February and March: solid box on 4 February, purple days, dashed box on 9 March.',
              'So the cash waits 25 days, shown in purple. The next bill, the 17-week, matures on the ninth of March: '
              '8 days too late, so it would have to be sold early at an unknown price.', False),
             ('1:30', [6, 7], 'Click Overview. Point to the line under the chart.',
              'On the Overview, every bar is a saved bill and every line a payment. The navy and blue bars are the two '
              'reference bills we value below.', False),
             ('1:45', [8], 'Click into Assumed annual inflation, select the 3, type 6, press Tab.',
              'At 3 percent inflation, 100,000 dollars in the 13-week bill pays 101,013 and keeps purchasing power of '
              '100,279. Now 6 percent.', False),
             ('1:58', [9], 'Point to Purchasing power $99,572 and the bridge. Leave inflation at 6.',
              'The dollars stay the same, but the purchasing power falls to 99,572. Inflation changes what the money '
              'buys, not the dollars that arrive.', False)]),
    dict(n=3, title='How do we know the numbers are right?', time='2:15 to 3:10', secs=55,
         start='Overview, inflation 6%', end='Scenarios, inflation 4.17%', shots=[('s3a', range(1, 4)), ('s3b', range(4, 7))],
         asked=['calc'], steps=[
             ('2:15', [1, 2], 'Click Method. Point to the formulas.', 'The Method tab shows every formula.', False),
             ('2:20', [3], 'Point to the Data links.',
              'The inputs are the Treasury\'s daily bill rates and the BLS consumer price index. A member who did not '
              'build the page copied the 6 November quote into Excel and recalculated: 101,012.65 dollars at maturity '
              'and purchasing power of 100,279.10, against 101,013 and 100,279 on the page. All six checks passed.',
              False),
             ('2:45', [4, 5], 'Click Scenarios, then Use 4.17%.',
              'The boundary holds too: at the break-even rate of 4.17 percent,', False),
             ('2:50', [6], 'Point to "= Purchasing power at maturity $100,000".',
              'purchasing power is exactly 100,000 dollars. Our main limitation: these are saved quotes, not prices '
              'you can trade at. Taxes, fees and settlement are not modelled, and inflation is an assumption, not a '
              'forecast.', False)]),
    dict(n=4, title='How does an AI assistant update the data, and who decides?', time='3:10 to 4:10', secs=60,
         start='Scenarios', end='History', shots=[('s4', range(1, 4))], asked=['source', 'ai'], steps=[
             ('3:10', [1], 'Point to the banner: saved quote 2026-11-06, 4 days old.',
              'An AI assistant keeps this data fresh, following a written skill file. We tested it in a fresh Codex '
              'conversation with none of our development chats.', False),
             ('3:20', [2, 3], 'Click History. Point to the right end of the rate lines: November 2026.',
              'It downloaded the newest Treasury and BLS files into a separate candidate folder, rebuilt every number '
              'and showed a before-and-after table with source links. The quote date moved from 26 October to '
              '6 November; the 13-week rate from 4.05 to 4.01 percent. Our data maintainer checked the Treasury page '
              'and replied accept. Only then were the files replaced.', False),
             ('3:48', [], 'No click.',
              'In a second test we set a wrong unit, basis points instead of percent. The assistant stopped with '
              '"Incompatible input unit" and changed nothing. Our lesson: the AI does the checks, but the source '
              'comparison and the decision stay with a person.', False)]),
    dict(n=5, title='Can someone else run it, and what comes next?', time='4:10 to 5:00', secs=50,
         start='History', end='Overview', shots=[('s5', range(1, 4))], asked=['cpi', 'rank'], steps=[
             ('4:10', [1, 2], 'Click Method. Point to Freshness and maintenance.',
              'Can someone else run it? Yes. The ZIP alone is enough: one command rebuilds the saved data byte for '
              'byte, and one downloads and checks an update. Nothing is released until a person accepts it. The main '
              'risk: there is no scheduler, so if nobody refreshes for a week, the banner says "Review required".',
              False),
             ('4:35', [], 'No click.',
              'A teammate\'s AI-assisted review found that the chart shows seven bills while the value uses two, so the '
              'chart now names the two reference bills.', False),
             ('4:47', [3], 'Click Overview to finish.',
              'Our next step: let the value follow whichever bill fits each payment, not only the two reference bills. '
              'Thank you.', False)]),
]

QUESTIONS = {
    'why13': ('Why only the 13- and 26-week bills for value?',
              'They are the 3-month and 6-month reference maturities the Federal Reserve publishes in its H.15 '
              'release: a quarter and half a year ahead. The calendar still checks all seven maturities; linking the '
              'value to every bill is our next step.'),
    'otherassets': ('If the bills do not beat inflation, should the client move to other assets?',
                    'Not with this money. It is a reserve for payments due in months, so liquidity and safety come '
                    'first. Below the break-even rate (4.17% for the 13-week bill) it keeps its purchasing power; '
                    'above it, the small loss is the price of having the cash on time. Anything beyond the reserve is '
                    'for the advisor; the page gives no investment advice.'),
    'input': ('Change an input.',
              'Overview: switch Reference bill to 26-week. It matures 2027-05-06 after 181 days: $102,115 at maturity, '
              'purchasing power $100,629 at 3%. A longer period, so a larger number is not a better choice.'),
    'calc': ('Explain a calculation.',
             'Method tab. P = 100 × (1 − 0.0401 × 90/360) = 98.9975. N = 100,000 × 100 / 98.9975 = $101,012.65. '
             'F = 1.03^(90/365) = 1.00732. R = N / F = $100,279.10.'),
    'source': ('What happens when a source fails?',
               'refresh.py prints STOP with the reason and writes nothing; the accepted data stay. The maintainer can '
               'download the three files by hand and run it with --sources. If nobody refreshes, the banner says '
               '"Review required" after 7 days.'),
    'rank': ('Why not recommend a bill?',
             'The bills cover different periods, so a larger result is not a better choice. Timing comes first.'),
    'cpi': ('Is CPI up to date?',
            'BLS publishes October CPI on 10 November; the next weekly refresh picks it up. October 2025 was never '
            'published, so the October 2026 year-on-year rate cannot be computed; the key figure stays at September, '
            '3.74%.'),
    'ai': ('What did the AI do, and what did you do?',
           'The AI wrote the code and drafts and ran the checks. We chose the design, checked the numbers in Excel, '
           'accepted the data update and ran the failure test. AI_LOG.md records each session.'),
}

RECOVERY = [
    ('The page shows an error or no numbers', 'data.js must sit next to index.html. Reopen index.html from the '
     'extracted folder; if it still fails, present from the backup slides (presentation.pdf).'),
    ('Wrong value typed, or lost on the page', 'Reload (Cmd+R or Ctrl+R). Everything resets; Try example dates brings '
     'the payments back.'),
    ('The banner says "Review required"', 'Check the laptop\'s date. The quotes are from 2026-11-06.'),
    ('Running late', 'Speaker 2 skips the sentence at step 6–7. Speaker 5 skips the review sentence.'),
]

CSS = (HERE / 'guide.css').read_text()
e = html.escape


def strip(current):
    cells = ''.join(f'<li class="{"on" if n == current else ""}"><b>Speaker {n}</b><span>{e(t)}</span><i>{e(w)}</i></li>'
                    for n, t, w in ORDER)
    return f'<ol class="strip">{cells}</ol>'


def footer(page):
    return (f'<footer><span>USD Cash Reserve Lab · Group 9 · Speaker guide · 10 November 2026</span>'
            f'<span>Red numbers = click or point, in this order</span><span>Page {page} of 7</span></footer>')


def shot(name, numbers):
    state = MARKS[name]
    marks = ''.join(
        f'<div class="mark{" edge-x" if m["x"] < 2 else ""}{" edge-y" if m["y"] < 3 else ""}" '
        f'style="left:{m["x"]}%;top:{m["y"]}%;width:{m["w"]}%;height:{m["h"]}%"><span>{m["n"]}</span></div>'
        for m in state['marks'] if m['n'] in numbers)
    return f'<figure class="shot"><img src="shots/{state["image"]}" alt="">{marks}</figure>'


def steps(items):
    rows = []
    for clock, numbers, act, say, flag in items:
        badges = ''.join(f'<span class="n">{n}</span>' for n in numbers) or '<span class="n none">·</span>'
        rows.append(f'<li class="{"flag" if flag else ""}"><div class="when">{clock}<div>{badges}</div></div>'
                    f'<div><p class="act">{e(act)}</p><p class="say">{e(say)}</p></div></li>')
    return f'<ol class="steps">{"".join(rows)}</ol>'


def asked(keys):
    if not keys:
        return ''
    rows = ''.join(f'<dt>{e(QUESTIONS[k][0])}</dt><dd>{e(QUESTIONS[k][1])}</dd>' for k in keys)
    return f'<section class="asked"><h3>If someone asks</h3><dl>{rows}</dl></section>'


def speaker_page(s, page):
    head = (f'<header class="head"><div class="badge">{s["n"]}</div><div class="ht"><p class="kicker">Speaker guide · '
            f'USD Cash Reserve Lab · Group 9</p><h1>Speaker {s["n"]}: {e(s["title"])}</h1><p class="meta">{s["time"]} · '
            f'{s["secs"]} seconds · starts on {e(s["start"])} · ends on {e(s["end"])}</p></div>{strip(s["n"])}</header>')
    if len(s['shots']) == 1:
        name, numbers = s['shots'][0]
        body = (f'<main class="one"><div>{shot(name, numbers)}{asked(s["asked"])}</div>{steps(s["steps"])}</main>')
    else:
        cols = []
        for i, (name, numbers) in enumerate(s['shots']):
            mine = [st for st in s['steps'] if st[1] and st[1][0] in numbers]
            cols.append(f'<div>{shot(name, numbers)}{steps(mine)}{asked(s["asked"]) if i == 0 else ""}</div>')
        body = f'<main class="two">{"".join(cols)}</main>'
    return f'<section class="page">{head}{body}{footer(page)}</section>'


def cover():
    before = [
        'Extract the final ZIP into an empty folder and double-click index.html. One browser tab, zoom 100%, '
        'window at least 1280 px wide.',
        'Reload (Cmd+R or Ctrl+R) just before you start: Overview tab, no payments, cash $100,000, 13-week '
        'reference, inflation 3%.',
        'The banner should read "Within project age limits. Bill quotes are 4 days old (limit 7 days)" on '
        '10 November. If it says "Review required", check the laptop\'s date.',
        'One driver clicks for everyone; speakers only talk.',
        'Rehearse once with a timer. The clock times are hard ends.']
    read = [
        'Red numbers on the screenshot: what to click or point at, in this order.',
        'Grey line: what the driver does. Black text: what you say.',
        'The time on the left is when the step starts.']
    who = [
        'Give each part to the member who did the work behind it: the Excel check for Speaker 3, the data update or '
        'the failure test for Speaker 4.',
        'The driver is whoever knows the page best. They stay at the laptop for all five parts.',
        'Every speaker should be ready for the questions on their own page; the last page lists them all.']
    li = lambda xs: ''.join(f'<li>{e(x)}</li>' for x in xs)
    return (f'<section class="page cover"><p class="kicker">BMS5312 Fintech Management · Group 9</p>'
            f'<h1 class="big">Speaker guide</h1><p class="lede">USD Cash Reserve Lab · live dashboard demo, five '
            f'minutes, five speakers, one question each.</p>{strip(0)}<div class="thread"><b>The thread through the '
            f'talk.</b> {e(THREAD)}</div><main class="cols three"><section><h3>Before you start</h3><ol class="list">'
            f'{li(before)}</ol></section><section><h3>How to read your page</h3><ul class="list">{li(read)}</ul>'
            f'</section><section><h3>Who does what</h3><ul class="list">{li(who)}</ul></section></main>'
            f'{footer(1)}</section>')


def questions_page():
    qa = ''.join(f'<dt>{e(q)}</dt><dd>{e(a)}</dd>' for q, a in QUESTIONS.values())
    fix = ''.join(f'<dt>{e(p)}</dt><dd>{e(a)}</dd>' for p, a in RECOVERY)
    return (f'<section class="page"><header class="head plain"><div class="ht"><p class="kicker">Speaker guide · '
            f'USD Cash Reserve Lab · Group 9</p><h1>Questions, and what to do if something goes wrong</h1><p class="meta">'
            f'The instructor may ask you to change an input, explain a calculation or describe what happens when a '
            f'source fails. Reload the page first.</p></div></header><main class="cols wide"><section><h3>If someone '
            f'asks</h3><dl class="qa">{qa}</dl></section><section><h3>If something goes wrong</h3><dl class="qa">'
            f'{fix}</dl></section></main>{footer(7)}</section>')


pages = [cover()] + [speaker_page(s, i + 2) for i, s in enumerate(SPEAKERS)] + [questions_page()]
OUT_HTML.write_text(f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Speaker guide</title>'
                    f'<style>{CSS}</style></head><body>{"".join(pages)}</body></html>\n')
subprocess.run([CHROME, '--headless=new', '--no-pdf-header-footer', '--allow-file-access-from-files',
                f'--print-to-pdf={OUT_PDF}', OUT_HTML.as_uri()], check=True, capture_output=True)
print(f'Wrote {OUT_PDF.name}')
