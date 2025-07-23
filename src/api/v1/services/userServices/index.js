const User = require('../../../../models/user/user.model');
const developer = require('../../../../models/developer/developer.model');
const Address = require('../../../../models/address/address.model');
const { validateAddressData } = require('../../validators/addressValidators');
const bcrypt = require('bcrypt');
const { uploadFileToS3 } = require('../../../../utils/s3Service');
const axios = require('axios');
const { systemToken } = require('../../../../config/config');
const EorRequestCustomerDashboard = require('../../../../models/customerDashboard/eor-request-customer.model');
const {
  createSuccessResponse,
  createErrorResponse,
  sanitizeUserData,
  sanitizeAddressData
} = require('./utils');

// Helper function to hash password if provided
const hashPasswordIfProvided = async updateData => {
  const processedData = { ...updateData };
  if (processedData.password) {
    processedData.password = await bcrypt.hash(processedData.password, 10);
  }
  return processedData;
};

// Helper function to format developer data
const formatDeveloperData = userData => {
  // Helper to filter document fields
  const filterDocumentFields = doc => {
    const filtered = { ...doc };
    delete filtered.fileSize;
    delete filtered.mimeType;
    delete filtered.uploadedAt;
    delete filtered.isVerified;
    delete filtered._id;
    return filtered;
  };

  return {
    id: userData._id,
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    userType: userData.userType,
    loginBy: userData.loginBy,
    profilePicture: userData.profilePicture,
    isVerified: userData.isVerified,
    isActive: userData.isActive,
    createdAt: userData.createdAt,
    updatedAt: userData.updatedAt,

    ...(userData.userType === 'developer' && {
      about: userData.about || '',
      dateOfBirth: userData.dateOfBirth || '',
      phoneNumber: userData.phoneNumber || '',
      aboutSelf: userData.aboutSelf || '',
      maritalStatus: userData.maritalStatus || '',
      hobbies: userData.hobbies || '',
      countryOfCitizenship: userData.countryOfCitizenship || '',
      countryOfResidence: userData.countryOfResidence || '',

      role: userData.role || '',
      otherRole: userData.otherRole || '',
      totalWorkExperience: userData.totalWorkExperience || '',
      totalWorkExperienceInMonths: userData.totalWorkExperienceInMonths || '',
      mostExperiencedRole: userData.mostExperiencedRole || '',

      currentMonthlySalary: userData.currentMonthlySalary || '',
      expectedMonthlySalary: userData.expectedMonthlySalary || '',
      bargainedMonthlySalary: userData.bargainedMonthlySalary || '',
      displayMonthlySalary: userData.displayMonthlySalary || '',

      jobPreference: userData.jobPreference || '',
      lookingForJob: userData.lookingForJob || '',
      interestedFullTime: userData.interestedFullTime || '',
      minimumNoticePeriod: userData.minimumNoticePeriod || '',
      priorFreelanceExperience: userData.priorFreelanceExperience || '',

      isProfileCompleted: userData.isProfileCompleted || '',
      resumeInfoSaved: userData.resumeInfoSaved || '',
      professionalInfoSaved: userData.professionalInfoSaved || '',
      educationInfoSaved: userData.educationInfoSaved || '',

      languages: userData.languages || [],
      skills: userData.skills || [],
      professionalBackground: userData.professionalBackground || [],
      educationalBackground: userData.educationalBackground || [],
      projects: userData.projects || [],
      bankDetails: userData.bankDetails || {},
      address: userData.address ? userData.address : {},
      documents: Array.isArray(userData.documents)
        ? userData.documents.map(filterDocumentFields)
        : [],

      resumeUrl: userData.resumeUrl || '',
      linkedinUrl: userData.linkedinUrl || '',
      codingPlatform: userData.codingPlatform || '',
      eorEmployed: userData.eorEmployed || ''
    })
  };
};

const handleValidationError = error => {
  if (error.name === 'ValidationError') {
    const validationErrors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));

    return createErrorResponse('Validation error', null, { validationErrors });
  }

  // Handle MongoDB duplicate key error (E11000)
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    const value = error.keyValue[field];
    return createErrorResponse(
      `${field} '${value}' already exists. Please use a different value.`
    );
  }

  return createErrorResponse('Error processing request', error.message);
};

