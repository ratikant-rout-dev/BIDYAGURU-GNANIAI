import React from 'react';
import { Plus, Trash2, Globe, FolderGit2 } from 'lucide-react';

export const ProjectsSection = ({ projects = [], onChange }) => {
  const addProject = () => {
    onChange([
      ...projects,
      {
        name: '',
        description: '',
        technologies: [],
        keyContributions: [''],
        projectUrl: '',
        githubUrl: '',
        startDate: '',
        endDate: '',
        achievements: [],
      },
    ]);
  };

  const removeProject = (index) => {
    onChange(projects.filter((_, i) => i !== index));
  };

  const updateProject = (index, field, value) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addContribution = (projIndex) => {
    const updated = [...projects];
    const current = updated[projIndex].keyContributions || [];
    updated[projIndex] = {
      ...updated[projIndex],
      keyContributions: [...current, ''],
    };
    onChange(updated);
  };

  const updateContribution = (projIndex, contribIndex, text) => {
    const updated = [...projects];
    const current = [...(updated[projIndex].keyContributions || [])];
    current[contribIndex] = text;
    updated[projIndex] = { ...updated[projIndex], keyContributions: current };
    onChange(updated);
  };

  const removeContribution = (projIndex, contribIndex) => {
    const updated = [...projects];
    const current = (updated[projIndex].keyContributions || []).filter(
      (_, i) => i !== contribIndex
    );
    updated[projIndex] = { ...updated[projIndex], keyContributions: current };
    onChange(updated);
  };

  const updateTechString = (projIndex, text) => {
    const tags = text
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    updateProject(projIndex, 'technologies', tags);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Projects</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Demonstrate your hands-on problem solving capabilities with personal, open-source, or capstone projects.
          </p>
        </div>

        <button
          type="button"
          onClick={addProject}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
          <p className="text-sm font-semibold text-slate-600">No projects added yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Adding 2-3 substantial full-stack or systems projects significantly enhances your ATS score and interview callbacks.
          </p>
          <button
            type="button"
            onClick={addProject}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Project</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((proj, projIdx) => (
            <div
              key={projIdx}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Project #{projIdx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeProject(projIdx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove this project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Project Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Project Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={proj.name || ''}
                    onChange={(e) => updateProject(projIdx, 'name', e.target.value)}
                    placeholder="e.g. Bidya Guru AI Career Engine"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                  />
                </div>

                {/* Tech Stack */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Technologies Used (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={(proj.technologies || []).join(', ')}
                    onChange={(e) => updateTechString(projIdx, e.target.value)}
                    placeholder="e.g. React, Node.js, Express, MongoDB, Tailwind CSS, Docker"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                  />
                </div>

                {/* Live Demo URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Live Demo / Project URL
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={proj.projectUrl || ''}
                      onChange={(e) => updateProject(projIdx, 'projectUrl', e.target.value)}
                      placeholder="https://mycoolproject.app"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                    />
                  </div>
                </div>

                {/* GitHub URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    GitHub Repository URL
                  </label>
                  <div className="relative">
                    <FolderGit2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={proj.githubUrl || ''}
                      onChange={(e) => updateProject(projIdx, 'githubUrl', e.target.value)}
                      placeholder="https://github.com/username/project"
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
                    value={proj.startDate || ''}
                    onChange={(e) => updateProject(projIdx, 'startDate', e.target.value)}
                    placeholder="e.g. Jan 2025"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    End Date
                  </label>
                  <input
                    type="text"
                    value={proj.endDate || ''}
                    onChange={(e) => updateProject(projIdx, 'endDate', e.target.value)}
                    placeholder="e.g. Mar 2025 or Ongoing"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Brief Overview
                </label>
                <textarea
                  rows={2}
                  value={proj.description || ''}
                  onChange={(e) => updateProject(projIdx, 'description', e.target.value)}
                  placeholder="e.g. A desktop web platform enabling college students to receive personalized multilingual voice mentorship powered by Gemini and Gnani speech synthesis."
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-normal text-slate-900 resize-y"
                />
              </div>

              {/* Key Contributions Bullets */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Key Contributions & Features (Bullet Points)
                  </label>
                  <button
                    type="button"
                    onClick={() => addContribution(projIdx)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Bullet</span>
                  </button>
                </div>

                {(proj.keyContributions || []).map((contrib, cIdx) => (
                  <div key={cIdx} className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">•</span>
                    <input
                      type="text"
                      value={contrib}
                      onChange={(e) =>
                        updateContribution(projIdx, cIdx, e.target.value)
                      }
                      placeholder="e.g. Engineered real-time audio pipeline reducing streaming synthesis latency to <1.2s."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={() => removeContribution(projIdx, cIdx)}
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
