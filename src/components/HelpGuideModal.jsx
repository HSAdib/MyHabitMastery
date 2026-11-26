import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLogo from './AppLogo';

const MiniFireSvg = ({ className = 'w-3 h-3' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <g transform="translate(-6.25, 25.73) scale(0.0185, -0.0185)">
      <path d="M950 1303 c-25 -21 -55 -49 -67 -63 -53 -60 -107 -191 -133 -324 -12 -58 -12 -58 -32 -39 -10 11 -25 37 -32 57 l-13 38 -22 -30 c-39 -55 -82 -159 -98 -238 -13 -66 -14 -92 -5 -158 57 -390 516 -537 773 -248 139 156 152 377 37 607 -59 117 -128 200 -128 153 0 -16 -31 -78 -40 -78 -11 0 -84 109 -119 178 -17 34 -37 88 -44 119 -8 31 -18 58 -23 60 -6 2 -30 -14 -54 -34z m147 -468 c41 -55 86 -122 100 -149 27 -53 40 -141 29 -199 -16 -87 -107 -167 -207 -182 -162 -24 -308 141 -266 301 18 69 86 186 165 285 76 95 64 99 179 -56z" />
    </g>
  </svg>
);

const HelpSections = [
  {
    id: 'tracking',
    badge: '01 · Core Tracking',
    title: 'Logging Habits (Tap, Long-Press & Steps)',
    summary: 'Record full completions with one tap, or hold any cell to dial in partial percentages or step counts.',
    preview: (dk) => (
      <div className="space-y-3">
        <div className={`p-4 rounded-2xl border flex items-center justify-around gap-3 flex-wrap ${dk ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 border-2 border-emerald-600 text-white flex items-center justify-center text-lg font-black shadow-lg shadow-emerald-900/20">✔</div>
            <span className={`text-[9px] font-black uppercase tracking-wider ${dk ? 'text-emerald-400' : 'text-emerald-600'}`}>Tap = 100%</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 border-2 border-blue-700 text-white flex items-center justify-center text-[11px] font-black shadow-md shadow-blue-900/20">60%</div>
            <span className={`text-[9px] font-black uppercase tracking-wider ${dk ? 'text-blue-400' : 'text-blue-600'}`}>Hold = Slider</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center text-base font-black text-red-500 ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>✘</div>
            <span className={`text-[9px] font-black uppercase tracking-wider ${dk ? 'text-slate-400' : 'text-slate-500'}`}>Tap Again = 0%</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 opacity-40">
            <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center text-base font-black ${dk ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-white border-slate-200 text-slate-400'}`}>🔒</div>
            <span className={`text-[9px] font-black uppercase tracking-wider ${dk ? 'text-slate-500' : 'text-slate-400'}`}>Future Locked</span>
          </div>
        </div>

        {/* Goal Steps & Vertical Mastery Slider Showoff */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 flex-wrap ${dk ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-2 rounded-xl border text-center shrink-0 ${dk ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className={`text-[7px] font-black uppercase tracking-widest ${dk ? 'text-slate-400' : 'text-slate-500'}`}>Goal Steps</div>
              <div className="text-lg font-black text-emerald-500 leading-tight">8</div>
            </div>
            <div className={`text-[11px] space-y-1 font-semibold ${dk ? 'text-slate-300' : 'text-slate-600'}`}>
              <div className={`font-black text-xs ${dk ? 'text-white' : 'text-slate-800'}`}>Goal Steps Mode (e.g. 8 Glasses)</div>
              <div>Set <strong className={dk ? 'text-emerald-400' : 'text-emerald-600'}>Goal Steps &gt; 1</strong> inside any habit’s modal.</div>
              <div>Hold a cell &amp; slide up/down to snap by exact steps!</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Mini Vertical Mastery Slider */}
            <div className="w-8 h-16 rounded-xl border-2 border-white/30 bg-slate-800 relative overflow-hidden flex items-center justify-center shadow-inner">
              <div className="absolute bottom-0 left-0 right-0 h-[62%] bg-white" />
              <span className="relative z-10 text-xs font-black text-slate-900">5</span>
            </div>
            <span className={`text-xs font-black ${dk ? 'text-slate-500' : 'text-slate-400'}`}>→</span>
            <div className="flex items-center gap-1.5">
              <div className="flex flex-col items-center gap-1">
                <div className="w-9 h-9 rounded-xl bg-blue-600 border-2 border-blue-700 text-white flex items-center justify-center text-sm font-black shadow-sm">5</div>
                <span className={`text-[8px] font-black uppercase ${dk ? 'text-blue-400' : 'text-blue-600'}`}>5/8</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 border-2 border-emerald-600 text-white flex items-center justify-center text-sm font-black shadow-sm">8</div>
                <span className={`text-[8px] font-black uppercase ${dk ? 'text-emerald-400' : 'text-emerald-600'}`}>8/8</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    points: [
      'Quick Toggle: Tap or click any cell for today or a past day to switch between 100% completed (green ✔, or full Goal Step count) and 0% (✘).',
      'Mastery Slider (Partial Progress): Press and hold any cell for 450ms to open the vertical Mastery Slider. Drag up or down to dial in partial progress (1%–99%) — partial entries turn blue and still earn proportional XP.',
      'Goal Steps (Countable Habits): Open any habit circle and set Goal Steps (e.g. 8 for 8 glasses of water, 4 for 4 sets). When Goal Steps > 1, the Mastery Slider snaps directly to step numbers (0..8), the cell shows your step number (blue while in progress, emerald when all steps are done), and the Heatmap Day modal shows 5/8.',
      'Future Guard: Days after today are dimmed and locked so future habits cannot be pre-logged accidentally. Clicking a day in the Habit Detail calendar supports the exact same tap and long-press controls.',
    ],
  },
  {
    id: 'tabs',
    badge: '02 · Habit Rings',
    title: 'Habit Tabs, Streaks & Per-Habit Settings',
    summary: 'Each circular card displays live monthly completion, streak status, and opens full per-habit configuration.',
    preview: (dk) => (
      <div className={`p-4 rounded-2xl border flex items-center justify-center gap-6 flex-wrap ${dk ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className={`w-24 h-24 rounded-full relative flex flex-col items-center justify-center border shrink-0 ${dk ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <svg className="absolute inset-0 w-full h-full -rotate-90 p-1" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke={dk ? '#1e293b' : '#e2e8f0'} strokeWidth="5" />
            <circle cx="50" cy="50" r="46" fill="none" stroke="#10b981" strokeWidth="5" strokeDasharray="289" strokeDashoffset="58" strokeLinecap="round" />
          </svg>
          <span className={`text-[8px] font-black uppercase tracking-wider ${dk ? 'text-slate-300' : 'text-slate-600'}`}>Coding</span>
          <span className={`text-lg font-black leading-none my-0.5 ${dk ? 'text-white' : 'text-slate-800'}`}>80</span>
          <span className="text-[9px] font-black text-orange-500 flex items-center gap-0.5"><MiniFireSvg className="w-2.5 h-2.5" /> 5d</span>
        </div>
        <div className={`text-[11px] space-y-1.5 font-semibold ${dk ? 'text-slate-300' : 'text-slate-600'}`}>
          <div><span className="text-emerald-400 font-black">• Progress Ring:</span> Monthly % for the selected month</div>
          <div><span className="text-orange-400 font-black">• Fire Badge (2d+):</span> Appears only at 2+ days in a row</div>
          <div><span className="text-blue-400 font-black">• Click Circle:</span> Opens Month Calendar, Priority &amp; Steps</div>
          <div><span className="text-slate-400 font-black">• Hover Top Pencil:</span> Quick inline rename on dashboard</div>
        </div>
      </div>
    ),
    points: [
      'Streak Fire Rule: The orange fire counter at the bottom of a habit circle only lights up once you complete 2 or more consecutive days (100% each day, or bridged by a Streak Shield).',
      'Habit Detail Modal: Click any circle to open its monthly grid (where days with all active habits done glow green with a fire icon), plus controls for Priority (1x–10x XP weight), Goal Steps per day, Category assignment, Archive, and Delete.',
      'Adding Habits: Click the dashed + button at the end of the habit circles, or use the Manage Modal (Edit pill), to create a new habit in the currently selected category.',
    ],
  },
  {
    id: 'heatmap',
    badge: '03 · Heatmap',
    title: 'Per-Habit Heatmap & Archive History',
    summary: 'Every cell scales automatically to the number of active habits you had on that exact day.',
    preview: (dk) => (
      <div className={`p-4 rounded-2xl border space-y-3 ${dk ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className={`text-[9px] font-black uppercase ${dk ? 'text-slate-400' : 'text-slate-500'}`}>0/N</span>
            {[0, 1, 2, 3, 4, 5].map((step) => {
              const colors = dk
                ? ['#1e293b', 'rgb(8,92,69)', 'rgb(10,121,88)', 'rgb(13,150,106)', 'rgb(15,172,121)', '#34f5a8']
                : ['#f1f5f9', 'rgb(174,234,208)', 'rgb(122,210,175)', 'rgb(69,184,143)', 'rgb(24,160,115)', '#065f46'];
              return (
                <div
                  key={step}
                  style={{ backgroundColor: colors[step] }}
                  className="w-5 h-5 rounded-[4px] border border-black/10 flex items-center justify-center"
                  title={step === 5 ? 'All active habits done (N/N)' : `${step} of 5 habits done`}
                >
                  {step === 5 && <MiniFireSvg className={`w-3.5 h-3.5 ${dk ? 'text-[#06281e]/60' : 'text-[#021812]/60'}`} />}
                </div>
              );
            })}
            <span className={`text-[9px] font-black uppercase ${dk ? 'text-emerald-400' : 'text-emerald-600'}`}>N/N</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-black">Blue Ring = Note</span>
            <span className="px-2 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[10px] font-black">Cyan = Shielded</span>
          </div>
        </div>
        <p className={`text-[11px] font-medium leading-relaxed ${dk ? 'text-slate-400' : 'text-slate-600'}`}>
          Each completed habit shifts the cell one step deeper/brighter based on your <strong className={dk ? 'text-white' : 'text-slate-800'}>active habit count</strong> that day. Completing <strong className={dk ? 'text-emerald-400' : 'text-emerald-600'}>all active habits</strong> unlocks the brightest shade + fire watermark.
        </p>
      </div>
    ),
    points: [
      'Dynamic Per-Habit Scaling: Instead of fixed percentages, each tile’s color steps according to how many active habits you have (e.g., 1/4, 2/4, 3/4, 4/4 for 4 habits; 1/7..7/7 for 7 habits). Partial progress shifts smoothly between habit steps.',
      'Archive & Restore Accuracy: Currently archived habits are completely excluded. If you archive a habit on Day A and restore it on Day B, it counts again from Day B onward — and stays excluded from the denominator on the days between A and B when it was archived.',
      '100% Fire Watermark: Days where every active habit for that day reached 100% display a subtle shadow-print fire watermark while keeping full brightness.',
      'Filter & Inspect: Use the heatmap dropdown to view Overall or isolate a single habit. Hover any square for its breakdown, or click any square to toggle habits, edit notes, jump to that month, or toggle a Streak Shield.',
    ],
  },
  {
    id: 'shields',
    badge: '04 · Streak Shields',
    title: 'Protecting Streaks with Streak Shields',
    summary: 'Use a Shield on a missed day to keep your habit streaks alive without breaking momentum.',
    preview: (dk) => (
      <div className={`p-4 rounded-2xl border space-y-2.5 ${dk ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[11px] font-black uppercase">🛡️ Click Shields Pill</span>
          <span className={`text-[10px] font-bold ${dk ? 'text-slate-400' : 'text-slate-500'}`}>Available · Earned · Used · Daily Log</span>
        </div>
        <div className={`grid grid-cols-3 gap-2 text-center text-[10px] font-bold ${dk ? 'text-slate-300' : 'text-slate-700'}`}>
          <div className={`p-2 rounded-xl border ${dk ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>🌱 <strong>1</strong> Starter</div>
          <div className={`p-2 rounded-xl border ${dk ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>⚡ <strong>+1</strong> / Level Up</div>
          <div className={`p-2 rounded-xl border ${dk ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>🔥 <strong>+1</strong> / 7 Perfect</div>
        </div>
      </div>
    ),
    points: [
      'How to Earn Shields: Every account starts with 1 Starter Shield. You earn +1 Shield each time you gain a Level, plus +1 bonus Shield every 7 Perfect Days (days where all active habits on that day hit 100%).',
      'How to Use a Shield: Click any day square in the Activity Heatmap and click "Use Streak Shield" (today or past days). Shielded days bridge missed habits so your active streaks do not reset to 0.',
      'View Earn History: Click the cyan Shields button in the Activity Heatmap header to see your Available/Earned/Used totals, how each shield was earned, and the exact dates you earned or applied them.',
    ],
  },
  {
    id: 'journal',
    badge: '05 · Reflections',
    title: 'Daily Reflections & Journal History',
    summary: 'Capture daily thoughts right beside your habits and search your full reflection log anytime.',
    preview: (dk) => (
      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 flex-wrap ${dk ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${dk ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-500 border-blue-200'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          </div>
          <div>
            <div className={`text-xs font-black ${dk ? 'text-white' : 'text-slate-800'}`}>Add Reflection</div>
            <div className={`text-[10px] ${dk ? 'text-slate-400' : 'text-slate-500'}`}>Blue-tinted bubble next to every date</div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="p-2 rounded-xl bg-blue-600 text-white border border-blue-400/40 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          </div>
          <span className={`text-[10px] font-black uppercase ${dk ? 'text-blue-400' : 'text-blue-600'}`}>Has Note (Blue Ring in Heatmap)</span>
        </div>
      </div>
    ),
    points: [
      'Inline Table Reflections: Click the blue-tinted speech bubble next to any date in the tracking table (vertical or horizontal) to add or edit that day’s note. Saved notes turn solid blue and add a blue highlight ring to that day in the heatmap.',
      'Journal History Modal: Click the blue Notes counter in the Activity Heatmap header to open a centered timeline of up to 51 closest entries around Today, complete with live search, typo suggestions, and inline editing.',
    ],
  },
  {
    id: 'xp',
    badge: '06 · XP & Insights',
    title: 'XP, Levels, Trophy Wins & Trend Charts',
    summary: 'Track long-term momentum with weighted XP, milestone roadmaps, and interactive charts.',
    preview: (dk) => (
      <div className={`p-4 rounded-2xl border space-y-3 ${dk ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase">Level 4</span>
          <span className="px-2.5 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-500 text-[10px] font-black">🏆 Win Milestones</span>
          <span className="px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 text-[10px] font-black">📈 Insights</span>
        </div>
        <div className={`h-2.5 w-full rounded-full overflow-hidden ${dk ? 'bg-slate-800' : 'bg-slate-200'}`}>
          <div className="h-full w-2/3 bg-gradient-to-r from-emerald-600 to-blue-500 rounded-full" />
        </div>
        <div className={`flex justify-between text-[10px] font-semibold flex-wrap gap-2 ${dk ? 'text-slate-400' : 'text-slate-500'}`}>
          <span>XP = (Completion / 100) × 10 × Priority (1x–10x)</span>
          <span>Level = ⌊√(XP / 100)⌋ + 1</span>
        </div>
      </div>
    ),
    points: [
      'Rank Progression & Level Details: Completing a 1x habit gives 10 XP; setting Priority up to 10x in the Habit Detail modal multiplies XP up to 100 XP per day. Click your Level pill in the header to view your XP progress and upcoming level thresholds.',
      'Monthly Win Milestones: The yellow Trophy counter in the header tracks completed habits this month. Click it to view milestone targets (5, 10, 25, 50, ... up to 1000).',
      'Trend Charts & Insights: Hover the dashboard Monthly Trend chart to inspect daily % scores, filter it by Overall or a single habit, or click its expand icon for Weekly Bar Charts and full Monthly Curves. Click Insights in the heatmap for Perfect Days, Best Day of Week, and Top All-Time Streaks.',
    ],
  },
  {
    id: 'customize',
    badge: '07 · Customize',
    title: 'Display Sizes, Categories, Archive & Theme',
    summary: 'Personalize layout sizing, mobile compatibility mode, categories, and visual theme.',
    preview: (dk) => (
      <div className={`p-4 rounded-2xl border grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] font-semibold ${dk ? 'bg-slate-950/70 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
        <div className={`p-3 rounded-xl border ${dk ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="text-[10px] font-black uppercase text-emerald-400 mb-1">Adjust Sizes (Mobile Icon)</div>
          Adjust Habit Card Size (75–200px), Habit Text, Table 1 &amp; Table 2 text sizes, toggle Mobile View On/Off, or Restore Defaults.
        </div>
        <div className={`p-3 rounded-xl border ${dk ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="text-[10px] font-black uppercase text-blue-400 mb-1">Categories &amp; Archive (Edit Pill)</div>
          Create custom categories with progress bars, reorder habits, and Archive paused habits without losing XP or history.
        </div>
      </div>
    ),
    points: [
      'Dark / Light Theme: Click the sun/moon pill next to Habit Mastery in the header to switch themes anytime.',
      'Adjust Sizes (Mobile Icon): Resize habit circles (75px–200px), adjust auto-fit habit text and both table text sizes, toggle Mobile View On/Off (compact mobile layout on desktop), or click Restore Defaults.',
      'Categories & Habit Manager: Click the Edit pill above your habit circles to switch between Categories and Habits tabs, add/remove categories, reorder habits, or Archive/Restore habits. Archived habits can also be viewed and restored from the Archived button in your Profile menu.',
    ],
  },
  {
    id: 'navigation',
    badge: '08 · Navigation & Sync',
    title: 'Table Controls, Shortcuts & Cloud Sync',
    summary: 'Navigate large monthly tables effortlessly and keep your data backed up across devices.',
    preview: (dk) => (
      <div className={`p-4 rounded-2xl border grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] font-semibold ${dk ? 'bg-slate-950/70 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
        <div className={`p-3 rounded-xl border ${dk ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="text-[10px] font-black uppercase text-purple-400 mb-1">Table Panning &amp; Orientation</div>
          Click <strong>Rotate Table</strong> to swap rows/columns. <strong>Grab &amp; Drag</strong> anywhere on the table, or hold <strong>Shift + Scroll</strong> to glide smoothly left/right.
        </div>
        <div className={`p-3 rounded-xl border ${dk ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="text-[10px] font-black uppercase text-amber-400 mb-1">Accounts, Sync &amp; Backups</div>
          Profile menu supports <strong>Google / Email</strong> cloud sync, multiple <strong>Offline Guest Profiles</strong>, JSON <strong>Export</strong>, and <strong>Merge / Overwrite Import</strong>.
        </div>
      </div>
    ),
    points: [
      'Rotate Table: Click the Rotate button in the top-left corner of the tracking table to switch between Vertical (dates as rows) and Horizontal (dates as columns).',
      'Grab & Drag + Shift + Scroll: Click and drag anywhere on the table (including headers) to pan around, or hold Shift while scrolling the mouse wheel to glide smoothly left and right.',
      'Keyboard & Quick Actions: Press ESC to close any open modal. Click the emerald Fire badge next to the title to refresh the app, or click Weekly Avg in the month bar for a 7-day breakdown.',
      'Cloud Sync & Local Profiles: Open your Profile menu (top-right) to sign in with Google or Email for automatic cloud sync, switch between saved offline Guest Profiles, Export a JSON backup, or Import data using Merge (keeps highest progress) or Overwrite.',
    ],
  },
];

export default function HelpGuideModal({ isOpen, onClose, theme, onResetTutorials }) {
  const [activeTab, setActiveTab] = useState('all');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tabsRef = useRef(null);
  const dk = theme === 'dark';

  const updateScrollArrows = () => {
    const el = tabsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  useEffect(() => {
    if (!isOpen) return;
    const el = tabsRef.current;
    if (!el) return;

    updateScrollArrows();
    let wheelRaf = null;
    let currentScrollLeft = el.scrollLeft;
    let targetScrollLeft = el.scrollLeft;

    const stepSmoothScroll = () => {
      const diff = targetScrollLeft - currentScrollLeft;
      if (Math.abs(diff) < 0.8) {
        currentScrollLeft = targetScrollLeft;
        el.scrollLeft = targetScrollLeft;
        wheelRaf = null;
        updateScrollArrows();
        return;
      }
      currentScrollLeft += diff * 0.24;
      el.scrollLeft = currentScrollLeft;
      updateScrollArrows();
      wheelRaf = requestAnimationFrame(stepSmoothScroll);
    };

    const onWheel = (e) => {
      const rawDelta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (rawDelta !== 0 && el.scrollWidth > el.clientWidth) {
        e.preventDefault();
        const multiplier = e.deltaMode === 1 ? 32 : 1.35;
        if (!wheelRaf) {
          currentScrollLeft = el.scrollLeft;
          targetScrollLeft = el.scrollLeft;
        }
        const maxScroll = el.scrollWidth - el.clientWidth;
        const next = targetScrollLeft + rawDelta * multiplier;
        targetScrollLeft = next <= 2 ? 0 : next >= maxScroll - 2 ? maxScroll : next;
        if (!wheelRaf) {
          wheelRaf = requestAnimationFrame(stepSmoothScroll);
        }
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('scroll', updateScrollArrows, { passive: true });
    window.addEventListener('resize', updateScrollArrows);
    return () => {
      if (wheelRaf) cancelAnimationFrame(wheelRaf);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('scroll', updateScrollArrows);
      window.removeEventListener('resize', updateScrollArrows);
    };
  }, [isOpen]);

  const handleSelectTab = (tabId, btnEl) => {
    setActiveTab(tabId);
    if (btnEl?.scrollIntoView) {
      btnEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  const nudgeTabs = (dir) => {
    const el = tabsRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 180, behavior: 'smooth' });
  };

  const visibleSections = activeTab === 'all'
    ? HelpSections
    : HelpSections.filter(s => s.id === activeTab);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[400] flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 16 }}
            className={`${dk ? 'dark bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'} border rounded-[2rem] w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[88vh] overflow-hidden`}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`px-6 pt-5 pb-4 border-b shrink-0 ${dk ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <AppLogo className="w-10 h-10 shrink-0 drop-shadow-md" />
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-none truncate">
                    How Habit Mastery Works
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onResetTutorials && (
                    <button
                      type="button"
                      onClick={onResetTutorials}
                      title="Restore all dismissed in-app tutorials on screen"
                      className={`px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 ${
                        dk
                          ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/35 text-emerald-300'
                          : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 shadow-sm'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
                      <span className="hidden sm:inline">Show Tutorials</span>
                      <span className="sm:hidden">Tutorials</span>
                    </button>
                  )}

                  <button
                    onClick={onClose}
                    title="Close (ESC)"
                    className={`shrink-0 flex flex-col items-center justify-center gap-0.5 w-9 h-9 rounded-xl transition-all ${dk ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800' : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    <span className="text-[6px] font-mono leading-none opacity-60">ESC</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs — Scrollbar-free bar, overlay edge chevrons only when scrollable, Shift+Scroll */}
              <div className={`relative mt-4 rounded-2xl border px-1.5 ${dk ? 'bg-slate-950/75 border-slate-800' : 'bg-slate-100/90 border-slate-200'}`}>
                {canScrollLeft && (
                  <div className={`absolute left-0 top-0 bottom-0 z-10 flex items-center pl-1.5 pr-4 rounded-l-2xl pointer-events-none bg-gradient-to-r ${dk ? 'from-slate-950 via-slate-950/90 to-transparent' : 'from-slate-100 via-slate-100/90 to-transparent'}`}>
                    <button
                      type="button"
                      onClick={() => nudgeTabs(-1)}
                      aria-label="Scroll tabs left"
                      className={`pointer-events-auto w-7 h-7 rounded-xl flex items-center justify-center transition-all ${dk ? 'bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700' : 'bg-white text-slate-700 hover:text-slate-900 shadow-sm'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                  </div>
                )}

                <div
                  ref={tabsRef}
                  className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1.5 px-0.5 rounded-xl"
                >
                  <button
                    type="button"
                    onClick={(e) => handleSelectTab('all', e.currentTarget)}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                      activeTab === 'all'
                        ? 'bg-emerald-500 text-white'
                        : (dk ? 'text-slate-400 hover:text-white hover:bg-slate-800/70' : 'text-slate-600 hover:text-slate-900 hover:bg-white/80')
                    }`}
                  >
                    All Guides
                  </button>
                  {HelpSections.map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={(e) => handleSelectTab(sec.id, e.currentTarget)}
                      className={`shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                        activeTab === sec.id
                          ? 'bg-emerald-500 text-white'
                          : (dk ? 'text-slate-400 hover:text-white hover:bg-slate-800/70' : 'text-slate-600 hover:text-slate-900 hover:bg-white/80')
                      }`}
                    >
                      {sec.badge.split('·')[1].trim()}
                    </button>
                  ))}
                </div>

                {canScrollRight && (
                  <div className={`absolute right-0 top-0 bottom-0 z-10 flex items-center pr-1.5 pl-4 rounded-r-2xl pointer-events-none bg-gradient-to-l ${dk ? 'from-slate-950 via-slate-950/90 to-transparent' : 'from-slate-100 via-slate-100/90 to-transparent'}`}>
                    <button
                      type="button"
                      onClick={() => nudgeTabs(1)}
                      aria-label="Scroll tabs right"
                      className={`pointer-events-auto w-7 h-7 rounded-xl flex items-center justify-center transition-all ${dk ? 'bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700' : 'bg-white text-slate-700 hover:text-slate-900 shadow-sm'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable Guide Body — inset scrollbar */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar my-2 mr-2 pl-6 pr-4 py-3 space-y-5">
              {visibleSections.map((sec) => (
                <div
                  key={sec.id}
                  className={`p-5 rounded-3xl border space-y-3.5 ${dk ? 'bg-slate-800/35 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${dk ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {sec.badge}
                      </span>
                      <h4 className="text-base sm:text-lg font-black leading-snug mt-0.5">{sec.title}</h4>
                      <p className={`text-xs font-medium mt-1 ${dk ? 'text-slate-400' : 'text-slate-500'}`}>
                        {sec.summary}
                      </p>
                    </div>
                  </div>

                  {sec.preview(dk)}

                  <ul className="space-y-2 pt-0.5">
                    {sec.points.map((pt, i) => {
                      const colonIdx = pt.indexOf(':');
                      const lead = colonIdx > 0 && colonIdx < 38 ? pt.slice(0, colonIdx + 1) : '';
                      const rest = lead ? pt.slice(colonIdx + 1) : pt;
                      return (
                        <li key={i} className={`flex items-start gap-2 text-xs font-medium leading-relaxed ${dk ? 'text-slate-300' : 'text-slate-600'}`}>
                          <span className="text-emerald-500 font-black mt-0.5 shrink-0">•</span>
                          <span>
                            {lead && <strong className={dk ? 'text-white' : 'text-slate-800'}>{lead}</strong>}
                            {rest}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className={`px-6 py-4 border-t shrink-0 flex items-center justify-between gap-3 ${dk ? 'border-slate-800 bg-slate-900/80' : 'border-slate-100 bg-slate-50/70'}`}>
              <span className={`text-[11px] font-semibold ${dk ? 'text-slate-400' : 'text-slate-500'}`}>
                Tip: Press <kbd className={`px-1.5 py-0.5 rounded border text-[10px] font-mono ${dk ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700'}`}>ESC</kbd> anytime to close popups.
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-500/20 transition-all active:scale-95"
              >
                Got It
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
