/**
 * Centralized authorization middleware
 * Checks user roles or ownership before allowing access
 */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before authorization check.',
      });
    }

    if (allowedRoles.length > 0) {
      const userRole = req.user.role || 'student';
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Insufficient permissions to access this resource.',
        });
      }
    }

    next();
  };
};

module.exports = {
  authorize,
};
