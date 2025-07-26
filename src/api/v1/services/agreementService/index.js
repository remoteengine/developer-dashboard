const Developer = require('../../../../models/developer/developer.model');
const User = require('../../../../models/user/user.model');
const Address = require('../../../../models/address/address.model');
const { ApiError } = require('../../../../utils/errorHandler');
const {
  getEorRequestByEmail,
  getQuoteSummaryByContractId,
  getAllEorRequests
} = require('../sharedService');
const path = require('path');
const fs = require('fs');
const {
  compileTemplate
} = require('../../../../utils/emailService/agreementTemplate');
const crypto = require('crypto');
const convertHtmlToPdf = require('../../../../utils/emailService/convertHtmlToPdf');
const { uploadFileToS3 } = require('../../../../utils/s3Service');
const customerDashboardConnection = require('../../../../config/customerDashboardDb');
const { logger } = require('../../../../config/logger');

const getExchangeRate = async () => {
  try {
    // Replace with your preferred exchange rate API
    const response = await fetch(
      'https://api.exchangerate-api.com/v4/latest/USD'
    );
    const data = await response.json();
    return data.rates.INR;
  } catch (error) {
    console.warn(
      'Failed to fetch exchange rate, using fallback:',
      error.message
    );
    return 83.5; // Fallback rate
  }
};

const downloadAgreementService = async userId => {
  try {
    const exchangeRate = await getExchangeRate();
    const convertUSDToINR = usdAmount => {
      return Math.round(usdAmount * exchangeRate * 100) / 100;
    };

    // Fetch developer and user data
    const [developer, user] = await Promise.all([
      Developer.findById(userId),
      User.findById(userId)
    ]);

    if (!developer) {
      throw new ApiError('Developer not found', 404);
    }

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    const address = await Address.findOne({ userId });

    // Fetch EOR request and quote summary
    const eorRequest = await getEorRequestByEmail(developer.email);

    if (!eorRequest) {
      throw new ApiError('EOR request not found', 404);
    }

    const quoteSummary = await getQuoteSummaryByContractId(
      eorRequest.contractId,
      eorRequest.eorId
    );

    if (!quoteSummary || quoteSummary.length === 0) {
      throw new ApiError('Quote summary not found', 404);
    }

    // Extract and convert quote data
    const quote = quoteSummary[0];
    const monthlyBasicSalaryINR = convertUSDToINR(
      quote.monthlyCosts.monthlyBasicSalary
    );
    const hraINR = convertUSDToINR(quote.monthlyCosts.HRA);
    const specialAllowanceINR = convertUSDToINR(
      quote.monthlyCosts.specialAllowance
    );
    const totalMonthlyRecurringCostINR = convertUSDToINR(
      quote.monthlyCosts.totalMonthlyRecurringCost
    );
    const totalAnnualEmployerCostINR = convertUSDToINR(
      quote.totalAnnualEmployerCost
    );

    // Map data for template
    const templateData = {
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      date: new Date().toLocaleDateString('en-GB'),
      addressLine1: address?.address || '',
      addressLine2: address?.address || '',
      city: address?.city || '',
      state: address?.state || '',
      zipCode: address?.zipCode || '',
      position: developer.role || '',
      reportingManagerName: developer.reportingManager || '',
      monthNumber: developer.probationPeriodMonths || '',
      numberOfHours: developer.numberOfHours || '',
      annualCTC: totalAnnualEmployerCostINR,
      hrName: developer.hrName || '',
      candidateName: `${user.firstName} ${user.lastName}`,
      ctc: totalAnnualEmployerCostINR,
      bs: monthlyBasicSalaryINR * 12,
      bsm: monthlyBasicSalaryINR,
      hra: hraINR * 12,
      hram: hraINR,
      sa: specialAllowanceINR * 12,
      sam: specialAllowanceINR,
      hrInput: developer.hrInput || '',
      deductionDescription: developer.deductionDescription || '',
      np: totalMonthlyRecurringCostINR * 12,
      npm: totalMonthlyRecurringCostINR,
      numberOfPercentage: developer.incentivePercentage || ''
    };

    // Rest of the PDF generation logic remains the same...
    const html = compileTemplate(templateData);
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const fileName = `${templateData.fullName.replace(/\s+/g, '_')}_${uniqueId}.pdf`;
    const outputDir = path.join(__dirname, '../../../../uploads/offer_letters');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPdfPath = path.join(outputDir, fileName);
    await convertHtmlToPdf(html, outputPdfPath);
    const fileBuffer = fs.readFileSync(outputPdfPath);

    try {
      fs.unlinkSync(outputPdfPath);
    } catch (unlinkError) {
      console.warn('Failed to delete temporary PDF file:', unlinkError.message);
    }

    return { fileBuffer, fileName };
  } catch (error) {
    console.error('Error in downloadAgreementService:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(`Failed to generate agreement: ${error.message}`, 500);
  }
};

/**
 * Upload EOR Agreement, update EOR request in customer dashboard DB, and send email with S3 URL
 */
const uploadEorAgreementService = async (userId, file) => {
  try {

    // Get user email
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Upload to S3
    const uploadResult = await uploadFileToS3(
      file.buffer,
      file.originalname,
      file.mimetype,
      'agreements',
      userId
    );

    const email = user.email;

    // Update uploadAgreement in customer dashboard eorrequests
    await new Promise((resolve, reject) => {
      if (customerDashboardConnection.readyState !== 1) {
        customerDashboardConnection.once('connected', resolve);
        customerDashboardConnection.once('error', reject);
      } else {
        resolve();
      }
    });
    const collection = customerDashboardConnection.db.collection('eorrequests');
    const eorRequest = await collection.findOne({
      email,
      isCurrentlyActive: true
    });
    if (!eorRequest) {
      throw new ApiError(
        'Active EOR request not found in customer dashboard',
        404
      );
    }
    const uploadAgreement = {
      fileName: uploadResult.fileName,
      fileUrl: uploadResult.fileUrl,
      uploadedAt: new Date()
    };
    await collection.updateOne(
      { email, isCurrentlyActive: true },
      { $set: { uploadAgreement } }
    );
    return {
      success: true,
      fileUrl: uploadResult.fileUrl,
      fileName: uploadResult.fileName
    };
  } catch (error) {
    logger.error('Error in uploadEorAgreementService:', error);
    throw new ApiError(error.message, error.statusCode || 500);
  }
};

const getEorAgreementService = async userId => {
  try {
    const user = await User.findById(userId);
    const email = user.email;
    const eorRequest = await getAllEorRequests(email);
    if (!eorRequest) {
      throw new ApiError('EOR request not found', 404);
    }
    return eorRequest;
  } catch (error) {
    logger.error('Error in getEorAgreementService:', error);
    throw new ApiError(error.message, error.statusCode || 500);
  }
};

module.exports = {
  downloadAgreementService,
  uploadEorAgreementService,
  getEorAgreementService
};
