import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { ShieldCheck, CheckCircle2, AlertTriangle, Lock, FileText, X, ArrowLeft } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  user: UserProfile;
  onClose: () => void;
  onAcceptTerms: () => Promise<void>;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  user,
  onClose,
  onAcceptTerms,
}) => {
  const [agreedRefund, setAgreedRefund] = useState(user.hasAcceptedTerms);
  const [agreedLiability, setAgreedLiability] = useState(user.hasAcceptedTerms);
  const [agreedOwnership, setAgreedOwnership] = useState(user.hasAcceptedTerms);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keyboard Escape & Body Scroll Lock
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allChecked = agreedRefund && agreedLiability && agreedOwnership;

  const handleSignAgreement = async () => {
    if (!allChecked) return;
    setIsSubmitting(true);
    try {
      await onAcceptTerms();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Top Gradient Banner */}
        <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 p-6 text-white relative">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onClose}
              aria-label="Back to main app"
              className="px-3 py-1 rounded-xl bg-black/20 hover:bg-black/40 text-white/90 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Close legal modal"
              className="p-1.5 rounded-xl bg-black/20 hover:bg-black/40 text-white/90 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-widest text-pink-200 uppercase">
                Mandatory Legal Disclaimer
              </span>
              <h2 id="legal-modal-title" className="text-2xl font-black text-white tracking-tight">
                Profilepilot User Terms
              </h2>
            </div>
          </div>
          <p className="mt-2 text-xs text-pink-100/90 leading-relaxed">
            Before accessing the AI Dating Coach and visual icebreaker studio, please verify compliance with our strict platform rules.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">

          {/* Alert Notice */}
          <div className="flex items-start gap-3 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs leading-snug">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <strong className="font-bold">Required Compliance Notice:</strong> By proceeding, your Firestore profile will be updated with a verified terms acceptance flag and connected to your ProfilePilot account.
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-3.5">
            {/* Item 1: Strict No-Refund Policy */}
            <label className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
              agreedRefund ? 'bg-pink-950/20 border-pink-500/50 text-white' : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}>
              <input
                type="checkbox"
                checked={agreedRefund}
                onChange={(e) => setAgreedRefund(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-700 text-pink-500 focus:ring-pink-500 bg-slate-800"
              />
              <div className="text-xs">
                <span className="font-bold text-pink-400 block mb-0.5">
                  1. Strict No-Refund Policy for Credit Purchases
                </span>
                <p className="text-slate-400 leading-normal">
                  I understand and agree that all credit pack purchases (via Stripe or app) are strictly non-refundable once acquired or processed.
                </p>
              </div>
            </label>

            {/* Item 2: Outcome Liability Disclaimer */}
            <label className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
              agreedLiability ? 'bg-pink-950/20 border-pink-500/50 text-white' : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}>
              <input
                type="checkbox"
                checked={agreedLiability}
                onChange={(e) => setAgreedLiability(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-700 text-pink-500 focus:ring-pink-500 bg-slate-800"
              />
              <div className="text-xs">
                <span className="font-bold text-pink-400 block mb-0.5">
                  2. AI Assistant & Outcome Liability Disclaimer
                </span>
                <p className="text-slate-400 leading-normal">
                  Profilepilot is an AI-powered dating coach and entertainer. I acknowledge that Profilepilot is not liable for real-world dating outcomes, ghosting, or interpersonal communication results.
                </p>
              </div>
            </label>

            {/* Item 3: Legal Screenshot & Face Rights */}
            <label className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
              agreedOwnership ? 'bg-pink-950/20 border-pink-500/50 text-white' : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}>
              <input
                type="checkbox"
                checked={agreedOwnership}
                onChange={(e) => setAgreedOwnership(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-700 text-pink-500 focus:ring-pink-500 bg-slate-800"
              />
              <div className="text-xs">
                <span className="font-bold text-pink-400 block mb-0.5">
                  3. Legal Media Ownership & Privacy Right Certification
                </span>
                <p className="text-slate-400 leading-normal">
                  I certify that I am only uploading my own legal screenshot history, chat transcripts, and images for which I hold rights or consent to process.
                </p>
              </div>
            </label>
          </div>

          {/* Action Footer Button */}
          <div className="pt-2">
            <button
              onClick={handleSignAgreement}
              disabled={!allChecked || isSubmitting}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                allChecked
                  ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white hover:opacity-95 shadow-pink-500/25 active:scale-[0.99]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              }`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  {user.hasAcceptedTerms
                    ? 'Terms Verified & Confirmed'
                    : 'I Agree & Accept Terms & Guidelines'}
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-slate-500 mt-2">
              Encrypted connection • Verified profile signature • Firestore sync
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
