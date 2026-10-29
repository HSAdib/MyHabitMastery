import { create } from 'zustand';
import { get, set } from 'idb-keyval';
import { auth, db } from '../firebase.config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { loadConfettiScript } from '../utils';

let _unsubAuthState = null;
let _unsubSnapshot  = null;
let _isApplyingRemote = false;

const UI_ONLY_FIELDS = [
  'isHydrating', 'user', 'isAuthenticated', 'authInitialized',
  'isImpersonating', 'impersonatedUserName', 'adminSavedState',
  'currentDate', 'viewingHabitMap', 'heatmapFilter', 'weeklyGraphFilter',
  'dashboardGraphFilter', 'selectedCategory', 'editingHabitName',
  'editingManageListHabitName', 'importStatus',
];

const toPersistedData = (state) => {
  const d = {};
  const PERSIST_KEYS = [
    'trackerData', 'habits', 'habitConfigs', 'categories', 'archivedHabits',
    'shieldedDates', 'theme', 'tableOrientation', 'textSizes', 'isMobileMode',
    'savedLevel', 'guestName', 'manualXPOffset', 'manualStreakOffset',
    'lastUpdated', 'currentUid',
  ];
  PERSIST_KEYS.forEach((k) => { d[k] = state[k]; });
  return d;
};

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

