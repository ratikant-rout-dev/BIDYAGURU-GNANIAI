const CareerProfile = require('../models/CareerProfile');
const geminiService = require('../integrations/gemini/geminiService');
const profileSyncService = require('../services/profileSyncService');

const analyzeCareer = async (req, res, next) => {
  try {
    const { input, language } = req.body;
    const userId = req.user._id;

    if (!input || !input.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Student input is required for career analysis.',
      });
    }

    const preferredLanguage = language || req.user.preferredLanguage || 'en-IN';
    const analysis = await geminiService.analyzeCareerAndSkills(input, preferredLanguage);

    let profile = await profileSyncService.getOrCreateCareerProfile(userId);

    if (analysis.targetField) profile.targetField = analysis.targetField;
    if (analysis.careerGoal) profile.careerGoal = analysis.careerGoal;
    if (analysis.knownSkills?.length) {
      profile.knownSkills = Array.from(new Set([...profile.knownSkills, ...analysis.knownSkills]));
    }
    if (analysis.developingSkills?.length) {
      profile.developingSkills = Array.from(new Set([...profile.developingSkills, ...analysis.developingSkills]));
    }
    if (analysis.skillsToLearn?.length) {
      profile.skillsToLearn = Array.from(new Set([...profile.skillsToLearn, ...analysis.skillsToLearn]));
    }
    profile.languagePreference = preferredLanguage;
    profile.summary = analysis.aiReply;

    await profile.save();

    res.json({
      success: true,
      analysis,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
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

const updateProfile = async (req, res, next) => {
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

module.exports = {
  analyzeCareer,
  getProfile,
  updateProfile,
};

