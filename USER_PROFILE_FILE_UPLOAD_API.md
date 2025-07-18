# User Profile File Upload API Documentation

## Overview

This documentation covers the enhanced user profile APIs that support file uploads for personal information, professional experience, and educational background. All APIs support both single and multiple entry operations with associated document uploads.

## Base URL
```
/api/v1/user/
```

## Authentication
All endpoints require JWT Bearer token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## ✨ Response Behavior
- **Experience APIs**: Return only `professionalBackground` data (not full user profile)
- **Education APIs**: Return only `educationalBackground` data (not full user profile)  
- **Personal Info API**: Returns updated personal fields with file URLs
- **Uploaded Files**: Always included in response as `uploadedFiles` object

## 🎯 Single Object Creation Using Array Syntax

**Yes, you can create a single object using the array syntax!**

Both `addMultipleExperiences` and `addMultipleEducations` accept arrays, but you can pass an array with just **one object** to create a single entry:

### Experience Example:
```javascript
// Single experience using array syntax
addMultipleExperiences: [{"role":"Junior Developer","companyName":"StartupCo","startDate":"2021-07-01","endDate":"2022-12-31","skills":{"JavaScript":"Beginner"},"isPresentCompany":false}]
experienceLetter_0: [FILE1]
relievingLetter_0: [FILE2]
```

### Education Example:
```javascript
// Single education using array syntax  
addMultipleEducations: [{"degree":"Bachelor of Technology","fieldOfStudy":"Computer Science","institutionName":"MIT","startDate":"2018-09-01","endDate":"2022-06-01","grade":"3.8"}]
certificate_0: [FILE1]
```

**Benefits of Array Syntax:**
- ✅ **Consistent API**: Same pattern for single and multiple operations
- ✅ **File Association**: Use indexed files (`_0`, `_1`) for precise file-to-entry mapping
- ✅ **Future-Proof**: Easy to extend to multiple entries later
- ✅ **Clear Intent**: Explicitly shows you're adding new entries vs updating existing ones

---

## 📄 Personal Information API

### Endpoint: `PATCH /update-personal-info-with-files`

**Content-Type:** `multipart/form-data`

**Supported Files:**
- `uaid` - UAID document (PDF, DOC, DOCX, Images)
- `panCard` - PAN Card document (PDF, DOC, DOCX, Images)
- `profilePicture` - Profile picture (Images)

**Payload Example:**
```javascript
// Form Data
uaid: [FILE]
panCard: [FILE]
profilePicture: [FILE]
bankDetails: {"accountNumber":123456789012,"ifsc":"HDFC0001234","branchName":"HDFC - MG Road","bankAccountProvider":"HDFC Bank"}
address: {"address":"456 Oak Avenue","city":"Los Angeles","state":"California","country":"United States","district":"NewYork","zipCode":"90210"}
```

---

## 💼 Professional Experience APIs

### Base Endpoint: `/update-experience-info` (without files)
### File Upload Endpoint: `PATCH /update-experience-info-with-files`

**Content-Type:** `multipart/form-data`

**Supported Files:**
- `experienceLetter` - Experience/Offer letter (PDF, DOC, DOCX, Images)
- `relievingLetter` - Relieving letter (PDF, DOC, DOCX, Images)  
- `certificate` - Work certificate (PDF, DOC, DOCX, Images)

**Indexed Files (for multiple operations):**
- `experienceLetter_0`, `experienceLetter_1`, `experienceLetter_2`, etc.
- `relievingLetter_0`, `relievingLetter_1`, `relievingLetter_2`, etc.
- `certificate_0`, `certificate_1`, `certificate_2`, etc.

### 1. Operations Supported

#### 1.1 Single Experience Entry (Add New)
```javascript
// Form Data
professionalBackground: {"designation":"Software Engineer","companyName":"TechCorp","startDate":"2023-01-01","skills":{"JavaScript":"Advanced"}}
experienceLetter: [FILE]
relievingLetter: [FILE]
certificate: [FILE]
```

#### 1.2 Add Multiple Experiences with Indexed Files
```javascript
// Form Data
addMultipleExperiences: [{"role":"Junior Developer","companyName":"StartupCo","startDate":"2021-07-01","endDate":"2022-12-31","skills":{"JavaScript":"Beginner"},"isPresentCompany":false}]
experienceLetter_0: [FILE1]
relievingLetter_0: [FILE2]
```

#### 1.3 Add Single Experience Using Array Syntax
```javascript
// Form Data  
addMultipleExperiences: [{"role":"Senior Developer","companyName":"TechCorp","startDate":"2023-01-01","skills":{"JavaScript":"Advanced","React":"Advanced"},"isPresentCompany":true}]
experienceLetter_0: [FILE1]
certificate_0: [FILE2]
```

#### 1.4 Update Multiple Experiences with Files
```javascript
// Form Data
updateMultipleExperiences: [{"experienceId":"60d5ec49f1b2c8b1f8e4e1a1","designation":"Lead Developer","salary":"80000"}]
experienceLetter_0: [NEW_FILE]
```

