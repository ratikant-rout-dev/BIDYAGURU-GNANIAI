const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/analyze', requireAuth, careerController.analyzeCareer);
router.get('/profile', requireAuth, careerController.getProfile);
router.put('/profile', requireAuth, careerController.updateProfile);

module.exports = router;

