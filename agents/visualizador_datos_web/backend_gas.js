/* Google Apps Script - Código para el Backend de la Encuesta */

function doPost(e) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Respuestas");
    if (!sheet) {
        sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Respuestas");
        sheet.appendRow(["Fecha", "Razón de Retorno", "Situación Laboral", "Dificultades"]);
    }

    try {
        var data = JSON.parse(e.postData.contents);
        sheet.appendRow([
            data.date,
            data.q1,
            data.q2,
            data.q1_extra // O cualquier otro campo adicional
        ]);
        return ContentService.createTextOutput("Éxito").setMimeType(ContentService.MimeType.TEXT);
    } catch (err) {
        return ContentService.createTextOutput("Error: " + err).setMimeType(ContentService.MimeType.TEXT);
    }
}
