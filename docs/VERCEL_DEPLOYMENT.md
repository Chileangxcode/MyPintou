# Vercel Frontend Deployment Guide

This guide details how to host the React application on Vercel with automated build settings, client-side routing, and environment configuration.

---

## 1. Prerequisites

- A free or Pro [Vercel account](https://vercel.com).
- Your deployed Google Apps Script Web App URL.
- A GitHub repository containing this project (or using the Vercel CLI).

---

## 2. Option A: Deploy via GitHub (Recommended)

1. Push your project code to GitHub.
2. In the Vercel Dashboard, click **Add New** > **Project**.
3. Select your GitHub repository.
4. In the **Configure Project** screen:
   - **Project Name:** `university-student-scoring-system` (or custom name)
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click *Edit* and select **`frontend`**
   - **Build Command:** `npm run build` (automatic)
   - **Output Directory:** `dist` (automatic)
   - **Install Command:** `npm install` (automatic)
5. Expand the **Environment Variables** section and add:
   - `VITE_APPS_SCRIPT_URL`: Paste your Google Apps Script Web App URL (`https://script.google.com/macros/s/.../exec`)
   - `VITE_USE_MOCK`: `false`
   - `VITE_UNIVERSITY_NAME`: `National University` (or your university's name)
   - `VITE_UNIVERSITY_NAME_KH`: `សាកលវិទ្យាល័យជាតិ`
6. Click **Deploy**.
7. Vercel will install dependencies, compile the Tailwind CSS tokens, optimize assets, and deploy the application within 40 seconds.

---

## 3. Option B: Deploy via Vercel CLI

If you prefer deploying directly from your local terminal:

1. Install the Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
3. Run the deployment command:
   ```bash
   vercel
   ```
4. Follow the interactive prompts:
   - *Set up and deploy?* `y`
   - *Which scope?* Select your team or personal account
   - *Link to existing project?* `n`
   - *What's your project's name?* `university-student-scoring`
   - *In which directory is your code located?* `./`
5. Add your production environment variables:
   ```bash
   vercel env add VITE_APPS_SCRIPT_URL
   ```
6. Deploy to production:
   ```bash
   vercel --prod
   ```

---

## 4. Single-Page Application (SPA) Routing Configuration

Because this React application uses `react-router-dom`, deep links (such as `/student-lookup`, `/student/dashboard`, and `/admin/dashboard`) require server rewrites to `/index.html`.

This is already pre-configured in [frontend/vercel.json](file:///c:/Users/USER/Downloads/Test%20Web/frontend/vercel.json):
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 5. Post-Deployment Verification Checklist

- [ ] Open your deployed URL (e.g., `https://your-app.vercel.app`).
- [ ] Ensure the amber "Demo Preview" banner is **NOT** visible (indicating live Google Sheets connection).
- [ ] Test the Student Lookup page using a real Student ID and Name from your Google Sheet.
- [ ] Verify that the academic summary card and score breakdown reflect the latest values in your sheet.
- [ ] Sign in to the Staff Portal (`/teacher-login`) and verify that all class statistics calculate properly.
- [ ] Test printing an official grade slip by clicking **"Print Grade Slip"**.
