# Elyse Authentication API - Quick Test Guide

## Base URL
```
http://localhost:3001/api/v1
```

## Available Endpoints

### 1. Register New User
**POST** `/auth/register`

```json
{
  "email": "test@example.com",
  "password": "Test123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+91 9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "test@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+91 9876543210",
      "role": "customer",
      "email_verified": false
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "jwt-refresh-token"
    }
  }
}
```

### 2. Login
**POST** `/auth/login`

```json
{
  "email": "test@example.com",
  "password": "Test123!"
}
```

### 3. Get Current User (Protected)
**GET** `/auth/me`

Headers:
```
Authorization: Bearer {accessToken}
```

### 4. Update Profile (Protected)
**PUT** `/auth/profile`

Headers:
```
Authorization: Bearer {accessToken}
```

Body:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+91 9999999999"
}
```

### 5. Change Password (Protected)
**POST** `/auth/change-password`

Headers:
```
Authorization: Bearer {accessToken}
```

Body:
```json
{
  "currentPassword": "Test123!",
  "newPassword": "NewTest456!"
}
```

### 6. Forgot Password
**POST** `/auth/forgot-password`

```json
{
  "email": "test@example.com"
}
```

### 7. Reset Password  
**POST** `/auth/reset-password`

```json
{
  "token": "reset-token-from-email",
  "password": "NewPassword123!"
}
```

### 8. Refresh Token
**POST** `/auth/refresh`

```json
{
  "refreshToken": "your-refresh-token"
}
```

### 9. Logout (Protected)
**POST** `/auth/logout`

Headers:
```
Authorization: Bearer {accessToken}
```

## Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

## Security Features
- ✅ Bcrypt password hashing (12 rounds)
- ✅ JWT access tokens (15 min expiry)
- ✅ JWT refresh tokens (7 days expiry)
- ✅ Account lockout after 5 failed attempts (30 min)
- ✅ Rate limiting on auth endpoints
- ✅ SQL injection protection
- ✅ XSS protection
- ✅ CORS enabled
- ✅ Request logging

## Testing with cURL

### Register:
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Test123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Test123!"
  }'
```

### Get Profile (use token from login):
```bash
curl -X GET http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Next Steps
1. Test registration and login
2. Save the access token
3. Use token to access protected endpoints
4. Build frontend integration
5. Add email verification (optional)
6. Set up production JWT secrets

## Admin User (Pre-seeded)
```
Email: admin@elyse.com
Password: admin123 (⚠️ CHANGE IN PRODUCTION!)
Role: admin
```
