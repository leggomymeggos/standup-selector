AdminService = require('../../app/AdminService');
Admin = require('../../app/Admin');

describe('AdminService', () => {
    let subject;
    let messagingServiceSpy, adminSheetSpy;

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

        subject = new AdminService(messagingServiceSpy, adminSheetSpy);
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
});