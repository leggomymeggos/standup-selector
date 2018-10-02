function SheetFactory(gProperties) {
    this.gSpreadSheet = SpreadsheetApp.getActiveSpreadsheet();
    this.stateSheetName = gProperties.getProperty('STATE_SHEET_NAME');
    this.adminSheetName = gProperties.getProperty('ADMIN_SHEET_NAME');
    this.standupperSheetName = gProperties.getProperty('STANDUPPER_SHEET_NAME');

    this.getStateSheet = function() {
        return new StateSheet(this.gSpreadSheet.getSheetByName(this.stateSheetName));
    };

    this.getAdminSheet = function() {
        return new AdminSheet(this.gSpreadSheet.getSheetByName(this.adminSheetName));
    };

    this.getStandupperSheet = function() {
        return new StandupperSheet(this.gSpreadSheet.getSheetByName(this.standupperSheetName));
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SheetFactory;
}