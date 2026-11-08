const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    companyLogo: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    applicationUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Redirected to Official Portal', 'Applied', 'Reviewed'],
      default: 'Redirected to Official Portal',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('JobApplication', jobApplicationSchema);

