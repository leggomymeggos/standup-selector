function StandupperService(standupperSheet) {
    this.standupperSheet = standupperSheet;

    this.getStanduppers = function () {
        return this.standupperSheet.getDataValues().map(function(row, index) {
            return new Standupper(row, index)
        });
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {StandupperService}
}