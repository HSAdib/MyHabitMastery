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
