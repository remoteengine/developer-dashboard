const { google } = require('googleapis');
const config = require('../../config/config');
const User = require('../../models/user/user.model');
const { logger } = require('../../config/logger');

const oauth2Client = new google.auth.OAuth2(
  config.google.clientId,
  config.google.clientSecret,
  config.google.redirectUri
);

const refreshGoogleToken = async userId => {
  try {
    const user = await User.findById(userId);

    if (!user || !user.googleAuth.refreshToken) {
      throw new Error('User not found or no refresh token available');
    }

    // Check if token is still valid (buffer of 5 minutes)
    const now = new Date();
    const tokenExpiry = new Date(user.googleAuth.expiresAt);

    if (tokenExpiry > now.getTime() + 5 * 60 * 1000) {
      // Token is still valid
      return user.googleAuth.accessToken;
    }

    // Set refresh token
    oauth2Client.setCredentials({
      refresh_token: user.googleAuth.refreshToken
    });

    // Get new access token
    const { credentials } = await oauth2Client.refreshAccessToken();

    // Update user's tokens
    user.googleAuth.accessToken = credentials.access_token;
    user.googleAuth.expiresAt = new Date(credentials.expiry_date);

    // Update refresh token if provided
    if (credentials.refresh_token) {
      user.googleAuth.refreshToken = credentials.refresh_token;
    }

    await user.save();

    return credentials.access_token;
  } catch (error) {
    logger.error('Error refreshing Google token:', error);
    throw new Error('Failed to refresh Google token');
  }
};

const getValidGoogleToken = async userId => {
  try {
    const user = await User.findById(userId);

    if (!user || !user.googleAuth.googleId) {
      throw new Error('User not authenticated with Google');
    }

    // Check if current token is valid
    const now = new Date();
    const tokenExpiry = new Date(user.googleAuth.expiresAt);

    if (tokenExpiry > now) {
      return user.googleAuth.accessToken;
    }

    // Token expired, refresh it
    return await refreshGoogleToken(userId);
  } catch (error) {
    logger.error('Error getting valid Google token:', error);
    throw error;
  }
};

const revokeGoogleToken = async userId => {
  try {
    const user = await User.findById(userId);

    if (!user || !user.googleAuth.accessToken) {
      throw new Error('No Google token to revoke');
    }

    oauth2Client.setCredentials({
      access_token: user.googleAuth.accessToken
    });

    await oauth2Client.revokeCredentials();

    // Clear Google auth data
    user.googleAuth = {
      googleId: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null
    };

    await user.save();

    return true;
  } catch (error) {
    logger.error('Error revoking Google token:', error);
    throw new Error('Failed to revoke Google token');
  }
};

module.exports = {
  refreshGoogleToken,
  getValidGoogleToken,
  revokeGoogleToken
};
