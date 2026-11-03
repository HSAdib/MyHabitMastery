## File: src/App.jsx (Continued)
Location: `src/App.jsx` (Continued)

```jsx
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
              <h4 className="text-xl font-black mb-2">Delete Habit?</h4>
              <p className={`text-sm ${getTextMuted()} mb-8 font-medium`}>This will permanently delete data for <span className="text-rose-500 font-bold">"{viewingHabitMap || editingHabitName || tempHabitName}"</span>.</p>
              <div className="flex gap-4">
                <button onClick={() => setShowDeleteConfirm(false)} title="Cancel delete" className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>Cancel</button>
                <button onClick={() => deleteHabit(viewingHabitMap || editingHabitName || tempHabitName)} title="Confirm delete" className="flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest bg-rose-500 text-white shadow-lg shadow-rose-500/20">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}

{/* --- MANAGE HYBRID MODAL --- */}
        {showManageModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setShowManageModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl relative flex flex-col h-[560px]`} onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowManageModal(false)} title="Close (ESC)" className="absolute -top-4 -right-4 z-10 p-2 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-500/50 hover:shadow-[0_0_16px_4px_rgba(239,68,68,0.5)] transition-all duration-200">
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

              {/* Habits Management Pro-Tip Banner */}
              {!seenManageTip && (
                <div className={`mb-4 p-3 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'} flex items-center justify-between gap-3`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">💡</span>
                    <div className="min-w-0">
                      <p className={`text-[10px] font-black uppercase tracking-wider ${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'}`}>
                        Pro-Tip: Archive vs Delete
                      </p>
                      <p className={`text-[11px] font-medium leading-tight ${getTextMuted()}`}>
                        Archive paused habits to hide them while keeping all streaks, history, and XP safe!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSeenManageTip(true);
                      try { localStorage.setItem('adib_seen_manage_tip', 'true'); } catch (e) {}
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 border transition-all ${
                      theme === 'dark'
                        ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-300'
                        : 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-800'
                    }`}
                  >
                    Got It
                  </button>
                </div>
              )}

              {manageModalTab === 'habits' ? (
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="flex gap-2 mb-4 shrink-0">
                    <input 
                      type="text" 
                      placeholder="New habit..." 
                      value={newHabitInput}
                      onChange={(e) => {
                        setNewHabitInput(e.target.value);
                        if (habitInputError) setHabitInputError('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddHabitFromInput()}
                      className={`flex-1 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none border-2 transition-all ${
                        habitInputError ? 'border-rose-500/70 focus:border-rose-500' :
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
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                    {habits.map((habit, index) => (
                      <div key={habit} className={`p-3 rounded-2xl border flex items-center justify-between transition-colors ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                          <span className={`text-xs font-black w-5 text-center shrink-0 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{index + 1}</span>
                          
                          {/* INLINE EDITING LOGIC - Removed onBlur entirely to fix focus loops */}
                          {editingHabitName === habit ? (
                            <input 
                              autoFocus 
                              className={`text-sm font-black uppercase w-full bg-transparent focus:outline-none border-b border-emerald-500 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`} 
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
                            <span className={`text-sm font-black uppercase truncate ${archivedHabits.includes(habit) ? 'opacity-40 line-through' : ''} ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                              {habit}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 shrink-0">
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
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>
                            ) : (
                              <EditIcon />
                            )}
                          </button>

                          {/* DELETE BUTTON */}
                          <button 
                            onClick={() => { setTempHabitName(habit); setShowDeleteConfirm(true); }}
                            className={`p-1.5 rounded-lg transition-all ${theme === 'dark' ? 'hover:bg-slate-700 hover:text-rose-400 text-slate-400' : 'hover:bg-slate-200 hover:text-rose-600 text-slate-500'}`}
                            title="Delete Habit"
                          >
                            <TrashIcon />
                          </button>

                          <div className={`w-px h-4 mx-1 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'}`} />

                          {/* UP BUTTON */}
                          <button 
                            onClick={() => {
                              if (index === 0) return;
                              const newHabits = [...habits];
                              [newHabits[index - 1], newHabits[index]] = [newHabits[index], newHabits[index - 1]];
                              setHabits(newHabits);
                              save(trackerData, newHabits, habitConfigs);
                            }}
                            disabled={index === 0}
                            title="Move habit up"
                            className={`p-1.5 rounded-lg transition-all ${index === 0 ? 'opacity-30 cursor-not-allowed' : (theme === 'dark' ? 'hover:bg-slate-700 hover:text-emerald-400' : 'hover:bg-slate-200 hover:text-emerald-600')} ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
                          >
                            <ChevronUpIcon />
                          </button>

                          {/* DOWN BUTTON */}
                          <button 
                            onClick={() => {
                              if (index === habits.length - 1) return;
                              const newHabits = [...habits];
                              [newHabits[index + 1], newHabits[index]] = [newHabits[index], newHabits[index + 1]];
                              setHabits(newHabits);
                              save(trackerData, newHabits, habitConfigs);
                            }}
                            disabled={index === habits.length - 1}
                            title="Move habit down"
                            className={`p-1.5 rounded-lg transition-all ${index === habits.length - 1 ? 'opacity-30 cursor-not-allowed' : (theme === 'dark' ? 'hover:bg-slate-700 hover:text-emerald-400' : 'hover:bg-slate-200 hover:text-emerald-600')} ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
                          >
                            <ChevronDownIcon />
                          </button>
                        </div>
                      </div>
                    ))}
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
                      className={`flex-1 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none border-2 transition-all ${
                        catInputError ? 'border-rose-500/70 focus:border-rose-500' :
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

                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
                    {categories.map((cat, index) => (
                      <div key={cat} className={`flex items-center justify-between p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        
                        {editingCat?.name === cat ? (
                          <input 
                            autoFocus
                            type="text" 
                            value={editingCat.temp}
                            onChange={(e) => setEditingCat({ ...editingCat, temp: e.target.value })}
                            onBlur={() => handleCategoryRename(cat, editingCat.temp)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCategoryRename(cat, editingCat.temp)}
                            className={`w-full bg-transparent font-black uppercase text-[10px] focus:outline-none border-b border-emerald-500 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}
                          />
                        ) : (
                          <span className={`text-[10px] font-black uppercase ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{cat}</span>
                        )}

                        <div className="flex items-center gap-1">
                          {cat !== 'all' && (
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
                                className={`p-1.5 rounded-lg transition-all ${theme === 'dark' ? 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                              >
                                <EditIcon />
                              </button>
                              <button 
                                onClick={() => deleteCategory(cat)}
                                title="Delete category"
                                className={`p-1.5 rounded-lg transition-all ${theme === 'dark' ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}
                              >
                                <TrashIcon />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

{/* --- ARCHIVE MODAL --- */}
        {showArchiveModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[350] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={() => setShowArchiveModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl relative flex flex-col max-h-[85vh]`} onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowArchiveModal(false)} title="Close (ESC)" className={`absolute top-6 right-6 p-2 ${getTextMuted()} hover:text-rose-500 transition-all`}><XIcon /></button>
              
              <div className="mb-6 shrink-0">
                <p className={`text-[10px] font-black ${getTextMuted()} uppercase tracking-[0.2em] mb-1`}>Hidden Habits</p>
                <h3 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Archived List</h3>
              </div>

              <div className="overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {archivedHabits.length > 0 ? (
                  archivedHabits.map(habit => (
                    <div key={habit} className={`p-4 rounded-2xl border flex items-center justify-between ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`text-sm font-black uppercase ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{habit}</span>
                      <button 
                        onClick={() => toggleArchiveHabit(habit)}
                        title="Unarchive habit"
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-200'}`}
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
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
              
              <div className="mb-8 shrink-0">
                <p className={`text-[10px] font-black ${getTextMuted()} uppercase tracking-[0.2em] mb-1`}>Mastery Engine</p>
                <h3 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Level Details</h3>
              </div>

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
                      <div className={`w-5 h-5 rounded-full border-2 z-10 shrink-0 ${
                        isPast ? 'bg-emerald-500 border-emerald-500' : 
                        isCurrent ? 'bg-white dark:bg-slate-900 border-emerald-500 ring-4 ring-emerald-500/20' : 
                        'bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-600'
                      } flex items-center justify-center transition-all`}>
                        {isPast && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
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

              {/* Win Milestones Onboarding Guide */}
              {analytics.totalDone === 0 && (
                <div className={`mb-6 p-3.5 rounded-2xl border ${theme === 'dark' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'} flex items-center gap-3`}>
                  <div className="w-8 h-8 rounded-xl bg-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0 text-base">
                    🏆
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-wider ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'}`}>Win Milestones Roadmap</p>
                    <p className={`text-xs font-medium leading-relaxed ${getTextMuted()}`}>Every completed habit increases your total win count. Reach Milestone 1 (5 completions) to earn bonus rank XP!</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center mb-8">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 border-4 shadow-xl bg-yellow-500/10 border-yellow-500/40 text-yellow-500`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
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
                          <div className={`w-5 h-5 rounded-full border-2 z-10 shrink-0 ${
                            node.state === 'past' ? 'bg-yellow-500 border-yellow-500' : 
                            node.state === 'current' ? 'bg-white dark:bg-slate-900 border-yellow-500 ring-4 ring-yellow-500/20' : 
                            'bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-600'
                          } flex items-center justify-center transition-all`}>
                            {node.state === 'past' && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
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

        {/* --- TEXT SIZE MODAL --- */}
        {showTextSizeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setShowTextSizeModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border rounded-[2rem] w-full max-w-sm p-6 shadow-2xl overflow-hidden`} onClick={e => e.stopPropagation()}>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}><TextSizeIcon /></div>
                  <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Display Settings</h3>
                </div>
                <button onClick={() => setShowTextSizeModal(false)} title="Close (ESC)" className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}><XIcon /></button>
              </div>

              <div className="space-y-6">
                {/* Habit Card Size */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Habit Card Size</label>
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">{textSizes.tabSize || 110}px</span>
                  </div>
                  <input type="range" min="60" max="200" step="5" value={textSizes.tabSize || 110} onChange={(e) => updateTextSize('tabSize', e.target.value)} className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>

                {/* Habit Tab Size */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Habit Text</label>
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">{textSizes.habit}px</span>
                  </div>
                  <input type="range" min="5" max="24" step="1" value={textSizes.habit} onChange={(e) => updateTextSize('habit', e.target.value)} className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
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

              {/* Restore Defaults Button */}
              <div className={`mt-8 pt-6 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                <button 
                  onClick={() => {
                    const defaults = { habit: 14, table1: 12, table2: 11, tabSize: 110 };
                    setTextSizes(defaults); // setTextSizes already calls savePartialToIDB which persists to IDB + Firebase
                  }} 
                  title="Reset text sizes to default"
                  className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
                >
                  <RefreshIcon /> Restore Defaults
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
                  className={`flex-1 py-3 rounded-2xl text-sm font-black uppercase tracking-wider transition-all border ${
                    theme === 'dark' ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
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
              className={`border rounded-3xl w-full max-w-md p-7 shadow-2xl relative ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
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
              <div className={`p-3.5 rounded-2xl border text-xs font-semibold mb-6 flex items-start gap-2.5 ${
                theme === 'dark' ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
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
                  className={`w-full py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all ${
                    theme === 'dark' ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Stay in Offline Mode
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      {!isHydrating && authInitialized && !isAuthenticated && !guestName && (
        <NamePromptModal onOpenAuthModal={() => setShowAuthModal(true)} />
      )}

      <NamePromptModal
        isOpen={showWelcomeModal || showGuestPicker}
        onClose={() => {
          setShowWelcomeModal(false);
          setShowGuestPicker(false);
        }}
        onOpenAuthModal={() => {
          setShowWelcomeModal(false);
          setShowGuestPicker(false);
          setShowAuthModal(true);
        }}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar-track { background: ${theme === 'dark' ? '#0f172a' : '#f1f5f9'}; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${theme === 'dark' ? '#334155' : '#cbd5e1'}; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${theme === 'dark' ? '#475569' : '#94a3b8'}; }
      `}} />
    </div>
  );
}
```

---

## File: src/firebase.config.js
Location: `src/firebase.config.js`

```js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
} from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Credentials are loaded from .env (VITE_ prefix is required by Vite)
// Copy .env.example → .env and paste your Firebase project values there.
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

if (import.meta.env.DEV && !hasFirebaseConfig) {
  const missing = Object.entries(firebaseConfig)
    .filter(([, v]) => !v || String(v).startsWith('YOUR_'))
    .map(([k]) => k);
  console.warn(
    `[Firebase] Missing env vars: ${missing.join(', ')}.\n` +
    'Copy .env.example → .env and fill in your Firebase project credentials.\n' +
    'Running in local-only mode so the app can still load.'
  );
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

let app = null;
let auth = null;
let db = null;
let analytics = null;

if (hasFirebaseConfig) {
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);

    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } catch {
      // Already initialized (HMR) or persistence unavailable — use the existing instance.
      db = getFirestore(app);
    }

    if (firebaseConfig.measurementId) {
      isSupported()
        .then((yes) => {
          if (yes) analytics = getAnalytics(app);
        })
        .catch(() => {});
    }
  } catch (e) {
    console.error('[Firebase] Init failed, running local-only:', e);
    app = null;
    auth = null;
    db = null;
    analytics = null;
  }
}

export { auth, db, analytics };
export const isFirebaseConfigured = Boolean(auth && db);
```

---

## File: src/index.css
Location: `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@keyframes glow { 0% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.4); } 50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.8); } 100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.4); } }
.animate-glow { animation: glow 2s infinite ease-in-out; filter: drop-shadow(0 0 5px rgba(16, 185, 129, 0.6)); }

@keyframes glow-blue { 0% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.4); } 50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); } 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.4); } }
.animate-glow-blue { animation: glow-blue 2s infinite ease-in-out; filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.6)); }

.rolling-digit-container { perspective: 1000px; transform-style: preserve-3d; }

.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

tr[id^="row-"] { scroll-margin-top: 150px; scroll-margin-bottom: 150px; }

.tooltip-trigger { position: relative; display: flex; align-items: center; }
.tooltip-content {
  position: absolute; bottom: 120%; left: 50%; transform: translateX(-50%);
  padding: 6px 10px; background: #000; color: #fff; font-size: 10px; font-weight: 900;
  border-radius: 8px; white-space: nowrap; pointer-events: none; opacity: 0;
  transition: all 0.2s ease; z-index: 100; text-transform: uppercase; letter-spacing: 0.05em;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
}
.tooltip-trigger:hover .tooltip-content, .tooltip-trigger:active .tooltip-content {
  opacity: 1; bottom: 140%;
}

/* Left positioned tooltip for top-right icons */
.tooltip-left .tooltip-content {
  bottom: auto; left: auto; right: 125%; top: 50%; transform: translateY(-50%);
}
.tooltip-left:hover .tooltip-content, .tooltip-left:active .tooltip-content {
  opacity: 1; right: 145%; bottom: auto;
}
```

---

## File: src/main.jsx
Location: `src/main.jsx`

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AdminPanel from './components/AdminPanel.jsx'
import ProtectedAdminRoute from './components/ProtectedAdminRoute.jsx'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { 
    path: '/admin-panel', 
    element: (
      <ProtectedAdminRoute>
        <AdminPanel />
      </ProtectedAdminRoute>
    )
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
```

---

## File: src/utils.js
Location: `src/utils.js`

```js
export const getSafeKey = (date) => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0); // Use noon to prevent DST hours shifting days
};

export const loadConfettiScript = (callback) => {
  if (window.confetti) {
    callback();
    return;
  }
  let script = document.getElementById('canvas-confetti-script');
  if (!script) {
    script = document.createElement('script');
    script.id = 'canvas-confetti-script';
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
    document.head.appendChild(script);
  }
  script.addEventListener('load', callback, { once: true });
};

export const solveFluidPath = (points) => {
  if (!points || points.length < 2) return "";
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i]; const next = points[i + 1];
    const cp1x = curr.x + (next.x - curr.x) / 2; const cp2x = curr.x + (next.x - curr.x) / 2;
    d += ` C ${cp1x},${curr.y} ${cp2x},${next.y} ${next.x},${next.y}`;
  }
  return d;
};

export const getLevenshteinDistance = (a = '', b = '') => {
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();
  if (s1 === s2) return 0;
  if (!s1.length) return s2.length;
  if (!s2.length) return s1.length;
  const dp = Array.from({ length: s1.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= s2.length; j++) dp[0][j] = j;
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[s1.length][s2.length];
};

export const findClosestSuggestion = (query = '', candidates = []) => {
  const q = query.toLowerCase().trim();
  if (!q || !Array.isArray(candidates) || candidates.length === 0) return null;
  let best = null;
  let bestDist = Infinity;
  for (const item of candidates) {
    if (!item) continue;
    const target = String(item).trim();
    const tLower = target.toLowerCase();
    if (tLower.includes(q) || q.includes(tLower)) return target;
    const dist = getLevenshteinDistance(q, tLower);
    const maxAllowed = Math.max(2, Math.floor(target.length * 0.45));
    if (dist < bestDist && dist <= maxAllowed) {
      bestDist = dist;
      best = target;
    }
  }
  return best;
};
```

---

## File: eslint.config.js
Location: `eslint.config.js`

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
```

---

## File: firebase.json
Location: `firebase.json`

```json
{
  "firestore": {
    "database": "(default)",
    "location": "asia-south1",
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

## File: firestore.indexes.json
Location: `firestore.indexes.json`

```json
{
  // Example (Standard Edition):
  //
  // "indexes": [
  //   {
  //     "collectionGroup": "widgets",
  //     "queryScope": "COLLECTION",
  //     "fields": [
  //       { "fieldPath": "foo", "arrayConfig": "CONTAINS" },
  //       { "fieldPath": "bar", "mode": "DESCENDING" }
  //     ]
  //   },
  //
  //  "fieldOverrides": [
  //    {
  //      "collectionGroup": "widgets",
  //      "fieldPath": "baz",
  //      "indexes": [
  //        { "order": "ASCENDING", "queryScope": "COLLECTION" }
  //      ]
  //    },
  //   ]
  // ]
  //
  // Example (Enterprise Edition):
  //
  // "indexes": [
  //   {
  //     "collectionGroup": "reviews",
  //     "queryScope": "COLLECTION_GROUP",
  //     "apiScope": "MONGODB_COMPATIBLE_API",
  //     "density": "DENSE",
  //     "multikey": false,
  //     "fields": [
  //       { "fieldPath": "baz", "mode": "ASCENDING" }
  //     ]
  //   },
  //   {
  //     "collectionGroup": "items",
  //     "queryScope": "COLLECTION_GROUP",
  //     "apiScope": "MONGODB_COMPATIBLE_API",
  //     "density": "SPARSE_ANY",
  //     "multikey": true,
  //     "fields": [
  //       { "fieldPath": "baz", "mode": "ASCENDING" }
  //     ]
  //   },
  // ]
  "indexes": [],
  "fieldOverrides": []
}
```

---

## File: firestore.rules
Location: `firestore.rules`

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Each user can only read and write their own document.
    // Admin (hasanshahriaradib@gmail.com) can access all user documents.
    match /users/{userId} {
      allow read, write: if request.auth != null && (request.auth.uid == userId || request.auth.token.email == 'hasanshahriaradib@gmail.com');
    }

    // Global Settings (Default Habits)
    // Anyone can read the defaults, but ONLY the Admin can edit/write them.
    match /settings/{document} {
      allow read: if true; 
      allow write: if request.auth != null && request.auth.token.email == 'hasanshahriaradib@gmail.com';
    }

  }
}

```

---

## File: index.html
Location: `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Habit Mastery</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## File: package.json
Location: `package.json`

```json
{
  "name": "my-habit-mastery",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@vercel/analytics": "^1.5.0",
    "firebase": "^12.15.0",
    "framer-motion": "^11.18.2",
    "html2canvas": "^1.4.1",
    "idb-keyval": "^6.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.18.0",
    "recharts": "^3.7.0",
    "zustand": "^5.0.14"
  },
  "devDependencies": {
    "@babel/core": "^7.29.7",
    "@babel/generator": "^8.0.0",
    "@babel/parser": "^8.0.0",
    "@babel/traverse": "^8.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "vite": "^6.0.5",
    "vite-plugin-pwa": "^0.21.2"
  }
}
```

---

## File: postcss.config.js
Location: `postcss.config.js`

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## File: README.md
Location: `README.md`

```md
<div align="center">

# ⚡ MY HABIT MASTERY
### *The High-Performance, Gamified Habit Operating System*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-%E2%96%B6%20Launch%20App-10b981?style=for-the-badge&logo=vercel&logoColor=white)](https://myhabitmastery.vercel.app)
[![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-8b5cf6?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Storage](https://img.shields.io/badge/Offline%20First-IndexedDB-3b82f6?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
[![Cloud Sync](https://img.shields.io/badge/Cloud%20Sync-Firebase-ff9800?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com)
[![License](https://img.shields.io/badge/License-MIT-gray?style=for-the-badge)](./LICENSE)

<br/>

**Transform your daily disciplines into an addictive RPG.**  
Build momentum, earn XP, maintain streaks, and visualize your personal growth with interactive heatmaps, graphs, and zero-latency offline persistence.

[⚡ 30s Quickstart](#-quickstart-in-30-seconds) • [🎮 How It Works](#-how-to-use-the-complete-walkthrough) • [🏆 Gamification Mechanics](#-gamification--progression) • [📊 Data & Analytics](#-analytics--insights) • [⌨️ Shortcuts & Tricks](#%EF%B8%8F-pro-tips--shortcuts)

</div>

---

## ⚡ Quickstart in 30 Seconds

```
1. Open App ➜ 2. Check Daily Cells ➜ 3. Hit 100% ➜ 4. Trigger Confetti & Level Up!
```

1. **Launch the Web App** at **[myhabitmastery.vercel.app](https://myhabitmastery.vercel.app)**.
2. **Choose Your Identity**:
   - **Guest Mode**: Type any nickname and hit start immediately (saved privately in your browser's IndexedDB).
   - **Cloud Mode**: Sign in with Google to enable real-time multi-device sync across desktop and mobile.
3. **Check Today's Habits**: Click on any habit cell in today's column to log completion.
4. **Hit 100%**: Finish all daily habits to pop **Confetti 🎉**, bank **XP ⭐**, and extend your **Streak 🔥**!

---

## 🎮 How to Use (The Complete Walkthrough)

### 1. 📋 The Interactive Habit Matrix
The core of My Habit Mastery is a smooth, high-density spreadsheet grid designed for rapid daily logging without friction.

```
┌──────────────┬──────┬──────┬──────┬──────┬───────────────┐
│ Habits       │ Mon  │ Tue  │ Wed  │ Today│ Goal / Status │
├──────────────┼──────┼──────┼──────┼──────┼───────────────┤
│ 🏃 5km Run   │ 100% │ 100% │  -   │ [✓]  │ Single Step   │
│ 📚 Read Book │ 5/15 │ 15/15│ 10/15│ [15] │ Multi Step    │
│ 💧 Drink 3L  │ 100% │ 100% │ 100% │ [✓]  │ Streak Active │
└──────────────┴──────┴──────┴──────┴──────┴───────────────┘
```

- **Single-Step Habits** *(e.g., Workout, Meditation)*:
  - Click a cell once to mark it as **Done (100%)**.
  - Click again to reset if checked accidentally.
- **Multi-Step Habits** *(e.g., Read 15 pages, 20 pull-ups, solve 5 LeetCode problems)*:
  - Click to increment steps one by one.
  - Hover or click the **step slider** to jump directly to any step count.
- **Orientation Toggle (Horizontal ↔ Vertical)**:
  - Click the **Rotate Layout** icon in the header toolbar anytime.
  - **Horizontal Mode**: Days flow from left to right along a timeline.
  - **Vertical Mode**: Days stack row-by-row for ultra-clean vertical scrolling.
- **🖱️ Grab-to-Pan (Drag-to-Scroll)**:
  - No need to hunt for narrow scrollbars! Click and hold anywhere inside the table body to grab and pan across days like a digital canvas.
- **Auto-Snap to Today**:
  - The table automatically calculates today's local date and centers directly onto it the moment you open the app.

---

### 2. 🗂️ Categories & Habit Management

Keep your life balanced without cluttering your workspace:

- **Category Filtering**: Switch between **All**, **Health**, **Academic**, **Dev**, or **Lifestyle** tabs to isolate specific areas of your life.
- **Add Custom Habits**:
  - Type the habit title into the quick-add bar at the bottom and press `Enter`.
  - It automatically assigns itself to your active category.
- **Custom Goal Steps**:
  - Set custom target steps (e.g., `15` pages, `3` meditation sessions, `10000` steps) per habit.
- **Archive Instead of Delete**:
  - Completed a 30-day challenge or pausing a routine? **Archive** the habit. It disappears from your active daily table, but your past history, heatmap scores, and lifetime XP remain 100% intact.
- **Reorganize & Rename**:
  - Reorder habit positions, edit habit names inline, or create and delete categories on the fly.

---

### 3. 🏆 Gamification & Progression

Treating self-improvement like a game makes consistency automatic.

<div align="center">

```
  [ 🎯 Daily Actions ] ──▶ [ ⭐ Earn XP ] ──▶ [ 🆙 Level Up ] ──▶ [ 🏆 Unlock Trophies ]
```

</div>

- **⭐ XP System**:
  - Every checked cell deposits experience points directly into your profile.
  - Watch your header XP bar fill up in real time.
- **🆙 Level Up Celebrations**:
  - Breaking through your XP threshold triggers an animated level-up modal celebrating your newly reached milestone.
- **🔥 Streak Multiplier**:
  - Completing **100% of your habits for a day** counts towards your active streak.
  - See your flame counter rise day after day.
- **🎉 Confetti Explosion**:
  - The moment you finish your last remaining habit for today, celebratory particle confetti rains down on your screen.
- **🏆 Trophy Cabinet**:
  - Click your profile badge to open the achievements showcase: unlock badges for hitting 7-day streaks, 30-day masteries, century milestones, and perfect weeks.

---

### 4. 📝 Daily Journaling & Reflections

Data tells you *what* happened; journaling tells you *why*.

- **Attach a Note to Any Date**:
  - Click the small **Note 📝** icon in any date column header.
  - Jot down your thoughts, workout notes, energy levels, or why a habit was missed.
  - Notes automatically record an automatic time badge (e.g., `10:45 PM`).
- **All-Notes Archive**:
  - Click the **Notes** icon in the navigation bar to read through a scrollable chronological diary of your entire habit journey.

---

### 5. 📊 Analytics & Insights

Uncover patterns and eliminate blind spots with automated data visualization:

| Analytics Tool | What It Reveals |
|---|---|
| **🟩 GitHub-Style Heatmap** | High-level 365-day visual density map of your consistency. Filterable by category or individual habit. |
| **📈 Weekly Performance Area Chart** | Day-by-day percentage curve revealing your strongest and weakest days of the week. |
| **📊 Monthly Comparison Bar Chart** | Month-over-month trend analysis to measure long-term trajectory. |
| **🔍 Per-Habit Deep Dive** | Click on any habit name to inspect its dedicated streak, total completions, and isolated annual heatmap. |

---

### 6. ☁️ Offline First + Real-Time Cloud Sync

Your data belongs to you — accessible anywhere, with or without Wi-Fi:

- **100% Offline-First Architecture**:
  - Powered by **IndexedDB** (`idb-keyval`). You can track habits on a flight, off-grid, or on subway commutes without a connection.
- **Seamless Cloud Sync**:
  - Sign in with Google to back up your database to **Firebase Firestore**.
  - Open the app on your laptop and your phone — changes sync across tabs and devices in real time.
- **Smart Conflict Resolution**:
  - Offline changes are safely merged via timestamp timestamps so local offline work is never overwritten.
- **Export & Import (Data Sovereignty)**:
  - Download a complete `.json` export of your habits, configs, notes, and history at any time.
  - Restore on any device with **Merge** (combine with existing) or **Overwrite** (clean slate).

---

### 7. 📱 Mobile Ready & PWA Installation

Turn My Habit Mastery into a native app on your phone or desktop:

- **Desktop (Chrome / Edge / Brave)**: Click the **Install Icon (⊕)** in your browser URL bar.
- **iOS (Safari)**: Tap `Share` ➜ `Add to Home Screen`.
- **Android**: Tap `More (...)` ➜ `Install App`.
- **Adaptive Mobile View**:
  - Auto-scales typography, button hitboxes, and table sizing for effortless one-handed thumb interaction on mobile screens.

---

## ⌨️ Pro Tips & Shortcuts

> [!TIP]
> **Hit `ESC` Anytime**: Close any active modal, chart, or settings pane instantly without clicking the `X` button.

> [!TIP]
> **Mouse Dragging**: Left-click and hold anywhere inside the grid to pan smoothly across weeks of history without using scrollbars.

> [!TIP]
> **OLED Dark Mode**: Toggle between crisp Dark Mode and clean Light Mode in one click using the sun/moon icon.

> [!TIP]
> **Keep Your Heatmap Alive**: Always **Archive** inactive habits instead of deleting them. Deleting removes history; archiving preserves your lifetime visual streak!

---

## 🛠️ Tech Stack

```
Frontend    │ React 18, Vite 6, Tailwind CSS
State       │ Zustand (Reactive State & Selectors)
Storage     │ IndexedDB (idb-keyval) + Firebase Firestore
Visuals     │ Framer Motion, Recharts, Canvas Confetti
PWA Engine  │ Vite PWA Plugin + Workbox Cache
Hosting     │ Vercel + Vercel Analytics
```

---

## 💻 Local Setup & Development

```bash
# 1. Clone the repo
git clone https://github.com/HSAdib/MyHabitMastery.git
cd MyHabitMastery

# 2. Install dependencies
npm install

# 3. Environment Setup (Optional for local guest mode)
cp .env.example .env

# 4. Start the dev server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 📄 License & Credits

Built with ❤️ by **[Hasan Shahriar Adib](https://github.com/HSAdib)**  
Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

<div align="center">

*"We are what we repeatedly do. Excellence, then, is not an act, but a habit." — Will Durant*

⭐ **Star this repository if My Habit Mastery helps you stay consistent!**

</div>
```

---

## File: tailwind.config.js
Location: `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

---

## File: vercel.json
Location: `vercel.json`

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## File: vite.config.js
Location: `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      manifest: {
        name: 'My Habit Mastery',
        short_name: 'MyHabitMastery',
        description: 'Track your habits, master your life.',
        theme_color: '#0f172a', // Matches your Slate-900 background
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    strictPort: true,
  }
})
```

---

