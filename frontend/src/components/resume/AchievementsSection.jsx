import React from 'react';
import { Plus, Trash2, Trophy } from 'lucide-react';

export const AchievementsSection = ({ achievements = [], onChange }) => {
  const addAchievement = () => {
    onChange([
      ...achievements,
      {
        title: '',
        issuer: '',
        date: '',
        description: '',
      },
    ]);
  };

  const removeAchievement = (index) => {
    onChange(achievements.filter((_, i) => i !== index));
  };

  const updateAchievement = (index, field, value) => {
    const updated = [...achievements];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Achievements & Honors</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Highlight hackathon wins, competitive programming ranks, academic awards, and industry recognition.
          </p>
        </div>

        <button
          type="button"
          onClick={addAchievement}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Achievement</span>
        </button>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
          <p className="text-sm font-semibold text-slate-600">No achievements added yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Include competitions, code contests, scholarships, or peer-awarded recognition.
          </p>
          <button
            type="button"
            onClick={addAchievement}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Achievement</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {achievements.map((ach, aIdx) => (
            <div
              key={aIdx}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" />
                  <span>Achievement #{aIdx + 1}</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeAchievement(aIdx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove achievement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Achievement / Award Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={ach.title || ''}
                    onChange={(e) => updateAchievement(aIdx, 'title', e.target.value)}
                    placeholder="e.g. 1st Place - National Smart India Hackathon"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date Received
                  </label>
                  <input
                    type="text"
                    value={ach.date || ''}
                    onChange={(e) => updateAchievement(aIdx, 'date', e.target.value)}
                    placeholder="e.g. Dec 2024"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                  />
                </div>

                {/* Issuer */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Issuing Organization / Event
                  </label>
                  <input
                    type="text"
                    value={ach.issuer || ''}
                    onChange={(e) => updateAchievement(aIdx, 'issuer', e.target.value)}
                    placeholder="e.g. Ministry of Education & AICTE, Govt. of India"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Brief Impact Description
                  </label>
                  <textarea
                    rows={2}
                    value={ach.description || ''}
                    onChange={(e) => updateAchievement(aIdx, 'description', e.target.value)}
                    placeholder="e.g. Built offline audio streaming gateway evaluated top out of 4,000+ national team submissions."
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-normal text-slate-900 resize-y"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
