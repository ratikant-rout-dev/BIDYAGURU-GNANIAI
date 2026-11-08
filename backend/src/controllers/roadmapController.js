const Roadmap = require('../models/Roadmap');
const CareerProfile = require('../models/CareerProfile');
const geminiService = require('../integrations/gemini/geminiService');

const generateRoadmap = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let profile = await CareerProfile.findOne({ userId });

    const targetField = req.body.targetField || profile?.targetField || 'Software Development';
    const careerGoal = req.body.careerGoal || profile?.careerGoal || 'Full Stack Developer';
    const knownSkills = req.body.knownSkills || profile?.knownSkills || [];
    const developingSkills = req.body.developingSkills || profile?.developingSkills || [];
    const skillsToLearn = req.body.skillsToLearn || profile?.skillsToLearn || [];

    const generated = await geminiService.generateCareerRoadmap(
      targetField,
      careerGoal,
      knownSkills,
      developingSkills,
      skillsToLearn
    );

    // Find existing roadmap or increment version
    const existing = await Roadmap.findOne({ userId }).sort({ createdAt: -1 });
    const version = existing ? existing.version + 1 : 1;

    const roadmap = await Roadmap.create({
      userId,
      careerProfileId: profile?._id,
      title: generated.title || `Roadmap for ${careerGoal}`,
      targetGoal: careerGoal,
      roadmapItems: (generated.roadmapItems || []).map((item, index) => ({
        skill: item.skill,
        status: item.status || (index === 0 ? 'In Progress' : 'Locked'),
        order: item.order || index + 1,
        description: item.description || '',
        duration: item.duration || '1-2 weeks',
        keyTopics: item.keyTopics || [],
        resources: item.resources || [],
      })),
      version,
    });

    res.status(201).json({
      success: true,
      message: 'Personalized career roadmap generated!',
      roadmap,
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentRoadmap = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let roadmap = await Roadmap.findOne({ userId }).sort({ createdAt: -1 });

    if (!roadmap) {
      return res.json({
        success: true,
        roadmap: null,
        message: 'No roadmap generated yet. Generate your personalized roadmap to get started.',
      });
    }

    res.json({
      success: true,
      roadmap,
    });
  } catch (error) {
    next(error);
  }
};

const updateRoadmapItemStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    const { status } = req.body;

    if (!['Locked', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'Locked', 'In Progress', or 'Completed'",
      });
    }

    const roadmap = await Roadmap.findOne({ userId }).sort({ createdAt: -1 });
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found',
      });
    }

    const itemIndex = roadmap.roadmapItems.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap item not found',
      });
    }

    roadmap.roadmapItems[itemIndex].status = status;

    // If an item is completed and the next item is locked, automatically suggest unlocking it
    if (status === 'Completed' && itemIndex + 1 < roadmap.roadmapItems.length) {
      if (roadmap.roadmapItems[itemIndex + 1].status === 'Locked') {
        roadmap.roadmapItems[itemIndex + 1].status = 'In Progress';
      }
    }

    await roadmap.save();

    res.json({
      success: true,
      message: 'Roadmap item updated successfully',
      roadmap,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateRoadmap,
  getCurrentRoadmap,
  updateRoadmapItemStatus,
};

