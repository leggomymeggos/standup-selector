InteractiveButtonApp = require('../../app/InteractiveButtonApp');

describe('InteractiveButtonApp', () => {

    let subject;

    let stateServiceSpy, adminServiceSpy, selectionServiceSpy, standupperServiceSpy;

    beforeEach(() => {
        stateServiceSpy = jasmine.createSpyObj('stateService',
            [
                'validateCallbackId',
                'getRejectedStandupperNames',
                'recordRejection',
                'recordConfirmation',
                'getCurrentStandupDateString',
                'getConfirmedStandupperNames'
            ],
        );

        adminServiceSpy = jasmine.createSpyObj('adminService',
            [
                'messageAdmins'
            ],
        );

        selectionServiceSpy = jasmine.createSpyObj('selectionService',
            [
                'replaceStandupper'
            ],
        );

        standupperServiceSpy = jasmine.createSpyObj('standupperService',
            [
                'addConfirmation'
            ],
        );

        subject = new InteractiveButtonApp(stateServiceSpy, adminServiceSpy, selectionServiceSpy, standupperServiceSpy)
    });

    describe('respondToInteraction', () => {
        let payload;

        beforeEach(() => {
            payload = {
                type: 'interactive_message',
                actions: [
                    {
                        name: 'confirmation_option',
                        type: 'button',
                        value: 'yes-or-no'
                    }
                ],
                callback_id: 'person_1',
            };
        });

        afterEach(() => {
            expect(stateServiceSpy.validateCallbackId).toHaveBeenCalledWith('person_1')
        });

        describe('when for an invalid standup issuance', () => {
            beforeEach(() => {
                stateServiceSpy.validateCallbackId.and.returnValue(false);
            });
            it('should return an invalid issuance response message', () => {
                const response = subject.respondToInteraction(payload);

                expect(response).toEqual('This standup issuance you have responded to is for an older or invalid week.');
            });

        });

        describe('when for a valid standup issuance', () => {
            beforeEach(() => {
                stateServiceSpy.validateCallbackId.and.returnValue(true);
            });

            describe('when response is yes', () => {
                beforeEach(() => {
                    payload.actions[0].value = 'yes';
                    stateServiceSpy.getCurrentStandupDateString.and.returnValue('1/1');
                });

                it('should send correct response message according to state', () => {
                    var testCases = [
                        {
                            case: '\nwhen no current confirmations',
                            currentConfirmed: [],
                            expectedResponse: 'You have wisely accepted Standup bot\'s offer. You will help run standup the week of 1/1. Glory to Standup bot!',
                            confirmationIsExpected: true,
                        },
                        {
                            case: '\nwhen one previous confirmation',
                            currentConfirmed: ['person2'],
                            expectedResponse: 'You have wisely accepted Standup bot\'s offer. You will help run standup the week of 1/1. You will be running Standup with person2. Glory to Standup bot!',
                            confirmationIsExpected: true,
                        },
                        {
                            case: '\nwhen one previous confirmation, request is redundant',
                            currentConfirmed: ['person'],
                            expectedResponse: 'You are already confirmed to run standup the week of 1/1.',
                            confirmationIsExpected: false,
                        },
                        {
                            case: '\nwhen two previous confirmations, request is redundant',
                            currentConfirmed: ['person', 'person2'],
                            expectedResponse: 'You are already confirmed to run standup the week of 1/1.',
                            confirmationIsExpected: false,
                        },
                        {
                            case: '\nwhen two previous confirmations, request is extraneous/erroneous',
                            currentConfirmed: ['person2', 'person3'],
                            expectedResponse: 'There are already two people confirmed to run Standup this upcoming week.',
                            confirmationIsExpected: false,
                        },
                    ];

                    testCases.forEach((testCase) => {
                        stateServiceSpy.getConfirmedStandupperNames.and.returnValue(testCase.currentConfirmed);

                        var response = subject.respondToInteraction(payload);

                        expect(response).toBe(testCase.expectedResponse, testCase.case);


                        if (testCase.confirmationIsExpected) {
                            expect(stateServiceSpy.recordConfirmation).toHaveBeenCalledWith('person');
                            expect(standupperServiceSpy.addConfirmation).toHaveBeenCalledWith('person');
                            expect(adminServiceSpy.messageAdmins).toHaveBeenCalledWith(
                                '[ADMIN]: person has been confirmed to run standup the week of 1/1'
                            );
                        }
                    })
                });

            });
            describe('when response is no', () => {
                beforeEach(() => {
                    payload.actions[0].value = 'no'
                });

                afterEach(() => {
                    expect(stateServiceSpy.getRejectedStandupperNames).toHaveBeenCalled();
                });

                describe('when sender has already rejected', () => {
                    beforeEach(() => {
                        stateServiceSpy.getRejectedStandupperNames.and.returnValue(['person']);
                    });

                    it('should return a previous rejection response message', () => {
                        const response = subject.respondToInteraction(payload);

                        expect(response).toEqual('You have already rejected this standup issuance and will be replaced');
                    });
                });

                describe('when sender is rejecting for the first time', () => {
                    beforeEach(() => {
                        stateServiceSpy.getRejectedStandupperNames.and.returnValue([]);
                        stateServiceSpy.getCurrentStandupDateString.and.returnValue('1/1');
                    });

                    it('should record the rejection, message admins, and replace the standupper', () => {

                        const response = subject.respondToInteraction(payload);

                        expect(response).toEqual('You will be replaced...for running standup');
                        expect(stateServiceSpy.recordRejection).toHaveBeenCalledWith('person');
                        expect(stateServiceSpy.getCurrentStandupDateString).toHaveBeenCalled();
                        expect(adminServiceSpy.messageAdmins).toHaveBeenCalledWith(
                            '[ADMIN]: person has rejected their selection for running standup the week of 1/1'
                        );
                        expect(selectionServiceSpy.replaceStandupper).toHaveBeenCalledWith('person');
                    });
                });
            });
        });
    });
});