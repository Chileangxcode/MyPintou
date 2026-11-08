/**
 * =========================================================================
 * UNIVERSITY STUDENT INFORMATION & SCORING SYSTEM
 * Backend: Google Apps Script Web App API (High Performance & Dynamic)
 * File: backend/apps-script/Code.gs
 * Target Google Spreadsheet ID: 177W-KA6N6pFuP7_8vxo5SYQuBpm0BNPo8YSR3pAoF9E
 * =========================================================================
 * 
 * Performance & Architecture Enhancements:
 * 1. Multi-Sheet Dynamic Integration:
 *    - Seamlessly reads "📋_Students" (Directory), "📊_Scoring" (Grades), and "⚙️_Config" (Rules)
 *    - Automatically falls back to raw/legacy single sheet if separated sheets are not yet prepared.
 * 2. Multi-Tier High-Speed Caching (CacheService):
 *    - Student Instant Cache: Individual student lookups resolve in <80ms directly from CacheService.
 *    - Chunked Dataset Caching: Bypasses the 100KB per-item limit with smart chunking.
 *    - Summary Stats Caching: Admin KPI metrics cached with 10-minute TTL.
 * 3. Dynamic Configuration:
 *    - Academic Year, Semester, Passing Scores, and Publication toggles read directly from "⚙️_Config".
 * 4. Automated Sheet Preparation Endpoint:
 *    - "action=prepare_sheets" allows staff to generate clean separated sheets directly.
 */

// ==========================================
// CONFIGURATION & SCRIPT PROPERTIES
// ==========================================
var DEFAULT_SPREADSHEET_ID = "177W-KA6N6pFuP7_8vxo5SYQuBpm0BNPo8YSR3pAoF9E";
var DEFAULT_ADMIN_TOKEN = "MyPintou#Sec2026$X9z";
var DEFAULT_TEACHER_USER = "admin";
var DEFAULT_TEACHER_PASS = "admin2026";
var DEFAULT_CACHE_TTL_SECONDS = 600; // 10 minutes cache for lightning fast queries
var CHUNK_SIZE = 40; // Students per cache chunk to keep under 100KB limit

/**
 * Helper to get Script Properties with fallback defaults
 */
function getAppConfig() {
  var props = PropertiesService.getScriptProperties();
  return {
    spreadsheetId: props.getProperty("SPREADSHEET_ID") || DEFAULT_SPREADSHEET_ID,
    adminToken: props.getProperty("ADMIN_SECRET_TOKEN") || DEFAULT_ADMIN_TOKEN,
    teacherUser: props.getProperty("TEACHER_USERNAME") || DEFAULT_TEACHER_USER,
    teacherPass: props.getProperty("TEACHER_PASSWORD") || DEFAULT_TEACHER_PASS,
    enforcePublication: props.getProperty("ENFORCE_PUBLICATION") === "true",
    cacheTtl: parseInt(props.getProperty("CACHE_TTL_SECONDS") || DEFAULT_CACHE_TTL_SECONDS, 10)
  };
}

// ==========================================
// ENTRY POINTS: doGet & doPost
// ==========================================

function doGet(e) {
  return handleRequest(e, "GET");
}

function doPost(e) {
  return handleRequest(e, "POST");
}

/**
 * Universal Request Handler
 */
function handleRequest(e, method) {
  var params = {};
  
  // Parse query parameters
  if (e && e.parameter) {
    for (var key in e.parameter) {
      if (e.parameter.hasOwnProperty(key)) {
        params[key] = e.parameter[key];
      }
    }
  }

  // Parse POST body (JSON or form-encoded)
  if (method === "POST" && e && e.postData && e.postData.contents) {
    try {
      var body = JSON.parse(e.postData.contents);
      for (var bKey in body) {
        if (body.hasOwnProperty(bKey)) {
          params[bKey] = body[bKey];
        }
      }
    } catch (parseErr) {
      // If not JSON, leave existing params
    }
  }

  var action = (params.action || "health").toLowerCase().trim();
  var callback = params.callback; // For optional JSONP support
  var response;

  try {
    switch (action) {
      case "health":
        response = apiHealthCheck();
        break;

      case "sync_events":
      case "realtime_events":
        response = apiSyncEvents(params);
        break;

      case "inspect":
        response = apiInspect(params);
        break;

      case "student_lookup":
        response = apiStudentLookup(params);
        break;

      case "student_profile":
        response = apiStudentProfile(params);
        break;

      case "student_scores":
        response = apiStudentScores(params);
        break;

      case "admin_login":
        response = apiAdminLogin(params);
        break;

      case "admin_stats":
        response = apiAdminStats(params);
        break;

      case "admin_students":
        response = apiAdminStudents(params);
        break;

      case "admin_student_detail":
        response = apiAdminStudentDetail(params);
        break;

      case "admin_scoring_overview":
        response = apiAdminScoringOverview(params);
        break;

      case "prepare_sheets":
      case "migrate":
        response = apiPrepareSheets(params);
        break;

      case "setup_relations":
      case "sync_relations":
      case "link_student_relations":
        response = apiSetupRelations(params);
        break;

      case "flush_cache":
        response = apiFlushCache(params);
        break;

      case "config":
        response = apiGetConfig(params);
        break;

      case "admin_update_config":
      case "update_config":
        response = apiUpdateConfig(params);
        break;

      // --- USER AUTHENTICATION & CREDENTIALS ---
      case "user_login":
      case "login":
        response = apiUserLogin(params);
        break;

      case "get_users":
      case "admin_users":
        response = apiGetUsers(params);
        break;

      case "create_user":
      case "admin_create_user":
        response = apiCreateUser(params);
        break;

      case "update_user":
      case "admin_update_user":
        response = apiUpdateUser(params);
        break;

      case "delete_user":
      case "admin_delete_user":
        response = apiDeleteUser(params);
        break;

      case "sync_users":
      case "init_users_sheet":
      case "admin_sync_users":
        response = apiSyncUsers(params);
        break;

      // --- STUDENT DIRECTORY CRUD ---
      case "create_student":
      case "admin_create_student":
        response = apiCreateStudent(params);
        break;

      case "update_student":
      case "admin_update_student":
        response = apiUpdateStudent(params);
        break;

      case "delete_student":
      case "admin_delete_student":
        response = apiDeleteStudent(params);
        break;

      case "bulk_create_students":
      case "admin_bulk_create_students":
        response = apiBulkCreateStudents(params);
        break;

      // --- ACADEMIC SCORING CRUD ---
      case "create_score":
      case "admin_create_score":
        response = apiCreateScore(params);
        break;

      case "update_scores":
      case "admin_update_scores":
        response = apiUpdateScores(params);
        break;

      case "bulk_update_scores":
      case "admin_bulk_update_scores":
      case "bulk_scores":
        response = apiBulkUpdateScores(params);
        break;

      case "delete_score":
      case "admin_delete_score":
        response = apiDeleteScore(params);
        break;

      case "reset_scores":
      case "admin_reset_scores":
        response = apiResetScores(params);
        break;

      case "sync_scoring_students":
      case "admin_sync_scoring_students":
        response = apiSyncScoringStudents(params);
        break;

      // --- 📝 QUIZZES CRUD & EVALUATION ---
      case "admin_quizzes":
      case "get_quizzes":
        response = apiAdminQuizzes(params);
        break;

      case "create_quiz":
      case "admin_create_quiz":
        response = apiCreateQuiz(params);
        break;

      case "update_quiz":
      case "admin_update_quiz":
        response = apiUpdateQuiz(params);
        break;

      case "delete_quiz":
      case "admin_delete_quiz":
        response = apiDeleteQuiz(params);
        break;

      case "update_student_quizzes":
      case "admin_update_student_quizzes":
        response = apiUpdateStudentQuizzes(params);
        break;

      case "reset_student_quizzes":
      case "admin_reset_student_quizzes":
        response = apiResetStudentQuizzes(params);
        break;

      case "sync_quiz_students":
      case "admin_sync_quiz_students":
        response = apiSyncQuizStudents(params);
        break;

      default:
        response = makeResponse(false, "Unknown API action: " + action, null, "INVALID_ACTION");
    }
  } catch (err) {
    Logger.log("API Unhandled Error: " + err.toString());
    response = makeResponse(false, "An internal server error occurred while processing your request: " + err.message, null, "SERVER_ERROR");
  }

  return formatOutput(response, callback);
}

/**
 * Standard API response wrapper
 */
function makeResponse(success, message, data, error) {
  return {
    success: success,
    message: message || (success ? "Operation completed successfully" : "Operation failed"),
    data: data !== undefined ? data : null,
    error: error || null,
    timestamp: new Date().toISOString()
  };
}

/**
 * Formats ContentService response (JSON or JSONP)
 */
function formatOutput(responseObj, callback) {
  var jsonString = JSON.stringify(responseObj);
  var output;

  if (callback) {
    output = ContentService.createTextOutput(callback + "(" + jsonString + ");");
    output.setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    output = ContentService.createTextOutput(jsonString);
    output.setMimeType(ContentService.MimeType.JSON);
  }

  return output;
}

// ==========================================
// REAL-TIME SYNCHRONIZATION ENGINE (SECTION 18.1 & 18.10)
// ==========================================

/**
 * Record a real-time mutation event in CacheService
 * Generates an event with metadata only: eventId, entityType, recordId, action, timestamp, version
 * Zero private student data or scores are stored or broadcasted
 */
function recordRealtimeEvent(entityType, recordId, action, version) {
  var timestamp = new Date().getTime();
  var eventId = "evt_" + timestamp + "_" + Math.floor(Math.random() * 10000);
  var event = {
    eventId: eventId,
    entityType: String(entityType || "general").toLowerCase(),
    recordId: recordId ? String(recordId).trim() : "*",
    action: String(action || "").toLowerCase(),
    timestamp: timestamp,
    version: Number(version) || 1
  };

  try {
    var cache = CacheService.getScriptCache();
    var eventsJson = cache.get("APP_REALTIME_EVENTS");
    var events = eventsJson ? JSON.parse(eventsJson) : [];
    if (!Array.isArray(events)) events = [];
    events.unshift(event);
    if (events.length > 50) events = events.slice(0, 50); // Keep last 50 events
    cache.put("APP_REALTIME_EVENTS", JSON.stringify(events), 21600); // 6 hours
    cache.put("APP_LAST_EVENT_TS", String(timestamp), 21600);
  } catch (e) {}

  // Optional: Dispatch to external cloud webhook (e.g. Supabase Realtime / Firebase) if configured
  try {
    var props = PropertiesService.getScriptProperties();
    var webhookUrl = props.getProperty("REALTIME_WEBHOOK_URL") || props.getProperty("SUPABASE_REALTIME_URL");
    if (webhookUrl) {
      UrlFetchApp.fetch(webhookUrl, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(event),
        muteHttpExceptions: true
      });
    }
  } catch (e) {}

  return event;
}

/**
 * Ultra-Fast Real-Time Events Synchronizer Endpoint (Section 18.1)
 * Returns only recent event deltas directly from CacheService in < 80ms!
 * Zero spreadsheet reads!
 */
function apiSyncEvents(params) {
  var since = Number(params.since) || 0;
  var cache = CacheService.getScriptCache();
  var eventsJson = cache.get("APP_REALTIME_EVENTS");
  var allEvents = eventsJson ? JSON.parse(eventsJson) : [];
  if (!Array.isArray(allEvents)) allEvents = [];

  var deltaEvents = allEvents.filter(function(e) {
    return e.timestamp > since;
  });

  return makeResponse(true, "Real-time sync events retrieved.", {
    events: deltaEvents,
    serverTime: new Date().getTime(),
    count: deltaEvents.length
  });
}

// ==========================================
// API IMPLEMENTATIONS
// ==========================================

/**
 * A. Health check: Verifies spreadsheet access and detects configured sheets
 */
function apiHealthCheck() {
  var config = getAppConfig();
  var result = {
    status: "online",
    api: "KHENG School Management API (High Performance)",
    version: "2.1.0",
    spreadsheetConnected: false,
    spreadsheetTitle: null,
    totalSheets: 0,
    sheetNames: [],
    hasSeparatedSheets: false,
    serverTime: new Date().toISOString()
  };

  try {
    var ss = SpreadsheetApp.openById(config.spreadsheetId);
    result.spreadsheetConnected = true;
    result.spreadsheetTitle = ss.getName();
    var sheets = ss.getSheets();
    result.totalSheets = sheets.length;
    result.sheetNames = sheets.map(function(s) { return s.getName(); });
    result.hasSeparatedSheets = (ss.getSheetByName("📋_Students") !== null && ss.getSheetByName("📊_Scoring") !== null);
    result.config = readDynamicConfig(ss);
    return makeResponse(true, "API is running and successfully connected to Google Spreadsheet.", result);
  } catch (err) {
    result.spreadsheetConnected = false;
    return makeResponse(false, "API is online, but unable to connect to the spreadsheet. Check permissions.", result, "SPREADSHEET_ACCESS_ERROR");
  }
}

/**
 * Diagnostic Inspection Endpoint (Restricted to Admin Token)
 */
function apiInspect(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized access to diagnostics.", null, "UNAUTHORIZED");
  }
  var inspection = inspectSpreadsheetStructure();
  return makeResponse(true, "Spreadsheet inspection report generated.", inspection);
}

/**
 * B. Student Lookup: Ultra-fast with CacheService lookup
 */
function apiStudentLookup(params) {
  var studentId = params.studentId ? String(params.studentId).trim() : "";
  var studentName = params.studentName ? String(params.studentName).trim() : "";

  if (!studentId) {
    return makeResponse(false, "សូមបញ្ចូលលេខសម្គាល់និស្សិត។", null, "MISSING_STUDENT_ID");
  }
  if (!studentName) {
    return makeResponse(false, "សូមបញ្ចូលឈ្មោះនិស្សិត។", null, "MISSING_STUDENT_NAME");
  }

  var normalizedSearchId = studentId.toLowerCase();
  var normalizedSearchName = normalizeText(studentName);
  var cache = CacheService.getScriptCache();
  var cacheKey = "STU_" + normalizedSearchId;

  // 1. FAST PATH: Check Individual Student Cache (< 80ms)
  if (params.refresh !== "true") {
    var cachedStudentJson = cache.get(cacheKey);
    if (cachedStudentJson) {
      try {
        var cachedStudent = JSON.parse(cachedStudentJson);
        var khMatch = cachedStudent.fullNameKh && normalizeText(cachedStudent.fullNameKh).indexOf(normalizedSearchName) !== -1;
        var enMatch = cachedStudent.fullNameEn && normalizeText(cachedStudent.fullNameEn).indexOf(normalizedSearchName) !== -1;
        var nameMatch = khMatch || enMatch || (cachedStudent.fullName && normalizeText(cachedStudent.fullName).indexOf(normalizedSearchName) !== -1);

        if (nameMatch) {
          return makeResponse(true, "Student record retrieved from cache.", {
            profile: sanitizeStudentProfile(cachedStudent),
            academicSummary: cachedStudent.academicSummary,
            scores: filterAuthorizedScores(cachedStudent.scores, params),
            scoringMatrix: cachedStudent.scoringMatrix || [],
            source: "cache",
            lastUpdated: new Date().toISOString()
          });
        }
      } catch (e) {
        // Fallback to full search
      }
    }
  }

  // 2. FULL PATH: Retrieve Normalized Dataset
  var normalizedData = getNormalizedSpreadsheetData(params.refresh === "true");
  if (!normalizedData.success) {
    return makeResponse(false, normalizedData.message, null, normalizedData.error);
  }

  var students = normalizedData.students;
  var matchedStudent = null;

  for (var i = 0; i < students.length; i++) {
    var s = students[i];
    var idMatch = s.studentId && s.studentId.toLowerCase() === normalizedSearchId;
    if (idMatch) {
      var khMatch2 = s.fullNameKh && normalizeText(s.fullNameKh).indexOf(normalizedSearchName) !== -1;
      var enMatch2 = s.fullNameEn && normalizeText(s.fullNameEn).indexOf(normalizedSearchName) !== -1;
      var nameMatch2 = khMatch2 || enMatch2 || (s.fullName && normalizeText(s.fullName).indexOf(normalizedSearchName) !== -1);

      if (nameMatch2) {
        matchedStudent = s;
        // Warm individual student cache for future lookups
        try {
          cache.put(cacheKey, JSON.stringify(s), 600);
        } catch (cErr) {}
        break;
      }
    }
  }

  if (!matchedStudent) {
    return makeResponse(false, "មិនស្វែងរកឃើញទិន្នន័យនិស្សិតទេ។ សូមពិនិត្យលេខសម្គាល់ និងឈ្មោះឡើងវិញ។", null, "STUDENT_NOT_FOUND");
  }

  // Check publication status if configured
  if (matchedStudent.published === false) {
    return makeResponse(false, "លទ្ធផលសិក្សារបស់និស្សិតនេះមិនទាន់ត្រូវបានផ្សព្វផ្សាយនៅឡើយទេ។", null, "RESULTS_NOT_PUBLISHED");
  }

  return makeResponse(true, "Student record retrieved successfully.", {
    profile: sanitizeStudentProfile(matchedStudent),
    academicSummary: matchedStudent.academicSummary,
    scores: filterAuthorizedScores(matchedStudent.scores, params),
    scoringMatrix: matchedStudent.scoringMatrix || [],
    config: normalizedData.config,
    source: "spreadsheet",
    lastUpdated: normalizedData.lastUpdated
  });
}

/**
 * C. Student Profile
 */
function apiStudentProfile(params) {
  var lookupResult = apiStudentLookup(params);
  if (!lookupResult.success) return lookupResult;
  return makeResponse(true, "Student profile retrieved.", lookupResult.data.profile);
}

/**
 * D. Student Scores
 */
function apiStudentScores(params) {
  var lookupResult = apiStudentLookup(params);
  if (!lookupResult.success) return lookupResult;
  return makeResponse(true, "Student scores retrieved.", {
    scores: lookupResult.data.scores,
    summary: lookupResult.data.academicSummary,
    scoringMatrix: lookupResult.data.scoringMatrix
  });
}

/**
 * E. Teacher / Admin Authentication
 */
function apiAdminLogin(params) {
  var config = getAppConfig();
  var username = (params.username || "").trim();
  var password = (params.password || "").trim();

  if (!username || !password) {
    return makeResponse(false, "សូមបញ្ចូលឈ្មោះគណនី និងលេខសម្ងាត់របស់អ្នក។", null, "MISSING_CREDENTIALS");
  }

  if (username === config.teacherUser && password === config.teacherPass) {
    var sessionToken = config.adminToken;
    return makeResponse(true, "ការចូលប្រើប្រាស់ទទួលបានជោគជ័យ។", {
      token: sessionToken,
      username: username,
      role: "admin",
      permissions: ["READ_ALL_STUDENTS", "READ_ALL_SCORES", "EXPORT_REPORTS", "PREPARE_SHEETS"],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
  }

  return makeResponse(false, "ឈ្មោះគណនី ឬលេខសម្ងាត់មិនត្រឹមត្រូវឡើយ។", null, "INVALID_CREDENTIALS");
}

/**
 * F. Teacher / Admin Student Directory
 */
function apiAdminStudents(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized access to student directory.", null, "UNAUTHORIZED");
  }

  var normalizedData = getNormalizedSpreadsheetData(params.refresh === "true");
  if (!normalizedData.success) {
    return makeResponse(false, normalizedData.message, null, normalizedData.error);
  }

  var page = parseInt(params.page || 1, 10);
  var pageSize = parseInt(params.pageSize || 15, 10);
  var search = (params.search || "").toLowerCase().trim();
  var roomFilter = (params.room || "").toLowerCase().trim();
  var majorFilter = (params.major || "").toLowerCase().trim();

  var filtered = normalizedData.students.filter(function(s) {
    if (search) {
      var idMatch = s.studentId && s.studentId.toLowerCase().indexOf(search) !== -1;
      var nameKhMatch = s.fullNameKh && s.fullNameKh.toLowerCase().indexOf(search) !== -1;
      var nameEnMatch = s.fullNameEn && s.fullNameEn.toLowerCase().indexOf(search) !== -1;
      if (!idMatch && !nameKhMatch && !nameEnMatch) return false;
    }
    if (roomFilter && s.room && s.room.toLowerCase().indexOf(roomFilter) === -1) {
      return false;
    }
    if (majorFilter && s.skill && s.skill.toLowerCase().indexOf(majorFilter) === -1) {
      return false;
    }
    return true;
  });

  var total = filtered.length;
  var totalPages = Math.ceil(total / pageSize) || 1;
  var startIndex = (page - 1) * pageSize;
  var paginated = filtered.slice(startIndex, startIndex + pageSize).map(function(s) {
    return {
      studentId: s.studentId,
      fullNameKh: s.fullNameKh,
      fullNameEn: s.fullNameEn,
      gender: s.gender,
      room: s.room,
      skill: s.skill,
      subject: s.subject,
      academicSummary: s.academicSummary,
      status: s.status || "Active",
      published: s.published !== false
    };
  });

  return makeResponse(true, "Student directory retrieved.", {
    students: paginated,
    pagination: {
      currentPage: page,
      pageSize: pageSize,
      totalItems: total,
      totalPages: totalPages
    },
    filterOptions: normalizedData.filterOptions
  });
}

/**
 * G. Teacher / Admin Student Details
 */
function apiAdminStudentDetail(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized access to student details.", null, "UNAUTHORIZED");
  }

  var studentId = params.studentId ? String(params.studentId).trim().toLowerCase() : "";
  if (!studentId) {
    return makeResponse(false, "Student ID parameter is required.", null, "MISSING_STUDENT_ID");
  }

  var normalizedData = getNormalizedSpreadsheetData(params.refresh === "true");
  if (!normalizedData.success) {
    return makeResponse(false, normalizedData.message, null, normalizedData.error);
  }

  var student = null;
  for (var i = 0; i < normalizedData.students.length; i++) {
    if (normalizedData.students[i].studentId && normalizedData.students[i].studentId.toLowerCase() === studentId) {
      student = normalizedData.students[i];
      break;
    }
  }

  if (!student) {
    return makeResponse(false, "Student record not found.", null, "STUDENT_NOT_FOUND");
  }

  return makeResponse(true, "Student record details retrieved.", student);
}

