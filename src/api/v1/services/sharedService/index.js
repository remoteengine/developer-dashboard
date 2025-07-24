const customerDashboardConnection = require('../../../../config/customerDashboardDb');
const { logger } = require('../../../../config/logger');

// Helper to ensure DB connection is ready
const ensureDbConnected = async () => {
  if (customerDashboardConnection.readyState !== 1) {
    await new Promise((resolve, reject) => {
      customerDashboardConnection.once('connected', resolve);
      customerDashboardConnection.once('error', reject);
    });
  }
};

// Generic fetch-all-from-collection helper
const fetchAllFromCollection = async (collectionName, logLabel) => {
  await ensureDbConnected();
  const collection = customerDashboardConnection.db.collection(collectionName);
  try {
    const res = await collection.find({}).toArray();
    logger.info(`Retrieved ${res.length} ${logLabel}`);
    return res;
  } catch (err) {
    logger.error(`Error retrieving ${logLabel}: ${err}`);
    throw err;
  }
};

const getCountryList = async () => fetchAllFromCollection('shared_countries', 'countries');
const getSkillList = async () => fetchAllFromCollection('skills', 'skills');
const getEorRequest = async () => fetchAllFromCollection('eorrequests', 'eor requests');

module.exports = { getCountryList, getSkillList, getEorRequest };
