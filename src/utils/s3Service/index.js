const AWS = require('aws-sdk');
const config = require('../../config/config');
const { logger } = require('../../config/logger');
const path = require('path');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region
});

/**
 * Upload file to S3 bucket
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} mimeType - File MIME type
 * @param {string} folder - S3 folder path (e.g., 'documents', 'profiles')
 * @param {string} userId - User ID for organizing files
 * @returns {Promise<Object>} Upload result with file URL
 */
const uploadFileToS3 = async (
  fileBuffer,
  fileName,
  mimeType,
  folder = 'documents',
  userId
) => {
  try {
    // Generate unique file name
    const timestamp = Date.now();
    const fileExtension = path.extname(fileName);
    const baseFileName = path.basename(fileName, fileExtension);
    const uniqueFileName = `${folder}/${userId}/${baseFileName}_${timestamp}${fileExtension}`;

    const uploadParams = {
      Bucket: config.aws.bucketName,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: mimeType,
      ACL: 'public-read',
      Metadata: {
        originalName: fileName,
        uploadedBy: userId,
        uploadedAt: new Date().toISOString()
      }
    };

    logger.info(`Uploading file to S3: ${uniqueFileName}`);

    const result = await s3.upload(uploadParams).promise();

    logger.info(`File uploaded successfully: ${result.Location}`);

    return {
      success: true,
      fileUrl: result.Location,
      fileName: uniqueFileName,
      originalName: fileName,
      bucketName: config.aws.bucketName,
      fileSize: fileBuffer.length
    };
  } catch (error) {
    logger.error('S3 upload error:', error);
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
};

/**
 * Generate pre-signed URL for private file access
 * @param {string} fileKey - S3 file key
 * @param {number} expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns {Promise<string>} Pre-signed URL
 */
const generatePresignedUrl = async (fileKey, expiresIn = 3600) => {
  try {
    const params = {
      Bucket: config.aws.bucketName,
      Key: fileKey,
      Expires: expiresIn
    };

    const url = await s3.getSignedUrlPromise('getObject', params);
    return url;
  } catch (error) {
    logger.error('Error generating pre-signed URL:', error);
    throw new Error(`Failed to generate pre-signed URL: ${error.message}`);
  }
};

/**
 * Delete file from S3
 * @param {string} fileKey - S3 file key
 * @returns {Promise<boolean>} Success status
 */
const deleteFileFromS3 = async fileKey => {
  try {
    const deleteParams = {
      Bucket: config.aws.bucketName,
      Key: fileKey
    };

    await s3.deleteObject(deleteParams).promise();
    logger.info(`File deleted from S3: ${fileKey}`);
    return true;
  } catch (error) {
    logger.error('S3 delete error:', error);
    throw new Error(`Failed to delete file from S3: ${error.message}`);
  }
};

/**
 * Upload multiple files to S3
 * @param {Array} files - Array of file objects {buffer, fileName, mimeType}
 * @param {string} folder - S3 folder path
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of upload results
 */
const uploadMultipleFiles = async (files, folder = 'documents', userId) => {
  try {
    const uploadPromises = files.map(file =>
      uploadFileToS3(file.buffer, file.fileName, file.mimeType, folder, userId)
    );

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    logger.error('Multiple files upload error:', error);
    throw new Error(`Failed to upload multiple files: ${error.message}`);
  }
};

/**
 * Validate file type and size
 * @param {Object} file - Multer file object
 * @param {Array} allowedTypes - Allowed MIME types
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {Object} Validation result
 */
const validateFile = (file, allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  const errors = [];

  // Check file size
  if (file.size > maxSize) {
    errors.push(
      `File size too large. Maximum allowed: ${Math.floor(maxSize / (1024 * 1024))}MB`
    );
  }

  // Check file type if allowedTypes provided
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
    errors.push(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  uploadFileToS3,
  generatePresignedUrl,
  deleteFileFromS3,
  uploadMultipleFiles,
  validateFile
};
