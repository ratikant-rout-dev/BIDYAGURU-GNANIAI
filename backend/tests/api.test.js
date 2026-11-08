require('dotenv').config();
const http = require('http');
const app = require('../src/app');
const connectDB = require('../src/config/db');
const mongoose = require('mongoose');

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('🧪 Starting Bidya Guru Production API Verification Suite');
  console.log('======================================================\n');

  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  const BASE_URL = 'http://localhost:5099';

  let accessToken = '';
  let testEmail = `test_student_${Date.now()}@bidyaguru.edu`;
  let roadmapItemId = '';

  const results = [];

  function record(testName, passed, details = '') {
    results.push({ testName, passed, details });
    if (passed) {
      console.log(`✅ [PASS] ${testName}`);
    } else {
      console.log(`❌ [FAIL] ${testName} - ${details}`);
    }
  }

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    record('Health Check API', healthRes.ok && healthData.status === 'ok');

    // 2. User Registration
    const regRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rohan Sharma',
        email: testEmail,
        password: 'Password@123',
        preferredLanguage: 'hi-IN',
      }),
    });
    const regData = await regRes.json();
    accessToken = regData.accessToken;
    record(
      'User Registration (Argon/Bcrypt + JWT)',
      regRes.ok && !!accessToken,
      regData.message
    );

    // 3. User Login
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password@123',
      }),
    });
    const loginData = await loginRes.json();
    if (loginData.accessToken) accessToken = loginData.accessToken;
    record('User Login & Token Issue', loginRes.ok && !!loginData.accessToken);

    // 4. Authenticated /me
    const meRes = await fetch(`${BASE_URL}/api/v1/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const meData = await meRes.json();
    record(
      'Protected Route /api/v1/me',
      meRes.ok && meData.user?.email === testEmail
    );

    // 5. Gemini Career Analysis
    console.log('🤖 Testing Gemini AI Career & Skill Analysis...');
    const careerRes = await fetch(`${BASE_URL}/api/v1/career/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        input: 'Mujhe Full Stack Developer banna hai. Mujhe HTML, CSS aur JavaScript aati hai.',
        language: 'hi-IN',
      }),
    });
    const careerData = await careerRes.json();
    record(
      'Gemini Career Goal & Skill Gap Detection',
      careerRes.ok && !!careerData.analysis?.careerGoal,
      `Detected Goal: ${careerData.analysis?.careerGoal}`
    );

    // 6. Gemini Roadmap Generation
    console.log('🗺️ Testing Gemini AI Roadmap Generation & MongoDB Persistence...');
    const roadmapRes = await fetch(`${BASE_URL}/api/v1/roadmaps/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        targetField: 'Web Development',
        careerGoal: 'Full Stack Developer',
        knownSkills: ['HTML', 'CSS', 'JavaScript'],
        developingSkills: ['React'],
        skillsToLearn: ['Node.js', 'Express', 'MongoDB'],
      }),
    });
    const roadmapData = await roadmapRes.json();
    const items = roadmapData.roadmap?.roadmapItems || [];
    if (items.length > 0) roadmapItemId = items[0]._id;
    record(
      'Gemini Personalized Career Roadmap Generation',
      roadmapRes.ok && items.length >= 3,
      `Items count: ${items.length}`
    );

    // 7. Roadmap Status Update
    if (roadmapItemId) {
      const updateRes = await fetch(
        `${BASE_URL}/api/v1/roadmaps/items/${roadmapItemId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ status: 'Completed' }),
        }
      );
      const updateData = await updateRes.json();
      record(
        'Roadmap Item Status Interactive Update',
        updateRes.ok && updateData.success
      );
    }

    // 8. Communication Practice with Gemini Evaluation
    console.log('🗣️ Testing Communication Practice & Gemini Feedback...');
    const commRes = await fetch(`${BASE_URL}/api/v1/communication/practice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        prompt: 'Tell me about yourself and your career goals.',
        transcript:
          'Hello, my name is Rohan. I am a college student learning modern web development. I love building full stack applications and my dream is to become a top software engineer.',
        language: 'en-IN',
      }),
    });
    const commData = await commRes.json();
    record(
      'Communication Practice & Gemini Feedback Analysis',
      commRes.ok && commData.practice?.feedback?.score > 0,
      `Score: ${commData.practice?.feedback?.score}%`
    );

    // 9. Gnani TTS Voice Synthesis
    console.log('🔊 Testing Gnani Vachana Speech Synthesis API...');
    const ttsRes = await fetch(`${BASE_URL}/api/v1/voice/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        text: 'Hello Rohan, welcome to Bidya Guru! I am your AI Career Mentor.',
        language: 'en-IN',
      }),
    });
    const ttsBlob = await ttsRes.arrayBuffer();
    record(
      'Gnani Vachana Voice Synthesis (TTS WAV Audio)',
      ttsRes.ok && ttsBlob.byteLength > 1000,
      `Audio Byte Length: ${ttsBlob.byteLength}`
    );

    // 10. Voice Chat End-to-End
    console.log('🎙️ Testing Complete Voice-to-Voice Mentorship Flow...');
    const chatRes = await fetch(`${BASE_URL}/api/v1/voice/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: 'What should I learn next after mastering JavaScript?',
        language: 'en-IN',
      }),
    });
    const chatData = await chatRes.json();
    record(
      'Voice-to-Voice Mentorship Pipeline (Gemini AI + Gnani Audio)',
      chatRes.ok && !!chatData.replyText && !!chatData.audioBase64,
      `AI Response length: ${chatData.replyText?.length} chars`
    );

    // 11. Progress Summary
    const progRes = await fetch(`${BASE_URL}/api/v1/progress/summary`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const progData = await progRes.json();
    record(
      'Progress Analytics & Dashboard Summary',
      progRes.ok && progData.summary?.roadmap?.totalSkills > 0
    );
  } catch (err) {
    console.error('Fatal test error:', err);
    record('Test Suite Execution', false, err.message);
  } finally {
    server.close();
    await mongoose.connection.close();
  }

  const passedCount = results.filter((r) => r.passed).length;
  console.log('\n======================================================');
  console.log(`📊 Test Suite Finished: ${passedCount} / ${results.length} PASSED`);
  console.log('======================================================\n');

  if (passedCount === results.length) {
    console.log('🎉 ALL PRODUCTION REQUIREMENTS VERIFIED!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTestSuite();

