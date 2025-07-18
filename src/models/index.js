const user = require('./user/user.model');
const developer = require('./developer/developer.model');
const eorRequest = require('./eor-request/eor-request.model');
const degree = require('./sharedModel/degree.model');
const language = require('./sharedModel/language.model');
const skill = require('./sharedModel/skill.model');

module.exports = {
  user: user,
  developer: developer,
  eorRequest: eorRequest,
  degree: degree,
  language: language,
  skill: skill
};
