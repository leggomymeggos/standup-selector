StandupperService = require('../../app/StandupperService').StandupperService;
Standupper = require('../../app/Standupper').Standupper;

describe('StandupperService', () => {
    let subject;
    let standupperSheetSpy;

    beforeEach(() => {
        standupperSheetSpy = jasmine.createSpyObj('suSheet',
            ['getDataValues', 'setDataValues']
        );

        const expectedData = [
            ['name1', 'email1', '1/1/1000', 1, 'Y'],
            ['name2', 'email2', '2/2/2000', 2, 'Y'],
            ['name3', 'email3', '3/3/3000', 3, 'Y']
        ];

        standupperSheetSpy.getDataValues.and.returnValue(expectedData);

        subject = new StandupperService(standupperSheetSpy);
    });

    it('addConfirmation writes new date to third column', () => {
        getNextMonday = () => {return new Date('5/5/5000');};

        subject.addConfirmationForStandupper({ id: 1});

        expect(standupperSheetSpy.setDataValues)
            .toHaveBeenCalledWith([
                ['name1', 'email1', '5/5/5000', 1, 'Y'],
                ['name2', 'email2', '2/2/2000', 2, 'Y'],
                ['name3', 'email3', '3/3/3000', 3, 'Y']
            ])
    });

    it('incrementSelection increments 4th column', () => {
        subject.incrementSelection({ id: 1});

        expect(standupperSheetSpy.setDataValues)
            .toHaveBeenCalledWith([
                ['name1', 'email1', '1/1/1000', 2, 'Y'],
                ['name2', 'email2', '2/2/2000', 2, 'Y'],
                ['name3', 'email3', '3/3/3000', 3, 'Y']
            ])
    });

    it('getStanduppers builds standuppers from sheet', () => {
        const actual = subject.getStanduppers();

        expect(actual.length).toEqual(3);
        expect(actual[0].id).toEqual(1);
        expect(actual[0].slackName).toEqual('name1');
        expect(actual[1].id).toEqual(2);
        expect(actual[1].slackName).toEqual('name2');
        expect(actual[2].id).toEqual(3);
        expect(actual[2].slackName).toEqual('name3');
    });
});