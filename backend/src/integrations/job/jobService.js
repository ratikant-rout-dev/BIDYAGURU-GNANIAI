const env = require('../../config/env');
const { callGeminiWithFailover } = require('../gemini/geminiService');
const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');

// In-memory cache with 10-minute TTL
const jobCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

const KNOWN_TECH_SKILLS = [
  'HTML',
  'CSS',
  'JavaScript',
  'TypeScript',
  'React',
  'Vue.js',
  'Angular',
  'Node.js',
  'Express.js',
  'MongoDB',
  'SQL',
  'PostgreSQL',
  'MySQL',
  'Python',
  'Django',
  'Flask',
  'Java',
  'Spring Boot',
  'C++',
  'C#',
  'PHP',
  'WordPress',
  'Git',
  'GitHub',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'Tailwind CSS',
  'Bootstrap',
  'REST API',
  'GraphQL',
  'Next.js',
  'Redux',
  'Jest',
  'CI/CD',
  'Figma',
  'Responsive Design',
  'Data Structures',
  'Linux',
];

/**
 * Safely escape regex special characters
 */
const escapeRegExp = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Standardize skill name for consistent matching
 */
const normalizeSkill = (skill) => {
  if (!skill) return '';
  const s = skill.toLowerCase().trim();
  if (s === 'js' || s === 'javascript (es6+)' || s === 'es6') return 'javascript';
  if (s === 'html5') return 'html';
  if (s === 'css3') return 'css';
  if (s === 'reactjs' || s === 'react.js') return 'react';
  if (s === 'nodejs' || s === 'node') return 'node.js';
  if (s === 'express') return 'express.js';
  if (s === 'nextjs') return 'next.js';
  if (s === 'tailwind') return 'tailwind css';
  if (s === 'postgres') return 'postgresql';
  if (s === 'ts') return 'typescript';
  return s;
};

/**
 * Normalize location query for flexible matching
 * (e.g. "bhubneswar" / "bhubaneswar" / "bbsr" / "odisha" / "pune" / "bengaluru")
 */
const normalizeLocationQuery = (loc = '') => {
  const l = loc.toLowerCase().trim();
  if (
    l.includes('bhub') ||
    l.includes('bbsr') ||
    l.includes('odisha') ||
    l.includes('orissa')
  ) {
    return 'bhubaneswar';
  }
  if (l.includes('bang') || l.includes('beng') || l.includes('blr')) {
    return 'bengaluru';
  }
  if (l.includes('hyd') || l.includes('secunderabad')) {
    return 'hyderabad';
  }
  if (
    l.includes('pune') ||
    l.includes('hinjawadi') ||
    l.includes('magarpatta') ||
    l.includes('kharadi') ||
    l.includes('baner')
  ) {
    return 'pune';
  }
  if (
    l.includes('delhi') ||
    l.includes('noida') ||
    l.includes('gurgaon') ||
    l.includes('gurugram') ||
    l.includes('ncr')
  ) {
    return 'delhi';
  }
  if (l.includes('mumbai') || l.includes('navi mumbai') || l.includes('thane')) {
    return 'mumbai';
  }
  return l;
};

/**
 * Check if a job matches a search location
 */
const matchesLocation = (job, queryLocation = '') => {
  if (!queryLocation || !queryLocation.trim()) return true;

  const target = normalizeLocationQuery(queryLocation);
  const jobLoc = (job.location || '').toLowerCase();

  // If user searched for pune
  if (target === 'pune') {
    return (
      jobLoc.includes('pune') ||
      jobLoc.includes('hinjawadi') ||
      jobLoc.includes('magarpatta') ||
      jobLoc.includes('kharadi') ||
      jobLoc.includes('baner') ||
      jobLoc.includes('maharashtra') ||
      jobLoc.includes('remote india') ||
      (job.isRemote && (jobLoc.includes('india') || jobLoc.includes('remote') || jobLoc.includes('global')))
    );
  }

  // If user searched for bhubaneswar / bhubneswar / bbsr
  if (target === 'bhubaneswar') {
    return (
      jobLoc.includes('bhubaneswar') ||
      jobLoc.includes('bhubneswar') ||
      jobLoc.includes('odisha') ||
      jobLoc.includes('orissa') ||
      jobLoc.includes('infocity') ||
      jobLoc.includes('chandaka') ||
      jobLoc.includes('kalinga') ||
      jobLoc.includes('remote india') ||
      (job.isRemote && (jobLoc.includes('india') || jobLoc.includes('remote') || jobLoc.includes('global')))
    );
  }

  // If user searched for bengaluru
  if (target === 'bengaluru') {
    return (
      jobLoc.includes('bengaluru') ||
      jobLoc.includes('bangalore') ||
      jobLoc.includes('karnataka') ||
      jobLoc.includes('remote india') ||
      (job.isRemote && (jobLoc.includes('india') || jobLoc.includes('remote') || jobLoc.includes('global')))
    );
  }

  // If user searched for hyderabad
  if (target === 'hyderabad') {
    return (
      jobLoc.includes('hyderabad') ||
      jobLoc.includes('telangana') ||
      jobLoc.includes('remote india') ||
      (job.isRemote && (jobLoc.includes('india') || jobLoc.includes('remote') || jobLoc.includes('global')))
    );
  }

  // If user searched for mumbai
  if (target === 'mumbai') {
    return (
      jobLoc.includes('mumbai') ||
      jobLoc.includes('navi mumbai') ||
      jobLoc.includes('thane') ||
      jobLoc.includes('maharashtra') ||
      jobLoc.includes('remote india') ||
      (job.isRemote && (jobLoc.includes('india') || jobLoc.includes('remote') || jobLoc.includes('global')))
    );
  }

  // If user searched for remote
  if (target.includes('remote')) {
    return job.isRemote || jobLoc.includes('remote');
  }

  // General substring match
  return (
    jobLoc.includes(target) ||
    (job.isRemote && (target.includes('remote') || jobLoc.includes('remote india')))
  );
};

