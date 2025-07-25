const HttpResponseHandler = require('../../../../utils/httpResponseHandler');
const { getCountryList, getSkillList, getEorRequest, updateEorRequest } = require('../../services/sharedService');

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
    return HttpResponseHandler.error(res, error, 'Failed to fetch skill list', 500);
  }
};

const getEorRequestController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const eorRequest = await getEorRequest(userId);
    return HttpResponseHandler.success(
      res,
      eorRequest,
      'Eor request fetched successfully',
      200
    );
  } catch (error) {
    return HttpResponseHandler.error(res, error, 'Failed to fetch eor request', 500);
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
    return HttpResponseHandler.error(res, error, 'Failed to update eor request', 500);
  }
};


module.exports = { getCountryListController, getSkillListController, getEorRequestController,updateEorRequestController };
