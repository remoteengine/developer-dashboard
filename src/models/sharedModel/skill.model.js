const mongoose = require('mongoose');
const { Schema } = mongoose;

const skillSchema = new Schema(
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

module.exports = mongoose.model('Skill', skillSchema);
// This schema defines a Skill model with a name and demand scale.
// The name is a required string that is trimmed, and the demand scale is a required number
