const express = require('express');
const sharedRoute = express.Router();
const { getCountryListController, getSkillListController, getEorRequestController, updateEorRequestController } = require('../../controllers/sharedController');

sharedRoute.get('/country-list', getCountryListController);

sharedRoute.get('/skill-list', getSkillListController);

sharedRoute.get('/get-eor-request', getEorRequestController);

sharedRoute.put('/update-eor-request', updateEorRequestController);

module.exports = sharedRoute;
