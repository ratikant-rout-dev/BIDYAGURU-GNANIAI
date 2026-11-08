const Roadmap = require('../models/Roadmap');
const CareerProfile = require('../models/CareerProfile');
const JobApplication = require('../models/JobApplication');
const jobService = require('../integrations/job/jobService');

/**
 * Get unified student skills from Roadmap and Career Profile
 */
const getUnifiedStudentSkills = async (userId) => {
  const [roadmap, profile] = await Promise.all([
    Roadmap.findOne({ userId }),
    CareerProfile.findOne({ userId }),
  ]);

  const skillSet = new Set();

  // 1. Completed roadmap skills
  if (roadmap && Array.isArray(roadmap.roadmapItems)) {
    roadmap.roadmapItems.forEach((item) => {
      if (item.status === 'Completed' && item.skill) {
        skillSet.add(item.skill.trim());
      }
    });
  }

  // 2. Career profile known & developing skills
  if (profile) {
    (profile.knownSkills || []).forEach((s) => s && skillSet.add(s.trim()));
    (profile.developingSkills || []).forEach((s) => s && skillSet.add(s.trim()));
  }

  // Default initial skills if student is brand new
  if (skillSet.size === 0) {
    skillSet.add('HTML');
    skillSet.add('CSS');
    skillSet.add('JavaScript');
  }

  return {
    skills: Array.from(skillSet),
    roadmap,
    profile,
  };
};

/**
 * Helper to detect known skills from any free-form query or role input
 */
const detectSkillsFromInput = (inputStr) => {
  if (!inputStr || !inputStr.trim()) return [];
  const lower = inputStr.toLowerCase().trim();
  const skills = [];

  if (lower.includes('frontend') || lower.includes('front-end') || lower.includes('front end')) {
    skills.push('HTML', 'CSS', 'JavaScript');
  }
  if (lower.includes('mern') || lower.includes('fullstack') || lower.includes('full stack')) {
    ['React', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript'].forEach((s) => {
      if (!skills.includes(s)) skills.push(s);
    });
  }
  if (/\bjava\b/i.test(lower) && !/\bjavascript\b/i.test(lower)) {
    if (!skills.includes('Java')) skills.push('Java');
  }
  if (/\bspring\b/i.test(lower)) {
    if (!skills.includes('Spring Boot')) skills.push('Spring Boot');
  }
  if (/\bpython\b/i.test(lower)) {
    if (!skills.includes('Python')) skills.push('Python');
  }
  if (/\breact\b/i.test(lower)) {
    if (!skills.includes('React')) skills.push('React');
    if (!skills.includes('JavaScript')) skills.push('JavaScript');
  }
  if (/\bnode\b/i.test(lower)) {
    if (!skills.includes('Node.js')) skills.push('Node.js');
  }
  if (/\bsql\b/i.test(lower) || /\bmysql\b/i.test(lower) || /\bpostgres\b/i.test(lower)) {
    if (!skills.includes('SQL')) skills.push('SQL');
  }

  const extracted = jobService.extractSkillsFromText(inputStr, []);
  extracted.forEach((s) => {
    if (!skills.includes(s)) skills.push(s);
  });

  if (skills.length === 0) {
    inputStr.split(',').map((s) => s.trim()).filter(Boolean).forEach((s) => {
      if (!skills.includes(s)) skills.push(s);
    });
  }

  return skills;
};

/**
 * Get personalized matched jobs with location & role filtering
 */
