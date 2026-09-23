import React, { useState } from 'react';
import {
  Globe,
  RefreshCw,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Layers,
  Database
} from 'lucide-react';
import { IntelligenceSource } from '../types';

interface SourcesViewProps {
  sources: IntelligenceSource[];
  onRunSource: (sourceId: string) => Promise<void>;
  onAddSource: (sourceData: any) => Promise<void>;
  isIngesting: boolean;
}

export const SourcesView: React.FC<SourcesViewProps> = ({
  sources,
  onRunSource,
  onAddSource,
  isIngesting,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('web');
  const [url, setUrl] = useState('');
  const [complianceNotes, setComplianceNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAddSource({ name, type, url, complianceNotes });
      setShowAddForm(false);
      setName('');
      setUrl('');
      setComplianceNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="p-4 sm:p-5 rounded-lg bg-[#0e1524] border border-slate-800/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <h2 className="text-xs font-semibold text-slate-200 font-mono uppercase tracking-wider">
              Permitted Public Ingestion Pipeline
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Nilo strictly adheres to legal and ethical compliance: respects robots.txt, public open-data licenses,
            avoids personal data crawling, and utilizes rate-limited exponential backoff.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-teal-400" />
          <span>{showAddForm ? 'Close Intake Form' : 'Register Public Source'}</span>
        </button>
      </div>

      {/* Register Source Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-5 rounded-xl bg-slate-900/90 border border-slate-700 space-y-4">
          <h3 className="text-xs font-bold font-mono uppercase text-cyan-300">
            Register Permitted Domain / RSS / API Endpoint
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Source Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. County Planning Registry"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Source Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="web">Web Discovery</option>
                <option value="rss">RSS Feed</option>
                <option value="job_board">Career / Job Portal</option>
                <option value="directory">Public Gazette / Registry</option>
                <option value="api">Open REST API</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Base URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.gov/notices"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Compliance & Permission Notes
            </label>
            <input
              type="text"
              value={complianceNotes}
              onChange={(e) => setComplianceNotes(e.target.value)}
              placeholder="e.g. Open public records published under Open Government License; no paywall; verified robots.txt."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
          >
            {isSubmitting ? 'Registering...' : 'Register Source'}
          </button>
        </form>
      )}

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {sources.map((src) => (
          <div
            key={src.id}
            className="p-4 rounded-lg bg-[#0e1524] border border-slate-800/90 space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-100 text-sm">{src.name}</span>
                <span className="text-[11px] font-mono text-teal-400 uppercase">
                  ● {src.status}
                </span>
              </div>

              <a
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-teal-400 hover:underline flex items-center gap-1 font-mono truncate mb-2"
              >
                <span>{src.url}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>

              <div className="p-2.5 rounded-md bg-[#0a0f1a] border border-slate-800/80 text-xs text-slate-300">
                <span className="text-[10px] font-mono uppercase text-slate-500 block mb-0.5">Compliance:</span>
                {src.complianceNotes}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <span>Records: <strong className="text-slate-200">{src.recordsCount}</strong></span>
                <span>Signals: <strong className="text-teal-400">{src.signalsGenerated}</strong></span>
              </div>

              <button
                onClick={() => onRunSource(src.id)}
                disabled={isIngesting}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <RefreshCw className="w-3 h-3 text-teal-400" />
                <span>Run Ingestion</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
