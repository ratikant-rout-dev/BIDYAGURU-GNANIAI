import React from 'react';
import { SidebarContent } from './SidebarContent';

export const Sidebar = ({ currentScreen, onNavigate }) => {
  return (
    <aside
      aria-label="Sidebar navigation"
      className="hidden lg:flex w-68 h-screen sticky top-0 bg-white border-r border-slate-200/80 flex-col select-none shrink-0 shadow-xs z-20"
    >
      <SidebarContent currentScreen={currentScreen} onNavigate={onNavigate} />
    </aside>
  );
};

export default Sidebar;