const getUserById = async userId => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return createErrorResponse('User not found');
    }

    // Fetch address for the user
    const address = await Address.findOne({ userId, isActive: true });

    const sanitizedUserData = sanitizeUserData(user);
    const formattedData = formatDeveloperData(sanitizedUserData);

    // Add address to the response if it exists
    if (address) {
      const sanitizedAddress = sanitizeAddressData(address);
      formattedData.address = sanitizedAddress;
    }

    return createSuccessResponse('User retrieved successfully', formattedData);
  } catch (error) {
    return createErrorResponse('Error retrieving user', error.message);
  }
};

const updateUserProfile = async (userId, updateData) => {
  try {
    const processedUpdateData = await hashPasswordIfProvided(updateData);

    const user = await User.findByIdAndUpdate(userId, processedUpdateData, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return createErrorResponse('User not found');
    }

    const sanitizedUserData = sanitizeUserData(user);
    return createSuccessResponse(
      'User profile updated successfully',
      sanitizedUserData
    );
  } catch (error) {
    return handleValidationError(error);
  }
};

// Helper function to handle address creation/update
const handleAddressUpdate = async (userId, addressData) => {
  try {
    // Validate address data using the validator
    const validation = validateAddressData(addressData);
    if (!validation.isValid) {
      return createErrorResponse(validation.message);
    }

    // Check if address already exists for this user
    const existingAddress = await Address.findOne({ userId, isActive: true });

    if (existingAddress) {
      // Update existing address
      const updatedAddress = await Address.findByIdAndUpdate(
        existingAddress._id,
        {
          ...addressData,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );

      const sanitizedAddress = sanitizeAddressData(updatedAddress);
      return createSuccessResponse(
        'Address updated successfully',
        sanitizedAddress
      );
    } else {
      // Create new address
      const newAddress = new Address({
        userId,
        ...addressData
      });

      const savedAddress = await newAddress.save();
      const sanitizedAddress = sanitizeAddressData(savedAddress);
      return createSuccessResponse(
        'Address created successfully',
        sanitizedAddress
      );
    }
  } catch (error) {
    return createErrorResponse('Error handling address update', error.message);
  }
};

const updatePersonalInfo = async (userId, updateData) => {
  try {
    const existingUser = await developer.findById(userId);
    if (!existingUser) {
      return createErrorResponse('User not found');
    }

    if (existingUser.userType !== 'developer') {
      return createErrorResponse(
        'User is not a developer. Use updateUserProfile for other user types.'
      );
    }

    let addressResult = null;
    if (updateData.address) {
      addressResult = await handleAddressUpdate(userId, updateData.address);
      if (!addressResult.success) {
        return addressResult;
      }
      delete updateData.address;
    }

    const updatedUser = await developer.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true
    });

    if (!updatedUser) {
      return createErrorResponse('Failed to update user');
    }

    const sanitizedUserData = sanitizeUserData(updatedUser);
    const formattedData = formatDeveloperData(sanitizedUserData);

    if (addressResult) {
      formattedData.address = addressResult.data;
    }

    return createSuccessResponse(
      'Personal information updated successfully',
      formattedData
    );
  } catch (error) {
    return handleValidationError(error);
  }
};

