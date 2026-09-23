import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  BarChart2,
  Calendar,
  Layers,
  Sparkles,
  Info,
  CheckCircle,
  X,
  Target,
  Zap,
  Activity
} from 'lucide-react';
import { Signal, SignalCategory } from '../types';

interface SignalTrendChartProps {
  signals: Signal[];
  selectedDate: string | null;
  onSelectDate: (dateKey: string | null) => void;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

type TimeRange = '7d' | '14d' | '30d' | 'all';
type ChartMode = 'combined' | 'stacked';

interface DayBucket {
  dateKey: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Sep 20"
  fullDate: string; // e.g. "Sunday, Sep 20, 2026"
  signals: Signal[];
  count: number;
  avgConfidence: number | null;
  minConfidence: number | null;
  maxConfidence: number | null;
  categoryBreakdown: Record<SignalCategory, number>;
}

const CATEGORY_COLORS: Record<SignalCategory, { fill: string; stroke: string; bg: string; text: string }> = {
  GROWTH: { fill: '#10b981', stroke: '#059669', bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  DEMAND: { fill: '#06b6d4', stroke: '#0891b2', bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  PROBLEM: { fill: '#f43f5e', stroke: '#e11d48', bg: 'bg-rose-500/20', text: 'text-rose-400' },
  CHANGE: { fill: '#f59e0b', stroke: '#d97706', bg: 'bg-amber-500/20', text: 'text-amber-400' },
  OPPORTUNITY: { fill: '#a855f7', stroke: '#9333ea', bg: 'bg-purple-500/20', text: 'text-purple-400' },
  RESEARCH: { fill: '#3b82f6', stroke: '#2563eb', bg: 'bg-blue-500/20', text: 'text-blue-400' },
};

const ALL_CATEGORIES: SignalCategory[] = ['GROWTH', 'DEMAND', 'PROBLEM', 'CHANGE', 'OPPORTUNITY', 'RESEARCH'];

export const SignalTrendChart: React.FC<SignalTrendChartProps> = ({
  signals,
  selectedDate,
  onSelectDate,
  selectedCategory = 'all',
  onSelectCategory,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('14d');
  const [chartMode, setChartMode] = useState<ChartMode>('combined');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Group signals into daily timeline buckets
  const { buckets, maxCount, stats } = useMemo(() => {
    const now = new Date();
    let numDays = 14;
    if (timeRange === '7d') numDays = 7;
    else if (timeRange === '14d') numDays = 14;
    else if (timeRange === '30d') numDays = 30;
    else if (timeRange === 'all') numDays = 45;

    // Build day map keyed by YYYY-MM-DD
    const dayMap = new Map<string, DayBucket>();

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const fullDate = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

      dayMap.set(dateKey, {
        dateKey,
        dayLabel,
        fullDate,
        signals: [],
        count: 0,
        avgConfidence: null,
        minConfidence: null,
        maxConfidence: null,
        categoryBreakdown: {
          GROWTH: 0,
          DEMAND: 0,
          PROBLEM: 0,
          CHANGE: 0,
          OPPORTUNITY: 0,
          RESEARCH: 0,
        },
      });
    }

    // Populate signals into dayMap
    signals.forEach((s) => {
      const rawDate = s.detectedAt || s.observedAt || s.createdAt;
      if (!rawDate) return;
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      const bucket = dayMap.get(dateKey);
      if (bucket) {
        bucket.signals.push(s);
        bucket.count += 1;
        if (s.signalCategory && bucket.categoryBreakdown[s.signalCategory] !== undefined) {
          bucket.categoryBreakdown[s.signalCategory] += 1;
        }
      }
    });

    // Compute confidence stats per bucket
    let highestCount = 0;
    let totalSignalsInWindow = 0;
    let totalConfidenceSum = 0;
    let confidenceCount = 0;
    let highConfidenceSignals = 0;

    const bucketList = Array.from(dayMap.values());
    bucketList.forEach((b) => {
      if (b.count > highestCount) {
        highestCount = b.count;
      }
      totalSignalsInWindow += b.count;

      if (b.signals.length > 0) {
        const confidences = b.signals.map((s) => s.confidence || 0);
        const sum = confidences.reduce((acc, c) => acc + c, 0);
        b.avgConfidence = Math.round(sum / confidences.length);
        b.minConfidence = Math.min(...confidences);
        b.maxConfidence = Math.max(...confidences);

        confidences.forEach((c) => {
          totalConfidenceSum += c;
          confidenceCount++;
          if (c >= 85) highConfidenceSignals++;
        });
      }
    });

    const avgConfidenceOverall = confidenceCount > 0 ? Math.round(totalConfidenceSum / confidenceCount) : 0;
    const highConfidenceRate = totalSignalsInWindow > 0 ? Math.round((highConfidenceSignals / totalSignalsInWindow) * 100) : 0;

    return {
      buckets: bucketList,
      maxCount: Math.max(highestCount, 4), // Minimum scale ceiling of 4 for clean visuals
      stats: {
        totalSignalsInWindow,
        avgConfidenceOverall,
        highConfidenceRate,
        peakCount: highestCount,
      },
    };
  }, [signals, timeRange]);

  // Chart dimensions & layout coordinates
  const svgWidth = 720;
  const svgHeight = 220;
  const padding = { top: 28, right: 48, bottom: 34, left: 38 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  const barSlotWidth = chartWidth / buckets.length;
  const barWidth = Math.max(Math.min(barSlotWidth * 0.55, 24), 8);

  // Scale functions
  const getYForCount = (count: number) => {
    return padding.top + chartHeight - (count / maxCount) * chartHeight;
  };

  // Confidence scale: 50% to 100% on the right axis for great visual dynamic range
  const confMin = 50;
  const confMax = 100;
  const getYForConfidence = (confidence: number) => {
    const clamped = Math.max(confMin, Math.min(confMax, confidence));
    return padding.top + chartHeight - ((clamped - confMin) / (confMax - confMin)) * chartHeight;
  };

  // Build points for confidence line
  const confidencePoints = useMemo(() => {
    return buckets
      .map((b, idx) => {
        if (b.avgConfidence === null) return null;
        const x = padding.left + idx * barSlotWidth + barSlotWidth / 2;
        const y = getYForConfidence(b.avgConfidence);
        return { x, y, bucket: b, index: idx };
      })
      .filter((pt): pt is { x: number; y: number; bucket: DayBucket; index: number } => pt !== null);
  }, [buckets, barSlotWidth]);

  // Generate smooth SVG path for the confidence line
  const { linePath, areaPath } = useMemo(() => {
    if (confidencePoints.length === 0) return { linePath: '', areaPath: '' };

    if (confidencePoints.length === 1) {
      const pt = confidencePoints[0];
      return {
        linePath: `M ${pt.x - 10} ${pt.y} L ${pt.x + 10} ${pt.y}`,
        areaPath: `M ${pt.x - 10} ${getYForConfidence(confMin)} L ${pt.x - 10} ${pt.y} L ${pt.x + 10} ${pt.y} L ${pt.x + 10} ${getYForConfidence(confMin)} Z`,
      };
    }

    let d = `M ${confidencePoints[0].x} ${confidencePoints[0].y}`;
    for (let i = 0; i < confidencePoints.length - 1; i++) {
      const p0 = confidencePoints[i === 0 ? 0 : i - 1];
      const p1 = confidencePoints[i];
      const p2 = confidencePoints[i + 1];
      const p3 = confidencePoints[i + 2 >= confidencePoints.length ? confidencePoints.length - 1 : i + 2];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const baselineY = padding.top + chartHeight;
    const firstX = confidencePoints[0].x;
    const lastX = confidencePoints[confidencePoints.length - 1].x;
    const area = `${d} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;

    return { linePath: d, areaPath: area };
  }, [confidencePoints, chartHeight]);

  const activeBucket = hoveredIndex !== null ? buckets[hoveredIndex] : null;

  return (
    <div className="rounded-lg bg-[#0e1524] border border-slate-800/90 p-4 sm:p-5 relative transition-all">
      {/* Header with Title, Mode Toggles, and Time Ranges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
              Signal Frequency & Confidence Dynamics
            </h3>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-sans">
              Temporal correlation
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Temporal distribution of commercial signals correlated against validation confidence levels.
          </p>
        </div>

        {/* Chart View Mode & Range Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Display Mode */}
          <div className="flex items-center rounded-md bg-[#0a0f1a] border border-slate-800 p-0.5 text-xs">
            <button
              onClick={() => setChartMode('combined')}
              className={`px-2.5 py-1 rounded font-medium text-xs transition-colors flex items-center gap-1.5 ${
                chartMode === 'combined'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Dual View: Signal count bars with Confidence trend line"
            >
              <BarChart2 className="w-3 h-3 text-teal-400" />
              <span>Volume + Confidence</span>
            </button>
            <button
              onClick={() => setChartMode('stacked')}
              className={`px-2.5 py-1 rounded font-medium text-xs transition-colors flex items-center gap-1.5 ${
                chartMode === 'stacked'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Category Stacked: Signal breakdown by category with Confidence overlay"
            >
              <Layers className="w-3 h-3 text-sky-400" />
              <span>By Category</span>
            </button>
          </div>

          {/* Time Range Pills */}
          <div className="flex items-center rounded-md bg-[#0a0f1a] border border-slate-800 p-0.5 text-xs">
            {(['7d', '14d', '30d'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2 py-1 rounded font-mono text-[11px] transition-colors ${
                  timeRange === range
                    ? 'bg-slate-800 text-teal-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {range === '7d' ? '7D' : range === '14d' ? '14D' : '30D'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Summary Strips without glowing cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <div className="p-2.5 rounded-md bg-[#0a0f1a] border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
            <span className="font-mono">Window Volume</span>
            <Activity className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold font-mono text-white">{stats.totalSignalsInWindow}</span>
            <span className="text-[10px] text-slate-500 font-mono">signals</span>
          </div>
        </div>

        <div className="p-2.5 rounded-md bg-[#0a0f1a] border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
            <span className="font-mono">Avg Confidence</span>
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold font-mono text-teal-300">
              {stats.avgConfidenceOverall ? `${stats.avgConfidenceOverall}%` : 'N/A'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {stats.avgConfidenceOverall >= 85 ? 'Verified High' : 'Calibrated'}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-md bg-[#0a0f1a] border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
            <span className="font-mono">High Quality Ratio</span>
            <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold font-mono text-slate-100">{stats.highConfidenceRate}%</span>
            <span className="text-[10px] text-slate-500 font-mono">&ge; 85% conf</span>
          </div>
        </div>

        <div className="p-2.5 rounded-md bg-[#0a0f1a] border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
            <span className="font-mono">Peak Burst</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold font-mono text-white">{stats.peakCount}</span>
            <span className="text-[10px] text-slate-500 font-mono">max/day</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Visualization */}
      <div className="relative w-full overflow-x-auto select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-48 sm:h-56 overflow-visible"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            {/* Confidence Area Gradient */}
            <linearGradient id="confidenceAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>

            {/* Default Volume Bar Gradient */}
            <linearGradient id="volumeBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            {/* Selected Bar Gradient */}
            <linearGradient id="selectedBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>

            {/* Confidence Line Glow Filter */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines (horizontal for count) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + chartHeight * ratio;
            const countVal = Math.round(maxCount * (1 - ratio));
            const confVal = Math.round(confMin + (confMax - confMin) * (1 - ratio));
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray={ratio === 1 ? 'none' : '3 3'}
                  strokeWidth="1"
                />
                {/* Left Y Axis Label (Count) */}
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-500 text-[9px] font-mono"
                >
                  {countVal}
                </text>
                {/* Right Y Axis Label (Confidence %) */}
                <text
                  x={svgWidth - padding.right + 8}
                  y={y + 3}
                  textAnchor="start"
                  className="fill-cyan-500/80 text-[9px] font-mono"
                >
                  {confVal}%
                </text>
              </g>
            );
          })}

          {/* Y Axis Legend Titles */}
          <text
            x={padding.left - 8}
            y={padding.top - 12}
            textAnchor="start"
            className="fill-slate-400 text-[9px] font-mono uppercase font-bold"
          >
            Qty
          </text>
          <text
            x={svgWidth - padding.right + 6}
            y={padding.top - 12}
            textAnchor="start"
            className="fill-cyan-400 text-[9px] font-mono uppercase font-bold"
          >
            Conf %
          </text>

          {/* Confidence Benchmark 85% Guide Line */}
          {(() => {
            const benchY = getYForConfidence(85);
            return (
              <g>
                <line
                  x1={padding.left}
                  y1={benchY}
                  x2={svgWidth - padding.right}
                  y2={benchY}
                  stroke="#059669"
                  strokeDasharray="2 2"
                  strokeWidth="1"
                  strokeOpacity="0.6"
                />
                <text
                  x={svgWidth - padding.right - 4}
                  y={benchY - 4}
                  textAnchor="end"
                  className="fill-emerald-400 text-[8px] font-mono"
                >
                  85% High Conf Benchmark
                </text>
              </g>
            );
          })()}

          {/* Area under confidence curve */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#confidenceAreaGrad)"
              className="pointer-events-none transition-all duration-300"
            />
          )}

          {/* Signal Frequency Bars */}
          {buckets.map((b, idx) => {
            const xCenter = padding.left + idx * barSlotWidth + barSlotWidth / 2;
            const xBar = xCenter - barWidth / 2;
            const isHovered = hoveredIndex === idx;
            const isSelected = selectedDate === b.dateKey;

            // In stacked mode, render segments by category
            if (chartMode === 'stacked' && b.count > 0) {
              let currentY = padding.top + chartHeight;
              return (
                <g key={b.dateKey} className="cursor-pointer" onClick={() => onSelectDate(isSelected ? null : b.dateKey)}>
                  {ALL_CATEGORIES.map((cat) => {
                    const catCount = b.categoryBreakdown[cat] || 0;
                    if (catCount === 0) return null;
                    const segmentHeight = (catCount / maxCount) * chartHeight;
                    const segmentY = currentY - segmentHeight;
                    currentY = segmentY;

                    return (
                      <rect
                        key={cat}
                        x={xBar}
                        y={segmentY}
                        width={barWidth}
                        height={Math.max(segmentHeight, 2)}
                        fill={CATEGORY_COLORS[cat].fill}
                        rx="1"
                        className="transition-all duration-200"
                        opacity={isHovered ? 1 : isSelected ? 0.95 : 0.8}
                      />
                    );
                  })}
                  {isSelected && (
                    <rect
                      x={xBar - 2}
                      y={getYForCount(b.count) - 2}
                      width={barWidth + 4}
                      height={(b.count / maxCount) * chartHeight + 4}
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="2"
                      rx="3"
                    />
                  )}
                </g>
              );
            }

            // In combined mode: solid/gradient volume bar
            const barHeight = b.count > 0 ? (b.count / maxCount) * chartHeight : 0;
            const yBar = padding.top + chartHeight - barHeight;

            return (
              <g
                key={b.dateKey}
                className="cursor-pointer"
                onClick={() => onSelectDate(isSelected ? null : b.dateKey)}
              >
                {/* Background interaction hover strip */}
                <rect
                  x={padding.left + idx * barSlotWidth}
                  y={padding.top}
                  width={barSlotWidth}
                  height={chartHeight}
                  fill={isHovered ? '#0ea5e9' : isSelected ? '#0284c7' : 'transparent'}
                  opacity={isHovered ? 0.08 : isSelected ? 0.12 : 0}
                  onMouseEnter={() => setHoveredIndex(idx)}
                />

                {/* Actual Signal Count Bar */}
                {b.count > 0 && (
                  <rect
                    x={xBar}
                    y={yBar}
                    width={barWidth}
                    height={Math.max(barHeight, 2)}
                    rx="3"
                    fill={isSelected ? 'url(#selectedBarGrad)' : 'url(#volumeBarGrad)'}
                    className="transition-all duration-200"
                    opacity={isHovered ? 1 : 0.85}
                  />
                )}

                {/* Selection border ring */}
                {isSelected && b.count > 0 && (
                  <rect
                    x={xBar - 2}
                    y={yBar - 2}
                    width={barWidth + 4}
                    height={barHeight + 4}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="2"
                    rx="4"
                  />
                )}
              </g>
            );
          })}

          {/* Confidence Spline Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#neonGlow)"
              className="pointer-events-none transition-all duration-300"
            />
          )}

          {/* Interactive Confidence Data Nodes */}
          {confidencePoints.map((pt) => {
            const isHovered = hoveredIndex === pt.index;
            const isSelected = selectedDate === pt.bucket.dateKey;
            const conf = pt.bucket.avgConfidence || 0;
            const nodeColor = conf >= 85 ? '#10b981' : conf >= 75 ? '#06b6d4' : '#f59e0b';

            return (
              <g
                key={pt.bucket.dateKey}
                className="cursor-pointer"
                onClick={() => onSelectDate(isSelected ? null : pt.bucket.dateKey)}
                onMouseEnter={() => setHoveredIndex(pt.index)}
              >
                {/* Outer halo on hover/select */}
                {(isHovered || isSelected) && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="8"
                    fill={nodeColor}
                    fillOpacity="0.25"
                    stroke={nodeColor}
                    strokeWidth="1.5"
                    className="animate-pulse"
                  />
                )}
                {/* Core node */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered || isSelected ? '4.5' : '3.5'}
                  fill="#020617"
                  stroke={nodeColor}
                  strokeWidth="2"
                  className="transition-all duration-150"
                />
              </g>
            );
          })}

          {/* X Axis Date Labels */}
          {buckets.map((b, idx) => {
            // Show every label if <= 10 items, or alternate if > 10 items
            const showLabel = buckets.length <= 10 || idx % 2 === 0 || idx === buckets.length - 1;
            if (!showLabel) return null;

            const xCenter = padding.left + idx * barSlotWidth + barSlotWidth / 2;
            const isSelected = selectedDate === b.dateKey;
            const isHovered = hoveredIndex === idx;

            return (
              <text
                key={b.dateKey}
                x={xCenter}
                y={svgHeight - 10}
                textAnchor="middle"
                className={`text-[9px] font-mono transition-colors ${
                  isSelected
                    ? 'fill-cyan-300 font-bold'
                    : isHovered
                    ? 'fill-slate-200'
                    : 'fill-slate-500'
                }`}
              >
                {b.dayLabel}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {activeBucket && hoveredIndex !== null && (
          <div
            className="absolute z-20 pointer-events-none p-3 rounded-md bg-[#090d16] border border-slate-700 shadow-xl text-xs transition-transform duration-75"
            style={{
              top: '16px',
              left: Math.min(
                Math.max(16, padding.left + hoveredIndex * barSlotWidth - 10),
                svgWidth - 240
              ),
              minWidth: '220px',
              maxWidth: '280px',
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
              <span className="font-mono font-semibold text-slate-100 text-[11px]">
                {activeBucket.fullDate}
              </span>
              <span className="text-[10px] font-mono text-teal-400">
                Click to filter
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="bg-[#0e1524] p-1.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Discovered:</span>
                <span className="text-sm font-bold font-mono text-white">
                  {activeBucket.count} {activeBucket.count === 1 ? 'signal' : 'signals'}
                </span>
              </div>
              <div className="bg-[#0e1524] p-1.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Avg Confidence:</span>
                <span className="text-sm font-bold font-mono text-teal-300">
                  {activeBucket.avgConfidence !== null ? `${activeBucket.avgConfidence}%` : 'N/A'}
                </span>
              </div>
            </div>

            {/* Category breakdown if any */}
            {activeBucket.count > 0 && (
              <div className="space-y-1 mb-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Category Mix:
                </span>
                <div className="flex flex-wrap gap-1 text-[10px] font-mono text-slate-300">
                  {ALL_CATEGORIES.map((cat) => {
                    const c = activeBucket.categoryBreakdown[cat];
                    if (!c) return null;
                    return (
                      <span
                        key={cat}
                        className="text-[10px] text-slate-300"
                      >
                        {cat} ({c})
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mini preview of signal titles on this date */}
            {activeBucket.signals.length > 0 && (
              <div className="border-t border-slate-800/80 pt-1.5">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">
                  Signals on this date:
                </span>
                <ul className="space-y-1">
                  {activeBucket.signals.slice(0, 3).map((sig) => (
                    <li key={sig.id} className="text-[11px] text-slate-300 truncate">
                      • {sig.title}
                    </li>
                  ))}
                  {activeBucket.signals.length > 3 && (
                    <li className="text-[10px] text-slate-500 font-mono italic">
                      +{activeBucket.signals.length - 3} more...
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chart Legend & Date Selection Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
        {/* Interactive Legend */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-sky-500 shrink-0" />
            <span>Signal Frequency (Volume)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 rounded-full bg-cyan-400 shrink-0" />
            <span className="text-cyan-300 font-semibold">Validation Confidence (%)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full border border-emerald-400 bg-emerald-950 shrink-0" />
            <span className="text-emerald-400">&ge;85% High Quality Tier</span>
          </div>
        </div>

        {/* Selected Date Filter Pill or Action Prompt */}
        {selectedDate ? (
          <div className="flex items-center gap-2 bg-cyan-950/80 border border-cyan-700/80 px-2.5 py-1 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-mono text-cyan-200">
              Filtered to: <strong className="text-white">{selectedDate}</strong>
            </span>
            <button
              onClick={() => onSelectDate(null)}
              className="text-cyan-400 hover:text-white transition-colors p-0.5"
              title="Clear date filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            Click any bar or node to filter signals by date
          </span>
        )}
      </div>

      {/* Category Color Legend (when in Stacked mode) */}
      {chartMode === 'stacked' && (
        <div className="mt-3 pt-2 border-t border-slate-800/50 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase text-slate-500">Categories:</span>
          {ALL_CATEGORIES.map((cat) => {
            const style = CATEGORY_COLORS[cat];
            return (
              <div key={cat} className="flex items-center gap-1 text-[10px] font-mono text-slate-300">
                <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: style.fill }} />
                <span>{cat}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