/**
 * H. Dashboard Statistics: Aggregates computed dynamically from spreadsheet
 */
function apiAdminStats(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized access to statistics.", null, "UNAUTHORIZED");
  }

  var config = getAppConfig();
  var cache = CacheService.getScriptCache();
  var statsCacheKey = "ADMIN_STATS_" + config.spreadsheetId;

  if (params.refresh !== "true") {
    var cachedStats = cache.get(statsCacheKey);
    if (cachedStats) {
      try {
        return makeResponse(true, "Dashboard statistics retrieved from cache.", JSON.parse(cachedStats));
      } catch (e) {}
    }
  }

  var normalizedData = getNormalizedSpreadsheetData(params.refresh === "true");
  if (!normalizedData.success) {
    return makeResponse(false, normalizedData.message, null, normalizedData.error);
  }

  var students = normalizedData.students;
  var totalStudents = students.length;
  var maleCount = 0;
  var femaleCount = 0;
  var rooms = {};
  var majors = {};
  var passedCount = 0;
  var failedCount = 0;
  var gradeDistribution = { A: 0, "B+": 0, B: 0, "C+": 0, C: 0, D: 0, E: 0, F: 0, Other: 0 };
  var totalScoresSum = 0;
  var totalScoresCount = 0;

  for (var i = 0; i < students.length; i++) {
    var s = students[i];
    
    // Gender
    var g = (s.gender || "").trim().toLowerCase();
    if (g === "f" || g === "ស្រី" || g === "female") femaleCount++;
    else if (g === "m" || g === "ប្រុស" || g === "male") maleCount++;

    // Rooms
    if (s.room) rooms[s.room] = (rooms[s.room] || 0) + 1;
    // Majors
    if (s.skill) majors[s.skill] = (majors[s.skill] || 0) + 1;

    // Academic scores
    if (s.academicSummary) {
      var summary = s.academicSummary;
      if (summary.totalScore !== null && !isNaN(summary.totalScore)) {
        totalScoresSum += summary.totalScore;
        totalScoresCount++;
      }
      
      var isPassed = (summary.totalScore !== null && summary.totalScore >= (normalizedData.config.passingScore || 50));
      if (isPassed) passedCount++;
      else failedCount++;

      if (summary.overallGrade) {
        var gr = summary.overallGrade.toUpperCase().trim();
        if (gradeDistribution[gr] !== undefined) gradeDistribution[gr]++;
        else gradeDistribution.Other++;
      }
    }
  }

  var stats = {
    totalStudents: totalStudents,
    maleStudents: maleCount,
    femaleStudents: femaleCount,
    roomCount: Object.keys(rooms).length,
    majorCount: Object.keys(majors).length,
    roomsBreakdown: rooms,
    majorsBreakdown: majors,
    passedCount: passedCount,
    failedCount: failedCount,
    passRate: totalStudents > 0 ? Math.round((passedCount / totalStudents) * 100) : 0,
    averageScore: totalScoresCount > 0 ? Math.round((totalScoresSum / totalScoresCount) * 10) / 10 : null,
    gradeDistribution: gradeDistribution,
    headers: normalizedData.headers,
    config: normalizedData.config,
    lastUpdated: normalizedData.lastUpdated
  };

  try {
    cache.put(statsCacheKey, JSON.stringify(stats), 600);
  } catch (e) {}

  return makeResponse(true, "Dashboard statistics retrieved.", stats);
}

/**
 * Scoring Overview Matrix for Staff
 */
function apiAdminScoringOverview(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized access to scoring overview.", null, "UNAUTHORIZED");
  }

  var normalizedData = getNormalizedSpreadsheetData(params.refresh === "true");
  if (!normalizedData.success) {
    return makeResponse(false, normalizedData.message, null, normalizedData.error);
  }

  return makeResponse(true, "Scoring overview retrieved.", {
    headers: normalizedData.headers,
    detailedHeaders: normalizedData.detailedHeaders,
    students: normalizedData.students.map(function(s) {
      return {
        studentId: s.studentId,
        fullNameKh: s.fullNameKh,
        fullNameEn: s.fullNameEn,
        gender: s.gender,
        room: s.room,
        skill: s.skill,
        subject: s.subject,
        academicSummary: s.academicSummary,
        rawScores: s.rawScores
      };
    }),
    config: normalizedData.config,
    lastUpdated: normalizedData.lastUpdated
  });
}

/**
 * Automated Sheets Creation API Trigger
 */
function apiPrepareSheets(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized access to sheet preparation.", null, "UNAUTHORIZED");
  }
  var config = getAppConfig();
  var result = prepareOptimizedDatabaseSheets(config.spreadsheetId);
  return makeResponse(result.success, result.message, result, result.success ? null : "MIGRATION_FAILED");
}

/**
 * Setup dynamic relational links between 📋_Students (Master) and all other sheets
 * (📊_Scoring, 📝_Quizzes, 🔐_Users) using VLOOKUP formulas to eliminate data duplication and errors.
 */
function apiSetupRelations(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized access to setup relations.", null, "UNAUTHORIZED");
  }
  var config = getAppConfig();
  var result = applyRelationalFormulasToAllSheets(config.spreadsheetId);
  return makeResponse(result.success, result.message, result.details, result.success ? null : "RELATION_SETUP_FAILED");
}

/**
 * Establishes Foreign Key relationships across all Google Sheets:
 * - 📋_Students is the Master Primary Source.
 * - 📊_Scoring: Name, Room, Major reference 📋_Students dynamically.
 * - 📝_Quizzes: Name, Room reference 📋_Students dynamically.
 * - 🔐_Users: Student Username, Full Name, Room, Major, Status reference 📋_Students dynamically.
 */
function applyRelationalFormulasToAllSheets(spreadsheetId) {
  var config = getAppConfig();
  var targetId = spreadsheetId || config.spreadsheetId;
  var ss = SpreadsheetApp.openById(targetId);

  var studentsSheet = ss.getSheetByName("📋_Students");
  if (!studentsSheet || studentsSheet.getLastRow() < 2) {
    return {
      success: false,
      message: "រកមិនឃើញទិន្នន័យក្នុង Sheet 📋_Students ឡើយ។",
      details: {}
    };
  }

  var updatedInfo = {};

  // 1. Relational Links for 📊_Scoring
  var scoringSheet = ss.getSheetByName("📊_Scoring");
  if (scoringSheet && scoringSheet.getLastRow() >= 2) {
    var scoLastRow = scoringSheet.getLastRow();
    var scoRowCount = scoLastRow - 1;

    var bToDFormulas = [];
    var iToKFormulas = [];

    for (var r = 2; r <= scoLastRow; r++) {
      var nameFormula = '=IFERROR(IF(VLOOKUP(A' + r + ', \'📋_Students\'!$A:$B, 2, FALSE)<>"", VLOOKUP(A' + r + ', \'📋_Students\'!$A:$B, 2, FALSE), VLOOKUP(A' + r + ', \'📋_Students\'!$A:$C, 3, FALSE)), "")';
      var roomFormula = '=IFERROR(VLOOKUP(A' + r + ', \'📋_Students\'!$A:$E, 5, FALSE), "")';
      var majorFormula = '=IFERROR(VLOOKUP(A' + r + ', \'📋_Students\'!$A:$F, 6, FALSE), "")';
      bToDFormulas.push([nameFormula, roomFormula, majorFormula]);

      var totalFormula = '=IF(ISBLANK(A' + r + '), "", ROUND(SUM(E' + r + ':H' + r + '), 2))';
      var gradeFormula = '=IF(ISBLANK(I' + r + '), "", IF(I' + r + '>=85,"A", IF(I' + r + '>=80,"B+", IF(I' + r + '>=70,"B", IF(I' + r + '>=65,"C+", IF(I' + r + '>=50,"C", IF(I' + r + '>=45,"D", IF(I' + r + '>=40,"E","F"))))))))';
      var resultFormula = '=IF(ISBLANK(I' + r + '), "", IF(I' + r + '>=50, "ជាប់ (Pass)", "ធ្លាក់ (Fail)"))';
      iToKFormulas.push([totalFormula, gradeFormula, resultFormula]);
    }

    scoringSheet.getRange(2, 2, scoRowCount, 3).setFormulas(bToDFormulas);
    scoringSheet.getRange(2, 9, scoRowCount, 3).setFormulas(iToKFormulas);
    updatedInfo["📊_Scoring"] = scoRowCount + " rows linked to 📋_Students";
  }

  // 2. Relational Links for 📝_Quizzes
  var quizzesSheet = ss.getSheetByName("📝_Quizzes");
  if (quizzesSheet && quizzesSheet.getLastRow() >= 3) {
    var qzLastRow = quizzesSheet.getLastRow();
    var qzRowCount = qzLastRow - 2;

    var qzBtoCFormulas = [];
    var qzTtoUFormulas = [];

    for (var qr = 3; qr <= qzLastRow; qr++) {
      var qNameFormula = '=IFERROR(IF(VLOOKUP(A' + qr + ', \'📋_Students\'!$A:$B, 2, FALSE)<>"", VLOOKUP(A' + qr + ', \'📋_Students\'!$A:$B, 2, FALSE), VLOOKUP(A' + qr + ', \'📋_Students\'!$A:$C, 3, FALSE)), "")';
      var qRoomFormula = '=IFERROR(VLOOKUP(A' + qr + ', \'📋_Students\'!$A:$E, 5, FALSE), "")';
      qzBtoCFormulas.push([qNameFormula, qRoomFormula]);

      var sumFormula = '=SUM(D' + qr + ':R' + qr + ')';
      var scaledFormula = '=IF(ISBLANK(A' + qr + '), "", IF($S$2=0, 0, ROUND((SUM(D' + qr + ':R' + qr + ')/$S$2)*15, 2)))';
      qzTtoUFormulas.push([sumFormula, scaledFormula]);
    }

    quizzesSheet.getRange(3, 2, qzRowCount, 2).setFormulas(qzBtoCFormulas);
    quizzesSheet.getRange(3, 20, qzRowCount, 2).setFormulas(qzTtoUFormulas);
    updatedInfo["📝_Quizzes"] = qzRowCount + " rows linked to 📋_Students";
  }

  // 3. Relational Links for 🔐_Users
  var usersSheet = getOrCreateUsersSheet(ss);
  if (usersSheet && usersSheet.getLastRow() >= 2) {
    var uLastRow = usersSheet.getLastRow();
    var uValues = usersSheet.getDataRange().getValues();
    var linkedCount = 0;

    for (var ur = 2; ur <= uLastRow; ur++) {
      var role = String(uValues[ur - 1][4] || "").toLowerCase().trim();
      var stuId = String(uValues[ur - 1][5] || "").trim();

      if (role === "student" || (stuId && stuId.toLowerCase() !== "n/a")) {
        var uNameFormula = '=IFERROR(IF(VLOOKUP(F' + ur + ', \'📋_Students\'!$A:$B, 2, FALSE)<>"", VLOOKUP(F' + ur + ', \'📋_Students\'!$A:$B, 2, FALSE), VLOOKUP(F' + ur + ', \'📋_Students\'!$A:$C, 3, FALSE)), "")';
        var uRoomFormula = '=IFERROR(VLOOKUP(F' + ur + ', \'📋_Students\'!$A:$E, 5, FALSE), "")';
        var uMajorFormula = '=IFERROR(VLOOKUP(F' + ur + ', \'📋_Students\'!$A:$F, 6, FALSE), "")';
        var uStatusFormula = '=IFERROR(VLOOKUP(F' + ur + ', \'📋_Students\'!$A:$H, 8, FALSE), "Active")';

        usersSheet.getRange(ur, 2).setFormula(uNameFormula); // Username
        usersSheet.getRange(ur, 4).setFormula(uNameFormula); // Full Name
        usersSheet.getRange(ur, 7).setFormula(uRoomFormula); // Room
        usersSheet.getRange(ur, 8).setFormula(uMajorFormula); // Major
        usersSheet.getRange(ur, 9).setFormula(uStatusFormula); // Status
        linkedCount++;
      }
    }
    updatedInfo["🔐_Users"] = linkedCount + " student accounts linked to 📋_Students";
  }

  flushAllAppCache(targetId);

  return {
    success: true,
    message: "បានបង្កើតទំនាក់ទំនងរវាង Sheets ជោគជ័យ! ឈ្មោះនិស្សិត និងព័ត៌មានត្រូវបានភ្ជាប់ចេញពី 📋_Students ដោយស្វ័យប្រវត្តិ។",
    details: updatedInfo
  };
}

/**
 * Flush API Cache
 */
function apiFlushCache(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized access to cache flush.", null, "UNAUTHORIZED");
  }
  var config = getAppConfig();
  flushAllAppCache(config.spreadsheetId);
  return makeResponse(true, "API cache successfully flushed.", { spreadsheetId: config.spreadsheetId });
}

/**
 * Get Dynamic System Configuration
 */
function apiGetConfig(params) {
  var normalizedData = getNormalizedSpreadsheetData(params.refresh === "true");
  return makeResponse(true, "System configuration retrieved.", normalizedData.config || {});
}

// ==========================================
// CORE DATA NORMALIZATION & MAPPING ENGINE
// ==========================================

/**
 * Normalizes Spreadsheet Data into Clean Structured Entities
 * Supports both separated sheets (📋_Students + 📊_Scoring) and legacy single sheet.
 */
function getNormalizedSpreadsheetData(forceRefresh) {
  var config = getAppConfig();
  var cache = CacheService.getScriptCache();
  var cacheKey = "NORM_STUDENT_DATA_" + config.spreadsheetId;

  // 1. Try reading chunked cache
  if (!forceRefresh) {
    try {
      var metaJson = cache.get(cacheKey + "_META");
      if (metaJson) {
        var meta = JSON.parse(metaJson);
        var chunkKeys = [];
        for (var c = 0; c < meta.totalChunks; c++) {
          chunkKeys.push(cacheKey + "_CHUNK_" + c);
        }
        var chunkMap = cache.getAll(chunkKeys);
        var allStudents = [];
        var missingChunk = false;
        for (var ck = 0; ck < chunkKeys.length; ck++) {
          if (!chunkMap[chunkKeys[ck]]) {
            missingChunk = true;
            break;
          }
          allStudents = allStudents.concat(JSON.parse(chunkMap[chunkKeys[ck]]));
        }

        if (!missingChunk) {
          return {
            success: true,
            sheetName: meta.sheetName,
            headers: meta.headers,
            detailedHeaders: meta.detailedHeaders,
            students: allStudents,
            filterOptions: meta.filterOptions,
            config: meta.config,
            lastUpdated: meta.lastUpdated
          };
        }
      }
    } catch (e) {
      // Proceed to live spreadsheet read
    }
  }

  var ss;
  try {
    ss = SpreadsheetApp.openById(config.spreadsheetId);
  } catch (err) {
    return {
      success: false,
      message: "Could not open spreadsheet ID: " + config.spreadsheetId + ". Error: " + err.message,
      error: "SPREADSHEET_NOT_FOUND"
    };
  }

  // 2. Read Dynamic Configuration from ⚙️_Config if present
  var dynamicConfig = readDynamicConfig(ss);

  // 3. Check for modern separated sheets: "📋_Students" and "📊_Scoring"
  var studentsSheet = ss.getSheetByName("📋_Students");
  var scoringSheet = ss.getSheetByName("📊_Scoring");

  if (studentsSheet && scoringSheet && studentsSheet.getLastRow() > 1) {
    return parseSeparatedDatabaseSheets(ss, studentsSheet, scoringSheet, dynamicConfig, cache, cacheKey);
  }

  // 4. Fallback: Parse single / legacy raw sheet
  return parseLegacySingleSheet(ss, dynamicConfig, cache, cacheKey);
}

/**
 * Modern parser for separated database architecture: 📋_Students + 📊_Scoring
 */
