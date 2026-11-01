/**
 * =========================================================================
 * UNIVERSITY STUDENT INFORMATION & SCORING SYSTEM
 * File: google-apps-script/Inspect.gs
 * Description: Non-destructive Diagnostic & Inspection Tool
 * =========================================================================
 * 
 * INSTRUCTIONS FOR USER:
 * 1. Open your Google Spreadsheet:
 *    https://docs.google.com/spreadsheets/d/177W-KA6N6pFuP7_8vxo5SYQuBpm0BNPo8YSR3pAoF9E/edit
 * 2. Click "Extensions" > "Apps Script".
 * 3. Copy and paste this file into your Apps Script editor.
 * 4. In the function dropdown, select `inspectSpreadsheetStructure` and click "Run".
 * 5. Review the Execution Log (View > Logs) to see your exact worksheet names,
 *    headers, row counts, and data patterns.
 * 
 * SAFETY GUARANTEE:
 * This script is 100% READ-ONLY. It never edits, overwrites, clears, or deletes
 * any data, sheets, formatting, or formulas in your spreadsheet.
 */

// Default Spreadsheet ID (Provided by user)
var SPREADSHEET_ID = "177W-KA6N6pFuP7_8vxo5SYQuBpm0BNPo8YSR3pAoF9E";

/**
 * Main inspection function to run from Apps Script Editor
 */
