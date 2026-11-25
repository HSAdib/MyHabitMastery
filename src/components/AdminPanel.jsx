import React, { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, doc, updateDoc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { Link, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useHabitStore } from '../store/useHabitStore';
import { SUPER_ADMIN_EMAIL } from './ProtectedAdminRoute';
import { findClosestSuggestion } from '../utils';

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
);
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
);
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
);
const CodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
);
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);

const computeProfileXP = (prof) => {
  let xp = Number(prof?.manualXPOffset) || 0;
  const userHabits = Array.isArray(prof?.habits) ? prof.habits : [];
  const userConfigs = prof?.habitConfigs || {};
  if (prof?.trackerData) {
    Object.keys(prof.trackerData).forEach((dateKey) => {
      const dayObj = prof.trackerData[dateKey] || {};
      userHabits.forEach((h) => {
        const raw = dayObj[h] ?? 0;
        const val = typeof raw === 'number' ? raw : (raw ? 100 : 0);
        const priority = userConfigs[h]?.priority || 1;
        xp += (val / 100) * 10 * priority;
      });
    });
  }
  return Math.round(xp);
};

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'xp' | 'profiles' | 'name'
  const [expandedUserId, setExpandedUserId] = useState(null);

  const navigate = useNavigate();
  const startImpersonation = useHabitStore((state) => state.startImpersonation);

  // Inline Name Editing
  const [editingUserId, setEditingUserId] = useState(null);
  const [tempName, setTempName] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // Boost / Offset Modal
  const [boostingUser, setBoostingUser] = useState(null);
  const [boostXP, setBoostXP] = useState(0);
  const [boostStreak, setBoostStreak] = useState(0);

  // JSON Editor Modal
  const [editingJsonUser, setEditingJsonUser] = useState(null);
  const [jsonText, setJsonText] = useState("");

  // Global Settings Modal
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [globalHabits, setGlobalHabits] = useState([]);
  const [globalConfigs, setGlobalConfigs] = useState({});
  const [globalCategories, setGlobalCategories] = useState([]);
  const [newHabitInput, setNewHabitInput] = useState("");
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [editingGlobalHabitIdx, setEditingGlobalHabitIdx] = useState(null);
  const [editingGlobalHabitName, setEditingGlobalHabitName] = useState("");
  const [editingGlobalHabitSteps, setEditingGlobalHabitSteps] = useState(1);
  const [editingGlobalHabitPriority, setEditingGlobalHabitPriority] = useState(1);
  const [editingGlobalHabitCategory, setEditingGlobalHabitCategory] = useState('all');

  useEffect(() => {
    if (!db) {
      setError('Firebase is not configured (running in local-only mode).');
      setLoading(false);
      return;
    }
    const usersCol = collection(db, 'users');
    const unsubscribe = onSnapshot(usersCol, (snapshot) => {
      const userList = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        const profilesMap = d.cloudProfiles && typeof d.cloudProfiles === 'object'
          ? d.cloudProfiles
          : { main: { id: 'main', name: d.displayName || d.guestName || 'Main Profile', isMain: true, ...d } };
        const profileList = Object.values(profilesMap);
        const totalUserXP = profileList.reduce((sum, p) => sum + computeProfileXP(p), 0);
        const mainXP = computeProfileXP(profilesMap.main || d);
        const level = Math.floor(Math.sqrt(mainXP / 100)) + 1;

        return {
          id: docSnap.id,
          ...d,
          _profilesList: profileList,
          _totalUserXP: totalUserXP,
          _mainXP: mainXP,
          _level: level,
        };
      });

      setUsers(userList);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching users:", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getDisplayName = (u) => {
    let name = u.displayName || u.guestName;
    if (name === "Guest User") name = "";
    return name || "Unnamed User";
  };

  const platformStats = useMemo(() => {
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 3600 * 1000;
    let totalProfiles = 0;
    let activeLast7d = 0;
    let platformXP = 0;

    users.forEach((u) => {
      totalProfiles += (u._profilesList?.length || 1);
      platformXP += (u._totalUserXP || 0);
      if (u.lastUpdated && (now - u.lastUpdated) <= sevenDaysMs) {
        activeLast7d++;
      }
    });

    return {
      totalUsers: users.length,
      totalProfiles,
      activeLast7d,
      platformXP,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = users.filter((u) => {
      if (!q) return true;
      const name = getDisplayName(u).toLowerCase();
      const uid = (u.id || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const profMatch = (u._profilesList || []).some(p => (p.name || '').toLowerCase().includes(q));
      return name.includes(q) || uid.includes(q) || email.includes(q) || profMatch;
    });

    list.sort((a, b) => {
      if (sortBy === 'xp') return (b._totalUserXP || 0) - (a._totalUserXP || 0);
      if (sortBy === 'profiles') return (b._profilesList?.length || 1) - (a._profilesList?.length || 1);
      if (sortBy === 'name') return getDisplayName(a).localeCompare(getDisplayName(b));
      return (b.lastUpdated || 0) - (a.lastUpdated || 0);
    });

    return list;
  }, [users, searchQuery, sortBy]);

  const userCandidates = useMemo(() => {
    return users.flatMap((u) => [
      u.displayName,
      u.guestName,
      u.email,
      ...(u._profilesList || []).map((p) => p.name)
    ]).filter(Boolean);
  }, [users]);

  const typoSuggestion = useMemo(() => {
    if (!searchQuery.trim() || filteredUsers.length > 0) return null;
    return findClosestSuggestion(searchQuery, userCandidates);
  }, [searchQuery, filteredUsers, userCandidates]);

  const handleUpdateName = async (userId) => {
    const trimmed = tempName.trim();
    if (!trimmed) return;
    setIsUpdatingName(true);
    try {
      const targetUser = users.find(u => u.id === userId);
      const updatedProfiles = targetUser?.cloudProfiles ? { ...targetUser.cloudProfiles } : null;
      if (updatedProfiles?.main) {
        updatedProfiles.main = {
          ...updatedProfiles.main,
          name: trimmed,
          updatedAt: Date.now(),
        };
      }
      await updateDoc(doc(db, "users", userId), {
        displayName: trimmed,
        guestName: trimmed,
        ...(updatedProfiles ? { cloudProfiles: updatedProfiles } : {}),
        lastUpdated: Date.now(),
      });
      setEditingUserId(null);
    } catch (err) {
      console.error("Error updating name:", err);
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleSaveBoost = async () => {
    if (!boostingUser) return;
    try {
      const xpVal = parseInt(boostXP, 10) || 0;
      const streakVal = parseInt(boostStreak, 10) || 0;
      const updatedProfiles = { ...(boostingUser.cloudProfiles || {}) };
      if (updatedProfiles.main) {
        updatedProfiles.main = {
          ...updatedProfiles.main,
          manualXPOffset: xpVal,
          manualStreakOffset: streakVal,
        };
      }
      await updateDoc(doc(db, "users", boostingUser.id), {
        manualXPOffset: xpVal,
        manualStreakOffset: streakVal,
        ...(Object.keys(updatedProfiles).length > 0 ? { cloudProfiles: updatedProfiles } : {}),
        lastUpdated: Date.now(),
      });
      setBoostingUser(null);
    } catch (err) {
      alert("Failed to update user offsets: " + err.message);
    }
  };

  const handleDeleteUserDoc = async (u) => {
    if (!window.confirm(`Permanently delete user "${getDisplayName(u)}" (${u.id}) and all their profiles from Firestore?`)) return;
    try {
      await deleteDoc(doc(db, "users", u.id));
    } catch (err) {
      alert("Failed to delete user document: " + err.message);
    }
  };

  const handleOpenJsonEditor = (user) => {
    const cleanCopy = { ...user };
    delete cleanCopy.id;
    delete cleanCopy._profilesList;
    delete cleanCopy._totalUserXP;
    delete cleanCopy._mainXP;
    delete cleanCopy._level;
    setEditingJsonUser(user);
    setJsonText(JSON.stringify(cleanCopy, null, 2));
  };

  const handleSaveJson = async () => {
    try {
      const parsedData = JSON.parse(jsonText);
      await setDoc(doc(db, "users", editingJsonUser.id), parsedData);
      setEditingJsonUser(null);
    } catch (err) {
      alert("Invalid JSON syntax. Please correct it and try again.\n\nError: " + err.message);
    }
  };

  const handleOpenGlobalSettings = async () => {
    setShowGlobalSettings(true);
    try {
      const docRef = doc(db, 'settings', 'globalDefaults');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setGlobalHabits(data.habits || []);
        setGlobalConfigs(data.habitConfigs || {});
        setGlobalCategories(data.categories || ["all", "health", "academic", "dev", "lifestyle"]);
      } else {
        setGlobalHabits(["sleep 7h", "calisthenics", "meditation", "dept study", "coding", "vocab", "audiobook"]);
        setGlobalConfigs({
          "sleep 7h": { steps: 1, priority: 1, category: 'health' },
          "calisthenics": { steps: 1, priority: 1, category: 'health' },
          "meditation": { steps: 1, priority: 1, category: 'lifestyle' },
          "dept study": { steps: 1, priority: 1, category: 'academic' },
          "coding": { steps: 1, priority: 1, category: 'dev' },
          "vocab": { steps: 15, priority: 1, category: 'academic' },
          "audiobook": { steps: 1, priority: 1, category: 'lifestyle' }
        });
        setGlobalCategories(["all", "health", "academic", "dev", "lifestyle"]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveGlobalSettings = async () => {
    try {
      await setDoc(doc(db, "settings", "globalDefaults"), {
        habits: globalHabits,
        habitConfigs: globalConfigs,
        categories: globalCategories
      });
      alert("Global defaults saved for all new public users!");
      setShowGlobalSettings(false);
    } catch (err) {
      alert("Failed to save global defaults. Error: " + err.message);
    }
  };

  const handleAddGlobalHabit = (e) => {
    e.preventDefault();
    const habitName = newHabitInput.trim();
    if (!habitName || globalHabits.includes(habitName)) return;
    setGlobalHabits([...globalHabits, habitName]);
    setGlobalConfigs({ ...globalConfigs, [habitName]: { steps: 1, priority: 1, category: 'all' } });
    setNewHabitInput("");
  };

  const handleRemoveGlobalHabit = (habitName) => {
    setGlobalHabits(globalHabits.filter((h) => h !== habitName));
    const newConfigs = { ...globalConfigs };
    delete newConfigs[habitName];
    setGlobalConfigs(newConfigs);
  };

  const handleEditGlobalHabitSave = (oldName, idx) => {
    const newName = editingGlobalHabitName.trim();
    if (!newName) {
      setEditingGlobalHabitIdx(null);
      return;
    }
    if (newName !== oldName && globalHabits.includes(newName)) {
      alert("A habit with this name already exists in global defaults.");
      return;
    }
    const newHabits = [...globalHabits];
    newHabits[idx] = newName;
    setGlobalHabits(newHabits);

    const newConfigs = { ...globalConfigs };
    const oldConfig = newConfigs[oldName] || {};
    if (newName !== oldName) delete newConfigs[oldName];

    newConfigs[newName] = {
      ...oldConfig,
      steps: Math.max(1, parseInt(editingGlobalHabitSteps, 10) || 1),
      priority: Math.min(10, Math.max(1, parseInt(editingGlobalHabitPriority, 10) || 1)),
      category: editingGlobalHabitCategory || 'all',
    };
    setGlobalConfigs(newConfigs);
    setEditingGlobalHabitIdx(null);
  };

  const handleDownloadFromModal = () => {
    if (!editingJsonUser) return;
    const blob = new Blob([jsonText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${getDisplayName(editingJsonUser)}_habit_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400 font-black text-lg uppercase tracking-widest">
        Loading Super Admin Command Center...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 sm:p-6 font-sans">
      <div className="max-w-6xl mx-auto">

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-5 border-b border-slate-800 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="bg-gradient-to-br from-purple-500 to-emerald-500 text-white p-3 rounded-2xl shadow-lg shadow-purple-500/20">
              <ShieldIcon/>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Super Admin Command Center
                </h1>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  {SUPER_ADMIN_EMAIL}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
                Multi-Profile User Management, Impersonation & Global Public Defaults
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleOpenGlobalSettings}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-black text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              <SettingsIcon/>
              <span>Global Defaults</span>
            </button>
            <Link className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs uppercase tracking-wider rounded-xl transition-all border border-slate-700" to="/">
              <BackIcon/>
              <span>Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Platform Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Registered Users</span>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">{platformStats.totalUsers}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Profiles (Main + Sub)</span>
            <p className="text-2xl sm:text-3xl font-black text-purple-400 mt-1">{platformStats.totalProfiles}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active (Last 7 Days)</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">{platformStats.activeLast7d}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Platform XP</span>
            <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">{platformStats.platformXP.toLocaleString()}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 font-bold text-sm">
            Failed to load users: {error}
          </div>
        )}

        {/* Users Directory Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-black text-base sm:text-lg text-white">
              Users & Multi-Profiles ({filteredUsers.length})
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user, UID, or profile name..."
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full sm:w-64"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-black uppercase text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="recent">Sort: Last Active</option>
                <option value="xp">Sort: Highest XP</option>
                <option value="profiles">Sort: Most Profiles</option>
                <option value="name">Sort: Name A–Z</option>
              </select>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {filteredUsers.map((user) => {
              const isEditing = editingUserId === user.id;
              const isExpanded = expandedUserId === user.id;
              const profList = user._profilesList || [];

              return (
                <div
                  key={user.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {isEditing ? (
                          <div className="flex items-center gap-1 bg-slate-900 rounded-lg border border-emerald-500/40 pr-1">
                            <input
                              type="text"
                              value={tempName}
                              onChange={(e) => setTempName(e.target.value)}
                              className="bg-transparent text-white font-black text-sm px-3 py-1.5 focus:outline-none w-48"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdateName(user.id);
                                if (e.key === 'Escape') setEditingUserId(null);
                              }}
                            />
                            <button
                              onClick={() => handleUpdateName(user.id)}
                              disabled={isUpdatingName}
                              className="p-1.5 rounded-md text-emerald-400 hover:bg-emerald-500/20"
                              title="Save"
                            >
                              <CheckIcon/>
                            </button>
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="p-1.5 rounded-md text-slate-400 hover:bg-slate-800"
                              title="Cancel"
                            >
                              <XIcon/>
                            </button>
                          </div>
                        ) : (
                          <span className="font-black text-base sm:text-lg text-white truncate">
                            {getDisplayName(user)}
                          </span>
                        )}

                        <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                          Lv.{user._level} • {user._totalUserXP} XP
                        </span>

                        <button
                          onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                          className="text-[11px] font-black text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer"
                        >
                          {profList.length} {profList.length === 1 ? 'Profile' : 'Profiles'} {isExpanded ? '▲' : '▼'}
                        </button>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono mt-0.5 flex-wrap">
                        <span>UID: {user.id}</span>
                        {user.email && <span>• {user.email}</span>}
                        {user.lastUpdated && (
                          <span>• Updated: {new Date(user.lastUpdated).toLocaleString()}</span>
                        )}
                      </div>
                    </div>

                    {/* User Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
                      <button
                        onClick={() => {
                          const currentName = user.displayName || user.guestName || "";
                          setTempName(currentName === "Guest User" ? "" : currentName);
                          setEditingUserId(user.id);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-bold text-xs border border-slate-800"
                        title="Rename User"
                      >
                        <EditIcon/>
                        <span>Rename</span>
                      </button>

                      <button
                        onClick={() => {
                          setBoostingUser(user);
                          setBoostXP(user.manualXPOffset || 0);
                          setBoostStreak(user.manualStreakOffset || 0);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-xl font-bold text-xs border border-amber-500/25"
                        title="Adjust XP or Streak Offset"
                      >
                        <span>⚡ Boost XP/Wins</span>
                      </button>

                      <button
                        onClick={() => {
                          startImpersonation(user, user.activeProfileId || 'main');
                          navigate('/');
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl font-bold text-xs border border-blue-500/25"
                        title="Impersonate User's Active Profile"
                      >
                        <EyeIcon/>
                        <span>Impersonate</span>
                      </button>

                      <button
                        onClick={() => handleOpenJsonEditor(user)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl font-bold text-xs border border-purple-500/25"
                        title="Edit Raw User JSON"
                      >
                        <CodeIcon/>
                        <span>JSON</span>
                      </button>

                      <button
                        onClick={() => handleDeleteUserDoc(user)}
                        className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/25"
                        title="Delete User Document"
                      >
                        <TrashIcon/>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Multi-Profiles Breakdown */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {profList.map((prof) => {
                        const pXP = computeProfileXP(prof);
                        const pHabitsCount = Array.isArray(prof.habits) ? prof.habits.length : 0;
                        const pDaysCount = prof.trackerData ? Object.keys(prof.trackerData).length : 0;
                        return (
                          <div
                            key={prof.id}
                            className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-white truncate">{prof.name || prof.id}</span>
                                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                                  prof.id === 'main' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {prof.id === 'main' ? 'Main' : 'Sub'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {pXP} XP • {pHabitsCount} habits • {pDaysCount} days logged
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                startImpersonation(user, prof.id);
                                navigate('/');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase shrink-0"
                            >
                              View Profile
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredUsers.length === 0 && (
              <div className="text-center p-12 text-slate-400 font-medium text-sm flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center text-xl mb-3">
                  🔍
                </div>
                <p className="font-bold text-white mb-1">
                  No matching users found {searchQuery.trim() ? <>for &ldquo;{searchQuery}&rdquo;</> : ''}
                </p>
                {typoSuggestion ? (
                  <p className="text-xs text-slate-400 mt-1">
                    Did you mean:{" "}
                    <button
                      type="button"
                      onClick={() => setSearchQuery(typoSuggestion)}
                      className="text-emerald-400 underline font-bold hover:text-emerald-300"
                    >
                      {typoSuggestion}
                    </button>
                    ?
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">
                    Try searching by UID, partial email, or profile name.
                  </p>
                )}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-black uppercase text-slate-300 hover:text-white transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick XP / Streak Offset Booster Modal */}
      {typeof document !== 'undefined' && boostingUser && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setBoostingUser(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-white mb-1">⚡ Adjust User XP & Wins</h3>
            <p className="text-xs text-slate-400 mb-4">User: <strong className="text-white">{getDisplayName(boostingUser)}</strong></p>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Manual XP Offset</label>
                <input
                  type="number"
                  value={boostXP}
                  onChange={e => setBoostXP(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Manual Wins / Streak Offset</label>
                <input
                  type="number"
                  value={boostStreak}
                  onChange={e => setBoostStreak(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setBoostingUser(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Cancel</button>
              <button onClick={handleSaveBoost} className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black">Save Boost</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* JSON Editor Modal */}
      {typeof document !== 'undefined' && editingJsonUser && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setEditingJsonUser(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div>
                <h3 className="font-black text-xl text-white flex items-center gap-2">
                  <CodeIcon/> Advanced JSON Editor
                </h3>
                <p className="text-sm text-slate-400 font-medium mt-1">Editing: {getDisplayName(editingJsonUser)} (ID: <span className="font-mono text-xs">{editingJsonUser.id}</span>)</p>
              </div>
              <button onClick={() => setEditingJsonUser(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
                <XIcon/>
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-0 bg-slate-950 flex">
              <textarea
                className="w-full h-full p-4 bg-transparent text-emerald-400 font-mono text-xs md:text-sm leading-relaxed focus:outline-none resize-none"
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                spellCheck={false}
              />
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-900 flex flex-wrap justify-end gap-3">
              <button onClick={handleDownloadFromModal} className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl font-bold transition-colors">
                <DownloadIcon/> Download JSON
              </button>
              <button onClick={handleSaveJson} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold transition-colors">
                <CheckIcon/> Save Changes
              </button>
              <button onClick={() => setEditingJsonUser(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Global Settings Modal */}
      {typeof document !== 'undefined' && showGlobalSettings && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowGlobalSettings(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div>
                <h3 className="font-black text-xl text-white flex items-center gap-2">
                  <SettingsIcon/> Public App Global Defaults
                </h3>
                <p className="text-sm text-slate-400 font-medium mt-1">Configure default habits and categories for all new users.</p>
              </div>
              <button onClick={() => setShowGlobalSettings(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
                <XIcon/>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-900 space-y-6">
              {/* Default Categories Manager */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Default Categories</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {globalCategories.map((cat) => (
                    <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold uppercase text-emerald-400">
                      <span>{cat}</span>
                      {cat !== 'all' && (
                        <button
                          type="button"
                          onClick={() => {
                            setGlobalCategories(globalCategories.filter(c => c !== cat));
                            setGlobalConfigs(prev => {
                              const next = { ...prev };
                              Object.keys(next).forEach(h => {
                                if (next[h]?.category === cat) {
                                  next[h] = { ...next[h], category: 'all' };
                                }
                              });
                              return next;
                            });
                          }}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    placeholder="Add default category..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const c = newCategoryInput.trim().toLowerCase();
                      if (c && !globalCategories.includes(c)) {
                        setGlobalCategories([...globalCategories, c]);
                        setNewCategoryInput('');
                      }
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl text-xs font-black"
                  >
                    + Category
                  </button>
                </div>
              </div>

              {/* Default Habits Manager */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Default Habits</label>
                <form onSubmit={handleAddGlobalHabit} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newHabitInput}
                    onChange={(e) => setNewHabitInput(e.target.value)}
                    placeholder="Enter a new default habit..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                  />
                  <button
                    type="submit"
                    disabled={!newHabitInput.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    <PlusIcon/> Add
                  </button>
                </form>

                <div className="space-y-2">
                  {globalHabits.map((habitName, idx) => (
                    <div key={idx} className="flex flex-col p-4 bg-slate-800 border border-slate-700 rounded-xl">
                      {editingGlobalHabitIdx === idx ? (
                        <div className="flex flex-col gap-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Habit Name</label>
                              <input
                                type="text"
                                value={editingGlobalHabitName}
                                onChange={(e) => setEditingGlobalHabitName(e.target.value)}
                                className="w-full bg-slate-900 border border-emerald-500/50 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none"
                                autoFocus
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Goal Steps</label>
                              <input
                                type="number"
                                min="1"
                                value={editingGlobalHabitSteps}
                                onChange={(e) => setEditingGlobalHabitSteps(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Category</label>
                              <select
                                value={editingGlobalHabitCategory}
                                onChange={(e) => setEditingGlobalHabitCategory(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none"
                              >
                                {globalCategories.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] font-bold uppercase text-slate-400">Priority Multiplier (1x – 10x)</label>
                              <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                {editingGlobalHabitPriority}x
                              </span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="10"
                              step="1"
                              value={editingGlobalHabitPriority}
                              onChange={(e) => setEditingGlobalHabitPriority(e.target.value)}
                              className="w-full accent-emerald-500 cursor-pointer"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingGlobalHabitIdx(null)} className="px-4 py-1.5 bg-slate-700 text-white rounded-lg font-bold text-xs">Cancel</button>
                            <button onClick={() => handleEditGlobalHabitSave(habitName, idx)} className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-xs">Save</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-200">{habitName}</span>
                            <span className="text-xs text-slate-400 ml-2">
                              ({globalConfigs[habitName]?.steps || 1} steps • {globalConfigs[habitName]?.priority || 1}x XP • #{globalConfigs[habitName]?.category || 'all'})
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingGlobalHabitIdx(idx);
                                setEditingGlobalHabitName(habitName);
                                setEditingGlobalHabitSteps(globalConfigs[habitName]?.steps || 1);
                                setEditingGlobalHabitPriority(globalConfigs[habitName]?.priority || 1);
                                setEditingGlobalHabitCategory(globalConfigs[habitName]?.category || 'all');
                              }}
                              className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg"
                            >
                              <EditIcon/>
                            </button>
                            <button
                              onClick={() => handleRemoveGlobalHabit(habitName)}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                            >
                              <TrashIcon/>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
              <button onClick={handleSaveGlobalSettings} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-xl font-black text-xs uppercase tracking-wider">
                <CheckIcon/> Save Global Defaults
              </button>
              <button onClick={() => setShowGlobalSettings(false)} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs">
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
