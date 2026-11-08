import {
  Home,
  Mic,
  Target,
  Compass,
  Briefcase,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { ROUTES } from '../../routes/routeConfig.js';

export const NAV_ITEMS = [
  {
    to: ROUTES.DASHBOARD,
    id: 'home',
    label: 'Home',
    icon: Home,
    badge: null,
    highlight: false,
  },
  {
    to: ROUTES.TALK,
    id: 'talk',
    label: 'Talk with AI',
    icon: Mic,
    badge: 'Voice AI',
    highlight: true,
  },
  {
    to: ROUTES.PROFILE,
    id: 'profile',
    label: 'Career Profile',
    icon: Target,
    badge: null,
    highlight: false,
  },
  {
    to: ROUTES.ROADMAP,
    id: 'roadmap',
    label: 'Career Roadmap',
    icon: Compass,
    badge: null,
    highlight: false,
  },
  {
    to: ROUTES.JOBS,
    id: 'jobs',
    label: 'Job Match & Apply',
    icon: Briefcase,
    badge: 'Jobs',
    highlight: false,
  },
  {
    to: ROUTES.CREATE_RESUME,
    id: 'resume',
    label: 'Create Resume',
    icon: FileText,
    badge: 'ATS',
    highlight: false,
  },
  {
    to: ROUTES.COMMUNICATION,
    id: 'communication',
    label: 'Communication Practice',
    icon: MessageSquare,
    badge: null,
    highlight: false,
  },
];

export default NAV_ITEMS;
