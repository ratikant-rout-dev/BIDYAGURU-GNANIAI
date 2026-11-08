import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar, MobileHeader, MobileDrawer } from '../components/navigation';
import { Header } from '../components/Header';
import { ROUTE_TITLES } from '../routes/routeConfig';

export const MainLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const currentTitleInfo = ROUTE_TITLES[location.pathname] || {
    title: 'Bidya Guru',
    subtitle: 'Speak. Learn. Grow.',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Top Header (< 1024px) */}
      <MobileHeader
        onOpenDrawer={() => setDrawerOpen((prev) => !prev)}
        isDrawerOpen={drawerOpen}
      />

      {/* Mobile Slide-in Navigation Drawer (< 1024px) */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Persistent Desktop Sidebar (>= 1024px) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={currentTitleInfo.title}
          subtitle={currentTitleInfo.subtitle}
        />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