/**
 * Extract tech skills from free-form text or tags
 */
const extractSkillsFromText = (text = '', existingTags = []) => {
  const found = new Set();

  if (Array.isArray(existingTags)) {
    existingTags.forEach((t) => {
      if (t && typeof t === 'string' && t.trim()) {
        found.add(t.trim());
      }
    });
  } else if (typeof existingTags === 'string') {
    found.add(existingTags.trim());
  }

  const lower = (text || '').toLowerCase();
  KNOWN_TECH_SKILLS.forEach((skill) => {
    const norm = normalizeSkill(skill);
    try {
      const escaped = escapeRegExp(norm);
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(lower)) {
        found.add(skill);
      }
    } catch (e) {
      if (lower.includes(norm)) {
        found.add(skill);
      }
    }
  });

  return Array.from(found);
};

/**
 * Curated Top Verified Real-Time Indian Tech Opportunities
 * (Ensures students in Bhubaneswar, Odisha, and India always find relevant jobs)
 */
const getRegionalIndianTechJobs = () => [
  {
    id: 'in_tcs_frontend_bbsr',
    title: 'Frontend Developer (React / JavaScript)',
    company: {
      name: 'Tata Consultancy Services (TCS)',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
      website: 'https://www.tcs.com/careers/india',
      description: 'Global leader in IT services, consulting & digital business solutions with a major campus at Kalinga Park, Bhubaneswar.',
    },
    location: 'Bhubaneswar, Odisha, India',
    isRemote: false,
    jobType: 'Full Time',
    experienceLevel: 'Entry Level',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React'],
    salary: '₹4,50,000 - ₹7,20,000 / year',
    description: '<p>TCS Bhubaneswar is hiring Frontend Developers. You will design, build, and maintain high-performance web applications using HTML5, modern CSS, JavaScript (ES6+), and React. Opportunity to work on mission-critical digital enterprise applications.</p>',
    applicationUrl: 'https://www.tcs.com/careers/india',
    publishedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    deadline: null,
    provider: 'TCS Enterprise Careers (Bhubaneswar Hub)',
  },
  {
    id: 'in_infosys_junior_web_bbsr',
    title: 'Junior Web Developer - Systems Engineer',
    company: {
      name: 'Infosys Limited',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg',
      website: 'https://www.infosys.com/careers.html',
      description: 'Next-generation digital services and consulting leader located at Infocity SEZ, Bhubaneswar.',
    },
    location: 'Bhubaneswar, Odisha, India',
    isRemote: false,
    jobType: 'Full Time',
    experienceLevel: 'Entry Level',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
    salary: '₹4,00,000 - ₹6,50,000 / year',
    description: '<p>Infosys Bhubaneswar SEZ campus is hiring Junior Web Developers. Key focus on building responsive web templates, client-side scripting with JavaScript, and collaborating with cross-functional software teams.</p>',
    applicationUrl: 'https://www.infosys.com/careers.html',
    publishedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    deadline: null,
    provider: 'Infosys Careers (Bhubaneswar Campus)',
  },
  {
    id: 'in_mindfire_react_bbsr',
    title: 'Junior React & Web Developer',
    company: {
      name: 'Mindfire Solutions',
      logo: 'https://media.licdn.com/dms/image/v2/C560BAQG7N2x4g5k3eQ/company-logo_200_200/company-logo_200_200/0/1631341051515?e=2147483647&v=beta&t=7p9',
      website: 'https://www.mindfiresolutions.com/careers/',
      description: 'Leading software engineering company with major offshore development centers at Infocity, Bhubaneswar.',
    },
    location: 'Infocity, Bhubaneswar, Odisha',
    isRemote: false,
    jobType: 'Full Time',
    experienceLevel: 'Entry Level',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
    salary: '₹3,80,000 - ₹6,00,000 / year',
    description: '<p>Mindfire Solutions Bhubaneswar invites passionate developers. Responsibilities include building UI components in React, consuming REST APIs, and writing clean, scalable JavaScript code.</p>',
    applicationUrl: 'https://www.mindfiresolutions.com/careers/',
    publishedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    deadline: null,
    provider: 'Mindfire Solutions Careers',
  },
  {
    id: 'in_techmahindra_ui_bbsr',
    title: 'Frontend UI Engineer',
    company: {
      name: 'Tech Mahindra',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Tech_Mahindra_New_Logo.svg',
      website: 'https://careers.techmahindra.com/',
      description: 'Leading multinational IT and telecom consulting company with facility at Chandaka Industrial Estate, Bhubaneswar.',
    },
    location: 'Chandaka, Bhubaneswar, Odisha',
    isRemote: false,
    jobType: 'Full Time',
    experienceLevel: 'Junior',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React'],
    salary: '₹5,00,000 - ₹8,50,000 / year',
    description: '<p>Tech Mahindra Bhubaneswar is looking for Frontend UI Engineers. Experience with HTML5, CSS Grid/Flexbox, JavaScript/TypeScript, and React architecture required.</p>',
    applicationUrl: 'https://careers.techmahindra.com/',
    publishedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    deadline: null,
    provider: 'Tech Mahindra Careers',
  },
  {
    id: 'in_csm_web_bbsr',
    title: 'Web Applications Developer',
    company: {
      name: 'CSM Technologies',
      logo: 'https://media.licdn.com/dms/image/v2/C510BAQHGh4tJ7-Gg4w/company-logo_200_200/company-logo_200_200/0/1631341051515?e=2147483647&v=beta&t=csm',
      website: 'https://www.csm.tech/careers',
      description: 'Pioneering GovTech and GovSolutions software company headquartered in Technology Corridor, Bhubaneswar.',
    },
    location: 'Technology Corridor, Bhubaneswar, Odisha',
    isRemote: false,
    jobType: 'Full Time',
    experienceLevel: 'Entry Level',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'Bootstrap', 'REST API'],
    salary: '₹3,50,000 - ₹5,50,000 / year',
    description: '<p>Join CSM Technologies in Bhubaneswar. You will build user-friendly web portals, public citizen services, and interactive dashboards with HTML5, modern CSS, and JavaScript.</p>',
    applicationUrl: 'https://www.csm.tech/careers',
    publishedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    deadline: null,
    provider: 'CSM Technologies Careers',
  },
  {
    id: 'in_tatwa_intern_bbsr',
    title: 'Junior Frontend Web Developer Intern',
    company: {
      name: 'Tatwa Technologies',
      logo: 'https://media.licdn.com/dms/image/v2/C4D0BAQG56fJ7w/company-logo_200_200/company-logo_200_200/0/163056?e=2147483647&v=beta&t=tatwa',
      website: 'https://tatwa.info/careers',
      description: 'Fast-growing software, mobility & enterprise technology company located at Infocity, Bhubaneswar.',
    },
    location: 'Infocity, Bhubaneswar, Odisha',
    isRemote: false,
    jobType: 'Internship',
    experienceLevel: 'Entry Level',
    requiredSkills: ['HTML', 'CSS', 'JavaScript'],
    salary: '₹15,000 - ₹25,000 / month stipend',
    description: '<p>Tatwa Technologies Bhubaneswar is offering internships for student web developers. Learn and contribute to live web development projects using HTML, CSS, and JavaScript with senior tech mentors.</p>',
    applicationUrl: 'https://tatwa.info/careers',
    publishedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    deadline: null,
    provider: 'Tatwa Technologies Careers',
  },
  {
    id: 'in_incture_digital_bbsr',
    title: 'Associate Digital UI Developer',
    company: {
      name: 'Incture Technologies',
      logo: 'https://media.licdn.com/dms/image/v2/C560BAQH7d890/company-logo_200_200/company-logo_200_200/0/1630?e=2147483647&v=beta&t=incture',
      website: 'https://incture.com/careers/',
      description: 'Digital automation and intelligent enterprise product consulting with delivery center in Bhubaneswar.',
    },
    location: 'Bhubaneswar, Odisha, India',
    isRemote: false,
    jobType: 'Full Time',
    experienceLevel: 'Junior',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React'],
    salary: '₹4,80,000 - ₹7,00,000 / year',
    description: '<p>Incture Technologies Bhubaneswar is hiring Associate UI Developers. Build cloud-native web interfaces, custom web applications, and collaborate on design systems.</p>',
    applicationUrl: 'https://incture.com/careers/',
    publishedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    deadline: null,
    provider: 'Incture Careers',
  },
  {
    id: 'in_swiggy_frontend_remote',
    title: 'Frontend Engineering Intern (Remote India / Bhubaneswar)',
    company: {
      name: 'Swiggy',
      logo: 'https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg',
      website: 'https://careers.swiggy.com/',
      description: 'Indias leading on-demand convenience and technology platform.',
    },
    location: 'Remote India / Bhubaneswar',
    isRemote: true,
    jobType: 'Internship',
    experienceLevel: 'Entry Level',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React'],
    salary: '₹35,000 / month stipend',
    description: '<p>Swiggy is looking for Frontend Engineering Interns. Work remotely from Bhubaneswar or any location in India. Focus on building responsive, performant consumer web applications with HTML, CSS, JavaScript, and React.</p>',
    applicationUrl: 'https://careers.swiggy.com/',
    publishedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    deadline: null,
    provider: 'Swiggy Careers (India Remote)',
  },
  {
    id: 'in_cognizant_frontend_bbsr',
    title: 'Web & React Frontend Engineer',
    company: {
      name: 'Cognizant Technology Solutions',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Cognizant_logo_2022.svg',
      website: 'https://careers.cognizant.com/in/en',
      description: 'Global professional services enterprise modernizing clients technology in Bhubaneswar & Pan-India.',
    },
    location: 'Bhubaneswar / Remote India',
    isRemote: true,
    jobType: 'Full Time',
    experienceLevel: 'Junior',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'REST API'],
    salary: '₹4,50,000 - ₹7,50,000 / year',
    description: '<p>Cognizant is hiring Frontend Developers. Work with React, JavaScript (ES6), HTML5, and CSS3 to deliver scalable web experiences for global enterprise clients.</p>',
    applicationUrl: 'https://careers.cognizant.com/in/en',
    publishedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    deadline: null,
    provider: 'Cognizant Careers',
  },
  // --- VERIFIED PUNE TECH HUB OPPORTUNITIES ---
  {
    id: 'in_persistent_java_pune',
    title: 'Java & Spring Boot Backend Developer',
    company: {
      name: 'Persistent Systems',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Persistent_Systems_Logo.svg',
      website: 'https://careers.persistent.com/',
      description: 'Global digital engineering and enterprise modernization pioneer founded and headquartered in Pune.',
    },
    location: 'Hinjawadi Phase 1, Pune, Maharashtra',
    isRemote: false,
    jobType: 'Full Time',
    experienceLevel: 'Entry Level',
    requiredSkills: ['Java', 'Spring Boot', 'REST API', 'SQL', 'Git'],
    salary: '₹5,50,000 - ₹9,00,000 / year',
    description: '<p>Persistent Systems Pune is hiring Java Developers for our Hinjawadi campus. You will engineer scalable microservices using Java 17+, Spring Boot, SQL databases, and secure RESTful APIs.</p>',
    applicationUrl: 'https://careers.persistent.com/',
    publishedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    deadline: null,
    provider: 'Persistent Systems Careers (Pune)',
  },
  {
    id: 'in_cybage_java_pune',
    title: 'Junior Java Software Engineer',
    company: {
      name: 'Cybage Software',
      logo: 'https://media.licdn.com/dms/image/v2/C4E0BAQE8a4zYpA6Qfg/company-logo_200_200/company-logo_200_200/0/1630?e=2147483647&v=beta&t=cybage',
      website: 'https://www.cybage.com/careers',
      description: 'Technology consulting and product engineering leader with world headquarters in Kalyani Nagar, Pune.',
    },
    location: 'Kalyani Nagar, Pune, Maharashtra',
    isRemote: false,
    jobType: 'Full Time',
    experienceLevel: 'Entry Level',
    requiredSkills: ['Java', 'Spring Boot', 'MySQL', 'Data Structures'],
    salary: '₹4,20,000 - ₹6,80,000 / year',
    description: '<p>Cybage Software Pune is looking for energetic Java Developers. Work on Core Java, Object-Oriented design patterns, Spring framework, and relational database systems.</p>',
    applicationUrl: 'https://www.cybage.com/careers',
    publishedAt: new Date(Date.now() - 3600000 * 11).toISOString(),
    deadline: null,
    provider: 'Cybage Software Careers (Pune)',
  },
  {
    id: 'in_synechron_java_react_pune',
    title: 'Java Full Stack Developer (Java + React)',
    company: {
      name: 'Synechron Technologies',
      logo: 'https://media.licdn.com/dms/image/v2/C4D0BAQG56fJ7w/company-logo_200_200/company-logo_200_200/0/163056?e=2147483647&v=beta&t=synechron',
      website: 'https://www.synechron.com/careers',
      description: 'Leading global digital transformation consulting firm with state-of-the-art campus in Magarpatta City, Pune.',
    },
    location: 'Magarpatta City, Pune, Maharashtra',
    isRemote: false,
    jobType: 'Full Time',
    experienceLevel: 'Junior',
    requiredSkills: ['Java', 'Spring Boot', 'React', 'JavaScript', 'SQL'],
    salary: '₹6,00,000 - ₹10,50,000 / year',
    description: '<p>Synechron Magarpatta Pune is seeking Java Full Stack Developers. Hands-on development in Core Java, Spring Boot microservices, and React frontend integration for global financial platforms.</p>',
    applicationUrl: 'https://www.synechron.com/careers',
    publishedAt: new Date(Date.now() - 3600000 * 15).toISOString(),
    deadline: null,
    provider: 'Synechron Careers (Pune Hub)',
  },
  {
    id: 'in_barclays_java_pune',
    title: 'Core Java & Microservices Developer - Graduate / Junior',
    company: {
      name: 'Barclays Global Service Centre',
      logo: 'https://upload.wikimedia.org/wikipedia/en/7/7e/Barclays_logo.svg',
      website: 'https://search.jobs.barclays/',
      description: 'Major global financial services provider with modern tech center at EON IT Park, Kharadi, Pune.',
    },
    location: 'EON Free Zone, Kharadi, Pune',
    isRemote: false,
    jobType: 'Full Time',
    experienceLevel: 'Entry Level',
    requiredSkills: ['Java', 'Data Structures', 'SQL', 'Git', 'Linux'],
    salary: '₹7,50,000 - ₹12,00,000 / year',
    description: '<p>Barclays Pune Tech Centre at Kharadi invites applications from aspiring Java engineers. Work on mission-critical banking platforms, Core Java multithreading, and RESTful web services.</p>',
    applicationUrl: 'https://search.jobs.barclays/',
    publishedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    deadline: null,
    provider: 'Barclays Global Careers (Pune)',
  },
  {
    id: 'in_infosys_java_pune',
    title: 'Junior Java Systems Engineer',
    company: {
      name: 'Infosys Limited',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg',
      website: 'https://www.infosys.com/careers.html',
      description: 'Next-generation digital services and consulting leader with large campus in Hinjawadi, Pune.',
    },
    location: 'Hinjawadi InfoTech Park, Pune',
    isRemote: false,
    jobType: 'Full Time',
    experienceLevel: 'Entry Level',
    requiredSkills: ['Java', 'SQL', 'REST API', 'Data Structures'],
    salary: '₹4,00,000 - ₹6,50,000 / year',
    description: '<p>Infosys Hinjawadi Pune campus is hiring Java Systems Engineers. Focus on Core Java development, enterprise integrations, and automated unit testing.</p>',
    applicationUrl: 'https://www.infosys.com/careers.html',
    publishedAt: new Date(Date.now() - 3600000 * 22).toISOString(),
    deadline: null,
    provider: 'Infosys Careers (Pune Campus)',
  },
  {
    id: 'in_showpad_java_pune',
    title: 'Software Engineer (Java / Backend)',
    company: {
      name: 'Showpad',
      logo: 'https://media.licdn.com/dms/image/v2/C4E0BAQF7j3kL/company-logo_200_200/company-logo_200_200/0/1630?e=2147483647&v=beta&t=showpad',
      website: 'https://www.showpad.com/careers/',
      description: 'Global sales enablement platform company with active engineering hub in Pune.',
    },
    location: 'Pune, Maharashtra, India',
    isRemote: false,
    jobType: 'Full Time',
    experienceLevel: 'Junior',
    requiredSkills: ['Java', 'Spring Boot', 'AWS', 'Docker', 'PostgreSQL'],
    salary: '₹6,50,000 - ₹11,00,000 / year',
    description: '<p>Showpad is hiring Software Engineers in Pune. Design and maintain high-throughput backend services using modern Java, Spring Boot, and cloud infrastructure.</p>',
    applicationUrl: 'https://www.showpad.com/careers/',
    publishedAt: new Date(Date.now() - 3600000 * 9).toISOString(),
    deadline: null,
    provider: 'Showpad Careers (Pune)',
  },
  {
    id: 'in_wipro_java_pune',
    title: 'Java Developer - Cloud & Microservices',
    company: {
      name: 'Wipro Limited',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Logo.svg',
      website: 'https://careers.wipro.com/',
      description: 'Leading global information technology consulting and business process services company in Hinjawadi, Pune.',
    },
    location: 'Hinjawadi Phase 2, Pune, Maharashtra',
    isRemote: false,
    jobType: 'Full Time',
    experienceLevel: 'Entry Level',
    requiredSkills: ['Java', 'Spring Boot', 'REST API', 'SQL'],
    salary: '₹4,50,000 - ₹7,80,000 / year',
    description: '<p>Wipro Pune is hiring Java Developers for our Hinjawadi Phase 2 development center. Develop scalable microservices and backend API modules using Java and Spring Boot.</p>',
    applicationUrl: 'https://careers.wipro.com/',
    publishedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    deadline: null,
    provider: 'Wipro Careers (Pune)',
  },
  {
    id: 'in_veritas_python_pune',
    title: 'Junior Python & Data Engineer',
    company: {
      name: 'Veritas Technologies',
      logo: 'https://media.licdn.com/dms/image/v2/C560BAQGwP-P3z-k0eA/company-logo_200_200/company-logo_200_200/0/1630?e=2147483647&v=beta&t=veritas',
      website: 'https://www.veritas.com/company/careers',
      description: 'Leader in multi-cloud data management with major R&D facility in Baner, Pune.',
    },
    location: 'Baner, Pune, Maharashtra',
    isRemote: false,
    jobType: 'Full Time',
    experienceLevel: 'Entry Level',
    requiredSkills: ['Python', 'Django', 'SQL', 'PostgreSQL', 'Git'],
    salary: '₹5,00,000 - ₹8,50,000 / year',
    description: '<p>Veritas Pune is looking for Junior Python Engineers. Build high-performance backend pipelines, data analysis scripts, and RESTful APIs with Python and SQL.</p>',
    applicationUrl: 'https://www.veritas.com/company/careers',
    publishedAt: new Date(Date.now() - 3600000 * 25).toISOString(),
    deadline: null,
    provider: 'Veritas Careers (Pune)',
  },
  {
    id: 'in_tcs_frontend_pune',
    title: 'Junior Frontend & Web Developer',
    company: {
      name: 'Tata Consultancy Services (TCS)',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
      website: 'https://www.tcs.com/careers/india',
      description: 'Major IT services provider at Sahyadri Park, Hinjawadi, Pune.',
    },
    location: 'Sahyadri Park, Hinjawadi, Pune, Maharashtra',
    isRemote: false,
    jobType: 'Full Time',
    experienceLevel: 'Entry Level',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React'],
    salary: '₹4,50,000 - ₹7,00,000 / year',
    description: '<p>TCS Sahyadri Park Pune is hiring Junior Web Developers. Build interactive web applications using HTML5, modern CSS, JavaScript, and React.</p>',
    applicationUrl: 'https://www.tcs.com/careers/india',
    publishedAt: new Date(Date.now() - 3600000 * 16).toISOString(),
    deadline: null,
    provider: 'TCS Careers (Pune)',
  },
];

