StandupperService = require('../../app/StandupperService');
Standupper = require('../../app/Standupper');

describe('StandupperService', () => {
    let subject;
    let standupperSheetSpy;

    beforeEach(() => {
        standupperSheetSpy = jasmine.createSpyObj('suSheet',
            ['getDataValues', 'setDataValues']
        );

        const expectedData = [
            ['name1', 'email1', '1/1/1000', 1, '', ''],
            ['name2', 'email2', '2/2/2000', 2, '', ''],
            ['name3', 'email3', '3/3/3000', 3, '', '']
        ];

        standupperSheetSpy.getDataValues.and.returnValue(expectedData);

        subject = new StandupperService(standupperSheetSpy);
    });

    it('addConfirmation writes new date to third column for standupper', () => {
        getNextMonday = () => {return new Date('5/5/5000');};

        subject.addConfirmation('name1');

        expect(standupperSheetSpy.setDataValues)
            .toHaveBeenCalledWith([
                ['name1', 'email1', '5/5/5000', 1, '', ''],
                ['name2', 'email2', '2/2/2000', 2, '', ''],
                ['name3', 'email3', '3/3/3000', 3, '', '']
            ])
    });

    it('incrementSelection increments 4th column for standupper', () => {
        subject.incrementSelection({ id: 1});

        expect(standupperSheetSpy.setDataValues)
            .toHaveBeenCalledWith([
                ['name1', 'email1', '1/1/1000', 2, '', ''],
                ['name2', 'email2', '2/2/2000', 2, '', ''],
                ['name3', 'email3', '3/3/3000', 3, '', '']
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

    it('getOmittedStandupperNames returns list of omitted names', () => {
        const expectedData = [
            ['name1', 'email1', '1/1/1000', 1, '', ''],
            ['name2', 'email2', '2/2/2000', 2, '', 'Y'],
            ['name3', 'email3', '3/3/3000', 3, '', 'Y']
        ];

        standupperSheetSpy.getDataValues.and.returnValue(expectedData);

        const actual = subject.getOmittedStandupperNames();

        expect(actual).toEqual(['name2', 'name3']);
    });

    it('saveStanduppers writesStandupperData to sheet', () => {
        var standupperData = [
            'slackName',
            'email',
            'lastStandupRun',
            'numTimesSelected',
            true,
            true,
            'dmUcid'
        ];

        const updatedStandupper = new Standupper(standupperData);

        subject.saveStandupper(updatedStandupper);

        expect(standupperSheetSpy.setDataValues)
            .toHaveBeenCalledWith(standupperData);

    });
});