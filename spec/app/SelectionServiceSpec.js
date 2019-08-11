SelectionService = require('../../app/SelectionService');
AlgorithmService = require('../../app/AlgorithmService');
onlyUnique = require('../../app/Utilities').onlyUnique;
shuffle = require('../../app/Utilities').shuffle;


describe('SelectionService', () => {
    let subject;
    let standupperServiceSpy, algorithmServiceSpy;

    beforeEach(() => {
        standupperServiceSpy = jasmine.createSpyObj(
            'standupperService', ['getStanduppers', 'getSelectedStandupperNames', 'getRejectedStandupperNames', 'getOmittedStandupperNames']
        );

        algorithmServiceSpy = jasmine.createSpyObj(
            'algorithmService', ['selectRandomlyByWeight']
        );

        subject = new SelectionService(standupperServiceSpy, algorithmServiceSpy);
    });

    describe('when picking standuppers', () => {
        describe('handling forceSelection', () => {
            let suSpy1, suSpy2, suSpy3;

            beforeEach(() => {
                suSpy1 = new TestStandupper('su1');
                suSpy2 = new TestStandupper('su2');
                suSpy3 = new TestStandupper('su3');

                standupperServiceSpy.getStanduppers.and.returnValue(
                    [suSpy1, suSpy2, suSpy3]
                );
            });

            it('defers selection to forceSelected people', () => {
                suSpy2.isForceSelected.and.returnValue(true);
                suSpy3.isForceSelected.and.returnValue(true);

                const result = subject.pickStanduppers();

                expect(result.length).toEqual(2);
                const orderedResultNames = result.map((su) => su.name);
                expect(orderedResultNames).toContain('su2');
                expect(orderedResultNames).toContain('su3');
            });

            describe('when there are more than two forceSelected people', () => {
                it('randomly selects forceSelected people', () => {
                    suSpy1.isForceSelected.and.returnValue(true);
                    suSpy2.isForceSelected.and.returnValue(true);
                    suSpy3.isForceSelected.and.returnValue(true);

                    const result1 = subject.pickStanduppers();
                    expect(result1.length).toEqual(2);

                    const result2 = subject.pickStanduppers();
                    expect(result2.length).toEqual(2);

                    const result1Names = result1.map((su) => su.name);
                    const result2Names = result2.map((su) => su.name);
                    expect(result1Names.join()).not.toEqual(result2Names.join())
                });
            });
        });

        describe('handling forceOmission', () => {
            beforeEach(() => {
                suSpy1 = new TestStandupper('su1');
                suSpy2 = new TestStandupper('su2');
                suSpy3 = new TestStandupper('su3');

                standupperServiceSpy.getStanduppers.and.returnValue(
                    [suSpy1, suSpy2, suSpy3]
                );
            });

            it('should not select standuppers that are forceOmitted', () => {
                suSpy2.isForceOmitted.and.returnValue(true);

                algorithmServiceSpy.selectRandomlyByWeight.and.returnValues(
                    suSpy2,
                    suSpy2,
                    suSpy3,
                    suSpy1
                );

                const result = subject.pickStanduppers();

                expect(result.length).toEqual(2);
                const orderedResultNames = result.map((su) => {
                    return su.name;
                });
                expect(orderedResultNames).toEqual(['su3', 'su1'])
            });
        });

        describe('filling the pool randomly', () => {
            it('randomly selects standuppers by weight until two unique ones are found', () => {
                let suSpy1 = new TestStandupper('su1');
                let suSpy2 = new TestStandupper('su2');
                let suSpy3 = new TestStandupper('su3');
                let suSpy4 = new TestStandupper('su4');

                standupperServiceSpy.getStanduppers.and.returnValue(
                    [suSpy1, suSpy2, suSpy3, suSpy4]
                );

                algorithmServiceSpy.selectRandomlyByWeight.and.returnValues(
                    suSpy3,
                    suSpy3,
                    suSpy3,
                    suSpy4
                );

                const result = subject.pickStanduppers();

                expect(result).toEqual([suSpy3, suSpy4]);
                expect(algorithmServiceSpy.selectRandomlyByWeight.calls.count()).toEqual(4);
            });
        });
    });

    describe('when rejecting standuppers', () => {
        let suSpy1, suSpy2, suSpy3;

        beforeEach(() => {
            suSpy1 = new TestStandupper('su1');
            suSpy2 = new TestStandupper('su2');
            suSpy3 = new TestStandupper('su3');

            standupperServiceSpy.getStanduppers.and.returnValue([
                suSpy1, suSpy2, suSpy3
            ]);
            standupperServiceSpy.getRejectedStandupperNames.and.returnValue([]);
            standupperServiceSpy.getOmittedStandupperNames.and.returnValue([]);
            standupperServiceSpy.getSelectedStandupperNames.and.returnValue([]);
        });
        it('does not pick a standupper who has rejected', () => {
            algorithmServiceSpy.selectRandomlyByWeight.and.returnValue([
                suSpy2, suSpy2, suSpy3
            ]);
            standupperServiceSpy.getRejectedStandupperNames.and.returnValue([suSpy2.name]);

            var replacementStandupper = subject.replaceStandupper();

            expect(replacementStandupper).not.toContain(suSpy2);
        });

        it('does not pick a standupper who is already selected', () => {
            algorithmServiceSpy.selectRandomlyByWeight.and.returnValue([
                suSpy1, suSpy2
            ]);
            standupperServiceSpy.getSelectedStandupperNames.and.returnValue(
                [suSpy1.name]
            );

            var replacementStandupper = subject.replaceStandupper();

            expect(replacementStandupper).not.toContain(suSpy1);
        });

        it('does not pick an omitted standupper', () => {
            algorithmServiceSpy.selectRandomlyByWeight.and.returnValue([
                suSpy3, suSpy1
            ]);
            standupperServiceSpy.getOmittedStandupperNames.and.returnValue([suSpy3.name]);
            var replacementStandupper = subject.replaceStandupper();

            expect(replacementStandupper).not.toContain(suSpy3);
        });
    });
});

function TestStandupper(name) {
    this.name = name;
    this.isForceSelected = jasmine.createSpy(this.name + '.isForceSelected');
    this.isForceOmitted = jasmine.createSpy(this.name + '.isForceOmitted');
}

