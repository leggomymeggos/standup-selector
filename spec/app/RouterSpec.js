doPost = require('../../app/Router');

describe('Router', () => {
    beforeEach(() => {
        appProperties = jasmine.createSpyObj('appProperties',
            ['getValue'],
        );

        appProperties.getValue.and.returnValue(
            'GOOD-TOKEN'
        );

        respondToInteraction = jasmine.createSpy('respondToInteraction');
        serviceAdminRequest = jasmine.createSpy('serviceAdminRequest');
    });

    describe('doPost', () => {
        let request, expectedOutput, goodPayload;

        beforeEach(() => {
            goodPayload = {token: 'GOOD-TOKEN'};

            request = {parameter: {payload: JSON.stringify(goodPayload)}};


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
            it('calls respondToInteraction when token is valid and responds with result', () => {
                const responseMessage = 'responseMessage';
                respondToInteraction.and.returnValue(
                    responseMessage
                );

                const response = doPost(request);

                expect(ContentService.createTextOutput)
                    .toHaveBeenCalledWith(JSON.stringify({'text': responseMessage}));
                expect(expectedOutput.setMimeType).toHaveBeenCalledWith(
                    'expectedContentType'
                );
                expect(respondToInteraction).toHaveBeenCalledWith(goodPayload);
                expect(response).toEqual(expectedOutput);
            });
        });

        xdescribe('when slash command payload', () => {
            it('calls serviceAdminRequest when token is valid and responds with result', () => {
                const responseMessage = 'responseMessage';
                serviceAdminRequest.and.returnValue(
                    responseMessage
                );

                const response = doPost(request);

                expect(ContentService.createTextOutput)
                    .toHaveBeenCalledWith(JSON.stringify({'text': responseMessage}));
                expect(expectedOutput.setMimeType).toHaveBeenCalledWith(
                    'expectedContentType'
                );
                expect(serviceAdminRequest).toHaveBeenCalledWith(goodPayload);
                expect(response).toEqual(expectedOutput);
            });
        });

        it('returns an error payload when token is bad', () => {
            request.parameter.payload = JSON.stringify(
                {
                    token: 'BAD-TOKEN'
                }
            );

            const response = doPost(request);

            expect(ContentService.createTextOutput)
                .toHaveBeenCalledWith(JSON.stringify({'error': true}));
            expect(expectedOutput.setMimeType).toHaveBeenCalledWith(
                'expectedContentType'
            );
            expect(response).toEqual(expectedOutput);
        });
    });
});

function TestResponse() {
    this.setMimeType = jasmine.createSpy('setMimeType');
}