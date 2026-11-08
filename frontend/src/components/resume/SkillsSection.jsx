import React, { useState } from 'react';
import { Plus, Trash2, X, Sparkles } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  'Programming Languages',
  'Frameworks & Libraries',
  'Databases & Caching',
  'Developer Tools',
  'Cloud & DevOps',
  'Core Computer Science',
];

export const SkillsSection = ({ skills = [], onChange }) => {
  const [skillInputs, setSkillInputs] = useState({});

  const addCategory = (name = '') => {
    onChange([
      ...skills,
      { category: name || 'New Skill Category', skills: [] },
    ]);
  };

  const removeCategory = (index) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  const updateCategoryName = (index, newName) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], category: newName };
    onChange(updated);
  };

  const addSkillToCategory = (catIndex) => {
    const text = (skillInputs[catIndex] || '').trim();
    if (!text) return;

    // Handle comma-separated skills addition
    const newItems = text
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const updated = [...skills];
    const existing = updated[catIndex].skills || [];
    const unique = Array.from(new Set([...existing, ...newItems]));
    updated[catIndex] = { ...updated[catIndex], skills: unique };

    onChange(updated);
    setSkillInputs({ ...skillInputs, [catIndex]: '' });
  };

  const removeSkillFromCategory = (catIndex, skillIndex) => {
    const updated = [...skills];
    updated[catIndex] = {
      ...updated[catIndex],
      skills: updated[catIndex].skills.filter((_, i) => i !== skillIndex),
    };
    onChange(updated);
  };

  const loadDefaultCategories = () => {
    const newCats = DEFAULT_CATEGORIES.map((cat) => ({
      category: cat,
      skills: [],
    }));
    onChange(newCats);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Technical Skills</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Group your skills into standard categories. ATS parsers match keywords directly against job requirements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {skills.length === 0 && (
            <button
              type="button"
              onClick={loadDefaultCategories}
              className="px-3 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Default Categories</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => addCategory()}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
          <p className="text-sm font-semibold text-slate-600">No skill categories added yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Click &quot;Load Default Categories&quot; to quickly add standard categories like Programming Languages, Frameworks, and Cloud tools.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {skills.map((group, catIndex) => (
            <div
              key={catIndex}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  value={group.category || ''}
                  onChange={(e) => updateCategoryName(catIndex, e.target.value)}
                  placeholder="Category Name (e.g. Programming Languages)"
                  className="font-bold text-sm text-slate-900 px-3 py-1.5 rounded-lg border border-transparent hover:border-slate-200 focus:border-indigo-600 focus:bg-white focus:outline-none flex-1 max-w-md transition-all"
                />

                <button
                  type="button"
                  onClick={() => removeCategory(catIndex)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap items-center gap-2">
                {group.skills?.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200/80"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkillFromCategory(catIndex, sIdx)}
                      className="hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Skill Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={skillInputs[catIndex] || ''}
                  onChange={(e) =>
                    setSkillInputs({ ...skillInputs, [catIndex]: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkillToCategory(catIndex);
                    }
                  }}
                  placeholder="Add skill or comma-separated skills (e.g. React, TypeScript, Redux)"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => addSkillToCategory(catIndex)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
