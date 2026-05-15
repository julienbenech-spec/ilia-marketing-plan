const SHEET_ID = "1zXMdzQitv4djH_gRdOUOlDITJvQZ2uUnioBVo9mIPC4";

function doGet(e) {
  var p = e.parameter;
  var a = p.action || "redirect";
  var cb = p.callback || null;
  try {
    var result;
    if (a === "redirect" || a === "track") result = redirect(p);
    else if (a === "stats") result = getStats();
    else if (a === "update") result = updateQR(p);
    else if (a === "create") result = createQR(p);
    else if (a === "list") result = listQRs();
    else if (a === "delete") result = deleteQR(p);
    else result = j({error: "unknown action"});
    if (cb) return ContentService.createTextOutput(cb + "(" + result.getContent() + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
    return result;
  } catch (err) {
    var r = j({error: err.toString()});
    if (cb) return ContentService.createTextOutput(cb + "(" + r.getContent() + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
    return r;
  }
}

function redirect(p) {
  var id = p.id || "unknown", ua = p.ua || "";
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var cfg = ss.getSheetByName("QR Config").getDataRange().getValues();
  var nom = id, url = null;
  for (var i = 1; i < cfg.length; i++) {
    if (String(cfg[i][0]).trim() === String(id).trim()) { nom = cfg[i][1]; url = cfg[i][2]; break; }
  }
  if (!url) return j({error: "ID not found", id: id});
  var ts = Utilities.formatDate(new Date(), "Europe/Paris", "dd/MM/yyyy HH:mm:ss");
  var dev = "Desktop";
  if (/iPhone|iPad|iPod/i.test(ua)) dev = "iOS";
  else if (/Android/i.test(ua)) dev = "Android";
  else if (/Mobile/i.test(ua)) dev = "Mobile";
  ss.getSheetByName("QR Tracking").appendRow([ts, id, nom, url, dev, "", ""]);
  return j({url: url, id: id, name: nom});
}

function getStats() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var td = ss.getSheetByName("QR Tracking").getDataRange().getValues();
  var cd = ss.getSheetByName("QR Config").getDataRange().getValues();
  var logs = [], config = [];
  for (var i = 1; i < td.length; i++) { if (td[i][0]) logs.push({timestamp: td[i][0].toString(), qr_id: td[i][1]||"", name: td[i][2]||"", url: td[i][3]||"", device: td[i][4]||""}); }
  for (var i = 1; i < cd.length; i++) { if (cd[i][0]) config.push({id: cd[i][0], name: cd[i][1], url: cd[i][2], active: cd[i][3]}); }
  return j({logs: logs, config: config});
}

function updateQR(p) {
  if (!p.id || !p.url) return j({error: "id and url required"});
  var s = SpreadsheetApp.openById(SHEET_ID).getSheetByName("QR Config");
  var d = s.getDataRange().getValues();
  for (var i = 1; i < d.length; i++) {
    if (String(d[i][0]).trim() === String(p.id).trim()) {
      if (p.name) s.getRange(i+1, 2).setValue(p.name);
      s.getRange(i+1, 3).setValue(p.url);
      return j({success: true, id: p.id, url: p.url});
    }
  }
  return j({error: "QR not found"});
}

function createQR(p) {
  if (!p.id || !p.name || !p.url) return j({error: "id name url required"});
  var s = SpreadsheetApp.openById(SHEET_ID).getSheetByName("QR Config");
  var d = s.getDataRange().getValues();
  for (var i = 1; i < d.length; i++) { if (String(d[i][0]).trim() === String(p.id).trim()) return j({error: "ID exists"}); }
  s.appendRow([p.id, p.name, p.url, "OUI"]);
  return j({success: true});
}

function deleteQR(p) {
  if (!p.id) return j({error: "id required"});
  var s = SpreadsheetApp.openById(SHEET_ID).getSheetByName("QR Config");
  var d = s.getDataRange().getValues();
  for (var i = 1; i < d.length; i++) {
    if (String(d[i][0]).trim() === String(p.id).trim()) {
      s.deleteRow(i + 1);
      return j({success: true, id: p.id});
    }
  }
  return j({error: "QR not found"});
}

function listQRs() {
  var d = SpreadsheetApp.openById(SHEET_ID).getSheetByName("QR Config").getDataRange().getValues();
  var qrs = [];
  for (var i = 1; i < d.length; i++) { if (d[i][0]) qrs.push({id: d[i][0], name: d[i][1], url: d[i][2], active: d[i][3]}); }
  return j({qrs: qrs});
}

function j(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
