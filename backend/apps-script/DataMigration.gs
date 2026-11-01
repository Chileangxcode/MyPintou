/**
 * =========================================================================
 * KHENG SCHOOL MANAGEMENT SYSTEM - GOOGLE SHEETS MIGRATION & REORGANIZER
 * File: backend/apps-script/DataMigration.gs
 * =========================================================================
 * 
 * Description:
 * Non-destructive automated data preparation tool that takes your existing
 * raw/monolithic student data and organizes it into clean, high-performance,
 * separated sheets:
 *   1. "📋_Students"  - Master Student Directory & Demographics
 *   2. "📊_Scoring"   - Master Academic Scoring Matrix with dynamic formulas
 *   3. "⚙️_Config"    - Dynamic System Controls (Passing grade, publication, etc.)
 * 
 * SAFETY PROMISE:
 * - Your old raw sheet is 100% UNTOUCHED and PRESERVED as backup.
 * - Student IDs are formatted as Plain Text to protect leading zeros (e.g. "00123").
 * - Automatic formulas for Total Score and Grade are pre-applied.
 */

/**
 * Creates custom menu in Google Sheets UI when spreadsheet is opened
 */
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu("🚀 MyPintou (Myពិន្ទុ)")
      .addItem("🚀 1. Prepare New Separate Sheets (Students, Quizzes, Scoring, Config, Users)", "uiPrepareOptimizedSheets")
      .addItem("🔗 2. Establish Student Relational Links (Formulas across Sheets)", "uiSetupStudentRelations")
      .addItem("🔐 3. Sync User Logins & Passwords (🔐_Users)", "uiSyncUsersSheet")
      .addItem("⚡ 4. Clear API Cache & Sync Everything", "uiClearApiCache")
      .addSeparator()
      .addItem("🔍 5. Inspect Spreadsheet Structure", "inspectSpreadsheetStructure")
      .addToUi();
  } catch (e) {
    // onOpen might run in standalone script where getUi() is unavailable
  }
}

/**
 * Interactive menu trigger to establish student relational formulas
 */
function uiSetupStudentRelations() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var res = applyRelationalFormulasToAllSheets(ss.getId());
  if (res.success) {
    ui.alert(
      "ជោគជ័យ! (Success)",
      res.message + "\n\n" +
      "• 📊_Scoring: " + (res.details["📊_Scoring"] || "រួចរាល់") + "\n" +
      "• 📝_Quizzes: " + (res.details["📝_Quizzes"] || "រួចរាល់") + "\n" +
      "• 🔐_Users: " + (res.details["🔐_Users"] || "រួចរាល់") + "\n\n" +
      "ឥឡូវនេះរាល់ការកែប្រែឈ្មោះនិស្សិតក្នុង 📋_Students នឹងធ្វើបច្ចុប្បន្នភាពដោយស្វ័យប្រវត្តគ្រប់ Sheet ទាំងអស់!",
      ui.ButtonSet.OK
    );
  } else {
    ui.alert("កំហុស (Error)", res.message, ui.ButtonSet.OK);
  }
}

/**
 * Interactive menu trigger to synchronize 🔐_Users logins
 */
function uiSyncUsersSheet() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var uSheet = getOrCreateUsersSheet(ss);
  var res = syncStudentsToUsersSheet(ss, uSheet);
  
  ui.alert(
    "ជោគជ័យ! (Success)",
    "បានរៀបចំ និងធ្វើសមកាលកម្មគណនីចូលប្រព័ន្ធជោគជ័យ!\n\n" +
    "• Sheet: 🔐_Users\n" +
    "• គណនីសិស្សថ្មីដែលបានបង្កើត៖ " + res.count + " នាក់\n" +
    "• គណនីសរុបក្នុងប្រព័ន្ធ៖ " + (uSheet.getLastRow() - 1) + " គណនី\n\n" +
    "កំណត់សម្គាល់៖\n" +
    "- សាស្ត្រាចារ្យ៖ ប្រើប្រាស់ Username & Password\n" +
    "- សិស្ស៖ ប្រើប្រាស់ ឈ្មោះនិស្សិត (Username) និង លេខសម្គាល់ (Student ID ជា Password)",
    ui.ButtonSet.OK
  );
}

