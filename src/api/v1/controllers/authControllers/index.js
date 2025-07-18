const { ApiError } = require('../../../../utils/errorHandler');
const HttpResponseHandler = require('../../../../utils/httpResponseHandler');
const jwtService = require('../../../../utils/jwtService');
const {
  emailRegisterService,
  emailLoginService,
  verifyEmailAndCreateUser,
  resendRegistrationOTP,
  forgotPasswordService,
  resetPasswordService
} = require('../../services/authServices');

const loginSuccess = (req, res) => {
  if (!req.user) {
    throw new ApiError('Unauthorized', 401);
  }

  // Generate JWT tokens for your application
  const payload = {
    userId: req.user._id,
    email: req.user.email,
    userType: req.user.userType,
    loginBy: req.user.loginBy
  };

  const tokens = jwtService.generateTokenPair(payload);

  const userData = {
    user: {
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      userType: req.user.userType,
      profilePicture: req.user.profilePicture,
      isVerified: req.user.isVerified,
      loginBy: req.user.loginBy
    },
    tokens: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }
  };
  return HttpResponseHandler.success(res, userData, 'Login successful', 200);
};

const logout = (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(new ApiError('Logout failed', 500));
    }
    res.status(200).json({ message: 'Logout successful' });
  });
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError('Refresh token is required', 400);
    }

    // Verify refresh token
    const decoded = jwtService.verifyRefreshToken(refreshToken);

    // Generate new access token
    const payload = {
      userId: decoded.userId,
      email: decoded.email,
      userType: decoded.userType,
      loginBy: decoded.loginBy
    };

    const newAccessToken = jwtService.generateAccessToken(payload);

    return HttpResponseHandler.success(
      res,
      {
        accessToken: newAccessToken,
        tokenType: 'Bearer',
        expiresIn: '15m'
      },
      'Token refreshed successfully',
      200
    );
  } catch (error) {
    throw new ApiError(error.message || 'Invalid refresh token', 401);
  }
};

const emailRegister = async (req, res, next) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    const result = await emailRegisterService({
      email,
      firstName,
      lastName,
      password
    });

    return HttpResponseHandler.success(
      res,
      {
        email: result.email,
        message: result.message,
        otp: result.otp
      },
      'Registration initiated. Please check your email for OTP.',
      200
    );
  } catch (error) {
    // Let ApiError instances bubble up to error middleware
    if (error instanceof ApiError) {
      return next(error);
    }
    // Handle unexpected errors
    return HttpResponseHandler.error(res, 'Registration failed', 500, []);
  }
};

const verifyEmailOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const result = await verifyEmailAndCreateUser({ email, otp });

    // Generate JWT tokens for the verified user
    const payload = {
      userId: result.user._id,
      email: result.user.email,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      userType: result.user.userType,
      loginBy: result.user.loginBy,
      isVerified: result.user.isVerified,
      profilePicture: result.user.profilePicture
    };

    const tokens = jwtService.generateTokenPair(payload);

    return HttpResponseHandler.success(
      res,
      {
        user: result.user,
        tokens,
        message: result.message
      },
      'Email verified successfully',
      200
    );
  } catch (error) {
    // Let ApiError instances bubble up to error middleware
    if (error instanceof ApiError) {
      return next(error);
    }
    // Handle unexpected errors
    return HttpResponseHandler.error(res, 'Email verification failed', 500, []);
  }
};

const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await resendRegistrationOTP({ email });

    return HttpResponseHandler.success(
      res,
      {
        email,
        message: result.message
      },
      'OTP resent successfully',
      200
    );
  } catch (error) {
    // Let ApiError instances bubble up to error middleware
    if (error instanceof ApiError) {
      return next(error);
    }
    // Handle unexpected errors
    return HttpResponseHandler.error(res, 'Failed to resend OTP', 500, []);
  }
};

const emailLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await emailLoginService({ email, password });

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    const payload = {
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      loginBy: user.loginBy,
      isVerified: user.isVerified
    };

    const tokens = jwtService.generateTokenPair(payload);

    return HttpResponseHandler.success(
      res,
      {
        user,
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      },
      'User logged in successfully',
      200
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return HttpResponseHandler.error(res, 'Login failed', 500, []);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await forgotPasswordService({ email });

    return HttpResponseHandler.success(
      res,
      result,
      'Forgot password successful',
      200
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return HttpResponseHandler.error(res, 'Forgot password failed', 500, []);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const result = await resetPasswordService({ email, otp, newPassword });

    return HttpResponseHandler.success(
      res,
      result,
      'Password reset successful',
      200
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return HttpResponseHandler.error(res, 'Password reset failed', 500, []);
  }
};

module.exports = {
  // Auth routes
  loginSuccess,
  logout,
  refreshToken,
  emailRegister,
  verifyEmailOTP,
  resendOTP,
  emailLogin,
  forgotPassword,
  resetPassword
};
