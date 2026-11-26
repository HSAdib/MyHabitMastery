import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useHabitStore } from '../store/useHabitStore';
import { getSafeKey, isHabitActiveOnDate } from '../utils';
import FilterDropdown from './FilterDropdown';

const ActivityIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
);
const NoteIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
);
const ShieldIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);
const HeatmapFireIcon = ({ theme }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[82%] h-[82%] pointer-events-none" fill={theme === 'dark' ? 'rgba(6, 40, 30, 0.48)' : 'rgba(2, 24, 18, 0.52)'}>
    <g transform="translate(-6.25, 25.73) scale(0.0185, -0.0185)">
      <path d="M950 1303 c-25 -21 -55 -49 -67 -63 -53 -60 -107 -191 -133 -324 -12 -58 -12 -58 -32 -39 -10 11 -25 37 -32 57 l-13 38 -22 -30 c-39 -55 -82 -159 -98 -238 -13 -66 -14 -92 -5 -158 57 -390 516 -537 773 -248 139 156 152 377 37 607 -59 117 -128 200 -128 153 0 -16 -31 -78 -40 -78 -11 0 -84 109 -119 178 -17 34 -37 88 -44 119 -8 31 -18 58 -23 60 -6 2 -30 -14 -54 -34z m147 -468 c41 -55 86 -122 100 -149 27 -53 40 -141 29 -199 -16 -87 -107 -167 -207 -182 -162 -24 -308 141 -266 301 18 69 86 186 165 285 76 95 64 99 179 -56z" />
    </g>
  </svg>
);

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const lerp = (a, b, t) => Math.round(a + (b - a) * t);

