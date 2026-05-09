import React from 'react';
import type { ChartData } from '../types';
import { renderToSVG } from '../renderer';

export interface BodyGraphProps {
  chart: ChartData;
  className?: string;
  style?: React.CSSProperties;
}

export function BodyGraph({ chart, className, style }: BodyGraphProps): React.ReactElement {
  const svg = renderToSVG(chart);
  return (
    <div
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
