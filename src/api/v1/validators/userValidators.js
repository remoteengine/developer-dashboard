const { body, validationResult } = require('express-validator');
const { ApiError } = require('../../../utils/errorHandler');

// Define all valid fields for User and Developer schemas
const VALID_USER_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'password',
  'userType',
  'loginBy',
  'profilePicture',
  'isVerified',
  'isActive',
  'isDeleted'
];

const VALID_DEVELOPER_FIELDS = [
  ...VALID_USER_FIELDS,
  'about',
  'dateOfBirth',
  'languages',
  'hobbies',
  'maritalStatus',
  'aboutSelf',
  'role',
  'phoneNumber',
  'otherRole',
  'countryOfCitizenship',
  'countryOfResidence',
  'resumeUrl',
  'resumeInfoSaved',
  'professionalBackground',
  'professionalInfoSaved',
  'educationalBackground',
  'educationInfoSaved',
  'linkedinUrl',
  'totalWorkExperience',
  'totalWorkExperienceInMonths',
  'currentMonthlySalary',
  'expectedMonthlySalary',
  'bargainedMonthlySalary',
  'displayMonthlySalary',
  'priorFreelanceExperience',
  'jobPreference',
  'skills',
  'minimumNoticePeriod',
  'projects',
  'eorEmployed',
  'codingPlatform',
  'isProfileCompleted',
  'mostExperiencedRole',
  'lookingForJob',
  'interestedFullTime',
  'uaid',
  'panCard',
  'bankDetails',
  'address'
];

// Validation middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw new ApiError(errorMessages.join(', '), 400);
  }
  next();
};

// Custom middleware to validate schema fields
const validateSchemaFields = validFields => {
  return (req, res, next) => {
    const providedFields = Object.keys(req.body);
    const invalidFields = providedFields.filter(
      field => !validFields.includes(field)
    );

    if (invalidFields.length > 0) {
      throw new ApiError(
        `Invalid fields provided: ${invalidFields.join(', ')}`,
        400
      );
    }

    next();
  };
};

// Custom middleware to check if update data is provided
const validateUpdateData = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ApiError('Update data is required', 400);
  }
  next();
};

