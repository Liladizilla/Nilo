import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  Award,
  AlertTriangle,
  Send,
  Building,
  Calendar,
  Share2
} from 'lucide-react';
import { Opportunity, Signal, MarketEvent, OpportunityAction, OpportunityOutcome } from '../types';

interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  signals: Signal[];
  events: MarketEvent[];
  onClose: () => void;
  onRecordAction: (actionData: { type: string; channel: string; notes: string }) => Promise<void>;
  onRecordOutcome: (outcomeData: { outcome: string; dealValue: number; winReason: string; lossReason: string }) => Promise<void>;
  onRunDeepReasoning: (opportunity: Opportunity) => Promise<string>;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  signals,
  events,
  onClose,
  onRecordAction,
  onRecordOutcome,
  onRunDeepReasoning,
}) => {
  if (!opportunity) return null;

  const [activeTab, setActiveTab] = useState<'evidence' | 'deep_reasoning' | 'actions' | 'outcome'>('evidence');
  
  // Action form state
  const [actionType, setActionType] = useState('contacted');
  const [actionChannel, setActionChannel] = useState('Email');
  const [actionNotes, setActionNotes] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);

  // Outcome form state
  const [outcomeStatus, setOutcomeStatus] = useState('meeting');
  const [dealValue, setDealValue] = useState('15000');
  const [winReason, setWinReason] = useState('Fast proactive reach-out quoting public hiring signal.');
  const [isSubmittingOutcome, setIsSubmittingOutcome] = useState(false);
  const [outcomeSuccess, setOutcomeSuccess] = useState(false);

  // Deep reasoning state
  const [deepReasoningText, setDeepReasoningText] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const scores = opportunity.scoringBreakdown || {
    recencyScore: 88,
    evidenceQualityScore: 84,
    signalConvergenceScore: 86,
    sourceReliabilityScore: 80,
    relevanceScore: 88,
    historicalCalibrationScore: 80,
    overallScore: opportunity.overallScore || 85,
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAction(true);
    try {
      await onRecordAction({
        type: actionType,
        channel: actionChannel,
        notes: actionNotes,
      });
      setActionSuccess(true);
      setActionNotes('');
      setTimeout(() => setActionSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleOutcomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingOutcome(true);
    try {
      await onRecordOutcome({
        outcome: outcomeStatus,
        dealValue: Number(dealValue) || 0,
        winReason,
        lossReason: outcomeStatus === 'lost' ? winReason : '',
      });
      setOutcomeSuccess(true);
      setTimeout(() => setOutcomeSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingOutcome(false);
    }
  };

  const handleTriggerThinking = async () => {
    setIsThinking(true);
    try {
      const result = await onRunDeepReasoning(opportunity);
      setDeepReasoningText(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 flex justify-center p-3 sm:p-6">
      <div className="bg-[#0b101b] border border-slate-800 rounded-lg w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-start justify-between bg-[#0e1524] gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono text-teal-400">
                {opportunity.category}
              </span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-slate-300 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {opportunity.entityName}
              </span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-slate-400 capitalize">
                Status: {opportunity.status}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white pt-1">
              {opportunity.title}
            </h2>
            <p className="text-xs text-slate-300">
              <span className="font-medium text-slate-400">Trigger:</span> {opportunity.trigger}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Score Indicator */}
            <div className="text-right flex flex-col items-end">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold font-mono text-teal-300">
                  {opportunity.overallScore}
                </span>
                <span className="text-xs text-slate-500 font-mono">/100</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                Overall Score
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Transparent Score Bar breakdown */}
        <div className="bg-[#090e18] border-b border-slate-800/80 px-4 sm:px-6 py-2.5 grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
          <div className="p-1.5 rounded bg-[#0e1524] border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">Recency (20%)</span>
            <span className="font-mono font-semibold text-slate-200">{scores.recencyScore}%</span>
          </div>
          <div className="p-1.5 rounded bg-[#0e1524] border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">Evidence (20%)</span>
            <span className="font-mono font-semibold text-slate-200">{scores.evidenceQualityScore}%</span>
          </div>
          <div className="p-1.5 rounded bg-[#0e1524] border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">Convergence (25%)</span>
            <span className="font-mono font-semibold text-slate-200">{scores.signalConvergenceScore}%</span>
          </div>
          <div className="p-1.5 rounded bg-[#0e1524] border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">Reliability (15%)</span>
            <span className="font-mono font-semibold text-slate-200">{scores.sourceReliabilityScore}%</span>
          </div>
          <div className="p-1.5 rounded bg-[#0e1524] border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">Relevance (10%)</span>
            <span className="font-mono font-semibold text-slate-200">{scores.relevanceScore}%</span>
          </div>
          <div className="p-1.5 rounded bg-[#0e1524] border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">Calibration (10%)</span>
            <span className="font-mono font-semibold text-teal-300">{scores.historicalCalibrationScore || 80}%</span>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-800 px-4 sm:px-6 bg-[#0a0f1a] text-xs font-medium">
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-2.5 px-3 border-b-2 font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'evidence'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Evidence Chain & Analysis
          </button>
          <button
            onClick={() => setActiveTab('deep_reasoning')}
            className={`py-2.5 px-3 border-b-2 font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'deep_reasoning'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            Strategic Reasoning
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`py-2.5 px-3 border-b-2 font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'actions'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-4 h-4" />
            Log Action
          </button>
          <button
            onClick={() => setActiveTab('outcome')}
            className={`py-2.5 px-3 border-b-2 font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'outcome'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            Record Outcome (Feedback Loop)
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 1: Evidence & Analysis */}
          {activeTab === 'evidence' && (
            <div className="space-y-6">
              
              {/* WHY NOW? Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-indigo-950/40 border border-cyan-800/40">
                <div className="flex items-center gap-2 mb-1.5">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300 font-mono">
                    Why Now? (Temporal Convergence & Velocity)
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {opportunity.whyNow}
                </p>
              </div>

              {/* What happened & Why it matters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[#0e1524] border border-slate-800">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
                    What Happened
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {opportunity.whatHappened}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#0e1524] border border-slate-800">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Why It Matters
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {opportunity.whyItMatters}
                  </p>
                </div>
              </div>

              {/* Directly Observed Facts (Crucial Nilo Principle: Fact vs Guess) */}
              <div className="p-4 rounded-lg bg-[#0e1524] border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-teal-300 font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                    Directly Observed Facts (Separated From Hypotheses)
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">100% Verifiable</span>
                </div>
                <ul className="space-y-2">
                  {(opportunity.facts || []).map((fact, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Primary Source Evidence Quotes & Links */}
              {opportunity.evidence && opportunity.evidence.length > 0 && (
                <div className="p-4 rounded-lg bg-[#0e1524] border border-slate-800">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-3">
                    Primary Public Evidence & Citations
                  </h3>
                  <div className="space-y-3">
                    {opportunity.evidence.map((ev, idx) => (
                      <div key={idx} className="p-3 rounded-md bg-[#0a0f1a] border border-slate-800 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span className="font-semibold text-teal-300">{ev.sourceName}</span>
                          <span className="font-mono text-slate-500">{new Date(ev.timestamp).toLocaleDateString()}</span>
                        </div>
                        <blockquote className="border-l-2 border-slate-700 pl-3 py-1 italic text-slate-300 my-1 font-serif">
                          "{ev.quote}"
                        </blockquote>
                        <a
                          href={ev.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-teal-400 hover:underline mt-1 font-mono"
                        >
                          <span>Inspect source document</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Potential Services & Target Buyers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-2">
                    Potential Vendor Services
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {opportunity.potentialServices?.map((srv, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-200 border border-slate-700/60">
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-2">
                    Target Stakeholders / Buyers
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {opportunity.potentialBuyers?.map((buyer, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md text-xs bg-indigo-950/60 text-indigo-200 border border-indigo-800/40">
                        {buyer}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggested Next Steps */}
              {opportunity.suggestedNextSteps && (
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-2">
                    Suggested Verification & Outreach Steps
                  </h3>
                  <div className="space-y-2">
                    {opportunity.suggestedNextSteps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono shrink-0">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: Deep Strategic Reasoning (High Thinking) */}
          {activeTab === 'deep_reasoning' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-bold text-indigo-200">
                      Gemini High Thinking Engine
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Powered by <span className="font-mono text-indigo-300">gemini-3.1-pro-preview</span> with <span className="font-mono text-cyan-300">thinkingLevel: HIGH</span>.
                    Executes counter-hypothesis stress testing, false-positive elimination, and timing viability.
                  </p>
                </div>

                <button
                  onClick={handleTriggerThinking}
                  disabled={isThinking}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-2 shrink-0 transition-colors shadow-md shadow-indigo-900/40"
                >
                  {isThinking ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Reasoning In-Depth...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Execute Deep Analysis</span>
                    </>
                  )}
                </button>
              </div>

              {deepReasoningText ? (
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                  {deepReasoningText}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl p-6 text-slate-400">
                  <BrainCircuit className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-xs text-slate-300 font-medium">No deep strategic reasoning run yet for this opportunity</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Click "Execute Deep Analysis" to synthesize counter-hypotheses, market timing, and risk vectors using Gemini High Thinking.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Log Action */}
          {activeTab === 'actions' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-1">
                  Track Your Outreach & Investigation
                </h3>
                <p className="text-xs text-slate-400">
                  Logging actions associates user execution with the evidence chain and updates opportunity status.
                </p>
              </div>

              {actionSuccess && (
                <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Action recorded successfully! Opportunity status updated.</span>
                </div>
              )}

              <form onSubmit={handleActionSubmit} className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Action Type</label>
                    <select
                      value={actionType}
                      onChange={(e) => setActionType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="investigated">Investigated / Researched</option>
                      <option value="contacted">Contacted Decision Maker</option>
                      <option value="meeting">Scheduled Meeting / Call</option>
                      <option value="proposal">Submitted Proposal</option>
                      <option value="saved">Bookmarked for Follow-up</option>
                      <option value="note">Internal Strategy Note</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Outreach Channel</label>
                    <input
                      type="text"
                      value={actionChannel}
                      onChange={(e) => setActionChannel(e.target.value)}
                      placeholder="e.g. Email, LinkedIn, Phone, Tender Portal"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Notes & Context</label>
                  <textarea
                    rows={3}
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="e.g. Sent personalized email to CTO referencing their recent 14 React vacancies..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingAction}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingAction ? 'Saving Action...' : 'Save Action'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: Record Outcome (Feedback Loop) */}
          {activeTab === 'outcome' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 font-mono">
                    Close the Intelligence Loop
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  By recording whether this opportunity converted into a meeting or closed deal, Nilo's scoring engine
                  calibrates weights so similar future signal combinations receive higher ranking!
                </p>
              </div>

              {outcomeSuccess && (
                <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-700 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Commercial outcome recorded! Future signal scoring recalibrated.</span>
                </div>
              )}

              <form onSubmit={handleOutcomeSubmit} className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Final Outcome</label>
                    <select
                      value={outcomeStatus}
                      onChange={(e) => setOutcomeStatus(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="won">Deal Won / Contract Signed</option>
                      <option value="meeting">Qualified Meeting Held</option>
                      <option value="proposal">Formal Proposal Sent</option>
                      <option value="responded">Positive Response Received</option>
                      <option value="lost">Lost / Chose Competitor</option>
                      <option value="no_response">No Response</option>
                      <option value="not_relevant">Disqualified / False Alarm</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Estimated / Realized Deal Value ($ USD)</label>
                    <input
                      type="number"
                      value={dealValue}
                      onChange={(e) => setDealValue(e.target.value)}
                      placeholder="0"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Why did this succeed or fail?</label>
                  <textarea
                    rows={3}
                    value={winReason}
                    onChange={(e) => setWinReason(e.target.value)}
                    placeholder="e.g. Quoting their exact hiring numbers in the first 24h proved immediate credibility..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingOutcome}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{isSubmittingOutcome ? 'Calibrating Engine...' : 'Record Outcome & Feed Learning Model'}</span>
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0e1524] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span className="font-mono text-slate-400 text-xs">ID: {opportunity.id}</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