const getHeatmapCellBackground = (doneUnits, totalCount, isPerfectDay, theme) => {
  if (totalCount <= 0 || doneUnits <= 0) {
    return theme === 'dark' ? '#1e293b' : '#f1f5f9';
  }
  if (isPerfectDay) {
    return theme === 'dark' ? '#34f5a8' : '#065f46';
  }

  // Step color proportionally per active habit, capped at 0.85 so 100% stays clearly distinct
  const ratio = Math.max(0, Math.min(1, doneUnits / totalCount));
  const t = Math.max(0.04, Math.min(0.85, ratio * 0.92));
  if (theme === 'dark') {
    return `rgb(${lerp(6, 16, t)}, ${lerp(78, 185, t)}, ${lerp(59, 129, t)})`;
  }
  return `rgb(${lerp(209, 5, t)}, ${lerp(250, 150, t)}, ${lerp(229, 105, t)})`;
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
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setContainerWidth(el.clientWidth);
    measure();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const textMuted = theme === 'dark' ? 'text-slate-500' : 'text-slate-400';
  const numWeeks = Math.max(52, Math.ceil(cells.length / 7));
  const weekdayOffset = isMobileMode ? 14 : 18;
  const availWidth = Math.max(0, containerWidth - weekdayOffset - 10);
  const CELL_GAP = 2;
  const fittedSize = availWidth > 0
    ? Math.floor((availWidth - CELL_GAP * (numWeeks - 1)) / numWeeks)
    : (isMobileMode ? 10 : 14);
  const CELL_W = isMobileMode
    ? Math.max(10, Math.min(14, fittedSize))
    : Math.max(11, Math.min(20, fittedSize));
  const CELL_H = isMobileMode
    ? Math.max(12, Math.round(CELL_W * 1.25))
    : Math.max(18, Math.min(26, Math.round(CELL_W * 1.48)));

  return (
    <div ref={containerRef} className={`flex-1 flex flex-col justify-center overflow-x-auto overflow-y-hidden no-scrollbar py-1 ${isMobileMode ? 'whitespace-nowrap' : ''}`}>
      <div className="w-fit mx-auto">
        <div className="relative h-4 mb-1" style={{ marginLeft: `${weekdayOffset}px` }}>
          {monthLabels.map((m, idx) => (
            <span
              key={idx}
              className={`absolute text-[8px] md:text-[9px] font-black ${textMuted} uppercase tracking-tighter text-left`}
              style={{ left: `${m.weekIndex * (CELL_W + CELL_GAP)}px` }}
            >
              {m.label}
            </span>
          ))}
        </div>
        <div className="flex" style={{ gap: `${isMobileMode ? 3 : 4}px` }}>
          <div
            className="grid grid-rows-7 text-[7px] md:text-[8px] font-black opacity-60 uppercase tracking-tighter text-slate-500 shrink-0 text-right pr-0.5"
            style={{
              width: `${weekdayOffset - (isMobileMode ? 3 : 4)}px`,
              gap: `${CELL_GAP}px`,
              height: `${7 * CELL_H + 6 * CELL_GAP}px`,
              lineHeight: `${CELL_H}px`,
            }}
          >
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>
          <div
            onMouseLeave={onLeaveGrid}
            className="grid grid-rows-7 grid-flow-col"
            style={{ gap: `${CELL_GAP}px` }}
          >
            {cells.map((cell, idx) => {
              if (!cell) {
                return (
                  <div
                    key={`empty-${idx}`}
                    style={{ width: `${CELL_W}px`, height: `${CELL_H}px` }}
                    className="opacity-0 pointer-events-none"
                  />
                );
              }
              const isPerfectDay = cell.totalCount > 0 && cell.doneCount >= cell.totalCount;
              const isShieldOnly = cell.isShielded && cell.doneUnits === 0;
              const cellStyle = isShieldOnly
                ? { width: `${CELL_W}px`, height: `${CELL_H}px` }
                : { width: `${CELL_W}px`, height: `${CELL_H}px`, backgroundColor: getHeatmapCellBackground(cell.doneUnits, cell.totalCount, isPerfectDay, theme) };
              const cellColor = isShieldOnly ? 'bg-cyan-500/30 ring-1 ring-cyan-400/60' : '';
              const noteHighlight = cell.hasNote ? 'ring-1 ring-blue-400/80' : '';

              return (
                <div
                  key={cell.key}
                  style={cellStyle}
                  className={`rounded-[2px] md:rounded-[3px] border-[0.5px] border-black/5 shadow-sm transition-transform duration-150 cursor-pointer hover:scale-125 hover:z-20 relative flex items-center justify-center ${cellColor} ${noteHighlight}`}
                  title={`${cell.key}: ${cell.pct}% (${cell.doneCount}/${cell.totalCount})${isPerfectDay ? ' [All Done 🔥]' : ''}${cell.isShielded ? ' [Shielded 🛡️]' : ''}${cell.hasNote ? ' [Note 📝]' : ''} - Click to inspect`}
                  onMouseEnter={() => onHoverCell(cell)}
                  onClick={() => onSelectDay(cell.key)}
                >
                  {isPerfectDay && <HeatmapFireIcon theme={theme} />}
                </div>
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
  onOpenShields,
  onSelectDay,
  onboardingBanner = null,
}) {
  const [hoveredHeatmapCell, setHoveredHeatmapCell] = useState(null);

  const theme = useHabitStore(state => state.theme);
  const isMobileMode = useHabitStore(state => state.isMobileMode);
  const currentDate = useHabitStore(state => state.currentDate);
  const trackerData = useHabitStore(state => state.trackerData);
  const habits = useHabitStore(state => state.habits);
  const habitConfigs = useHabitStore(state => state.habitConfigs);
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
      const isShielded = shieldedDates.includes(key);
      const hasNote = Boolean(trackerData[key]?.note && trackerData[key].note.trim());
      let pct = 0;
      let doneCount = 0;
      let doneUnits = 0;

      const dayHabits = effectiveFilter === 'all'
        ? activeHabitsList.filter(h => isHabitActiveOnDate(h, key, archivedHabits, habitConfigs))
        : (isHabitActiveOnDate(effectiveFilter, key, archivedHabits, habitConfigs) ? [effectiveFilter] : []);

      const totalCount = dayHabits.length;

      if (totalCount > 0) {
        let totalPct = 0;
        dayHabits.forEach(h => {
          const r = trackerData[key]?.[h] ?? 0;
          const v = typeof r === 'number' ? r : (r ? 100 : 0);
          totalPct += v;
          if (Math.round(v) >= 100) doneCount++;
        });
        doneUnits = totalPct / 100;
        pct = Math.round((totalPct / (totalCount * 100)) * 100);
      }
      cells.push({ date: d, key, pct, doneCount, doneUnits, totalCount, hasNote, isShielded });
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
  }, [currentDate, trackerData, activeHabitsList, archivedHabits, habitConfigs, effectiveFilter, shieldedDates]);

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
              <span className={`hidden md:block text-[10px] font-black uppercase tracking-wider shrink-0 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                Activity Heatmap
              </span>
              <span className="md:hidden text-emerald-500"><ActivityIcon/></span>

              <FilterDropdown
                value={effectiveFilter}
                onChange={setHeatmapFilter}
                theme={theme}
                preserveCase
                maxWidthClass="max-w-[95px] md:max-w-[130px]"
                options={[
                  { value: 'all', label: 'Overall' },
                  ...activeHabitsList.map(h => ({ value: h, label: h })),
                ]}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2.5 pl-1 md:pl-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenNotes}
              title="View all journal entries"
              className={`h-6 flex items-center gap-1 transition-all px-2.5 rounded-lg border relative text-[10px] font-black leading-none ${
                noteCount > 0 ? 'animate-glow-blue' : ''
              } ${
                theme === 'dark'
                  ? 'bg-blue-900/20 text-blue-400 border-blue-500/30'
                  : 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm'
              }`}
            >
              <NoteIcon/>
              <span>{noteCount}</span>
              {noteCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
              )}
            </motion.button>

            {hoveredHeatmapCell ? (
              <div className={`hidden sm:flex h-6 items-center gap-1.5 px-2.5 rounded-lg border text-[10px] font-bold leading-none ${theme === 'dark' ? 'bg-slate-800/90 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                <span className="font-mono text-emerald-400">{hoveredHeatmapCell.key}</span>
                <span>•</span>
                <span className="font-black text-emerald-500">{hoveredHeatmapCell.pct}%</span>
                <span className="opacity-70 text-[9px]">({hoveredHeatmapCell.doneCount}/{hoveredHeatmapCell.totalCount})</span>
                {hoveredHeatmapCell.isShielded && <span title="Streak Shield Active" className="text-cyan-400">🛡️</span>}
                {hoveredHeatmapCell.hasNote && <span title="Has Journal Note" className="text-blue-400">📝</span>}
              </div>
            ) : (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenShields}
                title="View Streak Shields details & earn history"
                className={`flex h-6 items-center gap-1 px-2.5 rounded-lg border text-[10px] font-black uppercase tracking-wider leading-none transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400/50'
                    : 'bg-cyan-50 border-cyan-200 text-cyan-600 hover:bg-cyan-100 hover:border-cyan-300 shadow-sm'
                }`}
              >
                <ShieldIcon/>
                <span>{availableShields} Shields</span>
              </motion.button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenInsights}
            title="Year in Review Insights"
            className={`h-6 flex items-center gap-1 transition-all px-2.5 rounded-lg border relative text-[10px] font-black uppercase tracking-wider leading-none ${
              theme === 'dark'
                ? 'bg-purple-900/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/20'
                : 'bg-purple-50 text-purple-600 border-purple-200 shadow-sm hover:bg-purple-100'
            }`}
          >
            <span className="hidden sm:block">Insights</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
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