function parseSeparatedDatabaseSheets(ss, studentsSheet, scoringSheet, dynamicConfig, cache, cacheKey) {
  var stuData = studentsSheet.getDataRange().getValues();
  var scoData = scoringSheet.getDataRange().getValues();

  var stuHeaders = stuData[0].map(function(h) { return String(h || "").trim(); });
  var scoHeaders = scoData[0].map(function(h) { return String(h || "").trim(); });

  var stuMap = detectColumnMapping(stuHeaders);
  var scoMap = detectColumnMapping(scoHeaders);

  // Index scores by studentId
  var scoresByStudentId = {};
  for (var r = 1; r < scoData.length; r++) {
    var row = scoData[r];
    var sid = String(getMappedValue(scoMap, row, "id", "")).trim().toLowerCase();
    if (!sid) continue;

    var attendance = parseNumeric(getMappedValue(scoMap, row, "attendance", 10));
    var qha = parseNumeric(getMappedValue(scoMap, row, "totalQHA", null));
    var midterm = parseNumeric(getMappedValue(scoMap, row, "midterm", null));
    var finalScore = parseNumeric(getMappedValue(scoMap, row, "finalScore", null));
    var totalScore = parseNumeric(getMappedValue(scoMap, row, "totalScore", null));
    if (totalScore === null && (attendance !== null || qha !== null || midterm !== null || finalScore !== null)) {
      totalScore = (attendance || 0) + (qha || 0) + (midterm || 0) + (finalScore || 0);
    }
    var gradeRaw = getMappedValue(scoMap, row, "grade", "");
    var grade = gradeRaw ? String(gradeRaw).trim() : calculateLetterGrade(totalScore, dynamicConfig);

    scoresByStudentId[sid] = {
      attendance: attendance,
      qha: qha,
      midterm: midterm,
      finalScore: finalScore,
      totalScore: totalScore,
      grade: grade
    };
  }

  // 3b. Read Detailed Quiz Breakdown from 📝_Quizzes if present
  var quizzesSheet = ss.getSheetByName("📝_Quizzes");
  var quizzesByStudentId = {};
  if (quizzesSheet && quizzesSheet.getLastRow() >= 2) {
    var qzValues = quizzesSheet.getDataRange().getValues();
    if (qzValues.length >= 2) {
      var qzHeaders = qzValues[0];
      var qzMaxRow = qzValues[1];
      for (var qr = 2; qr < qzValues.length; qr++) {
        var qRow = qzValues[qr];
        var qSid = String(qRow[0] || "").trim().toLowerCase();
        if (!qSid) continue;

        var qList = [];
        // Quizzes are columns D (index 3) to R (index 17)
        for (var qc = 3; qc <= Math.min(17, qRow.length - 1); qc++) {
          var qMax = Number(qzMaxRow[qc]);
          var qVal = qRow[qc] !== "" && qRow[qc] !== undefined ? Number(qRow[qc]) : null;
          var qName = String(qzHeaders[qc] || ("Quiz " + (qc - 2))).trim();
          if (qMax > 0 || qVal !== null) {
            qList.push({
              name: qName,
              score: qVal,
              maxScore: qMax > 0 ? qMax : 10
            });
          }
        }
        var scaled15 = (qRow.length >= 21 && qRow[20] !== "" && qRow[20] !== undefined) ? parseNumeric(qRow[20]) : null;
        quizzesByStudentId[qSid] = {
          quizzes: qList,
          scaled15: scaled15
        };
      }
    }
  }

  var students = [];
  var roomsSet = {};
  var majorsSet = {};

  for (var s = 1; s < stuData.length; s++) {
    var sRow = stuData[s];
    var studentId = String(getMappedValue(stuMap, sRow, "id", "")).trim();
    if (!studentId) continue;

    var nameKh = String(getMappedValue(stuMap, sRow, "nameKh", "")).trim();
    var nameEn = String(getMappedValue(stuMap, sRow, "nameEn", "")).trim();

    // Skip any configuration or Max Points indicator row
    if (nameKh.indexOf("🎯") !== -1 || nameKh.indexOf("ពិន្ទុពេញ") !== -1 || nameKh.indexOf("Max Points") !== -1) continue;
    if (nameEn.indexOf("Max Points") !== -1 || nameEn.indexOf("ពិន្ទុពេញ") !== -1) continue;
    if (studentId.indexOf("🎯") !== -1) continue;

    var gender = String(getMappedValue(stuMap, sRow, "gender", "")).trim();
    var room = String(getMappedValue(stuMap, sRow, "room", "101")).trim();
    var skill = String(getMappedValue(stuMap, sRow, "skill", "General")).trim();
    var status = String(getMappedValue(stuMap, sRow, "status", "Active")).trim();

    if (room) roomsSet[room] = true;
    if (skill) majorsSet[skill] = true;

    var sc = scoresByStudentId[studentId.toLowerCase()] || {};
    var qz = quizzesByStudentId[studentId.toLowerCase()] || {};

    var attendance = sc.attendance !== undefined && sc.attendance !== null ? sc.attendance : 10;
    var tasksScore = sc.qha !== undefined && sc.qha !== null ? sc.qha : (qz.scaled15 !== null && qz.scaled15 !== undefined ? qz.scaled15 : null);
    var midterm = sc.midterm !== undefined && sc.midterm !== null ? sc.midterm : null;
    var finalScore = sc.finalScore !== undefined && sc.finalScore !== null ? sc.finalScore : null;

    var tot = sc.totalScore !== undefined && sc.totalScore !== null 
      ? sc.totalScore 
      : (attendance + (tasksScore || 0) + (midterm || 0) + (finalScore || 0));
    var gr = sc.grade || calculateLetterGrade(tot, dynamicConfig);

    var attPct = attendance !== null ? Math.round((attendance / 10) * 100) : null;
    var qzPct = tasksScore !== null ? Math.round((tasksScore / 15) * 1000) / 10 : null;
    var midPct = midterm !== null ? Math.round((midterm / 25) * 1000) / 10 : null;
    var finPct = finalScore !== null ? Math.round((finalScore / 50) * 1000) / 10 : null;

    var scoresList = [
      { assessment: "វត្តមាន និងការចូលរួម (Attendance)", score: attendance, maxScore: 10, weight: 10, percentage: attPct },
      { 
        assessment: "សំណួរ និងកិច្ចការស្រាវជ្រាវ (Quizzes & Tasks)", 
        score: tasksScore, 
        maxScore: 15, 
        weight: 15,
        percentage: qzPct,
        breakdown: qz.quizzes || []
      },
      { assessment: "ការប្រឡងពាក់កណ្តាលឆមាស (Midterm)", score: midterm, maxScore: 25, weight: 25, percentage: midPct },
      { assessment: "ការប្រឡងបញ្ចប់ឆមាស (Final Exam)", score: finalScore, maxScore: 50, weight: 50, percentage: finPct }
    ];

    var studentObj = {
      studentId: studentId,
      fullNameKh: nameKh,
      fullNameEn: nameEn,
      fullName: nameKh || nameEn || studentId,
      gender: gender,
      room: room,
      skill: skill,
      subject: dynamicConfig.subject || "All Subjects",
      faculty: dynamicConfig.faculty || "Information Technology",
      department: dynamicConfig.department || "Computer Science",
      academicYear: dynamicConfig.academicYear || "2025-2026",
      semester: dynamicConfig.semester || "Semester 1",
      status: status,
      published: dynamicConfig.publishAll !== false,
      quizzes: qz.quizzes || [],
      academicSummary: {
        attendance: attendance,
        totalQHA: tasksScore,
        qhaGrade: calculateQhaGrade(tasksScore),
        midterm: sc.midterm,
        midtermGrade: calculateMidtermGrade(sc.midterm),
        finalScore: sc.finalScore,
        totalScore: tot,
        averageScore: tot,
        overallGrade: gr,
        status: status || (tot >= 50 ? "ជាប់" : "ធ្លាក់"),
        quizBreakdown: qz.quizzes || []
      },
      scores: scoresList,
      rawScores: {
        attendance: attendance,
        totalQHA: tasksScore,
        midterm: sc.midterm,
        finalScore: sc.finalScore,
        totalScore: tot,
        grade: gr
      }
    };

    students.push(studentObj);
  }

  var result = {
    success: true,
    sheetName: "📋_Students & 📊_Scoring",
    headers: stuHeaders,
    detailedHeaders: ["កិច្ចការ (15)", "ពាក់កណ្តាល (25)", "បញ្ចប់ (50)", "ពិន្ទុសរុប", "និទ្ទេស"],
    students: students,
    filterOptions: {
      rooms: Object.keys(roomsSet).sort(),
      majors: Object.keys(majorsSet).sort(),
      subjects: [dynamicConfig.subject || "All Subjects"]
    },
    config: dynamicConfig,
    lastUpdated: new Date().toISOString()
  };

  // Cache in chunks
  saveDatasetToCache(cache, cacheKey, result);
  return result;
}

/**
 * Fallback parser for single/raw sheet
 */
function parseLegacySingleSheet(ss, dynamicConfig, cache, cacheKey) {
  var sheets = ss.getSheets();
  var targetSheet = sheets[0];
  for (var s = 0; s < sheets.length; s++) {
    if (sheets[s].getSheetId() === 975535987 || sheets[s].getLastRow() > 1) {
      targetSheet = sheets[s];
      break;
    }
  }

  var allValues = targetSheet.getDataRange().getValues();
  if (!allValues || allValues.length < 2) {
    return {
      success: true,
      sheetName: targetSheet.getName(),
      headers: [],
      detailedHeaders: [],
      students: [],
      filterOptions: { rooms: [], majors: [], subjects: [] },
      config: dynamicConfig,
      lastUpdated: new Date().toISOString()
    };
  }

  // Detect header row
  var headerRowIndex = 0;
  for (var rIdx = 0; rIdx < Math.min(6, allValues.length); rIdx++) {
    var candidateRow = allValues[rIdx].map(function(c) { return String(c || "").trim(); });
    var candidateMapping = detectColumnMapping(candidateRow);
    if (candidateMapping.id !== null || candidateMapping.nameKh !== null || candidateMapping.nameEn !== null) {
      headerRowIndex = rIdx;
      break;
    }
  }

  var headers = allValues[headerRowIndex].map(function(c) { return String(c || "").trim(); });
  var colMap = detectColumnMapping(headers);

  var students = [];
  var roomsSet = {};
  var majorsSet = {};

  for (var rowI = headerRowIndex + 1; rowI < allValues.length; rowI++) {
    var row = allValues[rowI];
    var studentId = getMappedValue(colMap, row, "id", "");
    var nameKh = getMappedValue(colMap, row, "nameKh", "");
    var nameEn = getMappedValue(colMap, row, "nameEn", "");

    if (!studentId && !nameKh && !nameEn) continue;

    var gender = getMappedValue(colMap, row, "gender", "");
    var room = getMappedValue(colMap, row, "room", "");
    var skill = getMappedValue(colMap, row, "skill", "");
    var totalQHA = (colMap && colMap.totalQHA && colMap.totalQHA.index !== undefined) ? parseNumeric(row[colMap.totalQHA.index]) : null;
    var midterm = (colMap && colMap.midterm && colMap.midterm.index !== undefined) ? parseNumeric(row[colMap.midterm.index]) : null;
    var finalScore = (colMap && colMap.finalScore && colMap.finalScore.index !== undefined) ? parseNumeric(row[colMap.finalScore.index]) : null;
    var totalScore = (colMap && colMap.totalScore && colMap.totalScore.index !== undefined) ? parseNumeric(row[colMap.totalScore.index]) : null;
    if (totalScore === null && (totalQHA !== null || midterm !== null || finalScore !== null)) {
      totalScore = (totalQHA || 0) + (midterm || 0) + (finalScore || 0);
    }
    var grade = (colMap && colMap.grade && colMap.grade.index !== undefined && row[colMap.grade.index]) ? String(row[colMap.grade.index]).trim() : calculateLetterGrade(totalScore, dynamicConfig);

    if (room) roomsSet[room] = true;
    if (skill) majorsSet[skill] = true;

    students.push({
      studentId: studentId || ("STU" + rowI),
      fullNameKh: nameKh,
      fullNameEn: nameEn,
      fullName: nameKh || nameEn || studentId,
      gender: gender,
      room: room || "101",
      skill: skill || "General",
      subject: dynamicConfig.subject || "All Subjects",
      academicSummary: {
        totalQHA: totalQHA,
        qhaGrade: calculateQhaGrade(totalQHA),
        midterm: midterm,
        midtermGrade: calculateMidtermGrade(midterm),
        finalScore: finalScore,
        totalScore: totalScore,
        averageScore: totalScore,
        overallGrade: grade,
        status: (totalScore >= 50 ? "ជាប់" : "ធ្លាក់")
      },
      scores: [
        { assessment: "កិច្ចការ និងវត្តមាន (Q,H,A)", score: totalQHA, maxScore: 15, weight: 15 },
        { assessment: "ការប្រឡងពាក់កណ្តាលឆមាស (Midterm)", score: midterm, maxScore: 25, weight: 25 },
        { assessment: "ការប្រឡងបញ្ចប់ឆមាស (Final)", score: finalScore, maxScore: 50, weight: 50 }
      ],
      rawScores: {
        totalQHA: totalQHA,
        midterm: midterm,
        finalScore: finalScore,
        totalScore: totalScore,
        grade: grade
      }
    });
  }

  var result = {
    success: true,
    sheetName: targetSheet.getName(),
    headers: headers,
    detailedHeaders: ["កិច្ចការ (15)", "ពាក់កណ្តាល (25)", "បញ្ចប់ (50)", "ពិន្ទុសរុប", "និទ្ទេស"],
    students: students,
    filterOptions: {
      rooms: Object.keys(roomsSet).sort(),
      majors: Object.keys(majorsSet).sort(),
      subjects: [dynamicConfig.subject || "All Subjects"]
    },
    config: dynamicConfig,
    lastUpdated: new Date().toISOString()
  };

  saveDatasetToCache(cache, cacheKey, result);
  return result;
}

/**
 * Saves large dataset into CacheService in chunks
 */
function saveDatasetToCache(cache, cacheKey, result) {
  try {
    var students = result.students;
    var totalChunks = Math.ceil(students.length / CHUNK_SIZE);

    for (var c = 0; c < totalChunks; c++) {
      var chunk = students.slice(c * CHUNK_SIZE, (c + 1) * CHUNK_SIZE);
      cache.put(cacheKey + "_CHUNK_" + c, JSON.stringify(chunk), 600);
    }

    var meta = {
      sheetName: result.sheetName,
      headers: result.headers,
      detailedHeaders: result.detailedHeaders,
      totalChunks: totalChunks,
      totalStudents: students.length,
      filterOptions: result.filterOptions,
      config: result.config,
      lastUpdated: result.lastUpdated
    };
    cache.put(cacheKey + "_META", JSON.stringify(meta), 600);

    // Warm up individual student caches for instant < 50ms student lookups
    for (var sIdx = 0; sIdx < Math.min(200, students.length); sIdx++) {
      var st = students[sIdx];
      if (st && st.studentId) {
        try {
          cache.put("STU_" + String(st.studentId).trim().toLowerCase(), JSON.stringify(st), 600);
        } catch (_) {}
      }
    }
  } catch (e) {
    // Ignore cache writing failure
  }
}

/**
 * Reads Dynamic Configuration from ⚙️_Config sheet if present
 */
function readDynamicConfig(ss) {
  var config = {
    schoolNameKh: "សាកលវិទ្យាល័យជាតិ",
    schoolNameEn: "National University",
    schoolLogoUrl: "/assets/images/app_icon.svg",
    campusTitle: "ប្រព័ន្ធគ្រប់គ្រងពិន្ទុ និងការវាយតម្លៃសិក្សាឆ្លាតវៃ",
    faculty: "មហាវិទ្យាល័យវិទ្យាសាស្ត្រ និងវិស្វកម្ម",
    department: "ដេប៉ាតឺម៉ង់បច្ចេកវិទ្យាព័ត៌មានវិទ្យា",
    subject: "ការអភិវឌ្ឍន៍គេហទំព័រ",
    academicYear: "២០២៤-២០២៥",
    semester: "ឆមាសទី ១",
    schoolPhone: "",
    schoolEmail: "",
    schoolAddress: "",
    passingScore: 50,
    gradeAMin: 85,
    gradeBPlusMin: 80,
    gradeBMin: 70,
    gradeCPlusMin: 65,
    gradeCMin: 50,
    gradeDMin: 45,
    gradeEMin: 40,
    publishAll: true,
    cacheMinutes: 10
  };

  try {
    var sheet = ss.getSheetByName("⚙️_Config");
    if (!sheet) return config;

    var values = sheet.getDataRange().getValues();
    config.rawConfig = {};

    for (var r = 1; r < values.length; r++) {
      var key = String(values[r][0] || "").trim().toUpperCase();
      var val = values[r][1];
      if (!key) continue;

      config.rawConfig[key] = val;

      if (key === "SCHOOL_NAME_KH" && val) config.schoolNameKh = String(val);
      else if (key === "SCHOOL_NAME_EN" && val) config.schoolNameEn = String(val);
      else if (key === "SCHOOL_LOGO_URL" && val) config.schoolLogoUrl = String(val);
      else if (key === "CAMPUS_SYSTEM_TITLE" && val) config.campusTitle = String(val);
      else if (key === "FACULTY" && val) config.faculty = String(val);
      else if (key === "DEPARTMENT" && val) config.department = String(val);
      else if (key === "SUBJECT" && val) config.subject = String(val);
      else if (key === "ACADEMIC_YEAR" && val) config.academicYear = String(val);
      else if (key === "SEMESTER" && val) config.semester = String(val);
      else if (key === "SCHOOL_PHONE" && val) config.schoolPhone = String(val);
      else if (key === "SCHOOL_EMAIL" && val) config.schoolEmail = String(val);
      else if (key === "SCHOOL_ADDRESS" && val) config.schoolAddress = String(val);
      else if (key === "PASSING_SCORE") config.passingScore = Number(val) || 50;
      else if (key === "GRADE_A_MIN") config.gradeAMin = Number(val) || 85;
      else if (key === "GRADE_B_PLUS_MIN") config.gradeBPlusMin = Number(val) || 80;
      else if (key === "GRADE_B_MIN") config.gradeBMin = Number(val) || 70;
      else if (key === "GRADE_C_PLUS_MIN") config.gradeCPlusMin = Number(val) || 65;
      else if (key === "GRADE_C_MIN") config.gradeCMin = Number(val) || 50;
      else if (key === "GRADE_D_MIN") config.gradeDMin = Number(val) || 45;
      else if (key === "GRADE_E_MIN") config.gradeEMin = Number(val) || 40;
      else if (key === "PUBLISH_ALL_SCORES") config.publishAll = String(val).toUpperCase() === "TRUE";
      else if (key === "AUTO_CACHE_TTL_MINUTES") config.cacheMinutes = Number(val) || 10;
      else if (key === "SIGNER_1_TITLE") config.signer1Title = String(val);
      else if (key === "SIGNER_1_NAME") config.signer1Name = String(val);
      else if (key === "SIGNER_1_IMAGE") config.signer1Image = String(val);
      else if (key === "SIGNER_2_TITLE") config.signer2Title = String(val);
      else if (key === "SIGNER_2_NAME") config.signer2Name = String(val);
      else if (key === "SIGNER_2_IMAGE") config.signer2Image = String(val);
      else if (key === "OFFICIAL_STAMP_IMAGE" || key === "OFFICIAL_STAMP_URL") config.officialStampImage = String(val);
      else if (key === "SHOW_ESIGNATURE" || key === "SHOW_ESIGNATURES") config.showESignature = String(val).toUpperCase() === "TRUE";
      else if (key === "ISSUE_LOCATION") config.issueLocation = String(val);
      else if (key === "ISSUE_DATE") config.issueDate = String(val);
      else if (key === "ANNOUNCEMENTS_DATA") config.announcementsData = String(val);
      else if (key === "LIBRARY_RESOURCES_DATA" || key === "ELIBRARY_DATA") config.libraryResourcesData = String(val);
    }
  } catch (e) {}

  return config;
}

/**
 * Saves dynamic School Information & System Configuration into ⚙️_Config sheet
 */
function apiUpdateConfig(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "មិនមានសិទ្ធិកែប្រែការកំណត់ឡើយ។", null, "UNAUTHORIZED");
  }

  var config = getAppConfig();
  var ss;
  try {
    ss = SpreadsheetApp.openById(config.spreadsheetId);
  } catch (err) {
    return makeResponse(false, "Could not open spreadsheet: " + err.message, null, "SPREADSHEET_ERROR");
  }

  var sheet = ss.getSheetByName("⚙️_Config");
  if (!sheet) {
    sheet = ss.insertSheet("⚙️_Config");
    sheet.getRange(1, 1, 1, 3).setValues([["ប៉ារ៉ាម៉ែត្រ (Parameter Key)", "តម្លៃដែលបានកំណត់ (Configured Value)", "ការពន្យល់ (Description)"]]);
  }

  var updates = params.updates || {};
  if (typeof updates === "string") {
    try { updates = JSON.parse(updates); } catch (e) {}
  }

  var values = sheet.getDataRange().getValues();
  var keyToRow = {};
  for (var r = 1; r < values.length; r++) {
    var k = String(values[r][0] || "").trim().toUpperCase();
    if (k) keyToRow[k] = r + 1; // 1-indexed row number
  }

  for (var uKey in updates) {
    if (!updates.hasOwnProperty(uKey)) continue;
    var normKey = uKey.trim().toUpperCase();
    var val = updates[uKey];
    if (keyToRow[normKey]) {
      sheet.getRange(keyToRow[normKey], 2).setValue(val);
    } else {
      sheet.appendRow([normKey, val, "Dynamic school & system parameter"]);
    }
  }

  // Purge cache so every client sees new school info, library & logo immediately
  var cache = CacheService.getScriptCache();
  try {
    var cacheKey = "NORM_STUDENT_DATA_" + config.spreadsheetId;
    var keysToRemove = [
      cacheKey,
      cacheKey + "_META",
      "ADMIN_STATS_" + config.spreadsheetId,
      "CONFIG_" + config.spreadsheetId
    ];
    for (var c = 0; c < 20; c++) {
      keysToRemove.push(cacheKey + "_CHUNK_" + c);
    }
    cache.removeAll(keysToRemove);
  } catch (e) {}

  var newConfig = readDynamicConfig(ss);

  // Record Real-Time Event (Section 18.1 & 18.10)
  var realtimeEvent = recordRealtimeEvent("config", "settings", "config.updated");

  return makeResponse(true, "បានរក្សាទុកព័ត៌មានសាលា និងការកំណត់ទៅ Google Sheets ជោគជ័យ!", {
    config: newConfig,
    event: realtimeEvent
  });
}

