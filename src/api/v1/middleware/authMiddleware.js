const jwtService = require('../../../utils/jwtService');
const { ApiError } = require('../../../utils/errorHandler');
const User = require('../../../models/user/user.model');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new ApiError('Access token is required', 401);
    }

    const decoded = jwtService.verifyAccessToken(token);

    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive || user.isDeleted) {
      throw new ApiError('User not found or inactive', 401);
    }

    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    next(error);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwtService.verifyAccessToken(token);
      const user = await User.findById(decoded.userId);

      if (user && user.isActive && !user.isDeleted) {
        req.user = user;
        req.userId = decoded.userId;
      }
    }

    next();
  } catch (error) {
    // For optional auth, continue even if token is invalid
    next();
  }
};

const requireRole = roles => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError('Authentication required', 401);
    }

    if (!roles.includes(req.user.userType)) {
      throw new ApiError('Insufficient permissions', 403);
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole
};
