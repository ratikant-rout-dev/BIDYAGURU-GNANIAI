const express = require('express');
const router = express.Router();
const multer = require('multer');
const jobController = require('../controllers/jobController');
const { requireAuth } = require('../middleware/authMiddleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get('/', requireAuth, jobController.getMatchedJobs);
router.post('/resume/upload', requireAuth, upload.single('resume'), jobController.uploadResume);
router.get('/applications', requireAuth, jobController.getAppliedJobs);
router.post('/apply', requireAuth, jobController.applyForJob);
router.get('/:jobId', requireAuth, jobController.getJobDetails);

module.exports = router;
