import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import {
  Target,
  Sparkles,
  Plus,
  X,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Save,
  Compass,
} from 'lucide-react';

export const CareerProfileScreen = ({ onNavigate }) => {
  const { user, language } = useAuth();
  const [profile, setProfile] = useState(null);
  const [targetField, setTargetField] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [knownSkills, setKnownSkills] = useState([]);
  const [developingSkills, setDevelopingSkills] = useState([]);
  const [skillsToLearn, setSkillsToLearn] = useState([]);

  const [newSkillText, setNewSkillText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('known');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api.career.getProfile();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setTargetField(data.profile.targetField || '');
        setCareerGoal(data.profile.careerGoal || '');
        setKnownSkills(data.profile.knownSkills || []);
        setDevelopingSkills(data.profile.developingSkills || []);
        setSkillsToLearn(data.profile.skillsToLearn || []);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const data = await api.career.updateProfile({
        targetField,
        careerGoal,
        knownSkills,
        developingSkills,
        skillsToLearn,
      });
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (e) => {
    e.preventDefault();
    const skill = newSkillText.trim();
    if (!skill) return;

    if (selectedCategory === 'known' && !knownSkills.includes(skill)) {
      setKnownSkills([...knownSkills, skill]);
    } else if (selectedCategory === 'developing' && !developingSkills.includes(skill)) {
      setDevelopingSkills([...developingSkills, skill]);
    } else if (selectedCategory === 'toLearn' && !skillsToLearn.includes(skill)) {
      setSkillsToLearn([...skillsToLearn, skill]);
    }
    setNewSkillText('');
  };

  const removeSkill = (category, skillToRemove) => {
    if (category === 'known') {
      setKnownSkills(knownSkills.filter((s) => s !== skillToRemove));
    } else if (category === 'developing') {
      setDevelopingSkills(developingSkills.filter((s) => s !== skillToRemove));
    } else if (category === 'toLearn') {
      setSkillsToLearn(skillsToLearn.filter((s) => s !== skillToRemove));
    }
  };

  const handleGenerateRoadmapFromProfile = async () => {
    await handleSaveProfile();
    try {
      await api.roadmap.generate({
        targetField,
        careerGoal,
        knownSkills,
        developingSkills,
        skillsToLearn,
      });
      onNavigate('roadmap');
    } catch (err) {
      console.error('Failed to generate roadmap:', err);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Student Career Profile
          </h1>
          <p className="text-sm text-slate-500">
            Define your dream career and manage your verified skills matrix
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>

          <button
            onClick={handleGenerateRoadmapFromProfile}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-200 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Generate Roadmap with AI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile saved successfully to MongoDB Atlas!</span>
        </div>
      )}

      {/* Target Goal & Field Card */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Target Career Field
          </label>
          <input
            type="text"
            value={targetField}
            onChange={(e) => setTargetField(e.target.value)}
            placeholder="e.g. Software Engineering, Data Science, Cloud"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Target Career Goal / Role
          </label>
          <input
            type="text"
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
            placeholder="e.g. Full Stack Developer, AI Engineer"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-sm font-medium"
          />
        </div>
      </div>

      {/* Skill Understanding 3-Column Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Known Skills */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h2 className="font-bold text-sm text-slate-900">Known Skills</h2>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {knownSkills.length}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Skills you already feel confident using in code and projects.
          </p>

          <div className="flex flex-wrap gap-2 pt-2 min-h-24">
            {knownSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium"
              >
                <span>{skill}</span>
                <button
                  onClick={() => removeSkill('known', skill)}
                  className="hover:text-emerald-950"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {knownSkills.length === 0 && (
              <span className="text-xs text-slate-400 italic">No skills added yet</span>
            )}
          </div>
        </div>

        {/* Developing Skills */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h2 className="font-bold text-sm text-slate-900">Developing Skills</h2>
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              {developingSkills.length}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Technologies you are currently learning or have beginner experience with.
          </p>

          <div className="flex flex-wrap gap-2 pt-2 min-h-24">
            {developingSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium"
              >
                <span>{skill}</span>
                <button
                  onClick={() => removeSkill('developing', skill)}
                  className="hover:text-amber-950"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {developingSkills.length === 0 && (
              <span className="text-xs text-slate-400 italic">No skills added yet</span>
            )}
          </div>
        </div>

        {/* Skills to Learn */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <h2 className="font-bold text-sm text-slate-900">Skills to Learn</h2>
            </div>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
              {skillsToLearn.length}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Critical industry skills needed to achieve your target career goal.
          </p>

          <div className="flex flex-wrap gap-2 pt-2 min-h-24">
            {skillsToLearn.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-medium"
              >
                <span>{skill}</span>
                <button
                  onClick={() => removeSkill('toLearn', skill)}
                  className="hover:text-indigo-950"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {skillsToLearn.length === 0 && (
              <span className="text-xs text-slate-400 italic">No skills added yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Add New Skill Quick Bar */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Add Skill to Profile</h2>
        <form onSubmit={addSkill} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setSelectedCategory('known')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === 'known'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              Known
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('developing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === 'developing'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              Developing
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('toLearn')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === 'toLearn'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              To Learn
            </button>
          </div>

          <input
            type="text"
            value={newSkillText}
            onChange={(e) => setNewSkillText(e.target.value)}
            placeholder="e.g. Docker, TypeScript, Next.js, Redux..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-sm"
          />

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Skill</span>
          </button>
        </form>
      </div>
    </div>
  );
};

