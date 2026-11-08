require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('../src/app');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const PersonalProfile = require('../src/models/PersonalProfile');
const CareerProfile = require('../src/models/CareerProfile');
const ResumeProfile = require('../src/models/ResumeProfile');
const careerContextService = require('../src/services/careerContextService');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 Starting Unified Profile & Data Sync Verification Suite');
  console.log('======================================================\n');

  await connectDB();

  const PORT = 5099;
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  const BASE_URL = `http://localhost:${PORT}`;

  let userAToken = '';
  let userBToken = '';
  let userAId = '';
  let userBId = '';

  try {
    const timestamp = Date.now();
    const userAEmail = `profile_sync_a_${timestamp}@example.com`;
    const userBEmail = `profile_sync_b_${timestamp}@example.com`;

    // 1. Setup Test Users
    const regARes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Aarav Sharma',
        email: userAEmail,
        password: 'Password123!',
        preferredLanguage: 'en-IN',
      }),
    });
    const regAData = await regARes.json();
    userAToken = regAData.accessToken;
    userAId = regAData.user.id || regAData.user._id;

    const regBRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Neha Patel',
        email: userBEmail,
        password: 'Password123!',
        preferredLanguage: 'hi-IN',
      }),
    });
    const regBData = await regBRes.json();
    userBToken = regBData.accessToken;
    userBId = regBData.user.id || regBData.user._id;

    assert(regARes.status === 201 && regBRes.status === 201, 'Setup: Created 2 authenticated test users');

    // 2. Security & Authentication Checks
    const unauthRes = await fetch(`${BASE_URL}/api/profile`);
    assert(unauthRes.status === 401, 'Security: Reject unauthenticated GET /api/profile with 401');

    const unauthCareerRes = await fetch(`${BASE_URL}/api/career-profile`);
    assert(unauthCareerRes.status === 401, 'Security: Reject unauthenticated GET /api/career-profile with 401');

    // 3. Initial Personal Profile Auto-Initialization
    const initProfileRes = await fetch(`${BASE_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const initData = await initProfileRes.json();
    assert(initProfileRes.status === 200, 'GET /api/profile auto-initializes for authenticated user');
    assert(initData.profile.fullName === 'Aarav Sharma', 'PersonalProfile initialized with user name');
    assert(initData.profile.email === userAEmail, 'PersonalProfile initialized with user email');

    // 4. Update Personal Profile (Category 1 Fields)
    const updatePersonalRes = await fetch(`${BASE_URL}/api/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        fullName: 'Aarav K. Sharma',
        phone: '+91 98765 43210',
        city: 'Bhubaneswar',
        state: 'Odisha',
        country: 'India',
        postalCode: '751024',
        links: {
          linkedIn: 'https://linkedin.com/in/aaravsharma',
          gitHub: 'https://github.com/aaravsharma',
          portfolio: 'https://aarav.dev',
          website: 'https://aaravsharma.in',
        },
      }),
    });
    const updateData = await updatePersonalRes.json();
    assert(updatePersonalRes.status === 200, 'PUT /api/profile updates personal details and links');
    assert(updateData.profile.fullName === 'Aarav K. Sharma', 'Full name updated');
    assert(updateData.profile.city === 'Bhubaneswar', 'City updated');
    assert(updateData.profile.links.linkedIn === 'https://linkedin.com/in/aaravsharma', 'LinkedIn updated');

    // 5. Automatic Category 1 Synchronization to Resume Profile
    // First, create a resume profile for User A
    const createResumeRes = await fetch(`${BASE_URL}/api/resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        personalInfo: {
          fullName: 'Aarav K. Sharma',
          email: userAEmail,
          professionalTitle: 'Full Stack Cloud Developer',
          summary: 'Experienced developer building distributed systems.',
        },
        education: [
          {
            institution: 'IIT Bhubaneswar',
            degree: 'B.Tech',
            fieldOfStudy: 'Computer Science',
            startDate: '2020',
            endDate: '2024',
          },
        ],
        skills: [
          {
            category: 'Languages',
            skills: ['JavaScript', 'TypeScript', 'Python'],
          },
        ],
      }),
    });
    assert(createResumeRes.status === 201, 'POST /api/resume creates resume profile');

    // Verify GET /api/resume returns the synchronized personal info and links
    const getResumeRes = await fetch(`${BASE_URL}/api/resume`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const getResumeData = await getResumeRes.json();
    assert(getResumeRes.status === 200, 'GET /api/resume retrieves resume');
    assert(getResumeData.profile.personalInfo.phone === '+91 98765 43210', 'Resume automatically synchronized phone number from PersonalProfile');
    assert(getResumeData.profile.personalInfo.city === 'Bhubaneswar', 'Resume automatically synchronized city from PersonalProfile');
    assert(getResumeData.profile.links.linkedIn === 'https://linkedin.com/in/aaravsharma', 'Resume automatically synchronized LinkedIn link');

    // Update PersonalProfile again and verify Resume reflects it automatically without direct resume edit
    await fetch(`${BASE_URL}/api/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        city: 'Bengaluru',
        state: 'Karnataka',
      }),
    });
    const getResumeAfterSync = await fetch(`${BASE_URL}/api/resume`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const syncResumeData = await getResumeAfterSync.json();
    assert(syncResumeData.profile.personalInfo.city === 'Bengaluru', 'Category 1 Sync: Updating PersonalProfile automatically reflects in ResumeProfile');

    // 6. User Isolation Test
    const userBProfileRes = await fetch(`${BASE_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    const userBData = await userBProfileRes.json();
    assert(userBProfileRes.status === 200, 'User B can retrieve own profile');
    assert(userBData.profile.fullName === 'Neha Patel', 'User B receives only their own name');
    assert(userBData.profile.city === '', 'User B does NOT see User A city (proper tenant isolation)');

    // 7. Career Profile & Skills Matrix (Category 2 Controlled Sync)
    const updateCareerRes = await fetch(`${BASE_URL}/api/career-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        targetField: 'Cloud & Distributed Systems',
        careerGoal: 'Senior Cloud Solutions Architect',
        targetCompanies: ['Google', 'Microsoft', 'AWS'],
        experienceLevel: 'Entry Level / Student',
        careerPreferences: {
          workMode: 'Remote',
          preferredEmploymentTypes: ['Full-time'],
          preferredLocations: ['Bengaluru', 'Remote'],
        },
      }),
    });
    const careerUpdateData = await updateCareerRes.json();
    assert(updateCareerRes.status === 200, 'PUT /api/career-profile updates career direction and preferences');
    assert(careerUpdateData.profile.targetField === 'Cloud & Distributed Systems', 'Target field updated');
    assert(careerUpdateData.profile.careerPreferences.workMode === 'Remote', 'Work mode preference updated');

    // Add skills with 3 distinct categories: Have, Developing, ToLearn
    const addSkillHave = await fetch(`${BASE_URL}/api/career-profile/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({ name: 'Node.js', status: 'have', proficiency: 'Advanced' }),
    });
    assert(addSkillHave.status === 201, 'POST /api/career-profile/skills adds "have" (confirmed) skill');

    const addSkillDev = await fetch(`${BASE_URL}/api/career-profile/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({ name: 'Docker', status: 'developing', proficiency: 'Intermediate' }),
    });
    assert(addSkillDev.status === 201, 'POST /api/career-profile/skills adds "developing" skill');

    const addSkillLearn = await fetch(`${BASE_URL}/api/career-profile/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({ name: 'Kubernetes', status: 'toLearn', proficiency: 'Beginner' }),
    });
    assert(addSkillLearn.status === 201, 'POST /api/career-profile/skills adds "toLearn" skill');

    // Duplicate Prevention Check
    const addDuplicate = await fetch(`${BASE_URL}/api/career-profile/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({ name: 'docker', status: 'have' }),
    });
    assert(addDuplicate.status === 409, 'Data Integrity: Rejects duplicate skill addition across statuses (409)');

    // Verify backward compatibility sync with legacy arrays
    const getCareerRes = await fetch(`${BASE_URL}/api/career-profile`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const careerData = await getCareerRes.json();
    assert(careerData.profile.knownSkills.includes('Node.js'), 'Backward compatibility: "have" skills synced to knownSkills');
    assert(careerData.profile.developingSkills.includes('Docker'), 'Backward compatibility: "developing" skills synced to developingSkills');
    assert(careerData.profile.skillsToLearn.includes('Kubernetes'), 'Backward compatibility: "toLearn" skills synced to skillsToLearn');

    // Update Skill Status (Promotion from developing -> have)
    const dockerSkill = careerData.profile.skills.find((s) => s.name === 'Docker');
    const updateSkillRes = await fetch(`${BASE_URL}/api/career-profile/skills/${dockerSkill._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({ status: 'have', proficiency: 'Advanced' }),
    });
    const updatedCareerSkillData = await updateSkillRes.json();
    assert(updateSkillRes.status === 200, 'PUT /api/career-profile/skills/:skillId updates skill status');
    assert(updatedCareerSkillData.profile.knownSkills.includes('Docker'), 'Promoted Docker to confirmed "have" skill');
    assert(!updatedCareerSkillData.profile.developingSkills.includes('Docker'), 'Docker removed from developingSkills after promotion');

    // Delete Skill
    const deleteSkillRes = await fetch(`${BASE_URL}/api/career-profile/skills/${dockerSkill._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const deletedSkillData = await deleteSkillRes.json();
    assert(deleteSkillRes.status === 200, 'DELETE /api/career-profile/skills/:skillId removes skill');
    assert(!deletedSkillData.profile.skills.some((s) => s.name === 'Docker'), 'Docker removed from skills');

    // 8. Combined Complete Profile API
    const completeRes = await fetch(`${BASE_URL}/api/profile/complete`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const completeData = await completeRes.json();
    assert(completeRes.status === 200, 'GET /api/profile/complete returns unified complete data');
    assert(Boolean(completeData.personalProfile), 'Complete response contains personalProfile');
    assert(Boolean(completeData.careerProfile), 'Complete response contains careerProfile');
    assert(completeData.resumeSummary.hasResume === true, 'Complete response contains resumeSummary');
    assert(completeData.syncStatus.isPersonalDataSynced === true, 'Complete response contains syncStatus');

    // 9. AI Context Builder & Controlled Modification Verification
    const aiContextRoadmap = await careerContextService.buildAiContext(userAId, careerContextService.AI_TASK_TYPES.CAREER_ROADMAP);
    assert(aiContextRoadmap.studentName === 'Aarav K. Sharma', 'AI Context Builder: Contains student name');
    assert(aiContextRoadmap.confirmedSkills.includes('Node.js'), 'AI Context: Contains confirmed skills');
    assert(aiContextRoadmap.skillsToLearn.includes('Kubernetes'), 'AI Context: Contains future learning goals');
    assert(!aiContextRoadmap.confirmedSkills.includes('Kubernetes'), 'Category 2 AI Rule: To-learn skills are NEVER treated as confirmed skills');

    // AI Controlled Suggestions (Project / Qualifications require confirmation)
    const aiProjectSuggestion = await careerContextService.handleAiSuggestedUpdate(userAId, 'suggest_resume_project', {
      name: 'Distributed Microservices Gateway',
      description: 'High-throughput reverse proxy with rate limiting in Go',
      technologies: ['Go', 'Redis', 'gRPC'],
    });
    assert(aiProjectSuggestion.requiresUserConfirmation === true, 'Security: AI cannot write directly to resume without user confirmation');
    assert(aiProjectSuggestion.proposal.name === 'Distributed Microservices Gateway', 'AI prepared structured proposal for user review');

    console.log('\n======================================================');
    console.log(`Unified Profile Test Results: ${passedTests}/${totalTests} Passed`);
    if (passedTests === totalTests) {
      console.log('🎉 ALL UNIFIED PROFILE & DATA SYNCHRONIZATION TESTS PASSED!');
    } else {
      console.error('❌ SOME TESTS FAILED');
    }
    console.log('======================================================\n');
  } catch (err) {
    console.error('Fatal Test Error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runTests();
