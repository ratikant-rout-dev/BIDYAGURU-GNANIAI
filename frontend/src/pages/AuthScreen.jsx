import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mic, Sparkles, Compass, ShieldCheck, ArrowRight, Lock, Mail, User, AlertCircle } from 'lucide-react';

export const AuthScreen = () => {
  const { login, register, language, setLanguage } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(name, email, password, language);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('demo.student@bidyaguru.edu');
    setPassword('Student@123');
    setName('Aarav Nayak');
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left: Brand Presentation */}
        <div className="p-10 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shadow-inner">
                🎓
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Bidya Guru</h1>
                <p className="text-xs text-indigo-200 font-medium tracking-wide">
                  Speak. Learn. Grow.
                </p>
              </div>
            </div>

            <div className="mt-12 space-y-6">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Mic className="w-4 h-4 text-indigo-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">Voice-to-Voice Mentorship</h3>
                  <p className="text-xs text-indigo-200/80 mt-0.5">
                    Talk naturally with Bidya Guru AI in your mother tongue — Odia, Hindi, or English.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Compass className="w-4 h-4 text-violet-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">Personalized Career Roadmap</h3>
                  <p className="text-xs text-indigo-200/80 mt-0.5">
                    Gemini AI detects your goal, analyzes skill gaps, and generates step-by-step milestones.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">Communication Practice & Feedback</h3>
                  <p className="text-xs text-indigo-200/80 mt-0.5">
                    Prepare for tech interviews with AI scoring for answer structure, clarity, and relevance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 relative z-10 pt-6 border-t border-white/10 text-[11px] text-indigo-300 flex items-center justify-between">
            <span>Powered by Gnani Voice & Gemini AI</span>
            <span className="font-medium bg-white/10 px-2 py-0.5 rounded-full text-white/90">
              Desktop-First Web App
            </span>
          </div>
        </div>

        {/* Right: Auth Form */}
        <div className="p-10 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isRegister ? 'Create Student Account' : 'Welcome to Bidya Guru'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {isRegister
                ? 'Sign up to discover your personalized career roadmap and voice mentor'
                : 'Sign in to access your home and continue your voice mentorship'}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rohan Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-sm transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-sm transition-all"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Preferred Language
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'en-IN', label: 'English' },
                    { code: 'hi-IN', label: 'हिंदी' },
                    { code: 'or-IN', label: 'ଓଡ଼ିଆ' },
                  ].map((l) => (
                    <button
                      type="button"
                      key={l.code}
                      onClick={() => setLanguage(l.code)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                        language === l.code
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isRegister ? 'Sign Up' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials for Reviewers */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {isRegister
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </button>

            <button
              type="button"
              onClick={fillDemoAccount}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            >
              Fill Demo Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

