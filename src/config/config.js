const ENV = process.env.NODE_ENV || 'development';

const baseConfig = {
  env: ENV,
  port: process.env.PORT,
  mongoURI: process.env.MONGO_URI,
  // JWT configs
  AcessToken: process.env.ACCESS_TOKEN_SECRET,
  AccessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  refreshTokenExpires: process.env.REFRESH_TOKEN_EXPIRES,
  systemToken: process.env.SYSTEM_TOKEN,
  systemHost: process.env.SYSTEM_HOST,

  // Redis configs
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB || 0
  },

  // Google OAuth configs
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI
  },

  // LinkedIn configs
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    redirectUri: process.env.LINKEDIN_REDIRECT_URI
  },

  // Email configs
  email: {
    from: process.env.EMAIL_FROM,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS
  },

  // AWS S3 configs
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_SES_REGION,
    bucketName: process.env.AWS_BUCKET_NAME
  },

  // Service name
  serviceName: process.env.SERVICE_NAME,
  // Build information
  buildNumber: process.env.BUILD_NUMBER
};

module.exports = baseConfig;
