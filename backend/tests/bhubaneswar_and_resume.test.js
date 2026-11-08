require('dotenv').config();
const jobService = require('../src/integrations/job/jobService');

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 Testing Bhubaneswar Location Search & Resume Parsing');
  console.log('======================================================\n');

  // Test 1: User types "frontend" and location "bhubneswar" (their exact typo/spelling)
  console.log('--- Test 1: Location "bhubneswar" with "frontend" ---');
  const allJobs = await jobService.fetchRawJobs('frontend');
  const studentSkills = ['HTML', 'CSS', 'JavaScript'];

  const matched = allJobs
    .map((j) => jobService.matchJobWithStudent(j, studentSkills))
    .filter((j) => {
      const qLower = 'frontend';
      const matchesQ =
        j.title.toLowerCase().includes(qLower) ||
        (j.company?.name && j.company.name.toLowerCase().includes(qLower)) ||
        j.requiredSkills.some((s) => s.toLowerCase().includes(qLower));

      const matchesLoc = jobService.matchesLocation(j, 'bhubneswar');
      return matchesQ && matchesLoc;
    });

  console.log(`Matched Frontend jobs in "bhubneswar": ${matched.length}`);
  matched.forEach((j, idx) => {
    console.log(` ${idx + 1}. [${j.matchPercentage}% Match] ${j.title} at ${j.company?.name} (${j.location})`);
    console.log(`    Matched Skills: ${j.matchingSkills.join(', ')} | Missing: ${j.missingSkills.join(', ')}`);
  });

  if (matched.length > 0) {
    console.log('✅ [PASS] Test 1: "bhubneswar" + "frontend" returns matching jobs in Bhubaneswar!');
  } else {
    console.error('❌ [FAIL] Test 1: No jobs returned for bhubneswar.');
    process.exit(1);
  }

  // Test 2: Resume parsing from PDF buffer
  console.log('\n--- Test 2: Binary PDF / Document Parsing ---');
  const dummyPdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 3 3]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n160\n%%EOF');
  const parsedPdf = await jobService.parseResumeBuffer(dummyPdf, 'rohan_sharma_resume.pdf', 'application/pdf');
  console.log('Parsed PDF result skills:', parsedPdf.extractedSkills);

  if (Array.isArray(parsedPdf.extractedSkills) && parsedPdf.extractedSkills.length > 0) {
    console.log('✅ [PASS] Test 2: PDF buffer parsing works and extracts technical skills!');
  } else {
    console.error('❌ [FAIL] Test 2: Failed to parse PDF buffer.');
    process.exit(1);
  }

  // Test 3: Location "bhubaneswar" (standard spelling)
  console.log('\n--- Test 3: Standard spelling "bhubaneswar" ---');
  const matchedStd = allJobs.filter((j) => jobService.matchesLocation(j, 'bhubaneswar'));
  console.log(`Jobs matched for "bhubaneswar": ${matchedStd.length}`);
  if (matchedStd.length >= matched.length) {
    console.log('✅ [PASS] Test 3: "bhubaneswar" matches Bhubaneswar IT Hub jobs!');
  } else {
    console.error('❌ [FAIL] Test 3 failed');
    process.exit(1);
  }

  console.log('\n======================================================');
  console.log('🎉 All Bhubaneswar Search & Resume Tests Passed!');
  console.log('======================================================\n');
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});

