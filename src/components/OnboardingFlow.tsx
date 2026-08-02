import React, { useState } from 'react';
import { Camera, Search, FileText, MessageSquare, ArrowRight, Check, Sparkles, SkipForward } from 'lucide-react';
import { safeFetchJson } from '../utils/apiUtils';
import { UserOnboarding } from '../types';

interface OnboardingFlowProps {
  onComplete: (onboarding: UserOnboarding) => void;
  onSkip: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState<number>(1);

  const [topFocus, setTopFocus] = useState<'photos' | 'profile' | 'bio' | 'conversations' | 'everything'>('photos');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Hinge']);
  const [vibeStyle, setVibeStyle] = useState<string>('Confident');
  const [goal, setGoal] = useState<string>('Improve an existing profile');

  const [isSaving, setIsSaving] = useState(false);

  const togglePlatform = (p: string) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((x) => x !== p));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleFinish = async () => {
    setIsSaving(true);
    const onboardingPayload: UserOnboarding = {
      uid: '',
      topFocus,
      platforms: selectedPlatforms,
      vibeStyle,
      goal,
      completedAt: new Date().toISOString(),
    };

    try {
      const { ok, data } = await safeFetchJson<{ success?: boolean; onboarding?: UserOnboarding }>(
        '/api/auth/onboarding',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(onboardingPayload),
        }
      );

      if (ok && data.onboarding) {
        onComplete(data.onboarding);
      } else {
        onComplete(onboardingPayload);
      }
    } catch (e) {
      console.error('Onboarding save error:', e);
      onComplete(onboardingPayload);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
        
        {/* Progress Bar & Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Personalised Setup ({step} of 4)</span>
            <button
              onClick={onSkip}
              className="text-pink-400 hover:text-pink-300 cursor-pointer flex items-center gap-1"
            >
              <span>Skip for now</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-pink-500 to-rose-500 h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: What would you most like to improve? */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white tracking-tight">
                What would you most like to improve?
              </h2>
              <p className="text-xs text-slate-400">
                This helps us highlight the right tools for your dashboard.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { id: 'photos', label: 'My photos', desc: 'Generate realistic lifestyle pictures', icon: Camera },
                { id: 'profile', label: 'My complete profile', desc: 'Get a full screenshot audit and score', icon: Search },
                { id: 'bio', label: 'My bio and prompts', desc: 'Rewrite prompt answers into conversation starters', icon: FileText },
                { id: 'conversations', label: 'My conversations', desc: 'Get opening lines and chat advice', icon: MessageSquare },
                { id: 'everything', label: 'Everything', desc: 'Complete profile overhaul', icon: Sparkles },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = topFocus === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTopFocus(item.id as any)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-pink-950/30 border-pink-500/60 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-pink-500/20 text-pink-400' : 'bg-slate-900 text-slate-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{item.label}</div>
                        <div className="text-xs text-slate-400">{item.desc}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-pink-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Which platforms are you creating a profile for? */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Which platforms do you use?
              </h2>
              <p className="text-xs text-slate-400">
                Select all that apply to tailor advice to platform algorithms.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {['Hinge', 'Bumble', 'Tinder', 'Raya', 'Other', 'Prefer not to say'].map((p) => {
                const isSelected = selectedPlatforms.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={`p-4 rounded-2xl border font-bold text-sm text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-pink-950/30 border-pink-500/60 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3.5 rounded-2xl bg-slate-800 text-slate-300 font-bold text-sm cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-2/3 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: What style feels most like you? */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white tracking-tight">
                What style feels most like you?
              </h2>
              <p className="text-xs text-slate-400">
                We'll tune the AI bio rewriter and coach to match your voice.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {['Confident', 'Funny', 'Thoughtful', 'Flirty', 'Direct', 'Relaxed', 'Not sure yet'].map((style) => {
                const isSelected = vibeStyle === style;
                return (
                  <button
                    key={style}
                    onClick={() => setVibeStyle(style)}
                    className={`p-3.5 rounded-2xl border font-bold text-sm text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/30 border-purple-500/60 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {style}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 py-3.5 rounded-2xl bg-slate-800 text-slate-300 font-bold text-sm cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="w-2/3 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: What is your current goal? */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white tracking-tight">
                What is your current main goal?
              </h2>
              <p className="text-xs text-slate-400">
                Final step to customize your dashboard experience.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                'Improve an existing profile',
                'Create a profile from scratch',
                'Generate better lifestyle photos',
                'Review my prompts',
                'Get messaging assistance',
              ].map((g) => {
                const isSelected = goal === g;
                return (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={`w-full p-3.5 rounded-2xl border text-left font-bold text-sm transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-rose-950/30 border-rose-500/60 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{g}</span>
                    {isSelected && <Check className="w-4 h-4 text-pink-400" />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="w-1/3 py-3.5 rounded-2xl bg-slate-800 text-slate-300 font-bold text-sm cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={isSaving}
                className="w-2/3 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isSaving ? 'Saving...' : 'Go to My Dashboard'}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
