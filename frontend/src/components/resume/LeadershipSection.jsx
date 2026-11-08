import React from 'react';
import { Plus, Trash2, Users } from 'lucide-react';

export const LeadershipSection = ({ leadership = [], onChange }) => {
  const addLeadership = () => {
    onChange([
      ...leadership,
      {
        organization: '',
        position: '',
        startDate: '',
        endDate: '',
        responsibilities: [''],
        achievements: [],
      },
    ]);
  };

  const removeLeadership = (index) => {
    onChange(leadership.filter((_, i) => i !== index));
  };

  const updateLeadership = (index, field, value) => {
    const updated = [...leadership];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addRespBullet = (lIdx) => {
    const updated = [...leadership];
    const current = updated[lIdx].responsibilities || [];
    updated[lIdx] = {
      ...updated[lIdx],
      responsibilities: [...current, ''],
    };
    onChange(updated);
  };

  const updateRespBullet = (lIdx, bIdx, text) => {
    const updated = [...leadership];
    const current = [...(updated[lIdx].responsibilities || [])];
    current[bIdx] = text;
    updated[lIdx] = { ...updated[lIdx], responsibilities: current };
    onChange(updated);
  };

  const removeRespBullet = (lIdx, bIdx) => {
    const updated = [...leadership];
    const current = (updated[lIdx].responsibilities || []).filter(
      (_, i) => i !== bIdx
    );
    updated[lIdx] = { ...updated[lIdx], responsibilities: current };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Leadership & Activities</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Showcase student clubs, campus chapters (GDG, ACM, IEEE), event management, and team leadership.
          </p>
        </div>

        <button
          type="button"
          onClick={addLeadership}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Role</span>
        </button>
      </div>

      {leadership.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
          <p className="text-sm font-semibold text-slate-600">No leadership entries added yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Adding positions of responsibility demonstrates initiative, communication skills, and team collaboration.
          </p>
          <button
            type="button"
            onClick={addLeadership}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Leadership Role</span>
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {leadership.map((lead, lIdx) => (
            <div
              key={lIdx}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>Leadership Role #{lIdx + 1}</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeLeadership(lIdx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove this role"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Position */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Position / Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lead.position || ''}
                    onChange={(e) => updateLeadership(lIdx, 'position', e.target.value)}
                    placeholder="e.g. Lead Organizer / Vice President"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                  />
                </div>

                {/* Organization */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Club / Organization Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lead.organization || ''}
                    onChange={(e) => updateLeadership(lIdx, 'organization', e.target.value)}
                    placeholder="e.g. Google Developer Student Clubs / Coding Club"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                  />
                </div>

                {/* Dates */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={lead.startDate || ''}
                    onChange={(e) => updateLeadership(lIdx, 'startDate', e.target.value)}
                    placeholder="e.g. Aug 2023"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    End Date
                  </label>
                  <input
                    type="text"
                    value={lead.endDate || ''}
                    onChange={(e) => updateLeadership(lIdx, 'endDate', e.target.value)}
                    placeholder="e.g. May 2024 or Present"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Responsibilities */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Responsibilities & Impact
                  </label>
                  <button
                    type="button"
                    onClick={() => addRespBullet(lIdx)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Bullet</span>
                  </button>
                </div>

                {(lead.responsibilities || []).map((resp, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">•</span>
                    <input
                      type="text"
                      value={resp}
                      onChange={(e) =>
                        updateRespBullet(lIdx, bIdx, e.target.value)
                      }
                      placeholder="e.g. Mentored 150+ students in web development bootcamps."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={() => removeRespBullet(lIdx, bIdx)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
