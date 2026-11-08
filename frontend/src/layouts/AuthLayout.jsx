import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Globe, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../routes/routeConfig';

export const AuthLayout = () => {
  const { language, setLanguage } = useAuth();

  const languages = [
    { code: 'en-IN', label: 'English', flag: '🇬🇧' },
    { code: 'hi-IN', label: 'हिंदी', flag: '🇮🇳' },
    { code: 'or-IN', label: 'ଓଡ଼ିଆ', flag: '🟠' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Bar */}
      <header className="max-w-7xl w-full mx-auto p-4 sm:p-6 flex items-center justify-between relative z-10">
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-2 text-indigo-200 hover:text-white text-xs font-bold transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        {/* Language selector */}
        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-2xl border border-white/15">
          <Globe className="w-3.5 h-3.5 text-indigo-300 ml-2 mr-1" />
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLanguage(l.code)}
              className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                language === l.code
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              <span>{l.flag}</span> <span className="hidden sm:inline">{l.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Auth Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <Outlet />
      </main>

      {/* Bottom Footer */}
      <footer className="py-6 text-center text-xs text-indigo-300/70 relative z-10 border-t border-white/5">
        <p>© {new Date().getFullYear()} Bidya Guru — Powered by Gnani Voice Engine & Gemini AI.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;
