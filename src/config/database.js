const mongoose = require('mongoose');
const config = require('./config');
const { logger } = require('./logger');

const uri = config.mongoURI;

const connectDB = async () => {
  try {
    logger.info('Attempting to connect to MongoDB...');
    logger.info(
      `MongoDB URI: ${uri ? uri.replace(/:[^:@]*@/, ':****@') : 'undefined'}`
    );

    const db = await mongoose.connect(uri, {
      maxPoolSize: 50,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    if (db) {
      logger.info('MongoDB connected successfully');
    } else {
      logger.error('MongoDB connection failed');
      throw new Error('MongoDB connection failed');
    }

    mongoose.set('strictQuery', false);
    mongoose.set('runValidators', true);

    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to DB');
    });

    mongoose.connection.on('error', err => {
      logger.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('Mongoose connection closed on app termination');
      return;
    });
  } catch (error) {
    logger.error('MongoDB initial connection error:', error);
    throw new Error('MongoDB initial connection error: ' + error.message);
  }
};

module.exports = connectDB;
