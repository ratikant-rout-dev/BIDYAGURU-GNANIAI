const profileSyncService = require('./profileSyncService');
const ResumeProfile = require('../models/ResumeProfile');

/**
 * Supported AI tasks for tailored context extraction
 */
const AI_TASK_TYPES = {
  CAREER_ROADMAP: 'career_roadmap',
  RESUME_IMPROVEMENT: 'resume_improvement',
  SKILL_GAP_ANALYSIS: 'skill_gap_analysis',
  INTERVIEW_PREP: 'interview_prep',
  PROJECT_RECOMMENDATIONS: 'project_recommendations',
  CAREER_GUIDANCE: 'career_guidance',
};

/**
 * Builds minimal, structured context for AI tasks without exposing sensitive data
 * or confounding confirmed skills with developing/to-learn skills.
 */
const buildAiContext = async (userId, taskType = AI_TASK_TYPES.CAREER_GUIDANCE) => {
  const [personal, career] = await Promise.all([
    profileSyncService.getOrCreatePersonalProfile(userId),
    profileSyncService.getOrCreateCareerProfile(userId),
  ]);

  // Explicitly partition skills by status
  const haveSkills = (career.skills || [])
    .filter((s) => s.status === 'have')
    .map((s) => s.name);

  const developingSkills = (career.skills || [])
    .filter((s) => s.status === 'developing')
    .map((s) => s.name);

  const toLearnSkills = (career.skills || [])
    .filter((s) => s.status === 'toLearn')
    .map((s) => s.name);

  const baseContext = {
    studentName: personal.fullName || 'Student',
    preferredLanguage: career.languagePreference || 'en-IN',
    targetField: career.targetField || (career.targetFields?.[0]) || 'General Career Development',
    careerGoal: career.careerGoal || (career.targetRoles?.[0]) || 'Undecided',
    experienceLevel: career.experienceLevel || 'Entry Level / Student',
    confirmedSkills: haveSkills,
    skillsInProgress: developingSkills,
    skillsToLearn: toLearnSkills,
  };

  switch (taskType) {
    case AI_TASK_TYPES.CAREER_ROADMAP:
      return {
        ...baseContext,
        shortTermGoals: career.shortTermGoals || [],
        longTermGoals: career.longTermGoals || [],
        targetCompanies: career.targetCompanies || [],
      };

    case AI_TASK_TYPES.SKILL_GAP_ANALYSIS:
      return {
        targetRole: baseContext.careerGoal,
        targetField: baseContext.targetField,
        confirmedSkills: haveSkills,
        skillsInProgress: developingSkills,
      };

    case AI_TASK_TYPES.PROJECT_RECOMMENDATIONS:
      return {
        careerGoal: baseContext.careerGoal,
        targetField: baseContext.targetField,
        confirmedSkills: haveSkills,
        skillsInProgress: developingSkills,
        skillsToLearn: toLearnSkills,
      };

    case AI_TASK_TYPES.INTERVIEW_PREP: {
      const resume = await ResumeProfile.findOne({ userId }, 'experience projects education');
      return {
        studentName: baseContext.studentName,
        targetRole: baseContext.careerGoal,
        confirmedSkills: haveSkills,
        experienceSummary: (resume?.experience || []).map((e) => ({
          title: e.jobTitle,
          company: e.company,
          technologies: e.technologies,
        })),
        projectsSummary: (resume?.projects || []).map((p) => ({
          name: p.name,
          technologies: p.technologies,
        })),
      };
    }

    case AI_TASK_TYPES.RESUME_IMPROVEMENT: {
      const resume = await ResumeProfile.findOne({ userId });
      return {
        careerGoal: baseContext.careerGoal,
        targetField: baseContext.targetField,
        confirmedSkills: haveSkills,
        resumeSkills: (resume?.skills || []).flatMap((c) => c.skills || []),
        experienceCount: resume?.experience?.length || 0,
        projectsCount: resume?.projects?.length || 0,
        educationCount: resume?.education?.length || 0,
        hasSummary: Boolean(resume?.personalInfo?.summary),
      };
    }

    case AI_TASK_TYPES.CAREER_GUIDANCE:
    default:
      return {
        ...baseContext,
        location: personal.city ? `${personal.city}, ${personal.country || 'India'}` : '',
        workModePreference: career.careerPreferences?.workMode || '',
      };
  }
};