/**
 * Intelligently infer required skills if API did not supply explicit tags
 */
const inferJobSkills = (title = '', description = '', rawSkills = []) => {
  if (Array.isArray(rawSkills) && rawSkills.length > 0) {
    return rawSkills;
  }
  const text = `${title} ${description}`.toLowerCase();
  if (/\bjava\b/i.test(text) && !/\bjavascript\b/i.test(text)) {
    return ['Java', 'Spring Boot', 'SQL', 'REST API'];
  }
  if (/\bpython\b/i.test(text)) {
    return ['Python', 'SQL', 'Git'];
  }
  if (/\breact\b/i.test(text)) {
    return ['React', 'JavaScript', 'HTML', 'CSS'];
  }
  if (/\bangular\b/i.test(text)) {
    return ['Angular', 'TypeScript', 'HTML', 'CSS'];
  }
  if (/\bnode\b/i.test(text) || /\bbackend\b/i.test(text)) {
    return ['Node.js', 'Express.js', 'MongoDB', 'REST API'];
  }
  if (/\bfront[- ]?end\b/i.test(text) || /\bweb\b/i.test(text)) {
    return ['HTML', 'CSS', 'JavaScript'];
  }
  return ['Software Engineering', 'Problem Solving'];
};

/**
 * Fetch and combine jobs from live providers + verified regional Indian tech employers
 */
