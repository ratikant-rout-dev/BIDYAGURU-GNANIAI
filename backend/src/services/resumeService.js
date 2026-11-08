const PDFDocument = require('pdfkit');
const ResumeProfile = require('../models/ResumeProfile');
const profileSyncService = require('./profileSyncService');

/**
 * Get resume profile for the authenticated user
 */
const getResumeProfile = async (userId) => {
  const profile = await ResumeProfile.findOne({ userId });
  if (!profile) return null;

  // Seamless Category 1 sync from PersonalProfile single source of truth
  try {
    const personal = await profileSyncService.getOrCreatePersonalProfile(userId);
    if (personal) {
      if (personal.fullName) profile.personalInfo.fullName = personal.fullName;
      if (personal.email) profile.personalInfo.email = personal.email;
      if (personal.phone) profile.personalInfo.phone = personal.phone;
      if (personal.location) profile.personalInfo.location = personal.location;
      if (personal.city) profile.personalInfo.city = personal.city;
      if (personal.state) profile.personalInfo.state = personal.state;
      if (personal.country) profile.personalInfo.country = personal.country;
      if (personal.postalCode) profile.personalInfo.postalCode = personal.postalCode;

      if (personal.links) {
        if (personal.links.linkedIn) profile.links.linkedIn = personal.links.linkedIn;
        if (personal.links.gitHub) profile.links.gitHub = personal.links.gitHub;
        if (personal.links.portfolio) profile.links.portfolio = personal.links.portfolio;
        if (personal.links.website) profile.links.website = personal.links.website;
      }
    }
  } catch (syncErr) {
    console.warn('[Profile Sync Warning in getResumeProfile]:', syncErr.message);
  }

  return profile;
};

/**
 * Save or create resume profile (upsert)
 */
