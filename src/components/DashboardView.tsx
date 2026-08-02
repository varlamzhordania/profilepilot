import React, { useState } from 'react';
import {
  Camera,
  Search,
  FileText,
  MessageSquare,
  CreditCard,
  Sparkles,
  History,
  ShieldCheck,
  Trash2,
  RefreshCw,
  HelpCircle,
  ArrowRight,
  AlertTriangle,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import { UserProfile, UserOnboarding } from '../types';
import { safeFetchJson } from '../utils/apiUtils';

interface DashboardViewProps {
  user: UserProfile;
  firebaseUser: any;
  onNavigateTab: (tab: string) => void;
  onOpenCreditModal: () => void;
  onOpenLegalModal: () => void;
  onRestartOnboarding: () => void;
  onSignOut: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  firebaseUser,
  onNavigateTab,
  onOpenCreditModal,
  onOpenLegalModal,
  onRestartOnboarding,
  onSignOut,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const firstName = user.displayName
    ? user.displayName.split(' ')[0]
    : user.email
    ? user.email.split('@')[0]
    : 'Wingman';

  const topFocus = user.onboarding?.topFocus || 'photos';

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const { ok, data } = await safeFetchJson('/api/auth/delete-account', {
        method: 'POST',
      });
      if (ok && data.success) {
        alert('Your account and all associated data have been permanently deleted.');
        onSignOut();
      } else {
        setDeleteError(data?.message || 'Failed to delete account. Please try logging in again.');
      }
    } catch (e) {
      setDeleteError('Network error while requesting account deletion.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4 px-2 sm:px-4">
      
      {/* TOP WELCOME BANNER */}
      <div className="bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold">
              Authenticated Member
            </span>
            <span className="text-xs text-slate-400 font-mono">
              UID: {user.id ? user.id.slice(0, 12) + '...' : 'Guest'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, {firstName}! 👋
          </h1>

          <p className="text-xs sm:text-sm text-slate-300">
            Your ProfilePilot AI wingman is ready. What would you like to build today?
          </p>
        </div>

        {/* CREDIT BALANCE & TOP UP CARD */}
        <div className="w-full md:w-auto bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between md:justify-start gap-4 shrink-0">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Credit Balance
            </span>
            <div className="text-2xl font-black text-white flex items-center gap-1.5">
              <span>{user.credits}</span>
              <span className="text-xs text-pink-400 font-bold">credits</span>
            </div>
          </div>

          <button
            onClick={onOpenCreditModal}
            className="px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <CreditCard className="w-4 h-4" />
            <span>Top Up</span>
          </button>
        </div>
      </div>

      {/* HIGHLIGHTED RECOMMENDED FIRST ACTION BASED ON ONBOARDING */}
      <div className="bg-slate-900 border border-pink-500/30 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-400" />
          <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">
            Personalised Recommendation
          </span>
        </div>

        {topFocus === 'photos' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Generate High-Converting Lifestyle Photos</h2>
              <p className="text-xs text-slate-300">Create realistic portraits in golden hour cafes and outdoor settings. (10 credits)</p>
            </div>
            <button
              onClick={() => onNavigateTab('photos')}
              className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>Create Photos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {topFocus === 'profile' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Analyse Your Full Dating Profile</h2>
              <p className="text-xs text-slate-300">Upload profile screenshots for an instant multi-slide audit & score. (30 credits)</p>
            </div>
            <button
              onClick={() => onNavigateTab('scanner')}
              className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>Audit Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {topFocus === 'bio' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Build Engaging Bios and Prompt Answers</h2>
              <p className="text-xs text-slate-300">Transform clichés into irresistible conversation hooks tailored to Hinge, Bumble or Tinder.</p>
            </div>
            <button
              onClick={() => onNavigateTab('feedback')}
              className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>Start Writing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {topFocus === 'conversations' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Ask the AI Dating Coach for Opening Lines</h2>
              <p className="text-xs text-slate-300">Get instant flirty openers, banter tips, and conversation guidance. (1 credit)</p>
            </div>
            <button
              onClick={() => onNavigateTab('chat')}
              className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>Open Coach Chat</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {topFocus === 'everything' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Complete Profile Transformation</h2>
              <p className="text-xs text-slate-300">Start with a full profile analysis to identify weak points, then optimize photos and prompts.</p>
            </div>
            <button
              onClick={() => onNavigateTab('scanner')}
              className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>Start Full Audit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 4 PRIMARY FEATURE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <button
          onClick={() => onNavigateTab('photos')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl text-left space-y-3 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-pink-400">
              10 credits
            </span>
          </div>
          <div>
            <h3 className="font-bold text-white text-base group-hover:text-pink-400 transition-colors">
              Generate Photos
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Create realistic lifestyle portraits preserving your identity.
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('scanner')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl text-left space-y-3 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-purple-400">
              30 credits
            </span>
          </div>
          <div>
            <h3 className="font-bold text-white text-base group-hover:text-purple-400 transition-colors">
              Analyse Profile
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Upload screenshots for photo & prompt critique.
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('feedback')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl text-left space-y-3 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-rose-400">
              Bio Rewriter
            </span>
          </div>
          <div>
            <h3 className="font-bold text-white text-base group-hover:text-rose-400 transition-colors">
              Bio & Prompts
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Write high-match prompt answers matching your vibe.
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('chat')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl text-left space-y-3 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-sky-400">
              1 credit
            </span>
          </div>
          <div>
            <h3 className="font-bold text-white text-base group-hover:text-sky-400 transition-colors">
              Dating Coach
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Get opener suggestions and conversation tips.
            </p>
          </div>
        </button>

      </div>

      {/* QUICK LINKS & ACCOUNT SETTINGS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* RECENT ACTIVITY & HISTORY LINK */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-pink-400" />
              <h3 className="font-bold text-white text-sm">Saved Activity & History</h3>
            </div>
            <button
              onClick={() => onNavigateTab('history')}
              className="text-xs text-pink-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            All your generated lifestyle photos, profile analyses, prompt histories, and coach conversations are saved to your private account.
          </p>

          <button
            onClick={() => onNavigateTab('history')}
            className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 cursor-pointer transition-colors"
          >
            Access History Vault
          </button>
        </div>

        {/* PRIVACY & ACCOUNT SETTINGS */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Privacy & Account Settings</h3>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Account Email:</span>
              <span className="font-bold text-white">{user.email || 'Google User'}</span>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={onRestartOnboarding}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 cursor-pointer transition-colors flex items-center justify-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-take Quiz</span>
              </button>

              <button
                onClick={onOpenLegalModal}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 cursor-pointer transition-colors flex items-center justify-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>View Terms</span>
              </button>
            </div>

            {/* DELETE ACCOUNT BUTTON */}
            <div className="pt-2 border-t border-slate-800/80">
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-2 px-3 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-800/50 text-rose-400 text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete My Account and Data</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-700 space-y-2 text-xs text-rose-200">
                  <div className="flex items-center gap-1.5 font-bold text-rose-100">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Confirm Account Deletion</span>
                  </div>
                  <p className="text-[11px] leading-snug">
                    This will permanently delete all credits, uploads, saved analyses, and account records for UID {user.id}. This action cannot be undone.
                  </p>
                  {deleteError && (
                    <div className="text-[11px] text-rose-300 font-bold">{deleteError}</div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer disabled:opacity-50"
                    >
                      {isDeleting ? 'Deleting...' : 'Permanently Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
