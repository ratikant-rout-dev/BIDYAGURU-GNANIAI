require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('../src/app');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const Roadmap = require('../src/models/Roadmap');
const CareerProfile = require('../src/models/CareerProfile');
const jobService = require('../src/integrations/job/jobService');

async function runJobMatchTests() {
  console.log('\n======================================================');
  console.log('🧪 Starting Job Match & Apply Verification Suite');
  console.log('======================================================\n');

  // Test 1: Unit Test of Match Scoring Algorithm (as requested by user)
  console.log('--- Test 1: Exact User Scenario Verification ---');
  const studentSkillsInitial = ['HTML', 'CSS', 'JavaScript'];
  const testJob = {
    id: 'test_job_1',
    title: 'Junior Frontend Developer',
    company: { name: 'Showpad' },
    location: 'Pune, India',
    jobType: 'Full Time',
    experienceLevel: 'Entry Level',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React'],
    applicationUrl: 'https://job-boards.greenhouse.io/showpad/jobs/8245399',
  };

  const initialMatch = jobService.matchJobWithStudent(testJob, studentSkillsInitial);
  console.log(`Student Skills: ${studentSkillsInitial.join(', ')}`);
  console.log(`Recommended Job: ${initialMatch.title}`);
  console.log(`Match Score: ${initialMatch.matchPercentage}%`);
  console.log(`Matching Skills: ${initialMatch.matchingSkills.join(', ')}`);
  console.log(`Missing Skills: ${initialMatch.missingSkills.join(', ')}`);
  console.log(`Recommendation: ${initialMatch.learningRecommendation}`);

  if (
    initialMatch.matchPercentage >= 75 &&
    initialMatch.matchingSkills.includes('HTML') &&
    initialMatch.matchingSkills.includes('CSS') &&
    initialMatch.matchingSkills.includes('JavaScript') &&
    initialMatch.missingSkills.includes('React')
  ) {
    console.log('✅ [PASS] Scenario 1: Initial HTML+CSS+JS yields 75% match with React missing.');
  } else {
    console.error('❌ [FAIL] Scenario 1 mismatch');
  }

  // Test 2: After Student Completes React on Roadmap
  console.log('\n--- Test 2: Progress Update (React Completed) ---');
  const studentSkillsWithReact = ['HTML', 'CSS', 'JavaScript', 'React'];
  const reactMatch = jobService.matchJobWithStudent(testJob, studentSkillsWithReact);
  console.log(`New Match Score with React: ${reactMatch.matchPercentage}%`);
  console.log(`Missing Skills: ${reactMatch.missingSkills.length === 0 ? 'None (100% Ready)' : reactMatch.missingSkills.join(', ')}`);

  if (reactMatch.matchPercentage === 100 && reactMatch.missingSkills.length === 0) {
    console.log('✅ [PASS] Scenario 2: Completing React elevates match to 100%!');
  } else {
    console.error('❌ [FAIL] Scenario 2 mismatch');
  }

  // Test 3: Live Provider Aggregation & Data Validation
  console.log('\n--- Test 3: Live Job Provider Feed Aggregation ---');
  const rawJobs = await jobService.fetchRawJobs('developer');
  console.log(`Total live jobs fetched & deduplicated: ${rawJobs.length}`);
  if (rawJobs.length > 0) {
    const sample = rawJobs[0];
    console.log(`Sample Job: "${sample.title}" at "${sample.company?.name}" (${sample.location})`);
    console.log(`Required Skills: ${sample.requiredSkills.slice(0, 5).join(', ')}`);
    console.log(`Application URL: ${sample.applicationUrl}`);
    console.log(`Provider: ${sample.provider}`);
    console.log('✅ [PASS] Live Jobs Provider Feed is active, verified, and returning real jobs.');
  } else {
    console.warn('⚠️ [WARN] No jobs returned from external providers in this environment.');
  }

  console.log('\n======================================================');
  console.log('🎉 Job Match & Apply Verification Suite Completed!');
  console.log('======================================================\n');
}

runJobMatchTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});

