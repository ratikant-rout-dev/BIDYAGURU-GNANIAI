const mongoose = require('mongoose');

const communicationPracticeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      enum: ['en-IN', 'hi-IN', 'or-IN'],
      default: 'en-IN',
    },
    transcript: {
      type: String,
      required: true,
    },
    feedback: {
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: 75,
      },
      relevance: {
        type: String,
        default: '',
      },
      clarity: {
        type: String,
        default: '',
      },
      structure: {
        type: String,
        default: '',
      },
      strengths: {
        type: [String],
        default: [],
      },
      improvements: {
        type: [String],
        default: [],
      },
      suggestions: {
        type: [String],
        default: [],
      },
      grammarCorrection: {
        hasError: { type: Boolean, default: false },
        originalPhrase: String,
        correctedPhrase: String,
        explanation: String,
      },
    },
    audioUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CommunicationPractice', communicationPracticeSchema);

