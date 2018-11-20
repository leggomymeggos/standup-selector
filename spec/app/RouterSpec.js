doPost = require('../../app/Router');

describe('Router', () => {
    let goodToken = 'GOOD-TOKEN';

    let slashCommandAppSpy;

    beforeEach(() => {
        appProperties = jasmine.createSpyObj('appProperties',
            ['getProperty'],
        );

        appProperties.getProperty.and.returnValue(
            goodToken
        );

        respondToInteraction = jasmine.createSpy('respondToInteraction');
        slashCommandAppSpy = jasmine.createSpyObj('slashCommandApp',
            ['serviceAdminRequest'],
        );

        slashCommandApp = slashCommandAppSpy;
    });

    describe('doPost', () => {
        let inboundRequest, expectedOutput, goodPayload;

        beforeEach(() => {
            inboundRequest = {parameter: {}};

            ContentService = jasmine.createSpyObj('contentService',
                ['createTextOutput'],
            );

            ContentService.MimeType = {JSON: 'expectedContentType'};

            expectedOutput = jasmine.createSpyObj('textOutput',
                ['setMimeType'],
            );

            ContentService.createTextOutput.and.returnValue(
                expectedOutput
            );
        });

        describe('when interactive button payload', () => {
            beforeEach(() => {
                goodPayload = {token: goodToken, type: 'interactive_message'};

                inboundRequest.parameter = {payload: JSON.stringify(goodPayload)};
            });

            it('calls respondToInteraction when token is valid and responds with result', () => {
                const responseMessage = 'responseMessage';
                respondToInteraction.and.returnValue(
                    responseMessage
                );

                const response = doPost(inboundRequest);

                expect(ContentService.createTextOutput)
                    .toHaveBeenCalledWith(JSON.stringify({'text': responseMessage}));
                expect(expectedOutput.setMimeType).toHaveBeenCalledWith(
                    'expectedContentType'
                );
                expect(respondToInteraction).toHaveBeenCalledWith(goodPayload);
                expect(response).toEqual(expectedOutput);
            });

            it('returns an error payload when token is bad', () => {
                inboundRequest.parameter.payload = JSON.stringify(
                    {
                        token: 'BAD-TOKEN'
                    }
                );

                const response = doPost(inboundRequest);

                expect(ContentService.createTextOutput)
                    .toHaveBeenCalledWith(JSON.stringify({'error': true}));
                expect(expectedOutput.setMimeType).toHaveBeenCalledWith(
                    'expectedContentType'
                );
                expect(response).toEqual(expectedOutput);
            });
        });

        describe('when slash command payload', () => {
            beforeEach(() => {
                inboundRequest.parameter = {
                    token: goodToken,
                    command: 'command',
                    text: 'text following slash command'
                }
            });

            it('calls serviceAdminRequest when token is valid and responds with result', () => {
                const responseObject = {'text':'responseMessage'};
                slashCommandAppSpy.serviceAdminRequest.and.returnValue(
                    responseObject
                );

                const response = doPost(inboundRequest);

                expect(ContentService.createTextOutput)
                    .toHaveBeenCalledWith(JSON.stringify(responseObject));
                expect(expectedOutput.setMimeType).toHaveBeenCalledWith(
                    'expectedContentType'
                );
                expect(slashCommandAppSpy.serviceAdminRequest).toHaveBeenCalledWith(inboundRequest.parameter);
                expect(response).toEqual(expectedOutput);
            });

            it('returns an error payload when token is bad', () => {
                inboundRequest.parameter.token = 'BAD-TOKEN';

                const response = doPost(inboundRequest);

                expect(ContentService.createTextOutput)
                    .toHaveBeenCalledWith(JSON.stringify({'error': true}));
                expect(expectedOutput.setMimeType).toHaveBeenCalledWith(
                    'expectedContentType'
                );
                expect(response).toEqual(expectedOutput);
            });
        });
    });
});


function TestResponse() {
    this.setMimeType = jasmine.createSpy('setMimeType');
}