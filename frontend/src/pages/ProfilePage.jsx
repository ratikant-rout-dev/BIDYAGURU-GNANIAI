import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { ROUTES } from '../routes/routeConfig';
import {
  User as UserIcon,
  Globe,
  Briefcase,
  Target,
  CheckCircle2,
  ArrowRight,
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

const LinkedInIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.45 1.45 0 0 0 1.45-1.45 1.45 1.45 0 0 0-2.9 0 1.45 1.45 0 0 0 1.45 1.45m1.39 9.74v-8.37H5.07v8.37h2.78z" />
  </svg>
);

const GitHubIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export const ProfilePage = () => {
  const { user } = useAuth();

  // Unified Profile Data States
  const [personal, setPersonal] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    links: {
      linkedIn: '',
      gitHub: '',
      portfolio: '',
      website: '',
    },
  });

  const [career, setCareer] = useState({
    targetField: '',
    targetFields: [],
    careerGoal: '',
    targetRoles: [],
    targetCompanies: [],
    shortTermGoals: [],
    longTermGoals: [],
    experienceLevel: 'Entry Level / Student',
    skills: [],
    careerPreferences: {
      preferredEmploymentTypes: [],
      preferredLocations: [],
      workMode: '',
    },
  });

  const [resumeSummary, setResumeSummary] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);

  // Loading & Action States
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Section Edit Modes
  const [editSection, setEditSection] = useState(null); // 'personal' | 'links' | 'career' | 'preferences' | null
  const [editPersonalForm, setEditPersonalForm] = useState({});
  const [editLinksForm, setEditLinksForm] = useState({});
  const [editCareerForm, setEditCareerForm] = useState({});
  const [editPrefsForm, setEditPrefsForm] = useState({});
  const [savingSection, setSavingSection] = useState(false);

  // Skill Add Form State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillStatus, setNewSkillStatus] = useState('have'); // 'have' | 'developing' | 'toLearn'
  const [newSkillProficiency, setNewSkillProficiency] = useState('');
  const [addingSkill, setAddingSkill] = useState(false);
  const [skillError, setSkillError] = useState('');

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  // Fetch Unified Profile Data
  const loadProfile = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await api.profile.getComplete();
      if (data.success) {
        if (data.personalProfile) {
          setPersonal({
            fullName: data.personalProfile.fullName || user?.name || '',
            email: data.personalProfile.email || user?.email || '',
            phone: data.personalProfile.phone || '',
            location: data.personalProfile.location || '',
            city: data.personalProfile.city || '',
            state: data.personalProfile.state || '',
            country: data.personalProfile.country || '',
            postalCode: data.personalProfile.postalCode || '',
            links: {
              linkedIn: data.personalProfile.links?.linkedIn || '',
              gitHub: data.personalProfile.links?.gitHub || '',
              portfolio: data.personalProfile.links?.portfolio || '',
              website: data.personalProfile.links?.website || '',
            },
          });
        }
        if (data.careerProfile) {
          setCareer({
            targetField: data.careerProfile.targetField || '',
            targetFields: data.careerProfile.targetFields || [],
            careerGoal: data.careerProfile.careerGoal || '',
            targetRoles: data.careerProfile.targetRoles || [],
            targetCompanies: data.careerProfile.targetCompanies || [],
            shortTermGoals: data.careerProfile.shortTermGoals || [],
            longTermGoals: data.careerProfile.longTermGoals || [],
            experienceLevel: data.careerProfile.experienceLevel || 'Entry Level / Student',
            skills: data.careerProfile.skills || [],
            careerPreferences: data.careerProfile.careerPreferences || {
              preferredEmploymentTypes: [],
              preferredLocations: [],
              workMode: '',
            },
          });
        }
        setResumeSummary(data.resumeSummary || null);
        setSyncStatus(data.syncStatus || null);
      }
    } catch (err) {
      console.error('Failed to load complete profile:', err);
      setErrorMessage('Unable to load profile data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // SECTION 1: Personal Info Save
  const handleSavePersonal = async () => {
    setSavingSection(true);
    setErrorMessage('');
    try {
      const res = await api.profile.update({
        fullName: editPersonalForm.fullName,
        email: editPersonalForm.email,
        phone: editPersonalForm.phone,
        location: editPersonalForm.location,
        city: editPersonalForm.city,
        state: editPersonalForm.state,
        country: editPersonalForm.country,
        postalCode: editPersonalForm.postalCode,
      });

      if (res.success) {
        setPersonal((prev) => ({
          ...prev,
          ...res.profile,
          links: prev.links,
        }));
        setEditSection(null);
        showToast('Personal info saved and automatically synchronized with resume!');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update personal information');
    } finally {
      setSavingSection(false);
    }
  };

  // SECTION 2: Professional Links Save
  const handleSaveLinks = async () => {
    setSavingSection(true);
    setErrorMessage('');
    try {
      const res = await api.profile.update({
        links: editLinksForm,
      });

      if (res.success) {
        setPersonal((prev) => ({
          ...prev,
          links: res.profile.links || editLinksForm,
        }));
        setEditSection(null);
        showToast('Professional links updated and synchronized with resume!');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update professional links');
    } finally {
      setSavingSection(false);
    }
  };

  // SECTION 3: Career Info Save
  const handleSaveCareer = async () => {
    setSavingSection(true);
    setErrorMessage('');
    try {
      const res = await api.careerProfile.update({
        targetField: editCareerForm.targetField,
        careerGoal: editCareerForm.careerGoal,
        targetCompanies: editCareerForm.targetCompanies,
        shortTermGoals: editCareerForm.shortTermGoals,
        longTermGoals: editCareerForm.longTermGoals,
        experienceLevel: editCareerForm.experienceLevel,
      });

      if (res.success) {
        setCareer((prev) => ({
          ...prev,
          ...res.profile,
        }));
        setEditSection(null);
        showToast('Career direction updated successfully!');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update career information');
    } finally {
      setSavingSection(false);
    }
  };

  // SECTION 5: Career Preferences Save
  const handleSavePreferences = async () => {
    setSavingSection(true);
    setErrorMessage('');
    try {
      const res = await api.careerProfile.update({
        careerPreferences: editPrefsForm,
      });

      if (res.success) {
        setCareer((prev) => ({
          ...prev,
          careerPreferences: res.profile.careerPreferences || editPrefsForm,
        }));
        setEditSection(null);
        showToast('Career preferences saved successfully!');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update career preferences');
    } finally {
      setSavingSection(false);
    }
  };

  // SECTION 4: Skills Handlers
  const handleAddSkill = async (e) => {
    e.preventDefault();
    setSkillError('');
    const trimmed = newSkillName.trim();
    if (!trimmed) {
      setSkillError('Please enter a skill name.');
      return;
    }

    // Client-side duplicate check
    const lower = trimmed.toLowerCase();
    const existing = career.skills.find((s) => (s.name || '').trim().toLowerCase() === lower);
    if (existing) {
      setSkillError(`"${trimmed}" already exists in the "${existing.status}" group.`);
      return;
    }

    setAddingSkill(true);
    try {
      const res = await api.careerProfile.addSkill({
        name: trimmed,
        status: newSkillStatus,
        proficiency: newSkillProficiency,
        source: 'user',
      });

      if (res.success && res.profile) {
        setCareer((prev) => ({
          ...prev,
          skills: res.profile.skills || [],
          knownSkills: res.profile.knownSkills || [],
          developingSkills: res.profile.developingSkills || [],
          skillsToLearn: res.profile.skillsToLearn || [],
        }));
        setNewSkillName('');
        setNewSkillProficiency('');
        showToast(`Added "${trimmed}" to ${newSkillStatus} skills!`);
      }
    } catch (err) {
      setSkillError(err.message || 'Failed to add skill.');
    } finally {
      setAddingSkill(false);
    }
  };

  const handleUpdateSkillStatus = async (skill, nextStatus) => {
    try {
      const res = await api.careerProfile.updateSkill(skill._id || skill.name, {
        status: nextStatus,
      });

      if (res.success && res.profile) {
        setCareer((prev) => ({
          ...prev,
          skills: res.profile.skills || [],
          knownSkills: res.profile.knownSkills || [],
          developingSkills: res.profile.developingSkills || [],
          skillsToLearn: res.profile.skillsToLearn || [],
        }));
        showToast(`Moved "${skill.name}" to ${nextStatus}!`);
      }
    } catch (err) {
      console.error('Failed to update skill status:', err);
    }
  };

  const handleDeleteSkill = async (skill) => {
    try {
      const res = await api.careerProfile.deleteSkill(skill._id || skill.name);
      if (res.success && res.profile) {
        setCareer((prev) => ({
          ...prev,
          skills: res.profile.skills || [],
          knownSkills: res.profile.knownSkills || [],
          developingSkills: res.profile.developingSkills || [],
          skillsToLearn: res.profile.skillsToLearn || [],
        }));
        showToast(`Removed "${skill.name}".`);
      }
    } catch (err) {
      console.error('Failed to remove skill:', err);
    }
  };

  // Partition skills for 3 distinct groups
  const haveSkills = career.skills.filter((s) => s.status === 'have');
  const developingSkills = career.skills.filter((s) => s.status === 'developing');
  const toLearnSkills = career.skills.filter((s) => s.status === 'toLearn');

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4 min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-600">Loading your unified profile...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in select-none">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-700 text-xs font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="p-1 hover:bg-rose-100 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 0. Header & Synchronization Hub */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-indigo-500/20 relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-500 text-white flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-lg shadow-indigo-500/30 border border-white/20 shrink-0">
            {personal.fullName ? personal.fullName[0].toUpperCase() : 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {personal.fullName || 'Student Profile'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider">
                Single Source of Truth
              </span>
            </div>
            <p className="text-xs sm:text-sm text-indigo-200/90 font-medium mt-1">
              {career.careerGoal || career.targetField || 'Educational & Career Learning Profile'}
            </p>
            <p className="text-[11px] text-indigo-300/70 mt-0.5">
              {personal.email} {personal.city ? `• ${personal.city}, ${personal.country || 'India'}` : ''}
            </p>
          </div>
        </div>

        {/* Sync Summary & Quick Actions */}
        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-xs">
            <div className="flex items-center gap-2 text-indigo-300 text-[11px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Resume Synchronization: {syncStatus?.category1PersonalData || 'Active'}</span>
            </div>
            <p className="text-white font-bold text-xs mt-0.5">
              {haveSkills.length} Verified Skills • {resumeSummary?.exists ? 'Resume Saved' : 'Draft Ready'}
            </p>
          </div>

          <Link
            to={ROUTES.CREATE_RESUME}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
          >
            <FileText className="w-4 h-4" />
            <span>Open Resume Builder</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Grid: Sections 1 & 2 (Personal Info & Professional Links) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 1: Personal Information */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
                  <p className="text-xs text-slate-500 font-medium">Shared across Resume, PDF, and AI context</p>
                </div>
              </div>

              {editSection !== 'personal' ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditPersonalForm({ ...personal });
                    setEditSection('personal');
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditSection(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePersonal}
                    disabled={savingSection}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingSection ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Content or Edit Form */}
            {editSection === 'personal' ? (
              <div className="pt-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={editPersonalForm.fullName || ''}
                      onChange={(e) => setEditPersonalForm({ ...editPersonalForm, fullName: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={editPersonalForm.email || ''}
                      onChange={(e) => setEditPersonalForm({ ...editPersonalForm, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={editPersonalForm.phone || ''}
                      onChange={(e) => setEditPersonalForm({ ...editPersonalForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">City</label>
                    <input
                      type="text"
                      value={editPersonalForm.city || ''}
                      onChange={(e) => setEditPersonalForm({ ...editPersonalForm, city: e.target.value })}
                      placeholder="Bhubaneswar"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">State</label>
                    <input
                      type="text"
                      value={editPersonalForm.state || ''}
                      onChange={(e) => setEditPersonalForm({ ...editPersonalForm, state: e.target.value })}
                      placeholder="Odisha"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Country</label>
                    <input
                      type="text"
                      value={editPersonalForm.country || ''}
                      onChange={(e) => setEditPersonalForm({ ...editPersonalForm, country: e.target.value })}
                      placeholder="India"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={editPersonalForm.postalCode || ''}
                      onChange={(e) => setEditPersonalForm({ ...editPersonalForm, postalCode: e.target.value })}
                      placeholder="751001"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Full Name</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{personal.fullName || '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Email</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{personal.email || '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{personal.phone || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Location</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">
                    {[personal.city, personal.state, personal.country].filter(Boolean).join(', ') || 'Not specified'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Synchronized across ATS Resume Profile</span>
            <span className="text-emerald-600 font-bold">Auto-synced</span>
          </div>
        </div>

        {/* SECTION 2: Professional Links */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Professional Links</h2>
                  <p className="text-xs text-slate-500 font-medium">Portfolio, GitHub, and professional presence</p>
                </div>
              </div>

              {editSection !== 'links' ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditLinksForm({ ...personal.links });
                    setEditSection('links');
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditSection(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveLinks}
                    disabled={savingSection}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingSection ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Content or Edit Form */}
            {editSection === 'links' ? (
              <div className="pt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={editLinksForm.linkedIn || ''}
                    onChange={(e) => setEditLinksForm({ ...editLinksForm, linkedIn: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={editLinksForm.gitHub || ''}
                    onChange={(e) => setEditLinksForm({ ...editLinksForm, gitHub: e.target.value })}
                    placeholder="https://github.com/username"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Portfolio URL</label>
                  <input
                    type="url"
                    value={editLinksForm.portfolio || ''}
                    onChange={(e) => setEditLinksForm({ ...editLinksForm, portfolio: e.target.value })}
                    placeholder="https://myportfolio.dev"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Personal Website</label>
                  <input
                    type="url"
                    value={editLinksForm.website || ''}
                    onChange={(e) => setEditLinksForm({ ...editLinksForm, website: e.target.value })}
                    placeholder="https://mywebsite.com"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="pt-4 space-y-2.5">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <LinkedInIcon className="w-4 h-4 text-sky-600" />
                    <span>LinkedIn</span>
                  </div>
                  {personal.links.linkedIn ? (
                    <a
                      href={personal.links.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span className="truncate max-w-[200px]">{personal.links.linkedIn.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Not provided</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <GitHubIcon className="w-4 h-4 text-slate-800" />
                    <span>GitHub</span>
                  </div>
                  {personal.links.gitHub ? (
                    <a
                      href={personal.links.gitHub}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span className="truncate max-w-[200px]">{personal.links.gitHub.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Not provided</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>Portfolio</span>
                  </div>
                  {personal.links.portfolio ? (
                    <a
                      href={personal.links.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span className="truncate max-w-[200px]">{personal.links.portfolio.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Not provided</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Parsed automatically on resume generation</span>
            <span className="text-emerald-600 font-bold">Auto-synced</span>
          </div>
        </div>
      </div>

      {/* SECTION 4: Verified Skills Matrix (Three Distinct Groups) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Verified Skills Matrix
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {career.skills.length} Total Skills
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Three distinct status categories. Only confirmed "Have" skills are eligible for your ATS Resume.
            </p>
          </div>
        </div>

        {/* Quick Add Skill Form */}
        <form onSubmit={handleAddSkill} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => {
                  setNewSkillName(e.target.value);
                  if (skillError) setSkillError('');
                }}
                placeholder="Enter skill name (e.g. Docker, Spring Boot, React, Python)..."
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={newSkillStatus}
                onChange={(e) => setNewSkillStatus(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value="have">🟢 Have (Confirmed)</option>
                <option value="developing">🟡 Developing (Learning)</option>
                <option value="toLearn">🔵 To Learn (Goal)</option>
              </select>

              <select
                value={newSkillProficiency}
                onChange={(e) => setNewSkillProficiency(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value="">Proficiency (Optional)</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>

              <button
                type="submit"
                disabled={addingSkill}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{addingSkill ? 'Adding...' : 'Add Skill'}</span>
              </button>
            </div>
          </div>

          {skillError && <p className="text-xs text-rose-600 font-bold">{skillError}</p>}
        </form>

        {/* 3 Visually Distinguishable Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Group 1: HAVE (Confirmed & Resume-Eligible) */}
          <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                    Have (Confirmed)
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                  {haveSkills.length}
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium py-2">
                Eligible for inclusion in your ATS Resume.
              </p>

              <div className="space-y-2 mt-1">
                {haveSkills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">No confirmed skills yet</p>
                ) : (
                  haveSkills.map((skill) => (
                    <div
                      key={skill._id || skill.name}
                      className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-emerald-100 shadow-xs group"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800">{skill.name}</p>
                        {skill.proficiency && (
                          <span className="text-[10px] text-emerald-600 font-semibold">{skill.proficiency}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateSkillStatus(skill, 'developing')}
                          title="Move to Developing"
                          className="px-1.5 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md cursor-pointer"
                        >
                          → Dev
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSkill(skill)}
                          title="Remove skill"
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Group 2: DEVELOPING (In Progress) */}
          <div className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                    Developing (Learning)
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                  {developingSkills.length}
                </span>
              </div>
              <p className="text-[11px] text-amber-700 font-medium py-2">
                Currently learning. Excluded from verified resume.
              </p>

              <div className="space-y-2 mt-1">
                {developingSkills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">No skills in progress</p>
                ) : (
                  developingSkills.map((skill) => (
                    <div
                      key={skill._id || skill.name}
                      className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-amber-100 shadow-xs group"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800">{skill.name}</p>
                        {skill.proficiency && (
                          <span className="text-[10px] text-amber-600 font-semibold">{skill.proficiency}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateSkillStatus(skill, 'have')}
                          title="Promote to Confirmed Have"
                          className="px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md cursor-pointer"
                        >
                          ✓ Mastered
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSkill(skill)}
                          title="Remove skill"
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Group 3: TO LEARN (Future Goals) */}
          <div className="bg-sky-50/40 border border-sky-200/80 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-sky-200/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-sky-900">
                    To Learn (Future Goals)
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800">
                  {toLearnSkills.length}
                </span>
              </div>
              <p className="text-[11px] text-sky-700 font-medium py-2">
                Targets for personalized learning roadmaps.
              </p>

              <div className="space-y-2 mt-1">
                {toLearnSkills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">No learning goals added</p>
                ) : (
                  toLearnSkills.map((skill) => (
                    <div
                      key={skill._id || skill.name}
                      className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-sky-100 shadow-xs group"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800">{skill.name}</p>
                        {skill.proficiency && (
                          <span className="text-[10px] text-sky-600 font-semibold">{skill.proficiency}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateSkillStatus(skill, 'developing')}
                          title="Start Learning (Move to Developing)"
                          className="px-1.5 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md cursor-pointer"
                        >
                          → Start
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSkill(skill)}
                          title="Remove skill"
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Sections 3 & 5 (Career Information & Career Preferences) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 3: Career Information */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Career Direction & Goals</h2>
                  <p className="text-xs text-slate-500 font-medium">Guides AI roadmaps and recommendations</p>
                </div>
              </div>

              {editSection !== 'career' ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditCareerForm({
                      targetField: career.targetField,
                      careerGoal: career.careerGoal,
                      targetCompanies: career.targetCompanies.join(', '),
                      shortTermGoals: career.shortTermGoals.join(', '),
                      longTermGoals: career.longTermGoals.join(', '),
                      experienceLevel: career.experienceLevel,
                    });
                    setEditSection('career');
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditSection(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const processed = {
                        targetField: editCareerForm.targetField,
                        careerGoal: editCareerForm.careerGoal,
                        experienceLevel: editCareerForm.experienceLevel,
                        targetCompanies: typeof editCareerForm.targetCompanies === 'string'
                          ? editCareerForm.targetCompanies.split(',').map((s) => s.trim()).filter(Boolean)
                          : editCareerForm.targetCompanies,
                        shortTermGoals: typeof editCareerForm.shortTermGoals === 'string'
                          ? editCareerForm.shortTermGoals.split(',').map((s) => s.trim()).filter(Boolean)
                          : editCareerForm.shortTermGoals,
                        longTermGoals: typeof editCareerForm.longTermGoals === 'string'
                          ? editCareerForm.longTermGoals.split(',').map((s) => s.trim()).filter(Boolean)
                          : editCareerForm.longTermGoals,
                      };
                      setEditCareerForm(processed);
                      handleSaveCareer();
                    }}
                    disabled={savingSection}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingSection ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Content or Edit Form */}
            {editSection === 'career' ? (
              <div className="pt-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Target Field / Domain</label>
                    <input
                      type="text"
                      value={editCareerForm.targetField || ''}
                      onChange={(e) => setEditCareerForm({ ...editCareerForm, targetField: e.target.value })}
                      placeholder="e.g. Software Engineering, Data Science"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Target Role / Goal</label>
                    <input
                      type="text"
                      value={editCareerForm.careerGoal || ''}
                      onChange={(e) => setEditCareerForm({ ...editCareerForm, careerGoal: e.target.value })}
                      placeholder="e.g. Full Stack Developer"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Experience Level</label>
                    <select
                      value={editCareerForm.experienceLevel || 'Entry Level / Student'}
                      onChange={(e) => setEditCareerForm({ ...editCareerForm, experienceLevel: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer"
                    >
                      <option value="Entry Level / Student">Entry Level / Student</option>
                      <option value="1-3 Years Experience">1-3 Years Experience</option>
                      <option value="3-5 Years Experience">3-5 Years Experience</option>
                      <option value="Senior / 5+ Years">Senior / 5+ Years</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Target Companies (Comma-separated)</label>
                    <input
                      type="text"
                      value={editCareerForm.targetCompanies || ''}
                      onChange={(e) => setEditCareerForm({ ...editCareerForm, targetCompanies: e.target.value })}
                      placeholder="e.g. TCS, Infosys, Google, Startups"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Short-Term Goals (Comma-separated)</label>
                  <input
                    type="text"
                    value={editCareerForm.shortTermGoals || ''}
                    onChange={(e) => setEditCareerForm({ ...editCareerForm, shortTermGoals: e.target.value })}
                    placeholder="e.g. Master React, Build 3 portfolio projects"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="pt-4 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Target Domain</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{career.targetField || 'General Career Development'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Target Role</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{career.careerGoal || 'Undecided'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Experience Level</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{career.experienceLevel}</p>
                </div>

                {career.targetCompanies && career.targetCompanies.length > 0 && (
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Target Companies</p>
                    <div className="flex flex-wrap gap-1.5">
                      {career.targetCompanies.map((c, i) => (
                        <span key={i} className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-700">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Independent of resume bullet descriptions</span>
            <span className="text-indigo-600 font-bold">AI Context</span>
          </div>
        </div>

        {/* SECTION 5: Career Preferences */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Career Preferences</h2>
                  <p className="text-xs text-slate-500 font-medium">Employment types, location, and work mode</p>
                </div>
              </div>

              {editSection !== 'preferences' ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditPrefsForm({
                      workMode: career.careerPreferences.workMode || '',
                      preferredEmploymentTypes: (career.careerPreferences.preferredEmploymentTypes || []).join(', '),
                      preferredLocations: (career.careerPreferences.preferredLocations || []).join(', '),
                    });
                    setEditSection('preferences');
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditSection(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const processed = {
                        workMode: editPrefsForm.workMode,
                        preferredEmploymentTypes: typeof editPrefsForm.preferredEmploymentTypes === 'string'
                          ? editPrefsForm.preferredEmploymentTypes.split(',').map((s) => s.trim()).filter(Boolean)
                          : editPrefsForm.preferredEmploymentTypes,
                        preferredLocations: typeof editPrefsForm.preferredLocations === 'string'
                          ? editPrefsForm.preferredLocations.split(',').map((s) => s.trim()).filter(Boolean)
                          : editPrefsForm.preferredLocations,
                      };
                      setEditPrefsForm(processed);
                      handleSavePreferences();
                    }}
                    disabled={savingSection}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingSection ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Content or Edit Form */}
            {editSection === 'preferences' ? (
              <div className="pt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Work Mode</label>
                  <select
                    value={editPrefsForm.workMode || ''}
                    onChange={(e) => setEditPrefsForm({ ...editPrefsForm, workMode: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="">Select Work Mode</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Preferred Employment Types (Comma-separated)</label>
                  <input
                    type="text"
                    value={editPrefsForm.preferredEmploymentTypes || ''}
                    onChange={(e) => setEditPrefsForm({ ...editPrefsForm, preferredEmploymentTypes: e.target.value })}
                    placeholder="e.g. Full-time, Internship, Contract"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Preferred Locations (Comma-separated)</label>
                  <input
                    type="text"
                    value={editPrefsForm.preferredLocations || ''}
                    onChange={(e) => setEditPrefsForm({ ...editPrefsForm, preferredLocations: e.target.value })}
                    placeholder="e.g. Bangalore, Hyderabad, Bhubaneswar, Remote"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="pt-4 space-y-3.5">
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Work Mode</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{career.careerPreferences.workMode || 'Flexible / Open'}</p>
                </div>

                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Employment Types</p>
                  {career.careerPreferences.preferredEmploymentTypes?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {career.careerPreferences.preferredEmploymentTypes.map((t, i) => (
                        <span key={i} className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 font-medium">Open to all employment types</p>
                  )}
                </div>

                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Preferred Locations</p>
                  {career.careerPreferences.preferredLocations?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {career.careerPreferences.preferredLocations.map((loc, i) => (
                        <span key={i} className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-700">
                          {loc}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 font-medium">Any location / Remote</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Used for personalized Job Matching</span>
            <span className="text-emerald-600 font-bold">Preferences</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
