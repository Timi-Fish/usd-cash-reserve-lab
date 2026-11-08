import {useEffect, useRef} from 'react';
import {CategoryScale, Chart, Legend, LinearScale, LineController, LineElement, PointElement, Tooltip} from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);
const token = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// One wrapper so every chart shares the brand chart shades (brand.css) and Salt type.
// series: [{label, values, tone: 'bill13'|'bill26'|'neutral'|'reference', dashed, radii}]; a null value leaves a gap.
// A bill keeps its colour on every chart; 'neutral' is data that is not a bill (CPI), 'reference' a thin guide line.
// xAxis: {type: 'category', labels} for months, or {type: 'linear', min, max, step, format} with values as {x, y} points.
export function LineChart({xAxis, series, xTitle, yTitle, format, description}) {
  const canvas = useRef(null);
  const key = JSON.stringify({xAxis, series, xTitle, yTitle});
  useEffect(() => {
    const tones = {bill13: token('--lab-bill-13'), bill26: token('--lab-bill-26'),
      neutral: token('--salt-content-secondary-foreground'), reference: token('--salt-content-secondary-foreground')};
    Chart.defaults.font.family = token('--salt-text-fontFamily');
    Chart.defaults.color = token('--salt-content-secondary-foreground');
    const grid = token('--salt-separable-tertiary-borderColor');
    const x = xAxis.type === 'linear'
      ? {type: 'linear', min: xAxis.min, max: xAxis.max, ticks: {stepSize: xAxis.step, callback: xAxis.format}}
      : {type: 'category', labels: xAxis.labels, ticks: {maxRotation: 0, autoSkip: true, autoSkipPadding: 16, maxTicksLimit: 8}};
    const chart = new Chart(canvas.current, {
      type: 'line',
      data: {datasets: series.map(s => ({label: s.label, data: s.values, borderColor: tones[s.tone], backgroundColor: tones[s.tone],
        borderWidth: s.tone === 'reference' ? 1 : 2, borderDash: s.dashed ? [6, 4] : [], pointRadius: s.radii, pointHoverRadius: 5,
        spanGaps: false, tension: 0}))},
      options: {responsive: true, maintainAspectRatio: false, animation: false, interaction: {mode: 'index', intersect: false},
        scales: {x: {...x, title: {display: true, text: xTitle}, grid: {display: false}},
          y: {title: {display: true, text: yTitle}, grid: {color: grid}, ticks: {callback: format, maxTicksLimit: 7}}},
        plugins: {legend: {position: 'bottom', labels: {boxHeight: 2}}, tooltip: {callbacks: {label: c => `${c.dataset.label}: ${format(c.parsed.y)}`}}}}
    });
    return () => chart.destroy();
  }, [key]); // key holds every input that changes the chart, so the chart is rebuilt only when the data does
  return <div className="chart"><canvas ref={canvas} role="img" aria-label={description} /></div>;
}
