import React from 'react';
import { Plus, Trash2, MapPin, Building, Briefcase } from 'lucide-react';

export const ExperienceSection = ({ experience = [], onChange }) => {
  const addExperience = () => {
    onChange([
      ...experience,
      {
        company: '',
        jobTitle: '',
        employmentType: 'Full-time',
        location: '',
        startDate: '',
        endDate: '',
        currentlyWorking: false,
        responsibilities: [''],
        achievements: [''],
        technologies: [],
      },
    ]);
  };

  const removeExperience = (index) => {
    onChange(experience.filter((_, i) => i !== index));
  };

  const updateExperience = (index, field, value) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addBullet = (expIndex, field) => {
    const updated = [...experience];
    const currentList = updated[expIndex][field] || [];
    updated[expIndex] = {
      ...updated[expIndex],
      [field]: [...currentList, ''],
    };
    onChange(updated);
  };

  const updateBullet = (expIndex, field, bulletIndex, text) => {
    const updated = [...experience];
    const currentList = [...(updated[expIndex][field] || [])];
    currentList[bulletIndex] = text;
    updated[expIndex] = { ...updated[expIndex], [field]: currentList };
    onChange(updated);
  };

  const removeBullet = (expIndex, field, bulletIndex) => {
    const updated = [...experience];
    const currentList = (updated[expIndex][field] || []).filter(
      (_, i) => i !== bulletIndex
    );
    updated[expIndex] = { ...updated[expIndex], [field]: currentList };
    onChange(updated);
  };

  const updateTechString = (expIndex, text) => {
    const tags = text
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    updateExperience(expIndex, 'technologies', tags);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Work Experience</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Document full-time jobs, internships, freelance contracts, or research positions.
          </p>
        </div>

        <button
          type="button"
          onClick={addExperience}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Experience</span>
        </button>
      </div>

      {experience.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
          <p className="text-sm font-semibold text-slate-600">No work experience entries yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Fresh graduate or transitioning careers? You can include internships, research fellowships, or add relevant coursework and projects below.
          </p>
          <button
            type="button"
            onClick={addExperience}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Experience</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {experience.map((exp, expIdx) => (
            <div
              key={expIdx}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Experience #{expIdx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeExperience(expIdx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove this experience"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Job Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Job Title <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={exp.jobTitle || ''}
                      onChange={(e) => updateExperience(expIdx, 'jobTitle', e.target.value)}
                      placeholder="e.g. Software Engineer"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={exp.company || ''}
                      onChange={(e) => updateExperience(expIdx, 'company', e.target.value)}
                      placeholder="e.g. Infosys / TechFlow"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                    />
                  </div>
                </div>

                {/* Employment Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Employment Type
                  </label>
                  <select
                    value={exp.employmentType || 'Full-time'}
                    onChange={(e) => updateExperience(expIdx, 'employmentType', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900 bg-white"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={exp.location || ''}
                      onChange={(e) => updateExperience(expIdx, 'location', e.target.value)}
                      placeholder="e.g. Bengaluru, India (or Remote)"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={exp.startDate || ''}
                    onChange={(e) => updateExperience(expIdx, 'startDate', e.target.value)}
                    placeholder="e.g. Jul 2023 or 07/2023"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      End Date
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-indigo-700 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exp.currentlyWorking || false}
                        onChange={(e) =>
                          updateExperience(expIdx, 'currentlyWorking', e.target.checked)
                        }
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Currently Working</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    disabled={exp.currentlyWorking}
                    value={exp.currentlyWorking ? 'Present' : exp.endDate || ''}
                    onChange={(e) => updateExperience(expIdx, 'endDate', e.target.value)}
                    placeholder="e.g. Dec 2024"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
              </div>

              {/* Technologies */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Technologies & Tools Used (Comma-separated)
                </label>
                <input
                  type="text"
                  value={(exp.technologies || []).join(', ')}
                  onChange={(e) => updateTechString(expIdx, e.target.value)}
                  placeholder="e.g. Node.js, Express, React, PostgreSQL, Docker, AWS"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                />
              </div>

              {/* Responsibilities Bullets */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Key Responsibilities (Bullet Points)
                  </label>
                  <button
                    type="button"
                    onClick={() => addBullet(expIdx, 'responsibilities')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Bullet</span>
                  </button>
                </div>

                {(exp.responsibilities || []).map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">•</span>
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) =>
                        updateBullet(expIdx, 'responsibilities', bIdx, e.target.value)
                      }
                      placeholder="e.g. Architected streaming event-driven pipeline handling 100K+ concurrent requests..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={() => removeBullet(expIdx, 'responsibilities', bIdx)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Achievements Bullets */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Measurable Achievements & Key Results (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => addBullet(expIdx, 'achievements')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Achievement</span>
                  </button>
                </div>

                {(exp.achievements || []).map((ach, aIdx) => (
                  <div key={aIdx} className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">★</span>
                    <input
                      type="text"
                      value={ach}
                      onChange={(e) =>
                        updateBullet(expIdx, 'achievements', aIdx, e.target.value)
                      }
                      placeholder="e.g. Reduced server response latency by 35% through Redis query caching."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={() => removeBullet(expIdx, 'achievements', aIdx)}
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