function inspectSpreadsheetStructure() {
  var startTime = new Date().getTime();
  Logger.log("==========================================================");
  Logger.log("  UNIVERSITY SCORING SYSTEM - SPREADSHEET DIAGNOSTIC TOOL ");
  Logger.log("==========================================================");
  Logger.log("Timestamp: " + new Date().toISOString());
  Logger.log("Spreadsheet ID: " + SPREADSHEET_ID);

  var ss;
  try {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log("✓ Successfully opened spreadsheet: \"" + ss.getName() + "\"");
  } catch (err) {
    Logger.log("❌ ERROR opening spreadsheet: " + err.message);
    Logger.log("Troubleshooting:");
    Logger.log("1. Ensure your Google account has Viewer or Editor access to the sheet.");
    Logger.log("2. Verify the Spreadsheet ID: " + SPREADSHEET_ID);
    return {
      success: false,
      error: err.message
    };
  }

  var sheets = ss.getSheets();
  Logger.log("Total worksheets found: " + sheets.length);
  Logger.log("----------------------------------------------------------");

  var diagnosticSummary = {
    spreadsheetId: SPREADSHEET_ID,
    spreadsheetName: ss.getName(),
    totalSheets: sheets.length,
    sheets: []
  };

  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    var sheetName = sheet.getName();
    var sheetId = sheet.getSheetId();
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();

    Logger.log("\n[Sheet " + (i + 1) + "] Name: \"" + sheetName + "\" (gid: " + sheetId + ")");
    Logger.log("  Dimensions: " + lastRow + " rows x " + lastCol + " columns");

    var sheetInfo = {
      index: i,
      name: sheetName,
      gid: sheetId,
      rowCount: lastRow,
      columnCount: lastCol,
      headers: [],
      sampleTypes: [],
      detectedFields: {}
    };

    if (lastRow > 0 && lastCol > 0) {
      // Read header row (row 1)
      var headerValues = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      var headers = [];
      for (var c = 0; c < headerValues.length; c++) {
        var val = headerValues[c] ? String(headerValues[c]).trim() : ("Col_" + (c + 1));
        headers.push(val);
      }
      sheetInfo.headers = headers;
      Logger.log("  Headers (" + headers.length + "): [" + headers.map(function(h) { return '"' + h + '"'; }).join(", ") + "]");

      // Detect field mappings
      var detected = detectColumnMapping(headers);
      sheetInfo.detectedFields = detected;
      Logger.log("  Detected Field Mappings:");
      for (var fieldKey in detected) {
        if (detected.hasOwnProperty(fieldKey) && detected[fieldKey] !== null) {
          Logger.log("    - " + fieldKey + " -> Column " + (detected[fieldKey].index + 1) + ' ("' + detected[fieldKey].header + '")');
        }
      }

      // Read sample row 2 if present
      if (lastRow >= 2) {
        var sampleValues = sheet.getRange(2, 1, 1, lastCol).getValues()[0];
        var sampleFormulas = sheet.getRange(2, 1, 1, lastCol).getFormulas()[0];
        var samplePreview = [];
        var formulaCount = 0;

        for (var s = 0; s < sampleValues.length; s++) {
          var isFormula = sampleFormulas[s] && sampleFormulas[s].length > 0;
          if (isFormula) formulaCount++;
          samplePreview.push({
            col: s + 1,
            header: headers[s],
            type: typeof sampleValues[s],
            hasFormula: isFormula
          });
        }
        sheetInfo.samplePreview = samplePreview;
        sheetInfo.formulaCountInRow2 = formulaCount;
        Logger.log("  Row 2 data types inspected. Formulas detected in Row 2: " + formulaCount);
      }
    } else {
      Logger.log("  (Empty worksheet)");
    }

    diagnosticSummary.sheets.push(sheetInfo);
  }

  var elapsed = (new Date().getTime() - startTime) / 1000;
  Logger.log("\n==========================================================");
  Logger.log("✓ Inspection completed safely in " + elapsed.toFixed(2) + "s.");
  Logger.log("Copy the logs above or the JSON below if requested.");
  Logger.log("==========================================================");
  Logger.log(JSON.stringify(diagnosticSummary, null, 2));

  return diagnosticSummary;
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
    midterm: null,
    finalScore: null,
    totalScore: null,
    grade: null,
    status: null,
    published: null
  };

  var patterns = {
    id: [/^(id|student[_\s]?id|sid|លេខសម្គាល់|កូដនិស្សិត)$/i, /student.*id/i, /\bid\b/i],
    nameKh: [/^(ឈ្មោះខ្មែរ|ឈ្មោះ|khmer[_\s]?name|student[_\s]?name|full[_\s]?name)$/i, /ឈ្មោះខ្មែរ/i, /ឈ្មោះ/i],
    nameEn: [/^(ឈ្មោះអង់គ្លេស|english[_\s]?name|name[_\s]?en|latin[_\s]?name)$/i, /ឈ្មោះអង់គ្លេស/i, /english.*name/i],
    gender: [/^(ភេទ|gender|sex)$/i, /ភេទ/i, /gender/i],
    room: [/^(បន្ទប់|class|classroom|room|ថ្នាក់)$/i, /បន្ទប់/i, /room/i, /class/i],
    subject: [/^(មុខវិជ្ជា|subject|course|subject[_\s]?name)$/i, /មុខវិជ្ជា/i, /subject/i],
    skill: [/^(ជំនាញ|major|skill|specialization)$/i, /ជំនាញ/i, /major/i],
    faculty: [/^(មហាវិទ្យាល័យ|faculty)$/i, /មហាវិទ្យាល័យ/i, /faculty/i],
    department: [/^(ដេប៉ាតឺម៉ង់|department|dept)$/i, /ដេប៉ាតឺម៉ង់/i, /department/i],
    academicYear: [/^(ឆ្នាំសិក្សា|academic[_\s]?year|school[_\s]?year)$/i, /ឆ្នាំសិក្សា/i, /academic.*year/i],
    semester: [/^(ឆមាស|semester|term)$/i, /ឆមាស/i, /semester/i],
    totalQHA: [/សរុបពិន្ទុ.*\(q,h,a\)/i, /qha/i, /quiz.*homework/i, /សរុបពិន្ទុ/i],
    midterm: [/^(midterm|ពាក់កណ្តាលឆមាស|mid[_\s]?term)$/i, /midterm/i],
    finalScore: [/^(final|ប្រឡងបញ្ចប់|final[_\s]?exam)$/i, /final/i],
    totalScore: [/^(total|សរុប|total[_\s]?score|ពិន្ទុសរុប)$/i, /សរុប/i, /total/i],
    grade: [/^(grade|និទ្ទេស|letter[_\s]?grade)$/i, /និទ្ទេស/i, /grade/i],
    status: [/^(status|ស្ថានភាព|student[_\s]?status)$/i, /ស្ថានភាព/i, /status/i],
    published: [/^(published|is_published|ផ្សព្វផ្សាយ|publish)$/i, /ផ្សព្វផ្សាយ/i, /publish/i]
  };

  for (var i = 0; i < headers.length; i++) {
    var h = headers[i].trim();
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
