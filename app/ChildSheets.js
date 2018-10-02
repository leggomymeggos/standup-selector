var FIRST_ROW_IGNORE_HEADER = 2;
var FIRST_COL = 1;
var NUM_ADMIN_COLUMNS = 1;
var NUM_STATE_COLUMNS = 6;
var NUM_STANDUPPER_COLUMNS = 6;

AdminSheet.prototype = new Sheet;
StateSheet.prototype = new Sheet;
StandupperSheet.prototype = new Sheet;

function AdminSheet(sheet) {
    Sheet.call(this, sheet, FIRST_ROW_IGNORE_HEADER, FIRST_COL, sheet.getLastRow() - 1, NUM_ADMIN_COLUMNS);
}

function StateSheet(sheet) {
    Sheet.call(this, sheet, sheet.getLastRow() === 1 ? 2 : sheet.getLastRow(), FIRST_COL, 1, NUM_STATE_COLUMNS);

    this.getLatestIssuanceId = function () {
        return sheet.getLastRow() - 1;
    }
}

function StandupperSheet(sheet) {
    Sheet.call(this, sheet, FIRST_ROW_IGNORE_HEADER, FIRST_COL, sheet.getLastRow() - 1, NUM_STANDUPPER_COLUMNS);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        StandupperSheet: StandupperSheet,
        StateSheet: StateSheet,
        AdminSheet: AdminSheet
    };
}