const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validateMiddleware');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} = require('../validators/authValidators');
const { authLimiter } = require('../middleware/rateLimiter');
const { requireAuth } = require('../middleware/authMiddleware');

// Public auth endpoints
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);

// Logout endpoints (allows logout via cookie even if access token is stale)
router.post('/logout', (req, res, next) => {
  // Try authenticate if token provided, but proceed regardless
  requireAuth(req, res, () => {
    authController.logout(req, res, next);
  }).catch(() => {
    authController.logout(req, res, next);
  });
});

router.post('/logout-all', requireAuth, authController.logoutAll);

// Current user profile endpoints
router.get('/me', requireAuth, authController.getMe);
router.put('/me', requireAuth, authController.updateMe);

module.exports = router;
