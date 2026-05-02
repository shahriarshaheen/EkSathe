# EkSathe Auth v1 API Plan

## Scope

This document defines the Authentication v1 API for EkSathe. It covers registration, email OTP verification, login, logout, forgot password, reset password, and current-user lookup.

---

## Roles

- `student`
- `homeowner`
- `admin`

## Account Status Values

- `pending_verification`
- `active`
- `suspended`

## Global Security Rules

- Passwords must be hashed with bcrypt before storing.
- JWT is required for protected routes.
- OTP expires in 1 hour.
- Password reset token expires in 1 hour.
- Secrets must be stored in environment variables.
- Unverified users cannot access protected features.
- Suspended users cannot log in.

## Auth v1 Excludes

- Social login
- Two-factor authentication
- Refresh tokens
- Remember me
- Device/session management
- CAPTCHA

---

## 1) POST /api/auth/register

### Purpose

Create a new user account and send an email OTP for verification.

### Request Body

```json
{
  "name": "Rahim Ahmed",
  "email": "rahim@du.ac.bd",
  "phone": "017XXXXXXXX",
  "password": "Password123",
  "role": "student",
  "studentId": "2021-1-60-001",
  "gender": "male",
  "photoUrl": ""
}
```
