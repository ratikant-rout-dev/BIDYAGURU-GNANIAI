const profileSyncService = require('../services/profileSyncService');

/**
 * Get authenticated user's Personal Profile
 * GET /api/profile
 */
const getPersonalProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const profile = await profileSyncService.getOrCreatePersonalProfile(userId);

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update authenticated user's Personal Profile (Category 1 sync)
 * PUT /api/profile
 */
const updatePersonalProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { fullName, email } = req.body;

    if (fullName !== undefined && !fullName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full name cannot be empty',
      });
    }

    if (email !== undefined && (!email.trim() || !/^\S+@\S+\.\S+$/.test(email))) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required',
      });
    }

    const profile = await profileSyncService.updatePersonalProfile(userId, req.body);

    res.json({
      success: true,
      message: 'Personal profile updated and synchronized successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unified complete profile data for Profile Page
 * GET /api/profile/complete
 */
const getCompleteProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const data = await profileSyncService.getCompleteProfile(userId);

    res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get authenticated user's Career Profile
 * GET /api/career-profile
 */
const getCareerProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const profile = await profileSyncService.getOrCreateCareerProfile(userId);

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update authenticated user's Career Profile
 * PUT /api/career-profile
 */
const updateCareerProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const profile = await profileSyncService.updateCareerProfile(userId, req.body);

    res.json({
      success: true,
      message: 'Career profile updated successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a skill to Career Profile with duplicate protection
 * POST /api/career-profile/skills
 */
const addCareerSkill = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, status, proficiency, source } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Skill name is required',
      });
    }

    const profile = await profileSyncService.addCareerSkill(userId, {
      name,
      status: status || 'have',
      proficiency: proficiency || '',
      source: source || 'user',
    });

    res.status(201).json({
      success: true,
      message: 'Skill added to career profile successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a skill in Career Profile (status or proficiency)
 * PUT /api/career-profile/skills/:skillId
 */
const updateCareerSkill = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { skillId } = req.params;

    const profile = await profileSyncService.updateCareerSkill(userId, skillId, req.body);

    res.json({
      success: true,
      message: 'Skill updated successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a skill from Career Profile
 * DELETE /api/career-profile/skills/:skillId
 */
const deleteCareerSkill = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { skillId } = req.params;

    const profile = await profileSyncService.deleteCareerSkill(userId, skillId);

    res.json({
      success: true,
      message: 'Skill removed from career profile successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPersonalProfile,
  updatePersonalProfile,
  getCompleteProfile,
  getCareerProfile,
  updateCareerProfile,
  addCareerSkill,
  updateCareerSkill,
  deleteCareerSkill,
};
