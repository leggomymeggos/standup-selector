StandupperService = require('../../app/StandupperService').StandupperService;
Standupper = require('../../app/Standupper').Standupper;

describe('StandupperService', () => {
    let subject;
    let gStandupperSheetSpy;

    beforeEach(() => {
        gStandupperSheetSpy = jasmine.createSpyObj('suSheet',
            ['getDataValues']
        );

        subject = new StandupperService(gStandupperSheetSpy);
    });

    it('getStanduppers builds standuppers from sheet', () => {
        const expectedData = [
            ['name1', 'email1', '1/1/1000', '1', 'Y'],
            ['name2', 'email2', '2/2/2000', '2', 'Y'],
            ['name3', 'email3', '3/3/3000', '3', 'Y']
        ];

        gStandupperSheetSpy.getDataValues.and.returnValue(expectedData);

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