#### 1.5 Update Single Experience by ID
```javascript
// Form Data
updateExperienceById: {"designation":"Senior Software Engineer","salary":"75000"}
experienceId: "60d5ec49f1b2c8b1f8e4e1a1"
experienceLetter: [FILE]
```

### 2. Response Examples

#### 2.1 Single Experience Entry Response
```json
{
  "success": true,
  "message": "Experience information with files updated successfully",
  "data": {
    // Only updated professionalBackground data is returned
    "professionalBackground": [...],
    "uploadedFiles": {
      "experienceLetter": "https://s3-url/documents/experience/file.pdf",
      "relievingLetter": "https://s3-url/documents/relieving/file.pdf",
      "certificate": "https://s3-url/documents/certificates/file.pdf"
    }
  }
}
```

#### 2.2 Multiple Experience Entries Response  
```json
{
  "success": true,
  "message": "Experience information with files updated successfully",
  "data": {
    "professionalBackground": [
      {
        "_id": "60d5ec49f1b2c8b1f8e4e1a1",
        "role": "Junior Developer",
        "companyName": "StartupCo",
        "experienceLetter": "https://s3-url/documents/experience/file_0.pdf",
        "relievingLetter": "https://s3-url/documents/relieving/file_0.pdf"
      }
    ],
    "uploadedFiles": {
      "experienceLetter_0": "https://s3-url/documents/experience/file_0.pdf",
      "relievingLetter_0": "https://s3-url/documents/relieving/file_0.pdf"
    }
  }
}
```

---

## 🎓 Educational Background APIs

### Base Endpoint: `/update-education-info` (without files)
### File Upload Endpoint: `PATCH /update-education-info-with-files`

**Content-Type:** `multipart/form-data`

**Supported Files:**
- `certificate` - Education certificate (PDF, DOC, DOCX, Images)

**Indexed Files (for multiple operations):**
- `certificate_0`, `certificate_1`, `certificate_2`, etc.

### 1. Operations Supported

#### 1.1 Single Education Entry (Add New)
```javascript
// Form Data
educationalBackground: {"degree":"Bachelor of Technology","fieldOfStudy":"Computer Science","institutionName":"MIT","startDate":"2018-09-01","endDate":"2022-06-01","grade":"3.8"}
certificate: [FILE]
```

#### 1.2 Add Multiple Education Entries with Indexed Files
```javascript
// Form Data
addMultipleEducations: [{"degree":"Master of Science","fieldOfStudy":"Software Engineering","institutionName":"Stanford","startDate":"2022-09-01","endDate":"2024-06-01","grade":"3.9"}]
certificate_0: [FILE1]
```

#### 1.3 Add Single Education Using Array Syntax  
```javascript
// Form Data
addMultipleEducations: [{"degree":"Bachelor of Science","fieldOfStudy":"Computer Engineering","institutionName":"UC Berkeley","startDate":"2018-08-01","endDate":"2022-05-01","grade":"3.7"}]
certificate_0: [FILE1]
```

#### 1.4 Update Multiple Education Entries
```javascript
// Form Data
updateMultipleEducations: [{"educationId":"60d5ec49f1b2c8b1f8e4e1a1","grade":"4.0","gpa":"Summa Cum Laude"}]
certificate_0: [NEW_FILE]
```

#### 1.5 Update Single Education by ID
```javascript
// Form Data
updateEducationById: {"grade":"3.9","specialization":"Machine Learning"}
educationId: "60d5ec49f1b2c8b1f8e4e1a1"
certificate: [FILE]
```

### 2. Response Examples

#### 2.1 Single Education Entry Response
```json
{
  "success": true,
  "message": "Education information with files updated successfully",
  "data": {
    // Only updated educationalBackground data is returned
    "educationalBackground": [...],
    "uploadedFiles": {
      "certificate": "https://s3-url/documents/education-certificates/file.pdf"
    }
  }
}
```

#### 2.2 Multiple Education Entries Response
```json
{
  "success": true,
  "message": "Education information with files updated successfully",
  "data": {
    "educationalBackground": [
      {
        "_id": "60d5ec49f1b2c8b1f8e4e1a1",
        "degree": "Master of Science",
        "fieldOfStudy": "Software Engineering",
        "institutionName": "Stanford",
        "certificate": "https://s3-url/documents/education-certificates/file_0.pdf"
      }
    ],
    "uploadedFiles": {
      "certificate_0": "https://s3-url/documents/education-certificates/file_0.pdf"
    }
  }
}
```

---

## 📁 File Upload Specifications

### Supported File Types
- **Documents:** PDF, DOC, DOCX
- **Images:** JPEG, JPG, PNG, GIF

### File Size Limits
- **Maximum file size:** 5MB per file
- **Maximum files per request:** 10 files

### File Naming Convention

#### Single Entry Operations
- Use standard field names: `certificate`, `experienceLetter`, `relievingLetter`

#### Multiple Entry Operations
- Use indexed field names: `certificate_0`, `certificate_1`, `experienceLetter_0`, `relievingLetter_1`, etc.
- Index corresponds to array position (0-based)

