import React, { useState } from 'react';
import {
  Globe,
  Terminal,
  Activity,
  Zap,
  Fingerprint,
  GitMerge,
  Target,
  ShieldCheck,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Opportunity, Signal, Entity, MarketEvent, IntelligenceSource, OpportunityOutcome } from '../types';

interface EvidenceChainGraphicProps {
  activeStep?: string;
  onSelectStep?: (step: string) => void;
  opportunities?: Opportunity[];
  signals?: Signal[];
  entities?: Entity[];
  sources?: IntelligenceSource[];
  events?: MarketEvent[];
  outcomes?: OpportunityOutcome[];
  onNavigateTab?: (tab: string) => void;
  onSelectOpportunity?: (opp: Opportunity) => void;
}

export const EvidenceChainGraphic: React.FC<EvidenceChainGraphicProps> = ({
  activeStep = 'opportunity',
  onSelectStep,
  opportunities = [],
  signals = [],
  entities = [],
  sources = [],
  events = [],
  outcomes = [],
  onNavigateTab,
}) => {
  const steps = [
    { id: 'source', num: '#01', label: 'Source', icon: Globe, statusTag: 'LIVE INGEST', tab: 'sources' },
    { id: 'observation', num: '#02', label: 'Observation', icon: Terminal, statusTag: 'VERIFIED RAW', tab: 'signals' },
    { id: 'signal', num: '#03', label: 'Signal', icon: Activity, statusTag: 'SYNCING', tab: 'signals' },
    { id: 'event', num: '#04', label: 'Event', icon: Zap, statusTag: 'CORRELATED', tab: 'signals' },
    { id: 'entity', num: '#05', label: 'Entity', icon: Fingerprint, statusTag: 'RESOLVED', tab: 'entities' },
    { id: 'correlation', num: '#06', label: 'Correlation', icon: GitMerge, statusTag: 'CONVERGED', tab: 'opportunities' },
    { id: 'opportunity', num: '#07', label: 'Opportunity', icon: Target, statusTag: 'CRITICAL', tab: 'opportunities', isHero: true },
    { id: 'evidence', num: '#08', label: 'Evidence', icon: ShieldCheck, statusTag: '100% AUDIT', tab: 'opportunities' },
    { id: 'action', num: '#09', label: 'Action', icon: ArrowUpRight, statusTag: 'CHANNELS READY', tab: 'opportunities' },
    { id: 'outcome', num: '#10', label: 'Outcome', icon: CheckCircle2, statusTag: 'CLOSED LOOP', tab: 'outcomes', isHero: true },
  ];

  return (
    <div className="bg-[#0f131a] border border-[#1e2530] rounded p-3 mb-4 select-none">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#1e2530] text-xs font-mono text-[#94a3b8]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
          <span className="font-semibold text-[#f8fafc] uppercase tracking-wider">
            Evidence Chain DAG Lineage
          </span>
          <span className="text-[#475569]">·</span>
          <span className="text-[#94a3b8]">Sequential Causality Pipeline</span>
        </div>

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('overview')}
            className="text-[11px] text-[#38bdf8] hover:text-[#f8fafc] transition-colors font-mono flex items-center gap-1"
          >
            <span>Master Split-Pane</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Horizontal DAG Thread Stepper */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#1e2530] py-1">
        <div className="min-w-[860px] flex items-center justify-between gap-1">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isSelected = activeStep === s.id;

            return (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => {
                    if (onSelectStep) onSelectStep(s.id);
                    if (onNavigateTab && s.tab) onNavigateTab(s.tab);
                  }}
                  className={`group flex items-center gap-2 px-2.5 py-1.5 rounded border text-left transition-all ${
                    isSelected
                      ? 'bg-[#171c26] border-[#3b82f6] ring-1 ring-[#3b82f6] text-[#f8fafc]'
                      : 'bg-[#07090e] border-[#1e2530] hover:border-[#313d4f] text-[#94a3b8]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#38bdf8]' : 'text-[#94a3b8]'}`} />
                  <div>
                    <div className="flex items-center gap-1.5 leading-none">
                      <span className="text-[11px] font-semibold text-[#f8fafc]">
                        {s.label}
                      </span>
                      <span className="text-[9px] font-mono text-[#475569]">
                        {s.num}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-[#94a3b8] block mt-0.5">
                      {s.statusTag}
                    </span>
                  </div>
                </button>

                {idx < steps.length - 1 && (
                  <div className="w-3 h-[1px] bg-[#1e2530] shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
