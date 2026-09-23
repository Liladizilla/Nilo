import React from 'react';
import {
  Trophy,
  TrendingUp,
  Brain,
  Award,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  History,
  Sparkles
} from 'lucide-react';
import { OpportunityOutcome } from '../types';

interface OutcomeLoopViewProps {
  outcomes: OpportunityOutcome[];
}

export const OutcomeLoopView: React.FC<OutcomeLoopViewProps> = ({ outcomes }) => {
  const wonCount = outcomes.filter(o => o.outcome === 'won' || o.outcome === 'meeting').length;
  const totalValue = outcomes.reduce((acc, o) => acc + (o.dealValue || 0), 0);
  const conversionRate = outcomes.length > 0 ? Math.round((wonCount / outcomes.length) * 100) : 100;

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/40 border border-emerald-800/40">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-emerald-200 font-mono uppercase tracking-wider">
            Nilo Intelligence Learning & Outcome Loop
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 ml-auto">
            Feedback Calibrated
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Nilo gets smarter through real commercial execution. Every logged outreach, meeting, and closed contract
          feeds back into the ranking algorithm to calibrate which signals genuinely predict commercial success.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Successful Conversions</span>
            <Trophy className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {wonCount} / {outcomes.length}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {conversionRate}% Meeting / Win Rate
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Realized Value</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            ${totalValue.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Attributed to public signal detection
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Learned Signal Boost</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            +18%
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Weight multiplier applied to fast founder requests
          </span>
        </div>
      </div>

      {/* How it Works Diagram */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
          <Brain className="w-4 h-4 text-cyan-400" />
          Continuous Rank Calibration Architecture
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs pt-1">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
            <span className="font-mono text-cyan-400 text-[10px] block">STEP 1</span>
            <h4 className="font-semibold text-slate-200 mt-1">Opportunity Discovered</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Scored by initial baseline weights (recency, convergence, evidence).</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
            <span className="font-mono text-indigo-400 text-[10px] block">STEP 2</span>
            <h4 className="font-semibold text-slate-200 mt-1">User Action Logged</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Outreach sent with timestamp and communication channel recorded.</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
            <span className="font-mono text-amber-400 text-[10px] block">STEP 3</span>
            <h4 className="font-semibold text-slate-200 mt-1">Outcome Recorded</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Contract won, meeting booked, or lost with verified reasons.</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
            <span className="font-mono text-emerald-400 text-[10px] block">STEP 4</span>
            <h4 className="font-semibold text-slate-200 mt-1">Weight Recalibration</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Signals that predicted wins receive dynamic score elevation.</p>
          </div>
        </div>
      </div>

      {/* Historical Outcome Log */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
          Logged Commercial Outcomes ({outcomes.length})
        </h3>

        {outcomes.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl text-slate-400 text-xs">
            No outcomes recorded yet. Open any opportunity in the feed, click "Record Outcome", and log your result!
          </div>
        ) : (
          <div className="space-y-2">
            {outcomes.map((out) => (
              <div
                key={out.id}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize font-bold ${
                      out.outcome === 'won' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' :
                      out.outcome === 'meeting' ? 'bg-blue-950 text-blue-300 border border-blue-700' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {out.outcome}
                    </span>
                    <span className="text-slate-400 font-mono">
                      Opportunity: {out.opportunityId}
                    </span>
                    {out.dealValue > 0 && (
                      <span className="font-mono font-bold text-emerald-400">
                        ${out.dealValue.toLocaleString()} USD
                      </span>
                    )}
                  </div>
                  <p className="text-slate-200">
                    <strong className="text-slate-400">Driver:</strong> {out.winReason || 'Signal timing speed'}
                  </p>
                  {out.signalsThatPredictedSuccess && out.signalsThatPredictedSuccess.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {out.signalsThatPredictedSuccess.map((s, idx) => (
                        <span key={idx} className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                  {new Date(out.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
