# File Upload API Guide

## Overview

This API allows you to upload files (PAN card, UAID, profile picture) along with personal information using multipart/form-data. Files are automatically uploaded to AWS S3 and the URLs are saved to the database.

## Endpoint

**PATCH** `/api/v1/user/update-personal-info-with-files`

## Headers

```
Authorization: Bearer <your-jwt-token>
Content-Type: multipart/form-data
```

## Request Format

### Form Data Fields

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `phoneNumber` | text | No | User's phone number |
| `uaid` | file | No | UAID document (PDF, DOC, DOCX, JPG, PNG) |
| `panCard` | file | No | PAN card document (PDF, DOC, DOCX, JPG, PNG) |
| `profilePicture` | file | No | Profile picture (JPG, PNG, GIF) |
| `bankDetails` | text (JSON) | No | Bank details as JSON string |
| `address` | text (JSON) | No | Address details as JSON string |

### Supported File Types

- **Documents (uaid, panCard)**: PDF, DOC, DOCX, JPG, PNG
- **Images (profilePicture)**: JPG, PNG, GIF
- **Maximum file size**: 5MB per file
- **Maximum files**: 10 files total

## Example Usage

### JavaScript/Fetch Example

```javascript
const formData = new FormData();

// Add text fields
formData.append('phoneNumber', '+919876543210');

// Add JSON data as strings
formData.append('bankDetails', JSON.stringify({
  accountNumber: 123456789012,
  ifsc: "HDFC0001234",
  branchName: "HDFC - MG Road",
  bankAccountProvider: "HDFC Bank"
}));

formData.append('address', JSON.stringify({
  address: "456 Oak Avenue",
  city: "Los Angeles",
  state: "California",
  country: "United States",
  district: "NewYork",
  zipCode: "90210"
}));

// Add files
const uaidFile = document.getElementById('uaidFile').files[0];
const panCardFile = document.getElementById('panCardFile').files[0];
const profilePictureFile = document.getElementById('profilePictureFile').files[0];

if (uaidFile) formData.append('uaid', uaidFile);
if (panCardFile) formData.append('panCard', panCardFile);
if (profilePictureFile) formData.append('profilePicture', profilePictureFile);

// Make the request
fetch('/api/v1/user/update-personal-info-with-files', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer your-jwt-token-here'
    // Note: Don't set Content-Type header, let browser set it automatically for multipart/form-data
  },
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log('Success:', data);
})
.catch(error => {
  console.error('Error:', error);
});
```

### cURL Example

```bash
curl -X PATCH \
  http://localhost:3000/api/v1/user/update-personal-info-with-files \
  -H "Authorization: Bearer your-jwt-token-here" \
  -F "phoneNumber=+919876543210" \
  -F "bankDetails={\"accountNumber\":123456789012,\"ifsc\":\"HDFC0001234\",\"branchName\":\"HDFC - MG Road\",\"bankAccountProvider\":\"HDFC Bank\"}" \
  -F "address={\"address\":\"456 Oak Avenue\",\"city\":\"Los Angeles\",\"state\":\"California\",\"country\":\"United States\",\"district\":\"NewYork\",\"zipCode\":\"90210\"}" \
  -F "uaid=@/path/to/uaid.pdf" \
  -F "panCard=@/path/to/pancard.pdf" \
  -F "profilePicture=@/path/to/profile.jpg"
```

### Postman Setup

1. **Method**: PATCH
2. **URL**: `http://localhost:3000/api/v1/user/update-personal-info-with-files`
3. **Headers**:
   - `Authorization: Bearer your-jwt-token-here`
4. **Body**: 
   - Select "form-data"
   - Add text fields: `phoneNumber`, `bankDetails`, `address`
   - Add file fields: `uaid`, `panCard`, `profilePicture`

## Success Response

