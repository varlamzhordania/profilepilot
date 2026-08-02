import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, ArrowLeft, Sparkles, Mail, KeyRound, Eye, EyeOff, Send, CheckCircle2, RefreshCw, UserPlus, LogIn } from 'lucide-react';
import {
  signInWithGoogle,
  registerWithEmailAndPassword,
  signInWithDirectEmailAndPassword,
  resetPassword,
  sendUserEmailVerification,
  checkEmailVerifiedStatus,
  logoutUser,
  auth,
} from '../lib/firebase';

interface SignInPageProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onSuccess, onCancel }) => {
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [isResetMode, setIsResetMode] = useState<boolean>(false);
  const [isVerificationMode, setIsVerificationMode] = useState<boolean>(false);
  const [pendingUserEmail, setPendingUserEmail] = useState<string>('');

  const [emailInput, setEmailInput] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [providerConflict, setProviderConflict] = useState<boolean>(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setProviderConflict(false);
    try {
      const user = await signInWithGoogle();
      if (user) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      let message = err?.message || 'Google sign-in failed. Please try again.';
      if (err?.code === 'auth/account-exists-with-different-credential') {
        setProviderConflict(true);
        message = 'An account already exists with this email address. Sign in using Email/Password, then add Google from Account Settings if you would like to use both methods.';
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setProviderConflict(false);

    if (!displayName.trim()) {
      setError('Please enter your Full Name.');
      return;
    }

    if (!validateEmail(emailInput)) {
      setError('Please enter a valid Email Address (e.g. name@example.com).');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your passwords.');
      return;
    }

    setIsLoading(true);

    try {
      const user = await registerWithEmailAndPassword(emailInput, password, displayName);
      setPendingUserEmail(user.email || emailInput);
      setIsVerificationMode(true);
      setSuccessMessage('Account created successfully! We sent a verification link to your email.');
    } catch (err: any) {
      console.error('Registration Error:', err);
      let message = err?.message || 'Failed to create account. Please try again.';
      if (err?.code === 'auth/email-already-in-use') {
        setProviderConflict(true);
        message = 'An account already exists with this email address. Please click "Sign In" below to access your account.';
      } else if (err?.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters long.';
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setProviderConflict(false);

    if (!validateEmail(emailInput)) {
      setError('Please enter a valid Email Address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const user = await signInWithDirectEmailAndPassword(emailInput, password);
      if (!user.emailVerified) {
        setPendingUserEmail(user.email || emailInput);
        setIsVerificationMode(true);
        setSuccessMessage('Please verify your email address to complete sign in.');
      } else {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      let message = err?.message || 'Authentication failed. Please check your credentials.';
      if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential' || err?.code === 'auth/user-not-found') {
        message = 'Invalid Email Address or Password. Please check your details or click Forgot Password.';
      } else if (err?.code === 'auth/too-many-requests') {
        message = 'Too many failed login attempts. Please reset your password or try again later.';
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!validateEmail(emailInput)) {
      setError('Please enter a valid Email Address to receive the password reset link.');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(emailInput);
      setSuccessMessage('If an account exists for this email address, password-reset instructions have been sent.');
    } catch (err: any) {
      console.error('Password Reset Error:', err);
      setSuccessMessage('If an account exists for this email address, password-reset instructions have been sent.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmailCheck = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const isVerified = await checkEmailVerifiedStatus();
      if (isVerified) {
        setSuccessMessage('Email verified successfully!');
        setTimeout(() => {
          onSuccess();
        }, 800);
      } else {
        setError('Email is not verified yet. Please check your inbox and click the verification link.');
      }
    } catch (err: any) {
      console.error('Email Verification Check error:', err);
      setError('Could not check verification status. Please try clicking the link again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await sendUserEmailVerification();
      setSuccessMessage(`A new verification link has been sent to ${pendingUserEmail || 'your email'}.`);
    } catch (err: any) {
      console.error('Resend email error:', err);
      setError(err?.message || 'Failed to send verification link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
        
        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-6 left-6 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        )}

        <div className="text-center space-y-3 pt-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 p-0.5 mx-auto shadow-lg shadow-pink-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-pink-400">
              <Sparkles className="w-7 h-7" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">
            Sign in to ProfilePilot
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xs mx-auto">
            Access your credits, purchases, uploads and saved recommendations from the same ProfilePilot account.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/80 border border-rose-800 rounded-2xl text-rose-300 text-xs flex flex-col gap-2">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
            {providerConflict && (
              <div className="pt-1 flex gap-2">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="px-3 py-1 rounded-xl bg-white text-slate-900 font-bold text-xs shadow hover:bg-slate-100 cursor-pointer"
                >
                  Continue with Google
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(false);
                    setError(null);
                    setProviderConflict(false);
                  }}
                  className="px-3 py-1 rounded-xl border border-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-800"
                >
                  Return to Sign In
                </button>
              </div>
            )}
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* EMAIL VERIFICATION MODE */}
        {isVerificationMode ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <Mail className="w-8 h-8 text-rose-500 mx-auto" />
              <h3 className="font-bold text-white text-sm">Verify your email</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                We sent a verification link to:<br />
                <strong className="text-pink-400">{pendingUserEmail || auth.currentUser?.email}</strong><br />
                Open the verification link and return to ProfilePilot to continue.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleVerifyEmailCheck}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Checking status...' : 'I Have Verified My Email'}
              </button>

              <button
                onClick={handleResendVerificationEmail}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resend Verification Email</span>
              </button>

              <button
                onClick={async () => {
                  await logoutUser();
                  setIsVerificationMode(false);
                  setIsRegisterMode(false);
                }}
                className="w-full py-2 text-center text-xs font-semibold text-rose-400 hover:underline cursor-pointer"
              >
                Sign Out / Change Email
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* PRIMARY GOOGLE OPTION */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-xs font-semibold text-slate-500 uppercase">or</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* EMAIL AND PASSWORD FORMS */}
            {isResetMode ? (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  Send Reset Link
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsResetMode(false)}
                    className="text-xs text-pink-400 hover:underline cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            ) : isRegisterMode ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    You can use any valid email address. A Gmail account is not required.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Confirm</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 mt-1"
                >
                  Create Account
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(false)}
                    className="text-xs text-pink-400 hover:underline cursor-pointer"
                  >
                    Already have an account? Sign In
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => setIsResetMode(true)}
                      className="text-xs text-pink-400 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 mt-1"
                >
                  Sign In with Email
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(true)}
                    className="text-xs text-pink-400 hover:underline cursor-pointer"
                  >
                    Don't have an account? Create Account
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* VISIBLE UID & CREDIT CONNECTION NOTICE */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs text-slate-300">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Lock className="w-4 h-4 text-pink-400 shrink-0" />
            <span>Account Ownership Notice</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Use the same sign-in method whenever you return unless you have connected another method through Account Settings.
          </p>
        </div>

        <div className="pt-2 text-center text-[11px] text-slate-400">
          By continuing, you agree to our <span className="text-slate-300 font-medium">Terms of Service</span> and <span className="text-slate-300 font-medium">Privacy Policy</span>.
        </div>

      </div>
    </div>
  );
};
