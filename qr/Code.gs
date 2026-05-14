// Google Apps Script — QR Tracker ILIA
// Déployer comme Web App : Exécuter en tant que "Moi", Accès "Tout le monde"

const SHEET_ID = "1zXMdzQitv4djH_gRdOUOlDITJvQZ2uUnioBVo9mIPC4";

function doGet(e) {
  try {
    const params = e.parameter;
    const qrId = params.id || "unknown";
    const ua = params.ua || "";
    const ref = params.ref || "";
    
    // Récupérer l'URL de destination depuis QR Config
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const configSheet = ss.getSheetByName("QR Config");
    const trackSheet = ss.getSheetByName("QR Tracking");
    
    // Trouver le nom et l'URL pour ce QR ID
    const configData = configSheet.getDataRange().getValues();
    let nom = qrId;
    let urlDest = "https://www.instagram.com/iliarestaurant/";
    
    for (let i = 1; i < configData.length; i++) {
      if (configData[i][0] === qrId) {
        nom = configData[i][1];
        urlDest = configData[i][2];
        break;
      }
    }
    
    // Logger le scan
    const now = new Date();
    const timestamp = Utilities.formatDate(now, "Europe/Paris", "dd/MM/yyyy HH:mm:ss");
    
    // Détecter device depuis User Agent
    let device = "Desktop";
    if (/iPhone|iPad|iPod/i.test(ua)) device = "iOS";
    else if (/Android/i.test(ua)) device = "Android";
    else if (/Mobile/i.test(ua)) device = "Mobile";
    
    trackSheet.appendRow([timestamp, qrId, nom, urlDest, device, "", ""]);
    
    // Rediriger
    return ContentService.createTextOutput("OK");
    
  } catch(err) {
    return ContentService.createTextOutput("Error: " + err.toString());
  }
}
