# Google Apps Script Web App API Documentation

The backend API is implemented as a serverless Google Apps Script Web App that connects directly to Google Sheets using `SpreadsheetApp.openById()`.

---

## 1. General API Specifications

- **Protocol:** HTTPS
- **Base URL:** `https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec`
- **Supported Methods:** `GET`, `POST`
- **Response Format:** `application/json` (or `application/javascript` if `callback` parameter is supplied for JSONP)
- **Standard Response Envelope:**
  ```json
  {
    "success": true,
    "message": "Operation description",
    "data": {},
    "error": null,
    "timestamp": "2026-10-22T00:00:00.000Z"
  }
  ```

---

## 2. Public & Student Endpoints

### 2.1 Health Check
Verifies that the script is executing and can successfully connect to the Google Spreadsheet.
- **Action:** `health`
- **Method:** `GET`
- **Query Parameters:**
  - `action`: `health`
  - `refresh`: *(Optional)* `true` to bypass cache
- **Sample Request:**
  ```http
  GET /exec?action=health
  ```
- **Sample Response:**
  ```json
  {
    "success": true,
    "message": "API is running and successfully connected to Google Spreadsheet.",
    "data": {
      "status": "online",
      "spreadsheetConnected": true,
      "spreadsheetTitle": "Student Scores Master",
      "totalSheets": 1,
      "serverTime": "2026-10-22T00:00:00.000Z"
    },
    "error": null
  }
  ```

---

### 2.2 Student Result Lookup
Validates student credentials and returns **strictly the single matched student's record**. Never leaks the entire roster or other students' information.
- **Action:** `student_lookup`
- **Method:** `GET` or `POST`
- **Parameters:**
  - `studentId`: *(Required)* Student identification string (e.g., `2024001`)
  - `studentName`: *(Required)* Full name in Khmer or English (e.g., `សុខ ចាន់ដារ៉ា`)
  - `refresh`: *(Optional)* `true` to force fresh read from sheet
- **Sample Request:**
  ```http
  GET /exec?action=student_lookup&studentId=2024001&studentName=សុខ+ចាន់ដារ៉ា
  ```
- **Sample Response:**
  ```json
  {
    "success": true,
    "message": "Student record retrieved successfully.",
    "data": {
      "profile": {
        "studentId": "2024001",
        "fullNameKh": "សុខ ចាន់ដារ៉ា",
        "fullNameEn": "Sok Chandara",
        "gender": "ប្រុស",
        "room": "M1",
        "skill": "Computer Science",
        "subject": "Web Development",
        "status": "Active"
      },
      "academicSummary": {
        "totalQHA": 14.5,
        "qhaGrade": { "label": "Very Good (ល្អណាស់)" },
        "midterm": 22.0,
        "midtermGrade": { "label": "Passed (ជាប់)" },
        "finalScore": 46.0,
        "totalScore": 82.5,
        "overallGrade": "A"
      },
      "scores": [
        {
          "assessment": "សរុបពិន្ទុ (Q,H,A)",
          "score": 14.5,
          "maxScore": 15,
          "percentage": 96.67
        },
        {
          "assessment": "Midterm Exam",
          "score": 22.0,
          "maxScore": 25,
          "percentage": 88.0
        }
      ]
    },
    "error": null
  }
  ```

---

## 3. Teacher & Staff Endpoints (Protected)

All administrative endpoints require an authorization token or valid administrator credentials.

### 3.1 Teacher / Admin Login
- **Action:** `admin_login`
- **Method:** `GET` or `POST`
- **Parameters:**
  - `username`: Staff username (e.g., `admin` or `Leang`)
  - `password`: Staff password (e.g., `admin2026` or `2504`)
- **Sample Response:**
  ```json
  {
    "success": true,
    "message": "Teacher/Admin login successful.",
    "data": {
      "role": "admin",
      "token": "AdminUni2026SecureKey",
      "username": "admin",
      "displayName": "University Faculty Administrator"
    },
    "error": null
  }
  ```

---

### 3.2 Aggregate Academic Statistics
Computes class metrics, pass/fail counts, and grade distributions dynamically from Google Sheets data.
- **Action:** `admin_stats`
- **Parameters:**
  - `token`: *(Required)* Admin token
  - `refresh`: *(Optional)* `true`
- **Sample Response:**
  ```json
  {
    "success": true,
    "message": "Dashboard statistics retrieved.",
    "data": {
      "totalStudents": 45,
      "maleStudents": 25,
      "femaleStudents": 20,
      "passedCount": 38,
      "failedCount": 7,
      "averageScore": 74.2,
      "roomCount": 3,
      "majorCount": 2,
      "gradeDistribution": {
        "A": 12,
        "B": 18,
        "C": 8,
        "F": 7
      }
    }
  }
  ```

---

### 3.3 Student Directory (Paginated)
- **Action:** `admin_students`
- **Parameters:**
  - `token`: *(Required)* Admin token
  - `search`: *(Optional)* Search query matching ID or Name
  - `room`: *(Optional)* Room/Classroom filter
  - `major`: *(Optional)* Major filter
  - `page`: *(Optional, default: 1)* Page index
  - `pageSize`: *(Optional, default: 20)* Items per page

---

### 3.4 Student Detail Inspection
- **Action:** `admin_student_detail`
- **Parameters:**
  - `token`: *(Required)* Admin token
  - `studentId`: *(Required)* Target Student ID

---

### 3.5 Master Scoring Matrix
Returns full side-by-side assessment scores across all enrolled students.
- **Action:** `admin_scoring_overview`
- **Parameters:**
  - `token`: *(Required)* Admin token
