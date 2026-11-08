import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Globe } from 'lucide-react';

export const Header = ({ title, subtitle }) => {
  const { language, setLanguage } = useAuth();

  const languages = [
    { code: 'en-IN', label: 'English', flag: '🇬🇧' },
    { code: 'hi-IN', label: 'हिंदी', flag: '🇮🇳' },
    { code: 'or-IN', label: 'ଓଡ଼ିଆ', flag: '🟠' },
  ];

  return (
    <header className="min-h-16 py-3 px-4 sm:px-8 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative lg:sticky lg:top-0 z-20 shadow-xs">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-500 font-medium tracking-normal mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        {/* Multilingual Segmented Control */}
        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 shadow-inner">
          <div className="pl-2 pr-1 text-slate-400 flex items-center">
            <Globe className="w-3.5 h-3.5" />
          </div>
          {languages.map((l) => {
            const isActive = language === l.code;
            return (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/90'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live Gnani AI Status Pill (Requested: only write "Gnani AI") */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-bold shadow-xs">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="tracking-wide">Gnani AI</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
