const HttpResponseHandler = require('../../../../utils/httpResponseHandler');
const {
  downloadAgreementService,
  uploadEorAgreementService,
  getEorAgreementService
} = require('../../services/agreementService');

const dowmloadAgreement = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fileBuffer, fileName } = await downloadAgreementService(userId);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(fileBuffer);
  } catch (error) {
    HttpResponseHandler.error(res, error);
  }
};

const uploadEorAgreement = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await uploadEorAgreementService(userId, req.file);
    return HttpResponseHandler.success(res, result, 200);
  } catch (error) {
    HttpResponseHandler.error(res, error);
  }
};

const getEorAgreement = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await getEorAgreementService(userId);
    return HttpResponseHandler.success(res, result, 200);
  } catch (error) {
    HttpResponseHandler.error(res, error);
  }
};
module.exports = {
  dowmloadAgreement,
  uploadEorAgreement,
  getEorAgreement
};
