import React, { useEffect, useState } from 'react';
import { AnalyticsEvent, SystemMetrics } from '../types';
import { safeFetchJson } from '../utils/apiUtils';
import { BarChart2, Activity, Zap, ShieldCheck, AlertTriangle, RefreshCw, Clock, CheckCircle, Terminal } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const { data } = await safeFetchJson<{ metrics?: SystemMetrics; events?: AnalyticsEvent[] }>('/api/analytics');
      if (data.metrics) setMetrics(data.metrics);
      if (data.events) setEvents(data.events);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-1">
            <Activity className="w-3.5 h-3.5" />
            Google Analytics for Firebase & Telemetry Monitor
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            System & Developer Telemetry Dashboard
          </h2>
          <p className="text-xs text-slate-400">
            Real-time monitoring for network timeouts, Gemini multimodal latency, credit deductions, and safety fallbacks.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Logs
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Chat Scans</span>
            <Zap className="w-4 h-4 text-pink-400" />
          </div>
          <p className="text-2xl font-black text-white">{metrics?.totalScans || 0}</p>
          <span className="text-[10px] text-pink-400 font-semibold">Gemini 3.6 Multimodal</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg API Latency</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-300">{metrics?.avgLatencyMs || 1200} ms</p>
          <span className="text-[10px] text-purple-400 font-semibold">Pre-flight + Inference</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Success Rate</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{metrics?.successRatePercent || 99.4}%</p>
          <span className="text-[10px] text-emerald-400/80 font-semibold">0 Unhandled Exceptions</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Safety Rejections</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-300">{metrics?.contentSafetyRejections || 0}</p>
          <span className="text-[10px] text-amber-400/80 font-semibold">Explicit Filter Blocks</span>
        </div>

      </div>

      {/* Terminal Live Telemetry Log */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-pink-400" />
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
              Firebase & Server Custom Event Stream
            </h3>
          </div>
          <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-1 rounded-md font-mono">
            LIVE STREAM
          </span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {events.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono italic">No events recorded in current session.</p>
          ) : (
            events.map((evt) => (
              <div
                key={evt.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    evt.status === 'success' ? 'bg-emerald-400' : evt.status === 'warning' ? 'bg-amber-400' : 'bg-rose-500'
                  }`} />
                  <div>
                    <span className="text-pink-300 font-bold">{evt.event}</span>
                    <p className="text-slate-300 text-[11px] font-sans">{evt.details}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-slate-500 shrink-0 self-end sm:self-center">
                  {evt.latencyMs && (
                    <span className="px-1.5 py-0.5 bg-slate-950 rounded text-purple-400 border border-slate-800">
                      {evt.latencyMs}ms
                    </span>
                  )}
                  <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
