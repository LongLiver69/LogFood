'use client';

import { useMemo } from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { BodyMetricWeek } from '@/types';

export interface MetricConfig {
  key: keyof BodyMetricWeek;
  label: string;
  unit: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  goodDirection: 'down' | 'up'; // 'down' means reduction is good (e.g. weight, fat, waist); 'up' means increase is good (muscle, score)
}

export const METRIC_OPTIONS: MetricConfig[] = [
  {
    key: 'weight',
    label: 'Cân nặng',
    unit: 'kg',
    color: '#38bdf8', // cyan-400
    gradientFrom: 'rgba(56, 189, 248, 0.35)',
    gradientTo: 'rgba(56, 189, 248, 0.02)',
    goodDirection: 'down',
  },
  {
    key: 'bmi',
    label: 'Chỉ số BMI',
    unit: 'kg/m²',
    color: '#a855f7', // purple-500
    gradientFrom: 'rgba(168, 85, 247, 0.35)',
    gradientTo: 'rgba(168, 85, 247, 0.02)',
    goodDirection: 'down',
  },
  {
    key: 'bodyFatPercentage',
    label: 'Tỷ lệ mỡ',
    unit: '%',
    color: '#fb923c', // orange-400
    gradientFrom: 'rgba(251, 146, 60, 0.35)',
    gradientTo: 'rgba(251, 146, 60, 0.02)',
    goodDirection: 'down',
  },
  {
    key: 'waist',
    label: 'Vòng eo',
    unit: 'cm',
    color: '#f43f5e', // rose-500
    gradientFrom: 'rgba(244, 63, 94, 0.35)',
    gradientTo: 'rgba(244, 63, 94, 0.02)',
    goodDirection: 'down',
  },
  {
    key: 'muscleMass',
    label: 'Lượng cơ',
    unit: 'kg',
    color: '#10b981', // emerald-500
    gradientFrom: 'rgba(16, 185, 129, 0.35)',
    gradientTo: 'rgba(16, 185, 129, 0.02)',
    goodDirection: 'up',
  },
  {
    key: 'bodyWater',
    label: 'Lượng nước',
    unit: 'kg',
    color: '#06b6d4', // cyan-500
    gradientFrom: 'rgba(6, 182, 212, 0.35)',
    gradientTo: 'rgba(6, 182, 212, 0.02)',
    goodDirection: 'up',
  },
  {
    key: 'bmr',
    label: 'BMR',
    unit: 'Kcal',
    color: '#eab308', // yellow-500
    gradientFrom: 'rgba(234, 179, 8, 0.35)',
    gradientTo: 'rgba(234, 179, 8, 0.02)',
    goodDirection: 'up',
  },
  {
    key: 'bodyScore',
    label: 'Điểm cơ thể',
    unit: 'điểm',
    color: '#8b5cf6', // violet-500
    gradientFrom: 'rgba(139, 92, 246, 0.35)',
    gradientTo: 'rgba(139, 92, 246, 0.02)',
    goodDirection: 'up',
  },
];

interface BodyMetricsChartProps {
  weeks: BodyMetricWeek[];
  selectedMetric: MetricConfig;
  onSelectMetric: (config: MetricConfig) => void;
}

