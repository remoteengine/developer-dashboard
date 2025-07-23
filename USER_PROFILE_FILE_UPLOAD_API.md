# User Profile File Upload API Documentation

## Overview

This documentation describes the user profile APIs that support file uploads for personal information, professional experience, and educational background. All APIs support both single and multiple entry operations with associated document uploads.

## Base URL

```
/api/v1/user/
```

## Authentication

All endpoints require a JWT Bearer token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📄 Personal Information API

### Endpoint: `PATCH /update-personal-info-with-files`

**Content-Type:** `multipart/form-data`

**Supported Files:**
- `uaid` - UAID document (PDF, DOC, DOCX, Images)
- `panCard` - PAN Card document (PDF, DOC, DOCX, Images)
- `profilePicture` - Profile picture (Images)

**Payload Example:**
```bash
-F "uaid=@/path/to/uaid.pdf"
-F "panCard=@/path/to/pan.pdf"
-F "profilePicture=@/path/to/profile.jpg"
-F "bankDetails={\"accountNumber\":123456789012,\"ifsc\":\"HDFC0001234\"}"
-F "address={\"address\":\"456 Oak Avenue\",\"city\":\"Los Angeles\"}"
```

---

## 💼 Professional Experience APIs

### Endpoint: `PATCH /update-experience-info`

**Content-Type:** `multipart/form-data`

**Supported Files:**
- `experienceLetter` / `experienceLetter_0`, `experienceLetter_1`, ...
- `relievingLetter` / `relievingLetter_0`, ...
- `certificate` / `certificate_0`, ...
- `paySlip` / `paySlip_0`, ...
- `appointmentLetter` / `appointmentLetter_0`, ...

**Operations Supported:**

#### 1. Add/Update Single Experience

```bash
-F "professionalBackground={\"role\":\"Developer\",\"companyName\":\"Acme Corp\",\"startDate\":\"2020-01-01\",\"endDate\":\"2021-01-01\"}"
-F "experienceLetter=@/path/to/experience_letter.pdf"
-F "relievingLetter=@/path/to/relieving_letter.pdf"
-F "certificate=@/path/to/certificate.pdf"
-F "paySlip=@/path/to/payslip.pdf"
-F "appointmentLetter=@/path/to/appointment_letter.pdf"
```

#### 2. Add Multiple Experiences (Indexed Files)

```bash
-F "addMultipleExperiences=[{\"role\":\"Developer\",\"companyName\":\"Acme Corp\",\"startDate\":\"2020-01-01\",\"endDate\":\"2021-01-01\"}]"
-F "experienceLetter_0=@/path/to/experience_letter.pdf"
-F "relievingLetter_0=@/path/to/relieving_letter.pdf"
-F "certificate_0=@/path/to/certificate.pdf"
-F "paySlip_0=@/path/to/payslip.pdf"
-F "appointmentLetter_0=@/path/to/appointment_letter.pdf"
```

#### 3. Update Experience by ID

```bash
-F "updateExperienceById={\"role\":\"Lead Developer\"}"
-F "experienceId=EXPERIENCE_OBJECT_ID"
-F "paySlip=@/path/to/new_payslip.pdf"
```

#### 4. Update Multiple Experiences

```bash
-F "updateMultipleExperiences=[{\"experienceId\":\"ID1\",\"role\":\"Lead\"},{\"experienceId\":\"ID2\",\"role\":\"Manager\"}]"
-F "appointmentLetter_0=@/path/to/appointment1.pdf"
-F "appointmentLetter_1=@/path/to/appointment2.pdf"
```

---

## 🎓 Educational Background APIs

### Endpoint: `PATCH /update-education-info-with-files`

**Content-Type:** `multipart/form-data`

**Supported Files:**
- `certificate` / `certificate_0`, `certificate_1`, ...

**Operations Supported:**

#### 1. Add/Update Single Education

```bash
-F "educationalBackground={\"degree\":\"B.Tech\",\"fieldOfStudy\":\"CS\",\"institute\":\"IIT\"}"
-F "certificate=@/path/to/degree.pdf"
```

#### 2. Add Multiple Educations (Indexed Files)

```bash
-F "addMultipleEducations=[{\"degree\":\"B.Tech\",\"fieldOfStudy\":\"CS\"},{\"degree\":\"M.Tech\",\"fieldOfStudy\":\"AI\"}]"
-F "certificate_0=@/path/to/btech.pdf"
-F "certificate_1=@/path/to/mtech.pdf"
```

#### 3. Update Education by ID

```bash
-F "updateEducationById={\"degree\":\"PhD\"}"
-F "educationId=EDUCATION_OBJECT_ID"
-F "certificate=@/path/to/phd.pdf"
```

---

## 📁 File Upload Specifications

- **Supported File Types:** PDF, DOC, DOCX, JPEG, JPG, PNG, GIF
- **Max File Size:** 5MB per file
- **Max Files per Request:** 10

**File Naming Convention:**
- For single entry: use field name (e.g., `certificate`)
- For multiple entries: use indexed field name (e.g., `certificate_0`, `paySlip_1`)

---

## 📤 Response Format

### Success

```json
{
  "success": true,
  "message": "Experience information with files updated successfully",
  "data": {
    "professionalBackground": [...],
    // or "educationalBackground": [...]
  }
}
```

### Error

```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Detailed error information"],
  "status": "error",
  "status_code": 400
}
```

---

## ⚡️ Quick Reference

| Endpoint                                 | Files Supported                                                                 | Operations                                          |
| ----------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------- |
| `/update-personal-info-with-files`        | uaid, panCard, profilePicture                                                   | Update personal info with documents                 |
| `/update-experience-info`                 | experienceLetter, relievingLetter, certificate, paySlip, appointmentLetter      | Add/update single/multiple, remove                  |
| `/update-education-info-with-files`       | certificate                                                                    | Add/update single/multiple, remove                  |

---

## 📝 Example cURL

```bash
curl -X PATCH http://localhost:3000/api/v1/user/update-experience-info \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "addMultipleExperiences=[{\"role\":\"Developer\",\"companyName\":\"Acme Corp\",\"startDate\":\"2020-01-01\",\"endDate\":\"2021-01-01\"}]" \
  -F "experienceLetter_0=@/path/to/experience_letter.pdf" \
  -F "relievingLetter_0=@/path/to/relieving_letter.pdf" \
  -F "certificate_0=@/path/to/certificate.pdf" \
  -F "paySlip_0=@/path/to/payslip.pdf" \
  -F "appointmentLetter_0=@/path/to/appointment_letter.pdf"
```

---

**Notes:**
- All array/object fields must be sent as JSON strings.
- For multiple entries, file indexes must match the array order.
- If file upload fails, the entire operation fails.
- All files are stored in S3 under organized folders.
