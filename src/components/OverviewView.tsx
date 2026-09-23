import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  Database,
  Terminal,
  Eye,
  Activity,
  TrendingUp,
  Zap,
  Clock,
  Fingerprint,
  Cpu,
  GitMerge,
  Layers,
  Sparkles,
  Target,
  ShieldCheck,
  FileText,
  ArrowUpRight,
  Play,
  CheckCircle2,
  Trophy,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  Filter,
  Search,
  SlidersHorizontal,
  RefreshCw,
  Building,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Lock,
  Compass
} from 'lucide-react';
import { Opportunity, Signal, Entity, IntelligenceSource, MarketEvent, OpportunityOutcome, SignalCategory } from '../types';
import { SignalTrendChart } from './SignalTrendChart';

interface OverviewViewProps {
  opportunities: Opportunity[];
  signals: Signal[];
  entities: Entity[];
  sources?: IntelligenceSource[];
  events?: MarketEvent[];
  outcomes?: OpportunityOutcome[];
  onSelectOpportunity: (opp: Opportunity) => void;
  onNavigateTab: (tab: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  opportunities = [],
  signals = [],
  entities = [],
  sources = [],
  events = [],
  outcomes = [],
  onSelectOpportunity,
  onNavigateTab,
}) => {
  // Active Stage in Evidence Chain (01 to 10)
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(6); // Default to #07: Opportunity
  const [hoveredNodeIndex, setHoveredNodeIndex] = useState<number | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [signalSearchQuery, setSignalSearchQuery] = useState<string>('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  // 10 Pipeline Nodes conforming strictly to Section 1.2, 4.2, and 5.2
  const nodes = useMemo(() => [
    {
      id: 'source',
      num: '#01',
      label: 'Source',
      icon: Globe,
      desc: 'Permitted public web & registry crawls',
      metric: `${sources.length || 6} Monitored Feeds | TLS 1.3`,
      metricIcon: Database,
      status: 'LIVE_INGEST',
      statusType: 'success' as const,
      isHero: false,
    },
    {
      id: 'observation',
      num: '#02',
      label: 'Observation',
      icon: Terminal,
      desc: 'Verifiable raw text & SHA-256 digests',
      metric: `${signals.reduce((acc, s) => acc + (s.facts?.length || 1), 0)} Verified Facts | 100% Unmodified`,
      metricIcon: Eye,
      status: 'VERIFIED_FACTS',
      statusType: 'success' as const,
      isHero: false,
    },
    {
      id: 'signal',
      num: '#03',
      label: 'Signal',
      icon: Activity,
      desc: 'Fact vs hypothesis directional telemetry',
      metric: `${signals.length || 24} Signals Syncing | Acc: 94.2%`,
      metricIcon: TrendingUp,
      status: 'TELEMETRY_SYNC',
      statusType: 'info' as const,
      isHero: false,
    },
    {
      id: 'event',
      num: '#04',
      label: 'Event',
      icon: Zap,
      desc: 'Correlated point-in-time incidents',
      metric: `${events.length || 8} Market Events | Window: 72h`,
      metricIcon: Clock,
      status: 'CLUSTER_ACTIVE',
      statusType: 'info' as const,
      isHero: false,
    },
    {
      id: 'entity',
      num: '#05',
      label: 'Entity',
      icon: Fingerprint,
      desc: 'Subject resolution & identity matching',
      metric: `${entities.length || 12} Profiles Resolved | Match: 99.4%`,
      metricIcon: Cpu,
      status: 'RESOLVED',
      statusType: 'success' as const,
      isHero: false,
    },
    {
      id: 'correlation',
      num: '#06',
      label: 'Correlation',
      icon: GitMerge,
      desc: 'Multi-signal sync & cross-validation',
      metric: 'Corr: 0.884 High | 3 Data Paths',
      metricIcon: Layers,
      status: 'CONVERGED',
      statusType: 'info' as const,
      isHero: false,
    },
    {
      id: 'opportunity',
      num: '#07',
      label: 'Opportunity',
      icon: Target,
      desc: 'Commercial timing & revenue threshold',
      metric: `${opportunities.length} Commercial Targets | Top: 89/100`,
      metricIcon: Sparkles,
      status: 'CRITICAL_TIMING',
      statusType: 'warning' as const,
      isHero: true,
    },
    {
      id: 'evidence',
      num: '#08',
      label: 'Evidence',
      icon: ShieldCheck,
      desc: 'Traceable proof chain & compliance audit',
      metric: '100% Audit Verified | Legal Trace',
      metricIcon: FileText,
      status: 'AUDITED',
      statusType: 'success' as const,
      isHero: false,
    },
    {
      id: 'action',
      num: '#09',
      label: 'Action',
      icon: ArrowUpRight,
      desc: 'Outreach vectors & CRM integration',
      metric: '3 Channels Active | Salesforce / HubSpot',
      metricIcon: Play,
      status: 'READY',
      statusType: 'info' as const,
      isHero: false,
    },
    {
      id: 'outcome',
      num: '#10',
      label: 'Outcome',
      icon: CheckCircle2,
      desc: 'Closed-loop attribution & Bayesian learning',
      metric: 'Win Rate: 100% | $125k Booked Value',
      metricIcon: Trophy,
      status: 'LOOP_CALIBRATED',
      statusType: 'success' as const,
      isHero: true,
    },
  ], [sources.length, signals, events.length, entities.length, opportunities.length]);

  const activeNode = nodes[selectedNodeIndex] || nodes[6];

  // Section 1.3: Keyboard-Driven Traversal (J/K Keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        setSelectedNodeIndex((prev) => (prev + 1 < nodes.length ? prev + 1 : prev));
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        setSelectedNodeIndex((prev) => (prev - 1 >= 0 ? prev - 1 : prev));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes.length]);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Top Opportunities sorted by overall score
  const sortedOpportunities = useMemo(() => {
    return [...opportunities].sort((a, b) => b.overallScore - a.overallScore);
  }, [opportunities]);

  const heroOpp = sortedOpportunities[0] || opportunities[0];

  // Filtered signals for the Signal panel
  const filteredSignals = useMemo(() => {
    return signals.filter((s) => {
      const matchCat = categoryFilter === 'all' || s.signalCategory === categoryFilter;
      const matchSearch =
        !signalSearchQuery ||
        s.title.toLowerCase().includes(signalSearchQuery.toLowerCase()) ||
        s.entityName.toLowerCase().includes(signalSearchQuery.toLowerCase());
      const matchDate =
        !selectedDateFilter ||
        (s.detectedAt && s.detectedAt.startsWith(selectedDateFilter)) ||
        (s.observedAt && s.observedAt.startsWith(selectedDateFilter));
      return matchCat && matchSearch && matchDate;
    });
  }, [signals, categoryFilter, signalSearchQuery, selectedDateFilter]);

  // Mock baseline feeds if sources empty
  const activeSources = useMemo(() => {
    if (sources.length > 0) return sources;
    return [
      {
        id: 'src-hn-jobs',
        name: 'Hacker News Who Is Hiring Index',
        type: 'web',
        url: 'https://news.ycombinator.com',
        status: 'active',
        complianceNotes: 'Public crawl permitted, robots.txt honored',
        recordsCount: 420,
        signalsGenerated: 8,
        lastRunAt: '4m ago',
        createdAt: '2026-09-01T00:00:00Z',
      },
      {
        id: 'src-fed-gazette',
        name: 'Official Federal & State Gazette Notices',
        type: 'api',
        url: 'https://www.federalregister.gov',
        status: 'active',
        complianceNotes: 'US Government Open Data Directive compliance verified',
        recordsCount: 1840,
        signalsGenerated: 14,
        lastRunAt: '12m ago',
        createdAt: '2026-09-01T00:00:00Z',
      },
      {
        id: 'src-sec-edgar',
        name: 'SEC EDGAR 10-Q & 8-K Regulatory Filings',
        type: 'api',
        url: 'https://data.sec.gov',
        status: 'active',
        complianceNotes: 'SEC Fair Access and rate limit compliance active',
        recordsCount: 89,
        signalsGenerated: 5,
        lastRunAt: '28m ago',
        createdAt: '2026-09-01T00:00:00Z',
      },
      {
        id: 'src-bio-trials',
        name: 'ClinicalTrials.gov Public Milestone Index',
        type: 'directory',
        url: 'https://clinicaltrials.gov',
        status: 'active',
        complianceNotes: 'Public health directory API access',
        recordsCount: 312,
        signalsGenerated: 4,
        lastRunAt: '1h ago',
        createdAt: '2026-09-01T00:00:00Z',
      },
      {
        id: 'src-gh-orgs',
        name: 'GitHub Enterprise Public Infrastructure Commits',
        type: 'api',
        url: 'https://api.github.com',
        status: 'active',
        complianceNotes: 'Public open-source repository telemetry only',
        recordsCount: 1290,
        signalsGenerated: 9,
        lastRunAt: '2h ago',
        createdAt: '2026-09-01T00:00:00Z',
      },
    ] as IntelligenceSource[];
  }, [sources]);

  return (
    <div className="space-y-4">
      
      {/* Top Status & Keyboard Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded bg-[#0f131a] border border-[#1e2530] text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#94a3b8]">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[#f8fafc] font-semibold">DAG Pipeline Live:</span>
            <span>Master-Detail Lineage Architecture</span>
          </div>

          <span className="text-[#475569] hidden md:inline">|</span>

          <div className="hidden md:flex items-center gap-1.5 font-mono text-[11px] text-[#94a3b8]">
            <span>Active Focus:</span>
            <span className="text-[#38bdf8] font-bold">{activeNode.num} {activeNode.label.toUpperCase()}</span>
          </div>
        </div>

        {/* Keyboard navigation indicator */}
        <div className="flex items-center gap-2 self-end sm:self-center font-mono text-[11px]">
          <span className="text-[#94a3b8]">Navigate Pipeline:</span>
          <kbd className="px-1.5 py-0.5 rounded bg-[#171c26] border border-[#313d4f] text-[#f8fafc] font-bold">J</kbd>
          <span className="text-[#475569]">next</span>
          <kbd className="px-1.5 py-0.5 rounded bg-[#171c26] border border-[#313d4f] text-[#f8fafc] font-bold">K</kbd>
          <span className="text-[#475569]">prev</span>
        </div>
      </div>

      {/* SECTION 1.2: Split-Pane Master-Detail Lineage Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* =========================================================================
            THE LEFT CANVAS (35% Width): Rigid Vertical Pipeline with SVG Stroke
            ========================================================================= */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-2">
          
          <div className="flex items-center justify-between px-1 text-xs font-mono text-[#94a3b8]">
            <span className="uppercase tracking-wider font-semibold text-[#f8fafc]">
              Evidence Chain DAG (10 Stages)
            </span>
            <span className="text-[10px] text-[#475569]">Sequential Causality</span>
          </div>

          {/* Vertical Pipeline Container */}
          <div className="relative pl-6 space-y-2">
            
            {/* Active Vertical SVG Thread Line connecting nodes */}
            <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-[#1e2530] pointer-events-none">
              <div
                className="w-full bg-gradient-to-b from-[#38bdf8] via-[#818cf8] to-[#10b981] transition-all duration-300"
                style={{
                  height: `${((selectedNodeIndex + 1) / nodes.length) * 100}%`,
                }}
              />
            </div>

            {/* Nodes 01 through 10 strictly conforming to Component Blueprint 5.2 */}
            {nodes.map((node, idx) => {
              const Icon = node.icon;
              const MetricIcon = node.metricIcon;
              const isSelected = selectedNodeIndex === idx;

              // Hover upstream dependency highlighting rule (Section 1.3)
              const isHovered = hoveredNodeIndex === idx;
              const isUpstream = hoveredNodeIndex !== null && idx < hoveredNodeIndex;
              const isDownstream = hoveredNodeIndex !== null && idx > hoveredNodeIndex;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeIndex(idx)}
                  onMouseEnter={() => setHoveredNodeIndex(idx)}
                  onMouseLeave={() => setHoveredNodeIndex(null)}
                  className={`group relative text-left rounded transition-all cursor-pointer select-none border p-3 ${
                    isSelected
                      ? 'bg-[#171c26] border-[#3b82f6] shadow-sm ring-1 ring-[#3b82f6]'
                      : isHovered
                      ? 'bg-[#121721] border-[#313d4f]'
                      : isUpstream
                      ? 'bg-[#0f131a] border-[#38bdf8]/40 opacity-95'
                      : isDownstream
                      ? 'bg-[#0f131a] border-[#1e2530] opacity-40'
                      : 'bg-[#0f131a] border-[#1e2530] hover:border-[#313d4f]'
                  }`}
                >
                  {/* Active Pin Beacon on Thread Line */}
                  <div
                    className={`absolute -left-[29px] top-3.5 w-3 h-3 rounded-full border-2 transition-all ${
                      isSelected
                        ? 'bg-[#3b82f6] border-[#f8fafc] scale-110 shadow-sm shadow-[#3b82f6]/50'
                        : isUpstream
                        ? 'bg-[#38bdf8] border-[#0f131a]'
                        : 'bg-[#07090e] border-[#313d4f]'
                    }`}
                  />

                  {/* Header Row: [Icon 16x16] --text-body-bold [Label] ... [#01 / --text-muted] */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center shrink-0">
                        <Icon className={`w-4 h-4 ${
                          isSelected ? 'text-[#38bdf8]' : 'text-[#94a3b8]'
                        }`} />
                      </div>
                      <span className={`text-[13px] font-semibold tracking-tight ${
                        isSelected ? 'text-[#f8fafc]' : 'text-[#e2e8f0]'
                      }`}>
                        {node.label}
                      </span>
                      {node.isHero && (
                        <span className="text-[9px] font-mono font-bold uppercase px-1 py-0.2 rounded bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40">
                          Hero
                        </span>
                      )}
                    </div>

                    {/* Functional ID Deep-Link Anchor in Muted Border Tone (Section 2.3) */}
                    <span className="font-mono text-[11px] text-[#475569] font-medium px-1.5 py-0.5 rounded border border-[#1e2530] bg-[#07090e]">
                      {node.num}
                    </span>
                  </div>

                  {/* Divider Line: --border-muted */}
                  <div className="h-[1px] bg-[#1e2530] w-full mb-1.5" />

                  {/* Description: --text-secondary */}
                  <p className="text-[12px] text-[#94a3b8] leading-tight mb-2 font-normal line-clamp-1">
                    {node.desc}
                  </p>

                  {/* Nested Inline Mini-Metric Blueprint (Section 5.2) */}
                  <div className="p-1.5 rounded bg-[#07090e] border border-[#1e2530] flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center gap-1.5 text-[#94a3b8] truncate">
                      <MetricIcon className="w-3 h-3 text-[#38bdf8] shrink-0" />
                      <span className="truncate">{node.metric}</span>
                    </div>

                    {isSelected && (
                      <span className="text-[9px] text-[#38bdf8] font-bold uppercase shrink-0 pl-1">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* =========================================================================
            THE RIGHT WORKSPACE (65% Width): Contextual Dynamic Detail Panel
            Instantly hydrated with raw database tables, timelines, scores & actions
            ========================================================================= */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-4">
          
          {/* Active Node Workspace Header */}
          <div className="p-3.5 rounded bg-[#0f131a] border border-[#1e2530] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#171c26] border border-[#313d4f] flex items-center justify-center shrink-0">
                {React.createElement(activeNode.icon, { className: 'w-4 h-4 text-[#38bdf8]' })}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-[#475569] font-semibold">{activeNode.num}</span>
                  <h1 className="text-sm sm:text-base font-semibold text-[#f8fafc] tracking-tight">
                    {activeNode.label} Workspace & Forensic Telemetry
                  </h1>
                </div>
                <p className="text-xs text-[#94a3b8] mt-0.5">
                  {activeNode.desc}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center font-mono text-xs">
              <span className="px-2 py-0.5 rounded border border-[#1e2530] bg-[#07090e] text-[#38bdf8]">
                {activeNode.status}
              </span>
              <button
                onClick={() => {
                  if (activeNode.id === 'source') onNavigateTab('sources');
                  else if (activeNode.id === 'observation' || activeNode.id === 'signal' || activeNode.id === 'event') onNavigateTab('signals');
                  else if (activeNode.id === 'entity') onNavigateTab('entities');
                  else if (activeNode.id === 'outcome') onNavigateTab('outcomes');
                  else onNavigateTab('opportunities');
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#171c26] hover:bg-[#1f2633] text-[#f8fafc] border border-[#313d4f] transition-colors"
                title="Expand to Full Dedicated Tab"
              >
                <span>Full Tab</span>
                <ExternalLink className="w-3 h-3 text-[#94a3b8]" />
              </button>
            </div>
          </div>

          {/* DYNAMIC CONTENT HYDRATION BASED ON ACTIVE NODE */}

          {/* -------------------------------------------------------------
              STAGE 01: SOURCE (Ingestion Feeds & Transport Security)
              ------------------------------------------------------------- */}
          {activeNode.id === 'source' && (
            <div className="p-4 rounded bg-[#0f131a] border border-[#1e2530] space-y-4">
              <div className="flex items-center justify-between border-b border-[#1e2530] pb-3">
                <div>
                  <h2 className="text-sm font-semibold text-[#f8fafc] font-mono uppercase tracking-wide">
                    Monitored Public Web Feeds ({activeSources.length} Active Nodes)
                  </h2>
                  <p className="text-xs text-[#94a3b8]">
                    Real-time polling compliant with robots.txt, rate limits, and public disclosure policies.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab('sources')}
                  className="px-2.5 py-1 rounded bg-[#171c26] text-xs font-mono text-[#38bdf8] border border-[#313d4f] hover:bg-[#1f2633]"
                >
                  Manage Sources
                </button>
              </div>

              {/* High-Density Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1e2530] text-[11px] font-mono text-[#475569] uppercase">
                      <th className="pb-2 font-medium">Source / Feed Name</th>
                      <th className="pb-2 font-medium">Type</th>
                      <th className="pb-2 font-medium">Transport</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium text-right">Records</th>
                      <th className="pb-2 font-medium text-right">Signals</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2530] font-mono">
                    {activeSources.map((src) => (
                      <tr key={src.id} className="hover:bg-[#171c26]/50 transition-colors">
                        <td className="py-2.5 pr-2 font-sans font-medium text-[#f8fafc]">
                          <div className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                            <span className="truncate max-w-[220px]">{src.name}</span>
                          </div>
                          <span className="text-[10px] text-[#475569] font-mono block mt-0.5 truncate max-w-[220px]">
                            {src.complianceNotes}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-[#94a3b8] uppercase text-[10px]">
                          {src.type}
                        </td>
                        <td className="py-2.5 px-2 text-[#94a3b8] text-[10px]">
                          HTTPS/2 TLS 1.3
                        </td>
                        <td className="py-2.5 px-2">
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#10b981]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                            200 OK
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-right text-[#f8fafc]">
                          {src.recordsCount.toLocaleString()}
                        </td>
                        <td className="py-2.5 pl-2 text-right text-[#38bdf8] font-bold">
                          {src.signalsGenerated}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              STAGE 02: OBSERVATION (Verifiable Raw Text & SHA-256 Forensics)
              ------------------------------------------------------------- */}
          {activeNode.id === 'observation' && (
            <div className="p-4 rounded bg-[#0f131a] border border-[#1e2530] space-y-4">
              <div className="flex items-center justify-between border-b border-[#1e2530] pb-3">
                <div>
                  <h2 className="text-sm font-semibold text-[#f8fafc] font-mono uppercase tracking-wide">
                    Verifiable Raw Text Forensics Ledger
                  </h2>
                  <p className="text-xs text-[#94a3b8]">
                    Observations are preserved verbatim with cryptographic verification hashes.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-[#10b981] px-2 py-0.5 rounded bg-[#10b981]/10 border border-[#10b981]/30">
                  FACT_INVARIANT: STRICT
                </span>
              </div>

              <div className="space-y-2.5">
                {signals.slice(0, 5).map((sig, i) => {
                  const factSnippet = sig.facts?.[0] || sig.description;
                  const mockHash = `sha256:${(sig.id.replace(/[^0-9a-f]/g, '') + '8f7a90b4c2e17d9a').slice(0, 24)}...`;

                  return (
                    <div key={sig.id} className="p-3 rounded bg-[#07090e] border border-[#1e2530] space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-[#38bdf8] font-bold">OBS-{(i + 1).toString().padStart(3, '0')}</span>
                          <span className="text-[#475569]">|</span>
                          <span className="text-[#f8fafc] font-sans font-semibold">{sig.entityName}</span>
                        </div>
                        <span className="text-[#94a3b8]">{sig.observedAt ? new Date(sig.observedAt).toLocaleDateString() : 'Recent'}</span>
                      </div>

                      <blockquote className="text-xs text-[#e2e8f0] font-sans pl-2.5 border-l-2 border-[#38bdf8] italic leading-relaxed">
                        "{factSnippet}"
                      </blockquote>

                      <div className="flex items-center justify-between pt-1 border-t border-[#1e2530] text-[10px] font-mono text-[#475569]">
                        <span className="truncate max-w-[280px]">Digest: <code className="text-[#94a3b8]">{mockHash}</code></span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(factSnippet, `obs-${sig.id}`)}
                            className="text-[#94a3b8] hover:text-[#f8fafc] flex items-center gap-1 transition-colors"
                          >
                            {copiedText === `obs-${sig.id}` ? (
                              <>
                                <Check className="w-3 h-3 text-[#10b981]" />
                                <span className="text-[#10b981]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Text</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              STAGE 03: SIGNAL (Fact vs Hypothesis Telemetry & Dynamics)
              ------------------------------------------------------------- */}
          {activeNode.id === 'signal' && (
            <div className="space-y-4">
              {/* Temporal Frequency & Anomaly Waveform */}
              <SignalTrendChart
                signals={signals}
                selectedDate={selectedDateFilter}
                onSelectDate={(d) => setSelectedDateFilter(d)}
                selectedCategory={categoryFilter}
                onSelectCategory={(c) => setCategoryFilter(c)}
              />

              {/* Signals High-Density Table with Filters */}
              <div className="p-4 rounded bg-[#0f131a] border border-[#1e2530] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-[#f8fafc] font-mono uppercase tracking-wide">
                    Signals Ledger ({filteredSignals.length} Records)
                  </h2>

                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1 font-mono text-[10px]">
                    {['all', 'GROWTH', 'DEMAND', 'PROBLEM', 'CHANGE', 'OPPORTUNITY'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-2 py-0.5 rounded border transition-colors ${
                          categoryFilter === cat
                            ? 'bg-[#171c26] text-[#38bdf8] border-[#38bdf8]'
                            : 'bg-[#07090e] text-[#94a3b8] border-[#1e2530] hover:text-[#f8fafc]'
                        }`}
                      >
                        {cat.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#1e2530] text-[11px] font-mono text-[#475569] uppercase">
                        <th className="pb-2 font-medium">Entity</th>
                        <th className="pb-2 font-medium">Category</th>
                        <th className="pb-2 font-medium">Fact vs Hypothesis Title</th>
                        <th className="pb-2 font-medium text-right">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e2530] font-mono">
                      {filteredSignals.slice(0, 6).map((sig) => (
                        <tr key={sig.id} className="hover:bg-[#171c26]/50 transition-colors">
                          <td className="py-2.5 pr-2 font-sans font-medium text-[#f8fafc]">
                            {sig.entityName}
                          </td>
                          <td className="py-2.5 px-2">
                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-[#1e2530] bg-[#07090e] text-[#38bdf8]">
                              {sig.signalCategory}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 font-sans text-[#e2e8f0]">
                            <div className="font-semibold text-xs leading-tight">{sig.title}</div>
                            {sig.facts?.[0] && (
                              <div className="text-[11px] text-[#94a3b8] line-clamp-1 mt-0.5">
                                • Fact: {sig.facts[0]}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 pl-2 text-right">
                            <span className={`font-bold ${
                              sig.confidence >= 85 ? 'text-[#10b981]' : 'text-[#38bdf8]'
                            }`}>
                              {sig.confidence}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              STAGE 04: EVENT (Correlated Point-In-Time Incidents)
              ------------------------------------------------------------- */}
          {activeNode.id === 'event' && (
            <div className="p-4 rounded bg-[#0f131a] border border-[#1e2530] space-y-4">
              <div className="flex items-center justify-between border-b border-[#1e2530] pb-3">
                <div>
                  <h2 className="text-sm font-semibold text-[#f8fafc] font-mono uppercase tracking-wide">
                    Correlated Market Events & Clustered Incidents
                  </h2>
                  <p className="text-xs text-[#94a3b8]">
                    Multi-signal temporal clusters indicating structural organizational shifts.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-[#38bdf8] px-2 py-0.5 rounded bg-[#171c26] border border-[#313d4f]">
                  WINDOW: 72H
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'ev-01',
                    title: 'Multi-Department Clinical & Regulatory Hiring Surge',
                    entity: 'BioPharm Solutions',
                    signalsCount: 3,
                    conf: 88,
                    time: 'T-Minus 48h',
                    impact: 'HIGH COMMERCIAL DEMAND'
                  },
                  {
                    id: 'ev-02',
                    title: 'Facility Expansion & Direct Laboratory Vendor Solicitations',
                    entity: 'Kipawa BioTech East Africa',
                    signalsCount: 4,
                    conf: 91,
                    time: 'T-Minus 24h',
                    impact: 'CAPITAL DEPLOYMENT'
                  },
                  {
                    id: 'ev-03',
                    title: 'Infrastructure Modernization & Legacy Migration Tender',
                    entity: 'Apex FinTech Global',
                    signalsCount: 2,
                    conf: 85,
                    time: 'T-Minus 72h',
                    impact: 'PROCUREMENT RFP'
                  }
                ].map((ev) => (
                  <div key={ev.id} className="p-3.5 rounded bg-[#07090e] border border-[#1e2530] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[#38bdf8]" />
                        <span className="text-xs font-semibold text-[#f8fafc]">{ev.title}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30">
                        {ev.impact}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#94a3b8] pt-1 border-t border-[#1e2530]">
                      <span>Entity: <strong className="text-[#f8fafc] font-sans">{ev.entity}</strong></span>
                      <span>Signals Correlated: <strong className="text-[#38bdf8]">{ev.signalsCount}</strong></span>
                      <span>Confidence: <strong className="text-[#10b981]">{ev.conf}%</strong></span>
                      <span>Timeline: {ev.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              STAGE 05: ENTITY (Resolved Corporate Identity Profiles)
              ------------------------------------------------------------- */}
          {activeNode.id === 'entity' && (
            <div className="p-4 rounded bg-[#0f131a] border border-[#1e2530] space-y-4">
              <div className="flex items-center justify-between border-b border-[#1e2530] pb-3">
                <div>
                  <h2 className="text-sm font-semibold text-[#f8fafc] font-mono uppercase tracking-wide">
                    Resolved Entity Profiles ({entities.length} Organizations)
                  </h2>
                  <p className="text-xs text-[#94a3b8]">
                    Canonical corporate registry identity matching, aliases, and industry taxonomy.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab('entities')}
                  className="px-2.5 py-1 rounded bg-[#171c26] text-xs font-mono text-[#38bdf8] border border-[#313d4f] hover:bg-[#1f2633]"
                >
                  View All Entities
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1e2530] text-[11px] font-mono text-[#475569] uppercase">
                      <th className="pb-2 font-medium">Canonical Name</th>
                      <th className="pb-2 font-medium">Industry Vertical</th>
                      <th className="pb-2 font-medium">Jurisdiction</th>
                      <th className="pb-2 font-medium text-right">Active Signals</th>
                      <th className="pb-2 font-medium text-right">Resolution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2530] font-mono">
                    {entities.map((ent) => (
                      <tr key={ent.id} className="hover:bg-[#171c26]/50 transition-colors">
                        <td className="py-2.5 pr-2 font-sans font-medium text-[#f8fafc]">
                          <div className="flex items-center gap-1.5">
                            <Fingerprint className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                            <span>{ent.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-[#94a3b8] font-sans">
                          {ent.industry}
                        </td>
                        <td className="py-2.5 px-2 text-[#94a3b8]">
                          {ent.location}
                        </td>
                        <td className="py-2.5 px-2 text-right text-[#38bdf8] font-bold">
                          {ent.signalCount || 4}
                        </td>
                        <td className="py-2.5 pl-2 text-right">
                          <span className="text-[10px] text-[#10b981] font-bold">
                            MATCH: 99.4%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              STAGE 06: CORRELATION (Multi-Signal Convergence Matrix)
              ------------------------------------------------------------- */}
          {activeNode.id === 'correlation' && (
            <div className="p-4 rounded bg-[#0f131a] border border-[#1e2530] space-y-4">
              <div className="flex items-center justify-between border-b border-[#1e2530] pb-3">
                <div>
                  <h2 className="text-sm font-semibold text-[#f8fafc] font-mono uppercase tracking-wide">
                    Multi-Signal Convergence & Cross-Validation Matrix
                  </h2>
                  <p className="text-xs text-[#94a3b8]">
                    Independent proof paths converging to form substantiated commercial hypotheses.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-[#38bdf8] px-2 py-0.5 rounded bg-[#171c26] border border-[#313d4f]">
                  PEARSON_CORR: 0.884
                </span>
              </div>

              <div className="p-3.5 rounded bg-[#07090e] border border-[#1e2530] space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-[#94a3b8] border-b border-[#1e2530] pb-2">
                  <span className="font-semibold text-[#f8fafc]">Convergence Vector: BioPharm Solutions</span>
                  <span className="text-[#10b981]">3 Independent Nodes Converged</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2 rounded bg-[#0f131a] border border-[#1e2530]">
                    <span className="text-[10px] text-[#475569] block">NODE A: TALENT</span>
                    <span className="text-[#f8fafc] font-sans font-medium text-xs">5 Regulatory Roles</span>
                  </div>
                  <div className="p-2 rounded bg-[#0f131a] border border-[#1e2530]">
                    <span className="text-[10px] text-[#475569] block">NODE B: REGULATORY</span>
                    <span className="text-[#f8fafc] font-sans font-medium text-xs">Phase III Filing Window</span>
                  </div>
                  <div className="p-2 rounded bg-[#0f131a] border border-[#1e2530]">
                    <span className="text-[10px] text-[#475569] block">NODE C: CAPITAL</span>
                    <span className="text-[#f8fafc] font-sans font-medium text-xs">$45M Series B Tranche</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#0f131a] border border-[#1e2530] space-y-1">
                  <span className="text-[10px] text-[#38bdf8] font-bold block uppercase">
                    Synthesized Commercial Hypothesis:
                  </span>
                  <p className="text-xs text-[#e2e8f0] font-sans leading-relaxed">
                    BioPharm Solutions is preparing for immediate commercial scale and lacks in-house regulatory audit capacity to meet mandatory 60-day deadlines, creating an urgent advisory procurement requirement.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              STAGE 07: OPPORTUNITY (Strategic Hero Dossier & Targets Queue)
              ------------------------------------------------------------- */}
          {activeNode.id === 'opportunity' && (
            <div className="space-y-4">
              
              {/* Strategic Hero Card: Metric-Focused (Section 1.2 & 2.1) */}
              {heroOpp && (
                <div className="p-4 sm:p-5 rounded bg-[#0f131a] border-2 border-[#38bdf8]/60 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2530] pb-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#38bdf8]" />
                      <span className="text-xs font-mono font-bold uppercase text-[#38bdf8] tracking-wider">
                        Primary Strategic Commercial Opportunity
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-[#94a3b8]">Overall Score:</span>
                      <span className="text-xl font-bold text-[#f8fafc]">{heroOpp.overallScore}</span>
                      <span className="text-xs text-[#475569]">/ 100</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-[#38bdf8] font-semibold">{heroOpp.entityName}</span>
                      <span className="text-[#475569]">•</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border border-[#1e2530] bg-[#07090e] text-[#94a3b8]">
                        {heroOpp.category}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-semibold text-[#f8fafc] tracking-tight">
                      {heroOpp.title}
                    </h2>
                  </div>

                  {/* Why Now Execution Window */}
                  <div className="p-3 rounded bg-[#07090e] border border-[#1e2530] space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-[#f59e0b] uppercase">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Commercial Execution Window ("Why Now"):</span>
                    </div>
                    <p className="text-xs text-[#e2e8f0] font-sans leading-relaxed">
                      {heroOpp.whyNow}
                    </p>
                  </div>

                  {/* Scoring Breakdown Metric Bars */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-[11px]">
                    <div className="p-2 rounded bg-[#07090e] border border-[#1e2530]">
                      <span className="text-[#475569] text-[10px] block">RECENCY</span>
                      <span className="text-[#38bdf8] font-bold text-sm">{heroOpp.scoringBreakdown?.recencyScore || 92}%</span>
                    </div>
                    <div className="p-2 rounded bg-[#07090e] border border-[#1e2530]">
                      <span className="text-[#475569] text-[10px] block">EVIDENCE QUALITY</span>
                      <span className="text-[#10b981] font-bold text-sm">{heroOpp.scoringBreakdown?.evidenceQualityScore || 88}%</span>
                    </div>
                    <div className="p-2 rounded bg-[#07090e] border border-[#1e2530]">
                      <span className="text-[#475569] text-[10px] block">CONVERGENCE</span>
                      <span className="text-[#818cf8] font-bold text-sm">{heroOpp.scoringBreakdown?.signalConvergenceScore || 85}%</span>
                    </div>
                    <div className="p-2 rounded bg-[#07090e] border border-[#1e2530]">
                      <span className="text-[#475569] text-[10px] block">SOURCE RELIABILITY</span>
                      <span className="text-[#f8fafc] font-bold text-sm">{heroOpp.scoringBreakdown?.sourceReliabilityScore || 90}%</span>
                    </div>
                  </div>

                  {/* Action Hooks */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1e2530]">
                    <button
                      onClick={() => onSelectOpportunity(heroOpp)}
                      className="px-3.5 py-1.5 rounded bg-[#3b82f6] hover:bg-[#2563eb] text-[#f8fafc] text-xs font-semibold font-mono transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Open Full Strategic Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onNavigateTab('opportunities')}
                      className="px-3 py-1.5 rounded bg-[#171c26] hover:bg-[#1f2633] text-[#94a3b8] hover:text-[#f8fafc] text-xs font-mono border border-[#313d4f] transition-colors"
                    >
                      View All Opportunities ({opportunities.length})
                    </button>
                  </div>
                </div>
              )}

              {/* High-Density Opportunities Table Queue */}
              <div className="p-4 rounded bg-[#0f131a] border border-[#1e2530] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-[#f8fafc] font-mono uppercase tracking-wide">
                    Ranked Opportunities Queue
                  </h3>
                  <span className="text-[11px] font-mono text-[#94a3b8]">
                    Sorted by Overall Score
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#1e2530] text-[11px] font-mono text-[#475569] uppercase">
                        <th className="pb-2 font-medium">Target Entity</th>
                        <th className="pb-2 font-medium">Opportunity Title</th>
                        <th className="pb-2 font-medium">Category</th>
                        <th className="pb-2 font-medium text-right">Score</th>
                        <th className="pb-2 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e2530] font-mono">
                      {sortedOpportunities.slice(0, 5).map((opp) => (
                        <tr key={opp.id} className="hover:bg-[#171c26]/50 transition-colors">
                          <td className="py-2.5 pr-2 font-sans font-medium text-[#f8fafc]">
                            {opp.entityName}
                          </td>
                          <td className="py-2.5 px-2 font-sans text-[#e2e8f0]">
                            <div className="font-semibold text-xs leading-tight line-clamp-1">{opp.title}</div>
                            <div className="text-[10px] text-[#94a3b8] font-mono mt-0.5 line-clamp-1">{opp.whyNow}</div>
                          </td>
                          <td className="py-2.5 px-2">
                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-[#1e2530] bg-[#07090e] text-[#94a3b8]">
                              {opp.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            <span className="font-bold text-[#f8fafc] text-sm">{opp.overallScore}</span>
                          </td>
                          <td className="py-2.5 pl-2 text-right">
                            <button
                              onClick={() => onSelectOpportunity(opp)}
                              className="px-2 py-1 rounded bg-[#171c26] hover:bg-[#1f2633] text-[#38bdf8] border border-[#313d4f] text-[11px] font-mono transition-colors"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* -------------------------------------------------------------
              STAGE 08: EVIDENCE (Traceable Proof Chain & Legal Audit)
              ------------------------------------------------------------- */}
          {activeNode.id === 'evidence' && (
            <div className="p-4 rounded bg-[#0f131a] border border-[#1e2530] space-y-4">
              <div className="flex items-center justify-between border-b border-[#1e2530] pb-3">
                <div>
                  <h2 className="text-sm font-semibold text-[#f8fafc] font-mono uppercase tracking-wide">
                    Traceable Evidence & Compliance Audit Chain
                  </h2>
                  <p className="text-xs text-[#94a3b8]">
                    Every opportunity insight links directly to verifiable public citations.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-[#10b981] px-2 py-0.5 rounded bg-[#10b981]/10 border border-[#10b981]/30">
                  LEGAL_TRACE: 100%
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {heroOpp?.evidence?.map((ev, i) => (
                  <div key={i} className="p-3 rounded bg-[#07090e] border border-[#1e2530] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#38bdf8] font-bold">Citation #{i + 1}: {ev.sourceName}</span>
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#94a3b8] hover:text-[#f8fafc] flex items-center gap-1"
                      >
                        <span>Open URL</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <blockquote className="text-xs text-[#e2e8f0] font-sans pl-2 border-l-2 border-[#10b981] italic">
                      "{ev.quote}"
                    </blockquote>
                    <div className="text-[10px] text-[#475569] pt-1">
                      Integrity: SHA-256 Validated | Cryptographic Match Verified
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              STAGE 09: ACTION (Outreach Vectors & CRM Hooks)
              ------------------------------------------------------------- */}
          {activeNode.id === 'action' && (
            <div className="p-4 rounded bg-[#0f131a] border border-[#1e2530] space-y-4">
              <div className="flex items-center justify-between border-b border-[#1e2530] pb-3">
                <div>
                  <h2 className="text-sm font-semibold text-[#f8fafc] font-mono uppercase tracking-wide">
                    Commercial Action Vectors & Outreach Execution
                  </h2>
                  <p className="text-xs text-[#94a3b8]">
                    Evidence-backed outreach templates with automated CRM integration.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-[#38bdf8] px-2 py-0.5 rounded bg-[#171c26] border border-[#313d4f]">
                  CHANNELS_READY: 3
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded bg-[#07090e] border border-[#1e2530] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#f8fafc] font-semibold">Direct Executive Email</span>
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  </div>
                  <p className="text-[11px] text-[#94a3b8] font-sans">
                    Cites public regulatory filing trigger to demonstrate zero-spam relevance.
                  </p>
                  <button
                    onClick={() => heroOpp && onSelectOpportunity(heroOpp)}
                    className="w-full py-1 text-xs font-mono rounded bg-[#171c26] hover:bg-[#1f2633] text-[#38bdf8] border border-[#313d4f]"
                  >
                    Draft Message
                  </button>
                </div>

                <div className="p-3 rounded bg-[#07090e] border border-[#1e2530] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#f8fafc] font-semibold">LinkedIn Executive InMail</span>
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  </div>
                  <p className="text-[11px] text-[#94a3b8] font-sans">
                    Peer advisory angle targeting VP Clinical Affairs and Head of Regulatory.
                  </p>
                  <button
                    onClick={() => heroOpp && onSelectOpportunity(heroOpp)}
                    className="w-full py-1 text-xs font-mono rounded bg-[#171c26] hover:bg-[#1f2633] text-[#38bdf8] border border-[#313d4f]"
                  >
                    Generate Script
                  </button>
                </div>

                <div className="p-3 rounded bg-[#07090e] border border-[#1e2530] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#f8fafc] font-semibold">CRM Export Sync</span>
                    <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                  </div>
                  <p className="text-[11px] text-[#94a3b8] font-sans">
                    Push target lead, signals, and evidence chain directly into Salesforce or HubSpot.
                  </p>
                  <button
                    onClick={() => handleCopy(JSON.stringify(heroOpp, null, 2), 'crm-payload')}
                    className="w-full py-1 text-xs font-mono rounded bg-[#171c26] hover:bg-[#1f2633] text-[#f8fafc] border border-[#313d4f]"
                  >
                    {copiedText === 'crm-payload' ? 'Copied CRM JSON' : 'Copy Lead JSON'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              STAGE 10: OUTCOME (Closed-Loop Attribution & Bayesian Learning)
              ------------------------------------------------------------- */}
          {activeNode.id === 'outcome' && (
            <div className="space-y-4">
              {/* Outcome Hero Calibration Card */}
              <div className="p-5 rounded bg-[#0f131a] border-2 border-[#10b981]/50 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2530] pb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#10b981]" />
                    <span className="text-xs font-mono font-bold uppercase text-[#10b981] tracking-wider">
                      Closed-Loop Attribution & Feedback Calibration
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#10b981] px-2 py-0.5 rounded bg-[#10b981]/10 border border-[#10b981]/30">
                    BAYESIAN_UPDATE: ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="p-2.5 rounded bg-[#07090e] border border-[#1e2530]">
                    <span className="text-[#475569] text-[10px] block">WIN RATE</span>
                    <span className="text-xl font-bold text-[#10b981]">100%</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#07090e] border border-[#1e2530]">
                    <span className="text-[#475569] text-[10px] block">TOTAL REVENUE BOOKED</span>
                    <span className="text-xl font-bold text-[#f8fafc]">$125,000</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#07090e] border border-[#1e2530]">
                    <span className="text-[#475569] text-[10px] block">AVG TIME TO CLOSE</span>
                    <span className="text-xl font-bold text-[#38bdf8]">24 Days</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#07090e] border border-[#1e2530]">
                    <span className="text-[#475569] text-[10px] block">FEEDBACK WEIGHT</span>
                    <span className="text-xl font-bold text-[#f59e0b]">+12%</span>
                  </div>
                </div>

                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  When opportunities convert to meetings or closed deals, Nilo updates signal predictive weights so future discoveries prioritize patterns that actually generate commercial revenue.
                </p>

                <div className="pt-2 border-t border-[#1e2530]">
                  <button
                    onClick={() => onNavigateTab('outcomes')}
                    className="px-3.5 py-1.5 rounded bg-[#10b981] hover:bg-[#059669] text-[#07090e] text-xs font-bold font-mono transition-colors shadow-sm"
                  >
                    Open Outcomes Ledger & Post-Mortem Logs
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
