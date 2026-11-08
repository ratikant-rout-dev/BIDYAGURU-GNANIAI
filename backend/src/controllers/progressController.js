const Roadmap = require('../models/Roadmap');
const CareerProfile = require('../models/CareerProfile');
const CommunicationPractice = require('../models/CommunicationPractice');

const getSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [profile, roadmap, practices] = await Promise.all([
      CareerProfile.findOne({ userId }),
      Roadmap.findOne({ userId }).sort({ createdAt: -1 }),
      CommunicationPractice.find({ userId }).sort({ createdAt: -1 }).limit(10),
    ]);

    // Roadmap calculations
    const roadmapItems = roadmap?.roadmapItems || [];
    const totalSkills = roadmapItems.length;
    const completedSkills = roadmapItems.filter((i) => i.status === 'Completed').length;
    const inProgressSkills = roadmapItems.filter((i) => i.status === 'In Progress').length;
    const lockedSkills = roadmapItems.filter((i) => i.status === 'Locked').length;
    const roadmapPercent = totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;

    // Communication calculations
    const practiceCount = practices.length;
    const avgScore =
      practiceCount > 0
        ? Math.round(
            practices.reduce((acc, p) => acc + (p.feedback?.score || 70), 0) /
              practiceCount
          )
        : 0;

    // Recent activity list
    const activities = [];
    if (roadmap) {
      activities.push({
        type: 'roadmap',
        title: `Roadmap "${roadmap.title}" active`,
        timestamp: roadmap.updatedAt,
      });
    }
    practices.slice(0, 3).forEach((p) => {
      activities.push({
        type: 'communication',
        title: `Practiced: "${p.prompt.slice(0, 35)}..." - Score: ${p.feedback?.score || 75}%`,
        timestamp: p.createdAt,
      });
    });

    res.json({
      success: true,
      summary: {
        careerGoal: profile?.careerGoal || 'Not Set Yet',
        targetField: profile?.targetField || 'Exploring',
        knownSkillsCount: profile?.knownSkills?.length || 0,
        developingSkillsCount: profile?.developingSkills?.length || 0,
        skillsToLearnCount: profile?.skillsToLearn?.length || 0,
        roadmap: {
          hasRoadmap: !!roadmap,
          title: roadmap?.title || null,
          totalSkills,
          completedSkills,
          inProgressSkills,
          lockedSkills,
          percentage: roadmapPercent,
        },
        communication: {
          totalSessions: practiceCount,
          averageScore: avgScore,
          latestScore: practices[0]?.feedback?.score || null,
        },
        recentActivities: activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
};

