const multer = require('multer');
const { validateFile } = require('../utils/s3Service');
const { ApiError } = require('../utils/errorHandler');
const { logger } = require('../config/logger');

// Configure multer for memory storage (files will be uploaded to S3)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types for documents
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  // Define file size limit (5MB)
  const maxSize = 5 * 1024 * 1024;

  // Create a temporary file object for validation
  const tempFile = {
    size: parseInt(req.headers['content-length'], 10) || 0,
    mimetype: file.mimetype
  };

  const validation = validateFile(tempFile, allowedMimeTypes, maxSize);

  if (!validation.isValid) {
    logger.error(`File validation failed: ${validation.errors.join(', ')}`);
    return cb(new ApiError(validation.errors.join(', '), 400), false);
  }

  logger.info(`File accepted: ${file.originalname} (${file.mimetype})`);
  cb(null, true);
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  }
});

// Middleware for personal info with documents
// Accept any document key dynamically (except profilePicture)
const uploadPersonalInfoDocuments = upload.any();

// Middleware for experience info with documents
const uploadExperienceInfoDocuments = upload.fields([
  { name: 'experienceLetter', maxCount: 1 },
  { name: 'relievingLetter', maxCount: 1 },
  { name: 'certificate', maxCount: 1 },
  { name: 'paySlip', maxCount: 1 },
  { name: 'appointmentLetter', maxCount: 1 }, // Added appointmentLetter
  // Support indexed files for multiple uploads
  { name: 'experienceLetter_0', maxCount: 1 },
  { name: 'experienceLetter_1', maxCount: 1 },
  { name: 'experienceLetter_2', maxCount: 1 },
  { name: 'experienceLetter_3', maxCount: 1 },
  { name: 'experienceLetter_4', maxCount: 1 },
  { name: 'relievingLetter_0', maxCount: 1 },
  { name: 'relievingLetter_1', maxCount: 1 },
  { name: 'relievingLetter_2', maxCount: 1 },
  { name: 'relievingLetter_3', maxCount: 1 },
  { name: 'relievingLetter_4', maxCount: 1 },
  { name: 'certificate_0', maxCount: 1 },
  { name: 'certificate_1', maxCount: 1 },
  { name: 'certificate_2', maxCount: 1 },
  { name: 'certificate_3', maxCount: 1 },
  { name: 'certificate_4', maxCount: 1 },
  { name: 'paySlip_0', maxCount: 1 },
  { name: 'paySlip_1', maxCount: 1 },
  { name: 'paySlip_2', maxCount: 1 },
  { name: 'paySlip_3', maxCount: 1 },
  { name: 'paySlip_4', maxCount: 1 },
  { name: 'appointmentLetter_0', maxCount: 1 }, // Added indexed appointmentLetter
  { name: 'appointmentLetter_1', maxCount: 1 },
  { name: 'appointmentLetter_2', maxCount: 1 },
  { name: 'appointmentLetter_3', maxCount: 1 },
  { name: 'appointmentLetter_4', maxCount: 1 }
]);

// Middleware for education info with documents
const uploadEducationInfoDocuments = upload.fields([
  { name: 'certificate', maxCount: 1 },
  // Support indexed files for multiple uploads
  { name: 'certificate_0', maxCount: 1 },
  { name: 'certificate_1', maxCount: 1 },
  { name: 'certificate_2', maxCount: 1 },
  { name: 'certificate_3', maxCount: 1 },
  { name: 'certificate_4', maxCount: 1 }
]);

// Middleware for single file upload
const uploadSingleFile = upload.single('file');

// Middleware for multiple files
const uploadMultipleFiles = upload.array('files', 10);

// Error handler for multer errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    logger.error('Multer error:', error);

    switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size allowed is 5MB.',
        error: 'FILE_TOO_LARGE'
      });
    case 'LIMIT_FILE_COUNT':
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed.',
        error: 'TOO_MANY_FILES'
      });
    case 'LIMIT_UNEXPECTED_FILE':
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.',
        error: 'UNEXPECTED_FILE'
      });
    default:
      return res.status(400).json({
        success: false,
        message: 'File upload error.',
        error: error.code
      });
    }
  }

  // Pass other errors to the general error handler
  next(error);
};

// Wrapper function to handle async multer middleware
const asyncUploadWrapper = uploadMiddleware => {
  return (req, res, next) => {
    uploadMiddleware(req, res, error => {
      if (error) {
        return handleUploadError(error, req, res, next);
      }
      next();
    });
  };
};

module.exports = {
  uploadPersonalInfoDocuments: asyncUploadWrapper(uploadPersonalInfoDocuments),
  uploadExperienceInfoDocuments: asyncUploadWrapper(
    uploadExperienceInfoDocuments
  ),
  uploadEducationInfoDocuments: asyncUploadWrapper(
    uploadEducationInfoDocuments
  ),
  uploadSingleFile: asyncUploadWrapper(uploadSingleFile),
  uploadMultipleFiles: asyncUploadWrapper(uploadMultipleFiles),
  handleUploadError
};
