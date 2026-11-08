const mongoose = require('mongoose');

const roadmapItemSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Locked', 'In Progress', 'Completed'],
      default: 'Locked',
    },
    order: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '1-2 weeks',
    },
    keyTopics: {
      type: [String],
      default: [],
    },
    resources: {
      type: [String],
      default: [],
    },
  },
  { _id: true }
);

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    careerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CareerProfile',
    },
    title: {
      type: String,
      required: true,
      default: 'Personalized Career Roadmap',
    },
    targetGoal: {
      type: String,
      default: '',
    },
    roadmapItems: [roadmapItemSchema],
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Roadmap', roadmapSchema);

