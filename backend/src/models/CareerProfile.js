const mongoose = require('mongoose');

const careerSkillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['have', 'developing', 'toLearn'],
      default: 'have',
      required: true,
    },
    proficiency: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert', ''],
      default: '',
    },
    source: {
      type: String,
      enum: ['user', 'ai', 'resume'],
      default: 'user',
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const careerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    // Target Fields (plural array + single field for backward compatibility)
    targetField: {
      type: String,
      trim: true,
      default: '',
    },
    targetFields: {
      type: [String],
      default: [],
    },
    // Target Roles (plural array + careerGoal for backward compatibility)
    careerGoal: {
      type: String,
      trim: true,
      default: '',
    },
    targetRoles: {
      type: [String],
      default: [],
    },
    // Target Companies
    targetCompanies: {
      type: [String],
      default: [],
    },
    // Career & Learning Milestones
    shortTermGoals: {
      type: [String],
      default: [],
    },
    longTermGoals: {
      type: [String],
      default: [],
    },
    experienceLevel: {
      type: String,
      default: 'Entry Level / Student',
    },
    // Structured Skills Matrix (Have, Developing, To Learn)
    skills: {
      type: [careerSkillSchema],
      default: [],
    },
    // Backward-compatible string arrays
    knownSkills: {
      type: [String],
      default: [],
    },
    developingSkills: {
      type: [String],
      default: [],
    },
    skillsToLearn: {
      type: [String],
      default: [],
    },
    // Career Preferences
    careerPreferences: {
      preferredEmploymentTypes: {
        type: [String],
        default: [],
      },
      preferredLocations: {
        type: [String],
        default: [],
      },
      workMode: {
        type: String,
        enum: ['Remote', 'Hybrid', 'On-site', 'Flexible', ''],
        default: '',
      },
      other: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
    languagePreference: {
      type: String,
      enum: ['en-IN', 'hi-IN', 'or-IN'],
      default: 'en-IN',
    },
    summary: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Bidirectional synchronization hook between structured `skills` and legacy arrays
careerProfileSchema.pre('save', function (next) {
  // 1. Sync skills -> legacy arrays if skills are populated
  if (this.skills && this.skills.length > 0) {
    const have = [];
    const developing = [];
    const toLearn = [];

    // Deduplicate by lowercase name
    const seen = new Set();
    const dedupedSkills = [];

    for (const s of this.skills) {
      const lower = (s.name || '').trim().toLowerCase();
      if (!lower || seen.has(lower)) continue;
      seen.add(lower);
      dedupedSkills.push(s);

      if (s.status === 'have') have.push(s.name.trim());
      else if (s.status === 'developing') developing.push(s.name.trim());
      else if (s.status === 'toLearn') toLearn.push(s.name.trim());
    }

    this.skills = dedupedSkills;
    this.knownSkills = have;
    this.developingSkills = developing;
    this.skillsToLearn = toLearn;
  } else {
    // 2. Sync legacy arrays -> skills if skills array is empty
    const combined = [];
    const seen = new Set();

    (this.knownSkills || []).forEach((name) => {
      const trimmed = (name || '').trim();
      const lower = trimmed.toLowerCase();
      if (trimmed && !seen.has(lower)) {
        seen.add(lower);
        combined.push({ name: trimmed, status: 'have', source: 'user' });
      }
    });

    (this.developingSkills || []).forEach((name) => {
      const trimmed = (name || '').trim();
      const lower = trimmed.toLowerCase();
      if (trimmed && !seen.has(lower)) {
        seen.add(lower);
        combined.push({ name: trimmed, status: 'developing', source: 'user' });
      }
    });

    (this.skillsToLearn || []).forEach((name) => {
      const trimmed = (name || '').trim();
      const lower = trimmed.toLowerCase();
      if (trimmed && !seen.has(lower)) {
        seen.add(lower);
        combined.push({ name: trimmed, status: 'toLearn', source: 'user' });
      }
    });

    if (combined.length > 0) {
      this.skills = combined;
    }
  }

  // Sync targetField <-> targetFields
  if (this.targetField && (!this.targetFields || this.targetFields.length === 0)) {
    this.targetFields = [this.targetField];
  } else if (this.targetFields && this.targetFields.length > 0 && !this.targetField) {
    this.targetField = this.targetFields[0];
  }

  // Sync careerGoal <-> targetRoles
  if (this.careerGoal && (!this.targetRoles || this.targetRoles.length === 0)) {
    this.targetRoles = [this.careerGoal];
  } else if (this.targetRoles && this.targetRoles.length > 0 && !this.careerGoal) {
    this.careerGoal = this.targetRoles[0];
  }

  next();
});

module.exports = mongoose.model('CareerProfile', careerProfileSchema);
