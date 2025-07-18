const userService = require('../../src/api/v1/services/userServices');
const { uploadFileToS3 } = require('../../src/utils/s3Service');
const developer = require('../../src/models/developer/developer.model');

// Mock external dependencies
jest.mock('../../src/utils/s3Service');
jest.mock('../../src/models/developer/developer.model');

describe('User File Upload Service Tests', () => {
  const mockUserId = '60f7b3b3b3b3b3b3b3b3b3b3';
  const mockS3Response = {
    success: true,
    fileUrl: 'https://mock-bucket.s3.amazonaws.com/documents/test-file.pdf',
    fileName: 'test-file.pdf',
    originalName: 'original.pdf'
  };

  const mockUser = {
    _id: mockUserId,
    userType: 'developer',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    professionalBackground: [],
    educationalBackground: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
    uploadFileToS3.mockResolvedValue(mockS3Response);
    developer.findById.mockResolvedValue(mockUser);
    developer.findByIdAndUpdate.mockResolvedValue({
      ...mockUser,
      professionalBackground: [{ role: 'Developer', companyName: 'TechCorp' }]
    });
  });

  describe('updateExperienceInfoWithFiles', () => {
    describe('Success Cases', () => {
      test('should process single experience with files', async () => {
        const updateData = {
          professionalBackground: JSON.stringify({
            role: 'Software Engineer',
            companyName: 'TechCorp',
            startDate: '2022-01-01',
            endDate: '2023-12-31'
          })
        };

        const files = {
          experienceLetter: [
            {
              buffer: Buffer.from('fake pdf'),
              originalname: 'experience.pdf',
              mimetype: 'application/pdf'
            }
          ],
          certificate: [
            {
              buffer: Buffer.from('fake cert'),
              originalname: 'certificate.pdf',
              mimetype: 'application/pdf'
            }
          ]
        };

        const result = await userService.updateExperienceInfoWithFiles(
          mockUserId,
          updateData,
          files
        );

        expect(result.success).toBe(true);
        expect(uploadFileToS3).toHaveBeenCalledTimes(2);
        expect(uploadFileToS3).toHaveBeenCalledWith(
          expect.any(Buffer),
          'experience.pdf',
          'application/pdf',
          'documents/experience',
          mockUserId
        );
        expect(developer.findByIdAndUpdate).toHaveBeenCalled();
      });

      test('should process multiple experiences with indexed files', async () => {
        const updateData = {
          addMultipleExperiences: JSON.stringify([
            {
              role: 'Junior Developer',
              companyName: 'StartupCo',
              startDate: '2021-01-01',
              endDate: '2022-01-01'
            },
            {
              role: 'Senior Developer',
              companyName: 'BigTech',
              startDate: '2022-01-01',
              endDate: '2023-01-01'
            }
          ])
        };

        const files = {
          experienceLetter_0: [
            {
              buffer: Buffer.from('exp letter 1'),
              originalname: 'exp1.pdf',
              mimetype: 'application/pdf'
            }
          ],
          certificate_1: [
            {
              buffer: Buffer.from('cert 2'),
              originalname: 'cert2.pdf',
              mimetype: 'application/pdf'
            }
          ]
        };

        const result = await userService.updateExperienceInfoWithFiles(
          mockUserId,
          updateData,
          files
        );

        expect(result.success).toBe(true);
        expect(uploadFileToS3).toHaveBeenCalledTimes(2);
        expect(result.data).toHaveProperty('professionalBackground');
      });

      test('should update existing experience by ID with files', async () => {
        const experienceId = '60f7b3b3b3b3b3b3b3b3b3b4';
        const updateData = {
          experienceId,
          updateExperienceById: JSON.stringify({
            role: 'Updated Role',
            companyName: 'Updated Company'
          })
        };

        const files = {
          relievingLetter: [
            {
              buffer: Buffer.from('relieving letter'),
              originalname: 'relieving.pdf',
              mimetype: 'application/pdf'
            }
          ]
        };

        // Mock user with existing experience
        const userWithExperience = {
          ...mockUser,
          professionalBackground: [
            {
              _id: experienceId,
              role: 'Old Role',
              companyName: 'Old Company'
            }
          ]
        };
        developer.findById.mockResolvedValue(userWithExperience);

        const result = await userService.updateExperienceInfoWithFiles(
          mockUserId,
          updateData,
          files
        );

        expect(result.success).toBe(true);
        expect(uploadFileToS3).toHaveBeenCalledWith(
          expect.any(Buffer),
          'relieving.pdf',
          'application/pdf',
          'documents/relieving',
          mockUserId
        );
      });

      test('should handle experience without files', async () => {
        const updateData = {
          professionalBackground: JSON.stringify({
            role: 'DevOps Engineer',
            companyName: 'CloudCorp'
          })
        };

        const result = await userService.updateExperienceInfoWithFiles(
          mockUserId,
          updateData,
          null
        );

        expect(result.success).toBe(true);
        expect(uploadFileToS3).not.toHaveBeenCalled();
        expect(developer.findByIdAndUpdate).toHaveBeenCalled();
      });
    });

    describe('Error Cases', () => {
      test('should return error for non-existent user', async () => {
        developer.findById.mockResolvedValue(null);

        const result = await userService.updateExperienceInfoWithFiles(
          mockUserId,
          {},
          null
        );

        expect(result.success).toBe(false);
        expect(result.message).toBe('User not found');
      });

      test('should return error for non-developer user', async () => {
        const nonDeveloperUser = { ...mockUser, userType: 'client' };
        developer.findById.mockResolvedValue(nonDeveloperUser);

        const result = await userService.updateExperienceInfoWithFiles(
          mockUserId,
          {},
          null
        );

        expect(result.success).toBe(false);
        expect(result.message).toContain('User is not a developer');
      });

      test('should handle S3 upload failure', async () => {
        uploadFileToS3.mockRejectedValue(new Error('S3 upload failed'));

        const updateData = {
          professionalBackground: JSON.stringify({ role: 'Engineer' })
        };

        const files = {
          experienceLetter: [
            {
              buffer: Buffer.from('fake pdf'),
              originalname: 'experience.pdf',
              mimetype: 'application/pdf'
            }
          ]
        };

        const result = await userService.updateExperienceInfoWithFiles(
          mockUserId,
          updateData,
          files
        );

        expect(result.success).toBe(false);
        expect(result.message).toContain('Failed to upload experience letter');
      });

      test('should handle invalid JSON in professionalBackground', async () => {
        const updateData = {
          professionalBackground: 'invalid json'
        };

        const result = await userService.updateExperienceInfoWithFiles(
          mockUserId,
          updateData,
          null
        );

        expect(result.success).toBe(false);
        expect(result.message).toContain(
          'Invalid professionalBackground format'
        );
      });

      test('should handle database update failure', async () => {
        developer.findByIdAndUpdate.mockRejectedValue(
          new Error('Database error')
        );

        const updateData = {
          professionalBackground: JSON.stringify({ role: 'Engineer' })
        };

        const result = await userService.updateExperienceInfoWithFiles(
          mockUserId,
          updateData,
          null
        );

        expect(result.success).toBe(false);
      });
    });
  });

  describe('updateEducationInfoWithFiles', () => {
    describe('Success Cases', () => {
      test('should process single education with certificate', async () => {
        const updateData = {
          educationalBackground: JSON.stringify({
            degree: 'Bachelor of Technology',
            fieldOfStudy: 'Computer Science',
            institutionName: 'MIT',
            startDate: '2018-09-01',
            endDate: '2022-06-01'
          })
        };

        const files = {
          certificate: [
            {
              buffer: Buffer.from('fake certificate'),
              originalname: 'certificate.pdf',
              mimetype: 'application/pdf'
            }
          ]
        };

        const result = await userService.updateEducationInfoWithFiles(
          mockUserId,
          updateData,
          files
        );

        expect(result.success).toBe(true);
        expect(uploadFileToS3).toHaveBeenCalledWith(
          expect.any(Buffer),
          'certificate.pdf',
          'application/pdf',
          'documents/education-certificates',
          mockUserId
        );
        expect(developer.findByIdAndUpdate).toHaveBeenCalled();
      });

      test('should process multiple educations with indexed certificates', async () => {
        const updateData = {
          addMultipleEducations: JSON.stringify([
            {
              degree: 'High School',
              fieldOfStudy: 'Science',
              institute: 'ABC High School',
              startDate: '2015-06-01',
              endDate: '2017-05-31'
            },
            {
              degree: 'Master of Science',
              fieldOfStudy: 'Computer Science',
              institutionName: 'Stanford University'
            }
          ])
        };

        const files = {
          certificate_0: [
            {
              buffer: Buffer.from('hs certificate'),
              originalname: 'hs-cert.pdf',
              mimetype: 'application/pdf'
            }
          ],
          certificate_1: [
            {
              buffer: Buffer.from('ms certificate'),
              originalname: 'ms-cert.pdf',
              mimetype: 'application/pdf'
            }
          ]
        };

        const result = await userService.updateEducationInfoWithFiles(
          mockUserId,
          updateData,
          files
        );

        expect(result.success).toBe(true);
        expect(uploadFileToS3).toHaveBeenCalledTimes(2);
        expect(result.data).toHaveProperty('educationalBackground');
      });

      test('should update existing education by ID with new certificate', async () => {
        const educationId = '60f7b3b3b3b3b3b3b3b3b3b5';
        const updateData = {
          educationId,
          updateEducationById: JSON.stringify({
            grade: '4.0',
            institutionName: 'Updated University'
          })
        };

        const files = {
          certificate: [
            {
              buffer: Buffer.from('updated certificate'),
              originalname: 'updated-cert.pdf',
              mimetype: 'application/pdf'
            }
          ]
        };

        // Mock user with existing education
        const userWithEducation = {
          ...mockUser,
          educationalBackground: [
            {
              _id: educationId,
              degree: 'BSc',
              grade: '3.5'
            }
          ]
        };
        developer.findById.mockResolvedValue(userWithEducation);

        const result = await userService.updateEducationInfoWithFiles(
          mockUserId,
          updateData,
          files
        );

        expect(result.success).toBe(true);
        expect(uploadFileToS3).toHaveBeenCalledWith(
          expect.any(Buffer),
          'updated-cert.pdf',
          'application/pdf',
          'documents/education-certificates',
          mockUserId
        );
      });

      test('should handle the specific failing case: addMultipleEducations with single entry', async () => {
        const updateData = {
          addMultipleEducations: JSON.stringify([
            {
              degree: 'High School',
              fieldOfStudy: 'Science',
              institute: 'ABC High School',
              startDate: '2015-06-01',
              endDate: '2017-05-31'
            }
          ])
        };

        const files = {
          certificate_0: [
            {
              buffer: Buffer.from('hs certificate'),
              originalname: 'certificate.pdf',
              mimetype: 'application/pdf'
            }
          ]
        };

        const result = await userService.updateEducationInfoWithFiles(
          mockUserId,
          updateData,
          files
        );

        expect(result.success).toBe(true);
        expect(uploadFileToS3).toHaveBeenCalledWith(
          expect.any(Buffer),
          'certificate.pdf',
          'application/pdf',
          'documents/education-certificates',
          mockUserId
        );
        expect(result.data).toHaveProperty('educationalBackground');
        expect(result.data).toHaveProperty('uploadedFiles');
      });
    });

    describe('Error Cases', () => {
      test('should return error for non-existent user', async () => {
        developer.findById.mockResolvedValue(null);

        const result = await userService.updateEducationInfoWithFiles(
          mockUserId,
          {},
          null
        );

        expect(result.success).toBe(false);
        expect(result.message).toBe('User not found');
      });

      test('should handle S3 upload failure for certificate', async () => {
        uploadFileToS3.mockRejectedValue(new Error('S3 upload failed'));

        const updateData = {
          educationalBackground: JSON.stringify({ degree: 'BSc' })
        };

        const files = {
          certificate: [
            {
              buffer: Buffer.from('fake certificate'),
              originalname: 'certificate.pdf',
              mimetype: 'application/pdf'
            }
          ]
        };

        const result = await userService.updateEducationInfoWithFiles(
          mockUserId,
          updateData,
          files
        );

        expect(result.success).toBe(false);
        expect(result.message).toContain('Failed to upload certificate');
      });

      test('should handle invalid JSON in educationalBackground', async () => {
        const updateData = {
          educationalBackground: 'invalid json'
        };

        const result = await userService.updateEducationInfoWithFiles(
          mockUserId,
          updateData,
          null
        );

        expect(result.success).toBe(false);
        expect(result.message).toContain(
          'Invalid educationalBackground format'
        );
      });

      test('should handle invalid JSON in addMultipleEducations', async () => {
        const updateData = {
          addMultipleEducations: 'invalid json'
        };

        const result = await userService.updateEducationInfoWithFiles(
          mockUserId,
          updateData,
          null
        );

        expect(result.success).toBe(false);
        expect(result.message).toContain(
          'Invalid addMultipleEducations format'
        );
      });
    });
  });

  describe('File Processing Logic', () => {
    test('should handle indexed files correctly', async () => {
      const updateData = {
        addMultipleExperiences: JSON.stringify([
          { role: 'Dev 1', companyName: 'Company 1' },
          { role: 'Dev 2', companyName: 'Company 2' }
        ])
      };

      const files = {
        experienceLetter_0: [
          {
            buffer: Buffer.from('exp1'),
            originalname: 'exp1.pdf',
            mimetype: 'application/pdf'
          }
        ],
        relievingLetter_1: [
          {
            buffer: Buffer.from('rel2'),
            originalname: 'rel2.pdf',
            mimetype: 'application/pdf'
          }
        ],
        certificate_0: [
          {
            buffer: Buffer.from('cert1'),
            originalname: 'cert1.pdf',
            mimetype: 'application/pdf'
          }
        ]
      };

      const result = await userService.updateExperienceInfoWithFiles(
        mockUserId,
        updateData,
        files
      );

      expect(result.success).toBe(true);
      expect(uploadFileToS3).toHaveBeenCalledTimes(3);

      // Verify correct folder paths
      expect(uploadFileToS3).toHaveBeenCalledWith(
        expect.any(Buffer),
        'exp1.pdf',
        'application/pdf',
        'documents/experience',
        mockUserId
      );
      expect(uploadFileToS3).toHaveBeenCalledWith(
        expect.any(Buffer),
        'rel2.pdf',
        'application/pdf',
        'documents/relieving',
        mockUserId
      );
      expect(uploadFileToS3).toHaveBeenCalledWith(
        expect.any(Buffer),
        'cert1.pdf',
        'application/pdf',
        'documents/certificates',
        mockUserId
      );
    });

    test('should merge files correctly with single object data', async () => {
      const updateData = {
        professionalBackground: JSON.stringify({
          role: 'Software Engineer',
          companyName: 'TechCorp'
        })
      };

      const files = {
        experienceLetter: [
          {
            buffer: Buffer.from('experience content'),
            originalname: 'experience.pdf',
            mimetype: 'application/pdf'
          }
        ]
      };

      const result = await userService.updateExperienceInfoWithFiles(
        mockUserId,
        updateData,
        files
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('uploadedFiles');
      expect(result.data.uploadedFiles).toHaveProperty(
        'experienceLetter',
        mockS3Response.fileUrl
      );
    });

    test('should handle files when no specific data is provided', async () => {
      const updateData = {}; // No specific experience/education data

      const files = {
        certificate: [
          {
            buffer: Buffer.from('general certificate'),
            originalname: 'general.pdf',
            mimetype: 'application/pdf'
          }
        ]
      };

      const result = await userService.updateEducationInfoWithFiles(
        mockUserId,
        updateData,
        files
      );

      expect(result.success).toBe(true);
      expect(uploadFileToS3).toHaveBeenCalled();
    });
  });
});
