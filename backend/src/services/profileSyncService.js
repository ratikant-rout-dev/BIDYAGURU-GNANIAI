const PersonalProfile = require('../models/PersonalProfile');
const CareerProfile = require('../models/CareerProfile');
const ResumeProfile = require('../models/ResumeProfile');
const User = require('../models/User');

/**
 * Retrieve or automatically initialize PersonalProfile for the authenticated user
 */
const getOrCreatePersonalProfile = async (userId) => {
  let profile = await PersonalProfile.findOne({ userId });

  if (!profile) {
    // 1. Check if user already entered contact data in ResumeProfile
    const resume = await ResumeProfile.findOne({ userId });
    const user = await User.findById(userId);

    const initialData = {
      userId,
      fullName: resume?.personalInfo?.fullName || user?.name || 'Student',
      email: resume?.personalInfo?.email || user?.email || '',
      phone: resume?.personalInfo?.phone || '',
      location: resume?.personalInfo?.location || '',
      city: resume?.personalInfo?.city || '',
      state: resume?.personalInfo?.state || '',
      country: resume?.personalInfo?.country || '',
      postalCode: resume?.personalInfo?.postalCode || '',
      links: {
        linkedIn: resume?.links?.linkedIn || '',
        gitHub: resume?.links?.gitHub || '',
        portfolio: resume?.links?.portfolio || '',
        website: resume?.links?.website || '',
        other: resume?.links?.other || [],
      },
    };

    profile = await PersonalProfile.create(initialData);
  }

  return profile;
};

/**
 * Update PersonalProfile and automatically synchronize Category 1 fields across profiles
 */
const updatePersonalProfile = async (userId, data) => {
  const profile = await getOrCreatePersonalProfile(userId);

  // Update Personal Profile fields
  if (data.fullName !== undefined) profile.fullName = (data.fullName || '').trim();
  if (data.email !== undefined) profile.email = (data.email || '').trim().toLowerCase();
  if (data.phone !== undefined) profile.phone = (data.phone || '').trim();
  if (data.location !== undefined) profile.location = (data.location || '').trim();
  if (data.city !== undefined) profile.city = (data.city || '').trim();
  if (data.state !== undefined) profile.state = (data.state || '').trim();
  if (data.country !== undefined) profile.country = (data.country || '').trim();
  if (data.postalCode !== undefined) profile.postalCode = (data.postalCode || '').trim();
  if (data.avatar !== undefined) profile.avatar = data.avatar;

  if (data.links) {
    profile.links = {
      linkedIn: data.links.linkedIn !== undefined ? data.links.linkedIn.trim() : profile.links.linkedIn,
      gitHub: data.links.gitHub !== undefined ? data.links.gitHub.trim() : profile.links.gitHub,
      portfolio: data.links.portfolio !== undefined ? data.links.portfolio.trim() : profile.links.portfolio,
      website: data.links.website !== undefined ? data.links.website.trim() : profile.links.website,
      other: data.links.other !== undefined ? data.links.other : profile.links.other,
    };
  }

  await profile.save();

  // CATEGORY 1 AUTOMATIC SYNCHRONIZATION:
  // 1. Sync User account name if changed
  if (profile.fullName) {
    await User.findByIdAndUpdate(userId, { name: profile.fullName });
  }

  // 2. Sync into ResumeProfile if it exists
  const resume = await ResumeProfile.findOne({ userId });
  if (resume) {
    if (resume.personalInfo) {
      if (profile.fullName) resume.personalInfo.fullName = profile.fullName;
      if (profile.email) resume.personalInfo.email = profile.email;
      resume.personalInfo.phone = profile.phone;
      resume.personalInfo.location = profile.location;
      resume.personalInfo.city = profile.city;
      resume.personalInfo.state = profile.state;
      resume.personalInfo.country = profile.country;
      resume.personalInfo.postalCode = profile.postalCode;
    }
    if (resume.links) {
      resume.links.linkedIn = profile.links.linkedIn;
      resume.links.gitHub = profile.links.gitHub;
      resume.links.portfolio = profile.links.portfolio;
      resume.links.website = profile.links.website;
      if (profile.links.other?.length) {
        resume.links.other = profile.links.other;
      }
    }
    await resume.save();
  }

  return profile;
};

/**
 * Sync personal data from Resume Builder back to Personal Profile
 */
