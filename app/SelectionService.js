function SelectionService(standupperService, stateService, algorithmService) {
    this.standupperService = standupperService;
    this.stateService = stateService;
    this.algorithmService = algorithmService;

    this.pickStanduppers = function () {
        var selected = [];

        var randomizedStanduppers = shuffle(this.standupperService.getStanduppers());

        randomizedStanduppers.forEach(function (su) {
            if (su.isForceSelected() && selected.filter(onlyUnique).length < 2) {
                selected.push(su);
            }
        });

        while (selected.filter(onlyUnique).length < 2) {
            var nextSelected = this.algorithmService
                .selectRandomlyByWeight(randomizedStanduppers);

            if (nextSelected && !selected.includes(nextSelected) && !nextSelected.isForceOmitted()) {
                selected.push(nextSelected);
            }
        }

        return selected.filter(onlyUnique);
    };

    this.replaceStandupper = function () {
        var standuppers = this.standupperService.getStanduppers();
        var rejected = this.stateService.getRejectedStandupperNames();
        var alreadySelected = this.stateService.getSelectedStandupperNames();
        var forceOmitted = this.standupperService.getOmittedStandupperNames();
        var newSelections = [];

        while (newSelections
            .filter(function (e) {
                return !rejected.includes(e.slackName) && !alreadySelected.includes(e.slackName) && !forceOmitted.includes(e.slackName);
            }).length < 1) {
            newSelections.push(this.algorithmService.selectRandomlyByWeight(standuppers));
        }

        return newSelections.filter(function (e) {
            return !rejected.includes(e.slackName) && !alreadySelected.includes(e.slackName) && !forceOmitted.includes(e.slackName);
        }).slice(0, 1);
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SelectionService
}