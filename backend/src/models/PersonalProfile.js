const mongoose = require('mongoose');

const linkItemSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: '' },
    url: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const personalProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    country: {
      type: String,
      trim: true,
      default: '',
    },
    postalCode: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    links: {
      linkedIn: { type: String, trim: true, default: '' },
      gitHub: { type: String, trim: true, default: '' },
      portfolio: { type: String, trim: true, default: '' },
      website: { type: String, trim: true, default: '' },
      other: { type: [linkItemSchema], default: [] },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PersonalProfile', personalProfileSchema);
