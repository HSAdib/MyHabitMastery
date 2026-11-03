## File: src/App.jsx (Continued)
Location: `src/App.jsx` (Continued)

```jsx
    ))}
  </select>
</div> </div>
                  <div className="flex items-center gap-1.5 md:gap-3 pl-2 md:pl-4">
  <motion.button 
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => setShowAllNotes(true)} 
    title="View all journal entries"
    className={`flex items-center gap-1.5 transition-all px-2.5 py-1.5 rounded-xl border relative
      ${analytics.noteCount > 0 ? 'animate-glow-blue' : ''} 
      ${theme === 'dark' 
        ? 'bg-blue-900/20 text-blue-400 border-blue-500/30' 
        : 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm'}`}
  >
    <NoteIcon />
    <span className={`text-[10px] md:text-xs font-black`}>{analytics.noteCount}</span>
    
    {analytics.noteCount > 0 && (
      <span className="absolute -top-1 -right-1 flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
      </span>
    )}
  </motion.button>

  {hoveredHeatmapCell ? (
    <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${theme === 'dark' ? 'bg-slate-800/90 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
      <span className="font-mono text-emerald-400">{hoveredHeatmapCell.key}</span>
      <span>•</span>
      <span className="font-black text-emerald-500">{hoveredHeatmapCell.pct}%</span>
      <span className="opacity-70 text-[9px]">({hoveredHeatmapCell.doneCount}/{hoveredHeatmapCell.totalCount})</span>
      {hoveredHeatmapCell.isShielded && <span title="Streak Shield Active" className="text-cyan-400">🛡️</span>}
      {hoveredHeatmapCell.hasNote && <span title="Has Journal Note" className="text-blue-400">📝</span>}
    </div>
  ) : (
    <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${theme === 'dark' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-cyan-50 border-cyan-200 text-cyan-600'}`}>
      <ShieldIcon />
      <span>{shieldStats.availableCount} Shields</span>
    </div>
  )}
  </div>
                </div>
                
                {/* Right Side: Insights Button */}
                <div className="flex items-center justify-end">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowInsightsModal(true)} 
                    title="Year in Review Insights"
                    className={`flex items-center gap-1.5 transition-all px-3 py-1.5 rounded-xl border relative
                      ${theme === 'dark' 
                        ? 'bg-purple-900/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/20' 
                        : 'bg-purple-50 text-purple-600 border-purple-200 shadow-sm hover:bg-purple-100'}`}
                  >
                    <span className="text-[11px] font-black uppercase tracking-widest hidden sm:block">Insights</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                  </motion.button>
                </div>
              </div>

              {/* Heatmap Visual Guide Onboarding Banner */}
              {welcomeCardStatus !== 'gone' && (
                <ThanosDisintegrate
                  shouldDisintegrate={welcomeCardStatus === 'snapping'}
                  onDone={() => setWelcomeCardStatus('gone')}
                >
                  <div className={`mb-3 p-3 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/70 border-slate-700' : 'bg-emerald-50/80 border-emerald-200'} flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm`}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 text-sm">
                        🌱
                      </div>
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-wider ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>Heatmap Visual Guide</p>
                        <p className={`text-[11px] font-medium leading-tight ${getTextMuted()}`}>Each square is a day. Color intensifies from light to deep emerald as you log habits.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 self-start md:self-auto shrink-0 text-[9px] font-black uppercase tracking-wider">
                      <span className={getTextMuted()}>Key:</span>
                      <span className={`w-3.5 h-3.5 rounded-[2px] ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} title="0% Empty" />
                      <span className={`w-3.5 h-3.5 rounded-[2px] ${theme === 'dark' ? 'bg-emerald-900/60' : 'bg-emerald-200'}`} title="25% Light" />
                      <span className={`w-3.5 h-3.5 rounded-[2px] ${theme === 'dark' ? 'bg-emerald-700' : 'bg-emerald-400'}`} title="50% Medium" />
                      <span className={`w-3.5 h-3.5 rounded-[2px] ${theme === 'dark' ? 'bg-emerald-500' : 'bg-emerald-600'}`} title="75% Strong" />
                      <span className={`w-3.5 h-3.5 rounded-[2px] ${theme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-700'}`} title="100% Perfect" />
                      <span className="text-[8px] font-bold text-emerald-500 ml-1">More Active</span>
                    </div>
                  </div>
                </ThanosDisintegrate>
              )}
              
              <div className={`overflow-x-auto custom-scrollbar pb-2 ${isMobileMode ? 'whitespace-nowrap' : ''}`}>
                <div className="inline-block min-w-full">
                  <div className="relative h-3 mb-1" style={{ marginLeft: `${isMobileMode ? 16 : 24}px` }}>
  {heatmapConfig.monthLabels.map((m, idx) => (
    <span key={idx} className={`absolute text-[7px] md:text-[8px] font-black ${getTextMuted()} uppercase tracking-tighter text-left`} style={{ left: `${m.weekIndex * (CELL_SIZE + CELL_GAP)}px` }}>
      {m.label}
    </span>
  ))}
</div>
<div className="flex gap-1 md:gap-2">
  <div className="grid grid-rows-7 gap-[2px] md:gap-[3px] text-[6px] md:text-[7px] font-black opacity-60 uppercase tracking-tighter text-slate-500 w-3 md:w-4 shrink-0 text-right pr-1" style={{ height: `${7 * CELL_SIZE + 6 * CELL_GAP}px`, lineHeight: `${CELL_SIZE}px` }}>
    <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
  </div>
                    <div className="grid grid-rows-7 grid-flow-col gap-[2px] md:gap-[3px] min-h-[70px] md:min-h-[95px]">
                      {heatmapConfig.cells.map((cell, idx) => {
                        const intensityStyles = theme === 'dark' 
                          ? ['bg-slate-800', 'bg-emerald-900/40', 'bg-emerald-800', 'bg-emerald-600', 'bg-emerald-400']
                          : ['bg-slate-100', 'bg-emerald-100', 'bg-emerald-300', 'bg-emerald-500', 'bg-emerald-700'];
                        if (!cell) {
                          return <div key={`empty-${idx}`} style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }} className="opacity-0 pointer-events-none"></div>;
                        }
                        const cellColor = (cell.isShielded && cell.intensity === 0)
                          ? 'bg-cyan-500/30 ring-1 ring-cyan-400/60'
                          : intensityStyles[cell.intensity];
                        const noteHighlight = cell.hasNote ? 'ring-1 ring-blue-400/80' : '';

                        return (
                          <motion.div 
                            key={cell.key} 
                            initial={{ scale: 0.5, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            transition={{ delay: idx * 0.001 }} 
                            style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }} 
                            className={`rounded-[1px] md:rounded-[2px] border-[0.5px] border-black/5 shadow-sm transition-all cursor-pointer hover:scale-125 z-10 ${cellColor} ${noteHighlight}`} 
                            title={`${cell.key}: ${cell.pct}% (${cell.doneCount}/${cell.totalCount})${cell.isShielded ? ' [Shielded 🛡️]' : ''}${cell.hasNote ? ' [Note 📝]' : ''} - Click to inspect`}
                            onMouseEnter={() => setHoveredHeatmapCell(cell)}
                            onMouseLeave={() => setHoveredHeatmapCell(null)}
                            onClick={() => setSelectedHeatmapDay(cell.key)}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className={`${isMobileMode ? '' : 'col-span-1'} ${getCardStyle()} ${cardPadding} border relative overflow-hidden flex flex-col justify-between transition-colors h-full min-w-0`}>
              <div className="flex items-start mb-2 md:mb-4 justify-between">
                
                {/* Left Side: Vertical Stack */}
                <div className="flex flex-col gap-0.5 min-w-0 flex-1 mr-2 relative z-20">
                  {/* Row 1: Slim Dropdown Only */}
                  <div className="flex items-center gap-2">
                    <select 
                      value={dashboardGraphFilter}
                      onChange={(e) => setDashboardGraphFilter(e.target.value)}
                      className={`text-[11px] font-black uppercase px-2 py-1 rounded-full border transition-all duration-500 cursor-pointer focus:outline-none max-w-[80px] md:max-w-[120px] truncate
                        ${theme === 'dark' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:bg-emerald-500/20' 
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-300 shadow-sm'}`}
                    >
                      <option value="all" className={theme === 'dark' ? 'bg-slate-900' : 'bg-white'}>Overall</option>
                      {habits.filter(h => !archivedHabits.includes(h)).map(h => (
                        <option key={h} value={h} className={theme === 'dark' ? 'bg-slate-900' : 'bg-white'}>{h}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Row 2: Big Percentage */}
                  <span className={`text-lg md:text-xl font-black ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} leading-none mt-1`}>
                    {dashboardGraphFilter === 'all' ? analytics.monthlyPct : (analytics.habitPcts[dashboardGraphFilter] || 0)}%
                  </span>
                </div>

                {/* Right Side: Expand Graph Button */}
                <div className="flex items-center gap-2 shrink-0 z-20">
                  <button 
                    onClick={() => setShowMonthlyGraphModal(true)}
                    className={`p-2 rounded-xl transition-all border
                      ${theme === 'dark' 
                        ? 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-emerald-400 hover:bg-slate-800' 
                        : 'bg-white border-slate-200 text-slate-500 hover:text-emerald-600 hover:bg-slate-50 shadow-sm'}`}
                    title="Detailed Monthly Graph"
                  >
                    <MaximizeIcon />
                  </button>
                </div>

                </div>
              <div className="flex-grow flex items-center h-16 md:h-28 w-full relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="greenTrendShadow" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* The Shadow Fill */}
                  <motion.path 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ duration: 2 }} 
                    d={`${solveFluidPath(trendPoints)} L 100,100 L 0,100 Z`} 
                    fill="url(#greenTrendShadow)" 
                  />
                  {/* The Main Line */}
                  <motion.path 
                    initial={{ pathLength: 0 }} 
                    animate={{ pathLength: 1 }} 
                    transition={{ duration: 2 }} 
                    d={solveFluidPath(trendPoints)} 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                  />
                </svg>
              </div>
              <div className={`flex justify-between mt-1 md:mt-2 px-1 text-[6px] md:text-[8px] font-black ${theme === 'dark' ? 'text-slate-600' : 'text-slate-300'} uppercase tracking-widest`}>
                <span>START</span><span>END</span>
              </div>
            </motion.div>
          </div>
<div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
  {/* NEW: EDIT TAB (Manager Trigger) */}
  <button 
    onClick={() => setShowManageModal(true)}
    title="Manage habits and categories"
    className={`shrink-0 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
  >
    <EditIcon /> <span>Edit</span>
  </button>

  <div className={`w-px h-4 mx-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
  
  

  {/* EXISTING CATEGORIES (Clean Look) */}
  {categories.map(cat => (
    <div key={cat} className="relative group shrink-0">
      <button
        onClick={() => setSelectedCategory(cat)}
        title={`Filter by ${cat} (${categoryProgress[cat] || 0}% complete)`}
        className={`relative overflow-hidden px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
          selectedCategory === cat 
            ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] text-white' 
            : (theme === 'dark' ? 'border-emerald-800/60 hover:border-emerald-600 text-emerald-200/70' : 'border-emerald-300 hover:border-emerald-400 text-emerald-700/80')
        }`}
      >
        {/* Background Track - Given a distinct green hue so it looks like an empty bar */}
        <div className={`absolute inset-0 z-0 transition-colors duration-500 ${
          selectedCategory === cat 
            ? 'bg-emerald-900/80' 
            : (theme === 'dark' ? 'bg-emerald-950/60' : 'bg-emerald-50')
        }`} />
        
        {/* Progress Fill - Made much more vibrant so the loading state is obvious */}
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${categoryProgress[cat] || 0}%` }} 
          transition={{ duration: 1, ease: "easeOut" }}
          className={`absolute inset-y-0 left-0 z-0 h-full ${
            selectedCategory === cat 
              ? 'bg-emerald-500' 
              : 'bg-emerald-500/60'
          }`}
        />

        {/* Text Label */}
        <span className="relative z-10">{cat}</span>
      </button>
    </div>
  ))}
</div>
          {/* Updated Habit Cards Grid */}
          <motion.div variants={containerVariants} className="grid gap-3 mb-8" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${textSizes.tabSize || 110}px, 1fr))` }}>

            {/* 01/10 Empty Category State */}
            {selectedCategory !== 'all' && habits.filter(h => !archivedHabits.includes(h) && habitConfigs[h]?.category === selectedCategory).length === 0 && (
              <div className={`col-span-full p-8 rounded-3xl border text-center flex flex-col items-center justify-center my-2 ${
                theme === 'dark' ? 'bg-slate-900/40 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center text-xl mb-3 shadow-inner">
                  📂
                </div>
                <h4 className={`text-base font-black mb-1 capitalize ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                  No habits in &lsquo;{selectedCategory}&rsquo; yet
                </h4>
                <p className={`text-xs font-medium mb-5 max-w-sm ${getTextMuted()}`}>
                  Assign habits to this category in Manage Habits, or create a brand new habit specifically for {selectedCategory}.
                </p>
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  <button
                    onClick={() => {
                      setManageModalTab('habits');
                      setShowManageModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20"
                  >
                    + Create &lsquo;{selectedCategory}&rsquo; Habit
                  </button>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-wider transition-all ${
                      theme === 'dark' ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Show All Habits
                  </button>
                </div>
              </div>
            )}

            <AnimatePresence mode='popLayout'>
{habits.filter(h => !archivedHabits.includes(h) && (selectedCategory === 'all' || habitConfigs[h]?.category === selectedCategory)).map((habit, idx) => {
  const pct = analytics.habitPcts[habit] ?? 0;
  
  // THE FIX: Prevent background cards from stealing focus when the modal is open!
  const isEditing = editingHabitName === habit && !showManageModal; 
  
  return (
    <motion.div 
      layout 
      variants={itemVariants} 
      whileHover={{ y: -5, scale: 1.05 }} 
      key={habit} 
      className={`${getCardStyle()} cursor-pointer overflow-hidden group transition-all relative flex flex-col items-center justify-center rounded-full aspect-square border-0`}
      onClick={() => setViewingHabitMap(habit)}
      title={`${pct}% this month${allHabitStreaks[habit] > 0 ? ` · 🔥 ${allHabitStreaks[habit]} day streak` : ''}`}
    >
      
      <svg 
        className={`absolute transition-all duration-500 -rotate-90 inset-0 w-full h-full p-1`} 
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
      
      <div className="z-10 text-center flex flex-col items-center px-2 w-full relative">
        {isEditing ? (
          <input 
            autoFocus 
            style={{ fontSize: `${textSizes.habit}px` }}
            className={`font-black uppercase w-full text-center bg-transparent focus:outline-none border-b-2 border-emerald-500 mb-1 leading-[1.1] ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`} 
            value={tempHabitName} 
            onChange={(e) => setTempHabitName(e.target.value)} 
            onBlur={() => handleDashboardRename(habit)} 
            onKeyDown={(e) => e.key === 'Enter' && handleDashboardRename(habit)} 
            onClick={(e) => e.stopPropagation()} 
          />
        ) : (
          <div className="relative flex items-center justify-center w-full group/name min-h-[14px]">
            <p style={{ fontSize: `${textSizes.habit}px` }} className="font-black uppercase opacity-80 leading-[1.1] line-clamp-2 text-center w-full px-1 break-words">{habit}</p>
            <button className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-emerald-500 transition-all absolute right-0" title="Edit habit name" onClick={(e) => { e.stopPropagation(); setEditingHabitName(habit); setTempHabitName(habit); }}><EditIcon /></button>
          </div>
        )}
        <span className={`text-[19px] font-black mt-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
          <AnimatedNumber value={pct} />
        </span>
        {/* Streak badge */}
        {allHabitStreaks[habit] > 0 && (
          <div className="flex items-center gap-0.5 mt-0.5">
            <span className="text-[11px] leading-none">🔥</span>
            <span className={`text-[8px] font-black leading-none ${theme === 'dark' ? 'text-orange-400' : 'text-orange-500'}`}>{allHabitStreaks[habit]}d</span>
          </div>
        )}
      </div>
      
    </motion.div>
  );
})}
</AnimatePresence>
<motion.button layout whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => {
    const name = `Habit ${habits.length + 1}`; 
    const categoryToAssign = selectedCategory === 'all' ? 'all' : selectedCategory; 
    const newHabits = [...habits, name]; 
    const newConfigs = {...habitConfigs, [name]: { steps: 1, category: categoryToAssign }};
    setHabits(newHabits); 
    setHabitConfigs(newConfigs); 
    save(trackerData, newHabits, newConfigs); 
    setEditingHabitName(name); 
    setTempHabitName(name);
  }}
  className={`${getCardStyle()} flex items-center justify-center border-2 border-dashed transition-all rounded-full aspect-square ${theme === 'dark' ? 'border-slate-800 text-slate-700 hover:border-emerald-700' : 'border-slate-200 text-slate-300 hover:border-emerald-400'}`}
  title="Add New Habit"
>
  <PlusIcon />
</motion.button>
          </motion.div>
{/* Monthly Graph Detailed Modal */}
        {showMonthlyGraphModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowMonthlyGraphModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }} className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border rounded-[1.2rem] md:rounded-[2rem] w-full max-w-4xl p-6 md:p-8 shadow-2xl relative flex flex-col`} onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowMonthlyGraphModal(false)} className={`absolute top-6 right-6 flex flex-col items-center gap-0.5 p-2 ${getTextMuted()} hover:text-rose-500 transition-all`} title="Close (ESC)"><XIcon /><span className="text-[6px] font-mono opacity-50">ESC</span></button>
              
              <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <p className={`text-[10px] font-black ${getTextMuted()} uppercase tracking-[0.2em] mb-2`}>Monthly Trends</p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} title="Previous month" className={`p-1.5 rounded-lg transition-all ${theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:text-emerald-400' : 'bg-slate-100 text-slate-500 hover:text-emerald-600'}`}>
                      <ChevronLeftIcon />
                    </button>
                    <h3 className={`text-2xl md:text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'} min-w-[160px] md:min-w-[200px] text-center`}>
                      {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} title="Next month" className={`p-1.5 rounded-lg transition-all ${theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:text-emerald-400' : 'bg-slate-100 text-slate-500 hover:text-emerald-600'}`}>
                      <ChevronRightIcon />
                    </button>
                  </div>
                </div>
                
                <select 
                  value={dashboardGraphFilter}
                  onChange={(e) => setDashboardGraphFilter(e.target.value)}
                  className={`text-[11px] font-black uppercase px-3 py-2 rounded-full border transition-all duration-500 cursor-pointer focus:outline-none max-w-[120px] md:max-w-[160px] truncate shrink-0
                    ${theme === 'dark' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:bg-emerald-500/20' 
                      : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-300 shadow-sm'}`}
                >
                  <option value="all" className={theme === 'dark' ? 'bg-slate-900' : 'bg-white'}>Overall</option>
                  {habits.filter(h => !archivedHabits.includes(h)).map(h => (
                    <option key={h} value={h} className={theme === 'dark' ? 'bg-slate-900' : 'bg-white'}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Monthly Trend Onboarding Guide */}
              {!hasAnyData && (
                <div className={`mb-4 p-3.5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-emerald-50/80 border-emerald-200'} flex items-center gap-3`}>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 text-base">
                    📈
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-wider ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>Monthly Trend Curve</p>
                    <p className={`text-xs font-medium leading-relaxed ${getTextMuted()}`}>As you check off habits across the month, this graph forms a smooth consistency curve showing your daily trajectory.</p>
                  </div>
                </div>
              )}

              <div className={`w-full h-[60vh] rounded-3xl border p-4 md:p-6 ${theme === 'dark' ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyGraphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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

{/* Weekly Summary Popup Modal */}
        {showWeeklyModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={() => setShowWeeklyModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border rounded-[2.5rem] w-full max-w-2xl p-8 shadow-2xl relative`} onClick={e => e.stopPropagation()}>
              
              <button onClick={() => setShowWeeklyModal(false)} className={`absolute top-6 right-6 flex flex-col items-center gap-0.5 p-2 ${getTextMuted()} hover:text-rose-500 transition-all`} title="Close (ESC)"><XIcon /><span className="text-[6px] font-mono opacity-50">ESC</span></button>
              
              <div className="mb-8">
                <p className={`text-[10px] font-black ${getTextMuted()} uppercase tracking-[0.2em] mb-1`}>Performance Overview</p>
                <h3 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Weekly Summary</h3>
              </div>

              {/* Weekly Summary Onboarding Guide */}
              {weeklySummary.avgScore === 0 && !hasAnyData && (
                <div className={`mb-6 p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-emerald-50/80 border-emerald-200'} flex items-center gap-3.5`}>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 text-lg">
                    📊
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-wider ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>Weekly Performance Report</p>
                    <p className={`text-xs font-medium leading-relaxed ${getTextMuted()}`}>Track habits across 3 or more days to generate your 7-day rolling score and top habit achievements ranking.</p>
                  </div>
                </div>
              )}

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
                    <p className={`text-[10px] font-black ${getTextMuted()} uppercase tracking-widest`}>
                      {weeklyGraphFilter === 'all' ? 'Performance Graph' : `${weeklyGraphFilter} Trend`}
                    </p>
                  </div>
                  <select 
                    value={weeklyGraphFilter} 
                    onChange={(e) => setWeeklyGraphFilter(e.target.value)}
                    className={`text-[11px] font-black uppercase px-2 py-1 rounded-full border transition-all duration-500 cursor-pointer focus:outline-none max-w-[80px] md:max-w-[120px] truncate
                      ${theme === 'dark' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:bg-emerald-500/20' 
                        : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-300 shadow-sm'}`}
                  >
                    <option value="all" className={theme === 'dark' ? 'bg-slate-900' : 'bg-white'}>Overall</option>
                    {habits.filter(h => !archivedHabits.includes(h)).map(h => (
                      <option key={h} value={h} className={theme === 'dark' ? 'bg-slate-900' : 'bg-white'}>{h}</option>
                    ))}
                  </select>
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

        {/* --- JOURNAL HISTORY MODAL --- */}
        {/* --- 51-ENTRY CENTERED JOURNAL HISTORY MODAL --- */}
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
                    className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none border-2 transition-all ${
                      theme === 'dark'
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
                        className={`relative p-5 rounded-2xl border transition-all ${
                          theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
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
                              className={`w-full p-3 rounded-xl border text-sm font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none ${
                                theme === 'dark'
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
                                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                                    theme === 'dark' ? 'border-slate-700 text-slate-400 hover:bg-slate-700' : 'border-slate-200 text-slate-500 hover:bg-slate-100'
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

        {/* --- INSIGHTS MODAL --- */}
        {showInsightsModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[180] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={() => setShowInsightsModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl relative flex flex-col max-h-[85vh]`} onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowInsightsModal(false)} className={`absolute top-6 right-6 flex flex-col items-center gap-0.5 p-2 ${getTextMuted()} hover:text-rose-500 transition-all`} title="Close (ESC)"><XIcon /><span className="text-[6px] font-mono opacity-50">ESC</span></button>
              
              <div className="mb-6 shrink-0">
                <p className={`text-[10px] font-black ${getTextMuted()} uppercase tracking-[0.2em] mb-1`}>Year in Review</p>
                <h3 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Insights</h3>
              </div>

              <div className="overflow-y-auto custom-scrollbar pr-2 space-y-4">
                
```

---

