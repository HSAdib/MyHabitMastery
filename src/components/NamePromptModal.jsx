import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, googleProvider } from '../firebase.config';
import { useHabitStore, serializeUser } from '../store/useHabitStore';
import { signInWithGoogleCrossPlatform } from '../platform/nativeAuth';

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
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);
const GuestIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
);
const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
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

export default function NamePromptModal({ isOpen, onClose, initialMode = 'home' }) {
  const [viewMode, setViewMode] = useState(initialMode); // 'home' | 'login' | 'signup' | 'guest'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
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
  const isBusy = googleLoading || emailLoading;

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isEmailInvalid = email.length > 0 && !isEmailValid;
  const isPasswordValid = password.length >= 6;
  const isPasswordInvalid = password.length > 0 && password.length < 6;
  const isConfirmValid = viewMode === 'signup' && confirmPassword.length > 0 && confirmPassword === password;
  const isConfirmInvalid = viewMode === 'signup' && confirmPassword.length > 0 && confirmPassword !== password;

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
      setConfirmPassword('');
      setShowPassword(false);
      setError('');
      setPopupBlocked(false);
      setIsSlowNetwork(false);
    }
  }, [visible, initialMode, loadAccounts]);

  useEffect(() => {
    let timer;
    if (isBusy) {
      timer = setTimeout(() => setIsSlowNetwork(true), 3500);
    } else {
      setIsSlowNetwork(false);
    }
    return () => clearTimeout(timer);
  }, [isBusy]);

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
    setPopupBlocked(false);

    if (!auth) {
      setError('Cloud sync is not configured in this build. Please continue in Guest (Offline) mode.');
      return;
    }
    if (!isEmailValid) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!isPasswordValid) {
      setError('Password should be at least 6 characters.');
      return;
    }
    if (viewMode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setEmailLoading(true);
    try {
      if (viewMode === 'signup') {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          await updateProfile(userCred.user, { displayName: name.trim() });
          useHabitStore.getState().setStorePartial({ user: serializeUser(userCred.user, { displayName: name.trim() }) });
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
      else setError('Authentication failed. Please check your credentials or continue offline.');
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
    setPopupBlocked(false);
    if (!auth) {
      setError('Cloud sync is not configured in this build. Please continue in Guest (Offline) mode.');
      return;
    }
    setGoogleLoading(true);
    try {
      await signInWithGoogleCrossPlatform(auth, googleProvider);
      if (controlled && onClose) onClose();
    } catch (err) {
      console.error('Google Sign-in failed:', err);
      if (err.code === 'auth/desktop-google-unsupported') {
        setError('On the Desktop app, please sign in using Email & Password below (Google blocks embedded desktop popups).');
      } else if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request' || err.code === 'auth/unauthorized-domain') {
        setPopupBlocked(true);
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google Sign-In failed. Please try again or use email below.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handlePersonaSelect = (persona) => {
    if (!name.trim()) {
      setName(`${persona.emoji} ${persona.label}`);
    } else {
      let cleanName = name.trim();
      for (const p of PERSONAS) {
        if (cleanName.startsWith(p.emoji)) {
          cleanName = cleanName.slice(p.emoji.length).trim();
          break;
        }
      }
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
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

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

            {/* Popup Blocked Recovery Card */}
            {popupBlocked && (
              <div className={`relative z-10 mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2`}>
                <div className="flex items-center gap-1.5 font-black text-amber-400 text-xs uppercase tracking-wide">
                  <span>🛡️</span>
                  <span>Popup Window Blocked</span>
                </div>
                <p className={`text-[11px] leading-relaxed ${dk ? 'text-slate-300' : 'text-slate-600'}`}>
                  Your browser blocked the Google Sign-In popup. Use email &amp; password or continue in Guest mode.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setPopupBlocked(false); setViewMode('login'); }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px] uppercase tracking-wider hover:bg-emerald-500/30"
                  >
                    Use Email Form
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPopupBlocked(false); setViewMode('guest'); }}
                    className={`flex-1 py-1.5 px-2 rounded-lg border font-bold text-[10px] uppercase tracking-wider ${dk ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}`}
                  >
                    Guest Mode
                  </button>
                </div>
              </div>
            )}

            {/* Slow Network Recovery Banner */}
            {isSlowNetwork && isBusy && (
              <div className="relative z-10 mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span>Slow network detected...</span>
                  <span className="animate-pulse">Connecting</span>
                </div>
                <div className="w-full bg-amber-900/40 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-400 h-1.5 rounded-full animate-pulse w-3/4"></div>
                </div>
                <button
                  type="button"
                  onClick={() => { setGoogleLoading(false); setEmailLoading(false); setViewMode('guest'); }}
                  className="w-full py-1 text-center font-black text-[10px] uppercase tracking-wider hover:underline cursor-pointer"
                >
                  Continue in Offline Guest Mode →
                </button>
              </div>
            )}

            {/* VIEW 1: HOME CHOOSER */}
            {viewMode === 'home' && (
              <div className="relative z-10 flex flex-col gap-4">
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

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => { setError(''); setPopupBlocked(false); setViewMode('login'); }}
                    className={`py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider border transition-all ${
                      dk ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => { setError(''); setPopupBlocked(false); setViewMode('signup'); }}
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

                <button
                  onClick={() => { setError(''); setPopupBlocked(false); setViewMode('guest'); }}
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
              <form onSubmit={handleEmailAuth} className="relative z-10 flex flex-col gap-3.5">
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
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                        dk ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                )}

                <div>
                  <label className={`block text-xs font-bold mb-1 uppercase tracking-wide ${dk ? 'text-slate-400' : 'text-slate-600'}`}>Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={`w-full pl-4 pr-10 py-2.5 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 ${
                        isEmailInvalid
                          ? 'border-rose-500/80 focus:ring-rose-500/40 bg-rose-500/5'
                          : isEmailValid
                            ? 'border-emerald-500/60 focus:ring-emerald-500/40'
                            : dk
                              ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                              : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                    {isEmailValid && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <CheckCircleIcon/>
                      </div>
                    )}
                  </div>
                  {isEmailInvalid && (
                    <p className="text-[11px] text-rose-400 mt-1 font-medium">⚠️ Add a valid domain, like name@gmail.com</p>
                  )}
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 uppercase tracking-wide ${dk ? 'text-slate-400' : 'text-slate-600'}`}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-4 pr-16 py-2.5 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 ${
                        isPasswordInvalid
                          ? 'border-rose-500/80 focus:ring-rose-500/40 bg-rose-500/5'
                          : isPasswordValid
                            ? 'border-emerald-500/60 focus:ring-emerald-500/40'
                            : dk
                              ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                              : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      {isPasswordValid && <CheckCircleIcon/>}
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        title={showPassword ? 'Hide password' : 'Show password'}
                        className={`p-1 rounded-md transition-colors ${dk ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
                      >
                        {showPassword ? <EyeOffIcon/> : <EyeIcon/>}
                      </button>
                    </div>
                  </div>
                  {isPasswordInvalid && (
                    <p className="text-[11px] text-rose-400 mt-1 font-medium">
                      ⚠️ Password needs at least 6 characters ({6 - password.length} more needed)
                    </p>
                  )}
                </div>

                {viewMode === 'signup' && (
                  <div>
                    <label className={`block text-xs font-bold mb-1 uppercase tracking-wide ${dk ? 'text-slate-400' : 'text-slate-600'}`}>Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-4 pr-16 py-2.5 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 ${
                          isConfirmInvalid
                            ? 'border-rose-500/80 focus:ring-rose-500/40 bg-rose-500/5'
                            : isConfirmValid
                              ? 'border-emerald-500/60 focus:ring-emerald-500/40'
                              : dk
                                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        {isConfirmValid && <CheckCircleIcon/>}
                      </div>
                    </div>
                    {isConfirmInvalid && (
                      <p className="text-[11px] text-rose-400 mt-1 font-medium">⚠️ Passwords do not match yet</p>
                    )}
                  </div>
                )}

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

                <p className={`text-center text-xs font-semibold ${dk ? 'text-slate-500' : 'text-slate-400'}`}>
                  {viewMode === 'login' ? (
                    <>No account?{' '}
                      <button type="button" onClick={() => { setError(''); setConfirmPassword(''); setViewMode('signup'); }} className={`font-black underline underline-offset-2 ${dk ? 'text-emerald-400' : 'text-emerald-600'}`}>Sign up</button>
                    </>
                  ) : (
                    <>Already have an account?{' '}
                      <button type="button" onClick={() => { setError(''); setConfirmPassword(''); setViewMode('login'); }} className={`font-black underline underline-offset-2 ${dk ? 'text-emerald-400' : 'text-emerald-600'}`}>Log in</button>
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
                  <div className={`rounded-2xl border divide-y overflow-hidden max-h-48 overflow-y-auto custom-scrollbar ${
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
