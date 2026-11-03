import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, googleProvider } from '../firebase.config';
import { useHabitStore } from '../store/useHabitStore';

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);
const GuestIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

const PERSONAS = [
  { emoji: '⚡', label: 'Achiever' },
  { emoji: '💻', label: 'Builder' },
  { emoji: '🏋️', label: 'Athlete' },
  { emoji: '📚', label: 'Scholar' },
  { emoji: '🧘', label: 'Zen' },
  { emoji: '🌱', label: 'Starter' },
];

const AVATAR_COLORS = [
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-orange-500 to-amber-600',
  'from-blue-500 to-cyan-600',
  'from-rose-500 to-pink-600',
  'from-lime-500 to-green-600',
];

function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function timeAgo(ms) {
  if (!ms) return 'recently';
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/**
 * NamePromptModal — Unified Auth Modal
 *
 * Supports two modes:
 *  - Uncontrolled (legacy): rendered by App when !guestName && !isAuthenticated → always visible
 *  - Controlled: pass `isOpen` + `onClose` to open/close on demand (e.g. from profile dropdown)
 *
 * Handles: Google SSO, Email/Password Login & Sign Up, Guest profile creation & switching.
 * The `onOpenAuthModal` prop is accepted but ignored (kept for backwards compat with App.jsx).
 */
export default function NamePromptModal({ isOpen, onClose, initialMode = 'home', onOpenAuthModal: _ignored }) {
  const [viewMode, setViewMode] = useState(initialMode); // 'home' | 'login' | 'signup' | 'guest'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [loadingAccountId, setLoadingAccountId] = useState(null);

  const theme = useHabitStore(state => state.theme);
  const currentGuestName = useHabitStore(state => state.guestName);
  const listGuestAccounts = useHabitStore(state => state.listGuestAccounts);
  const loadGuestAccount = useHabitStore(state => state.loadGuestAccount);
  const deleteGuestAccount = useHabitStore(state => state.deleteGuestAccount);
  const createNewGuestAccount = useHabitStore(state => state.createNewGuestAccount);

  const controlled = isOpen !== undefined;
  const visible = controlled ? isOpen : true;
  const dk = theme === 'dark';

  const loadAccounts = useCallback(async () => {
    try {
      const list = await listGuestAccounts();
      const sorted = (list || []).sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
      setSavedAccounts(sorted);
    } catch (e) {
      console.warn("Failed to list guest accounts:", e);
    }
  }, [listGuestAccounts]);

  useEffect(() => {
    if (visible) {
      loadAccounts();
      setViewMode(initialMode || 'home');
      setName('');
      setEmail('');
      setPassword('');
      setError('');
    }
  }, [visible, initialMode, loadAccounts]);

  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError('Please enter at least 2 characters.');
      return;
    }
    await createNewGuestAccount(trimmed);
    setName('');
    if (controlled && onClose) onClose();
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setEmailLoading(true);
    try {
      if (viewMode === 'signup') {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          await updateProfile(userCred.user, { displayName: name.trim() });
          useHabitStore.getState().setStorePartial({ user: { ...userCred.user, displayName: name.trim() } });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      if (controlled && onClose) onClose();
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') setError('Email already in use.');
      else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') setError('Invalid email or password.');
      else if (err.code === 'auth/user-not-found') setError('No account found with this email.');
      else if (err.code === 'auth/weak-password') setError('Password should be at least 6 characters.');
      else setError(err.message || 'Authentication failed.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSelectAccount = async (accId) => {
    setLoadingAccountId(accId);
    try {
      await loadGuestAccount(accId);
      if (controlled && onClose) onClose();
    } finally {
      setLoadingAccountId(null);
    }
  };

  const handleDeleteAccount = async (e, accId) => {
    e.stopPropagation();
    await deleteGuestAccount(accId);
    setConfirmDeleteId(null);
    await loadAccounts();
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      if (controlled && onClose) onClose();
    } catch (err) {
      console.error('Google Sign-in failed:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google Sign-In failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handlePersonaSelect = (persona) => {
    if (!name.trim()) {
      setName(persona.label);
    } else {
      const cleanName = name.replace(/[^\w\s-]/gi, '').trim();
      setName(`${persona.emoji} ${cleanName || persona.label}`);
    }
    setError('');
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          key="unified-auth-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={controlled && onClose ? onClose : undefined}
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            key="unified-auth-card"
            initial={{ scale: 0.95, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 24 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}
            className={`w-full max-w-md rounded-3xl p-6 sm:p-8 relative overflow-hidden border shadow-2xl my-auto ${
              dk
                ? 'bg-slate-900/95 border-slate-700/60 shadow-[0_0_60px_rgba(16,185,129,0.12)] text-white'
                : 'bg-white/95 border-slate-200/80 shadow-[0_20px_60px_rgba(0,0,0,0.15)] text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Lighting Orbs */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close button */}
            {controlled && onClose && (
              <button
                onClick={onClose}
                className={`absolute top-4 right-4 z-10 p-1.5 rounded-lg transition-colors ${
                  dk ? 'text-slate-500 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
                title="Close"
              >
                <CloseIcon/>
              </button>
            )}

            {/* Modal Header */}
            <div className="text-center mb-6 relative z-10">
              <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${
                dk
                  ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10'
                  : 'bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-600 border border-emerald-200 shadow-emerald-200/50'
              }`}>
                <SparklesIcon/>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                Welcome to Habit Mastery
              </h2>
              <p className={`text-xs sm:text-sm font-medium mt-2 max-w-sm mx-auto leading-relaxed ${
                dk ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {viewMode === 'home' && 'Choose how you want to sync or track your daily routines.'}
                {viewMode === 'login' && 'Log in to your cloud account.'}
                {viewMode === 'signup' && 'Create your Habit Mastery account.'}
                {viewMode === 'guest' && 'Manage local guest profiles or create a new one.'}
              </p>
            </div>

            {/* VIEW 1: HOME CHOOSER */}
            {viewMode === 'home' && (
              <div className="relative z-10 flex flex-col gap-4">
                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className={`group relative flex items-center justify-between w-full p-4 rounded-2xl border transition-all active:scale-[0.99] ${
                    dk ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-emerald-500/50 text-white' : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-emerald-500/40 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0 border border-slate-100">
                      <GoogleIcon/>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-black flex items-center gap-2">
                        <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Cloud</span>
                      </div>
                      <div className={`text-[11px] font-semibold mt-0.5 ${dk ? 'text-slate-400' : 'text-slate-500'}`}>
                        Automatic backup &amp; multi-device sync
                      </div>
                    </div>
                  </div>
                  <ArrowRightIcon/>
                </button>

                {/* Email Login/Signup buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => { setError(''); setViewMode('login'); }}
                    className={`py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider border transition-all ${
                      dk ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => { setError(''); setViewMode('signup'); }}
                    className={`py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider border transition-all ${
                      dk ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {error && (
                  <div className="text-red-400 text-xs font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                    {error}
                  </div>
                )}

                {/* Guest / Saved Accounts entry */}
                <button
                  onClick={() => { setError(''); setViewMode('guest'); }}
                  className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider border transition-all ${
                    dk ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  <GuestIcon/>
                  <span>{savedAccounts.length > 0 ? `Saved Guest Profiles (${savedAccounts.length})` : 'Start as Guest (Offline)'}</span>
                </button>
              </div>
            )}

            {/* VIEW 2 & 3: EMAIL LOGIN OR SIGN UP */}
            {(viewMode === 'login' || viewMode === 'signup') && (
              <form onSubmit={handleEmailAuth} className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center justify-between mb-1">
                  <button
                    type="button"
                    onClick={() => { setError(''); setViewMode('home'); }}
                    className={`text-xs font-bold flex items-center gap-1 ${dk ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    <ArrowLeftIcon/> Back
                  </button>
                  <span className={`text-xs font-black uppercase tracking-wider ${dk ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {viewMode === 'login' ? 'Email Login' : 'Create Account'}
                  </span>
                </div>

                {viewMode === 'signup' && (
                  <div>
                    <label className={`block text-xs font-bold mb-1 uppercase tracking-wide ${dk ? 'text-slate-400' : 'text-slate-600'}`}>Your Name / Nickname</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex"
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                        dk ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                )}

                <div>
                  <label className={`block text-xs font-bold mb-1 uppercase tracking-wide ${dk ? 'text-slate-400' : 'text-slate-600'}`}>Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                      dk ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 uppercase tracking-wide ${dk ? 'text-slate-400' : 'text-slate-600'}`}>Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                      dk ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                {error && (
                  <div className="text-red-400 text-xs font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={emailLoading}
                  className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {emailLoading ? 'Processing...' : viewMode === 'login' ? 'Log In' : 'Sign Up'}
                </button>

                {/* Toggle between login / signup */}
                <p className={`text-center text-xs font-semibold ${dk ? 'text-slate-500' : 'text-slate-400'}`}>
                  {viewMode === 'login' ? (
                    <>No account?{' '}
                      <button type="button" onClick={() => { setError(''); setViewMode('signup'); }} className={`font-black underline underline-offset-2 ${dk ? 'text-emerald-400' : 'text-emerald-600'}`}>Sign up</button>
                    </>
                  ) : (
                    <>Already have an account?{' '}
                      <button type="button" onClick={() => { setError(''); setViewMode('login'); }} className={`font-black underline underline-offset-2 ${dk ? 'text-emerald-400' : 'text-emerald-600'}`}>Log in</button>
                    </>
                  )}
                </p>
              </form>
            )}

            {/* VIEW 4: GUEST PROFILES & NEW GUEST CREATION */}
            {viewMode === 'guest' && (
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => { setError(''); setViewMode('home'); }}
                    className={`text-xs font-bold flex items-center gap-1 ${dk ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    <ArrowLeftIcon/> Back
                  </button>
                  <span className={`text-xs font-black uppercase tracking-wider ${dk ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    Local Guest Profiles
                  </span>
                </div>

                {savedAccounts.length > 0 && (
                  <div className={`rounded-2xl border divide-y overflow-hidden max-h-48 overflow-y-auto ${
                    dk ? 'border-slate-700/60 divide-slate-800 bg-slate-800/40' : 'border-slate-200 divide-slate-100 bg-slate-50/50'
                  }`}>
                    {savedAccounts.map((acc) => {
                      const isActive = acc.name === currentGuestName;
                      const isDeleting = confirmDeleteId === acc.id;
                      const isLoadingThis = loadingAccountId === acc.id;

                      return (
                        <div
                          key={acc.id}
                          onClick={() => !isDeleting && handleSelectAccount(acc.id)}
                          className={`flex items-center justify-between p-3.5 cursor-pointer transition-all ${
                            isActive ? (dk ? 'bg-emerald-500/10' : 'bg-emerald-50/80') : (dk ? 'hover:bg-slate-800/80' : 'hover:bg-white')
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-xs text-white bg-gradient-to-br ${avatarColor(acc.name)} shadow-sm`}>
                              {(acc.name || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-bold truncate ${dk ? 'text-white' : 'text-slate-900'}`}>{acc.name}</span>
                                {isActive && <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Current</span>}
                              </div>
                              <span className={`text-[10px] ${dk ? 'text-slate-500' : 'text-slate-400'}`}>{timeAgo(acc.savedAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2" onClick={e => e.stopPropagation()}>
                            {isDeleting ? (
                              <div className="flex items-center gap-1">
                                <button type="button" onClick={(e) => handleDeleteAccount(e, acc.id)} className="px-2 py-1 rounded bg-red-500 text-white text-[10px] font-black">Yes</button>
                                <button type="button" onClick={() => setConfirmDeleteId(null)} className={`px-2 py-1 rounded text-[10px] font-bold ${dk ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-800'}`}>No</button>
                              </div>
                            ) : (
                              <>
                                <button type="button" onClick={() => handleSelectAccount(acc.id)} disabled={isLoadingThis} className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
                                  {isLoadingThis ? '...' : isActive ? 'Active' : 'Load'}
                                </button>
                                <button type="button" onClick={() => setConfirmDeleteId(acc.id)} className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"><TrashIcon/></button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <form onSubmit={handleGuestSubmit} className="flex flex-col gap-3">
                  <div>
                    <label className={`block text-xs font-bold mb-1 uppercase tracking-wide ${dk ? 'text-slate-300' : 'text-slate-700'}`}>Create New Guest Profile</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setError(''); }}
                      placeholder="Enter guest nickname..."
                      maxLength={30}
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                        dk ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                    {error && <p className="text-red-400 text-xs font-bold mt-1">{error}</p>}
                  </div>

                  {/* Personas */}
                  <div className="flex flex-wrap gap-1.5">
                    {PERSONAS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => handlePersonaSelect(p)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          name.includes(p.label) ? 'bg-emerald-500 text-white' : (dk ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
                        }`}
                      >
                        <span>{p.emoji}</span><span>{p.label}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={!name.trim()}
                    className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98]"
                  >
                    Start as Guest
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
