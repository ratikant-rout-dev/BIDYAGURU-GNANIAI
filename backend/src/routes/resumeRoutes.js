const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const {
  saveResumeSchema,
  updateResumeSchema,
} = require('../validators/resumeValidators');

// Protected routes for authenticated user
router.use(requireAuth);

router.post('/', validate(saveResumeSchema), resumeController.saveResume);
router.get('/', resumeController.getResume);
router.put('/', validate(updateResumeSchema), resumeController.updateResume);
router.patch('/', validate(updateResumeSchema), resumeController.updateResume);
router.delete('/', resumeController.deleteResume);
router.get('/pdf', resumeController.generatePdf);

module.exports = router;
