function StandupperService(standupperSheet) {
    this.standupperSheet = standupperSheet;

    this.getStanduppers = function () {
        return this.standupperSheet.getDataValues().map(function (row, index) {
            return new Standupper(row, index)
        });
    };

    this.incrementSelection = function (standupper) {
        var standupperTable = standupperSheet.getDataValues();
        var standupperRow = standupperTable[standupper.id - 1];

        standupperRow[3] === "" ? standupperRow[3] = 1 : standupperRow[3] += 1;
        standupperSheet.setDataValues(standupperTable);
    };

    this.addConfirmationForStandupper = function (standupper) {
        var standupperTable = standupperSheet.getDataValues();
        var standupperRow = standupperTable[standupper.id - 1];
        standupperRow[2] = getNextMonday().toLocaleDateString();
        standupperSheet.setDataValues(standupperTable);
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {StandupperService}
}