const mongoose = require('mongoose');
const { logger } = require('./logger');

const customerDashboardUri = process.env.CUSTOMER_DASHBOARD_URI;

const customerDashboardConnection = mongoose.createConnection(customerDashboardUri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
});

customerDashboardConnection.on('connected', () => {
  logger.info('Connected to remoteengine-customer-dashboard database');
});

customerDashboardConnection.on('error', (err) => {
  logger.error('Error connecting to remoteengine-customer-dashboard database:', err);
});

module.exports = customerDashboardConnection;
