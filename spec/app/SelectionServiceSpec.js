SelectionService = require('../../app/SelectionService').SelectionService;
AlgorithmService = require('../../app/AlgorithmService').AlgorithmService;
onlyUnique = require('../../app/Utilities').onlyUnique;

describe('SelectionService', () => {
    let subject;
    let standupperServiceSpy, algorithmServiceSpy;

    beforeEach(() => {
        standupperServiceSpy = jasmine.createSpyObj(
            'standupperService', ['getStanduppers']
        );

        algorithmServiceSpy = jasmine.createSpyObj(
            'algorithmService', ['selectRandomlyByWeight']
        );

        //force Array.sort(randomize) to just reverse order
        randomize = () => {
            return 1;
        };
        //

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
                const orderedResultNames = result.map((su) => {
                    return su.name;
                });
                expect(orderedResultNames).toEqual(['su3', 'su2'])
            });

            describe('when there are more than two forceSelected people', () => {
                it('randomly selects forceSelected people', () => {
                    suSpy1.isForceSelected.and.returnValue(true);
                    suSpy1.helper.and.returnValue(true);
                    suSpy2.isForceSelected.and.returnValue(true);
                    suSpy2.helper.and.returnValue(true);
                    suSpy3.isForceSelected.and.returnValue(true);
                    suSpy3.helper.and.returnValue(true);

                    const result = subject.pickStanduppers();

                    expect(result.length).toEqual(2);
                    const orderedResultNames = result.map(function (su) {
                        return su.name;
                    });
                    expect(orderedResultNames).toEqual(['su3', 'su2'])
                });
            });

        });


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

function TestStandupper(name) {
    this.name = name;
    this.isForceSelected = jasmine.createSpy(this.name + '.isForceSelected');
    this.helper = jasmine.createSpy(this.name + '.helper');
}

