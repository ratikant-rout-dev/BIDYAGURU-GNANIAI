const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/generate', requireAuth, roadmapController.generateRoadmap);
router.get('/current', requireAuth, roadmapController.getCurrentRoadmap);
router.patch('/items/:itemId', requireAuth, roadmapController.updateRoadmapItemStatus);

module.exports = router;

