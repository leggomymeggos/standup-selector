AttachmentBuilder = require('../../app/AttachmentBuilder');

describe('AttachmentBuilder', () => {
    let subject;
    let stateServiceSpy;

    beforeEach(() => {
        stateServiceSpy = jasmine.createSpyObj('stateService',
            ['getCurrentIssuanceId']
        );

        subject = new AttachmentBuilder(stateServiceSpy)
    });

    describe('buildSelectionPrompt', () => {
        it('provides the correct static fields', () => {
            const result = subject.buildSelectionPrompt('name');

            expect(result.length).toEqual(1);
            expect(result[0]).toEqual(jasmine.objectContaining({
                'fallback': 'Interactive messages not supported via this client',
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
            }));

        });

        it('builds the correct callbackId and text message', () => {
            stateServiceSpy.getCurrentIssuanceId.and.returnValue(100);

            const result = subject.buildSelectionPrompt('name');

            expect(result.length).toEqual(1);
            expect(result[0]).toEqual(jasmine.objectContaining({
                'text': 'Glorious standup bot, bot of bots, selector of standuppers, has generously chosen YOU, name, to run standup for the upcoming week.',
                'callback_id': 'name_100'
            }));
        });

    });

});

