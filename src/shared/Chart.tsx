import { useState } from 'react';
import type { HourlySeries } from '../domain/types';
import { Button } from './Button';
import type { ChartProps } from './props';

export type { ChartProps };

interface SvgProps {
  readonly hourly: HourlySeries;
  readonly title: string;
  readonly description: string;
}

function ChartSvg({ hourly, title, description }: SvgProps): JSX.Element {
  const maxVal = Math.max(100, ...hourly.map((h) => h.pm25));
  const svgWidth = 600;
  const svgHeight = 160;
  const padding = 20;

  const points = hourly.map((h, i) => {
    const x = padding + (i / Math.max(1, hourly.length - 1)) * (svgWidth - 2 * padding);
    const y = svgHeight - padding - (h.pm25 / maxVal) * (svgHeight - 2 * padding);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <div className="relative border border-border rounded-lg bg-bg-surface p-2 overflow-hidden">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto"
        role="img"
        aria-labelledby="chart-title chart-desc"
      >
        <title id="chart-title">{title}</title>
        <desc id="chart-desc">{description}</desc>
        <line
          x1={padding}
          y1={svgHeight - padding}
          x2={svgWidth - padding}
          y2={svgHeight - padding}
          stroke="var(--color-border)"
          strokeWidth={1}
        />
        <polyline
          fill="none"
          stroke="var(--color-teal)"
          strokeWidth={2.5}
          points={points.join(' ')}
        />
        {hourly.map((h, i) => {
          const x = padding + (i / Math.max(1, hourly.length - 1)) * (svgWidth - 2 * padding);
          const y = svgHeight - padding - (h.pm25 / maxVal) * (svgHeight - 2 * padding);
          return (
            <circle
              key={h.hour}
              cx={x}
              cy={y}
              r={2.5}
              fill="var(--color-bg-surface)"
              stroke="var(--color-teal)"
              strokeWidth={1.5}
            />
          );
        })}
      </svg>
    </div>
  );
}

function ChartTable({
  hourly,
  title,
}: {
  readonly hourly: HourlySeries;
  readonly title: string;
}): JSX.Element {
  return (
    <div className="overflow-x-auto max-h-48 border border-border rounded-lg">
      <table className="w-full text-left text-xs">
        <caption className="sr-only">{title}</caption>
        <thead className="bg-bg-elevated border-b border-border text-text-muted sticky top-0">
          <tr>
            <th scope="col" className="p-2">
              Hour
            </th>
            <th scope="col" className="p-2">
              PM2.5 (ug/m3)
            </th>
            <th scope="col" className="p-2">
              US AQI
            </th>
          </tr>
        </thead>
        <tbody>
          {hourly.map((h) => (
            <tr key={h.hour} className="border-b border-border/50">
              <td className="p-2 font-mono">{h.hour}:00</td>
              <td className="p-2 font-mono">{h.pm25}</td>
              <td className="p-2 font-mono">{h.aqi}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Accessible 24-hour diurnal air pollution line chart with an integrated data table alternative. */
export function Chart({ hourly, title, description, className = '' }: ChartProps): JSX.Element {
  const [showTable, setShowTable] = useState(false);

  if (hourly.length === 0) {
    return <div className="text-sm text-text-muted">No hourly series available.</div>;
  }

  return (
    <div className={`flex flex-col gap-3 text-left ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-text-main">{title}</span>
        <Button
          variant="secondary"
          onClick={() => setShowTable(!showTable)}
          className="text-xs py-1 px-3 min-h-[36px]"
        >
          {showTable ? 'Show Chart' : 'Show Data Table'}
        </Button>
      </div>

      {showTable ? (
        <ChartTable hourly={hourly} title={title} />
      ) : (
        <ChartSvg hourly={hourly} title={title} description={description} />
      )}
    </div>
  );
}
