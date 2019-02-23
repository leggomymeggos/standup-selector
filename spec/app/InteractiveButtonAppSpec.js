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
                'getCurrentStandupDateString'
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
                'addConfirmationForStandupper'
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
                    payload.actions[0].value = 'yes'
                });

                it('should send correct response message according to state', () => {


                });

                fdescribe('when confirmation is valid', () => {
                    it('should record the confirmation and message admins', () => {
                        subject.respondToInteraction(payload);

                        expect(stateServiceSpy.recordConfirmation).toHaveBeenCalledWith('person');
                        expect(standupperServiceSpy.addConfirmationForStandupper).toHaveBeenCalledWith('person');
                        expect(adminServiceSpy.messageAdmins).toHaveBeenCalledWith('');
                    });
                });

                describe('confirmation is redundant', () => {

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