## File: src/App.jsx (Continued)
Location: `src/App.jsx` (Continued)

```jsx
                {/* Grid for small stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${getTextMuted()} mb-1`}>Perfect Days</span>
                    <span className={`text-2xl font-black ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {insightsData.perfectDaysCount} <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Days</span>
                    </span>
                  </div>
                  <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${getTextMuted()} mb-1`}>Total Wins</span>
                    <span className={`text-2xl font-black ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                      {insightsData.totalWins} <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Habits</span>
                    </span>
                  </div>
                </div>

                {/* Best Day */}
                <div className={`p-5 rounded-2xl border flex items-center justify-between ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${getTextMuted()}`}>Best Day</span>
                    <span className={`text-xl font-black mt-1 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{insightsData.bestDay}</span>
                  </div>
                  <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border-4 ${theme === 'dark' ? 'border-purple-500/20 text-purple-400 bg-purple-500/10' : 'border-purple-200 text-purple-600 bg-purple-50'}`}>
                    <span className="text-sm font-black">{insightsData.bestDayScore}%</span>
                  </div>
                </div>

                {/* Longest Streaks */}
                <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${getTextMuted()}`}>Top All-Time Streaks</span>
                  <div className="mt-4 space-y-3">
                    {insightsData.topStreaks.length > 0 ? (
                      insightsData.topStreaks.map((streakData, i) => (
                        <div key={streakData.habit} className="flex items-center justify-between">
                          <span className={`text-sm font-bold uppercase truncate pr-4 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{i + 1}. {streakData.habit}</span>
                          <div className="flex gap-2 shrink-0">
                            {streakData.current > 0 && (
                              <div className={`flex flex-col items-center px-2 py-1 rounded-lg ${theme === 'dark' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`} title="Active streak going on right now">
                                <span className={`text-[8px] font-black uppercase opacity-70 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>Current</span>
                                <span className={`text-[11px] font-black ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                  🔥 {streakData.current} {streakData.current === 1 ? 'Day' : 'Days'}
                                </span>
                              </div>
                            )}
                            <div className={`flex flex-col items-center px-2 py-1 rounded-lg ${theme === 'dark' ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`} title="Longest streak you've ever had">
                              <span className={`text-[8px] font-black uppercase opacity-70 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>Best</span>
                              <span className={`text-[11px] font-black ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>
                                🏆 {streakData.max} {streakData.max === 1 ? 'Day' : 'Days'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className={`text-xs font-bold ${getTextMuted()}`}>No streaks yet. Keep going!</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
          {/* Empty State Onboarding — Thanos snap out when first habit is logged */}
          {welcomeCardStatus !== 'gone' && (
            <ThanosDisintegrate
              shouldDisintegrate={welcomeCardStatus === 'snapping'}
              onDone={() => setWelcomeCardStatus('gone')}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${getCardStyle()} border rounded-[2.5rem] relative overflow-hidden transition-colors`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none" />
                <div className="relative z-10 py-12 px-8 text-center">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 ${
                    theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
                  }`}>
                    <span className="text-3xl">🌱</span>
                  </div>
                  <h3 className={`text-2xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    Welcome to My Habit Mastery!
                  </h3>
                  <p className={`text-sm font-medium mb-6 max-w-sm mx-auto leading-relaxed ${getTextMuted()}`}>
                    Start tracking your habits by clicking the cells in the table below.
                    Long-press for partial completion, tap for full completion.
                  </p>
                  <div className={`flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-widest ${getTextMuted()} mb-6`}>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-base shadow-lg shadow-emerald-500/30">✔</div>
                      <span>Complete</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-blue-500/30">50%</div>
                      <span>Partial</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center text-red-500 ${
                        theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                      }`}>✘</div>
                      <span>Missed</span>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setWelcomeCardStatus('snapping')}
                      className={`text-xs font-bold px-4 py-2 rounded-xl transition-all border ${
                        theme === 'dark'
                          ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                          : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Got it, dismiss ✨
                    </button>
                  </div>
                </div>
              </motion.div>
            </ThanosDisintegrate>
          )}
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
          className={`border-separate border-spacing-0 ${
            isMobileMode 
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
                            {habits.filter(h => !archivedHabits.includes(h)).map((h, i) => <th key={i} className={`p-2 border-r border-b uppercase text-center font-black transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`} style={{ fontSize: `${textSizes.table1}px`, minWidth: isMobileMode ? '90px' : 'auto' }}><div className="px-1 leading-tight break-words" title={h}>{h}</div></th>)}
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
                                              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditingNoteDate(key)} title={dayData.note ? "View/Edit Reflection" : "Add Reflection"} className={`p-2 rounded-xl transition-all ${dayData.note ? 'bg-blue-600 text-white shadow-md' : (theme === 'dark' ? 'bg-slate-800 text-slate-600 hover:bg-slate-700' : 'bg-slate-100 text-slate-300 hover:bg-slate-200')}`}><NoteIcon /></motion.button>
                                              <span className="tooltip-content" style={{ whiteSpace: 'nowrap', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {dayData.note ? `“${dayData.note.split('\n')[0].substring(0, 45)}${dayData.note.split('\n')[0].length > 45 ? '…' : ''}”` : 'Add reflection'}
                                              </span>
                                            </div>
                                            <div className="flex flex-col text-center"><span className={`text-[8px] uppercase opacity-80 leading-none ${theme === 'dark' ? 'text-slate-500' : ''}`}>{day.toLocaleDateString(undefined, { weekday: 'short' })}</span><div className="flex items-center justify-center gap-1"><span className={`text-sm font-black mt-0.5 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{day.getDate()}</span>{shieldedDates.includes(key) && <span title="Streak Shield Active" className="text-cyan-400 text-xs">🛡️</span>}</div></div>
                                        </div>
                                    </td>
                                    
                                    {/* FILTERED HABITS CELLS */}
                                    {activeHabits.map((h, i) => {
                                        const rawVal = dayData[h] ?? 0; const val = typeof rawVal === 'number' ? rawVal : (rawVal ? 100 : 0);
                                        return (
                                            <td key={i} className={`p-2 border-r border-b transition-all duration-500 text-center ${rowBgStyle} ${isToday ? 'border-y-2 border-emerald-500/20' : ''}`}>
                                                <motion.button whileTap={{ scale: 0.9 }} title="Mark habit completion" className={`w-11 h-11 rounded-2xl transition-all flex flex-col items-center justify-center mx-auto border-2 text-xl font-black ${getButtonStyles(val, key)} touch-none select-none ${parseLocalDate(key).setHours(0,0,0,0) > new Date().setHours(0,0,0,0) ? 'opacity-20 cursor-not-allowed grayscale' : ''}`} onPointerDown={(e) => handleHabitPressStart(e, key, h, val)} onPointerUp={(e) => handleHabitPressEnd(e, key, h, val)}>
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
  whileTap={{ scale: 0.9 }} 
  onClick={() => setEditingNoteDate(key)} 
  title={trackerData[key]?.note ? "View/Edit Reflection" : "Add Reflection"}
  className={`p-2 rounded-xl transition-all ${trackerData[key]?.note ? 'bg-blue-600 text-white shadow-md' : (theme === 'dark' ? 'bg-slate-800 text-slate-600 hover:bg-slate-700' : 'bg-slate-100 text-slate-300 hover:bg-slate-200')}`}
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
                        {habits.filter(h => !archivedHabits.includes(h)).map((habit, hIdx) => (
                            <tr key={hIdx} className="h-[68px]">
                                <td data-no-scroll className={`p-1 font-black uppercase sticky left-0 z-20 border-r border-b text-center transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} text-slate-400 shadow-[4px_0_8px_rgba(0,0,0,0.3)]`} style={{ fontSize: `${textSizes.table2}px` }}>
                                    <div className="truncate w-full px-1 font-black leading-tight">{habit}</div>
                                </td>
                                {daysInMonth.map(day => {
                                    const key = getSafeKey(day); const val = typeof trackerData[key]?.[habit] === 'number' ? trackerData[key][habit] : (trackerData[key]?.[habit] ? 100 : 0);
                                    return (
                                        <td key={key} className={`p-1.5 border-r border-b text-center transition-all duration-500 ${new Date().toDateString() === day.toDateString() ? (theme === 'dark' ? 'bg-emerald-900/20 border-emerald-500/30 shadow-[inset_0_0_20px_rgba(16,185,129,0.08)]' : 'bg-emerald-50/50 border-emerald-400/30 shadow-[inset_0_0_20px_rgba(16,185,129,0.08)]') : (theme === 'dark' ? 'border-r-slate-800 border-b-slate-800' : 'border-r-slate-100 border-b-slate-100')}`} style={{ width: horizontalColWidth, minWidth: horizontalColWidth }}>
                                            <motion.button whileTap={{ scale: 0.9 }} title="Mark habit completion" onPointerDown={(e) => handleHabitPressStart(e, key, habit, val)} onPointerUp={(e) => handleHabitPressEnd(e, key, habit, val)} className={`w-11 h-11 rounded-2xl mx-auto border-2 flex items-center justify-center font-black transition-all text-xl ${getButtonStyles(val, key)} ${parseLocalDate(key).setHours(0,0,0,0) > new Date().setHours(0,0,0,0) ? 'opacity-20 grayscale' : ''}`}>
                                                <span>
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
          let totalPct = 0;
          let doneCount = 0;
          activeHabitsList.forEach(h => {
            const r = dayData[h] ?? 0;
            const v = typeof r === 'number' ? r : (r ? 100 : 0);
            totalPct += v;
            if (v >= 100) doneCount++;
          });
          const dayPct = activeHabitsList.length > 0 ? Math.round(totalPct / activeHabitsList.length) : 0;
          const hasNote = Boolean(dayData.note && dayData.note.trim());
          const isFutureDay = new Date(dayDate).setHours(0, 0, 0, 0) > new Date().setHours(0, 0, 0, 0);
          const canToggleShield = !isFutureDay && (isShielded || shieldStats.availableCount > 0);

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
                      Efficiency: <span className="text-emerald-500 font-black">{dayPct}%</span> ({doneCount}/{activeHabitsList.length} habits done)
                    </p>
                  </div>
                  <button onClick={() => setSelectedHeatmapDay(null)} className={`p-1.5 rounded-xl ${getTextMuted()} hover:text-rose-500 transition-colors`} title="Close (ESC)">
                    <XIcon />
                  </button>
                </div>

                {/* Action Controls */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={handleJumpToMonth}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all ${
                      theme === 'dark' ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-emerald-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>Jump to Month in Table</span>
                    <ChevronRightIcon />
                  </button>

                  <button
                    disabled={!canToggleShield}
                    onClick={() => toggleShieldDate(selectedHeatmapDay)}
                    className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all ${
                      isShielded
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : canToggleShield
                        ? (theme === 'dark' ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-400' : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-cyan-500/40 hover:text-cyan-600')
                        : 'opacity-40 cursor-not-allowed border-slate-800 text-slate-500'
                    }`}
                    title={canToggleShield ? (isShielded ? 'Remove Streak Shield from this date' : 'Protect this date with a Streak Shield') : 'No streak shields available'}
                  >
                    <ShieldIcon />
                    <span>{isShielded ? '🛡️ Shield Active' : '🛡️ Use Streak Shield'}</span>
                  </button>
                </div>

                {/* Habits Checklist for that day */}
                <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1 mb-4">
                  {activeHabitsList.map((h) => {
                    const raw = dayData[h] ?? 0;
                    const val = typeof raw === 'number' ? raw : (raw ? 100 : 0);
                    const isDone = val >= 100;
                    return (
                      <div
                        key={h}
                        onClick={() => { if (!isFutureDay) updateHabitValue(selectedHeatmapDay, h, isDone ? 0 : 100); }}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${isFutureDay ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${
                          isDone
                            ? (theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700')
                            : (theme === 'dark' ? 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800/80' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100')
                        }`}
                      >
                        <span className="text-xs font-bold uppercase tracking-wide truncate">{h}</span>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-md ${isDone ? 'bg-emerald-500 text-white' : (theme === 'dark' ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-600')}`}>
                          {val}%
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border shrink-0 ${
                      theme === 'dark' ? 'bg-blue-900/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
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
                        <circle cx="72" cy="72" r="64" fill="none" stroke={theme==='dark'?'#334155':'#e2e8f0'} strokeWidth="10" />
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
                        <span className={`text-[8px] uppercase font-black ${getTextMuted()} leading-none mb-0.5`}>Steps</span>
                        <input 
                          type="number" 
                          value={tempGoalVal} 
                          onChange={(e) => setTempGoalVal(e.target.value)} 
                          onBlur={() => {
                            let val = parseInt(tempGoalVal);
                            if (isNaN(val) || val < 1) val = 1;
                            setTempGoalVal(val);
                            const nc = {
                              ...habitConfigs, 
                              [viewingHabitMap]: {
                                ...(habitConfigs[viewingHabitMap] || {priority: 1, steps: 1}), 
                                steps: val
                              }
                            };
                            setHabitConfigs(nc); 
                            save(trackerData, habits, nc);
                          }} 
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.currentTarget.blur();
                          }}
                          className="w-full text-center text-xs font-black bg-transparent focus:outline-none focus:text-emerald-500" 
                        />
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
                        <circle cx="72" cy="72" r="64" fill="none" stroke={theme==='dark'?'#334155':'#e2e8f0'} strokeWidth="10" />
                        <motion.circle initial={{ strokeDashoffset: 402 }} animate={{ strokeDashoffset: 402 - (402 * habitInsights.score / 100) }} transition={{ duration: 1.5, ease: "easeOut" }} cx="72" cy="72" r="64" fill="none" stroke="#10b981" strokeWidth="10" strokeDasharray={402} strokeLinecap="round" />
                      </svg>
                      <div className="flex flex-col items-center">
                        <span className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}><AnimatedNumber value={habitInsights.score} /></span>
                        <span className={`text-[8px] font-black ${getTextMuted()} uppercase tracking-widest`}>Score</span>
                      </div>
                    </div>

                    {/* Goal Input Desktop */}
                    <div className={`w-full mb-5 p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
                      <label className={`text-[7px] font-black uppercase ${getTextMuted()} block mb-0.5 text-center`}>Goal Steps</label>
                      <input 
                        type="number" 
                        value={tempGoalVal} 
                        onChange={(e) => setTempGoalVal(e.target.value)} 
                        onBlur={() => {
                          let val = parseInt(tempGoalVal);
                          if (isNaN(val) || val < 1) val = 1;
                          setTempGoalVal(val);
                          const nc = {
                            ...habitConfigs, 
                            [viewingHabitMap]: {
                              ...(habitConfigs[viewingHabitMap] || {priority: 1, steps: 1}), 
                              steps: val
                            }
                          };
                          setHabitConfigs(nc); 
                          save(trackerData, habits, nc);
                        }} 
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') e.currentTarget.blur();
                        }}
                        className="w-full text-center text-xl font-black p-1 rounded bg-transparent focus:outline-none focus:text-emerald-500 transition-colors" 
                      />
                    </div>

                    {/* Rank & Streaks Desktop */}
                    <div className="w-full space-y-4">
                      <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-sm' : 'bg-white border-slate-100 shadow-sm'} p-4 rounded-xl border flex flex-col items-center text-center transition-all relative overflow-hidden group/rank w-full`}>
                        <div className={`mb-1 transition-all duration-500 ${
                          habitInsights.level === "Grandmaster" ? "text-emerald-500 scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" : 
                          habitInsights.level === "Elite" ? "text-blue-500" : 
                          habitInsights.level === "Adept" ? "text-purple-500" : 
                          habitInsights.level === "Apprentice" ? "text-amber-500" : "text-slate-400 opacity-50"
                        }`}>
                          <TrophyIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className={`text-[9px] block uppercase font-black ${getTextMuted()} leading-none mb-0.5`}>Rank</span>
                          <span className={`text-xs font-black transition-colors ${
                            habitInsights.level === "Grandmaster" ? "text-emerald-500" : (theme === 'dark' ? 'text-slate-200' : 'text-slate-800')
                          }`}>{habitInsights.level}</span>
                        </div>
                        
                        <div className="flex gap-0.5 mt-2 opacity-30 group-hover/rank:opacity-100 transition-opacity">
                          {['Seed', 'Apprentice', 'Adept', 'Elite', 'Grandmaster'].map((r) => (
                            <div key={r} className={`w-1 h-1 rounded-full ${habitInsights.level === r ? 'bg-emerald-500 scale-125' : 'bg-slate-600'}`} />
                          ))}
                        </div>
                      </div>

                      <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-sm' : 'bg-white border-slate-100 shadow-sm'} p-3 rounded-xl border flex flex-col items-center text-center transition-colors w-full`}>
                        <div className="text-orange-600 scale-90 mb-1"><FlameIcon /></div>
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7"/><path d="M9 13v-3"/><path d="M15 13v-3"/></svg>
                      Archive
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} title="Delete habit" onClick={() => setShowDeleteConfirm(true)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 md:py-3 px-3 md:px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20">
                      <TrashIcon /> Delete
                    </motion.button>
                  </div>
                </div>

                {/* MAIN CALENDAR SECTION */}
                <div className="flex-1 p-4 md:p-6 flex flex-col md:overflow-y-auto custom-scrollbar">
                  <div className="flex items-start justify-between mb-6 gap-3">
                    <div className="flex-1 flex flex-col items-center text-center">
                      <div className="flex flex-col items-center gap-1.5 w-full">
                        {isEditingTabName ? (
                          <input autoFocus className={`text-xl font-black bg-transparent focus:outline-none border-b-2 border-emerald-500 text-center w-full max-w-[200px] ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`} value={tempHabitName} onChange={(e) => setTempHabitName(e.target.value)} onBlur={handleTabRename} onKeyDown={(e) => e.key === 'Enter' && handleTabRename()} />
                        ) : (
                          <h3 className={`text-lg md:text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'} leading-tight cursor-pointer hover:text-emerald-500 transition-colors flex items-center justify-center gap-2 group w-full`} onClick={() => { setIsEditingTabName(true); setTempHabitName(viewingHabitMap); }}>
                            {viewingHabitMap}
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity"><EditIcon /></span>
                          </h3>
                        )}
                        
                        <select 
                          value={habitConfigs[viewingHabitMap]?.category || 'all'} 
                          onChange={(e) => {
                            const newConfigs = {
                              ...habitConfigs,
                              [viewingHabitMap]: { ...(habitConfigs[viewingHabitMap] || {steps: 1}), category: e.target.value }
                            };
                            setHabitConfigs(newConfigs);
                            save(trackerData, habits, newConfigs);
                          }}
                          className={`px-3 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer focus:outline-none appearance-none text-center
                            ${theme === 'dark' ? 'bg-slate-800 text-emerald-400 border-slate-700 hover:border-emerald-500' : 'bg-slate-100 text-emerald-600 border-slate-200 hover:border-emerald-400'}`}
                        >
                          <option value="all">Add to category</option>
                          {categories.filter(cat => cat !== 'all').map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className={`flex items-center justify-center gap-1 mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} title="Previous month" className="p-1 hover:text-emerald-500 transition-colors"><ChevronLeftIcon /></button>
                        <span className="text-[10px] font-black uppercase tracking-widest min-w-[80px] text-center">{currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}</span>
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} title="Next month" className="p-1 hover:text-emerald-500 transition-colors"><ChevronRightIcon /></button>
                        </div>
                    </div>
                    <button onClick={() => { setViewingHabitMap(null); setIsEditingTabName(false); }} className={`flex flex-col items-center gap-0.5 p-3 transition-all ${getTextMuted()} hover:text-rose-500 shrink-0`} title="Close (ESC)"><XIcon /><span className="text-[6px] font-mono opacity-50">ESC</span></button>
                  </div>

                  {/* Relocated Super Compact Priority Slider */}
                  <div className={`mb-6 p-2 px-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'} flex items-center gap-4`}>
                    <div className="flex items-center gap-2 shrink-0">
                      <label className={`text-[8px] font-black uppercase ${getTextMuted()} tracking-widest`}>Priority</label>
                      <span className="text-[11px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">{habitConfigs[viewingHabitMap]?.priority || 1}x</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" step="1"
                      value={habitConfigs[viewingHabitMap]?.priority || 1}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        const nc = {
                          ...habitConfigs,
                          [viewingHabitMap]: { ...(habitConfigs[viewingHabitMap] || {steps: 1}), priority: val }
                        };
                        setHabitConfigs(nc);
                        save(trackerData, habits, nc);
                      }}
                      className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 transition-all"
                    />
                  </div>

                  {/* Last 7 Days Activity Bar */}
                  <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                      <ActivityIcon className="w-4 h-4 text-slate-400" />
                      <p className={`text-[10px] font-black ${getTextMuted()} uppercase tracking-widest`}>Last 7 Days Activity</p>
                    </div>
                    <div className="grid grid-cols-7 gap-3">
                      {habitInsights.last7Days.map((day, i) => {
                        const isLiveDragging = activeSlider?.dateKey === day.key && activeSlider?.habit === viewingHabitMap;
                        const displayPct = isLiveDragging ? activeSlider.value : day.pct;

                        return (
                          <div key={i} className="flex flex-col items-center gap-2">
                            <div className={`w-full aspect-square rounded-2xl border-2 overflow-hidden relative ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                              <motion.div 
                                id={`bar-fill-${day.key}`} // This allows direct DOM updates
                                initial={{ height: 0 }}
                                animate={{ height: `${displayPct}%` }}
                                // Matches the duration-700 ease style from v12.6
                                transition={{ duration: 0.7, ease: "easeInOut" }}
                                className={`absolute bottom-0 w-full ${displayPct >= 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                              />
                            </div>
                            <span className={`text-[10px] font-black ${day.isToday ? 'text-emerald-500' : (theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}`}>
                              {day.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-3 text-center">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <span key={i} className={`text-[10px] font-black ${theme === 'dark' ? 'text-slate-700' : 'text-slate-300'} uppercase`}>{day}</span>)}
                    {modalCalendarGrid.map((day, idx) => {
                      const key = getSafeKey(day); 
                      const isOtherMonth = day.getMonth() !== currentDate.getMonth();
                      const v = typeof trackerData[key]?.[viewingHabitMap] === 'number' ? trackerData[key]?.[viewingHabitMap] : (trackerData[key]?.[viewingHabitMap] ? 100 : 0);
                      const isTodayCell = new Date().toDateString() === day.toDateString();
                      const isPassedCell = new Date(day).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
                      const config = habitConfigs[viewingHabitMap];
                      const stepVal = config?.steps > 1 ? Math.round((v / 100) * config.steps) : null;
                      
                      return (
                          <motion.div key={idx} whileTap={{ scale: 0.9 }} 
    onPointerDown={(e) => handleHabitPressStart(e, key, viewingHabitMap, v)} 
    onPointerUp={(e) => handleHabitPressEnd(e, key, viewingHabitMap, v)} 
    className={`aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all border-2 touch-none select-none ${getButtonStyles(v, key)} ${isTodayCell ? 'ring-2 ring-emerald-400 ring-offset-2' : ''} ${isOtherMonth ? 'opacity-30 pointer-events-none' : ''}`}>
                              <span className={`text-[8px] font-black pointer-events-none ${v > 0 ? 'text-white/60' : (theme === 'dark' ? 'text-slate-600' : 'text-slate-400')}`}>{day.getDate()}</span>
                              <span className={`text-xs font-black pointer-events-none ${v > 0 ? 'text-white' : (isPassedCell ? 'text-red-500' : 'text-white [text-shadow:_-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000]')} ${v > 0 && v < 100 ? 'text-[9px]' : ''}`}>
                                  {stepVal !== null ? stepVal : (v === 100 ? '✔' : (v > 0 ? `${Math.round(v)}%` : '✘'))}
                              </span>
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
              <p className="absolute -top-12 text-white font-black uppercase text-xs tracking-widest whitespace-nowrap drop-shadow-xl z-10">{activeSlider.habit}</p>
              <div id="mastery-slider-track" className="relative w-24 h-64 bg-white/10 rounded-[2.5rem] border-4 border-white/30 overflow-hidden shadow-2xl backdrop-blur-3xl ring-8 ring-white/5 cursor-ns-resize">
                  <div 
                    id="mastery-slider-fill"
                    className="absolute bottom-0 w-full bg-white transition-all duration-75 shadow-[0_0_25px_rgba(255,255,255,0.5)]" 
                    style={{ height: `${activeSlider.value}%` }} 
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
```

---

