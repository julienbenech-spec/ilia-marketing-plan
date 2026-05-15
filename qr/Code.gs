const SHEET_ID = "1zXMdzQitv4djH_gRdOUOlDITJvQZ2uUnioBVo9mIPC4";

function doGet(e) {
  const p = e.parameter;
  const a = p.action || "redirect";
  try {
    if (a === "redirect" || a === "track") return redirect(p);
    if (a === "stats") return getStats();
    if (a === "update") return updateQR(p);
    if (a === "create") return createQR(p);
    if (a === "list") return listQRs();
  } catch (err) {
    return j({ error: err.toString() });
  }
}

function redirect(p) {
  var id = p.id || "unknown";
  var ua = p.ua || "";
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var cfg = ss.getSheetByName("QR Config").getDataRange().getValues();
  var nom = id;
  var url = "https://www.instagram.com/iliarestaurant/";
  for (var i = 1; i < cfg.length; i++) {
    if (String(cfg[i][0]).trim() === String(id).trim()) {
      nom = cfg[i][1];
      url = cfg[i][2];
      break;
    }
  }
  var ts = Utilities.formatDate(new Date(), "Europe/Paris", "dd/MM/yyyy HH:mm:ss");
  var dev = "Desktop";
  if (/iPhone|iPad|iPod/i.test(ua)) dev = "iOS";
  else if (/Android/i.test(ua)) dev = "Android";
  else if (/Mobile/i.test(ua)) dev = "Mobile";
  ss.getSheetByName("QR Tracking").appendRow([ts, id, nom, url, dev, "", ""]);
  return j({ url: url, id: id, name: nom });
}

function getStats() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var td = ss.getSheetByName("QR Tracking").getDataRange().getValues();
  var cd = ss.getSheetByName("QR Config").getDataRange().getValues();
  var logs = [], config = [];
  for (var i = 1; i < td.length; i++) {
    if (td[i][0]) logs.push({ timestamp: td[i][0].toString(), qr_id: td[i][1] || "", name: td[i][2] || "", url: td[i][3] || "", device: td[i][4] || "" });
  }
  for (var i = 1; i < cd.length; i++) {
    if (cd[i][0]) config.push({ id: cd[i][0], name: cd[i][1], url: cd[i][2], active: cd[i][3] });
  }
  return j({ logs: logs, config: config });
}

function updateQR(p) {
  if (!p.id || !p.url) return j({ error: "id and url required" });
  var s = SpreadsheetApp.openById(SHEET_ID).getSheetByName("QR Config");
  var d = s.getDataRange().getValues();
  for (var i = 1; i < d.length; i++) {
    if (String(d[i][0]).trim() === String(p.id).trim()) {
      if (p.name) s.getRange(i + 1, 2).setValue(p.name);
      s.getRange(i + 1, 3).setValue(p.url);
      return j({ success: true, id: p.id, url: p.url });
    }
  }
  return j({ error: "QR not found" });
}

function createQR(p) {
  if (!p.id || !p.name || !p.url) return j({ error: "id name url required" });
  var s = SpreadsheetApp.openById(SHEET_ID).getSheetByName("QR Config");
  var d = s.getDataRange().getValues();
  for (var i = 1; i < d.length; i++) {
    if (String(d[i][0]).trim() === String(p.id).trim()) return j({ error: "ID exists" });
  }
  s.appendRow([p.id, p.name, p.url, "OUI"]);
  return j({ success: true, id: p.id, name: p.name, url: p.url });
}

function listQRs() {
  var d = SpreadsheetApp.openById(SHEET_ID).getSheetByName("QR Config").getDataRange().getValues();
  var qrs = [];
  for (var i = 1; i < d.length; i++) {
    if (d[i][0]) qrs.push({ id: d[i][0], name: d[i][1], url: d[i][2], active: d[i][3] });
  }
  return j({ qrs: qrs });
}

function j(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