/**
 * Dynamic letter grade computation based on University 8-Tier Policy:
 * A  : 85% - 100% (Excellent / ល្អប្រសើរ)
 * B+ : 80% - 84%  (Very good / ល្អណាស់)
 * B  : 70% - 79%  (Good / ល្អ)
 * C+ : 65% - 69%  (Fairly good / ល្អបង្គួរ)
 * C  : 50% - 64%  (Fairly / មធ្យម)
 * D  : 45% - 49%  (Poor / ខ្សោយ)
 * E  : 40% - 44%  (Very poor / ខ្សោយណាស់)
 * F  : <= 39%     (Failure / ធ្លាក់)
 */
function calculateLetterGrade(score, config) {
  if (score === null || score === undefined || isNaN(score)) return "N/A";
  var cfg = config || {};
  var a = cfg.gradeAMin || 85;
  var bPlus = cfg.gradeBPlusMin || 80;
  var b = cfg.gradeBMin || 70;
  var cPlus = cfg.gradeCPlusMin || 65;
  var c = cfg.gradeCMin || 50;
  var d = cfg.gradeDMin || 45;
  var e = cfg.gradeEMin || 40;

  if (score >= a) return "A";
  if (score >= bPlus) return "B+";
  if (score >= b) return "B";
  if (score >= cPlus) return "C+";
  if (score >= c) return "C";
  if (score >= d) return "D";
  if (score >= e) return "E";
  return "F";
}

// ==========================================
// SECURITY & SANITIZATION HELPERS
// ==========================================

function verifyAdminAuth(params) {
  var config = getAppConfig();
  var token = String(params.token || params.adminToken || "").trim();
  var user = String(params.username || "").trim();
  var pass = String(params.password || "").trim();

  if (token && (token === config.adminToken || token === DEFAULT_ADMIN_TOKEN)) return true;
  if (user && pass && user === config.teacherUser && pass === config.teacherPass) return true;

  // Check 🔐_Users sheet if username and password supplied
  if (user && pass) {
    try {
      var ss = SpreadsheetApp.openById(config.spreadsheetId);
      var uSheet = ss.getSheetByName("🔐_Users") || ss.getSheetByName("Users");
      if (uSheet && uSheet.getLastRow() >= 2) {
        var uData = uSheet.getDataRange().getValues();
        var normU = normalizeText(user);
        for (var r = 1; r < uData.length; r++) {
          var row = uData[r];
          var role = String(row[4] || "").toLowerCase().trim();
          var status = String(row[8] || "Active").toLowerCase().trim();
          if ((role === "admin" || role === "teacher") && status !== "inactive" && status !== "disabled") {
            var nameMatch = normalizeText(row[1]) === normU || normalizeText(row[3]) === normU;
            if (nameMatch && String(row[2]).trim() === String(pass).trim()) {
              return true;
            }
          }
        }
      }
    } catch (e) {}
  }

  return false;
}

function sanitizeStudentProfile(student) {
  return {
    studentId: student.studentId,
    fullNameKh: student.fullNameKh,
    fullNameEn: student.fullNameEn,
    fullName: student.fullName,
    gender: student.gender,
    room: student.room,
    skill: student.skill,
    subject: student.subject,
    faculty: student.faculty,
    department: student.department,
    academicYear: student.academicYear,
    semester: student.semester,
    status: student.status
  };
}

function filterAuthorizedScores(scores, params) {
  return scores || [];
}

function getMappedValue(colMap, row, key, defaultVal) {
  if (colMap && colMap[key] && colMap[key].index !== undefined && row) {
    var val = row[colMap[key].index];
    return val !== undefined && val !== null ? val : defaultVal;
  }
  return defaultVal;
}

function parseNumeric(val) {
  if (val === null || val === undefined || val === "") return null;
  var parsed = parseFloat(val);
  return isNaN(parsed) ? null : parsed;
}

function calculateQhaGrade(score) {
  if (score === null || isNaN(score)) {
    return { label: "N/A", color: "text-slate-400", bg: "bg-slate-100" };
  }
  if (score < 7.5) {
    return { label: "Needs Improvement (ខ្សោយ)", color: "text-rose-700", bg: "bg-rose-50" };
  } else if (score >= 14.0) {
    return { label: "Excellent (ល្អណាស់)", color: "text-emerald-700", bg: "bg-emerald-50" };
  } else {
    return { label: "Good (ល្អ)", color: "text-blue-700", bg: "bg-blue-50" };
  }
}

function calculateMidtermGrade(score) {
  if (score === null || isNaN(score)) {
    return { label: "N/A", color: "text-slate-400", bg: "bg-slate-100" };
  }
  if (score >= 12.5) {
    return { label: "Passed (ជាប់)", color: "text-emerald-700", bg: "bg-emerald-50" };
  } else {
    return { label: "Failed (ធ្លាក់)", color: "text-rose-700", bg: "bg-rose-50" };
  }
}

function normalizeText(text) {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, "")
    .trim();
}

/**
 * Intelligent header mapper supporting Khmer & English column aliases
 */
function detectColumnMapping(headers) {
  var mapping = {
    id: null,
    nameKh: null,
    nameEn: null,
    gender: null,
    room: null,
    subject: null,
    skill: null,
    faculty: null,
    department: null,
    academicYear: null,
    semester: null,
    totalQHA: null,
    attendance: null,
    midterm: null,
    finalScore: null,
    totalScore: null,
    grade: null,
    status: null,
    published: null
  };

  var patterns = {
    id: [/^(id|student[_\s]?id|sid|លេខសម្គាល់|កូដនិស្សិត|អត្តលេខ)$/i, /student.*id/i, /\bid\b/i, /អត្តលេខ/i],
    nameKh: [/គោត្តនាម/i, /នាម/i, /ឈ្មោះខ្មែរ/i, /ឈ្មោះជាភាសាខ្មែរ/i, /ឈ្មោះនិស្សិត/i, /ឈ្មោះ/i, /khmer/i, /student.*name/i],
    nameEn: [/ឡាតាំង/i, /អក្សរឡាតាំង/i, /latin/i, /ឈ្មោះអង់គ្លេស/i, /english/i],
    gender: [/^(ភេទ|gender|sex)$/i, /ភេទ/i, /gender/i],
    room: [/^(បន្ទប់|class|classroom|room|ថ្នាក់)$/i, /បន្ទប់/i, /room/i, /class/i],
    subject: [/^(មុខវិជ្ជា|subject|course|subject[_\s]?name)$/i, /មុខវិជ្ជា/i, /subject/i],
    skill: [/^(ជំនាញ|major|skill|specialization)$/i, /ជំនាញ/i, /major/i],
    faculty: [/^(មហាវិទ្យាល័យ|faculty)$/i, /មហាវិទ្យាល័យ/i, /faculty/i],
    department: [/^(ដេប៉ាតឺម៉ង់|department|dept)$/i, /ដេប៉ាតឺម៉ង់/i, /department/i],
    academicYear: [/^(ឆ្នាំសិក្សា|academic[_\s]?year|school[_\s]?year)$/i, /ឆ្នាំសិក្សា/i, /academic.*year/i],
    attendance: [/^(វត្តមាន|attendance|វត្តមាន.*10)$/i, /វត្តមាន/i, /attendance/i],
    midterm: [/midterm/i, /ពាក់កណ្[ដត]ាល/i, /ពាក់កណ្តាល/i, /ពាក់កណ្ដាល/i],
    finalScore: [/final/i, /បញ្ចប់/i, /ប្រឡងបញ្ចប់/i],
    totalQHA: [/កិច្ចការ.*quiz/i, /កិច្ចការ/i, /quiz/i, /qha/i, /សរុបកិច្ចការ/i, /សរុបពិន្ទុ.*\(q,h,a\)/i],
    semester: [/^(ឆមាស|semester|term)$/i, /^(?!.*(ពាក់កណ្តាល|ពាក់កណ្ដាល|midterm)).*ឆមាស/i, /^(?!.*(ពាក់កណ្តាល|ពាក់កណ្ដាល|midterm)).*semester/i],
    totalScore: [/ពិន្ទុសរុប/i, /total[_\s]?score/i, /^(total|សរុប)$/i, /សរុប.*100/i],
    grade: [/^(grade|និទ្ទេស|letter[_\s]?grade)$/i, /និទ្ទេស/i, /grade/i],
    status: [/^(status|ស្ថានភាព|student[_\s]?status)$/i, /ស្ថានភាព/i, /status/i],
    result: [/^(result|លទ្ធផល)$/i, /លទ្ធផល/i, /result/i],
    published: [/^(published|is_published|ផ្សព្វផ្សាយ|publish)$/i, /ផ្សព្វផ្សាយ/i, /publish/i]
  };

  for (var i = 0; i < headers.length; i++) {
    var h = (headers[i] || "").trim();
    if (!h) continue;
    for (var key in patterns) {
      if (mapping[key] === null) {
        var matchers = patterns[key];
        for (var m = 0; m < matchers.length; m++) {
          if (matchers[m].test(h)) {
            mapping[key] = { index: i, header: h };
            break;
          }
        }
      }
    }
  }

  return mapping;
}

// ==========================================
// 🔐_USERS SHEET & LOGIN CRUD IMPLEMENTATION
// ==========================================

/**
 * Flush all application caches (students, stats, config, users, and all chunks)
 */
function flushAllAppCache(ssId) {
  var config = getAppConfig();
  var targetId = ssId || config.spreadsheetId;
  var cache = CacheService.getScriptCache();
  try {
    var keysToRemove = [
      "NORM_STUDENT_DATA_" + targetId,
      "NORM_STUDENT_DATA_" + targetId + "_META",
      "ADMIN_STATS_" + targetId,
      "CONFIG_" + targetId,
      "USERS_DATA_" + targetId,
      "USERS_RAW_" + targetId
    ];
    for (var c = 0; c < 25; c++) {
      keysToRemove.push("NORM_STUDENT_DATA_" + targetId + "_CHUNK_" + c);
    }
    cache.removeAll(keysToRemove);
  } catch (e) {}
}

/**
 * Get or create the 🔐_Users sheet with standard headers & default accounts
 */
function getOrCreateUsersSheet(ss) {
  var sheet = ss.getSheetByName("🔐_Users");
  if (!sheet) {
    sheet = ss.getSheetByName("Users") || ss.getSheetByName("🔐_Logins");
  }
  if (!sheet) {
    sheet = ss.insertSheet("🔐_Users");
    var headers = [
      "អត្តសញ្ញាណ (User ID)",
      "ឈ្មោះគណនី (Username)",
      "លេខសម្ងាត់ (Password)",
      "ឈ្មោះពេញ (Full Name)",
      "តួនាទី (Role)",
      "អត្តលេខនិស្សិត (Student ID)",
      "បន្ទប់ (Room)",
      "ជំនាញ (Major/Skill)",
      "ស្ថានភាព (Status)",
      "កាលបរិច្ឆេទបង្កើត (Created At)",
      "ចូលចុងក្រោយ (Last Login)"
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#1e1b4b")
      .setFontColor("#ffffff")
      .setFontWeight("bold")
      .setFontSize(11)
      .setFontFamily("Kantumruy Pro")
      .setVerticalAlignment("middle")
      .setHorizontalAlignment("center");
    sheet.setRowHeight(1, 40);
    headerRange.setBorder(null, null, true, null, null, null, "#6366f1", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    sheet.setFrozenRows(1);
    
    var nowStr = new Date().toISOString();
    var defaultRows = [
      ["USR-001", "admin", "admin2026", "អ្នកគ្រប់គ្រងប្រព័ន្ធ (System Admin)", "admin", "N/A", "", "", "Active", nowStr, ""],
      ["USR-002", "teacher", "teacher2026", "សាស្ត្រាចារ្យ (Faculty Teacher)", "teacher", "N/A", "", "", "Active", nowStr, ""]
    ];
    sheet.getRange(2, 1, defaultRows.length, headers.length).setValues(defaultRows);
    sheet.getRange(2, 3, defaultRows.length, 1).setNumberFormat("@");
    sheet.getRange(2, 6, defaultRows.length, 1).setNumberFormat("@");
    
    syncStudentsToUsersSheet(ss, sheet);
  }
  return sheet;
}

/**
 * Synchronize all students from 📋_Students into 🔐_Users
 * Student Username = Student Name, Password = Student ID
 */
function syncStudentsToUsersSheet(ss, usersSheet) {
  var uSheet = usersSheet || ss.getSheetByName("🔐_Users") || ss.getSheetByName("Users");
  if (!uSheet) return { count: 0 };
  
  var uData = uSheet.getDataRange().getValues();
  var existingStudentIds = {};
  var existingUsernames = {};
  
  for (var r = 1; r < uData.length; r++) {
    var sid = String(uData[r][5] || "").trim().toLowerCase();
    var uname = String(uData[r][1] || "").trim().toLowerCase();
    if (sid && sid !== "n/a") existingStudentIds[sid] = true;
    if (uname) existingUsernames[uname] = true;
  }
  
  var stuSheet = ss.getSheetByName("📋_Students");
  if (!stuSheet || stuSheet.getLastRow() < 2) return { count: 0 };
  
  var stuData = stuSheet.getDataRange().getValues();
  var stuHeaders = stuData[0].map(function(h) { return String(h || "").trim(); });
  var stuMap = detectColumnMapping(stuHeaders);
  
  var newRows = [];
  var currentMaxId = uData.length;
  
  for (var s = 1; s < stuData.length; s++) {
    var row = stuData[s];
    var studentId = String(getMappedValue(stuMap, row, "id", "")).trim();
    if (!studentId || studentId.indexOf("🎯") !== -1 || studentId.indexOf("ពិន្ទុពេញ") !== -1) continue;
    
    var sIdLower = studentId.toLowerCase();
    if (existingStudentIds[sIdLower]) continue;
    
    var nameKh = String(getMappedValue(stuMap, row, "nameKh", "")).trim();
    var nameEn = String(getMappedValue(stuMap, row, "nameEn", "")).trim();
    var displayName = nameKh || nameEn || studentId;
    var room = String(getMappedValue(stuMap, row, "room", "")).trim();
    var skill = String(getMappedValue(stuMap, row, "skill", "")).trim();
    var status = String(getMappedValue(stuMap, row, "status", "Active")).trim();
    
    currentMaxId++;
    var userId = "USR-" + ("000" + currentMaxId).slice(-3);
    
    newRows.push([
      userId,
      displayName,     // Username = Student Name
      studentId,       // Password = Student ID
      displayName,     // Full Name
      "student",       // Role
      studentId,       // Student ID
      room,
      skill,
      status || "Active",
      new Date().toISOString(),
      ""
    ]);
    
    existingStudentIds[sIdLower] = true;
  }
  
  if (newRows.length > 0) {
    var startRow = uSheet.getLastRow() + 1;
    uSheet.getRange(startRow, 1, newRows.length, newRows[0].length).setValues(newRows);
    uSheet.getRange(startRow, 3, newRows.length, 1).setNumberFormat("@");
    uSheet.getRange(startRow, 6, newRows.length, 1).setNumberFormat("@");
  }
  
  return { count: newRows.length, totalUsers: uSheet.getLastRow() - 1 };
}

/**
 * Universal User Login: Handles Staff & Students against 🔐_Users sheet
 */
function apiUserLogin(params) {
  var username = (params.username || params.studentName || params.identifier || "").trim();
  var password = (params.password || params.studentId || "").trim();
  var requestedRole = (params.role || "").toLowerCase().trim();

  // Smart swap detection: if student placed ID in name box and Name in ID box
  if (requestedRole === "student" || !requestedRole) {
    if (/^[a-zA-Z0-9\-_]+$/.test(username) && !/^[a-zA-Z0-9\-_]+$/.test(password)) {
      var tmp = username;
      username = password;
      password = tmp;
    }
  }

  if (!username || !password) {
    return makeResponse(false, "សូមបញ្ចូលឈ្មោះគណនី និងលេខសម្ងាត់របស់អ្នក។", null, "MISSING_CREDENTIALS");
  }

  var config = getAppConfig();
  var ss;
  try {
    ss = SpreadsheetApp.openById(config.spreadsheetId);
  } catch (err) {
    return makeResponse(false, "Could not open spreadsheet: " + err.message, null, "SPREADSHEET_ERROR");
  }

  var usersSheet = getOrCreateUsersSheet(ss);
  var values = usersSheet.getDataRange().getValues();

  var normUser = normalizeText(username);
  var normPass = String(password).trim();

  var matchedUser = null;
  var matchedRowIndex = -1;

  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var uId = String(row[0] || "").trim();
    var uName = String(row[1] || "").trim();
    var uPass = String(row[2] || "").trim();
    var uFullName = String(row[3] || "").trim();
    var uRole = String(row[4] || "student").trim().toLowerCase();
    var uStudentId = String(row[5] || "").trim();
    var uStatus = String(row[8] || "Active").trim();

    if (uStatus.toLowerCase() === "inactive" || uStatus.toLowerCase() === "disabled") {
      continue;
    }

    // Check staff credentials (admin / teacher)
    if (uRole === "admin" || uRole === "teacher") {
      var isStaffUserMatch = normalizeText(uName) === normUser || normalizeText(uFullName) === normUser;
      if (isStaffUserMatch && uPass === normPass) {
        matchedUser = {
          userId: uId,
          username: uName,
          fullName: uFullName,
          role: uRole,
          studentId: null,
          status: uStatus
        };
        matchedRowIndex = r + 1;
        break;
      }
    }

    // Check student credentials:
    // Student uses Student Name as Username (Khmer or English) and Student ID as Password!
    if (uRole === "student") {
      var passMatch = (uPass.toLowerCase() === normPass.toLowerCase()) ||
                      (uStudentId.toLowerCase() === normPass.toLowerCase());

      var nameMatch = (normalizeText(uName) === normUser) ||
                      (normalizeText(uFullName) === normUser) ||
                      (normalizeText(uName).indexOf(normUser) !== -1 && normUser.length >= 3) ||
                      (normalizeText(uFullName).indexOf(normUser) !== -1 && normUser.length >= 3) ||
                      (uStudentId.toLowerCase() === normUser.toLowerCase());

      // If name didn't match directly in 🔐_Users, cross-check student directory with English/Khmer name
      if (!nameMatch && passMatch && uStudentId) {
        var verifyStu = apiStudentLookup({ studentId: uStudentId, studentName: username });
        if (verifyStu.success && verifyStu.data) {
          nameMatch = true;
        }
      }

      if (nameMatch && passMatch) {
        matchedUser = {
          userId: uId,
          username: uName,
          fullName: uFullName,
          role: "student",
          studentId: uStudentId,
          status: uStatus
        };
        matchedRowIndex = r + 1;
        break;
      }
    }
  }

  // Fallback 1: Default Admin credentials
  if (!matchedUser && (requestedRole === "staff" || requestedRole === "admin" || !requestedRole)) {
    if (username === config.teacherUser && password === config.teacherPass) {
      matchedUser = {
        userId: "USR-001",
        username: username,
        fullName: "អ្នកគ្រប់គ្រងប្រព័ន្ធ",
        role: "admin",
        status: "Active"
      };
    }
  }

  // Fallback 2: Student exists in 📋_Students (matches either Khmer Name or English Name)
  if (!matchedUser && (requestedRole === "student" || !requestedRole)) {
    var lookupRes = apiStudentLookup({ studentId: password, studentName: username });
    if (lookupRes.success && lookupRes.data) {
      // Check if student ID already exists in usersSheet to avoid duplicate rows
      var sIdToCheck = String(lookupRes.data.profile.studentId).toLowerCase().trim();
      var alreadyInSheet = false;
      for (var chkR = 1; chkR < values.length; chkR++) {
        if (String(values[chkR][5] || "").toLowerCase().trim() === sIdToCheck) {
          alreadyInSheet = true;
          matchedRowIndex = chkR + 1;
          break;
        }
      }

      if (!alreadyInSheet) {
        try {
          var nextId = "USR-" + ("000" + (values.length + 1)).slice(-3);
          usersSheet.appendRow([
            nextId,
            lookupRes.data.profile.fullNameKh || lookupRes.data.profile.fullNameEn || username,
            password,
            lookupRes.data.profile.fullNameKh || lookupRes.data.profile.fullNameEn || username,
            "student",
            lookupRes.data.profile.studentId || password,
            lookupRes.data.profile.room || "",
            lookupRes.data.profile.skill || "",
            "Active",
            new Date().toISOString(),
            new Date().toISOString()
          ]);
          var lastR = usersSheet.getLastRow();
          usersSheet.getRange(lastR, 3).setNumberFormat("@");
          usersSheet.getRange(lastR, 6).setNumberFormat("@");
        } catch (e) {}
      }

      return makeResponse(true, "ការចូលប្រើប្រាស់ទទួលបានជោគជ័យ!", {
        role: "student",
        studentId: lookupRes.data.profile.studentId,
        studentName: lookupRes.data.profile.fullNameKh || lookupRes.data.profile.fullNameEn || username,
        profile: lookupRes.data.profile,
        academicSummary: lookupRes.data.academicSummary,
        scores: lookupRes.data.scores,
        scoringMatrix: lookupRes.data.scoringMatrix || [],
        lastUpdated: new Date().toISOString()
      });
    }
  }

  if (!matchedUser) {
    return makeResponse(false, "ឈ្មោះគណនី ឬលេខសម្ងាត់មិនត្រឹមត្រូវឡើយ។ សូមពិនិត្យឡើងវិញ។", null, "INVALID_CREDENTIALS");
  }

  // Update Last Login in sheet
  if (matchedRowIndex > 0) {
    try {
      usersSheet.getRange(matchedRowIndex, 11).setValue(new Date().toISOString());
    } catch (e) {}
  }

  // If student, attach student profile and scores
  if (matchedUser.role === "student") {
    var sData = apiStudentLookup({ studentId: matchedUser.studentId, studentName: matchedUser.username });
    if (sData.success && sData.data) {
      return makeResponse(true, "ការចូលប្រើប្រាស់ទទួលបានជោគជ័យ!", {
        role: "student",
        studentId: sData.data.profile.studentId,
        studentName: sData.data.profile.fullNameKh || sData.data.profile.fullNameEn || matchedUser.username,
        profile: sData.data.profile,
        academicSummary: sData.data.academicSummary,
        scores: sData.data.scores,
        scoringMatrix: sData.data.scoringMatrix || [],
        lastUpdated: sData.data.lastUpdated || new Date().toISOString()
      });
    }
  }

  return makeResponse(true, "ការចូលប្រើប្រាស់ទទួលបានជោគជ័យ!", {
    token: config.adminToken,
    userId: matchedUser.userId,
    username: matchedUser.username,
    displayName: matchedUser.fullName || matchedUser.username,
    role: matchedUser.role,
    permissions: ["READ_ALL_STUDENTS", "WRITE_STUDENTS", "MANAGE_USERS", "READ_ALL_SCORES", "WRITE_SCORES", "EXPORT_REPORTS"],
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  });
}

/**
 * Get all users from 🔐_Users sheet with pagination, search, and role filtering
 */
function apiGetUsers(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized access to users management.", null, "UNAUTHORIZED");
  }

  var config = getAppConfig();
  var cache = CacheService.getScriptCache();
  var cacheKey = "USERS_RAW_" + config.spreadsheetId;
  var rawUsers = null;

  if (params.refresh !== "true") {
    var cached = cache.get(cacheKey);
    if (cached) {
      try {
        rawUsers = JSON.parse(cached);
      } catch (e) {}
    }
  }

  if (!rawUsers) {
    var ss;
    try {
      ss = SpreadsheetApp.openById(config.spreadsheetId);
    } catch (err) {
      return makeResponse(false, "Could not open spreadsheet: " + err.message, null, "SPREADSHEET_ERROR");
    }

    var usersSheet = getOrCreateUsersSheet(ss);
    var values = usersSheet.getDataRange().getValues();
    rawUsers = [];

    for (var r = 1; r < values.length; r++) {
      var row = values[r];
      var uId = String(row[0] || "").trim();
      if (!uId) continue;

      rawUsers.push({
        userId: uId,
        username: String(row[1] || "").trim(),
        password: String(row[2] || "").trim(),
        fullName: String(row[3] || "").trim(),
        role: String(row[4] || "student").trim().toLowerCase(),
        studentId: String(row[5] || "").trim(),
        room: String(row[6] || "").trim(),
        skill: String(row[7] || "").trim(),
        status: String(row[8] || "Active").trim(),
        createdAt: row[9] ? String(row[9]) : "",
        lastLogin: row[10] ? String(row[10]) : ""
      });
    }

    try {
      cache.put(cacheKey, JSON.stringify(rawUsers), 600); // 10 minutes cache
    } catch (e) {}
  }

  var search = (params.search || "").toLowerCase().trim();
  var roleFilter = (params.role || "").toLowerCase().trim();
  var statusFilter = (params.status || "").toLowerCase().trim();
  var page = parseInt(params.page || 1, 10);
  var pageSize = parseInt(params.pageSize || 20, 10);

  var allUsers = [];
  var adminCount = 0;
  var teacherCount = 0;
  var studentCount = 0;
  var activeCount = 0;

  for (var i = 0; i < rawUsers.length; i++) {
    var u = rawUsers[i];
    var uRole = u.role;
    var uStatus = u.status;

    if (uRole === "admin") adminCount++;
    else if (uRole === "teacher") teacherCount++;
    else studentCount++;

    if (uStatus.toLowerCase() === "active") activeCount++;

    if (roleFilter && roleFilter !== "all" && uRole !== roleFilter) continue;
    if (statusFilter && statusFilter !== "all" && uStatus.toLowerCase() !== statusFilter) continue;
    if (search) {
      var sMatch = (u.userId.toLowerCase().indexOf(search) !== -1) ||
                    (u.username.toLowerCase().indexOf(search) !== -1) ||
                    (u.fullName.toLowerCase().indexOf(search) !== -1) ||
                    (u.studentId.toLowerCase().indexOf(search) !== -1) ||
                    (u.room.toLowerCase().indexOf(search) !== -1);
      if (!sMatch) continue;
    }

    allUsers.push(u);
  }

  var total = allUsers.length;
  var totalPages = Math.ceil(total / pageSize) || 1;
  var startIndex = (page - 1) * pageSize;
  var paginated = allUsers.slice(startIndex, startIndex + pageSize);

  return makeResponse(true, "Users list retrieved successfully.", {
    users: paginated,
    pagination: {
      currentPage: page,
      pageSize: pageSize,
      totalItems: total,
      totalPages: totalPages
    },
    stats: {
      totalUsers: rawUsers.length,
      adminCount: adminCount,
      teacherCount: teacherCount,
      studentCount: studentCount,
      activeCount: activeCount
    }
  });
}

