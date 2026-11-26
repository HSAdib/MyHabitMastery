import { create } from 'zustand';
import { get, set } from 'idb-keyval';
import { auth, db } from '../firebase.config';
import { onAuthStateChanged } from 'firebase/auth';
import { signOutCrossPlatform } from '../platform/nativeAuth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { loadConfettiScript, purgeExpiredTrash, isHabitActiveOnDate } from '../utils';

let _unsubAuthState = null;
let _unsubSnapshot = null;
let _isApplyingRemote = false;

const UI_ONLY_FIELDS = [
  'isHydrating', 'user', 'isAuthenticated', 'authInitialized',
  'isImpersonating', 'impersonatedUserName', 'impersonatedProfileId', 'adminSavedState',
  'currentDate', 'viewingHabitMap', 'heatmapFilter', 'weeklyGraphFilter',
  'dashboardGraphFilter', 'selectedCategory', 'editingHabitName',
  'importStatus', 'actionToast', 'sessionExpiredModal',
];

const PROFILE_SCOPED_KEYS = [
  'trackerData', 'dayUpdatedAt', 'habits', 'habitConfigs', 'categories',
  'archivedHabits', 'trashedHabits', 'shieldedDates', 'savedLevel',
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

let _globalDefaults = {
  habits: DEFAULT_HABITS,
  habitConfigs: DEFAULT_CONFIGS,
  categories: DEFAULT_CATEGORIES,
};

export const serializeUser = (fbUser, overrides = {}) => {
  if (!fbUser) return null;
  return {
    uid: fbUser.uid,
    email: fbUser.email || '',
    displayName: overrides.displayName !== undefined ? overrides.displayName : (fbUser.displayName || ''),
    photoURL: fbUser.photoURL || null,
    emailVerified: Boolean(fbUser.emailVerified),
  };
};

const applyThemeToDOM = (theme) => {
  if (typeof window === 'undefined') return;
  const resolved = theme === 'light' ? 'light' : 'dark';
  const root = window.document.documentElement;
  root.style.colorScheme = resolved;
  if (resolved === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
};

const getGlobalDefaultsClone = () => ({
  habits: [...(_globalDefaults.habits || DEFAULT_HABITS)],
  habitConfigs: JSON.parse(JSON.stringify(_globalDefaults.habitConfigs || DEFAULT_CONFIGS)),
  categories: [...(_globalDefaults.categories || DEFAULT_CATEGORIES)],
});

const extractProfileSnapshot = (source, fallbackName = 'Main Profile', id = 'main', isMain = false) => {
  const defaults = getGlobalDefaultsClone();
  return {
    id,
    name: source?.name || fallbackName,
    isMain: Boolean(isMain || id === 'main'),
    createdAt: source?.createdAt || Date.now(),
    updatedAt: Date.now(),
    trackerData: source?.trackerData && typeof source.trackerData === 'object' ? source.trackerData : {},
    dayUpdatedAt: source?.dayUpdatedAt && typeof source.dayUpdatedAt === 'object' ? source.dayUpdatedAt : {},
    habits: Array.isArray(source?.habits) ? source.habits : defaults.habits,
    habitConfigs: source?.habitConfigs && typeof source.habitConfigs === 'object' ? source.habitConfigs : defaults.habitConfigs,
    categories: Array.isArray(source?.categories) ? source.categories : defaults.categories,
    archivedHabits: Array.isArray(source?.archivedHabits) ? source.archivedHabits : [],
    trashedHabits: purgeExpiredTrash(source?.trashedHabits),
    shieldedDates: Array.isArray(source?.shieldedDates) ? source.shieldedDates : [],
    savedLevel: Number(source?.savedLevel) || 1,
    manualXPOffset: Number(source?.manualXPOffset) || 0,
    manualStreakOffset: Number(source?.manualStreakOffset) || 0,
  };
};

const toPersistedData = (state) => {
  const defaults = getGlobalDefaultsClone();
  const activeId = state.activeProfileId || 'main';
  const existingProfiles = { ...(state.cloudProfiles || {}) };
  const currentActiveProfile = extractProfileSnapshot(
    state,
    existingProfiles[activeId]?.name || (activeId === 'main' ? (state.user?.displayName || state.guestName || 'Main Profile') : 'Profile'),
    activeId,
    activeId === 'main'
  );
  existingProfiles[activeId] = currentActiveProfile;

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
    dayUpdatedAt: state.dayUpdatedAt || {},
    habits: Array.isArray(state.habits) ? state.habits : defaults.habits,
    habitConfigs: state.habitConfigs || defaults.habitConfigs,
    categories: Array.isArray(state.categories) ? state.categories : defaults.categories,
    archivedHabits: Array.isArray(state.archivedHabits) ? state.archivedHabits : [],
    trashedHabits: purgeExpiredTrash(state.trashedHabits),
    shieldedDates: Array.isArray(state.shieldedDates) ? state.shieldedDates : [],
    theme: state.theme || 'dark',
    tableOrientation: state.tableOrientation || 'horizontal',
    textSizes: state.textSizes || { habit: 14, table1: 12, table2: 11, tabSize: 110 },
    isMobileMode: Boolean(state.isMobileMode),
    mobileModeLocked: Boolean(state.mobileModeLocked),
    savedLevel: Number(state.savedLevel) || 1,
    guestName: state.guestName || '',
    manualXPOffset: Number(state.manualXPOffset) || 0,
    manualStreakOffset: Number(state.manualStreakOffset) || 0,
    lastUpdated: state.lastUpdated || Date.now(),
    lastSyncedAt: Number(state.lastSyncedAt) || 0,
    currentUid: state.currentUid || null,
    activeProfileId: activeId,
    cloudProfiles: existingProfiles,
  };
};

const withMainMirroredAtRoot = (persisted, activeProfileId) => {
  const result = { ...persisted };
  if (result.cloudProfiles?.main && activeProfileId !== 'main') {
    const mainSnap = result.cloudProfiles.main;
    PROFILE_SCOPED_KEYS.forEach((k) => {
      if (mainSnap[k] !== undefined) result[k] = mainSnap[k];
    });
  }
  return result;
};

const stampChangedDays = (prevTracker = {}, nextTracker = {}, prevDayUpdatedAt = {}, now = Date.now()) => {
  const nextStamps = { ...(prevDayUpdatedAt || {}) };
  const allKeys = new Set([...Object.keys(prevTracker || {}), ...Object.keys(nextTracker || {})]);
  allKeys.forEach((dateKey) => {
    const prevVal = prevTracker?.[dateKey];
    const nextVal = nextTracker?.[dateKey];
    if (prevVal !== nextVal && JSON.stringify(prevVal || {}) !== JSON.stringify(nextVal || {})) {
      nextStamps[dateKey] = now;
    }
  });
  return nextStamps;
};

const mergeProfileSnapshots = (localSnap, remoteSnap) => {
  if (!localSnap) return remoteSnap;
  if (!remoteSnap) return localSnap;

  const localUpdated = Number(localSnap.updatedAt) || 0;
  const remoteUpdated = Number(remoteSnap.updatedAt) || 0;
  const localNewer = localUpdated >= remoteUpdated;

  const localTracker = localSnap.trackerData || {};
  const remoteTracker = remoteSnap.trackerData || {};
  const localDayStamps = localSnap.dayUpdatedAt || {};
  const remoteDayStamps = remoteSnap.dayUpdatedAt || {};

  const mergedTracker = {};
  const mergedDayStamps = {};
  const allDateKeys = new Set([...Object.keys(localTracker), ...Object.keys(remoteTracker)]);

  allDateKeys.forEach((dateKey) => {
    const lDay = localTracker[dateKey];
    const rDay = remoteTracker[dateKey];
    const lTs = Number(localDayStamps[dateKey]) || 0;
    const rTs = Number(remoteDayStamps[dateKey]) || 0;

    if (lDay && !rDay) {
      mergedTracker[dateKey] = lDay;
      if (lTs) mergedDayStamps[dateKey] = lTs;
    } else if (rDay && !lDay) {
      mergedTracker[dateKey] = rDay;
      if (rTs) mergedDayStamps[dateKey] = rTs;
    } else if (lTs > rTs) {
      mergedTracker[dateKey] = lDay;
      mergedDayStamps[dateKey] = lTs;
    } else if (rTs > lTs) {
      mergedTracker[dateKey] = rDay;
      mergedDayStamps[dateKey] = rTs;
    } else {
      // Equal or missing per-day timestamps: merge per-habit keys keeping higher progress / non-empty note
      const base = localNewer ? { ...rDay, ...lDay } : { ...lDay, ...rDay };
      const allFields = new Set([...Object.keys(lDay || {}), ...Object.keys(rDay || {})]);
      allFields.forEach((field) => {
        if (field === 'note' || field === 'noteTime') {
          if (!base.note?.trim() && (lDay?.note?.trim() || rDay?.note?.trim())) {
            base.note = lDay?.note?.trim() ? lDay.note : rDay.note;
            base.noteTime = lDay?.note?.trim() ? (lDay.noteTime || null) : (rDay.noteTime || null);
          }
        } else {
          const lv = typeof lDay?.[field] === 'number' ? lDay[field] : (lDay?.[field] ? 100 : 0);
          const rv = typeof rDay?.[field] === 'number' ? rDay[field] : (rDay?.[field] ? 100 : 0);
          base[field] = Math.max(lv, rv);
        }
      });
      mergedTracker[dateKey] = base;
      if (Math.max(lTs, rTs) > 0) mergedDayStamps[dateKey] = Math.max(lTs, rTs);
    }
  });

  const primaryHabits = localNewer ? (localSnap.habits || []) : (remoteSnap.habits || []);
  const secondaryHabits = localNewer ? (remoteSnap.habits || []) : (localSnap.habits || []);
  const mergedHabits = [...primaryHabits];
  secondaryHabits.forEach((h) => { if (!mergedHabits.includes(h)) mergedHabits.push(h); });

  const primaryCats = localNewer ? (localSnap.categories || []) : (remoteSnap.categories || []);
  const secondaryCats = localNewer ? (remoteSnap.categories || []) : (localSnap.categories || []);
  const mergedCats = [...primaryCats];
  secondaryCats.forEach((c) => { if (!mergedCats.includes(c)) mergedCats.push(c); });

  const mergedConfigs = localNewer
    ? { ...(remoteSnap.habitConfigs || {}), ...(localSnap.habitConfigs || {}) }
    : { ...(localSnap.habitConfigs || {}), ...(remoteSnap.habitConfigs || {}) };

  const mergedShields = Array.from(new Set([...(remoteSnap.shieldedDates || []), ...(localSnap.shieldedDates || [])]));

  const trashMap = new Map();
  [...(remoteSnap.trashedHabits || []), ...(localSnap.trashedHabits || [])].forEach((entry) => {
    const validList = purgeExpiredTrash([entry]);
    if (validList.length === 0) return;
    const valid = validList[0];
    if (mergedHabits.some((h) => h.toLowerCase() === valid.name.toLowerCase())) return;
    const prev = trashMap.get(valid.name);
    if (!prev || (Number(valid.deletedAt) || 0) >= (Number(prev.deletedAt) || 0)) {
      trashMap.set(valid.name, valid);
    }
  });
  const mergedTrash = Array.from(trashMap.values());

  return {
    ...(localNewer ? remoteSnap : localSnap),
    ...(localNewer ? localSnap : remoteSnap),
    trackerData: mergedTracker,
    dayUpdatedAt: mergedDayStamps,
    habits: mergedHabits,
    categories: mergedCats,
    habitConfigs: mergedConfigs,
    trashedHabits: mergedTrash,
    shieldedDates: mergedShields,
    savedLevel: Math.max(Number(localSnap.savedLevel) || 1, Number(remoteSnap.savedLevel) || 1),
    updatedAt: Math.max(localUpdated, remoteUpdated, Date.now()),
  };
};

export const useHabitStore = create((setStore, getStore) => ({
  isHydrating: true,
  user: null,
  isAuthenticated: false,
  authInitialized: false,
  lastUpdated: 0,
  lastSyncedAt: 0,
  currentUid: null,

  // Multi-Profile State (1 Main + Sub-Profiles for signed-in users)
  activeProfileId: 'main',
  cloudProfiles: {
    main: extractProfileSnapshot({}, 'Main Profile', 'main', true),
  },

  // Data State (Active Profile)
  trackerData: {},
  dayUpdatedAt: {},
  habits: DEFAULT_HABITS,
  habitConfigs: DEFAULT_CONFIGS,
  categories: DEFAULT_CATEGORIES,
  archivedHabits: [],
  trashedHabits: [],
  shieldedDates: [],

  // App Settings
  theme: 'dark',
  tableOrientation: 'horizontal',
  textSizes: { habit: 14, table1: 12, table2: 11, tabSize: 110 },
  isMobileMode: false,
  mobileModeLocked: false,
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
  importStatus: null,
  actionToast: null,
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

  resetLocalSession: async () => {
    const current = getStore();
    const defaults = getGlobalDefaultsClone();
    const cleanData = {
      trackerData: {},
      dayUpdatedAt: {},
      habits: defaults.habits,
      habitConfigs: defaults.habitConfigs,
      categories: defaults.categories,
      archivedHabits: [],
      trashedHabits: [],
      shieldedDates: [],
      theme: current.theme || 'dark',
      tableOrientation: current.tableOrientation || 'horizontal',
      textSizes: current.textSizes || { habit: 14, table1: 12, table2: 11, tabSize: 110 },
      isMobileMode: Boolean(current.isMobileMode),
      mobileModeLocked: Boolean(current.mobileModeLocked),
      savedLevel: 1,
      guestName: '',
      manualXPOffset: 0,
      manualStreakOffset: 0,
      lastUpdated: 0,
      lastSyncedAt: 0,
      currentUid: null,
      activeProfileId: 'main',
      cloudProfiles: {
        main: extractProfileSnapshot({ ...defaults, trackerData: {} }, 'Main Profile', 'main', true),
      },
    };
    setStore({
      ...cleanData,
      user: null,
      isAuthenticated: false,
      viewingHabitMap: null,
      selectedCategory: 'all',
      heatmapFilter: 'all',
      weeklyGraphFilter: 'all',
      dashboardGraphFilter: 'all',
    });
    await set('adib_habit_data', cleanData);
  },

  init: async () => {
    try {
      // Refresh global defaults in the background so offline/flaky networks never delay startup
      if (db) {
        getDoc(doc(db, 'settings', 'globalDefaults'))
          .then((globalSnap) => {
            if (globalSnap.exists()) {
              const gd = globalSnap.data();
              _globalDefaults = {
                habits: Array.isArray(gd.habits) && gd.habits.length > 0 ? gd.habits : DEFAULT_HABITS,
                habitConfigs: gd.habitConfigs && typeof gd.habitConfigs === 'object' ? gd.habitConfigs : DEFAULT_CONFIGS,
                categories: Array.isArray(gd.categories) && gd.categories.length > 0 ? gd.categories : DEFAULT_CATEGORIES,
              };
            }
          })
          .catch((e) => {
            console.warn("Failed to fetch global defaults, using hardcoded.", e);
          });
      }

      const defaults = getGlobalDefaultsClone();
      let data = await get('adib_habit_data');

      if (!data) {
        const localData = localStorage.getItem('habit_tracker_master_v9_data');
        if (localData) {
          data = {
            trackerData: JSON.parse(localData || '{}'),
            habits: JSON.parse(localStorage.getItem('habit_tracker_master_v9_names') || 'null') || defaults.habits,
            habitConfigs: JSON.parse(localStorage.getItem('habit_tracker_master_v9_configs') || 'null') || defaults.habitConfigs,
            categories: JSON.parse(localStorage.getItem('adib_habit_categories') || 'null') || defaults.categories,
            archivedHabits: JSON.parse(localStorage.getItem('adib_habit_archived') || 'null') || [],
            shieldedDates: [],
            theme: localStorage.getItem('adib_habit_theme') || 'dark',
            tableOrientation: localStorage.getItem('adib_table_orientation') || 'horizontal',
            textSizes: JSON.parse(localStorage.getItem('adib_text_sizes') || 'null') || { habit: 14, table1: 12, table2: 11, tabSize: 110 },
            isMobileMode: JSON.parse(localStorage.getItem('adib_mobile_mode') || 'null') || (window.innerWidth <= 768),
            mobileModeLocked: Boolean(localStorage.getItem('adib_mobile_mode')),
            savedLevel: parseInt(localStorage.getItem('adib_habit_saved_level')) || 1,
            lastUpdated: Date.now()
          };
          await set('adib_habit_data', data);
        } else {
          data = {
            trackerData: {},
            habits: defaults.habits,
            habitConfigs: defaults.habitConfigs,
            categories: defaults.categories,
            archivedHabits: [],
            shieldedDates: [],
            theme: 'dark',
            tableOrientation: 'horizontal',
            textSizes: { habit: 14, table1: 12, table2: 11, tabSize: 110 },
            isMobileMode: window.innerWidth <= 768,
            mobileModeLocked: false,
            savedLevel: 1,
            guestName: "",
            manualXPOffset: 0,
            manualStreakOffset: 0,
            activeProfileId: 'main',
            cloudProfiles: {},
            lastUpdated: 0
          };
        }
      }

      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent) || window.innerWidth <= 768;

      if (data) {
        const parsedDate = data.currentDate ? new Date(data.currentDate) : new Date();
        data.currentDate = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
        if (!Array.isArray(data.habits)) data.habits = defaults.habits;
        if (!Array.isArray(data.archivedHabits)) data.archivedHabits = [];
        const rawTrashCount = Array.isArray(data.trashedHabits) ? data.trashedHabits.length : 0;
        data.trashedHabits = purgeExpiredTrash(data.trashedHabits);
        if (!Array.isArray(data.shieldedDates)) data.shieldedDates = [];
        if (rawTrashCount !== data.trashedHabits.length) {
          await set('adib_habit_data', data);
        }
        if (!Array.isArray(data.categories)) data.categories = defaults.categories;
        if (!data.trackerData || typeof data.trackerData !== 'object') data.trackerData = {};
        if (!data.dayUpdatedAt || typeof data.dayUpdatedAt !== 'object') data.dayUpdatedAt = {};
        if (typeof data.lastSyncedAt !== 'number') data.lastSyncedAt = Number(data.lastUpdated) || 0;
        if (!data.habitConfigs || typeof data.habitConfigs !== 'object') data.habitConfigs = defaults.habitConfigs;
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

      const effectiveMobileMode = data.mobileModeLocked ? Boolean(data.isMobileMode) : isMobileDevice;

      setStore({
        ...data,
        isMobileMode: effectiveMobileMode,
        mobileModeLocked: Boolean(data.mobileModeLocked),
        isHydrating: false
      });

      applyThemeToDOM(data.theme || 'dark');

      if (_unsubSnapshot) { _unsubSnapshot(); _unsubSnapshot = null; }
      if (_unsubAuthState) { _unsubAuthState(); _unsubAuthState = null; }

      if (!auth || !db) {
        setStore({ authInitialized: true });
        return;
      }

      _unsubAuthState = onAuthStateChanged(auth, async (fbUser) => {
        if (_unsubSnapshot) {
          _unsubSnapshot();
          _unsubSnapshot = null;
        }

        if (fbUser) {
          const safeUser = serializeUser(fbUser);
          setStore({ user: safeUser, isAuthenticated: true, authInitialized: true });
          try {
            const userDocRef = doc(db, 'users', fbUser.uid);
            _unsubSnapshot = onSnapshot(userDocRef, async (docSnap) => {
              if (_isApplyingRemote) return;
              if (getStore().isImpersonating) return;
              if (docSnap.metadata?.hasPendingWrites) return;

              const currentStore = getStore();
              const isFirstSyncForUser = currentStore.currentUid !== fbUser.uid;
              const localLastUpdated = currentStore.lastUpdated || 0;
              const localTracker = currentStore.trackerData || {};
              const hasLocalData = Object.keys(localTracker).length > 0;

              if (docSnap.exists()) {
                const remoteData = docSnap.data();
                const remoteLastUpdated = remoteData.lastUpdated || 0;
                const lastSyncedAt = currentStore.lastSyncedAt || 0;
                const remoteTracker = remoteData.trackerData || {};
                const hasRemoteData = Object.keys(remoteTracker).length > 0;
                const hasDiverged =
                  !isFirstSyncForUser &&
                  localLastUpdated !== remoteLastUpdated &&
                  localLastUpdated > lastSyncedAt &&
                  remoteLastUpdated > lastSyncedAt;

                if (hasDiverged) {
                  _isApplyingRemote = true;
                  try {
                    const localPersisted = toPersistedData(currentStore);
                    const remoteProfiles = remoteData.cloudProfiles && typeof remoteData.cloudProfiles === 'object'
                      ? { ...remoteData.cloudProfiles }
                      : { main: extractProfileSnapshot(remoteData, remoteData.displayName || safeUser.displayName || 'Main Profile', 'main', true) };
                    if (!remoteProfiles.main) {
                      remoteProfiles.main = extractProfileSnapshot(remoteData, remoteData.displayName || safeUser.displayName || 'Main Profile', 'main', true);
                    }

                    const mergedProfiles = {};
                    const allProfileIds = new Set([...Object.keys(localPersisted.cloudProfiles || {}), ...Object.keys(remoteProfiles)]);
                    allProfileIds.forEach((pid) => {
                      mergedProfiles[pid] = mergeProfileSnapshots(localPersisted.cloudProfiles?.[pid], remoteProfiles[pid]);
                    });

                    const activeId = mergedProfiles[currentStore.activeProfileId] ? currentStore.activeProfileId : 'main';
                    const activeSnap = mergedProfiles[activeId] || mergedProfiles.main;
                    const mergedNow = Math.max(Date.now(), localLastUpdated, remoteLastUpdated) + 1;
                    const fbDefaults = getGlobalDefaultsClone();

                    const mergedState = {
                      currentUid: fbUser.uid,
                      activeProfileId: activeId,
                      cloudProfiles: mergedProfiles,
                      trackerData: activeSnap.trackerData || {},
                      dayUpdatedAt: activeSnap.dayUpdatedAt || {},
                      habits: Array.isArray(activeSnap.habits) ? activeSnap.habits : fbDefaults.habits,
                      habitConfigs: activeSnap.habitConfigs || fbDefaults.habitConfigs,
                      categories: Array.isArray(activeSnap.categories) ? activeSnap.categories : fbDefaults.categories,
                      archivedHabits: Array.isArray(activeSnap.archivedHabits) ? activeSnap.archivedHabits : [],
                      trashedHabits: purgeExpiredTrash(activeSnap.trashedHabits),
                      shieldedDates: Array.isArray(activeSnap.shieldedDates) ? activeSnap.shieldedDates : [],
                      savedLevel: Number(activeSnap.savedLevel) || 1,
                      manualXPOffset: Number(activeSnap.manualXPOffset) || 0,
                      manualStreakOffset: Number(activeSnap.manualStreakOffset) || 0,
                      lastUpdated: mergedNow,
                      lastSyncedAt: mergedNow,
                    };

                    setStore(mergedState);
                    const persistedMerged = { ...toPersistedData(getStore()), lastUpdated: mergedNow, lastSyncedAt: mergedNow };
                    await set('adib_habit_data', persistedMerged);
                    await setDoc(
                      userDocRef,
                      withMainMirroredAtRoot(
                        { ...persistedMerged, displayName: safeUser.displayName || currentStore.guestName || '', email: safeUser.email || '' },
                        activeId
                      ),
                      { merge: true }
                    );
                  } finally {
                    _isApplyingRemote = false;
                  }
                } else if (isFirstSyncForUser || remoteLastUpdated > localLastUpdated || (hasRemoteData && !hasLocalData)) {
                  _isApplyingRemote = true;
                  try {
                    const safeRemote = {};
                    Object.keys(remoteData).forEach((k) => {
                      if (!UI_ONLY_FIELDS.includes(k)) safeRemote[k] = remoteData[k];
                    });
                    if (!Array.isArray(safeRemote.shieldedDates)) safeRemote.shieldedDates = [];

                    let profilesMap = safeRemote.cloudProfiles && typeof safeRemote.cloudProfiles === 'object'
                      ? { ...safeRemote.cloudProfiles }
                      : {};
                    if (!profilesMap.main) {
                      profilesMap.main = extractProfileSnapshot(
                        safeRemote,
                        remoteData.displayName || safeUser.displayName || 'Main Profile',
                        'main',
                        true
                      );
                    }
                    const activeId = (safeRemote.activeProfileId && profilesMap[safeRemote.activeProfileId])
                      ? safeRemote.activeProfileId
                      : 'main';
                    const activeSnap = profilesMap[activeId] || profilesMap.main;
                    const fbDefaults = getGlobalDefaultsClone();

                    const mergedState = {
                      ...safeRemote,
                      currentUid: fbUser.uid,
                      activeProfileId: activeId,
                      cloudProfiles: profilesMap,
                      trackerData: activeSnap.trackerData || {},
                      dayUpdatedAt: activeSnap.dayUpdatedAt || {},
                      habits: Array.isArray(activeSnap.habits) ? activeSnap.habits : fbDefaults.habits,
                      habitConfigs: activeSnap.habitConfigs || fbDefaults.habitConfigs,
                      categories: Array.isArray(activeSnap.categories) ? activeSnap.categories : fbDefaults.categories,
                      archivedHabits: Array.isArray(activeSnap.archivedHabits) ? activeSnap.archivedHabits : [],
                      trashedHabits: purgeExpiredTrash(activeSnap.trashedHabits),
                      shieldedDates: Array.isArray(activeSnap.shieldedDates) ? activeSnap.shieldedDates : [],
                      savedLevel: Number(activeSnap.savedLevel) || 1,
                      manualXPOffset: Number(activeSnap.manualXPOffset) || 0,
                      manualStreakOffset: Number(activeSnap.manualStreakOffset) || 0,
                      lastSyncedAt: remoteLastUpdated,
                    };

                    setStore(mergedState);
                    if (mergedState.theme) applyThemeToDOM(mergedState.theme);
                    await set('adib_habit_data', toPersistedData(getStore()));
                  } finally {
                    _isApplyingRemote = false;
                  }
                } else if (localLastUpdated > remoteLastUpdated) {
                  const localPersisted = withMainMirroredAtRoot(
                    { ...toPersistedData(getStore()), currentUid: fbUser.uid, lastSyncedAt: localLastUpdated },
                    getStore().activeProfileId
                  );
                  await setDoc(
                    userDocRef,
                    {
                      ...localPersisted,
                      displayName: safeUser.displayName || currentStore.guestName || '',
                      email: safeUser.email || '',
                    },
                    { merge: true }
                  );
                  setStore({ currentUid: fbUser.uid, lastSyncedAt: localLastUpdated });
                  await set('adib_habit_data', toPersistedData(getStore()));
                }
              } else {
                const defaultMainName = safeUser.displayName || currentStore.guestName || 'Main Profile';
                // Only migrate local data into a brand-new cloud account if it wasn't from a different UID
                const canMigrateLocal = !currentStore.currentUid || currentStore.currentUid === fbUser.uid;
                const seedSource = canMigrateLocal ? currentStore : getGlobalDefaultsClone();
                const initialProfiles = {
                  main: extractProfileSnapshot(seedSource, defaultMainName, 'main', true),
                };
                const createdNow = Date.now();
                setStore({
                  ...(canMigrateLocal ? {} : {
                    trackerData: {},
                    dayUpdatedAt: {},
                    habits: seedSource.habits,
                    habitConfigs: seedSource.habitConfigs,
                    categories: seedSource.categories,
                    archivedHabits: [],
                    trashedHabits: [],
                    shieldedDates: [],
                    savedLevel: 1,
                    manualXPOffset: 0,
                    manualStreakOffset: 0,
                  }),
                  currentUid: fbUser.uid,
                  activeProfileId: 'main',
                  cloudProfiles: initialProfiles,
                  lastUpdated: createdNow,
                  lastSyncedAt: createdNow,
                });
                const localPersisted = withMainMirroredAtRoot(
                  { ...toPersistedData(getStore()), currentUid: fbUser.uid },
                  'main'
                );
                await setDoc(
                  userDocRef,
                  {
                    ...localPersisted,
                    displayName: defaultMainName,
                    email: safeUser.email || '',
                  },
                  { merge: true }
                );
                await set('adib_habit_data', toPersistedData(getStore()));
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
        }
      });
    } catch (e) {
      console.error("Failed to hydrate store:", e);
      setStore({ isHydrating: false, authInitialized: true });
    }
  },

  syncToCloud: async () => {
    const state = getStore();
    const { user, isAuthenticated, isImpersonating, impersonatedUserName } = state;
    if (!db || !isAuthenticated || !user) return;

    try {
      const now = Math.max(Date.now(), (state.lastUpdated || 0) + 1);
      setStore({ lastUpdated: now });
      const latest = getStore();
      const targetUid = isImpersonating || user.uid;
      const targetDisplayName = isImpersonating ? impersonatedUserName : (user.displayName || latest.guestName || "");
      const userDocRef = doc(db, 'users', targetUid);
      const persisted = toPersistedData(latest);
      const dataToSave = withMainMirroredAtRoot(
        {
          ...persisted,
          displayName: targetDisplayName,
          ...(isImpersonating ? {} : { email: user.email || '' }),
          currentUid: targetUid,
        },
        latest.activeProfileId
      );
      await setDoc(userDocRef, dataToSave, { merge: true });
      if (!isImpersonating) {
        setStore({ lastSyncedAt: Math.max(getStore().lastSyncedAt || 0, now) });
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
    const defaults = getGlobalDefaultsClone();

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
      habits: defaults.habits,
      habitConfigs: defaults.habitConfigs,
      categories: defaults.categories,
      archivedHabits: [],
      trashedHabits: [],
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
      dayUpdatedAt: {},
      habits: freshProfile.habits,
      habitConfigs: freshProfile.habitConfigs,
      categories: freshProfile.categories,
      archivedHabits: freshProfile.archivedHabits,
      trashedHabits: freshProfile.trashedHabits,
      shieldedDates: freshProfile.shieldedDates,
      savedLevel: freshProfile.savedLevel,
      manualXPOffset: freshProfile.manualXPOffset,
      manualStreakOffset: freshProfile.manualStreakOffset,
      heatmapFilter: 'all',
      weeklyGraphFilter: 'all',
      dashboardGraphFilter: 'all',
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
    const defaults = getGlobalDefaultsClone();

    await state.saveToIDB({
      activeProfileId: targetProfileId,
      cloudProfiles: updatedProfiles,
      trackerData: target.trackerData || {},
      dayUpdatedAt: target.dayUpdatedAt || {},
      habits: Array.isArray(target.habits) ? target.habits : defaults.habits,
      habitConfigs: target.habitConfigs || defaults.habitConfigs,
      categories: Array.isArray(target.categories) ? target.categories : defaults.categories,
      archivedHabits: Array.isArray(target.archivedHabits) ? target.archivedHabits : [],
      trashedHabits: purgeExpiredTrash(target.trashedHabits),
      shieldedDates: Array.isArray(target.shieldedDates) ? target.shieldedDates : [],
      savedLevel: Number(target.savedLevel) || 1,
      manualXPOffset: Number(target.manualXPOffset) || 0,
      manualStreakOffset: Number(target.manualStreakOffset) || 0,
      heatmapFilter: 'all',
      weeklyGraphFilter: 'all',
      dashboardGraphFilter: 'all',
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
    if (!profileId || profileId === 'main') return;
    const state = getStore();
    const updatedProfiles = { ...(state.cloudProfiles || {}) };
    delete updatedProfiles[profileId];

    if (!updatedProfiles.main) {
      updatedProfiles.main = extractProfileSnapshot(state, 'Main Profile', 'main', true);
    }

    const defaults = getGlobalDefaultsClone();

    if (state.activeProfileId === profileId) {
      const mainProf = updatedProfiles.main;
      await state.saveToIDB({
        activeProfileId: 'main',
        cloudProfiles: updatedProfiles,
        trackerData: mainProf.trackerData || {},
        dayUpdatedAt: mainProf.dayUpdatedAt || {},
        habits: Array.isArray(mainProf.habits) ? mainProf.habits : defaults.habits,
        habitConfigs: mainProf.habitConfigs || defaults.habitConfigs,
        categories: Array.isArray(mainProf.categories) ? mainProf.categories : defaults.categories,
        archivedHabits: Array.isArray(mainProf.archivedHabits) ? mainProf.archivedHabits : [],
        trashedHabits: purgeExpiredTrash(mainProf.trashedHabits),
        shieldedDates: Array.isArray(mainProf.shieldedDates) ? mainProf.shieldedDates : [],
        savedLevel: Number(mainProf.savedLevel) || 1,
        manualXPOffset: Number(mainProf.manualXPOffset) || 0,
        manualStreakOffset: Number(mainProf.manualStreakOffset) || 0,
        heatmapFilter: 'all',
        weeklyGraphFilter: 'all',
        dashboardGraphFilter: 'all',
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
    let newTrashedHabits = purgeExpiredTrash(state.trashedHabits);
    let newShieldedDates = [...(state.shieldedDates || [])];

    if (strategy === 'overwrite') {
      newTrackerData = incomingPayload.trackerData || {};
      newHabits = incomingPayload.habits || [];
      newHabitConfigs = incomingPayload.habitConfigs || {};
      if (Array.isArray(incomingPayload.categories)) newCategories = incomingPayload.categories;
      if (Array.isArray(incomingPayload.archivedHabits)) newArchivedHabits = incomingPayload.archivedHabits;
      newTrashedHabits = purgeExpiredTrash(incomingPayload.trashedHabits);
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
      trashedHabits: newTrashedHabits,
      shieldedDates: newShieldedDates,
      lastUpdated: timestamp,
      ...(strategy === 'overwrite' ? {
        heatmapFilter: 'all',
        weeklyGraphFilter: 'all',
        dashboardGraphFilter: 'all',
        selectedCategory: 'all',
        viewingHabitMap: null,
      } : {}),
    };

    await state.saveToIDB(updatedPayload);
    setStore({ importStatus: 'success' });
    setTimeout(() => setStore({ importStatus: null }), 3000);

    getStore().triggerActionToast({
      type: 'success',
      title: strategy === 'overwrite' ? '📥 Backup Restored (Overwrite)!' : '🔀 Backup Merged Safely!',
      subtitle: `Successfully imported ${newHabits.length} habits and ${Object.keys(newTrackerData).length} days of logs.`,
      actionLabel: 'Review Your Habits →',
      actionType: 'open_manage_habits',
    }, 5000);
  },

  saveToIDB: async (updates) => {
    const stateBefore = getStore();
    const now = Math.max(Date.now(), (stateBefore.lastUpdated || 0) + 1);

    const nextDayUpdatedAt = updates.trackerData
      ? stampChangedDays(stateBefore.trackerData, updates.trackerData, stateBefore.dayUpdatedAt, now)
      : (updates.dayUpdatedAt || stateBefore.dayUpdatedAt || {});
    const enrichedUpdates = { ...updates, dayUpdatedAt: nextDayUpdatedAt };

    const nextStatePreview = { ...stateBefore, ...enrichedUpdates, lastUpdated: now };
    const activeId = nextStatePreview.activeProfileId || 'main';
    const updatedCloudProfiles = { ...(nextStatePreview.cloudProfiles || {}) };
    updatedCloudProfiles[activeId] = extractProfileSnapshot(
      nextStatePreview,
      updatedCloudProfiles[activeId]?.name || (activeId === 'main' ? (nextStatePreview.user?.displayName || nextStatePreview.guestName || 'Main Profile') : 'Profile'),
      activeId,
      activeId === 'main'
    );

    setStore({ ...enrichedUpdates, cloudProfiles: updatedCloudProfiles, lastUpdated: now });

    const state = getStore();
    const persisted = { ...toPersistedData(state), lastUpdated: now };
    const dataToSave = withMainMirroredAtRoot(persisted, state.activeProfileId);

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

    await set('adib_habit_data', persisted);

    if (!state.isAuthenticated && state.guestName && state.guestName.trim()) {
      try {
        const accounts = (await get('adib_guest_accounts')) || [];
        const existingIdx = accounts.findIndex(a => a.name.toLowerCase() === state.guestName.trim().toLowerCase());
        const entry = {
          id: existingIdx >= 0 ? accounts[existingIdx].id : Date.now().toString(),
          name: state.guestName.trim(),
          savedAt: Date.now(),
          data: persisted,
        };
        if (existingIdx >= 0) accounts[existingIdx] = entry;
        else accounts.unshift(entry);
        await set('adib_guest_accounts', accounts);
      } catch (err) {
        console.warn("Guest account auto-save failed:", err);
      }
    }

    if (db && state.isAuthenticated && state.user) {
      setDoc(
        doc(db, 'users', state.user.uid),
        {
          ...dataToSave,
          displayName: state.user.displayName || state.guestName || "",
          email: state.user.email || "",
        },
        { merge: true }
      )
        .then(async () => {
          setStore({ lastSyncedAt: Math.max(getStore().lastSyncedAt || 0, now) });
          await set('adib_habit_data', toPersistedData(getStore()));
        })
        .catch((err) => {
          console.error("Background sync failed:", err);
        });
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
      getStore().triggerActionToast({
        type: 'success',
        title: '🎉 100% Daily Mastery Complete!',
        subtitle: 'All active habits finished for this day. XP & streak banked!',
        actionLabel: "Write Today's Reflection →",
        actionType: 'open_today_journal',
        dateKey,
      }, 6000);
    }

    await state.saveToIDB({ trackerData: newTrackerData });
  },

  toggleShieldDate: async (dateKey) => {
    const state = getStore();
    const current = Array.isArray(state.shieldedDates) ? state.shieldedDates : [];
    const exists = current.includes(dateKey);
    if (!exists) {
      const dayHabits = (state.habits || []).filter((h) =>
        isHabitActiveOnDate(h, dateKey, state.archivedHabits || [], state.habitConfigs || {})
      );
      const isFireDay =
        dayHabits.length > 0 &&
        dayHabits.every((h) => {
          const r = state.trackerData?.[dateKey]?.[h] ?? 0;
          const v = typeof r === 'number' ? r : (r ? 100 : 0);
          return Math.round(v) >= 100;
        });
      if (isFireDay) {
        getStore().triggerActionToast({
          type: 'info',
          title: 'Fire Day — No Shield Needed',
          subtitle: 'Every active habit is already 100% completed on this day.',
        }, 3000);
        return;
      }
    }
    const next = exists ? current.filter((d) => d !== dateKey) : [...current, dateKey];
    await state.saveToIDB({ shieldedDates: next });
  },

  setTheme: async (theme) => {
    applyThemeToDOM(theme);
    await getStore().saveToIDB({ theme });
  },

  setCurrentDate: (date) => setStore({ currentDate: date }),
  setViewingHabitMap: (habit) => setStore({ viewingHabitMap: habit }),
  setHeatmapFilter: (filter) => setStore({ heatmapFilter: filter }),
  setDashboardGraphFilter: (filter) => setStore({ dashboardGraphFilter: filter }),
  setWeeklyGraphFilter: (filter) => setStore({ weeklyGraphFilter: filter }),
  setSelectedCategory: (cat) => setStore({ selectedCategory: cat }),

  startImpersonation: (targetUser, targetProfileId = 'main') => {
    const state = getStore();
    const defaults = getGlobalDefaultsClone();

    // Preserve original admin state if already impersonating another user
    const adminStateBackup = state.adminSavedState || {
      trackerData: state.trackerData,
      dayUpdatedAt: state.dayUpdatedAt,
      habits: state.habits,
      habitConfigs: state.habitConfigs,
      categories: state.categories,
      archivedHabits: state.archivedHabits,
      trashedHabits: state.trashedHabits,
      shieldedDates: state.shieldedDates,
      activeProfileId: state.activeProfileId,
      cloudProfiles: state.cloudProfiles,
      theme: state.theme,
      tableOrientation: state.tableOrientation,
      textSizes: state.textSizes,
      isMobileMode: state.isMobileMode,
      mobileModeLocked: state.mobileModeLocked,
      savedLevel: state.savedLevel,
      guestName: state.guestName,
      manualXPOffset: state.manualXPOffset,
      manualStreakOffset: state.manualStreakOffset,
      lastSyncedAt: state.lastSyncedAt,
    };

    const userProfiles = targetUser.cloudProfiles && typeof targetUser.cloudProfiles === 'object'
      ? { ...targetUser.cloudProfiles }
      : { main: extractProfileSnapshot(targetUser, targetUser.displayName || targetUser.guestName || 'Main Profile', 'main', true) };

    if (!userProfiles.main) {
      userProfiles.main = extractProfileSnapshot(targetUser, targetUser.displayName || targetUser.guestName || 'Main Profile', 'main', true);
    }

    const chosenId = userProfiles[targetProfileId] ? targetProfileId : 'main';
    const chosenSnap = userProfiles[chosenId];
    const targetTheme = targetUser.theme || 'dark';

    applyThemeToDOM(targetTheme);

    setStore({
      isImpersonating: targetUser.id,
      impersonatedUserName: targetUser.displayName || targetUser.guestName || "Unknown User",
      impersonatedProfileId: chosenId,
      adminSavedState: adminStateBackup,
      activeProfileId: chosenId,
      cloudProfiles: userProfiles,
      trackerData: chosenSnap.trackerData || {},
      dayUpdatedAt: chosenSnap.dayUpdatedAt || {},
      habits: chosenSnap.habits || defaults.habits,
      habitConfigs: chosenSnap.habitConfigs || defaults.habitConfigs,
      categories: chosenSnap.categories || defaults.categories,
      archivedHabits: chosenSnap.archivedHabits || [],
      trashedHabits: purgeExpiredTrash(chosenSnap.trashedHabits),
      shieldedDates: chosenSnap.shieldedDates || [],
      theme: targetTheme,
      tableOrientation: targetUser.tableOrientation || 'horizontal',
      textSizes: targetUser.textSizes || { habit: 14, table1: 12, table2: 11, tabSize: 110 },
      savedLevel: chosenSnap.savedLevel || 1,
      guestName: targetUser.guestName || "",
      manualXPOffset: chosenSnap.manualXPOffset || 0,
      manualStreakOffset: chosenSnap.manualStreakOffset || 0,
      heatmapFilter: 'all',
      weeklyGraphFilter: 'all',
      dashboardGraphFilter: 'all',
      selectedCategory: 'all',
      viewingHabitMap: null,
    });
  },

  stopImpersonation: () => {
    const state = getStore();
    if (state.adminSavedState) {
      applyThemeToDOM(state.adminSavedState.theme || 'dark');
      setStore({
        ...state.adminSavedState,
        isImpersonating: null,
        impersonatedUserName: "",
        impersonatedProfileId: 'main',
        adminSavedState: null,
        heatmapFilter: 'all',
        weeklyGraphFilter: 'all',
        dashboardGraphFilter: 'all',
        selectedCategory: 'all',
        viewingHabitMap: null,
      });
    } else {
      setStore({
        isImpersonating: null,
        impersonatedUserName: "",
        impersonatedProfileId: 'main',
        heatmapFilter: 'all',
        weeklyGraphFilter: 'all',
        dashboardGraphFilter: 'all',
        selectedCategory: 'all',
        viewingHabitMap: null,
      });
    }
  },

  setStorePartial: (partial) => setStore(partial),
  savePartialToIDB: async (partial) => await getStore().saveToIDB(partial),

  // ── Guest Account Management ─────────────────────────────────────────────
  createNewGuestAccount: async (name) => {
    const trimmed = name?.trim();
    if (!trimmed) return;

    const current = getStore();
    if (!current.isAuthenticated && current.guestName?.trim()) {
      await getStore().saveCurrentGuestAccount();
    }
    if (auth?.currentUser) {
      try { await signOutCrossPlatform(auth); } catch (e) { console.warn(e); }
    }

    const accounts = (await get('adib_guest_accounts')) || [];
    const existing = accounts.find(a => a.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      await getStore().loadGuestAccount(existing.id);
      return;
    }

    const defaults = getGlobalDefaultsClone();
    const newGuestData = {
      trackerData: {},
      dayUpdatedAt: {},
      habits: defaults.habits,
      habitConfigs: defaults.habitConfigs,
      categories: defaults.categories,
      archivedHabits: [],
      trashedHabits: [],
      shieldedDates: [],
      activeProfileId: 'main',
      cloudProfiles: {
        main: extractProfileSnapshot({ ...defaults, trackerData: {} }, trimmed, 'main', true),
      },
      theme: current.theme || 'dark',
      tableOrientation: current.tableOrientation || 'horizontal',
      textSizes: current.textSizes || { habit: 14, table1: 12, table2: 11, tabSize: 110 },
      isMobileMode: current.isMobileMode || false,
      mobileModeLocked: Boolean(current.mobileModeLocked),
      savedLevel: 1,
      guestName: trimmed,
      manualXPOffset: 0,
      manualStreakOffset: 0,
      lastUpdated: Date.now()
    };

    const newEntry = {
      id: Date.now().toString(),
      name: trimmed,
      savedAt: Date.now(),
      data: newGuestData
    };

    accounts.unshift(newEntry);
    await set('adib_guest_accounts', accounts);
    await set('adib_habit_data', newGuestData);
    setStore({
      ...newGuestData,
      user: null,
      isAuthenticated: false,
      currentUid: null,
      isHydrating: false,
      heatmapFilter: 'all',
      weeklyGraphFilter: 'all',
      dashboardGraphFilter: 'all',
      selectedCategory: 'all',
      viewingHabitMap: null,
    });
  },

  renameGuestAccount: async (oldName, newName) => {
    const trimmed = (newName || '').trim();
    if (!trimmed) return;
    const state = getStore();
    const accounts = (await get('adib_guest_accounts')) || [];
    const idx = accounts.findIndex(a => a.name.toLowerCase() === (oldName || state.guestName || '').trim().toLowerCase());
    const updatedCloudProfiles = { ...(state.cloudProfiles || {}) };
    if (updatedCloudProfiles.main) {
      updatedCloudProfiles.main = { ...updatedCloudProfiles.main, name: trimmed };
    }
    setStore({ guestName: trimmed, cloudProfiles: updatedCloudProfiles });
    const snapshot = toPersistedData(getStore());
    if (idx >= 0) {
      accounts[idx] = { ...accounts[idx], name: trimmed, savedAt: Date.now(), data: snapshot };
    } else {
      accounts.unshift({ id: Date.now().toString(), name: trimmed, savedAt: Date.now(), data: snapshot });
    }
    await set('adib_guest_accounts', accounts);
    await set('adib_habit_data', snapshot);
  },

  listGuestAccounts: async () => {
    try {
      return (await get('adib_guest_accounts')) || [];
    } catch {
      return [];
    }
  },

  saveCurrentGuestAccount: async () => {
    const state = getStore();
    const name = state.guestName?.trim();
    if (!name) return;
    const accounts = (await get('adib_guest_accounts')) || [];
    const existing = accounts.findIndex(a => a.name.toLowerCase() === name.toLowerCase());
    const snapshot = toPersistedData(state);
    const entry = {
      id: existing >= 0 ? accounts[existing].id : Date.now().toString(),
      name,
      savedAt: Date.now(),
      data: snapshot,
    };
    if (existing >= 0) accounts[existing] = entry;
    else accounts.push(entry);
    await set('adib_guest_accounts', accounts);
    return entry;
  },

  loadGuestAccount: async (id) => {
    if (auth?.currentUser) {
      try { await signOutCrossPlatform(auth); } catch (e) { console.warn(e); }
    }
    const accounts = (await get('adib_guest_accounts')) || [];
    const account = accounts.find(a => a.id === id);
    if (!account) return;
    const defaults = getGlobalDefaultsClone();
    const data = { ...account.data };
    if (!Array.isArray(data.habits)) data.habits = defaults.habits;
    if (!Array.isArray(data.archivedHabits)) data.archivedHabits = [];
    data.trashedHabits = purgeExpiredTrash(data.trashedHabits);
    if (!Array.isArray(data.shieldedDates)) data.shieldedDates = [];
    if (!data.trackerData) data.trackerData = {};
    if (!data.dayUpdatedAt) data.dayUpdatedAt = {};
    if (!data.activeProfileId) data.activeProfileId = 'main';
    if (!data.cloudProfiles) {
      data.cloudProfiles = { main: extractProfileSnapshot(data, data.guestName || 'Main Profile', 'main', true) };
    }
    if (data.theme) applyThemeToDOM(data.theme);
    setStore({
      ...data,
      user: null,
      isAuthenticated: false,
      currentUid: null,
      isHydrating: false,
      heatmapFilter: 'all',
      weeklyGraphFilter: 'all',
      dashboardGraphFilter: 'all',
      selectedCategory: 'all',
      viewingHabitMap: null,
    });
    await set('adib_habit_data', data);
  },

  deleteGuestAccount: async (id) => {
    const state = getStore();
    const accounts = (await get('adib_guest_accounts')) || [];
    const target = accounts.find(a => a.id === id);
    await set('adib_guest_accounts', accounts.filter(a => a.id !== id));

    if (
      target &&
      !state.isAuthenticated &&
      state.guestName?.trim().toLowerCase() === target.name?.trim().toLowerCase()
    ) {
      await getStore().resetLocalSession();
    }
  },
}));

useHabitStore.getState().init();