export default function BodyMetricsChart({
  weeks,
  selectedMetric,
  onSelectMetric,
}: BodyMetricsChartProps) {
  // Trích xuất dữ liệu có giá trị hợp lệ cho biểu đồ
  const dataPoints = useMemo(() => {
    return weeks
      .map((wk) => {
        const val = wk[selectedMetric.key];
        const numVal = val !== undefined && val !== null && val !== '' ? Number(val) : null;
        return {
          weekNumber: wk.weekNumber,
          label: `Tuần ${wk.weekNumber}`,
          value: numVal,
        };
      })
      .filter((p) => p.value !== null && !isNaN(p.value!)) as Array<{
      weekNumber: number;
      label: string;
      value: number;
    }>;
  }, [weeks, selectedMetric]);

  // Tính xu hướng so sánh giữa tuần đầu và tuần cuối
  const trend = useMemo(() => {
    if (dataPoints.length < 2) return null;
    const first = dataPoints[0].value;
    const latest = dataPoints[dataPoints.length - 1].value;
    const diff = Math.round((latest - first) * 10) / 10;
    const isImproved =
      selectedMetric.goodDirection === 'down' ? diff < 0 : diff > 0;
    return {
      diff,
      isImproved,
      absDiff: Math.abs(diff),
    };
  }, [dataPoints, selectedMetric]);

  // Kích thước SVG
  const width = 600;
  const height = 240;
  const paddingX = 55;
  const paddingTop = 45;
  const paddingBottom = 40;

  // Tính min, max
  const { minVal, maxVal, coordinates } = useMemo(() => {
    if (dataPoints.length === 0) {
      return { minVal: 0, maxVal: 100, coordinates: [] };
    }

    const values = dataPoints.map((p) => p.value);
    let min = Math.min(...values);
    let max = Math.max(...values);

    if (min === max) {
      min = Math.max(0, min - 5);
      max = max + 5;
    } else {
      const buffer = (max - min) * 0.25;
      min = Math.max(0, min - buffer);
      max = max + buffer;
    }

    const usableWidth = width - paddingX * 2;
    const usableHeight = height - paddingTop - paddingBottom;

    const coords = dataPoints.map((p, idx) => {
      const x =
        dataPoints.length === 1
          ? width / 2
          : paddingX + (idx / (dataPoints.length - 1)) * usableWidth;
      const normalizedY = (p.value - min) / (max - min);
      const y = height - paddingBottom - normalizedY * usableHeight;
      return { ...p, x, y };
    });

    return { minVal: min, maxVal: max, coordinates: coords };
  }, [dataPoints]);

  // Tạo đường dẫn SVG Path (Line và Area)
  const { linePath, areaPath } = useMemo(() => {
    if (coordinates.length === 0) return { linePath: '', areaPath: '' };

    if (coordinates.length === 1) {
      const p = coordinates[0];
      return {
        linePath: `M ${p.x - 20} ${p.y} L ${p.x + 20} ${p.y}`,
        areaPath: '',
      };
    }

    const points = coordinates.map((c) => `${c.x},${c.y}`);
    const line = `M ${points.join(' L ')}`;
    const baselineY = height - paddingBottom;
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    const area = `M ${first.x},${baselineY} L ${first.x},${first.y} ${coordinates
      .slice(1)
      .map((c) => `L ${c.x},${c.y}`)
      .join(' ')} L ${last.x},${baselineY} Z`;

    return { linePath: line, areaPath: area };
  }, [coordinates]);

  return (
    <div className="glass-card p-4 sm:p-5 border-cyan-500/20 shadow-xl space-y-4">
      {/* Metric selection pills on mobile / desktop */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">
            Chọn chỉ số theo dõi:
          </span>
          {trend && (
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                trend.diff === 0
                  ? 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                  : trend.isImproved
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
            >
              {trend.diff === 0 ? (
                <Minus size={13} />
              ) : trend.diff < 0 ? (
                <TrendingDown size={13} />
              ) : (
                <TrendingUp size={13} />
              )}
              <span>
                {trend.diff > 0 ? `+${trend.diff}` : `${trend.diff}`} {selectedMetric.unit}
              </span>
              <span className="hidden sm:inline text-[10px] opacity-80 font-normal">
                (so với Tuần 1)
              </span>
            </div>
          )}
        </div>

        {/* Scrollable / Wrap pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
          {METRIC_OPTIONS.map((opt) => {
            const isSelected = opt.key === selectedMetric.key;
            return (
              <button
                key={opt.key}
                onClick={() => onSelectMetric(opt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'text-slate-900 shadow-lg'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: opt.color,
                        boxShadow: `0 4px 12px ${opt.color}40`,
                      }
                    : {}
                }
              >
                <span>{opt.label}</span>
                <span className="text-[10px] opacity-75">({opt.unit})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Line Chart */}
      <div className="relative rounded-2xl bg-black/30 border border-white/10 p-2 sm:p-4 overflow-hidden">
        {dataPoints.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            Chưa có đủ dữ liệu cho chỉ số &quot;{selectedMetric.label}&quot;. Hãy cập nhật thêm các tuần.
          </div>
        ) : (
          <div className="w-full">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto overflow-visible select-none"
              style={{ maxHeight: '260px' }}
            >
              <defs>
                <linearGradient id={`gradient-${selectedMetric.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={selectedMetric.gradientFrom} />
                  <stop offset="100%" stopColor={selectedMetric.gradientTo} />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.33, 0.66, 1].map((ratio, i) => {
                const y = paddingTop + ratio * (height - paddingTop - paddingBottom);
                return (
                  <line
                    key={i}
                    x1={paddingX - 15}
                    y1={y}
                    x2={width - paddingX + 15}
                    y2={y}
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Gradient Area under line */}
              {areaPath && (
                <path d={areaPath} fill={`url(#gradient-${selectedMetric.key})`} />
              )}

              {/* Line */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke={selectedMetric.color}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Points & Labels */}
              {coordinates.map((pt, idx) => (
                <g key={idx} className="animate-fade-in">
                  {/* Vertical dotted guide */}
                  <line
                    x1={pt.x}
                    y1={pt.y}
                    x2={pt.x}
                    y2={height - paddingBottom}
                    stroke="rgba(255,255,255,0.12)"
                    strokeDasharray="2 2"
                    strokeWidth="1"
                  />

                  {/* Value Label above point */}
                  <rect
                    x={pt.x - 28}
                    y={pt.y - 28}
                    width="56"
                    height="20"
                    rx="10"
                    fill="rgba(15, 23, 42, 0.9)"
                    stroke={selectedMetric.color}
                    strokeWidth="1"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 14}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {pt.value}
                  </text>

                  {/* Outer glowing halo */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="8"
                    fill={selectedMetric.color}
                    opacity="0.3"
                  />

                  {/* Point circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4.5"
                    fill="#0f172a"
                    stroke={selectedMetric.color}
                    strokeWidth="2.5"
                  />

                  {/* Week label below baseline */}
                  <text
                    x={pt.x}
                    y={height - paddingBottom + 20}
                    textAnchor="middle"
                    fill="rgba(148, 163, 184, 0.9)"
                    fontSize="11"
                    fontWeight="600"
                  >
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

