const express = require('express');
const agreementRoute = express.Router();

const { dowmloadAgreement } = require('../../controllers/agreementControllers');

agreementRoute.get('/download', dowmloadAgreement);

module.exports = agreementRoute;
