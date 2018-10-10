SlashCommandApp = require('../../app/SlashCommandApp');

describe('SlashCommandApp', () => {
    let subject;

    let commandParserSpy, stateServiceSpy;

    beforeEach(() => {
        commandParserSpy = jasmine.createSpyObj('commandParser',
            ['parse'],
        );

        stateServiceSpy = jasmine.createSpyObj('stateService',
            [
                'getSelectedStandupperNames',
                'getCurrentStandupDateString',
                'getRejectedStandupperNames'
            ],
        );

        subject = new SlashCommandApp(commandParserSpy, stateServiceSpy)
    });

    describe('serviceAdminRequest', () => {
        it('returns invalid command error message if command is not ssbot', () => {
            const result = subject.serviceAdminRequest({
                command: '/notssbot'
            });

            expect(result).toEqual('Error: Invalid command.');
        });

        it('returns an parse failure error if text is not parseable', () => {
            commandParserSpy.parse.and.returnValue(false);

            const result = subject.serviceAdminRequest({
                command: '/ssbot',
                text: 'not-correct'
            });

            expect(commandParserSpy.parse).toHaveBeenCalledWith(
                'not-correct'
            );
            expect(result).toEqual('Error: Failed to parse command text.');
        });

        it('returns an invalid action error if action is unknown', () => {
            commandParserSpy.parse.and.returnValue({
                action: 'unknown'
            });

            const result = subject.serviceAdminRequest({
                command: '/ssbot',
                text: 'unknown name1, name2'
            });

            expect(commandParserSpy.parse).toHaveBeenCalledWith(
                'unknown name1, name2'
            );
            expect(result).toEqual('Error: Invalid action.');
        });

        describe('forceReject', () => {
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
                commandParserSpy.parse.and.returnValue({
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

                commandParserSpy.parse.and.returnValue({
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

            it('replacesStandupper and returns a success message ', () => {
                stateServiceSpy.getCurrentStandupDateString.and.returnValue(
                    '1/1/1000'
                );

                commandParserSpy.parse.and.returnValue({
                    action: 'forceReject',
                    args: ['name1', 'name2']
                });

                const result = subject.serviceAdminRequest({
                    command: '/ssbot',
                    text: 'forceReject name1 name2 name3'
                });

                expect(stateServiceSpy.getSelectedStandupperNames)
                    .toHaveBeenCalled();
                expect(result).toEqual('Force rejecting for 1/1/1000: name1, name2');
            });
        });
    });
});