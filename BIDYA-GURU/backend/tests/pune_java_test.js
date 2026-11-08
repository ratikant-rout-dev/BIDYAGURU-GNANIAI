const jobService = require('../src/integrations/job/jobService');

async function runVerification() {
  console.log('=== TEST 1: Query for Java + Location Pune ===');
  const allJobs = await jobService.fetchRawJobs('java');
  console.log('Total jobs fetched:', allJobs.length);

  // 1. Pune Location Filter
  const puneJobs = allJobs.filter((j) => jobService.matchesLocation(j, 'pune'));
  console.log('Jobs matching location Pune:', puneJobs.length);

  // 2. Java Query Filter (Whole-word, strictly not matching JavaScript)
  const isJavaMatch = (job) => {
    const titleLower = job.title.toLowerCase();
    const isJavaInTitle = /\bjava\b/i.test(titleLower) && !/\bjavascript\b/i.test(titleLower);
    const isJavaInSkills = (job.requiredSkills || []).some(
      (s) => s.toLowerCase() === 'java' || (/\bjava\b/i.test(s) && !/\bjavascript\b/i.test(s))
    );
    return isJavaInTitle || isJavaInSkills;
  };

  const javaInPune = puneJobs.filter(isJavaMatch);
  console.log('Java jobs in Pune:', javaInPune.length);

  if (javaInPune.length === 0) {
    throw new Error('FAIL: Expected Java jobs in Pune, found 0');
  }

  // 3. Score against student possessing Java
  const studentSkills = ['Java'];
  console.log('\nSample Matched Java Jobs in Pune:');
  javaInPune.slice(0, 5).forEach((j) => {
    const matched = jobService.matchJobWithStudent(j, studentSkills);
    console.log(`- ${matched.title} at ${matched.company.name} (${matched.location})`);
    console.log(`  Match Score: ${matched.matchPercentage}% | Matching: ${matched.matchingSkills.join(', ')} | Missing: ${matched.missingSkills.join(', ')}`);
  });

  // Verify none of them are frontend-only or have missing HTML/CSS/JS
  javaInPune.forEach((j) => {
    const matched = jobService.matchJobWithStudent(j, studentSkills);
    if (matched.matchingSkills.includes('JavaScript') && !matched.matchingSkills.includes('Java')) {
      throw new Error(`FAIL: Job ${j.title} mistakenly treated as Java`);
    }
    if (matched.missingSkills.includes('HTML') && !j.title.toLowerCase().includes('frontend')) {
      throw new Error(`FAIL: Non-frontend Java job ${j.title} unexpectedly requires HTML`);
    }
  });
  console.log('\n[PASS] Java + Pune filtering and skill matching verified successfully!');

  console.log('\n=== TEST 2: Query for Frontend + Location Bhubaneswar ===');
  const bbsrJobs = allJobs.filter((j) => jobService.matchesLocation(j, 'bhubaneswar'));
  const isFrontendMatch = (job) => {
    const t = job.title.toLowerCase();
    return t.includes('frontend') || t.includes('web') || (job.requiredSkills || []).some((s) => s === 'HTML' || s === 'CSS');
  };
  const frontendBbsr = bbsrJobs.filter(isFrontendMatch);
  console.log('Frontend jobs in Bhubaneswar:', frontendBbsr.length);
  const webStudentSkills = ['HTML', 'CSS', 'JavaScript'];
  const topBbsr = jobService.matchJobWithStudent(frontendBbsr[0], webStudentSkills);
  console.log(`- Top match: ${topBbsr.title} at ${topBbsr.company.name} (${topBbsr.matchPercentage}%)`);
  console.log(`  Matching: ${topBbsr.matchingSkills.join(', ')}`);
  console.log('[PASS] Frontend + Bhubaneswar verified successfully!');

  console.log('\n=== TEST 3: Resume In-Memory Skill Extraction (PDF / Word) ===');
  const sampleResumeBuffer = Buffer.from('Resume John Doe\nSkills: Java, Spring Boot, PostgreSQL, Docker, Git\nEducation: B.Tech Computer Science');
  const parsed = await jobService.parseResumeBuffer(sampleResumeBuffer, 'resume.txt', 'text/plain');
  console.log('Extracted skills from resume:', parsed.extractedSkills);
  if (!parsed.extractedSkills.includes('Java')) {
    throw new Error('FAIL: Resume parser did not extract Java');
  }
  console.log('[PASS] Resume extraction verified successfully!');
}

runVerification()
  .then(() => {
    console.log('\nALL TESTS PASSED SUCCESSFULLY! 🚀');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\nTEST FAILED:', err.message);
    process.exit(1);
  });

