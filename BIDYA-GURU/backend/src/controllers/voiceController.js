const gnaniService = require('../integrations/gnani/gnaniService');
const geminiService = require('../integrations/gemini/geminiService');
const CareerProfile = require('../models/CareerProfile');
const Roadmap = require('../models/Roadmap');

/**
 * Text-to-Speech endpoint (Gnani API)
 */
const synthesize = async (req, res, next) => {
  try {
    const { text, language, voice } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for speech synthesis.',
      });
    }

    const lang = language || req.user?.preferredLanguage || 'en-IN';
    const audioBuffer = await gnaniService.synthesizeSpeech(text, lang, voice);

    res.set({
      'Content-Type': 'audio/wav',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'no-cache',
    });

    res.send(audioBuffer);
  } catch (error) {
    console.error('[Voice Synthesize Error]', error.message);
    next(error);
  }
};

/**
 * Speech-to-Text endpoint (Gnani API)
 */
const transcribe = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'Audio file is required for transcription.',
      });
    }

    const language = req.body.language || req.user?.preferredLanguage || 'en-IN';
    const result = await gnaniService.transcribeAudio(
      req.file.buffer,
      req.file.originalname,
      language
    );

    res.json({
      success: true,
      transcript: result.transcript,
      raw: result.raw,
      gnaniSuccess: result.success,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper to infer domain/stream from career goal
 */
const inferFieldFromGoal = (goal = '') => {
  const g = (goal || '').toLowerCase();
  if (
    g.includes('commerce') ||
    g.includes('ca') ||
    g.includes('finance') ||
    g.includes('bank') ||
    g.includes('account') ||
    g.includes('b.com') ||
    g.includes('bcom')
  ) {
    return 'Commerce & Finance';
  }
  if (
    g.includes('art') ||
    g.includes('humanities') ||
    g.includes('upsc') ||
    g.includes('civil') ||
    g.includes('law') ||
    g.includes('journalism')
  ) {
    return 'Arts & Humanities';
  }
  if (
    g.includes('medical') ||
    g.includes('neet') ||
    g.includes('doctor') ||
    g.includes('biology') ||
    g.includes('health') ||
    g.includes('pharmacy')
  ) {
    return 'Medical & Healthcare';
  }
  if (
    g.includes('software') ||
    g.includes('developer') ||
    g.includes('web') ||
    g.includes('coding') ||
    g.includes('tech') ||
    g.includes('engineer')
  ) {
    return 'Software Development';
  }
  return 'General Career Development';
};

/**
 * Conversational Voice-to-Voice AI interaction:
 * Combines Gemini Intelligence + Gnani Voice Synthesis
 */
const conversationChat = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { message, language, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const lang = language || req.user.preferredLanguage || 'en-IN';
    let profile = (await CareerProfile.findOne({ userId })) || new CareerProfile({ userId });

    // 1. Get structured Gemini AI mentor response with guided follow-ups
    const mentorData = await geminiService.getVoiceCareerMentorResponse(
      message,
      history || [],
      profile,
      lang
    );

    const spokenText = mentorData.spokenReply || (typeof mentorData === 'string' ? mentorData : 'I am guiding you on your educational journey.');

    // 2. Synthesize with Gnani TTS
    let audioBase64 = null;
    try {
      const audioBuffer = await gnaniService.synthesizeSpeech(spokenText, lang);
      audioBase64 = `data:audio/wav;base64,${audioBuffer.toString('base64')}`;
    } catch (ttsError) {
      console.warn('[Gnani TTS Chat Warning]', ttsError.message);
    }

    // 3. Proactive Roadmap & Profile Update (Only when student has indicated a specific career/stream)
    let generatedRoadmap = null;
    let roadmapCreated = false;

    if (mentorData.shouldGenerateRoadmap && mentorData.detectedGoal) {
      const targetGoal = mentorData.detectedGoal;
      const targetField =
        mentorData.detectedField || inferFieldFromGoal(targetGoal) || 'General Career Development';

      profile.careerGoal = targetGoal;
      profile.targetField = targetField;

      if (mentorData.detectedSkills?.length > 0) {
        profile.knownSkills = Array.from(new Set([...profile.knownSkills, ...mentorData.detectedSkills]));
      }

      await profile.save();

      try {
        const roadmapData = await geminiService.generateCareerRoadmap(
          profile.targetField,
          profile.careerGoal,
          profile.knownSkills,
          profile.developingSkills,
          profile.skillsToLearn
        );

        const existing = await Roadmap.findOne({ userId }).sort({ createdAt: -1 });
        const version = existing ? existing.version + 1 : 1;

        generatedRoadmap = await Roadmap.create({
          userId,
          careerProfileId: profile._id,
          title: roadmapData.title || `Roadmap for ${targetGoal}`,
          targetGoal,
          roadmapItems: (roadmapData.roadmapItems || []).map((item, idx) => ({
            skill: item.skill,
            status: item.status || (idx === 0 ? 'In Progress' : 'Locked'),
            order: item.order || idx + 1,
            description: item.description || '',
            duration: item.duration || '1-2 weeks',
            keyTopics: item.keyTopics || [],
            resources: item.resources || [],
          })),
          version,
        });

        roadmapCreated = true;
      } catch (roadErr) {
        console.warn('[Roadmap Auto-Gen Warning]', roadErr.message);
      }
    }

    res.json({
      success: true,
      replyText: spokenText,
      audioBase64,
      followUpQuestions: mentorData.followUpQuestions || [],
      detectedGoal: mentorData.detectedGoal || null,
      roadmapGenerated: roadmapCreated,
      roadmap: generatedRoadmap,
      language: lang,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  synthesize,
  transcribe,
  conversationChat,
};

