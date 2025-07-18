const { google } = require('googleapis');
const HttpResponseHandler = require('../../../utils/httpResponseHandler');
const { ApiError } = require('../../../utils/errorHandler');
const googleTokenService = require('../../../utils/googleTokenService');

const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;

    // Get valid Google access token
    const accessToken = await googleTokenService.getValidGoogleToken(userId);

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    // Get user profile from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    return HttpResponseHandler.success(
      res,
      data,
      'Google profile retrieved successfully',
      200
    );
  } catch (error) {
    throw new ApiError(error.message || 'Failed to get Google profile', 500);
  }
};

const getGoogleDriveFiles = async (req, res) => {
  try {
    const userId = req.userId;

    // Get valid Google access token
    const accessToken = await googleTokenService.getValidGoogleToken(userId);

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    // Get files from Google Drive
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const { data } = await drive.files.list({
      pageSize: 10,
      fields: 'nextPageToken, files(id, name, mimeType, createdTime)'
    });

    return HttpResponseHandler.success(
      res,
      data.files,
      'Google Drive files retrieved successfully',
      200
    );
  } catch (error) {
    throw new ApiError(
      error.message || 'Failed to get Google Drive files',
      500
    );
  }
};

const getGoogleCalendarEvents = async (req, res) => {
  try {
    const userId = req.userId;

    // Get valid Google access token
    const accessToken = await googleTokenService.getValidGoogleToken(userId);

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    // Get calendar events
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const { data } = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime'
    });

    return HttpResponseHandler.success(
      res,
      data.items,
      'Google Calendar events retrieved successfully',
      200
    );
  } catch (error) {
    throw new ApiError(
      error.message || 'Failed to get Google Calendar events',
      500
    );
  }
};

module.exports = {
  getUserProfile,
  getGoogleDriveFiles,
  getGoogleCalendarEvents
};
