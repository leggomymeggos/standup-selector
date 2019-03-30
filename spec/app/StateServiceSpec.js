StateService = require('../../app/StateService');

describe('StateService', () => {
    let subject;
    let stateSheetSpy;
    let fakeNextMonday;

    beforeEach(() => {
        stateSheetSpy = jasmine.createSpyObj('stateSheet',
            [
                'getDataValues',
                'addNewRow',
                'getLastRowNum',
                'setDataValues',
                'getLatestState'
            ]
        );

        fakeNextMonday = new Date(new Date('1/1/1000'));

        getNextMonday = () => {
            return fakeNextMonday;
        };

        subject = new StateService(stateSheetSpy);
    });

    it('createNewStandup adds new standup row with id', () => {
        let selectedStanduppers = [
            {slackName: 'name1'},
            {slackName: 'name2'},
            {slackName: 'name3'}
        ];

        stateSheetSpy.getLastRowNum.and.returnValue(5);

        subject.createNewStandup(selectedStanduppers);

        expect(stateSheetSpy.addNewRow).toHaveBeenCalledWith([
            fakeNextMonday.toLocaleDateString(),
            'not-confirmed',
            'not-confirmed',
            'name1, name2, name3',
            '',
            5
        ]);
    });

    it('getConfirmedStandupperNames returns current confirmed names and updates state sheet', () => {
        stateSheetSpy.getDataValues.and.returnValue([
            [new Date('1/1/1000'), 'not-confirmed', 'not-confirmed', '', '', 2]
        ]);

        let actual = subject.getConfirmedStandupperNames();
        expect(actual).toEqual([]);

        stateSheetSpy.getDataValues.and.returnValue([
            [new Date('1/1/1000'), 'person1', 'not-confirmed', '', '', 2]
        ]);
        actual = subject.getConfirmedStandupperNames();
        expect(actual).toEqual(['person1']);

        stateSheetSpy.getDataValues.and.returnValue([
            [new Date('1/1/1000'), 'person1', 'person2', '', '', 2]
        ]);
        actual = subject.getConfirmedStandupperNames();
        expect(actual).toEqual(['person1', 'person2']);
        expect(stateSheetSpy.getLatestState).toHaveBeenCalled();
    });

    it('getRejectedStandupperNames returns column five and updates state sheet', () => {
        stateSheetSpy.getDataValues.and.returnValue([
            [new Date('1/1/1000'), 'not-confirmed', 'not-confirmed', '', 'name1, name2', 2]
        ]);

        const actual = subject.getRejectedStandupperNames();

        expect(actual).toEqual(['name1', 'name2']);
        expect(stateSheetSpy.getLatestState).toHaveBeenCalled();
    });

    it('getSelectedStandupperNames returns column four and updates state sheet', () => {
        stateSheetSpy.getDataValues.and.returnValue([
            [new Date('1/1/1000'), 'not-confirmed', 'not-confirmed', 'name1, name2', '', 2]
        ]);

        const actual = subject.getSelectedStandupperNames();

        expect(actual).toEqual(['name1', 'name2']);
        expect(stateSheetSpy.getLatestState).toHaveBeenCalled();
    });

    it('getCurrentStandupDateString returns column one and updates state sheet', () => {
        stateSheetSpy.getDataValues.and.returnValue([
            [new Date('1/1/1000'), 'not-confirmed', 'not-confirmed', 'name1, name2', '', 2]
        ]);

        const actual = subject.getCurrentStandupDateString();

        expect(actual).toEqual('1/1/1000');
        expect(stateSheetSpy.getLatestState).toHaveBeenCalled();
    });

    it('getCurrentStandupDateString handles empty column one values', () => {
        stateSheetSpy.getDataValues.and.returnValue([
            ['', 'not-confirmed', 'not-confirmed', 'name1, name2', '', 2]
        ]);

        const actual = subject.getCurrentStandupDateString();

        expect(actual).toEqual('');
        expect(stateSheetSpy.getLatestState).toHaveBeenCalled();
    });

    describe('recordConfirmation', () => {
        it('writes name to column two when nobody is confirmed', () => {
            stateSheetSpy.getDataValues.and.returnValue([
                [new Date('1/1/1000'), 'not-confirmed', 'not-confirmed', '', '', 2]
            ]);

            subject.recordConfirmation('name1');

            expect(stateSheetSpy.setDataValues)
                .toHaveBeenCalledWith([
                    [new Date('1/1/1000'), 'name1', 'not-confirmed', '', '', 2]
                ]);
        });

        it('writes name to column three when someone is already confirmed', () => {
            stateSheetSpy.getDataValues.and.returnValue([
                [new Date('1/1/1000'), 'name1', 'not-confirmed', '', '', 2]
            ]);

            subject.recordConfirmation('name2');

            expect(stateSheetSpy.setDataValues)
                .toHaveBeenCalledWith([
                    [new Date('1/1/1000'), 'name1', 'name2', '', '', 2]
                ]);
        });

        it('does nothing if two people are already confirmed', () => {
            stateSheetSpy.getDataValues.and.returnValue([
                [new Date('1/1/1000'), 'name1', 'name2', '', '', 2]
            ]);

            subject.recordConfirmation('name3');

            expect(stateSheetSpy.setDataValues)
                .not.toHaveBeenCalled();
        });
    });

    describe('recordRejection', () => {
        it('writes name to column five when initial rejection', () => {
            stateSheetSpy.getDataValues.and.returnValue([
                [new Date('1/1/1000'), 'name1', 'not-confirmed', '', '', 2]
            ]);

            subject.recordRejection('name1');

            expect(stateSheetSpy.setDataValues)
                .toHaveBeenCalledWith([
                    [new Date('1/1/1000'), 'name1', 'not-confirmed', '', 'name1', 2]
                ]);
        });

        it('appends name to column five on when an additional rejection occurs', () => {
            stateSheetSpy.getDataValues.and.returnValue([
                [new Date('1/1/1000'), 'name1', 'not-confirmed', '', 'name1', 2]
            ]);

            subject.recordRejection('name2');

            expect(stateSheetSpy.setDataValues)
                .toHaveBeenCalledWith([
                    [new Date('1/1/1000'), 'name1', 'not-confirmed', '', 'name1, name2', 2]
                ]);
        });
    });

    describe('recordSelection', () => {
        it('writes name to column four when initial selection', () => {
            stateSheetSpy.getDataValues.and.returnValue([
                [new Date('1/1/1000'), 'not-confirmed', 'not-confirmed', '', '', 2]
            ]);

            subject.recordSelection('name1');

            expect(stateSheetSpy.setDataValues)
                .toHaveBeenCalledWith([
                    [new Date('1/1/1000'), 'not-confirmed', 'not-confirmed', 'name1', '', 2]
                ]);
        });

        it('appends name to column four when an additional selection occurs', () => {
            stateSheetSpy.getDataValues.and.returnValue([
                [new Date('1/1/1000'), 'not-confirmed', 'not-confirmed', 'name1, name2', '', 2]
            ]);

            subject.recordSelection('name3');

            expect(stateSheetSpy.setDataValues)
                .toHaveBeenCalledWith([
                    [new Date('1/1/1000'), 'not-confirmed', 'not-confirmed', 'name1, name2, name3', '', 2]
                ]);
        });

    });

    describe('validateCallbackId', () => {
        it('returns whether the provided callback id is valid', () => {
            stateSheetSpy.getLastRowNum.and.returnValue(1);
            let result = subject.validateCallbackId('callbackName_1');
            expect(result).toBe(true);

            stateSheetSpy.getLastRowNum.and.returnValue(5);
            result = subject.validateCallbackId('callbackName_1');
            expect(result).toBe(false);
        });
    });
});