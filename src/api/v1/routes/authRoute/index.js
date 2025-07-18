const express = require('express');
const passport = require('passport');
const {
  authRateLimiter,
  otpRateLimiter,
  loginRateLimiter
} = require('../../../../middleware/rateLimiter');
const authRoute = express.Router();

const {
  loginSuccess,
  logout,
  refreshToken,
  emailRegister,
  verifyEmailOTP,
  resendOTP,
  emailLogin,
  forgotPassword,
  resetPassword
} = require('../../controllers/authControllers');

const {
  validateEmailRegistration,
  validateOTPVerification,
  validateResendOTP,
  validateEmailLogin,
  validateForgotPassword,
  validateResetPassword
} = require('../../validators/authValidators');

authRoute.get(
  '/login/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

authRoute.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/failed',
    session: true
  }),
  (req, res) => {
    res.redirect('/auth/success');
  }
);

authRoute.get('/success', loginSuccess);

authRoute.get('/logout', logout);

authRoute.post('/refresh-token', refreshToken);

authRoute.get('/failed', (req, res) =>
  res.status(401).json({ message: 'Login failed' })
);

authRoute.get('/linkedin', passport.authenticate('linkedin'));

authRoute.get(
  '/linkedin/callback',
  passport.authenticate('linkedin', {
    successRedirect: '/auth/success',
    failureRedirect: '/auth/failed'
  })
);

// Email registration with OTP verification
authRoute.post(
  '/register/email',
  authRateLimiter,
  validateEmailRegistration,
  emailRegister
);
authRoute.post(
  '/verify-email',
  otpRateLimiter,
  validateOTPVerification,
  verifyEmailOTP
);
authRoute.post('/resend-otp', otpRateLimiter, validateResendOTP, resendOTP);

// Email login
authRoute.post(
  '/login/email',
  loginRateLimiter,
  validateEmailLogin,
  emailLogin
);

authRoute.post('/forgot-password', validateForgotPassword, forgotPassword);

authRoute.post('/reset-password', validateResetPassword, resetPassword);

module.exports = authRoute;