export const useHabitStore = create((setStore, getStore) => ({
  isHydrating: true,
  user: null,
  isAuthenticated: false,
  authInitialized: false,
  lastUpdated: 0,
  currentUid: null,

  // Data State
  trackerData: {},
  habits: DEFAULT_HABITS,
  habitConfigs: DEFAULT_CONFIGS,
  categories: ["all", "health", "academic", "dev", "lifestyle"],
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
            categories: JSON.parse(localStorage.getItem('adib_habit_categories') || 'null') || ["all", "health", "academic", "dev", "lifestyle"],
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
          let dynamicCategories = ["all", "health", "academic", "dev", "lifestyle"];

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
        if (!Array.isArray(data.categories)) data.categories = ["all", "health", "academic", "dev", "lifestyle"];
        if (!data.trackerData || typeof data.trackerData !== 'object') data.trackerData = {};
        if (!data.habitConfigs || typeof data.habitConfigs !== 'object') data.habitConfigs = DEFAULT_CONFIGS;
        if (data.guestName === "Guest User") {
          data.guestName = "";
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
                    safeRemote.currentUid = user.uid;
                    setStore(safeRemote);
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
                const localPersisted = { ...toPersistedData(getStore()), currentUid: user.uid };
                await setDoc(userDocRef, { ...localPersisted, displayName: user.displayName || currentStore.guestName || '' }, { merge: true });
                setStore({ currentUid: user.uid });
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
      await set('adib_habit_data', toPersistedData(getStore()));
    } catch (err) {
      console.warn("Background cloud sync deferred:", err);
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
      }

      const incomingTracker = incomingPayload.trackerData || {};
      Object.keys(incomingTracker).forEach((dateKey) => {
        if (!newTrackerData[dateKey]) {
          newTrackerData[dateKey] = incomingTracker[dateKey];
        } else {
          newTrackerData[dateKey] = { ...incomingTracker[dateKey], ...newTrackerData[dateKey] };
        }
      });
    }

    const updatedPayload = {
      trackerData: newTrackerData,
      habits: newHabits,
      habitConfigs: newHabitConfigs,
      categories: newCategories,
      archivedHabits: newArchivedHabits,
      shieldedDates: newShieldedDates,
      lastUpdated: timestamp,
    };

    await state.saveToIDB(updatedPayload);
    setStore({ importStatus: 'success' });
    setTimeout(() => setStore({ importStatus: null }), 3000);
  },

  saveToIDB: async (updates) => {
    const stateBefore = getStore();
    const now = Math.max(Date.now(), (stateBefore.lastUpdated || 0) + 1);
    setStore({ ...updates, lastUpdated: now });

    const state = getStore();
    const dataToSave = { ...toPersistedData(state), lastUpdated: now };

    if (state.isImpersonating) {
      if (db && state.isAuthenticated && state.user) {
        try {
          await setDoc(doc(db, 'users', state.isImpersonating), { ...dataToSave, displayName: state.impersonatedUserName }, { merge: true });
        } catch (err) {
          console.error("Impersonated background sync failed:", err);
        }
      }
      return;
    }

    await set('adib_habit_data', dataToSave);

    if (db && state.isAuthenticated && state.user) {
      try {
        await setDoc(doc(db, 'users', state.user.uid), { ...dataToSave, displayName: state.user.displayName || state.guestName || "" }, { merge: true });
      } catch (err) {
        console.error("Background sync failed:", err);
      }
    }
  },

  updateHabitValue: async (dateKey, habit, val) => {
    const state = getStore();
    const updatedDay = { ...(state.trackerData[dateKey] || {}), [habit]: val };
    const newTrackerData = { ...state.trackerData, [dateKey]: updatedDay };

    let earned = 0;
    const activeHabits = state.habits.filter((h) => !state.archivedHabits.includes(h));
    activeHabits.forEach((h) => {
      const v = typeof updatedDay[h] === 'number' ? updatedDay[h] : (updatedDay[h] ? 100 : 0);
      earned += (v / 100);
    });

    if (activeHabits.length > 0 && Math.round((earned / activeHabits.length) * 100) === 100) {
      loadConfettiScript(() => {
        if (typeof window.confetti === 'function') {
          window.confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#10b981', '#3b82f6', '#10b981', '#ffffff']
          });
        }
      });
    }

    await state.saveToIDB({ trackerData: newTrackerData });
  },

  toggleShieldDate: async (dateKey) => {
    const state = getStore();
    const current = Array.isArray(state.shieldedDates) ? state.shieldedDates : [];
    const exists = current.includes(dateKey);
    const next = exists ? current.filter((d) => d !== dateKey) : [...current, dateKey];
    await state.saveToIDB({ shieldedDates: next });
  },

  setTheme: async (theme) => {
    await getStore().saveToIDB({ theme });
    const root = window.document.documentElement;
    root.style.colorScheme = theme;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  },

  setCurrentDate: (date) => setStore({ currentDate: date }),
  setViewingHabitMap: (habit) => setStore({ viewingHabitMap: habit }),
  setHeatmapFilter: (filter) => setStore({ heatmapFilter: filter }),
  setDashboardGraphFilter: (filter) => setStore({ dashboardGraphFilter: filter }),
  setWeeklyGraphFilter: (filter) => setStore({ weeklyGraphFilter: filter }),
  setSelectedCategory: (cat) => setStore({ selectedCategory: cat }),

  startImpersonation: (targetUser) => {
    const state = getStore();
    const adminStateBackup = {
      trackerData: state.trackerData,
      habits: state.habits,
      habitConfigs: state.habitConfigs,
      categories: state.categories,
      archivedHabits: state.archivedHabits,
      shieldedDates: state.shieldedDates,
      theme: state.theme,
      tableOrientation: state.tableOrientation,
      textSizes: state.textSizes,
      isMobileMode: state.isMobileMode,
      savedLevel: state.savedLevel,
      guestName: state.guestName,
      manualXPOffset: state.manualXPOffset,
      manualStreakOffset: state.manualStreakOffset,
    };

    setStore({
      isImpersonating: targetUser.id,
      impersonatedUserName: targetUser.displayName || targetUser.guestName || "Unknown User",
      adminSavedState: adminStateBackup,
      trackerData: targetUser.trackerData || {},
      habits: targetUser.habits || [],
      habitConfigs: targetUser.habitConfigs || {},
      categories: targetUser.categories || ["all", "health", "academic", "dev", "lifestyle"],
      archivedHabits: targetUser.archivedHabits || [],
      shieldedDates: targetUser.shieldedDates || [],
      theme: targetUser.theme || 'dark',
      tableOrientation: targetUser.tableOrientation || 'horizontal',
      textSizes: targetUser.textSizes || { habit: 14, table1: 12, table2: 11, tabSize: 110 },
      savedLevel: targetUser.savedLevel || 1,
      guestName: targetUser.guestName || "",
      manualXPOffset: targetUser.manualXPOffset || 0,
      manualStreakOffset: targetUser.manualStreakOffset || 0,
    });
  },

  stopImpersonation: () => {
    const state = getStore();
    if (state.adminSavedState) {
      setStore({
        ...state.adminSavedState,
        isImpersonating: null,
        impersonatedUserName: "",
        adminSavedState: null
      });
    } else {
      setStore({
        isImpersonating: null,
        impersonatedUserName: "",
      });
    }
  },

  setStorePartial: (partial) => setStore(partial),
  savePartialToIDB: async (partial) => await getStore().saveToIDB(partial)
}));

useHabitStore.getState().init();
