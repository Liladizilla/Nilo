import React, { useState } from 'react';
import {
  Building2,
  User as UserIcon,
  Briefcase,
  Layers,
  MapPin,
  ExternalLink,
  Calendar,
  Sparkles,
  Activity,
  ChevronRight
} from 'lucide-react';
import { Entity, Signal, Opportunity } from '../types';

interface EntitiesViewProps {
  entities: Entity[];
  signals: Signal[];
  opportunities: Opportunity[];
  onSelectOpportunity: (opp: Opportunity) => void;
}

export const EntitiesView: React.FC<EntitiesViewProps> = ({
  entities,
  signals,
  opportunities,
  onSelectOpportunity,
}) => {
  const [selectedEntityId, setSelectedEntityId] = useState<string>(entities[0]?.id || '');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const selectedEntity = entities.find(e => e.id === selectedEntityId) || entities[0];
  const relatedSignals = signals.filter(s => s.entityId === selectedEntity?.id);
  const relatedOpps = opportunities.filter(o => o.entityId === selectedEntity?.id);

  const filteredEntities = typeFilter === 'all'
    ? entities
    : entities.filter(e => e.type === typeFilter);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Entities Directory List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-cyan-400" />
            Monitored Entities ({entities.length})
          </h2>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Entity Types</option>
            <option value="company">Companies</option>
            <option value="organization">Organizations</option>
            <option value="person">Persons</option>
            <option value="project">Projects</option>
          </select>
        </div>

        <div className="space-y-2">
          {filteredEntities.map((ent) => {
            const isSelected = ent.id === selectedEntity?.id;
            return (
              <div
                key={ent.id}
                onClick={() => setSelectedEntityId(ent.id)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-slate-600 shadow-sm'
                    : 'bg-[#0e1524] border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-white tracking-tight">{ent.name}</span>
                  <span className="text-[11px] font-mono text-slate-400 capitalize">
                    {ent.type}
                  </span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-1">{ent.description}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-2 pt-1.5 border-t border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {ent.location}
                  </span>
                  <span className="text-teal-400">
                    {signals.filter(s => s.entityId === ent.id).length} Signals
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Entity Dossier & Timeline */}
      {selectedEntity && (
        <div className="lg:col-span-2 space-y-5">
          {/* Entity Profile Header */}
          <div className="p-5 rounded-lg bg-[#0e1524] border border-slate-800/90 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-white">{selectedEntity.name}</h3>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs font-mono text-teal-400 capitalize">
                    {selectedEntity.type}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{selectedEntity.description}</p>
              </div>

              {selectedEntity.website && (
                <a
                  href={selectedEntity.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono text-slate-300 border border-slate-700 bg-slate-800 hover:text-white hover:bg-slate-700 transition-colors shrink-0"
                >
                  <span>Website</span>
                  <ExternalLink className="w-3 h-3 text-teal-400" />
                </a>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">Industry</span>
                <span className="text-slate-200 font-medium">{selectedEntity.industry}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">Location</span>
                <span className="text-slate-200 font-medium">{selectedEntity.location}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">Active Signals</span>
                <span className="font-mono text-teal-400 font-bold">{relatedSignals.length}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">Correlated Opportunities</span>
                <span className="font-mono text-amber-400 font-bold">{relatedOpps.length}</span>
              </div>
            </div>
          </div>

          {/* Chronological Signals Timeline */}
          <div className="p-5 rounded-lg bg-[#0e1524] border border-slate-800/90 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              Chronological Public Signal Timeline
            </h4>

            {relatedSignals.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No signals recorded yet for this entity.</p>
            ) : (
              <div className="space-y-3 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                {relatedSignals.map((sig) => (
                  <div key={sig.id} className="relative">
                    <span className="absolute -left-6 top-1.5 w-2 h-2 rounded-full bg-teal-400 border-2 border-[#0e1524]" />
                    <div className="p-3 rounded-md bg-[#0a0f1a] border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-teal-300 font-semibold">{sig.signalCategory}</span>
                        <span className="font-mono text-slate-400">{new Date(sig.observedAt).toLocaleDateString()}</span>
                      </div>
                      <h5 className="font-semibold text-slate-100">{sig.title}</h5>
                      <p className="text-slate-300">{sig.description}</p>
                      <span className="text-[10px] font-mono text-slate-500 block pt-1">
                        Source: {sig.sourceTitle}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Correlated Commercial Opportunities */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Synthesized Commercial Opportunities ({relatedOpps.length})
            </h4>

            {relatedOpps.map((opp) => (
              <div
                key={opp.id}
                onClick={() => onSelectOpportunity(opp)}
                className="p-4 rounded-lg bg-[#0e1524] border border-slate-800/90 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <span className="text-[11px] font-mono text-teal-400">
                      {opp.category}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      Score: <strong className="text-slate-100">{opp.overallScore}%</strong>
                    </span>
                  </div>
                  <h5 className="text-sm font-semibold text-white">{opp.title}</h5>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{opp.whyNow}</p>
                </div>

                <button className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 border border-slate-700 bg-slate-800 hover:text-white hover:bg-slate-700 flex items-center gap-1 shrink-0 transition-colors">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5 text-teal-400" />
                </button>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
