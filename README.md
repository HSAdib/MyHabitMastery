<div align="center">

# 🔥 My Habit Mastery

### *Track your habits. Master your life.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-%E2%96%B6%20Visit%20Now-10b981?style=for-the-badge&logo=vercel&logoColor=white)](https://my-habit-mastery.vercel.app)
[![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-ff6d00?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com)
[![PWA](https://img.shields.io/badge/PWA-Installable-5a0fc8?style=for-the-badge&logo=googlechrome&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)

A **premium, offline-first habit tracking PWA** built with React + Firebase.  
Gamified with XP, streaks, levels, and trophies — because self-improvement should feel rewarding.

</div>

---

## ✨ Features at a Glance

### 📊 Powerful Tracker
- **Scrollable daily tracking table** — horizontal or vertical layout, switchable on the fly
- **Multi-step habits** — set a goal of N steps per day (e.g. 15 vocab words) and track partial progress
- **Category tabs** — filter habits by custom categories (Health, Academic, Dev, Lifestyle…)
- **Drag-to-scroll** — grab the table with your mouse and scroll naturally
- **Auto-scroll to today** on load

### 🎮 Gamification Engine
- **XP & Level system** — earn XP for every habit completed, level up over time
- **Animated level-up modal** — celebrates each new milestone with flair
- **Current streak tracking** — consecutive days of 100% completion
- **Trophy cabinet** — unlock achievements for milestones (streaks, perfect weeks, etc.)
- **🎉 Confetti** — fires automatically when you hit 100% for the day

### 📈 Analytics & Insights
- **GitHub-style heatmap** — visualise your entire year at a glance, filterable by habit or category
- **Weekly performance graph** — area chart showing day-by-day completion rate
- **Monthly bar chart** — month-over-month trend overview
- **Per-habit deep-dive** — click any habit to see its dedicated heatmap + full stats
- **Insights modal** — best streaks, average completion, and more

### 📝 Daily Journal
- **Per-day notes** — attach a timestamped journal entry to any day
- **Notes overview** — browse all your past entries in one scrollable panel

### ☁️ Sync & Storage
- **Offline-first with IndexedDB** — works 100% without internet
- **Google Sign-In** — optional; syncs your data to Firestore in real time
- **Smart conflict resolution** — timestamp-based merge: newest data wins, never loses offline changes
- **Guest mode** — use the app without any account; pick a name and go
- **Legacy migration** — auto-imports old `localStorage` data on first launch

### 🎨 UI / UX Polish
- **Dark & Light themes** — toggle in one click, persisted across sessions
- **Framer Motion animations** — smooth entrance animations, animated digit counters, staggered lists
- **Text size controls** — fine-tune font sizes for every section of the UI
- **Mobile mode** — auto-detected + manually toggleable; adjusts layout & font sizes
- **ESC to close** — every modal respects keyboard navigation
- **PWA installable** — add to home screen on Android or desktop

### 🛠️ Habit Management
- **Add / rename / delete habits** inline, no separate settings page needed
- **Archive habits** — hide without losing history, restore anytime
- **Custom categories** — create, rename, reorder, and delete tabs
- **Export & Import** — full JSON backup/restore with merge or overwrite strategy

### 🔐 Admin Panel
- View all registered users in real time (Firestore `onSnapshot`)
- **Impersonate any user** — inspect and edit their data live
- Set global default habits & categories pushed to brand-new users
- Protected route — admin access only

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + Vite 6 |
| **State Management** | Zustand |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Auth & Database** | Firebase (Google Auth + Firestore) |
| **Local Persistence** | IndexedDB via `idb-keyval` |
| **Styling** | Tailwind CSS |
| **PWA** | `vite-plugin-pwa` (Workbox) |
| **Analytics** | Vercel Analytics |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18
- A **Firebase project** with Authentication (Google provider) and Firestore enabled

### 1. Clone & Install

```bash
git clone https://github.com/HSAdib/MyHabitMastery.git
cd MyHabitMastery
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Fill in your Firebase credentials in `.env`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...   # optional
```

> **Tip:** Firebase is optional. The app runs in full **local-only / guest mode** if vars are missing — great for quick testing.

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run build
```

---

## ☁️ Deploy to Vercel

1. Push your code to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Add every `VITE_FIREBASE_*` key under **Project → Settings → Environment Variables**
4. Click **Deploy** — [`vercel.json`](./vercel.json) handles SPA client-side routing automatically

---

## 🗂️ Project Structure

```
src/
├── App.jsx                   # Main app — tracker table, all modals, core UI (3k+ lines)
├── firebase.config.js        # Firebase init with graceful no-config fallback
├── main.jsx                  # React Router setup (/, /admin-panel)
├── utils.js                  # Date helpers, key generators, fluid SVG path solver
├── store/
│   └── useHabitStore.js      # Zustand store — IDB + Firestore real-time sync, XP engine
└── components/
    ├── AdminPanel.jsx         # Admin dashboard — user list, impersonation, global defaults
    ├── AuthModal.jsx          # Google sign-in / guest name flow
    ├── HeaderProfile.jsx      # Avatar, XP bar, level badge, streak counter
    ├── Heatmap.jsx            # GitHub-style activity heatmap
    ├── NamePromptModal.jsx    # First-time user onboarding
    ├── ProtectedAdminRoute.jsx
    ├── DayCell.jsx
    ├── charts/                # Weekly & monthly chart modals
    └── modals/                # Insights, trophy showcase, level-up celebration
```

---

## 🔒 Firestore Security

Firestore rules enforce strict per-user isolation:

```
/users/{userId}  →  read/write only if request.auth.uid == userId
```

See [`firestore.rules`](./firestore.rules) for the complete ruleset.

---

## 📄 License

[MIT](./LICENSE) © [Hasan Shahriar Adib](https://github.com/HSAdib)

---

<div align="center">

Made with ❤️ in Bangladesh 🇧🇩

*"We are what we repeatedly do. Excellence, then, is not an act, but a habit." — Aristotle*

</div>
