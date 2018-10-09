SlackClient = require('../../app/SlackClient');
mergeObjs = require('../../app/Utilities').mergeObjs;

describe('SlackClient', () => {
    let subject;
    let gPropertiesSpy, attachmentBuilderSpy;

    beforeEach(() => {
        UrlFetchApp = jasmine.createSpyObj('urlFetchApp',
            ['fetch']
        );

        attachmentBuilderSpy = jasmine.createSpyObj('attachmentBuilder',
            ['buildSelectionPrompt']
        );

        gPropertiesSpy = jasmine.createSpyObj('appProperties',
            ['getProperty']
        );
        gPropertiesSpy.getProperty.and.returnValue('TOKEN');

        subject = new SlackClient(gPropertiesSpy, attachmentBuilderSpy);
    });

    describe('openIm', () => {
        it('uses the UrlFetchApp to send a correct openIm request', () => {
            UrlFetchApp.fetch.and.returnValue({
                getContentText: () => {
                    return JSON.stringify({ok: true})
                }
            });

            const response = subject.openIm('uuid');

            const expectedPayload = JSON.stringify({
                'user': 'uuid'
            });
            const expectedOpts = {
                'method': 'post',
                'contentType': 'application/json',
                'headers': {
                    'Authorization': 'Bearer TOKEN'
                },
                'payload': expectedPayload
            };

            expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
                'https://slack.com/api/im.open',
                expectedOpts
            );
            expect(response).toEqual({ok: true});
        });
    });

    describe('getUserInfo', () => {
        it('uses the UrlFetchApp to correctly retrieve userInfo', () => {
            UrlFetchApp.fetch.and.returnValue({
                getContentText: () => {
                    return JSON.stringify({ok: true})
                }
            });

            const response = subject.getUserInfo('email@email.com');

            const expectedPayload = {
                'email': 'email@email.com',
                'token': 'TOKEN'
            };
            const expectedOpts = {
                'method': 'post',
                'contentType': 'application/x-www-form-urlencoded',
                'payload': expectedPayload
            };

            expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
                'https://slack.com/api/users.lookupByEmail',
                expectedOpts
            );
            expect(response).toEqual({ok: true});
        });
    });

    describe('writing messages to channel', () => {
        it('writeToChannel uses UrlFetchApp to send correct message', () => {
            UrlFetchApp.fetch.and.returnValue({
                getContentText: () => {
                    return JSON.stringify({ok: true})
                }
            });

            const response = subject.writeToChannel('msg', 'cuid');

            const expectedPayload = {
                'text': 'msg',
                'channel': 'cuid'
            };
            const expectedOpts = {
                'method': 'post',
                'contentType': 'application/json',
                'headers': {
                    'Authorization': 'Bearer TOKEN'
                },
                'payload': JSON.stringify(expectedPayload)
            };

            expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
                'https://slack.com/api/chat.postMessage',
                expectedOpts
            );

            expect(response).toEqual({ok: true});
        });

        it('writeToChannelWithSelectionAttachment uses urlFetchApp to send correct message', () => {
            UrlFetchApp.fetch.and.returnValue({
                getContentText: () => {
                    return JSON.stringify({ok: true})
                }
            });
            var expectedAttachment = [{'text': 'You have been chosen...'}];
            attachmentBuilderSpy.buildSelectionPrompt.and.returnValue(expectedAttachment);

            const response = subject.writeToChannelWithSelectionAttachment('msg', 'cuid', 'name');

            const expectedPayload = {
                'text': 'msg',
                'channel': 'cuid',
                'attachments': expectedAttachment
            };
            const expectedOpts = {
                'method': 'post',
                'contentType': 'application/json',
                'headers': {
                    'Authorization': 'Bearer TOKEN'
                },
                'payload': JSON.stringify(expectedPayload)
            };

            expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
                'https://slack.com/api/chat.postMessage',
                expectedOpts
            );

            expect(response).toEqual({ok: true});
        });
    });

});