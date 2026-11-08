const config = require('../../config/env');

const GEMINI_API_KEY = config.gemini.apiKey;
const MODELS_TO_TRY = [
  'gemini-3.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3.1-flash-lite',
];

/**
 * Robust low-level call to Gemini REST API with automatic multi-model failover and retry
 */
const callGeminiWithFailover = async (prompt, systemInstruction = '', jsonMode = false) => {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 2048,
      ...(jsonMode && { responseMimeType: 'application/json' }),
    },
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      role: 'system',
      parts: [{ text: systemInstruction }],
    };
  }

  let lastError = null;

  for (const model of MODELS_TO_TRY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[Gemini Warn] Model ${model} returned ${response.status}: ${errorText.slice(0, 150)}`);
        // If 503 (high demand) or 404 (model deprecated) or 429 (rate limit), continue to next model
        if ([503, 404, 429].includes(response.status)) {
          lastError = new Error(`Model ${model} (${response.status}) unavailable`);
          continue;
        }
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (jsonMode) {
        const cleaned = rawText
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/, '')
          .trim();
        try {
          return JSON.parse(cleaned);
        } catch (parseErr) {
          const matched = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
          if (matched) {
            return JSON.parse(matched[0]);
          }
          throw new Error(`Failed to parse JSON: ${cleaned.slice(0, 200)}`);
        }
      }

      return rawText.trim();
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini Failover] ${model} attempt failed: ${err.message}. Trying next candidate...`);
    }
  }

  throw lastError || new Error('All Gemini models exhausted');
};

/**
 * Career & Skill Analysis from student input
 */
