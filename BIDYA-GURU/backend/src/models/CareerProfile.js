const mongoose = require('mongoose');

const careerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    targetField: {
      type: String,
      trim: true,
      default: '',
    },
    careerGoal: {
      type: String,
      trim: true,
      default: '',
    },
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

module.exports = mongoose.model('CareerProfile', careerProfileSchema);

