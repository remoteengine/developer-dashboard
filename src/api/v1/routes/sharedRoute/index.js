const express = require('express');
const sharedRoute = express.Router();
const { getCountryListController, getSkillListController } = require('../../controllers/sharedController');

sharedRoute.get('/country-list', getCountryListController);

sharedRoute.get('/skill-list', getSkillListController);


module.exports = sharedRoute;