/**
 * Formats structured AI context into a concise prompt block for LLMs
 */
const formatContextForPrompt = (context) => {
  return [
    `Student: ${context.studentName || 'Student'}`,
    `Target Field: ${context.targetField || 'Not set'}`,
    `Career Goal: ${context.careerGoal || context.targetRole || 'Not set'}`,
    `Confirmed (Mastered) Skills: ${(context.confirmedSkills || []).join(', ') || 'None'}`,
    `Currently Learning (In Progress): ${(context.skillsInProgress || []).join(', ') || 'None'}`,
    `Future Learning Goals: ${(context.skillsToLearn || []).join(', ') || 'None'}`,
    context.experienceLevel ? `Experience Level: ${context.experienceLevel}` : '',
    context.location ? `Location: ${context.location}` : '',
  ]
    .filter(Boolean)
    .join('\n');
};

/**
 * Controlled AI modification handler.
 * Validates updates against an allowlist and creates pending proposals for sensitive items.
 */
const handleAiSuggestedUpdate = async (userId, updateType, payload) => {
  switch (updateType) {
    case 'add_developing_skill': {
      if (!payload.skillName || !payload.skillName.trim()) {
        throw new Error('Skill name is required');
      }
      return await profileSyncService.addCareerSkill(userId, {
        name: payload.skillName.trim(),
        status: 'developing',
        proficiency: payload.proficiency || 'Beginner',
        source: 'ai',
      });
    }

    case 'add_to_learn_skill': {
      if (!payload.skillName || !payload.skillName.trim()) {
        throw new Error('Skill name is required');
      }
      return await profileSyncService.addCareerSkill(userId, {
        name: payload.skillName.trim(),
        status: 'toLearn',
        source: 'ai',
      });
    }

    case 'suggest_resume_project': {
      // Must require user review and explicit confirmation before adding to ResumeProfile
      return {
        requiresUserConfirmation: true,
        targetSection: 'projects',
        proposal: {
          name: (payload.name || '').trim(),
          description: (payload.description || '').trim(),
          technologies: Array.isArray(payload.technologies) ? payload.technologies : [],
          keyContributions: Array.isArray(payload.keyContributions) ? payload.keyContributions : [],
          suggestedSkillsToAdd: Array.isArray(payload.suggestedSkills) ? payload.suggestedSkills : [],
        },
        message: 'Project suggestion prepared. Review and confirm to add to your resume.',
      };
    }

    case 'suggest_resume_certification': {
      return {
        requiresUserConfirmation: true,
        targetSection: 'certifications',
        proposal: {
          name: (payload.name || '').trim(),
          issuingOrganization: (payload.issuingOrganization || '').trim(),
        },
        message: 'Certification suggestion prepared. Review and confirm to add to your resume.',
      };
    }

    case 'update_personal_field': {
      const allowedFields = ['phone', 'city', 'state', 'country', 'postalCode'];
      const sanitized = {};
      for (const field of allowedFields) {
        if (payload[field] !== undefined) {
          sanitized[field] = payload[field];
        }
      }
      if (Object.keys(sanitized).length > 0) {
        return await profileSyncService.updatePersonalProfile(userId, sanitized);
      }
      return null;
    }

    default:
      throw new Error(`Unsupported AI update type: ${updateType}`);
  }
};

module.exports = {
  AI_TASK_TYPES,
  buildAiContext,
  formatContextForPrompt,
  handleAiSuggestedUpdate,
};
