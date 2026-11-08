const express = require('express');
const router = express.Router();
const multer = require('multer');
const voiceController = require('../controllers/voiceController');
const { requireAuth } = require('../middleware/authMiddleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB audio
});

router.post('/synthesize', requireAuth, voiceController.synthesize);
router.post('/transcribe', requireAuth, upload.single('audio'), voiceController.transcribe);
router.post('/chat', requireAuth, voiceController.conversationChat);

module.exports = router;

