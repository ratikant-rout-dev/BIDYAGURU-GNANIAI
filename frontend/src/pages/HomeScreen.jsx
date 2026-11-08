import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import {
  Mic,
  Target,
  Compass,
  MessageSquare,
  Briefcase,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
  Zap,
  Award,
  FileText,
} from 'lucide-react';

export const HomeScreen = ({ onNavigate }) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [profile, setProfile] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [sumRes, profRes, roadRes] = await Promise.all([
          api.progress.getSummary(),
          api.career.getProfile(),
          api.roadmap.getCurrent(),
        ]);
        if (sumRes.success) setSummary(sumRes.summary);
        if (profRes.success) setProfile(profRes.profile);
        if (roadRes.success) setRoadmap(roadRes.roadmap);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const currentSkill =
    roadmap?.roadmapItems?.find((item) => item.status === 'In Progress') ||
    roadmap?.roadmapItems?.[0];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Hero Welcome Banner - Hackathon Grade */}
      <div className="relative rounded-3xl p-8 md:p-10 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white shadow-2xl border border-indigo-500/20 overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        {/* Ambient Gradient Orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-bold tracking-wide shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span>AI Voice Career & Spoken Communication Mentor</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Welcome, <span className="bg-gradient-to-r from-indigo-200 via-white to-violet-200 bg-clip-text text-transparent">{user?.name || 'Student'}</span> 👋
          </h1>
          <p className="text-sm md:text-base text-indigo-100/90 leading-relaxed font-normal">
            Speak naturally in your preferred language to get personal roadmap guidance, identify skill gaps, and practice real-time interviews with spoken feedback.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-indigo-300">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Gnani STT & TTS Voice Engine
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
              <Zap className="w-3 h-3 text-amber-300" />
              Gemini 3.5 Flash Multilingual Intelligence
            </span>
          </div>
        </div>

        {/* Primary CTA Button: Talk with Bidya Guru */}
        <div className="relative z-10 shrink-0 w-full lg:w-auto">
          <button
            onClick={() => onNavigate('talk')}
            className="group w-full lg:w-auto px-8 py-4.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-600 to-indigo-600 hover:from-indigo-400 hover:to-violet-500 text-white font-extrabold text-base shadow-xl shadow-indigo-600/40 flex items-center justify-center gap-4 transition-all duration-200 transform hover:-translate-y-1 active:translate-y-0 cursor-pointer border border-white/20"
          >
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-md group-hover:scale-110 group-hover:bg-white/30 transition-all shadow-inner">
              <Mic className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="text-left">
              <span className="block text-[11px] uppercase tracking-wider text-indigo-200 font-bold">
                Live AI Conversation
              </span>
              <span className="text-lg font-bold">Talk with Bidya Guru</span>
            </div>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Main Metrics 4-Grid with Elevated Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Target Career Goal */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Target Role
              </span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Target className="w-5 h-5" />
              </div>
            </div>
            <p className="mt-4 text-xl font-extrabold text-slate-900 truncate">
              {profile?.careerGoal || summary?.careerGoal || 'Not Set Yet'}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium truncate">
              Domain: <span className="font-semibold text-slate-700">{profile?.targetField || 'Technology'}</span>
            </p>
          </div>
          <button
            onClick={() => onNavigate('profile')}
            className="mt-5 pt-3 border-t border-slate-100 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-between cursor-pointer group"
          >
            <span>View Career Profile</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Card 2: Identified Skills */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Skills Matrix
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {(profile?.knownSkills?.length || 0) + (profile?.developingSkills?.length || 0)}
              </span>
              <span className="text-xs text-slate-500 font-semibold">skills recorded</span>
            </div>
            <div className="mt-2.5 flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                {profile?.knownSkills?.length || 0} Mastered
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[11px]">
                {profile?.skillsToLearn?.length || 0} To Learn
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('profile')}
            className="mt-5 pt-3 border-t border-slate-100 text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center justify-between cursor-pointer group"
          >
            <span>Manage Skills</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Card 3: Roadmap Progress */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-violet-300 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Roadmap Completion
              </span>
              <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
                <Compass className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {summary?.roadmap?.percentage || 0}%
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                ({summary?.roadmap?.completedSkills || 0}/{summary?.roadmap?.totalSkills || 0} steps)
              </span>
            </div>
            {/* Smooth animated progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-violet-600 h-2.5 rounded-full transition-all duration-700 shadow-xs"
                style={{ width: `${summary?.roadmap?.percentage || 0}%` }}
              ></div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('roadmap')}
            className="mt-5 pt-3 border-t border-slate-100 text-xs font-bold text-violet-600 hover:text-violet-800 flex items-center justify-between cursor-pointer group"
          >
            <span>Track Timeline</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Card 4: Communication Practice */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-300 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Interview Practice
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {summary?.communication?.totalSessions || 0}
              </span>
              <span className="text-xs text-slate-500 font-semibold">turns completed</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 font-medium">
              Average Score:{' '}
              <span className="font-extrabold text-emerald-600">
                {summary?.communication?.averageScore ? `${summary.communication.averageScore}%` : '85%'}
              </span>
            </p>
          </div>
          <button
            onClick={() => onNavigate('communication')}
            className="mt-5 pt-3 border-t border-slate-100 text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center justify-between cursor-pointer group"
          >
            <span>Start Practice</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Two Column Layout: Current Focus & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Current Active Roadmap Focus */}
        <div className="lg:col-span-2 p-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Current Recommended Milestone</h2>
              <p className="text-xs text-slate-500 font-medium">Personalized next skill step generated by AI</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-xs">
              ⚡ In Progress
            </span>
          </div>

          {currentSkill ? (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 border border-slate-200/90 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-indigo-700 uppercase tracking-wider bg-indigo-100/60 px-2.5 py-0.5 rounded-md">
                  Step #{currentSkill.order || 1}
                </span>
                <span className="text-xs text-slate-600 font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {currentSkill.duration || '1-2 weeks'}
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">{currentSkill.skill}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{currentSkill.description}</p>

              {currentSkill.keyTopics?.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-2">
                  {currentSkill.keyTopics.map((topic, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 shadow-2xs"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-200/70 gap-3">
                <span className="text-xs text-slate-500 font-medium">
                  Curated Resources: <strong className="text-slate-700 font-semibold">{currentSkill.resources?.join(', ') || 'Official Docs, MDN'}</strong>
                </span>
                <button
                  onClick={() => onNavigate('roadmap')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer text-center"
                >
                  Open Full Roadmap
                </button>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-300">
              <Compass className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-base font-bold text-slate-800">No active roadmap generated yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Talk with Bidya Guru Voice AI or navigate to Career Roadmap to generate one tailored to you.
              </p>
              <button
                onClick={() => onNavigate('talk')}
                className="mt-5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                Talk with AI to Generate
              </button>
            </div>
          )}
        </div>

        {/* Right (1 col): Fast Interactive Action Cards */}
        <div className="p-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900">Fast Action Hub</h2>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate('talk')}
              className="w-full p-4 rounded-2xl bg-indigo-50/60 hover:bg-indigo-100/80 border border-indigo-100/90 flex items-center gap-3.5 text-left transition-all duration-150 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Mic className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-indigo-950">Ask Career Questions</p>
                <p className="text-[11px] text-indigo-700 font-medium">Spoken guidance in English, Hindi, Odia</p>
              </div>
              <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('communication')}
              className="w-full p-4 rounded-2xl bg-emerald-50/60 hover:bg-emerald-100/80 border border-emerald-100/90 flex items-center gap-3.5 text-left transition-all duration-150 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-emerald-950">1-on-1 Interview Coach</p>
                <p className="text-[11px] text-emerald-700 font-medium">Instant spoken error & grammar feedback</p>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('profile')}
              className="w-full p-4 rounded-2xl bg-violet-50/60 hover:bg-violet-100/80 border border-violet-100/90 flex items-center gap-3.5 text-left transition-all duration-150 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Target className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-violet-950">Skill Matrix & Gaps</p>
                <p className="text-[11px] text-violet-700 font-medium">Verify known skills & learning priorities</p>
              </div>
              <ChevronRight className="w-4 h-4 text-violet-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('resume')}
              className="w-full p-4 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100/90 border border-indigo-200/90 flex items-center gap-3.5 text-left transition-all duration-150 cursor-pointer group shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-indigo-950">Create ATS Resume</p>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800">
                    PDF
                  </span>
                </div>
                <p className="text-[11px] text-indigo-700 font-medium">Build, save & download ATS-friendly PDF</p>
              </div>
              <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('jobs')}
              className="w-full p-4 rounded-2xl bg-amber-50/60 hover:bg-amber-100/80 border border-amber-100/90 flex items-center gap-3.5 text-left transition-all duration-150 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-amber-950">Job Match & Apply</p>
                <p className="text-[11px] text-amber-700 font-medium">Live jobs ranked by your skills</p>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
