import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { AnalysisResult, IcebreakerCard } from '../types';
import { downloadCardCanvas } from '../utils/downloadUtils';
import { Sparkles, Download, Copy, Share2, Palette, Layers, RefreshCw, Check, Image as ImageIcon } from 'lucide-react';

interface IcebreakerCardStudioProps {
  currentResult: AnalysisResult | null;
  history: AnalysisResult[];
}

export const IcebreakerCardStudio: React.FC<IcebreakerCardStudioProps> = ({
  currentResult,
  history,
}) => {
  const activeCardObj = currentResult?.icebreakerCard || (history.length > 0 ? history[0].icebreakerCard : {
    id: 'default_card',
    title: 'The Coffee Debater',
    style: 'neon' as const,
    headlineText: 'Matcha > Espresso?',
    subText: "Let's settle this coffee debate before Friday.",
    visualPrompt: 'Neon glowing coffee cup with playful sparkle graphics',
    accentColor: '#EC4899',
    bgGradient: 'from-pink-500 via-purple-600 to-indigo-700'
  });

  const [cardStyle, setCardStyle] = useState<IcebreakerCard['style']>(activeCardObj.style || 'neon');
  const [headline, setHeadline] = useState(activeCardObj.headlineText);
  const [subText, setSubText] = useState(activeCardObj.subText);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState(false);

  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [cardQueueStep, setCardQueueStep] = useState('Queued in Gemini AI Pipeline...');

  const handleCopyText = () => {
    navigator.clipboard.writeText(`"${headline}" - ${subText}`);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  const handleDownloadCard = async () => {
    const ok = await downloadCardCanvas(headline, subText, cardStyle, activeCardObj.title || 'Dating Icebreaker');
    if (ok) {
      setDownloadNotice(true);
      setTimeout(() => setDownloadNotice(false), 3000);
      try {
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { y: 0.7 },
          colors: ['#ec4899', '#f43f5e', '#a855f7'],
          disableForReducedMotion: true,
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleAiRegenerateCard = () => {
    setIsGeneratingCard(true);
    setCardQueueStep('Step 1/3: Analyzing dating profile context & hooks...');

    const sampleHooks = [
      { h: "Matcha > Espresso?", s: "Let's settle this debate over coffee." },
      { h: "Is cereal technically a soup?", s: "Please tell me you have a strong opinion." },
      { h: "3 rules for our first trip:", s: "No alarm clocks, good food, high vibes." },
      { h: "Your favorite late night snack?", s: "Tacos or midnight pizza?" },
    ];

    setTimeout(() => {
      setCardQueueStep('Step 2/3: Generating visual vector theme & typography...');
    }, 1200);

    setTimeout(() => {
      setCardQueueStep('Step 3/3: Finalizing graphic icebreaker card layout...');
    }, 2400);

    setTimeout(() => {
      const picked = sampleHooks[Math.floor(Math.random() * sampleHooks.length)];
      setHeadline(picked.h);
      setSubText(picked.s);
      setIsGeneratingCard(false);

      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#ec4899', '#a855f7', '#3b82f6', '#10b981'],
          disableForReducedMotion: true,
        });
      } catch (e) {
        console.error(e);
      }
    }, 3600);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Studio Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
          <Palette className="w-3.5 h-3.5" />
          Multimodal Visual Icebreaker Card Studio
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Craft & Customize Your Dating Icebreaker Card
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
          Tailored graphic cards designed to be sent directly as a fun DM image or story reply.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Canvas Render */}
        <div className="lg:col-span-7 flex flex-col items-center space-y-4">
          
          {/* THE CARD CANVAS */}
          <div className="w-full max-w-md aspect-square rounded-3xl p-8 relative overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between border border-white/20"
            style={{
              background: isGeneratingCard
                ? 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #0F172A 100%)'
                : cardStyle === 'polaroid' 
                ? '#F8FAFC' 
                : cardStyle === 'comic'
                ? 'linear-gradient(135deg, #FF0055 0%, #FFCC00 100%)'
                : cardStyle === 'minimal'
                ? '#0F172A'
                : cardStyle === 'neon'
                ? 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 50%, #3B82F6 100%)'
                : 'linear-gradient(135deg, #050515 0%, #1E1B4B 100%)'
            }}
          >
            {/* Background Decorator */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            {/* Top Branding Pill */}
            <div className="flex items-center justify-between z-10">
              <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${
                isGeneratingCard
                  ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 animate-pulse'
                  : cardStyle === 'polaroid' 
                  ? 'bg-slate-900 text-white border-slate-700' 
                  : 'bg-black/30 backdrop-blur-md text-white border-white/20'
              }`}>
                {isGeneratingCard ? 'AI Queue Processing' : `Profilepilot • ${cardStyle.toUpperCase()}`}
              </span>
              <span className="text-xs font-black tracking-widest text-white/80">⚡</span>
            </div>

            {/* Main Visual Center Graphic / Text */}
            <div className="relative z-10 text-center space-y-4 my-auto w-full">
              {isGeneratingCard ? (
                <div className="space-y-4 p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 animate-pulse">
                  <div className="flex items-center justify-center gap-2 text-pink-300 text-xs font-bold">
                    <RefreshCw className="w-4 h-4 animate-spin text-pink-400" />
                    <span>{cardQueueStep}</span>
                  </div>
                  <div className="h-7 bg-white/20 rounded-xl w-4/5 mx-auto animate-pulse" />
                  <div className="h-4 bg-white/10 rounded-lg w-3/5 mx-auto animate-pulse" />
                </div>
              ) : cardStyle === 'polaroid' ? (
                <div className="bg-slate-100 p-6 rounded-2xl border border-slate-300 text-slate-900 shadow-inner">
                  <h3 className="text-2xl font-black font-serif tracking-tight text-slate-900 leading-snug">
                    "{headline}"
                  </h3>
                  <p className="text-xs text-slate-600 font-sans mt-2 italic">
                    {subText}
                  </p>
                </div>
              ) : cardStyle === 'comic' ? (
                <div className="bg-white p-6 rounded-3xl border-4 border-black text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="text-2xl font-extrabold uppercase tracking-tight text-black leading-tight">
                    "{headline}"
                  </h3>
                  <p className="text-xs text-slate-800 font-bold mt-2">
                    {subText}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-3xl font-black text-white tracking-tight leading-snug drop-shadow-lg">
                    "{headline}"
                  </h3>
                  <p className="text-xs text-white/90 font-medium italic drop-shadow">
                    {subText}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Footer Stamp */}
            <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/20 text-[10px] text-white/80 font-mono">
              <span>{activeCardObj.title || 'Dating Icebreaker'}</span>
              <span>profilepilot.ai</span>
            </div>

          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3 w-full max-w-md">
            <button
              onClick={handleCopyText}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {copiedNotice ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-pink-400" />}
              {copiedNotice ? 'Copied to Clipboard!' : 'Copy Card Text'}
            </button>
            
            <button
              onClick={handleDownloadCard}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 cursor-pointer transition-all"
            >
              {downloadNotice ? <Check className="w-4 h-4 text-emerald-300" /> : <Download className="w-4 h-4" />}
              {downloadNotice ? 'Downloaded Card!' : 'Download Image'}
            </button>
          </div>

        </div>

        {/* Right Column: Customization Controls & Theme Switcher */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-pink-400" />
              Style & Content Editor
            </h3>
            <button
              onClick={handleAiRegenerateCard}
              disabled={isGeneratingCard}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-pink-500/20 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-200" />
              AI Synthesize Card
            </button>
          </div>

          {/* Style Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 block">
              Select Graphic Theme:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'neon', label: 'Neon Flirt', desc: 'Vibrant glowing gradient' },
                { id: 'polaroid', label: 'Retro Polaroid', desc: 'Classic white card frame' },
                { id: 'comic', label: 'Pop Art Comic', desc: 'Bold outline speech bubble' },
                { id: 'minimal', label: 'Dark Minimal', desc: 'Sleek luxury typography' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => setCardStyle(style.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    cardStyle === style.id
                      ? 'bg-pink-950/40 border-pink-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="font-bold text-xs block">{style.label}</span>
                  <span className="text-[10px] text-slate-500">{style.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Editable Text Fields */}
          <div className="space-y-4 pt-2 border-t border-slate-800/80">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">
                Headline Quote:
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">
                Sub-Caption:
              </label>
              <input
                type="text"
                value={subText}
                onChange={(e) => setSubText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Saved Cards Gallery Preview */}
          {history.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-400 block">
                Cards From Past Analyses ({history.length}):
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {history.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      setHeadline(h.icebreakerCard.headlineText);
                      setSubText(h.icebreakerCard.subText);
                      setCardStyle(h.icebreakerCard.style || 'neon');
                    }}
                    className="p-2 bg-slate-950 border border-slate-800 hover:border-pink-500 rounded-xl text-left shrink-0 w-36 transition-all cursor-pointer"
                  >
                    <span className="font-bold text-[11px] text-white truncate block">
                      {h.icebreakerCard.title}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate block">
                      "{h.icebreakerCard.headlineText}"
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
