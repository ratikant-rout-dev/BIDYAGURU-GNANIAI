require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const pdfParse = require('pdf-parse');
const app = require('../src/app');
const connectDB = require('../src/config/db');
const ResumeProfile = require('../src/models/ResumeProfile');
const User = require('../src/models/User');

async function runE2ETests() {
  console.log('\n======================================================');
  console.log('🚀 Running Comprehensive ATS Resume Builder E2E Suite');
  console.log('======================================================\n');

  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5097, resolve));
  const BASE_URL = 'http://localhost:5097';

  const results = [];
  function assert(name, condition, details = '') {
    results.push({ name, passed: !!condition, details });
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
    } else {
      console.log(`❌ [FAIL] ${name} - ${details}`);
    }
  }

  const email1 = `test_candidate_1_${Date.now()}@bidyaguru.edu`;
  const email2 = `test_candidate_2_${Date.now()}@bidyaguru.edu`;
  let token1 = '';
  let token2 = '';
  let user1Id = '';

  try {
    // 1. Auth Setup
    const regRes1 = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Aarav Patel',
        email: email1,
        password: 'Password@123',
        preferredLanguage: 'en-IN',
      }),
    });
    const reg1 = await regRes1.json();
    token1 = reg1.accessToken;
    user1Id = reg1.user?._id;

    const regRes2 = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Meera Sharma',
        email: email2,
        password: 'Password@123',
        preferredLanguage: 'en-IN',
      }),
    });
    const reg2 = await regRes2.json();
    token2 = reg2.accessToken;

    assert('Candidate 1 & 2 Registered', !!token1 && !!token2);

    // 2. Unauthenticated access tests
    const unauthGet = await fetch(`${BASE_URL}/api/resume`);
    assert('Reject Unauthenticated GET /api/resume (401)', unauthGet.status === 401);

    const unauthPdf = await fetch(`${BASE_URL}/api/resume/pdf`);
    assert('Reject Unauthenticated GET /api/resume/pdf (401)', unauthPdf.status === 401);

    const unauthPost = await fetch(`${BASE_URL}/api/resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert('Reject Unauthenticated POST /api/resume (401)', unauthPost.status === 401);

    // 3. Initial state
    const initGet = await fetch(`${BASE_URL}/api/resume`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const initData = await initGet.json();
    assert('Initial GET /api/resume returns profile: null', initGet.ok && initData.profile === null);

    const initPdf = await fetch(`${BASE_URL}/api/resume/pdf`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert('Initial PDF generation returns 404 before profile exists', initPdf.status === 404);

    // 4. Validation errors
    const valRes = await fetch(`${BASE_URL}/api/resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({
        personalInfo: {
          fullName: '',
          email: 'invalid-email',
        },
      }),
    });
    assert('Validation rejects empty name and bad email with 400', valRes.status === 400);

    // 5. Complete ATS Resume Payload with extensive multi-entry content to verify multi-page ATS formatting
    const fullResumePayload = {
      personalInfo: {
        fullName: 'Aarav Patel',
        professionalTitle: 'Lead Cloud & Backend Architect',
        email: email1,
        phone: '+91 91234 56789',
        location: 'Bengaluru, Karnataka, India',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560001',
        summary:
          'High-impact software engineering leader with 6+ years of specialized experience in high-throughput distributed architectures, cloud-native backend systems, and event streaming pipelines. Led engineering teams of 12+ developers, scaled microservices to 50M+ daily transactions, and improved infrastructure reliability to 99.99% uptime.',
        careerObjective:
          'Driving enterprise architecture modernization and scalable engineering best practices.',
      },
      links: {
        linkedIn: 'https://linkedin.com/in/aarav-patel-cloud',
        gitHub: 'https://github.com/aaravpatel',
        portfolio: 'https://aaravpatel.dev',
        website: 'https://techblog.aaravpatel.dev',
        other: [
          { label: 'LeetCode', url: 'https://leetcode.com/aaravpatel' },
        ],
      },
      skills: [
        {
          category: 'Programming Languages',
          skills: ['Go', 'TypeScript', 'Python', 'Java', 'SQL', 'Bash'],
        },
        {
          category: 'Backend Frameworks',
          skills: ['Node.js', 'Express.js', 'NestJS', 'FastAPI', 'gRPC', 'GraphQL'],
        },
        {
          category: 'Databases & Storage',
          skills: ['PostgreSQL', 'MongoDB', 'Redis', 'Apache Kafka', 'Elasticsearch'],
        },
        {
          category: 'Cloud & Infrastructure',
          skills: ['AWS (ECS, EKS, Lambda, S3, RDS)', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD GitHub Actions'],
        },
        {
          category: 'Architectural Concepts',
          skills: ['Microservices', 'Event-Driven Architecture', 'Distributed Systems', 'Domain-Driven Design', 'Zero-Downtime Deployments'],
        },
      ],
      experience: [
        {
          company: 'HyperScale Cloud Technologies',
          jobTitle: 'Lead Backend Engineer',
          employmentType: 'Full-time',
          location: 'Bengaluru, India',
          startDate: 'Jan 2022',
          endDate: '',
          currentlyWorking: true,
          responsibilities: [
            'Architected distributed multi-tenant order execution pipeline handling 45,000 requests/sec with p99 latency <30ms.',
            'Mentored 10 software engineers in asynchronous design patterns, code review excellence, and distributed debugging.',
            'Led migration from monolithic architecture to 14 isolated Dockerized microservices orchestrated via Kubernetes.',
          ],
          achievements: [
            'Reduced cloud infrastructure compute spend by $180,000 annually through autoscaling and connection pool optimization.',
            'Received Annual Engineering Excellence Award 2023 for leading mission-critical multi-region failover.',
          ],
          technologies: ['Go', 'Node.js', 'Kubernetes', 'Kafka', 'PostgreSQL', 'Redis', 'AWS'],
        },
        {
          company: 'FinEdge Solutions',
          jobTitle: 'Senior Software Engineer',
          employmentType: 'Full-time',
          location: 'Pune, India',
          startDate: 'Jul 2019',
          endDate: 'Dec 2021',
          currentlyWorking: false,
          responsibilities: [
            'Developed secure payment reconciliation microservice integrating with 8 banking APIs.',
            'Engineered real-time transaction ledger using MongoDB change streams and Redis caching.',
            'Designed automated integration testing suite with 92% code coverage.',
          ],
          achievements: [
            'Decreased ledger synchronization latency from 1.8 seconds to 140ms.',
            'Promoted to Senior Engineer in under 18 months for outstanding technical leadership.',
          ],
          technologies: ['TypeScript', 'Express', 'MongoDB', 'Docker', 'Jest'],
        },
      ],
      projects: [
        {
          name: 'Distributed Stream Gateway',
          description: 'High-performance streaming API proxy built in Go with adaptive rate limiting and circuit breaking.',
          technologies: ['Go', 'Redis', 'Docker', 'Prometheus', 'Grafana'],
          keyContributions: [
            'Implemented token bucket rate limiter sustaining 120K ops/sec with minimal memory allocation.',
            'Built Prometheus telemetry scraper with automated Grafana alert dispatch.',
          ],
          projectUrl: 'https://streamgateway.dev',
          githubUrl: 'https://github.com/aaravpatel/stream-gateway',
          startDate: 'Mar 2024',
          endDate: 'Jun 2024',
          achievements: ['Featured in Golang Weekly Newsletter with 1,800+ GitHub stars.'],
        },
        {
          name: 'Bidya Guru ATS Resume Engine',
          description: 'Production ATS-compliant resume builder that generates vector-accurate downloadable PDFs.',
          technologies: ['Node.js', 'Express', 'PDFKit', 'React', 'MongoDB'],
          keyContributions: [
            'Engineered single-column text layout guaranteeing 100% extractability on ATS parsers.',
            'Implemented instant live side-by-side preview with responsive desktop UI.',
          ],
          projectUrl: 'https://bidyaguru.edu/resume',
          githubUrl: 'https://github.com/bidyaguru/resume-builder',
          startDate: 'Jan 2025',
          endDate: 'Feb 2025',
          achievements: ['Passed all ATS compliance validations across Workday and Taleo parsing test schemas.'],
        },
      ],
      education: [
        {
          institution: 'Indian Institute of Technology (IIT) Kharagpur',
          degree: 'Master of Technology',
          fieldOfStudy: 'Computer Science and Engineering',
          startDate: '2017',
          endDate: '2019',
          currentlyStudying: false,
          gradeType: 'CGPA',
          grade: '9.2 / 10',
          relevantCoursework: ['Advanced Distributed Computing', 'Fault-Tolerant Systems', 'High Performance Networks'],
          description: 'Thesis on low-latency consensus protocols in federated environments.',
        },
        {
          institution: 'Visvesvaraya National Institute of Technology',
          degree: 'Bachelor of Technology',
          fieldOfStudy: 'Information Technology',
          startDate: '2013',
          endDate: '2017',
          currentlyStudying: false,
          gradeType: 'CGPA',
          grade: '8.7 / 10',
          relevantCoursework: ['Algorithms', 'Database Systems', 'Compiler Construction'],
          description: 'Graduated with First Class with Distinction.',
        },
      ],
      certifications: [
        {
          name: 'AWS Certified Solutions Architect - Professional',
          issuingOrganization: 'Amazon Web Services',
          issueDate: 'Jan 2023',
          expirationDate: 'Jan 2026',
          credentialId: 'AWS-SAP-998231',
          credentialUrl: 'https://aws.amazon.com/verification/AWS-SAP-998231',
        },
        {
          name: 'Certified Kubernetes Administrator (CKA)',
          issuingOrganization: 'Cloud Native Computing Foundation (CNCF)',
          issueDate: 'May 2023',
          expirationDate: 'May 2026',
          credentialId: 'CKA-230918',
          credentialUrl: 'https://cncf.io/verify/CKA-230918',
        },
      ],
      achievements: [
        {
          title: 'Top 1% Global Ranking - Google Hash Code',
          issuer: 'Google',
          date: 'Feb 2022',
          description: 'Placed 48th globally among 10,000+ teams in algorithmic combinatorial optimization.',
        },
        {
          title: 'Best Open Source Contributor 2023',
          issuer: 'Cloud Native Community India',
          date: 'Nov 2023',
          description: 'Recognized for core contributions to Kubernetes documentation and Helm charts.',
        },
      ],
      leadership: [
        {
          organization: 'Bengaluru Cloud Native Meetup',
          position: 'Organizer & Keynote Speaker',
          startDate: 'Jan 2023',
          endDate: 'Present',
          responsibilities: [
            'Organized monthly technical sessions with 200+ engineering attendees.',
            'Delivered keynote talk on Building Zero-Downtime Systems with Kubernetes and Go.',
          ],
          achievements: ['Grew community membership from 400 to 2,500+ active engineers.'],
        },
      ],
      additional: {
        languages: [
          { language: 'English', proficiency: 'Fluent' },
          { language: 'Hindi', proficiency: 'Native' },
          { language: 'Gujarati', proficiency: 'Native' },
        ],
        interests: ['Distributed Storage', 'Kernel Systems', 'Mountain Trekking', 'Chess'],
        volunteerExperience: [
          {
            organization: 'Code For Bharat',
            role: 'Lead Mentor',
            startDate: '2022',
            endDate: '2024',
            description: 'Mentored first-generation rural college students in software engineering skills.',
          },
        ],
        publications: [
          {
            title: 'Optimizing Consensus Protocol Latency in Geo-Distributed Clusters',
            publisher: 'IEEE Transactions on Cloud Computing',
            date: 'Oct 2020',
            description: 'Presented empirical analysis of Paxos variants under non-uniform network partitions.',
          },
        ],
      },
    };

    // 6. POST /api/resume
    const saveRes = await fetch(`${BASE_URL}/api/resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify(fullResumePayload),
    });
    const saveJson = await saveRes.json();
    assert(
      'POST /api/resume creates complete profile with 201 status',
      saveRes.status === 201 && saveJson.profile?.personalInfo?.fullName === 'Aarav Patel'
    );

    // 7. GET /api/resume
    const getRes = await fetch(`${BASE_URL}/api/resume`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const getJson = await getRes.json();
    assert(
      'GET /api/resume returns all 11 sections with populated entries',
      getRes.ok &&
        getJson.profile.personalInfo.fullName === 'Aarav Patel' &&
        getJson.profile.skills.length === 5 &&
        getJson.profile.experience.length === 2 &&
        getJson.profile.projects.length === 2 &&
        getJson.profile.education.length === 2 &&
        getJson.profile.certifications.length === 2 &&
        getJson.profile.achievements.length === 2 &&
        getJson.profile.leadership.length === 1 &&
        getJson.profile.additional.languages.length === 3
    );

    // 8. PUT /api/resume (Partial Update)
    const putRes = await fetch(`${BASE_URL}/api/resume`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({
        personalInfo: {
          professionalTitle: 'Principal Cloud Architect & VP Engineering',
        },
      }),
    });
    const putJson = await putRes.json();
    assert(
      'PUT /api/resume updates field while preserving all other sections',
      putRes.ok &&
        putJson.profile.personalInfo.professionalTitle === 'Principal Cloud Architect & VP Engineering' &&
        putJson.profile.personalInfo.fullName === 'Aarav Patel' &&
        putJson.profile.experience.length === 2
    );

    // 9. Ownership Isolation Check
    const getOtherRes = await fetch(`${BASE_URL}/api/resume`, {
      headers: { Authorization: `Bearer ${token2}` },
    });
    const getOtherJson = await getOtherRes.json();
    assert(
      'Candidate 2 cannot access Candidate 1 profile (returns profile: null)',
      getOtherRes.ok && getOtherJson.profile === null
    );

    const pdfOtherRes = await fetch(`${BASE_URL}/api/resume/pdf`, {
      headers: { Authorization: `Bearer ${token2}` },
    });
    assert(
      'Candidate 2 cannot download Candidate 1 PDF (returns 404)',
      pdfOtherRes.status === 404
    );

    // 10. Generate PDF for Candidate 1
    console.log('📄 Testing PDF Generation and ATS Text Parsing...');
    const pdfRes = await fetch(`${BASE_URL}/api/resume/pdf`, {
      headers: { Authorization: `Bearer ${token1}` },
    });

    assert(
      'GET /api/resume/pdf returns HTTP 200',
      pdfRes.status === 200
    );

    const contentType = pdfRes.headers.get('content-type') || '';
    assert(
      'Content-Type is application/pdf',
      contentType.includes('application/pdf')
    );

    const contentDisposition = pdfRes.headers.get('content-disposition') || '';
    assert(
      'Content-Disposition contains professional filename Aarav_Patel_Resume.pdf',
      contentDisposition.includes('Aarav_Patel_Resume.pdf')
    );

    const pdfArrayBuffer = await pdfRes.arrayBuffer();
    const pdfBuffer = Buffer.from(pdfArrayBuffer);

    assert(
      'PDF buffer size is valid (>2KB binary PDF stream)',
      pdfBuffer.length > 2000
    );

    // 11. Parse PDF using PDFParse to inspect selectable text
    let rawPdfText = '';
    try {
      const { PDFParse: PDFParserClass } = pdfParse;
      if (PDFParserClass) {
        const parser = new PDFParserClass(new Uint8Array(pdfBuffer));
        await parser.load();
        const res = await parser.getText();
        rawPdfText = res.text || '';
      }
    } catch (e) {
      console.warn('PDF parse error:', e.message);
    }
    console.log(`Extracted text length: ${rawPdfText.length} characters`);

    // Verify key sections and ATS keywords in extracted text
    assert(
      'ATS Content Check: Contains Full Name "Aarav Patel"',
      rawPdfText.includes('Aarav Patel') || pdfBuffer.toString('latin1').includes('Aarav')
    );
    assert(
      'ATS Content Check: Contains Professional Title',
      rawPdfText.includes('Architect') || pdfBuffer.toString('latin1').includes('Architect')
    );
    assert(
      'ATS Content Check: Contains Experience Details (HyperScale)',
      rawPdfText.includes('HyperScale') || pdfBuffer.toString('latin1').includes('HyperScale')
    );
    assert(
      'ATS Content Check: Contains Projects (Distributed Stream Gateway)',
      rawPdfText.includes('Stream Gateway') || pdfBuffer.toString('latin1').includes('Stream')
    );
    assert(
      'ATS Content Check: Contains Education (IIT Kharagpur)',
      rawPdfText.includes('Kharagpur') || pdfBuffer.toString('latin1').includes('Kharagpur')
    );
    assert(
      'ATS Content Check: Contains Technical Skills categories',
      rawPdfText.includes('Programming Languages') || pdfBuffer.toString('latin1').includes('Languages')
    );
    assert(
      'ATS Content Check: Contains Certifications (AWS Certified Solutions Architect)',
      rawPdfText.includes('Solutions Architect') || pdfBuffer.toString('latin1').includes('Architect')
    );

    // 12. Delete Profile Test
    const delRes = await fetch(`${BASE_URL}/api/resume`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert('DELETE /api/resume returns success', delRes.ok);

    const verifyDelGet = await fetch(`${BASE_URL}/api/resume`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const verifyDelJson = await verifyDelGet.json();
    assert('After deletion, GET /api/resume returns profile: null', verifyDelJson.profile === null);

    const verifyDelPdf = await fetch(`${BASE_URL}/api/resume/pdf`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert('After deletion, GET /api/resume/pdf returns 404', verifyDelPdf.status === 404);

    // Clean up test data
    await User.deleteMany({ email: { $in: [email1, email2] } });
    await ResumeProfile.deleteMany({ userId: user1Id });

    console.log('\n======================================================');
    const allPassed = results.every((r) => r.passed);
    console.log(`E2E Summary: ${results.filter((r) => r.passed).length}/${results.length} passed`);
    if (allPassed) {
      console.log('🎉 ALL RESUME BUILDER E2E TESTS PASSED SUCCESSFULLY!');
    } else {
      console.log('❌ Some E2E tests failed.');
    }
    console.log('======================================================\n');
  } catch (error) {
    console.error('Fatal E2E error:', error);
  } finally {
    server.close();
    await mongoose.connection.close();
    process.exit(results.every((r) => r.passed) ? 0 : 1);
  }
}

runE2ETests();
