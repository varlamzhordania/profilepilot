import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  Search,
  MessageSquare,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  UserCheck,
  Lock,
  CreditCard,
  Heart,
  HelpCircle,
  BarChart3,
  Flame,
  Zap,
  Info,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';
import { UserProfile } from '../types';

interface LandingPageProps {
  user: UserProfile;
  firebaseUser: any;
  onGetStarted: () => void;
  onSignIn: () => void;
  onOpenLegalTab: (tab: string) => void;
  onOpenCreditModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  user,
  firebaseUser,
  onGetStarted,
  onSignIn,
  onOpenLegalTab,
  onOpenCreditModal,
}) => {
  const [activeDemoTab, setActiveDemoTab] = useState<'score' | 'photos' | 'bio' | 'coach'>('score');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16 py-4 px-2 sm:px-4">
      
      {/* HERO SECTION */}
      <section className="relative text-center space-y-6 pt-6 pb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ProfilePilot AI Wings</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Build a dating profile that <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-pink-500 via-rose-400 to-purple-400 bg-clip-text text-transparent">
            actually feels like you.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
          Your AI co-pilot for a better dating profile. Improve your photos, prompts, bio and conversations with personalised AI guidance designed around your personality and goals.
        </p>

        {/* CTA BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-base shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Improve My Profile</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={scrollToHowItWorks}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-base transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>See How It Works</span>
          </button>
        </div>

        {/* TRUST NOTE BELOW CTA */}
        <p className="text-xs text-slate-400 max-w-lg mx-auto flex items-center justify-center gap-1.5 pt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Your uploads stay connected to your private ProfilePilot account. You control and can request deletion of your data.</span>
        </p>
      </section>

      {/* PROBLEM & SOLUTION SECTION */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Your profile deserves more than guesswork.
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Dating apps are competitive. Small adjustments to your pictures and prompts make a measurable difference.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-semibold text-white text-sm">Unsure which pictures to use</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hard to judge your own photos or know which order gets the best response from matches.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-semibold text-white text-sm">Bio sounds generic or forced</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standard bios often read like resumes or copy-pasted clichés that get scrolled past.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-semibold text-white text-sm">Prompts do not start conversations</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              1-word prompt answers don't give potential matches an easy way to send an opening message.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h3 className="font-semibold text-white text-sm">Profile gets views but few matches</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unclear messaging or conflicting vibe signals reduce your match conversion rate.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm">
              5
            </div>
            <h3 className="font-semibold text-white text-sm">Unsure what to message next</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Conversations stall after "Hey" or generic small talk without creative opening lines.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
              6
            </div>
            <h3 className="font-semibold text-white text-sm">Difficult to spot weak points</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Without objective feedback, it's hard to know which specific picture or prompt is hurting results.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-950/30 to-purple-950/30 border border-pink-500/20 rounded-2xl p-4 text-center space-y-1">
          <p className="text-sm font-medium text-pink-200">
            ProfilePilot helps you understand how your profile may come across and gives you practical ways to improve it. You remain in control of every photo, prompt and message.
          </p>
        </div>
      </section>

      {/* FEATURE SECTION */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Four targeted tools to refine your dating presence
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Choose exactly what you need — from photo generation to profile critique and real-time chat guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* FEATURE 1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-pink-400 text-xs font-bold border border-slate-700">
                  10 credits per picture
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">AI Lifestyle Photos</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Upload a suitable reference photo and create realistic lifestyle images designed to preserve your recognisable appearance in high-converting settings like golden hour cafes and outdoor activities.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/80">
              <p className="text-xs text-slate-400 flex items-start gap-1.5">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>AI-generated image. Results may vary. Use images responsibly and do not use the service to impersonate another person.</span>
              </p>
            </div>
          </div>

          {/* FEATURE 2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-purple-400 text-xs font-bold border border-slate-700">
                  30 credits per analysis
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">Profile Analysis</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Upload screenshots of your profile and receive objective feedback on your pictures, prompts, bio, photo ordering and overall presentation.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/80">
              <p className="text-xs text-slate-400 flex items-start gap-1.5">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>Supports uploading multiple profile screenshots or pictures for a comprehensive review.</span>
              </p>
            </div>
          </div>

          {/* FEATURE 3 */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-rose-400 text-xs font-bold border border-slate-700">
                  Tailored Prompt Hooks
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">Bio and Prompt Builder</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Create personalised answers for popular dating-app prompts based on your personality, profession, interests and preferred communication style.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/80">
              <p className="text-xs text-slate-400 flex items-start gap-1.5">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>Compatible with prompt structures across major dating apps without official affiliation.</span>
              </p>
            </div>
          </div>

          {/* FEATURE 4 */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-sky-400 text-xs font-bold border border-slate-700">
                  1 credit per message
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">AI Dating Coach</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Get practical suggestions for replies, openers and conversation direction while keeping full decision-making control in your hands.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/80">
              <p className="text-xs text-slate-400 flex items-start gap-1.5">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>ProfilePilot provides suggestions, not guaranteed outcomes. Users are responsible for messages they choose to send.</span>
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 scroll-mt-20">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How ProfilePilot Works
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            A simple 4-step workflow to upgrade your dating presentation safely.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-2 relative">
            <span className="text-3xl font-black text-pink-500/30">01</span>
            <h3 className="font-bold text-white text-base">Create your account</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sign in with Google to securely establish your private ProfilePilot account linked to your authenticated Firebase UID.
            </p>
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-2 relative">
            <span className="text-3xl font-black text-purple-500/30">02</span>
            <h3 className="font-bold text-white text-base">Tell us your goal</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete a quick 1-minute preference check so recommendations match your vibe and target platforms.
            </p>
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-2 relative">
            <span className="text-3xl font-black text-rose-500/30">03</span>
            <h3 className="font-bold text-white text-base">Upload content</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Submit reference photos for lifestyle generation or screenshots of your profile for instant multi-category feedback.
            </p>
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-2 relative">
            <span className="text-3xl font-black text-emerald-500/30">04</span>
            <h3 className="font-bold text-white text-base">Choose & apply</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Review AI suggestions, select the photos or prompts that fit your authentic self, and apply them to your profile.
            </p>
          </div>
        </div>

        {/* ACCOUNT CREDIT NOTICE */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-white block mb-0.5">Account Credit & Data Notice:</strong>
            Credits, purchases, uploads and saved results are connected to the ProfilePilot account used during purchase. Credits cannot be transferred between separate accounts.
          </div>
        </div>
      </section>

      {/* PRODUCT DEMONSTRATION */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            See ProfilePilot in Action
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Explore sample outputs generated for fictional demonstration profiles.
          </p>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl max-w-xl mx-auto">
          <button
            onClick={() => setActiveDemoTab('score')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeDemoTab === 'score' ? 'bg-pink-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Profile Feedback
          </button>
          <button
            onClick={() => setActiveDemoTab('photos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeDemoTab === 'photos' ? 'bg-pink-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Photo Studio
          </button>
          <button
            onClick={() => setActiveDemoTab('bio')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeDemoTab === 'bio' ? 'bg-pink-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bio & Prompts
          </button>
          <button
            onClick={() => setActiveDemoTab('coach')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeDemoTab === 'coach' ? 'bg-pink-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Dating Coach
          </button>
        </div>

        {/* DEMO DISPLAY CARDS */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
          {activeDemoTab === 'score' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">Demonstration Analysis</span>
                  <h3 className="text-xl font-bold text-white">Sample Profile Audit: Alex, 27</h3>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-lg">
                  Vibe Score: 88/100
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Photo Variety</span>
                  <div className="text-lg font-bold text-white">High (4 distinct settings)</div>
                  <p className="text-xs text-slate-400">Good mix of activity and portrait shots.</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Bio Hook</span>
                  <div className="text-lg font-bold text-emerald-400">Strong Conversation Starter</div>
                  <p className="text-xs text-slate-400">Specific hobbies give matches easy opening hooks.</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Ordering Tip</span>
                  <div className="text-lg font-bold text-amber-400">Move Outdoor Shot to #1</div>
                  <p className="text-xs text-slate-400">Smiling eye-contact photo performs best as lead picture.</p>
                </div>
              </div>
            </div>
          )}

          {activeDemoTab === 'photos' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">AI Photo Preview</span>
                <h3 className="text-xl font-bold text-white">Golden Hour Lifestyle Generation</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <span className="font-bold text-slate-300">Style Settings Applied:</span>
                  <ul className="space-y-1 text-slate-400">
                    <li>• Lighting: Warm golden hour backlight</li>
                    <li>• Context: Casual outdoor cafe setting</li>
                    <li>• Expression: Relaxed, natural smile</li>
                    <li>• Identity Check: Facial proportions preserved</li>
                  </ul>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-2">
                  <div className="w-full h-40 bg-gradient-to-tr from-pink-900/40 via-purple-900/30 to-slate-950 rounded-xl flex items-center justify-center text-slate-400 text-xs border border-slate-800">
                    [ Demonstration Image Placeholder ]
                  </div>
                  <span className="text-[11px] text-slate-400 block">AI-generated lifestyle picture preview</span>
                </div>
              </div>
            </div>
          )}

          {activeDemoTab === 'bio' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">Bio & Prompt Rewriter</span>
                <h3 className="text-xl font-bold text-white">Transforming Clichés into Engaging Hooks</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-rose-500/20 space-y-2">
                  <span className="text-xs font-bold text-rose-400 uppercase">Before (Generic)</span>
                  <p className="text-xs text-slate-300 italic">
                    "I like coffee, travelling, and working out. Looking for someone genuine."
                  </p>
                </div>
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-emerald-500/20 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase">After (ProfilePilot Rewrite)</span>
                  <p className="text-xs text-slate-200 font-medium">
                    "Sunday morning routine: Espresso first, then hunting down the best sourdough in town. Show me your favorite local spot and coffee's on me."
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeDemoTab === 'coach' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">AI Dating Coach Suggestions</span>
                <h3 className="text-xl font-bold text-white">Creative Opening Lines & Banter</h3>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                  <strong className="text-pink-400 block mb-1">Match Profile Prompt:</strong>
                  "I'm overly passionate about finding the best ramen in the city..."
                </div>
                <div className="p-2.5 rounded-xl bg-pink-950/30 border border-pink-500/30 text-slate-200 space-y-1">
                  <strong className="text-emerald-400 block">Suggested Opener (Playful Banter):</strong>
                  <p>"Is broth richness or noodle texture the real deciding factor? I have strong opinions on both."</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* TRUST AND PRIVACY SECTION */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy & Data Handling</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Your profile is personal. Treating it carefully is not optional.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-300">
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Authenticated Account Privacy:</strong> Private features require sign-in, with data associated directly with your authenticated Firebase UID.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Account Isolation:</strong> Separate user accounts cannot access each other's uploaded photos, credit balances, or saved analysis results.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Secure Payment Processing:</strong> All credit purchases are securely verified through Razorpay. Payment card details are handled directly by Razorpay and are never stored in ProfilePilot's database.</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>User Data Control:</strong> You can request account and data deletion at any time directly through your Account Settings.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Cloud Storage & Providers:</strong> Uploaded images and prompt texts are processed via secure server-side cloud AI providers to generate results.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Privacy Contact:</strong> For inquiries regarding data handling or privacy requests, contact our team at <a href="mailto:privacy@profilepilot.ai" className="text-pink-400 underline">privacy@profilepilot.ai</a>.</span>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING AND CREDIT EXPLANATION */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Transparent Credit Pricing
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Pay as you go with credits that stay connected to your account.
          </p>
        </div>

        {/* CREDIT USAGE SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center space-y-1">
            <span className="text-2xl font-black text-pink-400">10 Credits</span>
            <div className="text-xs font-bold text-white">AI Lifestyle Photo</div>
            <p className="text-[11px] text-slate-400">Generates 1 high-resolution realistic portrait image.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center space-y-1">
            <span className="text-2xl font-black text-purple-400">30 Credits</span>
            <div className="text-xs font-bold text-white">Full Profile Analysis</div>
            <p className="text-[11px] text-slate-400">Complete audit of pictures, prompts, bio, and vibe scores.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center space-y-1">
            <span className="text-2xl font-black text-sky-400">1 Credit</span>
            <div className="text-xs font-bold text-white">AI Coach Reply</div>
            <p className="text-[11px] text-slate-400">1 personalized advice response or opener suggestion.</p>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={onOpenCreditModal}
            className="px-6 py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>View Credit Packs</span>
          </button>
          <div className="mt-2 text-xs text-slate-400">
            Read our <button onClick={() => onOpenLegalTab('refund')} className="text-pink-400 underline cursor-pointer">Refund and Cancellation Policy</button>. Credit purchases are tied to your account.
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Everything you need to know about ProfilePilot features, privacy, and credits.
          </p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {[
            {
              q: 'What exactly does ProfilePilot do?',
              a: 'ProfilePilot is an AI assistant that analyzes dating profile screenshots, generates realistic lifestyle pictures, rewrites bio prompt answers, and provides conversation guidance.',
            },
            {
              q: 'Does ProfilePilot guarantee more matches?',
              a: 'No. ProfilePilot provides AI-generated suggestions and profile-improvement tools. Dating outcomes depend on many factors outside ProfilePilot’s control, and no number of matches, replies or dates is guaranteed.',
            },
            {
              q: 'Are the generated photos real?',
              a: 'The photos are generated using AI based on reference photos you upload. They are designed to preserve your recognizable appearance in realistic lighting and settings.',
            },
            {
              q: 'Will the generated photos look exactly like me?',
              a: 'AI photo generation preserves facial identity features from your reference photo, but results may vary depending on the lighting and quality of the reference photo provided.',
            },
            {
              q: 'Can I use ProfilePilot for Hinge, Bumble or Tinder?',
              a: 'Yes! ProfilePilot works with profile screenshots, prompts, and bios from any dating platform.',
            },
            {
              q: 'Is ProfilePilot affiliated with any dating app?',
              a: 'ProfilePilot is an independent profile-improvement service and is not sponsored, endorsed by or affiliated with Tinder, Bumble, Hinge or their parent companies.',
            },
            {
              q: 'Who can see my uploaded screenshots?',
              a: 'Your uploaded screenshots are linked exclusively to your private ProfilePilot account (via your Firebase UID) and are processed via secure server API routes.',
            },
            {
              q: 'How are my credits connected to my account?',
              a: 'Credits are stored on the server against your authenticated Firebase UID. Signing into the same account on any device restores your balance.',
            },
            {
              q: 'Can I transfer credits to another email address?',
              a: 'No. Credits are permanently tied to the account used during purchase and cannot be transferred between separate accounts.',
            },
            {
              q: 'What happens if an AI generation fails?',
              a: 'If a server error or safety rejection prevents an AI output from being produced, unused credits are refunded back to your balance.',
            },
            {
              q: 'Can I delete my uploads and account?',
              a: 'Yes. You can request complete account and data deletion at any time in Account Settings.',
            },
            {
              q: 'Does ProfilePilot store my card details?',
              a: 'No. All payment transactions are securely handled by Razorpay. ProfilePilot does not store payment card numbers or CVVs.',
            },
            {
              q: 'How can I contact support?',
              a: 'You can email our support and privacy desk directly at privacy@profilepilot.ai.',
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 text-left font-semibold text-white text-sm flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/50 transition-colors"
              >
                <span>{item.q}</span>
                {openFaqIndex === idx ? (
                  <ChevronUp className="w-4 h-4 text-pink-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                )}
              </button>
              {openFaqIndex === idx && (
                <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="bg-gradient-to-r from-pink-950/60 via-purple-950/40 to-slate-900 border border-pink-500/30 rounded-3xl p-8 text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Ready to present your best self?
        </h2>
        <p className="text-sm text-slate-300 max-w-lg mx-auto">
          Start improving your dating profile photos, bio prompts, and conversation openers today.
        </p>
        <div className="pt-2">
          <button
            onClick={onGetStarted}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-base shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.02] cursor-pointer inline-flex items-center gap-2"
          >
            <span>Get Started with ProfilePilot</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

    </div>
  );
};
