import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import {
  FileText,
  Save,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  User,
  BookOpen,
  Briefcase,
  Code2,
  FolderGit2,
  GraduationCap,
  Award,
  Trophy,
  Users,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  Columns,
  RefreshCw,
  Trash2,
} from 'lucide-react';

import { PersonalSection } from '../components/resume/PersonalSection';
import { SummarySection } from '../components/resume/SummarySection';
import { LinksSection } from '../components/resume/LinksSection';
import { SkillsSection } from '../components/resume/SkillsSection';
import { ExperienceSection } from '../components/resume/ExperienceSection';
import { ProjectsSection } from '../components/resume/ProjectsSection';
import { EducationSection } from '../components/resume/EducationSection';
import { CertificationsSection } from '../components/resume/CertificationsSection';
import { AchievementsSection } from '../components/resume/AchievementsSection';
import { LeadershipSection } from '../components/resume/LeadershipSection';
import { AdditionalSection } from '../components/resume/AdditionalSection';
import { ResumePreview } from '../components/resume/ResumePreview';

const SECTIONS = [
  { id: 'personal', label: 'Personal Info', icon: User, required: true },
  { id: 'summary', label: 'Summary', icon: BookOpen, required: false },
  { id: 'links', label: 'Social & Links', icon: FileText, required: false },
  { id: 'skills', label: 'Technical Skills', icon: Code2, required: false },
  { id: 'experience', label: 'Work Experience', icon: Briefcase, required: false },
  { id: 'projects', label: 'Projects', icon: FolderGit2, required: false },
  { id: 'education', label: 'Education', icon: GraduationCap, required: false },
  { id: 'certifications', label: 'Certifications', icon: Award, required: false },
  { id: 'achievements', label: 'Achievements', icon: Trophy, required: false },
  { id: 'leadership', label: 'Leadership', icon: Users, required: false },
  { id: 'additional', label: 'Additional', icon: MoreHorizontal, required: false },
];

