const express = require('express');
const agreementRoute = express.Router();

const {
  dowmloadAgreement,
  uploadEorAgreement,
  getEorAgreement
} = require('../../controllers/agreementControllers');
const { uploadSingleFile } = require('../../../../middleware/uploadMiddleware');

agreementRoute.get('/download', dowmloadAgreement);

agreementRoute.put(
  '/upload-eor-agreement',
  uploadSingleFile,
  uploadEorAgreement
);

agreementRoute.get('/get-eor-agreement', getEorAgreement);

module.exports = agreementRoute;
