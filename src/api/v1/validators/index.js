const authValidators = require('./authValidators');
const userValidators = require('./userValidators');
const addressValidators = require('./addressValidators');

module.exports = {
  ...authValidators,
  ...userValidators,
  ...addressValidators
};
