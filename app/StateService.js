function StateService(stateSheet) {
    this.stateSheet = stateSheet;

    this.createNewStandup = function (selectedStanduppers) {
        stateSheet.addNewRow(
            [
                getNextMonday().toLocaleDateString(),
                'not-confirmed',
                'not-confirmed',
                this.format(selectedStanduppers),
                '',
                this.getCurrentIssuanceId()
            ]);
    };

    this.getCurrentIssuanceId = function () {
        return this.stateSheet.getLastRowNum();
    };

    this.format = function (selectedStanduppers) {
        return selectedStanduppers.map(function (e) {
            return e.slackName
        }).join(', ');
    };

    this.getConfirmedStandupperNames = function () {
        return this.stateSheet.getDataValues()[0]
            .slice(1, 3)
            .filter(function (e) {
                return e !== 'not-confirmed';
            })
    };

    this.getRejectedStandupperNames = function () {
        return this.stateSheet.getDataValues()[0][4].split(', ');

    };

    this.getSelectedStandupperNames = function () {
        return this.stateSheet.getDataValues()[0][3].split(', ');
    };

    this.getCurrentStandupDateString = function () {
        var current = this.stateSheet.getDataValues()[0][0];
        return current === '' ? current : current.toLocaleDateString();
    };

    this.recordRejection = function (standupperName) {
        var stateTable = this.stateSheet.getDataValues();

        stateTable[0][4] = stateTable[0][4] === '' ? standupperName : stateTable[0][4] + ', ' + standupperName;

        this.stateSheet.setDataValues(stateTable);
    };

    this.recordConfirmation = function (standupperName) {
        var stateTable = this.stateSheet.getDataValues();
        var stateRow = stateTable[0];

        if (stateRow[1] === 'not-confirmed') {
            stateRow[1] = standupperName;
            this.stateSheet.setDataValues(stateTable);
        } else if (stateRow[2] === 'not-confirmed') {
            stateRow[2] = standupperName;
            this.stateSheet.setDataValues(stateTable);
        }
    };

    this.recordSelection = function (standupperName) {
        var stateTable = this.stateSheet.getDataValues();

        stateTable[0][3] = stateTable[0][3] === '' ? standupperName : stateTable[0][3] + ', ' + standupperName;

        this.stateSheet.setDataValues(stateTable);
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = StateService
}