const updateExperienceInfo = async (userId, updateData) => {
  try {
    const existingUser = await developer.findById(userId);
    if (!existingUser) {
      return createErrorResponse('User not found');
    }

    if (existingUser.userType !== 'developer') {
      return createErrorResponse(
        'User is not a developer. Use updateUserProfile for other user types.'
      );
    }

    let updateQuery = {};

    if (updateData.professionalBackground !== undefined) {
      const { professionalBackground } = updateData;

      if (Array.isArray(professionalBackground)) {
        updateQuery.professionalBackground = professionalBackground;
      } else if (
        professionalBackground &&
        typeof professionalBackground === 'object'
      ) {
        updateQuery = {
          $push: { professionalBackground: professionalBackground }
        };
      } else if (
        professionalBackground === null ||
        professionalBackground === ''
      ) {
        updateQuery.professionalBackground = [];
      }

      delete updateData.professionalBackground;
    }

    if (updateData.updateExperienceById && updateData.experienceId) {
      const { updateExperienceById, experienceId } = updateData;
      const currentExperience = existingUser.professionalBackground || [];
      const experienceIndex = currentExperience.findIndex(
        exp => exp._id.toString() === experienceId
      );

      if (experienceIndex !== -1) {
        Object.keys(updateExperienceById).forEach(key => {
          updateQuery[`professionalBackground.${experienceIndex}.${key}`] =
            updateExperienceById[key];
        });
      } else {
        return createErrorResponse('Experience entry not found');
      }

      delete updateData.updateExperienceById;
      delete updateData.experienceId;
    }

    if (updateData.removeExperienceId) {
      const { removeExperienceId } = updateData;
      updateQuery = {
        $pull: { professionalBackground: { _id: removeExperienceId } }
      };
      delete updateData.removeExperienceId;
    }

    if (updateData.removeExperienceIndex !== undefined) {
      const { removeExperienceIndex } = updateData;
      const currentExperience = [
        ...(existingUser.professionalBackground || [])
      ];

      if (
        removeExperienceIndex >= 0 &&
        removeExperienceIndex < currentExperience.length
      ) {
        currentExperience.splice(removeExperienceIndex, 1);
        updateQuery.professionalBackground = currentExperience;
      } else {
        return createErrorResponse('Invalid experience index');
      }

      delete updateData.removeExperienceIndex;
    }

    if (updateData.markExperienceComplete !== undefined) {
      updateQuery.professionalInfoSaved = updateData.markExperienceComplete;
      delete updateData.markExperienceComplete;
    }

    updateQuery = { ...updateQuery, ...updateData };

    const updatedUser = await developer.findByIdAndUpdate(userId, updateQuery, {
      new: true,
      runValidators: true
    });

    if (!updatedUser) {
      return createErrorResponse('Failed to update user');
    }

    const sanitizedUserData = sanitizeUserData(updatedUser);
    const formattedData = formatDeveloperData(sanitizedUserData);

    // Return only the professionalBackground data
    const responseData = {
      professionalBackground: formattedData.professionalBackground
    };

    return createSuccessResponse(
      'Experience information updated successfully',
      responseData
    );
  } catch (error) {
    return handleValidationError(error);
  }
};

const updateEducationInfo = async (userId, updateData) => {
  try {
    const existingUser = await developer.findById(userId);
    if (!existingUser) {
      return createErrorResponse('User not found');
    }

    if (existingUser.userType !== 'developer') {
      return createErrorResponse(
        'User is not a developer. Use updateUserProfile for other user types.'
      );
    }

    let updateQuery = {};

    // Handle education updates with simple, intuitive API
    if (updateData.educationalBackground !== undefined) {
      const { educationalBackground } = updateData;

      // Case 1: Array provided = Replace entire education history
      if (Array.isArray(educationalBackground)) {
        updateQuery.educationalBackground = educationalBackground;
      }

      // Case 2: Single object provided = Add new education entry
      else if (
        educationalBackground &&
        typeof educationalBackground === 'object'
      ) {
        updateQuery = {
          $push: { educationalBackground: educationalBackground }
        };
      }

      // Case 3: null or empty = Clear all education
      else if (educationalBackground === null || educationalBackground === '') {
        updateQuery.educationalBackground = [];
      }

      // Remove from updateData to avoid duplication
      delete updateData.educationalBackground;
    }

    // Handle education entry updates by ID
    if (updateData.updateEducationById && updateData.educationId) {
      const { updateEducationById, educationId } = updateData;
      const currentEducation = existingUser.educationalBackground || [];
      const educationIndex = currentEducation.findIndex(
        edu => edu._id.toString() === educationId
      );

      if (educationIndex !== -1) {
        // Update specific education entry
        Object.keys(updateEducationById).forEach(key => {
          updateQuery[`educationalBackground.${educationIndex}.${key}`] =
            updateEducationById[key];
        });
      } else {
        return createErrorResponse('Education entry not found');
      }

      delete updateData.updateEducationById;
      delete updateData.educationId;
    }

    // Handle education entry removal by ID
    if (updateData.removeEducationId) {
      const { removeEducationId } = updateData;
      updateQuery = {
        $pull: { educationalBackground: { _id: removeEducationId } }
      };
      delete updateData.removeEducationId;
    }

    // Handle education entry removal by index
    if (updateData.removeEducationIndex !== undefined) {
      const { removeEducationIndex } = updateData;
      const currentEducation = [...(existingUser.educationalBackground || [])];

      if (
        removeEducationIndex >= 0 &&
        removeEducationIndex < currentEducation.length
      ) {
        currentEducation.splice(removeEducationIndex, 1);
        updateQuery.educationalBackground = currentEducation;
      } else {
        return createErrorResponse('Invalid education index');
      }

      delete updateData.removeEducationIndex;
    }

    // Handle setting educationInfoSaved flag
    if (updateData.markEducationComplete !== undefined) {
      updateQuery.educationInfoSaved = updateData.markEducationComplete;
      delete updateData.markEducationComplete;
    }

    // Merge any other update fields (like educationInfoSaved, etc.)
    updateQuery = { ...updateQuery, ...updateData };

    const updatedUser = await developer.findByIdAndUpdate(userId, updateQuery, {
      new: true,
      runValidators: true
    });

    if (!updatedUser) {
      return createErrorResponse('Failed to update user');
    }

    const sanitizedUserData = sanitizeUserData(updatedUser);
    const formattedData = formatDeveloperData(sanitizedUserData);

    // Return only the educationalBackground data
    const responseData = {
      educationalBackground: formattedData.educationalBackground
    };

    return createSuccessResponse(
      'Education information updated successfully',
      responseData
    );
  } catch (error) {
    return handleValidationError(error);
  }
};

