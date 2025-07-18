# File Upload API Tests

This directory contains comprehensive test suites for the education and experience file upload APIs.

## Test Structure

### Integration Tests (`integration/userFileUpload.test.js`)
- Tests actual HTTP endpoints with file uploads
- Covers success and error scenarios
- Tests authentication and authorization
- Validates file type restrictions
- Tests concurrent operations

### Unit Tests (`unit/userFileUploadService.test.js`)
- Tests service functions directly
- Mocks S3 uploads and database operations
- Covers edge cases and error handling
- Tests file processing logic

## Running Tests

### Run All File Upload Tests
```bash
npm test -- tests/integration/userFileUpload.test.js tests/unit/userFileUploadService.test.js
```

### Run Integration Tests Only
```bash
npm test -- tests/integration/userFileUpload.test.js
```

### Run Unit Tests Only
```bash
npm test -- tests/unit/userFileUploadService.test.js
```

### Run Using Test Runner Script
```bash
node tests/runFileUploadTests.js
```

## Test Coverage

### Experience API (`/api/v1/user/update-experience-info`)

**Success Scenarios:**
- ✅ Upload single experience with files (experienceLetter, relievingLetter, certificate)
- ✅ Add multiple experiences with indexed files (`experienceLetter_0`, `certificate_1`, etc.)
- ✅ Update existing experience by ID with new files
- ✅ Handle experience upload without files
- ✅ Process `addMultipleExperiences` with indexed file associations

**Error Scenarios:**
- ✅ Unauthorized access (401)
- ✅ Invalid JSON in form data (400)
- ✅ File upload errors and size limits
- ✅ Non-existent experience ID updates
- ✅ Invalid file types
- ✅ S3 upload failures

### Education API (`/api/v1/user/update-education-info`)

**Success Scenarios:**
- ✅ Upload single education with certificate
- ✅ Add multiple educations with indexed certificates (`certificate_0`, `certificate_1`)
- ✅ Update existing education by ID with new certificate
- ✅ Handle education upload without files
- ✅ Process `addMultipleEducations` with single entry (your specific test case)

**Error Scenarios:**
- ✅ Unauthorized access (401)
- ✅ Invalid JSON in form data (400)
- ✅ File upload errors
- ✅ Non-existent education ID updates
- ✅ Invalid file types
- ✅ S3 upload failures

## File Upload Test Cases

### Supported File Types
- PDF documents
- Image files (JPG, PNG, GIF)
- Word documents (DOC, DOCX)

### File Size Limits
- Maximum 5MB per file
- Maximum 10 files total per request

### File Organization in S3
```
bucket/
├── documents/
│   ├── experience/           # Experience letters
│   ├── relieving/           # Relieving letters
│   ├── certificates/        # Work certificates
│   └── education-certificates/ # Education certificates
```

## Test Data Examples

### Experience Payload
```javascript
{
  "addMultipleExperiences": [
    {
      "role": "Software Engineer",
      "companyName": "TechCorp",
      "startDate": "2022-01-01",
      "endDate": "2023-12-31",
      "skills": { "JavaScript": "Advanced" },
      "isPresentCompany": false
    }
  ]
}
```

### Education Payload (Your Test Case)
```javascript
{
  "addMultipleEducations": [
    {
      "degree": "High School",
      "fieldOfStudy": "Science",
      "institute": "ABC High School",
      "startDate": "2015-06-01",
      "endDate": "2017-05-31"
    }
  ]
}
```

### Files
```
certificate_0: [PDF_FILE]
experienceLetter_0: [PDF_FILE]
relievingLetter_0: [PDF_FILE]
```

## Expected Responses

### Success Response
```javascript
{
  "success": true,
  "message": "Education information with files updated successfully",
  "data": {
    "educationalBackground": [...],
    "uploadedFiles": {
      "certificate": "https://s3-url/certificate.pdf"
    }
  }
}
```

### Error Response
```javascript
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error information"]
}
```

## Debugging File Upload Issues

If files aren't uploading or URLs aren't saving:

1. **Check Console Logs**: Service functions log upload attempts
2. **Verify AWS Config**: Ensure S3 credentials are correct
3. **Check File Size**: Files over 5MB will be rejected
4. **Verify File Types**: Only allowed MIME types are accepted
5. **Test Service Functions**: Run unit tests to isolate issues

## Mocking in Tests

The unit tests mock:
- `uploadFileToS3` function to avoid actual S3 uploads
- Database operations to avoid real database changes
- JWT token verification for authentication

## Notes

- Tests use Buffer.from() to simulate file uploads
- Mock S3 responses return test URLs
- Database operations are mocked to return expected data structures
- All tests clean up after themselves to avoid side effects 