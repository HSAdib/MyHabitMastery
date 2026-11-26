/* Credit: Adib | APM | RU | Bangladesh | email: hasanshahriaradib@gmail.com | updated:22-01-2026 */

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Analytics } from "@vercel/analytics/react";
import { motion, AnimatePresence } from 'framer-motion';
import { isNativePlatform, signOutCrossPlatform } from './platform/nativeAuth';
import { auth } from './firebase.config';
import { useHabitStore } from './store/useHabitStore';
import { getSafeKey, parseLocalDate, loadConfettiScript, solveFluidPath, findClosestSuggestion, isHabitActiveOnDate, TRASH_RETENTION_DAYS, TRASH_RETENTION_MS, purgeExpiredTrash } from './utils';
import { useNavigate } from 'react-router-dom';
import HeaderProfile from './components/HeaderProfile';
import NamePromptModal from './components/NamePromptModal';
import { SUPER_ADMIN_EMAIL } from './components/ProtectedAdminRoute';
import AutoFitText from './components/AutoFitText';
import ActivityHeatmap from './components/ActivityHeatmap';
import AppLogo from './components/AppLogo';
import HelpGuideModal from './components/HelpGuideModal';
import FilterDropdown from './components/FilterDropdown';
import { TutorialTipCard } from './components/ThanosOnboarding';
import {
  ResponsiveContainer, AreaChart, BarChart, CartesianGrid,
  XAxis, YAxis, Area, Bar, Tooltip as RechartsTooltip, Cell
} from 'recharts';
// --- Icons ---
const CheckIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12" /></svg>
);
const ShieldIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
);
const HeaderFireIcon = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}><g transform="translate(-6.25, 25.73) scale(0.0185, -0.0185)"><path d="M950 1303 c-25 -21 -55 -49 -67 -63 -53 -60 -107 -191 -133 -324 -12 -58 -12 -58 -32 -39 -10 11 -25 37 -32 57 l-13 38 -22 -30 c-39 -55 -82 -159 -98 -238 -13 -66 -14 -92 -5 -158 57 -390 516 -537 773 -248 139 156 152 377 37 607 -59 117 -128 200 -128 153 0 -16 -31 -78 -40 -78 -11 0 -84 109 -119 178 -17 34 -37 88 -44 119 -8 31 -18 58 -23 60 -6 2 -30 -14 -54 -34z m147 -468 c41 -55 86 -122 100 -149 27 -53 40 -141 29 -199 -16 -87 -107 -167 -207 -182 -162 -24 -308 141 -266 301 18 69 86 186 165 285 76 95 64 99 179 -56z" /></g></svg>
);
const EditIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
);
const TrashIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6" /></svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
);
const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 15 7-7 7 7" /></svg>
);

const ArrowDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 9-7 7-7-7" /></svg>
);

const XIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18M6 6l12 12" /></svg>
);
const TrophyIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
);
const ActivityIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
);
const NoteIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
);
const FlameIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
);
const MaximizeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></svg>
);
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
);
const TableRotateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="10" height="14" x="3" y="5" rx="1.5" opacity="0.4" />
    <rect width="14" height="10" x="7" y="11" rx="1.5" />
  </svg>
);
const TextSizeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
);
const ChevronUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
);
const ArchiveIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="5" x="2" y="3" rx="1" /><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /><path d="M10 12h4" /></svg>
);
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
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
  const trashedHabits = useHabitStore(state => state.trashedHabits || []);
  const activeTrashedHabits = useMemo(() => purgeExpiredTrash(trashedHabits), [trashedHabits]);
  const theme = useHabitStore(state => state.theme);
  const tableOrientation = useHabitStore(state => state.tableOrientation);
  const textSizes = useHabitStore(state => state.textSizes);
  const isMobileMode = useHabitStore(state => state.isMobileMode);

  const currentDate = useHabitStore(state => state.currentDate);
  const setCurrentDate = useHabitStore(state => state.setCurrentDate);
  const viewingHabitMap = useHabitStore(state => state.viewingHabitMap);
  const setViewingHabitMap = useHabitStore(state => state.setViewingHabitMap);
  const weeklyGraphFilter = useHabitStore(state => state.weeklyGraphFilter);
  const setWeeklyGraphFilter = useHabitStore(state => state.setWeeklyGraphFilter);
  const dashboardGraphFilter = useHabitStore(state => state.dashboardGraphFilter);
  const setDashboardGraphFilter = useHabitStore(state => state.setDashboardGraphFilter);
  const selectedCategory = useHabitStore(state => state.selectedCategory);
  const setSelectedCategory = useHabitStore(state => state.setSelectedCategory);
  const savedLevel = useHabitStore(state => state.savedLevel);
  const shieldedDates = useHabitStore(state => state.shieldedDates || []);
  const toggleShieldDate = useHabitStore(state => state.toggleShieldDate);
  const importStatus = useHabitStore(state => state.importStatus);

  const updateHabitValueStore = useHabitStore(state => state.updateHabitValue);
  const setTheme = useHabitStore(state => state.setTheme);
  const setStorePartial = useHabitStore(state => state.setStorePartial);
  const savePartialToIDB = useHabitStore(state => state.savePartialToIDB);
  const resetLocalSession = useHabitStore(state => state.resetLocalSession);
  const mobileModeLocked = useHabitStore(state => state.mobileModeLocked);
  const user = useHabitStore(state => state.user);
  const isAuthenticated = useHabitStore(state => state.isAuthenticated);
  const authInitialized = useHabitStore(state => state.authInitialized);
  const guestName = useHabitStore(state => state.guestName);
  const manualXPOffset = useHabitStore(state => state.manualXPOffset);
  const manualStreakOffset = useHabitStore(state => state.manualStreakOffset);
  const isImpersonating = useHabitStore(state => state.isImpersonating);
  const impersonatedUserName = useHabitStore(state => state.impersonatedUserName);
  const stopImpersonation = useHabitStore(state => state.stopImpersonation);
  const saveCurrentGuestAccount = useHabitStore(state => state.saveCurrentGuestAccount);
  const activeProfileId = useHabitStore(state => state.activeProfileId || 'main');
  const cloudProfiles = useHabitStore(state => state.cloudProfiles || {});
  const isSuperAdmin = isAuthenticated && Boolean(user?.emailVerified) && user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL;

  const navigate = useNavigate();

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);

  const handleLogin = () => {
    setShowWelcomeModal(true);
  };

  // Opens the guest account picker (save current guest first if one is active)
  const handleSwitchToGuestPicker = async () => {
    if (guestName) await saveCurrentGuestAccount();
    setShowGuestPicker(true);
  };

  const handleLogout = async () => {
    try {
      if (auth) await signOutCrossPlatform(auth);
      await resetLocalSession();
    } catch (error) {
      console.error('Logout Failed', error);
    }
  };

  // Per-account tutorial tip state — each tip stays visible until user clicks Dismiss (triggers Thanos Snap)
  const accountTipKey = user?.uid
    ? `uid:${user.uid}:${activeProfileId}`
    : (guestName ? `guest:${guestName}` : 'anon');
  const readTipsForAccount = (key) => {
    try {
      const raw = localStorage.getItem(`hm_tips_${key}`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };
  const [dismissedTips, setDismissedTips] = useState(() => readTipsForAccount(accountTipKey));
  const [snappingTips, setSnappingTips] = useState({});

  useEffect(() => {
    setDismissedTips(readTipsForAccount(accountTipKey));
    setSnappingTips({});
  }, [accountTipKey]);

  const triggerTipSnap = useCallback((tipId) => {
    setSnappingTips(prev => ({ ...prev, [tipId]: true }));
  }, []);

  const finishTipSnap = useCallback((tipId) => {
    setDismissedTips(prev => {
      const next = { ...prev, [tipId]: true };
      try { localStorage.setItem(`hm_tips_${accountTipKey}`, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
    setSnappingTips(prev => {
      const next = { ...prev };
      delete next[tipId];
      return next;
    });
  }, [accountTipKey]);

  const resetAllTutorials = useCallback(() => {
    try { localStorage.removeItem(`hm_tips_${accountTipKey}`); } catch { /* ignore */ }
    setDismissedTips({});
    setSnappingTips({});
    setShowHelpModal(false);
    useHabitStore.getState().triggerActionToast({
      type: 'success',
      title: 'Tutorials Restored',
      subtitle: 'All in-app guide cards are back on screen.',
    }, 3000);
  }, [accountTipKey]);
  const [editingHabitName, setEditingHabitName] = useState(null);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const [tempHabitName, setTempHabitName] = useState("");
  const [editingNoteDate, setEditingNoteDate] = useState(null);
  const [confirmDeleteNoteDate, setConfirmDeleteNoteDate] = useState(null);
  const [showAllNotes, setShowAllNotes] = useState(false);

  const actionToast = useHabitStore(state => state.actionToast);
  const triggerActionToast = useHabitStore(state => state.triggerActionToast);
  const dismissActionToast = useHabitStore(state => state.dismissActionToast);
  const sessionExpiredModal = useHabitStore(state => state.sessionExpiredModal);
  const setSessionExpiredModal = useHabitStore(state => state.setSessionExpiredModal);

  // 04/10 Online / Offline Network State
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [reconnectedBanner, setReconnectedBanner] = useState(false);

  // 09/10 Inline Validation errors for Manage Modal
  const [habitInputError, setHabitInputError] = useState('');
  const [catInputError, setCatInputError] = useState('');
  const [manageSearchQuery, setManageSearchQuery] = useState('');

  // Journal History Modal: 51-entry centered state, inline editing & search
  const [journalSearchQuery, setJournalSearchQuery] = useState('');
  const [inlineEditingJournalKey, setInlineEditingJournalKey] = useState(null);
  const [inlineJournalDraft, setInlineJournalDraft] = useState('');
  const todayJournalCardRef = useRef(null);
  const journalListContainerRef = useRef(null);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [showShieldModal, setShowShieldModal] = useState(false);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [showMonthlyGraphModal, setShowMonthlyGraphModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveModalTab, setArchiveModalTab] = useState('archive'); // 'archive' | 'trash'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [manageModalTab, setManageModalTab] = useState('categories');
  const [showTextSizeModal, setShowTextSizeModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [showLevelDetailsModal, setShowLevelDetailsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showTrophyDetailsModal, setShowTrophyDetailsModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [newCatInput, setNewCatInput] = useState("");
  const [newHabitInput, setNewHabitInput] = useState("");
  const [assigningCategory, setAssigningCategory] = useState(null);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [isAddingQuickCat, setIsAddingQuickCat] = useState(false);
  const [quickCatInput, setQuickCatInput] = useState("");
  const [inlineHabitInput, setInlineHabitInput] = useState("");
  const [inlineHabitError, setInlineHabitError] = useState("");
  const [showQuickAddHabitModal, setShowQuickAddHabitModal] = useState(false);
  const [quickHabitDraft, setQuickHabitDraft] = useState({ name: '', category: 'all', steps: 1, priority: 1 });
  const [quickHabitError, setQuickHabitError] = useState("");
  const [isAddingModalCat, setIsAddingModalCat] = useState(false);
  const [modalNewCatInput, setModalNewCatInput] = useState("");
  const [activeSlider, setActiveSlider] = useState(null);
  const [isEditingTabName, setIsEditingTabName] = useState(false);
  const [tableHeight, setTableHeight] = useState(484);
  const [tempGoalVal, setTempGoalVal] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [selectedHeatmapDay, setSelectedHeatmapDay] = useState(null);
  const handleOpenNotes = useCallback(() => setShowAllNotes(true), []);
  const handleOpenInsights = useCallback(() => setShowInsightsModal(true), []);
  const noteSaveTimer = useRef(null); // Fix #15

  const longPressTimer = useRef(null);
  const scrollContainerRef = useRef(null);
  const isDraggingTable = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const save = (newTrackerData, newHabits, newConfigs) => {
    savePartialToIDB({
      trackerData: newTrackerData,
      habits: newHabits,
      habitConfigs: newConfigs
    });
  };

  const updateHabitValue = (dateKey, habit, val) => {
    updateHabitValueStore(dateKey, habit, val);
  };

  const setHabits = (newHabits) => setStorePartial({ habits: newHabits });
  const setHabitConfigs = (newConfigs) => setStorePartial({ habitConfigs: newConfigs });
  const setTrackerData = (newData) => setStorePartial({ trackerData: newData });
  const setCategories = (newCategories) => {
    savePartialToIDB({ categories: newCategories });
  };
  const setTextSizes = (newSizes) => {
    savePartialToIDB({ textSizes: newSizes });
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const toggleTableOrientation = () => {
    const newOrientation = tableOrientation === 'horizontal' ? 'vertical' : 'horizontal';
    savePartialToIDB({ tableOrientation: newOrientation });
  };

  const toggleMobileMode = () => {
    const newMode = !isMobileMode;
    const nextSizes = newMode
      ? { ...textSizes, habit: 10, table1: 9, table2: 9, tabSize: 75 }
      : { ...textSizes, habit: 14, table1: 12, table2: 11, tabSize: 110 };
    savePartialToIDB({ isMobileMode: newMode, mobileModeLocked: true, textSizes: nextSizes });
  };

  const updateTextSize = (key, value) => {
    const newSizes = { ...textSizes, [key]: parseInt(value) };
    setTextSizes(newSizes);
  };

  const moveCategoryUp = (index) => {
    if (index <= 1) return;
    const newCats = [...categories];
    [newCats[index - 1], newCats[index]] = [newCats[index], newCats[index - 1]];
    setCategories(newCats);
  };

  const moveCategoryDown = (index) => {
    if (index === 0 || index >= categories.length - 1) return;
    const newCats = [...categories];
    [newCats[index + 1], newCats[index]] = [newCats[index], newCats[index + 1]];
    setCategories(newCats);
  };

  const deleteCategory = (catToDelete) => {
    if (catToDelete === 'all') return;
    setCategoryToDelete(catToDelete);
  };

  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    const newCats = categories.filter(c => c !== categoryToDelete);
    const newConfigs = { ...habitConfigs };
    Object.keys(newConfigs).forEach(h => {
      if (newConfigs[h]?.category === categoryToDelete) {
        newConfigs[h] = { ...newConfigs[h], category: 'all' };
      }
    });
    savePartialToIDB({ categories: newCats, habitConfigs: newConfigs });
    if (selectedCategory === categoryToDelete) setSelectedCategory('all');
    setCategoryToDelete(null);
  };

  const closeManageModal = () => {
    setShowManageModal(false);
    setEditingHabitName(null);
    setEditingCat(null);
    setManageSearchQuery('');
    setHabitInputError('');
    setCatInputError('');
  };

  const handleCategoryRename = (oldName, newName) => {
    const formattedName = newName.toLowerCase().trim();
    if (!formattedName || formattedName === oldName) {
      setEditingCat(null);
      return;
    }
    if (categories.includes(formattedName)) {
      triggerActionToast({
        type: 'error',
        title: 'Category Already Exists',
        subtitle: `A category named "${formattedName}" already exists.`,
      }, 3000);
      setEditingCat(null);
      return;
    }

    const newCats = categories.map(c => c === oldName ? formattedName : c);
    const newConfigs = { ...habitConfigs };
    Object.keys(newConfigs).forEach(h => {
      if (newConfigs[h]?.category === oldName) {
        newConfigs[h] = { ...newConfigs[h], category: formattedName };
      }
    });
    savePartialToIDB({ categories: newCats, habitConfigs: newConfigs });

    if (selectedCategory === oldName) setSelectedCategory(formattedName);
    if (assigningCategory === oldName) setAssigningCategory(formattedName);
    setEditingCat(null);
  };

  /** Switch dashboard category filter cleanly and collapse stale inline editors. */
  const selectDashboardCategory = (cat) => {
    setSelectedCategory(cat);
    if (assigningCategory && assigningCategory !== cat) {
      setAssigningCategory(null);
    }
    if (inlineHabitError) setInlineHabitError('');
  };

  /** Create and persist a category by name, returning the normalized name on success. */
  const createCategoryByName = (rawName, onError) => {
    const name = rawName.toLowerCase().trim();
    if (!name) return null;
    if (categories.includes(name)) {
      if (onError) onError(`The category "${name}" already exists.`);
      return null;
    }
    const newCats = [...categories, name];
    setCategories(newCats);
    triggerActionToast({
      type: 'success',
      title: 'Category Created',
      subtitle: `Category "${name}" added.`,
    }, 2600);
    return name;
  };

  const handleManualAddCategory = () => {
    const created = createCategoryByName(newCatInput, setCatInputError);
    if (!created) return;
    setCatInputError('');
    setNewCatInput("");
  };

  /** Toggle whether an active habit belongs to a target category without closing multi-assign. */
  const toggleHabitCategoryMembership = (habit, targetCategory) => {
    const isMember = habitConfigs[habit]?.category === targetCategory;
    const nextCategory = isMember ? 'all' : targetCategory;
    const newConfigs = {
      ...habitConfigs,
      [habit]: { ...(habitConfigs[habit] || { steps: 1 }), category: nextCategory }
    };
    setHabitConfigs(newConfigs);
    save(trackerData, habits, newConfigs);
    setAssigningCategory(targetCategory);
  };

  /** Create a habit in the target category with optional steps/priority and duplicate checks. */
  const createHabitInCategory = (rawName, targetCategory, onError, options = {}) => {
    const name = rawName.trim();
    if (!name) return false;
    if (habits.some(h => h.toLowerCase() === name.toLowerCase())) {
      if (onError) onError(`A habit named "${name}" already exists. Try a distinct name.`);
      return false;
    }
    if (archivedHabits.some(h => h.toLowerCase() === name.toLowerCase())) {
      if (onError) onError(`A habit named "${name}" is archived. Unarchive it in Archive.`);
      return false;
    }
    if (activeTrashedHabits.some(t => t.name.toLowerCase() === name.toLowerCase())) {
      if (onError) onError(`"${name}" is in Trash. Restore it from Trash or pick a different name.`);
      return false;
    }
    if (onError) onError('');
    const categoryToAssign = targetCategory === 'all' ? 'all' : targetCategory;
    const steps = Math.max(1, parseInt(options.steps) || 1);
    const priority = Math.max(1, Math.min(10, parseInt(options.priority) || 1));
    const newHabits = [...habits, name];
    const newConfigs = {
      ...habitConfigs,
      [name]: { steps, ...(priority > 1 ? { priority } : {}), category: categoryToAssign }
    };
    setHabits(newHabits);
    setHabitConfigs(newConfigs);
    save(trackerData, newHabits, newConfigs);
    triggerActionToast({
      type: 'success',
      title: 'Habit Added',
      subtitle: `"${name}" added to ${categoryToAssign === 'all' ? 'All Habits' : categoryToAssign}.`,
    }, 2600);
    return true;
  };

  /** Open the sleek Quick-Add Habit modal pre-targeted to a category. */
  const openQuickAddHabitModal = (defaultCat = selectedCategory) => {
    setQuickHabitDraft({
      name: '',
      category: defaultCat && categories.includes(defaultCat) ? defaultCat : 'all',
      steps: 1,
      priority: 1,
    });
    setQuickHabitError('');
    setIsAddingModalCat(false);
    setModalNewCatInput('');
    setShowQuickAddHabitModal(true);
  };

  /** Update goal steps (1–99) for the currently inspected habit and persist. */
  const updateViewingHabitSteps = (rawVal) => {
    if (!viewingHabitMap) return;
    let val = parseInt(rawVal);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 99) val = 99;
    setTempGoalVal(val);
    const nc = {
      ...habitConfigs,
      [viewingHabitMap]: {
        ...(habitConfigs[viewingHabitMap] || { priority: 1, steps: 1 }),
        steps: val,
      },
    };
    setHabitConfigs(nc);
    save(trackerData, habits, nc);
  };

  /** Update XP priority multiplier (1–10x) for the currently inspected habit and persist. */
  const updateViewingHabitPriority = (rawVal) => {
    if (!viewingHabitMap) return;
    const val = Math.max(1, Math.min(10, parseInt(rawVal) || 1));
    const nc = {
      ...habitConfigs,
      [viewingHabitMap]: {
        ...(habitConfigs[viewingHabitMap] || { steps: 1 }),
        priority: val,
      },
    };
    setHabitConfigs(nc);
    save(trackerData, habits, nc);
  };

  const handleAddHabitFromInput = () => {
    if (!createHabitInCategory(newHabitInput, selectedCategory, setHabitInputError)) return;
    setNewHabitInput("");
  };

  useEffect(() => {
    const handleResize = () => {
      if (!mobileModeLocked) {
        setStorePartial({ isMobileMode: window.innerWidth <= 768 });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setStorePartial, mobileModeLocked]);

  // 04/10 Online / Offline Network State Listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setReconnectedBanner(true);
      useHabitStore.getState().syncToCloud?.();
      setTimeout(() => setReconnectedBanner(false), 4000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setReconnectedBanner(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const todayDateKey = getSafeKey(new Date());

  const centeredJournalEntries = useMemo(() => {
    const allNoteKeys = Object.keys(trackerData).filter(
      (k) => k !== todayDateKey && trackerData[k]?.note && trackerData[k].note.trim() !== ''
    );

    // Sort all existing note dates chronologically (oldest -> newest)
    allNoteKeys.sort((a, b) => parseLocalDate(a) - parseLocalDate(b));

    const beforeKeys = allNoteKeys.filter((k) => k < todayDateKey);
    const laterKeys = allNoteKeys.filter((k) => k > todayDateKey);

    // Take up to 25 closest before-days and up to 25 closest later-days (plus today = 51 max).
    // If one side has fewer than 25, allocate the remaining capacity to the other side so up to 51 total load!
    let takeBefore = Math.min(beforeKeys.length, 25);
    let takeLater = Math.min(laterKeys.length, 25);

    if (takeBefore < 25 && laterKeys.length > takeLater) {
      takeLater = Math.min(laterKeys.length, 50 - takeBefore);
    } else if (takeLater < 25 && beforeKeys.length > takeBefore) {
      takeBefore = Math.min(beforeKeys.length, 50 - takeLater);
    }

    const closestBefore = beforeKeys.slice(beforeKeys.length - takeBefore);
    const closestLater = laterKeys.slice(0, takeLater);

    // Keep chronological order: closestBefore above Today, Today in the middle, closestLater below Today.
    const orderedKeys = [...closestBefore, todayDateKey, ...closestLater];

    return orderedKeys.map((k) => ({
      dateKey: k,
      isToday: k === todayDateKey,
      note: trackerData[k]?.note || '',
      noteTime: trackerData[k]?.noteTime || null,
      hasNote: Boolean(trackerData[k]?.note && trackerData[k].note.trim() !== ''),
    }));
  }, [trackerData, todayDateKey]);

  const filteredJournalEntries = useMemo(() => {
    const q = journalSearchQuery.toLowerCase().trim();
    if (!q) return centeredJournalEntries;
    return centeredJournalEntries.filter(entry => {
      if (entry.isToday && !entry.hasNote) return false;
      const dateFormatted = parseLocalDate(entry.dateKey)
        .toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
        .toLowerCase();
      const noteText = (entry.note || '').toLowerCase();
      return noteText.includes(q) || dateFormatted.includes(q);
    });
  }, [centeredJournalEntries, journalSearchQuery]);

  const journalTypoSuggestion = useMemo(() => {
    if (!journalSearchQuery.trim() || filteredJournalEntries.length > 0) return null;
    const words = centeredJournalEntries
      .filter(e => e.hasNote)
      .flatMap(e => (e.note || '').split(/\s+/))
      .filter(w => w.length > 3);
    return findClosestSuggestion(journalSearchQuery, Array.from(new Set(words)));
  }, [journalSearchQuery, filteredJournalEntries, centeredJournalEntries]);

  // Center on Today and pre-open editor if Today is blank
  useEffect(() => {
    if (!showAllNotes) return;
    setJournalSearchQuery('');
    const todayNote = useHabitStore.getState().trackerData[todayDateKey]?.note || '';
    if (!todayNote.trim()) {
      setInlineEditingJournalKey(todayDateKey);
      setInlineJournalDraft('');
    } else {
      setInlineEditingJournalKey(null);
      setInlineJournalDraft('');
    }
    const timer = setTimeout(() => {
      if (todayJournalCardRef.current) {
        todayJournalCardRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [showAllNotes, todayDateKey]);

  useEffect(() => {
    if (viewingHabitMap) {
      setTempGoalVal(habitConfigs[viewingHabitMap]?.steps || 1);
    }
  }, [viewingHabitMap, habitConfigs]);

  // Auto-purge Trash entries older than 30 days (including all saved records)
  useEffect(() => {
    if (isHydrating || trashedHabits.length === 0) return;
    if (activeTrashedHabits.length !== trashedHabits.length) {
      savePartialToIDB({ trashedHabits: activeTrashedHabits });
    }
  }, [isHydrating, trashedHabits, activeTrashedHabits]);

  // Auto-scroll to today (only when month or table orientation changes)
  useEffect(() => {
    const scrollToToday = () => {
      const todayKey = getSafeKey(new Date());
      const container = scrollContainerRef.current;
      if (!container) return;

      if (tableOrientation === 'vertical') {
        const element = document.getElementById(`row-${todayKey}`);
        if (element) {
          container.scrollTo({ top: element.offsetTop - 144, behavior: 'smooth' });
        }
      } else {
        const element = document.getElementById(`col-${todayKey}`);
        if (element) {
          const colWidth = element.offsetWidth;
          container.scrollTo({
            left: element.offsetLeft - 120 - (colWidth * 2),
            behavior: 'smooth'
          });
        }
      }
    };

    const timer = setTimeout(scrollToToday, 500);
    return () => clearTimeout(timer);
  }, [currentDate, tableOrientation]);

  // Update vertical table height on resize only
  useEffect(() => {
    const handleTableHeight = () => {
      if (!isMobileMode) {
        const targetHeight = Math.max(350, window.innerHeight - 470);
        setTableHeight(targetHeight);
      }
    };
    handleTableHeight();
    window.addEventListener('resize', handleTableHeight);
    return () => window.removeEventListener('resize', handleTableHeight);
  }, [isMobileMode]);

  // Grab-to-scroll & Shift+Wheel horizontal scroll on the table container
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    let wheelRaf = null;
    let targetScrollLeft = el.scrollLeft;

    const stepSmoothScroll = () => {
      const diff = targetScrollLeft - el.scrollLeft;
      if (Math.abs(diff) < 0.5) {
        el.scrollLeft = targetScrollLeft;
        wheelRaf = null;
        return;
      }
      el.scrollLeft += diff * 0.22;
      wheelRaf = requestAnimationFrame(stepSmoothScroll);
    };

    const onMouseDown = (e) => {
      if (e.button !== 0) return;
      if (e.target.closest('button, input, select, textarea, a')) return;
      if (wheelRaf) {
        cancelAnimationFrame(wheelRaf);
        wheelRaf = null;
      }
      isDraggingTable.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop };
      el.style.cursor = 'grabbing';
      el.style.userSelect = 'none';
    };
    const onMouseMove = (e) => {
      if (!isDraggingTable.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      el.scrollLeft = dragStart.current.scrollLeft - dx;
      el.scrollTop = dragStart.current.scrollTop - dy;
    };
    const onMouseUp = () => {
      if (!isDraggingTable.current) return;
      isDraggingTable.current = false;
      el.style.cursor = 'grab';
      el.style.userSelect = '';
    };
    const onWheel = (e) => {
      if (!e.shiftKey) return;
      const rawDelta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (rawDelta !== 0 && el.scrollWidth > el.clientWidth) {
        e.preventDefault();
        const multiplier = e.deltaMode === 1 ? 32 : 1.35;
        if (!wheelRaf) targetScrollLeft = el.scrollLeft;
        const maxScroll = el.scrollWidth - el.clientWidth;
        targetScrollLeft = Math.max(0, Math.min(maxScroll, targetScrollLeft + rawDelta * multiplier));
        if (!wheelRaf) {
          wheelRaf = requestAnimationFrame(stepSmoothScroll);
        }
      }
    };

    el.style.cursor = 'grab';
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('blur', onMouseUp);
    return () => {
      if (wheelRaf) cancelAnimationFrame(wheelRaf);
      isDraggingTable.current = false;
      el.style.cursor = '';
      el.style.userSelect = '';
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('wheel', onWheel);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('blur', onMouseUp);
    };
  }, [tableOrientation, isHydrating, isMobileMode]);

  // Global ESC key handler — closes any open modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (showWelcomeModal || showGuestPicker || showAuthModal) {
        setShowWelcomeModal(false);
        setShowGuestPicker(false);
        setShowAuthModal(false);
        return;
      }
      if (viewingHabitMap) { setViewingHabitMap(null); setIsEditingTabName(false); return; }
      if (editingNoteDate) { setEditingNoteDate(null); return; }
      if (showDeleteConfirm) { setShowDeleteConfirm(false); setHabitToDelete(null); return; }
      if (showWeeklyModal) { setShowWeeklyModal(false); return; }
      if (showMonthlyGraphModal) { setShowMonthlyGraphModal(false); return; }
      if (showAllNotes) { setShowAllNotes(false); return; }
      if (showInsightsModal) { setShowInsightsModal(false); return; }
      if (showShieldModal) { setShowShieldModal(false); return; }
      if (showManageModal) { closeManageModal(); return; }
      if (showQuickAddHabitModal) { setShowQuickAddHabitModal(false); return; }
      if (showTextSizeModal) { setShowTextSizeModal(false); return; }
      if (showHelpModal) { setShowHelpModal(false); return; }
      if (showArchiveModal) { setShowArchiveModal(false); return; }
      if (showLevelDetailsModal) { setShowLevelDetailsModal(false); return; }
      if (showTrophyDetailsModal) { setShowTrophyDetailsModal(false); return; }
      if (showLevelUpModal) { setShowLevelUpModal(false); return; }
      if (categoryToDelete) { setCategoryToDelete(null); return; }
      if (selectedHeatmapDay) { setSelectedHeatmapDay(null); return; }
      if (editingCat) { setEditingCat(null); return; }
      if (isManagingCategories) { setIsManagingCategories(false); return; }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewingHabitMap, editingNoteDate, showDeleteConfirm, showWeeklyModal, showMonthlyGraphModal, showAllNotes, showInsightsModal, showShieldModal, showManageModal, showQuickAddHabitModal, showTextSizeModal, showHelpModal, showArchiveModal, showLevelDetailsModal, showTrophyDetailsModal, showLevelUpModal, categoryToDelete, selectedHeatmapDay, editingCat, isManagingCategories, showWelcomeModal, showGuestPicker, showAuthModal]);

  // Logic Handlers
  const handleDashboardRename = (oldName) => {
    const newName = tempHabitName.trim();
    setEditingHabitName(null);
    if (newName === oldName) return;
    if (!newName) {
      setHabitToDelete(oldName);
      setShowDeleteConfirm(true);
    } else {
      executeRename(oldName, newName);
    }
  };

  const handleTabRename = () => {
    const oldName = viewingHabitMap;
    const newName = tempHabitName.trim();
    setIsEditingTabName(false);
    if (newName === oldName) return;
    if (!newName) {
      setHabitToDelete(oldName);
      setShowDeleteConfirm(true);
    } else if (executeRename(oldName, newName)) {
      setViewingHabitMap(newName);
    }
  };

  const executeRename = (oldName, newName) => {
    if (habits.some(h => h !== oldName && h.toLowerCase() === newName.toLowerCase())) {
      triggerActionToast({
        type: 'error',
        title: 'Habit Already Exists',
        subtitle: `A habit named "${newName}" already exists.`,
      }, 4000);
      return false;
    }
    if (activeTrashedHabits.some(t => t.name.toLowerCase() === newName.toLowerCase())) {
      triggerActionToast({
        type: 'error',
        title: 'Habit Name in Trash',
        subtitle: `"${newName}" is in Trash. Restore it from Trash or pick a different name.`,
      }, 4000);
      return false;
    }
    const newHabits = [...habits];
    const idx = newHabits.indexOf(oldName);
    if (idx === -1) return false;
    newHabits[idx] = newName;
    const newConfigs = { ...habitConfigs };
    newConfigs[newName] = newConfigs[oldName] || { steps: 1 };
    delete newConfigs[oldName];
    const newData = { ...trackerData };
    Object.keys(newData).forEach(k => {
      if (newData[k] && newData[k][oldName] !== undefined) {
        newData[k] = { ...newData[k], [newName]: newData[k][oldName] };
        delete newData[k][oldName];
      }
    });
    const newArchived = archivedHabits.map(h => h === oldName ? newName : h);
    savePartialToIDB({
      habits: newHabits,
      habitConfigs: newConfigs,
      trackerData: newData,
      archivedHabits: newArchived,
    });
    triggerActionToast({
      type: 'success',
      title: 'Renamed Successfully',
      subtitle: `Renamed "${oldName}" to "${newName}".`,
    }, 3000);
    const st = useHabitStore.getState();
    const filterUpdates = {};
    if (st.heatmapFilter === oldName) filterUpdates.heatmapFilter = newName;
    if (st.weeklyGraphFilter === oldName) filterUpdates.weeklyGraphFilter = newName;
    if (st.dashboardGraphFilter === oldName) filterUpdates.dashboardGraphFilter = newName;
    if (Object.keys(filterUpdates).length > 0) setStorePartial(filterUpdates);
    return true;
  };

  /** Soft-delete a habit into Trash (retaining config & all date records for 30 days). */
  const deleteHabit = (name) => {
    if (!name) return;
    const orderIndex = habits.indexOf(name);
    const wasArchived = archivedHabits.includes(name);
    const configSnapshot = habitConfigs[name] ? { ...habitConfigs[name] } : { steps: 1 };
    const records = {};

    const newHabits = habits.filter(h => h !== name);
    const newConfigs = { ...habitConfigs };
    delete newConfigs[name];
    const newData = { ...trackerData };
    Object.keys(newData).forEach(k => {
      if (newData[k] && newData[k][name] !== undefined) {
        records[k] = newData[k][name];
        const dayCopy = { ...newData[k] };
        delete dayCopy[name];
        newData[k] = dayCopy;
      }
    });
    const newArchived = archivedHabits.filter(h => h !== name);
    const trashEntry = {
      name,
      deletedAt: Date.now(),
      orderIndex: orderIndex >= 0 ? orderIndex : habits.length,
      wasArchived,
      config: configSnapshot,
      records,
    };
    const nextTrash = [trashEntry, ...activeTrashedHabits.filter(t => t.name !== name)];

    savePartialToIDB({
      habits: newHabits,
      habitConfigs: newConfigs,
      trackerData: newData,
      archivedHabits: newArchived,
      trashedHabits: nextTrash,
    });
    const st = useHabitStore.getState();
    const filterUpdates = {};
    if (st.heatmapFilter === name) filterUpdates.heatmapFilter = 'all';
    if (st.weeklyGraphFilter === name) filterUpdates.weeklyGraphFilter = 'all';
    if (st.dashboardGraphFilter === name) filterUpdates.dashboardGraphFilter = 'all';
    if (Object.keys(filterUpdates).length > 0) setStorePartial(filterUpdates);
    if (viewingHabitMap === name) setViewingHabitMap(null);
    if (editingHabitName === name) setEditingHabitName(null);
    setHabitToDelete(null);
    setShowDeleteConfirm(false);
    triggerActionToast({
      type: 'success',
      title: 'Moved to Trash',
      subtitle: `"${name}" stays in Trash for ${TRASH_RETENTION_DAYS} days with all records.`,
    }, 3500);
  };

  /** Restore a habit and all its preserved historical records from 30-day Trash. */
  const restoreHabitFromTrash = (name) => {
    const entry = activeTrashedHabits.find(t => t.name === name);
    if (!entry) return;
    if (habits.some(h => h.toLowerCase() === name.toLowerCase())) {
      triggerActionToast({
        type: 'error',
        title: 'Cannot Restore',
        subtitle: `An active or archived habit named "${name}" already exists.`,
      }, 3500);
      return;
    }

    const insertAt = Math.max(0, Math.min(Number.isFinite(entry.orderIndex) ? entry.orderIndex : habits.length, habits.length));
    const newHabits = [...habits];
    newHabits.splice(insertAt, 0, entry.name);

    const newConfigs = {
      ...habitConfigs,
      [entry.name]: entry.config ? { ...entry.config } : { steps: 1 },
    };

    const newData = { ...trackerData };
    const savedRecords = entry.records && typeof entry.records === 'object' ? entry.records : {};
    const recordKeys = Object.keys(savedRecords);
    recordKeys.forEach((dateKey) => {
      newData[dateKey] = { ...(newData[dateKey] || {}), [entry.name]: savedRecords[dateKey] };
    });

    const newArchived = entry.wasArchived && !archivedHabits.includes(entry.name)
      ? [...archivedHabits, entry.name]
      : archivedHabits;
    const nextTrash = activeTrashedHabits.filter(t => t.name !== entry.name);

    savePartialToIDB({
      habits: newHabits,
      habitConfigs: newConfigs,
      trackerData: newData,
      archivedHabits: newArchived,
      trashedHabits: nextTrash,
    });

    triggerActionToast({
      type: 'success',
      title: 'Habit Restored',
      subtitle: `"${entry.name}" restored with ${recordKeys.length} ${recordKeys.length === 1 ? 'record' : 'records'}.`,
    }, 3500);
  };

  const toggleArchiveHabit = (name) => {
    const todayKey = getSafeKey(new Date());
    const existingCfg = habitConfigs[name] || { steps: 1 };
    const existingRanges = Array.isArray(existingCfg.archivedRanges) ? [...existingCfg.archivedRanges] : [];
    let newArchived;
    let updatedRanges;

    if (archivedHabits.includes(name)) {
      newArchived = archivedHabits.filter(h => h !== name);
      const lastIdx = existingRanges.length - 1;
      if (lastIdx >= 0 && existingRanges[lastIdx]?.to == null) {
        if (existingRanges[lastIdx].from === todayKey) {
          // Archived and restored on the same day: drop the range so today still counts
          updatedRanges = existingRanges.slice(0, lastIdx);
        } else {
          updatedRanges = existingRanges.map((r, i) => (i === lastIdx ? { ...r, to: todayKey } : r));
        }
      } else {
        updatedRanges = existingRanges;
      }
    } else {
      newArchived = [...archivedHabits, name];
      const lastIdx = existingRanges.length - 1;
      if (lastIdx >= 0 && existingRanges[lastIdx]?.to == null) {
        updatedRanges = existingRanges;
      } else {
        updatedRanges = [...existingRanges, { from: todayKey, to: null }];
      }
      setViewingHabitMap(null);
      const st = useHabitStore.getState();
      const filterUpdates = {};
      if (st.heatmapFilter === name) filterUpdates.heatmapFilter = 'all';
      if (st.weeklyGraphFilter === name) filterUpdates.weeklyGraphFilter = 'all';
      if (st.dashboardGraphFilter === name) filterUpdates.dashboardGraphFilter = 'all';
      if (Object.keys(filterUpdates).length > 0) setStorePartial(filterUpdates);
    }

    const newConfigs = {
      ...habitConfigs,
      [name]: { ...existingCfg, archivedRanges: updatedRanges },
    };
    // Single atomic save — persists both archivedHabits and archivedRanges together
    savePartialToIDB({ archivedHabits: newArchived, habitConfigs: newConfigs });
  };

  const saveNote = (dateKey, noteText) => {
    const latest = useHabitStore.getState();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const latestDay = latest.trackerData[dateKey] || {};
    const newTrackerData = {
      ...latest.trackerData,
      [dateKey]: {
        ...latestDay,
        note: noteText,
        noteTime: noteText.trim() ? (latestDay.noteTime || nowTime) : null,
      },
    };
    savePartialToIDB({ trackerData: newTrackerData });
  };

  const deleteNote = (dateKey) => {
    clearTimeout(noteSaveTimer.current);
    const latest = useHabitStore.getState();
    const latestDay = latest.trackerData[dateKey] || {};
    const newTrackerData = {
      ...latest.trackerData,
      [dateKey]: {
        ...latestDay,
        note: '',
        noteTime: null,
      },
    };
    savePartialToIDB({ trackerData: newTrackerData });
  };

  const handleNoteChange = (dateKey, value) => {
    const latest = useHabitStore.getState();
    const latestDay = latest.trackerData[dateKey] || {};
    const newTrackerData = {
      ...latest.trackerData,
      [dateKey]: {
        ...latestDay,
        note: value,
        noteTime: value.trim() ? (latestDay.noteTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : null,
      },
    };
    setTrackerData(newTrackerData);

    clearTimeout(noteSaveTimer.current);
    noteSaveTimer.current = setTimeout(() => saveNote(dateKey, value), 500);
  };

  useEffect(() => {
    return () => clearTimeout(noteSaveTimer.current);
  }, []);
  const handleExport = () => {
    const data = {
      trackerData,
      habits,
      habitConfigs,
      categories,
      archivedHabits,
      shieldedDates,
      version: 'v9',
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `habit-mastery-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Slider Interaction
  const handleHabitPressStart = (e, dateKey, habit, currentVal) => {
    if (parseLocalDate(dateKey).setHours(0, 0, 0, 0) > new Date().setHours(0, 0, 0, 0)) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;


    const startX = e.clientX;
    const startY = e.clientY;

    const val = typeof currentVal === 'number' ? currentVal : (currentVal ? 100 : 0);
    if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId);

    longPressTimer.current = setTimeout(() => {
      setActiveSlider({
        dateKey, habit, value: val,
        x: startX, y: startY
      });
      longPressTimer.current = null;
    }, 450);
  };

  const handleHabitPressEnd = (e, dateKey, habit, currentVal) => {
    if (parseLocalDate(dateKey).setHours(0, 0, 0, 0) > new Date().setHours(0, 0, 0, 0)) return;
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      const val = typeof currentVal === 'number' ? currentVal : (currentVal ? 100 : 0);
      updateHabitValue(dateKey, habit, val >= 100 ? 0 : 100);
    }
  };

  // Memos & Logic
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) { days.push(new Date(date)); date.setDate(date.getDate() + 1); }
    return days;
  }, [currentDate]);

  const modalCalendarGrid = useMemo(() => {
    if (!viewingHabitMap) return [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const cells = [];
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      cells.push(new Date(year, month - 1, prevMonthLastDate - i));
    }
    daysInMonth.forEach(day => cells.push(day));
    return cells;
  }, [viewingHabitMap, currentDate, daysInMonth]);

  const activeHabitsList = useMemo(
    () => habits.filter(h => !archivedHabits.includes(h)),
    [habits, archivedHabits]
  );

  /** Ordered active habits available for Prev/Next stepping inside the Habit Detail modal. */
  const modalNavigableHabits = useMemo(() => {
    const filtered = activeHabitsList.filter(
      h => selectedCategory === 'all' || habitConfigs[h]?.category === selectedCategory
    );
    if (!viewingHabitMap || filtered.includes(viewingHabitMap)) {
      return filtered;
    }
    return activeHabitsList;
  }, [activeHabitsList, selectedCategory, habitConfigs, viewingHabitMap]);

  /** Step backward (-1) or forward (+1) through active habits while inspecting a habit modal. */
  const stepViewingHabit = useCallback((direction) => {
    if (!viewingHabitMap || modalNavigableHabits.length <= 1) return;
    const idx = modalNavigableHabits.indexOf(viewingHabitMap);
    if (idx === -1) return;
    const nextIdx = (idx + direction + modalNavigableHabits.length) % modalNavigableHabits.length;
    setIsEditingTabName(false);
    setViewingHabitMap(modalNavigableHabits[nextIdx]);
  }, [viewingHabitMap, modalNavigableHabits]);

  useEffect(() => {
    if (!viewingHabitMap || modalNavigableHabits.length <= 1) return;
    const onArrowNav = (e) => {
      if (isEditingTabName || showDeleteConfirm) return;
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepViewingHabit(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepViewingHabit(1);
      }
    };
    window.addEventListener('keydown', onArrowNav);
    return () => window.removeEventListener('keydown', onArrowNav);
  }, [viewingHabitMap, modalNavigableHabits.length, isEditingTabName, showDeleteConfirm, stepViewingHabit]);

  const effectiveDashboardFilter = dashboardGraphFilter === 'all' || activeHabitsList.includes(dashboardGraphFilter)
    ? dashboardGraphFilter
    : 'all';
  const effectiveWeeklyFilter = weeklyGraphFilter === 'all' || activeHabitsList.includes(weeklyGraphFilter)
    ? weeklyGraphFilter
    : 'all';

  const xpStats = useMemo(() => {
    let totalXP = manualXPOffset || 0;
    Object.keys(trackerData).forEach(dateKey => {
      habits.forEach(habit => {
        const raw = trackerData[dateKey]?.[habit] ?? 0;
        const val = typeof raw === 'number' ? raw : (raw ? 100 : 0);
        const priority = habitConfigs[habit]?.priority || 1;
        totalXP += (val / 100) * 10 * priority;
      });
    });

    const level = Math.floor(Math.sqrt(totalXP / 100)) + 1;
    const currentLevelXP = Math.pow(level - 1, 2) * 100;
    const nextLevelXP = Math.pow(level, 2) * 100;
    const progressXP = totalXP - currentLevelXP;
    const requiredXP = nextLevelXP - currentLevelXP;
    const progressPct = requiredXP > 0 ? Math.min(100, Math.round((progressXP / requiredXP) * 100)) : 0;

    return {
      level,
      totalXP: Math.round(totalXP),
      progressPct,
      requiredXP: Math.round(requiredXP),
      progressXP: Math.round(progressXP)
    };
  }, [trackerData, habits, habitConfigs, manualXPOffset]);

  const prevLevelRef = useRef(null);
  const levelContextRef = useRef(null);
  const currentUid = useHabitStore(state => state.currentUid);

  useEffect(() => {
    if (isHydrating || isImpersonating) return;

    const contextKey = `${currentUid || guestName || 'anon'}:${activeProfileId}`;
    if (levelContextRef.current !== contextKey || prevLevelRef.current === null) {
      levelContextRef.current = contextKey;
      prevLevelRef.current = Math.max(savedLevel || 1, xpStats.level);
      return;
    }

    if (xpStats.level > prevLevelRef.current) {
      setShowLevelUpModal(true);

      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const playNote = (freq, time, duration) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime + time);
          gain.gain.setValueAtTime(0.1, audioCtx.currentTime + time);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + time + duration);
          osc.start(audioCtx.currentTime + time);
          osc.stop(audioCtx.currentTime + time + duration);
        };
        playNote(523.25, 0, 0.2);
        playNote(659.25, 0.1, 0.2);
        playNote(783.99, 0.2, 0.2);
        playNote(1046.50, 0.4, 0.8);
        setTimeout(() => audioCtx.close().catch(() => { }), 1500);
      } catch (e) { console.error("Audio play failed", e); }

      loadConfettiScript(() => {
        const duration = 3000;
        const end = Date.now() + duration;
        (function frame() {
          if (typeof window.confetti === 'function') {
            window.confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#10b981', '#3b82f6', '#f59e0b'] });
            window.confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#10b981', '#3b82f6', '#f59e0b'] });
          }
          if (Date.now() < end) requestAnimationFrame(frame);
        }());
      });
    }

    if (xpStats.level !== prevLevelRef.current) {
      prevLevelRef.current = xpStats.level;
      savePartialToIDB({ savedLevel: xpStats.level });
    }
  }, [xpStats.level, isHydrating, isImpersonating, currentUid, guestName, activeProfileId, savedLevel]);

  const analytics = useMemo(() => {
    let totalEarnedWeight = 0; let totalPossibleWeight = 0; let noteCount = 0; const stats = {};
    daysInMonth.forEach(day => {
      const key = getSafeKey(day); const dayData = trackerData[key] || {};
      if (dayData.note && dayData.note.trim() !== "") noteCount++;
      const isShielded = shieldedDates.includes(key);
      activeHabitsList.forEach(h => {
        const raw = dayData[h] ?? 0; const val = typeof raw === 'number' ? raw : (raw ? 100 : 0);
        stats[h] = (stats[h] || 0) + val;
        totalEarnedWeight += (val / 100);
        if (isShielded && val < 100) {
          // Grace day: exclude missed habit from penalizing totalPossibleWeight
        } else {
          totalPossibleWeight += 1;
        }
      });
    });
    const monthlyPct = totalPossibleWeight > 0 ? Math.round((totalEarnedWeight / totalPossibleWeight) * 100) : (totalEarnedWeight > 0 ? 100 : 0);
    const habitPcts = {};
    habits.forEach(h => { habitPcts[h] = Math.round(((stats[h] || 0) / (daysInMonth.length * 100)) * 100) || 0; });
    const computedTotalDone = (manualStreakOffset || 0) + Math.round(totalEarnedWeight);
    return { habitPcts, monthlyPct, totalDone: computedTotalDone, noteCount };
  }, [daysInMonth, trackerData, activeHabitsList, manualStreakOffset, habits, shieldedDates]);

  // --- CATEGORY PROGRESS CALCULATION ---
  const categoryProgress = useMemo(() => {
    const stats = {};
    categories.forEach(cat => {
      if (cat === 'all') {
        stats[cat] = analytics.monthlyPct;
      } else {
        const catHabits = habits.filter(h => habitConfigs[h]?.category === cat && !archivedHabits.includes(h));
        if (catHabits.length === 0) {
          stats[cat] = 0;
        } else {
          const totalPct = catHabits.reduce((acc, h) => acc + (analytics.habitPcts[h] || 0), 0);
          stats[cat] = Math.round(totalPct / catHabits.length);
        }
      }
    });
    return stats;
  }, [categories, analytics, habits, habitConfigs, archivedHabits]);

  const categoryCounts = useMemo(() => {
    const counts = { all: activeHabitsList.length };
    categories.forEach(cat => {
      if (cat !== 'all') {
        counts[cat] = habits.filter(h => habitConfigs[h]?.category === cat && !archivedHabits.includes(h)).length;
      }
    });
    return counts;
  }, [categories, habits, habitConfigs, archivedHabits, activeHabitsList.length]);

  const weeklySummary = useMemo(() => {
    const last7Days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(getSafeKey(d));
    }

    const weeklyStats = activeHabitsList.map(habit => {
      let earned = 0;
      last7Days.forEach(date => {
        const raw = trackerData[date]?.[habit] ?? 0;
        const val = typeof raw === 'number' ? raw : (raw ? 100 : 0);
        earned += (val / 100);
      });
      return { name: habit, score: Math.round((earned / 7) * 100) };
    });

    const topHabits = [...weeklyStats].sort((a, b) => b.score - a.score).slice(0, 3);
    const avgScore = activeHabitsList.length > 0 ? Math.round(weeklyStats.reduce((acc, h) => acc + h.score, 0) / activeHabitsList.length) : 0;

    return { topHabits, avgScore, weeklyStats };
  }, [trackerData, activeHabitsList]);
  const weeklyGraphData = useMemo(() => {
    if (effectiveWeeklyFilter === 'all') return weeklySummary.weeklyStats;

    // Generate last 7 days data for the selected habit
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = getSafeKey(d);
      const valRaw = trackerData[key]?.[effectiveWeeklyFilter] ?? 0;
      const score = typeof valRaw === 'number' ? valRaw : (valRaw ? 100 : 0);
      days.push({
        name: d.toLocaleDateString(undefined, { weekday: 'short' }),
        score
      });
    }
    return days;
  }, [effectiveWeeklyFilter, weeklySummary, trackerData]);

  // Per-habit current streak — powers the streak badge on habit cards
  const allHabitStreaks = useMemo(() => {
    const streaks = {};
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    habits.forEach(habit => {
      let streak = 0;
      let checkDate = new Date(today);
      const todayKey = getSafeKey(checkDate);
      const todayValRaw = trackerData[todayKey]?.[habit] ?? 0;
      const todayVal = typeof todayValRaw === 'number' ? todayValRaw : (todayValRaw ? 100 : 0);
      if (Math.round(todayVal) < 100 && !shieldedDates.includes(todayKey)) checkDate.setDate(checkDate.getDate() - 1);
      while (true) {
        const key = getSafeKey(checkDate);
        const valRaw = trackerData[key]?.[habit] ?? 0;
        const val = typeof valRaw === 'number' ? valRaw : (valRaw ? 100 : 0);
        if (Math.round(val) >= 100) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (shieldedDates.includes(key)) {
          // Grace day: preserve running streak across shielded date
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      streaks[habit] = streak;
    });
    return streaks;
  }, [habits, trackerData, shieldedDates]);

  const insightsData = useMemo(() => {
    const streaks = {};
    const currentStreaks = {};
    let perfectDaysCount = 0;
    let totalWins = 0;
    let trackedDaysCount = 0;

    habits.forEach(h => { streaks[h] = 0; currentStreaks[h] = 0; });
    const dayStats = [0, 1, 2, 3, 4, 5, 6].map(() => ({ earned: 0, total: 0 }));

    // 30-day & prior 30-day windows + per-habit 30-day completion
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const todayStr = getSafeKey(today);

    const start30 = new Date(today);
    start30.setDate(start30.getDate() - 29);
    const start30Key = getSafeKey(start30);

    const start60 = new Date(today);
    start60.setDate(start60.getDate() - 59);
    const start60Key = getSafeKey(start60);

    let recent30Earned = 0;
    let recent30Total = 0;
    let prev30Earned = 0;
    let prev30Total = 0;
    let activePerfectStreak = 0;
    let runningPerfectStreak = 0;

    const perHabit30 = {};
    activeHabitsList.forEach(h => { perHabit30[h] = { earned: 0, total: 0 }; });

    const allKeys = Object.keys(trackerData).sort();
    if (allKeys.length > 0) {
      const startDate = parseLocalDate(allKeys[0]);
      let cursor = new Date(startDate);
      while (cursor <= today) {
        const dateStr = getSafeKey(cursor);
        const isShielded = shieldedDates.includes(dateStr);
        const isToday = dateStr === todayStr;
        const dayOfWeek = cursor.getDay();

        let dayScore = 0;
        let activeHabitsForDay = 0;

        habits.forEach(h => {
          const valRaw = trackerData[dateStr]?.[h] ?? 0;
          const score = typeof valRaw === 'number' ? valRaw : (valRaw ? 100 : 0);
          const isActive = isHabitActiveOnDate(h, dateStr, archivedHabits, habitConfigs);

          if (isActive) {
            activeHabitsForDay++;
            dayScore += score;
            dayStats[dayOfWeek].total += 100;
            dayStats[dayOfWeek].earned += score;

            if (dateStr >= start30Key) {
              recent30Earned += score;
              recent30Total += 100;
              if (perHabit30[h]) {
                perHabit30[h].earned += score;
                perHabit30[h].total += 100;
              }
            } else if (dateStr >= start60Key) {
              prev30Earned += score;
              prev30Total += 100;
            }
          }

          if (score >= 100) {
            totalWins++;
            currentStreaks[h]++;
            if (currentStreaks[h] > streaks[h]) streaks[h] = currentStreaks[h];
          } else if (isShielded || isToday) {
            // Preserve running streak on shielded grace days or if today isn't finished yet
          } else {
            currentStreaks[h] = 0;
          }
        });

        if (activeHabitsForDay > 0) {
          if (dayScore > 0) trackedDaysCount++;
          const isPerfect = dayScore >= activeHabitsForDay * 100;
          if (isPerfect) {
            perfectDaysCount++;
            runningPerfectStreak++;
          } else if (isShielded || isToday) {
            // Preserve active perfect streak across shielded/today dates
          } else {
            runningPerfectStreak = 0;
          }
        }

        cursor.setDate(cursor.getDate() + 1);
      }
      activePerfectStreak = runningPerfectStreak;
    }

    const dayAverages = dayStats.map(d => d.total > 0 ? Math.round((d.earned / d.total) * 100) : 0);
    const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const maxDayVal = Math.max(...dayAverages, 0);
    const bestDayIdx = maxDayVal > 0 ? dayAverages.indexOf(maxDayVal) : -1;
    const bestDay = bestDayIdx >= 0 ? days[bestDayIdx] : 'None yet';
    const bestDayScore = bestDayIdx >= 0 ? dayAverages[bestDayIdx] : 0;

    // Lowest non-zero or lowest active weekday to spot dip days
    const nonBestIndices = dayAverages.map((v, i) => ({ v, i })).filter(x => x.i !== bestDayIdx);
    const hasWeekdayActivity = dayStats.some(d => d.total > 0 && d.earned > 0);
    const weakEntry = hasWeekdayActivity && nonBestIndices.length > 0
      ? nonBestIndices.reduce((min, cur) => (cur.v < min.v ? cur : min), nonBestIndices[0])
      : null;
    const weakDay = weakEntry ? days[weakEntry.i] : null;
    const weakDayScore = weakEntry ? weakEntry.v : 0;

    const weekdayBreakdown = shortDays.map((label, idx) => ({
      label,
      fullLabel: days[idx],
      pct: dayAverages[idx],
      isBest: idx === bestDayIdx,
      isWeak: weakEntry ? idx === weakEntry.i && dayAverages[idx] < bestDayScore : false,
    }));

    const consistency30d = recent30Total > 0 ? Math.round((recent30Earned / recent30Total) * 100) : 0;
    const prev30Pct = prev30Total > 0 ? Math.round((prev30Earned / prev30Total) * 100) : null;
    const consistencyDelta = prev30Pct !== null ? consistency30d - prev30Pct : null;

    const habit30Rankings = activeHabitsList
      .map(h => {
        const s = perHabit30[h];
        const pct = s && s.total > 0 ? Math.round((s.earned / s.total) * 100) : 0;
        return { habit: h, pct, currentStreak: currentStreaks[h] || 0, maxStreak: streaks[h] || 0 };
      })
      .sort((a, b) => b.pct - a.pct);

    const topHabit30 = habit30Rankings.length > 0 && habit30Rankings[0].pct > 0 ? habit30Rankings[0] : null;
    const focusHabit30 = habit30Rankings.length > 1 && habit30Rankings[habit30Rankings.length - 1].pct < 75
      ? habit30Rankings[habit30Rankings.length - 1]
      : null;

    const sortedStreaks = Object.entries(streaks)
      .filter(([h, s]) => s > 0 && !archivedHabits.includes(h))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([h, s]) => ({ habit: h, max: s, current: currentStreaks[h] }));

    return {
      bestDay,
      bestDayScore,
      weakDay,
      weakDayScore,
      weekdayBreakdown,
      consistency30d,
      consistencyDelta,
      activePerfectStreak,
      trackedDaysCount,
      topHabit30,
      focusHabit30,
      habit30Rankings,
      topStreaks: sortedStreaks,
      perfectDaysCount,
      totalWins,
    };
  }, [trackerData, habits, activeHabitsList, archivedHabits, habitConfigs, shieldedDates]);

  // Earn 1 Streak Shield on initial start + 1 per Level gained + 1 every 7 Perfect Days
  const shieldStats = useMemo(() => {
    const levelShields = Math.max(0, xpStats.level - 1);
    const perfectDayShields = Math.floor((insightsData?.perfectDaysCount || 0) / 7);
    const totalEarned = Math.max(1, levelShields + perfectDayShields);
    const usedCount = shieldedDates.length;
    const availableCount = Math.max(0, totalEarned - usedCount);

    // Reconstruct chronological per-day shield earn history
    const sortedKeys = Object.keys(trackerData).sort();
    let runningXP = manualXPOffset || 0;
    let runningLevel = Math.floor(Math.sqrt(runningXP / 100)) + 1;
    let runningPerfectDays = 0;
    const dayMap = {};

    const addEarn = (dateKey, count, reason, type) => {
      if (count <= 0) return;
      if (!dayMap[dateKey]) {
        dayMap[dateKey] = { dateKey, count: 0, reasons: [] };
      }
      dayMap[dateKey].count += count;
      dayMap[dateKey].reasons.push({ count, reason, type });
    };

    sortedKeys.forEach((dateKey) => {
      const dayObj = trackerData[dateKey] || {};
      habits.forEach((habit) => {
        const raw = dayObj[habit] ?? 0;
        const val = typeof raw === 'number' ? raw : (raw ? 100 : 0);
        const priority = habitConfigs[habit]?.priority || 1;
        runningXP += (val / 100) * 10 * priority;
      });
      const newLevel = Math.floor(Math.sqrt(runningXP / 100)) + 1;
      if (newLevel > runningLevel) {
        const gained = newLevel - runningLevel;
        const reason = gained === 1
          ? `Reached Level ${newLevel}`
          : `Reached Levels ${runningLevel + 1}–${newLevel}`;
        addEarn(dateKey, gained, reason, 'level');
        runningLevel = newLevel;
      }

      const dayHabits = activeHabitsList.filter(h => isHabitActiveOnDate(h, dateKey, archivedHabits, habitConfigs));
      if (dayHabits.length > 0) {
        const isPerfect = dayHabits.every((h) => {
          const raw = dayObj[h] ?? 0;
          const val = typeof raw === 'number' ? raw : (raw ? 100 : 0);
          return Math.round(val) >= 100;
        });
        if (isPerfect) {
          runningPerfectDays += 1;
          if (runningPerfectDays % 7 === 0) {
            addEarn(dateKey, 1, `7 Perfect Days Milestone (${runningPerfectDays} total)`, 'perfect');
          }
        }
      }
    });

    const earnHistory = Object.values(dayMap).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
    const hasStarterFallback = levelShields + perfectDayShields === 0;

    return {
      totalEarned,
      usedCount,
      availableCount,
      levelShields,
      perfectDayShields,
      hasStarterFallback,
      earnHistory,
    };
  }, [xpStats.level, insightsData?.perfectDaysCount, shieldedDates, trackerData, habits, habitConfigs, manualXPOffset, activeHabitsList]);

  const habitInsights = useMemo(() => {
    if (!viewingHabitMap) return null;

    let monthlyEarned = 0;
    daysInMonth.forEach(day => {
      const key = getSafeKey(day);
      const valRaw = trackerData[key]?.[viewingHabitMap] ?? 0;
      monthlyEarned += (typeof valRaw === 'number' ? valRaw : (valRaw ? 100 : 0));
    });
    const score = Math.round((monthlyEarned / (daysInMonth.length * 100)) * 100);

    const today = new Date();
    today.setHours(12, 0, 0, 0);

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Calculate current streak (counting backwards from today/yesterday)
    let checkDate = new Date(today);
    const todayKey = getSafeKey(checkDate);
    const todayValRaw = trackerData[todayKey]?.[viewingHabitMap] ?? 0;
    const todayVal = typeof todayValRaw === 'number' ? todayValRaw : (todayValRaw ? 100 : 0);

    if (Math.round(todayVal) < 100 && !shieldedDates.includes(todayKey)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const key = getSafeKey(checkDate);
      const valRaw = trackerData[key]?.[viewingHabitMap] ?? 0;
      const val = typeof valRaw === 'number' ? valRaw : (valRaw ? 100 : 0);

      if (Math.round(val) >= 100) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (shieldedDates.includes(key)) {
        // Shielded grace day: preserve currentStreak
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate all-time best streak
    const allDates = Object.keys(trackerData).sort();
    if (allDates.length > 0) {
      const d = parseLocalDate(allDates[0]);
      const todayNoon = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0, 0);

      while (d <= todayNoon) {
        const key = getSafeKey(d);
        const valRaw = trackerData[key]?.[viewingHabitMap] ?? 0;
        const val = typeof valRaw === 'number' ? valRaw : (valRaw ? 100 : 0);

        if (Math.round(val) >= 100) {
          tempStreak++;
          if (tempStreak > bestStreak) bestStreak = tempStreak;
        } else if (shieldedDates.includes(key)) {
          // Shielded grace day
        } else {
          tempStreak = 0;
        }
        d.setDate(d.getDate() + 1);
      }
    }

    if (currentStreak > bestStreak) bestStreak = currentStreak;

    // --- New Last 7 Days Logic for specific habit ---
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = getSafeKey(d);
      const valRaw = trackerData[key]?.[viewingHabitMap] ?? 0;
      const val = typeof valRaw === 'number' ? valRaw : (valRaw ? 100 : 0);
      last7Days.push({
        label: d.toLocaleDateString(undefined, { weekday: 'narrow' }),
        pct: val,
        isToday: d.toDateString() === new Date().toDateString(),
        key: key // Added this to track the live slider
      });
    }

    return {
      score,
      currentStreak,
      bestStreak,
      last7Days,
      level: score >= 90 ? "Grandmaster" : score >= 75 ? "Elite" : score >= 50 ? "Adept" : score >= 25 ? "Apprentice" : "Seed"
    };
  }, [viewingHabitMap, trackerData, daysInMonth, shieldedDates]);

  const monthlyGraphData = useMemo(() => {
    return daysInMonth.map((day) => {
      const key = getSafeKey(day);
      let pct = 0;

      if (effectiveDashboardFilter === 'all') {
        let totalPct = 0;
        activeHabitsList.forEach(h => { const r = trackerData[key]?.[h] ?? 0; totalPct += (typeof r === 'number' ? r : (r ? 100 : 0)); });
        pct = activeHabitsList.length > 0 ? totalPct / activeHabitsList.length : 0;
      } else {
        const r = trackerData[key]?.[effectiveDashboardFilter] ?? 0;
        pct = typeof r === 'number' ? r : (r ? 100 : 0);
      }

      return {
        date: day.getDate(),
        fullDate: day.toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' }),
        score: Math.round(pct)
      };
    });
  }, [daysInMonth, trackerData, activeHabitsList, effectiveDashboardFilter]);

  const trendPoints = useMemo(() => {
    if (daysInMonth.length < 2) return [];
    return daysInMonth.map((day, idx) => {
      const key = getSafeKey(day);
      let pct = 0;

      if (effectiveDashboardFilter === 'all') {
        let totalPct = 0;
        activeHabitsList.forEach(h => { const r = trackerData[key]?.[h] ?? 0; totalPct += (typeof r === 'number' ? r : (r ? 100 : 0)); });
        pct = activeHabitsList.length > 0 ? totalPct / activeHabitsList.length : 0;
      } else {
        const r = trackerData[key]?.[effectiveDashboardFilter] ?? 0;
        pct = typeof r === 'number' ? r : (r ? 100 : 0);
      }

      return { x: (idx / (daysInMonth.length - 1)) * 100, y: 100 - pct };
    }).filter(p => !isNaN(p.x));
  }, [daysInMonth, trackerData, activeHabitsList, effectiveDashboardFilter]);

  // (solveFluidPath is imported from ./utils — local duplicate removed)

  // Styling Helpers
  const getButtonStyles = (val, dateKey) => {
    const isToday = new Date().toDateString() === parseLocalDate(dateKey).toDateString();
    const isPast = parseLocalDate(dateKey).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);

    if (!val) {
      const textCol = isToday ? (theme === 'dark' ? 'text-white' : 'text-slate-400') : (isPast ? 'text-red-500' : (theme === 'dark' ? 'text-slate-700' : 'text-slate-300'));
      return theme === 'dark' ? `bg-slate-800 ${textCol} border-slate-700` : `bg-white ${textCol} border-slate-200 hover:bg-slate-50`;
    }
    if (val < 100) return 'bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-900/20';
    return 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-900/20';
  };
  const getLevelBadgeStyle = (level) => {
    const schemes = [
      'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      'bg-blue-500/10 text-blue-400 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.3)]',
      'bg-purple-500/10 text-purple-400 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]',
      'bg-rose-500/10 text-rose-400 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]',
      'bg-amber-500/10 text-amber-400 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
      'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]',
      'bg-indigo-500/10 text-indigo-400 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.3)]',
      'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/40 shadow-[0_0_15px_rgba(217,70,239,0.3)]',
      'bg-orange-500/10 text-orange-400 border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.3)]',
      'bg-teal-500/10 text-teal-400 border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.3)]'
    ];
    return schemes[(level - 1) % schemes.length];
  };
  const getContainerBg = () => theme === 'dark' ? 'bg-black text-white' : 'bg-white text-slate-900';
  const getCardStyle = () => theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-sm' : 'bg-white border-slate-200 shadow-sm';
  const getTextMuted = () => theme === 'dark' ? 'text-slate-500' : 'text-slate-400';
  const getTableHeadStyle = () => theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200';

  const outerPadding = isMobileMode ? 'px-1 pt-4' : 'px-2 md:px-4 pt-8';
  const cardPadding = isMobileMode ? 'p-3 rounded-2xl' : 'p-6 rounded-[2.5rem]';
  const headerPadding = isMobileMode ? 'p-4 rounded-2xl mb-4 gap-4' : 'p-6 rounded-[2.5rem] mb-6 gap-6';
  const sectionGap = isMobileMode ? 'gap-3 mb-4' : 'gap-6 mb-8';
  const horizontalColWidth = isMobileMode ? '70px' : 'calc((100vw - 160px) / 10)';

  // 02/10 Loading Skeleton State
  if (isHydrating) {
    return (
      <div className={`min-h-screen ${getContainerBg()} font-sans p-4 md:p-8 animate-pulse select-none`}>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800/80"></div>
              <div className="space-y-2">
                <div className="w-40 h-5 bg-slate-800/80 rounded"></div>
                <div className="w-24 h-3 bg-slate-800/50 rounded"></div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-28 h-9 rounded-xl bg-slate-800/70"></div>
              <div className="w-28 h-9 rounded-xl bg-slate-800/70"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 rounded-2xl bg-slate-900/60 border border-slate-800/60 p-4 space-y-3">
                <div className="w-16 h-4 bg-slate-800/80 rounded"></div>
                <div className="w-24 h-7 bg-slate-800/90 rounded"></div>
              </div>
            ))}
          </div>
          <div className="h-72 rounded-3xl bg-slate-900/60 border border-slate-800/60 p-6 space-y-4">
            <div className="w-48 h-5 bg-slate-800/80 rounded"></div>
            <div className="w-full h-44 bg-slate-800/40 rounded-2xl"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 rounded-2xl bg-slate-900/60 border border-slate-800/60 p-4 space-y-3">
                <div className="w-32 h-5 bg-slate-800/80 rounded"></div>
                <div className="w-full h-8 bg-slate-800/50 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getContainerBg()} font-sans pb-6 md:pb-20 overflow-x-hidden ${isImpersonating ? 'pt-12' : ''}`}>
      {!isNativePlatform() && <Analytics />}

      {/* 04/10 Offline / Reconnected Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-2 left-1/2 transform -translate-x-1/2 z-[9999] px-5 py-2.5 rounded-full shadow-2xl border border-amber-500/40 bg-amber-500/95 text-slate-950 text-xs font-black tracking-wide flex items-center gap-2 backdrop-blur-md"
          >
            <span>⚡ You are offline — Showing cached data. Habit logging, streaks &amp; notes still work 100% on this device.</span>
          </motion.div>
        )}
        {isOnline && reconnectedBanner && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-2 left-1/2 transform -translate-x-1/2 z-[9999] px-5 py-2.5 rounded-full shadow-2xl border border-emerald-500/40 bg-emerald-500/95 text-slate-950 text-xs font-black tracking-wide flex items-center gap-2 backdrop-blur-md"
          >
            <span>🔄 Connection restored — Syncing latest changes to cloud...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 10/10 Actionable Success / Action Toast Banner */}
      <AnimatePresence>
        {actionToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] max-w-lg w-[92vw] sm:w-auto px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center justify-between gap-4 backdrop-blur-xl ${actionToast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-100'
              : 'bg-slate-900/95 border-emerald-500/40 text-white shadow-[0_10px_35px_rgba(16,185,129,0.15)]'
              }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">
                {actionToast.type === 'error' ? '⚠️' : '🎉'}
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  {actionToast.title}
                </p>
                {actionToast.subtitle && (
                  <p className="text-[11px] font-medium text-slate-300 leading-tight">
                    {actionToast.subtitle}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {actionToast.actionLabel && (
                <button
                  onClick={() => {
                    if (actionToast.actionType === 'open_today_journal') {
                      setShowAllNotes(true);
                    } else if (actionToast.actionType === 'open_manage_habits') {
                      setManageModalTab('habits');
                      setShowManageModal(true);
                    }
                    dismissActionToast();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20"
                >
                  {actionToast.actionLabel}
                </button>
              )}
              <button
                onClick={dismissActionToast}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Dismiss"
              >
                <XIcon />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Status Toast */}
      <AnimatePresence>
        {importStatus && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] px-6 py-3 rounded-full shadow-2xl border font-black uppercase text-xs tracking-widest flex items-center gap-2 ${importStatus === 'success'
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-500/30'
              : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-500/30'
              }`}
          >
            {importStatus === 'success' ? (
              <><CheckIcon /> Data Imported Successfully</>
            ) : (
              <><XIcon /> Invalid Backup File</>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {isImpersonating && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white font-black text-sm px-4 py-2 flex items-center justify-center gap-4 shadow-xl border-b border-red-800">
          <span className="animate-pulse">⚠️</span>
          <span>IMPERSONATING: {impersonatedUserName}</span>
          <button
            onClick={() => {
              stopImpersonation();
              navigate('/admin-panel');
            }}
            className="bg-black/20 hover:bg-black/40 text-white px-3 py-1 rounded-full text-xs font-bold transition-colors border border-white/10"
          >
            EXIT IMPERSONATION
          </button>
        </div>
      )}

      <motion.div initial="hidden" animate="visible" variants={containerVariants} className={`max-w-7xl mx-auto ${outerPadding} flex flex-col min-h-screen`}>
        <div className="flex-grow">
          {/* Dashboard Header */}
          <motion.div variants={itemVariants} className={`flex flex-col lg:flex-row lg:items-center justify-between ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'} ${getCardStyle()} ${headerPadding} border transition-colors relative overflow-visible z-[100]`}>
            <div className="flex items-center gap-4 z-10">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => window.location.reload()}
                title="Refresh the app"
                className="bg-emerald-600 p-2.5 rounded-2xl text-white shadow-lg animate-glow cursor-pointer"
              >
                <HeaderFireIcon />
              </motion.div>

              <div>
                <h1 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'} tracking-tight leading-none`}>Habit Mastery</h1>
                <div className="flex items-center gap-3 mt-2">
                  <div onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} className={`group relative w-12 h-6 flex items-center rounded-full cursor-pointer transition-all duration-500 shadow-inner ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <motion.div
                      layout
                      className="absolute w-4 h-4 rounded-full shadow-md z-10 flex items-center justify-center bg-white"
                      style={{ left: theme === 'dark' ? '28px' : '4px' }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
                    </motion.div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowTextSizeModal(true)}
                      className={`p-1.5 rounded-lg transition-all border active:scale-90
                        ${theme === 'dark'
                          ? 'bg-slate-800 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)] hover:border-emerald-500/50'
                          : 'bg-white border-emerald-200 text-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.15)] hover:border-emerald-400'
                        }`}
                      title="Adjust Sizes"
                    >
                      <TextSizeIcon />
                    </button>
                    <button
                      onClick={() => setShowHelpModal(true)}
                      className={`p-1.5 rounded-lg transition-all border active:scale-90
                        ${theme === 'dark'
                          ? 'bg-slate-800 border-blue-500/30 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.15)] hover:border-blue-400/60 hover:bg-slate-700'
                          : 'bg-white border-blue-200 text-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.12)] hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      title="How to Use & Customize (Help)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </button>
                  </div>

                  {/* Status Zone - Separated from Buttons */}
                  <div className={`flex items-center gap-3 ml-4 md:ml-8 pl-4 md:pl-6 border-l ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
                    <button
                      onClick={() => setShowLevelDetailsModal(true)}
                      className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border transition-all duration-500 cursor-pointer hover:scale-105 active:scale-95 ${getLevelBadgeStyle(xpStats.level)}`}
                      title="View Level Details"
                    >
                      Level {xpStats.level}
                    </button>
                    <button
                      onClick={() => setShowTrophyDetailsModal(true)}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)] cursor-pointer hover:scale-105 active:scale-95 transition-all"
                      title="View Win Milestones"
                    >
                      <TrophyIcon className="w-2.5 h-2.5 text-yellow-500" />
                      <span className="text-[9px] font-black text-yellow-500">{analytics.totalDone}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 max-w-md z-10">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className={`text-[10px] font-black ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} uppercase tracking-tighter`}>Rank Progression</span>
                <span className={`text-[10px] font-black ${getTextMuted()}`}>{xpStats.progressXP} / {xpStats.requiredXP} XP</span>
              </div>
              <div className={`h-3 w-full rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${xpStats.progressPct}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-gradient-to-r from-emerald-600 to-blue-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </div>
            </div>

            {/* Month Ribbon with Far-Right Alignment */}
            <div className={`flex items-center justify-between ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'} rounded-xl p-1 border transition-colors z-10 w-full lg:w-auto`}>
              {/* Quick Weekly Summary Trigger */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowWeeklyModal(true)}
                title="View this week's habit summary"
                className={`mr-2 px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all ${theme === 'dark' ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm'}`}
              >
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[7px] font-black uppercase tracking-tighter opacity-70">Weekly Avg</span>
                  <span className="text-xs font-black">{weeklySummary.avgScore}%</span>
                </div>
                <TrophyIcon className={weeklySummary.avgScore >= 80 ? "animate-bounce" : ""} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 14px 3px rgba(245,158,11,0.45)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setArchiveModalTab('archive');
                  setShowArchiveModal(true);
                }}
                title="View archived habits (hidden from tracker)"
                className={`mr-1.5 p-2 rounded-xl border flex items-center justify-center transition-all ${theme === 'dark' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'}`}
              >
                <ArchiveIcon />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setArchiveModalTab('trash');
                  setShowArchiveModal(true);
                }}
                title={`Trash (${activeTrashedHabits.length}) — deleted habits kept ${TRASH_RETENTION_DAYS} days`}
                className={`relative mr-2 p-2 rounded-xl border flex items-center justify-center transition-all ${theme === 'dark' ? 'bg-rose-500/10 text-rose-400 border-rose-500/25 hover:bg-rose-500/20' : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'}`}
              >
                <TrashIcon />
                {activeTrashedHabits.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center leading-none shadow-sm">
                    {activeTrashedHabits.length}
                  </span>
                )}
              </motion.button>
              <div className={`w-px h-6 mx-1 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`} />
              {/* Left Side: Date Navigation Group */}
              <div className="flex items-center">
                <motion.button whileTap={{ scale: 0.9 }} title="Previous month" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className={`p-1 md:p-2 ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-white text-slate-600'} rounded-lg transition-all`}><ChevronLeftIcon /></motion.button>
                <span className={`px-1 md:px-4 font-black ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'} min-w-[85px] md:min-w-[140px] text-center text-[10px] md:text-sm`}>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                <motion.button whileTap={{ scale: 0.9 }} title="Next month" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className={`p-1 md:p-2 ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-white text-slate-600'} rounded-lg transition-all`}><ChevronRightIcon /></motion.button>
                {/* Today quick-jump — only visible when not on the current month */}
                {(currentDate.getMonth() !== new Date().getMonth() || currentDate.getFullYear() !== new Date().getFullYear()) && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentDate(new Date())}
                    className={`ml-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${theme === 'dark'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30'
                      : 'bg-emerald-100 border-emerald-300 text-emerald-600 hover:bg-emerald-200'
                      }`}
                    title="Jump to current month"
                  >
                    Today
                  </motion.button>
                )}
              </div>

              {/* Right Side: Profile & Sync UI */}
              <div className="flex items-center gap-3 ml-auto">

                <div className={`w-px h-6 mx-1 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`} />

                {isAuthenticated && activeProfileId !== 'main' && cloudProfiles[activeProfileId] && (
                  <span
                    className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hidden sm:inline-block"
                    title="Currently active sub-profile"
                  >
                    📂 {cloudProfiles[activeProfileId].name}
                  </span>
                )}
                {isSuperAdmin && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/admin-panel')}
                    title="Open Super Admin Command Center"
                    className="px-2.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.25)] cursor-pointer"
                  >
                    <ShieldIcon />
                    <span className="hidden md:inline">Admin</span>
                  </motion.button>
                )}

                <HeaderProfile
                  totalXP={xpStats.totalXP}
                  bestStreak={insightsData.topStreaks[0]?.max || Math.max(0, ...Object.values(allHabitStreaks))}
                  handleLogin={handleLogin}
                  handleLogout={handleLogout}
                  handleExport={handleExport}
                  handleSwitchAccount={handleSwitchToGuestPicker}
                />
              </div>
            </div>
          </motion.div>

          {/* Activity Section */}
          <div className={`${isMobileMode ? 'flex flex-col' : 'grid grid-cols-3'} ${sectionGap} items-stretch`}>
            <ActivityHeatmap
              noteCount={analytics.noteCount}
              availableShields={shieldStats.availableCount}
              onOpenNotes={handleOpenNotes}
              onOpenInsights={handleOpenInsights}
              onOpenShields={() => setShowShieldModal(true)}
              onSelectDay={setSelectedHeatmapDay}
              onboardingBanner={
                <TutorialTipCard
                  isVisible={!isHydrating && !dismissedTips.heatmap}
                  isSnapping={!!snappingTips.heatmap}
                  onDismiss={() => triggerTipSnap('heatmap')}
                  onSnapDone={() => finishTipSnap('heatmap')}
                  theme={theme}
                  accent="emerald"
                  icon={<ActivityIcon className="w-4 h-4" />}
                  eyebrow="Heatmap Guide"
                  title="Per-Habit Intensity & Shields"
                  description="Each square steps color automatically per active habit completed that day. Completing all active habits adds a fire watermark. Click any square to inspect or apply a Streak Shield, and click the Shields pill to view your earn log."
                  badges={['Per-Habit Color', 'All Done = Fire Mark', 'Click Day = Inspect / Shield']}
                  marginBottom="0.75rem"
                />
              }
            />

            <motion.div variants={itemVariants} className={`${isMobileMode ? '' : 'col-span-1'} ${getCardStyle()} ${cardPadding} border relative overflow-hidden flex flex-col justify-between transition-colors h-full min-w-0`}>
              <div className="flex items-center justify-between gap-2 mb-2 relative z-20">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FilterDropdown
                    value={effectiveDashboardFilter}
                    onChange={setDashboardGraphFilter}
                    theme={theme}
                    preserveCase
                    maxWidthClass="max-w-[95px] md:max-w-[125px]"
                    options={[
                      { value: 'all', label: 'Overall' },
                      ...habits.filter(h => !archivedHabits.includes(h)).map(h => ({ value: h, label: h })),
                    ]}
                  />

                  <div className="flex items-baseline gap-1.5 min-w-0 truncate">
                    <span className={`text-base md:text-lg font-black ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} leading-none`}>
                      {effectiveDashboardFilter === 'all' ? analytics.monthlyPct : (analytics.habitPcts[effectiveDashboardFilter] || 0)}%
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-wider truncate ${getTextMuted()}`}>
                      {currentDate.toLocaleDateString(undefined, { month: 'short' })} Trend
                    </span>
                  </div>
                </div>

                {/* Right Side: Expand Graph Button */}
                <button
                  onClick={() => setShowMonthlyGraphModal(true)}
                  className={`h-6 w-6 shrink-0 flex items-center justify-center rounded-lg transition-all border [&>svg]:w-3 [&>svg]:h-3
                    ${theme === 'dark'
                      ? 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
                      : 'bg-white border-slate-200 text-slate-500 hover:text-emerald-600 hover:bg-slate-50 shadow-sm'}`}
                  title="Detailed Monthly Graph"
                >
                  <MaximizeIcon />
                </button>
              </div>
              <TutorialTipCard
                isVisible={!isHydrating && !dismissedTips.trendCard}
                isSnapping={!!snappingTips.trendCard}
                onDismiss={() => triggerTipSnap('trendCard')}
                onSnapDone={() => finishTipSnap('trendCard')}
                theme={theme}
                accent="emerald"
                icon={<ActivityIcon className="w-4 h-4" />}
                eyebrow="Trend Card"
                title="Hover or Expand"
                description="Filter by Overall or one habit, hover points for daily %, or click the expand icon for Weekly & full Monthly graphs."
                marginBottom="0.5rem"
              />
              <div className="flex-1 w-full min-h-[165px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyGraphData} margin={{ top: 8, right: 6, left: -28, bottom: -4 }}>
                    <defs>
                      <linearGradient id="dashTrendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                        <stop offset="65%" stopColor="#10b981" stopOpacity={0.12} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="3 3"
                      stroke={theme === 'dark' ? 'rgba(148,163,184,0.12)' : 'rgba(100,116,139,0.15)'}
                    />
                    <XAxis
                      dataKey="date"
                      height={18}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                      minTickGap={18}
                      tick={{ fontSize: 9, fontWeight: 700, fill: theme === 'dark' ? '#64748b' : '#94a3b8' }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 50, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fontWeight: 700, fill: theme === 'dark' ? '#475569' : '#94a3b8' }}
                    />
                    <RechartsTooltip
                      cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const item = payload[0].payload;
                        return (
                          <div className={`px-2.5 py-1.5 rounded-xl border text-[11px] shadow-lg backdrop-blur-md ${
                            theme === 'dark'
                              ? 'bg-slate-900/95 border-slate-700 text-white'
                              : 'bg-white/95 border-slate-200 text-slate-800'
                          }`}>
                            <div className={`text-[9px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                              {item.fullDate}
                            </div>
                            <div className="font-black text-emerald-500">
                              {item.score}% completed
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      fill="url(#dashTrendGrad)"
                      dot={false}
                      activeDot={{ r: 4.5, fill: '#34d399', stroke: theme === 'dark' ? '#0f172a' : '#ffffff', strokeWidth: 2 }}
                      isAnimationActive={true}
                      animationDuration={900}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
          <div className="mb-6">
            <div className="flex items-center gap-2">
              {/* Clean Scrollable Habit Category Tabs + Inline + New */}
              <div
                onWheel={(e) => {
                  if (e.shiftKey && Math.abs(e.deltaY) > 0) {
                    e.preventDefault();
                    e.currentTarget.scrollLeft += e.deltaY;
                  }
                }}
                className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5"
              >
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const pct = categoryProgress[cat] || 0;
                  const count = categoryCounts[cat] ?? 0;

                  return (
                    <button
                      key={cat}
                      onClick={() => selectDashboardCategory(cat)}
                      title={`Filter by ${cat} — ${count} ${count === 1 ? 'habit' : 'habits'}${count > 0 ? ` (${pct}% monthly)` : ''}`}
                      className={`relative group shrink-0 h-8 px-3 rounded-xl border transition-all duration-200 overflow-hidden flex items-center gap-2 ${isSelected
                        ? (theme === 'dark'
                          ? 'bg-emerald-500/15 border-emerald-500/70 text-emerald-300'
                          : 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs')
                        : (theme === 'dark'
                          ? 'bg-slate-900/75 border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 shadow-xs')
                        }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${isSelected
                          ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.75)]'
                          : (pct > 0 ? 'bg-emerald-500/45 group-hover:bg-emerald-400/70' : (theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'))
                          }`}
                      />
                      <span className="relative z-10 text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                        {cat}
                      </span>
                      <span
                        className={`relative z-10 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold tabular-nums leading-none transition-colors ${isSelected
                          ? (theme === 'dark' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-emerald-500/15 text-emerald-800')
                          : (theme === 'dark' ? 'bg-slate-800 text-slate-400 group-hover:text-slate-300' : 'bg-slate-100 text-slate-500 group-hover:text-slate-700')
                          }`}
                      >
                        {count}
                      </span>
                      {count > 0 && (
                        <span
                          className={`relative z-10 text-[9px] font-black tabular-nums whitespace-nowrap ${isSelected
                            ? (theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600')
                            : (pct > 0 ? 'text-emerald-500/80' : (theme === 'dark' ? 'text-slate-500' : 'text-slate-400'))
                            }`}
                        >
                          {pct}%
                        </span>
                      )}
                      {count > 0 && (
                        <div
                          className={`absolute inset-x-0 bottom-0 h-[2.5px] ${isSelected
                            ? (theme === 'dark' ? 'bg-emerald-950/90' : 'bg-emerald-200/70')
                            : (theme === 'dark' ? 'bg-slate-800/80' : 'bg-slate-100')
                            }`}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                            className={`h-full rounded-r-full ${isSelected
                              ? 'bg-emerald-400'
                              : 'bg-emerald-500/65 group-hover:bg-emerald-500'
                              }`}
                          />
                        </div>
                      )}
                    </button>
                  );
                })}

                {/* Inline Quick-Add Category */}
                {isAddingQuickCat ? (
                  <div className={`shrink-0 h-8 flex items-center gap-1 px-2 rounded-xl border ${theme === 'dark' ? 'bg-slate-900 border-emerald-500/70' : 'bg-white border-emerald-500'}`}>
                    <input
                      autoFocus
                      type="text"
                      value={quickCatInput}
                      onChange={(e) => setQuickCatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const created = createCategoryByName(quickCatInput, (msg) =>
                            triggerActionToast({ type: 'error', title: 'Category Exists', subtitle: msg }, 2500)
                          );
                          if (created) {
                            setQuickCatInput('');
                            setIsAddingQuickCat(false);
                            selectDashboardCategory(created);
                            setAssigningCategory(created);
                          }
                        } else if (e.key === 'Escape') {
                          setIsAddingQuickCat(false);
                          setQuickCatInput('');
                        }
                      }}
                      onBlur={() => {
                        if (!quickCatInput.trim()) setIsAddingQuickCat(false);
                      }}
                      placeholder="Category name..."
                      className={`w-28 bg-transparent text-[10px] font-black uppercase tracking-wider focus:outline-none ${theme === 'dark' ? 'text-white placeholder:text-slate-500' : 'text-slate-800 placeholder:text-slate-400'}`}
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        const created = createCategoryByName(quickCatInput, (msg) =>
                          triggerActionToast({ type: 'error', title: 'Category Exists', subtitle: msg }, 2500)
                        );
                        if (created) {
                          setQuickCatInput('');
                          setIsAddingQuickCat(false);
                          selectDashboardCategory(created);
                          setAssigningCategory(created);
                        }
                      }}
                      title="Create category"
                      className="text-emerald-500 hover:text-emerald-400 text-[10px] font-black uppercase"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddingQuickCat(true)}
                    title="Create new category"
                    className={`shrink-0 h-8 px-2.5 rounded-xl border border-dashed text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${theme === 'dark'
                      ? 'border-slate-800 text-slate-500 hover:text-emerald-400 hover:border-emerald-500/60 hover:bg-emerald-500/5'
                      : 'border-slate-300 text-slate-400 hover:text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50/50'
                      }`}
                  >
                    <PlusIcon />
                    <span>New</span>
                  </button>
                )}
              </div>

              {/* Quick-Assign Toggle for Active Specific Category */}
              {selectedCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => setAssigningCategory(assigningCategory === selectedCategory ? null : selectedCategory)}
                  title={assigningCategory === selectedCategory ? 'Finish assigning habits' : `Assign or remove habits in ${selectedCategory}`}
                  className={`shrink-0 h-8 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 ${assigningCategory === selectedCategory
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-sm'
                    : (theme === 'dark'
                      ? 'bg-slate-900/90 border-slate-700/80 text-emerald-400 hover:border-emerald-500/60 hover:bg-emerald-500/10'
                      : 'bg-white border-slate-200 text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50 shadow-xs')
                    }`}
                >
                  {assigningCategory === selectedCategory ? (
                    <>
                      <CheckIcon className="w-3 h-3" />
                      <span>Done</span>
                    </>
                  ) : (
                    <>
                      <PlusIcon />
                      <span>Assign</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          {/* Updated Habit Cards Grid */}
          <motion.div variants={containerVariants} className="grid gap-3 mb-8" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${textSizes.tabSize || 110}px, 1fr))` }}>

            {/* Habit Rings Tutorial */}
            <div className="col-span-full">
              <TutorialTipCard
                isVisible={!isHydrating && !dismissedTips.rings}
                isSnapping={!!snappingTips.rings}
                onDismiss={() => triggerTipSnap('rings')}
                onSnapDone={() => finishTipSnap('rings')}
                theme={theme}
                accent="blue"
                icon={<HeaderFireIcon className="w-4 h-4 text-orange-500" />}
                eyebrow="Habit Rings Guide"
                title="Streaks, Goal Steps & Priority"
                description="Click any habit circle to view its month calendar, set Goal Steps (e.g. 8 glasses), or set Priority (1x–10x XP). An orange streak fire appears at 2+ consecutive days."
                badges={['Click Circle = Configure', '2+ Days = Streak Fire', 'Edit Pill = Categories']}
                marginBottom="0.5rem"
              />
            </div>

            {/* Category Empty / Multi-Assign Panel */}
            {selectedCategory !== 'all' && ((categoryCounts[selectedCategory] ?? 0) === 0 || assigningCategory === selectedCategory) && (() => {
              const catCount = categoryCounts[selectedCategory] ?? 0;
              return (
                <div className={`col-span-full p-4 md:p-5 rounded-2xl border my-1 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-xs'}`}>
                  <div className="flex items-center justify-between gap-3 flex-wrap mb-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
                          <path d="M7 7h.01" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-xs md:text-sm font-black tracking-wider uppercase ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                            {selectedCategory}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${catCount > 0
                            ? (theme === 'dark' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                            : (theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')
                            }`}>
                            {catCount} {catCount === 1 ? 'habit' : 'habits'}
                          </span>
                        </div>
                        <p className={`text-[11px] font-medium mt-0.5 ${getTextMuted()}`}>
                          Tap habits below to add or remove them from {selectedCategory}, or create a new one.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {assigningCategory === selectedCategory && catCount > 0 ? (
                        <button
                          type="button"
                          onClick={() => setAssigningCategory(null)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-wider transition-all"
                        >
                          Done
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => selectDashboardCategory('all')}
                          className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${theme === 'dark' ? 'border-slate-700 bg-slate-800/70 text-slate-300 hover:text-white hover:border-slate-500' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                          Show All
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Multi-Select Habit Assignment Chips */}
                  {activeHabitsList.length > 0 && (
                    <div className={`mb-3.5 pt-3 border-t ${theme === 'dark' ? 'border-slate-800/80' : 'border-slate-100'}`}>
                      <div className="flex flex-wrap gap-1.5">
                        {activeHabitsList.map(habit => {
                          const currentCat = habitConfigs[habit]?.category;
                          const isInSelected = currentCat === selectedCategory;
                          const hasOtherCat = currentCat && currentCat !== 'all' && !isInSelected;
                          return (
                            <button
                              key={habit}
                              type="button"
                              onClick={() => toggleHabitCategoryMembership(habit, selectedCategory)}
                              title={isInSelected ? `Remove "${habit}" from ${selectedCategory}` : `Add "${habit}" to ${selectedCategory}`}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${isInSelected
                                ? (theme === 'dark'
                                  ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 hover:bg-emerald-500/30'
                                  : 'bg-emerald-50 border-emerald-400 text-emerald-800 hover:bg-emerald-100')
                                : (theme === 'dark'
                                  ? 'bg-slate-800/70 border-slate-700/80 text-slate-300 hover:border-emerald-500/50 hover:text-white'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-400 hover:text-slate-900')
                                }`}
                            >
                              <span className={`font-black ${isInSelected ? 'text-emerald-400' : 'text-emerald-500'}`}>
                                {isInSelected ? '✓' : '+'}
                              </span>
                              <span className="truncate max-w-[160px]">{habit}</span>
                              {hasOtherCat && (
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${theme === 'dark' ? 'bg-slate-900/80 text-slate-400' : 'bg-white text-slate-400 border border-slate-200'}`}>
                                  {currentCat}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Inline Quick-Create Habit in Selected Category */}
                  <div className={`pt-3 border-t ${theme === 'dark' ? 'border-slate-800/80' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`New ${selectedCategory} habit...`}
                        value={inlineHabitInput}
                        onChange={(e) => {
                          setInlineHabitInput(e.target.value);
                          if (inlineHabitError) setInlineHabitError('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && createHabitInCategory(inlineHabitInput, selectedCategory, setInlineHabitError)) {
                            setInlineHabitInput('');
                          }
                        }}
                        className={`flex-1 px-3.5 py-2 rounded-xl text-xs font-bold focus:outline-none border transition-all ${inlineHabitError
                          ? 'border-rose-500/70 focus:border-rose-500'
                          : (theme === 'dark'
                            ? 'bg-slate-800/80 border-slate-700 focus:border-emerald-500 text-white placeholder:text-slate-500'
                            : 'bg-slate-50 border-slate-200 focus:border-emerald-500 text-slate-800 placeholder:text-slate-400')
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (createHabitInCategory(inlineHabitInput, selectedCategory, setInlineHabitError)) {
                            setInlineHabitInput('');
                          }
                        }}
                        disabled={!inlineHabitInput.trim()}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-45 disabled:hover:bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider transition-all shrink-0 inline-flex items-center gap-1.5"
                      >
                        <PlusIcon />
                        <span>Add</span>
                      </button>
                    </div>
                    {inlineHabitError && (
                      <p className="text-[11px] font-bold text-rose-500 mt-2 px-1">
                        {inlineHabitError}
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}

            <AnimatePresence mode='popLayout'>
              {habits.filter(h => !archivedHabits.includes(h) && (selectedCategory === 'all' || habitConfigs[h]?.category === selectedCategory)).map((habit) => {
                const pct = analytics.habitPcts[habit] ?? 0;

                // THE FIX: Prevent background cards from stealing focus when the modal is open!
                const isEditing = editingHabitName === habit && !showManageModal;

                return (
                  <motion.div
                    layout
                    variants={itemVariants}
                    whileHover={{ y: -5, scale: 1.05 }}
                    key={habit}
                    className={`${getCardStyle()} habit-card-container cursor-pointer overflow-hidden group transition-all relative flex flex-col items-center justify-center rounded-full aspect-square border-0 select-none`}
                    onClick={() => setViewingHabitMap(habit)}
                    title={`${habit} · ${pct}% this month${allHabitStreaks[habit] >= 2 ? ` · 🔥 ${allHabitStreaks[habit]} day streak` : ''}`}
                  >
                    <svg
                      className="absolute transition-all duration-500 -rotate-90 inset-0 w-full h-full p-1"
                      viewBox="0 0 100 100"
                    >
                      <circle cx="50" cy="50" r="47" fill="none" stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} strokeWidth="4" />
                      <motion.circle
                        cx="50" cy="50" r="47" fill="none" stroke="#10b981" strokeWidth="4"
                        strokeDasharray={295.3} initial={{ strokeDashoffset: 295.3 }}
                        animate={{ strokeDashoffset: 295.3 - (295.3 * pct / 100) }}
                        transition={{ duration: 1, ease: "easeInOut" }} strokeLinecap="round"
                      />
                    </svg>

                    {/* Non-overlapping top-center hover edit trigger */}
                    {!isEditing && (
                      <button
                        className={`opacity-0 group-hover:opacity-100 absolute top-[10%] left-1/2 -translate-x-1/2 z-20 p-1 rounded-full transition-all ${
                          theme === 'dark'
                            ? 'bg-slate-800/90 text-slate-400 hover:text-emerald-400'
                            : 'bg-white/90 text-slate-400 hover:text-emerald-600 shadow-sm'
                        }`}
                        title="Edit habit name"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingHabitName(habit);
                          setTempHabitName(habit);
                        }}
                      >
                        <EditIcon className="w-3 h-3" />
                      </button>
                    )}

                    {/* Inner safe inscribed area so text never collides with the progress ring */}
                    <div className="z-10 text-center flex flex-col items-center justify-center w-[76%] px-0.5 relative">
                      {isEditing ? (
                        <input
                          autoFocus
                          style={{ fontSize: `clamp(9px, 11cqw, ${textSizes.habit || 14}px)` }}
                          className={`font-black w-full text-center bg-transparent focus:outline-none border-b-2 border-emerald-500 mb-1 leading-[1.1] ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}
                          value={tempHabitName}
                          onChange={(e) => setTempHabitName(e.target.value)}
                          onBlur={() => handleDashboardRename(habit)}
                          onKeyDown={(e) => e.key === 'Enter' && handleDashboardRename(habit)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <AutoFitText
                          text={habit}
                          maxFontSize={textSizes.habit || 14}
                          minFontSize={7}
                          maxLines={2}
                          className="font-black opacity-80"
                          style={{ height: '28cqw' }}
                        />
                      )}

                      <span
                        style={{ fontSize: 'clamp(12px, 18cqw, 26px)' }}
                        className={`font-black leading-none mt-[3cqw] ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}
                      >
                        <AnimatedNumber value={pct} />
                      </span>

                      {allHabitStreaks[habit] >= 2 && (
                        <div className="flex items-center gap-0.5 mt-[3cqw]">
                          <span style={{ width: 'clamp(9px, 10cqw, 13px)', height: 'clamp(9px, 10cqw, 13px)' }} className="inline-flex items-center justify-center text-orange-500 drop-shadow-[0_0_4px_rgba(249,115,22,0.5)] shrink-0">
                            <HeaderFireIcon className="w-full h-full" />
                          </span>
                          <span
                            style={{ fontSize: 'clamp(7px, 8cqw, 11px)' }}
                            className={`font-black leading-none ${theme === 'dark' ? 'text-orange-400' : 'text-orange-500'}`}
                          >
                            {allHabitStreaks[habit]}d
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {(selectedCategory === 'all' || habits.some(h => !archivedHabits.includes(h) && habitConfigs[h]?.category === selectedCategory)) && (
              <motion.button
                layout
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openQuickAddHabitModal(selectedCategory)}
                className={`${getCardStyle()} habit-card-container flex flex-col items-center justify-center gap-1 border-2 border-dashed transition-all rounded-full aspect-square group cursor-pointer ${theme === 'dark'
                  ? 'border-slate-800 text-slate-500 hover:border-emerald-500/70 hover:text-emerald-400 hover:bg-emerald-500/5'
                  : 'border-slate-200 text-slate-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/40'
                  }`}
                title={selectedCategory === 'all' ? 'Create a new habit' : `Create a new habit in ${selectedCategory}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-slate-800/80 group-hover:bg-emerald-500/20' : 'bg-slate-100 group-hover:bg-emerald-100'}`}>
                  <PlusIcon />
                </div>
                <span
                  style={{ fontSize: 'clamp(7px, 9cqw, 10px)' }}
                  className="font-black uppercase tracking-wider leading-none"
                >
                  New
                </span>
              </motion.button>
            )}
          </motion.div>
          {/* Monthly Graph Detailed Modal */}
          <AnimatePresence>
            {showMonthlyGraphModal && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowMonthlyGraphModal(false)}>
                <motion.div initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }} className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border rounded-[1.2rem] md:rounded-[2rem] w-full max-w-4xl p-6 md:p-8 shadow-2xl relative flex flex-col`} onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowMonthlyGraphModal(false)} className={`absolute top-6 right-6 flex flex-col items-center gap-0.5 p-2 ${getTextMuted()} hover:text-rose-500 transition-all`} title="Close (ESC)"><XIcon /><span className="text-[6px] font-mono opacity-50">ESC</span></button>

                  <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 pr-12">
                    <div>
                      <p className={`text-[10px] font-black ${getTextMuted()} uppercase tracking-[0.2em] mb-2`}>Monthly Trends</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} title="Previous month" className={`p-1.5 rounded-lg transition-all ${theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:text-emerald-400' : 'bg-slate-100 text-slate-500 hover:text-emerald-600'}`}>
                          <ChevronLeftIcon />
                        </button>
                        <h3 className={`text-2xl md:text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'} min-w-[160px] md:min-w-[200px] text-center`}>
                          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} title="Next month" className={`p-1.5 rounded-lg transition-all ${theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:text-emerald-400' : 'bg-slate-100 text-slate-500 hover:text-emerald-600'}`}>
                          <ChevronRightIcon />
                        </button>
                        <FilterDropdown
                          value={effectiveDashboardFilter}
                          onChange={setDashboardGraphFilter}
                          theme={theme}
                          preserveCase
                          maxWidthClass="max-w-[125px] md:max-w-[160px]"
                          options={[
                            { value: 'all', label: 'Overall' },
                            ...habits.filter(h => !archivedHabits.includes(h)).map(h => ({ value: h, label: h })),
                          ]}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Monthly Trend Onboarding Guide */}
                  <TutorialTipCard
                    isVisible={!dismissedTips.monthly}
                    isSnapping={!!snappingTips.monthly}
                    onDismiss={() => triggerTipSnap('monthly')}
                    onSnapDone={() => finishTipSnap('monthly')}
                    theme={theme}
                    accent="emerald"
                    icon={<ActivityIcon className="w-4 h-4" />}
                    eyebrow="Trends Guide"
                    title="Monthly Consistency Curve"
                    description="Hover any point along the curve to inspect that day’s exact score, or use the dropdown on the dashboard card to isolate a single habit."
                    badges={['Hover = Daily %', 'Filter by Habit']}
                    marginBottom="1rem"
                  />

                  <div className={`w-full h-[60vh] rounded-3xl border p-4 md:p-6 ${theme === 'dark' ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyGraphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                        <XAxis
                          dataKey="date"
                          stroke={theme === 'dark' ? '#64748b' : '#94a3b8'}
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          tickMargin={10}
                        />
                        <YAxis
                          stroke={theme === 'dark' ? '#64748b' : '#94a3b8'}
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          domain={[0, 100]}
                          tickFormatter={(val) => `${val}%`}
                        />
                        <RechartsTooltip
                          cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '4 4' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className={`px-3 py-2 rounded-xl border shadow-xl flex flex-col gap-1 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                  <span className={`text-[10px] font-black uppercase ${getTextMuted()}`}>{payload[0].payload.fullDate}</span>
                                  <span className="text-sm font-black text-emerald-500">{payload[0].value}% Score</span>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="score"
                          stroke="#10b981"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorScore)"
                          activeDot={{ r: 6, fill: '#10b981', stroke: theme === 'dark' ? '#0f172a' : '#ffffff', strokeWidth: 3 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Weekly Summary Popup Modal */}
          <AnimatePresence>
            {showWeeklyModal && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={() => setShowWeeklyModal(false)}>
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border rounded-[2.5rem] w-full max-w-2xl p-8 shadow-2xl relative`} onClick={e => e.stopPropagation()}>

                  <button onClick={() => setShowWeeklyModal(false)} className={`absolute top-6 right-6 flex flex-col items-center gap-0.5 p-2 ${getTextMuted()} hover:text-rose-500 transition-all`} title="Close (ESC)"><XIcon /><span className="text-[6px] font-mono opacity-50">ESC</span></button>

                  <div className="mb-8">
                    <p className={`text-[10px] font-black ${getTextMuted()} uppercase tracking-[0.2em] mb-1`}>Performance Overview</p>
                    <h3 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Weekly Summary</h3>
                  </div>

                  {/* Weekly Summary Onboarding Guide */}
                  <TutorialTipCard
                    isVisible={!dismissedTips.weekly}
                    isSnapping={!!snappingTips.weekly}
                    onDismiss={() => triggerTipSnap('weekly')}
                    onSnapDone={() => finishTipSnap('weekly')}
                    theme={theme}
                    accent="emerald"
                    icon={<ActivityIcon className="w-4 h-4" />}
                    eyebrow="Weekly Guide"
                    title="7-Day Rolling Performance"
                    description="Compare all active habits over the past 7 days, or switch the filter dropdown to track one habit’s daily bar scores across the week."
                    badges={['7-Day Avg', 'Per-Habit Bar Filter']}
                    marginBottom="1.25rem"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-emerald-900/20 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'} flex flex-col items-center justify-center`}>
                      <span className="text-4xl font-black text-emerald-500">{weeklySummary.avgScore}%</span>
                      <span className={`text-[9px] font-black uppercase mt-2 ${getTextMuted()}`}>7-Day Average</span>
                    </div>

                    {/* --- NEW VISUALISATION SECTION --- */}
                    <div className="col-span-1 md:col-span-2">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <ActivityIcon className="w-4 h-4 text-emerald-500" />
                          <p className={`text-[10px] font-black ${getTextMuted()} ${effectiveWeeklyFilter === 'all' ? 'uppercase' : ''} tracking-widest`}>
                            {effectiveWeeklyFilter === 'all' ? 'Performance Graph' : `${effectiveWeeklyFilter} Trend`}
                          </p>
                        </div>
                        <FilterDropdown
                          value={effectiveWeeklyFilter}
                          onChange={setWeeklyGraphFilter}
                          theme={theme}
                          preserveCase
                          align="right"
                          maxWidthClass="max-w-[110px] md:max-w-[140px]"
                          options={[
                            { value: 'all', label: 'Overall' },
                            ...habits.filter(h => !archivedHabits.includes(h)).map(h => ({ value: h, label: h })),
                          ]}
                        />
                      </div>

                      <div className={`w-full h-48 rounded-2xl border p-4 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={weeklyGraphData}>
                            <XAxis
                              dataKey="name"
                              stroke={theme === 'dark' ? '#64748b' : '#94a3b8'}
                              fontSize={8}
                              tickLine={false}
                              axisLine={false}
                              interval={0}
                              tickFormatter={(val) => val.slice(0, 3).toUpperCase()}
                            />
                            <RechartsTooltip
                              cursor={{ fill: theme === 'dark' ? '#334155' : '#e2e8f0', opacity: 0.4 }}
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className={`px-2 py-1 rounded-lg border text-xs font-black uppercase ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                                      {payload[0].payload.name}: <span className="text-emerald-500">{payload[0].value}%</span>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar dataKey="score" radius={[4, 4, 4, 4]}>
                              {weeklyGraphData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.score >= 80 ? '#10b981' : entry.score >= 50 ? '#3b82f6' : '#64748b'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    {/* --- END NEW VISUALISATION SECTION --- */}
                    {/* --- END NEW VISUALISATION SECTION --- */}
                    <div className="col-span-1 md:col-span-3 space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <TrophyIcon className="text-yellow-500" />
                        <p className={`text-[10px] font-black ${getTextMuted()} uppercase tracking-widest`}>Top Achievements</p>
                      </div>
                      {weeklySummary.topHabits.map((h, i) => (
                        <div key={i} className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'} flex items-center justify-between`}>
                          <span className={`text-[10px] font-black uppercase ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{h.name}</span>
                          <span className="text-sm font-black text-emerald-500">{h.score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- JOURNAL HISTORY MODAL --- */}
          {/* --- 51-ENTRY CENTERED JOURNAL HISTORY MODAL --- */}
          <AnimatePresence>
            {showAllNotes && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[180] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={() => setShowAllNotes(false)}>
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border rounded-[2.5rem] w-full max-w-xl p-6 md:p-8 shadow-2xl relative flex flex-col max-h-[88vh]`} onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowAllNotes(false)} className={`absolute top-6 right-6 flex flex-col items-center gap-0.5 p-2 ${getTextMuted()} hover:text-rose-500 transition-all`} title="Close (ESC)"><XIcon /><span className="text-[6px] font-mono opacity-50">ESC</span></button>

                  <div className="mb-4 shrink-0">
                    <p className={`text-[10px] font-black ${getTextMuted()} uppercase tracking-[0.2em] mb-1`}>Reflection Log</p>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-2xl md:text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Journal History</h3>
                      <span className={`text-[10px] font-bold ${getTextMuted()} mr-8`}>
                        {centeredJournalEntries.filter(e => e.hasNote).length} reflections
                      </span>
                    </div>
                    <p className={`text-xs font-medium mt-1 ${getTextMuted()}`}>
                      Centered view: Up to 51 closest reflections with Today anchored in the middle
                    </p>

                    {/* Search bar */}
                    <div className="relative mt-3">
                      <input
                        type="text"
                        value={journalSearchQuery}
                        onChange={(e) => setJournalSearchQuery(e.target.value)}
                        placeholder="Search journal entries or dates..."
                        className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none border-2 transition-all ${theme === 'dark'
                          ? 'bg-slate-800/80 border-slate-700/80 focus:border-emerald-500 text-white placeholder:text-slate-500'
                          : 'bg-slate-50 border-slate-200 focus:border-emerald-500 text-slate-800 placeholder:text-slate-400'
                          }`}
                      />
                      {journalSearchQuery && (
                        <button
                          onClick={() => setJournalSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                          title="Clear search"
                        >
                          <XIcon />
                        </button>
                      )}
                    </div>
                  </div>

                  <TutorialTipCard
                    isVisible={!dismissedTips.journal}
                    isSnapping={!!snappingTips.journal}
                    onDismiss={() => triggerTipSnap('journal')}
                    onSnapDone={() => finishTipSnap('journal')}
                    theme={theme}
                    accent="blue"
                    icon={<NoteIcon className="w-4 h-4" />}
                    eyebrow="Journal Guide"
                    title="Search & Inline Edit"
                    description="Browse up to 51 closest entries centered on Today, search by date or text, and click any entry to write or edit inline."
                    marginBottom="0.75rem"
                  />

                  {/* Scrollable list container with py-[18vh] so Today can center even if there are 0 earlier or 0 later notes */}
                  <div
                    ref={journalListContainerRef}
                    className="overflow-y-auto custom-scrollbar pr-2 space-y-4 py-[18vh] flex-1 min-h-0"
                  >
                    {filteredJournalEntries.length === 0 ? (
                      <div className={`text-center py-10 px-6 rounded-3xl border ${theme === 'dark' ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'} flex flex-col items-center max-w-md mx-auto my-4`}>
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center text-xl mb-3">
                          🔍
                        </div>
                        <h4 className={`text-base font-black mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                          No journals matched &ldquo;{journalSearchQuery}&rdquo;
                        </h4>
                        {journalTypoSuggestion ? (
                          <p className="text-xs font-medium text-slate-400 mt-1 mb-4">
                            Did you mean:{" "}
                            <button
                              type="button"
                              onClick={() => setJournalSearchQuery(journalTypoSuggestion)}
                              className="text-emerald-400 underline font-bold hover:text-emerald-300"
                            >
                              {journalTypoSuggestion}
                            </button>
                            ?
                          </p>
                        ) : (
                          <p className={`text-xs font-medium mb-4 ${getTextMuted()}`}>
                            Try searching by date, habit keyword, or partial note text.
                          </p>
                        )}
                        <button
                          onClick={() => setJournalSearchQuery('')}
                          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-black uppercase tracking-wider transition-all border border-slate-700"
                        >
                          Clear Search
                        </button>
                      </div>
                    ) : (
                      filteredJournalEntries.map((entry) => {
                        const isEditingThisCard = inlineEditingJournalKey === entry.dateKey;
                        return (
                          <div
                            key={entry.dateKey}
                            ref={entry.isToday ? todayJournalCardRef : null}
                            className={`relative p-5 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                              } ${entry.isToday ? 'ring-2 ring-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.12)]' : ''}`}
                          >
                            {/* Top row: date badge + edit icon (exact same layout for Today and all other days) */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-black uppercase tracking-wider ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20`}>
                                  {parseLocalDate(entry.dateKey).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                {entry.isToday && (
                                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm">
                                    Today
                                  </span>
                                )}
                                {entry.noteTime && (
                                  <span className={`text-[9px] font-bold ${getTextMuted()}`}>{entry.noteTime}</span>
                                )}
                              </div>

                              {/* Top-right Edit button */}
                              {!isEditingThisCard && (
                                <button
                                  onClick={() => {
                                    setInlineEditingJournalKey(entry.dateKey);
                                    setInlineJournalDraft(entry.note || '');
                                  }}
                                  title={entry.hasNote ? "Edit entry" : "Write journal"}
                                  className={`p-1.5 rounded-lg transition-all ${theme === 'dark' ? 'text-slate-500 hover:text-emerald-400 hover:bg-slate-700' : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-200'}`}
                                >
                                  <EditIcon />
                                </button>
                              )}
                            </div>

                            {/* Card Body */}
                            {isEditingThisCard ? (
                              <div className="space-y-3">
                                <textarea
                                  value={inlineJournalDraft}
                                  onChange={(e) => setInlineJournalDraft(e.target.value)}
                                  placeholder={entry.isToday ? "Write today's reflection journal..." : "Write reflection journal..."}
                                  rows={3}
                                  className={`w-full p-3 rounded-xl border text-sm font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none ${theme === 'dark'
                                    ? 'bg-slate-900/70 border-slate-700 text-slate-200 placeholder-slate-500'
                                    : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400'
                                    }`}
                                />
                                <div className="flex items-center justify-end gap-2">
                                  {entry.hasNote && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setInlineEditingJournalKey(null);
                                        setInlineJournalDraft('');
                                      }}
                                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${theme === 'dark' ? 'border-slate-700 text-slate-400 hover:bg-slate-700' : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                                        }`}
                                    >
                                      Cancel
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      saveNote(entry.dateKey, inlineJournalDraft);
                                      setInlineEditingJournalKey(null);
                                      triggerActionToast({
                                        type: 'success',
                                        title: '📝 Journal Reflection Saved!',
                                        subtitle: `Saved entry for ${parseLocalDate(entry.dateKey).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}.`,
                                      }, 3500);
                                    }}
                                    disabled={!inlineJournalDraft.trim()}
                                    className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                                  >
                                    <CheckIcon />
                                    <span>Save Journal</span>
                                  </button>
                                </div>
                              </div>
                            ) : entry.hasNote ? (
                              <>
                                <p className={`text-sm font-medium whitespace-pre-wrap leading-relaxed mb-4 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                  {entry.note}
                                </p>
                                <div className="flex justify-end">
                                  {confirmDeleteNoteDate === entry.dateKey ? (
                                    <div className="flex items-center gap-1.5">
                                      <span className={`text-[9px] font-black uppercase ${theme === 'dark' ? 'text-rose-400' : 'text-rose-500'}`}>Sure?</span>
                                      <button
                                        onClick={() => setConfirmDeleteNoteDate(null)}
                                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border transition-all ${theme === 'dark' ? 'border-slate-600 text-slate-400 hover:bg-slate-700' : 'border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => {
                                          deleteNote(entry.dateKey);
                                          setConfirmDeleteNoteDate(null);
                                          if (entry.isToday) {
                                            setInlineEditingJournalKey(entry.dateKey);
                                            setInlineJournalDraft('');
                                          }
                                        }}
                                        className="text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setConfirmDeleteNoteDate(entry.dateKey)}
                                      title="Delete entry"
                                      className={`p-1.5 rounded-lg transition-all ${theme === 'dark' ? 'text-slate-600 hover:text-rose-400 hover:bg-slate-700' : 'text-slate-300 hover:text-rose-500 hover:bg-rose-50'}`}
                                    >
                                      <TrashIcon />
                                    </button>
                                  )}
                                </div>
                              </>
                            ) : (
                              <div className="flex items-center justify-between pt-1">
                                <span className={`text-xs italic ${getTextMuted()}`}>No journal written for today yet.</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setInlineEditingJournalKey(entry.dateKey);
                                    setInlineJournalDraft('');
                                  }}
                                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20"
                                >
                                  Write Journal
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- STREAK SHIELDS MODAL --- */}
          <AnimatePresence>
            {showShieldModal && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[180] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={() => setShowShieldModal(false)}>
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl relative flex flex-col max-h-[85vh]`} onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowShieldModal(false)} className={`absolute top-6 right-6 flex flex-col items-center gap-0.5 p-2 ${getTextMuted()} hover:text-rose-500 transition-all`} title="Close (ESC)"><XIcon /><span className="text-[6px] font-mono opacity-50">ESC</span></button>

                  <div className="mb-5 shrink-0 flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${theme === 'dark' ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' : 'bg-cyan-50 border-cyan-200 text-cyan-600'}`}>
                      <ShieldIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>Streak Protection</p>
                      <h3 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Streak Shields</h3>
                    </div>
                  </div>

                  <div className="overflow-y-auto custom-scrollbar pr-2 space-y-4">
                    <TutorialTipCard
                      isVisible={!dismissedTips.shields}
                      isSnapping={!!snappingTips.shields}
                      onDismiss={() => triggerTipSnap('shields')}
                      onSnapDone={() => finishTipSnap('shields')}
                      theme={theme}
                      accent="cyan"
                      icon={<ShieldIcon className="w-4 h-4" />}
                      eyebrow="Shields Guide"
                      title="Protect Your Streaks"
                      description="Earn 1 Starter Shield plus +1 per Level and +1 every 7 Perfect Days. Click any heatmap square to shield a missed day."
                      marginBottom="0.25rem"
                    />
                    {/* Summary Counts */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className={`p-3 rounded-2xl border text-center ${theme === 'dark' ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'}`}>
                        <div className={`text-2xl font-black ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>{shieldStats.availableCount}</div>
                        <div className={`text-[9px] font-black uppercase tracking-widest ${getTextMuted()}`}>Available</div>
                      </div>
                      <div className={`p-3 rounded-2xl border text-center ${theme === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <div className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{shieldStats.totalEarned}</div>
                        <div className={`text-[9px] font-black uppercase tracking-widest ${getTextMuted()}`}>Total Earned</div>
                      </div>
                      <div className={`p-3 rounded-2xl border text-center ${theme === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <div className={`text-2xl font-black ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{shieldStats.usedCount}</div>
                        <div className={`text-[9px] font-black uppercase tracking-widest ${getTextMuted()}`}>Used</div>
                      </div>
                    </div>

                    {/* How Shields Are Earned */}
                    <div className={`p-4 rounded-2xl border space-y-2 ${theme === 'dark' ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div className={`text-[10px] font-black uppercase tracking-widest ${getTextMuted()}`}>How You Earn Shields</div>
                      <div className="space-y-1.5 text-xs font-semibold">
                        <div className="flex items-center justify-between">
                          <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>🌱 Starter Shield (initial)</span>
                          <span className="font-black text-cyan-400">{shieldStats.hasStarterFallback ? '1' : '0'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>⚡ +1 per Level gained (Lv.{xpStats.level})</span>
                          <span className="font-black text-emerald-400">+{shieldStats.levelShields}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>🔥 +1 every 7 Perfect Days ({insightsData?.perfectDaysCount || 0} total)</span>
                          <span className="font-black text-amber-400">+{shieldStats.perfectDayShields}</span>
                        </div>
                      </div>
                      <p className={`text-[11px] pt-1 ${getTextMuted()}`}>
                        Shields protect your running habit streaks on missed days. Click any day in the Activity Heatmap to apply or remove a shield.
                      </p>
                    </div>

                    {/* Earned History by Day */}
                    <div className="space-y-2">
                      <div className={`text-[10px] font-black uppercase tracking-widest ${getTextMuted()}`}>Shields Earned by Day</div>
                      {shieldStats.earnHistory.length === 0 ? (
                        <div className={`p-4 rounded-2xl border text-xs font-semibold ${theme === 'dark' ? 'bg-slate-800/30 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                          You have <span className="font-black text-cyan-400">1 Starter Shield</span> ready to use. Level up or reach 7 perfect days to earn more!
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {shieldStats.earnHistory.map((entry) => (
                            <div key={entry.dateKey} className={`p-3 rounded-2xl border flex items-start justify-between gap-3 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                              <div className="min-w-0">
                                <div className={`text-xs font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                                  {parseLocalDate(entry.dateKey).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                                <div className="mt-1 space-y-0.5">
                                  {entry.reasons.map((r, idx) => (
                                    <div key={idx} className={`text-[11px] font-medium ${getTextMuted()}`}>
                                      {r.type === 'level' ? '⚡' : '🔥'} {r.reason} <span className="font-bold text-cyan-400">(+{r.count})</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <span className={`shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-black border ${theme === 'dark' ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' : 'bg-cyan-50 border-cyan-200 text-cyan-600'}`}>
                                +{entry.count} 🛡️
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Used Shields */}
                    {shieldedDates.length > 0 && (
                      <div className="space-y-2">
                        <div className={`text-[10px] font-black uppercase tracking-widest ${getTextMuted()}`}>Shielded Days ({shieldedDates.length})</div>
                        <div className="flex flex-wrap gap-1.5">
                          {[...shieldedDates].sort((a, b) => b.localeCompare(a)).map((d) => (
                            <span key={d} className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${theme === 'dark' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' : 'bg-cyan-50 border-cyan-200 text-cyan-700'}`}>
                              🛡️ {parseLocalDate(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- INSIGHTS MODAL --- */}
          <AnimatePresence>
            {showInsightsModal && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[180] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={() => setShowInsightsModal(false)}>
                <motion.div initial={{ scale: 0.94, y: 18 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 18 }} transition={{ duration: 0.18, ease: 'easeOut' }} className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-[2rem] w-full max-w-2xl p-6 md:p-7 shadow-2xl relative flex flex-col max-h-[88vh]`} onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowInsightsModal(false)} className={`absolute top-5 right-5 flex flex-col items-center gap-0.5 p-2 ${getTextMuted()} hover:text-rose-500 transition-all`} title="Close (ESC)"><XIcon /><span className="text-[6px] font-mono opacity-50">ESC</span></button>

                  <div className="mb-5 shrink-0 pr-10">
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-1">Performance Intelligence</p>
                    <h3 className={`text-2xl md:text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Insights</h3>
                  </div>

                  <div className="overflow-y-auto custom-scrollbar pr-1.5 space-y-4">
                    <TutorialTipCard
                      isVisible={!dismissedTips.insights}
                      isSnapping={!!snappingTips.insights}
                      onDismiss={() => triggerTipSnap('insights')}
                      onSnapDone={() => finishTipSnap('insights')}
                      theme={theme}
                      accent="purple"
                      icon={<TrophyIcon className="w-4 h-4" />}
                      eyebrow="Insights Guide"
                      title="Spot Patterns & Focus Habits"
                      description="See your 30-day consistency trend, weekday highs and dips, strongest vs lagging habits, and streak leaderboard. Click any habit row to inspect or adjust it."
                      marginBottom="0.25rem"
                    />

                    {/* 1. 4-Card KPI Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {/* 30d Consistency */}
                      <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${theme === 'dark' ? 'bg-slate-800/45 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <span className={`text-[9px] font-black uppercase tracking-wider ${getTextMuted()}`}>30d Consistency</span>
                        <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
                          <span className={`text-2xl font-black tabular-nums ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                            {insightsData.consistency30d}%
                          </span>
                          {insightsData.consistencyDelta !== null ? (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${insightsData.consistencyDelta >= 0
                              ? (theme === 'dark' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-700')
                              : (theme === 'dark' ? 'bg-rose-500/15 text-rose-400' : 'bg-rose-100 text-rose-700')
                              }`}>
                              {insightsData.consistencyDelta >= 0 ? `+${insightsData.consistencyDelta}%` : `${insightsData.consistencyDelta}%`}
                            </span>
                          ) : (
                            <span className={`text-[9px] font-bold ${getTextMuted()}`}>30d avg</span>
                          )}
                        </div>
                      </div>

                      {/* Perfect Days */}
                      <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${theme === 'dark' ? 'bg-slate-800/45 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <span className={`text-[9px] font-black uppercase tracking-wider ${getTextMuted()}`}>Perfect Days</span>
                        <div className="mt-1.5">
                          <span className={`text-2xl font-black tabular-nums ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            {insightsData.perfectDaysCount}
                          </span>
                          <p className={`text-[9px] font-bold mt-0.5 ${getTextMuted()}`}>
                            Shield in {7 - (insightsData.perfectDaysCount % 7)} perfect {7 - (insightsData.perfectDaysCount % 7) === 1 ? 'day' : 'days'}
                          </p>
                        </div>
                      </div>

                      {/* Active Perfect Streak */}
                      <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${theme === 'dark' ? 'bg-slate-800/45 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <span className={`text-[9px] font-black uppercase tracking-wider ${getTextMuted()}`}>All-Done Streak</span>
                        <div className="mt-1.5 flex items-baseline gap-1">
                          <span className={`text-2xl font-black tabular-nums ${insightsData.activePerfectStreak > 0 ? 'text-orange-400' : (theme === 'dark' ? 'text-slate-300' : 'text-slate-700')}`}>
                            {insightsData.activePerfectStreak}d
                          </span>
                          <span className={`text-[9px] font-bold ${getTextMuted()}`}>100% run</span>
                        </div>
                      </div>

                      {/* Total Wins */}
                      <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${theme === 'dark' ? 'bg-slate-800/45 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <span className={`text-[9px] font-black uppercase tracking-wider ${getTextMuted()}`}>Total Wins</span>
                        <div className="mt-1.5">
                          <span className={`text-2xl font-black tabular-nums ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                            {insightsData.totalWins}
                          </span>
                          <p className={`text-[9px] font-bold mt-0.5 ${getTextMuted()}`}>
                            Across {insightsData.trackedDaysCount} active {insightsData.trackedDaysCount === 1 ? 'day' : 'days'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 2. Weekday Performance Pattern (All 7 Days) */}
                    <div className={`p-4 md:p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/45 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${getTextMuted()}`}>
                          Weekday Pattern
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${theme === 'dark' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                            Peak: {insightsData.bestDay} ({insightsData.bestDayScore}%)
                          </span>
                          {insightsData.weakDay && insightsData.weakDay !== insightsData.bestDay && (
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${theme === 'dark' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                              Dip: {insightsData.weakDay} ({insightsData.weakDayScore}%)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-2 items-end h-28 pt-4">
                        {insightsData.weekdayBreakdown.map((d) => (
                          <div key={d.label} className="flex flex-col items-center gap-1.5 h-full justify-end" title={`${d.fullLabel}: ${d.pct}% average`}>
                            <span className={`text-[9px] font-black tabular-nums ${d.isBest
                              ? 'text-emerald-400'
                              : d.isWeak
                                ? 'text-amber-400'
                                : (d.pct > 0 ? (theme === 'dark' ? 'text-slate-300' : 'text-slate-700') : (theme === 'dark' ? 'text-slate-600' : 'text-slate-400'))
                              }`}>
                              {d.pct}%
                            </span>
                            <div className={`w-full flex-1 rounded-xl border overflow-hidden flex items-end p-0.5 ${theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.max(d.pct > 0 ? 8 : 0, d.pct)}%` }}
                                transition={{ duration: 0.65, ease: 'easeOut' }}
                                className={`w-full rounded-lg ${d.isBest
                                  ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                                  : d.isWeak
                                    ? 'bg-amber-500/80'
                                    : (theme === 'dark' ? 'bg-purple-500/65' : 'bg-purple-500/75')
                                  }`}
                              />
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-wider ${d.isBest
                              ? 'text-emerald-400'
                              : d.isWeak
                                ? 'text-amber-400'
                                : getTextMuted()
                              }`}>
                              {d.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3. Strongest vs Needs Focus (Last 30 Days) */}
                    {(insightsData.topHabit30 || insightsData.focusHabit30) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {insightsData.topHabit30 && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowInsightsModal(false);
                              setViewingHabitMap(insightsData.topHabit30.habit);
                            }}
                            className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/25 hover:border-emerald-400/60' : 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-400'}`}
                          >
                            <div className="min-w-0">
                              <span className={`text-[9px] font-black uppercase tracking-wider block ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                Strongest (30d)
                              </span>
                              <span className={`text-sm font-black truncate block mt-0.5 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                                {insightsData.topHabit30.habit}
                              </span>
                            </div>
                            <span className={`px-2.5 py-1 rounded-xl text-xs font-black tabular-nums shrink-0 ${theme === 'dark' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white text-emerald-700 border border-emerald-200'}`}>
                              {insightsData.topHabit30.pct}%
                            </span>
                          </button>
                        )}

                        {insightsData.focusHabit30 && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowInsightsModal(false);
                              setViewingHabitMap(insightsData.focusHabit30.habit);
                            }}
                            className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${theme === 'dark' ? 'bg-amber-500/10 border-amber-500/25 hover:border-amber-400/60' : 'bg-amber-50/70 border-amber-200 hover:border-amber-400'}`}
                          >
                            <div className="min-w-0">
                              <span className={`text-[9px] font-black uppercase tracking-wider block ${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'}`}>
                                Needs Focus (30d)
                              </span>
                              <span className={`text-sm font-black truncate block mt-0.5 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                                {insightsData.focusHabit30.habit}
                              </span>
                            </div>
                            <span className={`px-2.5 py-1 rounded-xl text-xs font-black tabular-nums shrink-0 ${theme === 'dark' ? 'bg-amber-500/20 text-amber-300' : 'bg-white text-amber-700 border border-amber-200'}`}>
                              {insightsData.focusHabit30.pct}%
                            </span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* 4. Top Habit Streaks Leaderboard (Interactive) */}
                    <div className={`p-4 md:p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/45 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center justify-between mb-3.5">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${getTextMuted()}`}>
                          Top Habit Streaks
                        </span>
                        <span className={`text-[10px] font-bold ${getTextMuted()}`}>
                          Tap habit to inspect
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {insightsData.topStreaks.length > 0 ? (
                          insightsData.topStreaks.map((streakData, i) => {
                            const maxOverall = Math.max(1, insightsData.topStreaks[0]?.max || 1);
                            const barPct = Math.round((streakData.max / maxOverall) * 100);
                            return (
                              <button
                                key={streakData.habit}
                                type="button"
                                onClick={() => {
                                  setShowInsightsModal(false);
                                  setViewingHabitMap(streakData.habit);
                                }}
                                className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className={`text-[10px] font-black w-5 shrink-0 ${i === 0 ? 'text-amber-400' : getTextMuted()}`}>
                                      #{i + 1}
                                    </span>
                                    <span className={`text-sm font-bold truncate ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                                      {streakData.habit}
                                    </span>
                                  </div>
                                  <div className={`mt-1.5 ml-7 h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-500"
                                      style={{ width: `${barPct}%` }}
                                    />
                                  </div>
                                </div>

                                <div className="flex gap-1.5 shrink-0">
                                  {streakData.current > 0 && (
                                    <div className={`flex flex-col items-center px-2 py-1 rounded-lg ${theme === 'dark' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`} title="Active streak">
                                      <span className={`text-[7px] font-black uppercase opacity-75 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>Current</span>
                                      <span className={`text-[11px] font-black inline-flex items-center gap-1 tabular-nums ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                        <HeaderFireIcon className="w-3 h-3 text-orange-500 shrink-0" /> {streakData.current}d
                                      </span>
                                    </div>
                                  )}
                                  <div className={`flex flex-col items-center px-2 py-1 rounded-lg ${theme === 'dark' ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`} title="Best all-time streak">
                                    <span className={`text-[7px] font-black uppercase opacity-75 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>Best</span>
                                    <span className={`text-[11px] font-black tabular-nums ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>
                                      🏆 {streakData.max}d
                                    </span>
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <span className={`text-xs font-bold block py-2 ${getTextMuted()}`}>No streaks yet. Complete habits daily to build momentum!</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Tracking Table Onboarding Tutorial — Thanos snaps on Dismiss */}
          <TutorialTipCard
            isVisible={!isHydrating && !dismissedTips.table}
            isSnapping={!!snappingTips.table}
            onDismiss={() => triggerTipSnap('table')}
            onSnapDone={() => finishTipSnap('table')}
            theme={theme}
            accent="emerald"
            icon={<AppLogo className="w-6 h-6" />}
            eyebrow="Quick Start · Tracking Table"
            title="How to Log & Navigate"
            description="Tap any cell to mark 100% done, or press and hold (450ms) to slide partial progress or Goal Steps. Click the blue bubble next to any date to write a reflection, and grab/drag or hold Shift + Scroll to pan smoothly."
            badges={['Tap = 100% ✔', 'Hold 450ms = Slider / Steps', 'Blue Bubble = Note', 'Shift + Scroll = Pan']}
            marginBottom="1.25rem"
          />
          {/* Table Log */}
          <motion.div variants={itemVariants} className={`${getCardStyle()} ${isMobileMode ? 'rounded-2xl' : 'rounded-[2.5rem]'} overflow-hidden mb-8 relative transition-colors`}>

            <div
              ref={scrollContainerRef}
              className={`overflow-x-auto overflow-y-auto custom-scrollbar ${isMobileMode ? 'whitespace-nowrap' : ''}`}
              style={{
                maxHeight: tableOrientation === 'vertical' ? `${tableHeight}px` : 'none',
                willChange: tableOrientation === 'vertical' ? 'max-height' : 'auto'
              }}
            >
              <table
                className={`border-separate border-spacing-0 ${isMobileMode
                  ? (tableOrientation === 'vertical' ? 'min-w-[850px] table-fixed' : 'min-w-[1200px] table-auto')
                  : 'w-full min-w-full ' + (tableOrientation === 'vertical' ? 'table-fixed' : 'table-auto')
                  }`}
              >
                {tableOrientation === 'vertical' ? (
                  /* --- Table 1: Vertical Layout --- */
                  <>
                    <thead className={`sticky top-0 z-30 shadow-sm ${getTableHeadStyle()} border-b transition-colors`}>
                      <tr className="h-[72px]">
                        <th className={`p-5 font-black ${getTextMuted()} text-[9px] uppercase tracking-widest sticky top-0 left-0 border-r border-b ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} w-[120px] min-w-[120px] z-40 text-center`}>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={toggleTableOrientation}
                              className={`p-1.5 rounded-lg border transition-all active:scale-90 shadow-sm
                                    ${theme === 'dark'
                                  ? 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600'
                                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                              title="Switch to Horizontal View"
                            >
                              <TableRotateIcon />
                            </button>
                            <span>DATE Log</span>
                          </div>
                        </th>

                        {/* FILTERED HABITS HEADER */}
                        {habits.filter(h => !archivedHabits.includes(h)).map((h) => <th key={h} className={`p-2 border-r border-b text-center font-black transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`} style={{ fontSize: `${textSizes.table1}px`, minWidth: isMobileMode ? '90px' : 'auto' }}><div className="px-1 leading-tight break-words" title={h}>{h}</div></th>)}
                        <th className={`p-4 font-black text-emerald-600 text-[14px] sticky top-0 right-0 border-l border-b ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} w-[100px] z-40 text-center`}>Efficiency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {daysInMonth.map((day) => {
                        const key = getSafeKey(day); const dayData = trackerData[key] || {};
                        let totalEarnedWeight = 0; let totalPossibleWeight = 0;

                        // EFFICIENCY CALCULATION (Ignoring Archived)
                        const activeHabits = habits.filter(h => !archivedHabits.includes(h));
                        const isShieldedDay = shieldedDates.includes(key);
                        activeHabits.forEach(h => {
                          const val = typeof dayData[h] === 'number' ? dayData[h] : (dayData[h] ? 100 : 0);
                          totalEarnedWeight += (val / 100);
                          if (!isShieldedDay || val >= 100) {
                            totalPossibleWeight += 1;
                          }
                        });
                        const progress = totalPossibleWeight > 0 ? Math.round((totalEarnedWeight / totalPossibleWeight) * 100) : (isShieldedDay ? 100 : 0);
                        const isToday = new Date().toDateString() === day.toDateString();
                        const rowBgStyle = isToday
                          ? (theme === 'dark' ? 'bg-emerald-900/40 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-emerald-50 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]')
                          : (theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100');

                        return (
                          <tr key={key} id={`row-${key}`} className="h-[72px]">
                            <td className={`p-2 sticky left-0 z-10 border-r border-b transition-all duration-500 ${rowBgStyle} ${isToday ? 'border-l-4 border-l-emerald-500' : ''} ${theme === 'dark' ? 'border-r-slate-700' : 'border-r-slate-200'}`}>
                              <div className="flex items-center justify-center gap-3">
                                <div className="tooltip-trigger">
                                  <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }} onClick={() => setEditingNoteDate(key)} title={dayData.note ? "View/Edit Reflection" : "Add Reflection"} className={`p-2 rounded-xl border transition-all ${dayData.note ? 'bg-blue-600 text-white border-blue-400/40 shadow-md shadow-blue-500/25' : (theme === 'dark' ? 'bg-blue-500/10 text-blue-400/80 border-blue-500/25 hover:bg-blue-500/20 hover:text-blue-300 hover:border-blue-400/50' : 'bg-blue-50/80 text-blue-500 border-blue-200/80 hover:bg-blue-100 hover:text-blue-600 hover:border-blue-300')}`}><NoteIcon /></motion.button>
                                  <span className="tooltip-content" style={{ whiteSpace: 'nowrap', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {dayData.note ? `“${dayData.note.split('\n')[0].substring(0, 45)}${dayData.note.split('\n')[0].length > 45 ? '…' : ''}”` : 'Add reflection'}
                                  </span>
                                </div>
                                <div className="flex flex-col text-center"><span className={`text-[8px] uppercase opacity-80 leading-none ${theme === 'dark' ? 'text-slate-500' : ''}`}>{day.toLocaleDateString(undefined, { weekday: 'short' })}</span><div className="flex items-center justify-center gap-1"><span className={`text-sm font-black mt-0.5 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{day.getDate()}</span>{shieldedDates.includes(key) && <span title="Streak Shield Active" className="text-cyan-400 text-xs">🛡️</span>}</div></div>
                              </div>
                            </td>

                            {/* FILTERED HABITS CELLS */}
                            {activeHabits.map((h) => {
                              const rawVal = dayData[h] ?? 0; const val = typeof rawVal === 'number' ? rawVal : (rawVal ? 100 : 0);
                              return (
                                <td key={h} className={`p-2 border-r border-b transition-all duration-500 text-center ${rowBgStyle} ${isToday ? 'border-y-2 border-emerald-500/20' : ''}`}>
                                  <motion.button whileTap={{ scale: 0.9 }} title="Mark habit completion" className={`w-11 h-11 rounded-2xl transition-all flex flex-col items-center justify-center mx-auto border-2 text-xl font-black ${getButtonStyles(val, key)} touch-none select-none ${parseLocalDate(key).setHours(0, 0, 0, 0) > new Date().setHours(0, 0, 0, 0) ? 'opacity-20 cursor-not-allowed grayscale' : ''}`} onPointerDown={(e) => handleHabitPressStart(e, key, h, val)} onPointerUp={(e) => handleHabitPressEnd(e, key, h, val)}>
                                    <span className={`text-[7px] font-black leading-none mb-0.5 pointer-events-none ${val > 0 ? 'text-white/60' : (theme === 'dark' ? 'text-slate-600' : 'text-slate-300')}`}>{day.getDate()}</span>
                                    <span className="pointer-events-none font-bold">
                                      {(() => {
                                        const config = habitConfigs[h];
                                        const stepVal = config?.steps > 1 ? Math.round((val / 100) * config.steps) : null;
                                        return stepVal !== null ? stepVal : (val === 100 ? '✔' : (val > 0 ? `${Math.round(val)}%` : '✘'));
                                      })()}
                                    </span>
                                  </motion.button>
                                </td>
                              );
                            })}
                            <td className={`p-2 sticky right-0 z-10 border-l border-b transition-all duration-500 text-center font-black text-sm ${rowBgStyle} ${isToday ? 'border-r-4 border-r-emerald-500' : ''} ${theme === 'dark' ? 'border-l-slate-700' : 'border-l-slate-200'}`}>
                              <span className={progress === 100 ? 'text-emerald-600 font-bold' : progress > 0 ? 'text-blue-600' : theme === 'dark' ? 'text-slate-700' : 'text-slate-300'}>
                                <AnimatedNumber value={progress} />
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      <tr style={{ height: '216px' }}><td></td></tr>
                    </tbody>
                  </>
                ) : (
                  /* --- Table 2: Horizontal Layout (8 Columns visible) --- */
                  <>
                    <thead onWheel={(e) => e.stopPropagation()} className={`sticky top-0 z-30 shadow-sm ${getTableHeadStyle()} border-b transition-colors`}>
                      <tr className="h-[72px]">
                        <th className={`p-4 font-black ${getTextMuted()} text-[9px] uppercase tracking-widest sticky left-0 z-40 text-center border-r border-b ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} shadow-[4px_0_8px_rgba(0,0,0,0.3)] w-[120px] min-w-[120px]`}>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={toggleTableOrientation}
                              className={`p-1.5 rounded-lg border transition-all active:scale-90 shadow-sm
    ${theme === 'dark'
                                  ? 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600'
                                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                              title="Switch to Vertical View"
                            >
                              <TableRotateIcon />
                            </button>
                            <span>DATE Log</span>
                          </div>
                        </th>
                        {daysInMonth.map((day) => {
                          const key = getSafeKey(day);
                          const isToday = new Date().toDateString() === day.toDateString();
                          const cellBgStyle = isToday
                            ? (theme === 'dark' ? 'bg-emerald-900/40 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-emerald-50 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]')
                            : (theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100');
                          return (
                            <th key={key} id={`col-${key}`} className={`p-2 border-r border-b transition-all duration-500 ${cellBgStyle} ${isToday ? (theme === 'dark' ? 'border-emerald-500/50 shadow-[inset_0_0_15px_rgba(16,185,129,0.2)]' : 'border-emerald-400 shadow-[inset_0_0_15px_rgba(16,185,129,0.2)]') : (theme === 'dark' ? 'border-r-slate-800 border-b-slate-700' : 'border-r-slate-100 border-b-slate-200')}`} style={{ width: horizontalColWidth, minWidth: horizontalColWidth }}>
                              <div className="flex flex-col items-center gap-1">
                                <div className="tooltip-trigger flex items-center justify-center">
                                  <motion.button
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setEditingNoteDate(key)}
                                    title={trackerData[key]?.note ? "View/Edit Reflection" : "Add Reflection"}
                                    className={`p-2 rounded-xl border transition-all ${trackerData[key]?.note ? 'bg-blue-600 text-white border-blue-400/40 shadow-md shadow-blue-500/25' : (theme === 'dark' ? 'bg-blue-500/10 text-blue-400/80 border-blue-500/25 hover:bg-blue-500/20 hover:text-blue-300 hover:border-blue-400/50' : 'bg-blue-50/80 text-blue-500 border-blue-200/80 hover:bg-blue-100 hover:text-blue-600 hover:border-blue-300')}`}
                                  >
                                    <NoteIcon />
                                  </motion.button>
                                  <span className="tooltip-content" style={{ whiteSpace: 'nowrap', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {trackerData[key]?.note ? `“${trackerData[key].note.split('\n')[0].substring(0, 45)}${trackerData[key].note.split('\n')[0].length > 45 ? '…' : ''}”` : 'Add reflection'}
                                  </span>
                                </div>
                                <span className={`text-[7px] uppercase font-black ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{day.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                                <div className="flex items-center justify-center gap-0.5"><span className={`text-xs font-black ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{day.getDate()}</span>{shieldedDates.includes(key) && <span title="Streak Shield Active" className="text-cyan-400 text-[10px]">🛡️</span>}</div>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="h-[52px]">
                        <td data-no-scroll className={`p-2 font-black text-[12px] uppercase sticky left-0 z-20 border-r border-b text-center transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} text-emerald-400 shadow-[4px_0_8px_rgba(0,0,0,0.3)]`}>
                          <div className="w-full px-1 font-black leading-tight break-words">Efficiency</div>
                        </td>
                        {daysInMonth.map(day => {
                          const key = getSafeKey(day); const dayData = trackerData[key] || {};
                          const isShieldedDay = shieldedDates.includes(key);
                          let earned = 0;
                          let possible = 0;

                          // EFFICIENCY CALCULATION (Ignoring Archived)
                          const activeHabits = habits.filter(h => !archivedHabits.includes(h));
                          activeHabits.forEach(h => {
                            const v = typeof dayData[h] === 'number' ? dayData[h] : (dayData[h] ? 100 : 0);
                            earned += (v / 100);
                            if (!isShieldedDay || v >= 100) possible += 1;
                          });
                          const progress = possible > 0 ? Math.round((earned / possible) * 100) : (isShieldedDay ? 100 : 0);

                          return (
                            <td key={key} className={`p-2 border-r border-b text-center text-[10px] font-black transition-all duration-500 ${new Date().toDateString() === day.toDateString() ? (theme === 'dark' ? 'bg-emerald-900/20 border-emerald-500/30 shadow-[inset_0_0_15px_rgba(16,185,129,0.05)]' : 'bg-emerald-50/50 border-emerald-400/30 shadow-[inset_0_0_15px_rgba(16,185,129,0.05)]') : (theme === 'dark' ? 'border-r-slate-800 border-b-slate-800' : 'border-r-slate-100 border-b-slate-100')}`} style={{ width: horizontalColWidth, minWidth: horizontalColWidth }}>
                              <span className={progress === 100 ? 'text-emerald-500' : progress > 0 ? 'text-blue-500' : 'text-slate-300'}><AnimatedNumber value={progress} /></span>
                            </td>
                          );
                        })}
                      </tr>
                      {/* FILTERED HABITS ROWS */}
                      {habits.filter(h => !archivedHabits.includes(h)).map((habit) => (
                        <tr key={habit} className="h-[68px]">
                          <td data-no-scroll className={`p-1 font-black sticky left-0 z-20 border-r border-b text-center transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} text-slate-400 shadow-[4px_0_8px_rgba(0,0,0,0.3)]`} style={{ fontSize: `${textSizes.table2}px` }}>
                            <div className="truncate w-full px-1 font-black leading-tight">{habit}</div>
                          </td>
                          {daysInMonth.map(day => {
                            const key = getSafeKey(day); const val = typeof trackerData[key]?.[habit] === 'number' ? trackerData[key][habit] : (trackerData[key]?.[habit] ? 100 : 0);
                            return (
                              <td key={key} className={`p-1.5 border-r border-b text-center transition-all duration-500 ${new Date().toDateString() === day.toDateString() ? (theme === 'dark' ? 'bg-emerald-900/20 border-emerald-500/30 shadow-[inset_0_0_20px_rgba(16,185,129,0.08)]' : 'bg-emerald-50/50 border-emerald-400/30 shadow-[inset_0_0_20px_rgba(16,185,129,0.08)]') : (theme === 'dark' ? 'border-r-slate-800 border-b-slate-800' : 'border-r-slate-100 border-b-slate-100')}`} style={{ width: horizontalColWidth, minWidth: horizontalColWidth }}>
                                <motion.button whileTap={{ scale: 0.9 }} title="Mark habit completion" onPointerDown={(e) => handleHabitPressStart(e, key, habit, val)} onPointerUp={(e) => handleHabitPressEnd(e, key, habit, val)} className={`w-11 h-11 rounded-2xl mx-auto border-2 flex items-center justify-center font-black transition-all text-xl touch-none select-none ${getButtonStyles(val, key)} ${parseLocalDate(key).setHours(0, 0, 0, 0) > new Date().setHours(0, 0, 0, 0) ? 'opacity-20 cursor-not-allowed grayscale' : ''}`}>
                                  <span className="pointer-events-none">
                                    {(() => {
                                      const config = habitConfigs[habit];
                                      const stepVal = config?.steps > 1 ? Math.round((val / 100) * config.steps) : null;
                                      return stepVal !== null ? stepVal : (val === 100 ? '✔' : (val > 0 ? `${Math.round(val)}%` : '✘'));
                                    })()}
                                  </span>
                                </motion.button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}
              </table>
            </div>
          </motion.div>
        </div>


        {/* Footer Credit Section */}
        <footer className={`mt-auto py-6 md:py-10 text-center border-t ${theme === 'dark' ? 'border-slate-900' : 'border-slate-100'}`}>
          <p className={`text-[15px] md:text-[16px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] ${getTextMuted()}`}>
            Developed by <a
              href="https://www.facebook.com/hsnshahriaradib"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-500 hover:text-emerald-400 hover:underline decoration-2 underline-offset-4 transition-all cursor-pointer"
            >
              Adib
            </a> | APM | RU
          </p>
        </footer>
      </motion.div>

      {/* --- Modals --- */}
      <AnimatePresence>
        {/* Click-to-Inspect Day Inspector Modal */}
        {selectedHeatmapDay && (() => {
          const dayDate = parseLocalDate(selectedHeatmapDay);
          const isShielded = shieldedDates.includes(selectedHeatmapDay);
          const dayData = trackerData[selectedHeatmapDay] || {};
          const dayHabits = activeHabitsList.filter(h => isHabitActiveOnDate(h, selectedHeatmapDay, archivedHabits, habitConfigs));
          let totalEarnedWeight = 0;
          let totalPossibleWeight = 0;
          let doneCount = 0;
          dayHabits.forEach(h => {
            const r = dayData[h] ?? 0;
            const v = typeof r === 'number' ? r : (r ? 100 : 0);
            totalEarnedWeight += (v / 100);
            if (!isShielded || v >= 100) totalPossibleWeight += 1;
            if (v >= 100) doneCount++;
          });
          const dayPct = totalPossibleWeight > 0 ? Math.round((totalEarnedWeight / totalPossibleWeight) * 100) : (isShielded ? 100 : 0);
          const hasNote = Boolean(dayData.note && dayData.note.trim());
          const isFutureDay = new Date(dayDate).setHours(0, 0, 0, 0) > new Date().setHours(0, 0, 0, 0);
          const isFireDay = dayHabits.length > 0 && doneCount === dayHabits.length;
          const canToggleShield = !isFutureDay && (isShielded || (!isFireDay && shieldStats.availableCount > 0));

          const handleJumpToMonth = () => {
            setCurrentDate(new Date(dayDate.getFullYear(), dayDate.getMonth(), 1));
            const targetKey = selectedHeatmapDay;
            setSelectedHeatmapDay(null);
            setTimeout(() => {
              const container = scrollContainerRef.current;
              if (!container) return;
              if (tableOrientation === 'vertical') {
                const el = document.getElementById(`row-${targetKey}`);
                if (el) container.scrollTo({ top: el.offsetTop - 144, behavior: 'smooth' });
              } else {
                const el = document.getElementById(`col-${targetKey}`);
                if (el) {
                  const colWidth = el.offsetWidth;
                  container.scrollTo({ left: el.offsetLeft - 120 - (colWidth * 2), behavior: 'smooth' });
                }
              }
            }, 250);
          };

          return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedHeatmapDay(null)}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-black tracking-tight">
                      {dayDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                    </h3>
                    <p className={`text-xs font-semibold ${getTextMuted()}`}>
                      Efficiency: <span className="text-emerald-500 font-black">{dayPct}%</span> ({doneCount}/{dayHabits.length} habits done)
                    </p>
                  </div>
                  <button onClick={() => setSelectedHeatmapDay(null)} className={`p-1.5 rounded-xl ${getTextMuted()} hover:text-rose-500 transition-colors`} title="Close (ESC)">
                    <XIcon />
                  </button>
                </div>

                <TutorialTipCard
                  isVisible={!dismissedTips.dayInspector}
                  isSnapping={!!snappingTips.dayInspector}
                  onDismiss={() => triggerTipSnap('dayInspector')}
                  onSnapDone={() => finishTipSnap('dayInspector')}
                  theme={theme}
                  accent="cyan"
                  icon={<ShieldIcon className="w-4 h-4" />}
                  eyebrow="Day Inspector"
                  title="Quick Edit, Shield & Jump"
                  description="Tap any habit below to toggle it for this date, activate a Streak Shield to protect missed days, add a note, or jump straight to this day in the table."
                  marginBottom="0.75rem"
                />

                {/* Action Controls */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={handleJumpToMonth}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-emerald-600 hover:bg-slate-200'
                      }`}
                  >
                    <span>Jump to Month in Table</span>
                    <ChevronRightIcon />
                  </button>

                  <button
                    disabled={!canToggleShield}
                    onClick={() => toggleShieldDate(selectedHeatmapDay)}
                    className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all ${isShielded
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : canToggleShield
                        ? (theme === 'dark' ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-400' : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-cyan-500/40 hover:text-cyan-600')
                        : 'opacity-45 cursor-not-allowed border-slate-800 text-slate-500'
                      }`}
                    title={
                      isShielded
                        ? 'Remove Streak Shield from this date'
                        : isFireDay
                          ? 'Fire day — all habits already completed, no shield needed'
                          : isFutureDay
                            ? 'Cannot shield a future date'
                            : shieldStats.availableCount > 0
                              ? 'Protect this date with a Streak Shield'
                              : 'No streak shields available'
                    }
                  >
                    <ShieldIcon />
                    <span>
                      {isShielded
                        ? '🛡️ Shield Active'
                        : isFireDay
                          ? '🔥 Fire Day (No Shield)'
                          : '🛡️ Use Streak Shield'}
                    </span>
                  </button>
                </div>

                {/* Habits Checklist for that day */}
                <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1 mb-4">
                  {dayHabits.map((h) => {
                    const raw = dayData[h] ?? 0;
                    const val = typeof raw === 'number' ? raw : (raw ? 100 : 0);
                    const isDone = val >= 100;
                    return (
                      <div
                        key={h}
                        onClick={() => { if (!isFutureDay) updateHabitValue(selectedHeatmapDay, h, isDone ? 0 : 100); }}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${isFutureDay ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${isDone
                          ? (theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700')
                          : (theme === 'dark' ? 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800/80' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100')
                          }`}
                      >
                        <span className="text-xs font-bold tracking-wide truncate">{h}</span>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-md ${isDone ? 'bg-emerald-500 text-white' : (theme === 'dark' ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-600')}`}>
                          {(() => {
                            const cfg = habitConfigs[h];
                            if (cfg?.steps > 1) {
                              const stepVal = Math.round((val / 100) * cfg.steps);
                              return `${stepVal}/${cfg.steps}`;
                            }
                            return `${Math.round(val)}%`;
                          })()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Reflection Note button */}
                <div className={`pt-3 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'} flex items-center justify-between`}>
                  <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                    <span className="text-sm">📝</span>
                    <span className={`text-xs font-semibold ${getTextMuted()} truncate`}>
                      {hasNote ? dayData.note : 'No note for this day'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const targetDate = selectedHeatmapDay;
                      setSelectedHeatmapDay(null);
                      setEditingNoteDate(targetDate);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border shrink-0 ${theme === 'dark' ? 'bg-blue-900/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                      }`}
                  >
                    {hasNote ? 'Edit Note' : 'Add Note'}
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
        {/* Habit Detail Modal Clean Version Below */}
        {viewingHabitMap && habitInsights && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => { setViewingHabitMap(null); setIsEditingTabName(false); }}>
            {/* Forced Horizontal Layout for all modes */}
            {/* Compact Locked Layout: 20% Smaller & No Sidebar Scroll */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className={`rounded-[1.5rem] md:rounded-[2rem] w-[95vw] md:w-full max-w-[760px] max-h-[90vh] overflow-y-auto md:overflow-hidden shadow-2xl flex flex-col md:flex-row transition-colors border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Sidebar */}
              <div className={`w-full md:w-60 border-b md:border-b-0 md:border-r p-4 md:p-5 flex flex-col shrink-0 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>

                {/* Mobile Compact View (<768px): 2-row clean grid */}
                <div className="flex md:hidden items-center justify-between gap-3 w-full">
                  {/* Score Ring */}
                  <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                    <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 144 144">
                      <circle cx="72" cy="72" r="64" fill="none" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} strokeWidth="10" />
                      <motion.circle initial={{ strokeDashoffset: 402 }} animate={{ strokeDashoffset: 402 - (402 * habitInsights.score / 100) }} transition={{ duration: 1.5, ease: "easeOut" }} cx="72" cy="72" r="64" fill="none" stroke="#10b981" strokeWidth="10" strokeDasharray={402} strokeLinecap="round" />
                    </svg>
                    <div className="flex flex-col items-center">
                      <span className={`text-base font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}><AnimatedNumber value={habitInsights.score} /></span>
                      <span className={`text-[7px] font-black ${getTextMuted()} uppercase tracking-widest`}>Score</span>
                    </div>
                  </div>

                  {/* Stats 2x2 Grid */}
                  <div className="grid grid-cols-2 gap-1.5 flex-1">
                    <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-1.5 rounded-xl border flex flex-col items-center justify-center text-center`}>
                      <span className={`text-[8px] uppercase font-black ${getTextMuted()} leading-none mb-1`}>Steps</span>
                      <div className="flex items-center justify-center gap-1 w-full">
                        <button
                          type="button"
                          onClick={() => updateViewingHabitSteps((parseInt(tempGoalVal) || 1) - 1)}
                          disabled={(parseInt(tempGoalVal) || 1) <= 1}
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black disabled:opacity-30 ${theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-600'}`}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={tempGoalVal}
                          onChange={(e) => setTempGoalVal(e.target.value)}
                          onBlur={() => updateViewingHabitSteps(tempGoalVal)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.currentTarget.blur();
                          }}
                          className="w-8 text-center text-xs font-black tabular-nums bg-transparent focus:outline-none focus:text-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateViewingHabitSteps((parseInt(tempGoalVal) || 1) + 1)}
                          disabled={(parseInt(tempGoalVal) || 1) >= 99}
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black disabled:opacity-30 ${theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-600'}`}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-1.5 rounded-xl border flex flex-col items-center justify-center text-center`}>
                      <span className={`text-[8px] uppercase font-black ${getTextMuted()} leading-none mb-0.5`}>Rank</span>
                      <span className={`text-xs font-black truncate max-w-[70px] ${habitInsights.level === "Grandmaster" ? "text-emerald-500" : (theme === 'dark' ? 'text-slate-200' : 'text-slate-800')}`}>{habitInsights.level}</span>
                    </div>

                    <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-1.5 rounded-xl border flex flex-col items-center justify-center text-center`}>
                      <span className={`text-[8px] uppercase font-black ${getTextMuted()} leading-none mb-0.5`}>Streak</span>
                      <span className={`text-xs font-black ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{habitInsights.currentStreak}d</span>
                    </div>

                    <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-1.5 rounded-xl border flex flex-col items-center justify-center text-center`}>
                      <span className={`text-[8px] uppercase font-black ${getTextMuted()} leading-none mb-0.5`}>Best</span>
                      <span className={`text-xs font-black ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{habitInsights.bestStreak}d</span>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout (>=768px): Vertical Stack */}
                <div className="hidden md:flex flex-col items-center w-full">
                  <div className="relative w-28 h-28 flex items-center justify-center mb-5 shrink-0">
                    <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 144 144">
                      <circle cx="72" cy="72" r="64" fill="none" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} strokeWidth="10" />
                      <motion.circle initial={{ strokeDashoffset: 402 }} animate={{ strokeDashoffset: 402 - (402 * habitInsights.score / 100) }} transition={{ duration: 1.5, ease: "easeOut" }} cx="72" cy="72" r="64" fill="none" stroke="#10b981" strokeWidth="10" strokeDasharray={402} strokeLinecap="round" />
                    </svg>
                    <div className="flex flex-col items-center">
                      <span className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}><AnimatedNumber value={habitInsights.score} /></span>
                      <span className={`text-[8px] font-black ${getTextMuted()} uppercase tracking-widest`}>Score</span>
                    </div>
                  </div>

                  {/* Goal Input Desktop */}
                  <div className={`w-full mb-5 p-3 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-700/80' : 'bg-white border-slate-200'} shadow-sm`}>
                    <div className="flex items-center justify-between gap-1.5 mb-2">
                      <label className={`text-[8px] font-black uppercase tracking-wider ${getTextMuted()}`}>
                        Goal Steps
                      </label>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${(parseInt(tempGoalVal) || 1) > 1
                        ? (theme === 'dark' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-50 text-emerald-700')
                        : (theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')
                        }`}>
                        {(parseInt(tempGoalVal) || 1) === 1 ? 'Single Check' : `${parseInt(tempGoalVal) || 1} / Day`}
                      </span>
                    </div>

                    <div className={`flex items-center h-8 rounded-xl border overflow-hidden mb-2 ${theme === 'dark' ? 'bg-slate-800/70 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <button
                        type="button"
                        onClick={() => updateViewingHabitSteps((parseInt(tempGoalVal) || 1) - 1)}
                        disabled={(parseInt(tempGoalVal) || 1) <= 1}
                        title="Decrease goal steps"
                        className={`w-8 h-full flex items-center justify-center text-xs font-black transition-colors disabled:opacity-30 ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/70'}`}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={tempGoalVal}
                        onChange={(e) => setTempGoalVal(e.target.value)}
                        onBlur={() => updateViewingHabitSteps(tempGoalVal)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') e.currentTarget.blur();
                        }}
                        className={`flex-1 min-w-0 text-center text-sm font-black tabular-nums bg-transparent focus:outline-none focus:text-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}
                      />
                      <button
                        type="button"
                        onClick={() => updateViewingHabitSteps((parseInt(tempGoalVal) || 1) + 1)}
                        disabled={(parseInt(tempGoalVal) || 1) >= 99}
                        title="Increase goal steps"
                        className={`w-8 h-full flex items-center justify-center text-xs font-black transition-colors disabled:opacity-30 ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/70'}`}
                      >
                        +
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-1">
                      {[1, 3, 5, 8].map((n) => {
                        const active = (parseInt(tempGoalVal) || 1) === n;
                        return (
                          <button
                            key={n}
                            type="button"
                            onClick={() => updateViewingHabitSteps(n)}
                            className={`h-6 rounded-lg text-[9px] font-black transition-all ${active
                              ? 'bg-emerald-500 text-slate-950 shadow-xs'
                              : (theme === 'dark' ? 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
                              }`}
                          >
                            {n === 1 ? '1×' : n}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rank & Streaks Desktop */}
                  <div className="w-full space-y-4">
                    <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-sm' : 'bg-white border-slate-100 shadow-sm'} p-4 rounded-xl border flex flex-col items-center text-center transition-all relative overflow-hidden group/rank w-full`}>
                      <div className={`mb-1 transition-all duration-500 ${habitInsights.level === "Grandmaster" ? "text-emerald-500 scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" :
                        habitInsights.level === "Elite" ? "text-blue-500" :
                          habitInsights.level === "Adept" ? "text-purple-500" :
                            habitInsights.level === "Apprentice" ? "text-amber-500" : "text-slate-400 opacity-50"
                        }`}>
                        <TrophyIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className={`text-[9px] block uppercase font-black ${getTextMuted()} leading-none mb-0.5`}>Rank</span>
                        <span className={`text-xs font-black transition-colors ${habitInsights.level === "Grandmaster" ? "text-emerald-500" : (theme === 'dark' ? 'text-slate-200' : 'text-slate-800')
                          }`}>{habitInsights.level}</span>
                      </div>

                      <div className="flex gap-0.5 mt-2 opacity-30 group-hover/rank:opacity-100 transition-opacity">
                        {['Seed', 'Apprentice', 'Adept', 'Elite', 'Grandmaster'].map((r) => (
                          <div key={r} className={`w-1 h-1 rounded-full ${habitInsights.level === r ? 'bg-emerald-500 scale-125' : 'bg-slate-600'}`} />
                        ))}
                      </div>
                    </div>

                    <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-sm' : 'bg-white border-slate-100 shadow-sm'} p-3 rounded-xl border flex flex-col items-center text-center transition-colors w-full`}>
                      <div className="text-orange-500 scale-90 mb-1"><HeaderFireIcon className="w-4 h-4" /></div>
                      <div><span className={`text-[9px] block uppercase font-black ${getTextMuted()} leading-none`}>Streak</span><span className={`text-xs font-black ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{habitInsights.currentStreak}d</span></div>
                    </div>

                    <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-sm' : 'bg-white border-slate-100 shadow-sm'} p-3 rounded-xl border flex flex-col items-center text-center transition-colors ring-2 ring-emerald-500/10 w-full`}>
                      <div className="text-yellow-500 scale-90 mb-1"><TrophyIcon /></div>
                      <div><span className={`text-[9px] block uppercase font-black ${getTextMuted()} leading-none`}>Best</span><span className={`text-xs font-black ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{habitInsights.bestStreak}d</span></div>
                    </div>
                  </div>
                </div>

                {/* Archive and Delete buttons: side-by-side on mobile, stacked on desktop */}
                <div className="flex flex-row md:flex-col gap-2 w-full mt-3 md:mt-8">
                  <motion.button whileTap={{ scale: 0.95 }} title="Archive habit" onClick={() => toggleArchiveHabit(viewingHabitMap)} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 md:py-3 px-3 md:px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white border border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-500 hover:text-white'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7" /><path d="M9 13v-3" /><path d="M15 13v-3" /></svg>
                    Archive
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} title="Delete habit" onClick={() => { setHabitToDelete(viewingHabitMap); setShowDeleteConfirm(true); }} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 md:py-3 px-3 md:px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20">
                    <TrashIcon /> Delete
                  </motion.button>
                </div>
              </div>

              {/* MAIN CALENDAR SECTION */}
              <div className="flex-1 p-4 md:p-6 flex flex-col md:overflow-y-auto custom-scrollbar">
                {/* Centered Habit Header with Integrated Prev/Next Arrows + Top-Right ESC */}
                {(() => {
                  const total = modalNavigableHabits.length;
                  const curIdx = modalNavigableHabits.indexOf(viewingHabitMap);
                  const canStep = total > 1 && curIdx !== -1;
                  const prevName = canStep ? modalNavigableHabits[(curIdx - 1 + total) % total] : '';
                  const nextName = canStep ? modalNavigableHabits[(curIdx + 1) % total] : '';

                  return (
                    <div className={`relative pb-4 mb-5 border-b ${theme === 'dark' ? 'border-slate-800/80' : 'border-slate-200/80'}`}>
                      <button
                        onClick={() => { setViewingHabitMap(null); setIsEditingTabName(false); }}
                        className={`absolute top-0 right-0 flex flex-col items-center gap-0.5 p-2 transition-all ${getTextMuted()} hover:text-rose-500`}
                        title="Close (ESC)"
                      >
                        <XIcon />
                        <span className="text-[6px] font-mono opacity-50">ESC</span>
                      </button>

                      <div className="px-9 flex flex-col items-center text-center">
                        <div className="flex items-center justify-center gap-2.5 w-full max-w-full">
                          <button
                            type="button"
                            onClick={() => stepViewingHabit(-1)}
                            disabled={!canStep}
                            title={canStep ? `Previous habit: ${prevName} (←)` : 'No other habits'}
                            className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-all disabled:opacity-25 disabled:cursor-not-allowed ${theme === 'dark'
                              ? 'bg-slate-800/70 border-slate-700/80 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-slate-800'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50'
                              }`}
                          >
                            <ChevronLeftIcon />
                          </button>

                          {isEditingTabName ? (
                            <div className="inline-flex items-center gap-1.5 flex-1 min-w-0 max-w-[260px] justify-center">
                              <input
                                autoFocus
                                className={`text-base md:text-lg font-black px-2.5 py-1 rounded-xl border-2 focus:outline-none text-center w-full min-w-0 ${theme === 'dark'
                                  ? 'bg-slate-800/90 border-emerald-500 text-white'
                                  : 'bg-slate-50 border-emerald-500 text-slate-800'
                                  }`}
                                value={tempHabitName}
                                onChange={(e) => setTempHabitName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleTabRename();
                                  } else if (e.key === 'Escape') {
                                    e.stopPropagation();
                                    setIsEditingTabName(false);
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={handleTabRename}
                                title="Save habit name"
                                className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shrink-0 transition-colors"
                              >
                                <CheckIcon className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsEditingTabName(false)}
                                title="Cancel rename"
                                className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${theme === 'dark' ? 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                              >
                                <XIcon />
                              </button>
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center gap-1.5 min-w-0 max-w-[250px]">
                              <h3
                                className={`text-lg md:text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'} leading-tight cursor-pointer hover:text-emerald-500 transition-colors truncate`}
                                onClick={() => { setIsEditingTabName(true); setTempHabitName(viewingHabitMap); }}
                                title={`Rename "${viewingHabitMap}"`}
                              >
                                {viewingHabitMap}
                              </h3>
                              <button
                                type="button"
                                onClick={() => { setIsEditingTabName(true); setTempHabitName(viewingHabitMap); }}
                                title={`Edit habit name (${viewingHabitMap})`}
                                className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all ${theme === 'dark'
                                  ? 'bg-slate-800/70 border-slate-700/80 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50'
                                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-400'
                                  }`}
                              >
                                <EditIcon />
                              </button>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => stepViewingHabit(1)}
                            disabled={!canStep}
                            title={canStep ? `Next habit: ${nextName} (→)` : 'No other habits'}
                            className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-all disabled:opacity-25 disabled:cursor-not-allowed ${theme === 'dark'
                              ? 'bg-slate-800/70 border-slate-700/80 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-slate-800'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50'
                              }`}
                          >
                            <ChevronRightIcon />
                          </button>
                        </div>

                        <div className="flex items-center justify-center gap-2 mt-2.5 flex-wrap">
                          <FilterDropdown
                            value={habitConfigs[viewingHabitMap]?.category || 'all'}
                            onChange={(val) => {
                              const newConfigs = {
                                ...habitConfigs,
                                [viewingHabitMap]: { ...(habitConfigs[viewingHabitMap] || { steps: 1 }), category: val }
                              };
                              setHabitConfigs(newConfigs);
                              save(trackerData, habits, newConfigs);
                            }}
                            theme={theme}
                            variant="subtle"
                            maxWidthClass="max-w-[150px]"
                            options={[
                              { value: 'all', label: 'No category' },
                              ...categories.filter(cat => cat !== 'all').map(cat => ({ value: cat, label: cat })),
                            ]}
                          />
                          {total > 1 && (
                            <span className={`h-6 px-2 rounded-lg border inline-flex items-center text-[10px] font-black tabular-nums ${theme === 'dark' ? 'bg-slate-800/60 border-slate-700/80 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                              {curIdx >= 0 ? `${curIdx + 1} / ${total}` : `1 / ${total}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <TutorialTipCard
                  isVisible={!dismissedTips.habitDetail}
                  isSnapping={!!snappingTips.habitDetail}
                  onDismiss={() => triggerTipSnap('habitDetail')}
                  onSnapDone={() => finishTipSnap('habitDetail')}
                  theme={theme}
                  accent="emerald"
                  icon={<HeaderFireIcon className="w-4 h-4 text-emerald-500" />}
                  eyebrow="Habit Controls"
                  title="Goal Steps, Priority & Calendar"
                  description="Set Goal Steps (for countable habits), adjust Priority (1x–10x XP), click the title to rename, or tap/hold any day in the calendar below. Green fire days mean every active habit was completed."
                  marginBottom="1rem"
                />

                {/* Upgraded Priority Multiplier Control */}
                {(() => {
                  const currentPriority = habitConfigs[viewingHabitMap]?.priority || 1;
                  return (
                    <div className={`mb-6 p-3.5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/80' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <label className={`text-[10px] font-black uppercase tracking-wider ${getTextMuted()}`}>
                            Priority Multiplier
                          </label>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${currentPriority > 1
                          ? (theme === 'dark' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                          : (theme === 'dark' ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-white text-slate-500 border border-slate-200')
                          }`}>
                          {currentPriority * 10} XP / day · {currentPriority}x
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className={`flex items-center gap-1 p-1 rounded-xl border flex-1 ${theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
                          {[1, 2, 3, 5, 10].map((p) => {
                            const active = currentPriority === p;
                            return (
                              <button
                                key={p}
                                type="button"
                                onClick={() => updateViewingHabitPriority(p)}
                                className={`flex-1 h-7 rounded-lg text-[10px] font-black transition-all ${active
                                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                                  : (theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-800/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
                                  }`}
                              >
                                {p}x
                              </button>
                            );
                          })}
                        </div>

                        <div className={`inline-flex items-center h-9 rounded-xl border overflow-hidden shrink-0 ${theme === 'dark' ? 'bg-slate-900/80 border-slate-700/80' : 'bg-white border-slate-200'}`}>
                          <button
                            type="button"
                            onClick={() => updateViewingHabitPriority(currentPriority - 1)}
                            disabled={currentPriority <= 1}
                            title="Decrease priority"
                            className={`w-7 h-full flex items-center justify-center text-xs font-black transition-colors disabled:opacity-30 ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                          >
                            −
                          </button>
                          <span className={`w-8 text-center text-[11px] font-black tabular-nums ${currentPriority > 1 ? 'text-emerald-400' : (theme === 'dark' ? 'text-slate-300' : 'text-slate-700')}`}>
                            {currentPriority}x
                          </span>
                          <button
                            type="button"
                            onClick={() => updateViewingHabitPriority(currentPriority + 1)}
                            disabled={currentPriority >= 10}
                            title="Increase priority"
                            className={`w-7 h-full flex items-center justify-center text-xs font-black transition-colors disabled:opacity-30 ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Month Switcher Anchored to Calendar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${getTextMuted()}`}>
                    Monthly Log
                  </span>
                  <div className={`inline-flex items-center gap-1 p-0.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700/80 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <button
                      type="button"
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                      title="Previous month"
                      className="p-1 rounded-lg hover:text-emerald-500 transition-colors"
                    >
                      <ChevronLeftIcon />
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-widest min-w-[82px] text-center">
                      {currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                      title="Next month"
                      className="p-1 rounded-lg hover:text-emerald-500 transition-colors"
                    >
                      <ChevronRightIcon />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-3 text-center">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <span key={i} className={`text-[10px] font-black ${theme === 'dark' ? 'text-slate-700' : 'text-slate-300'} uppercase`}>{day}</span>)}
                  {modalCalendarGrid.map((day, idx) => {
                    const key = getSafeKey(day);
                    const isOtherMonth = day.getMonth() !== currentDate.getMonth();
                    const v = typeof trackerData[key]?.[viewingHabitMap] === 'number' ? trackerData[key]?.[viewingHabitMap] : (trackerData[key]?.[viewingHabitMap] ? 100 : 0);
                    const isTodayCell = new Date().toDateString() === day.toDateString();
                    const isPassedCell = new Date(day).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
                    const config = habitConfigs[viewingHabitMap];
                    const stepVal = config?.steps > 1 ? Math.round((v / 100) * config.steps) : null;
                    const dayHabits = activeHabitsList.filter(h => isHabitActiveOnDate(h, key, archivedHabits, habitConfigs));
                    const isAllHabitsDone = dayHabits.length > 0 && dayHabits.every(h => {
                      const raw = trackerData[key]?.[h] ?? 0;
                      const val = typeof raw === 'number' ? raw : (raw ? 100 : 0);
                      return Math.round(val) >= 100;
                    });

                    return (
                      <motion.div key={idx} whileTap={{ scale: 0.9 }}
                        onPointerDown={(e) => handleHabitPressStart(e, key, viewingHabitMap, v)}
                        onPointerUp={(e) => handleHabitPressEnd(e, key, viewingHabitMap, v)}
                        title={isAllHabitsDone ? 'All habits completed! 🔥' : undefined}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all border-2 touch-none select-none ${
                          isAllHabitsDone
                            ? (theme === 'dark'
                                ? 'bg-emerald-800 border-emerald-400/75 text-white shadow-[0_0_12px_rgba(52,245,168,0.35)]'
                                : 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.35)]')
                            : getButtonStyles(v, key)
                        } ${isTodayCell ? 'ring-2 ring-emerald-400 ring-offset-2' : ''} ${isOtherMonth ? 'opacity-30 pointer-events-none' : ''}`}>
                        <span className={`text-[8px] font-black pointer-events-none ${(v > 0 || isAllHabitsDone) ? 'text-white/75' : (theme === 'dark' ? 'text-slate-600' : 'text-slate-400')}`}>{day.getDate()}</span>
                        {isAllHabitsDone ? (
                          <HeaderFireIcon className="w-4 h-4 text-emerald-200 drop-shadow-[0_0_6px_rgba(110,231,183,0.65)] pointer-events-none mt-0.5" />
                        ) : (
                          <span className={`text-xs font-black pointer-events-none ${v > 0 ? 'text-white' : (isPassedCell ? 'text-red-500' : 'text-white [text-shadow:_-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000]')} ${v > 0 && v < 100 ? 'text-[9px]' : ''}`}>
                            {stepVal !== null ? stepVal : (v === 100 ? '✔' : (v > 0 ? `${Math.round(v)}%` : '✘'))}
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* MASTERY SLIDER OVERLAY - Optimized for Zero Lag */}
        {activeSlider && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-md touch-none select-none"
            onPointerUp={() => {
              const barFill = document.getElementById(`bar-fill-${activeSlider.dateKey}`);
              if (barFill) {
                barFill.style.backgroundColor = '';
                barFill.style.height = '';
              }

              updateHabitValue(activeSlider.dateKey, activeSlider.habit, activeSlider.value);
              setActiveSlider(null);
            }}
          >
            <div
              className="fixed flex flex-col items-center"
              style={{
                left: activeSlider.x, top: activeSlider.y,
                transform: 'translate(-50%, -50%)', position: 'fixed', willChange: 'transform'
              }}
              onPointerMove={(e) => {
                if (e.buttons === 1 || e.pointerType === 'touch') {
                  const track = document.getElementById('mastery-slider-track');
                  const fill = document.getElementById('mastery-slider-fill');
                  const label = document.getElementById('mastery-slider-label');
                  if (!track || !fill || !label) return;

                  const rect = track.getBoundingClientRect();
                  const percentage = Math.max(0, Math.min(100, Math.round(((rect.bottom - e.clientY) / rect.height) * 100)));
                  const config = habitConfigs[activeSlider.habit];
                  const finalVal = config?.steps > 1 ? (Math.round((percentage / 100) * config.steps) / config.steps) * 100 : percentage;

                  // 1. Update Slider DOM
                  fill.style.height = `${finalVal}%`;
                  const displayVal = config?.steps > 1 ? Math.round((finalVal / 100) * config.steps) : Math.round(finalVal) + '%';
                  label.innerText = displayVal;
                  label.style.color = finalVal >= 47 ? '#0f172a' : '#ffffff';

                  // 2. Update Activity Bar DOM Instantly (Zero Lag)
                  const barFill = document.getElementById(`bar-fill-${activeSlider.dateKey}`);
                  if (barFill) {
                    barFill.style.height = `${finalVal}%`;
                    // #10b981 for full, #2563eb for partial
                    barFill.style.backgroundColor = finalVal >= 100 ? '#10b981' : '#2563eb';
                  }

                  // 3. Store current value in ref so onPointerUp knows the final state
                  activeSlider.value = finalVal;
                }
              }}
            >
              <p className="absolute -top-12 text-white font-black text-xs tracking-wider whitespace-nowrap drop-shadow-xl z-10">{activeSlider.habit}</p>
              <div id="mastery-slider-track" className="relative w-24 h-64 bg-white/10 rounded-[2.5rem] border-4 border-white/30 overflow-hidden shadow-2xl backdrop-blur-3xl ring-8 ring-white/5 cursor-ns-resize">
                <div
                  id="mastery-slider-fill"
                  className="absolute bottom-0 w-full bg-white transition-all duration-75 shadow-[0_0_25px_rgba(255,255,255,0.5)]"
                  style={{ height: `${activeSlider.value}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span
                    id="mastery-slider-label"
                    className={`text-4xl font-black transition-colors ${activeSlider.value >= 47 ? 'text-slate-900' : 'text-white'}`}
                  >
                    {habitConfigs[activeSlider.habit]?.steps > 1
                      ? Math.round((activeSlider.value / 100) * habitConfigs[activeSlider.habit].steps)
                      : Math.round(activeSlider.value) + '%'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}


        {/* Confirmation and Editor Modals */}
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border p-8 rounded-[2rem] max-w-sm w-full shadow-2xl text-center`}>
              <div className="bg-rose-500/20 text-rose-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"><TrashIcon /></div>
              <h4 className="text-xl font-black mb-2">Move Habit to Trash?</h4>
              <p className={`text-sm ${getTextMuted()} mb-8 font-medium`}>
                <span className="text-rose-500 font-bold">"{habitToDelete}"</span> and its records will stay in Trash for {TRASH_RETENTION_DAYS} days before automatic permanent removal.
              </p>
              <div className="flex gap-4">
                <button onClick={() => { setShowDeleteConfirm(false); setHabitToDelete(null); }} title="Cancel" className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>Cancel</button>
                <button onClick={() => deleteHabit(habitToDelete)} title="Move to Trash" className="flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest bg-rose-500 text-white shadow-lg shadow-rose-500/20">Move to Trash</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* --- MANAGE HYBRID MODAL --- */}
        {showManageModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={closeManageModal}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl relative flex flex-col h-[560px]`} onClick={e => e.stopPropagation()}>
              <button onClick={closeManageModal} title="Close (ESC)" className="absolute -top-4 -right-4 z-10 p-2 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-500/50 hover:shadow-[0_0_16px_4px_rgba(239,68,68,0.5)] transition-all duration-200">
                <XIcon />
              </button>

              <div className="flex flex-col gap-4 mb-6 shrink-0 mt-2">
                <div className="flex bg-slate-800/20 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setManageModalTab('categories')}
                    title="Switch to Categories tab"
                    className={`flex-1 py-2 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all ${manageModalTab === 'categories' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                  >
                    Categories
                  </button>
                  <button
                    onClick={() => setManageModalTab('habits')}
                    title="Switch to Habits tab"
                    className={`flex-1 py-2 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all ${manageModalTab === 'habits' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                  >
                    Habits
                  </button>
                </div>
              </div>

              {/* Habits Management Tutorial Banner */}
              <TutorialTipCard
                isVisible={!dismissedTips.manage}
                isSnapping={!!snappingTips.manage}
                onDismiss={() => triggerTipSnap('manage')}
                onSnapDone={() => finishTipSnap('manage')}
                theme={theme}
                accent="amber"
                icon={<ArchiveIcon className="w-4 h-4" />}
                eyebrow="Manager Guide"
                title="Archive vs Delete & Reorder"
                description="Use Archive to pause a habit while keeping all XP and history safe—archived days won’t count against your heatmap even if you restore it later. Use the arrows to reorder."
                badges={['Archive = Safe Pause', 'Delete = 30-Day Trash']}
                marginBottom="0.75rem"
              />

              {manageModalTab === 'habits' ? (
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="flex gap-2 mb-4 shrink-0">
                    <input
                      type="text"
                      placeholder={selectedCategory === 'all' ? 'New habit...' : `New habit in ${selectedCategory}...`}
                      value={newHabitInput}
                      onChange={(e) => {
                        setNewHabitInput(e.target.value);
                        if (habitInputError) setHabitInputError('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddHabitFromInput()}
                      className={`flex-1 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none border-2 transition-all ${habitInputError ? 'border-rose-500/70 focus:border-rose-500' :
                        theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-emerald-500 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 focus:border-emerald-500 text-slate-800'
                        }`}
                    />
                    <button
                      onClick={handleAddHabitFromInput}
                      disabled={!newHabitInput.trim()}
                      title="Add new habit"
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <PlusIcon />
                    </button>
                  </div>
                  {habitInputError && (
                    <p className="text-[11px] font-bold text-rose-500 mb-3 px-1 flex items-center gap-1.5 shrink-0">
                      <span>⚠️</span>
                      <span>{habitInputError}</span>
                    </p>
                  )}
                  <input
                    type="text"
                    placeholder="Filter habits..."
                    value={manageSearchQuery}
                    onChange={(e) => setManageSearchQuery(e.target.value)}
                    className={`w-full mb-3 px-3.5 py-2 rounded-xl text-xs font-bold focus:outline-none border transition-all ${theme === 'dark'
                      ? 'bg-slate-800/60 border-slate-700 focus:border-emerald-500 text-white placeholder:text-slate-500'
                      : 'bg-slate-50 border-slate-200 focus:border-emerald-500 text-slate-800 placeholder:text-slate-400'
                      }`}
                  />
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                    {(() => {
                      const filteredManageHabits = habits.filter(h =>
                        !manageSearchQuery.trim() || h.toLowerCase().includes(manageSearchQuery.trim().toLowerCase())
                      );
                      const isSearching = Boolean(manageSearchQuery.trim());
                      return filteredManageHabits.map((habit, index) => (
                        <div key={habit} className={`p-3 rounded-2xl border flex items-center justify-between transition-colors ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                            <span className={`text-xs font-black w-5 text-center shrink-0 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{index + 1}</span>

                            {/* INLINE EDITING LOGIC - Removed onBlur entirely to fix focus loops */}
                            {editingHabitName === habit ? (
                              <input
                                autoFocus
                                className={`text-sm font-black w-full bg-transparent focus:outline-none border-b border-emerald-500 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}
                                value={tempHabitName}
                                onChange={(e) => setTempHabitName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleDashboardRename(habit);
                                  }
                                }}
                              />
                            ) : (
                              <span className={`text-sm font-black truncate ${archivedHabits.includes(habit) ? 'opacity-40 line-through' : ''} ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                {habit}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <FilterDropdown
                              value={habitConfigs[habit]?.category || 'all'}
                              onChange={(val) => {
                                const newConfigs = {
                                  ...habitConfigs,
                                  [habit]: { ...(habitConfigs[habit] || { steps: 1 }), category: val }
                                };
                                setHabitConfigs(newConfigs);
                                save(trackerData, habits, newConfigs);
                              }}
                              theme={theme}
                              variant="subtle"
                              align="right"
                              maxWidthClass="max-w-[96px]"
                              options={[
                                { value: 'all', label: 'No category' },
                                ...categories.filter(cat => cat !== 'all').map(cat => ({ value: cat, label: cat })),
                              ]}
                            />

                            {/* EDIT / SAVE BUTTON - Back to reliable onClick */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                if (editingHabitName === habit) {
                                  handleDashboardRename(habit);
                                } else {
                                  setEditingHabitName(habit);
                                  setTempHabitName(habit);
                                }
                              }}
                              className={`p-1.5 rounded-lg transition-all ${theme === 'dark' ? 'hover:bg-slate-700 hover:text-blue-400 text-slate-400' : 'hover:bg-slate-200 hover:text-blue-600 text-slate-500'}`}
                              title={editingHabitName === habit ? "Save Habit Name" : "Edit Habit Name"}
                            >
                              {editingHabitName === habit ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><polyline points="20 6 9 17 4 12" /></svg>
                              ) : (
                                <EditIcon />
                              )}
                            </button>

                            {/* ARCHIVE / RESTORE BUTTON */}
                            <button
                              onClick={() => toggleArchiveHabit(habit)}
                              className={`p-1.5 rounded-lg transition-all ${archivedHabits.includes(habit)
                                ? 'text-emerald-500 hover:bg-emerald-500/10'
                                : (theme === 'dark' ? 'hover:bg-slate-700 hover:text-amber-400 text-slate-400' : 'hover:bg-slate-200 hover:text-amber-600 text-slate-500')
                                }`}
                              title={archivedHabits.includes(habit) ? 'Restore Habit' : 'Archive Habit'}
                            >
                              <ArchiveIcon />
                            </button>

                            {/* DELETE BUTTON */}
                            <button
                              onClick={() => { setHabitToDelete(habit); setShowDeleteConfirm(true); }}
                              className={`p-1.5 rounded-lg transition-all ${theme === 'dark' ? 'hover:bg-slate-700 hover:text-rose-400 text-slate-400' : 'hover:bg-slate-200 hover:text-rose-600 text-slate-500'}`}
                              title="Delete Habit"
                            >
                              <TrashIcon />
                            </button>

                            <div className={`w-px h-4 mx-1 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'}`} />

                            {/* UP BUTTON */}
                            <button
                              onClick={() => {
                                if (isSearching || index === 0) return;
                                const newHabits = [...habits];
                                [newHabits[index - 1], newHabits[index]] = [newHabits[index], newHabits[index - 1]];
                                setHabits(newHabits);
                                save(trackerData, newHabits, habitConfigs);
                              }}
                              disabled={isSearching || index === 0}
                              title="Move habit up"
                              className={`p-1.5 rounded-lg transition-all ${(isSearching || index === 0) ? 'opacity-30 cursor-not-allowed' : (theme === 'dark' ? 'hover:bg-slate-700 hover:text-emerald-400' : 'hover:bg-slate-200 hover:text-emerald-600')} ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
                            >
                              <ChevronUpIcon />
                            </button>

                            {/* DOWN BUTTON */}
                            <button
                              onClick={() => {
                                if (isSearching || index === habits.length - 1) return;
                                const newHabits = [...habits];
                                [newHabits[index + 1], newHabits[index]] = [newHabits[index], newHabits[index + 1]];
                                setHabits(newHabits);
                                save(trackerData, newHabits, habitConfigs);
                              }}
                              disabled={isSearching || index === habits.length - 1}
                              title="Move habit down"
                              className={`p-1.5 rounded-lg transition-all ${(isSearching || index === habits.length - 1) ? 'opacity-30 cursor-not-allowed' : (theme === 'dark' ? 'hover:bg-slate-700 hover:text-emerald-400' : 'hover:bg-slate-200 hover:text-emerald-600')} ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
                            >
                              <ChevronDownIcon />
                            </button>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="flex gap-2 mb-4 shrink-0">
                    <input
                      type="text"
                      placeholder="New category..."
                      value={newCatInput}
                      onChange={(e) => {
                        setNewCatInput(e.target.value);
                        if (catInputError) setCatInputError('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleManualAddCategory()}
                      className={`flex-1 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none border-2 transition-all ${catInputError ? 'border-rose-500/70 focus:border-rose-500' :
                        theme === 'dark' ? 'bg-slate-800 border-slate-700 focus:border-emerald-500 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 focus:border-emerald-500 text-slate-800'
                        }`}
                    />
                    <button
                      onClick={handleManualAddCategory}
                      disabled={!newCatInput.trim()}
                      title="Add new category"
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <PlusIcon />
                    </button>
                  </div>
                  {catInputError && (
                    <p className="text-[11px] font-bold text-rose-500 mb-3 px-1 flex items-center gap-1.5 shrink-0">
                      <span>⚠️</span>
                      <span>{catInputError}</span>
                    </p>
                  )}

                  <div className="flex items-center justify-between px-1 mb-2.5 shrink-0">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${getTextMuted()}`}>
                      {categories.length} {categories.length === 1 ? 'Category' : 'Categories'}
                    </span>
                    <span className={`text-[10px] font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                      {activeHabitsList.length} active {activeHabitsList.length === 1 ? 'habit' : 'habits'} total
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
                    {categories.map((cat, index) => {
                      const pct = categoryProgress[cat] || 0;
                      const count = categoryCounts[cat] ?? 0;
                      const isCurrentFilter = selectedCategory === cat;

                      return (
                        <div
                          key={cat}
                          className={`relative overflow-hidden p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${isCurrentFilter
                            ? (theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-emerald-50/70 border-emerald-300')
                            : (theme === 'dark' ? 'bg-slate-800/45 border-slate-700/80 hover:border-slate-600' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
                            }`}
                        >
                          <div
                            onClick={() => {
                              if (editingCat?.name === cat) return;
                              selectDashboardCategory(cat);
                              setShowManageModal(false);
                            }}
                            title={editingCat?.name === cat ? undefined : `Filter dashboard by ${cat}`}
                            className={`flex-1 min-w-0 ${editingCat?.name === cat ? '' : 'cursor-pointer'}`}
                          >
                            {editingCat?.name === cat ? (
                              <input
                                autoFocus
                                type="text"
                                value={editingCat.temp}
                                onChange={(e) => setEditingCat({ ...editingCat, temp: e.target.value })}
                                onBlur={() => handleCategoryRename(cat, editingCat.temp)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleCategoryRename(cat, editingCat.temp);
                                  if (e.key === 'Escape') setEditingCat(null);
                                }}
                                className={`w-full bg-transparent font-black uppercase text-xs tracking-wider focus:outline-none border-b border-emerald-500 pb-0.5 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}
                              />
                            ) : (
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className={`w-2 h-2 rounded-full shrink-0 ${isCurrentFilter
                                    ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.75)]'
                                    : (pct > 0 ? 'bg-emerald-500/60' : (theme === 'dark' ? 'bg-slate-600' : 'bg-slate-300'))
                                    }`}
                                />
                                <span className={`text-xs font-black uppercase tracking-wider truncate ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
                                  {cat}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold tabular-nums shrink-0 ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600 border border-slate-200'}`}>
                                  {count} {count === 1 ? 'habit' : 'habits'}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-2">
                              <div className={`flex-1 max-w-[140px] h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}>
                                <div
                                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className={`text-[10px] font-black tabular-nums ${pct > 0 ? 'text-emerald-500' : (theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}`}>
                                {pct}%
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {cat === 'all' ? (
                              <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${theme === 'dark' ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-white text-slate-500 border border-slate-200'}`}>
                                Default
                              </span>
                            ) : (
                            <>
                              <button
                                onClick={() => moveCategoryUp(index)}
                                disabled={index === 1}
                                title="Move category up"
                                className={`p-1.5 rounded-lg transition-all ${index === 1 ? 'opacity-30 cursor-not-allowed' : (theme === 'dark' ? 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50')}`}
                              >
                                <ArrowUpIcon />
                              </button>
                              <button
                                onClick={() => moveCategoryDown(index)}
                                disabled={index === categories.length - 1}
                                title="Move category down"
                                className={`p-1.5 rounded-lg transition-all ${index === categories.length - 1 ? 'opacity-30 cursor-not-allowed' : (theme === 'dark' ? 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50')}`}
                              >
                                <ArrowDownIcon />
                              </button>
                              <button
                                onClick={() => setEditingCat({ name: cat, temp: cat })}
                                title="Edit category name"
                                className={`p-1.5 rounded-lg transition-all ${theme === 'dark' ? 'text-slate-400 hover:text-blue-400 hover:bg-blue-500/10' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`}
                              >
                                <EditIcon />
                              </button>
                              <button
                                onClick={() => deleteCategory(cat)}
                                title="Delete category"
                                className={`p-1.5 rounded-lg transition-all ${theme === 'dark' ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10' : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'}`}
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
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* --- QUICK ADD HABIT MODAL --- */}
        {showQuickAddHabitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[320] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
            onClick={() => setShowQuickAddHabitModal(false)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 16 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-[2rem] w-full max-w-md p-6 md:p-7 shadow-2xl relative`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowQuickAddHabitModal(false)}
                className={`absolute top-5 right-5 flex flex-col items-center gap-0.5 p-2 ${getTextMuted()} hover:text-rose-500 transition-all`}
                title="Close (ESC)"
              >
                <XIcon />
                <span className="text-[6px] font-mono opacity-50">ESC</span>
              </button>

              <div className="mb-5 pr-8">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Quick Create</p>
                <h3 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                  New Habit
                </h3>
              </div>

              {/* 1. Habit Name */}
              <div className="mb-4">
                <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${getTextMuted()}`}>
                  Habit Name
                </label>
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. Morning Run, Read 20 Pages..."
                  value={quickHabitDraft.name}
                  onChange={(e) => {
                    setQuickHabitDraft((prev) => ({ ...prev, name: e.target.value }));
                    if (quickHabitError) setQuickHabitError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (
                        createHabitInCategory(
                          quickHabitDraft.name,
                          quickHabitDraft.category,
                          setQuickHabitError,
                          { steps: quickHabitDraft.steps, priority: quickHabitDraft.priority }
                        )
                      ) {
                        setShowQuickAddHabitModal(false);
                      }
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-bold focus:outline-none border-2 transition-all ${quickHabitError
                    ? 'border-rose-500/70 focus:border-rose-500'
                    : (theme === 'dark'
                      ? 'bg-slate-800/80 border-slate-700 focus:border-emerald-500 text-white placeholder:text-slate-500'
                      : 'bg-slate-50 border-slate-200 focus:border-emerald-500 text-slate-800 placeholder:text-slate-400')
                    }`}
                />
                {quickHabitError && (
                  <p className="text-[11px] font-bold text-rose-500 mt-1.5 px-1">
                    {quickHabitError}
                  </p>
                )}
              </div>

              {/* 2. Category Selector Pills */}
              <div className="mb-4">
                <label className={`block text-[10px] font-black uppercase tracking-wider mb-2 ${getTextMuted()}`}>
                  Category
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {categories.map((cat) => {
                    const isPicked = quickHabitDraft.category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setQuickHabitDraft((prev) => ({ ...prev, category: cat }))}
                        className={`h-7 px-2.5 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all ${isPicked
                          ? (theme === 'dark'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-emerald-50 border-emerald-500 text-emerald-700')
                          : (theme === 'dark'
                            ? 'bg-slate-800/70 border-slate-700/80 text-slate-400 hover:text-white hover:border-slate-500'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300')
                          }`}
                      >
                        {cat === 'all' ? 'General (All)' : cat}
                      </button>
                    );
                  })}

                  {isAddingModalCat ? (
                    <div className={`h-7 flex items-center gap-1 px-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-800 border-emerald-500' : 'bg-white border-emerald-500'}`}>
                      <input
                        autoFocus
                        type="text"
                        value={modalNewCatInput}
                        onChange={(e) => setModalNewCatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const created = createCategoryByName(modalNewCatInput, setQuickHabitError);
                            if (created) {
                              setQuickHabitDraft((prev) => ({ ...prev, category: created }));
                              setModalNewCatInput('');
                              setIsAddingModalCat(false);
                              setQuickHabitError('');
                            }
                          } else if (e.key === 'Escape') {
                            e.stopPropagation();
                            setIsAddingModalCat(false);
                            setModalNewCatInput('');
                          }
                        }}
                        placeholder="Category..."
                        className={`w-24 bg-transparent text-[10px] font-black uppercase focus:outline-none ${theme === 'dark' ? 'text-white placeholder:text-slate-500' : 'text-slate-800 placeholder:text-slate-400'}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const created = createCategoryByName(modalNewCatInput, setQuickHabitError);
                          if (created) {
                            setQuickHabitDraft((prev) => ({ ...prev, category: created }));
                            setModalNewCatInput('');
                            setIsAddingModalCat(false);
                            setQuickHabitError('');
                          }
                        }}
                        className="text-[10px] font-black uppercase text-emerald-500 hover:text-emerald-400"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingModalCat(true)}
                      className={`h-7 px-2.5 rounded-lg border border-dashed text-[10px] font-black uppercase tracking-wider transition-all inline-flex items-center gap-1 ${theme === 'dark'
                        ? 'border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/60'
                        : 'border-slate-300 text-slate-500 hover:text-emerald-600 hover:border-emerald-400'
                        }`}
                    >
                      <span>+</span>
                      <span>New</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Optional Goal Steps & Priority */}
              <div className={`space-y-3.5 p-3.5 rounded-2xl border mb-5 ${theme === 'dark' ? 'bg-slate-800/35 border-slate-800' : 'bg-slate-50/80 border-slate-200/80'}`}>
                {/* Daily Goal Steps Row */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <label className={`text-[10px] font-black uppercase tracking-wider ${getTextMuted()}`}>
                      Daily Goal Steps
                    </label>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${quickHabitDraft.steps > 1
                      ? (theme === 'dark' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                      : (theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-500 border border-slate-200')
                      }`}>
                      {quickHabitDraft.steps === 1 ? 'Single Check' : `${quickHabitDraft.steps} Steps / Day`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    {/* Preset Step Pills */}
                    <div className={`flex items-center gap-1 p-1 rounded-xl border flex-1 ${theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
                      {[1, 2, 3, 5, 8].map((n) => {
                        const active = quickHabitDraft.steps === n;
                        return (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setQuickHabitDraft((prev) => ({ ...prev, steps: n }))}
                            className={`flex-1 h-7 rounded-lg text-[10px] font-black transition-all ${active
                              ? 'bg-emerald-500 text-slate-950 shadow-xs'
                              : (theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-800/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
                              }`}
                          >
                            {n === 1 ? '1×' : n}
                          </button>
                        );
                      })}
                    </div>

                    {/* Clean Custom Stepper (- | input | +) */}
                    <div className={`inline-flex items-center h-9 rounded-xl border overflow-hidden shrink-0 ${theme === 'dark' ? 'bg-slate-900/80 border-slate-700/80' : 'bg-white border-slate-200'}`}>
                      <button
                        type="button"
                        onClick={() => setQuickHabitDraft((prev) => ({ ...prev, steps: Math.max(1, prev.steps - 1) }))}
                        disabled={quickHabitDraft.steps <= 1}
                        title="Decrease steps"
                        className={`w-7 h-full flex items-center justify-center text-xs font-black transition-colors disabled:opacity-30 ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={quickHabitDraft.steps}
                        onChange={(e) => setQuickHabitDraft((prev) => ({ ...prev, steps: Math.max(1, Math.min(99, parseInt(e.target.value) || 1)) }))}
                        title="Custom goal steps"
                        className={`w-9 h-full text-center text-xs font-black tabular-nums bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setQuickHabitDraft((prev) => ({ ...prev, steps: Math.min(99, prev.steps + 1) }))}
                        disabled={quickHabitDraft.steps >= 99}
                        title="Increase steps"
                        className={`w-7 h-full flex items-center justify-center text-xs font-black transition-colors disabled:opacity-30 ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Priority Multiplier Row */}
                <div className={`pt-3 border-t ${theme === 'dark' ? 'border-slate-800/80' : 'border-slate-200/70'}`}>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <label className={`text-[10px] font-black uppercase tracking-wider ${getTextMuted()}`}>
                      Priority Multiplier
                    </label>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${quickHabitDraft.priority > 1
                      ? (theme === 'dark' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                      : (theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-500 border border-slate-200')
                      }`}>
                      {quickHabitDraft.priority * 10} XP / day
                    </span>
                  </div>

                  <div className={`flex items-center gap-1 p-1 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
                    {[1, 2, 3, 5, 10].map((p) => {
                      const active = quickHabitDraft.priority === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setQuickHabitDraft((prev) => ({ ...prev, priority: p }))}
                          className={`flex-1 h-7 rounded-lg text-[10px] font-black transition-all ${active
                            ? 'bg-emerald-500 text-slate-950 shadow-xs'
                            : (theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-800/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
                            }`}
                        >
                          {p}x
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickAddHabitModal(false)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all ${theme === 'dark' ? 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!quickHabitDraft.name.trim()}
                  onClick={() => {
                    if (
                      createHabitInCategory(
                        quickHabitDraft.name,
                        quickHabitDraft.category,
                        setQuickHabitError,
                        { steps: quickHabitDraft.steps, priority: quickHabitDraft.priority }
                      )
                    ) {
                      setShowQuickAddHabitModal(false);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-45 disabled:hover:bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20"
                >
                  Create Habit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* --- ARCHIVE & 30-DAY TRASH MODAL --- */}
        {showArchiveModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[350] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={() => setShowArchiveModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl relative flex flex-col max-h-[85vh]`} onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowArchiveModal(false)} title="Close (ESC)" className={`absolute top-6 right-6 p-2 ${getTextMuted()} hover:text-rose-500 transition-all`}><XIcon /></button>

              <div className="mb-4 shrink-0">
                <p className={`text-[10px] font-black ${getTextMuted()} uppercase tracking-[0.2em] mb-1`}>
                  {archiveModalTab === 'trash' ? `${TRASH_RETENTION_DAYS}-Day Recovery Bin` : 'Hidden Habits'}
                </p>
                <h3 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                  {archiveModalTab === 'trash' ? 'Trash' : 'Archived List'}
                </h3>
              </div>

              {/* Segmented Tab Bar: Archived | Trash */}
              <div className={`flex p-1 rounded-2xl border mb-4 shrink-0 ${theme === 'dark' ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setArchiveModalTab('archive')}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${archiveModalTab === 'archive'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : (theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800')
                    }`}
                >
                  Archived ({archivedHabits.length})
                </button>
                <button
                  type="button"
                  onClick={() => setArchiveModalTab('trash')}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${archiveModalTab === 'trash'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : (theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800')
                    }`}
                >
                  Trash ({activeTrashedHabits.length})
                </button>
              </div>

              {archiveModalTab === 'archive' ? (
                <>
                  <TutorialTipCard
                    isVisible={!dismissedTips.archive}
                    isSnapping={!!snappingTips.archive}
                    onDismiss={() => triggerTipSnap('archive')}
                    onSnapDone={() => finishTipSnap('archive')}
                    theme={theme}
                    accent="amber"
                    icon={<ArchiveIcon className="w-4 h-4" />}
                    eyebrow="Archive Guide"
                    title="Paused Without Losing History"
                    description="Archived habits keep all XP and past logs safe. Restoring one resumes tracking from today while keeping its paused days excluded from the heatmap."
                    marginBottom="0.75rem"
                  />

                  <div className="overflow-y-auto custom-scrollbar pr-2 space-y-3">
                    {archivedHabits.length > 0 ? (
                      archivedHabits.map(habit => (
                        <div key={habit} className={`p-4 rounded-2xl border flex items-center justify-between gap-2 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                          <span className={`text-sm font-black truncate ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{habit}</span>
                          <button
                            onClick={() => toggleArchiveHabit(habit)}
                            title="Unarchive habit"
                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0 ${theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-200'}`}
                          >
                            Restore
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 opacity-30 flex flex-col items-center">
                        <div className="scale-150 mb-4 grayscale opacity-50"><TrophyIcon /></div>
                        <p className="font-black uppercase text-xs">No archived habits</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className={`mb-3 p-3 rounded-2xl border text-[11px] font-medium leading-relaxed shrink-0 ${theme === 'dark' ? 'bg-rose-500/10 border-rose-500/20 text-rose-200/80' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    Deleted habits and all their saved records stay in Trash for <strong>{TRASH_RETENTION_DAYS} days</strong> before automatic permanent deletion. You cannot permanently delete items early.
                  </div>

                  <div className="overflow-y-auto custom-scrollbar pr-2 space-y-3">
                    {activeTrashedHabits.length > 0 ? (
                      activeTrashedHabits.map((entry) => {
                        const expiresAt = (Number(entry.deletedAt) || Date.now()) + TRASH_RETENTION_MS;
                        const msLeft = Math.max(0, expiresAt - Date.now());
                        const daysLeft = Math.max(1, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
                        const recordCount = entry.records ? Object.keys(entry.records).length : 0;

                        return (
                          <div key={`${entry.name}-${entry.deletedAt}`} className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="min-w-0 flex-1">
                              <div className={`text-sm font-black truncate ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                                {entry.name}
                              </div>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className={`text-[10px] font-bold ${theme === 'dark' ? 'text-rose-400' : 'text-rose-600'}`}>
                                  {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                                </span>
                                <span className={`text-[10px] font-semibold ${getTextMuted()}`}>
                                  · {recordCount} {recordCount === 1 ? 'record' : 'records'}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => restoreHabitFromTrash(entry.name)}
                              title={`Undo delete for "${entry.name}" and restore all records`}
                              className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0 ${theme === 'dark'
                                ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/30'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-200'
                                }`}
                            >
                              Undo Delete
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 opacity-40 flex flex-col items-center">
                        <div className="scale-125 mb-3"><TrashIcon /></div>
                        <p className="font-black uppercase text-xs">Trash is empty</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}


        {/* --- LEVEL UP MODAL --- */}
        {showLevelUpModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[400] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4" onClick={() => setShowLevelUpModal(false)}>
            <motion.div
              initial={{ scale: 0.5, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="relative w-full max-w-sm bg-slate-900 border-2 border-emerald-500/50 rounded-[3rem] p-10 text-center overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.4)]"
              onClick={e => e.stopPropagation()}
            >
              {/* Radial Burst Background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-slate-900/50 to-slate-900 z-0 animate-pulse"></div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce">
                  {/* Big Custom Trophy Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
                </div>

                <h2 className="text-4xl font-black text-white italic tracking-tighter mb-2 drop-shadow-md">
                  LEVEL UP!
                </h2>

                <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 to-emerald-600 mb-4 filter drop-shadow-[0_4px_0_rgba(6,78,59,0.5)]">
                  {xpStats.level}
                </div>

                <p className="text-emerald-400 font-black uppercase tracking-[0.3em] text-xs mb-8">
                  Keep Crushing It
                </p>

                <button
                  onClick={() => setShowLevelUpModal(false)}
                  className="w-full py-4 rounded-2xl bg-white text-emerald-600 font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* --- LEVEL DETAILS MODAL --- */}
        {showLevelDetailsModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setShowLevelDetailsModal(false)}>
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border rounded-[2rem] w-full max-w-sm p-8 shadow-2xl relative overflow-hidden`}
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowLevelDetailsModal(false)} title="Close (ESC)" className={`absolute top-6 right-6 p-2 ${getTextMuted()} hover:text-rose-500 transition-all`}><XIcon /></button>

              <div className="mb-6 shrink-0">
                <p className={`text-[10px] font-black ${getTextMuted()} uppercase tracking-[0.2em] mb-1`}>Mastery Engine</p>
                <h3 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Level Details</h3>
              </div>

              <TutorialTipCard
                isVisible={!dismissedTips.level}
                isSnapping={!!snappingTips.level}
                onDismiss={() => triggerTipSnap('level')}
                onSnapDone={() => finishTipSnap('level')}
                theme={theme}
                accent="emerald"
                icon={<TrophyIcon className="w-4 h-4" />}
                eyebrow="XP Guide"
                title="How Levels & XP Work"
                description="Every completed habit grants 10 × Priority (1x–10x) XP. Each new level you reach also awards +1 Streak Shield."
                marginBottom="1.25rem"
              />

              <div className="flex flex-col items-center mb-8">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 border-4 shadow-xl ${getLevelBadgeStyle(xpStats.level)}`}>
                  <span className="text-4xl font-black">{xpStats.level}</span>
                </div>
                <p className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Total XP: <span className={theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}>{xpStats.totalXP}</span>
                </p>
              </div>

              <div className="space-y-3 p-5 rounded-2xl border bg-slate-50/5 dark:bg-slate-800/30 dark:border-slate-700/50 border-slate-200/50">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className={getTextMuted()}>Current Progress</span>
                  <span className={theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}>{xpStats.progressXP} / {xpStats.requiredXP} XP</span>
                </div>
                <div className={`h-4 w-full rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-300'}`}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${xpStats.progressPct}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-gradient-to-r from-emerald-600 to-blue-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
                <p className={`text-[9px] text-center font-bold ${getTextMuted()} pt-1`}>
                  Earn {xpStats.requiredXP - xpStats.progressXP} more XP to reach Level {xpStats.level + 1}
                </p>
              </div>

              {/* Timeline Roadmap */}
              <div className="mt-8 flex flex-col gap-5 relative px-2">
                {/* The vertical line */}
                <div className="absolute left-[17px] top-2 bottom-2 w-[2px] bg-slate-200 dark:bg-slate-700/50" />

                {[Math.max(1, xpStats.level - 1), Math.max(1, xpStats.level - 1) + 1, Math.max(1, xpStats.level - 1) + 2, Math.max(1, xpStats.level - 1) + 3].map((l) => {
                  const isPast = l < xpStats.level;
                  const isCurrent = l === xpStats.level;
                  const targetXP = Math.pow(l - 1, 2) * 100;

                  return (
                    <div key={l} className={`relative flex items-center gap-5 ${isPast ? 'opacity-50' : ''}`}>
                      <div className={`w-5 h-5 rounded-full border-2 z-10 shrink-0 ${isPast ? 'bg-emerald-500 border-emerald-500' :
                        isCurrent ? 'bg-white dark:bg-slate-900 border-emerald-500 ring-4 ring-emerald-500/20' :
                          'bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-600'
                        } flex items-center justify-center transition-all`}>
                        {isPast && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                        {isCurrent && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                      </div>

                      <div className="flex-1 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className={`text-[11px] font-black uppercase tracking-widest ${isCurrent ? (theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600') : (theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}`}>
                            Level {l}
                          </span>
                          {isCurrent && <span className={`text-[8px] font-bold ${getTextMuted()} uppercase tracking-widest mt-0.5`}>Current Rank</span>}
                        </div>
                        <span className={`text-[10px] font-black ${isCurrent ? (theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600') : (theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}`}>
                          {targetXP} XP
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* --- TROPHY DETAILS MODAL --- */}
        {showTrophyDetailsModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setShowTrophyDetailsModal(false)}>
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border rounded-[2rem] w-full max-w-sm p-8 shadow-2xl relative overflow-hidden`}
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowTrophyDetailsModal(false)} title="Close (ESC)" className={`absolute top-6 right-6 p-2 ${getTextMuted()} hover:text-rose-500 transition-all`}><XIcon /></button>

              <div className="mb-8 shrink-0">
                <p className={`text-[10px] font-black ${getTextMuted()} uppercase tracking-[0.2em] mb-1`}>Monthly Activity</p>
                <h3 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Win Milestones</h3>
              </div>

              {/* Win Milestones Tutorial */}
              <TutorialTipCard
                isVisible={!dismissedTips.milestones}
                isSnapping={!!snappingTips.milestones}
                onDismiss={() => triggerTipSnap('milestones')}
                onSnapDone={() => finishTipSnap('milestones')}
                theme={theme}
                accent="amber"
                icon={<TrophyIcon className="w-4 h-4" />}
                eyebrow="Milestones Guide"
                title="Monthly Habit Wins"
                description="Every 100%-completed habit this month adds +1 win toward targets from 5 up to 1,000."
                marginBottom="1rem"
              />

              <div className="flex flex-col items-center mb-8">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 border-4 shadow-xl bg-yellow-500/10 border-yellow-500/40 text-yellow-500`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
                </div>
                <p className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Completed: <span className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}>{analytics.totalDone}</span>
                </p>
              </div>

              {(() => {
                const milestones = [5, 10, 25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 750, 1000];
                let nextIdx = milestones.findIndex(m => analytics.totalDone < m);
                if (nextIdx === -1) nextIdx = milestones.length - 1;

                const nextTarget = milestones[nextIdx];
                const prevTarget = nextIdx > 0 ? milestones[nextIdx - 1] : 0;

                const progressXP = analytics.totalDone - prevTarget;
                const requiredXP = nextTarget - prevTarget;
                const progressPct = requiredXP > 0 ? Math.min(100, Math.max(0, Math.round((progressXP / requiredXP) * 100))) : 100;

                const displayNodes = [];
                if (nextIdx > 0) displayNodes.push({ label: `Milestone ${nextIdx}`, value: milestones[nextIdx - 1], state: 'past' });
                displayNodes.push({ label: `Milestone ${nextIdx + 1}`, value: milestones[nextIdx], state: 'current' });
                if (nextIdx + 1 < milestones.length) displayNodes.push({ label: `Milestone ${nextIdx + 2}`, value: milestones[nextIdx + 1], state: 'future' });
                if (nextIdx + 2 < milestones.length) displayNodes.push({ label: `Milestone ${nextIdx + 3}`, value: milestones[nextIdx + 2], state: 'future' });

                return (
                  <>
                    <div className="space-y-3 p-5 rounded-2xl border bg-slate-50/5 dark:bg-slate-800/30 dark:border-slate-700/50 border-slate-200/50">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className={getTextMuted()}>Current Target</span>
                        <span className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}>{analytics.totalDone} / {nextTarget}</span>
                      </div>
                      <div className={`h-4 w-full rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-300'}`}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                      </div>
                      <p className={`text-[9px] text-center font-bold ${getTextMuted()} pt-1`}>
                        Log {nextTarget - analytics.totalDone} more habits to hit Milestone {nextIdx + 1}
                      </p>
                    </div>

                    {/* Timeline Roadmap */}
                    <div className="mt-8 flex flex-col gap-5 relative px-2">
                      <div className="absolute left-[17px] top-2 bottom-2 w-[2px] bg-slate-200 dark:bg-slate-700/50" />

                      {displayNodes.map((node, i) => (
                        <div key={i} className={`relative flex items-center gap-5 ${node.state === 'past' ? 'opacity-50' : ''}`}>
                          <div className={`w-5 h-5 rounded-full border-2 z-10 shrink-0 ${node.state === 'past' ? 'bg-yellow-500 border-yellow-500' :
                            node.state === 'current' ? 'bg-white dark:bg-slate-900 border-yellow-500 ring-4 ring-yellow-500/20' :
                              'bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-600'
                            } flex items-center justify-center transition-all`}>
                            {node.state === 'past' && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                            {node.state === 'current' && <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />}
                          </div>

                          <div className="flex-1 flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className={`text-[11px] font-black uppercase tracking-widest ${node.state === 'current' ? (theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600') : (theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}`}>
                                {node.label}
                              </span>
                              {node.state === 'current' && <span className={`text-[8px] font-bold ${getTextMuted()} uppercase tracking-widest mt-0.5`}>Current Goal</span>}
                            </div>
                            <span className={`text-[10px] font-black ${node.state === 'current' ? (theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600') : (theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}`}>
                              {node.value} WINS
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}

        {/* --- HELP GUIDE MODAL --- */}
        <HelpGuideModal
          isOpen={showHelpModal}
          onClose={() => setShowHelpModal(false)}
          theme={theme}
          onResetTutorials={resetAllTutorials}
        />

        {/* --- TEXT SIZE MODAL --- */}
        {showTextSizeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setShowTextSizeModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border rounded-[2rem] w-full max-w-sm p-6 shadow-2xl overflow-hidden`} onClick={e => e.stopPropagation()}>

              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}><TextSizeIcon /></div>
                  <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Adjust Sizes</h3>
                </div>
                <button onClick={() => setShowTextSizeModal(false)} title="Close (ESC)" className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}><XIcon /></button>
              </div>

              <TutorialTipCard
                isVisible={!dismissedTips.sizes}
                isSnapping={!!snappingTips.sizes}
                onDismiss={() => triggerTipSnap('sizes')}
                onSnapDone={() => finishTipSnap('sizes')}
                theme={theme}
                accent="blue"
                icon={<TextSizeIcon />}
                eyebrow="Layout Guide"
                title="Resize & Mobile View"
                description="Tune habit circle size and table text sizes, toggle Mobile View On/Off for compact spacing, or Restore Defaults anytime."
                marginBottom="1.25rem"
              />

              <div className="space-y-6">
                {/* Habit Card Size */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Habit Card Size</label>
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">{textSizes.tabSize || 110}px</span>
                  </div>
                  <input type="range" min="75" max="200" step="5" value={textSizes.tabSize || 110} onChange={(e) => updateTextSize('tabSize', e.target.value)} className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>

                {/* Habit Tab Size */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Habit Text (Max Auto-Fit)</label>
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">{textSizes.habit}px</span>
                  </div>
                  <input type="range" min="8" max="24" step="1" value={textSizes.habit} onChange={(e) => updateTextSize('habit', e.target.value)} className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>

                {/* Table 1 (Vertical) Size */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Table 1 Text (Vertical)</label>
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">{textSizes.table1}px</span>
                  </div>
                  <input type="range" min="8" max="24" step="1" value={textSizes.table1} onChange={(e) => updateTextSize('table1', e.target.value)} className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>

                {/* Table 2 (Horizontal) Size */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Table 2 Text (Horizontal)</label>
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">{textSizes.table2}px</span>
                  </div>
                  <input type="range" min="6" max="20" step="1" value={textSizes.table2} onChange={(e) => updateTextSize('table2', e.target.value)} className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>
              </div>

              {/* Mobile View & Restore Defaults */}
              <div className={`mt-8 pt-6 border-t grid grid-cols-2 gap-2.5 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                <button
                  onClick={toggleMobileMode}
                  title="Toggle Mobile Compatibility Mode"
                  className={`py-3 px-2 rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95 ${
                    isMobileMode
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                      : (theme === 'dark'
                        ? 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800')
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                  <span>{isMobileMode ? 'Mobile View On' : 'Mobile View Off'}</span>
                </button>
                <button
                  onClick={() => {
                    const defaults = { habit: 14, table1: 12, table2: 11, tabSize: 110 };
                    setTextSizes(defaults); // setTextSizes already calls savePartialToIDB which persists to IDB + Firebase
                  }}
                  title="Reset text sizes to default"
                  className={`py-3 px-2 rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${theme === 'dark' ? 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
                >
                  <RefreshIcon /> <span>Restore Defaults</span>
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}

        {editingNoteDate && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setEditingNoteDate(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl`} onClick={e => e.stopPropagation()}>
              <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-2`}>Daily Reflection</h3>
              <textarea className={`w-full h-40 p-4 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'} rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm`} placeholder="Add notes here..." value={trackerData[editingNoteDate]?.note || ""} onChange={(e) => handleNoteChange(editingNoteDate, e.target.value)} />
              <button onClick={() => setEditingNoteDate(null)} title="Save Reflection" className={`w-full mt-4 ${theme === 'dark' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-900 hover:bg-slate-800'} text-white p-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl`}>Save Reflection</button>
            </motion.div>
          </div>
        )}
        {/* Category Delete Confirmation Modal */}
        {categoryToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
            onClick={() => setCategoryToDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border p-8 rounded-[2rem] max-w-sm w-full shadow-2xl text-center`}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🗑️</span>
              </div>
              <h4 className={`text-xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Delete Category?</h4>
              <p className={`text-sm mb-8 font-medium leading-relaxed ${getTextMuted()}`}>
                All habits in <span className="text-rose-400 font-black">"{categoryToDelete}"</span> will be moved to <span className="font-black">All</span>. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCategoryToDelete(null)}
                  className={`flex-1 py-3 rounded-2xl text-sm font-black uppercase tracking-wider transition-all border ${theme === 'dark' ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteCategory}
                  className="flex-1 py-3 rounded-2xl text-sm font-black uppercase tracking-wider bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/30"
                >
                  Delete
                </button>
              </div>
              <p className={`text-[8px] font-mono mt-4 opacity-30 ${getTextMuted()}`}>Press ESC to cancel</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 08/10 Session Expired Safe-Save Modal */}
      <AnimatePresence>
        {sessionExpiredModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`border rounded-3xl w-full max-w-md p-7 shadow-2xl relative ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-amber-500/10">
                🔒
              </div>
              <h3 className={`text-xl font-black text-center mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                Session Security Notice
              </h3>
              <p className={`text-xs text-center font-medium leading-relaxed mb-4 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                For security, sensitive account operations require a fresh sign-in.
              </p>
              <div className={`p-3.5 rounded-2xl border text-xs font-semibold mb-6 flex items-start gap-2.5 ${theme === 'dark' ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                <span className="text-base">🛡️</span>
                <span>
                  <strong>Your data is 100% safe!</strong> All habit logs, streaks, and reflections have been securely preserved in offline storage on this device.
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setSessionExpiredModal(false);
                    setShowAuthModal(true);
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20"
                >
                  Sign In &amp; Continue
                </button>
                <button
                  type="button"
                  onClick={() => setSessionExpiredModal(false)}
                  className={`w-full py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all ${theme === 'dark' ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  Stay in Offline Mode
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {(() => {
        const mustPrompt = !isHydrating && authInitialized && !isAuthenticated && !guestName;
        const modalOpen = mustPrompt || showWelcomeModal || showGuestPicker || showAuthModal;
        const modalInitialMode = showGuestPicker ? 'guest' : 'home';
        return (
          <NamePromptModal
            isOpen={modalOpen}
            initialMode={modalInitialMode}
            onClose={mustPrompt ? undefined : () => {
              setShowWelcomeModal(false);
              setShowGuestPicker(false);
              setShowAuthModal(false);
            }}
          />
        );
      })()}
    </div>
  );
}