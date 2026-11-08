const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { requireAuth } = require('../middleware/authMiddleware');

// Personal Profile routes
router.get('/profile', requireAuth, profileController.getPersonalProfile);
router.put('/profile', requireAuth, profileController.updatePersonalProfile);
router.get('/profile/complete', requireAuth, profileController.getCompleteProfile);

// Career Profile & Skills routes
router.get('/career-profile', requireAuth, profileController.getCareerProfile);
router.put('/career-profile', requireAuth, profileController.updateCareerProfile);
router.post('/career-profile/skills', requireAuth, profileController.addCareerSkill);
router.put('/career-profile/skills/:skillId', requireAuth, profileController.updateCareerSkill);
router.delete('/career-profile/skills/:skillId', requireAuth, profileController.deleteCareerSkill);

module.exports = router;