const syncResumePersonalData = async (userId, resumeData) => {
  if (!resumeData) return null;

  const profile = await getOrCreatePersonalProfile(userId);
  let hasChanges = false;

  if (resumeData.personalInfo) {
    const { fullName, email, phone, location, city, state, country, postalCode } = resumeData.personalInfo;
    if (fullName && fullName.trim() && fullName !== profile.fullName) {
      profile.fullName = fullName.trim();
      hasChanges = true;
    }
    if (email && email.trim() && email.toLowerCase() !== profile.email) {
      profile.email = email.trim().toLowerCase();
      hasChanges = true;
    }
    if (phone && phone.trim() && phone.trim() !== profile.phone) {
      profile.phone = phone.trim();
      hasChanges = true;
    }
    if (location && location.trim() && location.trim() !== profile.location) {
      profile.location = location.trim();
      hasChanges = true;
    }
    if (city && city.trim() && city.trim() !== profile.city) {
      profile.city = city.trim();
      hasChanges = true;
    }
    if (state && state.trim() && state.trim() !== profile.state) {
      profile.state = state.trim();
      hasChanges = true;
    }
    if (country && country.trim() && country.trim() !== profile.country) {
      profile.country = country.trim();
      hasChanges = true;
    }
    if (postalCode && postalCode.trim() && postalCode.trim() !== profile.postalCode) {
      profile.postalCode = postalCode.trim();
      hasChanges = true;
    }
  }

  if (resumeData.links) {
    const { linkedIn, gitHub, portfolio, website, other } = resumeData.links;
    if (linkedIn && linkedIn.trim() && linkedIn.trim() !== profile.links.linkedIn) {
      profile.links.linkedIn = linkedIn.trim();
      hasChanges = true;
    }
    if (gitHub && gitHub.trim() && gitHub.trim() !== profile.links.gitHub) {
      profile.links.gitHub = gitHub.trim();
      hasChanges = true;
    }
    if (portfolio && portfolio.trim() && portfolio.trim() !== profile.links.portfolio) {
      profile.links.portfolio = portfolio.trim();
      hasChanges = true;
    }
    if (website && website.trim() && website.trim() !== profile.links.website) {
      profile.links.website = website.trim();
      hasChanges = true;
    }
    if (other && Array.isArray(other) && other.length > 0) {
      profile.links.other = other;
      hasChanges = true;
    }
  }

  if (hasChanges) {
    await profile.save();
    if (profile.fullName) {
      await User.findByIdAndUpdate(userId, { name: profile.fullName });
    }
  }

  return profile;
};

/**
 * Retrieve or initialize CareerProfile for the authenticated user
 */
const getOrCreateCareerProfile = async (userId) => {
  let profile = await CareerProfile.findOne({ userId });

  if (!profile) {
    const user = await User.findById(userId);
    profile = await CareerProfile.create({
      userId,
      languagePreference: user?.preferredLanguage || 'en-IN',
    });
  }

  return profile;
};

/**
 * Update CareerProfile with rich structured career information
 */
const updateCareerProfile = async (userId, data) => {
  const profile = await getOrCreateCareerProfile(userId);

  if (data.targetField !== undefined) profile.targetField = (data.targetField || '').trim();
  if (data.targetFields !== undefined) profile.targetFields = data.targetFields;
  if (data.careerGoal !== undefined) profile.careerGoal = (data.careerGoal || '').trim();
  if (data.targetRoles !== undefined) profile.targetRoles = data.targetRoles;
  if (data.targetCompanies !== undefined) profile.targetCompanies = data.targetCompanies;
  if (data.shortTermGoals !== undefined) profile.shortTermGoals = data.shortTermGoals;
  if (data.longTermGoals !== undefined) profile.longTermGoals = data.longTermGoals;
  if (data.experienceLevel !== undefined) profile.experienceLevel = data.experienceLevel;
  if (data.languagePreference !== undefined) profile.languagePreference = data.languagePreference;
  if (data.summary !== undefined) profile.summary = data.summary;

  if (data.careerPreferences) {
    profile.careerPreferences = {
      preferredEmploymentTypes:
        data.careerPreferences.preferredEmploymentTypes || profile.careerPreferences?.preferredEmploymentTypes || [],
      preferredLocations:
        data.careerPreferences.preferredLocations || profile.careerPreferences?.preferredLocations || [],
      workMode:
        data.careerPreferences.workMode !== undefined
          ? data.careerPreferences.workMode
          : profile.careerPreferences?.workMode || '',
      other: data.careerPreferences.other || profile.careerPreferences?.other || {},
    };
  }

  // If full skills array is provided
  if (data.skills && Array.isArray(data.skills)) {
    profile.skills = data.skills;
  } else {
    // If legacy arrays were supplied
    if (data.knownSkills !== undefined) profile.knownSkills = data.knownSkills;
    if (data.developingSkills !== undefined) profile.developingSkills = data.developingSkills;
    if (data.skillsToLearn !== undefined) profile.skillsToLearn = data.skillsToLearn;
  }

  await profile.save();
  return profile;
};

/**
 * Add a skill to CareerProfile with duplicate prevention
 */
