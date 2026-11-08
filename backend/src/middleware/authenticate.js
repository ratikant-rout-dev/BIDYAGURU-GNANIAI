const { requireAuth } = require('./authMiddleware');

/**
 * Centralized authentication middleware
 * Verifies access token from Authorization header or cookie
 */
const authenticate = requireAuth;

module.exports = {
  authenticate,
  requireAuth,
};
