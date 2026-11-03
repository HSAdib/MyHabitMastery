## File: src/components/HeaderProfile.jsx (Continued)
Location: `src/components/HeaderProfile.jsx` (Continued)

```jsx
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold text-sm truncate ${dk ? 'text-white' : 'text-slate-900'}`}>
                        {displayName}
                      </span>
                      <button
                        onClick={() => { setTempName(displayName); setIsEditingName(true); }}
                        className={`opacity-40 hover:opacity-80 transition-opacity shrink-0 ${
                          dk ? 'text-slate-300' : 'text-slate-600'
                        }`}
                        title="Edit account name"
                      >
                        <EditIcon/>
                      </button>
                    </div>
                  )}
                  <p className={`text-[11px] truncate mt-0.5 ${dk ? 'text-slate-500' : 'text-slate-400'}`}>{email}</p>
                </div>

                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
                  isAdmin
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : isAuthenticated
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : dk
                        ? 'bg-slate-700/80 text-slate-300 border-slate-600'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {isAdmin ? 'Super Admin' : isAuthenticated ? 'Cloud' : 'Guest'}
                </span>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className={`rounded-xl p-2.5 text-center ${dk ? 'bg-slate-800/70' : 'bg-slate-100'}`}>
                  <p className={`text-[9px] uppercase tracking-widest font-black mb-0.5 ${dk ? 'text-slate-500' : 'text-slate-400'}`}>
                    Profile XP
                  </p>
                  <p className={`text-xl font-black ${dk ? 'text-emerald-400' : 'text-emerald-600'}`}>{totalXP}</p>
                </div>
                <div className={`rounded-xl p-2.5 text-center ${dk ? 'bg-slate-800/70' : 'bg-slate-100'}`}>
                  <p className={`text-[9px] uppercase tracking-widest font-black mb-0.5 ${dk ? 'text-slate-500' : 'text-slate-400'}`}>
                    Best Streak
                  </p>
                  <p className={`text-xl font-black ${dk ? 'text-orange-400' : 'text-orange-500'}`}>{bestStreak}d</p>
                </div>
              </div>

              {/* MULTI-PROFILE SWITCHER & MANAGER (1 Main + Sub-Profiles for Signed-In Users) */}
              {isAuthenticated && (
                <div className={`rounded-xl p-3 border ${dk ? 'bg-slate-900/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${dk ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      Profiles ({profileList.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingProfile(!isCreatingProfile)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                        dk ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      }`}
                    >
                      <PlusIcon/>
                      <span>New Profile</span>
                    </button>
                  </div>

                  {isCreatingProfile && (
                    <form onSubmit={handleCreateNewProfile} className="flex gap-1.5 mb-2">
                      <input
                        type="text"
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        placeholder="Profile name (e.g. Exam Prep)..."
                        maxLength={24}
                        autoFocus
                        className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border focus:outline-none ${
                          dk ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500'
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={!newProfileName.trim()}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white text-xs font-black"
                      >
                        Add
                      </button>
                    </form>
                  )}

                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
                    {profileList.map((prof) => {
                      const isCurrent = prof.id === activeProfileId;
                      const isRenamingThis = editingProfileId === prof.id;

                      return (
                        <div
                          key={prof.id}
                          onClick={() => !isRenamingThis && switchCloudProfile(prof.id)}
                          className={`flex items-center justify-between px-2.5 py-2 rounded-xl border cursor-pointer transition-all ${
                            isCurrent
                              ? dk
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-white'
                                : 'bg-emerald-50 border-emerald-300 text-slate-900'
                              : dk
                                ? 'bg-slate-800/50 border-slate-800 hover:bg-slate-800 text-slate-300'
                                : 'bg-white border-slate-200/80 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${isCurrent ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                            {isRenamingThis ? (
                              <div className="flex items-center gap-1 flex-1" onClick={e => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={editingProfileTempName}
                                  onChange={e => setEditingProfileTempName(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') handleSaveProfileRename(prof.id);
                                    if (e.key === 'Escape') setEditingProfileId(null);
                                  }}
                                  autoFocus
                                  className={`w-full px-1.5 py-0.5 rounded text-xs font-bold border focus:outline-none ${
                                    dk ? 'bg-slate-900 border-emerald-500 text-white' : 'bg-white border-emerald-500 text-slate-900'
                                  }`}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveProfileRename(prof.id)}
                                  className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded"
                                >
                                  <CheckIcon/>
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-xs font-black truncate">{prof.name}</span>
                                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${
                                  prof.id === 'main'
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : dk ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-600'
                                }`}>
                                  {prof.id === 'main' ? 'Main' : 'Sub'}
                                </span>
                              </div>
                            )}
                          </div>

                          {!isRenamingThis && (
                            <div className="flex items-center gap-1 shrink-0 ml-1" onClick={e => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProfileId(prof.id);
                                  setEditingProfileTempName(prof.name);
                                }}
                                className="p-1 rounded hover:bg-slate-700/50 text-slate-400 hover:text-emerald-400 transition-colors"
                                title="Rename profile"
                              >
                                <EditIcon/>
                              </button>
                              {prof.id !== 'main' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Delete sub-profile "${prof.name}" permanently?`)) {
                                      deleteCloudProfile(prof.id);
                                    }
                                  }}
                                  className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                                  title="Delete sub-profile"
                                >
                                  <TrashIcon/>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action list */}
              <div className={`rounded-xl overflow-hidden border ${dk ? 'border-slate-700/50' : 'border-slate-200'}`}>
                {isAdmin && (
                  <Link
                    to="/admin-panel"
                    onClick={() => setIsOpen(false)}
                    className={rowCls('purple', false)}
                  >
                    <AdminIcon/>
                    Super Admin Command Center
                  </Link>
                )}

                {!isAuthenticated && (
                  <button onClick={handleSyncClick} className={rowCls('default', false)}>
                    <SyncIcon/>
                    Sign In to Sync
                  </button>
                )}

                <button
                  onClick={() => { handleExport(); setIsOpen(false); }}
                  className={rowCls('default', !isAuthenticated || isAdmin)}
                  title="Download a JSON backup of your habits and progress"
                >
                  <ExportIcon/>
                  Download Progress (.json)
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={rowCls('default')}
                  title="Upload and restore a JSON backup file"
                >
                  <ImportIcon/>
                  Upload Progress (.json)
                </button>

                <button
                  onClick={handleSwitchProfile}
                  className={rowCls('default')}
                  title="Switch between Cloud & Saved Guest accounts"
                >
                  <SwitchUserIcon/>
                  {isAuthenticated ? 'Switch Account / Guest Mode' : 'Switch Guest Account'}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {isAuthenticated && (
                  <>
                    <button onClick={() => { handleLogout(); setIsOpen(false); }} className={rowCls('orange')}>
                      <LogoutIcon/>
                      Sign Out
                    </button>
                    <button onClick={() => { setIsDeleteModalOpen(true); setIsOpen(false); }} className={rowCls('red')}>
                      <TrashIcon/>
                      Delete Account
                    </button>
                  </>
                )}
              </div>

              {!isAuthenticated && (
                <button
                  onClick={() => { handleLogin(); setIsOpen(false); }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-black text-xs transition-all active:scale-95 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/25"
                >
                  <GuestIcon/>
                  Sign In or Create Cloud Account
                </button>
              )}
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
                className="bg-slate-900 z-[101] border border-slate-700/50 shadow-2xl rounded-2xl w-full max-w-md p-6"
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
                className={`bg-slate-900 z-[101] border ${dk ? 'border-red-900/50' : 'border-red-200'} shadow-2xl rounded-2xl w-full max-w-md p-6`}
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
      {/* 03/10 Backup Error State Modal */}
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
                className={`bg-slate-900 border ${dk ? 'border-amber-500/40' : 'border-amber-400'} shadow-2xl rounded-2xl w-full max-w-md p-6`}
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 text-2xl">
                  ⚠️
                </div>
                <h2 className="text-lg font-black mb-1.5 text-white">Invalid Backup File</h2>
                <p className="text-xs text-slate-400 mb-1">
                  File: <span className="font-mono text-slate-300 font-bold">{backupErrorInfo.fileName}</span>
                </p>
                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  {backupErrorInfo.reason}
                </p>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-medium mb-6">
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
                    className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
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
```

---

## File: src/components/NamePromptModal.jsx
Location: `src/components/NamePromptModal.jsx`

```jsx
import React, { useState, useEffect, useCallback } from 'react';
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
 * NamePromptModal
 *
 * Supports two modes:
 *  - Uncontrolled (legacy): rendered by App when !guestName && !isAuthenticated → always visible
 *  - Controlled: pass `isOpen` + `onClose` to open/close on demand (e.g. from profile dropdown)
 */
export default function NamePromptModal({ onOpenAuthModal, isOpen, onClose }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleSlowNetwork, setGoogleSlowNetwork] = useState(false);
  const [googlePopupBlocked, setGooglePopupBlocked] = useState(false);
  const [authError, setAuthError] = useState('');
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [showNewGuestForm, setShowNewGuestForm] = useState(false);
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

  const loadAccounts = useCallback(async (resetView = false) => {
    try {
      const list = await listGuestAccounts();
      const sorted = (list || []).sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
      setSavedAccounts(sorted);
      if (resetView) {
        setShowNewGuestForm(sorted.length === 0);
      }
    } catch (e) {
      console.warn("Failed to list guest accounts:", e);
    }
  }, [listGuestAccounts]);

  useEffect(() => {
    if (visible) {
      loadAccounts(true);
    }
  }, [visible, loadAccounts]);

  const handleGuestSubmit = async (e) => {
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

    await createNewGuestAccount(trimmed);
    setName('');
    if (controlled && onClose) onClose();
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
    await loadAccounts(false);
  };

  // 05/10 Slow Network State timer for Google Sign In
  useEffect(() => {
    let timer;
    if (googleLoading) {
      timer = setTimeout(() => {
        setGoogleSlowNetwork(true);
      }, 3500);
    } else {
      setGoogleSlowNetwork(false);
    }
    return () => clearTimeout(timer);
  }, [googleLoading]);

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setGooglePopupBlocked(false);
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      if (controlled && onClose) onClose();
    } catch (err) {
      console.error('Google Sign-in failed:', err);
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request' || err.code === 'auth/unauthorized-domain') {
        setGooglePopupBlocked(true);
      } else if (err.code !== 'auth/popup-closed-by-user') {
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
          key="name-prompt-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={controlled && onClose ? onClose : undefined}
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            key="name-prompt-card"
            initial={{ scale: 0.95, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 24 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}
            className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 relative overflow-hidden border shadow-2xl my-auto ${
              dk
                ? 'bg-slate-900/95 border-slate-700/60 shadow-[0_0_60px_rgba(16,185,129,0.12)] text-white'
                : 'bg-white/95 border-slate-200/80 shadow-[0_20px_60px_rgba(0,0,0,0.15)] text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Lighting Orbs */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close button — only in controlled mode */}
            {controlled && onClose && (
              <button
                onClick={onClose}
                className={`absolute top-4 right-4 z-10 p-1.5 rounded-lg transition-colors ${
                  dk
                    ? 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
                title="Close"
              >
                <CloseIcon />
              </button>
            )}

            {/* Modal Header */}
            <div className="text-center mb-6 relative z-10">
              <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${
                dk
                  ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10'
                  : 'bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-600 border border-emerald-200 shadow-emerald-200/50'
              }`}>
                <SparklesIcon />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                Welcome to Habit Mastery
              </h2>
              <p className={`text-xs sm:text-sm font-medium mt-2 max-w-sm mx-auto leading-relaxed ${
                dk ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Select how you'd like to get started. Sync across devices or start tracking locally.
              </p>
            </div>

            <div className="relative z-10 flex flex-col gap-5">
              {/* FAST-TRACK: Google Sign-In */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  title="Continue with Google Account"
                  className={`group relative flex items-center justify-between w-full p-4 rounded-2xl border transition-all active:scale-[0.99] ${
                    dk
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
                      <div className={`text-[11px] font-semibold mt-0.5 ${dk ? 'text-slate-400' : 'text-slate-500'}`}>
                        Automatic backup & multi-device sync
                      </div>
                    </div>
                  </div>

                  <div className={`p-2 rounded-xl transition-colors ${
                    dk ? 'group-hover:bg-slate-700/60 text-slate-400 group-hover:text-white' : 'group-hover:bg-slate-100 text-slate-400 group-hover:text-slate-700'
                  }`}>
                    <ArrowRightIcon />
                  </div>
                </button>

                {authError && (
                  <p className="text-red-400 text-xs font-bold px-2">{authError}</p>
                )}

                {/* 07/10 Popup Window Blocked Card */}
                {googlePopupBlocked && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-black text-amber-400 text-xs uppercase tracking-wide">
                      <span>🛡️</span>
                      <span>Popup Window Blocked</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Your browser blocked the Google Sign-In popup window. You can continue offline below as a guest or use email login.
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setGooglePopupBlocked(false);
                          setShowNewGuestForm(true);
                        }}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px] uppercase tracking-wider hover:bg-emerald-500/30"
                      >
                        Continue as Guest
                      </button>
                      {onOpenAuthModal && (
                        <button
                          type="button"
                          onClick={() => {
                            setGooglePopupBlocked(false);
                            onOpenAuthModal();
                          }}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-bold text-[10px] uppercase tracking-wider hover:bg-slate-700"
                        >
                          Email & Password
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 05/10 Slow Network State Banner */}
                {googleSlowNetwork && googleLoading && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span>Slow network detected...</span>
                      <span className="animate-pulse">Connecting</span>
                    </div>
                    <div className="w-full bg-amber-900/40 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-amber-400 h-1.5 rounded-full animate-pulse w-3/4"></div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setGoogleLoading(false);
                        setShowNewGuestForm(true);
                      }}
                      className="w-full py-1.5 text-center font-black text-[10px] uppercase tracking-wider text-amber-300 hover:text-white hover:underline transition-all cursor-pointer"
                    >
                      Continue in Offline Guest Mode →
                    </button>
                  </div>
                )}
              </div>

              {/* DIVIDER */}
              <div className="relative my-0.5">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${dk ? 'border-slate-800' : 'border-slate-200'}`} />
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                  <span className={`px-3 py-1 rounded-full ${
                    dk ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-400 border border-slate-100'
                  }`}>
                    Or start offline
                  </span>
                </div>
              </div>

              {/* ── OFFLINE SECTION: SAVED ACCOUNTS OR NEW GUEST FORM ── */}
              {savedAccounts.length > 0 && !showNewGuestForm ? (
                /* Previously Saved Guest Accounts List */
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider ${dk ? 'text-slate-300' : 'text-slate-600'}`}>
                      Saved Guest Accounts
                    </span>
                    <span className={`text-[11px] font-medium ${dk ? 'text-slate-500' : 'text-slate-400'}`}>
                      Stored locally
                    </span>
                  </div>

                  <div className={`rounded-2xl border divide-y overflow-hidden max-h-52 overflow-y-auto ${
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
                            isActive
                              ? dk ? 'bg-emerald-500/10' : 'bg-emerald-50/80'
                              : dk ? 'hover:bg-slate-800/80' : 'hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm text-white bg-gradient-to-br ${avatarColor(acc.name)} shadow-sm`}>
                              {(acc.name || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-sm font-bold truncate ${dk ? 'text-white' : 'text-slate-900'}`}>
                                  {acc.name}
                                </span>
                                {isActive && (
                                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shrink-0">
                                    Current
                                  </span>
                                )}
                              </div>
                              <span className={`text-[11px] ${dk ? 'text-slate-500' : 'text-slate-400'}`}>
                                Saved {timeAgo(acc.savedAt)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-2" onClick={e => e.stopPropagation()}>
                            {isDeleting ? (
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-semibold ${dk ? 'text-slate-400' : 'text-slate-500'}`}>Delete?</span>
                                <button
```

---

