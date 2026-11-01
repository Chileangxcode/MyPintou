# University Scoring System Security Architecture & Advisory

This document describes the security model, threat mitigations, and hardening steps for the University Student Information & Scoring System.

---

## 1. Threat Model & Authentication Limitations

### Student ID + Name Lookup Analysis
The prompt requests an initial student lookup mechanism based on **Student ID** and **Student Name**.

- **Limitation:** Another student, classmate, or acquaintance might know both a student's ID and name.
- **Classification:** ID-and-name lookup functions as an **accessible public result lookup** or low-security verification model.
- **Safety Rule:** It must **not** be considered equivalent to multi-factor authentication or cryptographic identity protection.

### Production Hardening Recommendations
Before deploying the system for confidential semester grade transcripts:
1. **Google Workspace OAuth:** Require students to sign in using their official institutional email (`@university.edu.kh`).
2. **Student PIN / Password:** Add a hashed student PIN column in the Google Sheet.
3. **Timed One-Time Password (TOTP) or Email Magic Link:** Send an authentication code to the student's registered email.

---

## 2. Server-Side Data Isolation Rules

The Google Apps Script backend enforces strict server-side authorization:
- **No Client Trust:** Client-supplied role variables or parameters are ignored.
- **Single-Student Delivery:** When a student performs a lookup, the backend queries the spreadsheet, matches the specific record, and serializes **only that student's record**.
- **No Spreadsheet Dumps:** The student lookup endpoint never exposes the full array of students or raw spreadsheet rows.
- **Publication Control:** Records with `published = false` are blocked from student view.

---

## 3. Spreadsheet Protection & Web App Identity

- **Private Spreadsheet:** The Google Spreadsheet (`177W-KA6N6pFuP7_8vxo5SYQuBpm0BNPo8YSR3pAoF9E`) is kept **Restricted (Private)**. It is never made public or published to the web.
- **Execution Identity:** The Apps Script Web App is deployed with:
  - *Execute as:* **Me**
  - *Who has access:* **Anyone**
  This architecture acts as an authorized proxy. The public browser cannot view or download the Google Spreadsheet file; it can only invoke the pre-defined Apps Script functions.

---

## 4. Input Sanitization & Abuse Mitigation

- **Whitespace Normalization:** Trims leading, trailing, and repeated whitespace to avoid injection or mismatch issues.
- **Parameter Validation:** Verifies that mandatory parameters are non-empty and well-formed before accessing the spreadsheet.
- **No Stack Traces:** Unhandled exceptions return generic, user-friendly error codes rather than leaking internal Google Apps Script engine traces or spreadsheet formulas.
- **Throttling & Cache:** An in-memory cache layer (`CacheService`) caches clean responses for 60 seconds to prevent denial-of-service spikes and stay within Google Apps Script quota limits.
