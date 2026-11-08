const crypto = require('crypto');
const User = require('../models/User');
const CareerProfile = require('../models/CareerProfile');
const RefreshToken = require('../models/RefreshToken');
const { hashPassword, comparePassword } = require('../utils/password');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, preferredLanguage } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = crypto.randomBytes(24).toString('hex');

    const user = await User.create({
      name,
      email,
      passwordHash,
      preferredLanguage: preferredLanguage || 'en-IN',
      verificationToken,
      emailVerified: true, // Auto-verified for seamless testing
    });

    // Create default career profile
    await CareerProfile.create({
      userId: user._id,
      languagePreference: user.preferredLanguage,
    });

    const family = crypto.randomBytes(16).toString('hex');
    const accessToken = signAccessToken({ userId: user._id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user._id, family });

    // Persist hashed refresh token for rotation & revocation tracking
    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(refreshToken),
      family,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    });

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const family = crypto.randomBytes(16).toString('hex');
    const accessToken = signAccessToken({ userId: user._id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user._id, family });

    // Persist hashed refresh token session
    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(refreshToken),
      family,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    });

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });

    res.json({
      success: true,
      message: 'Logged in successfully!',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Rotate Refresh Token with Automatic Reuse Detection
 */
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token missing',
      });
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      });
    }

    const tokenH = hashToken(token);
    const storedToken = await RefreshToken.findOne({ tokenHash: tokenH });

    // REUSE DETECTION: If a previously revoked token is reused, invalidate entire session family
    if (storedToken && storedToken.isRevoked) {
      console.warn(`[Security Alert] Refresh token reuse detected for user ${user._id}. Revoking family ${storedToken.family}.`);
      await RefreshToken.updateMany(
        { family: storedToken.family, isRevoked: false },
        { isRevoked: true, revokedAt: new Date() }
      );
      user.refreshToken = undefined;
      await user.save();

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.status(401).json({
        success: false,
        message: 'Suspicious session activity detected. Token chain has been revoked. Please log in again.',
      });
    }

    // Check expiration if recorded in document
    if (storedToken && storedToken.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token has expired. Please log in again.',
      });
    }

    // If not in RefreshToken collection (e.g. legacy session), check direct user field
    if (!storedToken && user.refreshToken !== token) {
      return res.status(401).json({
        success: false,
        message: 'Token revoked or invalid',
      });
    }

    const family = storedToken?.family || decoded.family || crypto.randomBytes(16).toString('hex');

    // Issue rotated tokens
    const newAccessToken = signAccessToken({ userId: user._id, email: user.email });
    const newRefreshToken = signRefreshToken({ userId: user._id, family });
    const newHash = hashToken(newRefreshToken);

    // Mark old token as revoked and track replacement
    if (storedToken) {
      storedToken.isRevoked = true;
      storedToken.revokedAt = new Date();
      storedToken.replacedByTokenHash = newHash;
      await storedToken.save();
    }

    // Create new active token session
    await RefreshToken.create({
      userId: user._id,
      tokenHash: newHash,
      family,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    });

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie('refreshToken', newRefreshToken, cookieOptions);
    res.cookie('accessToken', newAccessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });

    res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token.',
      });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully!',
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been issued.',
      });
    }

    const resetToken = crypto.randomBytes(24).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    res.json({
      success: true,
      message: 'Password reset link generated.',
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired.',
      });
    }

    user.passwordHash = await hashPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Invalidate all active refresh sessions upon password reset
    await RefreshToken.updateMany(
      { userId: user._id, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() }
    );

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout single session
 */
const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body?.refreshToken;
    if (token) {
      const tokenH = hashToken(token);
      await RefreshToken.findOneAndUpdate(
        { tokenHash: tokenH },
        { isRevoked: true, revokedAt: new Date() }
      );
    }

    if (req.user) {
      req.user.refreshToken = undefined;
      await req.user.save();
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout all active sessions for current user
 */
const logoutAll = async (req, res, next) => {
  try {
    if (req.user) {
      await RefreshToken.updateMany(
        { userId: req.user._id, isRevoked: false },
        { isRevoked: true, revokedAt: new Date() }
      );
      req.user.refreshToken = undefined;
      await req.user.save();
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'All active sessions revoked successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    const profile = await CareerProfile.findOne({ userId: user._id });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
        emailVerified: user.emailVerified,
      },
      hasProfile: !!profile?.careerGoal,
    });
  } catch (error) {
    next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const { name, preferredLanguage } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (preferredLanguage) user.preferredLanguage = preferredLanguage;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logout,
  logoutAll,
  getMe,
  updateMe,
};