const getMatchedJobs = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      q = '',
      location = '',
      isRemote,
      jobType = 'All',
      experienceLevel = 'All',
      sortBy = 'match',
      userSkills = '', // Allows student to pass direct skills (e.g. "HTML, CSS, JavaScript" or "Frontend" or "Java")
    } = req.query;

    let studentSkills = [];

    // 1. If student explicitly provided skills or role in query
    if (userSkills && userSkills.trim()) {
      studentSkills = detectSkillsFromInput(userSkills);
    }

    // 2. If student searched for a specific technology/language in `q` (e.g. q="java" or q="python")
    if (q && q.trim()) {
      const qSkills = detectSkillsFromInput(q);
      if (qSkills.length > 0) {
        if (studentSkills.length === 0) {
          studentSkills = qSkills;
        } else {
          qSkills.forEach((s) => {
            if (!studentSkills.includes(s)) studentSkills.push(s);
          });
        }
      }
    }

    // 3. Otherwise, fetch from completed roadmap and profile
    if (studentSkills.length === 0) {
      const unified = await getUnifiedStudentSkills(userId);
      studentSkills = unified.skills;
    }

    // 1. Fetch raw jobs (including verified Indian tech hubs & live aggregators)
    const rawJobs = await jobService.fetchRawJobs(q);

    // 2. Calculate match percentage against student's skills
    let matchedJobs = rawJobs.map((job) => jobService.matchJobWithStudent(job, studentSkills));

    // 3. Search query filter with whole-word matching (so 'java' does not match 'javascript')
    if (q && q.trim()) {
      const qLower = q.toLowerCase().trim();
      matchedJobs = matchedJobs.filter((job) => {
        const titleLower = job.title.toLowerCase();
        const compLower = (job.company?.name || '').toLowerCase();
        const descLower = (job.description || '').toLowerCase();

        // If user searched specifically for java
        if (qLower === 'java') {
          const isJavaInTitle = /\bjava\b/i.test(titleLower) && !/\bjavascript\b/i.test(titleLower);
          const isJavaInSkills = (job.requiredSkills || []).some(
            (s) => s.toLowerCase() === 'java' || (/\bjava\b/i.test(s) && !/\bjavascript\b/i.test(s))
          );
          const isJavaInDesc = /\bjava\b/i.test(descLower) && !/\bjavascript\b/i.test(descLower);
          return isJavaInTitle || isJavaInSkills || isJavaInDesc;
        }

        // If user searched for javascript / js
        if (qLower === 'javascript' || qLower === 'js') {
          return (
            /\bjavascript\b/i.test(titleLower) ||
            /\bjs\b/i.test(titleLower) ||
            (job.requiredSkills || []).some((s) => jobService.normalizeSkill(s) === 'javascript')
          );
        }

        // General word-boundary match
        try {
          const escaped = qLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\b${escaped}\\b`, 'i');
          if (regex.test(titleLower) || regex.test(compLower) || regex.test(descLower)) {
            return true;
          }
          if ((job.requiredSkills || []).some((s) => regex.test(s))) {
            return true;
          }
        } catch (e) {}

        return (
          titleLower.includes(qLower) ||
          compLower.includes(qLower) ||
          (job.requiredSkills || []).some((s) => s.toLowerCase().includes(qLower))
        );
      });
    }

    // 4. Location filter with smart alias & regional matching (e.g. "bhubneswar" / "bhubaneswar")
    if (location && location.trim()) {
      matchedJobs = matchedJobs.filter((job) =>
        jobService.matchesLocation(job, location)
      );
    }

    // 5. Remote Only filter
    if (isRemote === 'true') {
      matchedJobs = matchedJobs.filter((job) => job.isRemote);
    }

    // 6. Job Type filter
    if (jobType && jobType !== 'All') {
      matchedJobs = matchedJobs.filter(
        (job) => job.jobType.toLowerCase() === jobType.toLowerCase()
      );
    }

    // 7. Experience Level filter
    if (experienceLevel && experienceLevel !== 'All') {
      matchedJobs = matchedJobs.filter(
        (job) => job.experienceLevel.toLowerCase() === experienceLevel.toLowerCase()
      );
    }

    // 8. Sorting
    if (sortBy === 'date') {
      matchedJobs.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    } else {
      matchedJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }

    res.json({
      success: true,
      total: matchedJobs.length,
      studentSkills,
      jobs: matchedJobs,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single job details with match breakdown
 */
const getJobDetails = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;

    const { skills: studentSkills } = await getUnifiedStudentSkills(userId);
    const rawJobs = await jobService.fetchRawJobs('');

    const targetJob = rawJobs.find((j) => j.id === jobId);
    if (!targetJob) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found',
      });
    }

    const matched = jobService.matchJobWithStudent(targetJob, studentSkills);

    res.json({
      success: true,
      job: matched,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Handle job application redirect & tracking
 */
const applyForJob = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { jobId, jobTitle, companyName, companyLogo, location, applicationUrl, notes } = req.body;

    if (!jobId || !applicationUrl) {
      return res.status(400).json({
        success: false,
        message: 'jobId and applicationUrl are required.',
      });
    }

    // Log the application redirect in the database
    const application = await JobApplication.create({
      userId,
      jobId,
      jobTitle: jobTitle || 'Software Role',
      companyName: companyName || 'Hiring Company',
      companyLogo: companyLogo || '',
      location: location || 'Remote',
      applicationUrl,
      status: 'Redirected to Official Portal',
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Redirecting to official job portal. Bidya Guru has logged this application.',
      application,
      redirectUrl: applicationUrl,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get user's applied jobs history
 */
const getAppliedJobs = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const applications = await JobApplication.find({ userId }).sort({ appliedAt: -1 }).limit(50);

    res.json({
      success: true,
      applications,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Upload & parse resume in-memory (PDF, Word DOCX, TXT)
 * Extracts skills without saving bulky raw resume in database
 */
const uploadResume = async (req, res, next) => {
  try {
    let parsedData = null;
    let fileName = 'Uploaded Resume';

    // 1. Multipart file upload
    if (req.file) {
      fileName = req.file.originalname || 'resume';
      parsedData = await jobService.parseResumeBuffer(
        req.file.buffer,
        fileName,
        req.file.mimetype
      );
    }
    // 2. Base64 file upload from client
    else if (req.body.fileBase64) {
      fileName = req.body.fileName || 'resume.pdf';
      const base64Data = req.body.fileBase64.replace(/^data:.*?;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      parsedData = await jobService.parseResumeBuffer(
        buffer,
        fileName,
        req.body.fileType || ''
      );
    }
    // 3. Raw text fallback
    else if (req.body.resumeText && req.body.resumeText.trim()) {
      fileName = req.body.fileName || 'resume_text';
      parsedData = await jobService.parseResumeText(req.body.resumeText);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide a PDF or Word document (.pdf, .docx, .doc).',
      });
    }

    res.status(200).json({
      success: true,
      message: `Extracted ${parsedData.extractedSkills.length} skills from ${fileName}!`,
      fileName,
      extractedSkills: parsedData.extractedSkills,
      experienceYears: parsedData.experienceYears,
      education: parsedData.education,
      summary: parsedData.summary,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMatchedJobs,
  getJobDetails,
  applyForJob,
  getAppliedJobs,
  uploadResume,
};
