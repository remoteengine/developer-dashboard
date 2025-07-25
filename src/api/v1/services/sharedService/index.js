const customerDashboardConnection = require('../../../../config/customerDashboardDb');
const { logger } = require('../../../../config/logger');
const User = require('../../../../models/user/user.model');

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

const getEorRequestByEmail = async email => {
  await ensureDbConnected();
  const collection = customerDashboardConnection.db.collection('eorrequests');
  const eorRequest = await collection.findOne({ email });
  return eorRequest;
};

const getQuoteSummaryByContractId = async (contractId, eorId) => {
  await ensureDbConnected();
  const collection = customerDashboardConnection.db.collection('quotesummaries');
  const quoteSummary = await collection.find({ contractId, eorId }).sort({ createdAt: -1 }).limit(1).toArray();
  return quoteSummary;
};

const updateEorRequest = async (userId, body) => {
  try {
    const { overAllStatus, ...updateFields } = body;
    const user = await User.findById(userId);
    const email = user?.email;
    if (!email) {
      throw new Error('User email not found');
    }
    await ensureDbConnected();
    const collection = customerDashboardConnection.db.collection('eorrequests');
    const eorRequest = await collection.findOne({ email, isCurrentlyActive: true });
    if (!eorRequest) {
      throw new Error('Active EOR request not found for this user');
    }
    const updateObj = { ...updateFields };
    if (overAllStatus) { updateObj.overAllStatus = overAllStatus; }
    const updatedEorRequest = await collection.updateOne(
      { email, isCurrentlyActive: true },
      { $set: updateObj }
    );
    return updatedEorRequest;
  } catch (error) {
    logger.error(`Error updating eor request: ${error}`);
    throw error;
  }
};


module.exports = { getCountryList, getSkillList, getEorRequest, getEorRequestByEmail, getQuoteSummaryByContractId, updateEorRequest };
