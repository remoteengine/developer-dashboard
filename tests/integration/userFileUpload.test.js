const request = require('supertest');
const app = require('../../server');
const jwtService = require('../../src/utils/jwtService');
const path = require('path');
const fs = require('fs');

describe('User Profile File Upload APIs', () => {
  let authToken;
  let testUserId = '60f7b3b3b3b3b3b3b3b3b3b3'; // Mock user ID

  // Mock JWT payload
  const mockUserPayload = {
    userId: testUserId,
    email: 'test@example.com',
    userType: 'developer',
    loginBy: 'email'
  };

  beforeAll(() => {
    // Generate test JWT token
    authToken = jwtService.generateAccessToken(mockUserPayload);
  });

  beforeEach(() => {
    // Clear any console mocks before each test
    jest.clearAllMocks();
  });

  describe('Experience File Upload API - /api/v1/user/update-experience-info', () => {
    describe('Success Scenarios', () => {
      test('should upload single experience with files successfully', async () => {
        const mockExperience = {
          role: 'Software Engineer',
          companyName: 'TechCorp',
          startDate: '2022-01-01',
          endDate: '2023-12-31',
          skills: { JavaScript: 'Advanced', React: 'Intermediate' },
          isPresentCompany: false
        };

        const response = await request(app)
          .patch('/api/v1/user/update-experience-info')
          .set('Authorization', `Bearer ${authToken}`)
          .field('professionalBackground', JSON.stringify(mockExperience))
          .attach(
            'experienceLetter',
            Buffer.from('fake pdf content'),
            'experience.pdf'
          )
          .attach(
            'relievingLetter',
            Buffer.from('fake pdf content'),
            'relieving.pdf'
          )
          .attach(
            'certificate',
            Buffer.from('fake pdf content'),
            'certificate.pdf'
          )
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain(
          'Experience information with files updated successfully'
        );
        expect(response.body.data).toHaveProperty('professionalBackground');
        expect(response.body.data).toHaveProperty('uploadedFiles');
        expect(response.body.data.uploadedFiles).toHaveProperty(
          'experienceLetter'
        );
        expect(response.body.data.uploadedFiles).toHaveProperty(
          'relievingLetter'
        );
        expect(response.body.data.uploadedFiles).toHaveProperty('certificate');
      });

      test('should add multiple experiences with indexed files', async () => {
        const mockExperiences = [
          {
            role: 'Junior Developer',
            companyName: 'StartupCo',
            startDate: '2021-07-01',
            endDate: '2022-12-31',
            skills: { JavaScript: 'Beginner' },
            isPresentCompany: false
          },
          {
            role: 'Senior Developer',
            companyName: 'BigTech',
            startDate: '2023-01-01',
            endDate: '2024-06-30',
            skills: { Python: 'Advanced' },
            isPresentCompany: false
          }
        ];

        const response = await request(app)
          .patch('/api/v1/user/update-experience-info')
          .set('Authorization', `Bearer ${authToken}`)
          .field('addMultipleExperiences', JSON.stringify(mockExperiences))
          .attach('experienceLetter_0', Buffer.from('fake pdf 1'), 'exp1.pdf')
          .attach('relievingLetter_0', Buffer.from('fake pdf 2'), 'rel1.pdf')
          .attach('experienceLetter_1', Buffer.from('fake pdf 3'), 'exp2.pdf')
          .attach('certificate_1', Buffer.from('fake pdf 4'), 'cert2.pdf')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.professionalBackground).toHaveLength(2);
        expect(response.body.data.uploadedFiles).toBeDefined();
      });

      test('should update existing experience by ID with new files', async () => {
        const experienceId = '60f7b3b3b3b3b3b3b3b3b3b4';
        const updateData = {
          role: 'Updated Senior Developer',
          companyName: 'Updated Company'
        };

        const response = await request(app)
          .patch('/api/v1/user/update-experience-info')
          .set('Authorization', `Bearer ${authToken}`)
          .field('experienceId', experienceId)
          .field('updateExperienceById', JSON.stringify(updateData))
          .attach(
            'certificate',
            Buffer.from('updated certificate'),
            'updated-cert.pdf'
          )
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('professionalBackground');
      });

      test('should handle experience upload without files', async () => {
        const mockExperience = {
          role: 'DevOps Engineer',
          companyName: 'CloudCorp',
          startDate: '2023-01-01',
          endDate: '2024-01-01',
          isPresentCompany: false
        };

        const response = await request(app)
          .patch('/api/v1/user/update-experience-info')
          .set('Authorization', `Bearer ${authToken}`)
          .field('professionalBackground', JSON.stringify(mockExperience))
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('professionalBackground');
      });
    });

    describe('Error Scenarios', () => {
      test('should return 401 without authorization token', async () => {
        await request(app)
          .patch('/api/v1/user/update-experience-info')
          .field('professionalBackground', '{}')
          .expect(401);
      });

      test('should return 400 for invalid JSON in professionalBackground', async () => {
        const response = await request(app)
          .patch('/api/v1/user/update-experience-info')
          .set('Authorization', `Bearer ${authToken}`)
          .field('professionalBackground', 'invalid json')
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain(
          'Invalid professionalBackground format'
        );
      });

      test('should return 400 for invalid JSON in addMultipleExperiences', async () => {
        const response = await request(app)
          .patch('/api/v1/user/update-experience-info')
          .set('Authorization', `Bearer ${authToken}`)
          .field('addMultipleExperiences', 'invalid json')
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain(
          'Invalid addMultipleExperiences format'
        );
      });

      test('should handle file upload errors gracefully', async () => {
        // Test with oversized file (this would be caught by multer middleware)
        const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 'a'); // 6MB file

        const response = await request(app)
          .patch('/api/v1/user/update-experience-info')
          .set('Authorization', `Bearer ${authToken}`)
          .field('professionalBackground', '{}')
          .attach('experienceLetter', largeBuffer, 'large-file.pdf')
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      test('should return 400 for non-existent experience ID update', async () => {
        const nonExistentId = '60f7b3b3b3b3b3b3b3b3b3b9';
        const updateData = { role: 'Updated Role' };

        const response = await request(app)
          .patch('/api/v1/user/update-experience-info')
          .set('Authorization', `Bearer ${authToken}`)
          .field('experienceId', nonExistentId)
          .field('updateExperienceById', JSON.stringify(updateData))
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Experience entry not found');
      });
    });

    describe('File Type Validation', () => {
      test('should accept valid file types (PDF, DOC, DOCX, images)', async () => {
        const mockExperience = {
          role: 'QA Engineer',
          companyName: 'TestCorp'
        };

        const response = await request(app)
          .patch('/api/v1/user/update-experience-info')
          .set('Authorization', `Bearer ${authToken}`)
          .field('professionalBackground', JSON.stringify(mockExperience))
          .attach('experienceLetter', Buffer.from('pdf content'), {
            filename: 'experience.pdf',
            contentType: 'application/pdf'
          })
          .attach('certificate', Buffer.from('image content'), {
            filename: 'certificate.jpg',
            contentType: 'image/jpeg'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      test('should reject invalid file types', async () => {
        const response = await request(app)
          .patch('/api/v1/user/update-experience-info')
          .set('Authorization', `Bearer ${authToken}`)
          .field('professionalBackground', '{}')
          .attach('experienceLetter', Buffer.from('text content'), {
            filename: 'experience.txt',
            contentType: 'text/plain'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Education File Upload API - /api/v1/user/update-education-info', () => {
    describe('Success Scenarios', () => {
      test('should upload single education with certificate successfully', async () => {
        const mockEducation = {
          degree: 'Bachelor of Technology',
          fieldOfStudy: 'Computer Science',
          institutionName: 'MIT',
          startDate: '2018-09-01',
          endDate: '2022-06-01',
          grade: '3.8'
        };

        const response = await request(app)
          .patch('/api/v1/user/update-education-info')
          .set('Authorization', `Bearer ${authToken}`)
          .field('educationalBackground', JSON.stringify(mockEducation))
          .attach(
            'certificate',
            Buffer.from('fake certificate pdf'),
            'degree-certificate.pdf'
          )
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain(
          'Education information with files updated successfully'
        );
        expect(response.body.data).toHaveProperty('educationalBackground');
        expect(response.body.data).toHaveProperty('uploadedFiles');
        expect(response.body.data.uploadedFiles).toHaveProperty('certificate');
      });

      test('should add multiple educations with indexed certificates', async () => {
        const mockEducations = [
          {
            degree: 'High School',
            fieldOfStudy: 'Science',
            institutionName: 'ABC High School',
            startDate: '2015-06-01',
            endDate: '2017-05-31'
          },
          {
            degree: 'Master of Science',
            fieldOfStudy: 'Computer Science',
            institutionName: 'Stanford University',
            startDate: '2022-09-01',
            endDate: '2024-06-01'
          }
        ];

        const response = await request(app)
          .patch('/api/v1/user/update-education-info')
          .set('Authorization', `Bearer ${authToken}`)
          .field('addMultipleEducations', JSON.stringify(mockEducations))
          .attach(
            'certificate_0',
            Buffer.from('high school cert'),
            'hs-cert.pdf'
          )
          .attach('certificate_1', Buffer.from('masters cert'), 'ms-cert.pdf')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.educationalBackground).toHaveLength(2);
        expect(response.body.data.uploadedFiles).toBeDefined();
      });

      test('should update existing education by ID with new certificate', async () => {
        const educationId = '60f7b3b3b3b3b3b3b3b3b3b5';
        const updateData = {
          grade: '4.0',
          institutionName: 'Updated University'
        };

        const response = await request(app)
          .patch('/api/v1/user/update-education-info')
          .set('Authorization', `Bearer ${authToken}`)
          .field('educationId', educationId)
          .field('updateEducationById', JSON.stringify(updateData))
          .attach(
            'certificate',
            Buffer.from('updated certificate'),
            'updated-cert.pdf'
          )
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('educationalBackground');
      });

      test('should handle education upload without files', async () => {
        const mockEducation = {
          degree: 'Diploma',
          fieldOfStudy: 'Information Technology',
          institutionName: 'Tech Institute',
          startDate: '2020-01-01',
          endDate: '2021-12-31'
        };

        const response = await request(app)
          .patch('/api/v1/user/update-education-info')
          .set('Authorization', `Bearer ${authToken}`)
          .field('educationalBackground', JSON.stringify(mockEducation))
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('educationalBackground');
      });

      test('should handle the specific test case: addMultipleEducations with single entry', async () => {
        const testEducation = [
          {
            degree: 'High School',
            fieldOfStudy: 'Science',
            institute: 'ABC High School',
            startDate: '2015-06-01',
            endDate: '2017-05-31'
          }
        ];

        const response = await request(app)
          .patch('/api/v1/user/update-education-info')
          .set('Authorization', `Bearer ${authToken}`)
          .field('addMultipleEducations', JSON.stringify(testEducation))
          .attach(
            'certificate_0',
            Buffer.from('fake certificate content'),
            'certificate.pdf'
          )
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('educationalBackground');
        expect(response.body.data).toHaveProperty('uploadedFiles');
        expect(response.body.data.educationalBackground).toHaveLength(1);
        expect(response.body.data.educationalBackground[0]).toMatchObject({
          degree: 'High School',
          fieldOfStudy: 'Science',
          institute: 'ABC High School'
        });
      });
    });

    describe('Error Scenarios', () => {
      test('should return 401 without authorization token', async () => {
        await request(app)
          .patch('/api/v1/user/update-education-info')
          .field('educationalBackground', '{}')
          .expect(401);
      });

      test('should return 400 for invalid JSON in educationalBackground', async () => {
        const response = await request(app)
          .patch('/api/v1/user/update-education-info')
          .set('Authorization', `Bearer ${authToken}`)
          .field('educationalBackground', 'invalid json')
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain(
          'Invalid educationalBackground format'
        );
      });

      test('should return 400 for invalid JSON in addMultipleEducations', async () => {
        const response = await request(app)
          .patch('/api/v1/user/update-education-info')
          .set('Authorization', `Bearer ${authToken}`)
          .field('addMultipleEducations', 'invalid json')
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain(
          'Invalid addMultipleEducations format'
        );
      });

      test('should return 400 for non-existent education ID update', async () => {
        const nonExistentId = '60f7b3b3b3b3b3b3b3b3b3b9';
        const updateData = { grade: '4.0' };

        const response = await request(app)
          .patch('/api/v1/user/update-education-info')
          .set('Authorization', `Bearer ${authToken}`)
          .field('educationId', nonExistentId)
          .field('updateEducationById', JSON.stringify(updateData))
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Education entry not found');
      });

      test('should handle certificate upload errors gracefully', async () => {
        const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 'a'); // 6MB file

        const response = await request(app)
          .patch('/api/v1/user/update-education-info')
          .set('Authorization', `Bearer ${authToken}`)
          .field('educationalBackground', '{}')
          .attach('certificate', largeBuffer, 'large-certificate.pdf')
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('File Type Validation', () => {
      test('should accept valid certificate file types', async () => {
        const mockEducation = {
          degree: 'PhD',
          fieldOfStudy: 'Computer Science'
        };

        const response = await request(app)
          .patch('/api/v1/user/update-education-info')
          .set('Authorization', `Bearer ${authToken}`)
          .field('educationalBackground', JSON.stringify(mockEducation))
          .attach('certificate', Buffer.from('pdf content'), {
            filename: 'certificate.pdf',
            contentType: 'application/pdf'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      test('should reject invalid certificate file types', async () => {
        const response = await request(app)
          .patch('/api/v1/user/update-education-info')
          .set('Authorization', `Bearer ${authToken}`)
          .field('educationalBackground', '{}')
          .attach('certificate', Buffer.from('text content'), {
            filename: 'certificate.txt',
            contentType: 'text/plain'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Cross-functional Tests', () => {
    test('should handle concurrent file uploads', async () => {
      const experiencePromise = request(app)
        .patch('/api/v1/user/update-experience-info')
        .set('Authorization', `Bearer ${authToken}`)
        .field('professionalBackground', JSON.stringify({ role: 'Developer' }))
        .attach('experienceLetter', Buffer.from('exp content'), 'exp.pdf');

      const educationPromise = request(app)
        .patch('/api/v1/user/update-education-info')
        .set('Authorization', `Bearer ${authToken}`)
        .field('educationalBackground', JSON.stringify({ degree: 'BSc' }))
        .attach('certificate', Buffer.from('cert content'), 'cert.pdf');

      const [expResponse, eduResponse] = await Promise.all([
        experiencePromise,
        educationPromise
      ]);

      expect(expResponse.status).toBe(200);
      expect(eduResponse.status).toBe(200);
    });

    test('should maintain data integrity with multiple operations', async () => {
      // First add some experience
      const addResponse = await request(app)
        .patch('/api/v1/user/update-experience-info')
        .set('Authorization', `Bearer ${authToken}`)
        .field(
          'professionalBackground',
          JSON.stringify({
            role: 'Initial Role',
            companyName: 'Initial Company'
          })
        )
        .attach('experienceLetter', Buffer.from('initial exp'), 'initial.pdf')
        .expect(200);

      expect(addResponse.body.success).toBe(true);

      // Then update it
      const updateResponse = await request(app)
        .patch('/api/v1/user/update-experience-info')
        .set('Authorization', `Bearer ${authToken}`)
        .field(
          'professionalBackground',
          JSON.stringify({
            role: 'Updated Role',
            companyName: 'Updated Company'
          })
        )
        .attach('certificate', Buffer.from('updated cert'), 'updated.pdf')
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
    });
  });
});
