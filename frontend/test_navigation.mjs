import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { NAV_ITEMS } from './src/components/navigation/navConfig.js';
import { ROUTES } from './src/routes/routeConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n======================================================');
console.log('🧭 Starting Unified Navigation & Responsive Sidebar Test Suite');
console.log('======================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// 1. NAV CONFIGURATION VERIFICATION
console.log('📌 1. Testing Single Source of Truth Navigation Config (navConfig.js)...');
assert(Array.isArray(NAV_ITEMS), 'NAV_ITEMS is an array');
assert(NAV_ITEMS.length === 7, `Expected 7 navigation items, received ${NAV_ITEMS.length}`);

const expectedRoutes = [
  { id: 'home', to: ROUTES.DASHBOARD, label: 'Home' },
  { id: 'talk', to: ROUTES.TALK, label: 'Talk with AI', highlight: true, badge: 'Voice AI' },
  { id: 'profile', to: ROUTES.PROFILE, label: 'Career Profile' },
  { id: 'roadmap', to: ROUTES.ROADMAP, label: 'Career Roadmap' },
  { id: 'jobs', to: ROUTES.JOBS, label: 'Job Match & Apply', badge: 'Jobs' },
  { id: 'resume', to: ROUTES.CREATE_RESUME, label: 'Create Resume', badge: 'ATS' },
  { id: 'communication', to: ROUTES.COMMUNICATION, label: 'Communication Practice' },
];

expectedRoutes.forEach((expected) => {
  const item = NAV_ITEMS.find((n) => n.id === expected.id);
  assert(Boolean(item), `Found navigation item for '${expected.id}'`);
  assert(item?.to === expected.to, `Item '${expected.id}' maps to route '${expected.to}'`);
  assert(item?.label === expected.label, `Item '${expected.id}' has label '${expected.label}'`);
  if (expected.badge) {
    assert(item?.badge === expected.badge, `Item '${expected.id}' has badge '${expected.badge}'`);
  }
  if (expected.highlight) {
    assert(item?.highlight === true, `Item '${expected.id}' is highlighted`);
  }
});

// 2. DESKTOP SIDEBAR COMPONENT VERIFICATION
console.log('\n📌 2. Testing Desktop Sidebar Component (Sidebar.jsx)...');
const sidebarCode = fs.readFileSync(path.join(__dirname, 'src/components/navigation/Sidebar.jsx'), 'utf-8');
assert(sidebarCode.includes('hidden lg:flex'), 'Desktop sidebar has responsive breakpoint "hidden lg:flex"');
assert(sidebarCode.includes('w-68'), 'Desktop sidebar has width "w-68"');
assert(sidebarCode.includes('h-screen'), 'Desktop sidebar has full viewport height "h-screen"');
assert(sidebarCode.includes('sticky top-0'), 'Desktop sidebar has sticky positioning "sticky top-0"');
assert(sidebarCode.includes('aria-label="Sidebar navigation"'), 'Desktop sidebar has accessible aria-label');
assert(sidebarCode.includes('<SidebarContent'), 'Desktop sidebar embeds shared SidebarContent');

// 3. REUSABLE SIDEBAR CONTENT VERIFICATION
console.log('\n📌 3. Testing Shared Sidebar Content Component (SidebarContent.jsx)...');
const contentCode = fs.readFileSync(path.join(__dirname, 'src/components/navigation/SidebarContent.jsx'), 'utf-8');
assert(contentCode.includes('Bidya Guru'), 'Sidebar content contains application name "Bidya Guru"');
assert(contentCode.includes('AI'), 'Sidebar content contains "AI" badge');
assert(contentCode.includes('Speak. Learn. Grow.'), 'Sidebar content contains tagline "Speak. Learn. Grow."');
assert(contentCode.includes('Volume2'), 'Sidebar content contains Voice Language indicator icon');
assert(contentCode.includes('getLangBadge'), 'Sidebar content supports multilingual language badge');
assert(contentCode.includes('isMobile && onClose'), 'Sidebar content renders close button on mobile');
assert(contentCode.includes('NavLink'), 'Sidebar content uses NavLink for router integration');
assert(contentCode.includes('bg-indigo-600 text-white'), 'Sidebar content has active route highlight styling');
assert(contentCode.includes('LogOut'), 'Sidebar content includes Logout button');
assert(contentCode.includes('handleLogout'), 'Sidebar content provides logout handler');
assert(contentCode.includes('handleItemClick'), 'Sidebar content auto-closes drawer on item click');

// 4. MOBILE HEADER COMPONENT VERIFICATION
console.log('\n📌 4. Testing Mobile Header Component (MobileHeader.jsx)...');
const mobileHeaderCode = fs.readFileSync(path.join(__dirname, 'src/components/navigation/MobileHeader.jsx'), 'utf-8');
assert(mobileHeaderCode.includes('lg:hidden'), 'Mobile header is hidden on desktop (lg:hidden)');
assert(mobileHeaderCode.includes('h-16'), 'Mobile header has height h-16');
assert(mobileHeaderCode.includes('sticky top-0'), 'Mobile header is sticky top-0');
assert(mobileHeaderCode.includes('Bidya Guru'), 'Mobile header has branding "Bidya Guru"');
assert(mobileHeaderCode.includes('Menu'), 'Mobile header contains hamburger Menu icon');
assert(mobileHeaderCode.includes("aria-label={isDrawerOpen ? 'Close navigation menu' : 'Open navigation menu'}"), 'Hamburger button has dynamic accessible aria-label');
assert(mobileHeaderCode.includes('aria-expanded={Boolean(isDrawerOpen)}'), 'Hamburger button reflects aria-expanded state');
assert(mobileHeaderCode.includes('min-w-[44px] min-h-[44px]'), 'Hamburger button satisfies 44px minimum touch target');

// 5. MOBILE DRAWER COMPONENT VERIFICATION
console.log('\n📌 5. Testing Mobile Drawer Component (MobileDrawer.jsx)...');
const mobileDrawerCode = fs.readFileSync(path.join(__dirname, 'src/components/navigation/MobileDrawer.jsx'), 'utf-8');
assert(mobileDrawerCode.includes('lg:hidden'), 'Mobile drawer is hidden on desktop (lg:hidden)');
assert(mobileDrawerCode.includes('role="dialog"'), 'Mobile drawer has role="dialog"');
assert(mobileDrawerCode.includes('aria-modal="true"'), 'Mobile drawer has aria-modal="true"');
assert(mobileDrawerCode.includes('aria-label="Navigation drawer"'), 'Mobile drawer has aria-label');
assert(mobileDrawerCode.includes('bg-slate-900/50 backdrop-blur-xs'), 'Mobile drawer includes semi-transparent backdrop');
assert(mobileDrawerCode.includes('w-72 max-w-[85vw]'), 'Mobile drawer panel has proper responsive width');
assert(mobileDrawerCode.includes("e.key === 'Escape'"), 'Mobile drawer closes on Escape key');
assert(mobileDrawerCode.includes('window.innerWidth >= 1024'), 'Mobile drawer auto-closes on resize to desktop (>= 1024px)');
assert(mobileDrawerCode.includes('location.pathname'), 'Mobile drawer auto-closes on route/location change');
assert(mobileDrawerCode.includes("document.body.style.overflow = 'hidden'"), 'Mobile drawer locks background body scroll');

// 6. MAIN LAYOUT VERIFICATION
console.log('\n📌 6. Testing Main Layout Integration (MainLayout.jsx)...');
const layoutCode = fs.readFileSync(path.join(__dirname, 'src/layouts/MainLayout.jsx'), 'utf-8');
assert(!layoutCode.includes('<Navbar'), 'MainLayout does NOT render obsolete top <Navbar>');
assert(!layoutCode.includes("import { Navbar }"), 'MainLayout does NOT import Navbar');
assert(layoutCode.includes('<MobileHeader'), 'MainLayout renders <MobileHeader />');
assert(layoutCode.includes('<MobileDrawer'), 'MainLayout renders <MobileDrawer />');
assert(layoutCode.includes('<Sidebar />') || layoutCode.includes('<Sidebar/>'), 'MainLayout renders desktop <Sidebar />');
assert(layoutCode.includes('flex flex-col lg:flex-row'), 'MainLayout uses responsive direction flex-col lg:flex-row');
assert(layoutCode.includes('<Header'), 'MainLayout renders inner page <Header />');
assert(layoutCode.includes('<Outlet />') || layoutCode.includes('<Outlet/>'), 'MainLayout renders router <Outlet />');

// 7. HEADER COMPONENT VERIFICATION
console.log('\n📌 7. Testing Header Component (Header.jsx)...');
const headerCode = fs.readFileSync(path.join(__dirname, 'src/components/Header.jsx'), 'utf-8');
assert(headerCode.includes('relative lg:sticky lg:top-0'), 'Header uses relative on mobile and sticky on desktop to prevent collision');
assert(headerCode.includes('flex flex-col sm:flex-row'), 'Header uses responsive wrapping for mobile viewports');
assert(headerCode.includes('Globe'), 'Header preserves multilingual selector');
assert(headerCode.includes('Gnani AI'), 'Header preserves Gnani AI live indicator');

// 8. VERIFY NO REMAINING TOP NAVBAR COMPONENT
console.log('\n📌 8. Testing Clean Removal of Top Navbar...');
assert(!fs.existsSync(path.join(__dirname, 'src/components/Navbar.jsx')), 'Obsolete Navbar.jsx file is completely removed');

console.log('\n======================================================');
console.log(`Navigation Test Suite Results: ${passedTests}/${totalTests} Passed`);
if (passedTests === totalTests) {
  console.log('🎉 ALL NAVIGATION ARCHITECTURE TESTS PASSED SUCCESSFULLY!');
} else {
  console.error('❌ SOME TESTS FAILED!');
}
console.log('======================================================\n');
