import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  UserProfile,
  AnalysisResult,
  PromptHistoryItem,
  CoachChatHistoryItem,
  PhotoStudioHistoryItem,
  UserProfilePersona,
  PersonalizedPrompt,
  ChatMessage,
  GeneratedPhoto,
} from './types';
import { Header, AppTheme } from './components/Header';
import { ChatScanner } from './components/ChatScanner';
import { AnalysisView } from './components/AnalysisView';
import { PhotoStudio } from './components/PhotoStudio';
import { ProfilePromptStudio } from './components/ProfilePromptStudio';
import { CoachChat } from './components/CoachChat';
import { HistoryView } from './components/HistoryView';
import { LegalView } from './components/LegalView';
import { AppealView } from './components/AppealView';
import { ProfileFeedbackView } from './components/ProfileFeedbackView';
import { LegalModal } from './components/LegalModal';
import { CreditModal } from './components/CreditModal';
import { PWAInstallModal } from './components/PWAInstallBanner';
import { AuthModal } from './components/AuthModal';
import { AccountSettingsModal } from './components/AccountSettingsModal';
import { InspireView } from './components/InspireView';
import { LandingPage } from './components/LandingPage';
import { SignInPage } from './components/SignInPage';
import { LegalConsentScreen } from './components/LegalConsentScreen';
import { OnboardingFlow } from './components/OnboardingFlow';
import { DashboardView } from './components/DashboardView';
import { UserOnboarding, LegalConsent } from './types';
import { NotificationBanner } from './components/NotificationBanner';
import { ShieldCheck, Compass, Sparkles, History, Camera, FileText, ShieldAlert, Bot, Smartphone, Flame, Sun, Moon } from 'lucide-react';
import { onAuthChange, loginWithGoogle, logout, User as FirebaseUser } from './lib/firebase';
import { safeFetchJson } from './utils/apiUtils';

