import {useEffect, useRef} from 'react';
import {CategoryScale, Chart, Legend, LinearScale, LineController, LineElement, PointElement, Tooltip} from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);
const token = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// One wrapper so every chart shares Salt colours and type. series: [{label, values, tone: 'first'|'second'|'reference', dashed, radii}].
// A null value leaves a gap; the chart never joins across missing observations.
export function LineChart({labels, series, xTitle, yTitle, format, description}) {
  const canvas = useRef(null);
  const key = JSON.stringify({labels, series, xTitle, yTitle});
  useEffect(() => {
    const tones = {first: token('--salt-category-1-bold-background'), second: token('--salt-category-2-bold-background'),
      reference: token('--salt-content-secondary-foreground')};
    Chart.defaults.font.family = token('--salt-text-fontFamily');
    Chart.defaults.color = token('--salt-content-secondary-foreground');
    const grid = token('--salt-separable-tertiary-borderColor');
    const chart = new Chart(canvas.current, {
      type: 'line',
      data: {labels, datasets: series.map(s => ({label: s.label, data: s.values, borderColor: tones[s.tone], backgroundColor: tones[s.tone],
        borderWidth: s.tone === 'reference' ? 1 : 2, borderDash: s.dashed ? [6, 4] : [], pointRadius: s.radii, pointHoverRadius: 5,
        spanGaps: false, tension: 0}))},
      options: {responsive: true, maintainAspectRatio: false, animation: false, interaction: {mode: 'index', intersect: false},
        scales: {x: {title: {display: true, text: xTitle}, grid: {color: grid}, ticks: {maxRotation: 0, autoSkip: true, autoSkipPadding: 18}},
          y: {title: {display: true, text: yTitle}, grid: {color: grid}, ticks: {callback: format}}},
        plugins: {legend: {position: 'bottom', labels: {boxHeight: 2}}, tooltip: {callbacks: {label: c => `${c.dataset.label}: ${format(c.parsed.y)}`}}}}
    });
    return () => chart.destroy();
  }, [key]); // key holds every input that changes the chart, so the chart is rebuilt only when the data does
  return <div className="chart"><canvas ref={canvas} role="img" aria-label={description} /></div>;
}
