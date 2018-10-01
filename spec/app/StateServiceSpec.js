StateService = require('../../app/StateService').StateService;

describe('StateService', () => {
    let subject;
    let stateSheetSpy;
    let fakeNextMonday;

    beforeEach(() => {
        stateSheetSpy = jasmine.createSpyObj('adminSheet',
            ['getDataValues', 'addNewRow', 'getLastRowNum']
        );

        fakeNextMonday = new Date('1/1/1000');

        getNextMonday = () => {
            return fakeNextMonday;
        };

        subject = new StateService(stateSheetSpy);
    });

    it('createNewStandup adds new standup row with id', () => {
        let selectedStanduppers = [
            { slackName: 'name1' },
            { slackName: 'name2' },
            { slackName: 'name3' }
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


});