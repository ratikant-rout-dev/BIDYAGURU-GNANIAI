const express = require('express');
const router = express.Router();
const communicationController = require('../controllers/communicationController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/prompts', requireAuth, communicationController.getPrompts);
router.post('/practice', requireAuth, communicationController.submitPractice);
router.post('/chat', requireAuth, communicationController.conversationChat);
router.get('/history', requireAuth, communicationController.getHistory);

module.exports = router;

