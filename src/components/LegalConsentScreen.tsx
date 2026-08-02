import React, { useState } from 'react';
import { ShieldCheck, FileText, CheckCircle2, AlertTriangle, ExternalLink, LogOut, Lock } from 'lucide-react';
import { safeFetchJson } from '../utils/apiUtils';

interface LegalConsentScreenProps {
  onConsentAccepted: () => void;
  onSignOut: () => void;
  onViewDoc: (docType: 'terms' | 'privacy' | 'disclaimer' | 'refund') => void;
}

export const LegalConsentScreen: React.FC<LegalConsentScreenProps> = ({
  onConsentAccepted,
  onSignOut,
  onViewDoc,
}) => {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [aiUnderstood, setAiUnderstood] = useState(false);
  const [uploadRightConfirmed, setUploadRightConfirmed] = useState(false);
  const [noGuaranteeUnderstood, setNoGuaranteeUnderstood] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const allChecked =
    ageConfirmed &&
    termsAgreed &&
    aiUnderstood &&
    uploadRightConfirmed &&
    noGuaranteeUnderstood;

  const handleSubmit = async () => {
    if (!allChecked) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { ok, data } = await safeFetchJson('/api/auth/legal-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          termsVersion: '2026.1',
          privacyVersion: '2026.1',
          aiDisclaimerVersion: '2026.1',
          ageConfirmed: true,
        }),
      });

      if (ok && data.success) {
        localStorage.setItem('profilepilot_terms_accepted', 'true');
        onConsentAccepted();
      } else {
        setErrorMessage(data?.message || 'Failed to record legal consent on server.');
      }
    } catch (e: any) {
      console.error('Consent submit error:', e);
      setErrorMessage('Network error while saving legal consent.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 fixed inset-0 overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-8">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 p-6 text-white space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-pink-200">
              ProfilePilot Legal Consent
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Before you continue
          </h1>
          <p className="text-xs text-pink-100/90 leading-relaxed">
            Please confirm your agreement with ProfilePilot terms and policies below. Your consent will be securely recorded against your private account.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">

          {/* Quick Summary & Doc Links */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>Read Full Legal Terms</span>
              <span className="text-slate-400 font-normal">Opens without losing progress</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => onViewDoc('terms')}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-pink-400 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Terms of Service</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => onViewDoc('privacy')}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-pink-400 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Privacy Policy</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => onViewDoc('disclaimer')}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-pink-400 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>AI Disclaimer</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => onViewDoc('refund')}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-pink-400 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Refund Policy</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-2xl text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 5 REQUIRED NON-PRESELECTED CHECKBOXES */}
          <div className="space-y-3.5">
            
            {/* Checkbox 1 */}
            <label className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
              ageConfirmed ? 'bg-pink-950/20 border-pink-500/50 text-white' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}>
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 text-pink-500 focus:ring-pink-500 bg-slate-800 shrink-0"
              />
              <span className="text-xs leading-relaxed">
                I confirm that I am at least 18 years old.
              </span>
            </label>

            {/* Checkbox 2 */}
            <label className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
              termsAgreed ? 'bg-pink-950/20 border-pink-500/50 text-white' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}>
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 text-pink-500 focus:ring-pink-500 bg-slate-800 shrink-0"
              />
              <span className="text-xs leading-relaxed">
                I have read and agree to the Terms of Service and Privacy Policy.
              </span>
            </label>

            {/* Checkbox 3 */}
            <label className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
              aiUnderstood ? 'bg-pink-950/20 border-pink-500/50 text-white' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}>
              <input
                type="checkbox"
                checked={aiUnderstood}
                onChange={(e) => setAiUnderstood(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 text-pink-500 focus:ring-pink-500 bg-slate-800 shrink-0"
              />
              <span className="text-xs leading-relaxed">
                I understand that ProfilePilot uses AI and that generated content or recommendations may be imperfect.
              </span>
            </label>

            {/* Checkbox 4 */}
            <label className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
              uploadRightConfirmed ? 'bg-pink-950/20 border-pink-500/50 text-white' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}>
              <input
                type="checkbox"
                checked={uploadRightConfirmed}
                onChange={(e) => setUploadRightConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 text-pink-500 focus:ring-pink-500 bg-slate-800 shrink-0"
              />
              <span className="text-xs leading-relaxed">
                I confirm that I have the right to upload the photographs, screenshots and information I submit.
              </span>
            </label>

            {/* Checkbox 5 */}
            <label className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
              noGuaranteeUnderstood ? 'bg-pink-950/20 border-pink-500/50 text-white' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}>
              <input
                type="checkbox"
                checked={noGuaranteeUnderstood}
                onChange={(e) => setNoGuaranteeUnderstood(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 text-pink-500 focus:ring-pink-500 bg-slate-800 shrink-0"
              />
              <span className="text-xs leading-relaxed">
                I understand that ProfilePilot does not guarantee matches, replies, dates or relationship outcomes.
              </span>
            </label>

          </div>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onSignOut}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Cancel and Sign Out</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!allChecked || isSubmitting}
              className={`w-full sm:w-auto px-8 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                allChecked && !isSubmitting
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/25 hover:scale-[1.02]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Consent...' : 'Accept and Continue'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
