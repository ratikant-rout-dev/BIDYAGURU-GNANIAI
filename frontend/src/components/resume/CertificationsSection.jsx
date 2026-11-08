import React from 'react';
import { Plus, Trash2, Award } from 'lucide-react';

export const CertificationsSection = ({ certifications = [], onChange }) => {
  const addCertification = () => {
    onChange([
      ...certifications,
      {
        name: '',
        issuingOrganization: '',
        issueDate: '',
        expirationDate: '',
        credentialId: '',
        credentialUrl: '',
      },
    ]);
  };

  const removeCertification = (index) => {
    onChange(certifications.filter((_, i) => i !== index));
  };

  const updateCertification = (index, field, value) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Certifications</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add verified credentials from AWS, Google Cloud, Meta, Microsoft, Oracle, or Coursera.
          </p>
        </div>

        <button
          type="button"
          onClick={addCertification}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Certification</span>
        </button>
      </div>

      {certifications.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
          <p className="text-sm font-semibold text-slate-600">No certifications added yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Industry certifications demonstrate dedication and verified technical proficiency to hiring managers.
          </p>
          <button
            type="button"
            onClick={addCertification}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Certification</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {certifications.map((cert, cIdx) => (
            <div
              key={cIdx}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>Certification #{cIdx + 1}</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeCertification(cIdx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove certification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Certification Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Certification Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cert.name || ''}
                    onChange={(e) => updateCertification(cIdx, 'name', e.target.value)}
                    placeholder="e.g. AWS Certified Solutions Architect - Associate"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                  />
                </div>

                {/* Issuing Organization */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Issuing Organization
                  </label>
                  <input
                    type="text"
                    value={cert.issuingOrganization || ''}
                    onChange={(e) => updateCertification(cIdx, 'issuingOrganization', e.target.value)}
                    placeholder="e.g. Amazon Web Services"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                  />
                </div>

                {/* Issue Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Issue Date
                  </label>
                  <input
                    type="text"
                    value={cert.issueDate || ''}
                    onChange={(e) => updateCertification(cIdx, 'issueDate', e.target.value)}
                    placeholder="e.g. Aug 2024"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                  />
                </div>

                {/* Expiration Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="text"
                    value={cert.expirationDate || ''}
                    onChange={(e) => updateCertification(cIdx, 'expirationDate', e.target.value)}
                    placeholder="e.g. Aug 2027 or No Expiry"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                  />
                </div>

                {/* Credential ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Credential ID
                  </label>
                  <input
                    type="text"
                    value={cert.credentialId || ''}
                    onChange={(e) => updateCertification(cIdx, 'credentialId', e.target.value)}
                    placeholder="e.g. AWS-SAA-839210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                  />
                </div>

                {/* Credential URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Verification URL
                  </label>
                  <input
                    type="url"
                    value={cert.credentialUrl || ''}
                    onChange={(e) => updateCertification(cIdx, 'credentialUrl', e.target.value)}
                    placeholder="https://aws.amazon.com/verification/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