/**
 * UPDATE PERSONAL INFO WITH FILE UPLOADS
 * Handles form data with file uploads for documents, and profilePicture
 * Files are uploaded to S3 and URLs are saved to database
 */
const updatePersonalInfoWithFiles = async (userId, updateData, files) => {
  try {
    const existingUser = await developer.findById(userId);
    if (!existingUser) {
      return createErrorResponse('User not found');
    }

    if (existingUser.userType !== 'developer') {
      return createErrorResponse(
        'User is not a developer. Use updateUserProfile for other user types.'
      );
    }

    // Parse JSON fields from form data
    const parsedUpdateData = { ...updateData };

    // Parse bankDetails if it's a string (from form data)
    if (typeof parsedUpdateData.bankDetails === 'string') {
      try {
        parsedUpdateData.bankDetails = JSON.parse(parsedUpdateData.bankDetails);
      } catch (error) {
        return createErrorResponse(
          'Invalid bankDetails format. Must be valid JSON.'
        );
      }
    }

    // Parse address if it's a string (from form data)
    if (typeof parsedUpdateData.address === 'string') {
      try {
        parsedUpdateData.address = JSON.parse(parsedUpdateData.address);
      } catch (error) {
        return createErrorResponse(
          'Invalid address format. Must be valid JSON.'
        );
      }
    }

    const finalUpdateData = {
      ...parsedUpdateData,
      profilePicture: ''
    };

    // Handle file uploads - FIXED LOGIC
    if (Array.isArray(files) && files.length > 0) {
      // Check if we have documents array in updateData
      if (
        Array.isArray(updateData.documents) &&
        updateData.documents.length > 0
      ) {
        // Process each document with its corresponding file
        for (let idx = 0; idx < updateData.documents.length; idx++) {
          const docMeta = updateData.documents[idx];
          const file = files.find(
            f => f.fieldname === `documents[${idx}][file]`
          );

          if (file) {
            let fileUrl = '';
            try {
              const uploadResult = await uploadFileToS3(
                file.buffer,
                file.originalname,
                file.mimetype,
                'documents',
                userId
              );
              fileUrl = uploadResult.fileUrl;
            } catch (error) {
              return createErrorResponse(
                `Failed to upload file for document ${idx}: ${error.message}`
              );
            }

            if (fileUrl) {
              const newDoc = {
                category: docMeta.category || '',
                documentType: docMeta.documentType || '',
                documentName: docMeta.documentName || file.originalname,
                fileUrl: fileUrl,
                fileName: file.originalname,
                fileSize: file.size,
                mimeType: file.mimetype,
                uploadedAt: new Date(),
                isVerified: false
              };
              existingUser.documents.push(newDoc);
            }
          }
        }
      }

      // Handle profile picture and other non-document files
      await Promise.all(
        files.map(async file => {
          if (file.fieldname === 'profilePicture') {
            try {
              const uploadResult = await uploadFileToS3(
                file.buffer,
                file.originalname,
                file.mimetype,
                'profiles',
                userId
              );
              finalUpdateData.profilePicture = uploadResult.fileUrl;
            } catch (error) {
              return createErrorResponse(
                `Failed to upload profile picture: ${error.message}`
              );
            }
          } else if (!file.fieldname.includes('documents')) {
            // Handle other non-document files (legacy support)
            let fileUrl = '';
            try {
              const uploadResult = await uploadFileToS3(
                file.buffer,
                file.originalname,
                file.mimetype,
                'documents',
                userId
              );
              fileUrl = uploadResult.fileUrl;
            } catch (error) {
              return createErrorResponse(
                `Failed to upload file ${file.fieldname}: ${error.message}`
              );
            }

            const normalizedKey = file.fieldname
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '_')
              .replace(/^_+|_+$/g, '');

            if (fileUrl) {
              existingUser.documents = (existingUser.documents || []).filter(
                doc =>
                  !(
                    doc.documentType === normalizedKey &&
                    doc.documentName === file.originalname
                  )
              );
              existingUser.documents.push({
                category: updateData.category || '',
                documentType: normalizedKey,
                documentName: file.originalname,
                fileUrl: fileUrl,
                fileName: file.originalname,
                fileSize: file.size,
                mimeType: file.mimetype,
                uploadedAt: new Date(),
                isVerified: false
              });
            }
          }
        })
      );
    }

    // Handle address update
    let addressResult = null;
    if (finalUpdateData.address) {
      addressResult = await handleAddressUpdate(
        userId,
        finalUpdateData.address
      );
      if (!addressResult.success) {
        return addressResult;
      }
      delete finalUpdateData.address;
    }

    // Remove documents from finalUpdateData to avoid overwriting the processed documents
    delete finalUpdateData.documents;

    // Assign all other fields to the user and save
    Object.assign(existingUser, finalUpdateData);

    const updatedUser = await existingUser.save();

    if (!updatedUser) {
      return createErrorResponse('Failed to update user');
    }

    // Rest of your response formatting logic...
    const sanitizedUserData = sanitizeUserData(updatedUser);
    const formattedData = formatDeveloperData(sanitizedUserData);

    if (addressResult) {
      formattedData.address = addressResult.data;
    }

    let responseData;
    if (
      formattedData.eorEmployed === true ||
      formattedData.eorEmployed === 'true'
    ) {
      responseData = {};
      const identityFields = [
        'id',
        'firstName',
        'lastName',
        'email',
        'userType',
        'loginBy',
        'profilePicture',
        'isVerified',
        'isActive'
      ];
      identityFields.forEach(field => {
        if (formattedData[field] !== undefined) {
          responseData[field] = formattedData[field];
        }
      });

      if (
        'address' in parsedUpdateData &&
        addressResult &&
        addressResult.data
      ) {
        responseData.address = addressResult.data;
      }

      Object.keys(parsedUpdateData).forEach(key => {
        if (key !== 'address' && formattedData[key] !== undefined) {
          responseData[key] = formattedData[key];
        }
      });
    } else {
      responseData = formattedData;
      if (addressResult) {
        responseData.address = addressResult.data;
      } else {
        const currentAddress = await Address.findOne({
          userId,
          isActive: true
        });
        if (currentAddress) {
          responseData.address = sanitizeAddressData(currentAddress);
        }
      }
    }

    return createSuccessResponse(
      'Personal information with files updated successfully',
      responseData
    );
  } catch (error) {
    return handleValidationError(error);
  }
};

