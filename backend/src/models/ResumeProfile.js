const mongoose = require('mongoose');

const linkItemSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: '' },
    url: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const educationEntrySchema = new mongoose.Schema(
  {
    institution: { type: String, trim: true, default: '' },
    degree: { type: String, trim: true, default: '' },
    fieldOfStudy: { type: String, trim: true, default: '' },
    startDate: { type: String, trim: true, default: '' },
    endDate: { type: String, trim: true, default: '' },
    currentlyStudying: { type: Boolean, default: false },
    gradeType: {
      type: String,
      enum: ['CGPA', 'GPA', 'Percentage', 'Score', 'Other', ''],
      default: '',
    },
    grade: { type: String, trim: true, default: '' },
    relevantCoursework: { type: [String], default: [] },
    description: { type: String, trim: true, default: '' },
  },
  { _id: true }
);

const experienceEntrySchema = new mongoose.Schema(
  {
    company: { type: String, trim: true, default: '' },
    jobTitle: { type: String, trim: true, default: '' },
    employmentType: {
      type: String,
      trim: true,
      default: 'Full-time',
    },
    location: { type: String, trim: true, default: '' },
    startDate: { type: String, trim: true, default: '' },
    endDate: { type: String, trim: true, default: '' },
    currentlyWorking: { type: Boolean, default: false },
    responsibilities: { type: [String], default: [] },
    achievements: { type: [String], default: [] },
    technologies: { type: [String], default: [] },
  },
  { _id: true }
);

const skillCategorySchema = new mongoose.Schema(
  {
    category: { type: String, trim: true, default: '' },
    skills: { type: [String], default: [] },
  },
  { _id: true }
);

const projectEntrySchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    technologies: { type: [String], default: [] },
    keyContributions: { type: [String], default: [] },
    projectUrl: { type: String, trim: true, default: '' },
    githubUrl: { type: String, trim: true, default: '' },
    startDate: { type: String, trim: true, default: '' },
    endDate: { type: String, trim: true, default: '' },
    achievements: { type: [String], default: [] },
  },
  { _id: true }
);

const certificationEntrySchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    issuingOrganization: { type: String, trim: true, default: '' },
    issueDate: { type: String, trim: true, default: '' },
    expirationDate: { type: String, trim: true, default: '' },
    credentialId: { type: String, trim: true, default: '' },
    credentialUrl: { type: String, trim: true, default: '' },
  },
  { _id: true }
);

const achievementEntrySchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    issuer: { type: String, trim: true, default: '' },
    date: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
  },
  { _id: true }
);

const leadershipEntrySchema = new mongoose.Schema(
  {
    organization: { type: String, trim: true, default: '' },
    position: { type: String, trim: true, default: '' },
    startDate: { type: String, trim: true, default: '' },
    endDate: { type: String, trim: true, default: '' },
    responsibilities: { type: [String], default: [] },
    achievements: { type: [String], default: [] },
  },
  { _id: true }
);

const publicationEntrySchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    publisher: { type: String, trim: true, default: '' },
    date: { type: String, trim: true, default: '' },
    url: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const volunteerEntrySchema = new mongoose.Schema(
  {
    organization: { type: String, trim: true, default: '' },
    role: { type: String, trim: true, default: '' },
    startDate: { type: String, trim: true, default: '' },
    endDate: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const languageEntrySchema = new mongoose.Schema(
  {
    language: { type: String, trim: true, default: '' },
    proficiency: { type: String, trim: true, default: 'Proficient' },
  },
  { _id: false }
);

const resumeProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    personalInfo: {
      fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
      },
      professionalTitle: { type: String, trim: true, default: '' },
      email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
      },
      phone: { type: String, trim: true, default: '' },
      location: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      country: { type: String, trim: true, default: '' },
      postalCode: { type: String, trim: true, default: '' },
      summary: { type: String, trim: true, default: '' },
      careerObjective: { type: String, trim: true, default: '' },
    },
    links: {
      linkedIn: { type: String, trim: true, default: '' },
      gitHub: { type: String, trim: true, default: '' },
      portfolio: { type: String, trim: true, default: '' },
      website: { type: String, trim: true, default: '' },
      other: { type: [linkItemSchema], default: [] },
    },
    education: {
      type: [educationEntrySchema],
      default: [],
    },
    experience: {
      type: [experienceEntrySchema],
      default: [],
    },
    skills: {
      type: [skillCategorySchema],
      default: [],
    },
    projects: {
      type: [projectEntrySchema],
      default: [],
    },
    certifications: {
      type: [certificationEntrySchema],
      default: [],
    },
    achievements: {
      type: [achievementEntrySchema],
      default: [],
    },
    leadership: {
      type: [leadershipEntrySchema],
      default: [],
    },
    additional: {
      publications: { type: [publicationEntrySchema], default: [] },
      volunteerExperience: { type: [volunteerEntrySchema], default: [] },
      languages: { type: [languageEntrySchema], default: [] },
      professionalMemberships: { type: [String], default: [] },
      relevantCoursework: { type: [String], default: [] },
      interests: { type: [String], default: [] },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ResumeProfile', resumeProfileSchema);
