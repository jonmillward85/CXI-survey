// ===== Google Apps Script for CXI Survey Data Collection =====
// Paste this into Extensions > Apps Script in your Google Sheet
// Deploy as: Web app | Execute as: Me | Access: Anyone

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = 'Responses';

    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      var headers = getHeaders();
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    var row = flattenData(data);

    // Find existing row by sessionId (column A, starting row 2)
    var sessionId = data.sessionId || '';
    var lastRow = sheet.getLastRow();
    var existingRow = -1;

    if (lastRow >= 2) {
      var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) {
        if (ids[i][0] === sessionId) {
          existingRow = i + 2;
          break;
        }
      }
    }

    if (existingRow > 0) {
      sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    return ContentService.createTextOutput(JSON.stringify({status: 'ok'}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getHeaders() {
  return [
    'sessionId',
    'startTime',
    'endTime',
    'totalSeconds',
    'currentScreen',
    'prolific_id',

    // S1: Demographics
    'd1_income',
    'd2_household',

    // S2: Feelings about experiences
    'e1_happiest_memory',
    'e2_spending_pref',
    'e3_essentials',
    'e4_sacrifice',
    'e5_screen_break',
    'e6_missing',
    'e7_ai_value',

    // S3: Behaviour & values
    'c1_live_music',
    'c1_live_sport',
    'c1_holiday',
    'c1_theatre',
    'c1_food_drink',
    'c1_museum',
    'c1_cinema',
    'c2_most_important',
    'c3_impression',
    'c4_top3',
    'c4b_least',
    'c5_live_vs_stream',
    'c6_barriers',
    'c7_cost_mgmt',

    // S4: Brands
    'ba0_participated',
    'ba1_event_type',
    'ba2_brand_awareness',
    'ba3_brand_sentiment',
    'ba4_actions',
    'ba5_best_thing',
    'ba6_instore',
    'bh1_hypothetical',

    // S5: Wellbeing
    'l1_loneliness',
    'l2_connection',
    'l3_solo',

    // S6: Future
    'f1_live_music',
    'f1_live_sport',
    'f1_holidays',
    'f1_food_drink',
    'f1_theatre',
    'f2_open_text',

    'timestamp'
  ];
}

function flattenData(data) {
  var headers = getHeaders();
  var row = [];

  for (var i = 0; i < headers.length; i++) {
    var key = headers[i];

    if (key === 'timestamp') {
      row.push(new Date().toISOString());
    } else if (key === 'startTime' && data.startTime) {
      row.push(new Date(data.startTime).toISOString());
    } else if (key === 'endTime' && data.endTime) {
      row.push(new Date(data.endTime).toISOString());
    } else {
      row.push(data[key] != null ? data[key] : '');
    }
  }

  return row;
}

function doGet(e) {
  return ContentService.createTextOutput('CXI Survey data collector is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}
