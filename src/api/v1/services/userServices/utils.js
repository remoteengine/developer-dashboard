const createSuccessResponse = (message, data) => ({
  success: true,
  message,
  data
});

const createErrorResponse = (message, error = null, data = null) => ({
  success: false,
  message,
  ...(error && { error }),
  data
});

const sanitizeUserData = userData => {
  const sanitized = userData.toObject ? userData.toObject() : { ...userData };
  delete sanitized.password;
  delete sanitized.emailToken;
  delete sanitized.googleAuth?.accessToken;
  delete sanitized.googleAuth?.refreshToken;
  delete sanitized.linkedinAuth?.accessToken;
  return sanitized;
};

const sanitizeAddressData = addressData => {
  const sanitized = addressData.toObject
    ? addressData.toObject()
    : { ...addressData };
  delete sanitized._id;
  delete sanitized.__v;
  delete sanitized.createdAt;
  delete sanitized.updatedAt;
  return sanitized;
};

module.exports = {
  createSuccessResponse,
  createErrorResponse,
  sanitizeUserData,
  sanitizeAddressData
};