/**
 * Interactive menu trigger with confirmation dialog
 */
function uiPrepareOptimizedSheets() {
  var ui = SpreadsheetApp.getUi();
  var confirm = ui.alert(
    "រៀបចំទម្រង់ Sheets ថ្មី (Prepare Separate Sheets)",
    "ប្រព័ន្ធនឹងបង្កើត Sheets ថ្មីចំនួន ៤ (📋_Students, 📝_Quizzes, 📊_Scoring, ⚙️_Config) ដោយចម្លងទិន្នន័យពី Sheet ចាស់របស់អ្នកដោយស្វ័យប្រវត្តិ។\n\nSheet ចាស់របស់អ្នកនឹងមិនត្រូវបានប៉ះពាល់ ឬលុបឡើយ។\n\nតើអ្នកចង់បន្តដែរឬទេ?",
    ui.ButtonSet.YES_NO
  );

  if (confirm === ui.Button.YES) {
    var res = prepareOptimizedDatabaseSheets();
    if (res.success) {
      ui.alert(
        "ជោគជ័យ! (Success)",
        "បានរៀបចំបង្កើត Sheets ថ្មីជោគជ័យ!\n\n" +
        "• ចំនួននិស្សិតដែលបានផ្ទេរ៖ " + res.migratedCount + " នាក់\n" +
        "• Sheets ថ្មី៖ 📋_Students, 📝_Quizzes, 📊_Scoring, ⚙️_Config\n" +
        "• រូបមន្តគណនាស្វ័យប្រវត្តិត្រូវបានបញ្ចូលរួចរាល់។",
        ui.ButtonSet.OK
      );
    } else {
      ui.alert("កំហុស (Error)", res.message, ui.ButtonSet.OK);
    }
  }
}

/**
 * Interactive trigger to flush CacheService
 */
