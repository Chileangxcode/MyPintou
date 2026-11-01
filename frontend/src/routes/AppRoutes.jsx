import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout.jsx";
import StudentLayout from "../layouts/StudentLayout.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";

// Eagerly loaded critical landing page
import LandingPage from "../pages/LandingPage.jsx";

// Resilient dynamic page importer that auto-retries on Vite HMR updates, network blips, or deployment chunk invalidations
function lazyWithRetry(factory) {
  return lazy(() => {
    return new Promise((resolve, reject) => {
      const attempt = (retriesLeft) => {
        factory()
          .then(resolve)
          .catch((error) => {
            const isChunkError =
              error?.message?.includes("Failed to fetch dynamically imported module") ||
              error?.name === "ChunkLoadError" ||
              error?.message?.includes("dynamically imported module") ||
              error?.message?.includes("Importing a module script failed");

            if (isChunkError && retriesLeft > 0) {
              setTimeout(() => attempt(retriesLeft - 1), 600);
            } else if (isChunkError) {
              const navKey = `retry_lazy_${window.location.pathname}`;
              const alreadyRefreshed = sessionStorage.getItem(navKey);
              if (!alreadyRefreshed) {
                sessionStorage.setItem(navKey, "true");
                window.location.reload();
              } else {
                sessionStorage.removeItem(navKey);
                reject(error);
              }
            } else {
              reject(error);
            }
          });
      };
      attempt(2);
    });
  });
}

// Code-split lazy loaded secondary & authenticated pages for fast mobile performance
const StudentDashboard = lazyWithRetry(() => import("../pages/StudentDashboard.jsx"));
const StudentProfilePage = lazyWithRetry(() => import("../pages/StudentProfilePage.jsx"));
const PrintableResultPage = lazyWithRetry(() => import("../pages/PrintableResultPage.jsx"));
const AdminDashboard = lazyWithRetry(() => import("../pages/AdminDashboard.jsx"));
const StudentDirectoryPage = lazyWithRetry(() => import("../pages/StudentDirectoryPage.jsx"));
const AcademicScoringPage = lazyWithRetry(() => import("../pages/AcademicScoringPage.jsx"));
const SettingsPage = lazyWithRetry(() => import("../pages/SettingsPage.jsx"));
const UnauthorizedPage = lazyWithRetry(() => import("../pages/UnauthorizedPage.jsx"));
const NotFoundPage = lazyWithRetry(() => import("../pages/NotFoundPage.jsx"));
const StudentQuizzesPage = lazyWithRetry(() => import("../pages/StudentQuizzesPage.jsx"));
const AnnouncementsPage = lazyWithRetry(() => import("../pages/AnnouncementsPage.jsx"));
const BulkReportsPage = lazyWithRetry(() => import("../pages/BulkReportsPage.jsx"));
const DigitalCertificatesPage = lazyWithRetry(() => import("../pages/DigitalCertificatesPage.jsx"));
const AdminLibraryPage = lazyWithRetry(() => import("../pages/AdminLibraryPage.jsx"));
const DeansHonorsPage = lazyWithRetry(() => import("../pages/DeansHonorsPage.jsx"));
const StudentLibraryPage = lazyWithRetry(() => import("../pages/StudentLibraryPage.jsx"));
const ClassroomGamesPage = lazyWithRetry(() => import("../pages/ClassroomGamesPage.jsx"));
const UserManagementPage = lazyWithRetry(() => import("../pages/UserManagementPage.jsx"));
const AdminQuizzesPage = lazyWithRetry(() => import("../pages/AdminQuizzesPage.jsx"));

const PageLoadingFallback = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 gap-3 animate-fade-in font-khmer">
    <div className="w-10 h-10 border-3 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
    <span className="text-xs text-slate-400 font-medium">កំពុងដំណើរការ...</span>
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        {/* Standalone Immersive Landing & Unified Auth Portal (Student First!) */}
        <Route path="/" element={<LandingPage defaultTab="student" />} />
        <Route path="/login" element={<LandingPage defaultTab="student" />} />
        <Route path="/student-login" element={<LandingPage defaultTab="student" />} />
        <Route path="/student-lookup" element={<LandingPage defaultTab="student" />} />
        <Route path="/teacher-login" element={<LandingPage defaultTab="staff" />} />

        {/* Public Secondary Pages with MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/404" element={<NotFoundPage />} />
        </Route>

        {/* Student Protected Section */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="library" element={<StudentLibraryPage />} />
          <Route path="quizzes" element={<StudentQuizzesPage />} />
          <Route path="profile" element={<StudentProfilePage />} />
          <Route path="print" element={<PrintableResultPage />} />
        </Route>

        {/* Teacher / Admin Protected Section */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<StudentDirectoryPage />} />
          <Route path="scoring" element={<AcademicScoringPage />} />
          <Route path="quizzes" element={<AdminQuizzesPage />} />
          <Route path="honors" element={<DeansHonorsPage />} />
          <Route path="library" element={<AdminLibraryPage />} />
          <Route path="picker" element={<Navigate to="/admin/wheel" replace />} />
          <Route path="race-game" element={<ClassroomGamesPage defaultTab="race" />} />
          <Route path="wheel" element={<ClassroomGamesPage defaultTab="wheel" />} />
          <Route path="groups" element={<ClassroomGamesPage defaultTab="groups" />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="reports" element={<BulkReportsPage />} />
          <Route path="certificates" element={<DigitalCertificatesPage />} />
          <Route path="print" element={<PrintableResultPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Wildcard Fallback */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}
