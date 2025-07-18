const http = require('http');
const { logger } = require('./src/config/logger');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/api/v1/healthcheck',
  method: 'GET',
  timeout: 2000
};

const request = http.request(options, res => {
  logger.info(`Health check status: ${res.statusCode}`);
  if (res.statusCode === 200) {
    logger.info('Health check passed');
  } else {
    logger.error('Health check failed');
    throw new Error('Health check failed');
  }
});

request.on('error', err => {
  logger.error(`Health check failed: ${err.message}`);
  throw new Error('Health check failed');
});

request.on('timeout', () => {
  logger.error('Health check timeout');
  request.destroy();
  throw new Error('Health check timeout');
});

request.end();
