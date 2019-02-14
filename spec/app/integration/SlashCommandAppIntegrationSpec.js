HandleRequest = require('../../../app/Router');
TestUtil = require('./TestEnvironmentUtil');

describe('SlashCommandApp Integration Test', () => {
    let stateGSheet, adminGSheet, standupperGSheet;

    let slashCommandCallback;
    beforeEach(() => {
        slashCommandCallback =
            {
                "parameter": {
                    "channel_name": "channel_name",
                    "user_id": "adminId1",
                    "user_name": "adminPerson1",
                    "trigger_id": "trigger_id",
                    "team_domain": "team_domain",
                    "team_id": "team_id",
                    "text": "help",
                    "channel_id": "channel_id",
                    "command": "/seabotgo",
                    "token": "token",
                    "response_url": "response_url"
                },
                "contextPath": "",
                "contentLength": 352,
                "queryString": "",
                "parameters": {
                    "channel_name": [
                        "directmessage"
                    ],
                    "user_id": [
                        "user_id"
                    ],
                    "user_name": [
                        "rneumann"
                    ],
                    "trigger_id": [
                        "450367592948.2156835366.2ad03aea34a9e58b130eab3a8d547e40"
                    ],
                    "team_domain": [
                        "pivotal"
                    ],
                    "team_id": [
                        "team_id"
                    ],
                    "text": [
                        "textFollowingSlashCommand"
                    ],
                    "channel_id": [
                        "channel_id"
                    ],
                    "command": [
                        "/seabotgo"
                    ],
                    "token": [
                        "TvXmtEXkQ7xUKF6C45tDYXc3"
                    ],
                    "response_url": [
                        "http://www.response_url.com"
                    ]
                },
                "postData": {
                    "type": "application/x-www-form-urlencoded",
                    "length": 352,
                    "contents": "contents",
                    "name": "postData"
                }
            };


        let setup = new TestUtil.TestEnvBuilder();

        //email::slackName
        let adminSheetData = [
            ['email', 'slackName'],
            ['admin1@admin.com', 'adminPerson1'],
            ['admin2@admin.com', 'adminPerson2']
        ];
        //issuance date::first-confirmed::second-confirmed::selected::rejected
        let stateSheetData = [
            ['issuance date', 'first-confirmed', 'second-confirmed', 'selected', 'rejected'],
            ['9/10/2018', 'standupPerson4', 'standupPerson1', 'standupPerson4, standupPerson1, standupPerson2', 'standupPerson2'],
            ['12/10/2018', 'standupPerson4', 'standupPerson1', 'standupPerson4, standupPerson1, standupPerson2', 'standupPerson2'],
            ['10/29/2018', 'standupPerson4', 'standupPerson2', 'standupPerson4, standupPerson1, standupPerson2', 'standupPerson1']
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
            const response = HandleRequest(slashCommandCallback);
            expect(response.payload).toEqual('{"attachments":[{"title":"help","text":"/seabotgo help"},{"title":"forceReject","text":"/seabotgo forceReject [standupperName1, standupperName2, ...]"}],"text":"Available actions: "}');
        });
    });


});
