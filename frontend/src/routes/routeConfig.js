export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  TALK: '/talk',
  PROFILE: '/profile',
  ROADMAP: '/roadmap',
  COMMUNICATION: '/communication',
  JOBS: '/jobs',
  CREATE_RESUME: '/create-resume',
};

export const ROUTE_TITLES = {
  [ROUTES.DASHBOARD]: {
    title: 'Home Overview',
    subtitle: 'Monitor your career learning journey and communication practice',
  },
  [ROUTES.TALK]: {
    title: 'Talk with Bidya Guru',
    subtitle: 'Multilingual Voice-to-Voice AI Career Mentor',
  },
  [ROUTES.PROFILE]: {
    title: 'My Profile',
    subtitle: 'Manage your personal details, career goals, skills matrix, and preferences',
  },
  [ROUTES.ROADMAP]: {
    title: 'Personalized Career Roadmap',
    subtitle: 'Structured step-by-step milestones toward your dream tech career',
  },
  [ROUTES.COMMUNICATION]: {
    title: 'Communication Practice',
    subtitle: 'Interactive 1-on-1 voice interview coach with live feedback',
  },
  [ROUTES.JOBS]: {
    title: 'Job Match & Apply',
    subtitle: 'Real-time job opportunities matched with your roadmap & verified skills',
  },
  [ROUTES.CREATE_RESUME]: {
    title: 'Create Your Resume',
    subtitle: 'Craft an ATS-optimized professional resume and download ready-to-apply PDF',
  },
};

export default ROUTES;
