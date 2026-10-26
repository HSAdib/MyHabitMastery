<div align="center">

# 🔥 My Habit Mastery
### *Track Your Habits. Level Up Your Life.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-%E2%96%B6%20Open%20App-10b981?style=for-the-badge&logo=vercel&logoColor=white)](https://my-habit-mastery.vercel.app)
[![PWA](https://img.shields.io/badge/PWA-Installable-7c3aed?style=for-the-badge&logo=googlechrome&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Storage](https://img.shields.io/badge/Offline%20First-IndexedDB-3b82f6?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
[![Sync](https://img.shields.io/badge/Cloud%20Sync-Firebase-ff9800?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com)
[![License](https://img.shields.io/badge/License-MIT-gray?style=for-the-badge)](./LICENSE)

**My Habit Mastery** is an ultra-fast, gamified, offline-first habit tracker designed like a productive workspace.  
Turn your daily disciplines into an RPG — complete habits, earn XP, maintain streaks, and watch your consistency grow on interactive heatmaps.

[🚀 Quick Start](#-quick-start-in-30-seconds) • [📖 Complete User Guide](#-complete-user-guide--how-to-use) • [🎮 Gamification & XP](#-gamification--progression-system) • [📊 Analytics & Visuals](#-analytics--insights) • [💡 Pro Tips](#-pro-tips--shortcuts)

</div>

---

## 🚀 Quick Start in 30 Seconds

1. **Open the App** 👉 [my-habit-mastery.vercel.app](https://my-habit-mastery.vercel.app) (or run locally).
2. **Enter Your Name**: Pick a guest nickname or log in with Google to enable multi-device sync.
3. **Log Today's Habits**: Click on today's column/row to check off habits.
4. **Hit 100%**: Complete all daily habits to unlock confetti 🎉, stack streak days, and gain bonus XP!

---

## 📖 Complete User Guide / How to Use

Everything in My Habit Mastery is built to be fast, intuitive, and frictionless. Here is how each part of the app works:

### 1. 📋 The Main Tracking Table
The centerpiece is a flexible, spreadsheet-style interactive grid.

- **Checking Off a Habit**:
  - **Single-step habits** (e.g., *Meditation, 7h Sleep*): Click a cell to toggle between completed (100%) and pending.
  - **Multi-step habits** (e.g., *Read 15 pages, 20 Pushups*): Click to increment progress step-by-step or use the step slider for quick adjustments.
- **Orientation Switch (Horizontal ↔ Vertical)**:
  - Click the **Rotate Layout** icon in the header.
  - **Horizontal View**: Days stretch across columns (like a timeline).
  - **Vertical View**: Days stack in rows (great for compact vertical reading).
- **Smooth Drag-to-Scroll**:
  - Don't bother with tiny scrollbars! Simply click and drag anywhere inside the table body with your mouse to pan around smoothly.
- **Auto-Scroll to Today**:
  - Whenever you load the page or switch views, the table automatically centers right on **today's date**.

---

### 2. 🗂️ Categories & Habit Organization
Keep your work, fitness, and personal routines neatly organized:

- **Filter Tabs**: Click on categories like **All**, **Health**, **Academic**, **Dev**, or **Lifestyle** to focus only on relevant habits.
- **Add New Habit**:
  - Type a habit name into the quick-add input and press `Enter` or click `+`.
  - The new habit is automatically linked to your currently selected category.
- **Add / Edit Categories**:
  - Open the **Manage** modal to create custom category tabs, rename existing ones, or reorder their position.
- **Archive Habits**:
  - Done with a temporary challenge or taking a break? Archive the habit instead of deleting it. All your past tracking data remains 100% intact, and you can unarchive it anytime!

---

### 3. 🎮 Gamification & Progression System
Self-improvement is an RPG. Every action you take pays out tangible rewards:

```
┌─────────────────────────────────────────────────────────────┐
│  ⭐ Daily Habits Done  ➜  Gain XP  ➜  Level Up (with sound) │
│  🔥 100% Days in a Row ➜  Build Streaks  ➜  Earn Trophies   │
└─────────────────────────────────────────────────────────────┘
```

- **XP Engine**:
  - Every checked habit rewards you with experience points (XP).
  - The header features a live XP progress bar showing how close you are to your next level.
- **Level-Up Celebrations**:
  - Crossing an XP threshold triggers an animated level-up modal celebrating your progress.
- **Streak Multipliers**:
  - Finish 100% of your active habits for the day to advance your **Flame Streak** 🔥.
  - Missed a day? Don't get discouraged — start building your next streak immediately!
- **Trophy Showcase 🏆**:
  - Click the trophy icon in your profile header to view unlockable achievement badges (First Habit, 7-Day Streak, 30-Day Master, Perfect Week, and more).
- **Instant Confetti 🎉**:
  - Hitting 100% completion for any day triggers celebratory particle confetti!

---

### 4. 📝 Daily Notes & Journaling
Track context behind your numbers — why you succeeded or why you missed a goal:

- **Adding a Note**:
  - Click the small **Note 📝** icon located next to any day's date header.
  - Type your reflection (e.g., *"Felt high energy after workout"*, *"Travel day, studied on train"*).
  - Notes automatically save with an automatic timestamp.
- **Browsing Past Notes**:
  - Open the **All Notes** panel to review a chronological journal of all your reflections over time.

---

### 5. 📊 Analytics & Insights
Turn raw clicks into actionable visual intelligence:

- **GitHub-Style Contribution Heatmap**:
  - View an entire year's density map at a glance.
  - Filter the heatmap for **All Habits** or isolate a single habit to see where your consistency peaked.
- **Weekly Progress Graph**:
  - Beautiful Area chart showing your day-by-day completion percentages throughout the week.
- **Monthly Performance Bar Chart**:
  - Compare completion consistency month-by-month to evaluate long-term momentum.
- **Per-Habit Deep Dive**:
  - Click on any habit's title to open its personal detail modal: includes a dedicated mini heatmap, current & best streaks, and total completion count.

---

### 6. ☁️ Sync, Storage & Data Freedom

| Feature | How It Works |
|---|---|
| **Guest / Offline Mode** | Works out of the box with **IndexedDB**. Zero signup required. Fast, private, and works completely offline without internet. |
| **Google Cloud Sync** | Click **Login with Google** to back up your habits to Firebase Firestore. Changes sync in real-time across your laptop, phone, and tablet. |
| **Smart Conflict Handling** | If you make edits offline on your phone and later connect to Wi-Fi, the app merges changes intelligently by timestamp so nothing is lost. |
| **JSON Export & Backup** | Head to settings and download a complete `.json` file backup of all habits, configs, notes, and history. |
| **JSON Import** | Restore data on any device with your choice of **Merge** (combine with existing) or **Overwrite** (fresh restore). |

---

### 7. 📱 Mobile Friendly & PWA Support

- **Install as an App (PWA)**:
  - On Chrome/Edge: Click the **Install** icon in your browser address bar.
  - On iPhone / Safari: Tap **Share** ➜ **Add to Home Screen**.
  - On Android: Tap the menu ➜ **Install app**.
  - Opens in full-screen standalone mode with zero browser chrome!
- **Mobile Mode**:
  - Auto-detected on phones or toggleable manually.
  - Scales cell padding and font sizes for effortless one-thumb tracking on small screens.
- **Adjustable Text Sizes**:
  - Customize habit label size, cell text size, and tab dimensions to suit your eyesight and screen size.

---

## 💡 Pro Tips & Shortcuts

- ⌨️ **`ESC` Key**: Instantly closes any active modal or popup window.
- 🖱️ **Grab & Pan**: Click and hold the mouse button inside the table to flick and scroll effortlessly through weeks of history.
- 🌓 **Theme Toggle**: Switch between sleek OLED Dark Mode and clean Minimal Light Mode using the Sun/Moon icon.
- ⚡ **Multi-step Goals**: Learning a language or reading books? Set steps to `10` or `15` in the habit settings so you can record incremental progress throughout the day.
- 📦 **Don't Delete, Archive!**: Always prefer archiving old habits over deleting them so your past year's heatmap retains its colors.

---

## 🛠️ Tech Stack & Architecture

- **Core**: React 18, Vite 6, Tailwind CSS
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with reactive selectors
- **Persistence**: [idb-keyval](https://github.com/jakearchibald/idb-keyval) (IndexedDB) + Firebase Firestore
- **Animations**: [Framer Motion](https://www.framer.com/motion/) + Canvas Confetti
- **Charts**: [Recharts](https://recharts.org/)
- **PWA**: `vite-plugin-pwa` with Workbox caching

---

## 💻 Local Setup & Development

```bash
# 1. Clone repository
git clone https://github.com/HSAdib/MyHabitMastery.git
cd MyHabitMastery

# 2. Install dependencies
npm install

# 3. Environment variables (Optional for local guest mode)
cp .env.example .env

# 4. Start local development server
npm run dev
```

App will be available at `http://localhost:3000`.

---

<div align="center">

Made with dedication by **[Hasan Shahriar Adib](https://github.com/HSAdib)** 🇧🇩

*"Success is the product of daily habits—not once-in-a-lifetime transformations." — James Clear*

</div>
