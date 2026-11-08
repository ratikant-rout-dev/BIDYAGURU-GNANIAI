import React from 'react';
import { Sparkles } from 'lucide-react';

export const SummarySection = ({ personalInfo = {}, onChange }) => {
  const update = (field, value) => {
    onChange({ ...personalInfo, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Professional Summary & Objective</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Summarize your technical strengths, core competencies, and career goals in 2-4 impactful sentences.
        </p>
      </div>

      <div className="space-y-4">
        {/* Professional Summary */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Professional Summary
            </label>
            <span className="text-[11px] text-slate-400 font-medium">
              {(personalInfo.summary || '').length} characters
            </span>
          </div>
          <textarea
            rows={4}
            value={personalInfo.summary || ''}
            onChange={(e) => update('summary', e.target.value)}
            placeholder="e.g. Results-driven Full Stack Engineer with 2+ years of experience in architecting scalable web applications using React, Node.js, and MongoDB. Proven track record of optimizing backend APIs and delivering intuitive responsive UIs."
            className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-normal text-slate-900 resize-y"
          />
        </div>

        {/* Career Objective */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Career Objective (Optional for experienced candidates)
          </label>
          <textarea
            rows={2}
            value={personalInfo.careerObjective || ''}
            onChange={(e) => update('careerObjective', e.target.value)}
            placeholder="e.g. Aspiring software engineer seeking to leverage strong computer science foundations and full-stack development skills in a fast-paced technology organization."
            className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-normal text-slate-900 resize-y"
          />
        </div>

        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-900 leading-relaxed">
            <span className="font-bold">ATS Pro Tip:</span> Include your core tech stack, domain keywords (e.g. Distributed Systems, REST APIs, Microservices), and measurable achievements in your summary to score higher on candidate screening algorithms.
          </p>
        </div>
      </div>
    </div>
  );
};
