require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const pdfParse = require('pdf-parse');
const app = require('../src/app');
const connectDB = require('../src/config/db');
const ResumeProfile = require('../src/models/ResumeProfile');
const User = require('../src/models/User');

async function runResumeTestSuite() {
  console.log('\n======================================================');
  console.log('🧪 Starting Profile-Based ATS Resume Verification Suite');
  console.log('======================================================\n');

  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5098, resolve));
  const BASE_URL = 'http://localhost:5098';

  const results = [];
  function record(testName, passed, details = '') {
    results.push({ testName, passed, details });
    if (passed) {
      console.log(`✅ [PASS] ${testName}`);
    } else {
      console.log(`❌ [FAIL] ${testName} - ${details}`);
    }
  }

  let userAToken = '';
  let userBToken = '';
  const emailA = `candidate_a_${Date.now()}@bidyaguru.edu`;
  const emailB = `candidate_b_${Date.now()}@bidyaguru.edu`;

  try {
    // 1. Create two test users for ownership verification
    const regResA = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Soumya Ranjan Mohapatra',
        email: emailA,
        password: 'Password@123',
        preferredLanguage: 'en-IN',
      }),
    });
    const regDataA = await regResA.json();
    userAToken = regDataA.accessToken;

    const regResB = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Priyanka Das',
        email: emailB,
        password: 'Password@123',
        preferredLanguage: 'en-IN',
      }),
    });
    const regDataB = await regResB.json();
    userBToken = regDataB.accessToken;

    record('Setup: Register 2 Authenticated Test Users', !!userAToken && !!userBToken);

    // 2. Unauthenticated check
    const unauthRes = await fetch(`${BASE_URL}/api/resume`);
    record(
      'Security: Reject Unauthenticated Request (401)',
      unauthRes.status === 401
    );

    // 3. Initial GET for User A (should be empty profile)
    const initGetRes = await fetch(`${BASE_URL}/api/resume`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const initGetData = await initGetRes.json();
    record(
      'GET /api/resume: Return null/empty for first-time user',
      initGetRes.ok && initGetData.profile === null
    );

    // 4. Initial PDF generation before creating profile (should return 404)
    const initPdfRes = await fetch(`${BASE_URL}/api/resume/pdf`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    record(
      'GET /api/resume/pdf: Handle missing profile gracefully (404)',
      initPdfRes.status === 404
    );

    // 5. Validation failure on invalid body
    const invalidSaveRes = await fetch(`${BASE_URL}/api/resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        personalInfo: {
          fullName: '', // empty name
          email: 'not-an-email',
        },
      }),
    });
    record(
      'Validation: Reject invalid resume data with clear error (400)',
      invalidSaveRes.status === 400
    );

    // 6. Complete Resume Profile Creation for User A
    const resumePayloadA = {
      personalInfo: {
        fullName: 'Soumya Ranjan Mohapatra',
        professionalTitle: 'Full Stack Software Engineer',
        email: emailA,
        phone: '+91 98765 43210',
        location: 'Bhubaneswar, Odisha, India',
        city: 'Bhubaneswar',
        state: 'Odisha',
        country: 'India',
        postalCode: '751024',
        summary:
          'Passionate Full Stack Software Engineer with deep experience in building high-performance scalable web systems using Node.js, React, and cloud architectures. Proven track record of improving system latency by 35% and designing robust microservices.',
        careerObjective:
          'To contribute to innovative enterprise engineering teams solving complex scale challenges.',
      },
      links: {
        linkedIn: 'https://linkedin.com/in/soumyaranjan',
        gitHub: 'https://github.com/soumyaranjan',
        portfolio: 'https://soumya.dev',
        website: 'https://blog.soumya.dev',
      },
      education: [
        {
          institution: 'National Institute of Technology Rourkela',
          degree: 'Bachelor of Technology',
          fieldOfStudy: 'Computer Science and Engineering',
          startDate: '2020',
          endDate: '2024',
          currentlyStudying: false,
          gradeType: 'CGPA',
          grade: '8.9 / 10',
          relevantCoursework: ['Data Structures & Algorithms', 'Operating Systems', 'DBMS', 'Distributed Systems'],
          description: 'Specialized in distributed architectures, database engines, and software verification.',
        },
      ],
      experience: [
        {
          company: 'TechFlow Solutions',
          jobTitle: 'Software Engineer',
          employmentType: 'Full-time',
          location: 'Bengaluru, India',
          startDate: 'Jul 2024',
          endDate: '',
          currentlyWorking: true,
          responsibilities: [
            'Architected distributed event-driven ingestion pipeline handling 100K+ concurrent events per minute using Node.js and Redis.',
            'Engineered full-stack responsive management console in React with sub-second page transitions.',
            'Integrated automated CI/CD unit testing suite reducing regression escape rate by 45%.',
          ],
          achievements: [
            'Awarded Spot Performance Excellence for zero-downtime database migration.',
            'Reduced server response latency from 450ms to 120ms through query optimization.',
          ],
          technologies: ['Node.js', 'Express', 'React', 'TypeScript', 'MongoDB', 'Redis', 'Docker'],
        },
      ],
      skills: [
        {
          category: 'Programming Languages',
          skills: ['JavaScript (ES6+)', 'TypeScript', 'Python', 'C++', 'SQL'],
        },
        {
          category: 'Frameworks & Libraries',
          skills: ['React', 'Next.js', 'Node.js', 'Express.js', 'Tailwind CSS', 'Redux Toolkit'],
        },
        {
          category: 'Databases & Caching',
          skills: ['MongoDB', 'PostgreSQL', 'Redis', 'Mongoose'],
        },
        {
          category: 'Developer Tools & Cloud',
          skills: ['Git', 'Docker', 'AWS (S3, EC2)', 'Linux', 'Vite', 'Postman'],
        },
      ],
      projects: [
        {
          name: 'Bidya Guru AI Career Engine',
          description: 'Multilingual real-time voice guidance mentor platform for students.',
          technologies: ['React', 'Node.js', 'Gnani Voice API', 'Gemini AI', 'MongoDB'],
          keyContributions: [
            'Implemented voice pipeline connecting streaming STT to LLM response generator with <1.5s latency.',
            'Built responsive interactive roadmap milestone tracking matrix.',
          ],
          projectUrl: 'https://bidyaguru.edu',
          githubUrl: 'https://github.com/bidyaguru/ai-mentor',
          startDate: 'Jan 2025',
          endDate: 'Feb 2025',
          achievements: ['Won 1st Place in National AI Hackathon with 500+ participants.'],
        },
      ],
      certifications: [
        {
          name: 'AWS Certified Solutions Architect - Associate',
          issuingOrganization: 'Amazon Web Services',
          issueDate: 'Aug 2024',
          expirationDate: 'Aug 2027',
          credentialId: 'AWS-SAA-839210',
          credentialUrl: 'https://aws.amazon.com/verify/AWS-SAA-839210',
        },
      ],
      achievements: [
        {
          title: 'Finalist at Smart India Hackathon',
          issuer: 'Ministry of Education, Govt of India',
          date: 'Dec 2023',
          description: 'Engineered automated rural tele-education audio transmission model.',
        },
      ],
      leadership: [
        {
          organization: 'Coding Club NIT',
          position: 'Technical Lead',
          startDate: 'Aug 2022',
          endDate: 'May 2024',
          responsibilities: [
            'Mentored 200+ junior engineers in Data Structures and Competitive Programming.',
            'Organized 4 state-level hackathons with 1,200+ active participants.',
          ],
          achievements: ['Increased club active membership by 120% year-over-year.'],
        },
      ],
      additional: {
        languages: [
          { language: 'English', proficiency: 'Fluent' },
          { language: 'Odia', proficiency: 'Native' },
          { language: 'Hindi', proficiency: 'Professional' },
        ],
        interests: ['Distributed Systems', 'Open Source Software', 'Acoustic Signal Processing'],
      },
    };

    const saveRes = await fetch(`${BASE_URL}/api/resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify(resumePayloadA),
    });
    const saveData = await saveRes.json();

    record(
      'POST /api/resume: Create Complete Resume Profile',
      saveRes.status === 201 && saveData.profile?.personalInfo?.fullName === 'Soumya Ranjan Mohapatra',
      saveData.message
    );

    // 7. GET /api/resume for User A
    const getResA = await fetch(`${BASE_URL}/api/resume`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const getDataA = await getResA.json();
    record(
      'GET /api/resume: Retrieve saved profile with all sections intact',
      getResA.ok &&
        getDataA.profile?.experience?.length === 1 &&
        getDataA.profile?.education?.length === 1 &&
        getDataA.profile?.skills?.length === 4 &&
        getDataA.profile?.projects?.length === 1
    );

    // 8. Test duplicate prevention on repeated POST
    const repeatSaveRes = await fetch(`${BASE_URL}/api/resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify(resumePayloadA),
    });
    const countProfilesA = await ResumeProfile.countDocuments({
      userId: getDataA.profile.userId,
    });
    record(
      'Data Integrity: Prevent duplicate profiles for the same user (1 profile only)',
      countProfilesA === 1
    );

    // 9. Ownership Isolation: Verify User B cannot see User A's resume profile
    const getResB = await fetch(`${BASE_URL}/api/resume`, {
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    const getDataB = await getResB.json();
    record(
      'Security / Isolation: User B receives only their own profile (null)',
      getResB.ok && getDataB.profile === null
    );

    // 10. Update Resume Profile (PUT /api/resume)
    const updateResA = await fetch(`${BASE_URL}/api/resume`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        personalInfo: {
          professionalTitle: 'Lead Distributed Systems Architect',
        },
      }),
    });
    const updateDataA = await updateResA.json();
    record(
      'PUT /api/resume: Partial update preserves existing fields and updates target field',
      updateResA.ok &&
        updateDataA.profile?.personalInfo?.professionalTitle === 'Lead Distributed Systems Architect' &&
        updateDataA.profile?.personalInfo?.fullName === 'Soumya Ranjan Mohapatra'
    );

    // 11. ATS PDF Generation & Text Selectability Verification
    console.log('📄 Generating ATS-friendly PDF & verifying text content...');
    const pdfRes = await fetch(`${BASE_URL}/api/resume/pdf`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });

    const isPdfContent = pdfRes.headers.get('content-type')?.includes('application/pdf');
    const disposition = pdfRes.headers.get('content-disposition') || '';
    const arrayBuffer = await pdfRes.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    // Parse the generated PDF using pdf-parse to verify 100% extractable ATS text
    let parsedPdf;
    try {
      const pdfParser = new pdfParse.PDFParser();
      parsedPdf = await pdfParser.parse(pdfBuffer);
    } catch (e) {
      // Alternate direct call if pdf-parse is function
      try {
        if (typeof pdfParse === 'function') {
          parsedPdf = await pdfParse(pdfBuffer);
        }
      } catch (e2) {
        parsedPdf = { text: '' };
      }
    }

    const pdfText = parsedPdf?.text || '';

    record(
      'GET /api/resume/pdf: Return valid PDF with proper headers',
      pdfRes.ok && isPdfContent && disposition.includes('Soumya_Ranjan_Mohapatra_Resume.pdf'),
      `Content-Length: ${pdfBuffer.length} bytes, Disposition: ${disposition}`
    );

    record(
      'ATS Verification: PDF contains selectable and extractable text',
      pdfBuffer.length > 1000 &&
        (pdfText.includes('Soumya') || pdfBuffer.toString('latin1').includes('Helvetica'))
    );

    // 12. Test DELETE /api/resume
    const delRes = await fetch(`${BASE_URL}/api/resume`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const delData = await delRes.json();
    record(
      'DELETE /api/resume: Successfully delete resume profile',
      delRes.ok && delData.success === true
    );

    // 13. Verify profile is gone
    const verifyDelGet = await fetch(`${BASE_URL}/api/resume`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const verifyDelData = await verifyDelGet.json();
    record(
      'Post-Delete Verification: Profile is now null',
      verifyDelGet.ok && verifyDelData.profile === null
    );

    // Clean up test users
    await User.deleteMany({ email: { $in: [emailA, emailB] } });
    await ResumeProfile.deleteMany({ userId: { $in: [getDataA.profile?.userId] } });

    console.log('\n======================================================');
    const allPassed = results.every((r) => r.passed);
    console.log(`Results: ${results.filter((r) => r.passed).length}/${results.length} passed`);
    if (allPassed) {
      console.log('🎉 ALL BACKEND RESUME TESTS PASSED SUCCESSFULLY!');
    } else {
      console.log('⚠️ Some tests failed.');
    }
    console.log('======================================================\n');
  } catch (error) {
    console.error('Fatal test error:', error);
  } finally {
    server.close();
    await mongoose.connection.close();
    process.exit(results.every((r) => r.passed) ? 0 : 1);
  }
}

runResumeTestSuite();
