import React from 'react';
import { ExternalLink } from 'lucide-react';

export const ResumePreview = ({ data }) => {
  const {
    personalInfo = {},
    links = {},
    education = [],
    experience = [],
    skills = [],
    projects = [],
    certifications = [],
    achievements = [],
    leadership = [],
    additional = {},
  } = data || {};

  const locationParts = [personalInfo.city, personalInfo.state, personalInfo.country]
    .filter(Boolean)
    .join(', ');
  const displayLocation = locationParts || personalInfo.location;

  return (
    <div className="w-full overflow-x-auto">
      <div className="bg-white text-slate-900 shadow-xl rounded-xl sm:rounded-2xl border border-slate-200/90 p-4 sm:p-8 md:p-12 font-sans max-w-4xl mx-auto min-h-[900px] print:shadow-none print:border-none print:p-0">
      {/* 1. Header: Name, Title, Contact */}
      <div className="border-b border-slate-200 pb-5 text-center">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 uppercase">
          {personalInfo.fullName || 'Candidate Full Name'}
        </h1>

        {personalInfo.professionalTitle && (
          <p className="text-sm font-semibold text-slate-600 mt-1">
            {personalInfo.professionalTitle}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-2.5 text-xs text-slate-600 font-medium">
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              <span>{personalInfo.email}</span>
            </span>
          )}

          {personalInfo.phone && (
            <>
              <span className="text-slate-300">•</span>
              <span>{personalInfo.phone}</span>
            </>
          )}

          {displayLocation && (
            <>
              <span className="text-slate-300">•</span>
              <span>{displayLocation}</span>
            </>
          )}
        </div>

        {/* Links */}
        {(links.linkedIn || links.gitHub || links.portfolio || links.website) && (
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-1.5 text-xs text-indigo-700 font-medium">
            {links.linkedIn && (
              <a
                href={links.linkedIn}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                {links.linkedIn.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            )}
            {links.gitHub && (
              <>
                <span className="text-slate-300">•</span>
                <a
                  href={links.gitHub}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  {links.gitHub.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </>
            )}
            {links.portfolio && (
              <>
                <span className="text-slate-300">•</span>
                <a
                  href={links.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  {links.portfolio.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </>
            )}
            {links.website && (
              <>
                <span className="text-slate-300">•</span>
                <a
                  href={links.website}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  {links.website.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </>
            )}
          </div>
        )}
      </div>

      {/* 2. Professional Summary */}
      {(personalInfo.summary || personalInfo.careerObjective) && (
        <section className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Professional Summary
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            {personalInfo.summary || personalInfo.careerObjective}
          </p>
        </section>
      )}

      {/* 3. Technical Skills */}
      {skills && skills.filter((s) => s.skills?.length > 0).length > 0 && (
        <section className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Technical Skills
          </h2>
          <div className="space-y-1.5 text-xs text-slate-800">
            {skills
              .filter((s) => s.skills?.length > 0)
              .map((group, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline">
                  <span className="font-bold text-slate-900 sm:w-44 shrink-0">
                    • {group.category || 'Skills'}:
                  </span>
                  <span className="text-slate-700 sm:flex-1">
                    {group.skills.join(', ')}
                  </span>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* 4. Work Experience */}
      {experience && experience.filter((e) => e.company || e.jobTitle).length > 0 && (
        <section className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Work Experience
          </h2>
          <div className="space-y-4">
            {experience
              .filter((e) => e.company || e.jobTitle)
              .map((exp, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs">
                    <span className="font-bold text-slate-900 text-sm">
                      {exp.jobTitle || 'Role'}
                    </span>
                    <span className="text-slate-500 font-medium shrink-0">
                      {exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate || 'Present'}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs text-slate-700">
                    <span className="font-semibold text-slate-800">
                      {[exp.company, exp.employmentType].filter(Boolean).join(' • ')}
                    </span>
                    {exp.location && (
                      <span className="text-slate-500 italic shrink-0">
                        {exp.location}
                      </span>
                    )}
                  </div>

                  {exp.technologies && exp.technologies.length > 0 && (
                    <p className="text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-700">Technologies:</span>{' '}
                      {exp.technologies.join(', ')}
                    </p>
                  )}

                  {exp.responsibilities && exp.responsibilities.length > 0 && (
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5 ml-1 mt-1">
                      {exp.responsibilities
                        .filter(Boolean)
                        .map((resp, rIdx) => (
                          <li key={rIdx} className="leading-relaxed">
                            {resp}
                          </li>
                        ))}
                    </ul>
                  )}

                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5 ml-1">
                      {exp.achievements
                        .filter(Boolean)
                        .map((ach, aIdx) => (
                          <li key={aIdx} className="leading-relaxed">
                            <span className="font-semibold text-slate-800">Key Result:</span> {ach}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* 5. Projects */}
      {projects && projects.filter((p) => p.name).length > 0 && (
        <section className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Projects
          </h2>
          <div className="space-y-4">
            {projects
              .filter((p) => p.name)
              .map((proj, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs">
                    <span className="font-bold text-slate-900 text-sm">
                      {proj.name}
                    </span>
                    {(proj.startDate || proj.endDate) && (
                      <span className="text-slate-500 font-medium shrink-0">
                        {proj.startDate} - {proj.endDate || 'Present'}
                      </span>
                    )}
                  </div>

                  {proj.technologies && proj.technologies.length > 0 && (
                    <p className="text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-700">Tech Stack:</span>{' '}
                      {proj.technologies.join(', ')}
                    </p>
                  )}

                  {(proj.projectUrl || proj.githubUrl) && (
                    <div className="flex flex-wrap gap-3 text-[11px] text-indigo-700 font-medium">
                      {proj.projectUrl && (
                        <a
                          href={proj.projectUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline flex items-center gap-1"
                        >
                          <span>Live Demo</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline flex items-center gap-1"
                        >
                          <span>Source Code</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  )}

                  {proj.description && (
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {proj.description}
                    </p>
                  )}

                  {proj.keyContributions && proj.keyContributions.length > 0 && (
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5 ml-1">
                      {proj.keyContributions
                        .filter(Boolean)
                        .map((contrib, cIdx) => (
                          <li key={cIdx} className="leading-relaxed">
                            {contrib}
                          </li>
                        ))}
                    </ul>
                  )}

                  {proj.achievements && proj.achievements.length > 0 && (
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5 ml-1">
                      {proj.achievements
                        .filter(Boolean)
                        .map((ach, aIdx) => (
                          <li key={aIdx} className="leading-relaxed">
                            <span className="font-semibold text-slate-800">Outcome:</span> {ach}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* 6. Education */}
      {education && education.filter((e) => e.institution || e.degree).length > 0 && (
        <section className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Education
          </h2>
          <div className="space-y-3">
            {education
              .filter((e) => e.institution || e.degree)
              .map((edu, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs">
                    <span className="font-bold text-slate-900 text-sm">
                      {[edu.degree, edu.fieldOfStudy].filter(Boolean).join(' in ')}
                    </span>
                    <span className="text-slate-500 font-medium shrink-0">
                      {edu.startDate} - {edu.currentlyStudying ? 'Expected' : edu.endDate}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs text-slate-700">
                    <span className="font-semibold text-slate-800">
                      {edu.institution}
                    </span>
                    {edu.grade && (
                      <span className="text-slate-600 font-medium shrink-0">
                        {edu.gradeType ? `${edu.gradeType}: ` : 'Grade: '}
                        {edu.grade}
                      </span>
                    )}
                  </div>

                  {edu.relevantCoursework && edu.relevantCoursework.length > 0 && (
                    <p className="text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-700">Relevant Coursework:</span>{' '}
                      {edu.relevantCoursework.join(', ')}
                    </p>
                  )}

                  {edu.description && (
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* 7. Certifications */}
      {certifications && certifications.filter((c) => c.name).length > 0 && (
        <section className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Certifications
          </h2>
          <div className="space-y-1.5 text-xs text-slate-700">
            {certifications
              .filter((c) => c.name)
              .map((cert, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                  <div>
                    <span className="font-bold text-slate-900">• {cert.name}</span>
                    {cert.issuingOrganization && (
                      <span className="text-slate-600"> — {cert.issuingOrganization}</span>
                    )}
                    {cert.credentialId && (
                      <span className="text-slate-500 text-[11px] ml-2">
                        (ID: {cert.credentialId})
                      </span>
                    )}
                  </div>
                  {cert.issueDate && (
                    <span className="text-slate-500 shrink-0 font-medium">
                      {cert.issueDate}
                      {cert.expirationDate ? ` - ${cert.expirationDate}` : ''}
                    </span>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* 8. Achievements */}
      {achievements && achievements.filter((a) => a.title).length > 0 && (
        <section className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Achievements & Awards
          </h2>
          <div className="space-y-1.5 text-xs text-slate-700">
            {achievements
              .filter((a) => a.title)
              .map((ach, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                    <span className="font-bold text-slate-900">
                      • {ach.title}
                      {ach.issuer && <span className="text-slate-600 font-normal"> — {ach.issuer}</span>}
                    </span>
                    {ach.date && (
                      <span className="text-slate-500 shrink-0 font-medium">{ach.date}</span>
                    )}
                  </div>
                  {ach.description && (
                    <p className="text-xs text-slate-600 ml-3">{ach.description}</p>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* 9. Leadership & Activities */}
      {leadership && leadership.filter((l) => l.organization || l.position).length > 0 && (
        <section className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Leadership & Extracurricular Activities
          </h2>
          <div className="space-y-2 text-xs text-slate-700">
            {leadership
              .filter((l) => l.organization || l.position)
              .map((lead, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                    <span className="font-bold text-slate-900">
                      {[lead.position, lead.organization].filter(Boolean).join(', ')}
                    </span>
                    {(lead.startDate || lead.endDate) && (
                      <span className="text-slate-500 shrink-0 font-medium">
                        {lead.startDate} - {lead.endDate || 'Present'}
                      </span>
                    )}
                  </div>
                  {lead.responsibilities && lead.responsibilities.length > 0 && (
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5 ml-1">
                      {lead.responsibilities.filter(Boolean).map((r, rIdx) => (
                        <li key={rIdx}>{r}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* 10. Additional Info */}
      {(additional.languages?.length > 0 ||
        additional.volunteerExperience?.length > 0 ||
        additional.publications?.length > 0 ||
        additional.interests?.length > 0) && (
        <section className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Additional Information
          </h2>
          <div className="space-y-1.5 text-xs text-slate-700">
            {additional.languages && additional.languages.length > 0 && (
              <p>
                <span className="font-bold text-slate-900">• Languages: </span>
                {additional.languages
                  .map((l) => `${l.language} (${l.proficiency || 'Proficient'})`)
                  .join(', ')}
              </p>
            )}

            {additional.interests && additional.interests.length > 0 && (
              <p>
                <span className="font-bold text-slate-900">• Interests: </span>
                {additional.interests.join(', ')}
              </p>
            )}

            {additional.volunteerExperience &&
              additional.volunteerExperience.map((vol, idx) => (
                <p key={idx}>
                  <span className="font-bold text-slate-900">
                    • Volunteer: {vol.role} — {vol.organization}
                  </span>
                  {vol.description && ` (${vol.description})`}
                </p>
              ))}

            {additional.publications &&
              additional.publications.map((pub, idx) => (
                <p key={idx}>
                  <span className="font-bold text-slate-900">
                    • Publication: {pub.title}
                  </span>
                  {pub.publisher && ` — ${pub.publisher}`}
                </p>
              ))}
          </div>
        </section>
      )}
      </div>
    </div>
  );
};
