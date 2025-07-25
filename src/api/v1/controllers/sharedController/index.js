const HttpResponseHandler = require('../../../../utils/httpResponseHandler');
const {
  getCountryList,
  getSkillList,
  getEorRequestByUserId,
  updateEorRequest
} = require('../../services/sharedService');

const getCountryListController = async (req, res) => {
  try {
    const countryList = await getCountryList();
    return HttpResponseHandler.success(
      res,
      countryList,
      'Country list fetched successfully',
      200
    );
  } catch (error) {
    return HttpResponseHandler.error(
      res,
      error,
      'Failed to fetch country list',
      500
    );
  }
};

const getSkillListController = async (req, res) => {
  try {
    const skillList = await getSkillList();
    return HttpResponseHandler.success(
      res,
      skillList,
      'Skill list fetched successfully',
      200
    );
  } catch (error) {
    return HttpResponseHandler.error(
      res,
      error,
      'Failed to fetch skill list',
      500
    );
  }
};

const getEorRequestController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const eorRequest = await getEorRequestByUserId(userId);
    if (!eorRequest) {
      return HttpResponseHandler.success(
        res,
        null,
        'No Eor request found',
        200
      );
    }
    // Filter out unwanted fields
    let filteredEorRequest = (({
      _isActive,
      _isDeleted,
      _isCurrentlyActive,
      _uploadAgreement,
      _createdAt,
      _updatedAt,
      _uploadDocuments,
      _id,
      ...rest
    }) => rest)(eorRequest);
    delete filteredEorRequest.eorData;
    delete filteredEorRequest.isActive;
    delete filteredEorRequest.isDeleted;
    delete filteredEorRequest.isCurrentlyActive;
    delete filteredEorRequest.uploadAgreement;
    delete filteredEorRequest.createdAt;
    delete filteredEorRequest.updatedAt;
    delete filteredEorRequest.uploadDocuments;
    delete filteredEorRequest._id;
    delete filteredEorRequest.__v;
    return HttpResponseHandler.success(
      res,
      filteredEorRequest,
      'Eor request fetched successfully',
      200
    );
  } catch (error) {
    return HttpResponseHandler.error(
      res,
      error,
      'Failed to fetch eor request',
      500
    );
  }
};

const updateEorRequestController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const eorRequest = await updateEorRequest(userId, req.body);
    return HttpResponseHandler.success(
      res,
      eorRequest,
      'Eor request updated successfully',
      200
    );
  } catch (error) {
    return HttpResponseHandler.error(
      res,
      error,
      'Failed to update eor request',
      500
    );
  }
};

module.exports = {
  getCountryListController,
  getSkillListController,
  getEorRequestController,
  updateEorRequestController
};
