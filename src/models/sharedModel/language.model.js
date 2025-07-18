const mongoose = require('mongoose');
const { Schema } = mongoose;

const languageSchema = new Schema(
  {
    name: {
      type: String
    },
    score: {
      type: Number,
      min: 0,
      max: 10
    }
  },
  { timestamps: true }
);

const Language = mongoose.model('Language', languageSchema);

module.exports = Language;
