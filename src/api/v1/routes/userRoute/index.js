const express = require('express');
const userRoute = express.Router();
const userController = require('../../controllers/userControllers');
const {
  uploadPersonalInfoDocuments,
  uploadExperienceInfoDocuments,
  uploadEducationInfoDocuments
} = require('../../../../middleware/uploadMiddleware');
const {
  validateProfileUpdate
} = require('../../validators');

userRoute.get('/', userController.getUserById);

userRoute.patch(
  '/update-profile',
  validateProfileUpdate,
  userController.updateUserProfile
);

// userRoute.patch(
//   '/update-personal-info',
//   validatePersonalInfoUpdate,
//   userController.updatePersonalInfo
// );

userRoute.patch(
  '/update-personal-info',
  uploadPersonalInfoDocuments,
  userController.updatePersonalInfoWithFiles
);

// userRoute.patch(
//   '/update-experience-info',
//   validateExperienceInfoUpdate,
//   userController.updateExperienceInfo
// );

userRoute.patch(
  '/update-experience-info',
  uploadExperienceInfoDocuments,
  userController.updateExperienceInfoWithFiles
);

// userRoute.patch(
//   '/update-education-info',
//   validateEducationInfoUpdate,
//   userController.updateEducationInfo
// );

userRoute.patch(
  '/update-education-info',
  uploadEducationInfoDocuments,
  userController.updateEducationInfoWithFiles
);

userRoute.get('/get-eor-request', userController.getEorRequest);

module.exports = userRoute;
