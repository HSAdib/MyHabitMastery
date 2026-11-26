import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useHabitStore, serializeUser } from '../store/useHabitStore';
import { updateProfile, deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase.config';
import { SUPER_ADMIN_EMAIL } from './ProtectedAdminRoute';
import { reauthenticateGoogleCrossPlatform, signOutCrossPlatform } from '../platform/nativeAuth';

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
);
const SyncIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
);
const GuestIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const ExportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
);
const ImportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
);
const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);
const UserAvatarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const AdminIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);
const SwitchUserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const ClearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export default function HeaderProfile({ totalXP, bestStreak, handleLogin, handleLogout, handleExport, handleSwitchAccount }) {
  const [isOpen, setIsOpen] = useState(false);
  const [importPayload, setImportPayload] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [backupErrorInfo, setBackupErrorInfo] = useState(null);

  // Multi-Profile states for signed-in users
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [editingProfileTempName, setEditingProfileTempName] = useState('');
  const [confirmDeleteProfileId, setConfirmDeleteProfileId] = useState(null);

  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const user = useHabitStore(state => state.user);
  const isAuthenticated = useHabitStore(state => state.isAuthenticated);
  const isAdmin = isAuthenticated && Boolean(user?.emailVerified) && user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL;
  const theme = useHabitStore(state => state.theme);
  const syncToCloud = useHabitStore(state => state.syncToCloud);
  const importData = useHabitStore(state => state.importData);
  const guestName = useHabitStore(state => state.guestName);
  const savePartialToIDB = useHabitStore(state => state.savePartialToIDB);
  const setStorePartial = useHabitStore(state => state.setStorePartial);
  const renameGuestAccount = useHabitStore(state => state.renameGuestAccount);
  const resetLocalSession = useHabitStore(state => state.resetLocalSession);

  const activeProfileId = useHabitStore(state => state.activeProfileId || 'main');
  const cloudProfiles = useHabitStore(state => state.cloudProfiles || {});
  const createCloudProfile = useHabitStore(state => state.createCloudProfile);
  const switchCloudProfile = useHabitStore(state => state.switchCloudProfile);
  const renameCloudProfile = useHabitStore(state => state.renameCloudProfile);
  const deleteCloudProfile = useHabitStore(state => state.deleteCloudProfile);

  const profileList = Object.values(cloudProfiles).sort((a, b) => {
    if (a.id === 'main') return -1;
    if (b.id === 'main') return 1;
    return (a.createdAt || 0) - (b.createdAt || 0);
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsEditingName(false);
        setConfirmDeleteProfileId(null);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape' || !isOpen) return;
      if (isEditingName) { setIsEditingName(false); return; }
      if (editingProfileId) { setEditingProfileId(null); return; }
      if (isCreatingProfile) { setIsCreatingProfile(false); return; }
      if (confirmDeleteProfileId) { setConfirmDeleteProfileId(null); return; }
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isEditingName, editingProfileId, isCreatingProfile, confirmDeleteProfileId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.trackerData && Array.isArray(parsed.habits)) {
          setImportPayload(parsed);
        } else {
          useHabitStore.getState().setImportStatus('error');
          setTimeout(() => useHabitStore.getState().setImportStatus(null), 3000);
          setBackupErrorInfo({
            fileName: file.name,
            reason: 'This file is missing required Habit Mastery data (trackerData or habits array).',
            reassurance: 'Your existing habits, streaks, and XP have not been changed.',
          });
        }
      } catch {
        useHabitStore.getState().setImportStatus('error');
        setTimeout(() => useHabitStore.getState().setImportStatus(null), 3000);
        setBackupErrorInfo({
          fileName: file.name,
          reason: 'This file could not be parsed as valid JSON data.',
          reassurance: 'Your existing habits, streaks, and XP have not been changed.',
        });
      }
      e.target.value = null;
    };
    reader.readAsText(file);
  };

  const handleSyncClick = async () => {
    if (!isAuthenticated) {
      handleLogin();
    } else if (syncToCloud) {
      await syncToCloud();
    }
    setIsOpen(false);
  };

  const handleNameSave = async () => {
    const newName = tempName.trim();
    if (!newName || isSavingName) {
      setIsEditingName(false);
      return;
    }
    setIsSavingName(true);
    try {
      if (isAuthenticated && auth?.currentUser) {
        await updateProfile(auth.currentUser, { displayName: newName });
        setStorePartial({ user: serializeUser(auth.currentUser, { displayName: newName }) });
        if (activeProfileId === 'main') {
          await renameCloudProfile('main', newName);
        }
      } else {
        await renameGuestAccount(guestName, newName);
      }
    } catch (err) {
      console.error('Failed to update name:', err);
    } finally {
      setIsSavingName(false);
      setIsEditingName(false);
    }
  };

  const handleCreateNewProfile = async (e) => {
    e.preventDefault();
    const trimmed = newProfileName.trim();
    if (!trimmed) return;
    await createCloudProfile(trimmed);
    setNewProfileName('');
    setIsCreatingProfile(false);
  };

  const handleSaveProfileRename = async (profId) => {
    const trimmed = editingProfileTempName.trim();
    if (trimmed) {
      await renameCloudProfile(profId, trimmed);
    }
    setEditingProfileId(null);
  };

  const handleSwitchProfile = async () => {
    setIsOpen(false);
    if (handleSwitchAccount) {
      await handleSwitchAccount();
    } else {
      try { if (auth?.currentUser) await signOutCrossPlatform(auth); } catch (err) { console.error(err); }
      await resetLocalSession();
    }
  };

  const handleDeleteAccount = async () => {
    if (!isAuthenticated || !auth?.currentUser) return;
    setIsDeleting(true);
    try {
      const currentUser = auth.currentUser;
      const lastSignInMs = currentUser.metadata?.lastSignInTime
        ? new Date(currentUser.metadata.lastSignInTime).getTime()
        : 0;
      const isRecentLogin = lastSignInMs > 0 && (Date.now() - lastSignInMs) < 4 * 60 * 1000;

      if (!isRecentLogin) {
        const isGoogleProvider = currentUser.providerData?.some(p => p.providerId === 'google.com');
        if (isGoogleProvider) {
          await reauthenticateGoogleCrossPlatform(currentUser, googleProvider);
        } else {
          // Preserve offline data and prompt fresh sign-in BEFORE touching Firestore
          await savePartialToIDB({});
          useHabitStore.getState().setSessionExpiredModal(true);
          setIsDeleteModalOpen(false);
          return;
        }
      }

      await deleteDoc(doc(db, 'users', currentUser.uid));
      await deleteUser(currentUser);
      await resetLocalSession();
      setIsDeleteModalOpen(false);
      setIsOpen(false);
      window.location.href = '/';
    } catch (err) {
      console.error('Failed to delete account:', err);
      if (
        err.code === 'auth/requires-recent-login' ||
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request'
      ) {
        await savePartialToIDB({});
        useHabitStore.getState().setSessionExpiredModal(true);
        setIsDeleteModalOpen(false);
      } else {
        alert('An error occurred while deleting your account. Please try again.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const displayName = user?.displayName || guestName || 'Guest User';
  const activeProfileObj = cloudProfiles[activeProfileId];
  const email = user?.email || 'Local offline session';
  const initial = displayName.charAt(0).toUpperCase();
  const dk = theme === 'dark';

  const toggleProfileMenu = () => {
    setIsOpen((prev) => {
      if (prev) {
        setIsEditingName(false);
        setIsCreatingProfile(false);
        setEditingProfileId(null);
        setConfirmDeleteProfileId(null);
      }
      return !prev;
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Avatar Button */}
      <button
        onClick={toggleProfileMenu}
        title="Open profile, sub-profiles & settings"
        className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-95 border-2 ${
          isOpen
            ? 'border-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.28)] bg-emerald-500/10'
            : dk
              ? 'bg-slate-800 border-slate-700 hover:border-emerald-500/50'
              : 'bg-slate-100 border-slate-300 hover:border-emerald-400'
        }`}
      >
        {user?.photoURL
          ? <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
          : <UserAvatarIcon />
        }
        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 ${
          dk ? 'border-slate-900' : 'border-white'
        } ${isAuthenticated ? 'bg-emerald-500' : 'bg-slate-500'}`} />
      </button>

      {/* Redesigned Profile Card Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className={`absolute right-0 top-14 w-[340px] max-w-[92vw] z-[120] rounded-[1.75rem] shadow-2xl border overflow-hidden backdrop-blur-2xl flex flex-col max-h-[82vh] ${
              dk ? 'bg-slate-900/95 border-slate-700/70' : 'bg-white/95 border-slate-200'
            }`}
          >
            {/* Pinned Non-Clipped Identity Header */}
            <div className={`shrink-0 p-4 border-b relative ${
              isAdmin
                ? (dk ? 'bg-gradient-to-br from-purple-600/20 via-slate-900 to-slate-900 border-slate-800' : 'bg-gradient-to-br from-purple-50 via-white to-white border-slate-200')
                : isAuthenticated
                  ? (dk ? 'bg-gradient-to-br from-emerald-500/15 via-slate-900 to-slate-900 border-slate-800' : 'bg-gradient-to-br from-emerald-50 via-white to-white border-slate-200')
                  : (dk ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50/80 border-slate-200')
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-lg font-black overflow-hidden border-2 shadow-sm ${
                  dk
                    ? 'bg-slate-800 border-emerald-500/35 text-emerald-400'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}>
                  {user?.photoURL
                    ? <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    : initial
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`font-black text-sm tracking-tight truncate ${dk ? 'text-white' : 'text-slate-900'}`}>
                        {displayName}
                      </span>
                      {!isEditingName && (
                        <button
                          type="button"
                          onClick={() => { setTempName(displayName); setIsEditingName(true); }}
                          title="Edit display name"
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                            dk
                              ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50'
                              : 'bg-white border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-400'
                          }`}
                        >
                          <EditIcon />
                        </button>
                      )}
                    </div>

                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
                      isAdmin
                        ? 'bg-purple-500/20 text-purple-300 border-purple-400/40'
                        : isAuthenticated
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-400/35'
                          : dk
                            ? 'bg-slate-800 text-slate-300 border-slate-700'
                            : 'bg-white text-slate-600 border-slate-200'
                    }`}>
                      {isAdmin ? 'Admin' : isAuthenticated ? 'Cloud' : 'Guest'}
                    </span>
                  </div>

                  <p className={`text-[11px] font-medium truncate mt-0.5 ${dk ? 'text-slate-400' : 'text-slate-500'}`}>
                    {email}
                  </p>
                </div>
              </div>

              {/* Clean Full-Width Inline Name Editor (Edit / Clear / Save / Cancel) */}
              {isEditingName && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-3 p-2.5 rounded-xl border ${
                    dk ? 'bg-slate-800/80 border-emerald-500/40' : 'bg-white border-emerald-400/60 shadow-xs'
                  }`}
                >
                  <label className={`block text-[9px] font-black uppercase tracking-widest mb-1.5 ${dk ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    Edit Display Name
                  </label>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors ${
                    dk ? 'bg-slate-900/90 border-slate-700 focus-within:border-emerald-500' : 'bg-slate-50 border-slate-200 focus-within:border-emerald-500'
                  }`}>
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleNameSave();
                        if (e.key === 'Escape') { e.stopPropagation(); setIsEditingName(false); }
                      }}
                      placeholder="Enter name..."
                      maxLength={40}
                      autoFocus
                      className={`flex-1 min-w-0 bg-transparent text-xs font-bold focus:outline-none ${
                        dk ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                    {tempName.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setTempName('');
                          nameInputRef.current?.focus();
                        }}
                        title="Clear name"
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          dk ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white' : 'bg-slate-200 text-slate-500 hover:bg-slate-300 hover:text-slate-800'
                        }`}
                      >
                        <ClearIcon />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingName(false)}
                      disabled={isSavingName}
                      className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-colors ${
                        dk ? 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleNameSave}
                      disabled={!tempName.trim() || isSavingName}
                      className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 transition-all"
                    >
                      <CheckIcon />
                      <span>{isSavingName ? 'Saving…' : 'Save'}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="p-4 flex flex-col gap-3.5 overflow-y-auto no-scrollbar">

              {/* Metric Cards Row */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className={`rounded-2xl p-3 border flex flex-col justify-between ${
                  dk ? 'bg-slate-800/45 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                }`}>
                  <span className={`text-[9px] uppercase tracking-widest font-black ${dk ? 'text-slate-400' : 'text-slate-500'}`}>
                    Profile XP
                  </span>
                  <span className={`text-xl font-black tabular-nums mt-0.5 ${dk ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {totalXP}
                  </span>
                </div>
                <div className={`rounded-2xl p-3 border flex flex-col justify-between ${
                  dk ? 'bg-slate-800/45 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                }`}>
                  <span className={`text-[9px] uppercase tracking-widest font-black ${dk ? 'text-slate-400' : 'text-slate-500'}`}>
                    Best Streak
                  </span>
                  <span className={`text-xl font-black tabular-nums mt-0.5 ${dk ? 'text-orange-400' : 'text-orange-500'}`}>
                    {bestStreak}d
                  </span>
                </div>
              </div>

              {/* Multi-Profile Switcher & Manager (Signed-In Users) */}
              {isAuthenticated && (
                <div className={`rounded-2xl p-3 border ${dk ? 'bg-slate-800/35 border-slate-800' : 'bg-slate-50/90 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${dk ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      Profiles ({profileList.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingProfile((v) => !v)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                        isCreatingProfile
                          ? (dk ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700')
                          : (dk ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/25' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200')
                      }`}
                    >
                      {isCreatingProfile ? <ClearIcon /> : <PlusIcon />}
                      <span>{isCreatingProfile ? 'Close' : 'New Profile'}</span>
                    </button>
                  </div>

                  {isCreatingProfile && (
                    <form onSubmit={handleCreateNewProfile} className="flex gap-1.5 mb-2.5">
                      <div className={`flex-1 flex items-center gap-1 px-2.5 py-1.5 rounded-xl border ${
                        dk ? 'bg-slate-900 border-slate-700 focus-within:border-emerald-500' : 'bg-white border-slate-300 focus-within:border-emerald-500'
                      }`}>
                        <input
                          type="text"
                          value={newProfileName}
                          onChange={(e) => setNewProfileName(e.target.value)}
                          placeholder="Profile name..."
                          maxLength={24}
                          autoFocus
                          className={`flex-1 min-w-0 bg-transparent text-xs font-bold focus:outline-none ${
                            dk ? 'text-white placeholder:text-slate-500' : 'text-slate-800 placeholder:text-slate-400'
                          }`}
                        />
                        {newProfileName.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setNewProfileName('')}
                            title="Clear"
                            className="text-slate-400 hover:text-slate-200"
                          >
                            <ClearIcon />
                          </button>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={!newProfileName.trim()}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 text-[10px] font-black uppercase tracking-wider"
                      >
                        Add
                      </button>
                    </form>
                  )}

                  <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar">
                    {profileList.map((prof) => {
                      const isCurrent = prof.id === activeProfileId;
                      const isRenamingThis = editingProfileId === prof.id;
                      const isConfirmingDel = confirmDeleteProfileId === prof.id;

                      return (
                        <div
                          key={prof.id}
                          onClick={() => !isRenamingThis && !isConfirmingDel && switchCloudProfile(prof.id)}
                          className={`flex items-center justify-between px-2.5 py-2 rounded-xl border cursor-pointer transition-all ${
                            isCurrent
                              ? dk
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-white'
                                : 'bg-emerald-50 border-emerald-300 text-slate-900'
                              : dk
                                ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300'
                                : 'bg-white border-slate-200/80 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${isCurrent ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]' : (dk ? 'bg-slate-600' : 'bg-slate-300')}`} />
                            {isRenamingThis ? (
                              <div className="flex items-center gap-1 flex-1 min-w-0" onClick={e => e.stopPropagation()}>
                                <div className={`flex items-center gap-1 flex-1 min-w-0 px-2 py-0.5 rounded-lg border ${
                                  dk ? 'bg-slate-900 border-emerald-500' : 'bg-white border-emerald-500'
                                }`}>
                                  <input
                                    type="text"
                                    value={editingProfileTempName}
                                    onChange={e => setEditingProfileTempName(e.target.value)}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') handleSaveProfileRename(prof.id);
                                      if (e.key === 'Escape') { e.stopPropagation(); setEditingProfileId(null); }
                                    }}
                                    autoFocus
                                    className={`flex-1 min-w-0 bg-transparent text-xs font-bold focus:outline-none ${
                                      dk ? 'text-white' : 'text-slate-900'
                                    }`}
                                  />
                                  {editingProfileTempName.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => setEditingProfileTempName('')}
                                      title="Clear"
                                      className="text-slate-400 hover:text-slate-200 shrink-0"
                                    >
                                      <ClearIcon />
                                    </button>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleSaveProfileRename(prof.id)}
                                  title="Save profile name"
                                  className="w-6 h-6 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shrink-0"
                                >
                                  <CheckIcon />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingProfileId(null)}
                                  title="Cancel"
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${dk ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-200'}`}
                                >
                                  <ClearIcon />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-xs font-black truncate">{prof.name}</span>
                                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${
                                  prof.id === 'main'
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : dk ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {prof.id === 'main' ? 'Main' : 'Sub'}
                                </span>
                              </div>
                            )}
                          </div>

                          {!isRenamingThis && (
                            <div className="flex items-center gap-1 shrink-0 ml-1" onClick={e => e.stopPropagation()}>
                              {isConfirmingDel ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      deleteCloudProfile(prof.id);
                                      setConfirmDeleteProfileId(null);
                                    }}
                                    className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[9px] font-black uppercase"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteProfileId(null)}
                                    className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${dk ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-600'}`}
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingProfileId(prof.id);
                                      setEditingProfileTempName(prof.name);
                                      setConfirmDeleteProfileId(null);
                                    }}
                                    className={`p-1 rounded-lg transition-colors ${dk ? 'text-slate-400 hover:bg-slate-800 hover:text-emerald-400' : 'text-slate-400 hover:bg-slate-200 hover:text-emerald-600'}`}
                                    title="Rename profile"
                                  >
                                    <EditIcon />
                                  </button>
                                  {prof.id !== 'main' && (
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteProfileId(prof.id)}
                                      className="p-1 rounded-lg text-slate-400 hover:bg-rose-500/15 hover:text-rose-400 transition-colors"
                                      title="Delete sub-profile"
                                    >
                                      <TrashIcon />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Compact Backup Row */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { handleExport(); setIsOpen(false); }}
                  title="Download a JSON backup of your habits and progress"
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-[11px] font-black transition-all ${
                    dk ? 'bg-slate-800/60 border-slate-800 text-slate-200 hover:border-slate-600 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <ExportIcon />
                  <span>Export</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload and restore a JSON backup file"
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-[11px] font-black transition-all ${
                    dk ? 'bg-slate-800/60 border-slate-800 text-slate-200 hover:border-slate-600 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <ImportIcon />
                  <span>Import</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Account Actions */}
              <div className="space-y-1.5">
                {isAdmin && (
                  <Link
                    to="/admin-panel"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-black transition-all w-full ${
                      dk ? 'bg-purple-500/10 border-purple-500/25 text-purple-300 hover:bg-purple-500/20' : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                    }`}
                  >
                    <AdminIcon />
                    <span>Super Admin Command Center</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleSwitchProfile}
                  title="Switch between Cloud & Saved Guest accounts"
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all w-full text-left ${
                    dk ? 'bg-slate-800/40 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <SwitchUserIcon />
                  <span>{isAuthenticated ? 'Switch Account / Guest Mode' : 'Switch Guest Account'}</span>
                </button>

                {isAuthenticated ? (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { handleLogout(); setIsOpen(false); }}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-black transition-all ${
                        dk ? 'bg-orange-500/10 border-orange-500/25 text-orange-400 hover:bg-orange-500/20' : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
                      }`}
                    >
                      <LogoutIcon />
                      <span>Sign Out</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsDeleteModalOpen(true); setIsOpen(false); }}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-black transition-all ${
                        dk ? 'bg-rose-500/10 border-rose-500/25 text-rose-400 hover:bg-rose-500/20' : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                      }`}
                    >
                      <TrashIcon />
                      <span>Delete</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSyncClick}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-black text-xs transition-all active:scale-95 bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
                  >
                    <SyncIcon />
                    <span>Sign In or Create Cloud Account</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Restore Backup Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {importPayload && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className={`${dk ? 'bg-slate-900 border-slate-700/50' : 'bg-white border-slate-200'} z-[101] border shadow-2xl rounded-2xl w-full max-w-md p-6`}
              >
                <h2 className={`text-xl font-black mb-2 ${dk ? 'text-white' : 'text-slate-900'}`}>Restore Backup</h2>
                <p className={`text-sm mb-6 ${dk ? 'text-slate-400' : 'text-slate-600'}`}>How would you like to load this data into {activeProfileObj?.name || 'this profile'}?</p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => { importData(importPayload, 'merge'); setImportPayload(null); setIsOpen(false); }}
                    className="w-full py-3 px-4 rounded-xl text-left bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
                  >
                    <div className="font-black text-emerald-500 text-sm">Merge Safely</div>
                    <div className={`text-xs mt-1 ${dk ? 'text-slate-400' : 'text-slate-500'}`}>Fills in missing days. Current progress is kept intact.</div>
                  </button>
                  <button
                    onClick={() => { importData(importPayload, 'overwrite'); setImportPayload(null); setIsOpen(false); }}
                    className="w-full py-3 px-4 rounded-xl text-left bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors"
                  >
                    <div className="font-black text-red-500 text-sm">Overwrite All</div>
                    <div className={`text-xs mt-1 ${dk ? 'text-slate-400' : 'text-slate-500'}`}>Completely replaces your current profile data with the backup.</div>
                  </button>
                  <button
                    onClick={() => { setImportPayload(null); setIsOpen(false); }}
                    className={`w-full py-3 px-4 rounded-xl font-black text-sm border transition-colors ${dk ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Delete Account Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isDeleteModalOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className={`${dk ? 'bg-slate-900 border-red-900/50' : 'bg-white border-red-200'} z-[101] border shadow-2xl rounded-2xl w-full max-w-md p-6`}
              >
                <h2 className="text-xl font-black mb-2 text-red-500">Delete Account?</h2>
                <p className={`text-sm mb-6 ${dk ? 'text-slate-400' : 'text-slate-600'}`}>
                  This action is <strong>permanent</strong> and cannot be undone. All your profiles, habits, progress, and data will be wiped completely.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className={`w-full py-3 px-4 rounded-xl text-center font-black text-sm bg-red-500 text-white hover:bg-red-600 transition-colors ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isDeleting ? 'Deleting…' : 'Yes, delete my account'}
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={isDeleting}
                    className={`w-full py-3 px-4 rounded-xl font-black text-sm border transition-colors ${dk ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Backup Error State Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {backupErrorInfo && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setBackupErrorInfo(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`${dk ? 'bg-slate-900 border-amber-500/40' : 'bg-white border-amber-400'} border shadow-2xl rounded-2xl w-full max-w-md p-6`}
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-4 text-2xl">
                  ⚠️
                </div>
                <h2 className={`text-lg font-black mb-1.5 ${dk ? 'text-white' : 'text-slate-900'}`}>Invalid Backup File</h2>
                <p className={`text-xs mb-1 ${dk ? 'text-slate-400' : 'text-slate-500'}`}>
                  File: <span className={`font-mono font-bold ${dk ? 'text-slate-300' : 'text-slate-700'}`}>{backupErrorInfo.fileName}</span>
                </p>
                <p className={`text-xs mb-3 leading-relaxed ${dk ? 'text-slate-300' : 'text-slate-600'}`}>
                  {backupErrorInfo.reason}
                </p>
                <div className={`p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium mb-6 ${dk ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  🛡️ {backupErrorInfo.reassurance}
                </div>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => {
                      setBackupErrorInfo(null);
                      fileInputRef.current?.click();
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    Try Another File
                  </button>
                  <button
                    onClick={() => setBackupErrorInfo(null)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider border transition-colors ${dk ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
