import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Share, PlusSquare, CheckCircle2, X, Sparkles, ExternalLink, ShieldCheck, Zap } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLightMode?: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isLightMode = false,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Check if already running in standalone PWA mode
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // Capture beforeinstallprompt for Android / Chrome / Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setInstalledSuccess(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstalledSuccess(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('PWA prompt error:', err);
    }
  };

  const bgModalClass = isLightMode
    ? 'bg-white text-slate-900 border-slate-200'
    : 'bg-slate-900 text-white border-slate-800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden p-6 sm:p-8 ${bgModalClass}`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            isLightMode ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon Badge */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 p-0.5 shadow-lg shadow-pink-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Smartphone className="w-7 h-7 text-pink-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight">Install ProfilePilot</h2>
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3" /> PWA App
              </span>
            </div>
            <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Install on iOS iPhone, Android, Mac or Windows PC
            </p>
          </div>
        </div>

        {/* Already Installed / Success View */}
        {isStandalone || installedSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-500">ProfilePilot App Installed!</h3>
              <p className={`text-xs mt-1 ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                ProfilePilot is running directly on your device with native speed, full-screen view, and offline launch capabilities.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl shadow-lg hover:brightness-110 transition-all cursor-pointer"
            >
              Continue Using ProfilePilot
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Native App Benefits */}
            <div className={`grid grid-cols-3 gap-2.5 p-3 rounded-2xl border text-center ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="space-y-1">
                <Sparkles className="w-4 h-4 mx-auto text-pink-500" />
                <span className="block text-[11px] font-bold">1-Tap Launch</span>
                <span className="block text-[9px] text-slate-400">Home Screen Icon</span>
              </div>
              <div className="space-y-1">
                <Zap className="w-4 h-4 mx-auto text-amber-500" />
                <span className="block text-[11px] font-bold">Full Screen</span>
                <span className="block text-[9px] text-slate-400">No Browser Bars</span>
              </div>
              <div className="space-y-1">
                <ShieldCheck className="w-4 h-4 mx-auto text-emerald-500" />
                <span className="block text-[11px] font-bold">Fast & Offline</span>
                <span className="block text-[9px] text-slate-400">Zero App Store</span>
              </div>
            </div>

            {/* Android / Desktop 1-Click Install Button */}
            {deferredPrompt && (
              <div className="space-y-2">
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-pink-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                  Install App Instantly (1-Click)
                </button>
                <p className="text-[11px] text-center text-slate-400">
                  Adds ProfilePilot directly to your application drawer / home screen.
                </p>
              </div>
            )}

            {/* iOS (iPhone / iPad) Step-by-Step Instructions */}
            {isIOS && (
              <div className={`p-4 rounded-2xl border space-y-3 ${
                isLightMode ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-950 border-amber-500/30 text-slate-200'
              }`}>
                <div className="flex items-center gap-2 text-amber-500 font-extrabold text-xs">
                  <AppleIcon className="w-4 h-4" />
                  <span>How to Install on iPhone / iPad (Safari):</span>
                </div>
                
                <ol className="space-y-2.5 text-xs font-medium">
                  <li className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 font-extrabold flex items-center justify-center text-[11px] shrink-0">
                      1
                    </span>
                    <span>Tap the <strong className="text-pink-500 inline-flex items-center gap-0.5"><Share className="w-3.5 h-3.5 inline" /> Share</strong> button in your Safari menu bar below.</span>
                  </li>

                  <li className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 font-extrabold flex items-center justify-center text-[11px] shrink-0">
                      2
                    </span>
                    <span>Scroll down and tap <strong className="text-amber-500 inline-flex items-center gap-0.5"><PlusSquare className="w-3.5 h-3.5 inline" /> Add to Home Screen</strong>.</span>
                  </li>

                  <li className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 font-extrabold flex items-center justify-center text-[11px] shrink-0">
                      3
                    </span>
                    <span>Tap <strong className="text-emerald-500">"Add"</strong> at top right. Open ProfilePilot from your iPhone home screen!</span>
                  </li>
                </ol>
              </div>
            )}

            {/* General Instructions if no prompt and not iOS */}
            {!deferredPrompt && !isIOS && (
              <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                isLightMode ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}>
                <p className="font-bold text-slate-200 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  Desktop / Browser App Installation:
                </p>
                <p>
                  Look for the <strong>Install</strong> icon (➕ or 📥) in your browser address bar at the top right, or open your browser menu (⋮) and select <strong>"Install ProfilePilot..."</strong>.
                </p>
              </div>
            )}

            <button
              onClick={onClose}
              className={`w-full py-2.5 font-semibold text-xs rounded-xl transition-colors cursor-pointer ${
                isLightMode ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              Maybe Later
            </button>

          </div>
        )}

      </div>
    </div>
  );
};

// SVG Apple Icon Helper Component
function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 170 170" fill="currentColor" {...props}>
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.33.13-9.13-1.9-14.39-6.1-3.48-2.82-7.42-7.58-11.83-14.28-6.53-9.92-11.69-20.9-15.48-32.94-3.79-12.04-5.69-23.77-5.69-35.19 0-15.01 3.57-27.56 10.7-37.66 7.14-10.1 16.31-15.22 27.52-15.35 4.8 0 10.02 1.15 15.66 3.46 5.64 2.31 9.61 3.51 11.91 3.6 2.08 0 6.22-1.32 12.43-3.95 6.21-2.63 11.45-3.88 15.72-3.75 10.01.52 18.23 4.22 24.66 11.1 2.21 2.37 4.13 4.9 5.76 7.59-10.63 6.43-15.82 15.28-15.58 26.54.24 10.51 4.54 19.26 12.9 26.24 3.96 3.29 8.35 5.77 13.17 7.43-1.03 5.42-2.83 11.29-5.4 17.62zM119.22 31.84c0-7.3 2.63-14.26 7.89-20.88 5.26-6.62 11.97-10.49 20.13-11.61.12.98.18 1.83.18 2.55 0 7.3-2.67 14.34-8.01 21.12-5.34 6.78-12.13 10.64-20.37 11.58-.06-.86-.18-1.78-.18-2.76z" />
    </svg>
  );
}