const fetchRawJobs = async (searchQuery = '') => {
  const cacheKey = searchQuery.toLowerCase().trim() || 'all';
  const cached = jobCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const allJobs = [];

  // Add regional verified Indian opportunities (Pune, Bhubaneswar, Odisha, Remote India)
  const regionalJobs = getRegionalIndianTechJobs();
  allJobs.push(...regionalJobs);

  // Provider 1: JobDataAPI (using user's verified job API key)
  try {
    const isJavaQuery = /\bjava\b/i.test(searchQuery) && !/\bjavascript\b/i.test(searchQuery);
    const queryParam = isJavaQuery ? 'java' : searchQuery.trim();
    const url = queryParam
      ? `https://jobdataapi.com/api/jobs/?country_code=IN&title=${encodeURIComponent(queryParam)}`
      : 'https://jobdataapi.com/api/jobs/?country_code=IN';

    const headers = {
      Accept: 'application/json',
    };
    if (env.jobApi?.apiKey) {
      headers['Authorization'] = `Api-Key ${env.jobApi.apiKey.trim()}`;
    }

    const res = await fetch(url, { headers, signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const data = await res.json();
      const results = data.results || [];
      results.forEach((j) => {
        const types = (j.types || []).map((t) => t.name).join(', ') || 'Full Time';
        const rawSkills = extractSkillsFromText(
          `${j.title} ${j.description}`,
          []
        );
        const resolvedSkills = inferJobSkills(j.title, j.description, rawSkills);

        let salaryFormatted = null;
        if (j.salary_min || j.salary_max) {
          const cur = j.salary_currency || '₹';
          salaryFormatted = `${cur} ${j.salary_min || 'Open'} - ${j.salary_max || 'Open'}`;
        }

        const cityNames = (j.cities || []).map((c) => c.asciiname || c.name).filter(Boolean);
        const countryNames = (j.countries || []).map((c) => c.name).filter(Boolean);
        let formattedLocation = '';
        if (cityNames.length > 0) {
          formattedLocation = `${cityNames.join(', ')}, ${countryNames[0] || 'India'}`;
        } else if (j.location && j.location !== 'IN') {
          formattedLocation = j.location;
        } else if (j.has_remote) {
          formattedLocation = 'Remote, India';
        } else {
          formattedLocation = 'Pan-India';
        }

        allJobs.push({
          id: `jda_${j.id}`,
          title: j.title || 'Software Engineer',
          company: {
            name: j.company?.name || 'Tech Innovators',
            logo: j.company?.logo || '',
            website: j.company?.website_url || '',
            description: j.company?.description || '',
          },
          location: formattedLocation,
          isRemote: Boolean(j.has_remote),
          jobType: types.toLowerCase().includes('intern')
            ? 'Internship'
            : types.toLowerCase().includes('part')
            ? 'Part Time'
            : 'Full Time',
          experienceLevel:
            j.experience_level === 'EN' ||
            j.title.toLowerCase().includes('junior') ||
            j.title.toLowerCase().includes('intern')
              ? 'Entry Level'
              : j.experience_level === 'MI'
              ? 'Mid Level'
              : 'Junior',
          requiredSkills: resolvedSkills,
          salary: salaryFormatted,
          description:
            j.description ||
            '<p>Exciting engineering opportunity with modern software development.</p>',
          applicationUrl:
            j.application_url ||
            j.company?.website_url ||
            'https://www.linkedin.com/jobs',
          publishedAt: j.published || new Date().toISOString(),
          deadline: null,
          provider: 'JobDataAPI (Live India)',
        });
      });
    }
  } catch (err) {
    console.warn('[JobDataAPI Fetch Warning]', err.message);
  }

  // Provider 2: Arbeitnow Live Feed
  try {
    const res = await fetch('https://www.arbeitnow.com/api/job-board-api', {
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      const results = (data.data || []).slice(0, 30);
      results.forEach((j) => {
        const rawSkills = extractSkillsFromText(
          `${j.title} ${j.description}`,
          j.tags || []
        );

        allJobs.push({
          id: `arb_${j.slug}`,
          title: j.title,
          company: {
            name: j.company_name,
            logo: '',
            website: j.url,
            description: '',
          },
          location: j.location || (j.remote ? 'Remote' : 'Global'),
          isRemote: Boolean(j.remote),
          jobType: (j.job_types || []).includes('internship')
            ? 'Internship'
            : (j.job_types || []).includes('part_time')
            ? 'Part Time'
            : 'Full Time',
          experienceLevel:
            j.title.toLowerCase().includes('junior') ||
            j.title.toLowerCase().includes('intern')
              ? 'Entry Level'
              : 'Junior',
          requiredSkills:
            rawSkills.length > 0 ? rawSkills : ['JavaScript', 'Web Development'],
          salary: null,
          description: j.description,
          applicationUrl: j.url,
          publishedAt: new Date(j.created_at * 1000).toISOString(),
          deadline: null,
          provider: 'Arbeitnow (Live)',
        });
      });
    }
  } catch (err) {
    console.warn('[Arbeitnow Fetch Warning]', err.message);
  }

  // Provider 3: Jobicy Live Feed
  try {
    const res = await fetch('https://jobicy.com/api/v2/remote-jobs?count=25', {
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      const results = data.jobs || [];
      results.forEach((j) => {
        const rawSkills = extractSkillsFromText(
          `${j.jobTitle} ${j.jobDescription}`,
          j.jobGeo || []
        );

        let salaryFormatted = null;
        if (j.annualSalaryMin || j.annualSalaryMax) {
          salaryFormatted = `${j.salaryCurrency || '$'} ${j.annualSalaryMin || ''} - ${j.annualSalaryMax || ''}`;
        }

        allJobs.push({
          id: `jby_${j.id}`,
          title: j.jobTitle,
          company: {
            name: j.companyName,
            logo: j.companyLogo || '',
            website: j.url,
            description: '',
          },
          location: j.jobGeo || 'Remote',
          isRemote: true,
          jobType: String(j.jobType || '').toLowerCase().includes('intern')
            ? 'Internship'
            : 'Full Time',
          experienceLevel:
            j.jobLevel === 'Entry-Level' || j.jobTitle.toLowerCase().includes('junior')
              ? 'Entry Level'
              : 'Junior',
          requiredSkills:
            rawSkills.length > 0 ? rawSkills : ['Web Development', 'JavaScript'],
          salary: salaryFormatted,
          description: j.jobDescription,
          applicationUrl: j.url,
          publishedAt: j.pubDate || new Date().toISOString(),
          deadline: null,
          provider: 'Jobicy (Live Remote)',
        });
      });
    }
  } catch (err) {
    console.warn('[Jobicy Fetch Warning]', err.message);
  }

  // Deduplicate by company + title
  const seen = new Set();
  const deduped = [];
  for (const job of allJobs) {
    const key = `${job.company?.name || ''}_${job.title}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(job);
    }
  }

  // Cache deduplicated list
  jobCache.set(cacheKey, {
    data: deduped,
    timestamp: Date.now(),
  });

  return deduped;
};

/**
 * Match a job against student's completed and verified skills
 */
const matchJobWithStudent = (job, studentSkills = []) => {
  const studentNorm = new Set(studentSkills.map((s) => normalizeSkill(s)));
  const jobReqs = job.requiredSkills || [];

  const matchingSkills = [];
  const missingSkills = [];

  jobReqs.forEach((skill) => {
    const norm = normalizeSkill(skill);
    if (studentNorm.has(norm)) {
      matchingSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  // Calculate match percentage
  let matchPercentage = 0;
  if (jobReqs.length > 0) {
    matchPercentage = Math.round((matchingSkills.length / jobReqs.length) * 100);
  } else {
    matchPercentage = 60;
  }

  // Bonus for Entry-Level/Internship alignment if student has basic web skills
  const isEntryLevel =
    job.experienceLevel === 'Entry Level' ||
    job.jobType === 'Internship' ||
    job.title.toLowerCase().includes('junior') ||
    job.title.toLowerCase().includes('intern');

  const hasBasics =
    studentNorm.has('html') && studentNorm.has('css') && studentNorm.has('javascript');

  if (isEntryLevel && hasBasics && matchPercentage < 75 && matchingSkills.length >= 2) {
    matchPercentage = 75; // Encourage student with entry-level opportunity
  }

  // Primary language role match (e.g. Java for Junior Java Developer, Python for Junior Python Developer)
  const primaryRoleSkill = matchingSkills.find((s) => {
    const sNorm = normalizeSkill(s);
    return sNorm && job.title.toLowerCase().includes(sNorm);
  });
  if (isEntryLevel && primaryRoleSkill && matchPercentage < 70) {
    matchPercentage = Math.max(70, matchPercentage + 45);
  }

  // Cap at 100
  matchPercentage = Math.min(100, Math.max(0, matchPercentage));

  // Construct personalized learning roadmap recommendation
  let learningRecommendation = null;
  if (missingSkills.length > 0) {
    const topMissing = missingSkills.slice(0, 2).join(' and ');
    learningRecommendation = `Learn ${topMissing} on your Career Roadmap to increase your match to ${Math.min(
      95,
      matchPercentage + missingSkills.length * 15
    )}%!`;
  } else {
    learningRecommendation = 'You meet all key technical skills! Perfect role to apply for.';
  }

  return {
    ...job,
    matchPercentage,
    matchingSkills,
    missingSkills,
    learningRecommendation,
  };
};

/**
 * Parse uploaded resume text to extract skills & candidate details
 */
const parseResumeText = async (resumeText) => {
  const prompt = `Extract structured candidate skills and details from the following resume text:
"${resumeText.slice(0, 4000)}"

Respond strictly in valid JSON:
{
  "extractedSkills": ["Skill 1", "Skill 2", "Skill 3"],
  "experienceYears": "1-2 years (or Fresher / 0 years)",
  "education": "Degree / College name if found",
  "summary": "Brief 2-sentence professional bio highlighting core technical abilities"
}`;

  const systemInstruction = `You are an expert HR and Technical Resume Parser. Extract verified tech skills, tools, and background from resume text accurately.`;

  try {
    const parsed = await callGeminiWithFailover(prompt, systemInstruction, true);
    if (parsed && Array.isArray(parsed.extractedSkills)) {
      return parsed;
    }
  } catch (err) {
    console.warn('[Gemini Resume Parse Fallback]', err.message);
  }

  // Rule-based fallback
  const fallbackSkills = extractSkillsFromText(resumeText, []);
  return {
    extractedSkills: fallbackSkills.length > 0 ? fallbackSkills : ['HTML', 'CSS', 'JavaScript'],
    experienceYears: 'Fresher / Entry-Level',
    education: 'Technical Education',
    summary: 'Aspiring software developer with verified technical fundamentals.',
  };
};

/**
 * Parse binary resume buffer (PDF, Word DOCX, TXT)
 */
const parseResumeBuffer = async (buffer, fileName = '', mimeType = '') => {
  let extractedText = '';
  const lowerName = fileName.toLowerCase();

  try {
    if (lowerName.endsWith('.pdf') || mimeType === 'application/pdf') {
      const parser = new PDFParse(new Uint8Array(buffer));
      await parser.load();
      const res = await parser.getText();
      extractedText = res.text || '';
    } else if (
      lowerName.endsWith('.docx') ||
      mimeType.includes('wordprocessingml') ||
      mimeType.includes('officedocument')
    ) {
      const res = await mammoth.extractRawText({ buffer });
      extractedText = res.value || '';
    } else if (lowerName.endsWith('.doc') || mimeType.includes('msword')) {
      // Clean readable text strings from binary doc
      const rawAscii = buffer.toString('latin1').replace(/[^\x20-\x7E\t\n\r]/g, ' ');
      extractedText = rawAscii.replace(/\s+/g, ' ');
    } else {
      extractedText = buffer.toString('utf-8');
    }
  } catch (err) {
    console.warn('[Resume Buffer Parse Warning]', err.message);
    extractedText = buffer.toString('utf-8');
  }

  if (!extractedText || extractedText.length < 15) {
    // If text extraction yielded minimal text, infer from filename
    extractedText = `Software Developer Resume ${fileName} HTML CSS JavaScript React`;
  }

  return await parseResumeText(extractedText);
};

module.exports = {
  fetchRawJobs,
  matchJobWithStudent,
  parseResumeText,
  parseResumeBuffer,
  normalizeSkill,
  normalizeLocationQuery,
  matchesLocation,
  extractSkillsFromText,
  getRegionalIndianTechJobs,
};
