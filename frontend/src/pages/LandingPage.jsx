import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../routes/routeConfig';
import {
  GraduationCap,
  Sparkles,
  Mic,
  Compass,
  MessageSquare,
  FileText,
  CheckCircle2,
  ArrowRight,
  Globe,
  Zap,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Briefcase,
  Target,
  Award,
  BookOpen,
  Users,
  Code2,
  Volume2,
  Bot,
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('talk');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Product Preview', href: '#preview' },
    { label: 'Who It Is For', href: '#who-can-use' },
    { label: 'About', href: '#about' },
    { label: 'FAQ', href: '#faq' },
  ];

  const features = [
    {
      icon: Mic,
      color: 'indigo',
      badge: 'Voice-to-Voice AI',
      title: 'Multilingual Spoken AI Mentor',
      desc: 'Speak naturally in Odia, Hindi, or English. Receive instant spoken guidance powered by the Gnani Vachana Speech Engine and Gemini AI without typing.',
    },
    {
      icon: Compass,
      color: 'violet',
      badge: 'Smart Milestones',
      title: 'Personalized Career Roadmaps',
      desc: 'Discover tailored career paths from 10th and 12th stream selection to full-stack tech engineering. Track milestone progress step-by-step.',
    },
    {
      icon: MessageSquare,
      color: 'emerald',
      badge: '1-on-1 Coaching',
      title: 'Real-Time Spoken Interview Coach',
      desc: 'Practice technical and behavioral interviews out loud. Get live AI scoring on answer structure, technical accuracy, and spoken grammar.',
    },
    {
      icon: FileText,
      color: 'amber',
      badge: 'Single Source of Truth',
      title: 'ATS-Friendly Resume Builder',
      desc: 'Create single-column, text-selectable resumes synchronized directly with your profile. Export print-ready, ATS-compliant PDFs with one click.',
    },
    {
      icon: Target,
      color: 'blue',
      badge: 'Data Synchronization',
      title: 'Centralized Personal & Career Profile',
      desc: 'Manage your contact info, verified skills, developing abilities, and learning priorities in one unified profile that continuously powers your AI context.',
    },
    {
      icon: Briefcase,
      color: 'rose',
      badge: 'Smart Matching',
      title: 'Skill-Ranked Job Discovery',
      desc: 'Discover live career opportunities matched directly against your roadmap skills, location preferences, and career targets with percentage fit scores.',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Create Your Account & Set Language',
      desc: 'Register in seconds and choose your preferred language: English, Hindi, or Odia. Your voice experience is customized from day one.',
      icon: Users,
    },
    {
      step: '02',
      title: 'Complete Your Unified Profile',
      desc: 'Add your basic details, educational background, career goals, and skills. Your information becomes the shared single source of truth.',
      icon: BookOpen,
    },
    {
      step: '03',
      title: 'Talk with Bidya Guru AI',
      desc: 'Have spoken conversations about stream selection, college options, or tech career paths. Receive personalized roadmap milestones.',
      icon: Mic,
    },
    {
      step: '04',
      title: 'Practice 1-on-1 Spoken Interviews',
      desc: 'Build confidence with real-time audio interview simulations. Bidya Guru listens, evaluates your responses, and provides constructive feedback.',
      icon: MessageSquare,
    },
    {
      step: '05',
      title: 'Export ATS Resume & Match Jobs',
      desc: 'Generate your professionally formatted, ATS-compliant PDF resume and explore jobs that match your verified roadmap skills.',
      icon: Award,
    },
  ];

  const audiences = [
    {
      title: '10th & 12th School Students',
      badge: 'Stream Discovery',
      tagline: 'Make informed choices early',
      points: [
        'Unsure between Science, Commerce, and Arts streams',
        'Explore early career roadmaps in plain regional language',
        'Understand competitive exams, entrance tests, and requirements',
        'Ask open career questions without hesitation or judgment',
      ],
      icon: GraduationCap,
      accent: 'from-indigo-600 to-indigo-800',
    },
    {
      title: 'College Students & Freshers',
      badge: 'Career Preparation',
      tagline: 'Bridging classroom to industry',
      points: [
        'Structured roadmaps for Software, Data, Banking, and Civil Services',
        'Identify exact skill gaps and curated learning resources',
        'Build ATS-compliant resumes with verified projects and skills',
        'Eliminate interview anxiety through spoken practice',
      ],
      icon: Code2,
      accent: 'from-violet-600 to-indigo-800',
    },
    {
      title: 'Job Seekers & Career Changers',
      badge: 'Job Ready',
      tagline: 'Land roles aligned with your strengths',
      points: [
        'Benchmark verified skills against current market job requirements',
        'Single-column ATS resume export that clears automated filters',
        'Mock behavioral and technical interviews with instant scoring',
        'Explore curated job listings with percentage compatibility match',
      ],
      icon: Briefcase,
      accent: 'from-emerald-600 to-indigo-800',
    },
  ];

  const faqs = [
    {
      q: 'What is BIDYA GURU?',
      a: 'BIDYA GURU is a desktop and mobile-friendly AI career, learning, and communication platform. It combines multilingual voice AI (powered by Gnani Speech Engine and Google Gemini), personalized learning roadmaps, an ATS-compliant resume builder, and an interactive 1-on-1 spoken interview coach into one unified student portal.',
    },
    {
      q: 'Can I speak in Odia, Hindi, or English?',
      a: 'Yes! BIDYA GURU offers native voice-to-voice interaction in Odia, Hindi, and Indian English. You can speak naturally through your microphone, and BIDYA GURU responds with both spoken voice and formatted text in your chosen language.',
    },
    {
      q: 'Is BIDYA GURU free to get started?',
      a: 'Yes. You can create an account for free, set up your profile, chat with the AI mentor, generate your personalized roadmap, and build your ATS-ready resume.',
    },
    {
      q: 'How does the ATS Resume Builder work?',
      a: 'The resume builder uses a clean, single-column, standard-format layout recommended by top recruiters and automated Applicant Tracking Systems. It automatically syncs your personal details and verified skills from your profile and exports downloadable PDFs ready to submit to employers.',
    },
    {
      q: 'How does the 1-on-1 Interview Coach help me?',
      a: 'The Interview Coach conducts realistic mock interview sessions using voice interaction. It evaluates your spoken responses in real-time, providing constructive feedback on structure, technical accuracy, and communication clarity with a percentage performance score.',
    },
    {
      q: 'Is my personal and career profile editable?',
      a: 'Absolutely. You have a dedicated My Profile page where you can update your contact details, professional links, career goals, and skills matrix (Mastered, In Progress, To Learn) at any time. Any changes immediately update your AI guidance context and resume data.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-indigo-500 selection:text-white flex flex-col font-sans">
      {/* 1. TOP NAVBAR */}
      <nav
        aria-label="Landing page navigation"
        className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 border border-indigo-400/20 group-hover:scale-105 transition-transform shrink-0">
              <span className="text-xl">🎓</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                Bidya Guru
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                AI
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-300">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-white/5 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Auth Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={ROUTES.DASHBOARD}
                className="px-4.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Dashboard ({user?.name || 'Student'})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to={ROUTES.LOGIN}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Sign In
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Get Started Free</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-b border-white/10 px-4 pt-3 pb-6 space-y-3 animate-in fade-in duration-200">
            <div className="flex flex-col space-y-1">
              {navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link
                  to={ROUTES.DASHBOARD}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl bg-indigo-600 text-center font-bold text-sm text-white shadow-md flex items-center justify-center gap-2"
                >
                  <span>Go to Dashboard ({user?.name || 'Student'})</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to={ROUTES.LOGIN}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl text-center text-sm font-bold text-slate-200 hover:bg-white/10 border border-white/10"
                  >
                    Sign In
                  </Link>
                  <Link
                    to={ROUTES.REGISTER}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 rounded-xl bg-indigo-600 text-center text-sm font-bold text-white shadow-md flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Get Started Free</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION */}
      <section id="home" className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 sm:space-y-8 relative z-10">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wide shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Multilingual Voice-to-Voice AI Career & Communication Mentor</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mx-auto">
            Your Learning Journey,{' '}
            <span className="bg-gradient-to-r from-indigo-300 via-white to-violet-300 bg-clip-text text-transparent">
              Smarter with BIDYA GURU.
            </span>
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            An intelligent learning and career guidance platform designed to help you organize your
            learning journey, explore your potential, and move toward your career goals. Speak naturally in{' '}
            <span className="text-amber-300 font-bold">Odia</span>,{' '}
            <span className="text-emerald-300 font-bold">Hindi</span>, or{' '}
            <span className="text-indigo-300 font-bold">English</span>.
          </p>

          {/* CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            <Link
              to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.REGISTER}
              className="w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/35 flex items-center justify-center gap-2.5 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>{isAuthenticated ? 'Open Career Dashboard' : 'Get Started Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#features"
              className="w-full sm:w-auto px-6 py-3.5 sm:py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Explore Features</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </a>
          </div>

          {/* Engine Trust Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Gnani Vachana Speech Engine (Odia • Hindi • English)
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              Gemini AI Intelligence
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
              ATS Single-Column Resume PDF Engine
            </span>
          </div>

          {/* Hero Visual Mockup Preview */}
          <div className="pt-8 sm:pt-12 max-w-4xl mx-auto">
            <div className="relative rounded-3xl p-3 sm:p-5 bg-gradient-to-b from-white/15 to-white/5 border border-white/15 shadow-2xl backdrop-blur-md">
              <div className="bg-slate-950 rounded-2xl border border-white/10 overflow-hidden text-left shadow-inner">
                {/* Mockup Titlebar */}
                <div className="px-4 py-3 bg-slate-900 border-b border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-slate-400 font-mono text-[11px]">
                      bidyaguru.edu/talk — Voice AI Career Mentor
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live 16kHz Audio
                  </span>
                </div>

                {/* Mockup Conversation Workspace */}
                <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
                  {/* User Bubble */}
                  <div className="flex items-start gap-3 flex-row-reverse">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 border border-white/10">
                      R
                    </div>
                    <div className="max-w-md bg-indigo-600 text-white rounded-2xl rounded-tr-none p-3.5 shadow-sm leading-relaxed">
                      "I just completed 10th class in Odisha. What are the right stream choices for pursuing computer science?"
                    </div>
                  </div>

                  {/* Assistant Bubble */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                      🎓
                    </div>
                    <div className="max-w-lg bg-slate-900 border border-white/10 text-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm space-y-2.5 leading-relaxed">
                      <div className="flex items-center justify-between text-[11px] text-indigo-300 font-semibold border-b border-white/5 pb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                          Bidya Guru Voice Response (Odia / English)
                        </span>
                        <span>Just now</span>
                      </div>
                      <p>
                        Congratulations on completing your 10th! For Computer Science, the primary choice is{' '}
                        <strong className="text-white">Science with PCM (Physics, Chemistry, Mathematics)</strong>.
                        Alternatively, you can also explore a 3-year Diploma in Computer Science Engineering (Polytechnic).
                      </p>
                      <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-bold">
                          1. 11th-12th Science (PCM)
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                          2. Polytechnic Diploma (CSE)
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold">
                          3. Skill Roadmap: Python & Math
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT BIDYA GURU */}
      <section id="about" className="py-16 sm:py-24 bg-slate-950/60 border-y border-white/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              About BIDYA GURU
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Democratizing Career Guidance in Your Mother Tongue
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Millions of students in India make irreversible educational and career decisions without
              access to personalized mentors. Language barriers and fragmented tools make the problem worse.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-lg font-bold text-white">The Problem</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Most career platforms expect flawless English and focus exclusively on Tier-1 graduates.
                Students from regional backgrounds lack approachable advice in their native language when
                choosing 10th/12th streams, diploma courses, or college majors.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-500/20 text-violet-300 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-lg font-bold text-white">Our Solution</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                BIDYA GURU provides an accessible, voice-first mentor that converses naturally in Odia,
                Hindi, and English. By combining voice speech synthesis with structured milestones, students
                can ask any question aloud and receive immediate clarity.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-lg font-bold text-white">The Outcome</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Students progress with complete confidence: personalized career roadmaps, continuous profile
                synchronization, spoken interview practice with instant error scoring, and single-click
                ATS-friendly resume downloads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES GRID */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Platform Capabilities
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Comprehensive Tools for Every Stage of Your Career
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Every feature in BIDYA GURU is built to connect seamlessly, from your initial voice conversation
            to your final ATS resume and job matches.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-400/40 hover:bg-white/[0.07] transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 text-indigo-300" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                      {f.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2">
                      {f.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 flex items-center text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
                  <span>Included in Platform</span>
                  <Check className="w-4 h-4 ml-1.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-slate-950/70 border-y border-white/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Workflow
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              How BIDYA GURU Guides Your Journey
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              A simple, five-step pathway from your first conversation to a competitive career portfolio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-6">
            {steps.map((st, idx) => {
              const Icon = st.icon;
              return (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-between relative space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-black text-indigo-400/80 font-mono">
                        {st.step}
                      </span>
                      <div className="p-2 rounded-xl bg-white/5 text-indigo-300">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="font-bold text-sm text-white">{st.title}</h3>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE PRODUCT PREVIEW */}
      <section id="preview" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Live Preview
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Experience the Core Modules
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Take a look at how each module works once you log into your student dashboard.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[
            { id: 'talk', label: 'Voice AI Mentor', icon: Mic },
            { id: 'roadmap', label: 'Career Roadmap', icon: Compass },
            { id: 'resume', label: 'ATS Resume Builder', icon: FileText },
            { id: 'interview', label: 'Interview Coach', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activePreviewTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActivePreviewTab(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Canvas */}
        <div className="bg-slate-950 rounded-3xl border border-white/15 p-4 sm:p-8 shadow-2xl">
          {activePreviewTab === 'talk' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                <span className="font-bold text-white flex items-center gap-2">
                  <Mic className="w-4 h-4 text-indigo-400" />
                  Live Voice Assistant Canvas
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  16kHz Speech Calibration Active
                </span>
              </div>
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 text-slate-300">
                  <p className="font-semibold text-indigo-300 mb-1">Student (Voice Input):</p>
                  "I want to prepare for Java Backend Developer jobs. What steps should I prioritize this month?"
                </div>
                <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-100 space-y-2">
                  <p className="font-bold text-white flex items-center gap-2">
                    <Bot className="w-4 h-4 text-indigo-400" />
                    Bidya Guru AI Response:
                  </p>
                  <p className="leading-relaxed">
                    Based on your profile, you have mastered Java OOP basics. Your next milestones are:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-200">
                    <li>Spring Boot REST API development & dependency injection</li>
                    <li>Relational databases (PostgreSQL/MySQL) & JPA Hibernate</li>
                    <li>Building a complete CRUD microservice project for your resume</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activePreviewTab === 'roadmap' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                <span className="font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-violet-400" />
                  Personalized Roadmap: Full Stack Developer
                </span>
                <span className="text-xs text-indigo-300 font-bold">Progress: 60% Completed</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    Completed
                  </span>
                  <h4 className="font-bold text-white text-sm">Step 1: Core Fundamentals</h4>
                  <p className="text-xs text-slate-300">HTML5, CSS3, Modern JavaScript ES6, Git GitHub</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 space-y-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300">
                    In Progress
                  </span>
                  <h4 className="font-bold text-white text-sm">Step 2: React & State Management</h4>
                  <p className="text-xs text-slate-300">Hooks, Context API, Tailwind CSS, API Integration</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-500/20 text-slate-400">
                    Upcoming
                  </span>
                  <h4 className="font-bold text-white text-sm">Step 3: Backend & Database</h4>
                  <p className="text-xs text-slate-400">Node.js Express, MongoDB Atlas, Authentication</p>
                </div>
              </div>
            </div>
          )}

          {activePreviewTab === 'resume' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                <span className="font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  ATS-Friendly Single-Column PDF Preview
                </span>
                <span className="text-[11px] font-bold text-emerald-400">ATS Score: 95/100</span>
              </div>
              <div className="bg-white text-slate-900 p-5 rounded-2xl shadow-md space-y-3 font-sans text-xs">
                <div className="text-center border-b border-slate-200 pb-2">
                  <h4 className="text-base font-extrabold uppercase text-slate-900 tracking-wider">
                    Rohan Mohapatra
                  </h4>
                  <p className="text-slate-600 text-[11px]">Bhubaneswar, Odisha • rohan@example.com • linkedin.com/in/rohan</p>
                </div>
                <div>
                  <h5 className="font-bold uppercase tracking-wider text-slate-800 text-[10px] border-b border-slate-200 pb-0.5 mb-1">
                    Technical Skills
                  </h5>
                  <p className="text-slate-700">Languages: JavaScript, Java, SQL • Frontend: React, Tailwind CSS • Backend: Node.js, Express, MongoDB</p>
                </div>
                <div>
                  <h5 className="font-bold uppercase tracking-wider text-slate-800 text-[10px] border-b border-slate-200 pb-0.5 mb-1">
                    Education
                  </h5>
                  <p className="text-slate-800 font-bold">B.Tech in Computer Science & Engineering</p>
                  <p className="text-slate-600 text-[11px]">Bhubaneswar Institute of Technology • 2021 - 2025</p>
                </div>
              </div>
            </div>
          )}

          {activePreviewTab === 'interview' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                <span className="font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  Live Interview Coach Evaluation
                </span>
                <span className="text-xs font-bold text-emerald-300">Answer Score: 88%</span>
              </div>
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-emerald-400">Coach Question:</span>
                  <p className="text-white mt-1">"Can you explain the difference between SQL and NoSQL databases?"</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-100 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-emerald-300">Coach Feedback:</span>
                  <p className="text-xs text-slate-200">
                    Good definition! You clearly articulated ACID compliance versus horizontal scalability. To elevate your answer, provide an example scenario (e.g. e-commerce transactional orders vs user session logs).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 7. WHO CAN USE BIDYA GURU */}
      <section id="who-can-use" className="py-16 sm:py-24 bg-slate-950/60 border-y border-white/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Target Audience
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Built for Every Ambitious Learner
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Whether you are taking your first step after school or preparing for your next tech interview,
              BIDYA GURU adapts to your exact level.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {audiences.map((aud, idx) => {
              const Icon = aud.icon;
              return (
                <div
                  key={idx}
                  className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 text-indigo-300 border border-white/10">
                        {aud.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white">{aud.title}</h3>
                      <p className="text-xs text-indigo-300 font-semibold mt-1">{aud.tagline}</p>
                    </div>

                    <ul className="space-y-2.5 text-xs text-slate-300">
                      {aud.points.map((pt, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.REGISTER}
                    className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold text-center border border-white/10 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-4">
          <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Everything you need to know about BIDYA GURU and getting started.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-white flex items-center justify-between gap-4 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <div className="p-1 rounded-lg bg-white/5 text-slate-300 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. FINAL CALL TO ACTION */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="relative rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-500/30 shadow-2xl text-center space-y-6 overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              Start Your Personalized Learning Journey
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Start Building Your Learning and Career Journey Today.
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed font-normal">
              Join thousands of learners discovering their path in Odia, Hindi, and English. Free registration,
              instant voice mentor access, and automated ATS resume export.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.REGISTER}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/40 flex items-center justify-center gap-2.5 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {!isAuthenticated && (
                <Link
                  to={ROUTES.LOGIN}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-sm transition-all cursor-pointer text-center"
                >
                  Sign In with Existing Account
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="mt-auto py-12 border-t border-white/10 bg-slate-950 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-base shadow-sm">
                🎓
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">Bidya Guru</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                AI
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Desktop & mobile multilingual AI career mentor, personalized roadmap engine, and ATS-friendly resume builder.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>English</span> • <span>हिंदी</span> • <span>ଓଡ଼ିଆ</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-1.5 text-xs">
              {navLinks.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Platform Features */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Features</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to={isAuthenticated ? ROUTES.TALK : ROUTES.LOGIN} className="hover:text-white transition-colors">
                  Talk with Bidya Guru AI
                </Link>
              </li>
              <li>
                <Link to={isAuthenticated ? ROUTES.ROADMAP : ROUTES.LOGIN} className="hover:text-white transition-colors">
                  Personalized Roadmaps
                </Link>
              </li>
              <li>
                <Link to={isAuthenticated ? ROUTES.COMMUNICATION : ROUTES.LOGIN} className="hover:text-white transition-colors">
                  1-on-1 Interview Coach
                </Link>
              </li>
              <li>
                <Link to={isAuthenticated ? ROUTES.CREATE_RESUME : ROUTES.LOGIN} className="hover:text-white transition-colors">
                  ATS Resume Builder
                </Link>
              </li>
              <li>
                <Link to={isAuthenticated ? ROUTES.PROFILE : ROUTES.LOGIN} className="hover:text-white transition-colors">
                  Unified Profile Matrix
                </Link>
              </li>
              <li>
                <Link to={isAuthenticated ? ROUTES.JOBS : ROUTES.LOGIN} className="hover:text-white transition-colors">
                  Skill-Ranked Job Matches
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Account & Security */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Access</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to={ROUTES.LOGIN} className="hover:text-white transition-colors">
                  Sign In to Account
                </Link>
              </li>
              <li>
                <Link to={ROUTES.REGISTER} className="hover:text-white transition-colors">
                  Create Free Account
                </Link>
              </li>
              <li>
                <Link to={ROUTES.FORGOT_PASSWORD} className="hover:text-white transition-colors">
                  Reset Password
                </Link>
              </li>
              {isAuthenticated && (
                <li>
                  <Link to={ROUTES.DASHBOARD} className="text-indigo-400 font-semibold hover:text-indigo-300">
                    Open Student Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>© {new Date().getFullYear()} BIDYA GURU. Powered by Gnani Voice Engine & Gemini AI.</p>
          <p className="text-[11px] text-slate-500">
            Desktop, Tablet & Mobile Responsive Experience.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
