const express = require('express');
const router = express.Router();
const config = require('../../../config/config');
const HttpResponseHandler = require('../../../utils/httpResponseHandler');
const { verifyAccessTokenMiddleware } = require('../../../utils/jwtService');
const { logger } = require('../../../config/logger');
const authRoutes = require('./authRoute/index');
const userRoutes = require('./userRoute/index');

router.use('/auth', authRoutes);

router.use('/user', verifyAccessTokenMiddleware, userRoutes);

router.get('/healthcheck', (req, res) => {
  logger.info('Inside healthCheck');
  const data = {
    ts: new Date(),
    buildNumber: config.buildNumber,
    serviceName: config.serviceName
  };
  return HttpResponseHandler.success(res, data, 'Health check successful', 200);
});

module.exports = router;
// This file serves as the main entry point for all API routes.

