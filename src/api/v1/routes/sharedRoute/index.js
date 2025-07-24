const express = require('express');
const sharedRoute = express.Router();
const { getCountryListController, getSkillListController, getEorRequestController } = require('../../controllers/sharedController');

sharedRoute.get('/country-list', getCountryListController);

sharedRoute.get('/skill-list', getSkillListController);

sharedRoute.get('/get-eor-request', getEorRequestController);


module.exports = sharedRoute;
