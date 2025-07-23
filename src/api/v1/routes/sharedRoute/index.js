const express = require('express');
const sharedRoute = express.Router();
const { getCountryListController } = require('../../controllers/sharedController');

sharedRoute.get('/country-list', getCountryListController);


module.exports = sharedRoute;
