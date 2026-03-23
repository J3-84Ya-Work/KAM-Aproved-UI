# Auth API Documentation

## Overview

All auth flows use a **server-side proxy pattern** — the browser never talks to the C# backend directly.
Company credentials are stored in an HttpOnly cookie (`__cc`) set during company validation and read
server-side on every subsequent request.

---

## Step 0 — Company Validation (all flows start here)

**`POST /api/auth/validate-company`**

Browser sends the 6-digit company code. Server calls the C# backend, gets company `username/password`,
and stores them in an HttpOnly cookie `__cc` (base64url encoded, 10 min TTL). Nothing sensitive is
returned to the browser.

| Field | Type | Notes |
|-------|------|-------|
| `companyCode` | `string` | 6 characters |

**C# backend called:** `GET /api/auth/validatecompany/{companyCode}`

---

## Flow A — Forgot Password (OTP via Email)

**`POST /api/auth/forgot-password-otp`**

Three actions, same endpoint:

### 1. `action: 'generate'` — Request OTP

Calls C# to generate an OTP and email it to the user. The email is sent by the C# backend directly (not Next.js).

| Field | Type |
|-------|------|
| `action` | `'generate'` |
| `email` | `string` |

**C# backend called:** `POST /api/CommanApis/generate-otp`
```json
{ "Email": "...", "IPAddress": "Server", "UserAgent": "..." }
```

### 2. `action: 'validate'` — Verify OTP

| Field | Type |
|-------|------|
| `action` | `'validate'` |
| `email` | `string` |
| `otpCode` | `string` |

**C# backend called:** `POST /api/CommanApis/validate-otp`
```json
{ "Email": "...", "OTPCode": "..." }
```

### 3. `action: 'reset'` — Set New Password

| Field | Type |
|-------|------|
| `action` | `'reset'` |
| `email` | `string` |
| `otpCode` | `string` |
| `newPassword` | `string` |

**C# backend called:** `POST /api/CommanApis/reset-password`
```json
{ "Email": "...", "OTPCode": "...", "NewPassword": "..." }
```

---

## Flow B — Password Reset Email (Next.js sends the email)

**`POST /api/auth/send-password-reset-email`**

Used when Next.js itself sends the OTP email (not the C# backend). Uses nodemailer with either
Gmail (`user/pass`) or Microsoft 365 (OAuth2) based on `.env` config.

| Field | Type |
|-------|------|
| `email` | `string` — recipient |
| `otp` | `string` |
| `userName` | `string` |
| `companyName` | `string` |

**No C# backend call** — sends directly via SMTP using `SYSTEM_EMAIL_*` env vars.

### Switching email provider — `.env` only, no code changes

**Gmail (Option A):**
```env
SYSTEM_EMAIL_USER="noreply.indus99@gmail.com"
SYSTEM_EMAIL_PASSWORD="<app-password>"
SYSTEM_EMAIL_FROM_NAME="Indas Analytics"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
```

**Microsoft 365 OAuth2 (Option B — current):**
```env
SYSTEM_EMAIL_USER="park.buddy@parksonspackaging.com"
SYSTEM_EMAIL_FROM_NAME="Parksons Packaging"
SMTP_HOST="smtp.office365.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_OAUTH_TENANT_ID="..."
SMTP_OAUTH_CLIENT_ID="..."
SMTP_OAUTH_CLIENT_SECRET="..."
```

If `SMTP_OAUTH_*` vars are present → OAuth2 is used. If absent → falls back to `user/pass`.

---

## Flow C — 2FA Login OTP

**`POST /api/auth/2fa`**

### 1. `action: 'send-otp'` — Send OTP to user's registered email

Triggered after password is verified. OTP is sent to the user's email via C# backend.

| Field | Type | Notes |
|-------|------|-------|
| `action` | `'send-otp'` | |
| `deviceId` | `string` | Browser fingerprint (FNV-1a hash of canvas + WebGL + screen + timezone) |
| `userId` | `number` | |
| `companyId` | `number` | |
| `productionUnitId` | `number` | |
| `fYear` | `string` | e.g. `"2025-2026"` |

**C# backend called:** `POST /api/2fa/send-otp`
```json
{ "deviceId": "...", "ipAddress": "...", "UserID": 1, "CompanyID": 1 }
```

### 2. `action: 'verify-otp'` — Verify OTP + register device

Validates OTP and registers device as trusted — future logins from this device skip 2FA.

| Field | Type | Notes |
|-------|------|-------|
| `action` | `'verify-otp'` | |
| `otp` | `string` | |
| `deviceId` | `string` | Same fingerprint as send-otp |
| `deviceName` | `string` | e.g. `"Chrome on Windows"` |
| `userId` | `number` | |
| `companyId` | `number` | |

**C# backend called:** `POST /api/2fa/verify-otp`
```json
{ "otp": "...", "deviceId": "...", "deviceName": "...", "ipAddress": "...", "UserID": 1, "CompanyID": 1 }
```

---

## Security Notes

- `__cc` cookie is `httpOnly: true`, `sameSite: strict`, expires in **10 minutes** — company credentials never touch the browser
- Device fingerprint is a FNV-1a hash of: userAgent, screen resolution, timezone, canvas render, WebGL renderer — used to skip 2FA on trusted devices
- All C# backend calls use `Basic Auth` header built server-side from the `__cc` cookie
- Client IP is extracted from `x-forwarded-for` → `x-real-ip` → `cf-connecting-ip` in priority order
