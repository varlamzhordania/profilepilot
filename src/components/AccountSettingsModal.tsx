import React, { useState } from 'react';
import { X, ShieldCheck, Mail, KeyRound, AlertCircle, CheckCircle2, Lock, ArrowLeft, Send, Trash2, Link, RefreshCw } from 'lucide-react';
import { User } from '../lib/firebase';
import {
  linkGoogleAccount,
  linkEmailAndPasswordAccount,
  changeUserPassword,
  unlinkSignInMethod,
  sendUserEmailVerification,
  checkEmailVerifiedStatus,
} from '../lib/firebase';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  firebaseUser: User | null;
  isLightMode?: boolean;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  firebaseUser,
  isLightMode = false,
}) => {
  const [showAddEmailForm, setShowAddEmailForm] = useState<boolean>(false);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !firebaseUser) return null;

  const providerIds = firebaseUser.providerData.map((p) => p.providerId);
  const isGoogleConnected = providerIds.includes('google.com');
  const isEmailConnected = providerIds.includes('password');
  const totalProviders = firebaseUser.providerData.length;

  const googleProviderInfo = firebaseUser.providerData.find((p) => p.providerId === 'google.com');
  const emailProviderInfo = firebaseUser.providerData.find((p) => p.providerId === 'password');

  const handleConnectGoogle = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await linkGoogleAccount();
      setSuccessMessage('Google account connected. You can now use Google to sign in to this ProfilePilot account.');
    } catch (err: any) {
      console.error('Link Google error:', err);
      let message = err?.message || 'Failed to connect Google account.';
      if (err?.code === 'auth/credential-already-in-use' || err?.code === 'auth/email-already-in-use') {
        message = 'This Google account is already connected to another ProfilePilot account. Sign in using that Google account or contact ProfilePilot Support.';
      }
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (passwordInput !== confirmPasswordInput) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      setIsLoading(false);
      return;
    }

    try {
      await linkEmailAndPasswordAccount(emailInput || firebaseUser.email || '', passwordInput);
      setSuccessMessage('Email login connected. You can now use this email and password to access the same ProfilePilot account, credits and saved results.');
      setShowAddEmailForm(false);
      setPasswordInput('');
      setConfirmPasswordInput('');
    } catch (err: any) {
      console.error('Link Email error:', err);
      let message = err?.message || 'Failed to connect email and password login.';
      if (err?.code === 'auth/credential-already-in-use' || err?.code === 'auth/email-already-in-use') {
        message = 'An account already exists with this email address. If you own both, sign in using that method or contact ProfilePilot Support.';
      }
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await changeUserPassword(newPasswordInput);
      setSuccessMessage('Password changed successfully.');
      setShowChangePasswordForm(false);
      setNewPasswordInput('');
    } catch (err: any) {
      console.error('Change password error:', err);
      let message = err?.message || 'Failed to update password.';
      if (err?.code === 'auth/requires-recent-login') {
        message = 'Changing password requires a recent login. Please log out and sign back in before changing your password.';
      }
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlinkProvider = async (providerId: string, providerName: string) => {
    if (totalProviders <= 1) {
      setErrorMessage('You cannot remove your only sign-in method. Connect another method first.');
      return;
    }

    if (!confirm(`Are you sure you want to remove your ${providerName} sign-in method?`)) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await unlinkSignInMethod(providerId);
      setSuccessMessage(`${providerName} sign-in method removed.`);
    } catch (err: any) {
      console.error('Unlink error:', err);
      setErrorMessage(err?.message || `Failed to remove ${providerName} sign-in method.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await sendUserEmailVerification();
      setSuccessMessage(`Verification email sent to ${firebaseUser.email}. Please check your inbox.`);
    } catch (err: any) {
      console.error('Resend verification error:', err);
      setErrorMessage(err?.message || 'Failed to send verification email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const isVerified = await checkEmailVerifiedStatus();
      if (isVerified) {
        setSuccessMessage('Your email address is verified!');
      } else {
        setErrorMessage('Email is not verified yet. Please click the link sent to your email inbox.');
      }
    } catch (err: any) {
      console.error('Check verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-settings-title"
    >
      <div
        className={`relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all my-8 ${
          isLightMode
            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50'
            : 'bg-slate-900 border-slate-800 text-white shadow-purple-950/20'
        }`}
      >
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white/90 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white/90 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 id="account-settings-title" className="text-xl font-black tracking-tight">
                Account Settings & Security
              </h2>
              <p className="text-xs text-purple-100 font-medium">
                Manage your login methods, verification, and password
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Notifications */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* User Account Details Summary */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">Account Email:</span>
              <span className="font-bold text-slate-900 dark:text-white">{firebaseUser.email || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">Firebase UID:</span>
              <span className="font-mono text-[11px] text-slate-400">{firebaseUser.uid}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 font-semibold">Email Verification:</span>
              {firebaseUser.emailVerified || isGoogleConnected ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 font-bold">Unverified</span>
                  <button
                    onClick={handleResendVerification}
                    disabled={isLoading}
                    className="text-[10px] text-rose-500 hover:underline font-bold"
                  >
                    Resend Link
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SIGN IN METHODS LIST */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Connected Sign-In Methods
            </h3>

            {/* 1. GOOGLE */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Google Account</span>
                    {isGoogleConnected ? (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                        Connected
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                        Not Connected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isGoogleConnected
                      ? googleProviderInfo?.email || 'Connected'
                      : 'Connect your Google account for one-click access.'}
                  </p>
                </div>
              </div>

              {isGoogleConnected ? (
                <button
                  onClick={() => handleUnlinkProvider('google.com', 'Google')}
                  disabled={isLoading || totalProviders <= 1}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-semibold text-xs hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  title={totalProviders <= 1 ? 'You cannot remove your only sign-in method.' : 'Remove Google sign-in'}
                >
                  Remove Google
                </button>
              ) : (
                <button
                  onClick={handleConnectGoogle}
                  disabled={isLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <Link className="w-3.5 h-3.5" />
                  <span>Connect Google</span>
                </button>
              )}
            </div>

            {/* 2. EMAIL AND PASSWORD */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 text-purple-500 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Email & Password</span>
                      {isEmailConnected ? (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                          Connected
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                          Not Connected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isEmailConnected
                        ? emailProviderInfo?.email || firebaseUser.email || 'Connected'
                        : 'Add email & password authentication to this account.'}
                    </p>
                  </div>
                </div>

                {isEmailConnected ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setShowChangePasswordForm(!showChangePasswordForm)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      Change Password
                    </button>
                    <button
                      onClick={() => handleUnlinkProvider('password', 'Email & Password')}
                      disabled={isLoading || totalProviders <= 1}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-semibold text-xs hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      title={totalProviders <= 1 ? 'You cannot remove your only sign-in method.' : 'Remove email login'}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddEmailForm(!showAddEmailForm)}
                    disabled={isLoading}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Add Email Login</span>
                  </button>
                )}
              </div>

              {/* INLINE ADD EMAIL LOGIN FORM */}
              {showAddEmailForm && !isEmailConnected && (
                <form onSubmit={handleAddEmailSubmit} className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Connect Email & Password Login
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={emailInput || firebaseUser.email || ''}
                      onChange={(e) => setEmailInput(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Password</label>
                      <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddEmailForm(false)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? 'Connecting...' : 'Connect Email Login'}
                    </button>
                  </div>
                </form>
              )}

              {/* INLINE CHANGE PASSWORD FORM */}
              {showChangePasswordForm && isEmailConnected && (
                <form onSubmit={handleChangePasswordSubmit} className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Change Account Password
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="Enter new password (min 6 characters)"
                      required
                      minLength={6}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowChangePasswordForm(false)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? 'Updating...' : 'Save New Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* UID & Security Notice */}
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <div className="font-bold text-slate-700 dark:text-slate-300 mb-0.5">Permanent Account Binding</div>
            Both connected sign-in methods point to the same Firebase Authentication UID ({firebaseUser.uid.slice(0, 8)}...). Your credits, purchases, and saved recommendations remain unified across both methods.
          </div>
        </div>
      </div>
    </div>
  );
};
