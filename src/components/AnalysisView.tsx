import React, { useState } from 'react';
import { AnalysisResult, SuggestedReply } from '../types';
import { Sparkles, Copy, Check, MessageSquare, Flame, AlertCircle, ArrowRight, Share2, Download, RefreshCw, Layers } from 'lucide-react';

interface AnalysisViewProps {
  result: AnalysisResult;
  onOpenStudioWithCard: (result: AnalysisResult) => void;
  onNewScan: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  result,
  onOpenStudioWithCard,
  onNewScan,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (reply: SuggestedReply) => {
    navigator.clipboard.writeText(reply.text);
    setCopiedId(reply.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyTextKey = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const { vibeScores, advice, suggestedReplies, icebreakerCard } = result;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Top Banner Control */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-pink-400">
            Profilepilot Analysis Complete
          </span>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>{result.demoTitle || 'Chat Analysis Breakdown'}</span>
            <span className="px-2.5 py-0.5 text-xs bg-pink-500/10 border border-pink-500/20 text-pink-300 rounded-full font-medium">
              {vibeScores.tone}
            </span>
          </h2>
        </div>

        <button
          onClick={onNewScan}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Run Another Analysis
        </button>
      </div>

      {/* Grid: Left Vibe Dashboard & Advice, Right Visual Icebreaker Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Vibe Gauge & Strategic Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Vibe Meter Gauge Dashboard */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Flame className="w-4 h-4 text-pink-500" />
                Conversation Vibe Gauge
              </h3>
              <span className="text-xs font-bold text-slate-400">
                Overall: <strong className="text-white">{vibeScores.tone}</strong>
              </span>
            </div>

            {/* Vibe Description Box */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">AI Vibe Breakdown</span>
                <button
                  type="button"
                  onClick={() => handleCopyTextKey(vibeScores.vibeDescription, 'vibe_desc')}
                  className="flex items-center gap-1 text-[11px] font-semibold text-pink-400 hover:text-pink-300 cursor-pointer"
                >
                  {copiedKey === 'vibe_desc' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Breakdown</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{vibeScores.vibeDescription}"
              </p>
            </div>

            {/* 3 Metric Gauges */}
            <div className="space-y-3.5">
              
              {/* Flirt Meter */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-pink-400">Flirt Meter</span>
                  <span className="text-pink-300">{vibeScores.flirtMeter}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-rose-500 h-2.5 rounded-full transition-all duration-1000"
                    style={{ width: `${vibeScores.flirtMeter}%` }}
                  />
                </div>
              </div>

              {/* Interest Index */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-purple-400">Interest Index</span>
                  <span className="text-purple-300">{vibeScores.interestIndex}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full transition-all duration-1000"
                    style={{ width: `${vibeScores.interestIndex}%` }}
                  />
                </div>
              </div>

              {/* Awkwardness Gauge */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-amber-400">Awkwardness Meter</span>
                  <span className="text-amber-300">{vibeScores.awkwardnessGauge}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-2.5 rounded-full transition-all duration-1000"
                    style={{ width: `${vibeScores.awkwardnessGauge}%` }}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Wingman Strategy Breakdown */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Wingman Tactical Analysis
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-pink-400 uppercase tracking-wider block">
                    Overall Game Plan
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyTextKey(advice.overallStrategy, 'overall_strat')}
                    className="flex items-center gap-1 text-[11px] font-semibold text-pink-400 hover:text-pink-300 cursor-pointer"
                  >
                    {copiedKey === 'overall_strat' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied Strategy!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Strategy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-slate-300 leading-relaxed">{advice.overallStrategy}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs space-y-1.5">
                  <span className="font-bold text-emerald-400 block">
                    ✓ What's Working:
                  </span>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {advice.whatIsWorking.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 bg-rose-950/20 border border-rose-500/20 rounded-xl text-xs space-y-1.5">
                  <span className="font-bold text-rose-400 block">
                    ⚠ Pitfalls To Avoid:
                  </span>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {advice.pitfallsToAvoid.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Generated Visual Icebreaker Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between h-full">
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-pink-400" />
                  Multimodal Visual Icebreaker Card
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                  {icebreakerCard.style} Card
                </span>
              </div>

              {/* Rendered Visual Card Canvas Box */}
              <div className={`p-6 rounded-2xl bg-gradient-to-br ${icebreakerCard.bgGradient || 'from-pink-600 via-rose-600 to-purple-700'} text-white shadow-2xl relative overflow-hidden border border-white/20 my-2`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                
                <div className="relative z-10 space-y-4 text-center">
                  <span className="inline-block px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-widest text-pink-200 border border-white/20">
                    Profilepilot • {icebreakerCard.title}
                  </span>

                  <h4 className="text-2xl font-black tracking-tight leading-snug drop-shadow-md">
                    "{icebreakerCard.headlineText}"
                  </h4>

                  <p className="text-xs text-white/90 font-medium italic drop-shadow-sm">
                    {icebreakerCard.subText}
                  </p>

                  <div className="pt-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/20 backdrop-blur-md text-[10px] font-bold text-white border border-white/30">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      Visual Prompt: {icebreakerCard.visualPrompt}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Open in Cards Studio Button */}
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => onOpenStudioWithCard(result)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Open in Cards Studio (Customize & Export Image)
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Bottom Section: 5 Suggested Witty Responses */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-pink-500" />
              5 Custom Witty & Playful Response Suggestions
            </h3>
            <p className="text-xs text-slate-400">
              Tailored specifically to shift momentum, reignite energy, and lock in date plans.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">Tap any response to copy</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestedReplies.map((reply) => {
            const isCopied = copiedId === reply.id;
            return (
              <div
                key={reply.id}
                onClick={() => handleCopy(reply)}
                className="bg-slate-950 border border-slate-800 hover:border-pink-500/50 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all cursor-pointer group hover:shadow-lg hover:shadow-pink-500/5 relative"
              >
                {/* Category & Likelihood Header */}
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase bg-pink-500/10 text-pink-400 border border-pink-500/20">
                    {reply.category}
                  </span>
                  <span className="font-extrabold text-[11px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {reply.successLikelihood}% Success
                  </span>
                </div>

                {/* Reply Text Body */}
                <p className="text-xs font-medium text-slate-100 group-hover:text-white leading-relaxed">
                  "{reply.text}"
                </p>

                {/* Explanation Footer */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-400 italic line-clamp-1 flex-1">{reply.explanation}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(reply);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                      isCopied
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                        : 'bg-slate-900 border-slate-700 text-slate-300 group-hover:border-pink-500 group-hover:text-pink-300 hover:bg-slate-800'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-pink-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
