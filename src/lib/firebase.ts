import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  EmailAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updatePassword,
  linkWithCredential,
  linkWithPopup,
  unlink,
  User,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Initialize Firestore with specific databaseId if provided
const customDbId = (firebaseConfigJson as Record<string, any>).firestoreDatabaseId;
export const db = customDbId
  ? getFirestore(app, customDbId)
  : getFirestore(app);

// Automatically check for redirect login results when returning from Google redirect
getRedirectResult(auth)
  .then((result) => {
    if (result?.user) {
      console.log('Successfully authenticated via Google Redirect:', result.user.email);
    }
  })
  .catch((error) => {
    console.error('Google Redirect Sign-In error:', error);
  });

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result?.user) {
      try {
        await fetch('/api/auth/welcome-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: result.user.email,
            name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
            provider: 'Google Account',
          }),
        });
      } catch (e) {
        console.warn('Welcome email trigger failed:', e);
      }
    }
    return result.user;
  } catch (error: any) {
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request' ||
      error?.code === 'auth/user-cancelled'
    ) {
      console.log('Google Sign-In prompt closed by user.');
      return null;
    }

    if (
      error?.code === 'auth/popup-blocked' ||
      error?.code === 'auth/operation-not-supported-in-this-environment' ||
      error?.message?.includes('popup')
    ) {
      console.warn('Popup blocked by browser. Switching to signInWithRedirect...');
      await signInWithRedirect(auth, googleProvider);
      return null;
    }

    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

export const loginWithGoogle = signInWithGoogle;

/**
 * Register / Create Account with Email Address and Password
 */
export const registerWithEmailAndPassword = async (email: string, pass: string, displayName?: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    throw new Error('Please enter a valid Email Address (e.g. name@example.com).');
  }
  if (!pass || pass.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (result.user) {
    if (displayName?.trim()) {
      await updateProfile(result.user, { displayName: displayName.trim() });
    }
    // Send email verification link via Firebase Auth
    try {
      await sendEmailVerification(result.user);
    } catch (verErr) {
      console.warn('Initial email verification send failed:', verErr);
    }

    // Trigger registration welcome email
    try {
      await fetch('/api/auth/welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: result.user.email,
          name: displayName || result.user.displayName || result.user.email?.split('@')[0] || 'User',
          provider: 'Email / Password',
        }),
      });
    } catch (e) {
      console.warn('Welcome email trigger failed:', e);
    }
  }
  return result.user;
};

/**
 * Sign In with Email Address and Password
 */
export const signInWithDirectEmailAndPassword = async (email: string, pass: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    throw new Error('Please enter a valid Email Address.');
  }
  if (!pass) {
    throw new Error('Please enter your password.');
  }
  const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return result.user;
};

/**
 * Send Email Verification Link
 */
export const sendUserEmailVerification = async (user?: User | null) => {
  const targetUser = user || auth.currentUser;
  if (!targetUser) {
    throw new Error('No authenticated user found to send verification email.');
  }
  await sendEmailVerification(targetUser);
};

/**
 * Check if current user's email is verified by reloading user token
 */
export const checkEmailVerifiedStatus = async (): Promise<boolean> => {
  if (!auth.currentUser) return false;
  await auth.currentUser.reload();
  return auth.currentUser.emailVerified;
};

/**
 * Reset password via Firebase Authentication
 */
export const resetPassword = async (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    throw new Error('Please enter a valid Email Address to receive the password reset link.');
  }
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error: any) {
    // Handle user-not-found silently to avoid disclosing user existence
    if (error?.code === 'auth/user-not-found') {
      console.log('[resetPassword] Email not registered, reporting success silently to prevent email enumeration.');
      return;
    }
    throw error;
  }
};

/**
 * Link Google Account to existing logged-in Email/Password account
 */
export const linkGoogleAccount = async () => {
  if (!auth.currentUser) {
    throw new Error('You must be signed in to link a Google account.');
  }
  const result = await linkWithPopup(auth.currentUser, googleProvider);
  return result.user;
};

/**
 * Link Email/Password to existing logged-in Google account
 */
export const linkEmailAndPasswordAccount = async (email: string, pass: string) => {
  if (!auth.currentUser) {
    throw new Error('You must be signed in to link an Email and Password.');
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    throw new Error('Please enter a valid Email Address.');
  }
  if (!pass || pass.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  const credential = EmailAuthProvider.credential(email.trim(), pass);
  const result = await linkWithCredential(auth.currentUser, credential);
  try {
    await sendEmailVerification(result.user);
  } catch (e) {
    console.warn('Verification send failed during account link:', e);
  }
  return result.user;
};

/**
 * Change Password for logged-in Email/Password user
 */
export const changeUserPassword = async (newPassword: string) => {
  if (!auth.currentUser) {
    throw new Error('You must be signed in to change your password.');
  }
  if (!newPassword || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }
  await updatePassword(auth.currentUser, newPassword);
};

/**
 * Unlink sign-in provider from current user account
 */
export const unlinkSignInMethod = async (providerId: string) => {
  if (!auth.currentUser) {
    throw new Error('You must be signed in to manage sign-in methods.');
  }
  if (auth.currentUser.providerData.length <= 1) {
    throw new Error('You cannot remove your only sign-in method. Connect another method first.');
  }
  const updatedUser = await unlink(auth.currentUser, providerId);
  return updatedUser;
};

export const logoutUser = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Logout Error:', error);
  }
};

export const logout = logoutUser;

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { onAuthStateChanged, type User, doc, setDoc, getDoc, collection, onSnapshot, query, orderBy, limit };


