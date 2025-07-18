class HttpResponseHandler {
  /**
   * Generate a success response
   * @param {Object} res - Express response object
   * @param {Object} data - Data to include in the response
   * @param {String} message - Optional success message
   * @param {Number} statusCode - Optional HTTP status code (default is 200)
   */
  static success(
    res,
    data = {},
    message = 'Request successful',
    statusCode = 200
  ) {
    return res.status(statusCode).json({
      message: message,
      errors: null,
      data: data,
      status: 'success',
      status_code: statusCode
    });
  }

  /**
   * Generate an error response
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   * @param {Number} statusCode - HTTP status code (default is 500)
   * @param {Array} errors - Optional array of errors
   */
  static error(
    res,
    message = 'An error occurred',
    statusCode = 500,
    errors = []
  ) {
    return res.status(statusCode).json({
      message: message,
      errors: errors,
      data: null,
      status: 'error',
      status_code: statusCode
    });
  }
}

module.exports = HttpResponseHandler;