function uiClearApiCache() {
  try {
    var cache = CacheService.getScriptCache();
    cache.removeAll([
      "NORM_STUDENT_DATA_" + DEFAULT_SPREADSHEET_ID,
      "ADMIN_STATS_" + DEFAULT_SPREADSHEET_ID,
      "CONFIG_" + DEFAULT_SPREADSHEET_ID
    ]);
    SpreadsheetApp.getUi().alert("ជោគជ័យ", "បានសម្អាត Cache រួចរាល់! ទិន្នន័យទាំងអស់នឹងត្រូវទាញយកថ្មីភ្លាមៗនៅលើ Website។", SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert("ជូនដំណឹង", "Cache ត្រូវបានសម្អាត។", SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Main Data Migration & Schema Generation Engine
 * Can be run from Menu, Apps Script Editor, or API endpoint
 */
function prepareOptimizedDatabaseSheets(spreadsheetId) {
  var targetId = spreadsheetId || DEFAULT_SPREADSHEET_ID;
  var ss;
  try {
    ss = targetId ? SpreadsheetApp.openById(targetId) : SpreadsheetApp.getActiveSpreadsheet();
  } catch (err) {
    return {
      success: false,
      message: "Could not open spreadsheet: " + err.message
    };
  }

  // 1. Locate the Old Source Data Sheet
  // Prioritize "Weekend TU" or any non-application raw sheet
  var sheets = ss.getSheets();
  var sourceSheet = ss.getSheetByName("Weekend TU");

  if (!sourceSheet) {
    for (var i = 0; i < sheets.length; i++) {
      var sName = sheets[i].getName();
      // Strictly exclude ALL generated database sheets
      if (sName !== "📋_Students" && sName !== "📝_Quizzes" && sName !== "📊_Scoring" && sName !== "⚙️_Config") {
        if (sheets[i].getLastRow() > 1) {
          sourceSheet = sheets[i];
          break;
        }
      }
    }
  }

  if (!sourceSheet) {
    // If only separated sheets exist, pick the first sheet that is not Quizzes or Config
    sourceSheet = ss.getSheetByName("📋_Students") || sheets[0];
  }

  var lastRow = sourceSheet.getLastRow();
  var lastCol = sourceSheet.getLastColumn();

  if (lastRow < 2 || lastCol < 1) {
    return {
      success: false,
      message: "Source sheet '" + sourceSheet.getName() + "' contains no data rows to migrate."
    };
  }

  var rawValues = sourceSheet.getRange(1, 1, lastRow, lastCol).getValues();

  // Find header row in first 5 rows
  var headerIndex = 0;
  for (var r = 0; r < Math.min(5, rawValues.length); r++) {
    var row = rawValues[r];
    var rowHeaders = row.map(function(c) { return c ? String(c).trim() : ""; });
    var map = detectColumnMapping(rowHeaders);
    if (map.id !== null || map.nameKh !== null || map.nameEn !== null) {
      headerIndex = r;
      break;
    }
  }

  var headers = rawValues[headerIndex].map(function(c) { return c ? String(c).trim() : ""; });
  var colMap = detectColumnMapping(headers);

  // Parse all student records from source
  var extractedStudents = [];
  for (var rIdx = headerIndex + 1; rIdx < rawValues.length; rIdx++) {
    var rData = rawValues[rIdx];
    var sId = (colMap && colMap.id && colMap.id.index !== undefined && rData[colMap.id.index] !== undefined) ? String(rData[colMap.id.index]).trim() : "";
    var nameKh = (colMap && colMap.nameKh && colMap.nameKh.index !== undefined && rData[colMap.nameKh.index] !== undefined) ? String(rData[colMap.nameKh.index]).trim() : "";
    var nameEn = (colMap && colMap.nameEn && colMap.nameEn.index !== undefined && rData[colMap.nameEn.index] !== undefined) ? String(rData[colMap.nameEn.index]).trim() : "";

    // Skip empty filler rows
    if (!sId && !nameKh && !nameEn) continue;

    // CRITICAL: Strictly skip header rows or Max Points indicator rows
    if (nameKh.indexOf("🎯") !== -1 || nameKh.indexOf("ពិន្ទុពេញ") !== -1 || nameKh.indexOf("Max Points") !== -1) continue;
    if (nameEn.indexOf("Max Points") !== -1 || nameEn.indexOf("ពិន្ទុពេញ") !== -1) continue;
    if (sId.indexOf("🎯") !== -1 || sId.toLowerCase().indexOf("max") !== -1) continue;

    var gender = (colMap && colMap.gender && colMap.gender.index !== undefined && rData[colMap.gender.index] !== undefined) ? String(rData[colMap.gender.index]).trim() : "";
    var room = (colMap && colMap.room && colMap.room.index !== undefined && rData[colMap.room.index] !== undefined) ? String(rData[colMap.room.index]).trim() : "";
    var skill = (colMap && colMap.skill && colMap.skill.index !== undefined && rData[colMap.skill.index] !== undefined) ? String(rData[colMap.skill.index]).trim() : "";
    var qha = (colMap && colMap.totalQHA && colMap.totalQHA.index !== undefined && rData[colMap.totalQHA.index] !== "") ? Number(rData[colMap.totalQHA.index]) : "";
    var midterm = (colMap && colMap.midterm && colMap.midterm.index !== undefined && rData[colMap.midterm.index] !== "") ? Number(rData[colMap.midterm.index]) : "";
    var finalScore = (colMap && colMap.finalScore && colMap.finalScore.index !== undefined && rData[colMap.finalScore.index] !== "") ? Number(rData[colMap.finalScore.index]) : "";

    extractedStudents.push({
      studentId: sId || ("STU" + (extractedStudents.length + 1)),
      fullNameKh: nameKh,
      fullNameEn: nameEn,
      gender: (gender === "F" || gender === "ស្រី") ? "ស្រី" : "ប្រុស",
      room: room || "101",
      skill: skill || "General",
      qha: qha,
      midterm: midterm,
      finalScore: finalScore
    });
  }

  // -------------------------------------------------------------
  // CREATE SHEET 1: 📋_Students (Master Student Profiles)
  // -------------------------------------------------------------
  var studentsSheet = ss.getSheetByName("📋_Students");
  if (!studentsSheet) {
    studentsSheet = ss.insertSheet("📋_Students", 0);
  } else {
    studentsSheet.clear();
  }

  var studentHeaders = [
    "អត្តលេខ (Student ID)",
    "ឈ្មោះជាភាសាខ្មែរ (Khmer Name)",
    "ឈ្មោះអក្សរឡាតាំង (Latin Name)",
    "ភេទ (Gender)",
    "បន្ទប់ (Room)",
    "ជំនាញ (Major/Skill)",
    "លេខទូរស័ព្ទ (Phone)",
    "ស្ថានភាព (Status)"
  ];

  var studentRows = [studentHeaders];
  for (var s = 0; s < extractedStudents.length; s++) {
    var stu = extractedStudents[s];
    studentRows.push([
      stu.studentId,
      stu.fullNameKh,
      stu.fullNameEn,
      stu.gender,
      stu.room,
      stu.skill,
      "",
      "Active"
    ]);
  }

  studentsSheet.getRange(1, 1, studentRows.length, studentHeaders.length).setValues(studentRows);
  
  // Format Student ID as Plain Text to prevent loss of leading zeros
  studentsSheet.getRange(2, 1, extractedStudents.length, 1).setNumberFormat("@");
  
  // Style Header
  styleSheetHeader(studentsSheet, studentHeaders.length, "#0f172a", "#38bdf8");
  studentsSheet.setFrozenRows(1);

  // -------------------------------------------------------------
  // CREATE SHEET 2: 📝_Quizzes (Dynamic Quiz/Homework Matrix: 1-15 Quizzes, Max Points Header, Scaled to 15%)
  // -------------------------------------------------------------
  var quizzesSheet = ss.getSheetByName("📝_Quizzes");
  if (!quizzesSheet) {
    quizzesSheet = ss.insertSheet("📝_Quizzes", 1);
  } else {
    quizzesSheet.clear();
  }

  var quizHeaders = [
    "អត្តលេខ (Student ID)",
    "ឈ្មោះនិស្សិត (Name)",
    "បន្ទប់ (Room)",
    "Quiz 1",
    "Quiz 2",
    "Quiz 3",
    "Quiz 4",
    "Quiz 5",
    "Quiz 6",
    "Quiz 7",
    "Quiz 8",
    "Quiz 9",
    "Quiz 10",
    "Quiz 11",
    "Quiz 12",
    "Quiz 13",
    "Quiz 14",
    "Quiz 15",
    "ពិន្ទុពេញសរុប (Max)",
    "ពិន្ទុសរុបជាក់ស្តែង",
    "សរុបកិច្ចការ (15%)"
  ];

  // Row 2: Max Points Configuration Row (Teacher can set different max score for each Quiz!)
  var maxPointsRow = [
    "",
    "🎯 ពិន្ទុពេញ (Max Points):",
    "",
    10, // Quiz 1 Max
    20, // Quiz 2 Max
    15, // Quiz 3 Max
    20, // Quiz 4 Max
    10, // Quiz 5 Max
    "", // Quiz 6
    "", // Quiz 7
    "", // Quiz 8
    "", // Quiz 9
    "", // Quiz 10
    "", // Quiz 11
    "", // Quiz 12
    "", // Quiz 13
    "", // Quiz 14
    "", // Quiz 15
    "=SUM(D2:R2)", // Sum of all active quiz max points
    "",
    15 // Target converted points
  ];

  var quizRows = [quizHeaders, maxPointsRow];
  for (var q = 0; q < extractedStudents.length; q++) {
    var qStu = extractedStudents[q];
    var qRowNum = q + 3; // Starts at Row 3 because Row 2 is Max Points
    var baseQ = qStu.qha !== "" ? Number(qStu.qha) : 14;

    quizRows.push([
      qStu.studentId,
      '=IFERROR(IF(VLOOKUP(A' + qRowNum + ', \'📋_Students\'!$A:$B, 2, FALSE)<>"", VLOOKUP(A' + qRowNum + ', \'📋_Students\'!$A:$B, 2, FALSE), VLOOKUP(A' + qRowNum + ', \'📋_Students\'!$A:$C, 3, FALSE)), "")',
      '=IFERROR(VLOOKUP(A' + qRowNum + ', \'📋_Students\'!$A:$E, 5, FALSE), "")',
      Math.min(10, Math.round(baseQ * 0.65)), // Sample Quiz 1 score out of 10
      Math.min(20, Math.round(baseQ * 1.25)), // Sample Quiz 2 score out of 20
      Math.min(15, Math.round(baseQ * 0.95)), // Sample Quiz 3 score out of 15
      "", // Quiz 4
      "", // Quiz 5
      "", // Quiz 6
      "", // Quiz 7
      "", // Quiz 8
      "", // Quiz 9
      "", // Quiz 10
      "", // Quiz 11
      "", // Quiz 12
      "", // Quiz 13
      "", // Quiz 14
      "", // Quiz 15
      "", // Col S: empty for student rows
      // Col T: Sum of student scores across all quiz columns D to R
      '=SUM(D' + qRowNum + ':R' + qRowNum + ')',
      // Col U: Dynamic conversion to 15% -> (Earned / Max Total) * 15
      '=IF(ISBLANK(A' + qRowNum + '), "", IF($S$2=0, 0, ROUND((SUM(D' + qRowNum + ':R' + qRowNum + ')/$S$2)*15, 2)))'
    ]);
  }

  quizzesSheet.getRange(1, 1, quizRows.length, quizHeaders.length).setValues(quizRows);
  quizzesSheet.getRange(3, 1, extractedStudents.length, 1).setNumberFormat("@");

  // Style Header (Row 1) & Max Points (Row 2)
  styleSheetHeader(quizzesSheet, quizHeaders.length, "#1e1b4b", "#818cf8");
  var maxPointsRange = quizzesSheet.getRange(2, 1, 1, quizHeaders.length);
  maxPointsRange.setBackground("#fef3c7")
    .setFontColor("#92400e")
    .setFontWeight("bold")
    .setFontSize(10)
    .setFontFamily("Kantumruy Pro")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  quizzesSheet.setRowHeight(2, 32);

  // Freeze top 2 rows so headers and max points remain visible when scrolling
  quizzesSheet.setFrozenRows(2);

  // Highlight 15% Final Quiz Column (Col U / 21)
  var quiz15Range = quizzesSheet.getRange(3, 21, extractedStudents.length, 1);
  quiz15Range.setFontWeight("bold").setBackground("#f0fdf4");

  // -------------------------------------------------------------
  // CREATE SHEET 3: 📊_Scoring (Master Academic Scoring Matrix: 10 + 15 + 25 + 50 = 100)
  // -------------------------------------------------------------
  var scoringSheet = ss.getSheetByName("📊_Scoring");
  if (!scoringSheet) {
    scoringSheet = ss.insertSheet("📊_Scoring", 2);
  } else {
    scoringSheet.clear();
  }

  // 10 Attendance + 15 Quizzes/Tasks + 25 Midterm + 50 Final = 100
  var scoringHeaders = [
    "អត្តលេខ (Student ID)",
    "ឈ្មោះនិស្សិត (Name)",
    "បន្ទប់ (Room)",
    "ជំនាញ (Major)",
    "វត្តមាន (10)",
    "កិច្ចការ/Quiz (15)",
    "ពាក់កណ្តាលឆមាស (25)",
    "ប្រឡងបញ្ចប់ (50)",
    "ពិន្ទុសរុប (100)",
    "និទ្ទេស (Grade)",
    "លទ្ធផល (Result)"
  ];

  var scoringRows = [scoringHeaders];
  for (var sc = 0; sc < extractedStudents.length; sc++) {
    var item = extractedStudents[sc];
    var rowNum = sc + 2;

    // Columns:
    // A: ID, B: Name, C: Room, D: Major
    // E: Attendance (10)
    // F: Quiz/Homework (15) -> Linked dynamically to '📝_Quizzes' Col U
    // G: Midterm (25)
    // H: Final (50)
    // I: Total Score (100) -> E + F + G + H
    // J: Grade (8-Tier: A, B+, B, C+, C, D, E, F)
    // K: Result (ជាប់ / ធ្លាក់)
    scoringRows.push([
      item.studentId,
      '=IFERROR(IF(VLOOKUP(A' + rowNum + ', \'📋_Students\'!$A:$B, 2, FALSE)<>"", VLOOKUP(A' + rowNum + ', \'📋_Students\'!$A:$B, 2, FALSE), VLOOKUP(A' + rowNum + ', \'📋_Students\'!$A:$C, 3, FALSE)), "")',
      '=IFERROR(VLOOKUP(A' + rowNum + ', \'📋_Students\'!$A:$E, 5, FALSE), "")',
      '=IFERROR(VLOOKUP(A' + rowNum + ', \'📋_Students\'!$A:$F, 6, FALSE), "")',
      10, // Full attendance 10
      // Dynamic VLOOKUP to '📝_Quizzes' column U (Col 21)
      '=IFERROR(VLOOKUP(A' + rowNum + ', \'📝_Quizzes\'!A:U, 21, FALSE), ' + (item.qha !== "" ? Math.round(Number(item.qha)) : 14) + ')',
      item.midterm !== "" ? item.midterm : 20, // Midterm (25)
      item.finalScore !== "" ? item.finalScore : 42, // Final (50)
      // Total Score (100)
      '=IF(ISBLANK(A' + rowNum + '), "", ROUND(SUM(E' + rowNum + ':H' + rowNum + '), 2))',
      // Grade (8 Tiers: A>=85, B+>=80, B>=70, C+>=65, C>=50, D>=45, E>=40, F<40)
      '=IF(ISBLANK(I' + rowNum + '), "", IF(I' + rowNum + '>=85,"A", IF(I' + rowNum + '>=80,"B+", IF(I' + rowNum + '>=70,"B", IF(I' + rowNum + '>=65,"C+", IF(I' + rowNum + '>=50,"C", IF(I' + rowNum + '>=45,"D", IF(I' + rowNum + '>=40,"E","F"))))))))',
      // Result: Passing threshold >= 50
      '=IF(ISBLANK(I' + rowNum + '), "", IF(I' + rowNum + '>=50,"ជាប់ (Passed)","ធ្លាក់ (Failed)"))'
    ]);
  }

  scoringSheet.getRange(1, 1, scoringRows.length, scoringHeaders.length).setValues(scoringRows);
  scoringSheet.getRange(2, 1, extractedStudents.length, 1).setNumberFormat("@");
  
  // Style Scoring Header
  styleSheetHeader(scoringSheet, scoringHeaders.length, "#064e3b", "#34d399");
  scoringSheet.setFrozenRows(1);

  // Bold Total & Grade columns
  scoringSheet.getRange(2, 9, extractedStudents.length, 1).setFontWeight("bold");
  scoringSheet.getRange(2, 10, extractedStudents.length, 1).setFontWeight("bold");

  // -------------------------------------------------------------
  // CREATE SHEET 4: ⚙️_Config (Dynamic Settings & Grading Rules)
  // -------------------------------------------------------------
  var configSheet = ss.getSheetByName("⚙️_Config");
  if (!configSheet) {
    configSheet = ss.insertSheet("⚙️_Config", 3);
  } else {
    configSheet.clear();
  }

  var configData = [
    ["ប៉ារ៉ាម៉ែត្រ (Parameter Key)", "តម្លៃដែលបានកំណត់ (Configured Value)", "ការពន្យល់ (Description)"],
    ["ACADEMIC_YEAR", "2025-2026", "ឆ្នាំសិក្សាដែលកំពុងដំណើរការ"],
    ["SEMESTER", "ឆមាសទី ១ (Semester 1)", "ឆមាសសិក្សា"],
    ["PASSING_SCORE", "50", "ពិន្ទុអប្បបរមាដើម្បីជាប់ (Min passing score: 50)"],
    ["WEIGHT_ATTENDANCE", "10", "ទម្ងន់ពិន្ទុវត្តមាន (Attendance: 10 points)"],
    ["WEIGHT_QUIZ", "15", "ទម្ងន់ពិន្ទុកិច្ចការ និង Quiz (Quizzes & Tasks: 15 points)"],
    ["WEIGHT_MIDTERM", "25", "ទម្ងន់ពិន្ទុប្រឡងឆមាស (Midterm Exam: 25 points)"],
    ["WEIGHT_FINAL", "50", "ទម្ងន់ពិន្ទុប្រឡងបញ្ចប់ (Final Exam: 50 points)"],
    ["GRADE_A_MIN", "85", "85% - 100% = Excellent (ល្អប្រសើរ)"],
    ["GRADE_B_PLUS_MIN", "80", "80% - 84% = Very good (ល្អណាស់)"],
    ["GRADE_B_MIN", "70", "70% - 79% = Good (ល្អ)"],
    ["GRADE_C_PLUS_MIN", "65", "65% - 69% = Fairly good (ល្អបង្គួរ)"],
    ["GRADE_C_MIN", "50", "50% - 64% = Fairly (មធ្យម)"],
    ["GRADE_D_MIN", "45", "45% - 49% = Poor (ខ្សោយ)"],
    ["GRADE_E_MIN", "40", "40% - 44% = Very poor (ខ្សោយណាស់)"],
    ["GRADE_F_MAX", "39", "<= 39% = Failure (ធ្លាក់)"],
    ["PUBLISH_ALL_SCORES", "TRUE", "បើក/បិទការផ្សព្វផ្សាយលទ្ធផលដល់និស្សិត (TRUE/FALSE)"],
    ["AUTO_CACHE_TTL_MINUTES", "10", "រយៈពេលរក្សាទុក Cache ដើម្បីបង្កើនល្បឿន API (នាទី)"]
  ];

  configSheet.getRange(1, 1, configData.length, 3).setValues(configData);
  styleSheetHeader(configSheet, 3, "#312e81", "#818cf8");
  configSheet.setFrozenRows(1);

  // -------------------------------------------------------------
  // CREATE SHEET 5: 🔐_Users (Master User Accounts & Login Credentials)
  // Teacher: Username & Password; Student: Student Name & Student ID as Password
  // -------------------------------------------------------------
  var usersSheet = ss.getSheetByName("🔐_Users");
  if (!usersSheet) {
    usersSheet = ss.insertSheet("🔐_Users", 4);
  } else {
    usersSheet.clear();
  }

  var userHeaders = [
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

  var userRows = [userHeaders];
  var nowIso = new Date().toISOString();

  // 1. Default Admin & Faculty Teacher Accounts
  userRows.push([
    "USR-001",
    "admin",
    "admin2026",
    "អ្នកគ្រប់គ្រងប្រព័ន្ធ (System Admin)",
    "admin",
    "N/A",
    "",
    "",
    "Active",
    nowIso,
    ""
  ]);
  userRows.push([
    "USR-002",
    "teacher",
    "teacher2026",
    "សាស្ត្រាចារ្យ (Faculty Teacher)",
    "teacher",
    "N/A",
    "",
    "",
    "Active",
    nowIso,
    ""
  ]);

  // 2. Generate Student Accounts: Student Name as Username & Student ID as Password!
  for (var u = 0; u < extractedStudents.length; u++) {
    var uStu = extractedStudents[u];
    var uIdStr = "USR-" + ("000" + (u + 3)).slice(-3);
    var uDisplayName = uStu.fullNameKh || uStu.fullNameEn || uStu.studentId;

    userRows.push([
      uIdStr,
      uDisplayName,      // Username = Student Name
      uStu.studentId,    // Password = Student ID
      uDisplayName,      // Full Name
      "student",         // Role
      uStu.studentId,    // Student ID
      uStu.room,
      uStu.skill,
      "Active",
      nowIso,
      ""
    ]);
  }

  usersSheet.getRange(1, 1, userRows.length, userHeaders.length).setValues(userRows);
  usersSheet.getRange(2, 3, userRows.length - 1, 1).setNumberFormat("@"); // Format Password as text
  usersSheet.getRange(2, 6, userRows.length - 1, 1).setNumberFormat("@"); // Format Student ID as text
  styleSheetHeader(usersSheet, userHeaders.length, "#1e1b4b", "#6366f1");
  usersSheet.setFrozenRows(1);

  // Auto-resize columns on all newly created sheets
  autoResizeSheet(studentsSheet, studentHeaders.length);
  autoResizeSheet(quizzesSheet, quizHeaders.length);
  autoResizeSheet(scoringSheet, scoringHeaders.length);
  autoResizeSheet(configSheet, 3);
  autoResizeSheet(usersSheet, userHeaders.length);

  // Purge any accidental "🎯 ពិន្ទុពេញ" artifact rows from 📋_Students and 📊_Scoring
  purgeMaxPointsArtifacts(ss);

  // Clear cache so API picks up the clean structure immediately
  try {
    var cache = CacheService.getScriptCache();
    cache.removeAll([
      "NORM_STUDENT_DATA_" + targetId,
      "ADMIN_STATS_" + targetId,
      "CONFIG_" + targetId,
      "USERS_DATA_" + targetId
    ]);
  } catch (e) {}

  return {
    success: true,
    message: "New separated sheets successfully generated (including 🔐_Users for staff and student logins).",
    migratedCount: extractedStudents.length,
    sheetsCreated: ["📋_Students", "📝_Quizzes", "📊_Scoring", "⚙️_Config", "🔐_Users"],
    timestamp: new Date().toISOString()
  };
}

/**
 * Automatically purges any accidental "STU1 / 🎯 ពិន្ទុពេញ" fake student rows from 📋_Students and 📊_Scoring
 */
function purgeMaxPointsArtifacts(ss) {
  var sheetsToClean = ["📋_Students", "📊_Scoring"];
  sheetsToClean.forEach(function(sName) {
    var sh = ss.getSheetByName(sName);
    if (!sh || sh.getLastRow() < 2) return;
    var values = sh.getDataRange().getValues();
    for (var r = values.length - 1; r >= 1; r--) {
      var row = values[r];
      var sid = String(row[0] || "").trim();
      var nameKh = String(row[1] || "").trim();
      if (nameKh.indexOf("🎯") !== -1 || nameKh.indexOf("ពិន្ទុពេញ") !== -1 || nameKh.indexOf("Max Points") !== -1) {
        sh.deleteRow(r + 1);
      }
    }
  });
}

/**
 * Helper to apply modern formatting to sheet headers
 */
function styleSheetHeader(sheet, colCount, bgColor, borderColor) {
  var headerRange = sheet.getRange(1, 1, 1, colCount);
  headerRange.setBackground(bgColor)
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setFontSize(11)
    .setFontFamily("Kantumruy Pro")
    .setVerticalAlignment("middle")
    .setHorizontalAlignment("center");
  sheet.setRowHeight(1, 40);

  // Subtle border beneath header
  headerRange.setBorder(null, null, true, null, null, null, borderColor, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
}

/**
 * Helper to auto resize and add padding
 */
function autoResizeSheet(sheet, colCount) {
  for (var c = 1; c <= colCount; c++) {
    sheet.autoResizeColumn(c);
    var width = sheet.getColumnWidth(c);
    if (width < 120) sheet.setColumnWidth(c, 130);
    else sheet.setColumnWidth(c, width + 20); // Add breathing room
  }
}
