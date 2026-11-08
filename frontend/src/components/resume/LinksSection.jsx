import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export const LinksSection = ({ links = {}, onChange }) => {
  const update = (field, value) => {
    onChange({ ...links, [field]: value });
  };

  const otherLinks = links.other || [];

  const addOtherLink = () => {
    onChange({
      ...links,
      other: [...otherLinks, { label: '', url: '' }],
    });
  };

  const updateOtherLink = (index, key, val) => {
    const updated = [...otherLinks];
    updated[index] = { ...updated[index], [key]: val };
    onChange({ ...links, other: updated });
  };

  const removeOtherLink = (index) => {
    const updated = otherLinks.filter((_, i) => i !== index);
    onChange({ ...links, other: updated });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Social & Professional Links</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Add your professional online profiles so recruiters can explore your code and live work.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LinkedIn */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            LinkedIn URL
          </label>
          <input
            type="url"
            value={links.linkedIn || ''}
            onChange={(e) => update('linkedIn', e.target.value)}
            placeholder="https://linkedin.com/in/yourprofile"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-900"
          />
        </div>

        {/* GitHub */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            GitHub URL
          </label>
          <input
            type="url"
            value={links.gitHub || ''}
            onChange={(e) => update('gitHub', e.target.value)}
            placeholder="https://github.com/yourusername"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-900"
          />
        </div>

        {/* Portfolio */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Portfolio Website
          </label>
          <input
            type="url"
            value={links.portfolio || ''}
            onChange={(e) => update('portfolio', e.target.value)}
            placeholder="https://yourportfolio.dev"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-900"
          />
        </div>

        {/* Personal Website / Blog */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Tech Blog / Additional Site
          </label>
          <input
            type="url"
            value={links.website || ''}
            onChange={(e) => update('website', e.target.value)}
            placeholder="https://blog.yourdomain.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-900"
          />
        </div>
      </div>

      {/* Custom Other Links */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Custom Links (e.g. LeetCode, Codeforces, Kaggle)
          </label>
          <button
            type="button"
            onClick={addOtherLink}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Link</span>
          </button>
        </div>

        {otherLinks.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80"
          >
            <input
              type="text"
              value={item.label || ''}
              onChange={(e) => updateOtherLink(idx, 'label', e.target.value)}
              placeholder="Platform name (e.g. LeetCode)"
              className="w-1/3 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
            />
            <input
              type="url"
              value={item.url || ''}
              onChange={(e) => updateOtherLink(idx, 'url', e.target.value)}
              placeholder="https://leetcode.com/username"
              className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
            />
            <button
              type="button"
              onClick={() => removeOtherLink(idx)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Remove link"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
