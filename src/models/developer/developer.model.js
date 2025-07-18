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
      certificate: String
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

  uaid: String,
  panCard: String,

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

// {
//   "_id": "64fa2c7b2b342c9f77f0c1e5",
//   "about": "Experienced full-stack developer with a passion for building scalable applications.",
//   "dateOfBirth": "1995-08-15T00:00:00.000Z",
//   "languages": [
//     { "name": "English", "proficiency": "Fluent" },
//     { "name": "Hindi", "proficiency": "Native" }
//   ],
//   "hobbies": "Reading, Coding, Traveling",
//   "maritalStatus": "single",
//   "aboutSelf": "I am a passionate software developer with 6 years of experience in backend systems.",
//   "role": "Backend Developer",
//   "phoneNumber": "+919876543210",
//   "otherRole": "",
//   "countryOfCitizenship": "India",
//   "countryOfResidence": "India",
//   "resumeUrl": "https://example.com/resume.pdf",
//   "resumeInfoSaved": true,
//   "professionalBackground": [
//     {
//       "role": "Senior Backend Engineer",
//       "companyName": "Tech Solutions Ltd.",
//       "brand": "TechSol",
//       "startDate": "2021-01-01T00:00:00.000Z",
//       "endDate": null,
//       "skills": {
//         "Node.js": "Advanced",
//         "MongoDB": "Intermediate",
//         "AWS": "Basic"
//       },
//       "description": "Led the backend team and built RESTful APIs.",
//       "isPresentCompany": true
//     }
//   ],
//   "professionalInfoSaved": true,
//   "educationalBackground": [
//     {
//       "degree": "Bachelor of Technology",
//       "otherDegree": "",
//       "fieldOfStudy": "Computer Science",
//       "institute": "IIT Delhi",
//       "startDate": "2013-07-01T00:00:00.000Z",
//       "endDate": "2017-06-30T00:00:00.000Z"
//     }
//   ],
//   "educationInfoSaved": true,
//   "linkedinUrl": "https://linkedin.com/in/developer-profile",
//   "totalWorkExperience": 6,
//   "totalWorkExperienceInMonths": 72,
//   "currentMonthlySalary": 150000,
//   "expectedMonthlySalary": 180000,
//   "bargainedMonthlySalary": 170000,
//   "displayMonthlySalary": 170000,
//   "priorFreelanceExperience": true,
//   "jobPreference": "Remote",
//   "skills": [
//     {
//       "skillName": "Node.js",
//       "yearsOfExperience": 4,
//       "competency": "High"
//     },
//     {
//       "skillName": "MongoDB",
//       "yearsOfExperience": 3,
//       "competency": "Medium"
//     }
//   ],
//   "minimumNoticePeriod": 15,
//   "projects": [
//     {
//       "name": "Job Portal",
//       "link": "https://github.com/dev/job-portal",
//       "description": "A full-stack job portal application for recruiters and job seekers.",
//       "skills": {
//         "skillNames": ["Node.js", "Express", "MongoDB"]
//       },
//       "otherSkills": {
//         "skillNames": ["Jest", "Docker"]
//       },
//       "role": {
//         "name": "Lead Developer"
//       }
//     }
//   ],
//   "eorEmployed": false,
//   "codingPlatform": {
//     "link": "https://leetcode.com/dev_user"
//   },
//   "isProfileCompleted": true,
//   "mostExperiencedRole": "Backend Developer",
//   "lookingForJob": "Immediate",
//   "interestedFullTime": true,
//   "documents": {
//     "uaid": "https://example.com/docs/uaid.pdf",
//     "panCard": "https://example.com/docs/pan.pdf",
//     "experienceLetter": "https://example.com/docs/exp_letter.pdf",
//     "relievingLetter": "https://example.com/docs/relieving_letter.pdf",
//     "certificate": "https://example.com/docs/certificate.pdf"
//   },
//   "bankDetails": {
//     "accountNumber": 123456789012,
//     "ifsc": "HDFC0001234",
//     "branchName": "HDFC - MG Road",
//     "bankAccountProvider": "HDFC Bank"
//   },
//   "__t": "developer"  // added by discriminator
// }
