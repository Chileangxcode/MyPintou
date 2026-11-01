import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { SchoolProvider } from "./context/SchoolContext.jsx";
import { AnnouncementProvider } from "./context/AnnouncementContext.jsx";
import { ELibraryProvider } from "./context/ELibraryContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import PWAUpdateModal from "./components/PWAUpdateModal.jsx";
import PWAInstallPrompt from "./components/PWAInstallPrompt.jsx";
import OfflineBanner from "./components/OfflineBanner.jsx";
import { registerPWA } from "./utils/pwaManager.js";

export default function App() {
  useEffect(() => {
    // Initialize PWA Service Worker & Automatic Update Lifecycle
    registerPWA();
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <SchoolProvider>
          <AuthProvider>
            <AnnouncementProvider>
              <ELibraryProvider>
                <OfflineBanner />
                <ErrorBoundary>
                  <AppRoutes />
                </ErrorBoundary>
                <PWAUpdateModal />
                <PWAInstallPrompt />
              </ELibraryProvider>
            </AnnouncementProvider>
          </AuthProvider>
        </SchoolProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
