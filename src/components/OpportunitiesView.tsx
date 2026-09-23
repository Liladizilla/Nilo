import React, { useState } from 'react';
import {
  Sparkles,
  Filter,
  ArrowUpDown,
  Building,
  Clock,
  ShieldCheck,
  ChevronRight,
  Bookmark,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Opportunity } from '../types';

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
  onSelectOpportunity: (opp: Opportunity) => void;
  onSaveOpportunity?: (opp: Opportunity) => void;
  searchFilter?: string;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  opportunities,
  onSelectOpportunity,
  onSaveOpportunity,
  searchFilter = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [minScore, setMinScore] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'score' | 'recency' | 'confidence'>('score');

  const categories = Array.from(new Set(opportunities.map(o => o.category)));

  // Filter logic
  let filtered = opportunities.filter(opp => {
    if (selectedCategory !== 'all' && opp.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && opp.status !== selectedStatus) return false;
    if (opp.overallScore < minScore) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      const match =
        opp.title.toLowerCase().includes(q) ||
        opp.entityName.toLowerCase().includes(q) ||
        opp.whyNow.toLowerCase().includes(q) ||
        opp.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Sort logic
  filtered.sort((a, b) => {
    if (sortBy === 'score') return (b.overallScore || 0) - (a.overallScore || 0);
    if (sortBy === 'confidence') return (b.confidence || 0) - (a.confidence || 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Opportunity Sectors ({opportunities.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="investigating">Investigating</option>
            <option value="saved">Saved</option>
            <option value="contacted">Contacted</option>
            <option value="closed">Closed</option>
          </select>

          {/* Min Score filter */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-950 border border-slate-700/80 text-xs text-slate-300">
            <span className="text-[10px] text-slate-400 font-mono">Min Score:</span>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="font-mono text-cyan-400 text-[11px] w-6 text-right">{minScore > 0 ? `${minScore}%` : 'Off'}</span>
          </div>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="score">Overall Score</option>
            <option value="recency">Most Recent</option>
            <option value="confidence">Confidence Level</option>
          </select>
        </div>
      </div>

      {/* Opportunities List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 border border-dashed border-slate-800 rounded-xl p-8">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-300">No opportunities match current filter criteria</p>
          <p className="text-xs text-slate-500 mt-1">Adjust your filters or run Ingest Sources to fetch fresh public signals.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((opp) => {
            const scores = opp.scoringBreakdown || {
              recencyScore: 88,
              evidenceQualityScore: 85,
              signalConvergenceScore: 86,
              sourceReliabilityScore: 80,
              relevanceScore: 88,
              overallScore: opp.overallScore || 85,
            };

            return (
              <div
                key={opp.id}
                onClick={() => onSelectOpportunity(opp)}
                className="group p-4 sm:p-5 rounded-lg bg-[#0e1524] border border-slate-800/90 hover:border-slate-700 transition-all cursor-pointer relative"
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    {/* Header tags */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-teal-400" />
                        {opp.entityName}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-300 font-mono text-[11px]">
                        {opp.category}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(opp.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-white group-hover:text-teal-300 transition-colors">
                      {opp.title}
                    </h3>

                    {/* Trigger */}
                    <p className="text-xs text-slate-300">
                      <span className="font-medium text-slate-400">Trigger:</span> {opp.trigger}
                    </p>

                    {/* WHY NOW? snippet */}
                    <div className="mt-2 text-xs text-slate-300 bg-[#0a0f1a] border border-slate-800 rounded-md p-3 leading-relaxed">
                      <span className="font-mono font-medium text-teal-400 mr-1.5 uppercase text-[10px]">Why Now:</span>
                      {opp.whyNow}
                    </div>

                    {/* Transparent scoring breakdown typographic indicators */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-mono text-slate-400">
                      <span>Recency: <strong className="text-slate-200">{scores.recencyScore}%</strong></span>
                      <span className="text-slate-700">|</span>
                      <span>Evidence: <strong className="text-slate-200">{scores.evidenceQualityScore}%</strong></span>
                      <span className="text-slate-700">|</span>
                      <span>Convergence: <strong className="text-slate-200">{scores.signalConvergenceScore}%</strong></span>
                      <span className="text-slate-700">|</span>
                      <span>Reliability: <strong className="text-slate-200">{scores.sourceReliabilityScore}%</strong></span>
                      <span className="text-slate-700">|</span>
                      <span>Relevance: <strong className="text-slate-200">{scores.relevanceScore}%</strong></span>
                    </div>
                  </div>

                  {/* Right side: Score & Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="text-left sm:text-right">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold font-mono text-teal-300">
                          {opp.overallScore}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">/100</span>
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        Opportunity Score
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOpportunity(opp);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-slate-200 border border-slate-700 bg-slate-800 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      <span>Inspect Evidence</span>
                      <ChevronRight className="w-3.5 h-3.5 text-teal-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
