## File: src/store/useHabitStore.js (Continued)
Location: `src/store/useHabitStore.js` (Continued)

```js
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

    // Sync active profile inside cloudProfiles map
    const nextStatePreview = { ...stateBefore, ...updates, lastUpdated: now };
    const activeId = nextStatePreview.activeProfileId || 'main';
    const updatedCloudProfiles = { ...(nextStatePreview.cloudProfiles || {}) };
    updatedCloudProfiles[activeId] = extractProfileSnapshot(
      nextStatePreview,
      updatedCloudProfiles[activeId]?.name || (activeId === 'main' ? (nextStatePreview.user?.displayName || nextStatePreview.guestName || 'Main Profile') : 'Profile'),
      activeId,
      activeId === 'main'
    );

    setStore({ ...updates, cloudProfiles: updatedCloudProfiles, lastUpdated: now });

    const state = getStore();
    const dataToSave = { ...toPersistedData(state), lastUpdated: now };

    // Also mirror the 'main' profile at root document fields so root stats always stay consistent
    if (dataToSave.cloudProfiles?.main && state.activeProfileId !== 'main') {
      const mainSnap = dataToSave.cloudProfiles.main;
      PROFILE_SCOPED_KEYS.forEach((k) => {
        if (mainSnap[k] !== undefined) dataToSave[k] = mainSnap[k];
      });
    }

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

    await set('adib_habit_data', toPersistedData(state));

    if (!state.isAuthenticated && state.guestName && state.guestName.trim()) {
      try {
        const accounts = (await get('adib_guest_accounts')) || [];
        const existingIdx = accounts.findIndex(a => a.name.toLowerCase() === state.guestName.trim().toLowerCase());
        const entry = {
          id: existingIdx >= 0 ? accounts[existingIdx].id : Date.now().toString(),
          name: state.guestName.trim(),
          savedAt: Date.now(),
          data: toPersistedData(state),
        };
        if (existingIdx >= 0) accounts[existingIdx] = entry;
        else accounts.unshift(entry);
        await set('adib_guest_accounts', accounts);
      } catch (err) {
        console.warn("Guest account auto-save failed:", err);
      }
    }

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

  startImpersonation: (targetUser, targetProfileId = 'main') => {
    const state = getStore();
    const adminStateBackup = {
      trackerData: state.trackerData,
      habits: state.habits,
      habitConfigs: state.habitConfigs,
      categories: state.categories,
      archivedHabits: state.archivedHabits,
      shieldedDates: state.shieldedDates,
      activeProfileId: state.activeProfileId,
      cloudProfiles: state.cloudProfiles,
      theme: state.theme,
      tableOrientation: state.tableOrientation,
      textSizes: state.textSizes,
      isMobileMode: state.isMobileMode,
      savedLevel: state.savedLevel,
      guestName: state.guestName,
      manualXPOffset: state.manualXPOffset,
      manualStreakOffset: state.manualStreakOffset,
    };

    const userProfiles = targetUser.cloudProfiles && typeof targetUser.cloudProfiles === 'object'
      ? { ...targetUser.cloudProfiles }
      : { main: extractProfileSnapshot(targetUser, targetUser.displayName || targetUser.guestName || 'Main Profile', 'main', true) };

    if (!userProfiles.main) {
      userProfiles.main = extractProfileSnapshot(targetUser, targetUser.displayName || targetUser.guestName || 'Main Profile', 'main', true);
    }

    const chosenId = userProfiles[targetProfileId] ? targetProfileId : 'main';
    const chosenSnap = userProfiles[chosenId];

    setStore({
      isImpersonating: targetUser.id,
      impersonatedUserName: targetUser.displayName || targetUser.guestName || "Unknown User",
      impersonatedProfileId: chosenId,
      adminSavedState: adminStateBackup,
      activeProfileId: chosenId,
      cloudProfiles: userProfiles,
      trackerData: chosenSnap.trackerData || {},
      habits: chosenSnap.habits || DEFAULT_HABITS,
      habitConfigs: chosenSnap.habitConfigs || DEFAULT_CONFIGS,
      categories: chosenSnap.categories || DEFAULT_CATEGORIES,
      archivedHabits: chosenSnap.archivedHabits || [],
      shieldedDates: chosenSnap.shieldedDates || [],
      theme: targetUser.theme || 'dark',
      tableOrientation: targetUser.tableOrientation || 'horizontal',
      textSizes: targetUser.textSizes || { habit: 14, table1: 12, table2: 11, tabSize: 110 },
      savedLevel: chosenSnap.savedLevel || 1,
      guestName: targetUser.guestName || "",
      manualXPOffset: chosenSnap.manualXPOffset || 0,
      manualStreakOffset: chosenSnap.manualStreakOffset || 0,
    });
  },

  stopImpersonation: () => {
    const state = getStore();
    if (state.adminSavedState) {
      setStore({
        ...state.adminSavedState,
        isImpersonating: null,
        impersonatedUserName: "",
        impersonatedProfileId: 'main',
        adminSavedState: null
      });
    } else {
      setStore({
        isImpersonating: null,
        impersonatedUserName: "",
        impersonatedProfileId: 'main',
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
      try { await signOut(auth); } catch (e) { console.warn(e); }
    }

    const accounts = (await get('adib_guest_accounts')) || [];
    const existing = accounts.find(a => a.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      await getStore().loadGuestAccount(existing.id);
      return;
    }

    const newGuestData = {
      trackerData: {},
      habits: DEFAULT_HABITS,
      habitConfigs: DEFAULT_CONFIGS,
      categories: DEFAULT_CATEGORIES,
      archivedHabits: [],
      shieldedDates: [],
      activeProfileId: 'main',
      cloudProfiles: {
        main: extractProfileSnapshot({}, trimmed, 'main', true),
      },
      theme: current.theme || 'dark',
      tableOrientation: current.tableOrientation || 'horizontal',
      textSizes: current.textSizes || { habit: 14, table1: 12, table2: 11, tabSize: 110 },
      isMobileMode: current.isMobileMode || false,
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
    setStore({ ...newGuestData, user: null, isAuthenticated: false, currentUid: null, isHydrating: false });
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
      try { await signOut(auth); } catch (e) { console.warn(e); }
    }
    const accounts = (await get('adib_guest_accounts')) || [];
    const account = accounts.find(a => a.id === id);
    if (!account) return;
    const data = { ...account.data };
    if (!Array.isArray(data.habits)) data.habits = DEFAULT_HABITS;
    if (!Array.isArray(data.archivedHabits)) data.archivedHabits = [];
    if (!Array.isArray(data.shieldedDates)) data.shieldedDates = [];
    if (!data.trackerData) data.trackerData = {};
    if (!data.activeProfileId) data.activeProfileId = 'main';
    if (!data.cloudProfiles) {
      data.cloudProfiles = { main: extractProfileSnapshot(data, data.guestName || 'Main Profile', 'main', true) };
    }
    setStore({ ...data, user: null, isAuthenticated: false, currentUid: null, isHydrating: false });
    await set('adib_habit_data', data);
  },

  deleteGuestAccount: async (id) => {
    const accounts = (await get('adib_guest_accounts')) || [];
    await set('adib_guest_accounts', accounts.filter(a => a.id !== id));
  },
}));

useHabitStore.getState().init();
```

