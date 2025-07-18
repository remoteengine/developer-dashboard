# Updated Registration Behavior Test

## ✅ NEW BEHAVIOR: Users Stored in MongoDB Immediately

## Scenario 1: User Registers but DOESN'T Verify OTP

### Step 1: Register
```bash
POST /api/v1/auth/register/email
{
  "email": "test@example.com",
  "firstName": "John",
  "lastName": "Doe", 
  "password": "SecurePass123!"
}
```

**Result:**
- ✅ User stored in MongoDB: `{ email: "test@example.com", isVerified: false }`
- ✅ OTP stored in Redis: `otp:register:test@example.com` (10 min TTL)
- ✅ OTP sent via email

### Step 2: Check Database
```javascript
// MongoDB Query
db.users.find({ email: "test@example.com" })
// Result: { 
//   _id: ObjectId("..."),
//   email: "test@example.com",
//   firstName: "John",
//   lastName: "Doe",
//   isVerified: false,  // ← User exists but UNVERIFIED
//   createdAt: "2023-06-25T10:30:00.000Z"
// }
```

### Step 3: Try to Login (Should Fail)
```bash
POST /api/v1/auth/login/email
{
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```

**Result:**
- ❌ Login fails (user not verified)
- 🔒 User cannot access the system

### Step 4: Wait 10 Minutes (OTP Expires)
```javascript
// Redis Check
REDIS> GET otp:register:test@example.com
// Result: (nil) - OTP expired

// MongoDB Check  
db.users.find({ email: "test@example.com" })
// Result: User still exists but isVerified: false
```

**Final State After Registration Only:**
- ✅ User exists in MongoDB (unverified)
- ❌ Cannot login or access system
- ❌ OTP expired - needs new OTP to verify

---

## Scenario 2: User Registers and VERIFIES OTP

### Step 1: Register (same as above)
- ✅ User in MongoDB with `isVerified: false`

### Step 2: Verify OTP
```bash
POST /api/v1/auth/verify-email
{
  "email": "test@example.com",
  "otp": "123456"
}
```

**Result:**
- ✅ User's `isVerified` status updated to `true` in MongoDB
- ✅ OTP data deleted from Redis
- ✅ Welcome email sent
- ✅ JWT tokens returned for immediate login

### Step 3: Check Database
```javascript
// MongoDB Query
db.users.find({ email: "test@example.com" })
// Result: { 
//   _id: ObjectId("..."),
//   email: "test@example.com", 
//   firstName: "John",
//   lastName: "Doe",
//   isVerified: true,  // ← NOW VERIFIED!
//   createdAt: "2023-06-25T10:30:00.000Z"
// }
```

**Final State:**
- ✅ User verified and can login
- ✅ Full system access granted
- ✅ Welcome email sent

---

## Scenario 3: User Registers Twice (Duplicate Email)

### Step 1: First Registration
- ✅ User created with `isVerified: false`

### Step 2: Try to Register Again (Before Verification)
```bash
POST /api/v1/auth/register/email
{
  "email": "test@example.com",  // Same email
  "firstName": "John",
  "lastName": "Doe",
  "password": "SecurePass123!"
}
```

**Result:**
- ✅ No duplicate user created
- ✅ New OTP sent to existing unverified user
- ✅ Response: "User already registered but not verified. OTP sent again."

### Step 3: Try to Register After Verification
```bash
POST /api/v1/auth/register/email
{
  "email": "test@example.com",  // Same email (verified user)
  "firstName": "Jane",
  "lastName": "Smith", 
  "password": "DifferentPass456!"
}
```

**Result:**
- ❌ Registration rejected
- ❌ Error: "User already exists with this email"

---

## Admin Management Scenarios

### Check Unverified Users
```bash
GET /api/v1/auth/admin/unverified-users
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "60d5ecb54f8db2001c8b4567",
        "email": "unverified1@example.com",
        "firstName": "John",
        "lastName": "Doe", 
        "createdAt": "2023-06-25T10:30:00.000Z"
      }
    ],
    "count": 1
  }
}
```

### Cleanup Old Unverified Users
```bash
DELETE /api/v1/auth/admin/cleanup-unverified?hours=24
```

**Result:**
- ✅ Removes unverified users older than 24 hours
- ✅ Returns count of deleted users
- 🧹 Keeps database clean

---

## Key Benefits of New Approach

1. **Database Consistency**: All user data in one place (MongoDB)
2. **Simple State Management**: Single `isVerified` flag controls access
3. **Admin Visibility**: Can see and manage unverified users
4. **Flexible Cleanup**: Automated removal of old unverified accounts
5. **No Data Loss**: User data persists even if OTP expires (can resend)
6. **Duplicate Prevention**: Smart handling of duplicate registrations

## Database States Summary

| User State | In Database | isVerified | Can Login | Actions Available |
|------------|-------------|------------|-----------|------------------|
| **Not Registered** | ❌ No | N/A | ❌ No | Register |
| **Registered, Unverified** | ✅ Yes | `false` | ❌ No | Verify OTP, Resend OTP |
| **Registered, Verified** | ✅ Yes | `true` | ✅ Yes | Login, Full Access |
| **Old Unverified** | ❌ Cleaned up | N/A | ❌ No | Register Again |

## Redis Usage (Simplified)

- **Only for OTP storage** (10 min TTL)
- **No user data in Redis** 
- **Automatic OTP cleanup**
- **No manual Redis management needed** 