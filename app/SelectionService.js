var NUM_STANDUPPERS = 2;

function SelectionService(standupperService, algorithmService) {
    this.standupperService = standupperService;
    this.algorithmService = algorithmService;

    this.pickStanduppers = function () {
        var selected = [];

        var randomizedStanduppers = this.standupperService.getStanduppers()
            .sort(randomize);

        randomizedStanduppers.forEach(function (su) {
            if (su.isForceSelected() && selected.filter(onlyUnique).length < NUM_STANDUPPERS) {
                selected.push(su);
            }
        });

        while (selected.filter(onlyUnique).length < NUM_STANDUPPERS) {
            selected.push(this.algorithmService
                .selectRandomlyByWeight(randomizedStanduppers));
        }

        return selected.filter(onlyUnique);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {SelectionService}
}