const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/me', requireAuth, authController.getMe);
router.put('/me', requireAuth, authController.updateMe);

module.exports = router;

