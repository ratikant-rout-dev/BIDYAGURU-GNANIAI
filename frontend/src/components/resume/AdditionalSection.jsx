import React from 'react';
import { Plus, Trash2, Globe, Heart, BookOpen, Layers } from 'lucide-react';

export const AdditionalSection = ({ additional = {}, onChange }) => {
  const update = (field, value) => {
    onChange({ ...additional, [field]: value });
  };

  // Languages
  const languages = additional.languages || [];
  const addLanguage = () => {
    update('languages', [...languages, { language: '', proficiency: 'Proficient' }]);
  };
  const updateLanguage = (index, key, val) => {
    const updated = [...languages];
    updated[index] = { ...updated[index], [key]: val };
    update('languages', updated);
  };
  const removeLanguage = (index) => {
    update('languages', languages.filter((_, i) => i !== index));
  };

  // Interests
  const updateInterestsString = (text) => {
    const list = text
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    update('interests', list);
  };

  // Volunteer
  const volunteer = additional.volunteerExperience || [];
  const addVolunteer = () => {
    update('volunteerExperience', [
      ...volunteer,
      { organization: '', role: '', startDate: '', endDate: '', description: '' },
    ]);
  };
  const updateVolunteer = (index, field, val) => {
    const updated = [...volunteer];
    updated[index] = { ...updated[index], [field]: val };
    update('volunteerExperience', updated);
  };
  const removeVolunteer = (index) => {
    update('volunteerExperience', volunteer.filter((_, i) => i !== index));
  };

  // Publications
  const publications = additional.publications || [];
  const addPublication = () => {
    update('publications', [
      ...publications,
      { title: '', publisher: '', date: '', url: '', description: '' },
    ]);
  };
  const updatePublication = (index, field, val) => {
    const updated = [...publications];
    updated[index] = { ...updated[index], [field]: val };
    update('publications', updated);
  };
  const removePublication = (index) => {
    update('publications', publications.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Additional Information</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Include optional details like languages spoken, interests, volunteer work, and publications.
        </p>
      </div>

      {/* Languages */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>Languages Spoken</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Useful for multilingual communication roles and global teams.
            </p>
          </div>
          <button
            type="button"
            onClick={addLanguage}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Language</span>
          </button>
        </div>

        {languages.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No languages added yet.</p>
        ) : (
          <div className="space-y-2">
            {languages.map((lang, lIdx) => (
              <div key={lIdx} className="flex items-center gap-3">
                <input
                  type="text"
                  value={lang.language || ''}
                  onChange={(e) => updateLanguage(lIdx, 'language', e.target.value)}
                  placeholder="e.g. English / Odia / Hindi"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600"
                />
                <select
                  value={lang.proficiency || 'Proficient'}
                  onChange={(e) => updateLanguage(lIdx, 'proficiency', e.target.value)}
                  className="w-40 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600"
                >
                  <option value="Native">Native</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Proficient">Proficient</option>
                  <option value="Conversational">Conversational</option>
                  <option value="Basic">Basic</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeLanguage(lIdx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interests */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-rose-500" />
          <span>Interests & Hobbies (Comma-separated)</span>
        </h3>
        <input
          type="text"
          value={(additional.interests || []).join(', ')}
          onChange={(e) => updateInterestsString(e.target.value)}
          placeholder="e.g. Distributed Systems, Audio Processing, Open Source, Badminton, Chess"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
        />
      </div>

      {/* Volunteer Experience */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Volunteer Experience</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Community contributions and volunteer causes.
            </p>
          </div>
          <button
            type="button"
            onClick={addVolunteer}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Volunteer</span>
          </button>
        </div>

        {volunteer.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No volunteer experience added yet.</p>
        ) : (
          <div className="space-y-4">
            {volunteer.map((vol, vIdx) => (
              <div
                key={vIdx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Volunteer Entry #{vIdx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeVolunteer(vIdx)}
                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={vol.role || ''}
                    onChange={(e) => updateVolunteer(vIdx, 'role', e.target.value)}
                    placeholder="Role (e.g. Volunteer Coding Tutor)"
                    className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-900"
                  />
                  <input
                    type="text"
                    value={vol.organization || ''}
                    onChange={(e) =>
                      updateVolunteer(vIdx, 'organization', e.target.value)
                    }
                    placeholder="Organization (e.g. Teach For All)"
                    className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-900"
                  />
                </div>
                <input
                  type="text"
                  value={vol.description || ''}
                  onChange={(e) =>
                    updateVolunteer(vIdx, 'description', e.target.value)
                  }
                  placeholder="Impact summary..."
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-900"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Publications */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-violet-600" />
              <span>Research Publications</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Conference papers, journals, or academic publications.
            </p>
          </div>
          <button
            type="button"
            onClick={addPublication}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Publication</span>
          </button>
        </div>

        {publications.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No publications added yet.</p>
        ) : (
          <div className="space-y-3">
            {publications.map((pub, pIdx) => (
              <div
                key={pIdx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={pub.title || ''}
                    onChange={(e) => updatePublication(pIdx, 'title', e.target.value)}
                    placeholder="Paper / Publication Title"
                    className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => removePublication(pIdx)}
                    className="ml-2 p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={pub.publisher || ''}
                    onChange={(e) => updatePublication(pIdx, 'publisher', e.target.value)}
                    placeholder="Conference / Journal (e.g. IEEE Xplore)"
                    className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-900"
                  />
                  <input
                    type="text"
                    value={pub.date || ''}
                    onChange={(e) => updatePublication(pIdx, 'date', e.target.value)}
                    placeholder="Date (e.g. Nov 2024)"
                    className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-900"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
