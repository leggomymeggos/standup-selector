AdminService = require('../../app/AdminService');
Admin = require('../../app/Admin');

describe('AdminService', () => {
    let subject;
    let messagingServiceSpy, adminSheetSpy, stateServiceSpy;

    beforeEach(() => {
        messagingServiceSpy = jasmine.createSpyObj('notifcation',
            ['notify']
        );

        adminSheetSpy = jasmine.createSpyObj('adminSheet',
            ['getDataValues']
        );

        adminSheetSpy.getDataValues.and.returnValue([
            ['email1'],
            ['email2'],
            ['email3']
        ]);

        stateServiceSpy = jasmine.createSpyObj('stateService',
            [
                'getConfirmedStandupperNames',
                'getCurrentStandupDateString',
                'getRejectedStandupperNames',
                'getSelectedStandupperNames'
            ],
        );

        subject = new AdminService(messagingServiceSpy, adminSheetSpy, stateServiceSpy);
    });

    it('messageAdmins the expected admins with the correct message', () => {
        subject.messageAdmins('msg');

        expect(messagingServiceSpy.notify.calls.count()).toEqual(3);
        expect(messagingServiceSpy.notify.calls.allArgs())
            .toEqual([
                [new Admin(['email1']), 'msg'],
                [new Admin(['email2']), 'msg'],
                [new Admin(['email3']), 'msg']
            ]);
    });

    describe('sendAdminUpdate', () => {
        beforeEach(() => {
            stateServiceSpy.getCurrentStandupDateString.and.returnValue(
                '1/1/1000'
            );

            stateServiceSpy.getConfirmedStandupperNames.and.returnValue(
                ['confirmed1', 'confirmed2']
            );

            stateServiceSpy.getRejectedStandupperNames.and.returnValue(
                ['rejected1', 'rejected2']
            );

            stateServiceSpy.getSelectedStandupperNames.and.returnValue(
                ['selected1', 'selected2', 'rejected1', 'rejected2']
            )
        });

        it('messages each admin the current confirmed standuppers', () => {
            subject.sendAdminUpdate();
            const expectedMessage = '[ADMIN][1/1/1000] Current confirmed: confirmed1, confirmed2';

            expect(messagingServiceSpy.notify.calls.allArgs())
                .toEqual(jasmine.arrayContaining([
                    [new Admin(['email1']), expectedMessage],
                    [new Admin(['email2']), expectedMessage],
                    [new Admin(['email3']), expectedMessage]
                ]));
        });

        it('messages each admin the current rejected standuppers', () => {
            subject.sendAdminUpdate();
            const expectedMessage = '[ADMIN][1/1/1000] Current rejected: rejected1, rejected2';

            expect(messagingServiceSpy.notify.calls.allArgs())
                .toEqual(jasmine.arrayContaining([
                    [new Admin(['email1']), expectedMessage],
                    [new Admin(['email2']), expectedMessage],
                    [new Admin(['email3']), expectedMessage]
                ]));
        });

        it('messages each admin the standuppers who have yet to respond', () => {
            subject.sendAdminUpdate();
            const expectedMessage = '[ADMIN][1/1/1000] Awaiting Response From: selected1, selected2';

            expect(messagingServiceSpy.notify.calls.allArgs())
                .toEqual(jasmine.arrayContaining([
                    [new Admin(['email1']), expectedMessage],
                    [new Admin(['email2']), expectedMessage],
                    [new Admin(['email3']), expectedMessage]
                ]));
        });

        it('sends the correct number of total messages', () => {
            subject.sendAdminUpdate();

            expect(messagingServiceSpy.notify.calls.count()).toEqual(9);
        });
    });
});