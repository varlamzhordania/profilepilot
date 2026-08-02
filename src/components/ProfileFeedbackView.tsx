import React, { useState } from 'react';
import { UserProfile, ProfileAIFeedback } from '../types';
import { safeFetchJson } from '../utils/apiUtils';
import { Sparkles, Upload, FileText, CheckCircle2, AlertTriangle, Flame, Copy, Check, RefreshCw, Sliders, ShieldCheck, UserCheck, ArrowRight, Camera, HelpCircle, Coins, Award, Zap } from 'lucide-react';

interface ProfileFeedbackViewProps {
  user: UserProfile;
  onOpenCreditModal?: () => void;
  onUpdateCredits?: (credits: number) => void;
}

export const ProfileFeedbackView: React.FC<ProfileFeedbackViewProps> = ({
  user,
  onOpenCreditModal,
  onUpdateCredits,
}) => {
  const [inputMode, setInputMode] = useState<'screenshot' | 'text'>('screenshot');
  
  // Screenshot upload state
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Text details state
  const [bioText, setBioText] = useState<string>('Software Engineer by day, aspiring chef by night. Looking for someone who can appreciate a homemade pasta dinner and a spontaneous weekend hike.');
  const [promptsText, setPromptsText] = useState<string>('My simple pleasures: Fresh espresso, mechanical keyboards, finding hidden rooftop bars, and dog walking in the park.');
  const [targetApp, setTargetApp] = useState<string>('Hinge');
  const [userGenderAge, setUserGenderAge] = useState<string>('27, Male');

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<ProfileAIFeedback | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage("Image size must be under 8MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
      setImageBase64(result);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleLoadDemo = (preset: 'hinge' | 'bumble') => {
    setInputMode('text');
    if (preset === 'hinge') {
      setTargetApp('Hinge');
      setUserGenderAge('28, Male');
      setBioText("Tech lead at a startup, sourdough fanatic, and sunset runner. Looking for a partner in crime for weekend farmers markets.");
      setPromptsText("Together we could: Perfect a neapolitan pizza recipe from scratch and argue about the best indie music festivals.");
    } else {
      setTargetApp('Bumble');
      setUserGenderAge('26, Female');
      setBioText("Architect & pottery enthusiast. Fluent in coffee recommendations and terrible puns. Looking for meaningful conversations.");
      setPromptsText("My Golden Rule: Never skip dessert, always bring extra snacks on road trips, and listen to jazz on rainy afternoons.");
    }
    setErrorMessage(null);
  };

  const handleRunFeedback = async () => {
    if (user.credits < 1) {
      if (onOpenCreditModal) onOpenCreditModal();
      setErrorMessage("Insufficient credits (1 credit required)! Please top up your credit balance to run Client Profile AI Feedback.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const payload: any = {
        inputMode,
        targetApp,
        userGenderAge,
      };

      if (inputMode === 'screenshot') {
        if (!imageBase64) {
          setErrorMessage("Please select a profile screenshot first.");
          setIsAnalyzing(false);
          return;
        }
        payload.imageBase64 = imageBase64;
      } else {
        payload.bioText = bioText;
        payload.promptsText = promptsText;
      }

      const { ok, data } = await safeFetchJson<{
        error?: string;
        message?: string;
        feedback?: ProfileAIFeedback;
        creditsRemaining?: number;
      }>('/api/profile/ai-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!ok || data.error === 'InsufficientCredits') {
        if (onOpenCreditModal) onOpenCreditModal();
        setErrorMessage(data.message || 'Out of credits! Please refill your credits to generate AI profile feedback.');
        return;
      }

      if (data.feedback) {
        setFeedback(data.feedback);
        if (onUpdateCredits && typeof data.creditsRemaining === 'number') {
          onUpdateCredits(data.creditsRemaining);
        }
      }
    } catch (e: any) {
      console.error(e);
      setErrorMessage("Failed to generate profile AI feedback. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyRewrite = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          Client Profile AI Feedback & Audit Studio
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Client Profile AI Feedback
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
          Get an immediate AI score, bio rewrite suggestions, photo arrangement critique, red flag audit, and match probability boosters for your dating app profile.
        </p>
      </div>

      {/* Input Selection Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
        
        {/* Toggle Mode & Demo Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setInputMode('screenshot')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                inputMode === 'screenshot'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload Profile Screenshot
            </button>
            <button
              onClick={() => setInputMode('text')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                inputMode === 'text'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Paste Bio & Prompts
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Try Demo Profile:</span>
            <button
              onClick={() => handleLoadDemo('hinge')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-pink-300 font-bold border border-slate-700 cursor-pointer"
            >
              Hinge Demo
            </button>
            <button
              onClick={() => handleLoadDemo('bumble')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold border border-slate-700 cursor-pointer"
            >
              Bumble Demo
            </button>
          </div>
        </div>

        {/* Input Details */}
        {inputMode === 'screenshot' ? (
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Upload Profile Screenshot (Hinge, Tinder, Bumble, or Instagram)
            </label>
            <div className="border-2 border-dashed border-slate-700 hover:border-pink-500/60 bg-slate-950/60 rounded-2xl p-8 text-center transition-all cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="profile-screenshot-input"
              />
              <label htmlFor="profile-screenshot-input" className="cursor-pointer space-y-3 block">
                {imagePreview ? (
                  <div className="max-w-xs mx-auto relative rounded-xl overflow-hidden border border-pink-500/50 shadow-xl">
                    <img src={imagePreview} alt="Profile preview" className="w-full h-auto max-h-64 object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-bold text-white bg-pink-600 px-3 py-1 rounded-full">Change Screenshot</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Click to select or drag & drop profile screenshot</p>
                      <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, WEBP up to 8MB</p>
                    </div>
                  </>
                )}
              </label>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Target App & Age/Gender
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={targetApp}
                  onChange={(e) => setTargetApp(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-pink-500"
                >
                  <option value="Hinge">Hinge</option>
                  <option value="Bumble">Bumble</option>
                  <option value="Tinder">Tinder</option>
                  <option value="Raya">Raya</option>
                </select>
                <input
                  type="text"
                  value={userGenderAge}
                  onChange={(e) => setUserGenderAge(e.target.value)}
                  placeholder="e.g. 27, Male"
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-pink-500"
                />
              </div>

              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 pt-2">
                Your Current Dating Bio
              </label>
              <textarea
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-pink-500"
                placeholder="Paste your dating bio text here..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Profile Prompts & Answers / Photo Details
              </label>
              <textarea
                value={promptsText}
                onChange={(e) => setPromptsText(e.target.value)}
                rows={6}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-pink-500"
                placeholder="Paste your prompt Q&As (e.g. 'Together we could...', 'My golden rule...') or describe your 6 photos..."
              />
            </div>
          </div>
        )}

        {/* Error message if any */}
        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl font-medium">
            ⚠ {errorMessage}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleRunFeedback}
          disabled={isAnalyzing}
          className="w-full py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-pink-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Analyzing Client Profile with Gemini AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Client Profile AI Feedback (1 Credit)</span>
            </>
          )}
        </button>

      </div>

      {/* RESULTS DISPLAY */}
      {feedback && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Top Gauge & Archetype Scorecard */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              
              <div className="space-y-2 text-center sm:text-left">
                <span className="px-3 py-1 bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-black rounded-full uppercase tracking-widest">
                  Client Archetype: {feedback.archetype || 'Warm Conversationalist'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Profile Attractiveness & Match Score
                </h3>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  "{feedback.summary}"
                </p>
                <button
                  type="button"
                  onClick={() => handleCopyRewrite(feedback.summary, 999)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-950 text-pink-300 hover:text-pink-200 border border-slate-800 text-xs font-bold transition-all cursor-pointer"
                >
                  {copiedIndex === 999 ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Summary Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-pink-400" />
                      <span>Copy AI Summary</span>
                    </>
                  )}
                </button>
              </div>

              {/* Big Score Gauge */}
              <div className="shrink-0 flex flex-col items-center justify-center w-32 h-32 rounded-3xl bg-slate-950 border-2 border-pink-500/40 p-4 shadow-xl">
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">
                  {feedback.overallScore}
                </span>
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">Out of 100</span>
              </div>

            </div>
          </div>

          {/* Grid Section: Bio Audit & Photo Critique */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Bio & Prompts Analysis */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-pink-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-pink-400" />
                Bio & Prompts Critique
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-emerald-400 block mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Profile Strengths
                  </span>
                  <ul className="space-y-1 text-slate-300 list-disc list-inside bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {feedback.bioAnalysis.strengths.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-bold text-rose-400 block mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Friction Points to Fix
                  </span>
                  <ul className="space-y-1 text-slate-300 list-disc list-inside bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {feedback.bioAnalysis.weaknesses.map((wk, idx) => (
                      <li key={idx}>{wk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Photo Selection Feedback */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-400" />
                Photo Order & Visual Vibe Critique
              </h4>

              <p className="text-xs text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
                {feedback.photoFeedback.photoCritique}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-300 block">Photos to Keep</span>
                  <ul className="text-[11px] text-slate-300 space-y-1">
                    {feedback.photoFeedback.suggestedPhotosToKeep.map((item, idx) => (
                      <li key={idx}>✓ {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-1">
                  <span className="font-bold text-rose-300 block">Photos to Swap</span>
                  <ul className="text-[11px] text-slate-300 space-y-1">
                    {feedback.photoFeedback.suggestedPhotosToReplace.map((item, idx) => (
                      <li key={idx}>✗ {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>

          {/* High-Converting Bio Rewrites */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              Polished AI Profile Rewrites (Ready to Copy)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {feedback.bioAnalysis.suggestedBioRewrites.map((rewrite, idx) => (
                <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-pink-400 uppercase tracking-wider block mb-1">
                      Option {idx + 1} Rewrite
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed italic">
                      "{rewrite}"
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyRewrite(rewrite, idx)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Bio Rewrite</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Red Flags & Top 3 Boosters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3 shadow-xl">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Dating Profile Cliche & Red Flag Flags
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {feedback.redFlagsDetected.map((rf, idx) => (
                  <li key={idx} className="p-2.5 bg-slate-950 border border-rose-900/30 rounded-xl flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span>{rf}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3 shadow-xl">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Top Instant Fixes to Double Match Rate
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {feedback.instantFixesToBoostMatches.map((fix, idx) => (
                  <li key={idx} className="p-2.5 bg-slate-950 border border-emerald-900/30 rounded-xl flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>{fix}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
