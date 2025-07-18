const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(v);
        }
      }
    },
    password: {
      type: String,
      minlength: 6,
      select: false
    },
    userType: {
      type: String,
      enum: ['recruiter', 'admin', 'developer'],
      required: true
    },

    loginBy: {
      type: String,
      enum: ['email', 'google', 'linkedin']
    },

    googleAuth: {
      googleId: {
        type: String,
        default: null
      },
      accessToken: {
        type: String,
        default: null
      },
      refreshToken: {
        type: String,
        default: null
      },
      expiresAt: {
        type: Date,
        default: null
      }
    },

    linkedinAuth: {
      linkedinId: {
        type: String,
        default: null
      },
      accessToken: {
        type: String,
        default: null
      }
    },

    profilePicture: {
      type: String,
      default: null
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true
    },

    isDeleted: {
      type: Boolean,
      default: false
    },

    lastLogin: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);

// This code defines a Mongoose schema for a User model in a Node.js application.
// The schema includes fields for user information such as first name, last name, phone number,
// email, password, user type, authentication methods (email, Google, LinkedIn), profile picture,
// verification status, and activity status. It also includes validation for email format and
// ensures that certain fields are required and unique. The schema is then exported as a Mongoose
// model named 'User', which can be used to interact with the users collection in a MongoDB database.
// The timestamps option automatically adds createdAt and updatedAt fields to the schema.
