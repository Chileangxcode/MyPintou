# Google Apps Script Backend Setup Guide

This guide provides step-by-step instructions for deploying the backend API that connects your Google Spreadsheet with the React web application.

---

## 1. Prerequisites

- Access to your Google account with Viewer or Editor permissions on spreadsheet `177W-KA6N6pFuP7_8vxo5SYQuBpm0BNPo8YSR3pAoF9E`.
- Files located in `backend/apps-script/`:
  - `Code.gs`
  - `Inspect.gs`
  - `appsscript.json`

---

## 2. Step-by-Step Deployment Instructions

### Step 1: Open Google Apps Script
1. Open your Google Spreadsheet:  
   `https://docs.google.com/spreadsheets/d/177W-KA6N6pFuP7_8vxo5SYQuBpm0BNPo8YSR3pAoF9E/edit`
2. Click **Extensions** in the top navigation bar, then click **Apps Script**.

### Step 2: Paste the Code Files
1. In the Apps Script project editor, replace `Code.gs` with the entire contents of [backend/apps-script/Code.gs](file:///c:/Users/USER/Downloads/Test%20Web/backend/apps-script/Code.gs).
2. Click the **+** (Add a file) icon next to *Files*, choose **Script**, name it `Inspect.gs`, and paste the contents of [backend/apps-script/Inspect.gs](file:///c:/Users/USER/Downloads/Test%20Web/backend/apps-script/Inspect.gs).
3. *(Optional)* To view or edit the manifest:
   - Click the gear icon (**Project Settings**).
   - Check **Show "appsscript.json" manifest file in editor**.
   - Ensure the manifest includes the spreadsheet OAuth scopes.

### Step 3: Configure Script Properties (Credentials)
1. In Project Settings, scroll down to **Script Properties**.
2. Click **Add script property** and add the following keys:
   - `SPREADSHEET_ID`: `177W-KA6N6pFuP7_8vxo5SYQuBpm0BNPo8YSR3pAoF9E`
   - `ADMIN_SECRET_TOKEN`: `AdminUni2026SecureKey` (or your chosen secure token)
   - `TEACHER_USERNAME`: `admin` (or `Leang`)
   - `TEACHER_PASSWORD`: `admin2026` (or `2504`)
3. Click **Save script properties**.

### Step 4: Deploy as a Web App
1. At the top right of the Apps Script editor, click **Deploy** > **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in the deployment configuration:
   - **Description:** `University Student Scoring API v1.0`
   - **Execute as:** `Me (your_email@gmail.com)` *(Crucial: This allows the script to access the private spreadsheet on your behalf)*
   - **Who has access:** `Anyone` *(Crucial: This enables the React frontend to make HTTP requests without requiring an end-user Google Workspace login)*
4. Click **Deploy**.
5. When prompted, click **Authorize access**, select your Google account, click **Advanced** > **Go to Untitled project (unsafe)**, and confirm permissions.
6. Once deployed, Google will display your **Web app URL**, which looks like:  
   `https://script.google.com/macros/s/AKfycbx.../exec`
7. Copy this URL.

---

## 3. Step 5: Connecting the Frontend

1. In your local project workspace, open `frontend/.env`.
2. Set the `VITE_APPS_SCRIPT_URL` variable:
   ```env
   VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_COPIED_ID/exec
   VITE_USE_MOCK=false
   ```
3. Restart or rebuild the frontend (`npm run dev` or `npm run build`).

---

## 4. Verification & Testing

### Verify Health Check in Browser
Paste your Web App URL into your browser with `?action=health`:
```
https://script.google.com/macros/s/YOUR_COPIED_ID/exec?action=health
```
You should receive a JSON response:
```json
{
  "success": true,
  "message": "API is running and successfully connected to Google Spreadsheet.",
  "data": {
    "status": "online",
    "spreadsheetConnected": true,
    "spreadsheetTitle": "Student Scores Master",
    "totalSheets": 1
  }
}
```

### Verify Score Refresh
1. Change a student's score in Google Sheets.
2. In the React portal, click **"Refresh Scores"**.
3. Confirm that the new score appears dynamically on screen!
