const Redis = require('ioredis');
const config = require('./config');
const { logger } = require('./logger');

// Redis configuration based on environment
const getRedisConfig = () => {
  return {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
    enableReadyCheck: false,
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    lazyConnect: true,
    keepAlive: 30000,
    connectTimeout: 10000,
    commandTimeout: 5000,
    family: 4
  };
};

// Create Redis instance with proper error handling
const redis = new Redis(getRedisConfig());

redis.on('connect', () => {
  logger.info('✅ Redis connected successfully');
});

redis.on('ready', () => {
  logger.info('✅ Redis is ready to accept commands');
});

redis.on('error', err => {
  logger.error('❌ Redis connection error:', err.message);
});

redis.on('close', () => {
  logger.warn('⚠️ Redis connection closed');
});

redis.on('reconnecting', () => {
  logger.info('🔄 Redis reconnecting...');
});

module.exports = redis;
