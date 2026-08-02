import React, { useState } from 'react';
import { UserProfilePersona, PersonalizedPrompt, UserProfile } from '../types';
import { OFFICIAL_DATING_APP_PROMPTS, DatingAppPromptSubject } from '../data/datingAppPrompts';
import { Sparkles, Copy, Check, UserCheck, Briefcase, Award, Heart, RefreshCw, Zap, Sliders, Layers, ChevronRight, FileText, Coins, Search, Filter, CheckCircle2 } from 'lucide-react';
import { safeFetchJson } from '../utils/apiUtils';

interface ProfilePromptStudioProps {
  user?: UserProfile;
  firebaseUser?: any;
  initialPrompts?: PersonalizedPrompt[];
  initialPersona?: UserProfilePersona;
  onOpenCreditModal?: () => void;
  onUpdateCredits?: (credits: number) => void;
  onSavePromptHistory?: (persona: UserProfilePersona, prompts: PersonalizedPrompt[]) => void;
  onRequireAuth?: (pendingAction: any) => void;
}

export const ProfilePromptStudio: React.FC<ProfilePromptStudioProps> = ({
  user,
  firebaseUser,
  initialPrompts,
  initialPersona,
  onOpenCreditModal,
  onUpdateCredits,
  onSavePromptHistory,
  onRequireAuth,
}) => {
  const [persona, setPersona] = useState<UserProfilePersona>(
    initialPersona || {
      age: 27,
      occupation: 'Software Engineer & Culinary Enthusiast',
      proficiencies: ['System Architecture', 'Sourdough & Pasta', 'Acoustic Guitar'],
      interests: ['Specialty Espresso', 'Trail Running', 'Indie Cinema', 'Dog Rescue'],
      datingGoal: 'Looking for the one',
      vibeType: 'Witty & Banter',
    }
  );

  const [proficiencyInput, setProficiencyInput] = useState('');
  const [interestInput, setInterestInput] = useState('');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedPrompts, setGeneratedPrompts] = useState<PersonalizedPrompt[]>(initialPrompts || []);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<'full' | 'template' | 'all'>('full');
  const [copiedAllNotice, setCopiedAllNotice] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Catalogue Filters & Search State
  const [selectedAppFilter, setSelectedAppFilter] = useState<'All' | 'Hinge' | 'Bumble'>('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTargetPrompt, setSelectedTargetPrompt] = useState<DatingAppPromptSubject | null>(null);

  React.useEffect(() => {
    if (initialPrompts && initialPrompts.length > 0) {
      setGeneratedPrompts(initialPrompts);
    }
    if (initialPersona) {
      setPersona(initialPersona);
    }
  }, [initialPrompts, initialPersona]);

  const handleAddProficiency = () => {
    if (!proficiencyInput.trim()) return;
    setPersona((prev) => ({
      ...prev,
      proficiencies: [...prev.proficiencies, proficiencyInput.trim()],
    }));
    setProficiencyInput('');
  };

  const handleRemoveProficiency = (index: number) => {
    setPersona((prev) => ({
      ...prev,
      proficiencies: prev.proficiencies.filter((_, i) => i !== index),
    }));
  };

  const handleAddInterest = () => {
    if (!interestInput.trim()) return;
    setPersona((prev) => ({
      ...prev,
      interests: [...prev.interests, interestInput.trim()],
    }));
    setInterestInput('');
  };

  const handleRemoveInterest = (index: number) => {
    setPersona((prev) => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index),
    }));
  };

  const handleGeneratePrompts = async (targetPromptOverride?: DatingAppPromptSubject) => {
    if (!firebaseUser) {
      if (onRequireAuth) {
        onRequireAuth({
          type: 'build_prompts',
          tab: 'prompts',
          data: { persona },
        });
      }
      return;
    }

    if (user && user.credits < 1) {
      if (onOpenCreditModal) onOpenCreditModal();
      setErrorMessage("Insufficient credits (1 credit required)! Please refill your credit balance to generate individualized dating prompts.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    const activeTarget = targetPromptOverride || selectedTargetPrompt;

    try {
      const { ok, data } = await safeFetchJson<{
        error?: string;
        message?: string;
        prompts?: PersonalizedPrompt[];
        creditsRemaining?: number;
      }>('/api/profile/personalized-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...persona,
          targetPromptSubject: activeTarget ? activeTarget.subject : undefined,
          targetApp: activeTarget ? activeTarget.app : undefined,
        }),
      });

      if (!ok || data.error === 'InsufficientCredits') {
        if (onOpenCreditModal) onOpenCreditModal();
        setErrorMessage(data.message || 'Out of credits! Please refill your credits via Razorpay / UPI.');
        return;
      }

      if (data.prompts && data.prompts.length > 0) {
        setGeneratedPrompts(data.prompts);
        if (onSavePromptHistory) {
          onSavePromptHistory(persona, data.prompts);
        }
        if (onUpdateCredits) {
          if (typeof data.creditsRemaining === 'number') {
            onUpdateCredits(data.creditsRemaining);
          } else if (user && user.credits > 0) {
            onUpdateCredits(user.credits - 1);
          }
        }
      }
    } catch (e) {
      console.error(e);
      setErrorMessage('Network error while generating prompt suggestions.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper for 1-click clipboard for single text
  const handleCopy = (text: string, id: string, type: 'full' | 'template' | 'all') => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setCopiedType(type);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to copy entire package of prompts & advice
  const handleCopyAllPrompts = () => {
    if (generatedPrompts.length === 0) return;
    const formatted = generatedPrompts
      .map(
        (p, i) =>
          `[Prompt ${i + 1} - ${p.targetApp} (${p.vibeTag})]\nPrompt: "${p.subjectPrompt}"\nAnswer: "${p.personalizedBody}"\nTemplate: ${p.fillInTemplate}\nMatch Impact: ${p.matchImpact}\n`
      )
      .join('\n---\n\n');

    navigator.clipboard.writeText(`PROFILEPILOT AI TAILORED PROMPT PACKAGE\n\n${formatted}`);
    setCopiedAllNotice(true);
    setTimeout(() => setCopiedAllNotice(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Studio Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          Individualized Dating Profile Prompt Generator
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Craft Custom Hinge & Bumble Prompt Answers
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
          Tailored to your age, occupation, proficiencies, and lifestyle. Get pre-filled witty answers AND customizable fill-in templates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: User Persona Form */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-pink-400" />
              Your Persona & Matching Factors
            </h3>
            <span className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded-full border border-slate-800 font-mono">
              AI Match Tailoring
            </span>
          </div>

          {/* Age & Occupation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Age:</label>
              <input
                type="number"
                value={persona.age}
                onChange={(e) => setPersona({ ...persona, age: parseInt(e.target.value) || 25 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Occupation:</label>
              <input
                type="text"
                value={persona.occupation}
                onChange={(e) => setPersona({ ...persona, occupation: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
              />
            </div>
          </div>

          {/* Proficiencies & Skills */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 block">
              Proficiencies & Special Skills:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Italian Cooking, Guitar, Finance..."
                value={proficiencyInput}
                onChange={(e) => setProficiencyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddProficiency())}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
              />
              <button
                onClick={handleAddProficiency}
                className="px-3 py-2.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 font-bold text-xs cursor-pointer"
              >
                + Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {persona.proficiencies.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-semibold text-pink-300 flex items-center gap-1.5"
                >
                  <Award className="w-3 h-3 text-pink-400" />
                  {item}
                  <button
                    onClick={() => handleRemoveProficiency(idx)}
                    className="hover:text-rose-400 text-slate-500 cursor-pointer ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Hobbies & Interests */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 block">
              Hobbies & Lifestyle Interests:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Matcha, Trail Running, Vinyl..."
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
              />
              <button
                onClick={handleAddInterest}
                className="px-3 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-xs cursor-pointer"
              >
                + Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {persona.interests.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-semibold text-purple-300 flex items-center gap-1.5"
                >
                  <Heart className="w-3 h-3 text-purple-400" />
                  {item}
                  <button
                    onClick={() => handleRemoveInterest(idx)}
                    className="hover:text-rose-400 text-slate-500 cursor-pointer ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Dating Goal & Target Vibe */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Dating Goal:</label>
              <select
                value={persona.datingGoal}
                onChange={(e) => setPersona({ ...persona, datingGoal: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
              >
                <option value="Looking for the one">Looking for the one</option>
                <option value="Long-term relationship">Long-term relationship</option>
                <option value="Casual dating">Casual dating</option>
                <option value="Not sure yet">Not sure yet</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Desired Tone/Vibe:</label>
              <select
                value={persona.vibeType}
                onChange={(e) => setPersona({ ...persona, vibeType: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
              >
                <option value="Witty & Banter">Witty & Banter</option>
                <option value="Thoughtful & Cozy">Thoughtful & Cozy</option>
                <option value="Ambitious & Driven">Ambitious & Driven</option>
                <option value="Adventurous & Active">Adventurous & Active</option>
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGeneratePrompts}
            disabled={isGenerating}
            className={`w-full py-3.5 px-6 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl cursor-pointer transition-all ${
              isGenerating
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white shadow-purple-500/20 hover:scale-[1.01]'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-purple-300" />
                Gemini AI Calculating Prompts...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-pink-300" />
                Generate Individualized Prompts
              </>
            )}
          </button>

        </div>

        {/* Right Column: Official Hinge & Bumble Prompt Catalogue & Results */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Official Hinge & Bumble Prompt Catalogue Explorer */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-pink-400" />
                  Official App Subjects Catalogue ({OFFICIAL_DATING_APP_PROMPTS.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Browse over 100 working Hinge & Bumble prompts (retired prompts excluded). Click any prompt to generate a custom answer.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-56 shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search prompts..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {/* App Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {(['All', 'Hinge', 'Bumble'] as const).map((app) => (
                <button
                  key={app}
                  onClick={() => {
                    setSelectedAppFilter(app);
                    setSelectedCategoryFilter('All');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedAppFilter === app
                      ? 'bg-pink-600 text-white shadow-md shadow-pink-500/20'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {app === 'All' ? `All Apps (${OFFICIAL_DATING_APP_PROMPTS.length})` : app === 'Hinge' ? 'Hinge Prompts' : 'Bumble Prompts'}
                </button>
              ))}
            </div>

            {/* Sub-Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                onClick={() => setSelectedCategoryFilter('All')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 cursor-pointer ${
                  selectedCategoryFilter === 'All'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                All Categories
              </button>
              {Array.from(
                new Set(
                  OFFICIAL_DATING_APP_PROMPTS
                    .filter((p) => selectedAppFilter === 'All' || p.app === selectedAppFilter)
                    .map((p) => p.category)
                )
              ).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 cursor-pointer ${
                    selectedCategoryFilter === cat
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Prompts Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
              {OFFICIAL_DATING_APP_PROMPTS.filter((p) => {
                const matchesApp = selectedAppFilter === 'All' || p.app === selectedAppFilter;
                const matchesCategory = selectedCategoryFilter === 'All' || p.category === selectedCategoryFilter;
                const matchesSearch =
                  searchQuery.trim() === '' ||
                  p.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
                return matchesApp && matchesCategory && matchesSearch;
              }).map((sub) => {
                const isSelected = selectedTargetPrompt?.id === sub.id;
                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedTargetPrompt(isSelected ? null : sub)}
                    className={`p-3 rounded-xl transition-all cursor-pointer space-y-1.5 border ${
                      isSelected
                        ? 'bg-pink-500/10 border-pink-500 shadow-md shadow-pink-500/10'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        sub.app === 'Hinge' ? 'bg-pink-500/20 text-pink-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {sub.app}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                        {sub.category}
                      </span>
                    </div>

                    <p className={`font-extrabold text-xs leading-snug ${isSelected ? 'text-pink-300' : 'text-slate-200'}`}>
                      "{sub.subject}"
                    </p>

                    {sub.description && (
                      <p className="text-[10px] text-slate-400 line-clamp-1">
                        {sub.description}
                      </p>
                    )}

                    <div className="pt-1 flex items-center justify-between text-[10px]">
                      <span className="text-pink-400/80 font-bold hover:underline">
                        {isSelected ? '✓ Target Selected' : '✨ Target This Prompt'}
                      </span>
                      <ChevronRight className={`w-3 h-3 ${isSelected ? 'text-pink-400' : 'text-slate-600'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* INDIVIDUALIZED PROMPT RESULTS */}
          {generatedPrompts.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h3 className="font-black text-lg text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-pink-400" />
                    Your Tailored Prompt Package ({generatedPrompts.length})
                  </h3>
                  <span className="text-xs text-slate-400">
                    Customized for age {persona.age}, {persona.occupation}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyAllPrompts}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-pink-500/20 transition-all shrink-0"
                >
                  {copiedAllNotice ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span className="text-emerald-300">Package Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy All Prompts & Advice</span>
                    </>
                  )}
                </button>
              </div>

              {generatedPrompts.map((item, index) => (
                <div
                  key={item.id || index}
                  className="bg-slate-900 border border-slate-800 hover:border-pink-500/40 rounded-2xl p-5 space-y-4 transition-all shadow-lg group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-pink-500/10 text-pink-300 border border-pink-500/20 uppercase">
                          {item.targetApp}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          {item.vibeTag}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-base text-white group-hover:text-pink-300 transition-colors">
                        "{item.subjectPrompt}"
                      </h4>
                    </div>
                  </div>

                  {/* Fully Written Answer */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-bold text-pink-400 uppercase tracking-wider text-[10px]">
                        Tailored Answer (Pre-Filled)
                      </span>
                      <button
                        onClick={() => handleCopy(item.personalizedBody, item.id || `${index}`, 'full')}
                        className="flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-white cursor-pointer"
                      >
                        {copiedId === (item.id || `${index}`) && copiedType === 'full' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-pink-400" />
                            Copy Full
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-slate-100 leading-relaxed italic">
                      "{item.personalizedBody}"
                    </p>
                  </div>

                  {/* Fill-In Template with Placeholders */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-bold text-purple-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Fill-In Body Template (With Placeholders)
                      </span>
                      <button
                        onClick={() => handleCopy(item.fillInTemplate, item.id || `${index}`, 'template')}
                        className="flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-white cursor-pointer"
                      >
                        {copiedId === (item.id || `${index}`) && copiedType === 'template' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-purple-400" />
                            Copy Template
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs font-mono text-purple-200/90 leading-relaxed">
                      {item.fillInTemplate}
                    </p>
                  </div>

                  {/* Match Impact Explanation */}
                  <p className="text-[11px] text-slate-400 italic bg-slate-950/30 p-2.5 rounded-lg border border-slate-900">
                    💡 <strong className="text-slate-300 font-semibold">Match Impact:</strong> {item.matchImpact}
                  </p>

                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-white">No Prompts Generated Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Fill in your persona details on the left (age, occupation, proficiencies) and click "Generate Individualized Prompts" to get customized Hinge/Bumble answers!
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
