function Standupper(row, index) {
    this.id = (index + 1);
    this.slackName = row[0];
    this.email = row[1];
    this.lastStandupRun = row[2];
    this.numTimesSelected = row[3];
    this.forceSelection = row[4] !== '';
    this.forceOmission = row[5] !== '';
    this.dmUcid = row[6] === '' ? undefined : row[6];

    this.isForceSelected = function () {
        return this.forceSelection;
    };

    this.isForceOmitted = function () {
        return this.forceOmission;
    };

    this.getNormalizedFrequencyScore = function (standuppers) {
        //which is faster i wonder

//      var maxTimesSelected = standuppers.reduce(function(acc, ele) {
//        return Math.max(acc, ele.getNumTimesSelected());
//      }, standuppers[0].getNumTimesSelected());

        var maxTimesSelected = Math.max.apply(Math, standuppers.map(function (su) {
            return su.getNumTimesSelected();
        }));

        return 100 -
            (this.getNumTimesSelected() === maxTimesSelected ? 100 : (100 * this.getNumTimesSelected()) / maxTimesSelected);
    };

    this.getNormalizedProximityScore = function (standuppers) {
        var maxNumWeeksSince = standuppers.reduce(function (acc, ele) {
            return Math.max(acc, ele.getNumWeeksSinceLastStandupRun());
        }, standuppers[0].getNumWeeksSinceLastStandupRun());

        return this.getNumWeeksSinceLastStandupRun() === maxNumWeeksSince ? 100 : (100 * this.getNumWeeksSinceLastStandupRun()) / maxNumWeeksSince;
    };
    this.getProbability = function (standuppers) {
        return Math.floor((this.getNormalizedProximityScore(standuppers) * 0.60) + (this.getNormalizedFrequencyScore(standuppers) * 0.40));
    };
    this.getNumWeeksSinceLastStandupRun = function () {
        return Math.floor((new Date() - this.lastStandupRun) / 1000 / 60 / 60 / 24 / 7);
    };
    this.getNumTimesSelected = function () {
        return this.numTimesSelected === '' ? 0 : this.numTimesSelected;
    };

    //Get as array corresponding to spreadsheet row
    this.toDataArray = function () {
        return [
            this.slackName,
            this.email,
            this.lastStandupRun,
            this.numTimesSelected,
            this.forceSelection ? this.forceSelection : '',
            this.forceOmission ? this.forceOmission : '',
            this.dmUcid
        ];
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Standupper
}