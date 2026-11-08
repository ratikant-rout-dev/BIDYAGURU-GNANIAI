const { z } = require('zod');

const linkItemSchema = z.object({
  label: z.string().optional().default(''),
  url: z.string().optional().default(''),
});

const educationEntrySchema = z.object({
  _id: z.string().optional(),
  institution: z.string().optional().default(''),
  degree: z.string().optional().default(''),
  fieldOfStudy: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  currentlyStudying: z.boolean().optional().default(false),
  gradeType: z.string().optional().default(''),
  grade: z.string().optional().default(''),
  relevantCoursework: z.array(z.string()).optional().default([]),
  description: z.string().optional().default(''),
});

const experienceEntrySchema = z.object({
  _id: z.string().optional(),
  company: z.string().optional().default(''),
  jobTitle: z.string().optional().default(''),
  employmentType: z.string().optional().default('Full-time'),
  location: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  currentlyWorking: z.boolean().optional().default(false),
  responsibilities: z.array(z.string()).optional().default([]),
  achievements: z.array(z.string()).optional().default([]),
  technologies: z.array(z.string()).optional().default([]),
});

const skillCategorySchema = z.object({
  _id: z.string().optional(),
  category: z.string().optional().default(''),
  skills: z.array(z.string()).optional().default([]),
});

const projectEntrySchema = z.object({
  _id: z.string().optional(),
  name: z.string().optional().default(''),
  description: z.string().optional().default(''),
  technologies: z.array(z.string()).optional().default([]),
  keyContributions: z.array(z.string()).optional().default([]),
  projectUrl: z.string().optional().default(''),
  githubUrl: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  achievements: z.array(z.string()).optional().default([]),
});

const certificationEntrySchema = z.object({
  _id: z.string().optional(),
  name: z.string().optional().default(''),
  issuingOrganization: z.string().optional().default(''),
  issueDate: z.string().optional().default(''),
  expirationDate: z.string().optional().default(''),
  credentialId: z.string().optional().default(''),
  credentialUrl: z.string().optional().default(''),
});

const achievementEntrySchema = z.object({
  _id: z.string().optional(),
  title: z.string().optional().default(''),
  issuer: z.string().optional().default(''),
  date: z.string().optional().default(''),
  description: z.string().optional().default(''),
});

const leadershipEntrySchema = z.object({
  _id: z.string().optional(),
  organization: z.string().optional().default(''),
  position: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  responsibilities: z.array(z.string()).optional().default([]),
  achievements: z.array(z.string()).optional().default([]),
});

const publicationEntrySchema = z.object({
  title: z.string().optional().default(''),
  publisher: z.string().optional().default(''),
  date: z.string().optional().default(''),
  url: z.string().optional().default(''),
  description: z.string().optional().default(''),
});

const volunteerEntrySchema = z.object({
  organization: z.string().optional().default(''),
  role: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  description: z.string().optional().default(''),
});

const languageEntrySchema = z.object({
  language: z.string().optional().default(''),
  proficiency: z.string().optional().default('Proficient'),
});

const personalInfoSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  professionalTitle: z.string().optional().default(''),
  email: z.string().email('Valid email address is required'),
  phone: z.string().optional().default(''),
  location: z.string().optional().default(''),
  city: z.string().optional().default(''),
  state: z.string().optional().default(''),
  country: z.string().optional().default(''),
  postalCode: z.string().optional().default(''),
  summary: z.string().optional().default(''),
  careerObjective: z.string().optional().default(''),
});

const linksSchema = z.object({
  linkedIn: z.string().optional().default(''),
  gitHub: z.string().optional().default(''),
  portfolio: z.string().optional().default(''),
  website: z.string().optional().default(''),
  other: z.array(linkItemSchema).optional().default([]),
});

const additionalSchema = z.object({
  publications: z.array(publicationEntrySchema).optional().default([]),
  volunteerExperience: z.array(volunteerEntrySchema).optional().default([]),
  languages: z.array(languageEntrySchema).optional().default([]),
  professionalMemberships: z.array(z.string()).optional().default([]),
  relevantCoursework: z.array(z.string()).optional().default([]),
  interests: z.array(z.string()).optional().default([]),
});

const saveResumeSchema = z.object({
  personalInfo: personalInfoSchema,
  links: linksSchema.optional().default({}),
  education: z.array(educationEntrySchema).optional().default([]),
  experience: z.array(experienceEntrySchema).optional().default([]),
  skills: z.array(skillCategorySchema).optional().default([]),
  projects: z.array(projectEntrySchema).optional().default([]),
  certifications: z.array(certificationEntrySchema).optional().default([]),
  achievements: z.array(achievementEntrySchema).optional().default([]),
  leadership: z.array(leadershipEntrySchema).optional().default([]),
  additional: additionalSchema.optional().default({}),
});

// For partial updates (PUT or PATCH)
const updateResumeSchema = z.object({
  personalInfo: personalInfoSchema.partial().optional(),
  links: linksSchema.partial().optional(),
  education: z.array(educationEntrySchema).optional(),
  experience: z.array(experienceEntrySchema).optional(),
  skills: z.array(skillCategorySchema).optional(),
  projects: z.array(projectEntrySchema).optional(),
  certifications: z.array(certificationEntrySchema).optional(),
  achievements: z.array(achievementEntrySchema).optional(),
  leadership: z.array(leadershipEntrySchema).optional(),
  additional: additionalSchema.partial().optional(),
});

module.exports = {
  saveResumeSchema,
  updateResumeSchema,
};
