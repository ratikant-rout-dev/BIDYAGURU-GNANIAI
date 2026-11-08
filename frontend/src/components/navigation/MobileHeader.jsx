import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { ROUTES } from '../../routes/routeConfig.js';

export const MobileHeader = ({ onOpenDrawer, isDrawerOpen }) => {
  return (
    <header className="lg:hidden h-16 px-4 bg-white/95 backdrop-blur-md border-b border-slate-200/90 flex items-center justify-between sticky top-0 z-30 shadow-xs select-none">
      {/* Left: Application Logo & Branding */}
      <Link
        to={ROUTES.DASHBOARD}
        className="flex items-center gap-2.5 group cursor-pointer"
        aria-label="Bidya Guru Home"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 border border-indigo-400/20 group-hover:scale-105 transition-transform shrink-0">
          <span className="text-lg">🎓</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-base text-slate-900 tracking-tight whitespace-nowrap">
            Bidya Guru
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shrink-0">
            AI
          </span>
        </div>
      </Link>

      {/* Right: Touch-Friendly Accessible Hamburger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenDrawer();
        }}
        className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100/80 border border-slate-200/70 transition-colors cursor-pointer flex items-center justify-center focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
        aria-label={isDrawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={Boolean(isDrawerOpen)}
        aria-controls="mobile-navigation-drawer"
      >
        <Menu className="w-5 h-5" />
      </button>
    </header>
  );
};

export default MobileHeader;
