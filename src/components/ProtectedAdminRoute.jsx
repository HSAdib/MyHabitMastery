import React from 'react';
import { Navigate } from 'react-router-dom';
import { useHabitStore } from '../store/useHabitStore';

export default function ProtectedAdminRoute({ children }) {
  const user = useHabitStore((state) => state.user);
  const isAuthenticated = useHabitStore((state) => state.isAuthenticated);
  const isHydrating = useHabitStore((state) => state.isHydrating);
  const authInitialized = useHabitStore((state) => state.authInitialized);

  if (isHydrating || !authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-emerald-400 font-black text-sm uppercase tracking-widest">
        Verifying Admin Session...
      </div>
    );
  }

  const isAdmin = isAuthenticated && user?.email === 'hasanshahriaradib@gmail.com';

  if (!isAdmin) {
    return <Navigate replace to="/"/>;
  }

  return children;
}
