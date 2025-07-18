const { logger } = require('../../config/logger');
const { addEmailJob } = require('../../jobs/emailQueue');
const { generateOTPEmail } = require('../emailService/emailTemplateService');
const redis = require('../../config/redis');

class RedisOTPService {
  constructor() {
    this.OTP_LENGTH = 6;
    this.OTP_EXPIRY_SECONDS = 600; // 10 minutes
    this.MAX_ATTEMPTS = 3;
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  getOTPKey(email, purpose = 'login') {
    return `otp:${purpose}:${email.toLowerCase()}`;
  }

  getAttemptsKey(email, purpose = 'login') {
    return `otp_attempts:${purpose}:${email.toLowerCase()}`;
  }

  async checkOTPExists(email, purpose = 'login') {
    const otpKey = this.getOTPKey(email, purpose);
    const ttl = await redis.ttl(otpKey);
    return { exists: ttl > 0, ttl };
  }

  async storeOTP(email, otp, purpose = 'login') {
    const otpKey = this.getOTPKey(email, purpose);
    const attemptsKey = this.getAttemptsKey(email, purpose);

    await redis.set(otpKey, otp, 'EX', this.OTP_EXPIRY_SECONDS);
    await redis.set(attemptsKey, 0, 'EX', this.OTP_EXPIRY_SECONDS);
    logger.info(`✅ OTP stored in Redis for ${email}, purpose: ${purpose}`);
  }

  generateOTPEmailHTML(otp, recipientName) {
    return generateOTPEmail(recipientName, otp);
  }

  async generateAndSendOTP(email, recipientName, purpose = 'register') {
    try {
      logger.info(
        `🔍 Starting OTP generation for ${email}, purpose: ${purpose}`
      );

      const existing = await this.checkOTPExists(email, purpose);
      if (existing.exists) {
        const remaining = Math.ceil(existing.ttl / 60);
        logger.warn(
          `⚠️ OTP already exists for ${email}, ${remaining} minutes remaining`
        );
        return {
          success: false,
          message: `OTP already sent. Please wait ${remaining} minute(s) before requesting a new one.`
        };
      }

      const otp = this.generateOTP();
      logger.info(`✅ Generated OTP for ${email}: ${otp}`);

      await this.storeOTP(email, otp, purpose);
      logger.info(`✅ OTP stored in Redis for ${email}`);

      const emailData = {
        to: email,
        subject: 'Your RemoteEngine Verification Code',
        htmlContent: this.generateOTPEmailHTML(otp, recipientName),
        textContent: `Hi ${recipientName}, Your verification code is: ${otp}. This code expires in 10 minutes.`
      };

      logger.info(`📧 Adding email job for ${email}`);
      await addEmailJob(emailData);
      logger.info(`📧 OTP email queued for ${email}`);

      return {
        success: true,
        message: 'OTP sent successfully.',
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      };
    } catch (err) {
      logger.error('Error generating/sending OTP:', err);
      logger.error('Full error stack:', err.stack);
      return {
        success: false,
        message: 'Failed to send OTP.'
      };
    }
  }

  async verifyOTP(email, inputOTP, purpose = 'login') {
    const otpKey = this.getOTPKey(email, purpose);
    const attemptsKey = this.getAttemptsKey(email, purpose);

    const storedOTP = await redis.get(otpKey);
    if (!storedOTP) {
      return {
        success: false,
        message: 'OTP expired or not found.'
      };
    }

    const currentAttempts = parseInt(await redis.get(attemptsKey), 3) || 0;

    if (currentAttempts >= this.MAX_ATTEMPTS) {
      await this.deleteOTP(email, purpose);
      return {
        success: false,
        message: 'Maximum attempts exceeded. Please request a new OTP.'
      };
    }

    if (storedOTP === inputOTP) {
      await this.deleteOTP(email, purpose);
      logger.info(`✅ OTP verified for ${email}`);
      return {
        success: true,
        message: 'OTP verified successfully.'
      };
    } else {
      const updatedAttempts = currentAttempts + 1;
      const ttl = await redis.ttl(otpKey);
      await redis.set(attemptsKey, updatedAttempts, 'EX', ttl);
      return {
        success: false,
        message: `Invalid OTP. ${this.MAX_ATTEMPTS - updatedAttempts} attempts remaining.`,
        remainingAttempts: this.MAX_ATTEMPTS - updatedAttempts
      };
    }
  }

  async deleteOTP(email, purpose = 'login') {
    const otpKey = this.getOTPKey(email, purpose);
    const attemptsKey = this.getAttemptsKey(email, purpose);
    await redis.del(otpKey, attemptsKey);
    logger.info(`🗑️ Deleted OTP + attempts for ${email}`);
  }

  async getOTPStats(purpose) {
    const pattern = `otp:${purpose || '*'}:*`;
    const keys = await redis.keys(pattern);
    return {
      totalOTPs: keys.length
    };
  }
}

module.exports = new RedisOTPService();
