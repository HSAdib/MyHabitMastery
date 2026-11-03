## File: src/App.jsx (Continued)
Location: `src/App.jsx` (Continued)

```jsx
  const setHeatmapFilter = useHabitStore(state => state.setHeatmapFilter);
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
  const setImportStatus = useHabitStore(state => state.setImportStatus);
  
  const updateHabitValueStore = useHabitStore(state => state.updateHabitValue);
  const setTheme = useHabitStore(state => state.setTheme);
  const setStorePartial = useHabitStore(state => state.setStorePartial);
  const savePartialToIDB = useHabitStore(state => state.savePartialToIDB);
  const initStore = useHabitStore(state => state.init);
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
  const isSuperAdmin = isAuthenticated && user?.email?.toLowerCase() === 'hasanshahriaradib@gmail.com';

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
      if (auth) await signOut(auth);
      setStorePartial({ user: null, isAuthenticated: false, guestName: "" });
      await savePartialToIDB({ guestName: "" });
    } catch (error) {
      console.error('Logout Failed', error);
    }
  };

  // Welcome card status: 'visible' | 'snapping' | 'gone'
  const [welcomeCardStatus, setWelcomeCardStatus] = useState(() => {
    try {
      const saved = localStorage.getItem('habit_tracker_master_v9_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Object.values(parsed).some(day => Object.values(day).some(v => typeof v === 'number' ? v > 0 : !!v))) {
          return 'gone';
        }
      }
    } catch (e) {}
    return 'visible';
  });
  const [editingHabitName, setEditingHabitName] = useState(null);
  const [editingManageListHabitName, setEditingManageListHabitName] = useState(null);
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
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [showMonthlyGraphModal, setShowMonthlyGraphModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [manageModalTab, setManageModalTab] = useState('categories');
  const [seenManageTip, setSeenManageTip] = useState(() => {
    try {
      return !!localStorage.getItem('adib_seen_manage_tip');
    } catch (e) {
      return false;
    }
  });
  const [showTextSizeModal, setShowTextSizeModal] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [showLevelDetailsModal, setShowLevelDetailsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showTrophyDetailsModal, setShowTrophyDetailsModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [newCatInput, setNewCatInput] = useState("");
  const [newHabitInput, setNewHabitInput] = useState("");
  const [activeSlider, setActiveSlider] = useState(null); 
  const [isEditingTabName, setIsEditingTabName] = useState(false);
  const [tableHeight, setTableHeight] = useState(484);
  const [tempGoalVal, setTempGoalVal] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [hoveredHeatmapCell, setHoveredHeatmapCell] = useState(null);
  const [selectedHeatmapDay, setSelectedHeatmapDay] = useState(null);
  const noteSaveTimer = useRef(null); // Fix #15

  const prevLevelRef = useRef(savedLevel);
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
  const setArchivedHabits = (newArchived) => {
    savePartialToIDB({ archivedHabits: newArchived });
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
    savePartialToIDB({ isMobileMode: newMode });
    if (newMode) {
      setTextSizes({ ...textSizes, habit: 10, table1: 9, table2: 9, tabSize: 75 });
    } else {
      setTextSizes({ ...textSizes, habit: 14, table1: 12, table2: 11, tabSize: 110 });
    }
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
    setCategories(newCats);
    const newConfigs = { ...habitConfigs };
    Object.keys(newConfigs).forEach(h => {
      if (newConfigs[h].category === categoryToDelete) {
        newConfigs[h].category = 'all';
      }
    });
    // Pass newConfigs directly to save; setHabitConfigs is redundant here
    save(trackerData, habits, newConfigs);
    if (selectedCategory === categoryToDelete) setSelectedCategory('all');
    setCategoryToDelete(null);
  };

  const handleCategoryRename = (oldName, newName) => {
    const formattedName = newName.toLowerCase().trim();
    if (!formattedName || formattedName === oldName || categories.includes(formattedName)) return;

    const newCats = categories.map(c => c === oldName ? formattedName : c);
    setCategories(newCats);

    const newConfigs = { ...habitConfigs };
    Object.keys(newConfigs).forEach(h => {
      if (newConfigs[h].category === oldName) {
        newConfigs[h].category = formattedName;
      }
    });
    // Save configs directly without a redundant setHabitConfigs call (saves one extra IDB write)
    save(trackerData, habits, newConfigs);

    if (selectedCategory === oldName) setSelectedCategory(formattedName);
    setEditingCat(null);
  };

  const handleManualAddCategory = () => {
    const name = newCatInput.toLowerCase().trim();
    if (!name) return;
    if (categories.includes(name)) {
      setCatInputError(`The category "${name}" already exists.`);
      return;
    }
    setCatInputError('');
    const newCats = [...categories, name];
    setCategories(newCats);
    setNewCatInput("");
    triggerActionToast({
      type: 'success',
      title: '📁 Category Created!',
      subtitle: `Category "${name}" created successfully.`,
    }, 3000);
  };

  const handleAddHabitFromInput = () => {
    const name = newHabitInput.trim();
    if (!name) return;
    if (habits.some(h => h.toLowerCase() === name.toLowerCase())) {
      setHabitInputError(`A habit named "${name}" already exists. Try a distinct name.`);
      return;
    }
    if (archivedHabits.some(h => h.toLowerCase() === name.toLowerCase())) {
      setHabitInputError(`A habit named "${name}" is archived. Please unarchive it below.`);
      return;
    }
    setHabitInputError('');
    const categoryToAssign = selectedCategory === 'all' ? 'all' : selectedCategory; 
    const newHabits = [...habits, name]; 
    const newConfigs = {...habitConfigs, [name]: { steps: 1, category: categoryToAssign }};
    setHabits(newHabits); 
    setHabitConfigs(newConfigs); 
    save(trackerData, newHabits, newConfigs); 
    setNewHabitInput("");
    triggerActionToast({
      type: 'success',
      title: '✨ Habit Added!',
      subtitle: `"${name}" added to ${categoryToAssign} category.`,
    }, 3000);
  };

  useEffect(() => {
    const handleResize = () => {
      const saved = localStorage.getItem('adib_mobile_mode');
      if (!saved) {
        setStorePartial({ isMobileMode: window.innerWidth <= 768 });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setStorePartial]);

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
    const todayNote = trackerData[todayDateKey]?.note || '';
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
  }, [showAllNotes, todayDateKey, trackerData]);

  useEffect(() => {
    if (viewingHabitMap) {
      setTempGoalVal(habitConfigs[viewingHabitMap]?.steps || 1);
    }
  }, [viewingHabitMap, habitConfigs]);

  // Auto-scroll to today
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

    const handleTableScroll = () => {
      if (!isMobileMode) {
        let minHeightLimit = 350;
        let diffOffset = window.innerHeight - 350;
        let targetHeight = diffOffset - 120;
        if (targetHeight < minHeightLimit) targetHeight = minHeightLimit;

        setTableHeight(targetHeight);
      }
    };
    handleTableScroll();
    window.addEventListener('resize', handleTableScroll);
    const container = scrollContainerRef.current;
    if (container) container.addEventListener('scroll', handleTableScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleTableScroll);
      if (container) container.removeEventListener('scroll', handleTableScroll);
    };
  }, [currentDate, habits, tableOrientation, isMobileMode]);

  // Grab-to-scroll on the table container
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onMouseDown = (e) => {
      // Only trigger on the container itself or tbody cells, not thead
      if (e.target.closest('thead')) return;
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
      isDraggingTable.current = false;
      el.style.cursor = 'grab';
      el.style.userSelect = '';
    };

    // Block wheel scroll when hovering the header row or sticky name column — must use native listener with passive:false
    const onWheel = (e) => {
      const overHeader = e.target.closest('thead');
      const overNameCol = e.target.closest('[data-no-scroll]');
      if (overHeader || overNameCol) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    el.style.cursor = 'grab';
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('wheel', onWheel);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [tableOrientation]);

  // Global ESC key handler — closes any open modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (showWelcomeModal || showGuestPicker) {
        setShowWelcomeModal(false);
        setShowGuestPicker(false);
        return;
      }
      if (viewingHabitMap) { setViewingHabitMap(null); setIsEditingTabName(false); return; }
      if (editingNoteDate) { setEditingNoteDate(null); return; }
      if (showDeleteConfirm) { setShowDeleteConfirm(false); return; }
      if (showWeeklyModal) { setShowWeeklyModal(false); return; }
      if (showMonthlyGraphModal) { setShowMonthlyGraphModal(false); return; }
      if (showAllNotes) { setShowAllNotes(false); return; }
      if (showInsightsModal) { setShowInsightsModal(false); return; }
      if (showManageModal) { setShowManageModal(false); return; }
      if (showTextSizeModal) { setShowTextSizeModal(false); return; }
      if (showArchiveModal) { setShowArchiveModal(false); return; }
      if (showLevelDetailsModal) { setShowLevelDetailsModal(false); return; }
      if (showTrophyDetailsModal) { setShowTrophyDetailsModal(false); return; }
      if (showLevelUpModal) { setShowLevelUpModal(false); return; }
      if (categoryToDelete) { setCategoryToDelete(null); return; }
      if (selectedHeatmapDay) { setSelectedHeatmapDay(null); return; }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewingHabitMap, editingNoteDate, showDeleteConfirm, showWeeklyModal, showMonthlyGraphModal, showAllNotes, showInsightsModal, showManageModal, showTextSizeModal, showArchiveModal, showLevelDetailsModal, showTrophyDetailsModal, showLevelUpModal, categoryToDelete, selectedHeatmapDay, showWelcomeModal, showGuestPicker]);

  // Logic Handlers
  const handleDashboardRename = (oldName) => {
    const newName = tempHabitName.trim();
    if (newName === oldName) { setEditingHabitName(null); return; }
    if (!newName) { 
      setShowDeleteConfirm(true); 
    } else { 
      executeRename(oldName, newName); 
      setEditingHabitName(null);
    }
  };

  const handleTabRename = () => {
    const oldName = viewingHabitMap;
    const newName = tempHabitName.trim();
    if (newName === oldName) { setIsEditingTabName(false); return; }
    if (!newName) { setShowDeleteConfirm(true); } else { executeRename(oldName, newName); setViewingHabitMap(newName); }
    setIsEditingTabName(false);
  };

  const executeRename = (oldName, newName) => {
    if (habits.some(h => h !== oldName && h.toLowerCase() === newName.toLowerCase())) {
      triggerActionToast({
        type: 'error',
        title: 'Habit Already Exists',
        subtitle: `A habit named "${newName}" already exists.`,
      }, 4000);
      return;
    }
    const newHabits = [...habits];
    const idx = newHabits.indexOf(oldName);
    if (idx === -1) return;
    newHabits[idx] = newName;
    const newConfigs = { ...habitConfigs };
    newConfigs[newName] = newConfigs[oldName] || { steps: 1 };
    delete newConfigs[oldName];
    const newData = { ...trackerData };
    Object.keys(newData).forEach(k => {
      if (newData[k] && newData[k][oldName] !== undefined) {
        newData[k][newName] = newData[k][oldName];
        delete newData[k][oldName];
      }
    });
    // Single atomic save — avoids 3 separate setStorePartial calls + a save()
    savePartialToIDB({
      habits: newHabits,
      habitConfigs: newConfigs,
      trackerData: newData,
    });
    triggerActionToast({
      type: 'success',
      title: 'Renamed Successfully',
      subtitle: `Renamed "${oldName}" to "${newName}".`,
    }, 3000);
  };

  const deleteHabit = (name) => {
    if (!name) return;
    const newHabits = habits.filter(h => h !== name);
    const newConfigs = { ...habitConfigs };
    delete newConfigs[name];
    const newData = { ...trackerData };
    Object.keys(newData).forEach(k => { if (newData[k]) delete newData[k][name]; });
    const newArchived = archivedHabits.filter(h => h !== name);
    // Single batched save — avoids two concurrent IDB/Firebase writes
    savePartialToIDB({
      habits: newHabits,
      habitConfigs: newConfigs,
      trackerData: newData,
      archivedHabits: newArchived,
    });
    setViewingHabitMap(null);
    setEditingHabitName(null);
    setShowDeleteConfirm(false);
  };

  const toggleArchiveHabit = (name) => {
    let newArchived;
    if (archivedHabits.includes(name)) {
      newArchived = archivedHabits.filter(h => h !== name);
    } else {
      newArchived = [...archivedHabits, name];
      setViewingHabitMap(null);
    }
    // Single atomic save — setArchivedHabits would fire two writes (setStorePartial + savePartialToIDB)
    savePartialToIDB({ archivedHabits: newArchived });
  };

  const saveNote = (dateKey, noteText) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newTrackerData = { 
      ...trackerData, 
      [dateKey]: { 
        ...(trackerData[dateKey] || {}), 
        note: noteText,
        noteTime: noteText.trim() ? (trackerData[dateKey]?.noteTime || nowTime) : null 
      } 
    };
    setTrackerData(newTrackerData);
    save(newTrackerData, habits, habitConfigs);
  };

  const deleteNote = (dateKey) => {
    const newTrackerData = {
      ...trackerData,
      [dateKey]: {
        ...(trackerData[dateKey] || {}),
        note: '',
        noteTime: null,
      },
    };
    setTrackerData(newTrackerData);
    save(newTrackerData, habits, habitConfigs);
  };

  const handleNoteChange = (dateKey, value) => {
    // Instant local state update
    const newTrackerData = { 
      ...trackerData, 
      [dateKey]: { 
        ...(trackerData[dateKey] || {}), 
        note: value,
        noteTime: value.trim() ? (trackerData[dateKey]?.noteTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : null 
      } 
    };
    setTrackerData(newTrackerData);

    // Debounced IDB/Firebase save
    clearTimeout(noteSaveTimer.current);
    noteSaveTimer.current = setTimeout(() => saveNote(dateKey, value), 500);
  };
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

  const importStore = useHabitStore(state => state.importData);

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Reset file input so the same file can be re-imported if needed
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (
          imported &&
          typeof imported === 'object' &&
          imported.trackerData &&
          typeof imported.trackerData === 'object' &&
          Array.isArray(imported.habits)
        ) {
          // Use the store action for a single, atomic save (avoids multiple concurrent writes)
          await importStore(imported, 'overwrite');
          setImportStatus('success');
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus('error');
          setTimeout(() => setImportStatus(null), 3000);
        }
      } catch (err) {
        setImportStatus('error');
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  // Slider Interaction
  const handleHabitPressStart = (e, dateKey, habit, currentVal) => {
    if (parseLocalDate(dateKey).setHours(0,0,0,0) > new Date().setHours(0,0,0,0)) return;
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
    if (parseLocalDate(dateKey).setHours(0,0,0,0) > new Date().setHours(0,0,0,0)) return;
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

  const xpStats = useMemo(() => {
    let totalXP = manualXPOffset || 0;
    Object.keys(trackerData).forEach(dateKey => {
      habits.forEach(habit => {
        const val = trackerData[dateKey]?.[habit] ?? 0;
        const priority = habitConfigs[habit]?.priority || 1; 
        // Now accurately scales from 1x to 10x XP
        totalXP += (val / 100) * 10 * priority;
      });
    });
    
    // Growth logic: Level 2 at 100 XP, Level 3 at 400 XP, etc.
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

  // --- LEVEL UP EFFECT ---
  useEffect(() => {
    // ১. লোকাল স্টোরেজ থেকে লাস্ট সেভ করা লেভেল চেক করো
    const storedLevel = parseInt(localStorage.getItem('adib_habit_saved_level'));

    // ২. পেজ লোড হওয়ার সময় Ref সেট করো (যাতে রিলোড দিলে পপ-আপ না আসে)
    if (prevLevelRef.current === null) {
      // যদি আগে সেভ করা থাকে সেটা নাও, না থাকলে বর্তমান লেভেলই সেট করো
      prevLevelRef.current = !isNaN(storedLevel) ? storedLevel : xpStats.level;
      return;
    }

    // ৩. এখন মেইন লজিক: বর্তমান লেভেল কি আগের চেয়ে বেশি?
    if (xpStats.level > prevLevelRef.current) {
      setShowLevelUpModal(true);
      
      // Sound Effect
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
      } catch (e) { console.error("Audio play failed", e); }

      // Confetti Effect — using the utility to avoid raw <script> injection
      loadConfettiScript(() => {
        const duration = 3000;
        const end = Date.now() + duration;
        (function frame() {
          if (typeof window.confetti === 'function') {
            window.confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#10b981', '#3b82f6', '#f59e0b'] });
            window.confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#10b981', '#3b82f6', '#f59e0b'] });
          }
          if (Date.now() < end) requestAnimationFrame(frame);
```

---

