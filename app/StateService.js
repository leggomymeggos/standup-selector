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
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {StateService}
}