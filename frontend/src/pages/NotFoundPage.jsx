import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../routes/routeConfig';
import { Home } from 'lucide-react';

export const NotFoundPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
      <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-3xl shadow-lg shadow-indigo-100 mb-6 animate-bounce">
        🎓
      </div>

      <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-200 mb-3">
        404 Page Not Found
      </span>

      <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
        Lost in the learning roadmap?
      </h1>

      <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
        The page you are looking for does not exist, has been removed, or is temporarily unavailable.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>{isAuthenticated ? 'Return to Dashboard' : 'Return Home'}</span>
        </Link>

        {isAuthenticated && (
          <Link
            to={ROUTES.TALK}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Ask Bidya Guru AI</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default NotFoundPage;
