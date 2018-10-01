function Standupper(row, index) {
    this.id = (index + 1);
    this.slackName = row[0];
    this.email = row[1];
    this.lastStandupRun = row[2];
    this.numTimesSelected = row[3];
    this.forceSelection = row[4] !== '';
    // forceOmission: row[5] !== '',

    this.isForceSelected = function () {
        return this.forceSelection;
    };
    // isForceOmitted: function() {
    // },

    this.getNormalizedFrequencyScore = function () {
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

    this.getNormalizedProximityScore = function () {
        var maxNumWeeksSince = standuppers.reduce(function (acc, ele) {
            return Math.max(acc, ele.getNumWeeksSinceLastStandupRun());
        }, standuppers[0].getNumWeeksSinceLastStandupRun());

        return this.getNumWeeksSinceLastStandupRun() === maxNumWeeksSince ? 100 : (100 * this.getNumWeeksSinceLastStandupRun()) / maxNumWeeksSince;
    };
    this.getProbability = function () {
        return Math.floor((this.getNormalizedProximityScore() * 0.60) + (this.getNormalizedFrequencyScore() * 0.40));
    };
    this.getNumWeeksSinceLastStandupRun = function () {
        return Math.floor((new Date() - this.lastStandupRun) / 1000 / 60 / 60 / 24 / 7);
    };
    this.getNumTimesSelected = function () {
        return this.numTimesSelected === '' ? 0 : this.numTimesSelected;
    };

    //Get as array corresponding to spreadsheet row
    this.toDataArray = function () {
        return [this.slackName, this.email, this.lastStandupRun, this.numTimesSelected, this.forceSelection ? this.forceSelection : ''];
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {Standupper}
}