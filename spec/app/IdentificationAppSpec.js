IdentificationApp = require('../../app/IdentificationApp');

describe('IdentificationApp', () => {
    let subject;

    let standupperServiceSpy, userInfoServiceSpy;

    beforeEach(() => {
        standupperServiceSpy = jasmine.createSpyObj('standupperService',
            ['getStanduppers', 'saveStandupper'],
        );

        userInfoServiceSpy = jasmine.createSpyObj('userInfoService',
            ['getUserInfo'],
        );

        subject = new IdentificationApp(standupperServiceSpy, userInfoServiceSpy);
    });

    describe('identifyStanduppers', () => {
        it('retrieves information for unknown standuppers and saves it', () => {
            standupperServiceSpy.getStanduppers.and.returnValue([
                {email: 'email1', slackName: 'name1'},
                {email: 'email2', slackName: ''},
                {email: 'email3', slackName: 'name3'},
                {email: 'email4', slackName: ''}
            ]);

            userInfoServiceSpy.getUserInfo.and.returnValues(
                {user: {name: 'name2'}},
                {user: {name: 'name4'}}
            );

            subject.identifyStanduppers();

            expect(standupperServiceSpy.getStanduppers)
                .toHaveBeenCalled();

            expect(userInfoServiceSpy.getUserInfo.calls.allArgs())
                .toEqual([['email2'], ['email4']]);

            expect(standupperServiceSpy.saveStandupper.calls.allArgs())
                .toEqual([
                    [{email: 'email2', slackName: 'name2'}],
                    [{email: 'email4', slackName: 'name4'}]
                ])
        });
    });
});