const updateExperienceInfoWithFiles = async (userId, updateData, files) => {
  try {
    const existingUser = await developer.findById(userId);
    if (!existingUser) {
      return createErrorResponse('User not found');
    }

    if (existingUser.userType !== 'developer') {
      return createErrorResponse(
        'User is not a developer. Use updateUserProfile for other user types.'
      );
    }

    // Parse JSON fields from form data
    const parsedUpdateData = { ...updateData };

    // Parse professionalBackground if it's a string (from form data)
    if (typeof parsedUpdateData.professionalBackground === 'string') {
      try {
        parsedUpdateData.professionalBackground = JSON.parse(
          parsedUpdateData.professionalBackground
        );
      } catch (error) {
        return createErrorResponse(
          'Invalid professionalBackground format. Must be valid JSON.'
        );
      }
    }

    if (typeof parsedUpdateData.addMultipleExperiences === 'string') {
      try {
        parsedUpdateData.addMultipleExperiences = JSON.parse(
          parsedUpdateData.addMultipleExperiences
        );
      } catch (error) {
        return createErrorResponse(
          'Invalid addMultipleExperiences format. Must be valid JSON.'
        );
      }
    }

    if (typeof parsedUpdateData.updateMultipleExperiences === 'string') {
      try {
        parsedUpdateData.updateMultipleExperiences = JSON.parse(
          parsedUpdateData.updateMultipleExperiences
        );
      } catch (error) {
        return createErrorResponse(
          'Invalid updateMultipleExperiences format. Must be valid JSON.'
        );
      }
    }

    const uploadedFiles = {};
    const indexedFiles = {};

    if (files) {
      if (files.experienceLetter && files.experienceLetter[0]) {
        const experienceLetterFile = files.experienceLetter[0];
        try {
          const uploadResult = await uploadFileToS3(
            experienceLetterFile.buffer,
            experienceLetterFile.originalname,
            experienceLetterFile.mimetype,
            'documents/experience',
            userId
          );
          uploadedFiles.experienceLetter = uploadResult.fileUrl;
        } catch (error) {
          return createErrorResponse(
            `Failed to upload experience letter: ${error.message}`
          );
        }
      }

      if (files.relievingLetter && files.relievingLetter[0]) {
        const relievingLetterFile = files.relievingLetter[0];
        try {
          const uploadResult = await uploadFileToS3(
            relievingLetterFile.buffer,
            relievingLetterFile.originalname,
            relievingLetterFile.mimetype,
            'documents/relieving',
            userId
          );
          uploadedFiles.relievingLetter = uploadResult.fileUrl;
        } catch (error) {
          return createErrorResponse(
            `Failed to upload relieving letter: ${error.message}`
          );
        }
      }

      if (files.certificate && files.certificate[0]) {
        const certificateFile = files.certificate[0];
        try {
          const uploadResult = await uploadFileToS3(
            certificateFile.buffer,
            certificateFile.originalname,
            certificateFile.mimetype,
            'documents/certificates',
            userId
          );
          uploadedFiles.certificate = uploadResult.fileUrl;
        } catch (error) {
          return createErrorResponse(
            `Failed to upload certificate: ${error.message}`
          );
        }
      }

      // Add support for paySlip
      if (files.paySlip && files.paySlip[0]) {
        const paySlipFile = files.paySlip[0];
        try {
          const uploadResult = await uploadFileToS3(
            paySlipFile.buffer,
            paySlipFile.originalname,
            paySlipFile.mimetype,
            'documents/payslip',
            userId
          );
          uploadedFiles.paySlip = uploadResult.fileUrl;
        } catch (error) {
          return createErrorResponse(
            `Failed to upload pay slip: ${error.message}`
          );
        }
      }

      // Add support for appointmentLetter
      if (files.appointmentLetter && files.appointmentLetter[0]) {
        const appointmentLetterFile = files.appointmentLetter[0];
        try {
          const uploadResult = await uploadFileToS3(
            appointmentLetterFile.buffer,
            appointmentLetterFile.originalname,
            appointmentLetterFile.mimetype,
            'documents/appointment',
            userId
          );
          uploadedFiles.appointmentLetter = uploadResult.fileUrl;
        } catch (error) {
          return createErrorResponse(
            `Failed to upload appointment letter: ${error.message}`
          );
        }
      }

      for (const fileKey of Object.keys(files)) {
        const indexMatch = fileKey.match(
          /^(experienceLetter|relievingLetter|certificate|paySlip|appointmentLetter)_(\d+)$/
        );
        if (indexMatch) {
          const [, fileType, index] = indexMatch;
          const file = files[fileKey][0];

          if (file) {
            try {
              let folderName = 'documents/certificates';
              if (fileType === 'experienceLetter') {
                folderName = 'documents/experience';
              }
              if (fileType === 'relievingLetter') {
                folderName = 'documents/relieving';
              }
              if (fileType === 'paySlip') {
                folderName = 'documents/payslip';
              }
              if (fileType === 'appointmentLetter') {
                folderName = 'documents/appointment';
              }

              const uploadResult = await uploadFileToS3(
                file.buffer,
                file.originalname,
                file.mimetype,
                folderName,
                userId
              );

              if (!indexedFiles[index]) {
                indexedFiles[index] = {};
              }
              indexedFiles[index][fileType] = uploadResult.fileUrl;
            } catch (error) {
              return createErrorResponse(
                `Failed to upload ${fileType} at index ${index}: ${error.message}`
              );
            }
          }
        }
      }
    }

    if (
      parsedUpdateData.addMultipleExperiences &&
      Array.isArray(parsedUpdateData.addMultipleExperiences)
    ) {
      const experiencesWithFiles = parsedUpdateData.addMultipleExperiences.map(
        (experience, index) => {
          const experienceWithFiles = { ...experience };

          if (indexedFiles[index]) {
            Object.assign(experienceWithFiles, indexedFiles[index]);
          }

          return experienceWithFiles;
        }
      );

      parsedUpdateData.professionalBackground = experiencesWithFiles;
      delete parsedUpdateData.addMultipleExperiences;
    }

    if (
      parsedUpdateData.updateMultipleExperiences &&
      Array.isArray(parsedUpdateData.updateMultipleExperiences)
    ) {
      const experiencesWithFiles =
        parsedUpdateData.updateMultipleExperiences.map((experience, index) => {
          const experienceWithFiles = { ...experience };

          if (indexedFiles[index]) {
            Object.assign(experienceWithFiles, indexedFiles[index]);
          }

          return experienceWithFiles;
        });

      parsedUpdateData.professionalBackground = experiencesWithFiles;
      delete parsedUpdateData.updateMultipleExperiences;
    }

    if (Object.keys(uploadedFiles).length > 0) {
      if (parsedUpdateData.updateExperienceById) {
        parsedUpdateData.updateExperienceById = {
          ...parsedUpdateData.updateExperienceById,
          ...uploadedFiles
        };
      }
      // Case 2: Adding single experience entry (object)
      else if (
        parsedUpdateData.professionalBackground &&
        typeof parsedUpdateData.professionalBackground === 'object' &&
        !Array.isArray(parsedUpdateData.professionalBackground)
      ) {
        parsedUpdateData.professionalBackground = {
          ...parsedUpdateData.professionalBackground,
          ...uploadedFiles
        };
      }
      // Case 3: No specific experience data, add files to general update
      else if (!parsedUpdateData.professionalBackground) {
        // Merge files directly into the update data for general fields
        Object.assign(parsedUpdateData, uploadedFiles);
      }
    }

    // Call the existing updateExperienceInfo logic with the enhanced data
    const result = await updateExperienceInfo(userId, parsedUpdateData);

    if (!result.success) {
      return result;
    }

    // Build response with only updated fields
    const responseData = {};
    // If professionalBackground was updated, include it
    if (
      'professionalBackground' in parsedUpdateData ||
      'addMultipleExperiences' in updateData ||
      'updateMultipleExperiences' in updateData ||
      'updateExperienceById' in updateData ||
      'removeExperienceId' in updateData ||
      'removeExperienceIndex' in updateData
    ) {
      responseData.professionalBackground = result.data.professionalBackground;
    }
    // If address was updated and present in result, include it
    if ('address' in parsedUpdateData && result.data.address) {
      responseData.address = result.data.address;
    }
    // Add any other updated fields from parsedUpdateData that exist in result.data
    Object.keys(parsedUpdateData).forEach(key => {
      if (
        key !== 'professionalBackground' &&
        key !== 'address' &&
        result.data[key] !== undefined
      ) {
        responseData[key] = result.data[key];
      }
    });

    return createSuccessResponse(
      'Experience information with files updated successfully',
      responseData
    );
  } catch (error) {
    return handleValidationError(error);
  }
};