const saveResumeProfile = async (userId, data) => {
  // Sync personal data back to PersonalProfile if supplied
  let personal = null;
  try {
    personal = await profileSyncService.syncResumePersonalData(userId, data);
  } catch (syncErr) {
    console.warn('[Profile Sync Warning in saveResumeProfile]:', syncErr.message);
  }

  if (!personal) {
    try {
      personal = await profileSyncService.getOrCreatePersonalProfile(userId);
    } catch (_) {}
  }

  // Pre-merge Category 1 Personal Info so that saving resume never wipes out existing PersonalProfile data
  const mergedData = { ...data };
  if (personal) {
    mergedData.personalInfo = {
      ...(mergedData.personalInfo || {}),
      fullName: mergedData.personalInfo?.fullName || personal.fullName,
      email: mergedData.personalInfo?.email || personal.email,
      phone: mergedData.personalInfo?.phone || personal.phone,
      location: mergedData.personalInfo?.location || personal.location,
      city: mergedData.personalInfo?.city || personal.city,
      state: mergedData.personalInfo?.state || personal.state,
      country: mergedData.personalInfo?.country || personal.country,
      postalCode: mergedData.personalInfo?.postalCode || personal.postalCode,
    };
    mergedData.links = {
      ...(mergedData.links || {}),
      linkedIn: mergedData.links?.linkedIn || personal.links?.linkedIn || '',
      gitHub: mergedData.links?.gitHub || personal.links?.gitHub || '',
      portfolio: mergedData.links?.portfolio || personal.links?.portfolio || '',
      website: mergedData.links?.website || personal.links?.website || '',
    };
  }

  // Prevent duplicate profiles using atomic findOneAndUpdate with upsert
  const profile = await ResumeProfile.findOneAndUpdate(
    { userId },
    {
      ...mergedData,
      userId,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );
  return profile;
};

/**
 * Update resume profile (partial or full)
 */
const updateResumeProfile = async (userId, updateData) => {
  try {
    await profileSyncService.syncResumePersonalData(userId, updateData);
  } catch (syncErr) {
    console.warn('[Profile Sync Warning in updateResumeProfile]:', syncErr.message);
  }

  let profile = await ResumeProfile.findOne({ userId });

  if (!profile) {
    // If profile does not exist yet, create it if required fields exist
    if (!updateData.personalInfo?.fullName || !updateData.personalInfo?.email) {
      const err = new Error('Resume profile does not exist. Full name and email are required to create one.');
      err.statusCode = 404;
      throw err;
    }
    profile = new ResumeProfile({
      ...updateData,
      userId,
    });
    await profile.save();
    return profile;
  }

  // Merge personalInfo
  if (updateData.personalInfo) {
    profile.personalInfo = {
      ...profile.personalInfo.toObject(),
      ...updateData.personalInfo,
    };
  }

  // Merge links
  if (updateData.links) {
    profile.links = {
      ...profile.links.toObject(),
      ...updateData.links,
    };
  }

  // Array replacements
  if (updateData.education !== undefined) profile.education = updateData.education;
  if (updateData.experience !== undefined) profile.experience = updateData.experience;
  if (updateData.skills !== undefined) profile.skills = updateData.skills;
  if (updateData.projects !== undefined) profile.projects = updateData.projects;
  if (updateData.certifications !== undefined) profile.certifications = updateData.certifications;
  if (updateData.achievements !== undefined) profile.achievements = updateData.achievements;
  if (updateData.leadership !== undefined) profile.leadership = updateData.leadership;

  // Merge additional
  if (updateData.additional) {
    profile.additional = {
      ...profile.additional.toObject(),
      ...updateData.additional,
    };
  }

  await profile.save();
  return profile;
};

/**
 * Delete resume profile
 */
const deleteResumeProfile = async (userId) => {
  const result = await ResumeProfile.findOneAndDelete({ userId });
  return result;
};

/**
 * Helper to ensure page has enough space before writing a block
 */
const ensureSpace = (doc, requiredSpace = 60) => {
  const bottomMargin = doc.page.margins.bottom || 36;
  if (doc.y + requiredSpace > doc.page.height - bottomMargin) {
    doc.addPage();
  }
};

/**
 * Helper to render an ATS section heading with a subtle rule
 */
const renderSectionHeading = (doc, title) => {
  ensureSpace(doc, 45);
  doc.moveDown(0.5);

  const startX = doc.page.margins.left;
  const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  doc
    .font('Helvetica-Bold')
    .fontSize(10.5)
    .fillColor('#0f172a') // Slate-900
    .text(title.toUpperCase(), startX, doc.y, {
      characterSpacing: 0.8,
    });

  const lineY = doc.y + 2;
  doc
    .strokeColor('#cbd5e1') // Slate-300
    .lineWidth(0.75)
    .moveTo(startX, lineY)
    .lineTo(startX + contentWidth, lineY)
    .stroke();

  doc.y = lineY + 5;
};

/**
 * Generate ATS-friendly PDF buffer
 */
const generateResumePdfBuffer = async (userId) => {
  const profile = await ResumeProfile.findOne({ userId });

  if (!profile) {
    const error = new Error('Resume profile not found. Please create and save your resume first.');
    error.statusCode = 404;
    throw error;
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 36,
        bottom: 36,
        left: 40,
        right: 40,
      },
      bufferPages: true,
      info: {
        Title: `${profile.personalInfo.fullName || 'Candidate'} - Resume`,
        Author: profile.personalInfo.fullName || 'Candidate',
        Subject: 'ATS-Friendly Professional Resume',
        Keywords: 'Resume, CV, Career, ATS, Professional',
        Creator: 'Bidya Guru ATS Resume Engine',
      },
    });

    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const startX = doc.page.margins.left;

    // -------------------------------------------------------------
    // 1. Header (Name, Title, Contact Info)
    // -------------------------------------------------------------
    const fullName = profile.personalInfo.fullName || 'Your Name';
    doc
      .font('Helvetica-Bold')
      .fontSize(20)
      .fillColor('#0f172a')
      .text(fullName, startX, doc.y, {
        align: 'center',
        width: contentWidth,
      });

    if (profile.personalInfo.professionalTitle) {
      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor('#334155')
        .moveDown(0.2)
        .text(profile.personalInfo.professionalTitle, {
          align: 'center',
          width: contentWidth,
        });
    }

    // Build contact row
    const contactParts = [];
    if (profile.personalInfo.email) contactParts.push(profile.personalInfo.email);
    if (profile.personalInfo.phone) contactParts.push(profile.personalInfo.phone);

    const locationParts = [
      profile.personalInfo.city,
      profile.personalInfo.state,
      profile.personalInfo.country,
    ]
      .filter(Boolean)
      .join(', ');
    if (locationParts) contactParts.push(locationParts);
    else if (profile.personalInfo.location) contactParts.push(profile.personalInfo.location);

    if (contactParts.length > 0) {
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#475569')
        .moveDown(0.3)
        .text(contactParts.join('  •  '), {
          align: 'center',
          width: contentWidth,
        });
    }

    // Professional Links row
    const linkParts = [];
    if (profile.links?.linkedIn) {
      linkParts.push({
        text: profile.links.linkedIn.replace(/^https?:\/\/(www\.)?/, ''),
        url: profile.links.linkedIn,
      });
    }
    if (profile.links?.gitHub) {
      linkParts.push({
        text: profile.links.gitHub.replace(/^https?:\/\/(www\.)?/, ''),
        url: profile.links.gitHub,
      });
    }
    if (profile.links?.portfolio) {
      linkParts.push({
        text: profile.links.portfolio.replace(/^https?:\/\/(www\.)?/, ''),
        url: profile.links.portfolio,
      });
    }
    if (profile.links?.website) {
      linkParts.push({
        text: profile.links.website.replace(/^https?:\/\/(www\.)?/, ''),
        url: profile.links.website,
      });
    }

    if (linkParts.length > 0) {
      doc.moveDown(0.2);
      const linksLine = linkParts.map((l) => l.text).join('  •  ');
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('#2563eb')
        .text(linksLine, {
          align: 'center',
          width: contentWidth,
        });
    }

    // -------------------------------------------------------------
    // 2. Professional Summary
    // -------------------------------------------------------------
    const summaryText = profile.personalInfo.summary || profile.personalInfo.careerObjective;
    if (summaryText && summaryText.trim()) {
      renderSectionHeading(doc, 'Professional Summary');
      doc
        .font('Helvetica')
        .fontSize(9.5)
        .fillColor('#1e293b')
        .text(summaryText.trim(), startX, doc.y, {
          width: contentWidth,
          lineGap: 2.5,
          align: 'left',
        });
    }

    // -------------------------------------------------------------
    // 3. Technical Skills (ATS prioritized near top for tech roles)
    // -------------------------------------------------------------
    if (profile.skills && profile.skills.length > 0) {
      const validSkills = profile.skills.filter(
        (s) => s.skills && s.skills.length > 0
      );
      if (validSkills.length > 0) {
        renderSectionHeading(doc, 'Technical Skills');
        validSkills.forEach((skillGroup) => {
          ensureSpace(doc, 22);
          doc
            .font('Helvetica-Bold')
            .fontSize(9.5)
            .fillColor('#0f172a')
            .text(`•  ${skillGroup.category || 'Skills'}: `, startX, doc.y, {
              continued: true,
              width: contentWidth,
            })
            .font('Helvetica')
            .fillColor('#334155')
            .text(skillGroup.skills.join(', '), {
              lineGap: 2,
            });
        });
      }
    }

    // -------------------------------------------------------------
    // 4. Work Experience
    // -------------------------------------------------------------
    if (profile.experience && profile.experience.length > 0) {
      const validExp = profile.experience.filter(
        (e) => e.company || e.jobTitle
      );
      if (validExp.length > 0) {
        renderSectionHeading(doc, 'Work Experience');
        validExp.forEach((exp) => {
          ensureSpace(doc, 48);

          // Job Title & Dates
          const title = exp.jobTitle || 'Role';
          const dates = `${exp.startDate || ''} - ${
            exp.currentlyWorking ? 'Present' : exp.endDate || ''
          }`.trim();

          const currentY = doc.y;
          doc
            .font('Helvetica-Bold')
            .fontSize(10)
            .fillColor('#0f172a')
            .text(title, startX, currentY, { width: contentWidth - 140 });

          if (dates && dates !== '-') {
            doc
              .font('Helvetica')
              .fontSize(9)
              .fillColor('#475569')
              .text(dates, startX + contentWidth - 140, currentY, {
                width: 140,
                align: 'right',
              });
          }

          // Company, Employment Type, Location
          const subY = doc.y;
          const companyDetails = [exp.company, exp.employmentType]
            .filter(Boolean)
            .join(' | ');

          doc
            .font('Helvetica-Bold')
            .fontSize(9)
            .fillColor('#334155')
            .text(companyDetails, startX, subY, { width: contentWidth - 140 });

          if (exp.location) {
            doc
              .font('Helvetica-Oblique')
              .fontSize(8.5)
              .fillColor('#64748b')
              .text(exp.location, startX + contentWidth - 140, subY, {
                width: 140,
                align: 'right',
              });
          }

          // Technologies used
          if (exp.technologies && exp.technologies.length > 0) {
            doc.moveDown(0.2);
            doc
              .font('Helvetica-Bold')
              .fontSize(8.5)
              .fillColor('#475569')
              .text('Technologies: ', startX + 8, doc.y, { continued: true })
              .font('Helvetica')
              .text(exp.technologies.join(', '));
          }

          // Responsibilities bullet points
          if (exp.responsibilities && exp.responsibilities.length > 0) {
            exp.responsibilities.forEach((resp) => {
              if (!resp || !resp.trim()) return;
              ensureSpace(doc, 18);
              doc
                .font('Helvetica')
                .fontSize(9)
                .fillColor('#1e293b')
                .text(`•  ${resp.trim()}`, startX + 8, doc.y, {
                  width: contentWidth - 8,
                  lineGap: 1.5,
                });
            });
          }

          // Achievements bullet points
          if (exp.achievements && exp.achievements.length > 0) {
            exp.achievements.forEach((ach) => {
              if (!ach || !ach.trim()) return;
              ensureSpace(doc, 18);
              doc
                .font('Helvetica')
                .fontSize(9)
                .fillColor('#1e293b')
                .text(`•  Key Result: ${ach.trim()}`, startX + 8, doc.y, {
                  width: contentWidth - 8,
                  lineGap: 1.5,
                });
            });
          }

          doc.moveDown(0.4);
        });
      }
    }

    // -------------------------------------------------------------
    // 5. Projects
    // -------------------------------------------------------------
    if (profile.projects && profile.projects.length > 0) {
      const validProjects = profile.projects.filter((p) => p.name);
      if (validProjects.length > 0) {
        renderSectionHeading(doc, 'Projects');
        validProjects.forEach((proj) => {
          ensureSpace(doc, 45);

          const projY = doc.y;
          const dates = `${proj.startDate || ''} - ${proj.endDate || ''}`.trim();

          doc
            .font('Helvetica-Bold')
            .fontSize(10)
            .fillColor('#0f172a')
            .text(proj.name, startX, projY, {
              width: contentWidth - 140,
            });

          if (dates && dates !== '-') {
            doc
              .font('Helvetica')
              .fontSize(9)
              .fillColor('#475569')
              .text(dates, startX + contentWidth - 140, projY, {
                width: 140,
                align: 'right',
              });
          }

          // Technologies used
          if (proj.technologies && proj.technologies.length > 0) {
            doc
              .font('Helvetica-Bold')
              .fontSize(8.5)
              .fillColor('#334155')
              .text('Tech Stack: ', startX, doc.y, { continued: true })
              .font('Helvetica')
              .text(proj.technologies.join(', '));
          }

          // Project Links (URLs)
          const projLinks = [];
          if (proj.projectUrl) projLinks.push(`Demo: ${proj.projectUrl}`);
          if (proj.githubUrl) projLinks.push(`Source: ${proj.githubUrl}`);
          if (projLinks.length > 0) {
            doc
              .font('Helvetica')
              .fontSize(8.5)
              .fillColor('#2563eb')
              .text(projLinks.join('  |  '), startX, doc.y, {
                width: contentWidth,
              });
          }

          // Description
          if (proj.description && proj.description.trim()) {
            doc
              .font('Helvetica')
              .fontSize(9)
              .fillColor('#1e293b')
              .text(proj.description.trim(), startX, doc.y, {
                width: contentWidth,
                lineGap: 2,
              });
          }

          // Contributions / Highlights
          if (proj.keyContributions && proj.keyContributions.length > 0) {
            proj.keyContributions.forEach((contrib) => {
              if (!contrib || !contrib.trim()) return;
              ensureSpace(doc, 18);
              doc
                .font('Helvetica')
                .fontSize(9)
                .fillColor('#1e293b')
                .text(`•  ${contrib.trim()}`, startX + 8, doc.y, {
                  width: contentWidth - 8,
                  lineGap: 1.5,
                });
            });
          }

          if (proj.achievements && proj.achievements.length > 0) {
            proj.achievements.forEach((ach) => {
              if (!ach || !ach.trim()) return;
              ensureSpace(doc, 18);
              doc
                .font('Helvetica')
                .fontSize(9)
                .fillColor('#1e293b')
                .text(`•  Achievement: ${ach.trim()}`, startX + 8, doc.y, {
                  width: contentWidth - 8,
                  lineGap: 1.5,
                });
            });
          }

          doc.moveDown(0.35);
        });
      }
    }

    // -------------------------------------------------------------
    // 6. Education
    // -------------------------------------------------------------
    if (profile.education && profile.education.length > 0) {
      const validEdu = profile.education.filter(
        (e) => e.institution || e.degree
      );
      if (validEdu.length > 0) {
        renderSectionHeading(doc, 'Education');
        validEdu.forEach((edu) => {
          ensureSpace(doc, 40);

          const eduY = doc.y;
          const degreeLine = [edu.degree, edu.fieldOfStudy]
            .filter(Boolean)
            .join(' in ');
          const dates = `${edu.startDate || ''} - ${
            edu.currentlyStudying ? 'Expected' : edu.endDate || ''
          }`.trim();

          doc
            .font('Helvetica-Bold')
            .fontSize(10)
            .fillColor('#0f172a')
            .text(degreeLine || 'Degree', startX, eduY, {
              width: contentWidth - 140,
            });

          if (dates && dates !== '-') {
            doc
              .font('Helvetica')
              .fontSize(9)
              .fillColor('#475569')
              .text(dates, startX + contentWidth - 140, eduY, {
                width: 140,
                align: 'right',
              });
          }

          // Institution & Grade
          const instY = doc.y;
          doc
            .font('Helvetica-Bold')
            .fontSize(9)
            .fillColor('#334155')
            .text(edu.institution || '', startX, instY, {
              width: contentWidth - 140,
            });

          if (edu.grade) {
            const gradeText = edu.gradeType
              ? `${edu.gradeType}: ${edu.grade}`
              : `Grade: ${edu.grade}`;
            doc
              .font('Helvetica')
              .fontSize(9)
              .fillColor('#475569')
              .text(gradeText, startX + contentWidth - 140, instY, {
                width: 140,
                align: 'right',
              });
          }

          if (edu.relevantCoursework && edu.relevantCoursework.length > 0) {
            doc
              .font('Helvetica-Bold')
              .fontSize(8.5)
              .fillColor('#475569')
              .text('Coursework: ', startX + 8, doc.y, { continued: true })
              .font('Helvetica')
              .text(edu.relevantCoursework.join(', '));
          }

          if (edu.description && edu.description.trim()) {
            doc
              .font('Helvetica')
              .fontSize(9)
              .fillColor('#1e293b')
              .text(edu.description.trim(), startX + 8, doc.y, {
                width: contentWidth - 8,
              });
          }

          doc.moveDown(0.3);
        });
      }
    }

    // -------------------------------------------------------------
    // 7. Certifications
    // -------------------------------------------------------------
    if (profile.certifications && profile.certifications.length > 0) {
      const validCerts = profile.certifications.filter((c) => c.name);
      if (validCerts.length > 0) {
        renderSectionHeading(doc, 'Certifications');
        validCerts.forEach((cert) => {
          ensureSpace(doc, 25);
          const certY = doc.y;
          const certTitle = cert.issuingOrganization
            ? `${cert.name} — ${cert.issuingOrganization}`
            : cert.name;

          doc
            .font('Helvetica-Bold')
            .fontSize(9.5)
            .fillColor('#0f172a')
            .text(`•  ${certTitle}`, startX, certY, {
              width: contentWidth - 120,
            });

          const certDate = cert.issueDate
            ? cert.expirationDate
              ? `${cert.issueDate} - ${cert.expirationDate}`
              : cert.issueDate
            : '';

          if (certDate) {
            doc
              .font('Helvetica')
              .fontSize(8.5)
              .fillColor('#64748b')
              .text(certDate, startX + contentWidth - 120, certY, {
                width: 120,
                align: 'right',
              });
          }

          if (cert.credentialId) {
            doc
              .font('Helvetica')
              .fontSize(8.5)
              .fillColor('#64748b')
              .text(`Credential ID: ${cert.credentialId}`, startX + 12, doc.y);
          }
        });
      }
    }

    // -------------------------------------------------------------
    // 8. Achievements & Awards
    // -------------------------------------------------------------
    if (profile.achievements && profile.achievements.length > 0) {
      const validAch = profile.achievements.filter((a) => a.title);
      if (validAch.length > 0) {
        renderSectionHeading(doc, 'Achievements & Awards');
        validAch.forEach((ach) => {
          ensureSpace(doc, 25);
          const achY = doc.y;
          const achTitle = ach.issuer
            ? `${ach.title} — ${ach.issuer}`
            : ach.title;

          doc
            .font('Helvetica-Bold')
            .fontSize(9.5)
            .fillColor('#0f172a')
            .text(`•  ${achTitle}`, startX, achY, {
              width: contentWidth - 100,
            });

          if (ach.date) {
            doc
              .font('Helvetica')
              .fontSize(8.5)
              .fillColor('#64748b')
              .text(ach.date, startX + contentWidth - 100, achY, {
                width: 100,
                align: 'right',
              });
          }

          if (ach.description && ach.description.trim()) {
            doc
              .font('Helvetica')
              .fontSize(9)
              .fillColor('#334155')
              .text(ach.description.trim(), startX + 12, doc.y, {
                width: contentWidth - 12,
              });
          }
        });
      }
    }

    // -------------------------------------------------------------
    // 9. Leadership & Extracurricular Activities
    // -------------------------------------------------------------
    if (profile.leadership && profile.leadership.length > 0) {
      const validLead = profile.leadership.filter(
        (l) => l.organization || l.position
      );
      if (validLead.length > 0) {
        renderSectionHeading(doc, 'Leadership & Activities');
        validLead.forEach((lead) => {
          ensureSpace(doc, 30);
          const leadY = doc.y;
          const positionLine = [lead.position, lead.organization]
            .filter(Boolean)
            .join(', ');
          const dates = `${lead.startDate || ''} - ${lead.endDate || ''}`.trim();

          doc
            .font('Helvetica-Bold')
            .fontSize(9.5)
            .fillColor('#0f172a')
            .text(positionLine, startX, leadY, { width: contentWidth - 120 });

          if (dates && dates !== '-') {
            doc
              .font('Helvetica')
              .fontSize(8.5)
              .fillColor('#64748b')
              .text(dates, startX + contentWidth - 120, leadY, {
                width: 120,
                align: 'right',
              });
          }

          if (lead.responsibilities && lead.responsibilities.length > 0) {
            lead.responsibilities.forEach((r) => {
              if (!r || !r.trim()) return;
              doc
                .font('Helvetica')
                .fontSize(9)
                .fillColor('#1e293b')
                .text(`•  ${r.trim()}`, startX + 8, doc.y, {
                  width: contentWidth - 8,
                });
            });
          }
        });
      }
    }

    // -------------------------------------------------------------
    // 10. Additional Information
    // -------------------------------------------------------------
    const hasLanguages =
      profile.additional?.languages && profile.additional.languages.length > 0;
    const hasPublications =
      profile.additional?.publications &&
      profile.additional.publications.length > 0;
    const hasVolunteer =
      profile.additional?.volunteerExperience &&
      profile.additional.volunteerExperience.length > 0;
    const hasInterests =
      profile.additional?.interests && profile.additional.interests.length > 0;

    if (hasLanguages || hasPublications || hasVolunteer || hasInterests) {
      renderSectionHeading(doc, 'Additional Information');

      if (hasLanguages) {
        ensureSpace(doc, 18);
        const langString = profile.additional.languages
          .map((l) => `${l.language} (${l.proficiency || 'Proficient'})`)
          .join(', ');
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor('#0f172a')
          .text('•  Languages: ', startX, doc.y, { continued: true })
          .font('Helvetica')
          .fillColor('#334155')
          .text(langString);
      }

      if (hasVolunteer) {
        profile.additional.volunteerExperience.forEach((vol) => {
          ensureSpace(doc, 20);
          const volLine = `${vol.role || 'Volunteer'} — ${vol.organization || ''}`;
          doc
            .font('Helvetica-Bold')
            .fontSize(9)
            .fillColor('#0f172a')
            .text(`•  ${volLine}`, startX, doc.y);
          if (vol.description) {
            doc
              .font('Helvetica')
              .fontSize(8.5)
              .fillColor('#475569')
              .text(vol.description, startX + 12, doc.y, {
                width: contentWidth - 12,
              });
          }
        });
      }

      if (hasPublications) {
        profile.additional.publications.forEach((pub) => {
          ensureSpace(doc, 20);
          const pubLine = `${pub.title}${pub.publisher ? ` (${pub.publisher})` : ''}`;
          doc
            .font('Helvetica-Bold')
            .fontSize(9)
            .fillColor('#0f172a')
            .text(`•  ${pubLine}`, startX, doc.y);
        });
      }

      if (hasInterests) {
        ensureSpace(doc, 18);
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor('#0f172a')
          .text('•  Interests: ', startX, doc.y, { continued: true })
          .font('Helvetica')
          .fillColor('#334155')
          .text(profile.additional.interests.join(', '));
      }
    }

    doc.end();
  });
};

module.exports = {
  getResumeProfile,
  saveResumeProfile,
  updateResumeProfile,
  deleteResumeProfile,
  generateResumePdfBuffer,
};
