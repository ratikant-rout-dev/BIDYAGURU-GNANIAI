import React from 'react';
import { User, Mail, Phone, MapPin, Briefcase } from 'lucide-react';

export const PersonalSection = ({ personalInfo = {}, onChange }) => {
  const update = (field, value) => {
    onChange({ ...personalInfo, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Provide your core contact details so recruiters and ATS engines can reach you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={personalInfo.fullName || ''}
              onChange={(e) => update('fullName', e.target.value)}
              placeholder="e.g. Soumya Ranjan Mohapatra"
              required
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-900"
            />
          </div>
        </div>

        {/* Professional Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Professional Title
          </label>
          <div className="relative">
            <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={personalInfo.professionalTitle || ''}
              onChange={(e) => update('professionalTitle', e.target.value)}
              placeholder="e.g. Full Stack Software Engineer"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-900"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={personalInfo.email || ''}
              onChange={(e) => update('email', e.target.value)}
              placeholder="e.g. soumya@bidyaguru.edu"
              required
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-900"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              value={personalInfo.phone || ''}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-900"
            />
          </div>
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            City
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={personalInfo.city || ''}
              onChange={(e) => update('city', e.target.value)}
              placeholder="e.g. Bhubaneswar"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-900"
            />
          </div>
        </div>

        {/* State */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            State / Province
          </label>
          <input
            type="text"
            value={personalInfo.state || ''}
            onChange={(e) => update('state', e.target.value)}
            placeholder="e.g. Odisha"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-900"
          />
        </div>

        {/* Country */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Country
          </label>
          <input
            type="text"
            value={personalInfo.country || ''}
            onChange={(e) => update('country', e.target.value)}
            placeholder="e.g. India"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-900"
          />
        </div>

        {/* Postal Code */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Postal / ZIP Code
          </label>
          <input
            type="text"
            value={personalInfo.postalCode || ''}
            onChange={(e) => update('postalCode', e.target.value)}
            placeholder="e.g. 751024"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-900"
          />
        </div>
      </div>
    </div>
  );
};
