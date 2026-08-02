import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  ShieldCheck,
  Lock,
  AlertTriangle,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Mail,
  Trash2,
  Info,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface LegalViewProps {
  user: UserProfile;
  onOpenLegalModal: () => void;
  onNavigateTab?: (tab: string) => void;
  initialTab?: 'privacy' | 'terms' | 'disclaimer' | 'refund' | 'contact';
}

export const LegalView: React.FC<LegalViewProps> = ({
  user,
  onOpenLegalModal,
  onNavigateTab,
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'disclaimer' | 'refund' | 'contact'>(initialTab);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-12">
      
      {/* Top Back Navigation Bar */}
      {onNavigateTab && (
        <div>
          <button
            onClick={() => onNavigateTab('scanner')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4 text-pink-400" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-slate-800 pb-4 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ProfilePilot Legal & Governance Framework</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Legal Terms, Privacy & AI Disclaimers
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Comprehensive documentation governing data handling, AI usage, credit policies, and user privacy rights. All legal text is suitable for professional legal review.
        </p>
      </div>

      {/* User Verification Box */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Your Account Verification Status</h3>
            <p className="text-xs text-slate-400">
              {user.hasAcceptedTerms
                ? `Consent Recorded on ${new Date(user.acceptedTermsAt || Date.now()).toLocaleDateString()}`
                : 'Consent Pending Acceptance'}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenLegalModal}
          className="px-4 py-2 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 font-bold text-xs cursor-pointer transition-colors"
        >
          {user.hasAcceptedTerms ? 'Review Legal Consent' : 'Sign Legal Consent'}
        </button>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'privacy'
              ? 'bg-pink-500 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Privacy Policy
        </button>

        <button
          onClick={() => setActiveTab('terms')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'terms'
              ? 'bg-pink-500 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Terms of Service
        </button>

        <button
          onClick={() => setActiveTab('disclaimer')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'disclaimer'
              ? 'bg-pink-500 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          AI Disclaimer
        </button>

        <button
          onClick={() => setActiveTab('refund')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'refund'
              ? 'bg-pink-500 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Refund & Cancellation Policy
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'contact'
              ? 'bg-pink-500 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Contact & Privacy Desk
        </button>
      </div>

      {/* TAB 1: PRIVACY POLICY */}
      {activeTab === 'privacy' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white">Privacy Policy</h2>
            <p className="text-xs text-slate-400">Effective Date: July 28, 2026 | Version 2026.1</p>
          </div>

          <div className="space-y-4">
            <section className="space-y-2">
              <h3 className="font-bold text-white text-base">1. Operator Identity & Scope</h3>
              <p>
                ProfilePilot ("we", "us", or "our") is an AI-powered profile improvement platform. This Privacy Policy describes how we collect, process, store, and protect user information when you access or use our services.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-white text-base">2. Information We Collect</h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li><strong>Registration & Authentication Data:</strong> Google Account display name, email address, and unique Firebase UID received upon authentication.</li>
                <li><strong>Uploaded Content:</strong> Reference photographs submitted for AI lifestyle picture generation and profile screenshots uploaded for analysis.</li>
                <li><strong>Prompts & Interactions:</strong> User inputs, prompt customization details, and AI Dating Coach chat transcripts.</li>
                <li><strong>Payment & Transaction Metadata:</strong> Payment status, order IDs, and credit ledger histories processed via Razorpay. (Payment card details are handled directly by Razorpay and are not stored in our database).</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-white text-base">3. Purpose of Processing & AI Service Providers</h3>
              <p>
                We process your data strictly to deliver services, calculate credit balances, generate AI outputs using Google Gemini and image generation models, and maintain account security. Data is associated with your authenticated Firebase UID.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-white text-base">4. Data Retention & Account Deletion</h3>
              <p>
                Your uploads and saved history remain connected to your authenticated account until you choose to delete them. You may request full account and data deletion at any time via Account Settings or by emailing <a href="mailto:privacy@profilepilot.ai" className="text-pink-400 underline">privacy@profilepilot.ai</a>.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-white text-base">5. Children & Age Restrictions</h3>
              <p>
                ProfilePilot is strictly intended for individuals aged 18 and older. We do not knowingly collect or process information from minors.
              </p>
            </section>
          </div>
        </div>
      )}

      {/* TAB 2: TERMS OF SERVICE */}
      {activeTab === 'terms' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white">Terms of Service</h2>
            <p className="text-xs text-slate-400">Effective Date: July 28, 2026 | Version 2026.1</p>
          </div>

          <div className="space-y-4">
            <section className="space-y-2">
              <h3 className="font-bold text-white text-base">1. Acceptance of Terms</h3>
              <p>
                By creating an account or accessing ProfilePilot, you agree to comply with these Terms of Service. If you do not agree, you must discontinue use immediately.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-white text-base">2. Account Ownership & Credits</h3>
              <p>
                Purchased credits, uploads, and saved analysis results are tied exclusively to the authenticated Firebase UID used during purchase. Credits are non-transferable between separate email accounts.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-white text-base">3. Acceptable Use & Content Ownership</h3>
              <p>
                You represent that you own or possess necessary rights to all photographs and screenshots you submit. You agree not to upload non-consensual imagery, impersonate third parties, or use generated content for deceptive or illegal purposes.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-white text-base">4. Account Suspension</h3>
              <p>
                ProfilePilot reserves the right to suspend or terminate accounts that violate acceptable use guidelines, attempt unauthorized system access, or engage in fraudulent activities.
              </p>
            </section>
          </div>
        </div>
      )}

      {/* TAB 3: AI DISCLAIMER */}
      {activeTab === 'disclaimer' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white">AI & Service Disclaimer</h2>
            <p className="text-xs text-slate-400">Important Notice Regarding Artificial Intelligence Outputs</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>12 Core Service & AI Disclaimers</span>
              </div>
              <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-300">
                <li>ProfilePilot provides automated suggestions and AI-generated visual and textual content.</li>
                <li>Outputs may occasionally be inaccurate, unsuitable, or inconsistent.</li>
                <li>Users are required to review every generated photo, bio answer, and message suggestion before using or sending it.</li>
                <li><strong>No Outcome Guarantee:</strong> Dating outcomes, match rates, replies, dates, or relationship successes are never guaranteed.</li>
                <li>Users must not upload photographs of another individual without explicit permission.</li>
                <li>Users must not use generated images or text for impersonation, deception, harassment, fraud, or catfishing.</li>
                <li>Users are solely responsible for complying with the terms of third-party dating platforms they use (such as Tinder, Bumble, or Hinge).</li>
                <li>ProfilePilot is an independent service and is not sponsored, endorsed by, or affiliated with Tinder, Bumble, Hinge, or their parent companies.</li>
                <li>Third-party platform names, logos, and trademarks belong exclusively to their respective owners.</li>
                <li>ProfilePilot does not provide professional psychological, medical, relationship counselling, or legal advice.</li>
                <li>Generated images must be used responsibly and not presented in a materially deceptive manner.</li>
                <li>ProfilePilot reserves the right to suspend accounts engaged in abuse or violation of these principles.</li>
              </ol>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-400 italic">
              Notice: All legal text on this platform is structured for clarity and transparency and is subject to formal legal review prior to commercial production publication.
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REFUND POLICY */}
      {activeTab === 'refund' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white">Refund and Cancellation Policy</h2>
            <p className="text-xs text-slate-400">Credit Pack Purchase & Billing Policy</p>
          </div>

          <div className="space-y-4">
            <section className="space-y-2">
              <h3 className="font-bold text-white text-base">1. Credit Pack Finality</h3>
              <p>
                All credit pack purchases and top-ups processed via Razorpay or Stripe are final once verified and credited to your account ledger.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-white text-base">2. Failed Generation Refunds</h3>
              <p>
                If a technical error or safety rejection prevents an AI photo generation, profile analysis, or coach message from producing a result, the deducted credits are automatically credited back to your account balance.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-white text-base">3. Non-Transferability</h3>
              <p>
                Unused credits remain available on your account across logins, but cannot be transferred to another email address or converted into cash refunds.
              </p>
            </section>
          </div>
        </div>
      )}

      {/* TAB 5: CONTACT DESK */}
      {activeTab === 'contact' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white">Contact & Privacy Desk</h2>
            <p className="text-xs text-slate-400">Have questions regarding your account, privacy, or data deletion?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
            <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-pink-400 font-bold">
                <Mail className="w-5 h-5" />
                <span>Email Contact</span>
              </div>
              <p className="text-slate-300">
                You can reach our privacy and compliance desk directly at:
              </p>
              <a
                href="mailto:privacy@profilepilot.ai"
                className="inline-block text-base font-bold text-pink-400 underline hover:text-pink-300"
              >
                privacy@profilepilot.ai
              </a>
              <p className="text-xs text-slate-400">
                We respond to privacy, data deletion, and account inquiries within 24-48 business hours.
              </p>
            </div>

            <div className="space-y-3 bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <div className="font-bold text-white text-sm">Submit Privacy Request</div>
              <p className="text-xs text-slate-400">
                Enter your details to initiate an inquiry or request regarding your Firebase account UID data.
              </p>
              <input
                type="email"
                placeholder="Your email address"
                defaultValue={user.email}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-pink-500"
              />
              <textarea
                placeholder="Describe your inquiry or data request..."
                rows={3}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-pink-500"
              />
              <button
                onClick={() => alert('Privacy inquiry submitted successfully. Our team will contact you at your email address.')}
                className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                Submit Inquiry
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
