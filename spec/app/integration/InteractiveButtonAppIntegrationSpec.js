var fs = require('fs');
HandleRequest = require('../../../app/Router');
TestUtil = require('./TestEnvironmentUtil');

describe('InteractiveButtonApp Integration Test', () => {
    let stateGSheet, adminGSheet, standupperGSheet;

    beforeEach(() => {
        let setup = new TestUtil.TestEnvBuilder();

        //email::slackName::dmUcid
        let adminSheetData = [
            ['email', 'slackName'],
            ['admin1@admin.com', 'adminPerson1', 'dmUcidAdmin1'],
            ['admin2@admin.com', 'adminPerson2', 'dmUcidAdmin2']
        ];
        //issuance date::first-confirmed::second-confirmed::selected::rejected::issuanceId
        let stateSheetData = [
            ['issuance date', 'first-confirmed', 'second-confirmed', 'selected', 'rejected', 'issuanceId'],
            [new Date('3/29/2019'), '', '', 'standupPerson1, standupPerson2', '', '2']
        ];

        //slackName::email::lastConfirmedDate::numberOfStandupsRun::forceSelect::forceOmit::dmUcid
        let standupperSheetData = [
            ['slackName', 'email', 'lastConfirmedDate', 'numStandupsRun', 'forceSelect', 'forceOmit', 'dmUcid'],
            ['standupPerson1', 'standupper1@email.com', '9/10/2018', '1', '', '', 'dmUcid1'],
            ['standupPerson2', 'standupper2@email.com', '12/10/2018', '2', '', '', 'dmUcid2']
        ];

        stateGSheet = new TestUtil.FakeGSheet(stateSheetData);
        adminGSheet = new TestUtil.FakeGSheet(adminSheetData);
        standupperGSheet = new TestUtil.FakeGSheet(standupperSheetData);

        setup
            .addScriptProperty("STATE_SHEET_NAME", "stateSheet")
            .addScriptProperty("ADMIN_SHEET_NAME", "adminSheet")
            .addScriptProperty("STANDUPPER_SHEET_NAME", "standupperSheet")
            .addScriptProperty("SLACK_CALLBACK_TOKEN", "callbackToken")
            .addScriptProperty("SLACK_URL_OPEN_IM", "openImUrl")
            .addScriptProperty("SLACK_URL_USER_INFO_BY_EMAIL", "userInfoByEmailUrl")
            .addScriptProperty("SLACK_URL_POST_MESSAGE", "postMessageUrl")
            .configureGSheets(stateGSheet, adminGSheet, standupperGSheet)
            .build();
    });


    describe('responding to a selection prompt', () => {
        beforeEach(() => {

            //TODO this is jank, fix this
            //Need to stub three calls - two admin messages and one message to the requester
            UrlFetchApp.fetch.and.returnValues(
                {getContentText: () => { return '{}'; }},
                {getContentText: () => { return '{}'; }},
                {getContentText: () => { return '{}'; }}
            )
        });

        it('records a confirmation interaction', () => {
            const helpRequest = JSON.parse(fs.readFileSync('spec/app/integration/interactiveButtonApp/confirmationRequest.json', 'utf8'));
            const response = HandleRequest(helpRequest);

            var expectResponseText = 'You have wisely accepted Standup bot\'s offer. You will help run standup the week of 3/29/2019. Glory to Standup bot!';

            expect(JSON.parse(response.payload).text).toEqual(expectResponseText);
        });
    });
});