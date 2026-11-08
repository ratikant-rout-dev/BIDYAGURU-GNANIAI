import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarContent } from './SidebarContent';

export const MobileDrawer = ({ isOpen, onClose }) => {
  const location = useLocation();
  const drawerRef = useRef(null);
  const prevPathnameRef = useRef(location.pathname);

  // Auto-close ONLY when pathname actually changes (e.g. after navigating to a new route)
  useEffect(() => {
    if (prevPathnameRef.current !== location.pathname) {
      prevPathnameRef.current = location.pathname;
      if (isOpen) {
        onClose();
      }
    }
  }, [location.pathname, isOpen, onClose]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-close on viewport resize to desktop (>= 1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isOpen) {
        onClose();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, onClose]);

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  return (
    <div
      id="mobile-navigation-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation drawer"
      className={`lg:hidden fixed inset-0 z-50 flex select-none transition-all duration-300 ${
        isOpen ? 'visible' : 'invisible pointer-events-none'
      }`}
    >
      {/* Semi-transparent Backdrop with smooth fade */}
      <div
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-hidden="true"
      />

      {/* Slide-in Drawer Panel with smooth transform transition */}
      <div
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-72 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col z-10 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent isMobile onClose={onClose} onItemClick={onClose} />
      </div>
    </div>
  );
};

export default MobileDrawer;
