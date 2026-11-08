import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../api';
import {
  Compass,
  CheckCircle2,
  Clock,
  Lock,
  PlayCircle,
  Sparkles,
  RefreshCw,
  BookOpen,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const RoadmapScreen = ({ onNavigate }) => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      const data = await api.roadmap.getCurrent();
      if (data.success && data.roadmap) {
        setRoadmap(data.roadmap);
      }
    } catch (err) {
      console.error('Failed to fetch roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const data = await api.roadmap.generate({});
      if (data.success && data.roadmap) {
        setRoadmap(data.roadmap);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error('Generate roadmap error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusChange = async (itemId, nextStatus) => {
    setUpdatingId(itemId);
    try {
      const data = await api.roadmap.updateItemStatus(itemId, nextStatus);
      if (data.success && data.roadmap) {
        setRoadmap(data.roadmap);
        if (nextStatus === 'Completed') {
          confetti({
            particleCount: 100,
            spread: 60,
            origin: { y: 0.7 },
          });
        }
      }
    } catch (err) {
      console.error('Update item status error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const items = roadmap?.roadmapItems || [];
  const total = items.length;
  const completedCount = items.filter((i) => i.status === 'Completed').length;
  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Personalized Career Roadmap
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              v{roadmap?.version || 1}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Goal: <span className="font-semibold text-slate-800">{roadmap?.targetGoal || 'Software Engineer'}</span>
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
          <span>{generating ? 'Regenerating...' : 'Regenerate with Gemini AI'}</span>
        </button>
      </div>

      {/* Progress Card */}
      <div className="p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Overall Roadmap Completion</span>
          <span className="text-indigo-600 font-extrabold text-sm">{percentage}% Completed</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-3 rounded-full transition-all duration-700"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>{completedCount} of {total} Milestones Mastered</span>
          <span>{total - completedCount} Skills Remaining</span>
        </div>
      </div>

      {/* Roadmap Interactive Step Journey */}
      <div className="space-y-4">
        {items.map((item, idx) => {
          const isCompleted = item.status === 'Completed';
          const isInProgress = item.status === 'In Progress';
          const isLocked = item.status === 'Locked';

          return (
            <div
              key={item._id || idx}
              className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all duration-200 ${
                isCompleted
                  ? 'bg-emerald-50/30 border-emerald-200/70 shadow-xs'
                  : isInProgress
                  ? 'bg-white border-indigo-400 shadow-md ring-2 ring-indigo-600/10'
                  : 'bg-white/80 border-slate-200/80 opacity-80'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Step Order Badge */}
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isInProgress
                        ? 'bg-indigo-600 text-white shadow-indigo-200 animate-pulse'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isLocked ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <span>#{item.order || idx + 1}</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">{item.skill}</h2>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isInProgress
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      {item.description}
                    </p>

                    {item.keyTopics?.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {item.keyTopics.map((topic, tidx) => (
                          <span
                            key={tidx}
                            className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 font-medium text-slate-700"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Duration & Status Actions */}
                <div className="flex flex-col md:items-end gap-2.5 shrink-0">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {item.duration || '1-2 weeks'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isInProgress && (
                      <button
                        onClick={() => handleStatusChange(item._id, 'Completed')}
                        disabled={updatingId === item._id}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Completed</span>
                      </button>
                    )}

                    {isLocked && (
                      <button
                        onClick={() => handleStatusChange(item._id, 'In Progress')}
                        disabled={updatingId === item._id}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Start Milestone</span>
                      </button>
                    )}

                    {isCompleted && (
                      <button
                        onClick={() => handleStatusChange(item._id, 'In Progress')}
                        disabled={updatingId === item._id}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Re-open
                      </button>
                    )}
                  </div>

                  {item.resources?.length > 0 && (
                    <span className="text-[11px] text-slate-400">
                      Resources: {item.resources.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {items.length === 0 && !loading && (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-4">
            <Compass className="w-12 h-12 text-indigo-500 mx-auto" />
            <h2 className="text-lg font-bold text-slate-900">No Career Roadmap Yet</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Generate a personalized step-by-step career path tailored to your goal and skills using Gemini AI.
            </p>
            <button
              onClick={handleGenerate}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-200"
            >
              Generate Personalized Roadmap
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

