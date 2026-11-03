## File: src/components/NamePromptModal.jsx (Continued)
Location: `src/components/NamePromptModal.jsx` (Continued)

```jsx
                                  type="button"
                                  onClick={(e) => handleDeleteAccount(e, acc.id)}
                                  className="px-2 py-1 rounded-lg text-xs font-black bg-red-500 hover:bg-red-600 text-white transition-colors"
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className={`px-2 py-1 rounded-lg text-xs font-black border transition-colors ${
                                    dk ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleSelectAccount(acc.id)}
                                  disabled={isLoadingThis}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 ${
                                    isActive
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
                                  }`}
                                >
                                  {isLoadingThis ? 'Loading…' : isActive ? 'Active' : 'Continue'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(acc.id)}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    dk ? 'text-slate-500 hover:text-red-400 hover:bg-red-900/20' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                                  }`}
                                  title="Delete profile"
                                >
                                  <TrashIcon />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add New Guest Account Button */}
                  <button
                    type="button"
                    onClick={() => setShowNewGuestForm(true)}
                    className={`flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-black text-xs border transition-all active:scale-[0.99] ${
                      dk
                        ? 'border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-white hover:border-slate-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <PlusIcon />
                    <span>Add New Guest Account</span>
                  </button>
                </div>
              ) : (
                /* New Guest Account Form */
                <form onSubmit={handleGuestSubmit} className="flex flex-col gap-3.5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {savedAccounts.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowNewGuestForm(false)}
                            className={`p-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                              dk ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                            }`}
                            title="Back to saved accounts"
                          >
                            <ArrowLeftIcon />
                            <span>Saved</span>
                          </button>
                        )}
                        <label className={`text-xs font-bold uppercase tracking-wider ${
                          dk ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                          {savedAccounts.length > 0 ? 'New Guest Account' : 'Join as Guest'}
                        </label>
                      </div>
                      <span className={`text-[11px] font-medium ${
                        dk ? 'text-slate-500' : 'text-slate-400'
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
                        dk
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
                      dk ? 'text-slate-400' : 'text-slate-500'
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
                              : dk
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
              )}

              {/* Email Login Alternative */}
              {onOpenAuthModal && (
                <div className="text-center pt-2 border-t border-slate-800/30">
                  <button
                    type="button"
                    onClick={onOpenAuthModal}
                    className={`text-xs font-bold transition-colors underline decoration-slate-600 underline-offset-4 ${
                      dk ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-500 hover:text-emerald-600'
                    }`}
                  >
                    Prefer email & password? Log in here
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
```

---

## File: src/components/ProtectedAdminRoute.jsx
Location: `src/components/ProtectedAdminRoute.jsx`

```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useHabitStore } from '../store/useHabitStore';

export const SUPER_ADMIN_EMAIL = 'hasanshahriaradib@gmail.com';

export default function ProtectedAdminRoute({ children }) {
  const user = useHabitStore((state) => state.user);
  const isAuthenticated = useHabitStore((state) => state.isAuthenticated);
  const isHydrating = useHabitStore((state) => state.isHydrating);
  const authInitialized = useHabitStore((state) => state.authInitialized);

  // 02/10 Loading State: Shape of the Admin Panel coming
  if (isHydrating || !authInitialized) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 font-sans">
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
          <div className="h-16 bg-slate-900 rounded-2xl border border-slate-800" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-900 rounded-2xl border border-slate-800" />
            ))}
          </div>
          <div className="h-96 bg-slate-900 rounded-3xl border border-slate-800" />
        </div>
      </div>
    );
  }

  const isAdmin = isAuthenticated && user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL;

  // 07/10 Permission Denied State: Explain why & give a way back
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-5 text-2xl">
            🛡️
          </div>
          <h2 className="text-2xl font-black mb-2">Super Admin Access Only</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            This command center is restricted to the platform administrator (<span className="text-slate-200 font-mono">{SUPER_ADMIN_EMAIL}</span>). Your personal habit data and profiles remain 100% accessible on your dashboard.
          </p>
          <div className="flex flex-col gap-2.5">
            <Link className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20" to="/">
              Return to My Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
```

---

## File: src/store/useHabitStore.js
Location: `src/store/useHabitStore.js`

```js
import { create } from 'zustand';
import { get, set } from 'idb-keyval';
import { auth, db } from '../firebase.config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { loadConfettiScript } from '../utils';

let _unsubAuthState = null;
let _unsubSnapshot  = null;
let _isApplyingRemote = false;

const UI_ONLY_FIELDS = [
  'isHydrating', 'user', 'isAuthenticated', 'authInitialized',
  'isImpersonating', 'impersonatedUserName', 'impersonatedProfileId', 'adminSavedState',
  'currentDate', 'viewingHabitMap', 'heatmapFilter', 'weeklyGraphFilter',
  'dashboardGraphFilter', 'selectedCategory', 'editingHabitName',
  'editingManageListHabitName', 'importStatus',
  'actionToast', 'sessionExpiredModal',
];

const PROFILE_SCOPED_KEYS = [
  'trackerData', 'habits', 'habitConfigs', 'categories',
  'archivedHabits', 'shieldedDates', 'savedLevel',
  'manualXPOffset', 'manualStreakOffset',
];

const DEFAULT_HABITS = ["sleep 7h", "calisthenics", "meditation", "dept study", "coding", "vocab", "audiobook"];
const DEFAULT_CONFIGS = {
  "sleep 7h": { steps: 1 },
  "calisthenics": { steps: 1 },
  "meditation": { steps: 1 },
  "dept study": { steps: 1 },
  "coding": { steps: 1 },
  "vocab": { steps: 15 },
  "audiobook": { steps: 1 }
};
const DEFAULT_CATEGORIES = ["all", "health", "academic", "dev", "lifestyle"];

const extractProfileSnapshot = (source, fallbackName = 'Main Profile', id = 'main', isMain = false) => ({
  id,
  name: source?.name || fallbackName,
  isMain: Boolean(isMain || id === 'main'),
  createdAt: source?.createdAt || Date.now(),
  updatedAt: Date.now(),
  trackerData: source?.trackerData && typeof source.trackerData === 'object' ? source.trackerData : {},
  habits: Array.isArray(source?.habits) ? source.habits : DEFAULT_HABITS,
  habitConfigs: source?.habitConfigs && typeof source.habitConfigs === 'object' ? source.habitConfigs : DEFAULT_CONFIGS,
  categories: Array.isArray(source?.categories) ? source.categories : DEFAULT_CATEGORIES,
  archivedHabits: Array.isArray(source?.archivedHabits) ? source.archivedHabits : [],
  shieldedDates: Array.isArray(source?.shieldedDates) ? source.shieldedDates : [],
  savedLevel: Number(source?.savedLevel) || 1,
  manualXPOffset: Number(source?.manualXPOffset) || 0,
  manualStreakOffset: Number(source?.manualStreakOffset) || 0,
});

const toPersistedData = (state) => {
  const activeId = state.activeProfileId || 'main';
  const existingProfiles = { ...(state.cloudProfiles || {}) };
  const currentActiveProfile = extractProfileSnapshot(
    state,
    existingProfiles[activeId]?.name || (activeId === 'main' ? (state.user?.displayName || state.guestName || 'Main Profile') : 'Profile'),
    activeId,
    activeId === 'main'
  );
  existingProfiles[activeId] = currentActiveProfile;

  // Ensure 'main' always exists
  if (!existingProfiles.main) {
    existingProfiles.main = extractProfileSnapshot(
      state,
      state.user?.displayName || state.guestName || 'Main Profile',
      'main',
      true
    );
  }

  return {
    trackerData: state.trackerData || {},
    habits: Array.isArray(state.habits) ? state.habits : DEFAULT_HABITS,
    habitConfigs: state.habitConfigs || DEFAULT_CONFIGS,
    categories: Array.isArray(state.categories) ? state.categories : DEFAULT_CATEGORIES,
    archivedHabits: Array.isArray(state.archivedHabits) ? state.archivedHabits : [],
    shieldedDates: Array.isArray(state.shieldedDates) ? state.shieldedDates : [],
    theme: state.theme || 'dark',
    tableOrientation: state.tableOrientation || 'horizontal',
    textSizes: state.textSizes || { habit: 14, table1: 12, table2: 11, tabSize: 110 },
    isMobileMode: Boolean(state.isMobileMode),
    savedLevel: Number(state.savedLevel) || 1,
    guestName: state.guestName || '',
    manualXPOffset: Number(state.manualXPOffset) || 0,
    manualStreakOffset: Number(state.manualStreakOffset) || 0,
    lastUpdated: state.lastUpdated || Date.now(),
    currentUid: state.currentUid || null,
    activeProfileId: activeId,
    cloudProfiles: existingProfiles,
  };
};

export const useHabitStore = create((setStore, getStore) => ({
  isHydrating: true,
  user: null,
  isAuthenticated: false,
  authInitialized: false,
  lastUpdated: 0,
  currentUid: null,

  // Multi-Profile State (1 Main + Sub-Profiles for signed-in users)
  activeProfileId: 'main',
  cloudProfiles: {
    main: extractProfileSnapshot({}, 'Main Profile', 'main', true),
  },

  // Data State (Active Profile)
  trackerData: {},
  habits: DEFAULT_HABITS,
  habitConfigs: DEFAULT_CONFIGS,
  categories: DEFAULT_CATEGORIES,
  archivedHabits: [],
  shieldedDates: [],

  // App Settings
  theme: 'dark',
  tableOrientation: 'horizontal',
  textSizes: { habit: 14, table1: 12, table2: 11, tabSize: 110 },
  isMobileMode: false,
  savedLevel: 1,
  guestName: "",
  manualXPOffset: 0,
  manualStreakOffset: 0,

  // UI State
  isImpersonating: null,
  impersonatedUserName: "",
  impersonatedProfileId: 'main',
  adminSavedState: null,
  currentDate: new Date(),
  viewingHabitMap: null,
  heatmapFilter: 'all',
  weeklyGraphFilter: 'all',
  dashboardGraphFilter: 'all',
  selectedCategory: 'all',
  editingHabitName: null,
  editingManageListHabitName: null,
  importStatus: null,
  actionToast: null, // { title, subtitle, actionLabel, actionType, type: 'success' | 'info' | 'error' }
  sessionExpiredModal: false,

  triggerActionToast: (toastObj, duration = 5000) => {
    setStore({ actionToast: toastObj });
    if (duration > 0) {
      setTimeout(() => {
        if (getStore().actionToast === toastObj) {
          setStore({ actionToast: null });
        }
      }, duration);
    }
  },
  dismissActionToast: () => setStore({ actionToast: null }),
  setSessionExpiredModal: (val) => setStore({ sessionExpiredModal: Boolean(val) }),

  setImportStatus: (status) => setStore({ importStatus: status }),

  init: async () => {
    try {
      let data = await get('adib_habit_data');

      if (!data) {
        const localData = localStorage.getItem('habit_tracker_master_v9_data');
        if (localData) {
          data = {
            trackerData: JSON.parse(localData || '{}'),
            habits: JSON.parse(localStorage.getItem('habit_tracker_master_v9_names') || 'null') || DEFAULT_HABITS,
            habitConfigs: JSON.parse(localStorage.getItem('habit_tracker_master_v9_configs') || 'null') || DEFAULT_CONFIGS,
            categories: JSON.parse(localStorage.getItem('adib_habit_categories') || 'null') || DEFAULT_CATEGORIES,
            archivedHabits: JSON.parse(localStorage.getItem('adib_habit_archived') || 'null') || [],
            shieldedDates: [],
            theme: localStorage.getItem('adib_habit_theme') || 'dark',
            tableOrientation: localStorage.getItem('adib_table_orientation') || 'horizontal',
            textSizes: JSON.parse(localStorage.getItem('adib_text_sizes') || 'null') || { habit: 14, table1: 12, table2: 11, tabSize: 110 },
            isMobileMode: JSON.parse(localStorage.getItem('adib_mobile_mode') || 'null') || (window.innerWidth <= 768),
            savedLevel: parseInt(localStorage.getItem('adib_habit_saved_level')) || 1,
            lastUpdated: Date.now()
          };
          await set('adib_habit_data', data);
        } else {
          let dynamicHabits = DEFAULT_HABITS;
          let dynamicConfigs = DEFAULT_CONFIGS;
          let dynamicCategories = DEFAULT_CATEGORIES;

          if (db) {
            try {
              const globalRef = doc(db, 'settings', 'globalDefaults');
              const globalSnap = await getDoc(globalRef);
              if (globalSnap.exists()) {
                const globalData = globalSnap.data();
                if (globalData.habits) dynamicHabits = globalData.habits;
                if (globalData.habitConfigs) dynamicConfigs = globalData.habitConfigs;
                if (globalData.categories) dynamicCategories = globalData.categories;
              }
            } catch (e) {
              console.warn("Failed to fetch global defaults, using hardcoded.", e);
            }
          }

          data = {
            trackerData: {},
            habits: dynamicHabits,
            habitConfigs: dynamicConfigs,
            categories: dynamicCategories,
            archivedHabits: [],
            shieldedDates: [],
            theme: 'dark',
            tableOrientation: 'horizontal',
            textSizes: { habit: 14, table1: 12, table2: 11, tabSize: 110 },
            isMobileMode: window.innerWidth <= 768,
            savedLevel: 1,
            guestName: "",
            manualXPOffset: 0,
            manualStreakOffset: 0,
            activeProfileId: 'main',
            cloudProfiles: {},
            lastUpdated: Date.now()
          };
        }
      }

      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent) || window.innerWidth <= 768;

      if (data) {
        const parsedDate = data.currentDate ? new Date(data.currentDate) : new Date();
        data.currentDate = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
        if (!Array.isArray(data.habits)) data.habits = DEFAULT_HABITS;
        if (!Array.isArray(data.archivedHabits)) data.archivedHabits = [];
        if (!Array.isArray(data.shieldedDates)) data.shieldedDates = [];
        if (!Array.isArray(data.categories)) data.categories = DEFAULT_CATEGORIES;
        if (!data.trackerData || typeof data.trackerData !== 'object') data.trackerData = {};
        if (!data.habitConfigs || typeof data.habitConfigs !== 'object') data.habitConfigs = DEFAULT_CONFIGS;
        if (data.guestName === "Guest User") data.guestName = "";
        if (!data.activeProfileId) data.activeProfileId = 'main';
        if (!data.cloudProfiles || typeof data.cloudProfiles !== 'object') {
          data.cloudProfiles = {
            main: extractProfileSnapshot(data, data.guestName || 'Main Profile', 'main', true),
          };
        }
      }

      if (data && data.guestName && data.guestName.trim()) {
        try {
          const accounts = (await get('adib_guest_accounts')) || [];
          const exists = accounts.some(a => a.name.toLowerCase() === data.guestName.trim().toLowerCase());
          if (!exists) {
            accounts.unshift({
              id: Date.now().toString(),
              name: data.guestName.trim(),
              savedAt: data.lastUpdated || Date.now(),
              data: toPersistedData(data)
            });
            await set('adib_guest_accounts', accounts);
          }
        } catch (e) {
          console.warn("Failed to seed guest account:", e);
        }
      }

      setStore({
        ...data,
        isMobileMode: isMobileDevice,
        isHydrating: false
      });

      const root = window.document.documentElement;
      root.style.colorScheme = data.theme;
      if (data.theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      if (_unsubSnapshot)  { _unsubSnapshot();  _unsubSnapshot  = null; }
      if (_unsubAuthState) { _unsubAuthState(); _unsubAuthState = null; }

      if (!auth || !db) {
        setStore({ authInitialized: true });
        return;
      }

      _unsubAuthState = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setStore({ user, isAuthenticated: true, authInitialized: true });
          try {
            const userDocRef = doc(db, 'users', user.uid);
            _unsubSnapshot = onSnapshot(userDocRef, async (docSnap) => {
              if (_isApplyingRemote) return;
              if (getStore().isImpersonating) return;

              const currentStore = getStore();
              const isFirstSyncForUser = currentStore.currentUid !== user.uid;
              const localLastUpdated = currentStore.lastUpdated || 0;
              const localTracker = currentStore.trackerData || {};
              const hasLocalData = Object.keys(localTracker).length > 0;

              if (docSnap.exists()) {
                const remoteData = docSnap.data();
                const remoteLastUpdated = remoteData.lastUpdated || 0;
                const remoteTracker = remoteData.trackerData || {};
                const hasRemoteData = Object.keys(remoteTracker).length > 0;

                if (isFirstSyncForUser || remoteLastUpdated > localLastUpdated || (hasRemoteData && !hasLocalData)) {
                  _isApplyingRemote = true;
                  try {
                    const safeRemote = {};
                    Object.keys(remoteData).forEach((k) => {
                      if (!UI_ONLY_FIELDS.includes(k)) safeRemote[k] = remoteData[k];
                    });
                    if (!Array.isArray(safeRemote.shieldedDates)) safeRemote.shieldedDates = [];

                    // Hydrate cloudProfiles (1 Main + Sub-Profiles)
                    let profilesMap = safeRemote.cloudProfiles && typeof safeRemote.cloudProfiles === 'object'
                      ? { ...safeRemote.cloudProfiles }
                      : {};
                    if (!profilesMap.main) {
                      profilesMap.main = extractProfileSnapshot(
                        safeRemote,
                        remoteData.displayName || user.displayName || 'Main Profile',
                        'main',
                        true
                      );
                    }
                    const activeId = (safeRemote.activeProfileId && profilesMap[safeRemote.activeProfileId])
                      ? safeRemote.activeProfileId
                      : 'main';
                    const activeSnap = profilesMap[activeId] || profilesMap.main;

                    const mergedState = {
                      ...safeRemote,
                      currentUid: user.uid,
                      activeProfileId: activeId,
                      cloudProfiles: profilesMap,
                      trackerData: activeSnap.trackerData || {},
                      habits: Array.isArray(activeSnap.habits) ? activeSnap.habits : DEFAULT_HABITS,
                      habitConfigs: activeSnap.habitConfigs || DEFAULT_CONFIGS,
                      categories: Array.isArray(activeSnap.categories) ? activeSnap.categories : DEFAULT_CATEGORIES,
                      archivedHabits: Array.isArray(activeSnap.archivedHabits) ? activeSnap.archivedHabits : [],
                      shieldedDates: Array.isArray(activeSnap.shieldedDates) ? activeSnap.shieldedDates : [],
                      savedLevel: Number(activeSnap.savedLevel) || 1,
                      manualXPOffset: Number(activeSnap.manualXPOffset) || 0,
                      manualStreakOffset: Number(activeSnap.manualStreakOffset) || 0,
                    };

                    setStore(mergedState);
                    await set('adib_habit_data', toPersistedData(getStore()));
                  } finally {
                    _isApplyingRemote = false;
                  }
                } else if (localLastUpdated > remoteLastUpdated) {
                  const localPersisted = { ...toPersistedData(getStore()), currentUid: user.uid };
                  await setDoc(userDocRef, { ...localPersisted, displayName: user.displayName || currentStore.guestName || '' }, { merge: true });
                  setStore({ currentUid: user.uid });
                }
              } else {
                const defaultMainName = user.displayName || currentStore.guestName || 'Main Profile';
                const initialProfiles = {
                  main: extractProfileSnapshot(currentStore, defaultMainName, 'main', true),
                };
                setStore({ currentUid: user.uid, activeProfileId: 'main', cloudProfiles: initialProfiles });
                const localPersisted = { ...toPersistedData(getStore()), currentUid: user.uid };
                await setDoc(userDocRef, { ...localPersisted, displayName: defaultMainName }, { merge: true });
              }
            }, (syncErr) => {
              _isApplyingRemote = false;
              console.error("Firebase sync failed, degrading to local only:", syncErr);
            });
          } catch (syncErr) {
            console.error("Firebase setup failed:", syncErr);
          }
        } else {
          setStore({ user: null, isAuthenticated: false, authInitialized: true });
          if (_unsubSnapshot) {
            _unsubSnapshot();
            _unsubSnapshot = null;
          }
        }
      });
    } catch (e) {
      console.error("Failed to hydrate store:", e);
      setStore({ isHydrating: false });
    }
  },

  syncToCloud: async () => {
    const state = getStore();
    const { user, isAuthenticated, isImpersonating, impersonatedUserName } = state;
    if (!db || !isAuthenticated || !user) return;

    try {
      const now = Math.max(Date.now(), (state.lastUpdated || 0) + 1);
      setStore({ lastUpdated: now });
      const targetUid = isImpersonating || user.uid;
      const targetDisplayName = isImpersonating ? impersonatedUserName : (user.displayName || state.guestName || "");
      const userDocRef = doc(db, 'users', targetUid);
      const dataToSave = { ...toPersistedData(getStore()), displayName: targetDisplayName, currentUid: targetUid };
      await setDoc(userDocRef, dataToSave, { merge: true });
      if (!isImpersonating) {
        await set('adib_habit_data', toPersistedData(getStore()));
      }
    } catch (err) {
      console.warn("Background cloud sync deferred:", err);
    }
  },

  // ── Cloud Multi-Profile Actions (1 Main + Sub-Profiles) ─────────────────
  createCloudProfile: async (profileName) => {
    const trimmed = (profileName || '').trim();
    if (!trimmed) return null;
    const state = getStore();

    // Save current active profile snapshot first
    const currentId = state.activeProfileId || 'main';
    const updatedProfiles = { ...(state.cloudProfiles || {}) };
    updatedProfiles[currentId] = extractProfileSnapshot(
      state,
      updatedProfiles[currentId]?.name || 'Main Profile',
      currentId,
      currentId === 'main'
    );

    const newProfileId = `prof_${Date.now()}`;
    const freshProfile = {
      id: newProfileId,
      name: trimmed,
      isMain: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      trackerData: {},
      habits: DEFAULT_HABITS,
      habitConfigs: DEFAULT_CONFIGS,
      categories: DEFAULT_CATEGORIES,
      archivedHabits: [],
      shieldedDates: [],
      savedLevel: 1,
      manualXPOffset: 0,
      manualStreakOffset: 0,
    };

    updatedProfiles[newProfileId] = freshProfile;

    await state.saveToIDB({
      activeProfileId: newProfileId,
      cloudProfiles: updatedProfiles,
      trackerData: freshProfile.trackerData,
      habits: freshProfile.habits,
      habitConfigs: freshProfile.habitConfigs,
      categories: freshProfile.categories,
      archivedHabits: freshProfile.archivedHabits,
      shieldedDates: freshProfile.shieldedDates,
      savedLevel: freshProfile.savedLevel,
      manualXPOffset: freshProfile.manualXPOffset,
      manualStreakOffset: freshProfile.manualStreakOffset,
      selectedCategory: 'all',
      viewingHabitMap: null,
    });

    getStore().triggerActionToast({
      type: 'success',
      title: `✨ Sub-Profile "${trimmed}" Created!`,
      subtitle: 'Switched to this fresh profile. Set up custom habits or import data.',
      actionLabel: 'Manage Profile Habits →',
      actionType: 'open_manage_habits',
    }, 5000);

    return newProfileId;
  },

  switchCloudProfile: async (targetProfileId) => {
    const state = getStore();
    const currentId = state.activeProfileId || 'main';
    if (targetProfileId === currentId) return;

    const updatedProfiles = { ...(state.cloudProfiles || {}) };
    updatedProfiles[currentId] = extractProfileSnapshot(
      state,
      updatedProfiles[currentId]?.name || (currentId === 'main' ? 'Main Profile' : 'Profile'),
      currentId,
      currentId === 'main'
    );

    const target = updatedProfiles[targetProfileId];
    if (!target) return;

    await state.saveToIDB({
      activeProfileId: targetProfileId,
      cloudProfiles: updatedProfiles,
      trackerData: target.trackerData || {},
      habits: Array.isArray(target.habits) ? target.habits : DEFAULT_HABITS,
      habitConfigs: target.habitConfigs || DEFAULT_CONFIGS,
      categories: Array.isArray(target.categories) ? target.categories : DEFAULT_CATEGORIES,
      archivedHabits: Array.isArray(target.archivedHabits) ? target.archivedHabits : [],
      shieldedDates: Array.isArray(target.shieldedDates) ? target.shieldedDates : [],
      savedLevel: Number(target.savedLevel) || 1,
      manualXPOffset: Number(target.manualXPOffset) || 0,
      manualStreakOffset: Number(target.manualStreakOffset) || 0,
      selectedCategory: 'all',
      viewingHabitMap: null,
    });
  },

  renameCloudProfile: async (profileId, newName) => {
    const trimmed = (newName || '').trim();
    if (!trimmed) return;
    const state = getStore();
    const targetId = profileId || state.activeProfileId || 'main';
    const updatedProfiles = { ...(state.cloudProfiles || {}) };

    if (!updatedProfiles[targetId]) {
      updatedProfiles[targetId] = extractProfileSnapshot(state, trimmed, targetId, targetId === 'main');
    } else {
      updatedProfiles[targetId] = {
        ...updatedProfiles[targetId],
        name: trimmed,
        updatedAt: Date.now(),
      };
    }

    await state.saveToIDB({ cloudProfiles: updatedProfiles });
  },

  deleteCloudProfile: async (profileId) => {
    if (!profileId || profileId === 'main') return; // Main profile cannot be deleted
    const state = getStore();
    const updatedProfiles = { ...(state.cloudProfiles || {}) };
    delete updatedProfiles[profileId];

    if (!updatedProfiles.main) {
      updatedProfiles.main = extractProfileSnapshot(state, 'Main Profile', 'main', true);
    }

    if (state.activeProfileId === profileId) {
      const mainProf = updatedProfiles.main;
      await state.saveToIDB({
        activeProfileId: 'main',
        cloudProfiles: updatedProfiles,
        trackerData: mainProf.trackerData || {},
        habits: Array.isArray(mainProf.habits) ? mainProf.habits : DEFAULT_HABITS,
        habitConfigs: mainProf.habitConfigs || DEFAULT_CONFIGS,
        categories: Array.isArray(mainProf.categories) ? mainProf.categories : DEFAULT_CATEGORIES,
        archivedHabits: Array.isArray(mainProf.archivedHabits) ? mainProf.archivedHabits : [],
        shieldedDates: Array.isArray(mainProf.shieldedDates) ? mainProf.shieldedDates : [],
        savedLevel: Number(mainProf.savedLevel) || 1,
        manualXPOffset: Number(mainProf.manualXPOffset) || 0,
        manualStreakOffset: Number(mainProf.manualStreakOffset) || 0,
        selectedCategory: 'all',
        viewingHabitMap: null,
      });
    } else {
      await state.saveToIDB({ cloudProfiles: updatedProfiles });
    }
  },

  importData: async (incomingPayload, strategy) => {
    const state = getStore();
    const timestamp = Date.now();
    let newTrackerData = { ...state.trackerData };
    let newHabits = [...state.habits];
    let newHabitConfigs = { ...state.habitConfigs };
    let newCategories = [...state.categories];
    let newArchivedHabits = [...state.archivedHabits];
    let newShieldedDates = [...(state.shieldedDates || [])];

    if (strategy === 'overwrite') {
      newTrackerData = incomingPayload.trackerData || {};
      newHabits = incomingPayload.habits || [];
      newHabitConfigs = incomingPayload.habitConfigs || {};
      if (Array.isArray(incomingPayload.categories)) newCategories = incomingPayload.categories;
      if (Array.isArray(incomingPayload.archivedHabits)) newArchivedHabits = incomingPayload.archivedHabits;
      if (Array.isArray(incomingPayload.shieldedDates)) newShieldedDates = incomingPayload.shieldedDates;
    } else if (strategy === 'merge') {
      const incomingHabits = incomingPayload.habits || [];
      incomingHabits.forEach((h) => {
        if (!newHabits.includes(h)) newHabits.push(h);
      });

      const incomingConfigs = incomingPayload.habitConfigs || {};
      newHabitConfigs = { ...incomingConfigs, ...newHabitConfigs };

      if (Array.isArray(incomingPayload.categories)) {
        incomingPayload.categories.forEach((cat) => {
          if (!newCategories.includes(cat)) newCategories.push(cat);
        });
      }

      if (Array.isArray(incomingPayload.archivedHabits)) {
        incomingPayload.archivedHabits.forEach((h) => {
          if (!newArchivedHabits.includes(h)) newArchivedHabits.push(h);
        });
      }

      if (Array.isArray(incomingPayload.shieldedDates)) {
        incomingPayload.shieldedDates.forEach((d) => {
          if (!newShieldedDates.includes(d)) newShieldedDates.push(d);
        });
```

---

