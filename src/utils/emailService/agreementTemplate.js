const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const TEMPLATE_PATH = path.join(__dirname, '../uploadAgrement/index.hbs');

function compileTemplate(data) {
  try {
    // Check if template file exists
    if (!fs.existsSync(TEMPLATE_PATH)) {
      console.error(`Template file not found at: ${TEMPLATE_PATH}`);
      throw new Error(`Template file not found at: ${TEMPLATE_PATH}`);
    }

    console.log(`Reading template from: ${TEMPLATE_PATH}`);
    const templateContent = fs.readFileSync(TEMPLATE_PATH, 'utf8');
    const template = handlebars.compile(templateContent);

    // Add logo as URL
    const logoUrl = 'https://remoteengine-emailbucket.s3.ap-south-1.amazonaws.com/re_logo.png';

    // Map your frontend data keys to template placeholders
    const templateData = {
      fullName: data.fullName,
      addressLine1: data.addressLine1 || '',
      addressLine2: data.addressLine2 || '',
      city: data.city || '',
      state: data.state || '',
      zipCode: data.zipCode || '',
      date: data.date || new Date().toLocaleDateString('en-GB'),
      position: data.position,
      reportingManagerName: data.reportingManagerName,
      monthNumber: data.monthNumber,
      numberOfHours: data.numberOfHours,
      annualCTC: data.annualCTC,
      hrName: data.hrName,
      candidateName: data.candidateName,
      ctc: data.ctc,
      bs: data.bs,
      bsm: data.bsm,
      hra: data.hra,
      hram: data.hram,
      sa: data.sa,
      sam: data.sam,
      hrInput: data.hrInput,
      deductionDescription: data.deductionDescription,
      np: data.np,
      npm: data.npm,
      numberOfPercentage: data.numberOfPercentage,
      logoUrl: logoUrl
    };

    // Log template data for debugging
    console.log('Template data:', JSON.stringify(templateData, null, 2));

    // Render the template with the data
    const html = template(templateData);
    return html;
  } catch (error) {
    console.error('Error compiling template:', error);
    throw new Error(
      `Failed to compile offer letter template: ${error.message}`
    );
  }
}

module.exports = {
  compileTemplate
};
