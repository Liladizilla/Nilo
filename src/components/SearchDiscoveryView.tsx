import React, { useState } from 'react';
import {
  Search,
  Globe,
  Sparkles,
  ExternalLink,
  PlusCircle,
  Building,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Clock,
  Compass
} from 'lucide-react';

interface SearchDiscoveryViewProps {
  onRunSearchGrounding: (query: string, location?: string) => Promise<any>;
  onSynthesizeFromFinding: (finding: any) => Promise<void>;
}

export const SearchDiscoveryView: React.FC<SearchDiscoveryViewProps> = ({
  onRunSearchGrounding,
  onSynthesizeFromFinding,
}) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any | null>(null);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const sampleQueries = [
    { label: 'Construction & Tenders in East Africa', q: 'Commercial construction tenders and groundbreaking', loc: 'Nairobi, Kenya' },
    { label: 'European Startups Scaling React & Cloud', q: 'Series A B startups hiring React engineers cloud architects', loc: 'Europe & Remote' },
    { label: 'New D2C Brands Product Launches', q: 'Direct-to-consumer organic wellness brands launching new product line', loc: 'USA' },
    { label: 'Healthcare FHIR & Telehealth Development', q: 'Healthcare startups seeking custom software agency telehealth FHIR', loc: 'Global' },
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await onRunSearchGrounding(query, location);
      setSearchResults(res.discovery || res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = async (finding: any, idx: number) => {
    try {
      await onSynthesizeFromFinding(finding);
      setAddedItems(prev => ({ ...prev, [idx]: true }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/40 border border-blue-800/40">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-5 h-5 text-blue-400" />
          <h2 className="text-sm font-bold text-blue-200 font-mono uppercase tracking-wider">
            Real-Time Google Search Grounding Engine
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/60 ml-auto">
            gemini-3.5-flash (googleSearch)
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Nilo interrogates the live public web using Google Search grounding to discover newly published
          commercial signals, corporate milestones, tender notices, and hiring surges from today's web.
        </p>
      </div>

      {/* Query Form */}
      <form onSubmit={handleSearch} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Natural Language Discovery Query
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Fintech companies expanding in Singapore or seeking compliance vendors..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Target Location (Optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Kenya, London, California, Global"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-[11px] text-slate-400 font-mono mr-1">Try benchmark queries:</span>
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setQuery(sq.q);
                setLocation(sq.loc);
              }}
              className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:text-cyan-300 hover:border-slate-700 transition-colors"
            >
              {sq.label}
            </button>
          ))}
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-md shadow-blue-900/30"
          >
            {isSearching ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Interrogating Live Web via Google Search...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run Grounded Search Discovery</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results Section */}
      {searchResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
              Discovered Live Grounded Signals ({searchResults.findings?.length || 0})
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Query: "{searchResults.searchQuery || query}"
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.findings?.map((finding: any, idx: number) => {
              const isAdded = addedItems[idx];
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-700/60 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-300 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-blue-400" />
                        {finding.entityName}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-400">
                        {finding.signalCategory}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-white">
                      {finding.headline || finding.signalType}
                    </h4>

                    {/* Verifiable Fact */}
                    <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
                      <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold block mb-0.5">
                        Directly Grounded Fact:
                      </span>
                      <p className="text-slate-200">{finding.fact}</p>
                    </div>

                    {/* Hypothesis */}
                    <p className="text-xs text-slate-400 italic">
                      Hypothesis: {finding.opportunityHypothesis}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    {finding.evidenceUrl ? (
                      <a
                        href={finding.evidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 truncate max-w-[200px]"
                      >
                        <span>View Source</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono">Google Grounded Citation</span>
                    )}

                    <button
                      onClick={() => handleAdd(finding, idx)}
                      disabled={isAdded}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isAdded
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Synthesized into Pipeline</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Synthesize Opportunity</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