// Personal information update validation
const validatePersonalInfoUpdate = [
  validateUpdateData,
  validateSchemaFields(VALID_DEVELOPER_FIELDS),

  // Optional field validations (only validate if provided)
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),

  body('phoneNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),

  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date in ISO format (YYYY-MM-DD)'),

  body('maritalStatus')
    .optional()
    .isIn(['single', 'married'])
    .withMessage('Marital status must be either single or married'),

  body('userType')
    .optional()
    .isIn(['recruiter', 'admin', 'developer'])
    .withMessage('User type must be recruiter, admin, or developer'),

  body('loginBy')
    .optional()
    .isIn(['email', 'google', 'linkedin'])
    .withMessage('Login method must be email, google, or linkedin'),

  body('lookingForJob')
    .optional()
    .isIn([
      'Immediate',
      '1 weeks',
      '2 weeks',
      '3 weeks',
      '1 months',
      '2 months',
      '3 months',
      'Ready to Interview',
      'Available'
    ])
    .withMessage('Looking for job must be a valid option'),

  body('totalWorkExperience')
    .optional()
    .isNumeric()
    .withMessage('Total work experience must be a number'),

  body('totalWorkExperienceInMonths')
    .optional()
    .isNumeric()
    .withMessage('Total work experience in months must be a number'),

  body('currentMonthlySalary')
    .optional()
    .isNumeric()
    .withMessage('Current monthly salary must be a number'),

  body('expectedMonthlySalary')
    .optional()
    .isNumeric()
    .withMessage('Expected monthly salary must be a number'),

  body('bargainedMonthlySalary')
    .optional()
    .isNumeric()
    .withMessage('Bargained monthly salary must be a number'),

  body('displayMonthlySalary')
    .optional()
    .isNumeric()
    .withMessage('Display monthly salary must be a number'),

  body('minimumNoticePeriod')
    .optional()
    .isNumeric()
    .withMessage('Minimum notice period must be a number'),

  body('isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified must be a boolean'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  body('isDeleted')
    .optional()
    .isBoolean()
    .withMessage('isDeleted must be a boolean'),

  body('priorFreelanceExperience')
    .optional()
    .isBoolean()
    .withMessage('Prior freelance experience must be a boolean'),

  body('interestedFullTime')
    .optional()
    .isBoolean()
    .withMessage('Interested full time must be a boolean'),

  body('eorEmployed')
    .optional()
    .isBoolean()
    .withMessage('EOR employed must be a boolean'),

  body('uaid')
    .optional()
    .isString()
    .withMessage('UAID must be a string')
    .custom((value) => {
      // Allow both URLs and plain text/file paths
      if (value && value.startsWith('http')) {
        const urlRegex = /^https?:\/\/.+/;
        if (!urlRegex.test(value)) {
          throw new Error('UAID must be a valid URL when starting with http');
        }
      }
      return true;
    }),

  body('panCard')
    .optional()
    .isString()
    .withMessage('panCard must be a string')
    .custom((value) => {
      // Allow both URLs and plain text/file paths
      if (value && value.startsWith('http')) {
        const urlRegex = /^https?:\/\/.+/;
        if (!urlRegex.test(value)) {
          throw new Error('panCard must be a valid URL when starting with http');
        }
      }
      return true;
    }),

  body('isProfileCompleted')
    .optional()
    .isBoolean()
    .withMessage('Profile completed status must be a boolean'),

  body('resumeInfoSaved')
    .optional()
    .isBoolean()
    .withMessage('Resume info saved status must be a boolean'),

  body('professionalInfoSaved')
    .optional()
    .isBoolean()
    .withMessage('Professional info saved status must be a boolean'),

  body('educationInfoSaved')
    .optional()
    .isBoolean()
    .withMessage('Education info saved status must be a boolean'),

  body('resumeUrl')
    .optional()
    .isURL()
    .withMessage('Resume URL must be a valid URL'),

  body('linkedinUrl')
    .optional()
    .isURL()
    .withMessage('LinkedIn URL must be a valid URL'),

  body('profilePicture')
    .optional()
    .isURL()
    .withMessage('Profile picture must be a valid URL'),

  body('languages')
    .optional()
    .isArray()
    .withMessage('Languages must be an array'),

  body('languages.*.name')
    .optional()
    .isString()
    .withMessage('Language name must be a string'),

  body('languages.*.proficiency')
    .optional()
    .isString()
    .withMessage('Language proficiency must be a string'),

  body('skills').optional().isArray().withMessage('Skills must be an array'),

  body('skills.*.skillName')
    .optional()
    .isString()
    .withMessage('Skill name must be a string'),

  body('skills.*.yearsOfExperience')
    .optional()
    .isNumeric()
    .withMessage('Years of experience must be a number'),

  body('skills.*.competency')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Competency must be Low, Medium, or High'),

  body('professionalBackground')
    .optional()
    .isArray()
    .withMessage('Professional background must be an array'),

  body('professionalBackground.*.role')
    .optional()
    .isString()
    .withMessage('Professional background role must be a string'),

  body('professionalBackground.*.companyName')
    .optional()
    .isString()
    .withMessage('Company name must be a string'),

  body('professionalBackground.*.brand')
    .optional()
    .isString()
    .withMessage('Brand must be a string'),

  body('professionalBackground.*.startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date in ISO format'),

  body('professionalBackground.*.endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date in ISO format'),

  body('professionalBackground.*.skills')
    .optional()
    .isObject()
    .withMessage('Skills must be an object'),

  body('professionalBackground.*.description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),

  body('professionalBackground.*.isPresentCompany')
    .optional()
    .isBoolean()
    .withMessage('isPresentCompany must be a boolean'),

  body('professionalBackground.*.experienceLetter')
    .optional()
    .isString()
    .withMessage('Experience letter must be a string'),

  body('professionalBackground.*.relievingLetter')
    .optional()
    .isString()
    .withMessage('Relieving letter must be a string'),

  body('professionalBackground.*.certificate')
    .optional()
    .isString()
    .withMessage('Certificate must be a string'),

  body('educationalBackground')
    .optional()
    .isArray()
    .withMessage('Educational background must be an array'),

  body('educationalBackground.*.degree')
    .optional()
    .isString()
    .withMessage('Degree must be a string'),

  body('educationalBackground.*.otherDegree')
    .optional()
    .isString()
    .withMessage('Other degree must be a string'),

  body('educationalBackground.*.fieldOfStudy')
    .optional()
    .isString()
    .withMessage('Field of study must be a string'),

  body('educationalBackground.*.institute')
    .optional()
    .isString()
    .withMessage('Institute must be a string'),

  body('educationalBackground.*.startDate')
    .optional()
    .isISO8601()
    .withMessage('Education start date must be a valid date in ISO format'),

  body('educationalBackground.*.endDate')
    .optional()
    .isISO8601()
    .withMessage('Education end date must be a valid date in ISO format'),

  body('educationalBackground.*.certificate')
    .optional()
    .isString()
    .withMessage('Education certificate must be a string'),

  body('projects')
    .optional()
    .isArray()
    .withMessage('Projects must be an array'),

  body('projects.*.name')
    .optional()
    .isString()
    .withMessage('Project name must be a string'),

  body('projects.*.link')
    .optional()
    .isURL()
    .withMessage('Project link must be a valid URL'),

  body('projects.*.description')
    .optional()
    .isString()
    .withMessage('Project description must be a string'),

  body('codingPlatform.link')
    .optional()
    .isURL()
    .withMessage('Coding platform link must be a valid URL'),

  // Enhanced bankDetails validation
  body('bankDetails')
    .optional()
    .isObject()
    .withMessage('Bank details must be an object'),

  body('bankDetails.accountNumber')
    .optional()
    .isNumeric()
    .withMessage('Bank account number must be numeric')
    .isLength({ min: 9, max: 18 })
    .withMessage('Account number must be between 9 and 18 digits'),

  body('bankDetails.ifsc')
    .optional()
    .isString()
    .withMessage('IFSC code must be a string')
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/)
    .withMessage('IFSC code must be in valid format (e.g., HDFC0001234)'),

  body('bankDetails.branchName')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Branch name must be a non-empty string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Branch name must be between 2 and 100 characters'),

  body('bankDetails.bankAccountProvider')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Bank account provider must be a non-empty string')
    .isLength({ min: 2, max: 50 })
    .withMessage('Bank account provider name must be between 2 and 50 characters'),

  handleValidationErrors
];

// Experience information update validation
const validateExperienceInfoUpdate = [
  validateUpdateData,
  validateSchemaFields(VALID_DEVELOPER_FIELDS),

  body('professionalBackground')
    .optional()
    .isArray()
    .withMessage('Professional background must be an array'),

  body('professionalBackground.*.role')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Professional background role is required and must be a string'),

  body('professionalBackground.*.companyName')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Company name is required and must be a string'),

  body('professionalBackground.*.brand')
    .optional()
    .isString()
    .withMessage('Brand must be a string'),

  body('professionalBackground.*.startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date in ISO format'),

  body('professionalBackground.*.endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date in ISO format'),

  body('professionalBackground.*.skills')
    .optional()
    .isObject()
    .withMessage('Skills must be an object'),

  body('professionalBackground.*.description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),

  body('professionalBackground.*.isPresentCompany')
    .optional()
    .isBoolean()
    .withMessage('isPresentCompany must be a boolean'),

  body('professionalBackground.*.experienceLetter')
    .optional()
    .isString()
    .withMessage('Experience letter must be a string (URL or file path)'),

  body('professionalBackground.*.relievingLetter')
    .optional()
    .isString()
    .withMessage('Relieving letter must be a string (URL or file path)'),

  body('professionalBackground.*.certificate')
    .optional()
    .isString()
    .withMessage('Certificate must be a string (URL or file path)'),

  body('totalWorkExperience')
    .optional()
    .isNumeric()
    .withMessage('Total work experience must be a number'),

  body('totalWorkExperienceInMonths')
    .optional()
    .isNumeric()
    .withMessage('Total work experience in months must be a number'),

  body('professionalInfoSaved')
    .optional()
    .isBoolean()
    .withMessage('Professional info saved status must be a boolean'),

  handleValidationErrors
];

// Education information update validation
const validateEducationInfoUpdate = [
  validateUpdateData,
  validateSchemaFields(VALID_DEVELOPER_FIELDS),

  body('educationalBackground')
    .optional()
    .isArray()
    .withMessage('Educational background must be an array'),

  body('educationalBackground.*.degree')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Degree is required and must be a string'),

  body('educationalBackground.*.otherDegree')
    .optional()
    .isString()
    .withMessage('Other degree must be a string'),

  body('educationalBackground.*.fieldOfStudy')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Field of study is required and must be a string'),

  body('educationalBackground.*.institute')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Institute is required and must be a string'),

  body('educationalBackground.*.startDate')
    .optional()
    .isISO8601()
    .withMessage('Education start date must be a valid date in ISO format'),

  body('educationalBackground.*.endDate')
    .optional()
    .isISO8601()
    .withMessage('Education end date must be a valid date in ISO format'),

  body('educationalBackground.*.certificate')
    .optional()
    .isString()
    .withMessage('Education certificate must be a string (URL or file path)'),

  body('educationInfoSaved')
    .optional()
    .isBoolean()
    .withMessage('Education info saved status must be a boolean'),

  handleValidationErrors
];

// Basic profile update validation (for non-developer users)
const validateProfileUpdate = [
  validateUpdateData,
  validateSchemaFields(VALID_USER_FIELDS),

  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),

  body('profilePicture')
    .optional()
    .isURL()
    .withMessage('Profile picture must be a valid URL'),

  handleValidationErrors
];

// Education information update validation for file uploads (without validateUpdateData)
const validateEducationInfoUpdateWithFiles = [
  // Skip validateUpdateData for file uploads since form data isn't parsed yet
  validateSchemaFields(VALID_DEVELOPER_FIELDS),

  body('educationalBackground')
    .optional()
    .isArray()
    .withMessage('Educational background must be an array'),

  body('educationalBackground.*.degree')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Degree is required and must be a string'),

  body('educationalBackground.*.otherDegree')
    .optional()
    .isString()
    .withMessage('Other degree must be a string'),

  body('educationalBackground.*.fieldOfStudy')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Field of study is required and must be a string'),

  body('educationalBackground.*.institute')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Institute is required and must be a string'),

  body('educationalBackground.*.startDate')
    .optional()
    .isISO8601()
    .withMessage('Education start date must be a valid date in ISO format'),

  body('educationalBackground.*.endDate')
    .optional()
    .isISO8601()
    .withMessage('Education end date must be a valid date in ISO format'),

  body('educationalBackground.*.certificate')
    .optional()
    .isString()
    .withMessage('Education certificate must be a string (URL or file path)'),

  body('educationInfoSaved')
    .optional()
    .isBoolean()
    .withMessage('Education info saved status must be a boolean'),

  handleValidationErrors
];

// Experience information update validation for file uploads (without validateUpdateData)
const validateExperienceInfoUpdateWithFiles = [
  // Skip validateUpdateData for file uploads since form data isn't parsed yet
  validateSchemaFields(VALID_DEVELOPER_FIELDS),

  body('professionalBackground')
    .optional()
    .isArray()
    .withMessage('Professional background must be an array'),

  body('professionalBackground.*.role')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Role is required and must be a string'),

  body('professionalBackground.*.companyName')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Company name is required and must be a string'),

  body('professionalBackground.*.brand')
    .optional()
    .isString()
    .withMessage('Brand must be a string'),

  body('professionalBackground.*.startDate')
    .optional()
    .isISO8601()
    .withMessage('Experience start date must be a valid date in ISO format'),

  body('professionalBackground.*.endDate')
    .optional()
    .isISO8601()
    .withMessage('Experience end date must be a valid date in ISO format'),

  body('professionalBackground.*.description')
    .optional()
    .isString()
    .withMessage('Experience description must be a string'),

  body('professionalBackground.*.isPresentCompany')
    .optional()
    .isBoolean()
    .withMessage('Is present company must be a boolean'),

  body('professionalBackground.*.experienceLetter')
    .optional()
    .isString()
    .withMessage('Experience letter must be a string (URL or file path)'),

  body('professionalBackground.*.relievingLetter')
    .optional()
    .isString()
    .withMessage('Relieving letter must be a string (URL or file path)'),

  body('professionalBackground.*.certificate')
    .optional()
    .isString()
    .withMessage('Certificate must be a string (URL or file path)'),

  body('professionalInfoSaved')
    .optional()
    .isBoolean()
    .withMessage('Professional info saved status must be a boolean'),

  handleValidationErrors
];

module.exports = {
  validatePersonalInfoUpdate,
  validateProfileUpdate,
  validateExperienceInfoUpdate,
  validateEducationInfoUpdate,
  validateExperienceInfoUpdateWithFiles,
  validateEducationInfoUpdateWithFiles,
  VALID_USER_FIELDS,
  VALID_DEVELOPER_FIELDS
};
