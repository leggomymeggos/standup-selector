function SelectionService(standupperService, algorithmService) {
    this.standupperService = standupperService;
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

    this.replaceStandupper = function (nameToReplace) {

    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SelectionService
}