export default function App() {
  const isTermsAcceptedInStorage = typeof window !== 'undefined' && localStorage.getItem('profilepilot_terms_accepted') === 'true';

  const [user, setUser] = useState<UserProfile>({
    id: 'user_pilot_demo_01',
    email: 'pilot_user@profilepilot.ai',
    displayName: 'Top Wingman',
    credits: 0, // Initial credit balance 0
    hasAcceptedTerms: isTermsAcceptedInStorage,
    acceptedTermsAt: isTermsAcceptedInStorage ? new Date().toISOString() : null,
    totalAnalysesCount: 0,
    createdAt: new Date().toISOString(),
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window === 'undefined') return 'scanner';
    const path = window.location.pathname.replace('/', '').toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const tabParam = searchParams.get('tab');

    const routeMap: Record<string, string> = {
      dashboard: 'dashboard',
      scanner: 'scanner',
      chat: 'chat',
      coach: 'chat',
      photos: 'photos',
      studio: 'photos',
      prompts: 'prompts',
      history: 'history',
      analytics: 'analytics',
      appeals: 'appeals',
      inspire: 'inspire',
      feedback: 'feedback',
      legal: 'legal',
    };

    if (tabParam && routeMap[tabParam]) return routeMap[tabParam];
    if (path && routeMap[path]) return routeMap[path];
    return 'dashboard';
  });

  const [theme, setTheme] = useState<AppTheme>('dark');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  // Local storage persisted state for Prompts, Coach Chat, and Photo Studio
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('profilepilot_prompt_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [coachChatHistory, setCoachChatHistory] = useState<CoachChatHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('profilepilot_coach_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [photoStudioHistory, setPhotoStudioHistory] = useState<PhotoStudioHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('profilepilot_photo_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Active loaded items for resuming/restarting sessions
  const [activePromptSession, setActivePromptSession] = useState<PromptHistoryItem | null>(null);
  const [activeCoachMessages, setActiveCoachMessages] = useState<ChatMessage[] | null>(null);
  const [activePhotoSession, setActivePhotoSession] = useState<PhotoStudioHistoryItem | null>(null);

  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState<boolean>(false);
  const [isPWAModalOpen, setIsPWAModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState<boolean>(false);
  const [showSignInView, setShowSignInView] = useState<boolean>(false);
  const [hasLegalConsent, setHasLegalConsent] = useState<boolean>(false);
  const [legalConsentChecked, setLegalConsentChecked] = useState<boolean>(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [onboardingChecked, setOnboardingChecked] = useState<boolean>(false);
  const [legalDocViewType, setLegalDocViewType] = useState<'terms' | 'privacy' | 'disclaimer' | 'refund' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSavePromptHistory = (persona: UserProfilePersona, prompts: PersonalizedPrompt[]) => {
    const newItem: PromptHistoryItem = {
      id: `prompt_hist_${Date.now()}`,
      createdAt: new Date().toISOString(),
      persona,
      prompts,
    };
    setPromptHistory((prev) => {
      const updated = [newItem, ...prev];
      try {
        localStorage.setItem('profilepilot_prompt_history', JSON.stringify(updated.slice(0, 20)));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleSaveCoachChatHistory = (messages: ChatMessage[]) => {
    if (messages.length <= 1) return;
    const lastUserMsg =
      [...messages].reverse().find((m) => m.sender === 'user')?.text || 'Coach chat session';
    const newItem: CoachChatHistoryItem = {
      id: `coach_hist_${Date.now()}`,
      createdAt: new Date().toISOString(),
      title: lastUserMsg,
      messages,
    };
    setCoachChatHistory((prev) => {
      const filtered = prev.filter((item) => item.id !== newItem.id);
      const updated = [newItem, ...filtered];
      try {
        localStorage.setItem('profilepilot_coach_history', JSON.stringify(updated.slice(0, 20)));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleSavePhotoStudioHistory = (photo: GeneratedPhoto, referenceImage?: string) => {
    const newItem: PhotoStudioHistoryItem = {
      id: `photo_hist_${Date.now()}`,
      createdAt: new Date().toISOString(),
      photo,
      uploadedImageBase64: referenceImage,
    };
    setPhotoStudioHistory((prev) => {
      const updated = [newItem, ...prev];
      try {
        localStorage.setItem('profilepilot_photo_history', JSON.stringify(updated.slice(0, 20)));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Sync window location with activeTab & handle browser back/forward navigation (popstate)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const routeMap: Record<string, string> = {
      scanner: 'scanner',
      chat: 'chat',
      coach: 'chat',
      photos: 'photos',
      studio: 'photos',
      prompts: 'prompts',
      history: 'history',
      analytics: 'analytics',
      appeals: 'appeals',
      inspire: 'inspire',
      feedback: 'feedback',
      legal: 'legal',
    };

    const handlePopState = () => {
      const currentPath = window.location.pathname.replace('/', '').toLowerCase();
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get('tab');

      // Close open modals on back navigation first if any are open
      if (isAuthModalOpen) {
        setIsAuthModalOpen(false);
        return;
      }
      if (isCreditModalOpen) {
        setIsCreditModalOpen(false);
        return;
      }
      if (isPWAModalOpen) {
        setIsPWAModalOpen(false);
        return;
      }

      if (tabParam && routeMap[tabParam]) {
        setActiveTab(routeMap[tabParam]);
      } else if (currentPath && routeMap[currentPath]) {
        setActiveTab(routeMap[currentPath]);
      } else {
        setActiveTab('scanner');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthModalOpen, isCreditModalOpen, isPWAModalOpen]);

  const handleRequireAuth = (pendingAction?: any) => {
    if (pendingAction) {
      try {
        sessionStorage.setItem('profilepilot_pending_action', JSON.stringify(pendingAction));
      } catch (e) {
        console.error('Failed to store pending action:', e);
      }
    }
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname.replace('/', '').toLowerCase();
      const targetPath = activeTab === 'scanner' ? '/' : `/${activeTab}`;
      if (currentPath !== (activeTab === 'scanner' ? '' : activeTab)) {
        window.history.pushState({ tab: activeTab }, '', targetPath);
      }
    }
  }, [activeTab]);

  // Synchronize documentElement theme class for Tailwind & CSS global variables
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'light' || theme === 'neo') {
        root.classList.remove('dark');
        root.classList.add('light');
      } else {
        root.classList.remove('light');
        root.classList.add('dark');
      }
    }
  }, [theme]);

  // Subscribe to Firebase auth state & check legal consent / onboarding
  useEffect(() => {
    const unsubscribe = onAuthChange((fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        setUser((prev) => ({
          ...prev,
          displayName: fUser.displayName || prev.displayName,
          email: fUser.email || prev.email,
        }));
        checkConsentAndOnboarding();
        fetchProfile();
        fetchHistory();

        // Pending Action Recovery (Section 20.L)
        try {
          const pendingRaw = sessionStorage.getItem('profilepilot_pending_action');
          if (pendingRaw) {
            const pending = JSON.parse(pendingRaw);
            sessionStorage.removeItem('profilepilot_pending_action');
            console.log('Recovered pending action after auth:', pending);
            if (pending.tab) {
              setActiveTab(pending.tab);
            }
            const costs: Record<string, number> = {
              analyze_profile: 30,
              generate_photo: 10,
              coach_message: 1,
              build_prompts: 1,
              buy_credits: 0,
            };
            const cost = costs[pending.type] || 0;
            if (cost > 0 && user.credits < cost) {
              setIsCreditModalOpen(true);
            } else if (pending.type === 'buy_credits') {
              setIsCreditModalOpen(true);
            }
          }
        } catch (pendingErr) {
          console.warn('Pending action recovery error:', pendingErr);
        }
      } else {
        setHasLegalConsent(false);
        setLegalConsentChecked(false);
        setHasCompletedOnboarding(false);
        setOnboardingChecked(false);
        setUser({
          id: 'anon',
          email: '',
          displayName: '',
          credits: 0,
          hasAcceptedTerms: false,
          totalAnalysesCount: 0,
          createdAt: new Date().toISOString(),
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const checkConsentAndOnboarding = async () => {
    try {
      // 1. Check Legal Consent on server
      const { ok: consentOk, data: consentData } = await safeFetchJson<{
        hasAcceptedConsent?: boolean;
        consentDoc?: LegalConsent | null;
      }>('/api/auth/legal-consent');

      if (consentOk && consentData.hasAcceptedConsent) {
        setHasLegalConsent(true);
        // 2. Check Onboarding on server
        const { ok: obOk, data: obData } = await safeFetchJson<{
          hasCompletedOnboarding?: boolean;
          onboarding?: UserOnboarding | null;
        }>('/api/auth/onboarding');

        if (obOk && obData.hasCompletedOnboarding && obData.onboarding) {
          setHasCompletedOnboarding(true);
          setUser((prev) => ({
            ...prev,
            onboarding: obData.onboarding || undefined,
          }));
        } else {
          setHasCompletedOnboarding(false);
        }
        setOnboardingChecked(true);
      } else {
        setHasLegalConsent(false);
        setHasCompletedOnboarding(false);
      }
      setLegalConsentChecked(true);
    } catch (e) {
      console.error('Consent/Onboarding check error:', e);
      setLegalConsentChecked(true);
      setOnboardingChecked(true);
    }
  };

  // Fetch initial profile & history on mount
  useEffect(() => {
    fetchProfile();
    fetchHistory();
  }, []);

  const fetchProfile = async () => {
    try {
      const { ok, data } = await safeFetchJson<{ user?: UserProfile }>('/api/auth/profile');
      if (ok && data.user) {
        const localAccepted = localStorage.getItem('profilepilot_terms_accepted') === 'true';
        const accepted = localAccepted || Boolean(data.user.hasAcceptedTerms);
        setUser({
          ...data.user,
          hasAcceptedTerms: accepted,
        });
        if (!accepted) {
          setIsLegalModalOpen(true);
        }
      }
    } catch (e) {
      console.error('Failed to fetch profile', e);
    }
  };

  const fetchHistory = async () => {
    try {
      const { ok, data } = await safeFetchJson<{ history?: AnalysisResult[] }>('/api/history');
      if (ok && data.history) setHistory(data.history);
    } catch (e) {
      console.error('Failed to fetch history', e);
    }
  };

  const handleAcceptTerms = async () => {
    try {
      localStorage.setItem('profilepilot_terms_accepted', 'true');
      const { data } = await safeFetchJson<{ user?: UserProfile }>('/api/auth/accept-terms', { method: 'POST' });
      if (data.user) {
        setUser({
          ...data.user,
          hasAcceptedTerms: true,
          acceptedTermsAt: new Date().toISOString(),
        });
      } else {
        setUser((prev) => ({
          ...prev,
          hasAcceptedTerms: true,
          acceptedTermsAt: new Date().toISOString(),
        }));
      }
      setIsLegalModalOpen(false);
    } catch (e) {
      console.error(e);
      localStorage.setItem('profilepilot_terms_accepted', 'true');
      setUser((prev) => ({
        ...prev,
        hasAcceptedTerms: true,
        acceptedTermsAt: new Date().toISOString(),
      }));
      setIsLegalModalOpen(false);
    }
  };

  const handlePurchaseCredits = async (packId: string, amount: number) => {
    try {
      const { data } = await safeFetchJson<{ success?: boolean; credits?: number }>('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId, amount }),
      });
      if (data.success && typeof data.credits === 'number') {
        setUser((prev) => ({ ...prev, credits: data.credits }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenCreditModal = () => {
    if (!firebaseUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsCreditModalOpen(true);
  };

  const handleAnalyzeChat = async (payload: {
    chatSnippet?: string;
    imageBase64?: string;
    mimeType?: string;
    chatType: 'screenshot' | 'text' | 'demo';
    demoTitle?: string;
  }) => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const { ok, data } = await safeFetchJson<{
        error?: string;
        message?: string;
        analysis?: AnalysisResult;
        creditsRemaining: number;
      }>('/api/analyze-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!ok) {
        if (data.error === 'TermsNotAccepted') {
          setIsLegalModalOpen(true);
        } else if (data.error === 'InsufficientCredits') {
          handleOpenCreditModal();
        } else {
          setErrorMessage(data.message || 'Failed to analyze chat.');
        }
        return;
      }

      if (data.analysis) {
        setCurrentResult(data.analysis);
        setHistory((prev) => [data.analysis, ...prev]);
        setUser((prev) => ({
          ...prev,
          credits: data.creditsRemaining,
          totalAnalysesCount: prev.totalAnalysesCount + 1,
        }));

        // Subtle confetti celebration
        try {
          confetti({
            particleCount: 40,
            spread: 50,
            origin: { y: 0.6 },
            colors: ['#ec4899', '#a855f7', '#6366f1', '#38bdf8'],
            disableForReducedMotion: true,
          });
        } catch (confettiErr) {
          console.error(confettiErr);
        }
      }
    } catch (e: any) {
      console.error(e);
      setErrorMessage('Network error occurred while contacting AI Wingman server.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewScan = () => {
    setCurrentResult(null);
    setActiveTab('scanner');
  };

  const handleOpenStudioWithCard = (result: AnalysisResult) => {
    setCurrentResult(result);
    setActiveTab('studio');
  };

  const getThemeWrapperClass = () => {
    switch (theme) {
      case 'light':
        return 'min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-pink-500 selection:text-white flex flex-col justify-between transition-colors duration-300';
      case 'luxury':
        return 'min-h-screen bg-stone-950 text-amber-100 font-sans selection:bg-amber-500 selection:text-stone-950 flex flex-col justify-between transition-colors duration-300';
      case 'neo':
        return 'min-h-screen bg-amber-50 text-slate-900 font-sans selection:bg-yellow-400 selection:text-black flex flex-col justify-between transition-colors duration-300';
      case 'dark':
      default:
        return 'min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-pink-500 selection:text-white flex flex-col justify-between transition-colors duration-300';
    }
  };

  const getMobileNavClass = () => {
    switch (theme) {
      case 'light':
        return 'md:hidden sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2 flex items-center justify-around shadow-lg';
      case 'luxury':
        return 'md:hidden sticky bottom-0 z-40 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 p-2 flex items-center justify-around';
      case 'neo':
        return 'md:hidden sticky bottom-0 z-40 bg-white border-t-2 border-black p-2 flex items-center justify-around shadow-[0px_-4px_0px_0px_rgba(0,0,0,1)]';
      case 'dark':
      default:
        return 'md:hidden sticky bottom-0 z-40 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 p-2 flex items-center justify-around';
    }
  };

  const getFooterClass = () => {
    switch (theme) {
      case 'light':
        return 'border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-600';
      case 'luxury':
        return 'border-t border-stone-800 bg-stone-900 py-6 px-4 text-center text-xs text-amber-400/70';
      case 'neo':
        return 'border-t-2 border-black bg-yellow-300 py-6 px-4 text-center text-xs font-bold text-slate-900';
      case 'dark':
      default:
        return 'border-t border-slate-900 bg-slate-950/80 py-6 px-4 text-center text-xs text-slate-500';
    }
  };

  return (
    <div className={getThemeWrapperClass()}>
      
      {/* Top Sticky Header */}
      <div>
        <Header
          user={user}
          firebaseUser={firebaseUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
          setTheme={setTheme}
          onOpenCreditModal={handleOpenCreditModal}
          onOpenLegalModal={() => setIsLegalModalOpen(true)}
          onOpenPWAModal={() => setIsPWAModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenAccountSettings={() => setIsAccountSettingsOpen(true)}
          onSignInGoogle={() => loginWithGoogle().catch(console.error)}
          onSignOut={() => logout().catch(console.error)}
        />

        {/* Global Error Notice Bar */}
        {errorMessage && (
          <div className="bg-rose-900/80 border-b border-rose-700 text-white text-xs py-2 px-4 text-center font-semibold flex items-center justify-center gap-2">
            <span>⚠ {errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="underline text-rose-200 cursor-pointer ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="p-4 sm:p-6 lg:p-8">
          
          {/* Web Push Notification Status / Prompt Banner */}
          <NotificationBanner isLightMode={theme === 'light' || theme === 'neo'} />

          {/* DASHBOARD TAB (HOME / LANDING OR USER DASHBOARD) */}
          {activeTab === 'dashboard' && (
            firebaseUser ? (
              !hasLegalConsent ? (
                <LegalConsentScreen
                  onConsentAccepted={() => {
                    setHasLegalConsent(true);
                    checkConsentAndOnboarding();
                  }}
                  onSignOut={() => logout().catch(console.error)}
                  onViewDoc={(doc) => {
                    setLegalDocViewType(doc);
                    setIsLegalModalOpen(true);
                  }}
                />
              ) : !hasCompletedOnboarding ? (
                <OnboardingFlow
                  onComplete={(ob) => {
                    setHasCompletedOnboarding(true);
                    setUser((prev) => ({ ...prev, onboarding: ob }));
                  }}
                  onSkip={() => setHasCompletedOnboarding(true)}
                />
              ) : (
                <DashboardView
                  user={user}
                  firebaseUser={firebaseUser}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onOpenCreditModal={handleOpenCreditModal}
                  onOpenLegalModal={() => setIsLegalModalOpen(true)}
                  onRestartOnboarding={() => setHasCompletedOnboarding(false)}
                  onSignOut={() => logout().catch(console.error)}
                />
              )
            ) : (
              <LandingPage
                user={user}
                firebaseUser={firebaseUser}
                onGetStarted={() => setActiveTab('scanner')}
                onSignIn={() => setIsAuthModalOpen(true)}
                onOpenLegalTab={(doc) => {
                  setLegalDocViewType(doc as any);
                  setIsLegalModalOpen(true);
                }}
                onOpenCreditModal={handleOpenCreditModal}
              />
            )
          )}

          {/* TAB 0: Inspire Success Stories / Examples (Public) */}
          {activeTab === 'inspire' && (
            <InspireView
              user={user}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenCreditModal={handleOpenCreditModal}
              isLightMode={theme === 'light' || theme === 'neo'}
            />
          )}

          {/* TAB 1: Profile Analysis / Scanner (Public Page, Protected Action) */}
          {activeTab === 'scanner' && (
            currentResult ? (
              <AnalysisView
                result={currentResult}
                onOpenStudioWithCard={handleOpenStudioWithCard}
                onNewScan={handleNewScan}
              />
            ) : (
              <ChatScanner
                user={user}
                firebaseUser={firebaseUser}
                isAnalyzing={isAnalyzing}
                onAnalyze={handleAnalyzeChat}
                onOpenCreditModal={handleOpenCreditModal}
                onOpenLegalModal={() => setIsLegalModalOpen(true)}
                onRequireAuth={handleRequireAuth}
              />
            )
          )}

          {/* TAB 2: AI Coach Chat (Public Page, Protected Action) */}
          {activeTab === 'chat' && (
            <CoachChat
              user={user}
              firebaseUser={firebaseUser}
              initialMessages={activeCoachMessages || undefined}
              onOpenCreditModal={handleOpenCreditModal}
              onUpdateCredits={(newCredits) => setUser((prev) => ({ ...prev, credits: newCredits }))}
              onSaveChatHistory={handleSaveCoachChatHistory}
              onRequireAuth={handleRequireAuth}
            />
          )}

          {/* TAB 3: AI Photo Studio (Public Page, Protected Action) */}
          {activeTab === 'photos' && (
            <PhotoStudio
              user={user}
              firebaseUser={firebaseUser}
              initialPhoto={activePhotoSession?.photo || null}
              initialReferenceImage={activePhotoSession?.uploadedImageBase64 || null}
              onUpdateCredits={(newCredits) => setUser((prev) => ({ ...prev, credits: newCredits }))}
              onOpenCreditModal={handleOpenCreditModal}
              onSavePhotoHistory={handleSavePhotoStudioHistory}
              onRequireAuth={handleRequireAuth}
            />
          )}

          {/* TAB 4: Bio & Prompts (Public Page, Protected Action) */}
          {activeTab === 'prompts' && (
            <ProfilePromptStudio
              user={user}
              firebaseUser={firebaseUser}
              initialPrompts={activePromptSession?.prompts || undefined}
              initialPersona={activePromptSession?.persona || undefined}
              onOpenCreditModal={handleOpenCreditModal}
              onUpdateCredits={(newCredits) => setUser((prev) => ({ ...prev, credits: newCredits }))}
              onSavePromptHistory={handleSavePromptHistory}
              onRequireAuth={handleRequireAuth}
            />
          )}

          {/* TAB: Client Profile AI Feedback */}
          {activeTab === 'feedback' && (
            <ProfileFeedbackView
              user={user}
              onOpenCreditModal={handleOpenCreditModal}
              onUpdateCredits={(newCredits) => setUser((prev) => ({ ...prev, credits: newCredits }))}
            />
          )}

          {/* TAB 5: History Log (Protected) */}
          {activeTab === 'history' && (
            firebaseUser ? (
              <HistoryView
                history={history}
                promptHistory={promptHistory}
                coachChatHistory={coachChatHistory}
                photoStudioHistory={photoStudioHistory}
                onSelectResult={(res) => {
                  setCurrentResult(res);
                  setActiveTab('scanner');
                }}
                onSelectPromptHistory={(item) => {
                  setActivePromptSession(item);
                  setActiveTab('prompts');
                }}
                onSelectCoachChatHistory={(item) => {
                  setActiveCoachMessages(item.messages);
                  setActiveTab('chat');
                }}
                onSelectPhotoStudioHistory={(item) => {
                  setActivePhotoSession(item);
                  setActiveTab('photos');
                }}
                onNewScan={handleNewScan}
              />
            ) : (
              <div className="max-w-xl mx-auto my-12 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-500 mx-auto flex items-center justify-center">
                  <History className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-white">Sign In to Access Your History</h2>
                <p className="text-xs text-slate-400">Your saved profile analyses, generated photos, AI coach conversations, and prompts are securely connected to your ProfilePilot account.</p>
                <button
                  onClick={() => handleRequireAuth({ type: 'view_history', tab: 'history' })}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs rounded-xl shadow-lg hover:scale-105 transition-all cursor-pointer"
                >
                  Sign In / Register
                </button>
              </div>
            )
          )}

              {/* TAB 5: Appeals & Ban Advisory */}
              {activeTab === 'appeals' && (
                <AppealView
                  user={user}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {/* TAB 6: Legal & Terms */}
              {activeTab === 'legal' && (
                <LegalView
                  user={user}
                  initialTab={legalDocViewType || 'privacy'}
                  onOpenLegalModal={() => setIsLegalModalOpen(true)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className={getMobileNavClass()}>
        <button
          onClick={() => setActiveTab('inspire')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-bold ${
            activeTab === 'inspire' ? 'text-amber-500' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500/20" />
          Inspire
        </button>

        <button
          onClick={() => setActiveTab('scanner')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-bold ${
            activeTab === 'scanner' ? 'text-pink-500' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Compass className="w-4 h-4" />
          Scanner
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-bold ${
            activeTab === 'chat' ? 'text-pink-500' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Bot className="w-4 h-4 text-pink-500" />
          Coach Chat
        </button>

        <button
          onClick={() => setActiveTab('photos')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-bold ${
            activeTab === 'photos' ? 'text-pink-500' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Camera className="w-4 h-4" />
          Photos
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-bold ${
            activeTab === 'history' ? 'text-pink-500' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <History className="w-4 h-4" />
          History
        </button>

        <button
          onClick={() => setActiveTab('appeals')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-bold ${
            activeTab === 'appeals' ? 'text-rose-500' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          Appeals
        </button>

        {/* Bottom Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="flex flex-col items-center gap-1 p-1 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-amber-500 transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          )}
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>

        {/* Bottom Privacy / Legal */}
        <button
          onClick={() => setIsLegalModalOpen(true)}
          className="flex flex-col items-center gap-1 p-1 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors"
          title="Privacy & Legal Terms"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
          Privacy
        </button>
      </div>

      {/* Footer */}
      <footer className={getFooterClass()}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-medium text-slate-400 dark:text-slate-500">© 2026 Profilepilot AI. Multimodal AI Dating Wingman System.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-semibold">
            {/* Theme Toggle Button in Footer */}
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
              className="flex items-center gap-1 text-slate-400 hover:text-amber-400 cursor-pointer transition-colors"
            >
              {theme === 'light' ? <Moon className="w-3.5 h-3.5 text-purple-500" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>

            {/* Privacy Terms */}
            <button 
              onClick={() => setIsLegalModalOpen(true)} 
              className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Privacy & Strict Terms</span>
            </button>

            <button onClick={() => setIsPWAModalOpen(true)} className="text-sky-400 hover:text-sky-300 font-bold cursor-pointer flex items-center gap-1 transition-colors">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
            
            <button onClick={() => setActiveTab('appeals')} className="hover:text-rose-300 text-rose-400/90 font-bold cursor-pointer transition-colors flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Ban Appeals & Email Desk</span>
            </button>

            <button onClick={() => setActiveTab('legal')} className="text-slate-400 hover:text-slate-200 cursor-pointer transition-colors">
              Liability Disclaimer
            </button>
            <button onClick={handleOpenCreditModal} className="text-slate-400 hover:text-slate-200 cursor-pointer transition-colors">
              Credit Store
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LegalModal
        isOpen={isLegalModalOpen}
        user={user}
        onClose={() => setIsLegalModalOpen(false)}
        onAcceptTerms={handleAcceptTerms}
      />

      <CreditModal
        isOpen={isCreditModalOpen}
        user={user}
        firebaseUser={firebaseUser}
        onClose={() => setIsCreditModalOpen(false)}
        onPurchaseCredits={handlePurchaseCredits}
        onOpenAuthModal={() => {
          setIsCreditModalOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      <PWAInstallModal
        isOpen={isPWAModalOpen}
        onClose={() => setIsPWAModalOpen(false)}
        isLightMode={theme === 'light' || theme === 'neo'}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        isLightMode={theme === 'light' || theme === 'neo'}
      />

      <AccountSettingsModal
        isOpen={isAccountSettingsOpen}
        onClose={() => setIsAccountSettingsOpen(false)}
        firebaseUser={firebaseUser}
        isLightMode={theme === 'light' || theme === 'neo'}
      />

    </div>
  );
}
