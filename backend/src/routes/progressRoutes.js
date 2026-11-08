const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/summary', requireAuth, progressController.getSummary);

module.exports = router;

