function StandupperService(standupperSheet) {
    this.standupperSheet = standupperSheet;

    this.getStanduppers = function () {
        return this.standupperSheet.getDataValues().map(function (row, index) {
            return new Standupper(row, index)
        });
    };

    this.incrementSelection = function (standupper) {
        var standupperTable = this.standupperSheet.getDataValues();
        var standupperRow = standupperTable[standupper.id - 1];

        standupperRow[3] === "" ? standupperRow[3] = 1 : standupperRow[3] += 1;
        this.standupperSheet.setDataValues(standupperTable);
    };

    this.addConfirmation = function (standupperName) {
        var standupperRowIndex = this.getStanduppers()
            .map(function (su) {return su.slackName})
            .indexOf(standupperName);

        var standupperTable = this.standupperSheet.getDataValues();
        var standupperRow = standupperTable[standupperRowIndex];
        standupperRow[2] = getNextMonday().toLocaleDateString();
        this.standupperSheet.setDataValues(standupperTable);
    };

    this.getOmittedStandupperNames = function () {
        return this.getStanduppers()
            .filter(function (su) {
                return su.isForceOmitted();
            })
            .map(function (su) {
                return su.slackName;
            });
    };

    //TODO
    this.saveStandupper = function (standupper) {
        this.standupperSheet.setDataValues(standupper.toDataArray());
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = StandupperService
}