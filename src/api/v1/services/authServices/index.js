const bcrypt = require('bcrypt');
const User = require('../../../../models/user/user.model');
const developer = require('../../../../models/developer/developer.model');
const { ApiError } = require('../../../../utils/errorHandler');
const otpService = require('../../../../utils/otpService');
const { addEmailJob } = require('../../../../jobs/emailQueue');
const {
  generateWelcomeEmail
} = require('../../../../utils/emailService/emailTemplateService');

const findOrCreateUser = async (profile, accessToken, refreshToken) => {
  const existingUser = await User.findOne({
    'googleAuth.googleId': profile.id
  });

  if (existingUser) {
    existingUser.googleAuth.accessToken = accessToken;
    existingUser.googleAuth.refreshToken =
      refreshToken || existingUser.googleAuth.refreshToken;
    existingUser.googleAuth.expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    return await existingUser.save();
  }

  const nameParts = profile.displayName?.split(' ') || ['', ''];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const newUser = new User({
    firstName,
    lastName,
    email: profile.emails?.[0]?.value,
    userType: 'developer',
    loginBy: 'google',
    googleAuth: {
      googleId: profile.id,
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    },
    profilePicture: profile.photos?.[0]?.value,
    isVerified: true
  });

  return await newUser.save();
};

const findOrCreateLinkedInUser = async (profile, accessToken, refreshToken) => {
  const existingUser = await User.findOne({
    'linkedinAuth.linkedinId': profile.id
  });

  if (existingUser) {
    existingUser.linkedinAuth.accessToken = accessToken;
    existingUser.linkedinAuth.refreshToken =
      refreshToken || existingUser.linkedinAuth.refreshToken;
    existingUser.linkedinAuth.expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    return await existingUser.save();
  }

  const newUser = new User({
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    userType: 'developer',
    loginBy: 'linkedin',
    linkedinAuth: {
      linkedinId: profile.id,
      accessToken: accessToken,
      refreshToken: refreshToken
    }
  });

  return await newUser.save();
};

/**
 * Generate welcome email HTML content using the new template
 * @param {string} recipientName - Recipient name
 * @returns {string} - HTML content
 */
const generateWelcomeEmailHTML = recipientName => {
  return generateWelcomeEmail(recipientName);
};

const emailRegisterService = async ({
  email,
  firstName,
  lastName,
  password
}) => {
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (!existingUser.isVerified) {
        const otpResult = await otpService.generateAndSendOTP(
          email,
          firstName,
          'register'
        );

        if (!otpResult.success) {
          throw new ApiError(otpResult.message, 400);
        }

        return {
          success: true,
          message: 'User already registered but not verified. OTP sent again.',
          email
        };
      }
      throw new ApiError('User already exists with this email', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new developer({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      userType: 'developer',
      isVerified: false
    });

    const savedUser = await newUser.save();

    const otpResult = await otpService.generateAndSendOTP(
      email,
      firstName,
      'register'
    );
    return {
      success: true,
      message: otpResult.message,
      email,
      userId: savedUser._id,
      otp: otpResult.otp
    };
  } catch (error) {
    throw new ApiError(error.message || 'Registration failed', 400);
  }
};

const verifyEmailAndCreateUser = async ({ email, otp }) => {
  try {
    const otpVerification = await otpService.verifyOTP(email, otp, 'register');

    if (!otpVerification.success) {
      throw new ApiError(otpVerification.message, 400);
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError('User not found. Please register again.', 400);
    }

    if (user.isVerified) {
      throw new ApiError('User is already verified.', 400);
    }

    user.isVerified = true;
    const updatedUser = await user.save();

    // Send welcome email via Bull queue to AWS SES
    const welcomeEmailData = {
      to: email,
      subject: 'Welcome to RemoteEngine! 🎉',
      htmlContent: generateWelcomeEmailHTML(user.firstName),
      textContent: `Hi ${user.firstName}, Welcome to RemoteEngine! Your account has been successfully created and verified. Next steps: Complete your profile setup, Explore available opportunities, Connect with the community. Best regards, RemoteEngine Team`
    };

    await addEmailJob(welcomeEmailData);

    // Return user without password
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    return {
      success: true,
      message: 'Email verified successfully',
      user: userResponse
    };
  } catch (error) {
    throw new ApiError(error.message || 'Email verification failed', 400);
  }
};

const resendRegistrationOTP = async ({ email }) => {
  try {
    // Check if user exists in database
    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError('User not found. Please register first.', 400);
    }

    if (user.isVerified) {
      throw new ApiError('User is already verified.', 400);
    }

    // Generate and send new OTP
    const otpResult = await otpService.generateAndSendOTP(
      email,
      user.firstName,
      'register'
    );

    if (!otpResult.success) {
      throw new ApiError(otpResult.message, 400);
    }

    return {
      success: true,
      message: otpResult.message
    };
  } catch (error) {
    throw new ApiError(error.message || 'Failed to resend OTP', 400);
  }
};

const emailLoginService = async ({ email, password }) => {
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    if (!user.isVerified) {
      throw new ApiError('Please verify your email before logging in', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError('Invalid password', 401);
    }
    user.lastLogin = new Date();
    user.isActive = true;
    user.isVerified = true;
    user.loginBy = 'email';
    await user.save();

    const userResponse = {
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType,
      profilePicture: user.profilePicture
    };

    return userResponse;
  } catch (error) {
    throw new ApiError(error.message || 'Login failed', 401);
  }
};

const forgotPasswordService = async ({ email }) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    const otpResult = await otpService.generateAndSendOTP(
      email,
      user.firstName,
      'forgot-password'
    );

    if (!otpResult.success) {
      throw new ApiError(otpResult.message, 400);
    }

    return {
      success: true,
      message: otpResult.message //for development purpose
    };
  } catch (error) {
    throw new ApiError(error.message || 'Forgot password failed', 400);
  }
};

const resetPasswordService = async ({ email, otp, newPassword }) => {
  try {
    // Verify OTP first
    const otpVerification = await otpService.verifyOTP(
      email,
      otp,
      'forgot-password'
    );

    if (!otpVerification.success) {
      throw new ApiError(otpVerification.message, 400);
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    return {
      success: true,
      message: 'Password reset successfully'
    };
  } catch (error) {
    throw new ApiError(error.message || 'Password reset failed', 400);
  }
};

module.exports = {
  findOrCreateUser,
  emailRegisterService,
  verifyEmailAndCreateUser,
  resendRegistrationOTP,
  findOrCreateLinkedInUser,
  emailLoginService,
  forgotPasswordService,
  resetPasswordService
};
