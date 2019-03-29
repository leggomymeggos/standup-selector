var fs = require('fs');
HandleRequest = require('../../../app/Router');
TestUtil = require('./TestEnvironmentUtil');

describe('SlashCommandApp Integration Test', () => {
    let stateGSheet, adminGSheet, standupperGSheet;

    beforeEach(() => {
        let setup = new TestUtil.TestEnvBuilder();

        //email::slackName
        let adminSheetData = [
            ['email', 'slackName'],
            ['admin1@admin.com', 'adminPerson1'],
            ['admin2@admin.com', 'adminPerson2']
        ];
        //issuance date::first-confirmed::second-confirmed::selected::rejected
        let stateSheetData = [
            ['issuance date', 'first-confirmed', 'second-confirmed', 'selected', 'rejected', '1'],
            [new Date('9/10/2018'), 'standupPerson4', 'standupPerson1', 'standupPerson4, standupPerson1, standupPerson2', 'standupPerson2', '2'],
            [new Date('12/10/2018'), 'standupPerson4', 'standupPerson1', 'standupPerson4, standupPerson1, standupPerson2', 'standupPerson2', '3'],
            [new Date('10/29/2018'), 'standupPerson4', 'standupPerson2', 'standupPerson4, standupPerson1, standupPerson2', 'standupPerson1', '4'],
            [new Date('12/13/2018'), '', '', 'standupPerson1, standupPerson2', '', '5']
        ];

        //slackName::email::lastConfirmedDate::numberOfStandupsRun::forceSelect::forceOmit
        let standupperSheetData = [
            ['slackName', 'email', 'lastConfirmedDate', 'numStandupsRun', 'forceSelect', 'forceOmit'],
            ['standupPerson1', 'standupper1@email.com', '9/10/2018', '1', '', ''],
            ['standupPerson2', 'standupper2@email.com', '12/10/2018', '2', '', ''],
            ['standupPerson3', 'standupper3@email.com', '10/29/2018', '', 'Y', ''],
            ['standupPerson4', 'standupper4@email.com', '11/19/2018', '3', '', 'Y']
        ];

        stateGSheet = new TestUtil.FakeGSheet(stateSheetData);
        adminGSheet = new TestUtil.FakeGSheet(adminSheetData);
        standupperGSheet = new TestUtil.FakeGSheet(standupperSheetData);

        setup
            .addScriptProperty("STATE_SHEET_NAME", "stateSheet")
            .addScriptProperty("ADMIN_SHEET_NAME", "adminSheet")
            .addScriptProperty("STANDUPPER_SHEET_NAME", "standupperSheet")
            .addScriptProperty("SLACK_CALLBACK_TOKEN", "token")
            .addScriptProperty("SLACK_URL_OPEN_IM", "openImUrl")
            .addScriptProperty("SLACK_URL_USER_INFO_BY_EMAIL", "userInfoByEmailUrl")
            .addScriptProperty("SLACK_URL_POST_MESSAGE", "postMessageUrl")
            .configureGSheets(stateGSheet, adminGSheet, standupperGSheet)
            .build();
    });

    describe('a help command is sent', () => {
        it('should return a help response', () => {
            const helpRequest = JSON.parse(fs.readFileSync('spec/app/integration/slashCommands/helpRequest.json', 'utf8'));
            const response = HandleRequest(helpRequest);
            const expectedResponse = JSON.parse(fs.readFileSync('spec/app/integration/slashCommands/helpResponse.json', 'utf8'));
            expect(JSON.parse(response.payload)).toEqual(expectedResponse);
        });
    });

    describe('a reject command is sent', () => {
        it('should reject the person specified', () => {
            const rejectCallback = JSON.parse(fs.readFileSync('spec/app/integration/slashCommands/rejectRequest.json', 'utf8'));
            const response = HandleRequest(rejectCallback);

            expect(JSON.parse(response.payload)).toEqual({
                text: 'Force rejecting for 12/13/2018: standupPerson1'
            })
        });

        it('should not reject an inelligible person', () => {
            const rejectCallback = JSON.parse(fs.readFileSync('spec/app/integration/slashCommands/rejectRequest.json', 'utf8'));
            rejectCallback.parameter.text = "forceReject does-not-exist";

            const response = HandleRequest(rejectCallback);

            expect(JSON.parse(response.payload)).toEqual({
                text: 'Error: Invalid standupper(s) provided. Check to make sure they are currently selected and not already rejected.'
            })
        });
    });

});
