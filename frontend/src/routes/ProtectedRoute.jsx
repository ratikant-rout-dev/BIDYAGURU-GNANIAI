import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from './routeConfig';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/20 animate-bounce">
          🎓
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight">Bidya Guru</h1>
          <p className="text-xs text-indigo-300">Speak. Learn. Grow.</p>
        </div>
        <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Verifying secure session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve requested URL so user can be returned after login
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
