# MediSlot (మెడిస్లాట్) — Full-Stack Healthcare Management & RBAC Portal

> **Government Hospital OPD Appointment & Digital Token Queue System**  
> *ఆంధ్రప్రదేశ్ ప్రభుత్వం · వైద్య, ఆరోగ్య మరియు కుటుంబ సంక్షేమ శాఖ*  
> (Department of Health, Medical & Family Welfare, Government of Andhra Pradesh)

[![Frontend](https://img.shields.io/badge/Frontend-React_19_+_Vite_+_TypeScript-61DAFB.svg)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-Node.js_+_Express_v4-green.svg)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/Database-SQLite3-blue.svg)](https://sqlite.org/)
[![Security](https://img.shields.io/badge/Auth-JWT_+_HttpOnly_Cookies_+_BCrypt-red.svg)](https://jwt.io/)
[![i18n](https://img.shields.io/badge/Language-Telugu_%7C_English-orange.svg)](#bilingual-support)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

MediSlot is a production-grade full-stack healthcare digital portal engineered for government district hospitals, area hospitals, and community health centres across Andhra Pradesh. It streamlines outpatient department (OPD) scheduling, provides real-time sequential digital token queue management, isolates medical records through strict role-based access control (RBAC), and generates official verifiable printable token slips with vector QR codes and barcodes.

---

## 🌟 Key Features & Architectural Upgrades

### 1. 👥 Multi-Role User Separation (RBAC)
- **Patient Portal (`/patient/*`)**:
  - Secure registration with email, mobile phone, and password strength validation.
  - Dedicated authenticated patient dashboard displaying active appointments, past consultation history, and ABHA ID management.
  - 1-click self-service appointment cancellation that immediately frees up reserved doctor slots in the database.
  - Official printable OPD token slips with vector QR code and Code128 barcodes.
- **Doctor Portal (`/doctor/*`)**:
  - Doctor registration with credentials, medical specialization, qualifications, and hospital assignment.
  - **Pending Verification Gate**: New doctor registrations are flagged as `PENDING` by default. Doctors cannot consult or appear in the public booking directory until approved by a platform administrator.
  - Live OPD Queue Board: Real-time "Now Serving Token" display, waiting queue counters, "Call Next Token" progression, counter walk-in token issuance, and consultation status updates (`CONFIRMED`, `CALLED`, `IN_CONSULTATION`, `COMPLETED`, `NO_SHOW`).
  - Availability & Roster manager: Duty toggle (ON/OFF duty) and consultation time slot editor.
- **Administrator Control Center (`/admin/*`)**:
  - **Hidden Secure Gateway (`/control-center/login`)**: Hidden entry route to reduce discovery risk.
  - Zero public admin registration. Bootstrapped securely via environment variables and CLI scripts.
  - Doctor Verification Queue: Review doctor credentials, approve, reject, or suspend physician accounts.
  - Patient Directory: Oversight of registered citizens and consultation volumes.
  - System-wide Appointment Monitor: Live cross-hospital schedule ledger.
  - Cryptographic Security Audit Trail: Audit logging of all sensitive administrative events and access attempts.

### 2. 🏥 AP Healthcare Infrastructure & Dual-Language Support
- **Hospital Directory**: Real-time bed tracking across Andhra Pradesh healthcare facilities (Government District Hospital Bhimavaram, Area Hospital Palakollu, GGH Eluru, Rangaraya GGH Kakinada) with live counters for **General Beds**, **ICU Beds**, and **Oxygen Beds**.
- **100% Bilingual Interface (తెలుగు / English)**: Instant language toggle between Telugu and English across all pages, forms, tables, and print slips.
- **Printable OPD Token Slip**: Dedicated `@media print` formatting rendering printable A4/A5 slips with pure client-side SVG QR and Code128 barcode representations.

---

## 📁 Target Architecture

```text
Medislot/
├── frontend/                     # React 19 + Vite + TypeScript Single Page App
│   ├── src/
│   │   ├── api/client.ts         # Axios client with credentials & interceptors
│   │   ├── components/common/    # Navbar, Footer, ProtectedRoute, TokenSlipModal
│   │   ├── context/              # AuthContext, LanguageContext, ToastContext
│   │   ├── pages/
│   │   │   ├── public/           # Home, DoctorsDirectory, HospitalsDirectory, Grievances
│   │   │   ├── patient/          # PatientLogin, PatientRegister, PatientDashboard, BookAppointment, PatientProfile
│   │   │   ├── doctor/           # DoctorLogin, DoctorRegister, DoctorPending, DoctorDashboard, DoctorAvailability
│   │   │   └── admin/            # AdminLogin, AdminDashboard, DoctorVerification, PatientManagement, AppointmentManagement, AuditLogs
│   │   ├── types/                # TypeScript interfaces
│   │   ├── utils/qrBarcode.ts    # Client-side SVG QR code & barcode generators
│   │   ├── App.tsx               # Master route tree with role guards
│   │   ├── index.css             # AP Government design system & print styles
│   │   └── main.tsx
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/                      # Node.js + Express REST API Server
│   ├── src/
│   │   ├── config/               # db.js (SQLite migrations & seeds), env.js
│   │   ├── controllers/          # auth, patient, doctor, admin, public controllers
│   │   ├── middleware/           # authGuard, roleGuard, rateLimiter, validator, errorHandler
│   │   ├── routes/               # /api/v1/auth, /api/v1/patients, /api/v1/doctors, /api/v1/admin, /api/v1/public
│   │   ├── scripts/seedAdmin.js  # Secure CLI tool for administrator bootstrapping
│   │   ├── utils/                # password (bcrypt), jwt, auditLogger
│   │   ├── app.js                # Express app setup with CORS, Helmet, RateLimiting
│   │   └── server.js             # HTTP server entry point
│   ├── tests/api.test.js         # Automated test suite (18 test scenarios)
│   ├── .env.example
│   ├── medislot.db               # SQLite database file
│   └── package.json
├── .env.example                  # Root environment template
├── .gitignore                    # Root git ignore
├── package.json                  # Root development scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18 or higher; Node.js v20+ or v22 recommended)
- **npm** (bundled with Node.js)

---

### Step 1: Install Dependencies

You can install dependencies for both applications using the root command:
```bash
npm run install:all
```

Or install separately in each folder:
```bash
# In backend
cd backend
npm install

# In frontend
cd ../frontend
npm install
```

---

### Step 2: Environment Configuration

Create `.env` files from the provided templates:

#### Backend (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
DATABASE_PATH=./medislot.db
JWT_SECRET=medislot_super_secret_jwt_key_development_2026_healthcare_secure
JWT_EXPIRES_IN=24h
FRONTEND_ORIGIN=http://localhost:5173
ADMIN_DEFAULT_EMAIL=admin@medislot.gov.in
ADMIN_DEFAULT_PASSWORD=AdminSecure@2026
ADMIN_DEFAULT_NAME=Chief Medical Administrator
ADMIN_DEFAULT_PHONE=9848099999
```

#### Frontend (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

### Step 3: Initialize Database & Bootstrap Administrator

Run the secure admin bootstrap script in the backend directory. This will initialize the SQLite tables, seed the authentic AP hospitals, medical departments, and doctors, and configure the chief administrator:

```bash
npm run seed:admin
```

**Default Seeded Credentials for Testing:**

| Role | Route | Email | Password | Status |
|---|---|---|---|---|
| **Administrator** | `/control-center/login` | `admin@medislot.gov.in` | `AdminSecure@2026` | Active Chief Admin |
| **Doctor** | `/doctor/login` | `dr.ramesh@medislot.gov.in` | `DoctorPass@2026` | Verified Physician (General Medicine) |
| **Doctor** | `/doctor/login` | `dr.anitha@medislot.gov.in` | `DoctorPass@2026` | Verified Physician (Gynecology) |
| **Doctor** | `/doctor/login` | `dr.srinivas@medislot.gov.in` | `DoctorPass@2026` | Verified Physician (Orthopedics) |
| **Doctor** | `/doctor/login` | `dr.lakshmi@medislot.gov.in` | `DoctorPass@2026` | Verified Physician (Pediatrics) |
| **Patient** | `/patient/login` or `/patient/register` | Self-register in 30 seconds | Self-selected | Instant Active Patient |

---

### Step 4: Run the Applications

Start both applications in separate terminals:

#### Terminal 1 (Backend Server):
```bash
# Starts backend on http://localhost:5000
npm run dev:backend
```

#### Terminal 2 (Frontend Client):
```bash
# Starts Vite React dev server on http://localhost:5173
npm run dev:frontend
```

Once running:
- Open your browser to **`http://localhost:5173`** for the public portal & patient/doctor services.
- Open **`http://localhost:5173/control-center/login`** for the hidden administrator control center.
- Backend REST API and health checks are available at **`http://localhost:5000/api/health`** and **`http://localhost:5000/api/v1/*`**.

---

## 🧪 Testing and Quality Assurance

Run the comprehensive automated test suite (powered by Node.js native test runner):

```bash
npm test
```

### Automated Test Coverage (18 Scenarios):
1. Health check returns healthy status
2. Public endpoints return AP hospitals and clinical departments
3. Patient registration succeeds with valid data
4. Duplicate patient registration is prevented (HTTP 409)
5. Patient login succeeds with correct credentials
6. Patient login fails with generic error on wrong password (HTTP 401)
7. Doctor registration sets status to `PENDING` by default
8. Doctor login reports `PENDING` verification status
9. Administrator login succeeds via `/control-center/login`
10. Administrator can review and approve/verify pending doctor account
11. Unauthenticated request to protected route is rejected with HTTP 401
12. Cross-role authorization: Patient attempting admin route is rejected with HTTP 403 Forbidden
13. Patient can safely book appointment and receive sequential token (`#01`, `#02`...)
14. Double-booking prevention: rejects reserving the same doctor/time slot concurrently
15. Patient can cancel their own appointment and slot is immediately freed
16. Patient can book the freed slot after cancellation
17. Verified doctor login and live queue access
18. Admin dashboard stats returns complete platform analytics

---

## 📡 Key REST API Endpoints (`/api/v1`)

### Authentication
- `POST /api/v1/auth/patient/register` - Register a new patient
- `POST /api/v1/auth/patient/login` - Patient sign-in
- `POST /api/v1/auth/doctor/register` - Doctor application (defaults to `PENDING`)
- `POST /api/v1/auth/doctor/login` - Doctor sign-in
- `POST /api/v1/auth/admin/login` - Hidden admin sign-in
- `POST /api/v1/auth/logout` - Clear session cookie
- `GET  /api/v1/auth/me` - Restore active authenticated session

### Patient
- `GET   /api/v1/patients/me` - Get patient profile
- `PATCH /api/v1/patients/me` - Update patient profile & ABHA ID
- `GET   /api/v1/patients/appointments` - Get tenant-isolated appointments
- `POST  /api/v1/patients/appointments` - Book appointment with atomic slot lock
- `POST  /api/v1/patients/appointments/:id/cancel` - Cancel appointment and free slot

### Doctor (Protected with Verification Guard)
- `GET   /api/v1/doctors/me` - Get doctor profile
- `PATCH /api/v1/doctors/me` - Update room no & contact
- `GET   /api/v1/doctors/queue` - Live OPD queue with current serving token
- `POST  /api/v1/doctors/queue/call-next` - Advance queue and call next token
- `PUT   /api/v1/doctors/appointments/:id/status` - Transition status (`CALLED`, `IN_CONSULTATION`, `COMPLETED`, `NO_SHOW`)
- `POST  /api/v1/doctors/queue/walkin` - Generate immediate walk-in counter token
- `GET   /api/v1/doctors/availability` - Get consultation hours & slot times
- `PUT   /api/v1/doctors/availability` - Update schedule and duty toggle

### Administrator
- `GET   /api/v1/admin/dashboard` - Platform overview & bed capacities
- `GET   /api/v1/admin/doctors` - Doctor applications filterable by status
- `PATCH /api/v1/admin/doctors/:id/status` - Approve (`VERIFIED`), reject, or suspend doctor
- `GET   /api/v1/admin/patients` - Registered patient directory
- `GET   /api/v1/admin/appointments` - System-wide appointment ledger
- `GET   /api/v1/admin/audit-logs` - Security audit trail

---

## 🛡️ Security Best Practices Implemented
- **Password Hashing**: BCrypt with 12 salt rounds. Plaintext passwords are never stored or logged.
- **Session Protection**: JWTs in HTTP-only, SameSite=Lax cookies with automatic expiration.
- **Tenant Isolation**: Patient queries and cancellations are scoped strictly to the authenticated patient's identity. Unrelated patients cannot read or modify other citizens' health data.
- **Doctor Queue Isolation**: Doctors can only inspect and transition appointments assigned to their own roster.
- **Brute-Force Rate Limiting**: `express-rate-limit` guards login and registration routes against automated attacks.
- **Security Headers**: `helmet` enabled for HTTP defense.
- **Input Sanitization**: Client and server-side validation on mobile numbers, email formats, and string lengths.

---

## 🏛️ Acknowledgments & Department Context
Developed for the **Department of Health, Medical & Family Welfare, Government of Andhra Pradesh**, providing accessible public healthcare services to the citizens of Andhra Pradesh.
