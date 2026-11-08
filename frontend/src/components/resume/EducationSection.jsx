import React from 'react';
import { Plus, Trash2, GraduationCap, School } from 'lucide-react';

export const EducationSection = ({ education = [], onChange }) => {
  const addEducation = () => {
    onChange([
      ...education,
      {
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        currentlyStudying: false,
        gradeType: 'CGPA',
        grade: '',
        relevantCoursework: [],
        description: '',
      },
    ]);
  };

  const removeEducation = (index) => {
    onChange(education.filter((_, i) => i !== index));
  };

  const updateEducation = (index, field, value) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const updateCourseworkString = (index, text) => {
    const tags = text
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    updateEducation(index, 'relevantCoursework', tags);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Education</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            List college degrees, universities, diplomas, or high school qualifications.
          </p>
        </div>

        <button
          type="button"
          onClick={addEducation}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Education</span>
        </button>
      </div>

      {education.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
          <p className="text-sm font-semibold text-slate-600">No education entries added yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Click &quot;Add Education&quot; to include your university degree or college credentials.
          </p>
          <button
            type="button"
            onClick={addEducation}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Education</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {education.map((edu, eduIdx) => (
            <div
              key={eduIdx}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Education #{eduIdx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeEducation(eduIdx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove this education"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Degree */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Degree <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={edu.degree || ''}
                      onChange={(e) => updateEducation(eduIdx, 'degree', e.target.value)}
                      placeholder="e.g. Bachelor of Technology (B.Tech)"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                    />
                  </div>
                </div>

                {/* Field of Study */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Field of Study / Major
                  </label>
                  <input
                    type="text"
                    value={edu.fieldOfStudy || ''}
                    onChange={(e) => updateEducation(eduIdx, 'fieldOfStudy', e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                  />
                </div>

                {/* Institution Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Institution / University Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={edu.institution || ''}
                      onChange={(e) => updateEducation(eduIdx, 'institution', e.target.value)}
                      placeholder="e.g. National Institute of Technology, Rourkela"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Start Date / Year
                  </label>
                  <input
                    type="text"
                    value={edu.startDate || ''}
                    onChange={(e) => updateEducation(eduIdx, 'startDate', e.target.value)}
                    placeholder="e.g. 2020 or Aug 2020"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      End Date / Year
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-indigo-700 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={edu.currentlyStudying || false}
                        onChange={(e) =>
                          updateEducation(eduIdx, 'currentlyStudying', e.target.checked)
                        }
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Currently Studying</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    disabled={edu.currentlyStudying}
                    value={edu.currentlyStudying ? 'Expected' : edu.endDate || ''}
                    onChange={(e) => updateEducation(eduIdx, 'endDate', e.target.value)}
                    placeholder="e.g. 2024"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>

                {/* Grade Type & Grade */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Grade Scale
                  </label>
                  <select
                    value={edu.gradeType || 'CGPA'}
                    onChange={(e) => updateEducation(eduIdx, 'gradeType', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900 bg-white"
                  >
                    <option value="CGPA">CGPA (e.g. 8.8 / 10)</option>
                    <option value="GPA">GPA (e.g. 3.8 / 4.0)</option>
                    <option value="Percentage">Percentage (e.g. 85%)</option>
                    <option value="Score">Score</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Grade / Score Value
                  </label>
                  <input
                    type="text"
                    value={edu.grade || ''}
                    onChange={(e) => updateEducation(eduIdx, 'grade', e.target.value)}
                    placeholder="e.g. 8.8 / 10 or 86%"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Relevant Coursework */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Relevant Coursework (Comma-separated)
                </label>
                <input
                  type="text"
                  value={(edu.relevantCoursework || []).join(', ')}
                  onChange={(e) => updateCourseworkString(eduIdx, e.target.value)}
                  placeholder="e.g. Data Structures, Algorithms, DBMS, Operating Systems, Computer Networks"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Academic Achievements or Honors (Optional)
                </label>
                <textarea
                  rows={2}
                  value={edu.description || ''}
                  onChange={(e) => updateEducation(eduIdx, 'description', e.target.value)}
                  placeholder="e.g. Department Rank 2; Dean's Academic Merit List recipient for 4 consecutive semesters."
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-normal text-slate-900 resize-y"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