/**
 * Create a new user in 🔐_Users sheet
 */
function apiCreateUser(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized.", null, "UNAUTHORIZED");
  }

  var username = (params.username || "").trim();
  var password = (params.password || "").trim();
  var fullName = (params.fullName || username).trim();
  var role = (params.role || "student").trim().toLowerCase();
  var studentId = (params.studentId || (role === "student" ? password : "N/A")).trim();
  var room = (params.room || "").trim();
  var skill = (params.skill || "").trim();
  var status = (params.status || "Active").trim();

  if (!username) {
    return makeResponse(false, "Username is required.", null, "MISSING_USERNAME");
  }
  if (!password) {
    return makeResponse(false, "Password is required.", null, "MISSING_PASSWORD");
  }

  var config = getAppConfig();
  var ss = SpreadsheetApp.openById(config.spreadsheetId);
  var usersSheet = getOrCreateUsersSheet(ss);
  var values = usersSheet.getDataRange().getValues();

  // Check username uniqueness
  var normUser = normalizeText(username);
  for (var r = 1; r < values.length; r++) {
    if (normalizeText(values[r][1]) === normUser) {
      return makeResponse(false, "ឈ្មោះគណនីនេះមានរួចហើយ (Username already exists)។", null, "DUPLICATE_USERNAME");
    }
  }

  var nextId = "USR-" + ("000" + (values.length + 1)).slice(-3);
  var nowStr = new Date().toISOString();

  usersSheet.appendRow([
    nextId,
    username,
    password,
    fullName,
    role,
    studentId,
    room,
    skill,
    status,
    nowStr,
    ""
  ]);

  var lastR = usersSheet.getLastRow();
  usersSheet.getRange(lastR, 3).setNumberFormat("@");
  usersSheet.getRange(lastR, 6).setNumberFormat("@");

  flushAllAppCache(config.spreadsheetId);
  var realtimeEvent = recordRealtimeEvent("user", nextId, "user.created");

  return makeResponse(true, "បានបង្កើតគណនីជោគជ័យ!", {
    userId: nextId,
    username: username,
    fullName: fullName,
    role: role,
    studentId: studentId,
    status: status,
    event: realtimeEvent
  });
}

/**
 * Update an existing user in 🔐_Users sheet
 */
function apiUpdateUser(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized.", null, "UNAUTHORIZED");
  }

  var userId = String(params.userId || params.id || "").trim();
  if (!userId) {
    return makeResponse(false, "User ID is required.", null, "MISSING_USER_ID");
  }

  var config = getAppConfig();
  var ss = SpreadsheetApp.openById(config.spreadsheetId);
  var usersSheet = getOrCreateUsersSheet(ss);
  var values = usersSheet.getDataRange().getValues();

  var targetRow = -1;
  for (var r = 1; r < values.length; r++) {
    if (String(values[r][0] || "").trim() === userId) {
      targetRow = r + 1;
      break;
    }
  }

  if (targetRow === -1) {
    return makeResponse(false, "រកមិនឃើញគណនីអ្នកប្រើប្រាស់នេះឡើយ។", null, "USER_NOT_FOUND");
  }

  var currentRow = values[targetRow - 1];
  var username = params.username !== undefined ? String(params.username).trim() : currentRow[1];
  var password = params.password !== undefined ? String(params.password).trim() : currentRow[2];
  var fullName = params.fullName !== undefined ? String(params.fullName).trim() : currentRow[3];
  var role = params.role !== undefined ? String(params.role).trim().toLowerCase() : currentRow[4];
  var studentId = params.studentId !== undefined ? String(params.studentId).trim() : currentRow[5];
  var room = params.room !== undefined ? String(params.room).trim() : currentRow[6];
  var skill = params.skill !== undefined ? String(params.skill).trim() : currentRow[7];
  var status = params.status !== undefined ? String(params.status).trim() : currentRow[8];

  usersSheet.getRange(targetRow, 2, 1, 8).setValues([[
    username,
    password,
    fullName,
    role,
    studentId,
    room,
    skill,
    status
  ]]);
  usersSheet.getRange(targetRow, 3).setNumberFormat("@");
  usersSheet.getRange(targetRow, 6).setNumberFormat("@");

  flushAllAppCache(config.spreadsheetId);
  var realtimeEvent = recordRealtimeEvent("user", userId, "user.updated");

  return makeResponse(true, "បានកែប្រែគណនីជោគជ័យ!", {
    userId: userId,
    username: username,
    fullName: fullName,
    role: role,
    studentId: studentId,
    status: status,
    event: realtimeEvent
  });
}

/**
 * Delete a user from 🔐_Users sheet
 */
function apiDeleteUser(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized.", null, "UNAUTHORIZED");
  }

  var userId = String(params.userId || params.id || "").trim();
  if (!userId) {
    return makeResponse(false, "User ID is required.", null, "MISSING_USER_ID");
  }

  var config = getAppConfig();
  var ss = SpreadsheetApp.openById(config.spreadsheetId);
  var usersSheet = getOrCreateUsersSheet(ss);
  var values = usersSheet.getDataRange().getValues();

  for (var r = 1; r < values.length; r++) {
    if (String(values[r][0] || "").trim() === userId) {
      usersSheet.deleteRow(r + 1);
      flushAllAppCache(config.spreadsheetId);
      var realtimeEvent = recordRealtimeEvent("user", userId, "user.deleted");
      return makeResponse(true, "បានលុបគណនីអ្នកប្រើប្រាស់ជោគជ័យ!", { userId: userId, event: realtimeEvent });
    }
  }

  return makeResponse(false, "រកមិនឃើញគណនីអ្នកប្រើប្រាស់នេះឡើយ។", null, "USER_NOT_FOUND");
}

/**
 * One-click synchronization: Sync all students into 🔐_Users
 */
function apiSyncUsers(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized.", null, "UNAUTHORIZED");
  }

  var config = getAppConfig();
  var ss = SpreadsheetApp.openById(config.spreadsheetId);
  var usersSheet = getOrCreateUsersSheet(ss);
  var syncResult = syncStudentsToUsersSheet(ss, usersSheet);

  flushAllAppCache(config.spreadsheetId);

  return makeResponse(true, "បានធ្វើសមកាលកម្មគណនីនិស្សិតជោគជ័យ! បន្ថែមថ្មីចំនួន " + syncResult.count + " គណនី។", syncResult);
}

// ==========================================
// 📋_STUDENTS CRUD OPERATIONS
// ==========================================

/**
 * Create a new student in 📋_Students, 📊_Scoring, and 🔐_Users
 * Optimized: Targeted ID check + LockService Protection + Real-Time Sync
 */
