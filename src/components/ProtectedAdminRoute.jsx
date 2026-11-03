import React from 'react';
import { Link } from 'react-router-dom';
import { useHabitStore } from '../store/useHabitStore';

export const SUPER_ADMIN_EMAIL = 'hasanshahriaradib@gmail.com';

export default function ProtectedAdminRoute({ children }) {
  const user = useHabitStore((state) => state.user);
  const isAuthenticated = useHabitStore((state) => state.isAuthenticated);
  const isHydrating = useHabitStore((state) => state.isHydrating);
  const authInitialized = useHabitStore((state) => state.authInitialized);

  // 02/10 Loading State: Shape of the Admin Panel coming
  if (isHydrating || !authInitialized) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 font-sans">
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
          <div className="h-16 bg-slate-900 rounded-2xl border border-slate-800" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-900 rounded-2xl border border-slate-800" />
            ))}
          </div>
          <div className="h-96 bg-slate-900 rounded-3xl border border-slate-800" />
        </div>
      </div>
    );
  }

  const isAdmin = isAuthenticated && user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL;

  // 07/10 Permission Denied State: Explain why & give a way back
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-5 text-2xl">
            🛡️
          </div>
          <h2 className="text-2xl font-black mb-2">Super Admin Access Only</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            This command center is restricted to the platform administrator (<span className="text-slate-200 font-mono">{SUPER_ADMIN_EMAIL}</span>). Your personal habit data and profiles remain 100% accessible on your dashboard.
          </p>
          <div className="flex flex-col gap-2.5">
            <Link className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20" to="/">
              Return to My Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