const updateEducationInfoWithFiles = async (userId, updateData, files) => {
  try {
    const existingUser = await developer.findById(userId);
    if (!existingUser) {
      return createErrorResponse('User not found');
    }

    if (existingUser.userType !== 'developer') {
      return createErrorResponse(
        'User is not a developer. Use updateUserProfile for other user types.'
      );
    }

    const parsedUpdateData = { ...updateData };

    if (typeof parsedUpdateData.educationalBackground === 'string') {
      try {
        parsedUpdateData.educationalBackground = JSON.parse(
          parsedUpdateData.educationalBackground
        );
      } catch (error) {
        return createErrorResponse(
          'Invalid educationalBackground format. Must be valid JSON.'
        );
      }
    }

    if (typeof parsedUpdateData.addMultipleEducations === 'string') {
      try {
        parsedUpdateData.addMultipleEducations = JSON.parse(
          parsedUpdateData.addMultipleEducations
        );
      } catch (error) {
        return createErrorResponse(
          'Invalid addMultipleEducations format. Must be valid JSON.'
        );
      }
    }

    if (typeof parsedUpdateData.updateMultipleEducations === 'string') {
      try {
        parsedUpdateData.updateMultipleEducations = JSON.parse(
          parsedUpdateData.updateMultipleEducations
        );
      } catch (error) {
        return createErrorResponse(
          'Invalid updateMultipleEducations format. Must be valid JSON.'
        );
      }
    }

    const uploadedFiles = {};
    const indexedFiles = {};

    if (files) {
      if (files.certificate && files.certificate[0]) {
        const certificateFile = files.certificate[0];
        try {
          const uploadResult = await uploadFileToS3(
            certificateFile.buffer,
            certificateFile.originalname,
            certificateFile.mimetype,
            'documents/education-certificates',
            userId
          );
          uploadedFiles.certificate = uploadResult.fileUrl;
        } catch (error) {
          return createErrorResponse(
            `Failed to upload certificate: ${error.message}`
          );
        }
      }

      for (const fileKey of Object.keys(files)) {
        const indexMatch = fileKey.match(/^certificate_(\d+)$/);
        if (indexMatch) {
          const [, index] = indexMatch;
          const file = files[fileKey][0];

          if (file) {
            try {
              const uploadResult = await uploadFileToS3(
                file.buffer,
                file.originalname,
                file.mimetype,
                'documents/education-certificates',
                userId
              );

              if (!indexedFiles[index]) {
                indexedFiles[index] = {};
              }
              indexedFiles[index].certificate = uploadResult.fileUrl;
            } catch (error) {
              return createErrorResponse(
                `Failed to upload certificate at index ${index}: ${error.message}`
              );
            }
          }
        }
      }
    }

    if (
      parsedUpdateData.addMultipleEducations &&
      Array.isArray(parsedUpdateData.addMultipleEducations)
    ) {
      const educationsWithFiles = parsedUpdateData.addMultipleEducations.map(
        (education, index) => {
          const educationWithFiles = { ...education };

          if (indexedFiles[index]) {
            Object.assign(educationWithFiles, indexedFiles[index]);
          }

          return educationWithFiles;
        }
      );

      parsedUpdateData.educationalBackground = educationsWithFiles;
      delete parsedUpdateData.addMultipleEducations;
    }

    if (
      parsedUpdateData.updateMultipleEducations &&
      Array.isArray(parsedUpdateData.updateMultipleEducations)
    ) {
      const educationsWithFiles = parsedUpdateData.updateMultipleEducations.map(
        (education, index) => {
          const educationWithFiles = { ...education };

          // Add indexed files if they exist for this index
          if (indexedFiles[index]) {
            Object.assign(educationWithFiles, indexedFiles[index]);
          }

          return educationWithFiles;
        }
      );

      // Replace the educations array with the enhanced version
      parsedUpdateData.educationalBackground = educationsWithFiles;
      delete parsedUpdateData.updateMultipleEducations;
    }

    // Handle file URL merging for different scenarios
    if (Object.keys(uploadedFiles).length > 0) {
      // Case 1: Updating specific education by ID
      if (parsedUpdateData.updateEducationById) {
        parsedUpdateData.updateEducationById = {
          ...parsedUpdateData.updateEducationById,
          ...uploadedFiles
        };
      }
      // Case 2: Adding single education entry (object)
      else if (
        parsedUpdateData.educationalBackground &&
        typeof parsedUpdateData.educationalBackground === 'object' &&
        !Array.isArray(parsedUpdateData.educationalBackground)
      ) {
        parsedUpdateData.educationalBackground = {
          ...parsedUpdateData.educationalBackground,
          ...uploadedFiles
        };
      }
      // Case 3: No specific education data, add files to general update
      else if (!parsedUpdateData.educationalBackground) {
        // Merge files directly into the update data for general fields
        Object.assign(parsedUpdateData, uploadedFiles);
      }
    }

    // Call the existing updateEducationInfo logic with the enhanced data
    const result = await updateEducationInfo(userId, parsedUpdateData);

    if (!result.success) {
      return result;
    }

    // Extract only the educationalBackground data from the full result
    const responseData = {
      educationalBackground: result.data.educationalBackground
    };

    return createSuccessResponse(
      'Education information with files updated successfully',
      responseData
    );
  } catch (error) {
    return handleValidationError(error);
  }
};

const getEorRequest = async email => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${systemToken}`
      }
    };

    const url = `http://localhost:3920/api/v1/service/employee-contracts/get-eor-request/${email}`;

    const eorRequest = await axios.get(url, config);

    if (!eorRequest || !eorRequest.data) {
      return createErrorResponse('User not found');
    }

    return createSuccessResponse(
      'EOR request fetched successfully',
      eorRequest.data
    );
  } catch (error) {
    return handleValidationError(error);
  }
};

/**
 * Query the eor-request collection in the remoteengine-customer-dashboard database by email
 * @param {string} email
 * @returns {Promise<Object|null>} The EOR request document or null
 */
const getEorRequestFromCustomerDashboard = async email => {
  const doc = await EorRequestCustomerDashboard.findOne({ email });
  if (!doc) {
    return null;
  }
  return doc;
};

module.exports = {
  getUserById,
  getEorRequest,
  updateUserProfile,
  updatePersonalInfo,
  updateExperienceInfo,
  updateEducationInfo,
  updatePersonalInfoWithFiles,
  updateExperienceInfoWithFiles,
  updateEducationInfoWithFiles,
  getEorRequestFromCustomerDashboard
};
