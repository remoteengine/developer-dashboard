const HttpResponseHandler = require('../../../../utils/httpResponseHandler');
const { getCountryList, getSkillList } = require('../../services/sharedService');

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

module.exports = { getCountryListController, getSkillListController };
