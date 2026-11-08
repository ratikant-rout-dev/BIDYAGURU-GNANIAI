const resumeService = require('../services/resumeService');

/**
 * Save or create the authenticated user's resume profile
 * POST /api/resume
 */
const saveResume = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const profile = await resumeService.saveResumeProfile(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Resume profile saved successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get the authenticated user's saved resume profile
 * GET /api/resume
 */
const getResume = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const profile = await resumeService.getResumeProfile(userId);

    res.json({
      success: true,
      profile: profile || null,
      message: profile
        ? 'Resume profile retrieved successfully'
        : 'No resume profile found for user',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update the authenticated user's resume profile
 * PUT /api/resume
 */
const updateResume = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const profile = await resumeService.updateResumeProfile(userId, req.body);

    res.json({
      success: true,
      message: 'Resume profile updated successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete the authenticated user's resume profile
 * DELETE /api/resume
 */
const deleteResume = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const deleted = await resumeService.deleteResumeProfile(userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'No resume profile found to delete',
      });
    }

    res.json({
      success: true,
      message: 'Resume profile deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate and download an ATS-friendly PDF
 * GET /api/resume/pdf
 */
const generatePdf = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const profile = await resumeService.getResumeProfile(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Resume profile not found. Please create and save your resume before generating PDF.',
      });
    }

    const pdfBuffer = await resumeService.generateResumePdfBuffer(userId);

    const safeName = (profile.personalInfo?.fullName || 'Candidate')
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${safeName}_Resume.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    return res.end(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveResume,
  getResume,
  updateResume,
  deleteResume,
  generatePdf,
};
