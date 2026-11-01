# University Student Information & Scoring System

A full-stack, responsive web application connecting a modern React frontend with Google Sheets as the primary database via Google Apps Script serverless API.

---

## 🌟 Key Features

1. **Role-Based Experience**:
   - **Students**: Look up personal scores using Student ID and Name, view assessment breakdown, track performance percentage with visual charts, and generate printable official grade slips / transcripts.
   - **Teachers & Faculty**: Sign in to the staff dashboard to monitor real-time class statistics, search the student directory, filter by room and major, view the master scoring matrix, and export CSV reports.
2. **Dynamic Google Sheets Integration**:
   - Seamlessly connects to your existing Google Spreadsheet (`177W-KA6N6pFuP7_8vxo5SYQuBpm0BNPo8YSR3pAoF9E`).
   - Teachers can continue entering scores directly into Google Sheets; changes appear in the app instantly upon refreshing.
3. **Adaptive Column Mapping**:
   - Automatically supports both **Khmer** headers (`ID`, `ឈ្មោះខ្មែរ`, `ឈ្មោះអង់គ្លេស`, `ភេទ`, `បន្ទប់`, `ជំនាញ`, `សរុបពិន្ទុ (Q,H,A)`, `Midterm`, `Final`) and **English** headers.
4. **Non-Destructive Database Safety**:
   - 100% read-only operations. Never deletes, overwrites, clears, or alters existing student records, formulas, or formatting.
5. **Modern University UI/UX**:
   - Built with React, Tailwind CSS, Lucide icons, and Recharts.
   - Fully responsive for mobile phones, tablets/iPads, and desktop monitors.
   - Print-optimized CSS for official grade transcripts.

---

## 📁 Repository Structure

```
university-student-scoring-system/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js          # Unified API caller with timeout & CORS
│   │   │   ├── studentApi.js      # Student lookup & score retrieval
│   │   │   ├── adminApi.js        # Staff login, statistics, & directory
│   │   │   ├── settingsApi.js     # Health check & diagnostics
│   │   │   ├── mockData.js        # Realistic student dataset for local dev
│   │   │   └── mockHandler.js     # Development simulator
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Responsive navigation bar
│   │   │   ├── Footer.jsx         # University branding footer
│   │   │   ├── StatusBadge.jsx    # Grade & status pills
│   │   │   ├── ScoreBar.jsx       # Progress score percentage bar
│   │   │   ├── MockBanner.jsx     # Preview mode indicator
│   │   │   └── LoadingSkeleton.jsx# Skeleton loading states
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Session management for student & staff
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx     # Public layout
│   │   │   ├── StudentLayout.jsx  # Student portal layout
│   │   │   └── AdminLayout.jsx    # Staff portal layout with sidebar
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx    # Portal landing hero & cards
│   │   │   ├── StudentLoginPage.jsx # Student ID & Name lookup
│   │   │   ├── TeacherLoginPage.jsx # Faculty sign-in
│   │   │   ├── StudentDashboard.jsx # Student scores & performance chart
│   │   │   ├── StudentProfilePage.jsx # Student demographic profile
│   │   │   ├── PrintableResultPage.jsx # Official printable grade slip
│   │   │   ├── AdminDashboard.jsx # Staff KPI metrics & analytics
│   │   │   ├── StudentDirectoryPage.jsx # Search, filter & student modal
│   │   │   ├── AcademicScoringPage.jsx # Master score matrix & CSV export
│   │   │   ├── SettingsPage.jsx   # API diagnostics & health check
│   │   │   ├── UnauthorizedPage.jsx # 403 Access Denied
│   │   │   └── NotFoundPage.jsx   # 404 Page
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx      # React Router configuration
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── vercel.json            # Vercel SPA rewrites
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   └── test-integration.js        # Automated verification test suite
├── backend/
│   └── apps-script/
│       ├── Code.gs                # Google Apps Script Web App API
│       ├── Inspect.gs             # Non-destructive spreadsheet inspector
│       └── appsscript.json        # Apps Script manifest
├── google-apps-script/
│   └── Inspect.gs                 # Editor convenience copy
├── docs/
│   ├── GOOGLE_SHEETS_SETUP.md     # Spreadsheet integration guide
│   ├── APPS_SCRIPT_SETUP.md       # Apps Script deployment instructions
│   ├── VERCEL_DEPLOYMENT.md       # Vercel hosting guide
│   ├── API_DOCUMENTATION.md       # API endpoints & parameters
│   └── SECURITY.md                # Security architecture & advisory
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start (Local Development)

1. Clone or navigate to the repository directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your web browser.
   *(By default, the app starts in Local Demo Preview mode with realistic mock records so you can explore all features immediately!)*

---

## 🧪 Running the Test Suite

Run the automated integration and safety verification tests:
```bash
cd frontend
node test-integration.js
```
All 17 tests verify:
- Health check status
- Student lookup by Khmer & English name
- Safe error handling for incorrect credentials
- Strict single-student data isolation (no directory leak)
- Teacher/Admin authentication
- Directory filtering and aggregate metrics computation

---

## ☁️ Deployment Instructions

1. **Backend (Google Apps Script):**  
   Follow the step-by-step guide in [docs/APPS_SCRIPT_SETUP.md](file:///c:/Users/USER/Downloads/Test%20Web/docs/APPS_SCRIPT_SETUP.md).
2. **Database (Google Sheets):**  
   Review the column mapping and safety rules in [docs/GOOGLE_SHEETS_SETUP.md](file:///c:/Users/USER/Downloads/Test%20Web/docs/GOOGLE_SHEETS_SETUP.md).
3. **Frontend (Vercel):**  
   Follow the deployment instructions in [docs/VERCEL_DEPLOYMENT.md](file:///c:/Users/USER/Downloads/Test%20Web/docs/VERCEL_DEPLOYMENT.md).