```json
{
  "success": true,
  "message": "Personal information with files updated successfully",
  "data": {
    "id": "64fa2c7b2b342c9f77f0c1e5",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "userType": "developer",
    "phoneNumber": "+919876543210",
    "uaid": "https://your-bucket.s3.amazonaws.com/documents/uaid/64fa2c7b2b342c9f77f0c1e5/uaid_1703234567890.pdf",
    "panCard": "https://your-bucket.s3.amazonaws.com/documents/pancard/64fa2c7b2b342c9f77f0c1e5/pancard_1703234567891.pdf",
    "profilePicture": "https://your-bucket.s3.amazonaws.com/profiles/64fa2c7b2b342c9f77f0c1e5/profile_1703234567892.jpg",
    "bankDetails": {
      "accountNumber": 123456789012,
      "ifsc": "HDFC0001234",
      "branchName": "HDFC - MG Road",
      "bankAccountProvider": "HDFC Bank"
    },
    "address": {
      "address": "456 Oak Avenue",
      "city": "Los Angeles",
      "state": "California",
      "country": "United States",
      "district": "NewYork",
      "zipCode": "90210"
    },
    "uploadedFiles": {
      "uaid": "https://your-bucket.s3.amazonaws.com/documents/uaid/64fa2c7b2b342c9f77f0c1e5/uaid_1703234567890.pdf",
      "panCard": "https://your-bucket.s3.amazonaws.com/documents/pancard/64fa2c7b2b342c9f77f0c1e5/pancard_1703234567891.pdf",
      "profilePicture": "https://your-bucket.s3.amazonaws.com/profiles/64fa2c7b2b342c9f77f0c1e5/profile_1703234567892.jpg"
    },
    "createdAt": "2023-12-22T10:30:00.000Z",
    "updatedAt": "2023-12-22T10:30:00.000Z"
  }
}
```

## Error Responses

### Validation Error

```json
{
  "success": false,
  "message": "File too large. Maximum size allowed is 5MB.",
  "error": "FILE_TOO_LARGE"
}
```

### Invalid File Type

```json
{
  "success": false,
  "message": "Invalid file type. Allowed types: application/pdf, image/jpeg, image/jpg, image/png",
  "error": "INVALID_FILE_TYPE"
}
```

### Missing Authentication

```json
{
  "success": false,
  "message": "Access token is required",
  "code": "INVALID_TOKEN"
}
```

## File Storage Structure

Files are stored in S3 with the following structure:

```
your-bucket/
├── documents/
│   ├── uaid/
│   │   └── {userId}/
│   │       └── uaid_{timestamp}.{extension}
│   └── pancard/
│       └── {userId}/
│           └── pancard_{timestamp}.{extension}
└── profiles/
    └── {userId}/
        └── profile_{timestamp}.{extension}
```

## Important Notes

1. **File URLs**: All uploaded files return S3 URLs that can be used to access the files
2. **Security**: Files are stored as private in S3 by default
3. **Validation**: Files are validated for type and size before upload
4. **Unique Names**: File names are made unique using timestamps to prevent conflicts
5. **JSON Fields**: `bankDetails` and `address` must be valid JSON strings when sent as form data
6. **Optional Fields**: All fields are optional - you can upload only the files you need
7. **Overwrite**: Uploading a new file for the same field will update the URL in the database

## Frontend Integration Tips

### React Example

```jsx
import React, { useState } from 'react';

const PersonalInfoForm = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    bankDetails: {
      accountNumber: '',
      ifsc: '',
      branchName: '',
      bankAccountProvider: ''
    },
    address: {
      address: '',
      city: '',
      state: '',
      country: '',
      district: '',
      zipCode: ''
    }
  });
  const [files, setFiles] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = new FormData();
    
    // Add text data
    submitData.append('phoneNumber', formData.phoneNumber);
    submitData.append('bankDetails', JSON.stringify(formData.bankDetails));
    submitData.append('address', JSON.stringify(formData.address));
    
    // Add files
    Object.keys(files).forEach(key => {
      if (files[key]) {
        submitData.append(key, files[key]);
      }
    });
    
    try {
      const response = await fetch('/api/v1/user/update-personal-info-with-files', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitData
      });
      
      const result = await response.json();
      console.log('Success:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <input
        type="text"
        placeholder="Phone Number"
        value={formData.phoneNumber}
        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
      />
      
      <input
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={(e) => setFiles({...files, uaid: e.target.files[0]})}
      />
      
      <input
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={(e) => setFiles({...files, panCard: e.target.files[0]})}
      />
      
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.gif"
        onChange={(e) => setFiles({...files, profilePicture: e.target.files[0]})}
      />
      
      <button type="submit">Update Profile</button>
    </form>
  );
};
```

## Environment Variables Required

Make sure these AWS environment variables are set:

```env
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_SES_REGION=your-aws-region (e.g., ap-south-1)
AWS_BUCKET_NAME=remoteengineprod
```

## Bucket Name Configuration

Your S3 bucket name `remoteengineprod` should be set in your environment variables. The files will be stored in this bucket with the following structure:

```
remoteengineprod/
├── documents/
│   ├── uaid/
│   │   └── {userId}/
│   │       └── uaid_{timestamp}.{extension}
│   └── pancard/
│       └── {userId}/
│           └── pancard_{timestamp}.{extension}
└── profiles/
    └── {userId}/
        └── profile_{timestamp}.{extension}
``` 