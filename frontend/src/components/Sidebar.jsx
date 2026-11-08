import React from 'react';
import {
  Home,
  Mic,
  Target,
  Compass,
  Briefcase,
  MessageSquare,
  FileText,
  LogOut,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ currentScreen, onNavigate }) => {
  const { user, logout, language } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, badge: null },
    {
      id: 'talk',
      label: 'Talk with AI',
      icon: Mic,
      badge: 'Voice AI',
      highlight: true,
    },
    { id: 'profile', label: 'Career Profile', icon: Target, badge: null },
    { id: 'roadmap', label: 'Career Roadmap', icon: Compass, badge: null },
    {
      id: 'jobs',
      label: 'Job Match & Apply',
      icon: Briefcase,
      badge: 'Jobs',
      highlight: false,
    },
    {
      id: 'resume',
      label: 'Create Resume',
      icon: FileText,
      badge: 'ATS',
      highlight: false,
    },
    {
      id: 'communication',
      label: 'Communication Practice',
      icon: MessageSquare,
      badge: null,
    },
  ];

  const getLangBadge = () => {
    switch (language) {
      case 'hi-IN':
        return '🇮🇳 हिंदी';
      case 'or-IN':
        return '🟠 ଓଡ଼ିଆ';
      default:
        return '🇬🇧 English';
    }
  };

  return (
    <aside className="w-68 h-screen bg-white border-r border-slate-200/80 flex flex-col justify-between select-none shrink-0 sticky top-0 shadow-xs z-20">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 border border-indigo-400/20">
              <span className="text-2xl">🎓</span>
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                Bidya Guru
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  AI
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 font-semibold tracking-wide">
                Speak. Learn. Grow.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between px-3.5 py-2 bg-slate-50/80 rounded-xl border border-slate-200/70">
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Voice Lang:</span>
            </div>
            <span className="text-xs font-bold text-slate-800">
              {getLangBadge()}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3.5 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : item.highlight
                    ? 'text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-white'
                        : item.highlight
                        ? 'text-indigo-600'
                        : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && !isActive && (
                  <span className="text-[10px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-xs">
              {user?.name ? user.name[0] : 'S'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 truncate">
                {user?.name || 'Student'}
              </p>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                {user?.email || 'student@bidyaguru.edu'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
