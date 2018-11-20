function AttachmentBuilder(stateService) {
    this.stateService = stateService;
    this.buildSelectionPrompt = function (slackName) {
        return [
            {
                'text': 'Glorious standup bot, bot of bots, selector of standuppers, has generously chosen YOU, ' + slackName + ', to run standup for the upcoming week.',
                'fallback': 'Interactive messages not supported via this client',
                'callback_id': slackName + '_' + this.stateService.getCurrentIssuanceId(),
                'color': '#3AA3E3',
                'attachment_type': 'default',
                'actions': [
                    {
                        'name': 'confirmation_option',
                        'text': 'I accept the bot\'s glorious offer',
                        'type': 'button',
                        'value': 'yes',
                        'confirm': {
                            'title': 'Are you sure you want to confirm?',
                            'text': 'You will need to reach out to an admin to change this (currently)',
                            'ok_text': 'Yes',
                            'dismiss_text': 'No'
                        }
                    },
                    {
                        'name': 'confirmation_option',
                        'text': 'I defiantly refuse the bot',
                        'style': 'danger',
                        'type': 'button',
                        'value': 'no',
                        'confirm': {
                            'title': 'Are you sure you wish to defy Standup Bot?',
                            'text': 'Standup bot may forgive, but it will never forget',
                            'ok_text': 'Yes',
                            'dismiss_text': 'No'
                        }
                    }
                ]
            }
        ]
    };

    this.buildHelpCommmands = function () {
        return [
            {
                "title": "help",
                "text": "/seabotgo help"
            },
            {
                "title": "forceReject",
                "text": "/seabotgo forceReject [standupperName1, standupperName2, ...]"
            }
        ];
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AttachmentBuilder;
}