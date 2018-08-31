function SpreadSheetService() {
  this.getStateSheet = function() {
    return new StateSheet(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('state'));
//    return new StateSheet(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('test-state'));
  };
  
  this.getAdminSheet = function() {
    return new AdminSheet(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('admin'));
//    return new AdminSheet(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('test-admin'));
  };
  
  this.getStandupperSheet = function() {
    return new StandupperSheet(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('standuppers'));
//    return new StandupperSheet(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('test-standuppers'));
  };
}

function Sheet(sheet, rangeRowStart, rangeColStart, rangeRowLength, rangeColLength) {
  this.sheet = sheet;
  this.rangeColStart = rangeColStart;
  this.rangeRowStart = rangeRowStart;
  this.rangeColLength = rangeColLength;
  this.rangeRowLength = rangeRowLength;
  
  this.getDataValues = function() {
    return sheet.getRange(rangeRowStart, rangeColStart, rangeRowLength, rangeColLength).getValues();
  };
  
  this.setDataValues = function(data) {
    sheet.getRange(rangeRowStart, rangeColStart, rangeRowLength, rangeColLength).setValues(data);
  };
  
  this.getLastRowNum = function() {
    return sheet.getLastRow();
  };
  
  this.addNewRow = function(dataArray) {
    sheet.appendRow(dataArray);
  };
}

AdminSheet.prototype = new Sheet;
StateSheet.prototype = new Sheet;
StandupperSheet.prototype = new Sheet;

function AdminSheet(sheet) {
  Sheet.call(this, sheet, FIRST_ROW_IGNORE_HEADER, FIRST_COL, sheet.getLastRow() - 1, NUM_ADMIN_COLUMNS);
}

function StateSheet(sheet) {
  Sheet.call(this, sheet, sheet.getLastRow(), FIRST_COL, 1, NUM_STATE_COLUMNS);

  this.getLatestIssuanceId = function() {
    return sheet.getLastRow() - 1;
  }
};

function StandupperSheet(sheet) {
  Sheet.call(this, sheet, FIRST_ROW_IGNORE_HEADER, FIRST_COL, sheet.getLastRow() - 1, NUM_STANDUPPER_COLUMNS);
};