'use client';

import { DNA_DIMENSIONS, DNA_DIMENSION_LABELS } from '@travelmatch/shared';
import type { DNADimension } from '@travelmatch/shared';

interface DNARadarChartProps {
  dimensions: Record<DNADimension, number>;
  size?: number;
}

const GRID_LEVELS = [20, 40, 60, 80, 100];
const ANGLE_OFFSET = -Math.PI / 2; // Start from top

function polarToCartesian(angle: number, radius: number, center: number): { x: number; y: number } {
  return {
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle),
  };
}

export function DNARadarChart({ dimensions, size = 320 }: DNARadarChartProps) {
  const center = size / 2;
  const maxRadius = size * 0.38; // Leave room for labels
  const labelRadius = size * 0.47;
  const angleStep = (2 * Math.PI) / DNA_DIMENSIONS.length;

  // Generate grid circles
  const gridCircles = GRID_LEVELS.map((level) => {
    const r = (level / 100) * maxRadius;
    return { level, r };
  });

  // Generate axis lines
  const axes = DNA_DIMENSIONS.map((_, i) => {
    const angle = ANGLE_OFFSET + i * angleStep;
    const end = polarToCartesian(angle, maxRadius, center);
    return { x1: center, y1: center, x2: end.x, y2: end.y };
  });

  // Generate data polygon points
  const dataPoints = DNA_DIMENSIONS.map((dim, i) => {
    const angle = ANGLE_OFFSET + i * angleStep;
    const value = dimensions[dim];
    const r = (value / 100) * maxRadius;
    return polarToCartesian(angle, r, center);
  });
  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Generate labels
  const labels = DNA_DIMENSIONS.map((dim, i) => {
    const angle = ANGLE_OFFSET + i * angleStep;
    const pos = polarToCartesian(angle, labelRadius, center);
    return { dim, label: DNA_DIMENSION_LABELS[dim], x: pos.x, y: pos.y };
  });

  return (
    <div className="flex items-center justify-center" style={{ minWidth: 280, maxWidth: 400 }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-auto w-full animate-radar-reveal"
        role="img"
        aria-label="Gráfico radar do DNA de Viagem com 10 dimensões"
      >
        {/* Grid circles */}
        {gridCircles.map(({ level, r }) => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={0.5}
            className="text-sand-200"
          />
        ))}

        {/* Axis lines */}
        {axes.map((axis, i) => (
          <line
            key={DNA_DIMENSIONS[i]}
            x1={axis.x1}
            y1={axis.y1}
            x2={axis.x2}
            y2={axis.y2}
            stroke="currentColor"
            strokeWidth={0.5}
            className="text-sand-300"
          />
        ))}

        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          className="fill-turquoise-500/30 stroke-turquoise-600"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Data points */}
        {dataPoints.map((point, i) => (
          <circle
            key={DNA_DIMENSIONS[i]}
            cx={point.x}
            cy={point.y}
            r={3}
            className="fill-turquoise-600"
          />
        ))}

        {/* Labels */}
        {labels.map(({ dim, label, x, y }) => (
          <text
            key={dim}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-sand-700 text-[10px] font-medium"
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}