export const CreateResumeScreen = ({ onNavigate }) => {
  const { user } = useAuth();

  const [activeSection, setActiveSection] = useState('personal');
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'form' | 'preview'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasSavedProfile, setHasSavedProfile] = useState(false);

  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      professionalTitle: '',
      email: '',
      phone: '',
      location: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      summary: '',
      careerObjective: '',
    },
    links: {
      linkedIn: '',
      gitHub: '',
      portfolio: '',
      website: '',
      other: [],
    },
    education: [],
    experience: [],
    skills: [],
    projects: [],
    certifications: [],
    achievements: [],
    leadership: [],
    additional: {
      languages: [],
      volunteerExperience: [],
      publications: [],
      professionalMemberships: [],
      interests: [],
    },
  });

  // Load existing profile or prefill user defaults
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const res = await api.resume.get();
        if (res.success && res.profile) {
          setFormData({
            personalInfo: {
              ...formData.personalInfo,
              ...(res.profile.personalInfo || {}),
            },
            links: {
              ...formData.links,
              ...(res.profile.links || {}),
            },
            education: res.profile.education || [],
            experience: res.profile.experience || [],
            skills: res.profile.skills || [],
            projects: res.profile.projects || [],
            certifications: res.profile.certifications || [],
            achievements: res.profile.achievements || [],
            leadership: res.profile.leadership || [],
            additional: {
              ...formData.additional,
              ...(res.profile.additional || {}),
            },
          });
          setHasSavedProfile(true);
        } else {
          // Pre-fill user data if new
          setFormData((prev) => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              fullName: user?.name || '',
              email: user?.email || '',
            },
          }));

          // Try to import known skills from career profile if available
          try {
            const careerRes = await api.career.getProfile();
            if (careerRes.success && careerRes.profile?.knownSkills?.length > 0) {
              setFormData((prev) => ({
                ...prev,
                personalInfo: {
                  ...prev.personalInfo,
                  professionalTitle: careerRes.profile.careerGoal || '',
                },
                skills: [
                  {
                    category: 'Core Technical Skills',
                    skills: careerRes.profile.knownSkills,
                  },
                ],
              }));
            }
          } catch (e) {
            // Ignore career profile prefetch error
          }
        }
      } catch (err) {
        console.error('Failed to load resume profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user]);

  // Compute Completion Score
  const calculateCompletion = () => {
    let score = 0;
    const { personalInfo, experience, education, skills, projects } = formData;

    // Personal info
    if (personalInfo.fullName && personalInfo.email) score += 20;
    if (personalInfo.phone || personalInfo.city) score += 10;
    if (personalInfo.summary) score += 10;

    // Skills
    if (skills.some((s) => s.skills?.length > 0)) score += 15;

    // Experience
    if (experience.some((e) => e.company && e.jobTitle)) score += 15;

    // Projects
    if (projects.some((p) => p.name)) score += 15;

    // Education
    if (education.some((e) => e.institution || e.degree)) score += 15;

    return Math.min(score, 100);
  };

  const completionPercentage = calculateCompletion();

  // Save handler
  const handleSaveResume = async (showToast = true) => {
    setSaving(true);
    setErrorMessage('');
    if (showToast) setSaveSuccess(false);

    // Basic validation
    if (!formData.personalInfo.fullName?.trim()) {
      setErrorMessage('Full Name is required.');
      setActiveSection('personal');
      setSaving(false);
      return false;
    }
    if (!formData.personalInfo.email?.trim()) {
      setErrorMessage('Email Address is required.');
      setActiveSection('personal');
      setSaving(false);
      return false;
    }

    try {
      const res = await api.resume.save(formData);
      if (res.success) {
        setHasSavedProfile(true);
        if (showToast) {
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 4000);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to save resume:', err);
      setErrorMessage(err.message || 'Failed to save resume. Please check your details.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Download PDF handler
  const handleDownloadPdf = async () => {
    setDownloading(true);
    setErrorMessage('');

    try {
      // Automatically save first so backend PDF reflects the newest edits
      const saved = await handleSaveResume(false);
      if (!saved) {
        setDownloading(false);
        return;
      }

      const blob = await api.resume.downloadPdf();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (formData.personalInfo.fullName || 'Candidate')
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `${safeName}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download PDF error:', err);
      setErrorMessage(
        err.message || 'Failed to generate PDF. Make sure all required fields are saved.'
      );
    } finally {
      setDownloading(false);
    }
  };

  // Reset / Delete Handler
  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete your saved resume profile? This action cannot be undone.')) {
      return;
    }
    try {
      await api.resume.delete();
      setHasSavedProfile(false);
      setFormData({
        personalInfo: {
          fullName: user?.name || '',
          professionalTitle: '',
          email: user?.email || '',
          phone: '',
          location: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
          summary: '',
          careerObjective: '',
        },
        links: { linkedIn: '', gitHub: '', portfolio: '', website: '', other: [] },
        education: [],
        experience: [],
        skills: [],
        projects: [],
        certifications: [],
        achievements: [],
        leadership: [],
        additional: { languages: [], volunteerExperience: [], publications: [], professionalMemberships: [], interests: [] },
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete resume profile.');
    }
  };

  // Navigation between sections
  const currentSectionIdx = SECTIONS.findIndex((s) => s.id === activeSection);
  const hasPrev = currentSectionIdx > 0;
  const hasNext = currentSectionIdx < SECTIONS.length - 1;

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-600">Loading your resume profile...</p>
      </div>
    );
  }

  return (
    <div className="p-3.5 sm:p-6 md:p-8 max-w-[1600px] mx-auto space-y-4 sm:space-y-6">
      {/* 1. Header & Primary Action Hub */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
                Create Your Resume
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ATS-Optimized
                </span>
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                Standard single-column format parsed seamlessly by modern HR Applicant Tracking Systems
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* View Mode Switcher */}
          <div className="hidden xl:flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setViewMode('form')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'form'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Form Only
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Full Preview</span>
            </button>
          </div>

          {/* Mobile/Tablet Preview Toggle */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'preview' ? 'form' : 'preview')}
            className="xl:hidden px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>{viewMode === 'preview' ? 'Back to Form' : 'Preview Resume'}</span>
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={() => handleSaveResume(true)}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
            ) : (
              <Save className="w-4 h-4 text-indigo-600" />
            )}
            <span>{saving ? 'Saving...' : 'Save Resume'}</span>
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {downloading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{downloading ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>

          {hasSavedProfile && (
            <button
              type="button"
              onClick={handleDeleteResume}
              title="Delete saved resume profile"
              className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Notifications & Alerts */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-emerald-900 flex items-center justify-between text-xs font-semibold animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Resume profile saved successfully to your account!</span>
          </div>
          <span className="text-[11px] text-emerald-700">All fields persisted</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/90 text-rose-900 flex items-center gap-2 text-xs font-semibold animate-fade-in shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 3. Resume Completion Indicator Bar */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-900">
              Resume Strength & Completeness
            </span>
          </div>
          <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
            {completionPercentage}% Ready
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-medium">
          <span>
            {completionPercentage >= 80
              ? '✨ Excellent! Your resume has enough structured content for strong ATS parsing.'
              : 'Add at least 1 work experience, 1 project, and your core technical skills to maximize interview rate.'}
          </span>
          <span className="text-slate-400">
            {hasSavedProfile ? 'Saved in Database' : 'Unsaved changes'}
          </span>
        </div>
      </div>

      {/* 4. Main Working Layout */}
      <div
        className={`grid gap-6 ${
          viewMode === 'split'
            ? 'grid-cols-1 xl:grid-cols-12'
            : 'grid-cols-1'
        }`}
      >
        {/* Left Form Section (when viewMode is 'split' or 'form') */}
        {viewMode !== 'preview' && (
          <div
            className={`space-y-6 ${
              viewMode === 'split' ? 'xl:col-span-7' : 'w-full'
            }`}
          >
            {/* Horizontal Section Pills Navigation */}
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {SECTIONS.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSection(sec.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{sec.label}</span>
                    {sec.required && (
                      <span className={isActive ? 'text-indigo-200' : 'text-rose-500'}>
                        *
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Section Form Box */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
              {activeSection === 'personal' && (
                <PersonalSection
                  personalInfo={formData.personalInfo}
                  onChange={(val) =>
                    setFormData({ ...formData, personalInfo: val })
                  }
                />
              )}

              {activeSection === 'summary' && (
                <SummarySection
                  personalInfo={formData.personalInfo}
                  onChange={(val) =>
                    setFormData({ ...formData, personalInfo: val })
                  }
                />
              )}

              {activeSection === 'links' && (
                <LinksSection
                  links={formData.links}
                  onChange={(val) => setFormData({ ...formData, links: val })}
                />
              )}

              {activeSection === 'skills' && (
                <SkillsSection
                  skills={formData.skills}
                  onChange={(val) => setFormData({ ...formData, skills: val })}
                />
              )}

              {activeSection === 'experience' && (
                <ExperienceSection
                  experience={formData.experience}
                  onChange={(val) =>
                    setFormData({ ...formData, experience: val })
                  }
                />
              )}

              {activeSection === 'projects' && (
                <ProjectsSection
                  projects={formData.projects}
                  onChange={(val) => setFormData({ ...formData, projects: val })}
                />
              )}

              {activeSection === 'education' && (
                <EducationSection
                  education={formData.education}
                  onChange={(val) =>
                    setFormData({ ...formData, education: val })
                  }
                />
              )}

              {activeSection === 'certifications' && (
                <CertificationsSection
                  certifications={formData.certifications}
                  onChange={(val) =>
                    setFormData({ ...formData, certifications: val })
                  }
                />
              )}

              {activeSection === 'achievements' && (
                <AchievementsSection
                  achievements={formData.achievements}
                  onChange={(val) =>
                    setFormData({ ...formData, achievements: val })
                  }
                />
              )}

              {activeSection === 'leadership' && (
                <LeadershipSection
                  leadership={formData.leadership}
                  onChange={(val) =>
                    setFormData({ ...formData, leadership: val })
                  }
                />
              )}

              {activeSection === 'additional' && (
                <AdditionalSection
                  additional={formData.additional}
                  onChange={(val) =>
                    setFormData({ ...formData, additional: val })
                  }
                />
              )}

              {/* Bottom Next/Prev Pagination */}
              <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                {hasPrev ? (
                  <button
                    type="button"
                    onClick={() => setActiveSection(SECTIONS[currentSectionIdx - 1].id)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous: {SECTIONS[currentSectionIdx - 1].label}</span>
                  </button>
                ) : (
                  <div></div>
                )}

                {hasNext && (
                  <button
                    type="button"
                    onClick={() => setActiveSection(SECTIONS[currentSectionIdx + 1].id)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
                  >
                    <span>Next: {SECTIONS[currentSectionIdx + 1].label}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Right Preview Section (when viewMode is 'split' or 'preview') */}
        {viewMode !== 'form' && (
          <div
            className={`space-y-4 ${
              viewMode === 'split' ? 'xl:col-span-5' : 'w-full'
            }`}
          >
            <div className="sticky top-6 space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Live ATS Document Preview</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Auto-updates as you type
                </span>
              </div>

              {/* Live Render Component */}
              <div className="max-h-[85vh] overflow-y-auto rounded-3xl border border-slate-200 shadow-sm bg-slate-100/60 p-2 md:p-4 scrollbar-thin">
                <ResumePreview data={formData} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
