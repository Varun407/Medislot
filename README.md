# MediSlot (మెడిస్లాట్)

> **Government Hospital OPD Appointment & Digital Token Queue System**  
> *ఆంధ్రప్రదేశ్ ప్రభుత్వం · వైద్య, ఆరోగ్య మరియు కుటుంబ సంక్షేమ శాఖ*  
> (Department of Health, Medical & Family Welfare, Government of Andhra Pradesh)

[![Node.js Version](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-SQLite3-blue.svg)](https://sqlite.org/)
[![UI](https://img.shields.io/badge/Language-Telugu%20%7C%20English-orange.svg)](#bilingual-support)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

MediSlot is a full-stack public healthcare digital portal designed for government hospitals and community health centres across Andhra Pradesh. It streamlines outpatient department (OPD) registrations, eliminates crowded waiting queues with sequential digital tokens, and provides citizens and doctors with an authentic, transparent healthcare booking platform.

---

## 🌟 Key Features

### 1. 🏥 Public Digital OPD Booking
- **Hospital Directory**: Integrated with Andhra Pradesh healthcare facilities (Government District Hospital Bhimavaram, Area Hospital Palakollu, GGH Eluru, Rangaraya GGH Kakinada).
- **Specialist Selection**: 9 clinical departments (General Medicine, Pediatrics, Gynecology & Obstetrics, Orthopedics, Cardiology, Dermatology, ENT, Ophthalmology, Pulmonology).
- **Real-Time Slot Engine**: Slots dynamically update based on doctor roster schedules; booked slots are locked to prevent double-booking.
- **Date & Shift Preferences**: Filters for Morning (8 AM – 12 PM) and Afternoon (12 PM – 4 PM) sessions.

### 2. 🎫 Official Printable OPD Token Slip
- **Sequential Token Numbering**: Generates real token numbers (`#01`, `#02`, `#03`...) per doctor per date.
- **Official Reference ID**: Generates verifiable unique reference codes (`AP-OPD-YYYY-XXXX`).
- **Dynamic Vector QR Code (SVG)**: Client-side vector QR code encoding appointment verification metadata for paper or mobile scanning.
- **Barcode (Code128 SVG)**: High-density linear barcode for hospital OPD reception scanners.
- **Print-Ready Formatting**: Dedicated `@media print` CSS formats the slip directly onto A4/A5 paper with zero web clutter.

### 3. 👤 Frictionless Patient Portal (No OTP Required)
- **Instant Access**: Login with any valid 10-digit mobile number — no passwords, OTPs, or email barriers.
- **Appointment History**: Displays active and past consultations with live token statuses (`CONFIRMED`, `CALLED`, `IN_CONSULTATION`, `COMPLETED`, `CANCELLED`).
- **Self-Service Actions**: 1-click OPD Slip reprinting and instant appointment cancellation (which immediately frees up the slot in the database).

### 4. 🩺 Doctor & Staff OPD Queue Board
- **Live Consultation Dashboard**: Doctors and hospital staff can view today's queue for their specific department.
- **Live Queue Metrics**:
  - **Now Serving Token** (highlighted live display)
  - **Waiting Patients**
  - **In Consultation**
  - **Completed Consultations**
- **Call Next Patient**: `📢 Call Next Token` button advances the queue in real time and marks patient status as `CALLED`.
- **Counter Walk-in Tokens**: Staff can issue immediate walk-in tokens for rural patients without prior internet booking.

### 5. 🛏️ Hospital Directory & Live Bed Counters
- Real-time breakdown of hospital bed availability:
  - **General Inpatient Beds**
  - **ICU Beds**
  - **Oxygen Beds**
- Direct casualty hotline (108/104), OPD timings, and a 1-click **"Book OPD at this Hospital"** action.

### 6. 🌐 100% Bilingual Support (తెలుగు / English)
- Instant language toggle between **తెలుగు (Telugu)** and **English** for every single component, button, slip, modal, and alert without page reloads.

### 7. ⚡ Dual-Mode Data Architecture (Server API + LocalDB)
- **REST API Mode**: When the Node.js Express server is active, all operations persist to the SQLite database (`medislot.db`).
- **LocalDB Fallback**: If the HTML file is opened directly (`file:///...`) or offline, the app switches to an identical browser storage engine so **it never breaks during viva presentations or offline demos**.

### 8. 🛡️ Citizen Grievance Redressal
- Citizens can lodge complaints or suggestions regarding cleanliness, drug availability, or waiting times, generating an official tracking ID (`AP-GRV-XXXX`).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Semantic HTML5, CSS3 Custom Properties (Design System), Vanilla JavaScript |
| **Backend** | Node.js (v20+), Express.js (v5), CORS |
| **Database** | SQLite3 (`medislot.db`) with persistent tables and automatic migration seeding |
| **Utilities** | Pure Client-side SVG QR Code & Code128 Barcode Generators (zero external CDN dependency) |

---

## 📁 Project Structure

```text
CSP/
├── database.js          # SQLite3 database connection, schema setup & initial AP seeds
├── server.js            # Express.js REST API server & static file server
├── package.json         # NPM scripts and project dependencies
├── .gitignore           # Git ignore rules (node_modules, logs, etc.)
├── index.html           # Main application entry point (root)
├── csp_fr1.html         # Standalone version preserving original layout & icons
├── medislot.db          # Persistent SQLite database file
├── public/
│   ├── index.html       # Publicly served application file
│   ├── style.css        # Andhra Pradesh Government design system & print styles
│   └── app.js           # Client application logic with dual-mode API/LocalDB engine
└── README.md            # Comprehensive project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` (bundled with Node.js)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Varun407/Medislot.git
   cd Medislot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Access the portal**:
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

> **Note**: You can also double-click [index.html](index.html) or [csp_fr1.html](csp_fr1.html) to run the portal entirely client-side via its built-in LocalDB engine.

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check & system status |
| `GET` | `/api/stats` | Real-time portal statistics (beds, doctors, consultations) |
| `GET` | `/api/hospitals` | List all hospitals and bed availability counts |
| `GET` | `/api/doctors` | List doctors with filter options (`department`, `date`, `search`) |
| `GET` | `/api/appointments` | Search appointments by `phone`, `refId`, `date`, or `doctorName` |
| `GET` | `/api/appointments/:id` | Fetch appointment details by Reference ID |
| `POST` | `/api/appointments` | Book new appointment & generate sequential token |
| `POST` | `/api/appointments/:id/cancel` | Cancel an appointment and free up the slot |
| `PUT` | `/api/appointments/:id/status` | Update consultation status (`CALLED`, `IN_CONSULTATION`, etc.) |
| `GET` | `/api/queue` | Get live queue state and patient list for doctor |
| `POST` | `/api/queue/call-next` | Advance doctor queue and mark next patient as called |
| `POST` | `/api/queue/walkin` | Issue immediate walk-in counter OPD token |
| `POST` | `/api/grievances` | Submit citizen grievance and generate tracking reference |

---

## 🧪 Demo Test Data

To test the system immediately without typing new data:
- **Patient Portal Mobile Number**: Enter `9848012345` to view existing bookings for *K. Subba Rao* and *M. Mary Kumari*.
- **Doctor Queue**: Select **Dr. K. Ramesh (General Medicine)** on the Live Queue board to see active patients and test the **"Call Next Token"** button.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Developed as a Community Service Project (CSP) in Andhra Pradesh.
