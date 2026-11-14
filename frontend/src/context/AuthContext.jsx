import React, { createContext, useContext, useState, useEffect } from "react";
import { lookupStudent, loginStudentCredentials } from "../api/studentApi.js";
import { loginAdmin, loginUser } from "../api/adminApi.js";
import { purgeStudentCache, purgeAdminCache } from "../api/client.js";
import { dataSyncService } from "../services/dataSyncService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Student state (persisted across tabs in sessionStorage + localStorage)
  const [studentSession, setStudentSession] = useState(() => {
    try {
      const saved = sessionStorage.getItem("uni_student_session") || localStorage.getItem("uni_student_session");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Admin state (persisted across tabs in sessionStorage + localStorage)
  const [adminSession, setAdminSession] = useState(() => {
    try {
      const saved = sessionStorage.getItem("uni_admin_session") || localStorage.getItem("uni_admin_session");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isInitialMountStudent = React.useRef(true);
  const isInitialMountAdmin = React.useRef(true);

  // Save student session to both sessionStorage and localStorage (Safe against hydration wipes)
  useEffect(() => {
    if (isInitialMountStudent.current) {
      isInitialMountStudent.current = false;
      if (!studentSession) return;
    }
    if (studentSession) {
      try {
        const val = JSON.stringify(studentSession);
        sessionStorage.setItem("uni_student_session", val);
        localStorage.setItem("uni_student_session", val);
      } catch (_) {}
    } else {
      try {
        sessionStorage.removeItem("uni_student_session");
        localStorage.removeItem("uni_student_session");
      } catch (_) {}
    }
  }, [studentSession]);

  // Save admin session to both sessionStorage and localStorage (Safe against hydration wipes)
  useEffect(() => {
    if (isInitialMountAdmin.current) {
      isInitialMountAdmin.current = false;
      if (!adminSession) return;
    }
    if (adminSession) {
      try {
        const val = JSON.stringify(adminSession);
        sessionStorage.setItem("uni_admin_session", val);
        localStorage.setItem("uni_admin_session", val);
      } catch (_) {}
    } else {
      try {
        sessionStorage.removeItem("uni_admin_session");
        localStorage.removeItem("uni_admin_session");
      } catch (_) {}
    }
  }, [adminSession]);

  // Sync auth state across multiple browser tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "uni_admin_session") {
        try {
          setAdminSession(e.newValue ? JSON.parse(e.newValue) : null);
        } catch (_) {}
      }
      if (e.key === "uni_student_session") {
        try {
          setStudentSession(e.newValue ? JSON.parse(e.newValue) : null);
        } catch (_) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Real-Time Admin-to-Student Synchronization (Section 18.1)
  // Subscribes current authenticated student to instant push updates without full page reload
  useEffect(() => {
    if (!studentSession?.studentId) return;

    const currentStudentId = studentSession.studentId;
    const unsubStudentId = dataSyncService.subscribeToStudent(currentStudentId, () => {
      // Instantly trigger silent background refresh of student scores
      refreshStudentScores();
    });

    const unsubScores = dataSyncService.subscribeToEntity("scores", (evt) => {
      if (!evt.recordId || evt.recordId === "*" || evt.recordId === currentStudentId) {
        refreshStudentScores();
      }
    });

    const unsubStudents = dataSyncService.subscribeToEntity("students", (evt) => {
      if (!evt.recordId || evt.recordId === "*" || evt.recordId === currentStudentId) {
        refreshStudentScores();
      }
    });

    return () => {
      if (unsubStudentId) unsubStudentId();
      if (unsubScores) unsubScores();
      if (unsubStudents) unsubStudents();
    };
  }, [studentSession?.studentId, studentSession?.studentName]);

  /**
   * Student Login: Student Name (Username) and Student ID as Password
   */
  const loginStudent = async (studentName, studentId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginStudentCredentials(studentName, studentId);
      if (res.success && res.data) {
        const profile = res.data.profile || {};
        const sessionData = {
          studentId: profile.studentId || res.data.studentId || studentId,
          studentName: profile.fullNameKh || profile.fullNameEn || res.data.studentName || studentName,
          profile: profile,
          academicSummary: res.data.academicSummary,
          scores: res.data.scores,
          scoringMatrix: res.data.scoringMatrix || [],
          lastUpdated: res.data.lastUpdated || new Date().toISOString()
        };
        setStudentSession(sessionData);
        return { success: true };
      } else {
        const msg = res.message || "មិនស្វែងរកឃើញទិន្នន័យនិស្សិតឡើយ។ សូមពិនិត្យឈ្មោះ និងលេខសម្គាល់។";
        setError(msg);
        return { success: false, message: msg };
      }
    } catch (err) {
      const msg = err.message || "មានបញ្ហាបច្ចេកទេសកើតឡើងក្នុងការចូលប្រើប្រព័ន្ធ។";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh student scores from backend (Silent background refresh - zero UI reload)
   */
  const refreshStudentScores = async () => {
    if (!studentSession) return;
    try {
      const res = await lookupStudent(studentSession.studentId, studentSession.studentName, true);
      if (res.success && res.data) {
        setStudentSession((prev) => ({
          ...prev,
          profile: res.data.profile,
          academicSummary: res.data.academicSummary,
          scores: res.data.scores,
          scoringMatrix: res.data.scoringMatrix || [],
          lastUpdated: res.data.lastUpdated || new Date().toISOString()
        }));
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logoutStudent = () => {
    if (studentSession?.studentId) {
      purgeStudentCache(studentSession.studentId);
    }
    setStudentSession(null);
    try {
      sessionStorage.removeItem("uni_student_session");
      localStorage.removeItem("uni_student_session");
      sessionStorage.removeItem("active_print_student");
      localStorage.removeItem("active_print_student");
    } catch (_) {}
  };

  /**
   * Teacher / Admin Login: Username & Password against Google Sheet 🔐_Users
   */
  const loginTeacherAdmin = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      // First try universal user_login against 🔐_Users
      let res = await loginUser(username, password, "staff");
      if (!res.success) {
        // Fallback to admin_login
        res = await loginAdmin(username, password);
      }

      if (res.success && res.data) {
        const sessionData = {
          role: res.data.role || "admin",
          token: res.data.token,
          username: res.data.username || username,
          displayName: res.data.displayName || res.data.fullName || "អ្នកគ្រប់គ្រងប្រព័ន្ធ",
          permissions: res.data.permissions || ["READ_ALL_STUDENTS", "WRITE_STUDENTS", "MANAGE_USERS", "READ_ALL_SCORES"],
          loggedInAt: new Date().toISOString()
        };
        setAdminSession(sessionData);
        return { success: true };
      } else {
        const msg = res.message || "ឈ្មោះគណនី ឬលេខសម្ងាត់មិនត្រឹមត្រូវឡើយ។";
        setError(msg);
        return { success: false, message: msg };
      }
    } catch (err) {
      const msg = err.message || "មានបញ្ហាបច្ចេកទេសកើតឡើងក្នុងការចូលប្រើប្រព័ន្ធ។";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logoutAdmin = () => {
    purgeAdminCache();
    setAdminSession(null);
    try {
      sessionStorage.removeItem("uni_admin_session");
      localStorage.removeItem("uni_admin_session");
      sessionStorage.removeItem("active_print_student");
      localStorage.removeItem("active_print_student");
    } catch (_) {}
  };

  return (
    <AuthContext.Provider
      value={{
        studentSession,
        adminSession,
        loading,
        error,
        setError,
        loginStudent,
        refreshStudentScores,
        logoutStudent,
        loginTeacherAdmin,
        logoutAdmin,
        isStudentAuthenticated: !!studentSession,
        isAdminAuthenticated: !!adminSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
