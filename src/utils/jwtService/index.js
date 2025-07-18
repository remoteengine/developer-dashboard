const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const ApiError = require('../errorHandler/index');

const generateAccessToken = payload => {
  return jwt.sign(payload, config.AcessToken, {
    expiresIn: config.AccessTokenExpiresIn
  });
};

const generateRefreshToken = payload => {
  return jwt.sign(payload, config.refreshTokenSecret, {
    expiresIn: config.refreshTokenExpires
  });
};

// Function version: throws ApiError if invalid
const verifyAccessToken = token => {
  try {
    return jwt.verify(token, config.AcessToken);
  } catch (error) {
    throw new ApiError('Invalid token', 401);
  }
};

// Middleware version: passes errors to next()
const verifyAccessTokenMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new ApiError('Access token is required', 401);
    }
    const decoded = jwt.verify(token, config.AcessToken);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

const verifyRefreshToken = token => {
  try {
    return jwt.verify(token, config.refreshTokenSecret);
  } catch (error) {
    throw new ApiError('Invalid token', 401);
  }
};

const generateTokenPair = payload => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: config.AccessTokenExpiresIn
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken, // function version
  verifyAccessTokenMiddleware, // middleware version
  verifyRefreshToken,
  generateTokenPair
};
