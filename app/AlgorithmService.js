function AlgorithmService() {
    this.selectRandomlyByWeight = (randomProbables) => {
        var totalWeight = randomProbables.reduce(function (acc, ele) {
            return acc + ele.getProbability();
        }, 0);

        var random = Math.floor(Math.random() * totalWeight) + 1;

        var selected = false;

        standuppers.slice().sort(randomize).some(function (standupper) {
            random -= standupper.getProbability();

            if (random <= 0) {
                selected = standupper;
                return true;
            } else {
                return false;
            }
        });

        return selected;
    };
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AlgorithmService;
}