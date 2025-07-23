const customerDashboardConnection = require('../../../../config/customerDashboardDb');
const { logger } = require('../../../../config/logger');

const getCountryList = async () => {
  if (customerDashboardConnection.readyState !== 1) {
    await new Promise((resolve, reject) => {
      customerDashboardConnection.once('connected', resolve);
      customerDashboardConnection.once('error', reject);
    });
  }
  const collection =
    customerDashboardConnection.db.collection('shared_countries');
  const countryList = await collection
    .find({})
    .toArray()
    .then(res => {
      logger.info(`Retrieved ${res.length} countries`);
      return res;
    })
    .catch(err => {
      logger.error(`Error retrieving countries: ${err}`);
      throw err;
    });
  return countryList;
};

const getSkillList = async () => {
  if (customerDashboardConnection.readyState !== 1) {
    await new Promise((resolve, reject) => {
      customerDashboardConnection.once('connected', resolve);
      customerDashboardConnection.once('error', reject);
    });
  }
  const collection = customerDashboardConnection.db.collection('skills');
  const skillList = await collection.find({}).toArray().then(res => {
    logger.info(`Retrieved ${res.length} skills`);
    return res;
  }).catch(err => {
    logger.error(`Error retrieving skills: ${err}`);
    throw err;
  });
  return skillList;
};

module.exports = { getCountryList, getSkillList };
