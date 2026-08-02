import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Sparkles, Coins, ShieldCheck, History, Compass, ShieldAlert, Bot, LogIn, LogOut, User as UserIcon, UserCheck, Sun, Moon, Palette, Check, Smartphone, Flame } from 'lucide-react';
import { User } from '../lib/firebase';
import { ProfilePilotLogo } from './ProfilePilotLogo';

export type AppTheme = 'dark' | 'light';

interface HeaderProps {
  user: UserProfile;
  firebaseUser: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  onOpenCreditModal: () => void;
  onOpenLegalModal: () => void;
  onOpenPWAModal?: () => void;
  onOpenAuthModal?: () => void;
  onOpenAccountSettings?: () => void;
  onSignInGoogle: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  firebaseUser,
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  onOpenCreditModal,
  onOpenLegalModal,
  onOpenPWAModal,
  onOpenAuthModal,
  onOpenAccountSettings,
  onSignInGoogle,
  onSignOut,
}) => {
  const isLightMode = theme === 'light';

  const toggleLightDark = () => {
    setTheme(isLightMode ? 'dark' : 'light');
  };

  const headerBgClass = isLightMode
    ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-sm'
    : 'bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 text-white';

  const navContainerClass = isLightMode
    ? 'hidden lg:flex items-center gap-1 bg-slate-100 border border-slate-200/80 p-1 rounded-xl shrink-0'
    : 'hidden lg:flex items-center gap-1 bg-slate-900/80 border border-slate-800 p-1 rounded-xl shrink-0';

  const navInactiveClass = isLightMode
    ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/80 font-bold'
    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-semibold';

  return (
    <header className={`sticky top-0 z-40 px-3 sm:px-4 lg:px-8 py-2.5 transition-colors ${headerBgClass}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo - Compact and neat */}
        <button 
          onClick={() => setActiveTab('scanner')} 
          className="flex items-center gap-2 text-left group cursor-pointer focus:outline-none shrink-0"
        >
          <ProfilePilotLogo size={28} isLightMode={isLightMode} />
          <div>
            <div className="flex items-center gap-1">
              <span className="font-black text-sm sm:text-base tracking-tight">
                <span className="text-[#0284c7]">Profile</span>
                <span className="text-[#f97316]">Pilot</span>
              </span>
              <span className="px-1.5 py-0.5 text-[8px] sm:text-[9px] font-extrabold bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-full whitespace-nowrap">
                AI Wingman
              </span>
            </div>
            <p className={`text-[9px] sm:text-[10px] font-medium hidden xs:block ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
              Smart Dating Coach
            </p>
          </div>
        </button>

        {/* Center: Credits Pill (Logged in) or Improve My Profile CTA (Logged out) */}
        <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 shrink-0 px-1">
          
          {firebaseUser ? (
            /* Credit Counter Pill for Logged In User */
            <button
              onClick={onOpenCreditModal}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 border rounded-xl transition-all group cursor-pointer shrink-0 shadow-sm ${
                isLightMode
                  ? 'bg-amber-100/90 hover:bg-amber-200/90 border-amber-300 text-amber-900 font-extrabold'
                  : 'bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-purple-500/10 hover:from-amber-500/20 hover:to-pink-500/20 border-amber-500/30 text-amber-300 font-extrabold'
              }`}
              title="Click to manage or purchase credit packs"
            >
              <div className="w-5 h-5 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <Coins className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="block text-xs font-extrabold text-amber-900 dark:text-amber-300 whitespace-nowrap">
                  {user.credits} {user.credits === 1 ? 'Credit' : 'Credits'}
                </span>
              </div>
            </button>
          ) : (
            /* Public CTA for Logged Out Visitors */
            <button
              onClick={() => setActiveTab('scanner')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 border rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm ${
                isLightMode
                  ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
                  : 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Improve My Profile</span>
            </button>
          )}

          {/* Firebase Google Auth Button / User Profile */}
          {firebaseUser ? (
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={onOpenAccountSettings}
                className={`flex items-center gap-1.5 border px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all hover:border-purple-500 cursor-pointer ${
                  isLightMode ? 'bg-slate-100 border-slate-300 text-slate-900 shadow-sm' : 'bg-slate-900 border-slate-800 text-white'
                }`}
                title="Manage Account Settings & Login Methods"
              >
                {firebaseUser.photoURL ? (
                  <img src={firebaseUser.photoURL} alt="User" className="w-4 h-4 sm:w-5 sm:h-5 rounded-full shrink-0" />
                ) : (
                  <UserIcon className="w-4 h-4 text-purple-500 shrink-0" />
                )}
                <span className="font-bold text-xs truncate max-w-[65px] sm:max-w-[100px]">
                  {firebaseUser.displayName || firebaseUser.email?.split('@')[0]}
                </span>
              </button>
              <button
                type="button"
                onClick={onSignOut}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isLightMode
                    ? 'bg-slate-100 border-slate-300 text-slate-700 hover:text-rose-600 hover:border-rose-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400'
                }`}
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal || onSignInGoogle}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-md hover:shadow-pink-500/20 transition-all cursor-pointer shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

        </div>

        {/* Navigation Tabs (Desktop & Tablet) */}
        <nav className={navContainerClass}>
          {firebaseUser && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/20'
                  : navInactiveClass
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Dashboard
            </button>
          )}

          <button
            onClick={() => setActiveTab('inspire')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'inspire'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/20'
                : 'text-amber-500 font-bold hover:bg-amber-500/10'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
            {firebaseUser ? 'Examples' : 'Examples'}
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'photos'
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/20'
                : navInactiveClass
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            AI Photos
          </button>

          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'scanner'
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/20'
                : navInactiveClass
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Profile Analysis
          </button>

          <button
            onClick={() => setActiveTab('prompts')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'prompts'
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/20'
                : navInactiveClass
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-500" />
            Bio & Prompts
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/20'
                : navInactiveClass
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-pink-500" />
            AI Coach
          </button>

          {firebaseUser && (
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/20'
                  : navInactiveClass
              }`}
            >
              <History className="w-3.5 h-3.5" />
              History
            </button>
          )}
        </nav>

      </div>
    </header>
  );
};


