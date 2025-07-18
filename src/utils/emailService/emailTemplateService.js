/**
 * Email Template Service for RemoteEngine
 * Uses consistent HTML template for all email types
 */

/**
 * Generate RemoteEngine Email Template
 * @param {Object} options - Email configuration options
 * @param {string} options.recipientName - Name of the recipient
 * @param {string} options.emailType - Type of email ('welcome', 'otp', 'custom')
 * @param {string} options.otpCode - OTP code (for OTP emails)
 * @param {Object} options.customContent - Custom content for email
 * @returns {string} - Complete HTML email template
 */
const generateRemoteEngineEmailTemplate = ({
  recipientName = 'there',
  emailType = 'welcome',
  otpCode = null,
  customContent = null
}) => {
  // Default content based on email type
  let mainTitle, mainContent, stepsList, closingText, signatureName, signatureTitle;

  if (emailType === 'otp') {
    mainTitle = `Hi ${recipientName},<br>Your Verification Code`;
    mainContent = `
      <p style="margin: 0 0 16px 0;">
        Please use the verification code below to complete your account verification:
      </p>
      
      ${otpCode ? `
      <div style="background-color: #f0f9ff; padding: 25px; border-radius: 12px; margin: 25px 0; border: 2px solid #0369a1; text-align: center;">
        <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: 600; color: #0c4a6e;">
          Your Verification Code
        </p>
        <div style="font-size: 36px; font-weight: bold; color: #0c4a6e; letter-spacing: 8px; font-family: 'Courier New', monospace; margin: 15px 0;">
          ${otpCode}
        </div>
        <p style="margin: 15px 0 0 0; font-size: 12px; color: #666;">
          This code expires in 10 minutes
        </p>
      </div>
      ` : ''}
      
      <p style="margin: 0 0 12px 0; font-weight: 600; font-size:12px">
        Here's what happens next:
      </p>`;

    stepsList = `
      <tr>
        <td style="padding: 4px 0; font-size: 12px; line-height: 1.5; color: #333;">
          - Enter the verification code in the application
        </td>
      </tr>
      <tr>
        <td style="padding: 4px 0; font-size: 12px; line-height: 1.5; color: #333;">
          - Complete your profile setup
        </td>
      </tr>
      <tr>
        <td style="padding: 4px 0; font-size: 12px; line-height: 1.5; color: #333;">
          - Start exploring RemoteEngine platform
        </td>
      </tr>`;

    closingText = 'We\'re here to make your verification process smooth and secure.';
    signatureName = 'RemoteEngine Security Team';
    signatureTitle = 'Account Verification';
  } else if (emailType === 'welcome') {
    // Welcome email content (default)
    mainTitle = `Hi ${recipientName},<br>Welcome to RemoteEngine!`;
    mainContent = `
      <p style="margin: 0 0 16px 0;">
        We're excited to have you at RemoteEngine. You're now one step closer to hiring top-tier, pre-vetted developers who can hit the ground running.
      </p>
      
      <p style="margin: 0 0 12px 0; font-weight: 600; font-size:12px">
        Here's what happens next:
      </p>`;

    stepsList = `
      <tr>
        <td style="padding: 4px 0; font-size: 12px; line-height: 1.5; color: #333;">
          - We'll review your requirements
        </td>
      </tr>
      <tr>
        <td style="padding: 4px 0; font-size: 12px; line-height: 1.5; color: #333;">
          - You'll receive a shortlist of candidates, vetted by our AI interviewer
        </td>
      </tr>
      <tr>
        <td style="padding: 4px 0; font-size: 12px; line-height: 1.5; color: #333;">
          - You choose who fits – fast, flexible, and with zero hiring clutter
        </td>
      </tr>`;

    closingText = 'We\'re here to make your hiring process smoother than ever.';
    signatureName = 'Abhey Sharma';
    signatureTitle = 'Co-founder, RemoteEngine';
  } else {
    // Custom email content
    mainTitle = customContent?.title || `Hi ${recipientName},<br>Message from RemoteEngine`;
    mainContent = customContent?.content || `
      <p style="margin: 0 0 16px 0;">
        Thank you for being part of the RemoteEngine community.
      </p>`;
    stepsList = customContent?.steps || '';
    closingText = customContent?.closingText || 'We\'re here to help you succeed.';
    signatureName = customContent?.signatureName || 'RemoteEngine Team';
    signatureTitle = customContent?.signatureTitle || 'Customer Success';
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RemoteEngine</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style type="text/css">
        /* Reset styles */
        body, table, td, p, div { margin: 0; padding: 0; }
        body { font-family: Arial, Helvetica, sans-serif; background-color: #f7f7f3; }
        table { border-collapse: collapse; }
        img { border: 0; display: block; }
        .email-container { max-width: 600px; margin: 0 auto; }
       
        /* Responsive styles */
        @media only screen and (max-width: 600px) {
            .email-container { width: 100% !important; }
            .content-padding { padding: 20px 20px !important; }
            .footer-padding { padding: 10px 15px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f7f7f3;">
   
    <!-- Main Container Table -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f7f7f3; ">
        <tr>
            <td style="padding: 20px 0; ">
               
                <!-- Email Content Container -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container" style="max-width: 600px; margin: 0 auto; background-color: #f7f7f3; position: relative; border: 1px solid #e2e8f0;">
                   
                    <!-- Header Background Decorative Elements -->
                    <tr>
                        <td style="position: relative; background-color: #f7f7f3; padding-top: 40px;">
                           
                            <!-- Logo Section -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding: 17px 0; position: relative; z-index: 10;">
                                        <!-- RemoteEngine Logo (Simplified) -->
                                        <div style="display: inline-block; font-family: Arial, sans-serif; font-size: 1px; font-weight: bold; color: #333; padding: 8px 16px; border-radius: 4px; ">
                                          <img src="https://remoteengine-emailbucket.s3.ap-south-1.amazonaws.com/re_logo.png" alt="logo">
                                        </div>
                                    </td>
                                </tr>
                            </table>
                           
                            <!-- Illustration Section (Simplified) -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding: 17px 0; position: relative; z-index: 10;">
                                        <!-- Simplified Character Illustration -->
                                        <div style="display: inline-block; width: 120px; height: 80px; border-radius: 15px; position: relative;">
                                             <img src="https://remoteengine-emailbucket.s3.ap-south-1.amazonaws.com/welcome_to_re.png" alt="Character Illustration">
                                        </div>
                                    </td>
                                </tr>
                            </table>
                           
                        </td>
                    </tr>
                   
                    <!-- Main Content -->
                    <tr>
                        <td class="content-padding" style="padding: 30px 46px; background-color: #f7f7f3;">
                           
                            <!-- Welcome Message -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding-bottom: 28px;">
                                        <h1 style="font-size: 16px; font-weight: 600; color: #333; margin: 0; line-height: 1.4;">
                                            ${mainTitle}
                                        </h1>
                                    </td>
                                </tr>
                            </table>
                           
                            <!-- Body Content -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="font-size: 12px;">
                                <tr>
                                    <td style="font-size: 12px; line-height: 1.6; color: #333;">
                                       
                                        ${mainContent}
                                       
                                        <!-- Steps List -->
                                        ${stepsList ? `
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 16px; font-size:12px">
                                            ${stepsList}
                                        </table>
                                        ` : ''}
                                       
                                        <p style="margin: 0 0 16px 0;">
                                            If you have any questions, just reply to this email or reach us at
                                            <a href="mailto:team@remoteengine.co" style="color: #333; text-decoration: underline;">team@remoteengine.co</a>.
                                        </p>
                                       
                                        <p style="margin: 0 0 40px 0;">
                                            ${closingText}
                                        </p>
                                       
                                        <p style="margin: 0 0 8px 0;">
                                            Warm regards,
                                        </p>
                                       
                                        <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">
                                            ${signatureName} <br>${signatureTitle}
                                        </p>
                                       
                                    </td>
                                </tr>
                            </table>
                           
                        </td>
                    </tr>
                   
                    <!-- Footer -->
                    <tr>
                        <td class="footer-padding" style="padding: 20px 20px; background-color: #f7f7f3; border-top: 1px solid #e2e8f0; background-color:#fff;">
                           
                            <!-- Contact Info -->
                            <table  role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="font-size: 12px; color: #666;  padding-bottom: 16px;">
                                        Please contact if you have any questions:
                                        <strong style="color: #333;">team@remoteengine.co</strong>
                                    </td>
                                </tr>
                            </table>
                           
                            <!-- Copyright and Social Links -->
                            <table  role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="font-size: 8px; color: #999; vertical-align: middle;">
                                        © 2025 RemoteEngine
                                    </td>
                                    <td style="text-align: right; vertical-align: middle;">
                                        <!-- Social Media Links -->
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="display: inline-table;">
                                            <tr>
                                                <td style="padding: 0 4px;">
                                                    <a href="https://www.facebook.com/remoteengine/" style="text-decoration: none; color: #333;">
                                                       <img src="https://remoteengine-emailbucket.s3.ap-south-1.amazonaws.com/facebook.png" alt="">
                                                    </a>
                                                </td>
                                                <td style="padding: 0 4px;">
                                                    <a href="https://www.instagram.com/remote.engine/?hl=en" style="text-decoration: none; color: #333;">
                                                        <img src="https://remoteengine-emailbucket.s3.ap-south-1.amazonaws.com/instagram.png" alt="">
                                                    </a>
                                                </td>
                                                <td style="padding: 0 4px;">
                                                    <a href="https://www.linkedin.com/company/remoteengine/posts/?feedView=all" style="text-decoration: none; color: #333;">
                                                      <img src="https://remoteengine-emailbucket.s3.ap-south-1.amazonaws.com/linkedin.png" alt="">
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                           
                        </td>
                    </tr>
                   
                </table>
               
            </td>
        </tr>
    </table>
   
</body>
</html>`;
};

/**
 * Generate OTP Email Content
 * @param {string} recipientName - Name of the recipient
 * @param {string} otpCode - OTP code
 * @returns {string} - HTML email content
 */
const generateOTPEmail = (recipientName, otpCode) => {
  return generateRemoteEngineEmailTemplate({
    recipientName,
    emailType: 'otp',
    otpCode
  });
};

/**
 * Generate Welcome Email Content
 * @param {string} recipientName - Name of the recipient
 * @returns {string} - HTML email content
 */
const generateWelcomeEmail = (recipientName) => {
  return generateRemoteEngineEmailTemplate({
    recipientName,
    emailType: 'welcome'
  });
};

/**
 * Generate Custom Email Content
 * @param {string} recipientName - Name of the recipient
 * @param {Object} customContent - Custom content configuration
 * @returns {string} - HTML email content
 */
const generateCustomEmail = (recipientName, customContent) => {
  return generateRemoteEngineEmailTemplate({
    recipientName,
    emailType: 'custom',
    customContent
  });
};

module.exports = {
  generateRemoteEngineEmailTemplate,
  generateOTPEmail,
  generateWelcomeEmail,
  generateCustomEmail
};
