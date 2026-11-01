import { apiRequest } from "./client.js";

/**
 * Student API Methods
 */

export async function lookupStudent(studentId, studentName, refresh = false) {
  return apiRequest("student_lookup", {
    studentId: studentId.trim(),
    studentName: studentName.trim(),
    refresh: refresh ? "true" : "false"
  });
}

/**
 * Student Login using Student Name (Username) and Student ID as Password
 */
export async function loginStudentCredentials(studentName, studentIdAsPassword) {
  // First try user_login endpoint from 🔐_Users
  const loginRes = await apiRequest("user_login", {
    username: studentName.trim(),
    password: studentIdAsPassword.trim(),
    studentName: studentName.trim(),
    studentId: studentIdAsPassword.trim(),
    role: "student"
  });

  if (loginRes.success && loginRes.data) {
    return loginRes;
  }

  // Fallback to student_lookup if user_login fails or is initializing
  return lookupStudent(studentIdAsPassword, studentName);
}

export async function getStudentProfile(studentId, studentName) {
  return apiRequest("student_profile", {
    studentId: studentId.trim(),
    studentName: studentName.trim()
  });
}

export async function getStudentScores(studentId, studentName, filters = {}) {
  return apiRequest("student_scores", {
    studentId: studentId.trim(),
    studentName: studentName.trim(),
    ...filters
  });
}
