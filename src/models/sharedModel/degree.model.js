const mongoose = require('mongoose');
const { Schema } = mongoose;

const degreeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    demandScale: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Degree', degreeSchema);

// This schema defines a Degree model with a name and demand scale.
// The name is a required string that is trimmed, and the demand scale is a required number.
