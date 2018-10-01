AdminService = require('../../app/AdminService').AdminService

describe('AdminService', () => {
    let subject;
    let notificationServiceSpy;

    beforeEach(() =>{
        notificationServiceSpy = jasmine.createSpyObj('notifcation',
            ['notify']
        );

        subject = new AdminService(notificationServiceSpy);
    });

    describe('notifications', () => {
        it('notifySelection sends msg of selection', () => {
            let admins = [1, 2, 3];
            subject.messageAdmins(admins, 'msg');

            expect(notificationServiceSpy.notify.calls.count()).toEqual(3);
            expect(notificationServiceSpy.notify.calls.allArgs())
                .toEqual([
                    [1, 'msg'],
                    [2, 'msg'],
                    [3, 'msg']
                ]);
        });
    });
});