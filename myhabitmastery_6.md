## File: src/App.jsx (Continued)
Location: `src/App.jsx` (Continued)

```jsx
        }());
      });
    }

    // ৪. আপডেট লজিক: লেভেল বাড়ুক বা কমুক, বর্তমান অবস্থা সেভ করে রাখো।
    if (xpStats.level !== prevLevelRef.current) {
      prevLevelRef.current = xpStats.level;
      // Persist to IDB + Firebase (not just localStorage) so the level survives cross-device
      savePartialToIDB({ savedLevel: xpStats.level });
    }

  }, [xpStats.level]);

  const analytics = useMemo(() => {
    let totalEarnedWeight = 0; let totalPossibleWeight = 0; let totalDone = manualStreakOffset || 0; let noteCount = 0; const stats = {};
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
        const val = trackerData[date]?.[habit] ?? 0;
        earned += (val / 100);
      });
      return { name: habit, score: Math.round((earned / 7) * 100) };
    });

    const topHabits = [...weeklyStats].sort((a, b) => b.score - a.score).slice(0, 3);
    const avgScore = activeHabitsList.length > 0 ? Math.round(weeklyStats.reduce((acc, h) => acc + h.score, 0) / activeHabitsList.length) : 0;

    return { topHabits, avgScore, weeklyStats }; 
  }, [trackerData, activeHabitsList]);
  const weeklyGraphData = useMemo(() => {
    if (weeklyGraphFilter === 'all') return weeklySummary.weeklyStats;
    
    // Generate last 7 days data for the selected habit
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = getSafeKey(d);
      const valRaw = trackerData[key]?.[weeklyGraphFilter] ?? 0;
      const score = typeof valRaw === 'number' ? valRaw : (valRaw ? 100 : 0);
      days.push({ 
        name: d.toLocaleDateString(undefined, { weekday: 'short' }), 
        score 
      });
    }
    return days;
  }, [weeklyGraphFilter, weeklySummary, trackerData]);

  // Per-habit current streak — powers the streak badge on habit cards
  const allHabitStreaks = useMemo(() => {
    const streaks = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
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

    habits.forEach(h => { streaks[h] = 0; currentStreaks[h] = 0; });
    const dayStats = [0,1,2,3,4,5,6].map(() => ({ earned: 0, total: 0 }));

    const allKeys = Object.keys(trackerData).sort();
    if (allKeys.length > 0) {
      const startDate = parseLocalDate(allKeys[0]);
      startDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let cursor = new Date(startDate);
      while (cursor <= today) {
        const dateStr = getSafeKey(cursor);
        const isShielded = shieldedDates.includes(dateStr);
        const isToday = cursor.getTime() === today.getTime();
        const dayOfWeek = cursor.getDay();

        let dayScore = 0;
        let activeHabitsForDay = 0;

        habits.forEach(h => {
          const valRaw = trackerData[dateStr]?.[h] ?? 0;
          const score = typeof valRaw === 'number' ? valRaw : (valRaw ? 100 : 0);

          if (!archivedHabits.includes(h)) {
            activeHabitsForDay++;
            dayScore += score;
          }

          dayStats[dayOfWeek].total += 100;
          dayStats[dayOfWeek].earned += score;

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

        if (activeHabitsForDay > 0 && dayScore === activeHabitsForDay * 100) {
          perfectDaysCount++;
        }

        cursor.setDate(cursor.getDate() + 1);
      }
    }

    const dayAverages = dayStats.map(d => d.total > 0 ? Math.round((d.earned / d.total) * 100) : 0);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const bestDayIdx = dayAverages.indexOf(Math.max(...dayAverages, -1));
    const bestDay = bestDayIdx >= 0 && dayAverages[bestDayIdx] > 0 ? days[bestDayIdx] : 'None yet';
    const bestDayScore = bestDayIdx >= 0 ? dayAverages[bestDayIdx] : 0;

    const sortedStreaks = Object.entries(streaks)
      .filter(([h, s]) => s > 0 && !archivedHabits.includes(h))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([h, s]) => ({ habit: h, max: s, current: currentStreaks[h] }));

    return { bestDay, bestDayScore, topStreaks: sortedStreaks, perfectDaysCount, totalWins };
  }, [trackerData, habits, archivedHabits, shieldedDates]);

  // Earn 1 Streak Shield on initial start + 1 per Level gained + 1 every 7 Perfect Days
  const shieldStats = useMemo(() => {
    const totalEarned = Math.max(1, (xpStats.level - 1) + Math.floor((insightsData?.perfectDaysCount || 0) / 7));
    const usedCount = shieldedDates.length;
    const availableCount = Math.max(0, totalEarned - usedCount);
    return { totalEarned, usedCount, availableCount };
  }, [xpStats.level, insightsData?.perfectDaysCount, shieldedDates]);

  // True if ANY habit has been logged at any point — used for empty state
  const hasAnyData = useMemo(() =>
    Object.values(trackerData).some(day =>
      habits.some(h => { const v = day[h]; return typeof v === 'number' ? v > 0 : !!v; })
    ), [trackerData, habits]);

  // Track initial hydration: if returning user has data, ensure card is gone
  const initialDataCheckedRef = useRef(false);
  useEffect(() => {
    if (isHydrating) return;
    if (!initialDataCheckedRef.current) {
      initialDataCheckedRef.current = true;
      if (hasAnyData) {
        setWelcomeCardStatus('gone');
      }
    }
  }, [isHydrating, hasAnyData]);

  // When user logs their first habit (transitions from empty to having data), trigger the Thanos snap!
  useEffect(() => {
    if (!isHydrating && initialDataCheckedRef.current) {
      if (hasAnyData && welcomeCardStatus === 'visible') {
        setWelcomeCardStatus('snapping');
      }
    }
  }, [hasAnyData, welcomeCardStatus, isHydrating]);

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
    today.setHours(0, 0, 0, 0);

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
      // Parse date locally to prevent UTC timezone offset bugs
      const [y, m, d_str] = allDates[0].split('-');
      let d = new Date(parseInt(y), parseInt(m) - 1, parseInt(d_str), 0, 0, 0, 0);
      
      while (d <= today) {
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

  const heatmapConfig = useMemo(() => {
    const year = currentDate.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1).getDay(); 
    const cells = Array(firstDayOfYear).fill(null); 
    const daysInYear = (((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) ? 366 : 365);
    
    for (let i = 0; i < daysInYear; i++) {
      const d = new Date(year, 0, 1, 12); d.setDate(d.getDate() + i); const key = getSafeKey(d);
      let intensity = 0;
      const isShielded = shieldedDates.includes(key);
      const hasNote = Boolean(trackerData[key]?.note && trackerData[key].note.trim());
      let pct = 0;
      let doneCount = 0;
      const totalCount = heatmapFilter === 'all' ? activeHabitsList.length : 1;

      if (heatmapFilter === 'all') {
        let totalPct = 0; 
        activeHabitsList.forEach(h => { 
          const r = trackerData[key]?.[h] ?? 0; 
          const v = typeof r === 'number' ? r : (r ? 100 : 0);
          totalPct += v;
          if (v >= 100) doneCount++;
        });
        const avg = activeHabitsList.length > 0 ? totalPct / (activeHabitsList.length * 100) : 0;
        pct = Math.round(avg * 100);
        intensity = avg === 0 ? 0 : avg <= 0.25 ? 1 : avg <= 0.5 ? 2 : avg <= 0.75 ? 3 : 4;
      } else {
        const r = trackerData[key]?.[heatmapFilter] ?? 0;
        const val = typeof r === 'number' ? r : (r ? 100 : 0);
        pct = Math.round(val);
        if (val >= 100) doneCount = 1;
        const ratio = val / 100;
        intensity = ratio === 0 ? 0 : ratio <= 0.25 ? 1 : ratio <= 0.5 ? 2 : ratio <= 0.75 ? 3 : 4;
      }
      cells.push({ date: d, key, intensity, pct, doneCount, totalCount, hasNote, isShielded });
    }

    const monthLabels = []; const addedMonths = new Set();
    cells.forEach((cell, index) => {
      if (cell && cell.date) {
        const m = cell.date.getMonth();
        if (!addedMonths.has(m)) {
          const weekIndex = Math.floor(index / 7);
          monthLabels.push({ label: cell.date.toLocaleString('default', { month: 'short' }), weekIndex: weekIndex });
          addedMonths.add(m);
        }
      }
    });
    return { cells, monthLabels };
  }, [currentDate, trackerData, activeHabitsList, heatmapFilter, shieldedDates]);

  const monthlyGraphData = useMemo(() => {
    return daysInMonth.map((day) => {
      const key = getSafeKey(day); 
      let pct = 0;

      if (dashboardGraphFilter === 'all') {
         let totalPct = 0;
         activeHabitsList.forEach(h => { const r = trackerData[key]?.[h] ?? 0; totalPct += (typeof r === 'number' ? r : (r ? 100 : 0)); });
         pct = activeHabitsList.length > 0 ? totalPct / activeHabitsList.length : 0;
      } else {
         const r = trackerData[key]?.[dashboardGraphFilter] ?? 0;
         pct = typeof r === 'number' ? r : (r ? 100 : 0);
      }
      
      return { 
        date: day.getDate(), 
        fullDate: day.toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' }),
        score: Math.round(pct)
      };
    });
  }, [daysInMonth, trackerData, activeHabitsList, dashboardGraphFilter]);

  const trendPoints = useMemo(() => {
    if (daysInMonth.length < 2) return [];
    return daysInMonth.map((day, idx) => {
      const key = getSafeKey(day); 
      let pct = 0;

      if (dashboardGraphFilter === 'all') {
         let totalPct = 0;
         activeHabitsList.forEach(h => { const r = trackerData[key]?.[h] ?? 0; totalPct += (typeof r === 'number' ? r : (r ? 100 : 0)); });
         pct = activeHabitsList.length > 0 ? totalPct / activeHabitsList.length : 0;
      } else {
         const r = trackerData[key]?.[dashboardGraphFilter] ?? 0;
         pct = typeof r === 'number' ? r : (r ? 100 : 0);
      }
      
      return { x: (idx / (daysInMonth.length - 1)) * 100, y: 100 - pct };
    }).filter(p => !isNaN(p.x));
  }, [daysInMonth, trackerData, activeHabitsList, dashboardGraphFilter]);

  // (solveFluidPath is imported from ./utils — local duplicate removed)

  const currentMonthNotes = useMemo(() => {
    return daysInMonth.map(d => ({ date: d, key: getSafeKey(d), note: trackerData[getSafeKey(d)]?.note })).filter(e => e.note && e.note.trim() !== "");
  }, [daysInMonth, trackerData]);

  // Styling Helpers
  const getButtonStyles = (val, dateKey) => {
    const isToday = new Date().toDateString() === parseLocalDate(dateKey).toDateString();
    const isPast = parseLocalDate(dateKey).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
    
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

  const CELL_SIZE = isMobileMode ? 9 : 11;
  const CELL_GAP = isMobileMode ? 2 : 3;

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
    <div className={`min-h-screen ${getContainerBg()} font-sans pb-6 md:pb-20 select-none overflow-x-hidden ${isImpersonating ? 'pt-12' : ''}`}>
      <Analytics />

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
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] max-w-lg w-[92vw] sm:w-auto px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center justify-between gap-4 backdrop-blur-xl ${
              actionToast.type === 'error'
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
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] px-6 py-3 rounded-full shadow-2xl border font-black uppercase text-xs tracking-widest flex items-center gap-2 ${
              importStatus === 'success' 
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
                className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg animate-glow cursor-pointer"
              >
                <ZapIcon />
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
                      title="Adjust Display Sizes"
                    >
                      <TextSizeIcon />
                    </button>

                    {/* Mobile View Toggle */}
                    <button 
                      onClick={toggleMobileMode}
                      className={`p-1.5 rounded-lg transition-all border active:scale-90 flex items-center gap-1.5
                        ${isMobileMode 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
                          : (theme === 'dark' 
                            ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          )}`}
                      title="Toggle Mobile Compatibility Mode"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                        <line x1="12" y1="18" x2="12.01" y2="18"/>
                      </svg>
                      <span className="text-[9px] font-black uppercase tracking-wider hidden sm:inline">
                        {isMobileMode ? 'Mobile View On' : 'Mobile View Off'}
                      </span>
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
                    <button
                      onClick={() => setSelectedHeatmapDay(getSafeKey(new Date()))}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)] cursor-pointer hover:scale-105 active:scale-95 transition-all"
                      title={`Streak Shields: ${shieldStats.availableCount} available (${shieldStats.usedCount} used). Click to shield today or click any heatmap day!`}
                    >
                      <ShieldIcon/>
                      <span className="text-[9px] font-black">{shieldStats.availableCount}</span>
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
  onClick={() => setShowArchiveModal(true)}
  title="View archived habits (hidden from tracker)"
  className={`mr-2 p-2 rounded-xl border flex items-center justify-center transition-all ${theme === 'dark' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'}`}
>
  <ArchiveIcon />
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
                    className={`ml-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${
                      theme === 'dark'
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
                    <ShieldIcon/>
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
            <motion.div variants={itemVariants} className={`${isMobileMode ? '' : 'col-span-2'} ${getCardStyle()} ${cardPadding} border overflow-hidden flex flex-col transition-colors h-full min-w-0`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2 md:gap-4">
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="flex items-center gap-2">
  <div className="flex items-center gap-2 md:gap-3">
  <span className={`hidden md:block text-[8px] md:text-[9px] font-black uppercase tracking-widest shrink-0 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
    Activity Heatmap
  </span>
  {/* Mobile Label (Icon only to save space) */}
  <span className={`md:hidden text-emerald-500`}><ActivityIcon /></span>
  
  <select 
    value={heatmapFilter} 
    onChange={(e) => setHeatmapFilter(e.target.value)}
    className={`text-[11px] font-black uppercase px-2 py-1 rounded-full border transition-all duration-500 cursor-pointer focus:outline-none max-w-[80px] md:max-w-[120px] truncate
      ${theme === 'dark' 
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:bg-emerald-500/20' 
        : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-300 shadow-sm'}`}
  >
    <option value="all" className={theme === 'dark' ? 'bg-slate-900' : 'bg-white'}>Overall</option>
    {habits.filter(h => !archivedHabits.includes(h)).map(h => (
      <option key={h} value={h} className={theme === 'dark' ? 'bg-slate-900' : 'bg-white'}>{h}</option>
```

---

