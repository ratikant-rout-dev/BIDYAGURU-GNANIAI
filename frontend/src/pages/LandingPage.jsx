import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../routes/routeConfig';
import {
  Mic,
  Compass,
  FileText,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <nav className="max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl shadow-md shadow-indigo-500/30">
            🎓
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight">Bidya Guru</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              AI
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to={ROUTES.DASHBOARD}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Go to Dashboard ({user?.name || 'Student'})</span>
              <ArrowRight className="w-4 h-4" />
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
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Get Started Free</span>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-16 md:py-24 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wide shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Multilingual Voice-to-Voice AI Career & Communication Mentor</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Speak in your mother tongue.{' '}
          <span className="bg-gradient-to-r from-indigo-300 via-white to-violet-300 bg-clip-text text-transparent">
            Unlock your dream tech career.
          </span>
        </h1>

        <p className="text-base md:text-lg text-indigo-100/80 max-w-2xl mx-auto leading-relaxed">
          Talk naturally in <span className="text-amber-300 font-bold">Odia</span>,{' '}
          <span className="text-emerald-300 font-bold">Hindi</span>, or{' '}
          <span className="text-indigo-300 font-bold">English</span>. Discover personalized roadmaps, practice interviews with real-time spoken feedback, and generate ATS-friendly resumes.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.REGISTER}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/40 flex items-center justify-center gap-3 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <Mic className="w-5 h-5 text-indigo-200" />
            <span>{isAuthenticated ? 'Open Career Dashboard' : 'Start Speaking with AI'}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          {!isAuthenticated && (
            <Link
              to={ROUTES.LOGIN}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-sm transition-all cursor-pointer"
            >
              Sign In with Existing Account
            </Link>
          )}
        </div>

        {/* Feature Badges */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-indigo-200">
          <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Gnani Vachana Speech Engine
          </span>
          <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            Gemini Flash Intelligence
          </span>
          <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            <FileText className="w-3.5 h-3.5 text-violet-300" />
            ATS Resume PDF Engine
          </span>
        </div>
      </section>

      {/* 4 Feature Pillars Grid */}
      <section className="px-6 py-12 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/30">
            <Mic className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-white">Voice-to-Voice AI</h3>
          <p className="text-xs text-indigo-200/80 leading-relaxed">
            Communicate naturally using your voice without typing. AI speaks back with sub-second latency.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-500/20 text-violet-300 flex items-center justify-center border border-violet-400/30">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-white">Personalized Roadmaps</h3>
          <p className="text-xs text-indigo-200/80 leading-relaxed">
            Target role detection, skill gap analysis, and structured learning milestones with progress tracking.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-white">1-on-1 Interview Coach</h3>
          <p className="text-xs text-indigo-200/80 leading-relaxed">
            Spoken interview prompts with AI scoring for answer structure, grammar, clarity, and tech accuracy.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-white">ATS Resume Builder</h3>
          <p className="text-xs text-indigo-200/80 leading-relaxed">
            Single-column text-selectable resume builder. Persists to profile and exports ready-to-apply PDF.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t border-white/10 text-xs text-indigo-300/70">
        <p>© {new Date().getFullYear()} Bidya Guru — Desktop-First AI Career & Communication Mentor.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
