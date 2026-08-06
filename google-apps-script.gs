/**
 * Peterborough Pickleball Installation — lead capture endpoint
 * Google Apps Script bound to a Google Sheet.
 *
 * SETUP
 * 1. Create a Google Sheet (name it e.g. "Peterborough Pickleball Leads").
 * 2. Extensions > Apps Script. Delete the starter code, paste this file in.
 * 3. Edit NOTIFY_EMAIL below.
 * 4. Run > setupSheet (once). Approve the permission prompts.
 * 5. Deploy > New deployment > type "Web app".
 *      Execute as:      Me
 *      Who has access:  Anyone
 *    Copy the /exec URL.
 * 6. Paste that URL into ENDPOINT in js/main.js on the site.
 *
 * NOTE: after ANY code change you must Deploy > Manage deployments >
 * edit the existing deployment > Version: New version. Otherwise the live
 * URL keeps serving the old code.
 */

var NOTIFY_EMAIL = 'dallastiffin@gmail.com'; // where new-lead alerts go
var SHEET_NAME   = 'Leads';

var HEADERS = [
  'Timestamp',
  'Name',
  'Email',
  'Phone',
  'City',
  'Project Type',
  'Message',
  'Source Page',
  'Referrer',
  'UTM Source',
  'UTM Medium',
  'UTM Campaign'
];

/* ------------------------------------------------------------------ setup */

function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  sheet.clear();
  sheet.getRange(1, 1, 1, HEADERS.length)
       .setValues([HEADERS])
       .setFontWeight('bold')
       .setBackground('#1c2126')
       .setFontColor('#ffffff');
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 160); // Timestamp
  sheet.setColumnWidth(2, 160); // Name
  sheet.setColumnWidth(3, 220); // Email
  sheet.setColumnWidth(4, 130); // Phone
  sheet.setColumnWidth(5, 150); // City
  sheet.setColumnWidth(6, 220); // Project Type
  sheet.setColumnWidth(7, 420); // Message
  sheet.getRange(1, 1, 1, HEADERS.length).createFilter();
}

/* ------------------------------------------------------------- web app */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    var data = parseRequest(e);

    // Honeypot — bots fill hidden fields. Accept silently, log nothing.
    if (String(data._gotcha || '').trim() !== '') {
      return jsonOut({ result: 'success' });
    }

    var name  = clean(data.name);
    var email = clean(data.email);
    var phone = clean(data.phone);

    if (!name || !email || !phone) {
      return jsonOut({ result: 'error', message: 'Missing required fields.' });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) { setupSheet(); sheet = ss.getSheetByName(SHEET_NAME); }

    var row = [
      new Date(),
      name,
      email,
      phone,
      clean(data.city),
      clean(data.project_type),
      clean(data.message),
      clean(data.source_page),
      clean(data.referrer),
      clean(data.utm_source),
      clean(data.utm_medium),
      clean(data.utm_campaign)
    ];

    sheet.appendRow(row);
    sendNotification(row);

    return jsonOut({ result: 'success' });

  } catch (err) {
    console.error(err);
    return jsonOut({ result: 'error', message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return jsonOut({ result: 'ok', message: 'Endpoint live. POST form data here.' });
}

/* ------------------------------------------------------------- helpers */

function parseRequest(e) {
  if (!e) { return {}; }

  // JSON body (text/plain or application/json)
  if (e.postData && e.postData.contents) {
    var raw = e.postData.contents;
    var type = e.postData.type || '';
    if (type.indexOf('json') !== -1 || raw.charAt(0) === '{') {
      try { return JSON.parse(raw); } catch (ignore) {}
    }
  }

  // Form-encoded / multipart body
  return e.parameter || {};
}

function clean(v) {
  return String(v == null ? '' : v).trim().slice(0, 5000);
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function sendNotification(row) {
  if (!NOTIFY_EMAIL) { return; }

  var subject = 'New estimate request — ' + row[1] + ' (' + (row[5] || 'no type') + ')';

  var body =
    'New lead from peterboroughpickleballinstallation.com\n\n' +
    'Name:         ' + row[1] + '\n' +
    'Email:        ' + row[2] + '\n' +
    'Phone:        ' + row[3] + '\n' +
    'City:         ' + row[4] + '\n' +
    'Project type: ' + row[5] + '\n\n' +
    'Message:\n' + (row[6] || '(none)') + '\n\n' +
    '---\n' +
    'Page:     ' + row[7] + '\n' +
    'Referrer: ' + row[8] + '\n' +
    'UTM:      ' + [row[9], row[10], row[11]].filter(String).join(' / ') + '\n' +
    'Received: ' + Utilities.formatDate(row[0], 'America/Toronto', 'yyyy-MM-dd HH:mm') + '\n';

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: subject,
    body: body,
    replyTo: row[2],
    name: 'Peterborough Pickleball Website'
  });
}

/* Optional: run once to confirm the sheet + email work before deploying. */
function testSubmission() {
  doPost({
    parameter: {
      name: 'Test Lead',
      email: 'test@example.com',
      phone: '705-555-0123',
      city: 'Peterborough',
      project_type: 'Residential / backyard court',
      message: 'This is a test submission.',
      source_page: '/contact.html'
    }
  });
}
