# Email Registration with OTP Verification API

## Overview

The email registration system uses OTP (One-Time Password) verification with background email processing using AWS SES. **User data is immediately stored in MongoDB during registration but marked as `isVerified: false` until email verification is complete.**

## Updated Registration Flow

1. **Registration** → User data stored in MongoDB with `isVerified: false` + OTP sent
2. **OTP Verification** → User's `isVerified` status updated to `true` + Welcome email sent
3. **Unverified Users** → Can be cleaned up automatically after specified time

## Authentication Endpoints

### 1. Email Registration
**POST** `/api/v1/auth/register/email`

Creates user account immediately in MongoDB (unverified) and sends OTP via email.

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "SecurePassword123!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Registration initiated. Please check your email for OTP.",
  "data": {
    "email": "user@example.com",
    "message": "OTP sent successfully. Please check your email.",
    "userId": "60d5ecb54f8db2001c8b4567",
    "otp": "123456"  // Only in development mode
  }
}
```

**Response (User Exists - Unverified):**
```json
{
  "success": true,
  "message": "Registration initiated. Please check your email for OTP.",
  "data": {
    "email": "user@example.com",
    "message": "User already registered but not verified. OTP sent again.",
    "otp": "123456"  // Only in development mode
  }
}
```

### 2. Email Verification
**POST** `/api/v1/auth/verify-email`

Verifies the OTP and updates user's verification status. Sends welcome email in the background.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "_id": "60d5ecb54f8db2001c8b4567",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "userType": "developer",
      "isVerified": true,
      "loginBy": "email"
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "...",
      "tokenType": "Bearer",
      "expiresIn": "15m"
    }
  }
}
```

### 3. Resend OTP
**POST** `/api/v1/auth/resend-otp`

Resends OTP for existing unverified users.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP resent successfully",
  "data": {
    "email": "user@example.com",
    "message": "OTP sent successfully. Please check your email.",
    "otp": "654321"  // Only in development mode
  }
}
```

## Admin Endpoints

### 4. Get Unverified Users
**GET** `/api/v1/auth/admin/unverified-users`

Returns list of all unverified users (for admin monitoring).

**Response:**
```json
{
  "success": true,
  "message": "Unverified users fetched successfully",
  "data": {
    "success": true,
    "users": [
      {
        "_id": "60d5ecb54f8db2001c8b4567",
        "email": "user1@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "createdAt": "2023-06-25T10:30:00.000Z"
      }
    ],
    "count": 1
  }
}
```

### 5. Cleanup Unverified Users
**DELETE** `/api/v1/auth/admin/cleanup-unverified?hours=24`

Removes unverified users older than specified hours (default: 24 hours).

**Query Parameters:**
- `hours` (optional): Number of hours after which to delete unverified users (default: 24)

**Response:**
```json
{
  "success": true,
  "message": "Cleaned up 5 unverified users older than 24 hours",
  "data": {
    "success": true,
    "deletedCount": 5,
    "message": "Cleaned up 5 unverified users older than 24 hours"
  }
}
```

## Updated System Architecture

### MongoDB Storage
- **User Collection**: All users stored immediately with `isVerified` field
  - `isVerified: false` - User registered but not verified
  - `isVerified: true` - User verified and active

### Redis Storage (OTP Only)
- **OTP Data**: `otp:register:{email}` (10 minutes TTL)
- **Attempt Tracking**: `otp_attempts:register:{email}` (10 minutes TTL)

### Background Email Processing
- Emails are processed in a background queue to prevent blocking the main thread
- Supports retry logic with exponential backoff
- Simulated AWS SES integration (ready for production implementation)

## Updated User Registration States

| State | Database Record | isVerified | Can Login | Notes |
|-------|----------------|------------|-----------|-------|
| **Registered** | ✅ Present | `false` | ❌ No | OTP pending |
| **Verified** | ✅ Present | `true` | ✅ Yes | Full access |
| **Expired** | ✅ Present | `false` | ❌ No | Can be cleaned up |

## Error Handling

**Registration with verified email:**
```json
{
  "success": false,
  "message": "User already exists with this email",
  "statusCode": 400
}
```

**OTP verification for already verified user:**
```json
{
  "success": false,
  "message": "User is already verified.",
  "statusCode": 400
}
```

**Resend OTP for non-existent user:**
```json
{
  "success": false,
  "message": "User not found. Please register first.",
  "statusCode": 400
}
```

## Security Features
- Users stored in database immediately but cannot login until verified
- OTP expires in 10 minutes
- Maximum 3 verification attempts per OTP
- Strong password validation
- Input sanitization and validation
- Admin cleanup prevents database bloat from unverified accounts

## Production Considerations
- Set up automated cleanup job for unverified users (recommended: daily)
- Monitor unverified user count to detect issues
- Consider rate limiting registration attempts per IP
- Implement proper admin authentication for cleanup endpoints
- Set up alerts for high unverified user counts 