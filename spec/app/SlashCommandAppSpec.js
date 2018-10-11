SlashCommandApp = require('../../app/SlashCommandApp');

describe('SlashCommandApp', () => {
    let subject;

    let commandParserSpy, stateServiceSpy, adminServiceSpy;

    beforeEach(() => {
        commandParserSpy = jasmine.createSpyObj('commandParser',
            ['parseCommand'],
        );

        stateServiceSpy = jasmine.createSpyObj('stateService',
            [
                'getSelectedStandupperNames',
                'getCurrentStandupDateString',
                'getRejectedStandupperNames',
                'recordRejection'
            ],
        );

        adminServiceSpy = jasmine.createSpyObj('adminService',
            ['checkIfAdmin'],
        );
        adminServiceSpy.checkIfAdmin.and.returnValue(true);

        subject = new SlashCommandApp(commandParserSpy, stateServiceSpy, adminServiceSpy)
    });

    describe('serviceAdminRequest', () => {
        it('returns not an admin error message if requesting user is not admin', () => {
            adminServiceSpy.checkIfAdmin.and.returnValue(false);
            const result = subject.serviceAdminRequest({
                command: '/notssbot',
                user_name: 'not-admin'
            });

            expect(adminServiceSpy.checkIfAdmin).toHaveBeenCalledWith('not-admin');
            expect(result).toEqual('Error: You need to be an admin to use this command.');
        });

        describe('when requester is an admin', () => {

            it('returns invalid command error message if command is not ssbot', () => {
                const result = subject.serviceAdminRequest({
                    command: '/notssbot'
                });

                expect(result).toEqual('Error: Invalid command.');
            });

            it('returns an parse failure error if text is not parseable', () => {
                commandParserSpy.parseCommand.and.returnValue(false);

                const result = subject.serviceAdminRequest({
                    command: '/ssbot',
                    text: 'not-correct'
                });

                expect(commandParserSpy.parseCommand).toHaveBeenCalledWith(
                    'not-correct'
                );
                expect(result).toEqual('Error: Failed to parse command text.');
            });

            it('returns an invalid action error if action is unknown', () => {
                commandParserSpy.parseCommand.and.returnValue({
                    action: 'unknown'
                });

                const result = subject.serviceAdminRequest({
                    command: '/ssbot',
                    text: 'unknown name1, name2'
                });

                expect(commandParserSpy.parseCommand).toHaveBeenCalledWith(
                    'unknown name1, name2'
                );
                expect(result).toEqual('Error: Invalid action.');
            });

            describe('doing a forceReject', () => {
                replaceStandupper = jasmine.createSpy('replaceStandupper');

                beforeEach(() => {
                    stateServiceSpy.getSelectedStandupperNames.and.returnValue([
                        'name1',
                        'name2'
                    ]);

                    stateServiceSpy.getRejectedStandupperNames.and.returnValue(
                        []
                    );

                });

                it('returns an invalid standupper error message any standupper is not selected', () => {
                    commandParserSpy.parseCommand.and.returnValue({
                        action: 'forceReject',
                        args: ['name1', 'name2', 'name3']
                    });

                    const result = subject.serviceAdminRequest({
                        command: '/ssbot',
                        text: 'forceReject name1 name2 name3'
                    });

                    expect(stateServiceSpy.getSelectedStandupperNames)
                        .toHaveBeenCalled();
                    expect(result).toContain('Error: Invalid standupper provided.');
                });

                it('returns an invalid standupper error message any standupper is already rejected', () => {
                    stateServiceSpy.getRejectedStandupperNames.and.returnValue(
                        ['name1']
                    );

                    commandParserSpy.parseCommand.and.returnValue({
                        action: 'forceReject',
                        args: ['name1', 'name2']
                    });

                    const result = subject.serviceAdminRequest({
                        command: '/ssbot',
                        text: 'forceReject name1 name2 name3'
                    });

                    expect(stateServiceSpy.getSelectedStandupperNames)
                        .toHaveBeenCalled();
                    expect(result).toContain('Error: Invalid standupper provided.');
                });

                it('replaces and records rejection for each standupper, returns a success message ', () => {
                    stateServiceSpy.getCurrentStandupDateString.and.returnValue(
                        '1/1/1000'
                    );

                    commandParserSpy.parseCommand.and.returnValue({
                        action: 'forceReject',
                        args: ['name1', 'name2']
                    });

                    const result = subject.serviceAdminRequest({
                        command: '/ssbot',
                        text: 'forceReject name1 name2 name3'
                    });

                    expect(stateServiceSpy.getSelectedStandupperNames)
                        .toHaveBeenCalled();
                    expect(replaceStandupper.calls.allArgs()).toEqual(
                        [
                            ['name1'],
                            ['name2']
                        ]
                    );
                    expect(stateServiceSpy.recordRejection.calls.allArgs()).toEqual(
                        [
                            ['name1'],
                            ['name2']
                        ]
                    );
                    expect(result).toEqual('Force rejecting for 1/1/1000: name1, name2');
                });
            });
        });
    });
});