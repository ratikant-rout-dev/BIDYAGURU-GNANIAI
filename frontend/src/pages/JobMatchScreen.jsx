import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Search,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  ArrowRight,
  Filter,
  DollarSign,
  Building,
  GraduationCap,
  Compass,
  X,
  History,
  Eye,
  RefreshCw,
} from 'lucide-react';

export const JobMatchScreen = ({ onNavigate }) => {
  const { user } = useAuth();

  // State
  const [jobs, setJobs] = useState([]);
  const [studentSkills, setStudentSkills] = useState(['HTML', 'CSS', 'JavaScript']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Primary Filters (Role & Location)
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [jobTypeFilter, setJobTypeFilter] = useState('All');
  const [expFilter, setExpFilter] = useState('All');
  const [sortBy, setSortBy] = useState('match');

  // Modals & Drawers
  const [selectedJob, setSelectedJob] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeParsedInfo, setResumeParsedInfo] = useState(null);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [jobToApply, setJobToApply] = useState(null);
  const [applyNotes, setApplyNotes] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(null);

  const [showApplicationsDrawer, setShowApplicationsDrawer] = useState(false);
  const [applications, setApplications] = useState([]);

  // Fetch jobs
  const fetchJobs = async (overrideSkills = null) => {
    setLoading(true);
    setError('');
    try {
      const skillsToPass =
        overrideSkills !== null
          ? overrideSkills
          : studentSkills.join(',');

      const res = await api.jobs.getMatched({
        q: searchQuery,
        location: locationFilter,
        isRemote: remoteOnly ? 'true' : '',
        jobType: jobTypeFilter,
        experienceLevel: expFilter,
        sortBy,
        userSkills: skillsToPass,
      });

      if (res.success) {
        setJobs(res.jobs || []);
        if (res.studentSkills && res.studentSkills.length > 0) {
          setStudentSkills(res.studentSkills);
        }
      } else {
        setError(res.message || 'Failed to load matching jobs.');
      }
    } catch (err) {
      console.error('Fetch jobs error:', err);
      setError('Unable to load jobs. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  // Load user applications
  const loadApplications = async () => {
    try {
      const appRes = await api.jobs.getApplications();
      if (appRes.success) {
        setApplications(appRes.applications || []);
      }
    } catch (e) {
      console.warn('Load applications failed:', e);
    }
  };

  useEffect(() => {
    fetchJobs();
    loadApplications();
  }, [remoteOnly, jobTypeFilter, expFilter, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  // Quick Location chip
  const applyLocationPreset = (loc) => {
    setLocationFilter(loc);
    setLoading(true);
    // Trigger immediate fetch with selected location preserving current search query
    api.jobs
      .getMatched({
        q: searchQuery,
        location: loc,
        isRemote: remoteOnly ? 'true' : '',
        jobType: jobTypeFilter,
        experienceLevel: expFilter,
        sortBy,
        userSkills: studentSkills.join(','),
      })
      .then((res) => {
        if (res.success) {
          setJobs(res.jobs || []);
        }
      })
      .finally(() => setLoading(false));
  };

  // Resume Upload Handler (PDF, Word DOCX, DOC) with Dual-Mode (FormData + Base64 fallback)
  const handleUploadResumeFile = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploadingResume(true);
    try {
      let res = null;

      // 1. Attempt standard FormData multipart
      try {
        const formData = new FormData();
        formData.append('resume', selectedFile);
        res = await api.jobs.uploadResume(formData);
      } catch (multipartErr) {
        console.warn('Multipart upload fallback to Base64:', multipartErr);
        // 2. Base64 fallback if multipart hits header/boundary issue
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });

        res = await api.jobs.uploadResume({
          fileBase64: base64Data,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
        });
      }

      if (res && res.success) {
        setResumeParsedInfo(res);
        if (res.extractedSkills && res.extractedSkills.length > 0) {
          setStudentSkills(res.extractedSkills);
          // Re-fetch jobs with extracted skills
          fetchJobs(res.extractedSkills.join(','));
        }
        setShowResumeModal(false);
        setSelectedFile(null);
      } else {
        alert(res?.message || 'Failed to extract skills from resume document.');
      }
    } catch (err) {
      console.error('Resume upload error:', err);
      alert('Failed to parse resume document. Please check the file and try again.');
    } finally {
      setUploadingResume(false);
    }
  };

  // Apply Now Handler
  const initiateApply = (job) => {
    setJobToApply(job);
    setApplySuccess(null);
    setShowApplyModal(true);
  };

  const confirmApply = async () => {
    if (!jobToApply) return;
    setApplying(true);
    try {
      const res = await api.jobs.apply({
        jobId: jobToApply.id,
        jobTitle: jobToApply.title,
        companyName: jobToApply.company?.name || 'Company',
        companyLogo: jobToApply.company?.logo || '',
        location: jobToApply.location,
        applicationUrl: jobToApply.applicationUrl,
        notes: applyNotes,
      });

      if (res.success) {
        setApplySuccess({
          message:
            'You are being redirected to the official application portal. Bidya Guru has logged this application.',
          redirectUrl: jobToApply.applicationUrl,
        });

        // Refresh applied jobs history
        api.jobs.getApplications().then((r) => {
          if (r.success) setApplications(r.applications || []);
        });

        // Open official job portal in new tab
        setTimeout(() => {
          window.open(jobToApply.applicationUrl, '_blank', 'noopener,noreferrer');
        }, 1200);
      }
    } catch (err) {
      console.error('Apply error:', err);
      alert('Application redirect error. You can visit the link directly.');
    } finally {
      setApplying(false);
    }
  };

  // Match badge styling
  const getMatchBadgeStyle = (pct) => {
    if (pct >= 75) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    }
    if (pct >= 50) {
      return 'bg-amber-50 text-amber-700 border-amber-200/80';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Top Hero Banner */}
      <div className="relative rounded-3xl p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-500/20 overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>AI Real-Time Job Match & Apply Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Personalized Career Opportunities
          </h1>
          <p className="text-sm text-indigo-100/90 leading-relaxed font-normal">
            Upload your resume or search by target role and location. Jobs are ranked by match percentage with missing skills highlighted below.
          </p>

          {/* Active Skills Display */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-indigo-300 mr-1 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              Active Skills ({studentSkills.length}):
            </span>
            {studentSkills.map((s, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/20 font-semibold"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full lg:w-auto">
          <button
            onClick={() => setShowResumeModal(true)}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Upload className="w-4 h-4 text-indigo-300" />
            <span>Upload Resume (PDF / Word)</span>
          </button>

          <button
            onClick={() => setShowApplicationsDrawer(true)}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-600/30"
          >
            <History className="w-4 h-4" />
            <span>Applied Jobs ({applications.length})</span>
          </button>
        </div>
      </div>

      {/* Search & Location Filter Toolbar */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        {/* Search Bar & Location Input */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role or skill (e.g. Java Developer, Frontend, Python, React)..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
            />
          </div>

          <div className="w-full md:w-64 relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="Location (e.g. Pune, Bhubaneswar, Bengaluru)"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
          >
            Find Jobs
          </button>
        </form>

        {/* Quick Location Presets (Pune, Bhubaneswar, Bengaluru, Remote India) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-semibold text-[11px]">Popular Locations:</span>
          {[
            { label: '📍 Pune', val: 'pune' },
            { label: '📍 Bhubaneswar / Odisha', val: 'bhubaneswar' },
            { label: '📍 Bengaluru', val: 'bengaluru' },
            { label: '📍 Hyderabad', val: 'hyderabad' },
            { label: '🌐 Remote India', val: 'remote' },
          ].map((loc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyLocationPreset(loc.val)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-medium border border-slate-200/80 transition-colors cursor-pointer"
            >
              {loc.label}
            </button>
          ))}
          {locationFilter && (
            <button
              type="button"
              onClick={() => {
                setLocationFilter('');
                fetchJobs();
              }}
              className="text-xs text-rose-600 hover:underline font-semibold ml-1 cursor-pointer"
            >
              ✕ Clear Location
            </button>
          )}
        </div>

        {/* Secondary Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-400 uppercase text-[11px] mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filter By:
            </span>

            {/* Remote Only Toggle */}
            <button
              onClick={() => setRemoteOnly(!remoteOnly)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer border ${
                remoteOnly
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              🌐 Remote Only
            </button>

            {/* Job Type Selector */}
            {['All', 'Full Time', 'Internship', 'Part Time'].map((type) => (
              <button
                key={type}
                onClick={() => setJobTypeFilter(type)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer border ${
                  jobTypeFilter === type
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {type}
              </button>
            ))}

            {/* Experience Level */}
            {['All', 'Entry Level', 'Junior', 'Mid Level'].map((level) => (
              <button
                key={level}
                onClick={() => setExpFilter(level)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer border ${
                  expFilter === level
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="match">Highest Match %</option>
              <option value="date">Most Recent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-2">
        <span>
          Showing <strong className="text-slate-900 font-bold">{jobs.length}</strong> matching real-time opportunities
          {locationFilter && (
            <span>
              {' '}
              in <strong className="text-indigo-700 font-bold">{locationFilter}</strong>
            </span>
          )}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Verified Feeds (Bhubaneswar Hub + JobDataAPI)
        </span>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-slate-800">
            Finding matching job opportunities...
          </p>
          <p className="text-xs text-slate-400">Comparing your skills with live openings</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && jobs.length === 0 && (
        <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-4">
          <Briefcase className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No matching jobs found for current filters</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try clearing the location or searching for "frontend" to see all available roles.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setLocationFilter('');
              setRemoteOnly(false);
              setJobTypeFilter('All');
              setExpFilter('All');
              fetchJobs();
            }}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Jobs Grid */}
      {!loading && jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              {/* Header: Company Logo, Title, Match Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  {job.company?.logo ? (
                    <img
                      src={job.company.logo}
                      alt={job.company.name}
                      className="w-12 h-12 rounded-2xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-extrabold flex items-center justify-center text-sm shrink-0 shadow-xs">
                      {job.company?.name ? job.company.name.slice(0, 2).toUpperCase() : 'CO'}
                    </div>
                  )}

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 line-clamp-1 hover:text-indigo-600 transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.company?.name}</span>
                    </p>
                  </div>
                </div>

                {/* Match Percentage Pill */}
                <div
                  className={`px-3 py-1 rounded-full border text-xs font-extrabold shrink-0 flex items-center gap-1 shadow-2xs ${getMatchBadgeStyle(
                    job.matchPercentage
                  )}`}
                >
                  <span>{job.matchPercentage}% Match</span>
                </div>
              </div>

              {/* Job Metadata Chips */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold text-[11px]">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  {job.location}
                </span>

                <span className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 font-semibold text-[11px]">
                  {job.jobType}
                </span>

                <span className="px-2.5 py-1 rounded-xl bg-violet-50 text-violet-700 font-semibold text-[11px]">
                  {job.experienceLevel}
                </span>

                {job.salary && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                    <DollarSign className="w-3 h-3 text-emerald-600" />
                    {job.salary}
                  </span>
                )}
              </div>

              {/* Matching vs Missing Skills Breakdown */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                {/* Matching Skills */}
                {job.matchingSkills?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Matched:
                    </span>
                    {job.matchingSkills.map((s, sidx) => (
                      <span
                        key={sidx}
                        className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200/60"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Missing Skills */}
                {job.missingSkills?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      Missing:
                    </span>
                    {job.missingSkills.map((s, sidx) => (
                      <span
                        key={sidx}
                        className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold text-[11px] border border-amber-200/60"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Learning Roadmap Recommendation */}
                {job.learningRecommendation && (
                  <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100/80 text-[11px] text-indigo-900 font-medium flex items-start gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <span>{job.learningRecommendation}</span>
                  </div>
                )}
              </div>

              {/* Card Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedJob(job)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                <button
                  onClick={() => initiateApply(job)}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Apply Now</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-start gap-3.5">
                {selectedJob.company?.logo ? (
                  <img
                    src={selectedJob.company.logo}
                    alt={selectedJob.company.name}
                    className="w-12 h-12 rounded-2xl object-cover bg-slate-100 border border-slate-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm">
                    {selectedJob.company?.name?.slice(0, 2).toUpperCase() || 'CO'}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">{selectedJob.title}</h3>
                  <p className="text-xs font-bold text-slate-600">{selectedJob.company?.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedJob.location}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedJob(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Match Highlights */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    Your Skill Match
                  </p>
                  <p className="text-2xl font-extrabold text-slate-900">
                    {selectedJob.matchPercentage}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-700">
                    {selectedJob.matchingSkills?.length || 0} Skills Matched
                  </p>
                  <p className="text-xs font-bold text-amber-700">
                    {selectedJob.missingSkills?.length || 0} Skills to Learn
                  </p>
                </div>
              </div>

              {/* Company Website */}
              {selectedJob.company?.website && (
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1">
                    Company Website
                  </h4>
                  <a
                    href={selectedJob.company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>{selectedJob.company.website}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Required Skills */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                  Required Technical Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.requiredSkills?.map((skill, idx) => {
                    const isMatched = selectedJob.matchingSkills?.includes(skill);
                    return (
                      <span
                        key={idx}
                        className={`px-3 py-1 rounded-xl font-bold text-xs border ${
                          isMatched
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {isMatched ? '✓ ' : '+ '}
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                  Job Description & Scope
                </h4>
                <div
                  className="prose prose-xs max-w-none text-slate-600 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/80 leading-relaxed max-h-64 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: selectedJob.description }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={() => {
                  const target = selectedJob;
                  setSelectedJob(null);
                  initiateApply(target);
                }}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
              >
                <span>Proceed to Apply</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resume Upload Modal (PDF or Word .docx only, no paste box, does not store raw file) */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Upload Resume (PDF / Word)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Instantly extracts skills to calculate your live job matches
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowResumeModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadResumeFile} className="space-y-4">
              {/* File Dropzone */}
              <div className="p-6 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 text-center space-y-2 hover:bg-indigo-50 transition-colors">
                <FileText className="w-10 h-10 text-indigo-500 mx-auto" />
                <p className="text-xs font-bold text-slate-800">
                  {selectedFile ? selectedFile.name : 'Choose your PDF or Word document'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Supports .pdf, .docx, .doc, or .txt
                </p>
                <input
                  type="file"
                  id="resumeFileInput"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('resumeFileInput').click()}
                  className="mt-2 px-4 py-2 rounded-xl bg-white border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-50 shadow-2xs transition-colors cursor-pointer"
                >
                  Browse File
                </button>
              </div>

              {resumeParsedInfo && (
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Skills Extracted:
                  </p>
                  <p className="text-[11px] text-emerald-800 font-semibold">
                    {resumeParsedInfo.extractedSkills?.join(', ')}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResumeModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingResume || !selectedFile}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                >
                  {uploadingResume ? 'Extracting Skills...' : 'Upload & Extract Skills'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Confirmation Modal */}
      {showApplyModal && jobToApply && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Official Job Application
                  </h3>
                  <p className="text-xs text-slate-500">{jobToApply.company?.name}</p>
                </div>
              </div>

              <button
                onClick={() => setShowApplyModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <h4 className="font-extrabold text-sm text-slate-900">{jobToApply.title}</h4>
                <p className="text-slate-600 font-medium">
                  {jobToApply.location} • {jobToApply.jobType}
                </p>
                <p className="text-xs font-bold text-emerald-700 pt-1">
                  Skill Match: {jobToApply.matchPercentage}%
                </p>
              </div>

              {/* Disclaimer obeying system rule */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Official Application Redirect</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Bidya Guru connects you directly to the verified employer portal. Your application is officially submitted on the company website.
                  </p>
                </div>
              </div>

              {/* Optional notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Application Notes (Optional)
                </label>
                <input
                  type="text"
                  value={applyNotes}
                  onChange={(e) => setApplyNotes(e.target.value)}
                  placeholder="e.g. Applied via official careers page"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              {applySuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{applySuccess.message}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowApplyModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmApply}
                disabled={applying}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
              >
                <span>{applying ? 'Preparing Link...' : 'Proceed to Official Application'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Applied Jobs History Drawer */}
      {showApplicationsDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-hidden animate-slide-left">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-extrabold text-slate-900">
                    Application History ({applications.length})
                  </h3>
                </div>
                <button
                  onClick={() => setShowApplicationsDrawer(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {applications.length === 0 ? (
                <div className="p-10 text-center text-slate-400 space-y-2">
                  <Briefcase className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold">No applications logged yet.</p>
                  <p className="text-[11px] text-slate-400">
                    Click "Apply Now" on any matching job card to track it here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-[75vh] pr-1">
                  {applications.map((app) => (
                    <div
                      key={app._id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-extrabold text-slate-900 line-clamp-1">
                            {app.jobTitle}
                          </h4>
                          <p className="text-slate-600 font-semibold">{app.companyName}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {app.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                        <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
                        <a
                          href={app.applicationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 font-bold hover:underline flex items-center gap-1"
                        >
                          <span>Re-open Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowApplicationsDrawer(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
