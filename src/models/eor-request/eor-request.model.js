const mongoose = require('mongoose');
const { Schema } = mongoose;

const eorRequestSchema = new Schema(
  {
    eorId: {
      type: String,
      required: true,
      unique: true
    },
    developerName: {
      type: String,
      required: true
    },
    developerUserId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      sparse: true
    },
    companyName: {
      type: String,
      required: true
    },
    jobTitle: {
      type: String
    },
    countryOfEmployment: {
      type: String
    },
    overAllStatus: {
      type: String,
      enum: [
        'Invitation sent',
        'Eor_onboarding',
        'Document Required',
        'Background Check In Progress',
        'Contract Sent',
        'Contract Signed',
        'Onboarding Complete',
        'Cancelled',
        'Rejected'
      ],
      default: 'Invitation sent'
    },
    onboardingProgress: [
      {
        stepName: String,
        isCompleted: {
          type: Boolean,
          default: false
        },
        completionDate: Date
      }
    ],
    startDate: Date,
    uploadDocuments: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: {
          type: Date,
          default: Date.now
        },
        documentType: String
      }
    ],
    bankDetails: {
      accountNumber: String,
      branch: String,
      bankName: String,
      ifscCode: String
    }
  },
  {
    timestamps: true
  }
);

const EorRequest = mongoose.model('EorRequest', eorRequestSchema);

module.exports = EorRequest;
