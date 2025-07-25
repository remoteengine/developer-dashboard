const HttpResponseHandler = require('../../../../utils/httpResponseHandler');
const { downloadAgreementService } = require('../../services/agreementService');

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

module.exports = {
  dowmloadAgreement
};