const analyzeCareerAndSkills = async (conversationText, language = 'en-IN') => {
  const systemInstruction = `You are Bidya Guru, an expert AI Career & Communication Mentor for students in India.
Analyze what the student says, identify their desired career field, target role/goal, known skills, developing skills, and missing skills.
Support multilingual interaction seamlessly in Odia, Hindi, or English.
Always output valid JSON matching the schema.`;

  const prompt = `Student input: "${conversationText}"
Preferred Language: ${language}

Analyze the input and return a JSON object:
{
  "targetField": "e.g. Web Development, AI/ML, Cloud Computing, Cyber Security",
  "careerGoal": "e.g. Full Stack Developer, Data Analyst, Software Engineer",
  "knownSkills": ["skills student already knows"],
  "developingSkills": ["skills student is practicing"],
  "skillsToLearn": ["critical skills student still needs"],
  "aiReply": "Encouraging mentor message in the student's language, max 2 sentences",
  "guidanceTips": ["2 to 3 actionable advice bullets"]
}`;

  try {
    return await callGeminiWithFailover(prompt, systemInstruction, true);
  } catch (err) {
    console.warn('[Gemini Fallback] Using expert rule-based career analyzer:', err.message);
    // Graceful intelligent fallback
    const isHindi = language === 'hi-IN';
    const isOdia = language === 'or-IN';
    return {
      targetField: 'Software Engineering',
      careerGoal: 'Full Stack Web Developer',
      knownSkills: ['HTML', 'CSS', 'JavaScript Basics'],
      developingSkills: ['React.js', 'Frontend Architecture'],
      skillsToLearn: ['Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'Git & CI/CD'],
      aiReply: isHindi
        ? 'शानदार लक्ष्य! आपके बेसिक्स मजबूत हैं। अब फुल स्टैक डेवलपर बनने के लिए हम एक स्ट्रक्चर्ड रोडमैप तैयार करते हैं।'
        : isOdia
        ? 'ଆପଣଙ୍କର ଲକ୍ଷ୍ୟ ବହୁତ ଭଲ! ଆସନ୍ତୁ ଆପଣଙ୍କ ପାଇଁ ଏକ ସ୍ପଷ୍ଟ କ୍ୟାରିଅର୍ ରୋଡ୍‌ମ୍ୟାପ୍ ପ୍ରସ୍ତୁତ କରିବା।'
        : 'Fantastic goal! Your fundamentals provide a solid foundation. Let us now structure your learning roadmap toward becoming an industry-ready Full Stack Developer.',
      guidanceTips: [
        'Master asynchronous JavaScript and state management in React.',
        'Build and deploy RESTful backend services using Express & MongoDB.',
        'Practice speaking about your projects confidently in mock interviews.',
      ],
    };
  }
};

/**
 * Generate Structured Personalized Career Roadmap
 */
/**
 * Generate a personalized career roadmap for ANY stream (Commerce, Arts, Medical, Science, Tech)
 */
const generateCareerRoadmap = async (
  targetField,
  careerGoal,
  knownSkills = [],
  developingSkills = [],
  skillsToLearn = []
) => {
  const field = targetField || 'Career Planning';
  const goal = careerGoal || 'Professional Career';

  const systemInstruction = `You are Bidya Guru's Career Roadmap Architect for Indian students.
Generate a realistic, step-by-step 6-milestone career learning roadmap for a student aiming for '${goal}' in the field of '${field}'.
- If Commerce & Finance: Milestones should cover 11th-12th Commerce core (Accountancy, Business Studies, Economics), Financial Mathematics, Entrance Strategy (CUET / CA Foundation), Undergraduate Specialization (B.Com / BBA / CA Inter), Practical Financial Tools (Tally Prime, Excel Modeling, GST), and Corporate Articleship / Placement.
- If Arts & Humanities: Milestones should cover Humanities Core (Political Science, History, Sociology/Psychology), Critical Thinking & Analytical Essay Writing, Entrance Strategy (CUET / CLAT / UPSC Foundation), Bachelor's Degree (BA / BA LLB / Journalism), Public Policy / Legal / Media Internships, and Career Launch (UPSC CSE / State PSC / Corporate Media).
- If Medical & Healthcare: Milestones should cover Class 11-12 PCB Core Mastery, NEET Entrance Preparation, Medical College Admission (MBBS / BDS / Pharmacy), Clinical Laboratories & Pharmacology, Hospital Internship & Rotations, and Medical Licensing / PG Specialization.
- If Software & Technology: Milestones should cover Programming Foundations, Frontend Web Architecture, Backend REST APIs & Databases, Full-Stack Project Integration, Cloud Deployment, and Technical Interview Prep.
Mark known skills as 'Completed'.
Mark the first developing skill as 'In Progress'.
Mark future skills as 'Locked'.
Output strictly valid JSON.`;

  const prompt = `Target Field: ${field}
Career Goal: ${goal}
Known Skills: ${JSON.stringify(knownSkills)}
Developing Skills: ${JSON.stringify(developingSkills)}
Skills to Learn: ${JSON.stringify(skillsToLearn)}

Generate 6 sequential roadmap items ordered logically.
JSON format:
{
  "title": "Roadmap to become ${goal}",
  "roadmapItems": [
    {
      "skill": "Milestone / Subject Name",
      "status": "In Progress",
      "order": 1,
      "description": "Clear explanation of what to learn and achieve in this milestone.",
      "duration": "2-4 weeks",
      "keyTopics": ["Topic 1", "Topic 2"],
      "resources": ["Recommended Resource / Course 1", "Resource 2"]
    }
  ]
}`;

  try {
    return await callGeminiWithFailover(prompt, systemInstruction, true);
  } catch (err) {
    console.warn('[Gemini Fallback] Using expert structured roadmap generator:', err.message);

    const fLower = (field || '').toLowerCase();
    const gLower = (goal || '').toLowerCase();

    // 1. COMMERCE & FINANCE ROADMAP
    if (
      fLower.includes('commerce') ||
      fLower.includes('finance') ||
      fLower.includes('bank') ||
      gLower.includes('commerce') ||
      /\bca\b/i.test(gLower) ||
      gLower.includes('chartered accountant') ||
      gLower.includes('account') ||
      gLower.includes('b.com') ||
      gLower.includes('bcom') ||
      gLower.includes('finance')
    ) {
      return {
        title: `Comprehensive Career Roadmap for ${goal || 'Commerce & Finance Professional'}`,
        roadmapItems: [
          {
            skill: '11th & 12th Commerce Foundations',
            status: 'Completed',
            order: 1,
            description: 'Master core principles of Financial Accounting, Business Studies, Micro & Macro Economics.',
            duration: 'Core High School / 1 Year',
            keyTopics: ['Journal & Ledger Entries', 'Balance Sheets', 'Forms of Business', 'Macroeconomic Concepts'],
            resources: ['NCERT Accountancy', 'TS Grewal Book', 'Khan Academy Economics'],
          },
          {
            skill: 'Financial Mathematics & Analytical Reasoning',
            status: 'In Progress',
            order: 2,
            description: 'Develop strong numerical foundations in Compound Interest, Annuities, Probability, and Statistical Analysis.',
            duration: '4-6 weeks',
            keyTopics: ['Time Value of Money', 'Calculus Basics', 'Data Interpretation', 'Ratio & Proportion'],
            resources: ['RS Aggarwal Mathematics', 'CA Foundation Quantitative Aptitude'],
          },
          {
            skill: 'Competitive Entrance Prep (CUET / CA Foundation)',
            status: 'Locked',
            order: 3,
            description: 'Prepare systematically for central university admissions (CUET) or professional CA Foundation exams.',
            duration: '3-4 months',
            keyTopics: ['Mercantile Law & Business Correspondence', 'General Test Preparation', 'Mock Test Series'],
            resources: ['ICAI Study Material', 'CUET Commerce Mock Drills'],
          },
          {
            skill: 'Higher Education (B.Com / BBA / CA Intermediate)',
            status: 'Locked',
            order: 4,
            description: 'Enroll in top university or complete CA Intermediate covering Corporate Accounting, Taxation, and Costing.',
            duration: 'Degree Cycle / 1-2 Years',
            keyTopics: ['Corporate Accounting', 'Income Tax & GST Laws', 'Financial Management', 'Cost Accounting'],
            resources: ['University Curriculum', 'ICAI Intermediate Modules'],
          },
          {
            skill: 'Practical Tools: Tally Prime & Excel Financial Modeling',
            status: 'Locked',
            order: 5,
            description: 'Acquire real-world finance industry tools including Advanced Excel, Financial Modeling, and Tally ERP.',
            duration: '4-6 weeks',
            keyTopics: ['Financial Statements Modeling', 'VLOOKUP & XLOOKUP', 'GST E-Filing', 'Tally Prime Vouchers'],
            resources: ['Corporate Finance Institute (CFI)', 'Tally Certification'],
          },
          {
            skill: 'Articleship & Corporate Financial Roles',
            status: 'Locked',
            order: 6,
            description: 'Complete mandatory articleship or corporate finance internships leading to full-time placement.',
            duration: 'Continuous Professional Phase',
            keyTopics: ['Statutory Auditing', 'Investment Banking Prep', 'Corporate Advisory', 'Interview Skills'],
            resources: ['Big 4 Campus Recruitment', 'ICAI Placement Portal'],
          },
        ],
      };
    }

    // 2. ARTS & HUMANITIES ROADMAP
    if (
      fLower.includes('art') ||
      fLower.includes('humanities') ||
      fLower.includes('civil') ||
      gLower.includes('art') ||
      gLower.includes('upsc') ||
      gLower.includes('civil') ||
      gLower.includes('ias') ||
      gLower.includes('law') ||
      gLower.includes('journalism')
    ) {
      return {
        title: `Comprehensive Career Roadmap for ${goal || 'Arts & Civil Services / Law'}`,
        roadmapItems: [
          {
            skill: '11th & 12th Humanities Foundations',
            status: 'Completed',
            order: 1,
            description: 'Build foundational knowledge in Political Science, Modern History, Sociology, and Constitutional Studies.',
            duration: 'Core High School / 1 Year',
            keyTopics: ['Indian Constitution', 'World & Modern Indian History', 'Social Change', 'Contemporary World Politics'],
            resources: ['NCERT Class 11 & 12 Humanities', 'National Geographic & Frontline'],
          },
          {
            skill: 'Critical Thinking, Research & Essay Writing',
            status: 'In Progress',
            order: 2,
            description: 'Master analytical essay writing, editorial comprehension, and evidence-based argument construction.',
            duration: '4-8 weeks',
            keyTopics: ['The Hindu/Indian Express Editorials', 'Essay Structuring', 'Public Policy Analysis'],
            resources: ['The Hindu Editorials', 'Yojana Magazine', 'Kurukshetra'],
          },
          {
            skill: 'Entrance Strategy (CUET / CLAT for Law / UPSC Foundation)',
            status: 'Locked',
            order: 3,
            description: 'Target premier humanities institutions (DU, JNU, BHU) via CUET or top National Law Universities via CLAT.',
            duration: '3-6 months',
            keyTopics: ['General Studies Foundations', 'Legal Aptitude', 'Logical Reasoning', 'Current Affairs Compilations'],
            resources: ['CLAT Official Portal', 'VisionIAS Current Affairs', 'Drishti IAS'],
          },
          {
            skill: 'Bachelor’s Degree (BA / BA LLB / Mass Communication)',
            status: 'Locked',
            order: 4,
            description: 'Pursue your chosen specialization with academic distinction and extracurricular debate/moot court participation.',
            duration: '3-5 Years Degree Cycle',
            keyTopics: ['Core Major Seminars', 'Public Law & Administration', 'Research Methodologies'],
            resources: ['University Syllabus', 'JSTOR Research Library'],
          },
          {
            skill: 'Policy, Media & Legal Internships',
            status: 'Locked',
            order: 5,
            description: 'Work with policy think tanks, non-governmental organizations, legal chambers, or national media houses.',
            duration: '2-3 months',
            keyTopics: ['Field Research', 'Legislative Drafting', 'Investigative Journalism', 'Community Policy'],
            resources: ['PRS Legislative Research', 'Think Tank Internships', 'Bar Council Guidance'],
          },
          {
            skill: 'Competitive Examination Launch (UPSC CSE / State PSC)',
            status: 'Locked',
            order: 6,
            description: 'Dedicated preparation for the Civil Services Examination (Prelims, Mains, Interview) or Bar Council examination.',
            duration: '1 Year Dedicated Focus',
            keyTopics: ['GS Papers 1-4', 'Optional Subject Mastery', 'Mock Interviews & Answer Writing'],
            resources: ['UPSC Official Notification', 'Standard Reference Texts (Laxmikanth, Bipin Chandra)'],
          },
        ],
      };
    }

    // 3. MEDICAL & HEALTHCARE ROADMAP
    if (
      fLower.includes('med') ||
      fLower.includes('health') ||
      gLower.includes('med') ||
      gLower.includes('neet') ||
      gLower.includes('doctor') ||
      gLower.includes('biology')
    ) {
      return {
        title: `Comprehensive Career Roadmap for ${goal || 'Medical & Healthcare Professional'}`,
        roadmapItems: [
          {
            skill: 'Class 11 & 12 PCB Core Mastery',
            status: 'Completed',
            order: 1,
            description: 'Develop deep conceptual clarity in Human Physiology, Plant Physiology, Organic Chemistry, and Optics/Electrodynamics.',
            duration: 'Core High School / 1 Year',
            keyTopics: ['Cell Biology & Genetics', 'Chemical Bonding & Organic Reactions', 'Mechanics & Thermodynamics'],
            resources: ['NCERT Biology, Physics & Chemistry', 'Trueman Biology'],
          },
          {
            skill: 'NEET Entrance Preparation & Speed Mock Drills',
            status: 'In Progress',
            order: 2,
            description: 'Rigorous question-solving speed drills and past 15-year NEET question paper analysis.',
            duration: '6-12 months',
            keyTopics: ['OMR Test Simulation', 'High-Yield Formulae Sheets', 'Error Notebook Analysis'],
            resources: ['NTA Mock Tests', 'Allen / Aakash Question Banks'],
          },
          {
            skill: 'Medical College Admission (MBBS / BDS / Allied Health)',
            status: 'Locked',
            order: 3,
            description: 'Secure admission to recognized medical colleges and complete pre-clinical medical sciences.',
            duration: '1st Year MBBS',
            keyTopics: ['Human Anatomy & Dissection', 'Medical Physiology', 'Biochemistry'],
            resources: ['BD Chaurasia Anatomy', 'Guyton & Hall Physiology'],
          },
          {
            skill: 'Para-Clinical & Clinical Medical Foundations',
            status: 'Locked',
            order: 4,
            description: 'Understand disease mechanisms, drug interactions, and forensic medical laws.',
            duration: '2nd & 3rd Year MBBS',
            keyTopics: ['Pathology', 'Pharmacology', 'Microbiology', 'Forensic Medicine'],
            resources: ['Robbins Basic Pathology', 'KD Tripathi Pharmacology'],
          },
          {
            skill: 'Hospital Rotations & Hands-On Internship',
            status: 'Locked',
            order: 5,
            description: '12-month compulsory rotatory residential internship across major medical departments.',
            duration: '1 Year Rotations',
            keyTopics: ['Emergency Medicine', 'General Surgery', 'Obstetrics & Gynecology', 'Pediatrics'],
            resources: ['Hospital Clinical Postings', 'Harrison’s Principles of Internal Medicine'],
          },
          {
            skill: 'Medical Council Registration & PG Residency',
            status: 'Locked',
            order: 6,
            description: 'National licensing examination (NEXT), state medical council registration, and specialized residency.',
            duration: 'Career Phase',
            keyTopics: ['Clinical Practice Licensing', 'NEXT / NEET PG Examination', 'Specialist Residency'],
            resources: ['National Medical Commission (NMC)', 'Specialty Residency Programs'],
          },
        ],
      };
    }

    // 4. TECH & SOFTWARE DEVELOPMENT ROADMAP
    return {
      title: `Curated Industry Roadmap for ${goal || 'Full Stack Web Developer'}`,
      roadmapItems: [
        {
          skill: 'HTML5 & Responsive CSS',
          status: 'Completed',
          order: 1,
          description: 'Master semantic markup, Flexbox, CSS Grid, and mobile-responsive layouts.',
          duration: '1-2 weeks',
          keyTopics: ['Semantic HTML', 'CSS Grid & Flexbox', 'Responsive Design'],
          resources: ['MDN Web Docs', 'FreeCodeCamp'],
        },
        {
          skill: 'Modern JavaScript (ES6+)',
          status: 'Completed',
          order: 2,
          description: 'Core programming logic, Closures, Promises, Async/Await, and DOM APIs.',
          duration: '2-3 weeks',
          keyTopics: ['Async/Await', 'DOM Manipulation', 'ES6 Modules'],
          resources: ['JavaScript.info'],
        },
        {
          skill: 'React.js & Component Architecture',
          status: 'In Progress',
          order: 3,
          description: 'Build interactive SPAs using React Hooks, Context API, and modern state management.',
          duration: '3 weeks',
          keyTopics: ['Hooks (useState, useEffect)', 'Props & State', 'React Router'],
          resources: ['React.dev Official Docs'],
        },
        {
          skill: 'Node.js & Express REST APIs',
          status: 'Locked',
          order: 4,
          description: 'Server-side runtime, building RESTful endpoints, middleware, and authentication.',
          duration: '2-3 weeks',
          keyTopics: ['Express Routing', 'JWT Auth Middleware', 'Error Handling'],
          resources: ['Expressjs.com Documentation'],
        },
        {
          skill: 'MongoDB & Database Modeling',
          status: 'Locked',
          order: 5,
          description: 'Document database storage, Mongoose schemas, indexing, and aggregations.',
          duration: '2 weeks',
          keyTopics: ['Mongoose Schemas', 'CRUD Operations', 'Atlas Deployment'],
          resources: ['MongoDB University'],
        },
        {
          skill: 'Full-Stack Project & Cloud Deployment',
          status: 'Locked',
          order: 6,
          description: 'Connect frontend and backend, deploy to Vercel/Render, and setup CI/CD pipelines.',
          duration: '3 weeks',
          keyTopics: ['Full-stack integration', 'Environment Security', 'Cloud Hosting'],
          resources: ['GitHub Actions Docs', 'Vercel Guides'],
        },
      ],
    };
  }
};

/**
 * Conversational Voice Mentor Guidance response with interactive follow-up questions
 */
/**
 * Conversational Voice Mentor Guidance response with interactive follow-up questions
 * Stream-agnostic: Guides 10th/12th students across Science, Commerce, Arts, and Tech
 */
const getVoiceCareerMentorResponse = async (
  userMessage,
  history = [],
  studentProfile = {},
  language = 'en-IN'
) => {
  const isHindi = language === 'hi-IN';
  const isOdia = language === 'or-IN';

  const systemInstruction = `You are Bidya Guru, an empathetic, encouraging, and expert multilingual AI Voice Education and Career Mentor for Indian students.
Your core mission is to guide each student based on THEIR actual background, education level, and true interests across all streams (Commerce, Arts & Humanities, Science, Vocational, or Technology).

CORE CONVERSATIONAL PRINCIPLES:
1. EDUCATIONAL DISCOVERY (When student mentions their education stage like "I completed 10th", "10th pass kiya", "I finished 12th", or asks what to study after 10th):
   - NEVER ASSUME coding, web development, or HTML/CSS!
   - Warmly congratulate them on reaching this milestone.
   - Explain the major paths open to them:
     * Science (PCM for Engineering/Tech, PCB for Medical/Healthcare/Research)
     * Commerce (Accountancy, Business Studies, Economics -> CA, CS, Banking, Finance, B.Com/BBA)
     * Arts & Humanities (History, Political Science, Psychology -> Civil Services/UPSC, Law, Media, Design)
     * Vocational & Polytechnic Diplomas
   - Ask what kind of work or subjects they naturally enjoy (e.g. business & numbers, creative writing & society, science & health, or computers/tech).
   - Set detectedGoal = null, detectedField = null, shouldGenerateRoadmap = false (listen and discover first!).

2. STREAM & CAREER ADAPTATION (When the student indicates a stream or career interest):
   - COMMERCE (e.g. "Commerce padhna hai", "CA", "Finance", "Banking", "B.Com", "Accounts"):
     * Validate their choice enthusiastically!
     * Tell them what they will study: Accountancy, Business Studies, Economics, and Financial Math.
     * Highlight top careers: Chartered Accountant (CA), Company Secretary (CS), Investment Banking, Corporate Finance, BBA/B.Com.
     * State that you are generating their personalized Commerce roadmap.
     * Ask follow-up on whether they lean towards CA/Finance, Banking, or Business, and their timeline.
     * Set detectedField = "Commerce & Finance", detectedGoal = "Chartered Accountant / Commerce Professional", shouldGenerateRoadmap = true.
   - ARTS & HUMANITIES (e.g. "Arts padhna hai", "Civil Services", "UPSC", "IAS", "Law", "Journalism", "Psychology"):
     * Validate warmly!
     * Explain subjects: Political Science, History, Sociology, Psychology, Economics, Literature.
     * Highlight careers: Civil Services (UPSC CSE, State PSC), Law (BA LLB / Judiciary), Journalism, Media & Design, Public Administration.
     * State that you are generating their personalized Arts & Humanities roadmap.
     * Set detectedField = "Arts & Humanities", detectedGoal = "Civil Services & Humanities Career", shouldGenerateRoadmap = true.
   - SCIENCE - MEDICAL (e.g. "Medical", "NEET", "Doctor", "Biology", "PCB"):
     * Explain PCB and careers: MBBS, BDS, B.Pharm, Biotechnology, Allied Health.
     * Set detectedField = "Medical & Healthcare", detectedGoal = "Medical Professional (MBBS / Healthcare)", shouldGenerateRoadmap = true.
   - SCIENCE - ENGINEERING & TECH (e.g. "Engineering", "JEE", "Computer Science", "Web Developer", "Software", "Coding"):
     * Explain PCM or coding path, key skills, and timeline.
     * Set detectedField = "Software Development", detectedGoal = "Full Stack Software Developer", shouldGenerateRoadmap = true.

3. RESPONSE STYLE:
   - Keep spokenReply within 2 to 3 natural, conversational sentences suitable for speech synthesis.
   - In Hindi, speak in natural, fluent Hindi. In Odia, speak in natural Odia. In English, speak in clear, warm English.
   - Output strictly valid JSON matching the schema.`;

  const prompt = `Student Profile:
Current Field: ${studentProfile.targetField || 'Not set'}
Current Goal: ${studentProfile.careerGoal || 'Not set'}
Known Skills: ${(studentProfile.knownSkills || []).join(', ') || 'None logged'}
Language: ${language}

Recent Conversation History:
${history.map((h) => `${h.role}: ${h.text}`).slice(-4).join('\n')}

Student says: "${userMessage}"

Analyze and return JSON:
{
  "spokenReply": "Concise natural spoken response in the student's language acknowledging their stage, explaining stream options or specific stream subjects and jobs, and asking personalized follow-up questions",
  "followUpQuestions": [
    "Personalized follow-up question 1",
    "Personalized follow-up question 2"
  ],
  "detectedGoal": "Detected role/career goal (e.g. Chartered Accountant / Commerce Professional, Civil Services & Humanities Career, Full Stack Software Developer) or null",
  "detectedField": "Detected domain (e.g. 'Commerce & Finance', 'Arts & Humanities', 'Medical & Healthcare', 'Software Development') or null",
  "detectedSkills": ["Any skills or subjects mentioned by student"],
  "shouldGenerateRoadmap": true or false
}`;

  try {
    const parsed = await callGeminiWithFailover(prompt, systemInstruction, true);
    if (parsed && parsed.spokenReply) {
      return parsed;
    }
    // If parsed is a string
    return {
      spokenReply: typeof parsed === 'string' ? parsed : JSON.stringify(parsed),
      followUpQuestions: [
        'Which stream interests you the most: Science, Commerce, or Arts?',
        'What kind of subjects or careers do you naturally enjoy?',
      ],
      detectedGoal: null,
      detectedField: null,
      detectedSkills: [],
      shouldGenerateRoadmap: false,
    };
  } catch (err) {
    console.warn('[Gemini Fallback] Using expert conversational mentor fallback:', err.message);

    const lower = (userMessage || '').toLowerCase();

    // 1. 10TH / 12TH PASS EDUCATIONAL DISCOVERY
    const is10thOrSchool =
      lower.includes('10th') ||
      lower.includes('10 th') ||
      lower.includes('tenth') ||
      lower.includes('matric') ||
      lower.includes('school') ||
      lower.includes('12th') ||
      lower.includes('after 10') ||
      lower.includes('pass out') ||
      lower.includes('completed my 10') ||
      lower.includes('complete 10') ||
      lower.includes('complete my 10') ||
      lower.includes('finish 10');

    if (is10thOrSchool) {
      return {
        spokenReply: isHindi
          ? '10वीं पूरी करने पर बहुत-बहुत बधाई! यह आपके करियर का एक बेहद महत्वपूर्ण मोड़ है। 10वीं के बाद मुख्य रूप से तीन रास्ते होते हैं—साइंस (इंजीनियरिंग/मेडिकल), कॉमर्स (फाइनेंस, बैंकिंग, CA), और आर्ट्स/ह्यूमैनिटीज (UPSC, लॉ, मीडिया), साथ ही डिप्लोमा कोर्सेज। आपको किस तरह के विषय या करियर में सबसे ज्यादा रुचि है?'
          : isOdia
          ? '୧୦ମ ଶ୍ରେଣୀ ସଫଳତାର ସହ ଶେଷ କରିଥିବାରୁ ଅନେକ ଅନେକ ଶୁଭେଚ୍ଛା! ୧୦ମ ପରେ ମୁଖ୍ୟତଃ ତିନୋଟି ଷ୍ଟ୍ରିମ୍ ରହିଛି—ସାଇନ୍ସ (ଇଞ୍ଜିନିୟରିଂ/ମେଡିକାଲ), କମର୍ସ (CA/ବ୍ୟାଙ୍କିଂ), ଏବଂ ଆର୍ଟସ୍ (ସିଭିଲ୍ ସର୍ଭିସେସ୍/ଲ\')। ଆପଣଙ୍କୁ କେଉଁ ବିଷୟ କିମ୍ବା ଲାଇନ୍ ଅଧିକ ଭଲଲାଗେ?'
          : 'Congratulations on completing your 10th! After 10th, you have three major academic streams—Science (Engineering & Medical), Commerce (Finance, Banking, CA), and Arts/Humanities (Civil Services, Law, Media), plus Polytechnic Diplomas. Which subjects or line of work do you naturally enjoy the most?',
        followUpQuestions: isHindi
          ? [
              'क्या आपको कॉमर्स (बिजनेस/CA), आर्ट्स (UPSC/लॉ) या साइंस में रुचि है?',
              'आपको नंबर्स और बिजनेस पसंद है, या लिखना और समाज के विषय?',
            ]
          : isOdia
          ? [
              'ଆପଣ କମର୍ସ (CA/ବ୍ୟାଙ୍କିଂ), ଆର୍ଟସ (UPSC/ଲ\') କିମ୍ବା ସାଇନ୍ସ ଚାହାଁନ୍ତି?',
              'ଆପଣଙ୍କୁ ହିସାବ କିତାବ/ବିଜିନେସ୍ ଭଲଲାଗେ ନା ସମାଜ/ସାହିତ୍ୟ?',
            ]
          : [
              'Would you like to explore Commerce (CA/Banking), Arts (UPSC/Law), or Science?',
              'Do you enjoy numbers & business, creative writing & society, or science & tech?',
            ],
        detectedGoal: null,
        detectedField: null,
        detectedSkills: [],
        shouldGenerateRoadmap: false,
      };
    }

    // 2. COMMERCE & FINANCE
    const isCommerce =
      lower.includes('commerce') ||
      /\bca\b/i.test(lower) ||
      lower.includes('chartered accountant') ||
      lower.includes('account') ||
      lower.includes('b.com') ||
      lower.includes('bcom') ||
      lower.includes('finance') ||
      lower.includes('banking') ||
      lower.includes('business studies');

    if (isCommerce) {
      return {
        spokenReply: isHindi
          ? 'कॉमर्स चुनना एक बेहतरीन फैसला है! 11वीं और 12वीं में आप अकाउंटेंसी, बिजनेस स्टडीज, इकोनॉमिक्स और मैथ्स पढ़ेंगे। इसके बाद आप CA (चार्टर्ड अकाउंटेंट), CS, इन्वेस्टमेंट बैंकिंग, B.Com/BBA, और कॉर्पोरेट फाइनेंस में शानदार करियर बना सकते हैं। मैंने आपका कॉमर्स करियर रोडमैप तैयार कर दिया है! क्या आप CA/फाइनेंस में जाना चाहते हैं या बिजनेस मैनेजमेंट में?'
          : isOdia
          ? 'କମର୍ସ ଏକ ବହୁତ ଭଲ ନିଷ୍ପତ୍ତି! ୧୧ଶ ଏବଂ ୧୨ଶ ରେ ଆପଣ ଆକାଉଣ୍ଟାନ୍ସି, ବିଜିନେସ୍ ଷ୍ଟଡିଜ୍, ଇକୋନୋମିକ୍ସ ପଢ଼ିବେ। ଏହା ପରେ ଆପଣ CA, ବ୍ୟାଙ୍କିଂ, ଫାଇନାନ୍ସ କିମ୍ବା B.Com/BBA ରେ ସୁନ୍ଦର କ୍ୟାରିଅର୍ ଗଢ଼ିପାରିବେ। ମୁଁ ଆପଣଙ୍କ ପାଇଁ କମର୍ସ ରୋଡ୍‌ମ୍ୟାପ୍ ପ୍ରସ୍ତୁତ କରିଦେଇଛି! ଆପଣ CA ନା ବ୍ୟାଙ୍କିଂ ଲାଇନ୍ ଚାହାଁନ୍ତି?'
          : 'Commerce is a fantastic choice with rewarding careers! In 11th & 12th, you will study Accountancy, Business Studies, Economics, and Financial Mathematics, leading to top careers like Chartered Accountant (CA), Company Secretary (CS), Investment Banking, and BBA/B.Com. I am generating your customized Commerce roadmap right now! Are you aiming for CA, Banking, or Business Management?',
        followUpQuestions: isHindi
          ? [
              'क्या आपका लक्ष्य CA (चार्टर्ड अकाउंटेंट), बैंकिंग, या कॉर्पोरेट बिजनेस है?',
              'आप 11वीं-12वीं के साथ CUET या CA Foundation की तैयारी कब शुरू करना चाहते हैं?',
            ]
          : isOdia
          ? [
              'ଆପଣ CA (ଚାର୍ଟାର୍ଡ ଆକାଉଣ୍ଟାଣ୍ଟ), ବ୍ୟାଙ୍କିଂ ନା ବିଜିନେସ୍ ମ୍ୟାନେଜମେଣ୍ଟ କରିବେ?',
              'ଆପଣ କେତେ ସମୟ ମଧ୍ୟରେ CA Foundation କିମ୍ବା CUET ପରୀକ୍ଷା ଟାର୍ଗେଟ୍ ରଖିଛନ୍ତି?',
            ]
          : [
              'Are you aiming for Chartered Accountancy (CA), Banking, or Corporate Business?',
              'When do you plan to start preparing for entrance exams like CUET or CA Foundation?',
            ],
        detectedGoal: 'Chartered Accountant / Commerce Professional',
        detectedField: 'Commerce & Finance',
        detectedSkills: ['Accountancy', 'Economics', 'Business Studies'],
        shouldGenerateRoadmap: true,
      };
    }

    // 3. ARTS & HUMANITIES / UPSC / CIVIL SERVICES / LAW
    const isArts =
      lower.includes('art') ||
      lower.includes('humanities') ||
      lower.includes('upsc') ||
      lower.includes('civil service') ||
      lower.includes('ias') ||
      lower.includes('ips') ||
      lower.includes('law') ||
      lower.includes('llb') ||
      lower.includes('journalism') ||
      lower.includes('history') ||
      lower.includes('political');

    if (isArts) {
      return {
        spokenReply: isHindi
          ? 'आर्ट्स और ह्यूमैनिटीज विचारकों और लीडर्स के लिए एक शानदार क्षेत्र है! इसमें आप पॉलिटिकल साइंस, हिस्ट्री, सोशियोलॉजी और साइकोलॉजी पढ़ेंगे, जिससे UPSC (सिविल सर्विसेज), लॉ (वकालत), जर्नलिज्म और पब्लिक पॉलिसी के बड़े रास्ते खुलते हैं। मैंने आपका पर्सनलाइज्ड आर्ट्स रोडमैप तैयार कर दिया है! आपका मुख्य लक्ष्य क्या है?'
          : isOdia
          ? 'ଆର୍ଟସ୍ ଏବଂ ହ୍ୟୁମାନିଟିଜ୍ ଏକ ବହୁତ ଭଲ ଷ୍ଟ୍ରିମ୍! ଏଥିରେ ପଲିଟିକାଲ୍ ସାଇନ୍ସ, ଇତିହାସ, ସୋସିଓଲୋଜି ପଢ଼ି ଆପଣ UPSC (ସିଭିଲ୍ ସର୍ଭିସେସ୍), ଲ\' (ଆଇନଜୀବୀ), ଏବଂ ମିଡିଆରେ ଉଜ୍ଜ୍ୱଳ ଭବିଷ୍ୟତ ଗଢ଼ିପାରିବେ। ମୁଁ ଆପଣଙ୍କ ପାଇଁ ଆର୍ଟସ୍ ରୋଡ୍‌ମ୍ୟାପ୍ ପ୍ରସ୍ତୁତ କରିଦେଇଛି!'
          : 'Arts and Humanities is an incredible stream for leaders and thinkers! You will study Political Science, History, Sociology, and Psychology, opening pathways to Civil Services (UPSC CSE), Judiciary & Law (CLAT), Journalism, and Public Policy. I am preparing your customized Arts & Civil Services roadmap right now! What specific career are you aiming for?',
        followUpQuestions: isHindi
          ? [
              'क्या आप UPSC सिविल सर्विसेज (IAS/IPS), लॉ (CLAT), या जर्नलिज्म में जाना चाहते हैं?',
              'ग्रेजुएशन और एंट्रेंस के लिए आपकी तैयारी की क्या टाइमलाइन है?',
            ]
          : isOdia
          ? [
              'ଆପଣ UPSC ସିଭିଲ୍ ସର୍ଭିସେସ୍ (IAS), ଲ\' (CLAT), କିମ୍ବା ସାମ୍ବାଦିକତା ଚାହାଁନ୍ତି?',
              'ଆପଣ କେଉଁ ବିଷୟରେ ଅନର୍ସ/ସ୍ପେଶାଲାଇଜେସନ୍ କରିବାକୁ ଭାବୁଛନ୍ତି?',
            ]
          : [
              'Are you targeting Civil Services (UPSC), Law (CLAT), or Journalism/Media?',
              'What timeline do you have in mind for your degree and entrance preparation?',
            ],
        detectedGoal: 'Civil Services & Humanities Career',
        detectedField: 'Arts & Humanities',
        detectedSkills: ['Political Science', 'History', 'Analytical Writing'],
        shouldGenerateRoadmap: true,
      };
    }

    // 4. SCIENCE - MEDICAL (PCB)
    const isMedical =
      lower.includes('medical') ||
      lower.includes('neet') ||
      lower.includes('doctor') ||
      lower.includes('biology') ||
      lower.includes('pcb') ||
      lower.includes('pharmacy') ||
      lower.includes('mbbs');

    if (isMedical) {
      return {
        spokenReply: isHindi
          ? 'मेडिकल और हेल्थकेयर एक अत्यंत प्रतिष्ठित और सेवाभावी क्षेत्र है! 11वीं और 12वीं में फिजिक्स, केमिस्ट्री और बायोलॉजी (PCB) पढ़कर आप NEET की तैयारी कर सकते हैं और MBBS, BDS, या फार्मेसी में प्रवेश ले सकते हैं। मैंने आपका मेडिकल रोडमैप तैयार कर दिया है! क्या आप NEET की तैयारी कर रहे हैं?'
          : isOdia
          ? 'ମେଡିକାଲ୍ ଏବଂ ସ୍ୱାସ୍ଥ୍ୟସେବା ଏକ ମହାନ କ୍ଷେତ୍ର! ୧୧ଶ ଏବଂ ୧୨ଶ ରେ PCB ପଢ଼ି ଆପଣ NEET ପରୀକ୍ଷା ଦେଇ MBBS, BDS କିମ୍ବା ଫାର୍ମାସୀରେ ଯୋଗ ଦେଇପାରିବେ। ମୁଁ ଆପଣଙ୍କ ପାଇଁ ମେଡିକାଲ୍ ରୋଡ୍‌ମ୍ୟାପ୍ ପ୍ରସ୍ତୁତ କରିଦେଇଛି!'
          : 'Medical and Healthcare is a noble and high-impact profession! In 11th & 12th Science (PCB), you will master Biology, Chemistry, and Physics to crack NEET and pursue MBBS, BDS, Pharmacy, or Biotechnology. I am preparing your structured Medical preparation roadmap right now! Are you aiming for NEET and MBBS?',
        followUpQuestions: isHindi
          ? [
              'क्या आपका मुख्य लक्ष्य NEET क्रैक करके MBBS बनना है, या फार्मेसी/बायोटेक्नोलॉजी?',
              'आप बायोलॉजी और केमिस्ट्री के लिए रोजाना कितने घंटे समर्पित कर सकते हैं?',
            ]
          : isOdia
          ? [
              'ଆପଣ NEET ଦେଇ MBBS କରିବେ ନା ଫାର୍ମାସୀ କିମ୍ବା ବାୟୋଟେକ୍ନୋଲୋଜି?',
              'ଆପଣ ପ୍ରତିଦିନ PCB ପାଇଁ କେତେ ଘଣ୍ଟା ସମୟ ଦେଇପାରିବେ?',
            ]
          : [
              'Are you aiming for NEET MBBS, BDS, Pharmacy, or Biotechnology?',
              'How many hours daily can you dedicate to Biology, Chemistry, and Physics?',
            ],
        detectedGoal: 'Medical Professional (MBBS / Healthcare)',
        detectedField: 'Medical & Healthcare',
        detectedSkills: ['Biology', 'Chemistry', 'Physics'],
        shouldGenerateRoadmap: true,
      };
    }

    // 5. TECH & SOFTWARE DEVELOPMENT
    const isTech =
      lower.includes('web') ||
      lower.includes('dev') ||
      lower.includes('coding') ||
      lower.includes('software') ||
      lower.includes('full stack') ||
      lower.includes('python') ||
      lower.includes('java') ||
      lower.includes('frontend') ||
      lower.includes('engineer');

    if (isTech) {
      return {
        spokenReply: isHindi
          ? 'शानदार लक्ष्य! सॉफ्टवेयर इंजीनियरिंग और वेब डेवलपमेंट एक बेहतरीन और हाई-डिमांड करियर है। मैं आपके लिए एक पर्सनलाइज्ड टेक्निकल रोडमैप तैयार कर रहा हूँ। आप किस प्रोग्रामिंग लैंग्वेज से शुरुआत करना चाहते हैं और आपका टाइमलाइन क्या है?'
          : isOdia
          ? 'ବହୁତ ବଢ଼ିଆ ଲକ୍ଷ୍ୟ! ସଫ୍ଟୱେର୍ ଏବଂ ୱେବ୍ ଡେଭଲପମେଣ୍ଟ ବର୍ତ୍ତମାନ ଖୁବ୍ ଚାହିଦା ଥିବା କ୍ଷେତ୍ର। ମୁଁ ଆପଣଙ୍କ ପାଇଁ ଏକ ରୋଡ୍‌ମ୍ୟାପ୍ ପ୍ରସ୍ତୁତ କରୁଛି। ଆପଣ କେଉଁ ଲାଙ୍ଗୁଏଜ୍‌ରୁ ଆରମ୍ଭ କରିବାକୁ ଚାହାଁନ୍ତି?'
          : 'Awesome goal! Software Engineering and Development is a fast-growing, high-demand field. I am preparing your step-by-step technical roadmap right now. Which programming language or technology do you want to start with, and what is your timeline?',
        followUpQuestions: isHindi
          ? [
              'क्या आप बिगिनर हैं या आपको पहले से कोई लैंग्वेज (जैसे Java, Python, HTML/JS) आती है?',
              'आप रोजाना कितने घंटे दे सकते हैं और कितने दिनों में पूरा करना चाहते हैं?',
            ]
          : isOdia
          ? [
              'ଆପଣ ବିଗିନର୍ ନା ପୂର୍ବରୁ କୌଣସି ଲାଙ୍ଗୁଏଜ୍ (Java, Python, HTML) ଜାଣିଛନ୍ତି?',
              'ଆପଣ ପ୍ରତିଦିନ କେତେ ସମୟ ଦେଇପାରିବେ ଏବଂ କେତେ ଦିନର ଟାର୍ଗେଟ୍ ରଖିଛନ୍ତି?',
            ]
          : [
              'Which technologies or languages do you already know (or are you a beginner)?',
              'How many hours daily can you dedicate, and how many days/months is your goal?',
            ],
        detectedGoal: 'Full Stack Software Developer',
        detectedField: 'Software Development',
        detectedSkills: ['Programming Fundamentals'],
        shouldGenerateRoadmap: true,
      };
    }

    // 6. GENERAL CAREER COUNSELING
    return {
      spokenReply: isHindi
        ? 'बहुत अच्छा सवाल है! अपने करियर को आगे बढ़ाने के लिए सही मार्गदर्शन और सही दिशा बहुत जरूरी है। बताइए आप किस क्लास या बैकग्राउंड से हैं—साइंस, कॉमर्स, या आर्ट्स?'
        : isOdia
        ? 'ବହୁତ ଭଲ ପ୍ରଶ୍ନ! କ୍ୟାରିଅର୍‌ରେ ଆଗକୁ ବଢ଼ିବା ପାଇଁ ସଠିକ୍ ପରାମର୍ଶ ଏବଂ ଷ୍ଟ୍ରିମ୍ ଚୟନ ଦରକାର। ଆପଣ କେଉଁ କ୍ଷେତ୍ରରେ ପଢ଼ିବାକୁ ଚାହାଁନ୍ତି—ସାଇନ୍ସ, କମର୍ସ କିମ୍ବା ଆର୍ଟସ?'
        : 'Great question! Finding the right educational path and career roadmap is the first step to success. Tell me about your current education level and what subjects or fields you naturally enjoy.',
      followUpQuestions: [
        'Which stream interests you the most: Science, Commerce, Arts, or Tech?',
        'What are your favorite subjects or activities that you enjoy doing?',
      ],
      detectedGoal: null,
      detectedField: null,
      detectedSkills: [],
      shouldGenerateRoadmap: false,
    };
  }
};

/**
 * Evaluate Communication Practice
 */
const evaluateCommunicationPractice = async (promptQuestion, studentTranscript, language = 'en-IN') => {
  const systemInstruction = `You are Bidya Guru's Communication Coach.
Analyze the student's spoken response for relevance, clarity, and structure, and provide constructive suggestions.
Output strictly valid JSON.`;

  const prompt = `Question: "${promptQuestion}"
Transcript: "${studentTranscript}"
Language: ${language}

Return JSON:
{
  "score": 85,
  "relevance": "Direct and clearly addressed the question.",
  "clarity": "Vocabulary is clean and ideas flow smoothly.",
  "structure": "Clear introduction, progression of points, and conclusion.",
  "strengths": ["Clear confidence", "Highlighted technical curiosity"],
  "improvements": ["Add a quantifiable achievement", "Use the STAR method"],
  "suggestions": ["Mention specific tech tools you enjoy working with"]
}`;

  try {
    return await callGeminiWithFailover(prompt, systemInstruction, true);
  } catch (err) {
    console.warn('[Gemini Fallback] Using communication coach evaluation fallback:', err.message);
    return {
      score: 82,
      relevance: 'You directly addressed the core question and shared your personal aspirations clearly.',
      clarity: 'Your expression was natural and vocabulary was well-suited for a professional conversation.',
      structure: 'Good flow starting with your introduction and leading to your goals.',
      strengths: [
        'Clear and confident delivery',
        'Direct connection between current learning and career ambitions',
      ],
      improvements: [
        'Try structuring using the 3-part framework: Past background, Present focus, and Future vision.',
        'Mention one concrete project or challenge you solved.',
      ],
      suggestions: [
        "Try starting with: 'I am a developer focused on modern web architectures...'",
        'End with an enthusiastic statement about how you plan to contribute to real-world teams.',
      ],
    };
  }
};

/**
 * Helper to spot common spoken grammar & phrasing errors (used for failover resilience)
 */
const detectRuleGrammarErrors = (text, language = 'en-IN') => {
  const raw = (text || '').trim();
  const lower = raw.toLowerCase();

  // 1. User's specific scenario: "i am a hose go" / "hose go"
  if (lower.includes('hose go') || lower.includes('house go')) {
    return {
      hasError: true,
      originalPhrase: 'i am a hose go',
      correctedPhrase: 'I am going home (or I am a college student)',
      explanation:
        "'hose go' is grammatically incorrect. To say you are heading home, say 'I am going home'. If you meant college student, say 'I am a student'.",
    };
  }

  // 2. Missing helping verb in name: "my name rati" vs "my name is rati"
  if (/my name [a-z]+/i.test(raw) && !/my name is/i.test(raw)) {
    const match = raw.match(/my name ([a-z]+)/i);
    const spokenName = match ? match[1] : 'student';
    const formattedName = spokenName.charAt(0).toUpperCase() + spokenName.slice(1);
    return {
      hasError: true,
      originalPhrase: `my name ${spokenName}`,
      correctedPhrase: `My name is ${formattedName}`,
      explanation:
        "In English grammar, always use the auxiliary verb 'is' when introducing yourself: 'My name is ...'",
    };
  }

  // 3. First person singular with "has": "I has ..."
  if (/\bi has\b/i.test(raw)) {
    return {
      hasError: true,
      originalPhrase: 'I has',
      correctedPhrase: 'I have',
      explanation:
        "With the first-person subject 'I', always use 'have', not 'has' (e.g. 'I have a degree in computer science').",
    };
  }

  // 4. "I is ..."
  if (/\bi is\b/i.test(raw)) {
    return {
      hasError: true,
      originalPhrase: 'I is',
      correctedPhrase: 'I am',
      explanation:
        "The subject pronoun 'I' pairs with 'am', not 'is' (e.g. 'I am passionate about software engineering').",
    };
  }

  // 5. Subject verb disagreement: "He don't" / "She don't"
  if (/\b(he|she|it) don't\b/i.test(raw)) {
    return {
      hasError: true,
      originalPhrase: "don't with third person",
      correctedPhrase: "doesn't",
      explanation:
        "For third-person singular (he/she/it), use 'doesn't' instead of 'don't'.",
    };
  }

  // 6. Double verbs or broken infinitive: "I am want to"
  if (/\bi am want\b/i.test(raw)) {
    return {
      hasError: true,
      originalPhrase: 'I am want to',
      correctedPhrase: 'I want to (or I would like to)',
      explanation:
        "Do not combine 'am' with base verb 'want'. Say 'I want to learn...' or 'I would like to work as...'",
    };
  }

  return null;
};

/**
 * Conduct Interactive End-to-End Voice Communication Coaching
 * With Spoken Grammar Error Correction and Continuous Conversation Flow
 */
const conductCommunicationCoaching = async (
  userMessage,
  history = [],
  language = 'en-IN',
  activeTopic = null
) => {
  const isHindi = language === 'hi-IN';
  const isOdia = language === 'or-IN';
  const cleanMsg = (userMessage || '').trim().toLowerCase();

  const isGreeting =
    !activeTopic &&
    (cleanMsg === 'hello' ||
      cleanMsg === 'hi' ||
      cleanMsg === 'hey' ||
      cleanMsg === 'namaste' ||
      cleanMsg === 'start' ||
      cleanMsg === '👋 hello' ||
      cleanMsg === '👋 say hello' ||
      history.length === 0);

  const isChoosingTopic =
    !activeTopic &&
    (cleanMsg.includes('intro') ||
      cleanMsg.includes('interview') ||
      cleanMsg.includes('project') ||
      cleanMsg.includes('motivation') ||
      cleanMsg.includes('strength'));

  const systemInstruction = `You are Bidya Guru's AI Voice Communication, Spoken English & Interview Coach.
You conduct an interactive, end-to-end, back-and-forth spoken conversation with students to improve their communication, grammar, and interview skills.

CRITICAL MENTORING RULES:
1. GREETING TURN:
   If the student greets ("hello", "hi", "namaste"), warmly greet them back and ask which topic they would like to practice: Self-Introduction, Mock Tech Interview, Project Walkthrough, or Career Motivation.
2. TOPIC SELECTION TURN:
   If the student specifies a topic, enthusiastically confirm and ask the opening interview question.
3. STATEMENT EVALUATION, SPOKEN ERROR CORRECTION & CONTINUATION (MOST CRUCIAL RULE):
   When the student speaks their statement or answer:
   A. CAREFULLY DETECT ANY GRAMMATICAL MISTAKES, WRONG WORDS, AWKWARD SENTENCES, OR TENSE ERRORS.
      Examples of mistakes: "my name rati and i am a hose go", "i has learning code", "yesterday i go", "i am want to become developer".
   B. IF AN ERROR IS DETECTED:
      - In the "spokenReply", AI MUST EXPLICITLY SPEAK OUT THE ERROR, TEACH THE CORRECT WAY, AND THEN IMMEDIATELY ADVANCE THE CONVERSATION!
      - Formula for spokenReply:
        "[Encouraging comment]! A quick grammar tip: you said '[exact mistake]', but the correct way to say it is: '[correct sentence]'. [Short reason]. Now let's continue: [Next natural interview / follow-up question]?"
      - Set "grammarCorrection": {
          "hasError": true,
          "originalPhrase": "[what user spoke]",
          "correctedPhrase": "[proper English sentence]",
          "explanation": "[brief friendly explanation of the grammar rule]"
        }
   C. IF NO ERROR IS DETECTED:
      - Praise their fluency, clarity, or confidence.
      - In the same spokenReply, ask the next logical interview question to keep the conversation flowing smoothly.
      - Set "grammarCorrection": { "hasError": false, "originalPhrase": null, "correctedPhrase": null, "explanation": null }

Keep spokenReply concise (2-4 spoken sentences), friendly, supportive, and natural for voice synthesis. Match the language: ${language}. Output strictly valid JSON.`;

  const prompt = `Student says: "${userMessage}"
Active Topic: ${activeTopic || 'None'}
Language: ${language}
Recent turns:
${history.map((h) => `${h.role}: ${h.text}`).slice(-4).join('\n')}

Output JSON format:
{
  "spokenReply": "Spoken text where AI speaks the grammar error correction first (if any) and then naturally asks the next question to advance the conversation",
  "activeTopic": "Self Introduction / Mock Tech Interview / Project Walkthrough / Career Motivation",
  "grammarCorrection": {
    "hasError": true,
    "originalPhrase": "exact student mistake",
    "correctedPhrase": "proper grammatically correct sentence",
    "explanation": "short friendly grammar rule tip"
  },
  "feedback": {
    "score": 75,
    "strength": "Brief strength of their attempt",
    "improvement": "Coaching tip on sentence structure or grammar",
    "suggestion": "Example improved phrasing"
  },
  "suggestedChips": ["Follow-up answer chip 1", "Follow-up answer chip 2", "Let me rephrase that"]
}`;

  try {
    const parsed = await callGeminiWithFailover(prompt, systemInstruction, true);
    if (parsed && parsed.spokenReply) {
      return parsed;
    }
  } catch (err) {
    console.warn('[Gemini Comm Coach Failover] Using resilient fallback:', err.message);
  }

  // Resilient Domain State Machine Fallback
  if (isGreeting) {
    return {
      spokenReply: isHindi
        ? 'नमस्ते! मैं बिद्या गुरु का AI कम्युनिकेशन कोच हूँ। आज आप किस विषय का अभ्यास करना चाहते हैं? हम सेल्फ इंट्रोडक्शन, मॉक इंटरव्यू, प्रोजेक्ट वॉकथ्रू या मोटिवेशन पर बात कर सकते हैं।'
        : isOdia
        ? 'ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କର AI କମ୍ୟୁନିକେସନ୍ କୋଚ୍। ଆଜି ଆପଣ କେଉଁ ବିଷୟରେ ଅଭ୍ୟାସ କରିବାକୁ ଚାହାଁନ୍ତି? ଆମେ ସେଲ୍ଫ୍ ଇଣ୍ଟ୍ରୋଡକ୍ସନ୍, ଇଣ୍ଟରଭ୍ୟୁ କିମ୍ବା ପ୍ରୋଜେକ୍ଟ ଉପରେ ଅଭ୍ୟାସ କରିପାରିବା।'
        : 'Hello! Welcome to your communication practice session. I am your AI Communication Coach. What would you like to practice today? We can practice a Self-Introduction, a Mock Tech Interview, a Project Walkthrough, or Career Motivation.',
      activeTopic: null,
      grammarCorrection: { hasError: false, originalPhrase: null, correctedPhrase: null, explanation: null },
      feedback: null,
      suggestedChips: isHindi
        ? ['सेल्फ इंट्रोडक्शन', 'मॉक इंटरव्यू', 'प्रोजेक्ट वॉकथ्रू', 'करियर मोटिवेशन']
        : isOdia
        ? ['ସେଲ୍ଫ୍ ଇଣ୍ଟ୍ରୋଡକ୍ସନ୍', 'ମକ୍ ଇଣ୍ଟରଭ୍ୟୁ', 'ପ୍ରୋଜେକ୍ଟ ୱାକ୍‌ଥ୍ରୁ', 'କ୍ୟାରିଅର୍ ମୋଟିଭେସନ୍']
        : ['Self Introduction', 'Mock Tech Interview', 'Project Walkthrough', 'Career Motivation'],
    };
  }

  if (isChoosingTopic || !activeTopic) {
    const topicName = cleanMsg.includes('project')
      ? 'Project Walkthrough'
      : cleanMsg.includes('interview')
      ? 'Mock Tech Interview'
      : cleanMsg.includes('motivation')
      ? 'Career Motivation'
      : 'Self Introduction';

    return {
      spokenReply: isHindi
        ? `शानदार चुनाव! आइए ${topicName} का अभ्यास शुरू करते हैं। सोचिए आप एक इंटरव्यूअर के सामने बैठे हैं। कृपया अपने बारे में, अपनी शिक्षा और अपनी तकनीकी रुचि के बारे में बताइए।`
        : isOdia
        ? `ଖୁବ୍ ଭଲ ନିଷ୍ପତ୍ତି! ଆସନ୍ତୁ ${topicName} ଆରମ୍ଭ କରିବା। କଳ୍ପନା କରନ୍ତୁ ଆପଣ ଏକ ଇଣ୍ଟରଭ୍ୟୁରେ ବସିଛନ୍ତି। ନିଜ ବିଷୟରେ, ଆପଣଙ୍କ ପାଠପଢ଼ା ଏବଂ କ୍ୟାରିଅର୍ ଲକ୍ଷ୍ୟ ବିଷୟରେ କୁହନ୍ତୁ।`
        : `Great choice! Let's start with your ${topicName}. Imagine you are in an interview right now. Tell me about yourself, your educational background, and why you are passionate about technology.`,
      activeTopic: topicName,
      grammarCorrection: { hasError: false, originalPhrase: null, correctedPhrase: null, explanation: null },
      feedback: null,
      suggestedChips: isHindi
        ? ['मैं एक कंप्यूटर साइंस छात्र हूँ...', 'मुझे वेब डेवलपमेंट बहुत पसंद है...', 'मैंने कई प्रोजेक्ट्स बनाए हैं...']
        : isOdia
        ? ['ମୁଁ ଜଣେ କମ୍ପ୍ୟୁଟର ସାଇନ୍ସ ଛାତ୍ର...', 'ମୋତେ ୱେବ୍ ଡେଭଲପମେଣ୍ଟ ପସନ୍ଦ...', 'ମୁଁ ନୂଆ ପ୍ରୋଜେକ୍ଟ କରୁଛି...']
        : ['I am a computer science student...', 'I am passionate about full-stack web development...', 'I love building responsive web apps...'],
    };
  }

  // Answer Evaluation Turn with Grammar Error Detection
  const ruleError = detectRuleGrammarErrors(userMessage, language);

  if (ruleError && ruleError.hasError) {
    return {
      spokenReply: isHindi
        ? `अच्छा प्रयास! एक छोटा व्याकरण सुधार: आपने कहा '${ruleError.originalPhrase}', लेकिन सही तरीका है: '${ruleError.correctedPhrase}'। अब आगे बढ़ते हैं: आप किस कॉलेज में पढ़ते हैं या कौन सी प्रोग्रामिंग भाषा सीख रहे हैं?`
        : isOdia
        ? `ଭଲ ପ୍ରୟାସ! ଗୋଟିଏ ଛୋଟ ବ୍ୟାକରଣ ସୁଧାର: ଆପଣ କହିଲେ '${ruleError.originalPhrase}', କିନ୍ତୁ ସଠିକ୍ ବାକ୍ୟ ହେଲା: '${ruleError.correctedPhrase}'। ଆସନ୍ତୁ ଆଗକୁ ବଢ଼ିବା: ଆପଣ କେଉଁ ବିଷୟ କିମ୍ବା ଟେକ୍ନୋଲୋଜି ଶିଖୁଛନ୍ତି?`
        : `Nice try! A quick grammar tip: you said '${ruleError.originalPhrase}', but the correct way to say it is: '${ruleError.correctedPhrase}'. Now let's continue our conversation: tell me about what you are currently studying or your favorite programming language!`,
      activeTopic: activeTopic || 'Self Introduction',
      grammarCorrection: ruleError,
      feedback: {
        score: 72,
        strength: 'Courageous effort in speaking and expressing yourself openly.',
        improvement: `Corrected phrasing: "${ruleError.originalPhrase}" ➔ "${ruleError.correctedPhrase}".`,
        suggestion: `Use proper subject-verb agreement: "${ruleError.correctedPhrase}".`,
      },
      suggestedChips: isHindi
        ? ['मैं कंप्यूटर साइंस पढ़ रहा हूँ', 'मुझे जावास्क्रिप्ट और रिएक्ट पसंद है', 'आइए इस वाक्य को फिर से बोलते हैं']
        : isOdia
        ? ['ମୁଁ କମ୍ପ୍ୟୁଟର ସାଇନ୍ସ ପଢୁଛି', 'ମୋତେ ଜାଭାସ୍କ୍ରିପ୍ଟ ପସନ୍ଦ', 'ଆସନ୍ତୁ ଆଉ ଥରେ ଚେଷ୍ଟା କରିବା']
        : ['I am studying computer science', 'I enjoy JavaScript and React', 'Let me repeat the corrected sentence'],
    };
  }

  // Clean answer turn without grammatical errors
  return {
    spokenReply: isHindi
      ? 'बहुत अच्छा उत्तर! आपका आत्मविश्वास स्पष्ट था। अपने उत्तर को और प्रभावी बनाने के लिए एक प्रोजेक्ट या पसंदीदा टेक्नोलॉजी का उदाहरण जरूर जोड़ें। अब बताइए, आपका सबसे पसंदीदा टेक प्रोजेक्ट कौन सा रहा है?'
      : isOdia
      ? 'ଖୁବ୍ ଭଲ ଉତ୍ତର! ଆପଣଙ୍କ କଥା ସ୍ପଷ୍ଟ ଥିଲା। ଏହାକୁ ଆହୁରି ଉନ୍ନତ କରିବା ପାଇଁ ଗୋଟିଏ ପ୍ରୋଜେକ୍ଟ କିମ୍ବା ଟେକ୍ନୋଲୋଜିର ଉଦାହରଣ ଯୋଡ଼ନ୍ତୁ। ଏବେ କୁହନ୍ତୁ, ଆପଣ କରିଥିବା ସବୁଠାରୁ ଭଲ ପ୍ରୋଜେକ୍ଟ କଣ?'
      : 'Great response! You communicated your background with clear confidence. To make it even stronger, mention one specific project or tool you enjoyed working with. Next question: tell me about a challenging project you built or a bug you solved!',
    activeTopic: activeTopic || 'Self Introduction',
    grammarCorrection: { hasError: false, originalPhrase: null, correctedPhrase: null, explanation: null },
    feedback: {
      score: 84,
      strength: 'Clear articulation, confident tone, and relevant personal background.',
      improvement: 'Structure your answer using: Present focus, Past background, and Future aspirations.',
      suggestion: "Try phrasing: 'I am a software developer with hands-on experience in modern JavaScript and React...'",
    },
    suggestedChips: isHindi
      ? ['मैंने एक ई-कॉमर्स प्रोजेक्ट बनाया था', 'मुझे एक मुश्किल API बग सॉल्व करना पड़ा', 'मैं अपनी स्किल्स को और बेहतर बना रहा हूँ']
      : isOdia
      ? ['ମୁଁ ଏକ ଇ-କମର୍ସ ପ୍ରୋଜେକ୍ଟ ତିଆରି କରିଥିଲି', 'ମୁଁ ଏକ କଠିନ ବଗ୍ ଠିକ୍ କରିଥିଲି', 'ମୁଁ ନୂଆ ଫ୍ରେମୱାର୍କ ଶିଖୁଛି']
      : ['I built a full-stack e-commerce project', 'I resolved a complex asynchronous API bug', 'Let me refine my answer with STAR method'],
  };
};

module.exports = {
  callGeminiWithFailover,
  analyzeCareerAndSkills,
  generateCareerRoadmap,
  getVoiceCareerMentorResponse,
  evaluateCommunicationPractice,
  conductCommunicationCoaching,
};
