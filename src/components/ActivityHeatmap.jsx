import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useHabitStore } from '../store/useHabitStore';
import { getSafeKey } from '../utils';

const ActivityIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
);
const NoteIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
);
const ShieldIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const HeatmapGrid = React.memo(function HeatmapGrid({
  cells,
  monthLabels,
  theme,
  isMobileMode,
  onHoverCell,
  onLeaveGrid,
  onSelectDay,
}) {
  const textMuted = theme === 'dark' ? 'text-slate-500' : 'text-slate-400';
  const CELL_SIZE = isMobileMode ? 9 : 11;
  const CELL_GAP = isMobileMode ? 2 : 3;

  const intensityStyles = theme === 'dark'
    ? ['bg-slate-800', 'bg-emerald-900/40', 'bg-emerald-800', 'bg-emerald-600', 'bg-emerald-400']
    : ['bg-slate-100', 'bg-emerald-100', 'bg-emerald-300', 'bg-emerald-500', 'bg-emerald-700'];

  return (
    <div className={`overflow-x-auto custom-scrollbar pb-2 ${isMobileMode ? 'whitespace-nowrap' : ''}`}>
      <div className="inline-block min-w-full">
        <div className="relative h-3 mb-1" style={{ marginLeft: `${isMobileMode ? 16 : 24}px` }}>
          {monthLabels.map((m, idx) => (
            <span
              key={idx}
              className={`absolute text-[7px] md:text-[8px] font-black ${textMuted} uppercase tracking-tighter text-left`}
              style={{ left: `${m.weekIndex * (CELL_SIZE + CELL_GAP)}px` }}
            >
              {m.label}
            </span>
          ))}
        </div>
        <div className="flex gap-1 md:gap-2">
          <div
            className="grid grid-rows-7 gap-[2px] md:gap-[3px] text-[6px] md:text-[7px] font-black opacity-60 uppercase tracking-tighter text-slate-500 w-3 md:w-4 shrink-0 text-right pr-1"
            style={{ height: `${7 * CELL_SIZE + 6 * CELL_GAP}px`, lineHeight: `${CELL_SIZE}px` }}
          >
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>
          <div
            onMouseLeave={onLeaveGrid}
            className="grid grid-rows-7 grid-flow-col gap-[2px] md:gap-[3px] min-h-[70px] md:min-h-[95px]"
          >
            {cells.map((cell, idx) => {
              if (!cell) {
                return (
                  <div
                    key={`empty-${idx}`}
                    style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}
                    className="opacity-0 pointer-events-none"
                  />
                );
              }
              const cellColor = (cell.isShielded && cell.intensity === 0)
                ? 'bg-cyan-500/30 ring-1 ring-cyan-400/60'
                : intensityStyles[cell.intensity];
              const noteHighlight = cell.hasNote ? 'ring-1 ring-blue-400/80' : '';

              return (
                <div
                  key={cell.key}
                  style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}
                  className={`rounded-[1px] md:rounded-[2px] border-[0.5px] border-black/5 shadow-sm transition-transform duration-150 cursor-pointer hover:scale-125 hover:z-20 relative ${cellColor} ${noteHighlight}`}
                  title={`${cell.key}: ${cell.pct}% (${cell.doneCount}/${cell.totalCount})${cell.isShielded ? ' [Shielded 🛡️]' : ''}${cell.hasNote ? ' [Note 📝]' : ''} - Click to inspect`}
                  onMouseEnter={() => onHoverCell(cell)}
                  onClick={() => onSelectDay(cell.key)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

const ActivityHeatmap = React.memo(function ActivityHeatmap({
  noteCount,
  availableShields,
  onOpenNotes,
  onOpenInsights,
  onSelectDay,
  onboardingBanner = null,
}) {
  const [hoveredHeatmapCell, setHoveredHeatmapCell] = useState(null);

  const theme = useHabitStore(state => state.theme);
  const isMobileMode = useHabitStore(state => state.isMobileMode);
  const currentDate = useHabitStore(state => state.currentDate);
  const trackerData = useHabitStore(state => state.trackerData);
  const habits = useHabitStore(state => state.habits);
  const archivedHabits = useHabitStore(state => state.archivedHabits);
  const shieldedDates = useHabitStore(state => state.shieldedDates || []);
  const heatmapFilter = useHabitStore(state => state.heatmapFilter);
  const setHeatmapFilter = useHabitStore(state => state.setHeatmapFilter);

  const activeHabitsList = useMemo(
    () => habits.filter(h => !archivedHabits.includes(h)),
    [habits, archivedHabits]
  );

  const effectiveFilter = heatmapFilter === 'all' || activeHabitsList.includes(heatmapFilter)
    ? heatmapFilter
    : 'all';

  const handleLeaveGrid = useCallback(() => setHoveredHeatmapCell(null), []);

  const heatmapConfig = useMemo(() => {
    const year = currentDate.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1).getDay();
    const cells = Array(firstDayOfYear).fill(null);
    const daysInYear = ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) ? 366 : 365;

    for (let i = 0; i < daysInYear; i++) {
      const d = new Date(year, 0, 1, 12);
      d.setDate(d.getDate() + i);
      const key = getSafeKey(d);
      let intensity = 0;
      const isShielded = shieldedDates.includes(key);
      const hasNote = Boolean(trackerData[key]?.note && trackerData[key].note.trim());
      let pct = 0;
      let doneCount = 0;
      const totalCount = effectiveFilter === 'all' ? activeHabitsList.length : 1;

      if (effectiveFilter === 'all') {
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
        const r = trackerData[key]?.[effectiveFilter] ?? 0;
        const val = typeof r === 'number' ? r : (r ? 100 : 0);
        pct = Math.round(val);
        if (val >= 100) doneCount = 1;
        const ratio = val / 100;
        intensity = ratio === 0 ? 0 : ratio <= 0.25 ? 1 : ratio <= 0.5 ? 2 : ratio <= 0.75 ? 3 : 4;
      }
      cells.push({ date: d, key, intensity, pct, doneCount, totalCount, hasNote, isShielded });
    }

    const monthLabels = [];
    const addedMonths = new Set();
    cells.forEach((cell, index) => {
      if (cell && cell.date) {
        const m = cell.date.getMonth();
        if (!addedMonths.has(m)) {
          const weekIndex = Math.floor(index / 7);
          monthLabels.push({ label: cell.date.toLocaleString('default', { month: 'short' }), weekIndex });
          addedMonths.add(m);
        }
      }
    });
    return { cells, monthLabels };
  }, [currentDate, trackerData, activeHabitsList, effectiveFilter, shieldedDates]);

  const cardStyle = theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-sm' : 'bg-white border-slate-200 shadow-sm';
  const cardPadding = isMobileMode ? 'p-3 rounded-2xl' : 'p-6 rounded-[2.5rem]';

  return (
    <motion.div
      variants={itemVariants}
      className={`${isMobileMode ? '' : 'col-span-2'} ${cardStyle} ${cardPadding} border overflow-hidden flex flex-col transition-colors h-full min-w-0`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2 md:gap-4">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 md:gap-3">
              <span className={`hidden md:block text-[8px] md:text-[9px] font-black uppercase tracking-widest shrink-0 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                Activity Heatmap
              </span>
              <span className="md:hidden text-emerald-500"><ActivityIcon/></span>

              <select
                value={effectiveFilter}
                onChange={(e) => setHeatmapFilter(e.target.value)}
                className={`text-[11px] font-black uppercase px-2 py-1 rounded-full border transition-all duration-500 cursor-pointer focus:outline-none max-w-[80px] md:max-w-[120px] truncate ${
                  theme === 'dark'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:bg-emerald-500/20'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-300 shadow-sm'
                }`}
              >
                <option value="all" className={theme === 'dark' ? 'bg-slate-900' : 'bg-white'}>Overall</option>
                {activeHabitsList.map(h => (
                  <option key={h} value={h} className={theme === 'dark' ? 'bg-slate-900' : 'bg-white'}>{h}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-3 pl-2 md:pl-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenNotes}
              title="View all journal entries"
              className={`flex items-center gap-1.5 transition-all px-2.5 py-1.5 rounded-xl border relative ${
                noteCount > 0 ? 'animate-glow-blue' : ''
              } ${
                theme === 'dark'
                  ? 'bg-blue-900/20 text-blue-400 border-blue-500/30'
                  : 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm'
              }`}
            >
              <NoteIcon/>
              <span className="text-[10px] md:text-xs font-black">{noteCount}</span>
              {noteCount > 0 && (
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
                <ShieldIcon/>
                <span>{availableShields} Shields</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenInsights}
            title="Year in Review Insights"
            className={`flex items-center gap-1.5 transition-all px-3 py-1.5 rounded-xl border relative ${
              theme === 'dark'
                ? 'bg-purple-900/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/20'
                : 'bg-purple-50 text-purple-600 border-purple-200 shadow-sm hover:bg-purple-100'
            }`}
          >
            <span className="text-[11px] font-black uppercase tracking-widest hidden sm:block">Insights</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
          </motion.button>
        </div>
      </div>

      {onboardingBanner}

      <HeatmapGrid
        cells={heatmapConfig.cells}
        isMobileMode={isMobileMode}
        monthLabels={heatmapConfig.monthLabels}
        onHoverCell={setHoveredHeatmapCell}
        onLeaveGrid={handleLeaveGrid}
        onSelectDay={onSelectDay}
        theme={theme}
      />
    </motion.div>
  );
});

export default ActivityHeatmap;
