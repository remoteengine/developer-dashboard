const userService = require('../../services/userServices');
const HttpResponseHandler = require('../../../../utils/httpResponseHandler');
const { ApiError } = require('../../../../utils/errorHandler');

const getUserById = async (req, res, next) => {
  const userId = req.user.userId;
  const { type } = req.query; // Accept type from query string

  try {
    const result = await userService.getUserById(userId, type); // Pass type to service

    if (!result.success) {
      throw new ApiError(result.message, 404);
    }

    return HttpResponseHandler.success(res, result.data, result.message, 200);
  } catch (error) {
    // Let ApiError instances bubble up to error middleware
    if (error instanceof ApiError) {
      return next(error);
    }
    // Handle unexpected errors
    return HttpResponseHandler.error(res, 'Failed to fetch user', 500, []);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;

    const result = await userService.updateUserProfile(userId, updateData);

    if (!result.success) {
      throw new ApiError(result.message, 400);
    }

    return HttpResponseHandler.success(res, result.data, result.message, 200);
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return HttpResponseHandler.error(
      res,
      'Failed to update user profile',
      500,
      []
    );
  }
};

const updatePersonalInfo = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;

    const result = await userService.updatePersonalInfo(userId, updateData);

    if (!result.success) {
      // Handle validation errors specifically
      if (result.validationErrors) {
        return HttpResponseHandler.error(
          res,
          result.message,
          400,
          result.validationErrors
        );
      }

      throw new ApiError(result.message, 400);
    }

    return HttpResponseHandler.success(res, result.data, result.message, 200);
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return HttpResponseHandler.error(
      res,
      'Failed to update personal info',
      500,
      []
    );
  }
};

const updateExperienceInfo = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;

    const result = await userService.updateExperienceInfo(userId, updateData);

    if (!result.success) {
      throw new ApiError(result.message, 400);
    }

    return HttpResponseHandler.success(res, result.data, result.message, 200);
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return HttpResponseHandler.error(
      res,
      'Failed to update experience info',
      500,
      []
    );
  }
};


const updateEducationInfo = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;

    const result = await userService.updateEducationInfo(userId, updateData);

    if (!result.success) {
      throw new ApiError(result.message, 400);
    }

    return HttpResponseHandler.success(res, result.data, result.message, 200);
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
  }
};

const updatePersonalInfoWithFiles = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;
    const files = req.files;

    const result = await userService.updatePersonalInfoWithFiles(userId, updateData, files);

    if (!result.success) {
      // Handle validation errors specifically
      if (result.validationErrors) {
        return HttpResponseHandler.error(
          res,
          result.message,
          400,
          result.validationErrors
        );
      }

      throw new ApiError(result.message, 400);
    }

    return HttpResponseHandler.success(res, result.data, result.message, 200);
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return HttpResponseHandler.error(
      res,
      'Failed to update personal info with files',
      500,
      []
    );
  }
};

const updateExperienceInfoWithFiles = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;
    const files = req.files;

    const result = await userService.updateExperienceInfoWithFiles(userId, updateData, files);

    if (!result.success) {
      throw new ApiError(result.message, 400);
    }

    return HttpResponseHandler.success(res, result.data, result.message, 200);
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return HttpResponseHandler.error(
      res,
      'Failed to update experience info with files',
      500,
      []
    );
  }
};

const updateEducationInfoWithFiles = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;
    const files = req.files;

    const result = await userService.updateEducationInfoWithFiles(userId, updateData, files);

    if (!result.success) {
      throw new ApiError(result.message, 400);
    }

    return HttpResponseHandler.success(res, result.data, result.message, 200);
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return HttpResponseHandler.error(
      res,
      'Failed to update education info with files',
      500,
      []
    );
  }
};


const getEorRequest = async(req, res, next) => {
  try{
    // Get email from authenticated user
    const email = 'aryan.amit0824@gmail.com';
    const result = await userService.getEorRequest(email);

    if(!result.success){
      throw new ApiError(result.message, 400);
    }
    return HttpResponseHandler.success(res, result.data, result.message, 200);

  }catch(error){
    if(error instanceof ApiError){
      return next(error);
    }
    return HttpResponseHandler.error(
      res,
      'Failed to get eor request',
      500,
      []
    );
  }
};


module.exports = {
  getUserById,
  getEorRequest,
  updateUserProfile,
  updatePersonalInfo,
  updateEducationInfo,
  updateExperienceInfo,
  updatePersonalInfoWithFiles,
  updateExperienceInfoWithFiles,
  updateEducationInfoWithFiles
};
