import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ROUTES } from './routeConfig';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';

// Public Pages (Eagerly loaded for instant first paint)
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Authenticated Application Screens (Lazy-loaded for code splitting and instant bundle delivery)
const HomeScreen = React.lazy(() =>
  import('../pages/HomeScreen').then((m) => ({ default: m.HomeScreen }))
);
const TalkScreen = React.lazy(() =>
  import('../pages/TalkScreen').then((m) => ({ default: m.TalkScreen }))
);
const CareerProfileScreen = React.lazy(() =>
  import('../pages/CareerProfileScreen').then((m) => ({
    default: m.CareerProfileScreen,
  }))
);
const RoadmapScreen = React.lazy(() =>
  import('../pages/RoadmapScreen').then((m) => ({ default: m.RoadmapScreen }))
);
const CommunicationScreen = React.lazy(() =>
  import('../pages/CommunicationScreen').then((m) => ({
    default: m.CommunicationScreen,
  }))
);
const JobMatchScreen = React.lazy(() =>
  import('../pages/JobMatchScreen').then((m) => ({ default: m.JobMatchScreen }))
);
const CreateResumeScreen = React.lazy(() =>
  import('../pages/CreateResumeScreen').then((m) => ({
    default: m.CreateResumeScreen,
  }))
);

// Fallback loader for lazy chunks
const PageLoader = () => (
  <div className="p-12 flex flex-col items-center justify-center space-y-4 min-h-[50vh]">
    <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    <p className="text-xs font-semibold text-slate-500">Loading screen...</p>
  </div>
);

// Navigation adapter wrapping screen components with onNavigate prop for backward-compatibility
const ScreenWrapper = ({ Component }) => {
  const navigate = useNavigate();

  const handleNavigate = (screenId) => {
    const map = {
      home: ROUTES.DASHBOARD,
      dashboard: ROUTES.DASHBOARD,
      talk: ROUTES.TALK,
      profile: ROUTES.PROFILE,
      roadmap: ROUTES.ROADMAP,
      communication: ROUTES.COMMUNICATION,
      jobs: ROUTES.JOBS,
      resume: ROUTES.CREATE_RESUME,
    };
    navigate(map[screenId] || `/${screenId}`);
  };

  return (
    <Suspense fallback={<PageLoader />}>
      <Component onNavigate={handleNavigate} />
    </Suspense>
  );
};

export const AppRouter = () => {
  return (
    <Routes>
      {/* 1. Public Home Landing Page */}
      <Route path={ROUTES.HOME} element={<LandingPage />} />

      {/* 2. Public Authentication Pages (Redirects authenticated users to /dashboard) */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
        </Route>
      </Route>

      {/* 3. Protected Application Pages (Requires valid session, redirects unauthenticated to /login) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* Legacy redirect for /home */}
          <Route path="/home" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

          <Route
            path={ROUTES.DASHBOARD}
            element={<ScreenWrapper Component={HomeScreen} />}
          />
          <Route
            path={ROUTES.TALK}
            element={<ScreenWrapper Component={TalkScreen} />}
          />
          <Route
            path={ROUTES.PROFILE}
            element={<ScreenWrapper Component={CareerProfileScreen} />}
          />
          <Route
            path={ROUTES.ROADMAP}
            element={<ScreenWrapper Component={RoadmapScreen} />}
          />
          <Route
            path={ROUTES.COMMUNICATION}
            element={<ScreenWrapper Component={CommunicationScreen} />}
          />
          <Route
            path={ROUTES.JOBS}
            element={<ScreenWrapper Component={JobMatchScreen} />}
          />
          <Route
            path={ROUTES.CREATE_RESUME}
            element={<ScreenWrapper Component={CreateResumeScreen} />}
          />
        </Route>
      </Route>

      {/* 4. Global 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
