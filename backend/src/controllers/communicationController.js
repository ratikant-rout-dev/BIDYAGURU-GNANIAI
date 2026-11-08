const CommunicationPractice = require('../models/CommunicationPractice');
const geminiService = require('../integrations/gemini/geminiService');
const gnaniService = require('../integrations/gnani/gnaniService');

const PROMPTS = [
  {
    id: 'intro',
    category: 'Interview Essentials',
    title: 'Self Introduction',
    question: 'Tell me about yourself, your educational background, and your career aspirations.',
    translations: {
      'hi-IN': 'कृपया अपने बारे में बताइए, आपकी पढ़ाई और आप किस क्षेत्र में अपना करियर बनाना चाहते हैं?',
      'or-IN': 'ନିଜ ବିଷୟରେ କୁହନ୍ତୁ, ଆପଣଙ୍କ ପାଠପଢା ଏବଂ ଆପଣ କେଉଁ କ୍ୟାରିଅର୍ ବାଛିବାକୁ ଚାହୁଁଛନ୍ତି?',
    },
  },
  {
    id: 'project',
    category: 'Technical Communication',
    title: 'Project Walkthrough',
    question: 'Describe an exciting technology project you built or want to build, and the challenges you tackled.',
    translations: {
      'hi-IN': 'किसी ऐसे प्रोजेक्ट के बारे में बताइए जिसे आपने बनाया है या बनाना चाहते हैं, और उसमें क्या चुनौतियाँ आईं?',
      'or-IN': 'ଗୋଟିଏ ପ୍ରୋଜେକ୍ଟ ବିଷୟରେ ବର୍ଣ୍ଣନା କରନ୍ତୁ ଯାହା ଆପଣ ତିଆରି କରିଛନ୍ତି ବା କରିବାକୁ ଚାହୁଁଛନ୍ତି?',
    },
  },
  {
    id: 'strength',
    category: 'Behavioral',
    title: 'Strengths & Growth Mindset',
    question: 'What is your greatest technical strength, and how do you handle learning completely new technologies under tight deadlines?',
    translations: {
      'hi-IN': 'आपकी सबसे बड़ी तकनीकी ताकत क्या है और नई तकनीक सीखने में आप क्या तरीका अपनाते हैं?',
      'or-IN': 'ଆପଣଙ୍କର ସବୁଠାରୁ ବଡ଼ ଶକ୍ତି କଣ ଏବଂ ନୂଆ ଜିନିଷ ଶିଖିବାରେ ଆପଣ କିପରି ଅଭ୍ୟାସ କରନ୍ତି?',
    },
  },
  {
    id: 'career_why',
    category: 'Motivation',
    title: 'Career Motivation',
    question: 'Why do you want to pursue your target career goal, and where do you see yourself in two years?',
    translations: {
      'hi-IN': 'आप इस करियर फील्ड को क्यों चुनना चाहते हैं, और अगले दो सालों में खुद को कहाँ देखते हैं?',
      'or-IN': 'ଆପଣ ଏହି କ୍ୟାରିୟର କାହିଁକି ବାଛିଲେ ଏବଂ ଆଗାମୀ ଦୁଇ ବର୍ଷରେ ନିଜକୁ କେଉଁଠି ଦେଖୁଛନ୍ତି?',
    },
  },
];

const getPrompts = async (req, res) => {
  res.json({
    success: true,
    prompts: PROMPTS,
  });
};

const submitPractice = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { prompt, transcript, language } = req.body;

    if (!prompt || !transcript) {
      return res.status(400).json({
        success: false,
        message: 'Prompt question and student transcript are required.',
      });
    }

    const preferredLanguage = language || req.user.preferredLanguage || 'en-IN';
    const feedback = await geminiService.evaluateCommunicationPractice(
      prompt,
      transcript,
      preferredLanguage
    );

    const practiceSession = await CommunicationPractice.create({
      userId,
      prompt,
      language: preferredLanguage,
      transcript,
      feedback: {
        score: feedback.score || 75,
        relevance: feedback.relevance || '',
        clarity: feedback.clarity || '',
        structure: feedback.structure || '',
        strengths: feedback.strengths || [],
        improvements: feedback.improvements || [],
        suggestions: feedback.suggestions || [],
      },
    });

    res.status(201).json({
      success: true,
      message: 'Practice evaluated successfully!',
      practice: practiceSession,
    });
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const history = await CommunicationPractice.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Interactive End-to-End Voice Communication Coaching Chat
 */
const conversationChat = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { message, language, history, activeTopic } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const lang = language || req.user.preferredLanguage || 'en-IN';

    // 1. Get coaching evaluation and conversational next prompt
    const coachingData = await geminiService.conductCommunicationCoaching(
      message,
      history || [],
      lang,
      activeTopic || null
    );

    const spokenText = coachingData.spokenReply;

    // 2. Synthesize with Gnani TTS voice
    let audioBase64 = null;
    try {
      const audioBuffer = await gnaniService.synthesizeSpeech(spokenText, lang);
      audioBase64 = `data:audio/wav;base64,${audioBuffer.toString('base64')}`;
    } catch (ttsErr) {
      console.warn('[Gnani Comm TTS Warning]', ttsErr.message);
    }

    // 3. If there is evaluated feedback and score, save practice history in MongoDB Atlas
    if (coachingData.feedback && coachingData.feedback.score) {
      try {
        await CommunicationPractice.create({
          userId,
          prompt: coachingData.activeTopic || activeTopic || 'Interactive Practice',
          language: lang,
          transcript: message,
          feedback: {
            score: coachingData.feedback.score || 80,
            relevance: 'Actively answered in practice conversation',
            clarity: coachingData.feedback.strength || '',
            structure: coachingData.feedback.improvement || '',
            strengths: [coachingData.feedback.strength].filter(Boolean),
            improvements: [coachingData.feedback.improvement].filter(Boolean),
            suggestions: [coachingData.feedback.suggestion].filter(Boolean),
            grammarCorrection: coachingData.grammarCorrection || { hasError: false },
          },
        });
      } catch (dbErr) {
        console.warn('[Practice Save Warning]', dbErr.message);
      }
    }

    res.json({
      success: true,
      replyText: spokenText,
      audioBase64,
      feedback: coachingData.feedback || null,
      grammarCorrection: coachingData.grammarCorrection || null,
      activeTopic: coachingData.activeTopic || activeTopic || null,
      suggestedChips: coachingData.suggestedChips || [],
      language: lang,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPrompts,
  submitPractice,
  getHistory,
  conversationChat,
};

