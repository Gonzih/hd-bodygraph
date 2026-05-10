import React from 'react';
import type { ChartData, BodyGraphOptions } from '../types';
import { renderToSVG } from '../renderer';

export interface BodyGraphProps {
  chart: ChartData;
  options?: BodyGraphOptions;
  className?: string;
  style?: React.CSSProperties;
}

export function BodyGraph({ chart, options, className, style }: BodyGraphProps): React.ReactElement {
  const svg = renderToSVG(chart, options);
  return (
    <div
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
