const geminiService = require('../src/integrations/gemini/geminiService');

async function testEducationDiscoveryFlow() {
  console.log('=== TEST 1: User says "I completed my 10th just before" ===');
  const user10th = 'I completed my 10th just before';
  const response1 = await geminiService.getVoiceCareerMentorResponse(user10th, [], {}, 'en-IN');
  
  console.log('Spoken Reply:\n', response1.spokenReply);
  console.log('Follow-up questions:\n', response1.followUpQuestions);
  console.log('Detected Goal:', response1.detectedGoal);
  console.log('Should Generate Roadmap:', response1.shouldGenerateRoadmap);

  // Assert that AI did NOT mention HTML/CSS or web dev
  const replyLower = response1.spokenReply.toLowerCase();
  if (replyLower.includes('html') || replyLower.includes('css') || replyLower.includes('web development')) {
    throw new Error('FAIL: AI inappropriately assumed HTML/CSS/Web Development for a 10th grade student!');
  }
  if (response1.shouldGenerateRoadmap === true) {
    throw new Error('FAIL: AI should not prematurely generate a roadmap before knowing the student stream interest!');
  }
  console.log('[PASS] Test 1: AI correctly initiated educational discovery without assuming coding!\n');

  console.log('=== TEST 2: User responds "mujhe commerce padhna he" ===');
  const userCommerce = 'mujhe commerce padhna he';
  const response2 = await geminiService.getVoiceCareerMentorResponse(
    userCommerce,
    [
      { role: 'student', text: user10th },
      { role: 'assistant', text: response1.spokenReply },
    ],
    {},
    'hi-IN'
  );

  console.log('Spoken Reply (Hindi):\n', response2.spokenReply);
  console.log('Follow-up questions:\n', response2.followUpQuestions);
  console.log('Detected Field:', response2.detectedField);
  console.log('Detected Goal:', response2.detectedGoal);
  console.log('Should Generate Roadmap:', response2.shouldGenerateRoadmap);

  if (!response2.shouldGenerateRoadmap) {
    throw new Error('FAIL: Expected shouldGenerateRoadmap to be true for chosen Commerce stream');
  }

  // Now test generating the Commerce roadmap
  console.log('\n--- Generating Commerce Career Roadmap ---');
  const commerceRoadmap = await geminiService.generateCareerRoadmap(
    response2.detectedField || 'Commerce & Finance',
    response2.detectedGoal || 'Commerce Professional',
    [],
    [],
    []
  );

  console.log('Commerce Roadmap Title:', commerceRoadmap.title);
  console.log('Milestones:');
  commerceRoadmap.roadmapItems.forEach((m) => {
    console.log(`  ${m.order}. ${m.skill} (${m.duration})`);
  });

  // Verify that Commerce roadmap has NO web development milestones
  const hasHtml = commerceRoadmap.roadmapItems.some((m) => m.skill.toLowerCase().includes('html'));
  if (hasHtml) {
    throw new Error('FAIL: Commerce roadmap contains HTML/CSS!');
  }
  console.log('[PASS] Test 2: Commerce stream and roadmap successfully verified!\n');

  console.log('=== TEST 3: User says "mujhe arts padhna hai aur upsc ki taiyari karni hai" ===');
  const userArts = 'mujhe arts padhna hai aur upsc ki taiyari karni hai';
  const response3 = await geminiService.getVoiceCareerMentorResponse(userArts, [], {}, 'hi-IN');
  console.log('Spoken Reply:\n', response3.spokenReply);
  console.log('Detected Field:', response3.detectedField);
  console.log('Detected Goal:', response3.detectedGoal);

  const artsRoadmap = await geminiService.generateCareerRoadmap(
    response3.detectedField || 'Arts & Humanities',
    response3.detectedGoal || 'Civil Services & Humanities',
    [],
    [],
    []
  );
  console.log('Arts Roadmap Title:', artsRoadmap.title);
  console.log('Milestones:');
  artsRoadmap.roadmapItems.forEach((m) => {
    console.log(`  ${m.order}. ${m.skill} (${m.duration})`);
  });

  const artsHasHtml = artsRoadmap.roadmapItems.some((m) => m.skill.toLowerCase().includes('html'));
  if (artsHasHtml) {
    throw new Error('FAIL: Arts roadmap contains HTML/CSS!');
  }
  console.log('[PASS] Test 3: Arts & Civil Services successfully verified!\n');
}

testEducationDiscoveryFlow()
  .then(() => {
    console.log('ALL STREAM DISCOVERY & ROADMAP TESTS PASSED! 🚀');
    process.exit(0);
  })
  .catch((err) => {
    console.error('TEST ERROR:', err.message);
    process.exit(1);
  });

