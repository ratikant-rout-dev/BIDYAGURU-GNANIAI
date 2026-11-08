const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fileName: {
      type: String,
      default: 'resume.pdf',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    fileType: {
      type: String,
      default: 'application/pdf',
    },
    rawText: {
      type: String,
      default: '',
    },
    extractedSkills: {
      type: [String],
      default: [],
    },
    experienceYears: {
      type: String,
      default: '0-1 years',
    },
    education: {
      type: String,
      default: '',
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

module.exports = mongoose.model('Resume', resumeSchema);

