import React, { useState, useEffect } from 'react';
import { X, Bot, Cpu, Zap, Activity, Clock, CheckCircle2, Shield, Layers } from 'lucide-react';

interface AISettingsModalProps {
  onClose: () => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({ onClose }) => {
  const [activeProvider, setActiveProvider] = useState<string>('gemini');
  const [usageData, setUsageData] = useState<any>({ logs: [], totalRequests: 0, avgLatencyMs: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/v1/ai/usage')
      .then(r => r.json())
      .then(data => setUsageData(data))
      .catch(console.error);
  }, []);

  const handleSwitchProvider = async (p: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/ai/set-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: p }),
      });
      const data = await res.json();
      setActiveProvider(data.activeProvider);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
              Cognitive Architecture & Model Routing
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs">
          
          {/* Provider Selection */}
          <div>
            <h3 className="font-mono text-slate-300 font-semibold mb-2 uppercase text-[11px]">
              Active AI Provider Layer
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSwitchProvider('gemini')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeProvider === 'gemini'
                    ? 'bg-indigo-950/50 border-indigo-500 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white">Google Gemini</span>
                  {activeProvider === 'gemini' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <p className="text-[11px] text-slate-400">Production Multi-Model Stack with Search Grounding & High Thinking</p>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchProvider('huggingface')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeProvider === 'huggingface'
                    ? 'bg-indigo-950/50 border-indigo-500 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white">Hugging Face</span>
                  {activeProvider === 'huggingface' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <p className="text-[11px] text-slate-400">Open-Weights routing (Qwen 2.5 / Phi-4 / Llama 3.2)</p>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchProvider('local')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeProvider === 'local'
                    ? 'bg-indigo-950/50 border-indigo-500 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white">Local LLM</span>
                  {activeProvider === 'local' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <p className="text-[11px] text-slate-400">Self-hosted llama.cpp / GGUF on localhost:8080</p>
              </button>
            </div>
          </div>

          {/* Model Routing Architecture */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <h4 className="font-mono text-slate-300 font-semibold uppercase text-[11px] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Hierarchical Task Routing Matrix
            </h4>

            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-300">Fast Fact Extraction & Classification</span>
                <span className="text-cyan-400">gemini-3.1-flash-lite (~180ms)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-300">Live Search Grounding (Web Discovery)</span>
                <span className="text-blue-400">gemini-3.8-flash (googleSearch)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-300">Multi-Signal Synthesis & Correlation</span>
                <span className="text-indigo-400">gemini-3.8-flash (~450ms)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-300">Deep Strategic Reasoning (Why-Now & Risks)</span>
                <span className="text-amber-400">gemini-3.8-flash (Thinking: HIGH)</span>
              </div>
            </div>
          </div>

          {/* Performance & Latency Telemetry */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-mono text-slate-300 font-semibold uppercase text-[11px] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Live Cognitive Telemetry
              </h4>
              <span className="font-mono text-slate-500 text-[10px]">
                Avg Latency: {usageData.avgLatencyMs}ms | Total Operations: {usageData.totalRequests}
              </span>
            </div>

            <div className="space-y-1 max-h-40 overflow-y-auto font-mono text-[10px] bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              {usageData.logs?.length === 0 ? (
                <p className="text-slate-500 italic p-1">No AI operations executed yet.</p>
              ) : (
                usageData.logs.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between py-1 border-b border-slate-900 last:border-0">
                    <span className="text-cyan-400">{log.task}</span>
                    <span className="text-slate-400">{log.model}</span>
                    <span className="text-emerald-400">{log.latencyMs}ms</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
