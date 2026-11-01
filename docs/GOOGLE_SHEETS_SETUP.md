# Google Sheets Database Architecture & Setup Guide

This guide explains how to connect and configure your existing Google Spreadsheet as the database for the **University Student Information & Scoring System**.

---

## 1. Spreadsheet Overview

- **Spreadsheet URL:**  
  `https://docs.google.com/spreadsheets/d/177W-KA6N6pFuP7_8vxo5SYQuBpm0BNPo8YSR3pAoF9E/edit?gid=975535987#gid=975535987`
- **Spreadsheet ID:**  
  `177W-KA6N6pFuP7_8vxo5SYQuBpm0BNPo8YSR3pAoF9E`

---

## 2. Safety & Data Preservation Rules

Our architecture strictly adheres to non-destructive database principles:
- **Never Clear Data:** The script never executes `clear()`, `clearContents()`, or row deletions.
- **Never Overwrite Real Scores:** The API only reads rows to compute and display results.
- **Never Alter Formulas:** Any spreadsheet formulas (e.g., `SUM`, `AVERAGE`, `VLOOKUP`) remain 100% untouched.
- **Preserve Student IDs:** Student IDs are treated as literal strings, preventing Excel/Sheets from dropping leading zeros (e.g. `00142` is preserved as `"00142"`).
- **Private Access:** You do **NOT** need to publish your spreadsheet to the web. Keep your spreadsheet access set to **Restricted (Private)**.

---

## 3. Step 1: Running the Non-Destructive Inspection Script

Before modifying or deploying, run `Inspect.gs` to inspect your spreadsheet structure:

1. Open your Google Spreadsheet in your web browser.
2. Click **Extensions** > **Apps Script** in the top menu bar.
3. In the Apps Script editor:
   - Create a new script file named `Inspect.gs`.
   - Copy the contents from `backend/apps-script/Inspect.gs` and paste it into the editor.
4. In the toolbar function dropdown, select **`inspectSpreadsheetStructure`**.
5. Click **Run**.
6. When prompted for authorization:
   - Click **Review permissions**.
   - Select your Google account.
   - Click **Advanced** > **Go to Untitled project (unsafe)**.
   - Click **Allow**.
7. Open **View** > **Execution log** (or press `Ctrl+Enter`).
8. You will see an exact breakdown of:
   - All worksheet names and sheet IDs (`gid`).
   - Total rows and total columns.
   - Column header names.
   - Detected column mappings (Khmer and English).
   - Any formulas present in row 2.

---

## 4. Column Header Mapping Reference

The system features an adaptive mapping layer that automatically detects either **Khmer** or **English** column headers:

| Standard Field | Khmer Header Matchers | English Header Matchers | Description |
| :--- | :--- | :--- | :--- |
| `studentId` | `ID`, `លេខសម្គាល់`, `កូដនិស្សិត` | `Student ID`, `StudentID`, `SID` | Unique student identifier |
| `fullNameKh` | `ឈ្មោះខ្មែរ`, `ឈ្មោះ` | `Khmer Name`, `Name KH` | Student's Khmer name |
| `fullNameEn` | `ឈ្មោះអង់គ្លេស` | `English Name`, `Latin Name` | Student's English name |
| `gender` | `ភេទ` | `Gender`, `Sex` | Gender (M/F, ប្រុស/ស្រី) |
| `room` | `បន្ទប់`, `ថ្នាក់` | `Room`, `Class`, `Classroom` | Cohort or classroom code |
| `skill` | `ជំនាញ` | `Major`, `Skill`, `Specialization`| Academic major |
| `subject` | `មុខវិជ្ជា` | `Subject`, `Course` | Course title |
| `totalQHA` | `សរុបពិន្ទុ (Q,H,A)`, `សរុបពិន្ទុ` | `Total QHA`, `QHA` | Quiz, Homework & Attendance (Max: 15) |
| `midterm` | `Midterm`, `ពាក់កណ្តាលឆមាស` | `Midterm Exam`, `Mid-Term` | Midterm exam score (Max: 25) |
| `finalScore` | `Final`, `ប្រឡងបញ្ចប់` | `Final Exam`, `Final` | Final exam score (Max: 50) |
| `totalScore` | `សរុប`, `ពិន្ទុសរុប` | `Total Score`, `Total` | Overall score |
| `grade` | `និទ្ទេស` | `Grade`, `Letter Grade` | Letter grade (A, B, C, etc.) |
| `status` | `ស្ថានភាព` | `Status`, `Student Status` | Active / Inactive / Graduated |
| `published` | `ផ្សព្វផ្សាយ` | `Published`, `Is Published` | `TRUE` / `FALSE` publication control |

---

## 5. Ongoing Scoring Updates

Teachers and staff can continue entering scores directly in the spreadsheet as they normally do:
1. Open the Google Sheet.
2. Edit or type scores in the appropriate student row.
3. Once updated, open the website and click **"Refresh Scores"** (Student) or **"Sync Latest Data"** (Teacher).
4. The system immediately retrieves and computes the updated values.
