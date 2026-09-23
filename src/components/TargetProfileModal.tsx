import React, { useState } from 'react';
import { X, Sliders, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { TargetUserProfile } from '../types';

interface TargetProfileModalProps {
  currentProfile: TargetUserProfile;
  onSaveProfile: (profile: TargetUserProfile) => void;
  onClose: () => void;
}

export const TargetProfileModal: React.FC<TargetProfileModalProps> = ({
  currentProfile,
  onSaveProfile,
  onClose,
}) => {
  const [servicesInput, setServicesInput] = useState(currentProfile.services?.join(', ') || '');
  const [industriesInput, setIndustriesInput] = useState(currentProfile.industries?.join(', ') || '');
  const [locationsInput, setLocationsInput] = useState(currentProfile.locations?.join(', ') || '');
  const [preferredOpp, setPreferredOpp] = useState(currentProfile.preferredOpportunity || '');
  const [minConfidence, setMinConfidence] = useState(currentProfile.minConfidence || 75);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: TargetUserProfile = {
      services: servicesInput.split(',').map(s => s.trim()).filter(Boolean),
      industries: industriesInput.split(',').map(s => s.trim()).filter(Boolean),
      locations: locationsInput.split(',').map(s => s.trim()).filter(Boolean),
      preferredOpportunity: preferredOpp,
      minConfidence,
    };
    onSaveProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
              Target Provider Profile & Relevance Config
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <p className="text-slate-400">
            Nilo calibrates the <strong className="text-cyan-300">Relevance Score</strong> of every commercial opportunity
            against your services, capabilities, and target regions.
          </p>

          <div>
            <label className="block font-mono text-slate-300 mb-1">
              Your Services & Offerings (comma-separated)
            </label>
            <input
              type="text"
              value={servicesInput}
              onChange={(e) => setServicesInput(e.target.value)}
              placeholder="e.g. React Development, Cloud Migration, SOC2 Audit, LEED HVAC, Growth Marketing"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block font-mono text-slate-300 mb-1">
              Target Industries (comma-separated)
            </label>
            <input
              type="text"
              value={industriesInput}
              onChange={(e) => setIndustriesInput(e.target.value)}
              placeholder="e.g. Technology, Healthcare, Construction, Consumer Goods"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block font-mono text-slate-300 mb-1">
              Geographic Focus (comma-separated)
            </label>
            <input
              type="text"
              value={locationsInput}
              onChange={(e) => setLocationsInput(e.target.value)}
              placeholder="e.g. Global, North America, East Africa, Europe"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block font-mono text-slate-300 mb-1">
              Preferred Opportunity Profile
            </label>
            <textarea
              rows={2}
              value={preferredOpp}
              onChange={(e) => setPreferredOpp(e.target.value)}
              placeholder="e.g. Fast-growing funded companies with hiring spikes or public vendor solicitations"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between font-mono text-slate-300 mb-1">
              <span>Minimum Confidence Threshold</span>
              <span className="text-cyan-400 font-bold">{minConfidence}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={minConfidence}
              onChange={(e) => setMinConfidence(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors"
            >
              Save Profile & Recalculate Relevance
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
