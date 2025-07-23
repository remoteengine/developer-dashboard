const mongoose = require('mongoose');
const { Schema } = mongoose;
const User = require('../user/user.model');

const developerSchema = new Schema({
  about: String, // filled by admin

  dateOfBirth: Date,

  profilePicture: String,

  languages: {
    type: [
      {
        name: { type: String },
        proficiency: { type: String }
      }
    ],
    default: null
  },

  hobbies: String,

  maritalStatus: {
    type: String,
    enum: ['single', 'married'],
    default: null
  },

  aboutSelf: String,

  role: String,

  phoneNumber: String,

  otherRole: String,

  countryOfCitizenship: String,

  countryOfResidence: String,

  resumeUrl: String,

  resumeInfoSaved: Boolean,

  professionalBackground: [
    {
      role: String,
      companyName: String,
      brand: String,
      startDate: Date,
      endDate: Date,
      skills: {
        type: Object,
        default: {}
      },
      description: String,
      isPresentCompany: Boolean,
      experienceLetter: String,
      relievingLetter: String,
      certificate: String,
      paySlip: String,
      appointmentLetter: String
    }
  ],

  professionalInfoSaved: Boolean,

  educationalBackground: [
    {
      degree: String,
      otherDegree: String,
      fieldOfStudy: String,
      institute: String,
      startDate: Date,
      endDate: Date,
      certificate: String
    }
  ],

  educationInfoSaved: Boolean,

  linkedinUrl: String,

  totalWorkExperience: Number,

  totalWorkExperienceInMonths: Number,

  currentMonthlySalary: Number,

  expectedMonthlySalary: Number,

  bargainedMonthlySalary: Number,

  displayMonthlySalary: Number,

  priorFreelanceExperience: Boolean,

  jobPreference: String,

  skills: [
    {
      skillName: { type: String, required: true },
      yearsOfExperience: { type: Number, required: true },
      competency: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
      }
    }
  ],

  minimumNoticePeriod: Number,

  projects: [
    {
      name: String,
      link: String,
      description: String,
      skills: {
        skillNames: [String]
      },
      otherSkills: {
        skillNames: [String]
      },
      role: {
        name: String
      }
    }
  ],

  eorEmployed: {
    type: Boolean,
    default: false
  },

  codingPlatform: {
    link: String
  },

  isProfileCompleted: Boolean,

  mostExperiencedRole: String,

  lookingForJob: {
    type: String,
    enum: [
      'Immediate',
      '1 weeks',
      '2 weeks',
      '3 weeks',
      '1 months',
      '2 months',
      '3 months',
      'Ready to Interview',
      'Available'
    ],
    default: null
  },

  interestedFullTime: Boolean,

  documents: [
    {
      category: { type: String, required: true },
      documentType: { type: String, required: true },
      documentName: { type: String, required: true },
      fileUrl: { type: String, required: true },
      fileName: String,
      fileSize: Number,
      mimeType: String,
      uploadedAt: { type: Date, default: Date.now },
      isVerified: { type: Boolean, default: false },
      verifiedAt: Date,
      verifiedBy: String,
      verificationNotes: String,
      extractedData: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
      }
    }
  ],

  bankDetails: {
    accountHolderName: String,
    accountNumber: Number,
    accountType: String,
    ifsc: String,
    branchName: String,
    bankAccountProvider: String,
    bankAddress: String,
    micr: String,
    panNumber: String
  }
});

// Developer model inherits from User model
// This allows us to use all the fields from User and add developer-specific fields
// The 'developer' discriminator allows us to query developers specifically
const Developer = User.discriminator('Developer', developerSchema, 'developer');

module.exports = Developer;