### File Association Rules

| Entry Index | Certificate | Experience Letter | Relieving Letter |
|-------------|-------------|-------------------|------------------|
| 0 (First)   | `certificate_0` | `experienceLetter_0` | `relievingLetter_0` |
| 1 (Second)  | `certificate_1` | `experienceLetter_1` | `relievingLetter_1` |
| 2 (Third)   | `certificate_2` | `experienceLetter_2` | `relievingLetter_2` |

---

## 📤 Response Format

### Success Response
```javascript
{
  "success": true,
  "message": "Experience information with files updated successfully",
  "data": {
    // Only updated professionalBackground data is returned
    "professionalBackground": [...],
    "uploadedFiles": {
      "experienceLetter": "https://s3-url/documents/experience/file.pdf",
      "relievingLetter": "https://s3-url/documents/relieving/file.pdf",
      "certificate": "https://s3-url/documents/certificates/file.pdf"
    }
  }
}
```

### Error Response
```javascript
{
  "success": false,
  "message": "Error message",
  "errors": ["Detailed error information"],
  "status": "error",
  "status_code": 400
}
```

---

## 🔄 Complete API Summary

| Endpoint | Purpose | Files Supported | Operations |
|----------|---------|-----------------|------------|
| `/update-personal-info-with-files` | Personal documents | uaid, panCard, profilePicture | Update personal info with documents |
| `/update-experience-info-with-files` | Work experience | experienceLetter, relievingLetter, certificate | Add single/multiple, Update single/multiple, Remove |
| `/update-education-info-with-files` | Education history | certificate | Add single/multiple, Update single/multiple, Remove |

---

## 💡 Usage Examples

### JavaScript/Frontend Implementation

```javascript
// Example: Add multiple experiences with files
const formData = new FormData();

// Add files
formData.append('experienceLetter_0', firstJobOfferLetter);
formData.append('relievingLetter_0', firstJobRelievingLetter);
formData.append('certificate_1', secondJobCertificate);

// Add experience data
formData.append('addMultipleExperiences', JSON.stringify([
  {
    role: "Software Developer",
    companyName: "Tech Startup",
    startDate: "2021-01-01",
    endDate: "2022-12-31",
    skills: {"JavaScript": "Intermediate", "React": "Beginner"},
    isPresentCompany: false
  },
  {
    role: "Senior Developer", 
    companyName: "Tech Corp",
    startDate: "2023-01-01",
    endDate: null,
    skills: {"JavaScript": "Advanced", "React": "Advanced", "Node.js": "Intermediate"},
    isPresentCompany: true
  }
]));

// Send request
fetch('/api/v1/user/update-experience-info-with-files', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

### cURL Examples

```bash
# Add single education with certificate
curl -X PATCH \
  http://localhost:3000/api/v1/user/update-education-info-with-files \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -F 'certificate=@/path/to/degree.pdf' \
  -F 'educationalBackground={"degree":"Bachelor of Technology","fieldOfStudy":"Computer Science","institute":"IIT Delhi","startDate":"2017-07-01","endDate":"2021-06-30"}'

# Add multiple experiences with files
curl -X PATCH \
  http://localhost:3000/api/v1/user/update-experience-info-with-files \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -F 'experienceLetter_0=@/path/to/first_offer.pdf' \
  -F 'certificate_1=@/path/to/second_cert.pdf' \
  -F 'addMultipleExperiences=[{"role":"Developer","companyName":"StartupCo","startDate":"2021-01-01","endDate":"2022-12-31"},{"role":"Senior Developer","companyName":"TechCorp","startDate":"2023-01-01","isPresentCompany":true}]'
```

---

## ⚠️ Important Notes

1. **File Upload Order:** Files are processed before data, so validation happens after file upload middleware.

2. **JSON Parsing:** All complex data fields (arrays, objects) must be sent as JSON strings in form data.

3. **File Association:** For multiple entries, files are associated by index. Ensure file indexes match your data array positions.

4. **Error Handling:** If file upload fails, the entire operation fails. Ensure files meet size and type requirements.

5. **S3 Storage:** All files are stored in AWS S3 with organized folder structure:
   - Personal documents: `documents/uaid/`, `documents/pancard/`, `profiles/`
   - Experience documents: `documents/experience/`, `documents/relieving/`, `documents/certificates/`
   - Education documents: `documents/education-certificates/`

6. **Backward Compatibility:** All existing APIs without file upload continue to work unchanged.

---

## 🚀 Quick Reference

### Most Common Operations

**Add single experience with files:**
```
experienceLetter: [FILE] + relievingLetter: [FILE] + professionalBackground: {...}
```

**Add multiple education with certificates:**
```
certificate_0: [FILE] + certificate_1: [FILE] + addMultipleEducations: [{...}, {...}]
```

**Update existing entry with new file:**
```
certificate: [FILE] + experienceId: "ID" + professionalBackground: {...}
```

This documentation covers all file upload capabilities added to the user profile APIs. The system now supports comprehensive document management for professional and educational information. 