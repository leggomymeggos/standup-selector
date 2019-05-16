doPost = require('../../app/Router');

describe('Router', () => {
    let goodToken = 'GOOD-TOKEN';

    let slashCommandAppSpy, fakeAppProperties, fakeInitializer;

    beforeEach(() => {

        fakeAppProperties = jasmine.createSpyObj('appProperties',
            ['getProperty'],
        );

        fakeAppProperties.getProperty.and.returnValue(
            goodToken
        );


        PropertiesService = jasmine.createSpyObj('PropertiesService',
            ['getScriptProperties'],
        );

        PropertiesService.getScriptProperties.and.returnValue(
            fakeAppProperties
        );

        respondToInteraction = jasmine.createSpy('respondToInteraction');
        slashCommandAppSpy = jasmine.createSpyObj('slashCommandApp2',
            ['serviceAdminRequest'],
        );


        fakeInitializer = new FakeInitializer();
        fakeInitializer.newSlashCommandApp.and.returnValue(slashCommandAppSpy);
        fakeInitializer.newInteractiveButtonApp.and.returnValue({respondToInteraction});

        Initializer = function () {
            return fakeInitializer;
        };
    });

    function FakeInitializer() {
        this.newSlashCommandApp = jasmine.createSpy("newSlashCommandApp");
        this.newInteractiveButtonApp = jasmine.createSpy("newInteractiveButtonApp");
    }

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
                    .toHaveBeenCalledWith(JSON.stringify({
                        'error': true,
                        'cause': 'Invalid callback token'
                    }));
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
                const responseObject = {'text': 'responseMessage'};
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