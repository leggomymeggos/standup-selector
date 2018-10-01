AdminService = require('../../app/AdminService').AdminService

describe('AdminService', () => {
    let subject;
    let messagingServiceSpy;

    beforeEach(() =>{
        messagingServiceSpy = jasmine.createSpyObj('notifcation',
            ['notify']
        );

        subject = new AdminService(messagingServiceSpy);
    });

    describe('notifications', () => {
        it('notifySelection sends msg of selection', () => {
            let admins = [1, 2, 3];
            subject.messageAdmins(admins, 'msg');

            expect(messagingServiceSpy.notify.calls.count()).toEqual(3);
            expect(messagingServiceSpy.notify.calls.allArgs())
                .toEqual([
                    [1, 'msg'],
                    [2, 'msg'],
                    [3, 'msg']
                ]);
        });
    });
});