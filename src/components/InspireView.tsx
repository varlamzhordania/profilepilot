import React, { useState, useEffect } from 'react';
import { UserProfile, InspireStory } from '../types';
import { INITIAL_INSPIRE_STORIES } from '../data/inspireStories';
import { safeFetchJson } from '../utils/apiUtils';
import {
  Sparkles,
  Flame,
  Heart,
  TrendingUp,
  Search,
  Filter,
  Bot,
  ArrowRight,
  Share2,
  CheckCircle2,
  Quote,
  Zap,
  PlusCircle,
  X,
  Compass,
  Award,
  RefreshCw,
  Sliders,
  BadgeCheck,
} from 'lucide-react';

interface InspireViewProps {
  user: UserProfile;
  onSelectStrategy?: (strategyText: string) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenCreditModal: () => void;
  isLightMode?: boolean;
}

export const InspireView: React.FC<InspireViewProps> = ({
  user,
  onSelectStrategy,
  onNavigateTab,
  onOpenCreditModal,
  isLightMode = false,
}) => {
  const [stories, setStories] = useState<InspireStory[]>(INITIAL_INSPIRE_STORIES);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [upvotedStoryIds, setUpvotedStoryIds] = useState<Record<string, boolean>>({});
  
  // Custom AI Generation Modal State
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);
  const [genPlatform, setGenPlatform] = useState<string>('Hinge');
  const [genArchetype, setGenArchetype] = useState<string>('Shy Tech Worker');
  const [genFocusArea, setGenFocusArea] = useState<string>('Bio Overhaul');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch stories on load
  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { ok, data } = await safeFetchJson<{ stories?: InspireStory[] }>('/api/inspire/stories');
      if (ok && data.stories && data.stories.length > 0) {
        setStories(data.stories);
      }
    } catch (err) {
      console.log('Using default local stories fallback:', err);
    }
  };

  const handleUpvote = async (id: string) => {
    if (upvotedStoryIds[id]) return;

    setUpvotedStoryIds((prev) => ({ ...prev, [id]: true }));
    setStories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, upvotesCount: s.upvotesCount + 1 } : s))
    );

    try {
      await safeFetchJson('/api/inspire/upvote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId: id }),
      });
    } catch (e) {
      console.error('Failed to register upvote on backend:', e);
    }
  };

  const handleGenerateCustomStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenError(null);

    try {
      const { ok, data } = await safeFetchJson<{
        story?: InspireStory;
        error?: string;
        message?: string;
      }>('/api/inspire/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: genPlatform,
          archetype: genArchetype,
          focusArea: genFocusArea,
        }),
      });

      if (!ok || !data.story) {
        throw new Error(data.error || data.message || 'Failed to generate story.');
      }

      setStories((prev) => [data.story, ...prev]);
      setIsGenerateModalOpen(false);
    } catch (err: any) {
      console.error('Story generation failed:', err);
      setGenError(err?.message || 'Could not generate story right now. Try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyStrategy = (story: InspireStory) => {
    const text = `ProfilePilot Strategy (${story.platform}): ${story.keyInsight} - After: "${story.afterSnippet}"`;
    navigator.clipboard.writeText(text);
    setCopiedId(story.id);
    setTimeout(() => setCopiedId(null), 2000);

    if (onSelectStrategy) {
      onSelectStrategy(story.keyInsight);
    }
  };

  // Filtering Logic
  const filteredStories = stories.filter((story) => {
    const matchesPlatform = selectedPlatform === 'All' || story.platform === selectedPlatform;
    const matchesCategory = selectedCategory === 'All' || story.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      story.anonymousHandle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.storyText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.keyInsight.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.beforeSnippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.afterSnippet.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesPlatform && matchesCategory && matchesSearch;
  });

  const cardBgClass = isLightMode
    ? 'bg-white border-slate-200 text-slate-800 shadow-sm hover:shadow-md'
    : 'bg-slate-900 border-slate-800 text-white shadow-xl shadow-black/40 hover:border-slate-700';

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-6xl mx-auto">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-700 text-white shadow-2xl shadow-purple-900/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-black tracking-wide">
            <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>PROFILE MAKEOVER EXAMPLES</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            See what a stronger dating profile can look like
          </h1>

          <p className="text-xs sm:text-sm text-purple-100 font-medium leading-relaxed">
            Explore demonstration profiles showing how stronger photo selection, more natural prompts and clearer conversation hooks can improve overall profile presentation.
          </p>

          {/* Visible Disclaimer Label */}
          <div className="p-3 rounded-2xl bg-black/20 border border-white/15 text-xs text-amber-200 font-semibold flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Demonstration examples. Results vary and dating outcomes are not guaranteed.</span>
          </div>

          {onNavigateTab && (
            <div className="pt-2">
              <button
                onClick={() => onNavigateTab('scanner')}
                className="px-5 py-3 rounded-2xl bg-white text-rose-600 hover:bg-slate-100 font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <Compass className="w-4 h-4" />
                <span>Analyse My Profile</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`p-4 rounded-3xl border ${
          isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stories (e.g. Hinge, Chicago, bio...)"
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all ${
                isLightMode
                  ? 'bg-slate-50 border-slate-200 text-slate-800'
                  : 'bg-slate-800 border-slate-700 text-white'
              }`}
            />
          </div>

          {/* Platform Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
            {['All', 'Hinge', 'Bumble', 'Tinder', 'Raya', 'Match'].map((plat) => (
              <button
                key={plat}
                onClick={() => setSelectedPlatform(plat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedPlatform === plat
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : isLightMode
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {plat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Story Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredStories.map((story) => {
          const isUpvoted = upvotedStoryIds[story.id];

          return (
            <div
              key={story.id}
              className={`relative rounded-3xl border p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${cardBgClass}`}
            >
              <div className="space-y-4">
                {/* Story Top Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                      {story.anonymousHandle.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {story.anonymousHandle}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                          {story.platform}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {story.location} • {story.category}
                      </span>
                    </div>
                  </div>

                  {story.isAiGenerated && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      <Sparkles className="w-3 h-3" /> AI Story
                    </span>
                  )}
                </div>

                {/* Metric Transformation Pill */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Before: <span className="line-through text-slate-400 dark:text-slate-500 font-normal">{story.beforeMetric}</span></span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-500 font-extrabold">
                    <span>After: {story.afterMetric}</span>
                    <BadgeCheck className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                  </div>
                </div>

                {/* Before vs After Snippet Box */}
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-rose-700 dark:text-rose-300">
                    <span className="font-extrabold text-[10px] uppercase block text-rose-500 mb-0.5">
                      ❌ Before AI Wingman
                    </span>
                    <p className="italic font-medium">{story.beforeSnippet}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-extrabold text-[10px] uppercase text-emerald-500">
                        ✨ After AI Transformation
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(story.afterSnippet);
                          setCopiedId(`after_${story.id}`);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        {copiedId === `after_${story.id}` ? (
                          <span className="text-emerald-500 font-extrabold">Copied Text!</span>
                        ) : (
                          <span>Copy Text</span>
                        )}
                      </button>
                    </div>
                    <p className="font-semibold">{story.afterSnippet}</p>
                  </div>
                </div>

                {/* Narrative Text */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  "{story.storyText}"
                </p>

                {/* Key Takeaway Insight */}
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-start gap-2">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-extrabold text-amber-500 uppercase block">Key Strategy Takeaway</span>
                    <span>{story.keyInsight}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer Actions */}
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleUpvote(story.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isUpvoted
                      ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-500/10 hover:text-rose-500'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{story.upvotesCount} {isUpvoted ? 'Inspired!' : 'Inspire'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyStrategy(story)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    {copiedId === story.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Strategy</span>
                      </>
                    )}
                  </button>

                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab('chat')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 text-white text-xs font-bold hover:shadow-md transition-all cursor-pointer"
                    >
                      <span>Try Strategy</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStories.length === 0 && (
        <div className="text-center py-12 p-8 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <Quote className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-200">No Stories Match Your Filter</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Try adjusting your search query or platform filter to view other AI dating profile transformations.
          </p>
          <button
            onClick={() => {
              setSelectedPlatform('All');
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

    </div>
  );
};
