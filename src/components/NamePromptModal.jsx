import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase.config';
import { useHabitStore } from '../store/useHabitStore';

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
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

const PERSONAS = [
  { emoji: '⚡', label: 'Achiever' },
  { emoji: '💻', label: 'Builder' },
  { emoji: '🏋️', label: 'Athlete' },
  { emoji: '📚', label: 'Scholar' },
  { emoji: '🧘', label: 'Zen' },
  { emoji: '🌱', label: 'Starter' },
];

export default function NamePromptModal({ onOpenAuthModal }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const theme = useHabitStore(state => state.theme);
  const savePartialToIDB = useHabitStore(state => state.savePartialToIDB);

  const handleGuestSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError('Please enter at least 2 characters.');
      return;
    }
    if (trimmed.toLowerCase() === 'guest user' || trimmed.toLowerCase() === 'unknown guest') {
      setError('Please choose a personalized nickname.');
      return;
    }

    // Save locally to IndexedDB and update store
    savePartialToIDB({ guestName: trimmed });
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged in useHabitStore will handle setting user & syncing cloud data,
      // which automatically unmounts this modal.
    } catch (err) {
      console.error('Google Sign-in failed:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setAuthError('Sign-in failed. Please try again or join as a guest.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handlePersonaSelect = (persona) => {
    if (!name.trim()) {
      setName(persona.label);
    } else {
      // If already typed a name, prepend or append emoji if not already there
      const cleanName = name.replace(/[^\w\s-]/gi, '').trim();
      setName(`${persona.emoji} ${cleanName || persona.label}`);
    }
    setError('');
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 24 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
          className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 relative overflow-hidden border shadow-2xl my-auto ${
            theme === 'dark' 
              ? 'bg-slate-900/95 border-slate-700/60 shadow-[0_0_60px_rgba(16,185,129,0.12)] text-white' 
              : 'bg-white/95 border-slate-200/80 shadow-[0_20px_60px_rgba(0,0,0,0.15)] text-slate-900'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient Lighting Orbs */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="text-center mb-7 relative z-10">
            <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10' 
                : 'bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-600 border border-emerald-200 shadow-emerald-200/50'
            }`}>
              <SparklesIcon />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Welcome to Habit Mastery
            </h2>
            <p className={`text-xs sm:text-sm font-medium mt-2 max-w-sm mx-auto leading-relaxed ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Select how you'd like to get started. Sync across devices or start tracking locally.
            </p>
          </div>

          <div className="relative z-10 flex flex-col gap-6">
            {/* FAST-TRACK: Google Sign-In */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                title="Continue with Google Account"
                className={`group relative flex items-center justify-between w-full p-4 rounded-2xl border transition-all active:scale-[0.99] ${
                  theme === 'dark'
                    ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-emerald-500/50 text-white shadow-lg shadow-black/20'
                    : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-emerald-500/40 text-slate-800 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0 border border-slate-100">
                    <GoogleIcon />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-black flex items-center gap-2">
                      <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        Cloud
                      </span>
                    </div>
                    <div className={`text-[11px] font-semibold mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      Automatic backup & multi-device sync
                    </div>
                  </div>
                </div>

                <div className={`p-2 rounded-xl transition-colors ${
                  theme === 'dark' ? 'group-hover:bg-slate-700/60 text-slate-400 group-hover:text-white' : 'group-hover:bg-slate-100 text-slate-400 group-hover:text-slate-700'
                }`}>
                  <ArrowRightIcon />
                </div>
              </button>

              {authError && (
                <p className="text-red-400 text-xs font-bold px-2">{authError}</p>
              )}
            </div>

            {/* DIVIDER */}
            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`} />
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                <span className={`px-3 py-1 rounded-full ${
                  theme === 'dark' ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-400 border border-slate-100'
                }`}>
                  Or start offline
                </span>
              </div>
            </div>

            {/* GUEST TRACK */}
            <form onSubmit={handleGuestSubmit} className="flex flex-col gap-3.5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-xs font-bold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    Join as Guest
                  </label>
                  <span className={`text-[11px] font-medium ${
                    theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    Stored locally
                  </span>
                </div>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  placeholder="Enter your name or nickname..."
                  maxLength={30}
                  className={`w-full px-4 py-3.5 rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 ${
                    theme === 'dark'
                      ? 'bg-slate-800/60 border border-slate-700/80 text-white placeholder-slate-500 focus:ring-emerald-500/40 focus:border-emerald-500/60'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-emerald-500/40 focus:border-emerald-500/60'
                  } ${error ? 'border-red-500/60 focus:ring-red-500/40' : ''}`}
                />

                {error && (
                  <p className="text-red-400 text-xs font-bold mt-2 ml-1">{error}</p>
                )}
              </div>

              {/* Quick Persona Suggestions */}
              <div>
                <p className={`text-[11px] font-bold mb-2 uppercase tracking-wide ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Choose a vibe (optional):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {PERSONAS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handlePersonaSelect(p)}
                      title={`Select ${p.label} persona`}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 ${
                        name.includes(p.label) || name.startsWith(p.emoji)
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : theme === 'dark'
                            ? 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span>{p.emoji}</span>
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!name.trim()}
                title="Save nickname and start tracking"
                className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-black text-sm text-white transition-all active:scale-[0.98] shadow-lg mt-1 ${
                  !name.trim()
                    ? 'bg-emerald-500/40 opacity-50 cursor-not-allowed shadow-none'
                    : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25'
                }`}
              >
                <span>Start as Guest</span>
                <ArrowRightIcon />
              </button>
            </form>

            {/* Email Login Alternative */}
            {onOpenAuthModal && (
              <div className="text-center pt-2 border-t border-slate-800/30">
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className={`text-xs font-bold transition-colors underline decoration-slate-600 underline-offset-4 ${
                    theme === 'dark' ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-500 hover:text-emerald-600'
                  }`}
                >
                  Prefer email & password? Log in here
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

