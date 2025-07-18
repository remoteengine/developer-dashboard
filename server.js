/* eslint-disable no-process-exit */
const dotenvPath = process.env.dotenv_config_path || '.env';
require('dotenv').config({ path: dotenvPath, override: true });
require('module-alias/register');

const config = require('./src/config/config');
const connectDB = require('./src/config/database');
const { logger } = require('./src/config/logger');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('./src/config/passport.config');
const session = require('express-session');
const { errorHandler } = require('./src/utils/errorHandler');
const { emailQueue } = require('./src/jobs/emailQueue');

const {
  helmetConfig,
  apiRateLimit,
  compressionConfig,
  hppConfig,
  corsConfig
} = require('./src/middleware/security');

const app = express();

async function initializeServer() {
  try {
    logger.info('Starting server initialization...');

    logger.info('Connecting to MongoDB...');
    await connectDB();

    const sessionConfig = {
      secret: process.env.SESSION_SECRET || 'defaultsecret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
      }
    };

    app.use(helmetConfig);
    app.use(hppConfig);
    app.use(compressionConfig);
    app.use(morgan('dev'));
    app.use('/api/', apiRateLimit);
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ limit: '10mb', extended: true }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cors(corsConfig));
    app.use(session(sessionConfig));
    app.use(passport.initialize());
    app.use(passport.session());

    const route = require('./src/api/v1/routes/index');
    app.use('/api/v1', route);

    app.get('/healthCheck', async (req, res) => {
      try {
        const timestamp = new Date().toISOString();
        const serviceName = config.serviceName;

        const healthStatus = {
          message: 'API is healthy',
          timestamp,
          serviceName,
          port: config.port,
          status: {
            database: 'connected',
            email: 'console simulation',
            server: 'running',
            sessions: 'memory store'
          }
        };

        res.status(200).json(healthStatus);
      } catch (error) {
        logger.error('Health check error:', error);
        res.status(500).json({
          message: 'Health check failed',
          error: error.message,
          timestamp: new Date().toISOString(),
          status: 'error'
        });
      }
    });

    app.use(errorHandler);

    app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
      logger.info(`Health check: http://localhost:${config.port}/healthCheck`);
      logger.info('Server initialization completed successfully');
    });
  } catch (error) {
    logger.error('Failed to initialize server:', error);
    throw new Error('Server initialization failed: ' + error.message);
  }
}

// Start the server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  initializeServer();
}

process.on('SIGINT', async () => {
  await emailQueue.close();
  process.exit(0);
});

// Export app for testing
module.exports = app;
