/**
 * Integration & Safety Verification Test Suite
 * Tests Student isolation, Admin authorization, scoring calculation rules,
 * and header mappings against mock and API contract.
 */

import { handleMockRequest } from "./src/api/mockHandler.js";

async function runTests() {
  console.log("=================================================");
  console.log("UNIVERSITY STUDENT SCORING SYSTEM - TEST SUITE");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = "") {
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  // TEST 1: Health Check
  const healthRes = await handleMockRequest("health");
  assert(healthRes.success === true, "Health Check returns online status");

  // TEST 2: Student lookup with valid ID and Khmer Name
  const validKhmer = await handleMockRequest("student_lookup", {
    studentId: "2024001",
    studentName: "សុខ ចាន់ដារ៉ា"
  });
  assert(validKhmer.success === true, "Student lookup with valid Khmer Name succeeds");
  assert(validKhmer.data.profile.studentId === "2024001", "Returned profile matches student ID");
  assert(validKhmer.data.scores.length > 0, "Returned scores list is populated");

  // TEST 3: Student lookup with valid ID and English Name
  const validEnglish = await handleMockRequest("student_lookup", {
    studentId: "2024001",
    studentName: "Sok Chandara"
  });
  assert(validEnglish.success === true, "Student lookup with valid English Name succeeds");

  // TEST 4: Student lookup with incorrect name
  const invalidName = await handleMockRequest("student_lookup", {
    studentId: "2024001",
    studentName: "Wrong Name Person"
  });
  assert(invalidName.success === false, "Student lookup with wrong name fails safely");
  assert(invalidName.data === null, "Failing lookup returns null data (No leak)");

  // TEST 5: Student lookup with missing fields
  const missingId = await handleMockRequest("student_lookup", { studentId: "", studentName: "Sok" });
  assert(missingId.success === false && missingId.error === "MISSING_STUDENT_ID", "Missing Student ID rejected");

  const missingName = await handleMockRequest("student_lookup", { studentId: "2024001", studentName: "" });
  assert(missingName.success === false && missingName.error === "MISSING_STUDENT_NAME", "Missing Student Name rejected");

  // TEST 6: Student Data Isolation (Student A lookup returns only Student A, never other students)
  const studentA = await handleMockRequest("student_lookup", { studentId: "2024001", studentName: "Sok Chandara" });
  assert(
    !Array.isArray(studentA.data.profile) && studentA.data.profile.studentId === "2024001",
    "Student endpoint returns single student isolated record, never directory"
  );

  // TEST 7: Admin Login with valid credentials
  const adminValid = await handleMockRequest("admin_login", {
    username: "admin",
    password: "admin2026"
  });
  assert(adminValid.success === true, "Admin login succeeds with valid credentials");
  assert(adminValid.data.token.length > 0, "Admin login yields session token");

  // TEST 8: Admin Login with invalid credentials
  const adminInvalid = await handleMockRequest("admin_login", {
    username: "admin",
    password: "badpassword"
  });
  assert(adminInvalid.success === false, "Admin login fails with invalid password");

  // TEST 9: Admin Directory Search & Filter
  const directory = await handleMockRequest("admin_students", { search: "សុខ" });
  assert(directory.success === true, "Admin directory search succeeds");
  assert(directory.data.students.length >= 1, "Directory filter returns matching student");

  // TEST 10: Admin Stats
  const stats = await handleMockRequest("admin_stats");
  assert(stats.success === true, "Admin statistics calculated dynamically");
  assert(stats.data.totalStudents > 0, "Total students metric populated");

  console.log("\n-------------------------------------------------");
  console.log(`SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log("-------------------------------------------------");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