---

## File: src/App.jsx
Location: `src/App.jsx`

```jsx
/* Credit: Adib | APM | RU | Bangladesh | email: hasanshahriaradib@gmail.com | updated:22-01-2026 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Analytics } from "@vercel/analytics/react";
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebase.config';
import { useHabitStore } from './store/useHabitStore';
import { getSafeKey, parseLocalDate, loadConfettiScript, solveFluidPath, findClosestSuggestion } from './utils';
import { useNavigate } from 'react-router-dom';
import HeaderProfile from './components/HeaderProfile';
import AuthModal from './components/AuthModal';
import NamePromptModal from './components/NamePromptModal';
import {
  ResponsiveContainer, AreaChart, BarChart, CartesianGrid,
  XAxis, YAxis, Area, Bar, Tooltip as RechartsTooltip, Cell
} from 'recharts';
// --- Icons ---
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);
const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
);
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6"/></svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
);
const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/> 
  </svg>
);

const ArrowUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 15 7-7 7 7"/></svg>
);

const ArrowDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 9-7 7-7-7"/></svg>
);
    
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
);
const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
);
const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
);
const NoteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);
const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);
const SquareTargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="2"/><rect width="12" height="12" x="6" y="6" rx="1.5"/><rect width="4" height="4" x="10" y="10" rx="1"/></svg>
);
const FlameIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
);
const ExportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
);
const MaximizeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
);
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
);
const TableRotateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="10" height="14" x="3" y="5" rx="1.5" opacity="0.4"/>
    <rect width="14" height="10" x="7" y="11" rx="1.5" />
  </svg>
);
const TextSizeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
);
const ImportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
);
const OrderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
);
const ChevronUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
);
const ArchiveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>
);
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);
const AnimatedNumber = ({ value }) => {
  const safe = (isNaN(value) || value === undefined || value === null) ? 0 : Math.round(value);
  const digits = String(safe).split('');
  return (
    <div className="inline-flex items-center overflow-hidden h-[1.2em] leading-[1.2em]">
      {digits.map((digit, idx) => (
        <div key={idx} className="relative w-[1.2ch] h-[1.2em]">
          <motion.div
            animate={{ y: `-${parseInt(digit) * 1.2}em` }}
            transition={{ type: "spring", stiffness: 40, damping: 14 }}
            className="absolute flex flex-col items-center w-full"
          >
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <div key={n} className="h-[1.2em] flex items-center justify-center">{n}</div>
            ))}
          </motion.div>
        </div>
      ))}
      <span className="ml-0.5">%</span>
    </div>
  );
};

// ─── Thanos Snap Disintegration Component ───────────────────────────────────
// Authentic Avengers: Infinity War disintegration effect:
// 1. A crumbling disintegration wave sweeps across the element (left to right).
// 2. Ash, cinder, and dust particles break off along the glowing wave front.
// 3. Ash particles catch the wind, billowing upward and to the right while fading.
// 4. Smooth height collapse after disintegration completes so layout transitions cleanly.
const ThanosDisintegrate = ({ children, shouldDisintegrate, onDone }) => {
  const containerRef = React.useRef(null);
  const cardRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const animFrameRef = React.useRef(null);
  const collapsingRef = React.useRef(false);
  const [phase, setPhase] = React.useState('idle'); // 'idle' | 'snapping' | 'collapsing' | 'done'
  const [collapseHeight, setCollapseHeight] = React.useState(null);
  const [dimensions, setDimensions] = React.useState({ w: 0, h: 0 });

  React.useEffect(() => {
    if (!shouldDisintegrate || phase !== 'idle') return;

    const el = cardRef.current;
    if (!el) {
      if (onDone) onDone();
      return;
    }

    const rect = el.getBoundingClientRect();
    const W = Math.round(rect.width);
    const H = Math.round(rect.height);

    if (W <= 0 || H <= 0) {
      if (onDone) onDone();
      return;
    }

    // Extra padding around canvas so ash particles can billow upward and right without clipping
    const PADDING_TOP = 60;
    const PADDING_RIGHT = 80;
    const CANVAS_W = W + PADDING_RIGHT;
    const CANVAS_H = H + PADDING_TOP;

    setDimensions({ w: CANVAS_W, h: CANVAS_H });
    setCollapseHeight(H);
    setPhase('snapping');

    const DURATION = 2200; // total cinematic experience

    const startSnapAnimation = (snapshotCanvas) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = CANVAS_W;
      canvas.height = CANVAS_H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Extract colors from snapshot or use rich ash & ember palette
      let sampleColors = [
        'rgba(71, 85, 105, 0.95)',   // slate-600
        'rgba(51, 65, 85, 0.95)',   // slate-700
        'rgba(30, 41, 59, 1.0)',    // slate-800
        'rgba(148, 163, 184, 0.85)', // slate-400
        'rgba(245, 158, 11, 0.95)',  // amber ember
        'rgba(251, 191, 36, 0.95)',  // glowing cinder
        'rgba(16, 185, 129, 0.85)',  // emerald speck
      ];

      if (snapshotCanvas) {
        try {
          const sCtx = snapshotCanvas.getContext('2d');
          const sW = snapshotCanvas.width;
          const sH = snapshotCanvas.height;
          const imgData = sCtx.getImageData(0, 0, Math.min(W, sW), Math.min(H, sH));
          const data = imgData.data;
          const extracted = [];
          for (let i = 0; i < data.length; i += 4 * 120) {
            if (data[i + 3] > 40) {
              extracted.push(`rgba(${data[i]},${data[i + 1]},${data[i + 2]},${data[i + 3] / 255})`);
            }
          }
          if (extracted.length > 20) sampleColors = extracted;
        } catch (e) {
          // fallback palette preserved
        }
      }

      // Generate ash & dust particles along the sweep
      const PARTICLE_COUNT = 850;
      const particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const originX = Math.random() * W;
        const originY = Math.random() * H;
        // Wave sweeps from left to right: wave front reaches x over 0 to 1100ms
        const waveDelay = (originX / W) * (DURATION * 0.50) + (Math.random() - 0.5) * 160;
        const color = sampleColors[Math.floor(Math.random() * sampleColors.length)];
        const size = 1.8 + Math.random() * 4.2;

        // Upward-right drift (like ash caught in the wind)
        const angle = -Math.PI * 0.28 + (Math.random() - 0.5) * 0.5;
        const speed = 1.3 + Math.random() * 3.4;

        particles.push({
          x: originX,
          y: originY + PADDING_TOP, // offset for top padding
          vx: Math.cos(angle) * speed + (Math.random() * 0.7),
          vy: Math.sin(angle) * speed - (0.7 + Math.random() * 1.8),
          curl: (Math.random() - 0.5) * 0.08,
          size,
          color,
          delay: Math.max(0, waveDelay),
          life: 700 + Math.random() * 850,
        });
      }

      const startTime = performance.now();

      const render = (now) => {
        const elapsed = now - startTime;
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

        const waveProgress = Math.min(1, elapsed / (DURATION * 0.52));
        const waveX = waveProgress * (W + 40);

        // Draw remaining solid portion with jagged crumbling edge if snapshot exists
        if (snapshotCanvas && waveProgress < 1) {
          ctx.save();
          ctx.translate(0, PADDING_TOP);
          ctx.beginPath();
          ctx.moveTo(waveX, 0);
          const steps = 18;
          for (let s = 0; s <= steps; s++) {
            const py = (H / steps) * s;
            const jitter = Math.sin(s * 1.9 + elapsed * 0.012) * 14 + Math.cos(s * 2.8) * 8;
            ctx.lineTo(waveX + jitter, py);
          }
          ctx.lineTo(W, H);
          ctx.lineTo(W, 0);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(snapshotCanvas, 0, 0, snapshotCanvas.width, snapshotCanvas.height, 0, 0, W, H);
          ctx.restore();

          // Draw glowing ember disintegration seam
          ctx.save();
          ctx.translate(0, PADDING_TOP);
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          for (let s = 0; s <= steps; s++) {
            const py = (H / steps) * s;
            const jitter = Math.sin(s * 1.9 + elapsed * 0.012) * 14 + Math.cos(s * 2.8) * 8;
            if (s === 0) ctx.moveTo(waveX + jitter, py);
            else ctx.lineTo(waveX + jitter, py);
          }
          ctx.stroke();
          ctx.restore();
        }

        // Fast batch rendering of ash particles
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (elapsed < p.delay) continue;

          const age = elapsed - p.delay;
          if (age > p.life) continue;

          const prog = age / p.life;
          const alpha = (1 - prog) * (1 - Math.pow(prog, 1.8));

          p.vx += p.curl;
          p.vy -= 0.03; // thermal lift upward
          p.x += p.vx;
          p.y += p.vy;

          ctx.globalAlpha = Math.max(0, alpha);
          ctx.fillStyle = p.color;
          const s = p.size * (1 - prog * 0.45);
          ctx.fillRect(p.x, p.y, s, s);
        }

        // Trigger smooth height & margin collapse as the wave finishes so the space slides closed naturally
        if (elapsed > DURATION * 0.48 && !collapsingRef.current) {
          collapsingRef.current = true;
          setPhase('collapsing');
        }

        if (elapsed < DURATION) {
          animFrameRef.current = requestAnimationFrame(render);
        } else {
          setPhase('done');
          if (onDone) onDone();
        }
      };

      animFrameRef.current = requestAnimationFrame(render);
    };

    // Load html2canvas with fail-safe timeout
    let started = false;
    const fallbackTimer = setTimeout(() => {
      if (!started) {
        started = true;
        startSnapAnimation(null);
      }
    }, 350);

    import('html2canvas')
      .then(({ default: html2canvas }) => {
        return html2canvas(el, {
          backgroundColor: null,
          scale: Math.min(window.devicePixelRatio || 1, 2),
          useCORS: true,
          logging: false,
        });
      })
      .then(snap => {
        if (!started) {
          started = true;
          clearTimeout(fallbackTimer);
          startSnapAnimation(snap);
        }
      })
      .catch(() => {
        if (!started) {
          started = true;
          clearTimeout(fallbackTimer);
          startSnapAnimation(null);
        }
      });

    return () => {
      clearTimeout(fallbackTimer);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldDisintegrate]);

  if (phase === 'done') return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        overflow: phase === 'collapsing' ? 'hidden' : 'visible',
        height: phase === 'collapsing' ? 0 : (collapseHeight !== null ? `${collapseHeight}px` : 'auto'),
        opacity: phase === 'collapsing' ? 0 : 1,
        marginBottom: phase === 'collapsing' ? 0 : '2rem',
        transition: phase === 'collapsing' ? 'height 650ms cubic-bezier(0.4, 0, 0.2, 1), margin-bottom 650ms cubic-bezier(0.4, 0, 0.2, 1), opacity 650ms ease' : 'none',
      }}
    >
      {/* Real element - completely hidden during snapping & collapsing so it NEVER flashes back */}
      <div
        ref={cardRef}
        style={{
          visibility: phase === 'idle' ? 'visible' : 'hidden',
          display: phase === 'collapsing' ? 'none' : 'block',
        }}
      >
        {children}
      </div>

      {/* Disintegration Canvas - remains active and visible across snapping AND collapsing */}
      {phase !== 'idle' && (
        <canvas
          ref={canvasRef}
          width={dimensions.w}
          height={dimensions.h}
          style={{
            position: 'absolute',
            top: -60, // matches PADDING_TOP so particles float above the card naturally
            left: 0,
            width: dimensions.w ? `${dimensions.w}px` : '100%',
            height: dimensions.h ? `${dimensions.h}px` : '100%',
            pointerEvents: 'none',
            zIndex: 40,
          }}
        />
      )}
    </div>
  );
};
// ────────────────────────────────────────────────────────────────────────────


const DEFAULT_HABITS = ["sleep 7h", "calisthenics", "meditation", "dept study", "coding", "vocab", "audiobook"];
const DEFAULT_CONFIGS = {
  "sleep 7h": { steps: 1 },
  "calisthenics": { steps: 1 },
  "meditation": { steps: 1 },
  "dept study": { steps: 1 },
  "coding": { steps: 1},
  "vocab": { steps: 15 },
  "audiobook": { steps: 1 }
};

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function App() {
  const isHydrating = useHabitStore(state => state.isHydrating);
  const trackerData = useHabitStore(state => state.trackerData);
  const habits = useHabitStore(state => state.habits);
  const habitConfigs = useHabitStore(state => state.habitConfigs);
  const categories = useHabitStore(state => state.categories);
  const archivedHabits = useHabitStore(state => state.archivedHabits);
  const theme = useHabitStore(state => state.theme);
  const tableOrientation = useHabitStore(state => state.tableOrientation);
  const textSizes = useHabitStore(state => state.textSizes);
  const isMobileMode = useHabitStore(state => state.isMobileMode);
  
  const currentDate = useHabitStore(state => state.currentDate);
  const setCurrentDate = useHabitStore(state => state.setCurrentDate);
  const viewingHabitMap = useHabitStore(state => state.viewingHabitMap);
  const setViewingHabitMap = useHabitStore(state => state.setViewingHabitMap);
  const heatmapFilter = useHabitStore(state => state.heatmapFilter);
```

---

