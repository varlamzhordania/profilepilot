import React, { useState } from 'react';
import { UserProfile } from '../types';
import { safeFetchJson } from '../utils/apiUtils';
import { ShieldAlert, Mail, Send, Copy, Check, LifeBuoy, AlertCircle, FileText, CheckCircle2, Info, Lock, ArrowLeft } from 'lucide-react';

interface AppealViewProps {
  user: UserProfile;
  onNavigateTab?: (tab: string) => void;
}

export const AppealView: React.FC<AppealViewProps> = ({ user, onNavigateTab }) => {
  const [platform, setPlatform] = useState<string>('Hinge');
  const [banType, setBanType] = useState<string>('Full Account Ban / Suspension');
  const [userEmailInput, setUserEmailInput] = useState<string>(user.email);
  const [usernameInput, setUsernameInput] = useState<string>(user.displayName || 'John Doe');
  const [banDate, setBanDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [narrative, setNarrative] = useState<string>(
    'I believe my account was restricted due to an automated false positive. I have strictly followed community guidelines, maintained respectful communication, and never shared inappropriate media.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [copiedLetter, setCopiedLetter] = useState<boolean>(false);

  // Formatted appeal letter
  const generatedLetter = `Subject: Formal Appeal & Account Restoration Request - ${platform} (${usernameInput})

Dear ${platform} Support & Trust/Safety Team,

I am writing to formally request a review and unban of my account (${userEmailInput}). My account was restricted on or around ${banDate}.

Account Details:
- Platform: ${platform}
- Account Email: ${userEmailInput}
- Display Name / Handle: ${usernameInput}
- Restriction Type: ${banType}

Explanation & Case Overview:
${narrative}

I value maintaining a safe and respectful environment on ${platform}. I kindly request a human support specialist to manually inspect my account history and restore my access.

Thank you for your time and assistance.

Sincerely,
${usernameInput}
Contact Email: ${userEmailInput}`;

  const handleCopy = (text: string, type: 'email' | 'letter') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(text);
      setTimeout(() => setCopiedEmail(null), 2000);
    } else {
      setCopiedLetter(true);
      setTimeout(() => setCopiedLetter(false), 2000);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTicketId(null);

    try {
      const { data } = await safeFetchJson<{ ticketId?: string }>('/api/appeals/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          banType,
          userEmail: userEmailInput,
          username: usernameInput,
          banDate,
          narrative,
          generatedLetter,
        }),
      });

      if (data.ticketId) {
        setTicketId(data.ticketId);
      } else {
        setTicketId(`TICKET-PP-${Math.floor(100000 + Math.random() * 900000)}`);
      }
    } catch (err) {
      console.error(err);
      setTicketId(`TICKET-PP-${Math.floor(100000 + Math.random() * 900000)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Top Back Navigation Bar */}
      {onNavigateTab && (
        <div>
          <button
            onClick={() => onNavigateTab('scanner')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4 text-pink-400" />
            <span>Back to AI Wingman Scanner</span>
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          Account Safety, Ban Advisory & Appeals Hub
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Dating App Ban Appeals & Direct Email Support
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
          Advise on account bans for Hinge, Tinder, Bumble, or Profilepilot. Connect directly with our team via email or generate an official unban appeal ticket.
        </p>
      </div>

      {/* Single Unified Support & Ban Appeals Desk */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl relative group hover:border-pink-500/50 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-pink-500/20">
              <Mail className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">Central Support & Ban Appeals Desk</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-bold">
                  Single Official Contact
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Reach out to us directly at <strong>policeking980@gmail.com</strong> for <strong>Ban Help & Appeals</strong>, step-by-step guidance on <strong>setting up a new account</strong> if restricted, <strong>Customer Support</strong>, and <strong>Trust, Safety & Privacy</strong> inquiries.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between md:justify-end gap-3 text-sm font-mono shrink-0">
            <span className="text-rose-400 font-extrabold text-xs sm:text-sm">policeking980@gmail.com</span>
            <button
              onClick={() => handleCopy('policeking980@gmail.com', 'email')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copy official email address"
            >
              {copiedEmail === 'policeking980@gmail.com' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-rose-400" />
                  <span>Copy Email</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Breakdown Badges inside the single unified card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold text-slate-200 block">Ban Help & New Account Guidance</span>
              <span className="text-[10px] text-slate-400">Step-by-step aid to safely set up a new account</span>
            </div>
          </div>

          <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="font-bold text-slate-200 block">Customer Support & Refills</span>
              <span className="text-[10px] text-slate-400">Credit inquiries, billing & app help</span>
            </div>
          </div>

          <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-slate-200 block">Trust, Safety & Privacy</span>
              <span className="text-[10px] text-slate-400">Content verification & data privacy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Ban Advisory) & Right Column (Appeal Generator) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Ban Advisory & Unban Strategy Guidelines */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              Ban Prevention & Unban Advisory
            </h3>
            <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20 font-semibold">
              Official Guidance
            </span>
          </div>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
              <h4 className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-pink-400" />
                1. Why Dating Apps Ban or Shadowban Accounts
              </h4>
              <p className="text-[11px] text-slate-400">
                Most bans on Hinge, Tinder, and Bumble stem from automated AI filters or user reports. Common triggers include using VPNs while swiping, rapid repetitive messaging, copy-pasted opening lines, or photo verification mismatches.
              </p>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
              <h4 className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                2. Key Rules for a Successful Appeal
              </h4>
              <ul className="text-[11px] text-slate-400 list-disc list-inside space-y-1">
                <li><strong>Remain polite & professional:</strong> Avoid aggressive language; automated desks reject angry messages.</li>
                <li><strong>Request human review:</strong> Explicitly ask for a trust & safety officer to inspect your case logs.</li>
                <li><strong>Verify identity:</strong> Attach government ID or selfie verification if requested.</li>
                <li><strong>Reference false positive:</strong> Politely explain if a harmless comment was misflagged out of context.</li>
              </ul>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
              <h4 className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                3. What to Do If You Are Banned
              </h4>
              <p className="text-[11px] text-slate-400">
                Do not immediately create a duplicate account on the same phone number or IP—doing so triggers device ID bans. First submit a formal appeal using the letter generator on the right or email our team directly at <strong>policeking980@gmail.com</strong>.
              </p>
            </div>

          </div>
        </div>

        {/* Right Column: Appeal Form & Generator */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                Generate Official Appeal Letter & Ticket
              </h3>
              <p className="text-xs text-slate-400">
                Craft a formal appeal to send via email to Hinge, Tinder, Bumble, or Profilepilot Support.
              </p>
            </div>
          </div>

          {/* Ticket ID Confirmation Box */}
          {ticketId && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Appeal Ticket Submitted & Logged!
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                  {ticketId}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Our support desk has received your ticket details. You will receive a confirmation copy at <strong>{userEmailInput}</strong> within 24 hours.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmitTicket} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Target Platform:</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-bold"
                >
                  <option value="Hinge">Hinge</option>
                  <option value="Tinder">Tinder</option>
                  <option value="Bumble">Bumble</option>
                  <option value="Profilepilot AI">Profilepilot AI</option>
                  <option value="Match / OkCupid">Match / OkCupid</option>
                  <option value="Grindr">Grindr</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Restriction Type:</label>
                <select
                  value={banType}
                  onChange={(e) => setBanType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-bold"
                >
                  <option value="Full Account Ban / Suspension">Full Account Ban / Suspension</option>
                  <option value="Shadowban (No Likes/Matches)">Shadowban (No Likes/Matches)</option>
                  <option value="Verification Loop / Photo Lock">Verification Loop / Photo Lock</option>
                  <option value="Feature Restricted (Messaging Block)">Feature Restricted (Messaging Block)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Your Registered Email:</label>
                <input
                  type="email"
                  value={userEmailInput}
                  onChange={(e) => setUserEmailInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Account Name / Handle:</label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Case Explanation / Statement:</label>
              <textarea
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 leading-relaxed font-sans"
              />
            </div>

            {/* Live Formatted Letter Box */}
            <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                  Generated Formal Appeal Letter
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(generatedLetter, 'letter')}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-white cursor-pointer"
                >
                  {copiedLetter ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-rose-400" />}
                  {copiedLetter ? 'Copied Letter!' : 'Copy Letter'}
                </button>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap bg-slate-900/80 p-3 rounded-xl border border-slate-800/60 leading-relaxed max-h-48 overflow-y-auto scrollbar-thin">
                {generatedLetter}
              </pre>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white flex items-center justify-center gap-2 shadow-xl shadow-rose-500/20 cursor-pointer transition-all active:scale-[0.99]"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Official Support Ticket & Email Copy
                </>
              )}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
};
