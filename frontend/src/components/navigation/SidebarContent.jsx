import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LogOut, Volume2, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../routes/routeConfig';
import { NAV_ITEMS } from './navConfig';

export const SidebarContent = ({ isMobile = false, onClose, onItemClick, currentScreen, onNavigate }) => {
  const { user, logout, language } = useAuth();
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    if (onItemClick) onItemClick();
    if (onClose) onClose();
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const handleItemClick = (itemId) => {
    if (onNavigate) onNavigate(itemId);
    if (onItemClick) onItemClick();
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col justify-between h-full w-full select-none bg-white">
      {/* Top Section: App Branding & Navigation */}
      <div className="flex-1 overflow-y-auto">
        {/* Application Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link
            to={ROUTES.DASHBOARD}
            onClick={() => handleItemClick('home')}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 border border-indigo-400/20 group-hover:scale-105 transition-transform shrink-0">
              <span className="text-xl">🎓</span>
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1.5 leading-none">
                Bidya Guru
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  AI
                </span>
              </span>
              <span className="block text-[10px] text-slate-500 font-semibold tracking-wide mt-1">
                Speak. Learn. Grow.
              </span>
            </div>
          </Link>

          {/* Close button for Mobile Drawer */}
          {isMobile && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 -mr-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Voice Language Indicator Pill */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between px-3.5 py-2 bg-slate-50/80 rounded-xl border border-slate-200/70">
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <Volume2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Voice Lang:</span>
            </div>
            <span className="text-xs font-bold text-slate-800">
              {getLangBadge()}
            </span>
          </div>
        </div>

        {/* Primary Navigation Links */}
        <nav aria-label="Main navigation" className="p-3.5 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => handleItemClick(item.id)}
                className={({ isActive }) => {
                  const active = isActive || currentScreen === item.id;
                  return `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                      : item.highlight
                      ? 'text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/70'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`;
                }}
              >
                {({ isActive }) => {
                  const active = isActive || currentScreen === item.id;
                  return (
                    <>
                      <div className="flex items-center gap-3 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            active
                              ? 'text-white'
                              : item.highlight
                              ? 'text-indigo-600'
                              : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && !active && (
                        <span className="ml-2 text-[10px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </>
                  );
                }}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Authenticated User Profile & Logout */}
      <div className="p-4 border-t border-slate-100 shrink-0 bg-white">
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
            type="button"
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SidebarContent;