const addCareerSkill = async (userId, { name, status = 'have', proficiency = '', source = 'user' }) => {
  if (!name || !name.trim()) {
    const err = new Error('Skill name is required');
    err.statusCode = 400;
    throw err;
  }

  const validStatuses = ['have', 'developing', 'toLearn'];
  if (!validStatuses.includes(status)) {
    const err = new Error(`Invalid skill status. Must be one of: ${validStatuses.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  const profile = await getOrCreateCareerProfile(userId);
  const trimmedName = name.trim();
  const lowerName = trimmedName.toLowerCase();

  // Check if skill already exists (case-insensitive)
  const existingSkill = (profile.skills || []).find(
    (s) => (s.name || '').trim().toLowerCase() === lowerName
  );

  if (existingSkill) {
    const err = new Error(`Skill "${trimmedName}" already exists in ${existingSkill.status} category`);
    err.statusCode = 409;
    throw err;
  }

  profile.skills.push({
    name: trimmedName,
    status,
    proficiency: proficiency || '',
    source,
    updatedAt: new Date(),
  });

  await profile.save();
  return profile;
};

/**
 * Update a skill in CareerProfile (status transition or proficiency change)
 */
const updateCareerSkill = async (userId, skillIdentifier, updateData) => {
  const profile = await getOrCreateCareerProfile(userId);

  const skill = profile.skills.find(
    (s) => s._id?.toString() === skillIdentifier || s.name.toLowerCase() === skillIdentifier.toLowerCase()
  );

  if (!skill) {
    const err = new Error('Skill not found in career profile');
    err.statusCode = 404;
    throw err;
  }

  if (updateData.status) {
    const validStatuses = ['have', 'developing', 'toLearn'];
    if (!validStatuses.includes(updateData.status)) {
      const err = new Error(`Invalid skill status. Must be one of: ${validStatuses.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }
    skill.status = updateData.status;
  }

  if (updateData.name && updateData.name.trim()) {
    skill.name = updateData.name.trim();
  }

  if (updateData.proficiency !== undefined) {
    skill.proficiency = updateData.proficiency;
  }

  skill.updatedAt = new Date();
  await profile.save();
  return profile;
};

/**
 * Delete a skill from CareerProfile
 */
const deleteCareerSkill = async (userId, skillIdentifier) => {
  const profile = await getOrCreateCareerProfile(userId);

  const initialLength = profile.skills.length;
  profile.skills = profile.skills.filter(
    (s) => s._id?.toString() !== skillIdentifier && s.name.toLowerCase() !== skillIdentifier.toLowerCase()
  );

  if (profile.skills.length === initialLength) {
    const err = new Error('Skill not found in career profile');
    err.statusCode = 404;
    throw err;
  }

  await profile.save();
  return profile;
};

/**
 * Combined Complete Profile for one-stop loading of Profile Page
 */
const getCompleteProfile = async (userId) => {
  const [personalProfile, careerProfile, resume] = await Promise.all([
    getOrCreatePersonalProfile(userId),
    getOrCreateCareerProfile(userId),
    ResumeProfile.findOne({ userId }),
  ]);

  const resumeEligibleSkills = (careerProfile.skills || [])
    .filter((s) => s.status === 'have')
    .map((s) => s.name);

  const resumeSummary = resume
    ? {
        hasResume: true,
        professionalTitle: resume.personalInfo?.professionalTitle || '',
        summary: resume.personalInfo?.summary || '',
        educationCount: resume.education?.length || 0,
        experienceCount: resume.experience?.length || 0,
        projectsCount: resume.projects?.length || 0,
        skillsCount: (resume.skills || []).reduce((acc, cat) => acc + (cat.skills?.length || 0), 0),
        lastUpdated: resume.updatedAt,
      }
    : {
        hasResume: false,
        professionalTitle: '',
        summary: '',
        educationCount: 0,
        experienceCount: 0,
        projectsCount: 0,
        skillsCount: 0,
        lastUpdated: null,
      };

  return {
    personalProfile,
    careerProfile,
    resumeSummary,
    syncStatus: {
      isPersonalDataSynced: true,
      resumeEligibleSkillsCount: resumeEligibleSkills.length,
      developingSkillsCount: (careerProfile.skills || []).filter((s) => s.status === 'developing').length,
      toLearnSkillsCount: (careerProfile.skills || []).filter((s) => s.status === 'toLearn').length,
    },
  };
};

module.exports = {
  getOrCreatePersonalProfile,
  updatePersonalProfile,
  syncResumePersonalData,
  getOrCreateCareerProfile,
  updateCareerProfile,
  addCareerSkill,
  updateCareerSkill,
  deleteCareerSkill,
  getCompleteProfile,
};
