import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth, googleProvider } from '../firebase.config';
import { useHabitStore } from '../store/useHabitStore';

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
);

export default function AuthModal({ isOpen, onClose }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);

  const theme = useHabitStore((state) => state.theme);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError(null);
      setIsSignUp(false);
      setShowPassword(false);
      setIsSlowNetwork(false);
      setPopupBlocked(false);
    }
  }, [isOpen]);

  // 05/10 Slow Network State timer
  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => {
        setIsSlowNetwork(true);
      }, 3500);
    } else {
      setIsSlowNetwork(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  if (!isOpen) return null;

  // 09/10 Inline Field Validation
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isEmailInvalid = email.length > 0 && !isEmailValid;

  const isPasswordValid = password.length >= 6;
  const isPasswordInvalid = password.length > 0 && password.length < 6;

  const isConfirmValid = isSignUp && confirmPassword.length > 0 && confirmPassword === password;
  const isConfirmInvalid = isSignUp && confirmPassword.length > 0 && confirmPassword !== password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setPopupBlocked(false);

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!isEmailValid) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          await updateProfile(userCred.user, { displayName: name.trim() });
          useHabitStore.getState().setStorePartial({ user: { ...userCred.user, displayName: name.trim() } });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') setError('Email already in use.');
      else if (err.code === 'auth/wrong-password') setError('Wrong password.');
      else if (err.code === 'auth/user-not-found') setError('User not found.');
      else if (err.code === 'auth/invalid-credential') setError('Invalid credentials.');
      else if (err.code === 'auth/weak-password') setError('Password should be at least 6 characters.');
      else setError('Authentication failed. Please check your credentials or continue offline.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setPopupBlocked(false);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request' || err.code === 'auth/unauthorized-domain') {
        setPopupBlocked(true);
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google Sign-In failed. Please try again or use email below.');
      }
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full max-w-sm rounded-2xl p-6 shadow-2xl border ${
            theme === 'dark' ? 'bg-slate-900 border-slate-700/50' : 'bg-white border-slate-200'
          }`}
        >
          <button
            onClick={onClose}
            title="Close"
            className={`absolute top-4 right-4 p-1 rounded-full transition-colors ${
              theme === 'dark' ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
          >
            <XIcon />
          </button>

          <div className={`flex p-1 rounded-xl mb-6 ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
            <button
              onClick={() => { setIsSignUp(false); setError(null); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                !isSignUp
                  ? theme === 'dark' ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                  : theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Log In"
            >
              Log In
            </button>
            <button
              onClick={() => { setIsSignUp(true); setError(null); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                isSignUp
                  ? theme === 'dark' ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                  : theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Sign Up"
            >
              Sign Up
            </button>
          </div>

          {/* 07/10 Popup Blocked Structured Card */}
          {popupBlocked && (
            <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-black text-amber-400 text-xs uppercase tracking-wide">
                <span>🛡️</span>
                <span>Popup Window Blocked</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Your browser blocked the Google Sign-In popup window. You can sign in using email & password below, or continue offline.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPopupBlocked(false)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px] uppercase tracking-wider hover:bg-emerald-500/30"
                >
                  Use Email Form
                </button>
                <button
                  type="button"
                  onClick={() => { setPopupBlocked(false); onClose(); }}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-bold text-[10px] uppercase tracking-wider hover:bg-slate-700"
                >
                  Continue Offline
                </button>
              </div>
            </div>
          )}

          {/* 05/10 Slow Network State Banner */}
          {isSlowNetwork && loading && (
            <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span>Slow network detected...</span>
                <span className="animate-pulse">Connecting</span>
              </div>
              <div className="w-full bg-amber-900/40 rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-400 h-1.5 rounded-full animate-pulse w-3/4"></div>
              </div>
              <button
                type="button"
                onClick={() => { setLoading(false); onClose(); }}
                className="w-full py-1.5 text-center font-black text-[10px] uppercase tracking-wider text-amber-300 hover:text-white hover:underline transition-all cursor-pointer"
              >
                Continue in Offline Guest Mode →
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {isSignUp && (
              <div>
                <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Your Name / Nickname
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                  placeholder="e.g. Alex"
                />
              </div>
            )}

            <div>
              <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-4 pr-10 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 ${
                    isEmailInvalid
                      ? 'border-rose-500/80 focus:ring-rose-500/40 bg-rose-500/5'
                      : isEmailValid
                      ? 'border-emerald-500/60 focus:ring-emerald-500/40'
                      : theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                  placeholder="you@example.com"
                />
                {isEmailValid && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <CheckCircleIcon />
                  </div>
                )}
              </div>
              {isEmailInvalid && (
                <p className="text-[11px] text-rose-400 mt-1 font-medium">
                  ⚠️ Add a valid domain, like name@gmail.com
                </p>
              )}
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-4 pr-16 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 ${
                    isPasswordInvalid
                      ? 'border-rose-500/80 focus:ring-rose-500/40 bg-rose-500/5'
                      : isPasswordValid
                      ? 'border-emerald-500/60 focus:ring-emerald-500/40'
                      : theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                  placeholder="••••••••"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {isPasswordValid && <CheckCircleIcon />}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                    className={`p-1 rounded-md transition-colors ${
                      theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
              {isPasswordInvalid && (
                <p className="text-[11px] text-rose-400 mt-1 font-medium">
                  ⚠️ Password needs at least 6 characters ({6 - password.length} more needed)
                </p>
              )}
            </div>

            {isSignUp && (
              <div>
                <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-4 pr-16 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 ${
                      isConfirmInvalid
                        ? 'border-rose-500/80 focus:ring-rose-500/40 bg-rose-500/5'
                        : isConfirmValid
                        ? 'border-emerald-500/60 focus:ring-emerald-500/40'
                        : theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                    placeholder="••••••••"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {isConfirmValid && <CheckCircleIcon />}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Hide password" : "Show password"}
                      className={`p-1 rounded-md transition-colors ${
                        theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
                {isConfirmInvalid && (
                  <p className="text-[11px] text-rose-400 mt-1 font-medium">
                    ⚠️ Passwords do not match yet
                  </p>
                )}
              </div>
            )}

            {error && (
              <div className="text-red-500 text-xs font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 mt-1 rounded-xl font-black text-sm text-white transition-transform active:scale-95 shadow-lg ${
                loading ? 'bg-emerald-500/50 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
              }`}
              title="Action"
            >
              {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Log In'}
            </button>
          </form>

          <div className="mt-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className={`px-2 font-medium tracking-wide ${theme === 'dark' ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-500'}`}>
                  OR CONTINUE WITH
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              title="Sign in with Google"
              className={`mt-4 w-full flex items-center justify-center gap-3 py-2.5 rounded-xl font-bold text-sm border transition-colors active:scale-95 ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <GoogleIcon />
              Google
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