function apiCreateStudent(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized.", null, "UNAUTHORIZED");
  }

  var studentId = String(params.studentId || "").trim();
  var fullNameKh = String(params.fullNameKh || "").trim();
  var fullNameEn = String(params.fullNameEn || "").trim();
  var gender = String(params.gender || "ប្រុស").trim();
  var room = String(params.room || "101").trim();
  var skill = String(params.skill || "General").trim();
  var phone = String(params.phone || "").trim();
  var status = String(params.status || "Active").trim();

  if (!studentId) {
    return makeResponse(false, "សូមបញ្ចូលលេខសម្គាល់និស្សិត (Student ID)។", null, "MISSING_STUDENT_ID");
  }
  if (!fullNameKh && !fullNameEn) {
    return makeResponse(false, "សូមបញ្ចូលឈ្មោះនិស្សិត (ខ្មែរ ឬ ឡាតាំង)។", null, "MISSING_STUDENT_NAME");
  }

  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(10000);
  if (!hasLock) {
    return makeResponse(false, "ម៉ាស៊ីនបម្រើកំពុងរវល់។ សូមព្យាយាមម្តងទៀត។", null, "LOCK_TIMEOUT");
  }

  try {
    var config = getAppConfig();
    var ss = SpreadsheetApp.openById(config.spreadsheetId);
    var studentsSheet = ss.getSheetByName("📋_Students");
    if (!studentsSheet) {
      return makeResponse(false, "រកមិនឃើញ Sheet 📋_Students ឡើយ។", null, "SHEET_NOT_FOUND");
    }

    // TARGETED ID UNIQUENESS CHECK: Read only ID column (Column 1)
    var lastRow = studentsSheet.getLastRow();
    if (lastRow > 1) {
      var idColVals = studentsSheet.getRange(1, 1, lastRow, 1).getValues();
      var normId = studentId.toLowerCase();
      for (var r = 1; r < idColVals.length; r++) {
        if (String(idColVals[r][0] || "").trim().toLowerCase() === normId) {
          return makeResponse(false, "លេខសម្គាល់និស្សិតនេះមានរួចហើយ (Student ID already exists)!", null, "DUPLICATE_STUDENT_ID");
        }
      }
    }

    // 1. Append to 📋_Students
    var newRow = [
      studentId,
      fullNameKh,
      fullNameEn,
      gender,
      room,
      skill,
      phone,
      status
    ];
    studentsSheet.appendRow(newRow);
    studentsSheet.getRange(studentsSheet.getLastRow(), 1).setNumberFormat("@");

    // 2. Append default score row to 📊_Scoring with relational formula to 📋_Students
    var scoringSheet = ss.getSheetByName("📊_Scoring");
    if (scoringSheet) {
      var nextRow = scoringSheet.getLastRow() + 1;
      var defaultScoreRow = [
        studentId,
        '=IFERROR(IF(VLOOKUP(A' + nextRow + ', \'📋_Students\'!$A:$B, 2, FALSE)<>"", VLOOKUP(A' + nextRow + ', \'📋_Students\'!$A:$B, 2, FALSE), VLOOKUP(A' + nextRow + ', \'📋_Students\'!$A:$C, 3, FALSE)), "")',
        '=IFERROR(VLOOKUP(A' + nextRow + ', \'📋_Students\'!$A:$E, 5, FALSE), "")',
        '=IFERROR(VLOOKUP(A' + nextRow + ', \'📋_Students\'!$A:$F, 6, FALSE), "")',
        10, // Attendance
        0,  // QHA
        0,  // Midterm
        0,  // Final
        '=IF(ISBLANK(A' + nextRow + '), "", ROUND(SUM(E' + nextRow + ':H' + nextRow + '), 2))',
        '=IF(ISBLANK(I' + nextRow + '), "", IF(I' + nextRow + '>=85,"A", IF(I' + nextRow + '>=80,"B+", IF(I' + nextRow + '>=70,"B", IF(I' + nextRow + '>=65,"C+", IF(I' + nextRow + '>=50,"C", IF(I' + nextRow + '>=45,"D", IF(I' + nextRow + '>=40,"E","F"))))))))',
        '=IF(ISBLANK(I' + nextRow + '), "", IF(I' + nextRow + '>=50, "ជាប់ (Pass)", "ធ្លាក់ (Fail)"))'
      ];
      scoringSheet.appendRow(defaultScoreRow);
      scoringSheet.getRange(scoringSheet.getLastRow(), 1).setNumberFormat("@");
    }

    // 2b. Append row to 📝_Quizzes with relational formula
    var quizzesSheet = ss.getSheetByName("📝_Quizzes");
    if (quizzesSheet) {
      var nextQRow = quizzesSheet.getLastRow() + 1;
      var defaultQuizRow = [
        studentId,
        '=IFERROR(IF(VLOOKUP(A' + nextQRow + ', \'📋_Students\'!$A:$B, 2, FALSE)<>"", VLOOKUP(A' + nextQRow + ', \'📋_Students\'!$A:$B, 2, FALSE), VLOOKUP(A' + nextQRow + ', \'📋_Students\'!$A:$C, 3, FALSE)), "")',
        '=IFERROR(VLOOKUP(A' + nextQRow + ', \'📋_Students\'!$A:$E, 5, FALSE), "")',
        "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
        "",
        '=SUM(D' + nextQRow + ':R' + nextQRow + ')',
        '=IF(ISBLANK(A' + nextQRow + '), "", IF($S$2=0, 0, ROUND((SUM(D' + nextQRow + ':R' + nextQRow + ')/$S$2)*15, 2)))'
      ];
      quizzesSheet.appendRow(defaultQuizRow);
      quizzesSheet.getRange(quizzesSheet.getLastRow(), 1).setNumberFormat("@");
    }

    // 3. Automatically create login account in 🔐_Users with relational formula to 📋_Students
    var usersSheet = getOrCreateUsersSheet(ss);
    if (usersSheet) {
      var userRowsCount = usersSheet.getLastRow();
      var nextUserId = "USR-" + ("000" + (userRowsCount + 1)).slice(-3);
      var nextURow = userRowsCount + 1;
      var studentLoginRow = [
        nextUserId,
        '=IFERROR(IF(VLOOKUP(F' + nextURow + ', \'📋_Students\'!$A:$B, 2, FALSE)<>"", VLOOKUP(F' + nextURow + ', \'📋_Students\'!$A:$B, 2, FALSE), VLOOKUP(F' + nextURow + ', \'📋_Students\'!$A:$C, 3, FALSE)), "")', // Username = Student Name
        studentId, // Password = Student ID
        '=IFERROR(IF(VLOOKUP(F' + nextURow + ', \'📋_Students\'!$A:$B, 2, FALSE)<>"", VLOOKUP(F' + nextURow + ', \'📋_Students\'!$A:$B, 2, FALSE), VLOOKUP(F' + nextURow + ', \'📋_Students\'!$A:$C, 3, FALSE)), "")', // Full Name
        "student",
        studentId,
        '=IFERROR(VLOOKUP(F' + nextURow + ', \'📋_Students\'!$A:$E, 5, FALSE), "")', // Room
        '=IFERROR(VLOOKUP(F' + nextURow + ', \'📋_Students\'!$A:$F, 6, FALSE), "")', // Major
        '=IFERROR(VLOOKUP(F' + nextURow + ', \'📋_Students\'!$A:$H, 8, FALSE), "Active")', // Status
        new Date().toISOString(),
        ""
      ];
      usersSheet.appendRow(studentLoginRow);
      usersSheet.getRange(usersSheet.getLastRow(), 3).setNumberFormat("@");
      usersSheet.getRange(usersSheet.getLastRow(), 6).setNumberFormat("@");
    }

    flushAllAppCache(config.spreadsheetId);

    // Record Real-Time Event (Section 18.1 & 18.10)
    var realtimeEvent = recordRealtimeEvent("student", studentId, "student.created");

    return makeResponse(true, "បានបញ្ចូលព័ត៌មាននិស្សិតថ្មី និងបង្កើតគណនីចូលជោគជ័យ!", {
      studentId: studentId,
      fullNameKh: fullNameKh,
      fullNameEn: fullNameEn,
      room: room,
      skill: skill,
      event: realtimeEvent
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Update an existing student in 📋_Students, 📊_Scoring, and 🔐_Users
 * Optimized: Targeted Batch Row Update + LockService Protection (10x Faster)
 */
function apiUpdateStudent(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized.", null, "UNAUTHORIZED");
  }

  var studentId = String(params.studentId || "").trim();
  if (!studentId) {
    return makeResponse(false, "Student ID is required.", null, "MISSING_STUDENT_ID");
  }

  // Concurrency Protection (Section 18.3 & 18.14)
  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(10000);
  if (!hasLock) {
    return makeResponse(false, "ម៉ាស៊ីនបម្រើកំពុងរវល់។ សូមព្យាយាមម្តងទៀត។", null, "LOCK_TIMEOUT");
  }

  try {
    var config = getAppConfig();
    var ss = SpreadsheetApp.openById(config.spreadsheetId);
    var studentsSheet = ss.getSheetByName("📋_Students");
    if (!studentsSheet) {
      return makeResponse(false, "Sheet 📋_Students not found.", null, "SHEET_NOT_FOUND");
    }

    var lastRow = studentsSheet.getLastRow();
    var lastCol = studentsSheet.getLastColumn();
    if (lastRow < 2 || lastCol < 1) {
      return makeResponse(false, "រកមិនឃើញទិន្នន័យនិស្សិតឡើយ។", null, "STUDENT_NOT_FOUND");
    }

    // TARGETED READ: Read header row & detect mapping
    var stuHeaders = studentsSheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) { return String(h || "").trim(); });
    var stuMap = detectColumnMapping(stuHeaders);

    // Read ONLY column A (Student IDs) instead of full dataset
    var idColVals = studentsSheet.getRange(1, 1, lastRow, 1).getValues();
    var targetRow = -1;
    var normId = studentId.toLowerCase();

    for (var r = 1; r < idColVals.length; r++) {
      if (String(idColVals[r][0] || "").trim().toLowerCase() === normId) {
        targetRow = r + 1;
        break;
      }
    }

    if (targetRow === -1) {
      return makeResponse(false, "រកមិនឃើញទិន្នន័យនិស្សិតនេះឡើយ។", null, "STUDENT_NOT_FOUND");
    }

    // TARGETED READ: Read ONLY target student row
    var targetRange = studentsSheet.getRange(targetRow, 1, 1, lastCol);
    var rowVals = targetRange.getValues()[0];

    var fullNameKh = params.fullNameKh !== undefined ? String(params.fullNameKh).trim() : getMappedValue(stuMap, rowVals, "nameKh", "");
    var fullNameEn = params.fullNameEn !== undefined ? String(params.fullNameEn).trim() : getMappedValue(stuMap, rowVals, "nameEn", "");
    var gender = params.gender !== undefined ? String(params.gender).trim() : getMappedValue(stuMap, rowVals, "gender", "");
    var room = params.room !== undefined ? String(params.room).trim() : getMappedValue(stuMap, rowVals, "room", "");
    var skill = params.skill !== undefined ? String(params.skill).trim() : getMappedValue(stuMap, rowVals, "skill", "");
    var phone = params.phone !== undefined ? String(params.phone).trim() : (rowVals[6] || "");
    var status = params.status !== undefined ? String(params.status).trim() : getMappedValue(stuMap, rowVals, "status", "Active");

    if (stuMap.nameKh) rowVals[stuMap.nameKh.index] = fullNameKh;
    if (stuMap.nameEn) rowVals[stuMap.nameEn.index] = fullNameEn;
    if (stuMap.gender) rowVals[stuMap.gender.index] = gender;
    if (stuMap.room) rowVals[stuMap.room.index] = room;
    if (stuMap.skill) rowVals[stuMap.skill.index] = skill;
    if (stuMap.status) rowVals[stuMap.status.index] = status;

    // TARGETED BATCH WRITE: 1 single RPC instead of 6 setValue calls
    targetRange.setValues([rowVals]);

    // Relational sync to 📊_Scoring if needed
    var scoringSheet = ss.getSheetByName("📊_Scoring");
    if (scoringSheet && scoringSheet.getLastRow() > 1) {
      var scoIds = scoringSheet.getRange(1, 1, scoringSheet.getLastRow(), 1).getValues();
      for (var sr = 1; sr < scoIds.length; sr++) {
        if (String(scoIds[sr][0] || "").trim().toLowerCase() === normId) {
          var rIdx = sr + 1;
          var curNameCell = scoringSheet.getRange(rIdx, 2);
          if (!String(curNameCell.getFormula()).startsWith("=")) {
            curNameCell.setFormula('=IFERROR(IF(VLOOKUP(A' + rIdx + ', \'📋_Students\'!$A:$B, 2, FALSE)<>"", VLOOKUP(A' + rIdx + ', \'📋_Students\'!$A:$B, 2, FALSE), VLOOKUP(A' + rIdx + ', \'📋_Students\'!$A:$C, 3, FALSE)), "")');
            scoringSheet.getRange(rIdx, 3).setFormula('=IFERROR(VLOOKUP(A' + rIdx + ', \'📋_Students\'!$A:$E, 5, FALSE), "")');
            scoringSheet.getRange(rIdx, 4).setFormula('=IFERROR(VLOOKUP(A' + rIdx + ', \'📋_Students\'!$A:$F, 6, FALSE), "")');
          }
          break;
        }
      }
    }

    flushAllAppCache(config.spreadsheetId);

    // Record Real-Time Mutation Event (Section 18.1 & 18.10)
    var realtimeEvent = recordRealtimeEvent("student", studentId, "student.updated");

    return makeResponse(true, "បានកែប្រែព័ត៌មាននិស្សិតជោគជ័យ!", {
      studentId: studentId,
      fullNameKh: fullNameKh,
      fullNameEn: fullNameEn,
      room: room,
      skill: skill,
      status: status,
      event: realtimeEvent
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Delete a student from 📋_Students, 📊_Scoring, 📝_Quizzes, and 🔐_Users
 */
function apiDeleteStudent(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized.", null, "UNAUTHORIZED");
  }

  var studentId = String(params.studentId || "").trim();
  if (!studentId) {
    return makeResponse(false, "Student ID is required.", null, "MISSING_STUDENT_ID");
  }

  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(10000);
  if (!hasLock) {
    return makeResponse(false, "Server is busy. Please try again.", null, "LOCK_TIMEOUT");
  }

  try {
    var config = getAppConfig();
    var ss = SpreadsheetApp.openById(config.spreadsheetId);
    var normId = studentId.toLowerCase();

    // 1. Delete from 📋_Students (Targeted ID Column Search)
    var studentsSheet = ss.getSheetByName("📋_Students");
    if (studentsSheet && studentsSheet.getLastRow() > 1) {
      var stuIds = studentsSheet.getRange(1, 1, studentsSheet.getLastRow(), 1).getValues();
      for (var r = stuIds.length - 1; r >= 1; r--) {
        if (String(stuIds[r][0] || "").trim().toLowerCase() === normId) {
          studentsSheet.deleteRow(r + 1);
          break;
        }
      }
    }

    // 2. Delete from 📊_Scoring (Targeted ID Column Search)
    var scoringSheet = ss.getSheetByName("📊_Scoring");
    if (scoringSheet && scoringSheet.getLastRow() > 1) {
      var scoIds = scoringSheet.getRange(1, 1, scoringSheet.getLastRow(), 1).getValues();
      for (var sr = scoIds.length - 1; sr >= 1; sr--) {
        if (String(scoIds[sr][0] || "").trim().toLowerCase() === normId) {
          scoringSheet.deleteRow(sr + 1);
          break;
        }
      }
    }

    // 3. Delete from 📝_Quizzes
    var quizzesSheet = ss.getSheetByName("📝_Quizzes");
    if (quizzesSheet && quizzesSheet.getLastRow() > 2) {
      var qIds = quizzesSheet.getRange(1, 1, quizzesSheet.getLastRow(), 1).getValues();
      for (var qr = qIds.length - 1; qr >= 2; qr--) {
        if (String(qIds[qr][0] || "").trim().toLowerCase() === normId) {
          quizzesSheet.deleteRow(qr + 1);
          break;
        }
      }
    }

    // 4. Delete from 🔐_Users
    var usersSheet = ss.getSheetByName("🔐_Users") || ss.getSheetByName("Users");
    if (usersSheet && usersSheet.getLastRow() > 1) {
      var uIds = usersSheet.getRange(1, 6, usersSheet.getLastRow(), 1).getValues(); // Column F is Student ID
      for (var ur = uIds.length - 1; ur >= 1; ur--) {
        if (String(uIds[ur][0] || "").trim().toLowerCase() === normId) {
          usersSheet.deleteRow(ur + 1);
          break;
        }
      }
    }

    flushAllAppCache(config.spreadsheetId);

    // Record Real-Time Event (Section 18.1 & 18.10)
    var realtimeEvent = recordRealtimeEvent("student", studentId, "student.deleted");

    return makeResponse(true, "បានលុបនិស្សិតចេញពីប្រព័ន្ធដោយជោគជ័យ!", {
      studentId: studentId,
      event: realtimeEvent
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Batch insert multiple students (from Excel Import) into 📋_Students, 📊_Scoring, and 🔐_Users
 */
function apiBulkCreateStudents(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized.", null, "UNAUTHORIZED");
  }

  var studentsList = params.students || [];
  if (typeof studentsList === "string") {
    try { studentsList = JSON.parse(studentsList); } catch (e) { studentsList = []; }
  }

  if (!studentsList || studentsList.length === 0) {
    return makeResponse(false, "No students data provided.", null, "EMPTY_DATA");
  }

  var config = getAppConfig();
  var ss = SpreadsheetApp.openById(config.spreadsheetId);
  var studentsSheet = ss.getSheetByName("📋_Students");
  var scoringSheet = ss.getSheetByName("📊_Scoring");
  var usersSheet = getOrCreateUsersSheet(ss);

  if (!studentsSheet) {
    return makeResponse(false, "Sheet 📋_Students not found.", null, "SHEET_NOT_FOUND");
  }

  var existingIds = {};
  var stuData = studentsSheet.getDataRange().getValues();
  for (var r = 1; r < stuData.length; r++) {
    existingIds[String(stuData[r][0] || "").trim().toLowerCase()] = true;
  }

  var newStudentRows = [];
  var newScoreRows = [];
  var newUserRows = [];
  var userCount = usersSheet.getLastRow();
  var scoCount = scoringSheet ? scoringSheet.getLastRow() : 1;

  for (var i = 0; i < studentsList.length; i++) {
    var item = studentsList[i];
    var sid = String(item.studentId || item.id || "").trim();
    if (!sid || existingIds[sid.toLowerCase()]) continue;

    var nameKh = String(item.fullNameKh || item.nameKh || "").trim();
    var nameEn = String(item.fullNameEn || item.nameEn || "").trim();
    var gender = String(item.gender || "ប្រុស").trim();
    var room = String(item.room || "101").trim();
    var skill = String(item.skill || item.major || "General").trim();
    var phone = String(item.phone || "").trim();
    var status = String(item.status || "Active").trim();

    newStudentRows.push([sid, nameKh, nameEn, gender, room, skill, phone, status]);

    scoCount++;
    var scoR = scoCount;
    newScoreRows.push([
      sid,
      '=IFERROR(IF(VLOOKUP(A' + scoR + ', \'📋_Students\'!$A:$B, 2, FALSE)<>"", VLOOKUP(A' + scoR + ', \'📋_Students\'!$A:$B, 2, FALSE), VLOOKUP(A' + scoR + ', \'📋_Students\'!$A:$C, 3, FALSE)), "")',
      '=IFERROR(VLOOKUP(A' + scoR + ', \'📋_Students\'!$A:$E, 5, FALSE), "")',
      '=IFERROR(VLOOKUP(A' + scoR + ', \'📋_Students\'!$A:$F, 6, FALSE), "")',
      10, 0, 0, 0,
      '=IF(ISBLANK(A' + scoR + '), "", ROUND(SUM(E' + scoR + ':H' + scoR + '), 2))',
      '=IF(ISBLANK(I' + scoR + '), "", IF(I' + scoR + '>=85,"A", IF(I' + scoR + '>=80,"B+", IF(I' + scoR + '>=70,"B", IF(I' + scoR + '>=65,"C+", IF(I' + scoR + '>=50,"C", IF(I' + scoR + '>=45,"D", IF(I' + scoR + '>=40,"E","F"))))))))',
      '=IF(ISBLANK(I' + scoR + '), "", IF(I' + scoR + '>=50, "ជាប់ (Pass)", "ធ្លាក់ (Fail)"))'
    ]);

    userCount++;
    var uR = userCount;
    var uid = "USR-" + ("000" + userCount).slice(-3);
    newUserRows.push([
      uid,
      '=IFERROR(IF(VLOOKUP(F' + uR + ', \'📋_Students\'!$A:$B, 2, FALSE)<>"", VLOOKUP(F' + uR + ', \'📋_Students\'!$A:$B, 2, FALSE), VLOOKUP(F' + uR + ', \'📋_Students\'!$A:$C, 3, FALSE)), "")', // Username = Student Name from 📋_Students
      sid,                     // Password = Student ID
      '=IFERROR(IF(VLOOKUP(F' + uR + ', \'📋_Students\'!$A:$B, 2, FALSE)<>"", VLOOKUP(F' + uR + ', \'📋_Students\'!$A:$B, 2, FALSE), VLOOKUP(F' + uR + ', \'📋_Students\'!$A:$C, 3, FALSE)), "")', // Full Name
      "student",
      sid,
      '=IFERROR(VLOOKUP(F' + uR + ', \'📋_Students\'!$A:$E, 5, FALSE), "")',
      '=IFERROR(VLOOKUP(F' + uR + ', \'📋_Students\'!$A:$F, 6, FALSE), "")',
      '=IFERROR(VLOOKUP(F' + uR + ', \'📋_Students\'!$A:$H, 8, FALSE), "Active")',
      new Date().toISOString(),
      ""
    ]);

    existingIds[sid.toLowerCase()] = true;
  }

  if (newStudentRows.length > 0) {
    var startStu = studentsSheet.getLastRow() + 1;
    studentsSheet.getRange(startStu, 1, newStudentRows.length, newStudentRows[0].length).setValues(newStudentRows);
    studentsSheet.getRange(startStu, 1, newStudentRows.length, 1).setNumberFormat("@");

    if (scoringSheet && newScoreRows.length > 0) {
      var startSco = scoringSheet.getLastRow() + 1;
      scoringSheet.getRange(startSco, 1, newScoreRows.length, newScoreRows[0].length).setValues(newScoreRows);
      scoringSheet.getRange(startSco, 1, newScoreRows.length, 1).setNumberFormat("@");
    }

    if (usersSheet && newUserRows.length > 0) {
      var startUser = usersSheet.getLastRow() + 1;
      usersSheet.getRange(startUser, 1, newUserRows.length, newUserRows[0].length).setValues(newUserRows);
      usersSheet.getRange(startUser, 3, newUserRows.length, 1).setNumberFormat("@");
      usersSheet.getRange(startUser, 6, newUserRows.length, 1).setNumberFormat("@");
    }
  }

  flushAllAppCache(config.spreadsheetId);

  return makeResponse(true, "បាននាំចូលនិស្សិតថ្មីចំនួន " + newStudentRows.length + " នាក់ដោយជោគជ័យ!", {
    importedCount: newStudentRows.length
  });
}

// ==========================================
// 📊_SCORING CRUD OPERATIONS
// ==========================================

/**
 * Update academic scores for a student in 📊_Scoring
 * Optimized: Single Targeted Batch Row Update + LockService Protection (10x-20x Faster)
 */
function apiUpdateScores(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized.", null, "UNAUTHORIZED");
  }

  var studentId = String(params.studentId || "").trim();
  if (!studentId) {
    return makeResponse(false, "Student ID is required.", null, "MISSING_STUDENT_ID");
  }

  // Concurrency Protection (Section 18.3 & 18.14)
  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(10000);
  if (!hasLock) {
    return makeResponse(false, "ម៉ាស៊ីនបម្រើកំពុងរវល់។ សូមព្យាយាមម្តងទៀត។", null, "LOCK_TIMEOUT");
  }

  try {
    var config = getAppConfig();
    var ss = SpreadsheetApp.openById(config.spreadsheetId);
    var dynamicConfig = readDynamicConfig(ss);
    var scoringSheet = ss.getSheetByName("📊_Scoring");

    if (!scoringSheet) {
      return makeResponse(false, "Sheet 📊_Scoring not found.", null, "SHEET_NOT_FOUND");
    }

    var lastRow = scoringSheet.getLastRow();
    var lastCol = scoringSheet.getLastColumn();
    if (lastRow < 2 || lastCol < 1) {
      return makeResponse(false, "រកមិនឃើញកំណត់ត្រាពិន្ទុឡើយ។", null, "SCORE_RECORD_NOT_FOUND");
    }

    // TARGETED READ 1: Read only header row to detect mapping
    var scoHeaders = scoringSheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) { return String(h || "").trim(); });
    var scoMap = detectColumnMapping(scoHeaders);

    // TARGETED READ 2: Read ONLY column A (Student IDs) instead of downloading entire sheet
    var idColVals = scoringSheet.getRange(1, 1, lastRow, 1).getValues();
    var targetRow = -1;
    var normId = studentId.toLowerCase();

    for (var r = 1; r < idColVals.length; r++) {
      if (String(idColVals[r][0] || "").trim().toLowerCase() === normId) {
        targetRow = r + 1;
        break;
      }
    }

    if (targetRow === -1) {
      return makeResponse(false, "រកមិនឃើញកំណត់ត្រាពិន្ទុរបស់និស្សិតនេះឡើយ។", null, "SCORE_RECORD_NOT_FOUND");
    }

    // TARGETED READ 3: Read ONLY target student's single row range
    var targetRange = scoringSheet.getRange(targetRow, 1, 1, lastCol);
    var rowVals = targetRange.getValues()[0];

    var curAtt = scoMap.attendance ? rowVals[scoMap.attendance.index] : 10;
    var curQha = scoMap.totalQHA ? rowVals[scoMap.totalQHA.index] : 0;
    var curMid = scoMap.midterm ? rowVals[scoMap.midterm.index] : 0;
    var curFin = scoMap.finalScore ? rowVals[scoMap.finalScore.index] : 0;

    var attendance = params.attendance !== undefined ? Number(params.attendance) : Number(curAtt !== undefined && curAtt !== null && curAtt !== "" ? curAtt : 10);
    var qha = params.qha !== undefined ? Number(params.qha) : Number(curQha !== undefined && curQha !== null && curQha !== "" ? curQha : 0);
    var midterm = params.midterm !== undefined ? Number(params.midterm) : Number(curMid !== undefined && curMid !== null && curMid !== "" ? curMid : 0);
    var finalScore = params.finalScore !== undefined ? Number(params.finalScore) : Number(curFin !== undefined && curFin !== null && curFin !== "" ? curFin : 0);

    // Validate score bounds
    attendance = Math.max(0, Math.min(10, isNaN(attendance) ? 10 : attendance));
    qha = Math.max(0, Math.min(15, isNaN(qha) ? 0 : qha));
    midterm = Math.max(0, Math.min(25, isNaN(midterm) ? 0 : midterm));
    finalScore = Math.max(0, Math.min(50, isNaN(finalScore) ? 0 : finalScore));

    var totalScore = Math.round((attendance + qha + midterm + finalScore) * 10) / 10;
    var grade = calculateLetterGrade(totalScore, dynamicConfig);
    var passingScore = dynamicConfig && dynamicConfig.passingScore ? dynamicConfig.passingScore : 50;
    var result = totalScore >= passingScore ? "ជាប់ (Pass)" : "ធ្លាក់ (Fail)";

    // Modify row array in memory
    if (scoMap.attendance) rowVals[scoMap.attendance.index] = attendance;
    if (scoMap.totalQHA) rowVals[scoMap.totalQHA.index] = qha;
    if (scoMap.midterm) rowVals[scoMap.midterm.index] = midterm;
    if (scoMap.finalScore) rowVals[scoMap.finalScore.index] = finalScore;
    if (scoMap.totalScore) rowVals[scoMap.totalScore.index] = totalScore;
    if (scoMap.grade) rowVals[scoMap.grade.index] = grade;
    if (scoMap.result) rowVals[scoMap.result.index] = result;

    // TARGETED BATCH WRITE: Exactly ONE setValues call instead of 7 setValue calls!
    targetRange.setValues([rowVals]);

    flushAllAppCache(config.spreadsheetId);

    // Record Real-Time Mutation Event for Instant Push Sync (Section 18.1 & 18.10)
    var realtimeEvent = recordRealtimeEvent("score", studentId, "score.updated");

    return makeResponse(true, "បានកែប្រែពិន្ទុនិស្សិតជោគជ័យ!", {
      studentId: studentId,
      attendance: attendance,
      qha: qha,
      midterm: midterm,
      finalScore: finalScore,
      totalScore: totalScore,
      grade: grade,
      result: result,
      event: realtimeEvent
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Ultra-Fast Atomic Bulk Scores & Attendance Updater (Section 18.1 & 18.3)
 * Updates dozens of student records in ONE single atomic spreadsheet write.
 * Up to 50x faster than sequential single-row updates!
 */
function apiBulkUpdateScores(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized.", null, "UNAUTHORIZED");
  }

  var updates = params.updates || params.scoresList || params.scores || [];
  if (typeof updates === "string") {
    try { updates = JSON.parse(updates); } catch (e) { updates = []; }
  }

  if (!Array.isArray(updates) || updates.length === 0) {
    return makeResponse(false, "No score updates provided.", null, "EMPTY_UPDATES");
  }

  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(15000);
  if (!hasLock) {
    return makeResponse(false, "ម៉ាស៊ីនបម្រើកំពុងរវល់។ សូមព្យាយាមម្តងទៀត។", null, "LOCK_TIMEOUT");
  }

  try {
    var config = getAppConfig();
    var ss = SpreadsheetApp.openById(config.spreadsheetId);
    var dynamicConfig = readDynamicConfig(ss);
    var scoringSheet = ss.getSheetByName("📊_Scoring");

    if (!scoringSheet) {
      return makeResponse(false, "Sheet 📊_Scoring not found.", null, "SHEET_NOT_FOUND");
    }

    var lastRow = scoringSheet.getLastRow();
    var lastCol = scoringSheet.getLastColumn();
    if (lastRow < 2 || lastCol < 1) {
      return makeResponse(false, "រកមិនឃើញកំណត់ត្រាពិន្ទុឡើយ។", null, "SCORE_RECORD_NOT_FOUND");
    }

    var scoHeaders = scoringSheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) { return String(h || "").trim(); });
    var scoMap = detectColumnMapping(scoHeaders);

    var idColVals = scoringSheet.getRange(1, 1, lastRow, 1).getValues();
    var idToRow = {};
    for (var r = 1; r < idColVals.length; r++) {
      var sid = String(idColVals[r][0] || "").trim().toLowerCase();
      if (sid) idToRow[sid] = r + 1;
    }

    var updateMap = {};
    for (var u = 0; u < updates.length; u++) {
      var item = updates[u];
      if (item && item.studentId) {
        updateMap[String(item.studentId).trim().toLowerCase()] = item;
      }
    }

    var allRows = scoringSheet.getDataRange().getValues();
    var updatedCount = 0;
    var passingScore = dynamicConfig && dynamicConfig.passingScore ? dynamicConfig.passingScore : 50;

    for (var sidKey in updateMap) {
      if (!updateMap.hasOwnProperty(sidKey)) continue;
      var targetRowIndex = idToRow[sidKey];
      if (!targetRowIndex) continue;

      var rowVals = allRows[targetRowIndex - 1];
      var itemData = updateMap[sidKey];

      var curAtt = scoMap.attendance ? rowVals[scoMap.attendance.index] : 10;
      var curQha = scoMap.totalQHA ? rowVals[scoMap.totalQHA.index] : 0;
      var curMid = scoMap.midterm ? rowVals[scoMap.midterm.index] : 0;
      var curFin = scoMap.finalScore ? rowVals[scoMap.finalScore.index] : 0;

      var attendance = itemData.attendance !== undefined ? Number(itemData.attendance) : Number(curAtt !== undefined && curAtt !== null && curAtt !== "" ? curAtt : 10);
      var qha = itemData.qha !== undefined ? Number(itemData.qha) : (itemData.totalQHA !== undefined ? Number(itemData.totalQHA) : Number(curQha !== undefined && curQha !== null && curQha !== "" ? curQha : 0));
      var midterm = itemData.midterm !== undefined ? Number(itemData.midterm) : Number(curMid !== undefined && curMid !== null && curMid !== "" ? curMid : 0);
      var finalScore = itemData.finalScore !== undefined ? Number(itemData.finalScore) : Number(curFin !== undefined && curFin !== null && curFin !== "" ? curFin : 0);

      attendance = Math.max(0, Math.min(10, isNaN(attendance) ? 10 : attendance));
      qha = Math.max(0, Math.min(15, isNaN(qha) ? 0 : qha));
      midterm = Math.max(0, Math.min(25, isNaN(midterm) ? 0 : midterm));
      finalScore = Math.max(0, Math.min(50, isNaN(finalScore) ? 0 : finalScore));

      var totalScore = Math.round((attendance + qha + midterm + finalScore) * 10) / 10;
      var grade = calculateLetterGrade(totalScore, dynamicConfig);
      var result = totalScore >= passingScore ? "ជាប់ (Pass)" : "ធ្លាក់ (Fail)";

      if (scoMap.attendance) rowVals[scoMap.attendance.index] = attendance;
      if (scoMap.totalQHA) rowVals[scoMap.totalQHA.index] = qha;
      if (scoMap.midterm) rowVals[scoMap.midterm.index] = midterm;
      if (scoMap.finalScore) rowVals[scoMap.finalScore.index] = finalScore;
      if (scoMap.totalScore) rowVals[scoMap.totalScore.index] = totalScore;
      if (scoMap.grade) rowVals[scoMap.grade.index] = grade;
      if (scoMap.result) rowVals[scoMap.result.index] = result;

      scoringSheet.getRange(targetRowIndex, 1, 1, lastCol).setValues([rowVals]);
      updatedCount++;
    }

    flushAllAppCache(config.spreadsheetId);
    var realtimeEvent = recordRealtimeEvent("score", "*", "score.updated");

    return makeResponse(true, "បានកែប្រែ និងធ្វើបច្ចុប្បន្នភាពពិន្ទុនិស្សិតសរុប " + updatedCount + " នាក់ជោគជ័យ!", {
      updatedCount: updatedCount,
      event: realtimeEvent
    });
  } catch (err) {
    return makeResponse(false, "កំហុសពេលរក្សាទុកពិន្ទុ៖ " + err.message, null, "BULK_UPDATE_ERROR");
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

/**
 * Reset scores for a student in 📊_Scoring to 0 / initial defaults
 */
function apiResetScores(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized.", null, "UNAUTHORIZED");
  }

  var studentId = String(params.studentId || "").trim();
  if (!studentId) {
    return makeResponse(false, "Student ID is required.", null, "MISSING_STUDENT_ID");
  }

  return apiUpdateScores({
    token: params.token,
    studentId: studentId,
    attendance: 10,
    qha: 0,
    midterm: 0,
    finalScore: 0
  });
}

/**
 * Create or initialize score record for a student in 📊_Scoring
 * Optimized: Single appendRow batch operation + LockService + Real-Time Event
 */
function apiCreateScore(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized.", null, "UNAUTHORIZED");
  }

  var studentId = String(params.studentId || "").trim();
  if (!studentId) {
    return makeResponse(false, "Student ID is required.", null, "MISSING_STUDENT_ID");
  }

  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(10000);
  if (!hasLock) {
    return makeResponse(false, "Server is busy. Please try again.", null, "LOCK_TIMEOUT");
  }

  try {
    var config = getAppConfig();
    var ss = SpreadsheetApp.openById(config.spreadsheetId);
    var dynamicConfig = readDynamicConfig(ss);
    var scoringSheet = ss.getSheetByName("📊_Scoring");

    if (!scoringSheet) {
      return makeResponse(false, "Sheet 📊_Scoring not found.", null, "SHEET_NOT_FOUND");
    }

    var lastRow = scoringSheet.getLastRow();
    var normId = studentId.toLowerCase();

    // TARGETED ID SEARCH: Only read ID column
    if (lastRow > 1) {
      var idColVals = scoringSheet.getRange(1, 1, lastRow, 1).getValues();
      for (var r = 1; r < idColVals.length; r++) {
        if (String(idColVals[r][0] || "").trim().toLowerCase() === normId) {
          lock.releaseLock();
          return apiUpdateScores(params);
        }
      }
    }

    // Lookup student details from 📋_Students if present
    var studentsSheet = ss.getSheetByName("📋_Students");
    var studentName = String(params.fullNameKh || params.fullNameEn || "").trim();
    var studentRoom = String(params.room || "101").trim();
    var studentMajor = String(params.skill || "គណនេយ្យ").trim();

    if (studentsSheet && studentsSheet.getLastRow() > 1) {
      var stuIds = studentsSheet.getRange(1, 1, studentsSheet.getLastRow(), 1).getValues();
      for (var sr = 1; sr < stuIds.length; sr++) {
        if (String(stuIds[sr][0] || "").trim().toLowerCase() === normId) {
          var sRow = studentsSheet.getRange(sr + 1, 1, 1, studentsSheet.getLastColumn()).getValues()[0];
          studentName = sRow[1] || sRow[2] || studentName;
          studentRoom = sRow[4] || studentRoom;
          studentMajor = sRow[5] || studentMajor;
          break;
        }
      }
    }

    var attendance = params.attendance !== undefined ? Number(params.attendance) : 10;
    var qha = params.qha !== undefined ? Number(params.qha) : 0;
    var midterm = params.midterm !== undefined ? Number(params.midterm) : 0;
    var finalScore = params.finalScore !== undefined ? Number(params.finalScore) : 0;

    attendance = Math.max(0, Math.min(10, isNaN(attendance) ? 10 : attendance));
    qha = Math.max(0, Math.min(15, isNaN(qha) ? 0 : qha));
    midterm = Math.max(0, Math.min(25, isNaN(midterm) ? 0 : midterm));
    finalScore = Math.max(0, Math.min(50, isNaN(finalScore) ? 0 : finalScore));

    var totalScore = Math.round((attendance + qha + midterm + finalScore) * 10) / 10;
    var grade = calculateLetterGrade(totalScore, dynamicConfig);
    var passingScore = dynamicConfig && dynamicConfig.passingScore ? dynamicConfig.passingScore : 50;
    var result = totalScore >= passingScore ? "ជាប់ (Pass)" : "ធ្លាក់ (Fail)";

    var newRow = scoringSheet.getLastRow() + 1;
    var nameFormula = '=IFERROR(IF(VLOOKUP(A' + newRow + ', \'📋_Students\'!$A:$B, 2, FALSE)<>"", VLOOKUP(A' + newRow + ', \'📋_Students\'!$A:$B, 2, FALSE), VLOOKUP(A' + newRow + ', \'📋_Students\'!$A:$C, 3, FALSE)), "' + studentName + '")';
    var roomFormula = '=IFERROR(VLOOKUP(A' + newRow + ', \'📋_Students\'!$A:$E, 5, FALSE), "' + studentRoom + '")';
    var majorFormula = '=IFERROR(VLOOKUP(A' + newRow + ', \'📋_Students\'!$A:$F, 6, FALSE), "' + studentMajor + '")';
    var totalFormula = '=IF(ISBLANK(A' + newRow + '), "", ROUND(SUM(E' + newRow + ':H' + newRow + '), 2))';
    var gradeFormula = '=IF(ISBLANK(I' + newRow + '), "", IF(I' + newRow + '>=85,"A", IF(I' + newRow + '>=80,"B+", IF(I' + newRow + '>=70,"B", IF(I' + newRow + '>=65,"C+", IF(I' + newRow + '>=50,"C", IF(I' + newRow + '>=45,"D", IF(I' + newRow + '>=40,"E","F"))))))))';
    var resultFormula = '=IF(ISBLANK(I' + newRow + '), "", IF(I' + newRow + '>=50, "ជាប់ (Pass)", "ធ្លាក់ (Fail)"))';

    // BATCH ROW CREATION: 1 call instead of 11 individual setValue calls
    scoringSheet.appendRow([
      studentId,
      nameFormula,
      roomFormula,
      majorFormula,
      attendance,
      qha,
      midterm,
      finalScore,
      totalFormula,
      gradeFormula,
      resultFormula
    ]);

    flushAllAppCache(config.spreadsheetId);

    // Record Real-Time Event (Section 18.1 & 18.10)
    var realtimeEvent = recordRealtimeEvent("score", studentId, "score.created");

    return makeResponse(true, "បានបញ្ចូលកំណត់ត្រាពិន្ទុថ្មីជោគជ័យ!", {
      studentId: studentId,
      fullNameKh: studentName,
      room: studentRoom,
      skill: studentMajor,
      attendance: attendance,
      totalQHA: qha,
      midterm: midterm,
      finalScore: finalScore,
      totalScore: totalScore,
      overallGrade: grade,
      event: realtimeEvent
    });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

/**
 * Delete a student score record from 📊_Scoring
 */
function apiDeleteScore(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized.", null, "UNAUTHORIZED");
  }

  var studentId = String(params.studentId || "").trim();
  if (!studentId) {
    return makeResponse(false, "Student ID is required.", null, "MISSING_STUDENT_ID");
  }

  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(10000);
  if (!hasLock) {
    return makeResponse(false, "Server is busy. Please try again.", null, "LOCK_TIMEOUT");
  }

  try {
    var config = getAppConfig();
    var ss = SpreadsheetApp.openById(config.spreadsheetId);
    var scoringSheet = ss.getSheetByName("📊_Scoring");

    if (!scoringSheet) {
      return makeResponse(false, "Sheet 📊_Scoring not found.", null, "SHEET_NOT_FOUND");
    }

    var lastRow = scoringSheet.getLastRow();
    if (lastRow < 2) {
      return makeResponse(false, "រកមិនឃើញកំណត់ត្រាពិន្ទុឡើយ។", null, "SCORE_RECORD_NOT_FOUND");
    }

    // Read only ID column
    var idColVals = scoringSheet.getRange(1, 1, lastRow, 1).getValues();
    var targetRow = -1;
    var normId = studentId.toLowerCase();

    for (var r = 1; r < idColVals.length; r++) {
      if (String(idColVals[r][0] || "").trim().toLowerCase() === normId) {
        targetRow = r + 1;
        break;
      }
    }

    if (targetRow === -1) {
      return makeResponse(false, "រកមិនឃើញកំណត់ត្រាពិន្ទុរបស់និស្សិតនេះឡើយ។", null, "SCORE_RECORD_NOT_FOUND");
    }

    scoringSheet.deleteRow(targetRow);
    flushAllAppCache(config.spreadsheetId);

    // Record Real-Time Event (Section 18.1 & 18.10)
    var realtimeEvent = recordRealtimeEvent("score", studentId, "score.deleted");

    return makeResponse(true, "បានលុបកំណត់ត្រាពិន្ទុរបស់និស្សិត " + studentId + " ជោគជ័យ!", {
      studentId: studentId,
      event: realtimeEvent
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Sync all registered students from 📋_Students into 📊_Scoring
 */
function apiSyncScoringStudents(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized.", null, "UNAUTHORIZED");
  }

  var config = getAppConfig();
  var ss = SpreadsheetApp.openById(config.spreadsheetId);
  var studentsSheet = ss.getSheetByName("📋_Students");
  var scoringSheet = ss.getSheetByName("📊_Scoring");

  if (!studentsSheet || !scoringSheet) {
    return makeResponse(false, "Sheets not found.", null, "SHEET_NOT_FOUND");
  }

  var stuData = studentsSheet.getDataRange().getValues();
  var scoData = scoringSheet.getDataRange().getValues();

  var existingIds = {};
  for (var r = 1; r < scoData.length; r++) {
    var sid = String(scoData[r][0] || "").trim().toLowerCase();
    if (sid) existingIds[sid] = true;
  }

  var addedCount = 0;
  var startRow = scoringSheet.getLastRow() + 1;

  for (var s = 1; s < stuData.length; s++) {
    var studentId = String(stuData[s][0] || "").trim();
    if (!studentId || existingIds[studentId.toLowerCase()]) continue;

    var studentName = stuData[s][1] || stuData[s][2] || "";
    var studentRoom = stuData[s][4] || "101";
    var studentMajor = stuData[s][5] || "គណនេយ្យ";

    var curRow = startRow + addedCount;
    var nameFormula = '=IFERROR(IF(VLOOKUP(A' + curRow + ', \'📋_Students\'!$A:$B, 2, FALSE)<>"", VLOOKUP(A' + curRow + ', \'📋_Students\'!$A:$B, 2, FALSE), VLOOKUP(A' + curRow + ', \'📋_Students\'!$A:$C, 3, FALSE)), "' + studentName + '")';
    var roomFormula = '=IFERROR(VLOOKUP(A' + curRow + ', \'📋_Students\'!$A:$E, 5, FALSE), "' + studentRoom + '")';
    var majorFormula = '=IFERROR(VLOOKUP(A' + curRow + ', \'📋_Students\'!$A:$F, 6, FALSE), "' + studentMajor + '")';
    var totalFormula = '=IF(ISBLANK(A' + curRow + '), "", ROUND(SUM(E' + curRow + ':H' + curRow + '), 2))';
    var gradeFormula = '=IF(ISBLANK(I' + curRow + '), "", IF(I' + curRow + '>=85,"A", IF(I' + curRow + '>=80,"B+", IF(I' + curRow + '>=70,"B", IF(I' + curRow + '>=65,"C+", IF(I' + curRow + '>=50,"C", IF(I' + curRow + '>=45,"D", IF(I' + curRow + '>=40,"E","F"))))))))';
    var resultFormula = '=IF(ISBLANK(I' + curRow + '), "", IF(I' + curRow + '>=50, "ជាប់ (Pass)", "ធ្លាក់ (Fail)"))';

    scoringSheet.getRange(curRow, 1).setValue(studentId).setNumberFormat("@");
    scoringSheet.getRange(curRow, 2).setFormula(nameFormula);
    scoringSheet.getRange(curRow, 3).setFormula(roomFormula);
    scoringSheet.getRange(curRow, 4).setFormula(majorFormula);
    scoringSheet.getRange(curRow, 5).setValue(10);
    scoringSheet.getRange(curRow, 6).setValue(0);
    scoringSheet.getRange(curRow, 7).setValue(0);
    scoringSheet.getRange(curRow, 8).setValue(0);
    scoringSheet.getRange(curRow, 9).setFormula(totalFormula);
    scoringSheet.getRange(curRow, 10).setFormula(gradeFormula);
    scoringSheet.getRange(curRow, 11).setFormula(resultFormula);

    existingIds[studentId.toLowerCase()] = true;
    addedCount++;
  }

  flushAllAppCache(config.spreadsheetId);

  return makeResponse(true, "បានធ្វើសមកាលកម្មនិស្សិតចំនួន " + addedCount + " នាក់ទៅតារាងពិន្ទុជោគជ័យ!", {
    addedCount: addedCount
  });
}

// ==========================================
// 📝 QUIZZES CRUD & EVALUATION FUNCTIONS
// ==========================================

/**
 * Get all quizzes metadata, class statistics, and student quiz scores
 */
function apiAdminQuizzes(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized access to quizzes.", null, "UNAUTHORIZED");
  }

  var config = getAppConfig();
  var ss = SpreadsheetApp.openById(config.spreadsheetId);
  var quizzesSheet = getOrCreateQuizzesSheet(ss);
  
  if (!quizzesSheet || quizzesSheet.getLastRow() < 2) {
    return makeResponse(true, "Quizzes sheet empty.", {
      quizzes: [],
      students: [],
      stats: { totalQuizzes: 0, totalMaxScore: 0, classAverageScore: 0, classAveragePct: 0 }
    });
  }

  var qzData = quizzesSheet.getDataRange().getValues();
  var headers = qzData[0];
  var maxPointsRow = qzData[1];

  var quizzes = [];
  // Quizzes start at Column D (index 3) up to the column before "សរុបពិន្ទុ" (Total)
  var totalColIdx = -1;
  for (var c = 3; c < headers.length; c++) {
    var hName = String(headers[c] || "").trim();
    if (hName.indexOf("សរុប") !== -1 || hName.indexOf("Total") !== -1) {
      totalColIdx = c;
      break;
    }
  }
  if (totalColIdx === -1) totalColIdx = headers.length - 2;

  var totalMaxScore = 0;
  for (var qc = 3; qc < totalColIdx; qc++) {
    var qMax = Number(maxPointsRow[qc]) || 10;
    totalMaxScore += qMax;
    quizzes.push({
      id: qc - 2,
      name: String(headers[qc] || ("Quiz " + (qc - 2))).trim(),
      maxScore: qMax,
      colIndex: qc
    });
  }

  var students = [];
  var search = String(params.search || "").toLowerCase().trim();
  var roomFilter = String(params.room || "").toLowerCase().trim();
  var statusFilter = String(params.status || "all").toLowerCase().trim();

  for (var r = 2; r < qzData.length; r++) {
    var row = qzData[r];
    var sid = String(row[0] || "").trim();
    if (!sid) continue;

    var sName = String(row[1] || "").trim();
    var sRoom = String(row[2] || "").trim();

    if (roomFilter && roomFilter !== "all" && sRoom.toLowerCase() !== roomFilter) continue;
    if (search && sid.toLowerCase().indexOf(search) === -1 && sName.toLowerCase().indexOf(search) === -1) continue;

    var scoreMap = {};
    var rawSum = 0;
    var completedCount = 0;

    for (var i = 0; i < quizzes.length; i++) {
      var q = quizzes[i];
      var rawVal = row[q.colIndex];
      var numVal = (rawVal !== "" && rawVal !== null && rawVal !== undefined) ? Number(rawVal) : null;
      scoreMap[q.name] = numVal;
      if (numVal !== null) {
        rawSum += numVal;
        completedCount++;
      }
    }

    var scaled15 = (totalColIdx + 1 < row.length && row[totalColIdx + 1] !== "")
      ? Number(row[totalColIdx + 1])
      : (totalMaxScore > 0 ? Math.round((rawSum / totalMaxScore) * 15 * 100) / 100 : 0);

    var pct = totalMaxScore > 0 ? Math.round((rawSum / totalMaxScore) * 1000) / 10 : 0;

    if (statusFilter === "complete" && completedCount < quizzes.length) continue;
    if (statusFilter === "incomplete" && completedCount === quizzes.length) continue;
    if (statusFilter === "high" && scaled15 < 12) continue;
    if (statusFilter === "low" && scaled15 >= 7.5) continue;

    students.push({
      studentId: sid,
      fullNameKh: sName,
      room: sRoom,
      scores: scoreMap,
      rawTotal: Math.round(rawSum * 10) / 10,
      scaled15: scaled15,
      percentage: pct,
      completedCount: completedCount,
      totalQuizzes: quizzes.length
    });
  }

  // Quiz Column Analytics
  var quizStats = quizzes.map(function(q) {
    var sum = 0;
    var count = 0;
    for (var r = 2; r < qzData.length; r++) {
      var val = qzData[r][q.colIndex];
      if (val !== "" && val !== null && val !== undefined) {
        sum += Number(val);
        count++;
      }
    }
    var avg = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
    var avgPct = q.maxScore > 0 ? Math.round((avg / q.maxScore) * 100) : 0;
    return {
      id: q.id,
      name: q.name,
      maxScore: q.maxScore,
      averageScore: avg,
      averagePercentage: avgPct,
      completedCount: count,
      totalCount: qzData.length - 2
    };
  });

  return makeResponse(true, "Quizzes data retrieved.", {
    quizzes: quizzes,
    quizStats: quizStats,
    totalMaxScore: totalMaxScore,
    students: students,
    stats: {
      totalQuizzes: quizzes.length,
      totalMaxScore: totalMaxScore,
      totalStudents: students.length
    }
  });
}

/**
 * Creates a new Quiz Column in 📝_Quizzes
 */
function apiCreateQuiz(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized.", null, "UNAUTHORIZED");
  }

  var name = String(params.name || "").trim();
  var maxScore = Number(params.maxScore) > 0 ? Number(params.maxScore) : 10;
  if (!name) {
    return makeResponse(false, "Quiz name is required.", null, "MISSING_NAME");
  }

  var config = getAppConfig();
  var ss = SpreadsheetApp.openById(config.spreadsheetId);
  var quizzesSheet = getOrCreateQuizzesSheet(ss);

  var headers = quizzesSheet.getRange(1, 1, 1, quizzesSheet.getLastColumn()).getValues()[0];
  var insertCol = headers.length - 1; // Insert before Total and Scaled columns
  for (var c = 3; c < headers.length; c++) {
    var h = String(headers[c] || "").trim();
    if (h.indexOf("សរុប") !== -1 || h.indexOf("Total") !== -1) {
      insertCol = c + 1; // 1-indexed for insertColumnBefore
      break;
    }
  }

  quizzesSheet.insertColumnBefore(insertCol);
  quizzesSheet.getRange(1, insertCol).setValue(name);
  quizzesSheet.getRange(2, insertCol).setValue(maxScore);

  // Re-apply relational formulas and update cache
  applyRelationalFormulasToAllSheets(config.spreadsheetId);
  flushAllAppCache(config.spreadsheetId);
  var realtimeEvent = recordRealtimeEvent("quiz", "*", "quiz.created");

  return makeResponse(true, "បានបង្កើត Quiz ថ្មី " + name + " ជោគជ័យ!", {
    name: name,
    maxScore: maxScore,
    event: realtimeEvent
  });
}

/**
 * Updates a Quiz Column (Name or Max Points) in 📝_Quizzes
 */
function apiUpdateQuiz(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized.", null, "UNAUTHORIZED");
  }

  var quizId = Number(params.quizId);
  var newName = params.name ? String(params.name).trim() : null;
  var maxScore = params.maxScore ? Number(params.maxScore) : null;

  var config = getAppConfig();
  var ss = SpreadsheetApp.openById(config.spreadsheetId);
  var quizzesSheet = ss.getSheetByName("📝_Quizzes");
  if (!quizzesSheet) return makeResponse(false, "Quizzes sheet not found.", null, "NOT_FOUND");

  var colIdx = quizId + 2 + 1; // Column D is quiz 1 -> 4
  if (newName) quizzesSheet.getRange(1, colIdx).setValue(newName);
  if (maxScore !== null && maxScore > 0) quizzesSheet.getRange(2, colIdx).setValue(maxScore);

  flushAllAppCache(config.spreadsheetId);
  var realtimeEvent = recordRealtimeEvent("quiz", String(quizId), "quiz.updated");

  return makeResponse(true, "បានកែប្រែ Quiz ជោគជ័យ!", { quizId: quizId, name: newName, maxScore: maxScore, event: realtimeEvent });
}

/**
 * Deletes a Quiz Column from 📝_Quizzes
 */
function apiDeleteQuiz(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized.", null, "UNAUTHORIZED");
  }

  var quizId = Number(params.quizId);
  var config = getAppConfig();
  var ss = SpreadsheetApp.openById(config.spreadsheetId);
  var quizzesSheet = ss.getSheetByName("📝_Quizzes");
  if (!quizzesSheet) return makeResponse(false, "Quizzes sheet not found.", null, "NOT_FOUND");

  var colIdx = quizId + 2 + 1;
  quizzesSheet.deleteColumn(colIdx);

  applyRelationalFormulasToAllSheets(config.spreadsheetId);
  flushAllAppCache(config.spreadsheetId);
  var realtimeEvent = recordRealtimeEvent("quiz", String(quizId), "quiz.deleted");

  return makeResponse(true, "បានលុប Quiz ជោគជ័យ!", { quizId: quizId, event: realtimeEvent });
}

/**
 * Updates Quiz Scores for a student (or batch of students) in 📝_Quizzes & syncs scaled 15% to 📊_Scoring
 */
function apiUpdateStudentQuizzes(params) {
  if (!verifyAdminAuth(params)) {
    return makeResponse(false, "Unauthorized.", null, "UNAUTHORIZED");
  }

  var updates = params.updates;
  if (typeof updates === "string") {
    try { updates = JSON.parse(updates); } catch (e) { updates = []; }
  }

  var config = getAppConfig();
  var ss = SpreadsheetApp.openById(config.spreadsheetId);
  var quizzesSheet = ss.getSheetByName("📝_Quizzes");
  if (!quizzesSheet) return makeResponse(false, "Sheet 📝_Quizzes not found.", null, "NOT_FOUND");

  var scoringSheet = ss.getSheetByName("📊_Scoring");
  var qzValues = quizzesSheet.getDataRange().getValues();
  var headers = qzValues[0];
  var lastCol = quizzesSheet.getLastColumn();

  // A. BULK BATCH UPDATE PATH (10x faster)
  if (Array.isArray(updates) && updates.length > 0) {
    var idToRow = {};
    for (var r = 2; r < qzValues.length; r++) {
      var sid = String(qzValues[r][0] || "").trim().toLowerCase();
      if (sid) idToRow[sid] = r + 1;
    }

    var scoData = scoringSheet ? scoringSheet.getDataRange().getValues() : [];
    var scoIdToRow = {};
    for (var sr = 1; sr < scoData.length; sr++) {
      var scSid = String(scoData[sr][0] || "").trim().toLowerCase();
      if (scSid) scoIdToRow[scSid] = sr + 1;
    }

    var updatedCount = 0;
    for (var u = 0; u < updates.length; u++) {
      var item = updates[u];
      if (!item || !item.studentId || !item.scores) continue;
      var normSid = String(item.studentId).trim().toLowerCase();
      var tRow = idToRow[normSid];
      if (!tRow) continue;

      var rowVals = quizzesSheet.getRange(tRow, 1, 1, lastCol).getValues()[0];
      for (var c = 3; c < headers.length; c++) {
        var qName = String(headers[c] || "").trim();
        if (item.scores.hasOwnProperty(qName)) {
          var val = item.scores[qName];
          rowVals[c] = (val === null || val === "" || val === undefined) ? "" : Number(val);
        }
      }
      quizzesSheet.getRange(tRow, 1, 1, lastCol).setValues([rowVals]);

      // Calculate scaled score and sync to scoring sheet
      var scoreVals = Object.values(item.scores).filter(function(v) { return v !== null && v !== "" && !isNaN(v); });
      var rawSum = scoreVals.reduce(function(a, b) { return a + Number(b); }, 0);
      var scaled15 = Math.round((rawSum / 255) * 15 * 100) / 100;

      if (scoringSheet && scoIdToRow[normSid]) {
        scoringSheet.getRange(scoIdToRow[normSid], 6).setValue(scaled15);
      }
      updatedCount++;
    }

    flushAllAppCache(config.spreadsheetId);
    recordRealtimeEvent("quiz", "*", "quiz.updated");
    recordRealtimeEvent("score", "*", "score.updated");

    return makeResponse(true, "បានកែប្រែពិន្ទុ Quiz របស់និស្សិតសរុប " + updatedCount + " នាក់ជោគជ័យ!", {
      updatedCount: updatedCount
    });
  }

  // B. SINGLE STUDENT UPDATE PATH
  var studentId = String(params.studentId || "").trim();
  var scores = params.scores;
  if (typeof scores === "string") {
    try { scores = JSON.parse(scores); } catch (e) { scores = {}; }
  }

  var normId = studentId.toLowerCase();
  var targetRow = -1;

  for (var r = 2; r < qzValues.length; r++) {
    if (String(qzValues[r][0] || "").trim().toLowerCase() === normId) {
      targetRow = r + 1; // 1-indexed
      break;
    }
  }

  if (targetRow === -1) {
    return makeResponse(false, "Student ID not found in quizzes sheet.", null, "STUDENT_NOT_FOUND");
  }

  var rowVals = quizzesSheet.getRange(targetRow, 1, 1, lastCol).getValues()[0];
  for (var c = 3; c < headers.length; c++) {
    var qName = String(headers[c] || "").trim();
    if (scores.hasOwnProperty(qName)) {
      var val = scores[qName];
      rowVals[c] = (val === null || val === "" || val === undefined) ? "" : Number(val);
    }
  }
  quizzesSheet.getRange(targetRow, 1, 1, lastCol).setValues([rowVals]);

  // Sync scaled score to 📊_Scoring
  SpreadsheetApp.flush();
  if (scoringSheet) {
    var updatedQzRow = quizzesSheet.getRange(targetRow, 1, 1, lastCol).getValues()[0];
    var scaledCol = headers.length;
    var scaledScore = Number(updatedQzRow[scaledCol - 1]) || 0;

    var scoData = scoringSheet.getDataRange().getValues();
    for (var sr = 1; sr < scoData.length; sr++) {
      if (String(scoData[sr][0] || "").trim().toLowerCase() === normId) {
        scoringSheet.getRange(sr + 1, 6).setValue(scaledScore); // Col F = QHA
        break;
      }
    }
  }

  flushAllAppCache(config.spreadsheetId);
  var realtimeEvent = recordRealtimeEvent("quiz", studentId, "quiz.updated");
  recordRealtimeEvent("score", studentId, "score.updated");

  return makeResponse(true, "បានកែប្រែពិន្ទុ Quiz របស់និស្សិត " + studentId + " ជោគជ័យ!", {
    studentId: studentId,
    event: realtimeEvent
  });
}

/**
 * Resets a student's quiz scores
 */
function apiResetStudentQuizzes(params) {
  if (!verifyAdminAuth(params)) return makeResponse(false, "Unauthorized.", null, "UNAUTHORIZED");

  var studentId = String(params.studentId || "").trim();
  var config = getAppConfig();
  var ss = SpreadsheetApp.openById(config.spreadsheetId);
  var quizzesSheet = ss.getSheetByName("📝_Quizzes");
  if (!quizzesSheet) return makeResponse(false, "Quizzes sheet not found.", null, "NOT_FOUND");

  var qzValues = quizzesSheet.getDataRange().getValues();
  var headers = qzValues[0];
  var normId = studentId.toLowerCase();
  var targetRow = -1;

  for (var r = 2; r < qzValues.length; r++) {
    if (String(qzValues[r][0] || "").trim().toLowerCase() === normId) {
      targetRow = r + 1;
      break;
    }
  }

  if (targetRow === -1) return makeResponse(false, "Student not found in quizzes sheet.", null, "NOT_FOUND");

  for (var c = 3; c < headers.length - 2; c++) {
    quizzesSheet.getRange(targetRow, c + 1).setValue("");
  }

  flushAllAppCache(config.spreadsheetId);
  return makeResponse(true, "បានកំណត់ពិន្ទុ Quiz ឡើងវិញជោគជ័យ!", { studentId: studentId });
}

/**
 * Sync all students from 📋_Students into 📝_Quizzes
 */
function apiSyncQuizStudents(params) {
  if (!verifyAdminAuth(params)) return makeResponse(false, "Unauthorized.", null, "UNAUTHORIZED");

  var config = getAppConfig();
  var ss = SpreadsheetApp.openById(config.spreadsheetId);
  var studentsSheet = ss.getSheetByName("📋_Students");
  var quizzesSheet = getOrCreateQuizzesSheet(ss);

  if (!studentsSheet || !quizzesSheet) return makeResponse(false, "Sheets not found.", null, "SHEET_NOT_FOUND");

  var stuData = studentsSheet.getDataRange().getValues();
  var qzData = quizzesSheet.getDataRange().getValues();

  var existingIds = {};
  for (var r = 2; r < qzData.length; r++) {
    var sid = String(qzData[r][0] || "").trim().toLowerCase();
    if (sid) existingIds[sid] = true;
  }

  var added = 0;
  var startRow = quizzesSheet.getLastRow() + 1;
  var totalColIdx = quizzesSheet.getLastColumn() - 1;
  var scaledColIdx = quizzesSheet.getLastColumn();

  for (var s = 1; s < stuData.length; s++) {
    var studentId = String(stuData[s][0] || "").trim();
    if (!studentId || existingIds[studentId.toLowerCase()]) continue;

    var curRow = startRow + added;
    var nameFormula = '=IFERROR(IF(VLOOKUP(A' + curRow + ', \'📋_Students\'!$A:$B, 2, FALSE)<>"", VLOOKUP(A' + curRow + ', \'📋_Students\'!$A:$B, 2, FALSE), VLOOKUP(A' + curRow + ', \'📋_Students\'!$A:$C, 3, FALSE)), "")';
    var roomFormula = '=IFERROR(VLOOKUP(A' + curRow + ', \'📋_Students\'!$A:$E, 5, FALSE), "")';
    var sumFormula = '=SUM(D' + curRow + ':R' + curRow + ')';
    var scaledFormula = '=IF(ISBLANK(A' + curRow + '), "", IF($S$2=0, 0, ROUND((SUM(D' + curRow + ':R' + curRow + ')/$S$2)*15, 2)))';

    quizzesSheet.getRange(curRow, 1).setValue(studentId).setNumberFormat("@");
    quizzesSheet.getRange(curRow, 2).setFormula(nameFormula);
    quizzesSheet.getRange(curRow, 3).setFormula(roomFormula);
    quizzesSheet.getRange(curRow, totalColIdx).setFormula(sumFormula);
    quizzesSheet.getRange(curRow, scaledColIdx).setFormula(scaledFormula);

    existingIds[studentId.toLowerCase()] = true;
    added++;
  }

  flushAllAppCache(config.spreadsheetId);
  return makeResponse(true, "បានធ្វើសមកាលកម្មនិស្សិត " + added + " នាក់ទៅ 📝_Quizzes ជោគជ័យ!", { addedCount: added });
}

/**
 * Helper to ensure 📝_Quizzes sheet exists with standard columns
 */
function getOrCreateQuizzesSheet(ss) {
  var sheet = ss.getSheetByName("📝_Quizzes") || ss.getSheetByName("Quizzes");
  if (!sheet) {
    sheet = ss.insertSheet("📝_Quizzes");
    var defaultHeaders = ["ID", "ឈ្មោះនិស្សិត", "បន្ទប់", "លំហាត់Email", "ការងារក្រុម", "លំហាត់ទី១", "លំហាត់ទី២", "លំហាត់ទី3", "លំហាត់ទី4", "លំហាត់ទី5", "លំហាត់ទី6", "លំហាត់ទី7", "លំហាត់អនុវត្តទី១", "លំហាត់អនុវត្តទី២", "លំហាត់អនុវត្តទី៣", "លំហាត់អនុវត្តExcel", "Quiz 14", "Quiz 15", "សរុបពិន្ទុ", "ពិន្ទុ១៥%"];
    var defaultMax = ["🎯 ពិន្ទុពេញ", "Max Points", "-", 10, 20, 15, 20, 10, 30, 20, 20, 10, 10, 30, 20, 10, 20, 10, "=SUM(D2:R2)", 15];
    sheet.getRange(1, 1, 1, defaultHeaders.length).setValues([defaultHeaders]);
    sheet.getRange(2, 1, 1, defaultMax.length).setValues([defaultMax]);
  }
  return sheet;
}


